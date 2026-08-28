const crypto = require('crypto')
const mongoose = require('mongoose')
const Order = require('../models/Order')
const Book = require('../models/Book')
const { computeTotals, DELIVERY_METHODS } = require('../config/delivery')
const { genTxRef, verifyTransaction } = require('../services/flutterwave')
const { markOrderPaid } = require('../services/orders')

// POST /api/payment/initiate
const initiate = async (req, res) => {
    try {
        const {
            items, customerName, customerEmail, customerPhone,
            deliveryMethod = 'standard', shippingAddress = {}, signed = false, notes = '',
        } = req.body

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items provided' })
        }
        if (!customerName?.trim() || !customerEmail?.trim() || !customerPhone?.trim()) {
            return res.status(400).json({ message: 'Name, email and phone are required' })
        }
        if (!DELIVERY_METHODS.includes(deliveryMethod)) {
            return res.status(400).json({ message: 'Invalid delivery method' })
        }
        // Collection needs no address; standard delivery does. Trim first —
        // "   " is not an address, and the other contact fields are already
        // held to that standard.
        if (deliveryMethod === 'standard') {
            const { province, district, sector, street } = shippingAddress
            if (![province, district, sector, street].every((f) => f && String(f).trim())) {
                return res.status(400).json({ message: 'A full delivery address is required' })
            }
        }

        // Re-price everything from the database. Client prices are never read.
        const orderItems = []
        for (const item of items) {
            // A CastError from findById would otherwise surface as a 500, even
            // though a malformed id is client input exactly like a missing one.
            if (!mongoose.Types.ObjectId.isValid(item.bookId)) {
                return res.status(400).json({ message: `Invalid book id: ${item.bookId}` })
            }
            const book = await Book.findById(item.bookId)
            if (!book) {
                return res.status(404).json({ message: `Book not found: ${item.bookId}` })
            }
            if (!book.inStock) {
                return res.status(400).json({ message: `"${book.title}" is out of stock` })
            }
            if (!book.price || book.price <= 0) {
                return res.status(400).json({ message: `"${book.title}" is not available for purchase` })
            }
            const qty = parseInt(item.quantity)
            if (!Number.isInteger(qty) || qty < 1) {
                return res.status(400).json({ message: `Invalid quantity for "${book.title}"` })
            }
            // The cart UI caps at 20; the server must agree rather than trust it.
            // Bulk orders go through the contact form, per the Books FAQ.
            if (qty > 20) {
                return res.status(400).json({
                    message: `Maximum 20 copies of "${book.title}" per order — please contact us for bulk orders`,
                })
            }
            orderItems.push({
                bookId: book._id,
                title: book.title,
                coverImage: book.coverImage,
                price: book.price,
                quantity: qty,
                format: 'physical',
            })
        }

        const { subtotal, deliveryFee, total } = computeTotals(orderItems, deliveryMethod)
        const txRef = genTxRef()

        // Written before payment, so verification has a total it can trust.
        const order = await Order.create({
            userId: req.user?.id,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            customerPhone: customerPhone.trim(),
            items: orderItems,
            subtotal,
            deliveryFee,
            totalAmount: total,
            deliveryMethod,
            shippingAddress: deliveryMethod === 'collect' ? {} : shippingAddress,
            signed: Boolean(signed),
            notes,
            txRef,
            status: 'pending',
            statusHistory: [{ status: 'pending', at: new Date() }],
        })

        res.status(201).json({
            orderId: order._id,
            txRef,
            amount: total,
            publicKey: process.env.FLW_PUBLIC_KEY,
            customer: {
                name: order.customerName,
                email: order.customerEmail,
                phone_number: order.customerPhone,
            },
            summary: { items: orderItems, subtotal, deliveryFee, total },
        })
    } catch (err) {
        console.error('Initiate error:', err)
        res.status(500).json({ message: err.message })
    }
}

// POST /api/payment/verify  — called when the browser returns from Flutterwave
const verify = async (req, res) => {
    try {
        const { txRef, transactionId } = req.body
        if (!txRef || !transactionId) {
            return res.status(400).json({ message: 'txRef and transactionId are required' })
        }

        const order = await Order.findOne({ txRef })
        if (!order) return res.status(404).json({ message: 'Order not found' })

        // Scope: a user may only touch their own order. An order with no owner
        // is denied rather than allowed — the permissive form would become a
        // PII leak the moment guest checkout exists. 404, not 403: another
        // user's order should be indistinguishable from one that isn't there.
        if (!order.userId || String(order.userId) !== String(req.user?.id)) {
            return res.status(404).json({ message: 'Order not found' })
        }

        if (order.status !== 'pending') return res.json(order)

        const flwData = await verifyTransaction(transactionId)
        await markOrderPaid(order, flwData)

        res.json(order)
    } catch (err) {
        console.error('Verify error:', err.message)
        // The order stays pending. Never report success on a failed check.
        res.status(400).json({ message: err.message })
    }
}

/* Constant-time compare. This is the only thing standing between the public
   internet and order settlement, so it should not leak the secret a character
   at a time. Length is compared first and does leak, which is standard and
   acceptable. */
function secretMatches(received, expected) {
    if (!received || !expected) return false
    const a = Buffer.from(String(received))
    const b = Buffer.from(String(expected))
    return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// POST /api/payment/webhook — Flutterwave's server-to-server notification.
// Public, but authenticated by the shared secret hash.
const webhook = async (req, res) => {
    if (!secretMatches(req.headers['verif-hash'], process.env.FLW_SECRET_HASH)) {
        return res.status(401).json({ message: 'Invalid signature' })
    }

    // Acknowledge immediately — Flutterwave retries on a slow response.
    res.json({ received: true })

    try {
        const payload = req.body?.data || req.body
        const txRef = payload?.tx_ref
        const transactionId = payload?.id
        if (!txRef || !transactionId) return

        const order = await Order.findOne({ txRef })
        if (!order || order.status !== 'pending') return

        const flwData = await verifyTransaction(transactionId)
        await markOrderPaid(order, flwData)
        console.log('Webhook settled order', order._id.toString())
    } catch (err) {
        console.error('Webhook error:', err.message)
    }
}

// GET /api/payment/orders (admin)
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 })
        res.json(orders)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/payment/orders/:id (admin)
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.bookId', 'title coverImage')
        if (!order) return res.status(404).json({ message: 'Order not found' })
        res.json(order)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PATCH /api/payment/orders/:id/status (admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body
        const allowed = Order.schema.path('status').enumValues
        if (!status || !allowed.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Expected one of: ${allowed.join(', ')}`,
            })
        }

        const order = await Order.findById(req.params.id)
        if (!order) return res.status(404).json({ message: 'Order not found' })

        if (order.status !== status) {
            order.status = status
            // The customer timeline reads this. Skipping it makes tracking decorative.
            order.statusHistory.push({ status, at: new Date(), note })
            await order.save()
        }
        res.json(order)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// DELETE /api/payment/orders/:id (admin)
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id)
        if (!order) return res.status(404).json({ message: 'Order not found' })
        res.json({ message: 'Order deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    initiate,
    verify,
    webhook,
    getOrders,
    getOrder,
    updateOrderStatus,
    deleteOrder,
}
