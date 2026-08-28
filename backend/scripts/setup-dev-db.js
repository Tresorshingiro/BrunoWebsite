/**
 * Create an isolated local database so development stops sharing state with
 * production.
 *
 * Why this exists: backend/.env and the deployed Render service both point at
 * the same Atlas cluster. The last commit still carries the Stripe-era Order
 * model, where `stripePaymentIntentId` is declared unique. Mongoose's
 * autoIndex (on by default) rebuilds every schema-declared index whenever a
 * model initialises, so each time the Render free tier cold-starts it
 * recreates `stripePaymentIntentId_1` on the shared database. That index is
 * unique and NOT sparse, so it treats every Flutterwave order — which has no
 * such field — as null, permits exactly one, and fails the rest with
 * "E11000 ... dup key: { stripePaymentIntentId: null }" at /initiate.
 *
 * Dropping the index locally does not hold: the next Render wake puts it back.
 * Pointing local development at its own database removes the shared surface
 * entirely, and is the right separation regardless of this bug.
 *
 * Copies the collections a checkout test needs. Reads production, never writes
 * to it. Orders are deliberately not copied — a clean slate is the point.
 *
 * Safe to re-run: each copied collection is replaced wholesale.
 *
 *   cd backend && node scripts/setup-dev-db.js
 *
 * Then change the tail of MONGO_URI in backend/.env from /Bruno to /Bruno_dev.
 * To go back to production, change it back — nothing else needs touching.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')

const COPY = ['books', 'users', 'admins']

async function main() {
    const uri = process.env.MONGO_URI
    if (!uri) throw new Error('MONGO_URI is not set in backend/.env')

    const devUri = uri.replace(/\/Bruno(\?|$)/, '/Bruno_dev$1')
    if (devUri === uri) {
        throw new Error('MONGO_URI does not end in /Bruno — set the dev target by hand')
    }

    const src = await mongoose.createConnection(uri).asPromise()
    const dst = await mongoose.createConnection(devUri).asPromise()
    console.log(`source: ${src.db.databaseName}  ->  target: ${dst.db.databaseName}`)

    for (const name of COPY) {
        const docs = await src.db.collection(name).find({}).toArray()
        await dst.db.collection(name).deleteMany({})
        if (docs.length) await dst.db.collection(name).insertMany(docs)
        console.log(`  ${name}: copied ${docs.length}`)
    }

    /* Start clean, with the index the current schema actually wants and none
       of the Stripe legacy. Non-sparse unique is correct: txRef is `required`
       on the model, so every order that can be created has one. */
    await dst.db.collection('orders').deleteMany({})
    await dst.db.collection('orders').createIndex({ txRef: 1 }, { unique: true })
    await dst.db.collection('orders').createIndex({ userId: 1 })
    console.log('  orders: emptied, txRef_1 (unique) + userId_1 created')

    console.log('\nProduction untouched — orders still present:',
        await src.db.collection('orders').countDocuments())
    console.log('\nNext: set MONGO_URI in backend/.env to end in /Bruno_dev, then restart the server.')

    await src.close()
    await dst.close()
}

main().catch((err) => {
    console.error('FAILED:', err.message)
    process.exit(1)
})
