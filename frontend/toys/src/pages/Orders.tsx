import { useEffect, useState } from "react"
import { ChevronLeft, ShoppingBag, Star } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Seo from "../components/Seo"
import { useProfile } from "../hooks/useProfile"
import {
  supabase,
  type Order,
  type OrderItem,
  type ProductImage,
  type ProductRating,
} from "../lib/supabase"

type OrderSummaryItem = OrderItem & {
  name: string | null
  image_url: string | null
}

type OrderSummary = Order & {
  items: OrderSummaryItem[]
}

type RatingDraft = {
  rating: number
  review: string
}

type OrderFeedback = {
  type: "success" | "error"
  message: string
}

export default function Orders() {
  const navigate = useNavigate()
  const { profile, loading: profileLoading } = useProfile()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [ratingsByOrder, setRatingsByOrder] = useState<Record<string, ProductRating>>({})
  const [draftsByOrder, setDraftsByOrder] = useState<Record<string, RatingDraft>>({})
  const [submittingByOrder, setSubmittingByOrder] = useState<Record<string, boolean>>({})
  const [feedbackByOrder, setFeedbackByOrder] = useState<Record<string, OrderFeedback>>({})
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
          setRatingsByOrder({})
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
          setRatingsByOrder({})
          return
        }

        const orderIds = orderList.map((order) => order.id)

        const [itemsResult, ratingsResult] = await Promise.all([
          supabase.from("order_items").select("*").in("order_id", orderIds),
          supabase.from("product_ratings").select("*").in("order_id", orderIds),
        ])

        const { data: itemsData, error: itemsError } = itemsResult
        const { data: ratingsData, error: ratingsError } = ratingsResult

        if (itemsError) throw itemsError
        if (ratingsError) throw ratingsError

        const itemList = (itemsData || []) as OrderItem[]
        const ratingList = (ratingsData || []) as ProductRating[]
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

        const ratingLookup = new Map<string, ProductRating>()
        ratingList.forEach((rating) => {
          if (rating.order_id) {
            ratingLookup.set(rating.order_id, rating)
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
        setRatingsByOrder(
          grouped.reduce<Record<string, ProductRating>>((acc, order) => {
            const rating = order.id ? ratingLookup.get(order.id) : undefined
            if (rating) {
              acc[order.id] = rating
            }
            return acc
          }, {})
        )
        setDraftsByOrder((prev) => {
          const next = { ...prev }

          grouped.forEach((order) => {
            if (!next[order.id]) {
              next[order.id] = { rating: 5, review: "" }
            }
          })

          return next
        })
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

  const updateDraft = (orderId: string, nextDraft: Partial<RatingDraft>) => {
    setDraftsByOrder((prev) => ({
      ...prev,
      [orderId]: {
        rating: prev[orderId]?.rating || 5,
        review: prev[orderId]?.review || "",
        ...nextDraft,
      },
    }))

    setFeedbackByOrder((prev) => {
      if (!prev[orderId]) return prev
      const next = { ...prev }
      delete next[orderId]
      return next
    })
  }

  const submitRating = async (order: OrderSummary) => {
    const draft = draftsByOrder[order.id] || { rating: 5, review: "" }

    try {
      setSubmittingByOrder((prev) => ({ ...prev, [order.id]: true }))

      if (!profile?.id) {
        navigate("/login")
        return
      }

      const productId = order.items.find((item) => item.product_id)?.product_id
      if (!productId) {
        throw new Error("No product was found for this order.")
      }

      const { data, error: insertError } = await supabase
        .from("product_ratings")
        .insert({
          product_id: productId,
          user_id: profile.id,
          order_id: order.id,
          rating: draft.rating,
          review: draft.review.trim() || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      const { data: ratingsData, error: ratingsError } = await supabase
        .from("product_ratings")
        .select("rating")
        .eq("product_id", productId)

      if (ratingsError) throw ratingsError

      const ratings = ratingsData || []
      const ratingCount = ratings.length
      const averageRating =
        ratingCount === 0
          ? 0
          : ratings.reduce((sum, row) => sum + (row.rating || 0), 0) / ratingCount

      const { error: productUpdateError } = await supabase
        .from("products")
        .update({
          average_rating: Number(averageRating.toFixed(2)),
          rating_count: ratingCount,
        })
        .eq("id", productId)

      if (productUpdateError) throw productUpdateError

      if (data) {
        setRatingsByOrder((prev) => ({
          ...prev,
          [order.id]: data,
        }))
      }

      setFeedbackByOrder((prev) => ({
        ...prev,
        [order.id]: { type: "success", message: "Rating saved." },
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save rating."
      setFeedbackByOrder((prev) => ({
        ...prev,
        [order.id]: { type: "error", message },
      }))
    } finally {
      setSubmittingByOrder((prev) => ({ ...prev, [order.id]: false }))
    }
  }

  const renderStars = (orderId: string, currentRating: number) => {
    return Array.from({ length: 5 }, (_, index) => index + 1).map((value) => (
      <button
        key={value}
        type="button"
        onClick={() => updateDraft(orderId, { rating: value })}
        className="rounded-full p-1 transition hover:scale-110"
        aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
      >
        <Star
          size={20}
          className={value <= currentRating ? "text-[#d4af37]" : "text-[color:var(--text-muted)]"}
          fill={value <= currentRating ? "currentColor" : "none"}
        />
      </button>
    ))
  }

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
      <Seo
        title="Orders"
        description="Review your Toys order history, delivery status, and product ratings."
        path="/orders"
        noIndex
      />
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
            {orders.map((order) => {
              const status = order.status || "pending"
              const isDelivered = status.toLowerCase() === "delivered"
              const existingRating = ratingsByOrder[order.id]
              const draft = draftsByOrder[order.id] || { rating: 5, review: "" }

              return (
                <div key={order.id} className="lux-card-elevated p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[color:var(--text-primary)]">Order #{order.id.slice(0, 8)}</p>
                        <span className="lux-badge lux-badge-gold">{status}</span>
                        {existingRating && <span className="lux-badge lux-badge-gold">Rated</span>}
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

                  <div className="mt-5 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4 sm:p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">Order rating</p>
                        <p className="text-sm text-[color:var(--text-muted)]">
                          {isDelivered ? "You can rate this order now." : "Rating unlocks after delivery."}
                        </p>
                      </div>

                      {existingRating && (
                        <div className="text-sm text-[color:var(--text-muted)]">Rated {existingRating.rating}/5</div>
                      )}
                    </div>

                    {existingRating ? (
                      <div className="mt-4 rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[rgba(212,175,55,0.08)] p-4">
                        <div className="flex items-center gap-1">{renderStars(order.id, existingRating.rating)}</div>
                        {existingRating.review && (
                          <p className="mt-3 text-sm text-[color:var(--text-primary)]/90">
                            {existingRating.review}
                          </p>
                        )}
                      </div>
                    ) : isDelivered ? (
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-1">{renderStars(order.id, draft.rating)}</div>

                        <div>
                          <label htmlFor={`review-${order.id}`} className="mb-2 block text-sm font-medium">
                            Review
                          </label>
                          <textarea
                            id={`review-${order.id}`}
                            value={draft.review}
                            onChange={(event) => updateDraft(order.id, { review: event.target.value })}
                            rows={4}
                            placeholder="Tell us what you thought about the order..."
                            className="lux-input min-h-28 w-full rounded-2xl px-4 py-3"
                          />
                        </div>

                        {feedbackByOrder[order.id] && (
                          <p
                            className={`text-sm ${
                              feedbackByOrder[order.id].type === "error" ? "text-red-500" : "text-green-500"
                            }`}
                          >
                            {feedbackByOrder[order.id].message}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => submitRating(order)}
                          disabled={submittingByOrder[order.id]}
                          className="lux-primary rounded-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {submittingByOrder[order.id] ? "Saving..." : "Submit rating"}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-[rgba(255,255,255,0.12)] p-4 text-sm text-[color:var(--text-muted)]">
                        This order must be marked delivered before a rating can be submitted.
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
