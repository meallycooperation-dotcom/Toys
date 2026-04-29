import { Star } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import type { Product } from "../lib/supabase"

type Props = {
  product: Product
  queryString?: string
}

export default function ProductCard({ product, queryString = "" }: Props) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [addedToCart, setAddedToCart] = useState(false)
  const hasRatings = (product.rating_count || 0) > 0
  const roundedRating = Math.round((product.average_rating || 0) * 10) / 10
  const filledStars = Math.round(product.average_rating || 0)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url || "",
      stock: product.stock,
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div
      onClick={() => navigate(`/product/${product.id}${queryString}`)}
      className="lux-card group overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-[rgba(212,175,55,0.3)]"
    >
      <div className="relative">
        <img
          src={product.image_url || "https://via.placeholder.com/300"}
          alt={product.name}
          className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080407] via-transparent to-transparent opacity-70" />
        <div className="absolute left-3 top-3">
          {hasRatings ? (
            <span className="lux-badge lux-badge-gold">
              {roundedRating.toFixed(1)} / 5
            </span>
          ) : (
            <span className="lux-badge lux-badge-red">New</span>
          )}
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-sm font-semibold text-[color:var(--text-primary)]">{product.name}</h2>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
          {product.currency} {product.price}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => (
              <Star
                key={value}
                size={14}
                className={value <= filledStars ? "text-[#d4af37]" : "text-[color:var(--text-muted)]"}
                fill={value <= filledStars ? "currentColor" : "none"}
              />
            ))}
          </div>
          <span className="text-xs text-[color:var(--text-muted)]">
            {hasRatings ? `${roundedRating.toFixed(1)} (${product.rating_count})` : "No ratings yet"}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className={`mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            addedToCart ? "bg-green-600 text-white" : "lux-primary"
          }`}
        >
          {addedToCart ? "Added" : "Add to Cart"}
        </button>
      </div>
    </div>
  )
}
