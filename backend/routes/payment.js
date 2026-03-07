const router = require('express').Router()
const {
    createPaymentIntent,
    confirmOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    deleteOrder,
} = require('../controllers/paymentController')
const authMiddleware = require('../middleware/authMiddleware')
const userAuthMiddleware = require('../middleware/userAuthMiddleware')

// User protected routes (require customer login)
router.post('/create-intent', userAuthMiddleware, createPaymentIntent)
router.post('/confirm-order', userAuthMiddleware, confirmOrder)

// Admin protected routes
router.get('/orders', authMiddleware, getOrders)
router.get('/orders/:id', authMiddleware, getOrder)
router.patch('/orders/:id/status', authMiddleware, updateOrderStatus)
router.delete('/orders/:id', authMiddleware, deleteOrder)

module.exports = router
