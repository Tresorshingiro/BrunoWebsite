const BlogPost = require('../models/BlogPost')
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload')

// GET all published posts
const getPosts = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 9 } = req.query
        const query = { status: 'published' }

        if (category && category !== 'all') query.category = category
        if (search) query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { excerpt: { $regex: search, $options: 'i' } },
        ]

        const total = await BlogPost.countDocuments(query)
        const posts = await BlogPost.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))

        res.json({ posts, total, pages: Math.ceil(total / limit), page: Number(page) })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET all posts (admin — includes drafts)
const getAllPosts = async (req, res) => {
    try {
        const posts = await BlogPost.find().sort({ createdAt: -1 })
        res.json(posts)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET latest posts (for homepage)
const getLatestPosts = async (req, res) => {
    try {
        const posts = await BlogPost.find({ status: 'published' })
            .sort({ createdAt: -1 })
            .limit(3)
        res.json(posts)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET single post by slug
const getPost = async (req, res) => {
    try {
        const post = await BlogPost.findOneAndUpdate(
            { slug: req.params.slug, status: 'published' },
            { $inc: { views: 1 } },
            { new: true }
        )
        if (!post) return res.status(404).json({ message: 'Post not found' })
        res.json(post)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET single post by ID (admin)
const getPostById = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id)
        if (!post) return res.status(404).json({ message: 'Post not found' })
        res.json(post)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST create post
const createPost = async (req, res) => {
    try {
        let coverImage = ''
        let coverImagePublicId = ''

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'bruno-website/blog')
            coverImage = result.secure_url
            coverImagePublicId = result.public_id
        }

        const post = new BlogPost({
            ...req.body,
            coverImage,
            coverImagePublicId,
            tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        })
        await post.save()
        res.status(201).json(post)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// PUT update post
const updatePost = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id)
        if (!post) return res.status(404).json({ message: 'Post not found' })

        let coverImage = post.coverImage
        let coverImagePublicId = post.coverImagePublicId

        if (req.file) {
            if (post.coverImagePublicId) await deleteFromCloudinary(post.coverImagePublicId)
            const result = await uploadToCloudinary(req.file.buffer, 'bruno-website/blog')
            coverImage = result.secure_url
            coverImagePublicId = result.public_id
        }

        const updates = {
            ...req.body,
            coverImage,
            coverImagePublicId,
            tags: req.body.tags ? JSON.parse(req.body.tags) : post.tags,
        }

        const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, updates, { new: true })
        res.json(updatedPost)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// DELETE post
const deletePost = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id)
        if (!post) return res.status(404).json({ message: 'Post not found' })

        if (post.coverImagePublicId) await deleteFromCloudinary(post.coverImagePublicId)
        await BlogPost.findByIdAndDelete(req.params.id)
        res.json({ message: 'Post deleted successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { getPosts, getAllPosts, getLatestPosts, getPost, getPostById, createPost, updatePost, deletePost }
