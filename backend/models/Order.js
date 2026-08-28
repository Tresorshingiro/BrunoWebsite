const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    title: { type: String, required: true },
    coverImage: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    format: { type: String, enum: ['physical', 'digital'], default: 'physical' },
})

/* Rwandan addresses have no State and no ZIP. Asking for them produced the
   empty fields that rendered as "Gikondo, Kigali, , Rwanda". */
const addressSchema = new mongoose.Schema({
    province: { type: String, trim: true },
    district: { type: String, trim: true },
    sector: { type: String, trim: true },
    street: { type: String, trim: true },
}, { _id: false })

/* One entry per status change. This is what lets the customer-facing timeline
   print a real date instead of guessing — createdAt/updatedAt alone cannot say
   when an order shipped. */
const statusEventSchema = new mongoose.Schema({
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    note: { type: String, trim: true },
}, { _id: false })

const orderSchema = new mongoose.Schema({
    // Indexed: the customer's order-history query filters on this alone.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    // The courier calls before delivering, so this is not optional.
    customerPhone: { type: String, required: true, trim: true },

    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    deliveryMethod: { type: String, enum: ['standard', 'collect'], default: 'standard' },
    shippingAddress: { type: addressSchema, default: () => ({}) },
    signed: { type: Boolean, default: false },
    notes: { type: String, trim: true },

    // Flutterwave. txRef is ours and generated before payment; flwTransactionId
    // comes back from them on verification.
    txRef: { type: String, required: true, unique: true, index: true },
    flwTransactionId: { type: String },
    paymentMethod: { type: String, enum: ['momo', 'airtel', 'card', 'bank'] },

    status: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
    },
    statusHistory: { type: [statusEventSchema], default: [] },
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
