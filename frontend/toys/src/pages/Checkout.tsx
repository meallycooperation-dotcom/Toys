import { useEffect, useState } from "react"
import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Seo from "../components/Seo"
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

  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = locations.find((l) => l.value === selectedLocation)?.price || 0
  const total = itemsTotal + deliveryFee

  const handleCheckout = async () => {
    if (!profile?.email) {
      alert("Please log in before checking out.")
      navigate("/login")
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

      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const text = await response.text()
      let data: any = null

      if (text) {
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          console.error("Failed to parse JSON response from /api/create-payment:", text)
          throw new Error("Unexpected response from payment service")
        }
      }

      if (!response.ok) {
        throw new Error(data?.error || `Payment init failed (${response.status})`)
      }

      if (!data?.authorization_url) {
        throw new Error("Missing payment redirect URL")
      }

      window.location.href = data.authorization_url
    } catch (err) {
      console.error(err)
      alert((err as Error).message || "Payment initialization failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-frame px-4 py-6">
      <Seo
        title="Checkout"
        description="Complete your adult toys order with secure checkout and discreet delivery options."
        path="/checkout"
        noIndex
      />
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="lux-secondary rounded-full px-4 py-2"
          >
            <ChevronLeft size={18} />
            Back
          </button>
        </div>

        <div className="lux-card-elevated p-6">
          <p className="lux-chip lux-chip-accent w-fit">Checkout</p>
          <h1 className="lux-title mt-3 text-3xl sm:text-4xl">Complete your order</h1>
          <p className="lux-subtitle mt-2">Choose a delivery zone and move into payment.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-6">
            <div className="lux-card-elevated p-6">
              <h2 className="text-lg font-semibold">Your Items</h2>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-[color:var(--text-muted)]">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">KES {item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-[rgba(255,255,255,0.08)] pt-4 font-semibold">
                <p>Items Total</p>
                <p>KES {itemsTotal}</p>
              </div>
            </div>

            <div className="lux-card-elevated p-6">
              <h2 className="text-lg font-semibold">Delivery Location</h2>
              <select
                className="lux-select mt-4 min-h-14 px-4 py-3 pr-10 text-sm sm:text-base leading-snug"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.value} className="whitespace-normal">
                    {loc.name} ({loc.region}) - KES {loc.price}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lux-card-elevated space-y-4 p-6 h-fit">
            <div className="flex justify-between">
              <p className="lux-subtitle">Items</p>
              <p>KES {itemsTotal}</p>
            </div>
            <div className="flex justify-between">
              <p className="lux-subtitle">Delivery Fee</p>
              <p>KES {deliveryFee}</p>
            </div>
            <div className="flex justify-between border-t border-[rgba(255,255,255,0.08)] pt-4 text-lg font-bold">
              <p>Total</p>
              <p>KES {total}</p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading || profileLoading || items.length === 0 || !selectedLocation || !profile?.email}
              className="lux-primary w-full rounded-xl py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {profileLoading
                ? "Loading..."
                : !profile?.email
                  ? "Login to checkout"
                  : items.length === 0
                    ? "Cart is empty"
                    : loading
                      ? "Processing..."
                      : "Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
