const router = require('express').Router()
const {
    getUpcomingEvents, getAllEvents, getEvent, createEvent, updateEvent, deleteEvent
} = require('../controllers/eventController')
const authMiddleware = require('../middleware/authMiddleware')
const { upload } = require('../middleware/upload')

router.get('/', getUpcomingEvents)
router.get('/admin/all', authMiddleware, getAllEvents)
router.get('/:id', getEvent)
router.post('/', authMiddleware, upload.single('image'), createEvent)
router.put('/:id', authMiddleware, upload.single('image'), updateEvent)
router.delete('/:id', authMiddleware, deleteEvent)

module.exports = router
