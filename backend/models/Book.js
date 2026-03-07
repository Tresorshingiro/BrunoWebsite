const mongoose = require('mongoose')

const buyLinkSchema = new mongoose.Schema({
    platform: { type: String, required: true },
    url: { type: String, required: true },
})

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String, required: true },
    coverImage: { type: String, required: true },
    coverImagePublicId: { type: String },
    buyLinks: [buyLinkSchema],
    genre: { type: String, default: 'Memoir/Christian' },
    publishedDate: { type: Date },
    featured: { type: Boolean, default: false },
    chapters: [{ type: String }],
    price: { type: Number, default: 0 },
    digitalPrice: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    availableFormats: {
        physical: { type: Boolean, default: true },
        digital: { type: Boolean, default: true },
    },
    pages: { type: Number },
    isbn: { type: String },
    language: { type: String, default: 'English' },
}, { timestamps: true })

module.exports = mongoose.model('Book', bookSchema)
