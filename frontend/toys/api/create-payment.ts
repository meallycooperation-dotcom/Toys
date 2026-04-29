/// /api/create-payment.ts
import axios from "axios"
import { supabase } from "../src/lib/supabase"

declare const process: {
  env: {
    PAYSTACK_SECRET?: string
  }
}

type CreatePaymentRequest = {
  items: Array<{ id: string; qty: number }> 
  email: string
  location: string
}

type ProductRow = {
  id: string
  price: number
  name: string
}

type OrderItemPayload = {
  product_id: string
  name: string
  price: number
  qty: number
  total: number
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end()

  const { items, email, location } = req.body as CreatePaymentRequest

  try {
    // 1. VERIFY ITEMS FROM DB (CRITICAL SECURITY STEP)
    const ids = items.map((i) => i.id)

    const { data: products, error } = await supabase
      .from("products")
      .select("id, price, name")
      .in("id", ids)

    if (error) throw error
    if (!products || products.length === 0) {
      throw new Error("No products found")
    }

    let itemsTotal = 0

    const enrichedItems = items.map((item) => {
      const product = products.find((p) => p.id === item.id)
      if (!product) throw new Error(`Product ${item.id} not found`)

      const total = product.price * item.qty
      itemsTotal += total

      return {
        product_id: product.id,
        name: product.name,
        price: product.price,
        qty: item.qty,
        total,
      }
    }) as OrderItemPayload[]

    // 2. GET DELIVERY PRICE
    const { data: delivery } = await supabase
      .from("delivery_locations")
      .select("price")
      .eq("value", location)
      .single()

    const deliveryFee = delivery?.price || 0

    const totalAmount = itemsTotal + deliveryFee

    // 3. CREATE PENDING ORDER
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        email,
        total_amount: totalAmount,
        status: "pending",
        location,
      })
      .select()
      .single()

    console.log('Order creation result:', { order, orderError })

    if (orderError) {
      console.error('Order creation error:', orderError)
      throw orderError
    }
    if (!order) {
      console.error('Order creation returned null')
      throw new Error("Failed to create order - no data returned")
    }

    // 4. CREATE ORDER ITEMS (TEMP, NOT PAID YET)
    const { error: itemsError } = await supabase.from("order_items").insert(
      enrichedItems.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        quantity: i.qty,
        price_at_purchase: i.price,
      }))
    )

    if (itemsError) throw itemsError

    // 5. INIT PAYSTACK PAYMENT
    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: totalAmount * 100,
        reference: order.id,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET ?? ''}`,
        },
      }
    )

    if (!paystackResponse.data?.data?.authorization_url) {
      throw new Error("Paystack did not return authorization URL")
    }

    return res.status(200).json({
      authorization_url: paystackResponse.data.data.authorization_url,
    })

  } catch (err) {
    console.error(err)
    const error = err as Error
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
