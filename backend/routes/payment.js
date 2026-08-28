const router = require('express').Router()
const {
    initiate,
    verify,
    webhook,
    getOrders,
    getOrder,
    updateOrderStatus,
    deleteOrder,
} = require('../controllers/paymentController')
const authMiddleware = require('../middleware/authMiddleware')
const userAuthMiddleware = require('../middleware/userAuthMiddleware')

// User protected routes (require customer login)
router.post('/initiate', userAuthMiddleware, initiate)
router.post('/verify', userAuthMiddleware, verify)
// No auth middleware: Flutterwave has no user token. Verified by verif-hash.
router.post('/webhook', webhook)

// Admin protected routes
router.get('/orders', authMiddleware, getOrders)
router.get('/orders/:id', authMiddleware, getOrder)
router.patch('/orders/:id/status', authMiddleware, updateOrderStatus)
router.delete('/orders/:id', authMiddleware, deleteOrder)

module.exports = router
