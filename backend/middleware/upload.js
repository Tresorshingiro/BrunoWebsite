const multer = require('multer')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
})

const storage = multer.memoryStorage()

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed'), false)
        }
    },
})

const uploadToCloudinary = (buffer, folder = 'bruno-website') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) reject(error)
                else resolve(result)
            }
        )
        streamifier.createReadStream(buffer).pipe(uploadStream)
    })
}

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return
    return cloudinary.uploader.destroy(publicId)
}

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary }
