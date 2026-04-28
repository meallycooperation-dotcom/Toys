import express from 'express'
import cors from 'cors'
import { createPayment } from './api/create-payment.js'
import { paystackWebhook } from './api/paystack-webhook.js'

const app = express()
const PORT = process.env.PORT || 3000

// ✅ MUST come first
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ✅ handle preflight manually (important)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.sendStatus(204)
})

app.use(express.json())

app.post('/api/create-payment', createPayment)
app.post('/api/paystack-webhook', paystackWebhook)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})