const Book = require('../models/Book')
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload')

// GET all books
const getBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 })
        res.json(books)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET featured book
const getFeaturedBook = async (req, res) => {
    try {
        const book = await Book.findOne({ featured: true })
        if (!book) return res.status(404).json({ message: 'No featured book found' })
        res.json(book)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET single book
const getBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        if (!book) return res.status(404).json({ message: 'Book not found' })
        res.json(book)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST create book (admin only)
const createBook = async (req, res) => {
    try {
        let coverImage = ''
        let coverImagePublicId = ''

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'bruno-website/books')
            coverImage = result.secure_url
            coverImagePublicId = result.public_id
        }

        const bookData = {
            ...req.body,
            coverImage,
            coverImagePublicId,
            buyLinks: req.body.buyLinks ? JSON.parse(req.body.buyLinks) : [],
            chapters: req.body.chapters ? JSON.parse(req.body.chapters) : [],
        }
        if (typeof bookData.availableFormats === 'string') {
            try { bookData.availableFormats = JSON.parse(bookData.availableFormats) } catch (_) {}
        }
        if (bookData.publishedDate && typeof bookData.publishedDate === 'string') {
            bookData.publishedDate = new Date(bookData.publishedDate)
        }

        const book = new Book(bookData)
        await book.save()
        res.status(201).json(book)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// PUT update book (admin only)
const updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        if (!book) return res.status(404).json({ message: 'Book not found' })

        let coverImage = book.coverImage
        let coverImagePublicId = book.coverImagePublicId

        if (req.file) {
            if (book.coverImagePublicId) {
                await deleteFromCloudinary(book.coverImagePublicId)
            }
            const result = await uploadToCloudinary(req.file.buffer, 'bruno-website/books')
            coverImage = result.secure_url
            coverImagePublicId = result.public_id
        }

        const updates = {
            ...req.body,
            coverImage,
            coverImagePublicId,
            buyLinks: req.body.buyLinks ? JSON.parse(req.body.buyLinks) : book.buyLinks,
            chapters: req.body.chapters ? JSON.parse(req.body.chapters) : book.chapters,
        }
        if (typeof updates.availableFormats === 'string') {
            try { updates.availableFormats = JSON.parse(updates.availableFormats) } catch (_) {}
        }
        if (updates.publishedDate && typeof updates.publishedDate === 'string') {
            updates.publishedDate = new Date(updates.publishedDate)
        }

        const updatedBook = await Book.findByIdAndUpdate(req.params.id, updates, { new: true })
        res.json(updatedBook)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// DELETE book (admin only)
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        if (!book) return res.status(404).json({ message: 'Book not found' })

        if (book.coverImagePublicId) {
            await deleteFromCloudinary(book.coverImagePublicId)
        }

        await Book.findByIdAndDelete(req.params.id)
        res.json({ message: 'Book deleted successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { getBooks, getFeaturedBook, getBook, createBook, updateBook, deleteBook }
