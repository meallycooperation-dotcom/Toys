import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Trash2, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const navigate = useNavigate()
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full bg-white shadow-sm px-4 py-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.product_id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-gray-600 text-sm">Ksh.{item.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-gray-100"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 border-l border-r text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-semibold w-16 text-right">Ksh.{(item.price * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Ksh.{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Ksh.0.00</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Ksh.{totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition"
              >
                Checkout
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
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
