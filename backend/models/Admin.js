const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
}, { timestamps: true })

adminSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash)
}

adminSchema.statics.hashPassword = async function (password) {
    return bcrypt.hash(password, 12)
}

module.exports = mongoose.model('Admin', adminSchema)
