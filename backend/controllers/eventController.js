const Event = require('../models/Event')
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload')

// GET upcoming events (public)
const getUpcomingEvents = async (req, res) => {
    try {
        const events = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(10)
        res.json(events)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET past events (public)
const getPastEvents = async (req, res) => {
    try {
        const events = await Event.find({ date: { $lt: new Date() } }).sort({ date: -1 }).limit(20)
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

// GET single event (public)
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
        let gallery = []
        let galleryPublicIds = []

        if (req.files?.image?.[0]) {
            const result = await uploadToCloudinary(req.files.image[0].buffer, 'bruno-website/events')
            image = result.secure_url
            imagePublicId = result.public_id
        }

        if (req.files?.gallery?.length) {
            for (const file of req.files.gallery) {
                const result = await uploadToCloudinary(file.buffer, 'bruno-website/events/gallery')
                gallery.push(result.secure_url)
                galleryPublicIds.push(result.public_id)
            }
        }

        const event = new Event({ ...req.body, image, imagePublicId, gallery, galleryPublicIds })
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
        let gallery = event.gallery || []
        let galleryPublicIds = event.galleryPublicIds || []

        if (req.files?.image?.[0]) {
            if (event.imagePublicId) await deleteFromCloudinary(event.imagePublicId)
            const result = await uploadToCloudinary(req.files.image[0].buffer, 'bruno-website/events')
            image = result.secure_url
            imagePublicId = result.public_id
        }

        if (req.files?.gallery?.length) {
            // Delete old gallery from Cloudinary
            for (const pid of galleryPublicIds) {
                await deleteFromCloudinary(pid).catch(() => {})
            }
            gallery = []
            galleryPublicIds = []
            for (const file of req.files.gallery) {
                const result = await uploadToCloudinary(file.buffer, 'bruno-website/events/gallery')
                gallery.push(result.secure_url)
                galleryPublicIds.push(result.public_id)
            }
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            { ...req.body, image, imagePublicId, gallery, galleryPublicIds },
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

        if (event.imagePublicId) await deleteFromCloudinary(event.imagePublicId).catch(() => {})
        for (const pid of event.galleryPublicIds || []) {
            await deleteFromCloudinary(pid).catch(() => {})
        }
        await Event.findByIdAndDelete(req.params.id)
        res.json({ message: 'Event deleted successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { getUpcomingEvents, getPastEvents, getAllEvents, getEvent, createEvent, updateEvent, deleteEvent }
