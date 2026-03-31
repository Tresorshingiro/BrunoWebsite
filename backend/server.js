require('dotenv').config()
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first') // force IPv4 — Render blocks Gmail SMTP over IPv6
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const bookRoutes = require('./routes/books')
const blogRoutes = require('./routes/blog')
const eventRoutes = require('./routes/events')
const contactRoutes = require('./routes/contact')
const authRoutes = require('./routes/auth')
const paymentRoutes = require('./routes/payment')
const userRoutes = require('./routes/users')
const subscriptionRoutes = require('./routes/subscriptions')

const app = express()

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Support multiple allowed origins (comma-separated in CLIENT_ORIGIN env var)
const rawOrigins = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim().replace(/\/$/, ''))

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        // Allow all Vercel deployments for this project (production + previews)
        if (/^https:\/\/bruno.*\.vercel\.app$/.test(origin)) return callback(null, true)
        callback(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
}))

// Routes
app.use('/api/books', bookRoutes)
app.use('/api/blog', blogRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/subscriptions', subscriptionRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    })
})

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('Connected to DB and listening on Port', process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })