const router = require('express').Router()
const {
    getPosts, getAllPosts, getLatestPosts, getPost, getPostById,
    createPost, updatePost, deletePost
} = require('../controllers/blogController')
const authMiddleware = require('../middleware/authMiddleware')
const { upload } = require('../middleware/upload')

router.get('/', getPosts)
router.get('/latest', getLatestPosts)
router.get('/admin/all', authMiddleware, getAllPosts)
router.get('/id/:id', authMiddleware, getPostById)
router.get('/:slug', getPost)
router.post('/', authMiddleware, upload.single('coverImage'), createPost)
router.put('/:id', authMiddleware, upload.single('coverImage'), updatePost)
router.delete('/:id', authMiddleware, deletePost)

module.exports = router
