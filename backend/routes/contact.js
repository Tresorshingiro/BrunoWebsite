const router = require('express').Router()
const {
    submitContact, getMessages, toggleRead, deleteMessage
} = require('../controllers/contactController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/', submitContact)
router.get('/', authMiddleware, getMessages)
router.patch('/:id/toggle-read', authMiddleware, toggleRead)
router.delete('/:id', authMiddleware, deleteMessage)

module.exports = router
