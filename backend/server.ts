import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import createPayment from './api/create-payment.js'
import paystackWebhook from './api/paystack-webhook.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(
  cors({
    origin: 'https://toys-tau.vercel.app/',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
)

app.use(express.json())

// API routes
app.post('/api/create-payment', createPayment)
app.post('/api/paystack-webhook', paystackWebhook)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})