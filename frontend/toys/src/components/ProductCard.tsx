import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { Product } from '../lib/supabase'
import { useCart } from '../context/CartContext'

type Props = {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [addedToCart, setAddedToCart] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url || '',
      stock: product.stock,
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
    >

      {/* Image */}
      <img
        src={product.image_url || 'https://via.placeholder.com/300'}
        alt={product.name}
        className="w-full h-40 object-cover"
      />

      {/* Info */}
      <div className="p-3">
        <h2 className="text-sm font-medium">{product.name}</h2>
        <p className="text-gray-600 text-sm mt-1">
          {product.currency} {product.price}
        </p>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className={`mt-2 w-full py-1 rounded text-sm font-semibold transition ${
            addedToCart
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-black text-white hover:bg-gray-900'
          }`}
        >
          {addedToCart ? '✓ Added' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}