const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')

const generateToken = (id) =>
    jwt.sign({ id, type: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST register (for initial setup only)
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const exists = await Admin.findOne({ $or: [{ email }, { username }] })
        if (exists) {
            return res.status(400).json({ message: 'Admin already exists' })
        }

        const passwordHash = await Admin.hashPassword(password)
        const admin = new Admin({ username, email, passwordHash })
        await admin.save()

        res.status(201).json({
            token: generateToken(admin._id),
            admin: { id: admin._id, username: admin.username, email: admin.email },
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST login
const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        const admin = await Admin.findOne({ email })
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const isMatch = await admin.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        res.json({
            token: generateToken(admin._id),
            admin: { id: admin._id, username: admin.username, email: admin.email },
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET current admin (protected)
const getMe = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('-passwordHash')
        if (!admin) return res.status(404).json({ message: 'Admin not found' })
        res.json(admin)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PUT update admin profile (protected)
const updateProfile = async (req, res) => {
    try {
        const { username, email, currentPassword, newPassword } = req.body
        const admin = await Admin.findById(req.admin.id)
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' })
        }

        // If updating email or username, check for duplicates
        if (email && email !== admin.email) {
            const emailExists = await Admin.findOne({ email, _id: { $ne: admin._id } })
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' })
            }
            admin.email = email
        }

        if (username && username !== admin.username) {
            const usernameExists = await Admin.findOne({ username, _id: { $ne: admin._id } })
            if (usernameExists) {
                return res.status(400).json({ message: 'Username already in use' })
            }
            admin.username = username
        }

        // If changing password, verify current password first
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to set new password' })
            }
            const isMatch = await admin.comparePassword(currentPassword)
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect' })
            }
            admin.passwordHash = await Admin.hashPassword(newPassword)
        }

        await admin.save()

        res.json({
            id: admin._id,
            username: admin.username,
            email: admin.email,
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET dashboard stats (admin)
const getDashboardStats = async (req, res) => {
    try {
        const Book = require('../models/Book')
        const BlogPost = require('../models/BlogPost')
        const Event = require('../models/Event')
        const Contact = require('../models/Contact')
        const Order = require('../models/Order')

        const [books, posts, events, messages, unreadMessages, orders, revenue] = await Promise.all([
            Book.countDocuments(),
            BlogPost.countDocuments({ status: 'published' }),
            Event.countDocuments({ isPast: false }),
            Contact.countDocuments(),
            Contact.countDocuments({ read: false }),
            Order.countDocuments({ status: 'paid' }),
            Order.aggregate([
                { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
        ])

        res.json({
            books,
            posts,
            events,
            messages,
            unreadMessages,
            orders,
            revenue: revenue[0]?.total || 0,
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { register, login, getMe, updateProfile, getDashboardStats }
