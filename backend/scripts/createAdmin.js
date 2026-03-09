/**
 * Create an admin account
 * Run from backend folder: node scripts/createAdmin.js
 * Requires: MONGO_URI and JWT_SECRET in .env
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const Admin = require('../models/Admin')

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  }

  try {
    // Admin credentials
    const username = 'Tresor'
    const email = 'tresor@gmail.com'
    const password = 'Tresor@123'

    // Check if admin already exists
    const exists = await Admin.findOne({ $or: [{ email }, { username }] })
    if (exists) {
      console.log('Admin already exists with this email or username')
      process.exit(0)
    }

    // Create admin
    const passwordHash = await Admin.hashPassword(password)
    const admin = new Admin({ username, email, passwordHash })
    await admin.save()

    console.log('✅ Admin account created successfully!')
    console.log('Username:', username)
    console.log('Email:', email)
    console.log('Password:', password)
  } catch (err) {
    console.error('Failed to create admin:', err.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
    process.exit(0)
  }
}

createAdmin()
