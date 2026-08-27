const mongoose = require('mongoose')

const buyLinkSchema = new mongoose.Schema({
    platform: { type: String, required: true },
    url: { type: String, required: true },
})

/* One "what's inside" entry. Optional everywhere — a book with none simply
   does not render that band on its detail page. */
const insidePointSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true, default: '' },
}, { _id: false })

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    // Who wrote it. Vitalreadings publishes other authors, so this is what
    // separates Bruno's own titles from the rest of the catalogue — the
    // `featured` flag is merchandising and says nothing about authorship.
    author: { type: String, trim: true, default: '' },
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

    /* ── Editorial content for the detail page ───────────────────────────
       Every field below is optional and per-book. The detail page renders
       for any title in the catalogue, not just Bruno's, so this content has
       to live on the record — hardcoding it in the template would attribute
       one author's words to another. An empty field hides its band. */
    aboutLong: { type: String, default: '' },
    insidePoints: { type: [insidePointSchema], default: [] },
    excerpt: { type: String, default: '' },
    excerptSource: { type: String, trim: true, default: '' },
    authorBio: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Book', bookSchema)
