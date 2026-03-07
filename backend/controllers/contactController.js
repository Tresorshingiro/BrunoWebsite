const Contact = require('../models/Contact')
const nodemailer = require('nodemailer')

const createTransporter = () =>
    nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })

// POST submit contact form
const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const contact = new Contact({ name, email, subject, message })
        await contact.save()

        // Send email notification
        try {
            const transporter = createTransporter()
            await transporter.sendMail({
                from: `"Bruno Website" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: `New Contact Message: ${subject}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #7fffd4;">New Message from Bruno's Website</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${name}</td></tr>
                            <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${email}</td></tr>
                            <tr><td style="padding: 8px; font-weight: bold;">Subject:</td><td style="padding: 8px;">${subject}</td></tr>
                            <tr><td style="padding: 8px; font-weight: bold; vertical-align: top;">Message:</td><td style="padding: 8px;">${message.replace(/\n/g, '<br>')}</td></tr>
                        </table>
                    </div>
                `,
            })
        } catch (emailErr) {
            console.error('Email notification failed:', emailErr.message)
        }

        res.status(201).json({ message: 'Message sent successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET all messages (admin)
const getMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 })
        res.json(messages)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PATCH mark as read/unread (admin)
const toggleRead = async (req, res) => {
    try {
        const message = await Contact.findById(req.params.id)
        if (!message) return res.status(404).json({ message: 'Message not found' })

        message.read = !message.read
        await message.save()
        res.json(message)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// DELETE message (admin)
const deleteMessage = async (req, res) => {
    try {
        const message = await Contact.findByIdAndDelete(req.params.id)
        if (!message) return res.status(404).json({ message: 'Message not found' })
        res.json({ message: 'Message deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { submitContact, getMessages, toggleRead, deleteMessage }
