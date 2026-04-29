import { ChevronLeft, ShoppingCart, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Seo from "../components/Seo"
import { useCart } from "../context/CartContext"

export default function Cart() {
  const navigate = useNavigate()
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart()

  return (
    <div className="page-frame px-4 py-4">
      <Seo
        title="Shopping Cart"
        description="Review the adult toys and intimate wellness products in your cart before checkout."
        path="/cart"
        noIndex
      />
      <div className="lux-header sticky top-0 z-20 rounded-2xl px-4 py-3">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[color:var(--text-primary)] transition hover:text-[#d4af37]"
        >
          <ChevronLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
      </div>

      <div className="mx-auto mt-6 max-w-4xl space-y-6">
        <div className="lux-card-elevated p-6">
          <div className="flex items-center gap-3">
            <span className="lux-badge lux-badge-red">Cart</span>
            <h1 className="lux-title text-3xl sm:text-4xl">Shopping Cart</h1>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="lux-card-elevated p-10 text-center">
            <ShoppingCart size={48} className="mx-auto mb-4 text-[color:var(--text-muted)]" />
            <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">Your cart is empty</h2>
            <p className="lux-subtitle mt-2">Add some products to get started.</p>
            <button onClick={() => navigate("/")} className="lux-primary mt-6 rounded-full px-6 py-3">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="lux-card-elevated overflow-hidden">
              <div className="divide-y divide-[rgba(255,255,255,0.08)]">
                {items.map((item) => (
                  <div key={item.product_id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-4">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover ring-1 ring-[rgba(255,255,255,0.08)]"
                      />
                      <div>
                        <h3 className="font-semibold text-[color:var(--text-primary)]">{item.name}</h3>
                        <p className="text-sm text-[color:var(--text-muted)]">Ksh. {item.price}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center overflow-hidden rounded-full border border-[rgba(255,255,255,0.12)]">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="px-3 py-2 transition hover:bg-[rgba(255,255,255,0.08)]"
                        >
                          -
                        </button>
                        <span className="border-x border-[rgba(255,255,255,0.12)] px-4 py-2 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="px-3 py-2 transition hover:bg-[rgba(255,255,255,0.08)]"
                        >
                          +
                        </button>
                      </div>

                      <p className="min-w-24 text-right font-semibold text-[color:var(--text-primary)]">
                        Ksh. {(item.price * item.quantity).toFixed(2)}
                      </p>

                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="rounded-full p-2 text-red-400 transition hover:bg-[rgba(255,255,255,0.08)] hover:text-red-300"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lux-card-elevated space-y-4 p-6">
              <div className="flex justify-between text-[color:var(--text-muted)]">
                <span>Subtotal</span>
                <span>Ksh. {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[color:var(--text-muted)]">
                <span>Shipping</span>
                <span>Ksh. 0.00</span>
              </div>
              <div className="flex justify-between border-t border-[rgba(255,255,255,0.08)] pt-4 text-lg font-bold">
                <span>Total</span>
                <span>Ksh. {totalPrice.toFixed(2)}</span>
              </div>
              <button onClick={() => navigate("/checkout")} className="lux-primary w-full rounded-xl py-3">
                Checkout
              </button>
              <button
                onClick={() => navigate("/")}
                className="lux-secondary w-full rounded-xl py-3"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
