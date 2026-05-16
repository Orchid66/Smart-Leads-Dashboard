import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import leadRoutes from './routes/leadRoutes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Health check
app.get('/', (_req, res) => {
  res.json({ message: 'Smart Leads API is running!' })
})

app.use('/api/auth', authRoutes)
app.use('/api/leads', leadRoutes)

// Global error handler (basic one)
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong on the server' })
})

const connectAndStart = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-leads')
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err)
    process.exit(1)
  }
}

connectAndStart()
