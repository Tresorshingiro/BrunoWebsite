const BlogPost = require('../models/BlogPost')
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload')

// Strip HTML tags and return plain-text excerpt
function extractExcerpt(html, maxLength = 200) {
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    return text.length > maxLength ? text.substring(0, maxLength).trim() + '...' : text
}

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
            .select('-comments')

        res.json({ posts, total, pages: Math.ceil(total / limit), page: Number(page) })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET all posts (admin — includes drafts)
const getAllPosts = async (req, res) => {
    try {
        const posts = await BlogPost.find().sort({ createdAt: -1 }).lean()
        const result = posts.map((p) => ({
            ...p,
            likesCount: p.likes?.length ?? 0,
            commentsCount: p.comments?.length ?? 0,
            likes: undefined,
            comments: undefined,
        }))
        res.json(result)
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
            .select('-comments')
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

        const excerpt = req.body.content ? extractExcerpt(req.body.content) : ''

        const post = new BlogPost({
            ...req.body,
            coverImage,
            coverImagePublicId,
            excerpt,
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

        const excerpt = req.body.content ? extractExcerpt(req.body.content) : post.excerpt

        const updates = {
            ...req.body,
            coverImage,
            coverImagePublicId,
            excerpt,
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

// POST upload inline image (for rich text editor)
const uploadBlogImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image provided' })
        const result = await uploadToCloudinary(req.file.buffer, 'bruno-website/blog-content')
        res.json({ url: result.secure_url })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST toggle like (user auth)
const toggleLike = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id)
        if (!post) return res.status(404).json({ message: 'Post not found' })

        const userId = req.user.id
        const alreadyLiked = post.likes.some((id) => id.toString() === userId)

        if (alreadyLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== userId)
        } else {
            post.likes.push(userId)
        }

        await post.save()
        res.json({ likes: post.likes.length, liked: !alreadyLiked })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST add comment (user auth)
const addComment = async (req, res) => {
    try {
        const { content } = req.body
        if (!content?.trim()) return res.status(400).json({ message: 'Comment cannot be empty' })

        const post = await BlogPost.findById(req.params.id)
        if (!post) return res.status(404).json({ message: 'Post not found' })

        const User = require('../models/User')
        const user = await User.findById(req.user.id).select('name')
        if (!user) return res.status(404).json({ message: 'User not found' })

        const comment = {
            userId: req.user.id,
            userName: user.name,
            content: content.trim(),
        }

        post.comments.push(comment)
        await post.save()

        const saved = post.comments[post.comments.length - 1]
        res.status(201).json(saved)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// DELETE comment (owner or admin)
const deleteComment = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id)
        if (!post) return res.status(404).json({ message: 'Post not found' })

        const comment = post.comments.id(req.params.commentId)
        if (!comment) return res.status(404).json({ message: 'Comment not found' })

        if (comment.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not allowed' })
        }

        post.comments = post.comments.filter((c) => c._id.toString() !== req.params.commentId)
        await post.save()
        res.json({ message: 'Comment deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST reply to a comment (user auth)
const replyToComment = async (req, res) => {
    try {
        const { content } = req.body
        if (!content?.trim()) return res.status(400).json({ message: 'Reply cannot be empty' })

        const post = await BlogPost.findById(req.params.id)
        if (!post) return res.status(404).json({ message: 'Post not found' })

        const comment = post.comments.id(req.params.commentId)
        if (!comment) return res.status(404).json({ message: 'Comment not found' })

        const User = require('../models/User')
        const user = await User.findById(req.user.id).select('name')
        if (!user) return res.status(404).json({ message: 'User not found' })

        comment.replies.push({ userId: req.user.id, userName: user.name, content: content.trim() })
        await post.save()

        const reply = comment.replies[comment.replies.length - 1]
        res.status(201).json(reply)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// DELETE a reply (owner only)
const deleteReply = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id)
        if (!post) return res.status(404).json({ message: 'Post not found' })

        const comment = post.comments.id(req.params.commentId)
        if (!comment) return res.status(404).json({ message: 'Comment not found' })

        const reply = comment.replies.id(req.params.replyId)
        if (!reply) return res.status(404).json({ message: 'Reply not found' })

        if (reply.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not allowed' })
        }

        comment.replies = comment.replies.filter((r) => r._id.toString() !== req.params.replyId)
        await post.save()
        res.json({ message: 'Reply deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    getPosts, getAllPosts, getLatestPosts, getPost, getPostById,
    createPost, updatePost, deletePost,
    uploadBlogImage, toggleLike, addComment, deleteComment,
    replyToComment, deleteReply,
}
