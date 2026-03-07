const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zipCode: { type: String },
    },
}, { timestamps: true })

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash)
}

userSchema.statics.hashPassword = async function (password) {
    return bcrypt.hash(password, 12)
}

module.exports = mongoose.model('User', userSchema)
