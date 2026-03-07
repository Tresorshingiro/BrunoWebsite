const mongoose = require('mongoose')

const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    coverImage: { type: String },
    coverImagePublicId: { type: String },
    category: {
        type: String,
        enum: ['Faith', 'Forgiveness', 'Personal Growth', 'Rwanda', 'Healing', 'General'],
        default: 'General',
    },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    views: { type: Number, default: 0 },
    readTime: { type: Number, default: 5 },
}, { timestamps: true })

// Auto-generate slug from title
blogPostSchema.pre('validate', async function () {
    if (this.title && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
    }
})

module.exports = mongoose.model('BlogPost', blogPostSchema)
