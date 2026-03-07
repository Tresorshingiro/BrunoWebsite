const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    title: { type: String, required: true },
    coverImage: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    format: { type: String, enum: ['physical', 'digital'], default: 'physical' },
})

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    stripePaymentIntentId: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
    },
    shippingAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zipCode: { type: String },
    },
    notes: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
