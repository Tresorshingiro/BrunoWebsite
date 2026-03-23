const router = require('express').Router()
const {
    getUpcomingEvents, getPastEvents, getAllEvents, getEvent, createEvent, updateEvent, deleteEvent
} = require('../controllers/eventController')
const authMiddleware = require('../middleware/authMiddleware')
const { upload } = require('../middleware/upload')

const eventUpload = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
])

router.get('/', getUpcomingEvents)
router.get('/past', getPastEvents)
router.get('/admin/all', authMiddleware, getAllEvents)
router.get('/:id', getEvent)
router.post('/', authMiddleware, eventUpload, createEvent)
router.put('/:id', authMiddleware, eventUpload, updateEvent)
router.delete('/:id', authMiddleware, deleteEvent)

module.exports = router
