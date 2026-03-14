const mongoose = require('mongoose')

const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String },
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
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String, required: true },
        content: { type: String, required: true, trim: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
        replies: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            userName: { type: String, required: true },
            content: { type: String, required: true, trim: true, maxlength: 1000 },
            createdAt: { type: Date, default: Date.now },
        }],
    }],
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
