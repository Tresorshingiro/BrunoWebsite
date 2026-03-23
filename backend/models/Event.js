const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ['online', 'in-person'], default: 'in-person' },
    registrationLink: { type: String },
    isPast: { type: Boolean, default: false },
    image: { type: String },
    imagePublicId: { type: String },
    gallery: [{ type: String }],
    galleryPublicIds: [{ type: String }],
    videoUrl: { type: String },
}, { timestamps: true })

// Auto-set isPast based on date
eventSchema.pre('save', function (next) {
    this.isPast = new Date(this.date) < new Date()
    next()
})

module.exports = mongoose.model('Event', eventSchema)
