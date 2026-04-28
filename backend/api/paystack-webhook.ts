/// /api/paystack-webhook.ts
import { supabase } from "./_lib/supabase"

declare const process: {
  env: {
    PAYSTACK_SECRET?: string
  }
}

declare function require(name: string): any
const crypto = require("crypto")

type PaystackWebhookEvent = {
  event: string
  data: {
    reference?: string
  }
}

export default async function handler(req: any, res: any) {
  const event = req.body as PaystackWebhookEvent

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET!)
    .update(JSON.stringify(req.body))
    .digest("hex")

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(400).send("Invalid signature")
  }

  if (event.event === "charge.success") {
    const reference = event.data.reference
    if (!reference) {
      return res.status(400).send("Missing reference")
    }

    try {
      // 1. Mark order as paid
      await supabase
        .from("orders")
        .update({
          status: "paid"
        })
        .eq("id", reference)

      // 2. Reduce stock
      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", reference)

      if (!items) {
        throw new Error("No order items found")
      }

      for (const item of items) {
        await supabase.rpc("decrease_stock", {
          product_id: item.product_id,
          qty: item.quantity,
        })
      }

      return res.status(200).send("ok")

    } catch (err) {
      console.error(err)
      return res.status(500).send("error")
    }
  }

  res.status(200).send("ignored")
}