const jwt = require('jsonwebtoken')

// Optional user authentication - sets req.user if token is present, but doesn't require it
const optionalUserAuth = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next()
    }
    const token = authHeader.split(' ')[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (decoded.type === 'user') {
            req.user = decoded
        }
    } catch (err) {
        // Token invalid, but continue without user
    }
    next()
}

module.exports = optionalUserAuth
