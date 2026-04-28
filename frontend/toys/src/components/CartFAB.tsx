import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartFAB() {
  const navigate = useNavigate()
  const location = useLocation()
  const { totalItems } = useCart()

  // Don't show FAB on cart page
  if (location.pathname === '/cart') {
    return null
  }

  return (
    <button
      onClick={() => navigate('/cart')}
      className="fixed top-1/3 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-900 transition z-40 relative -translate-y-1/2"
      aria-label="View cart"
    >
      <ShoppingCart size={24} />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  )
}
