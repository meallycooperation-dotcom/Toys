import { useEffect, useState } from "react"
import { ChevronLeft, ShoppingBag } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useProfile } from "../hooks/useProfile"
import { supabase, type Order, type OrderItem, type ProductImage } from "../lib/supabase"

type OrderSummaryItem = OrderItem & {
  name: string | null
  image_url: string | null
}

type OrderSummary = Order & {
  items: OrderSummaryItem[]
}

export default function Orders() {
  const navigate = useNavigate()
  const { profile, loading: profileLoading } = useProfile()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        setError(null)

        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const userEmail = userData.user?.email || profile?.email
        if (!userEmail) {
          setOrders([])
          return
        }

        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("email", userEmail)
          .order("created_at", { ascending: false })

        if (ordersError) throw ordersError

        const orderList = (ordersData || []) as Order[]
        if (orderList.length === 0) {
          setOrders([])
          return
        }

        const orderIds = orderList.map((order) => order.id)

        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .in("order_id", orderIds)

        if (itemsError) throw itemsError

        const itemList = (itemsData || []) as OrderItem[]
        const productIds = Array.from(
          new Set(itemList.map((item) => item.product_id).filter((id): id is string => Boolean(id)))
        )

        const [{ data: productsData, error: productsError }, { data: imagesData, error: imagesError }] =
          await Promise.all([
            supabase.from("products").select("id, name").in("id", productIds),
            supabase
              .from("product_images")
              .select("*")
              .in("product_id", productIds)
              .order("position", { ascending: true }),
          ])

        if (productsError) throw productsError
        if (imagesError) throw imagesError

        const productLookup = new Map<string, { id: string; name: string }>(
          (productsData || []).map((product) => [product.id, product])
        )

        const imageLookup = new Map<string, string>()
        ;((imagesData || []) as ProductImage[]).forEach((image) => {
          if (image.product_id && image.image_url && !imageLookup.has(image.product_id)) {
            imageLookup.set(image.product_id, image.image_url)
          }
        })

        const grouped = orderList.map((order) => ({
          ...order,
          items: itemList
            .filter((item) => item.order_id === order.id)
            .map((item) => ({
              ...item,
              name: item.product_id ? productLookup.get(item.product_id)?.name || null : null,
              image_url: item.product_id ? imageLookup.get(item.product_id) || null : null,
            })),
        }))

        setOrders(grouped)
      } catch (err) {
        const error = err as Error
        console.error("Error fetching orders:", err)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (!profileLoading) {
      fetchOrders()
    }
  }, [profile?.email, profileLoading])

  if (loading || profileLoading) {
    return (
      <div className="page-frame flex items-center justify-center px-4">
        <div className="lux-card-elevated w-full max-w-sm px-8 py-10 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[rgba(212,175,55,0.35)] border-t-[#be123c]" />
          <p className="lux-subtitle mt-4">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-frame flex items-center justify-center px-4">
        <div className="lux-card-elevated w-full max-w-sm px-8 py-10 text-center">
          <p className="text-red-600 mb-4">Error loading orders: {error}</p>
          <button onClick={() => window.location.reload()} className="lux-primary rounded-full px-4 py-2">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-frame px-4 py-4">
      <div className="lux-header sticky top-0 z-20 rounded-2xl px-4 py-3">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-[color:var(--text-primary)] transition hover:text-[#d4af37]"
        >
          <ChevronLeft size={20} />
          <span className="font-semibold">Back to Profile</span>
        </button>
      </div>

      <div className="mx-auto mt-6 max-w-5xl space-y-6">
        <div className="lux-card-elevated p-6 sm:p-8">
          <p className="lux-chip lux-chip-accent w-fit">Orders</p>
          <h1 className="lux-title mt-3 text-3xl sm:text-4xl">Your order history</h1>
          <p className="lux-subtitle mt-2">Track purchases, delivery status, and what&apos;s inside each order.</p>
        </div>

        {orders.length === 0 ? (
          <div className="lux-card-elevated p-10 text-center">
            <ShoppingBag size={48} className="mx-auto mb-4 text-[color:var(--text-muted)]" />
            <h2 className="text-xl font-semibold">No orders yet</h2>
            <p className="lux-subtitle mt-2">Once you place an order, it will appear here.</p>
            <button onClick={() => navigate("/")} className="lux-primary mt-6 rounded-full px-6 py-3">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="lux-card-elevated p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[color:var(--text-primary)]">Order #{order.id.slice(0, 8)}</p>
                      <span className="lux-badge lux-badge-gold">{order.status || "pending"}</span>
                    </div>
                    <p className="lux-subtitle mt-2 text-sm">
                      {new Date(order.created_at).toLocaleString()} • {order.location || "No location"}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-[color:var(--text-muted)]">Total</p>
                    <p className="text-xl font-bold">
                      {order.currency || "KES"} {order.total_amount}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-3"
                    >
                      <div className="h-14 w-14 overflow-hidden rounded-xl bg-[rgba(255,255,255,0.06)]">
                        <img
                          src={item.image_url || "https://via.placeholder.com/120"}
                          alt={item.name || "Order item"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{item.name || "Product"}</p>
                            <p className="text-sm text-[color:var(--text-muted)]">Qty {item.quantity}</p>
                          </div>
                          <p className="shrink-0 text-sm font-semibold">
                            KES {item.price_at_purchase * item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {order.items.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-dashed border-[rgba(255,255,255,0.12)] p-4 text-sm text-[color:var(--text-muted)]">
                    No items were found for this order.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
