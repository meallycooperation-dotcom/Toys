/// /api/create-rating.ts
import { getSupabase } from "./_lib/supabase.js"

type CreateRatingRequest = {
  orderId?: string
  rating?: number
  review?: string
}

function getBearerToken(authorizationHeader?: string) {
  if (!authorizationHeader) {
    return null
  }

  const [scheme, token] = authorizationHeader.split(" ")
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null
  }

  return token.trim()
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end()

  const { orderId, rating, review } = req.body as CreateRatingRequest
  const accessToken = getBearerToken(req.headers.authorization)

  if (!accessToken) {
    return res.status(401).json({ error: "Missing authorization token." })
  }

  if (!orderId || typeof orderId !== "string") {
    return res.status(400).json({ error: "orderId is required." })
  }

  const numericRating = Number(rating)
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: "rating must be an integer between 1 and 5." })
  }

  const trimmedReview = typeof review === "string" ? review.trim() : ""

  try {
    const supabase = getSupabase()

    const { data: authData, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError) throw authError
    if (!authData.user) {
      return res.status(401).json({ error: "Invalid or expired session." })
    }

    const user = authData.user

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, email, user_id")
      .eq("id", orderId)
      .single()

    if (orderError) throw orderError
    if (!order) {
      return res.status(404).json({ error: "Order not found." })
    }

    if (order.status !== "delivered") {
      return res.status(400).json({ error: "You can only rate an order after it has been delivered." })
    }

    if (order.user_id && order.user_id !== user.id) {
      return res.status(403).json({ error: "You do not own this order." })
    }

    if (!order.user_id && user.email && order.email !== user.email) {
      return res.status(403).json({ error: "You do not own this order." })
    }

    const { data: existingRating, error: existingError } = await supabase
      .from("product_ratings")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle()

    if (existingError) throw existingError
    if (existingRating) {
      return res.status(409).json({ error: "This order has already been rated." })
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true })

    if (itemsError) throw itemsError

    const productId = orderItems?.find((item) => Boolean(item.product_id))?.product_id
    if (!productId) {
      return res.status(400).json({ error: "No product was found for this order." })
    }

    const { data: insertedRating, error: insertError } = await supabase
      .from("product_ratings")
      .insert({
        product_id: productId,
        user_id: user.id,
        order_id: orderId,
        rating: numericRating,
        review: trimmedReview || null,
      })
      .select()
      .single()

    if (insertError) throw insertError

    const { data: ratingStats, error: statsError } = await supabase
      .from("product_ratings")
      .select("rating")
      .eq("product_id", productId)

    if (statsError) throw statsError

    const ratings = ratingStats || []
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

    return res.status(200).json({
      rating: insertedRating,
      message: "Rating saved.",
    })
  } catch (err) {
    console.error(err)
    const error = err as Error
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
