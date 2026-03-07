const router = require('express').Router()
const {
    getBooks, getFeaturedBook, getBook, createBook, updateBook, deleteBook
} = require('../controllers/bookController')
const authMiddleware = require('../middleware/authMiddleware')
const { upload } = require('../middleware/upload')

router.get('/', getBooks)
router.get('/featured', getFeaturedBook)
router.get('/:id', getBook)
router.post('/', authMiddleware, upload.single('coverImage'), createBook)
router.put('/:id', authMiddleware, upload.single('coverImage'), updateBook)
router.delete('/:id', authMiddleware, deleteBook)

module.exports = router
