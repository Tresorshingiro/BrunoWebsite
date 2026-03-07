const Event = require('../models/Event')
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload')

// GET upcoming events (public)
const getUpcomingEvents = async (req, res) => {
    try {
        const events = await Event.find({ isPast: false }).sort({ date: 1 }).limit(10)
        res.json(events)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET all events (admin)
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: -1 })
        res.json(events)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET single event
const getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
        if (!event) return res.status(404).json({ message: 'Event not found' })
        res.json(event)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST create event (admin)
const createEvent = async (req, res) => {
    try {
        let image = ''
        let imagePublicId = ''

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'bruno-website/events')
            image = result.secure_url
            imagePublicId = result.public_id
        }

        const event = new Event({ ...req.body, image, imagePublicId })
        await event.save()
        res.status(201).json(event)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// PUT update event (admin)
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
        if (!event) return res.status(404).json({ message: 'Event not found' })

        let image = event.image
        let imagePublicId = event.imagePublicId

        if (req.file) {
            if (event.imagePublicId) await deleteFromCloudinary(event.imagePublicId)
            const result = await uploadToCloudinary(req.file.buffer, 'bruno-website/events')
            image = result.secure_url
            imagePublicId = result.public_id
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            { ...req.body, image, imagePublicId },
            { new: true }
        )
        res.json(updatedEvent)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// DELETE event (admin)
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
        if (!event) return res.status(404).json({ message: 'Event not found' })

        if (event.imagePublicId) await deleteFromCloudinary(event.imagePublicId)
        await Event.findByIdAndDelete(req.params.id)
        res.json({ message: 'Event deleted successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { getUpcomingEvents, getAllEvents, getEvent, createEvent, updateEvent, deleteEvent }
