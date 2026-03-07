const express = require('express')
const router = express.Router()
const userAuthMiddleware = require('../middleware/userAuthMiddleware')
const { register, login, getMe, updateProfile, getUserOrders } = require('../controllers/userController')

// Public routes
router.post('/register', register)
router.post('/login', login)

// Protected routes
router.get('/me', userAuthMiddleware, getMe)
router.put('/profile', userAuthMiddleware, updateProfile)
router.get('/orders', userAuthMiddleware, getUserOrders)

module.exports = router
