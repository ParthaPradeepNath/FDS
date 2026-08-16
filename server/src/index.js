import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/categories', categoryRoutes)

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
})

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)

  let status = err.statusCode || 500
  let message = err.message || 'Server error'

  if (err.name === 'ValidationError') {
    status = 400
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ')
  }
  if (err.name === 'CastError') {
    status = 400
    message = 'Invalid id format'
  }
  if (err.name === 'MongoServerError' && err.code === 11000) {
    status = 409
    message = 'Duplicate value error'
  }

  console.error(`[${new Date().toISOString()}] ${err.stack || err}`)
  res.status(status).json({ message })
})

const PORT = process.env.PORT || 3000

const start = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
