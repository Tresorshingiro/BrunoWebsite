const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Order = require('../models/Order')
const Book = require('../models/Book')

// POST /api/payment/create-intent
const createPaymentIntent = async (req, res) => {
    try {
        const { items, customerName, customerEmail, shippingAddress } = req.body

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items provided' })
        }

        // Validate and calculate total from DB prices (never trust client prices)
        let total = 0
        const orderItems = []

        for (const item of items) {
            const book = await Book.findById(item.bookId)
            if (!book) {
                return res.status(404).json({ message: `Book not found: ${item.bookId}` })
            }

            const price = item.format === 'digital'
                ? (book.digitalPrice || book.price)
                : book.price

            if (!price || price <= 0) {
                return res.status(400).json({ message: `Book "${book.title}" is not available for purchase` })
            }

            const qty = Math.max(1, parseInt(item.quantity) || 1)
            total += price * qty
            orderItems.push({
                bookId: book._id,
                title: book.title,
                coverImage: book.coverImage,
                price,
                quantity: qty,
                format: item.format || 'physical',
            })
        }

        // Create Stripe PaymentIntent (amount in cents)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: 'usd',
            metadata: {
                customerName: customerName || '',
                customerEmail: customerEmail || '',
            },
        })

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            total,
            orderItems,
        })
    } catch (err) {
        console.error('Stripe error:', err)
        res.status(500).json({ message: err.message })
    }
}

// POST /api/payment/confirm-order
const confirmOrder = async (req, res) => {
    try {
        const { paymentIntentId, customerName, customerEmail, items, shippingAddress, total } = req.body

        // Verify the payment intent is succeeded
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment not completed' })
        }

        // Check if order already exists
        const existing = await Order.findOne({ stripePaymentIntentId: paymentIntentId })
        if (existing) {
            return res.json(existing)
        }

        const order = new Order({
            userId: req.user?.id,
            customerName,
            customerEmail,
            items,
            totalAmount: total,
            stripePaymentIntentId: paymentIntentId,
            status: 'paid',
            shippingAddress,
        })

        await order.save()
        res.status(201).json(order)
    } catch (err) {
        console.error('Confirm order error:', err)
        res.status(500).json({ message: err.message })
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
        const { status } = req.body
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )
        if (!order) return res.status(404).json({ message: 'Order not found' })
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
    createPaymentIntent,
    confirmOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    deleteOrder,
}
