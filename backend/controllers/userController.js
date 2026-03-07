const jwt = require('jsonwebtoken')
const User = require('../models/User')

const generateToken = (id) =>
    jwt.sign({ id, type: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' })

// POST /api/users/register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const exists = await User.findOne({ email })
        if (exists) {
            return res.status(400).json({ message: 'Email already registered' })
        }

        const passwordHash = await User.hashPassword(password)
        const user = new User({ name, email, passwordHash })
        await user.save()

        res.status(201).json({
            token: generateToken(user._id),
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email 
            },
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/users/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        res.json({
            token: generateToken(user._id),
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                phone: user.phone,
                address: user.address
            },
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/users/me (protected)
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash')
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json(user)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PUT /api/users/profile (protected)
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: 'User not found' })

        if (name) user.name = name
        if (phone !== undefined) user.phone = phone
        if (address) user.address = { ...user.address, ...address }

        await user.save()
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/users/orders (protected) - Get user's orders
const getUserOrders = async (req, res) => {
    try {
        const Order = require('../models/Order')
        const orders = await Order.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .lean()
        res.json(orders)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { register, login, getMe, updateProfile, getUserOrders }
