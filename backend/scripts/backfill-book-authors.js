/**
 * One-off backfill: credit each existing book to its real author.
 *
 * The `author` field was added to the Book model on 2026-08-26. Records
 * created before that have no value, and the Books page uses authorship —
 * not the `featured` flag — to decide which title is Bruno's own. Until this
 * runs, Bruno's memoir is not recognised as his.
 *
 * Also moves `featured` onto Bruno's title, which is where it belongs: it had
 * been set on a Vitalreadings book by another author.
 *
 * Safe to run more than once. Prints before/after so it can be reversed.
 *
 *   cd backend && node scripts/backfill-book-authors.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')

const UPDATES = [
    { match: /^my forgiveness story$/i, author: 'Bruno Iradukunda', featured: true },
    { match: /^economics at the cross$/i, author: 'Emmanuel Murangira', featured: false },
]

const line = (b) => `  ${b.title} | author=${JSON.stringify(b.author)} featured=${b.featured}`

async function main() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not set in backend/.env')
    }

    await mongoose.connect(process.env.MONGO_URI)
    const books = mongoose.connection.collection('books')

    const before = await books.find({}).toArray()
    console.log('BEFORE:')
    before.forEach((b) => console.log(line(b)))

    let changed = 0
    for (const doc of before) {
        const rule = UPDATES.find((u) => u.match.test((doc.title || '').trim()))
        if (!rule) {
            console.log(`\n  ! no rule for "${doc.title}" — left untouched`)
            continue
        }
        await books.updateOne(
            { _id: doc._id },
            { $set: { author: rule.author, featured: rule.featured } }
        )
        changed++
    }

    const after = await books.find({}).toArray()
    console.log('\nAFTER:')
    after.forEach((b) => console.log(line(b)))
    console.log(`\n${changed} record(s) updated.`)

    await mongoose.disconnect()
}

main().catch((err) => {
    console.error('FAILED:', err.message)
    process.exit(1)
})
