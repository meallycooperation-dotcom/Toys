import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useProfile } from "../hooks/useProfile"
import { supabase } from "../lib/supabase"

type DeliveryLocation = {
  id: number
  name: string
  value: string
  region: string
  price: number
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items } = useCart()
  const { profile, loading: profileLoading } = useProfile()
  const [locations, setLocations] = useState<DeliveryLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // 📍 fetch delivery locations
  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from("delivery_locations")
        .select("*")
        .order("price", { ascending: true })

      if (!error && data) {
        setLocations(data)
        setSelectedLocation(data[0]?.value || "")
      }
    }

    fetchLocations()
  }, [])

  // 💰 calculate items total
  const itemsTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  // 🚚 get selected delivery fee
  const deliveryFee =
    locations.find((l) => l.value === selectedLocation)?.price || 0

  // 🧮 final total
  const total = itemsTotal + deliveryFee

  const handleCheckout = async () => {
    if (!profile?.email) {
      alert("Please log in before checking out.")
      navigate('/login')
      return
    }

    setLoading(true)

    try {
      const payload = {
        items: items.map((item) => ({
          id: item.product_id,
          qty: item.quantity,
        })),
        email: profile.email,
        location: selectedLocation,
      }

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const text = await response.text()
      let data: any = null

      if (text) {
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          console.error('Failed to parse JSON response from /api/create-payment:', text)
          throw new Error('Unexpected response from payment service')
        }
      }

      if (!response.ok) {
        throw new Error(data?.error || `Payment init failed (${response.status})`)
      }

      if (!data?.authorization_url) {
        throw new Error('Missing payment redirect URL')
      }

      window.location.href = data.authorization_url
    } catch (err) {
      console.error(err)
      alert((err as Error).message || 'Payment initialization failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">

      {/* 🛍️ ITEMS */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Your Items</h1>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex justify-between border-b pb-2"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity}
                </p>
              </div>

              <p className="font-medium">
                KES {item.price * item.quantity}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4 font-semibold">
          <p>Items Total</p>
          <p>KES {itemsTotal}</p>
        </div>
      </div>

      {/* 📍 DELIVERY LOCATION */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-3">
          Delivery Location
        </h2>

        <select
          className="w-full border p-2 rounded"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.value}>
              {loc.name} ({loc.region}) - KES {loc.price}
            </option>
          ))}
        </select>
      </div>

      {/* 💰 SUMMARY */}
      <div className="bg-white p-4 rounded-xl shadow-sm space-y-2">

        <div className="flex justify-between">
          <p>Items</p>
          <p>KES {itemsTotal}</p>
        </div>

        <div className="flex justify-between">
          <p>Delivery Fee</p>
          <p>KES {deliveryFee}</p>
        </div>

        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <p>Total</p>
          <p>KES {total}</p>
        </div>

      </div>

      {/* 🚀 CHECKOUT BUTTON */}
      <button
        onClick={handleCheckout}
        disabled={loading || profileLoading || items.length === 0 || !selectedLocation || !profile?.email}
        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {profileLoading
          ? 'Loading...'
          : !profile?.email
          ? 'Login to checkout'
          : items.length === 0
          ? 'Cart is empty'
          : loading
          ? 'Processing...'
          : 'Checkout'}
      </button>

    </div>
  )
}