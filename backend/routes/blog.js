const router = require('express').Router()
const {
    getPosts, getAllPosts, getLatestPosts, getPost, getPostById,
    createPost, updatePost, deletePost,
    uploadBlogImage, toggleLike, addComment, deleteComment,
    replyToComment, deleteReply,
} = require('../controllers/blogController')
const authMiddleware = require('../middleware/authMiddleware')
const userAuthMiddleware = require('../middleware/userAuthMiddleware')
const { upload } = require('../middleware/upload')

// Public routes
router.get('/', getPosts)
router.get('/latest', getLatestPosts)

// Admin-only routes (must come before /:slug to avoid conflict)
router.get('/admin/all', authMiddleware, getAllPosts)
router.get('/id/:id', authMiddleware, getPostById)
router.post('/upload-image', authMiddleware, upload.single('image'), uploadBlogImage)
router.post('/', authMiddleware, upload.single('coverImage'), createPost)
router.put('/:id', authMiddleware, upload.single('coverImage'), updatePost)
router.delete('/:id', authMiddleware, deletePost)

// User interaction routes (require user login)
router.post('/:id/like', userAuthMiddleware, toggleLike)
router.post('/:id/comment', userAuthMiddleware, addComment)
router.delete('/:id/comment/:commentId', userAuthMiddleware, deleteComment)
router.post('/:id/comment/:commentId/reply', userAuthMiddleware, replyToComment)
router.delete('/:id/comment/:commentId/reply/:replyId', userAuthMiddleware, deleteReply)

// Public slug route (last — most generic)
router.get('/:slug', getPost)

module.exports = router
