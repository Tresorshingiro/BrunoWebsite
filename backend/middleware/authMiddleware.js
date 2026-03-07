const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' })
    }
    const token = authHeader.split(' ')[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // Check if it's an admin token (for backwards compatibility, allow tokens without type)
        if (decoded.type && decoded.type !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized: Admin access required' })
        }
        req.admin = decoded
        next()
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' })
    }
}

module.exports = authMiddleware
