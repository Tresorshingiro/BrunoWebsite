const mongoose = require('mongoose')
const crypto = require('crypto')

const subscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    unsubscribeToken: {
        type: String,
        default: () => crypto.randomBytes(32).toString('hex'),
        unique: true,
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Subscriber', subscriberSchema)
