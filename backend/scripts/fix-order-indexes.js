/**
 * One-off migration: retire the Stripe-era index on `orders` and let the
 * Flutterwave-era `txRef` unique index finally build.
 *
 * Two separate faults, one cause — a `unique` index that is NOT `sparse`
 * indexes a missing field as `null`, so it permits exactly one document
 * lacking that field:
 *
 *   1. `stripePaymentIntentId_1` (unique, non-sparse) survived the migration
 *      even though the field is gone from models/Order.js. Every Flutterwave
 *      order therefore indexes as null. The first one inserted fine and took
 *      the null slot; every order after it died with
 *      "E11000 duplicate key ... stripePaymentIntentId: null" at /initiate.
 *
 *   2. `txRef_1` (unique, declared in the schema) was never actually created,
 *      because the three Stripe-era orders carry no `txRef` — three nulls, so
 *      the build fails. Mongoose's autoIndex reports that failure through the
 *      model's 'index' event, which nothing listens to, so it failed silently.
 *      Until this runs there is NO uniqueness on txRef, the key that both
 *      /verify and the webhook use to find the order they are settling.
 *
 * Legacy orders are backfilled rather than deleted: two of them are genuinely
 * shipped and delivered. `LEGACY-<stripe payment intent id>` is unique by
 * construction and keeps the record of what actually paid for them.
 *
 * Safe to run more than once — every step checks its own state first, and
 * prints before/after.
 *
 *   cd backend && node scripts/fix-order-indexes.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')

const STALE_INDEX = 'stripePaymentIntentId_1'

const show = (list) =>
    list.map((i) => `  ${i.name} key=${JSON.stringify(i.key)} unique=${Boolean(i.unique)} sparse=${Boolean(i.sparse)}`).join('\n')

async function main() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not set in backend/.env')
    }

    await mongoose.connect(process.env.MONGO_URI)
    const orders = mongoose.connection.db.collection('orders')

    console.log('BEFORE — indexes on orders:')
    console.log(show(await orders.indexes()))

    /* 1. Backfill txRef on the pre-Flutterwave orders. Done first: the unique
       index in step 3 cannot build while these nulls exist. */
    const legacy = await orders.find({ txRef: { $exists: false } }).toArray()
    console.log(`\nOrders without txRef: ${legacy.length}`)

    for (const doc of legacy) {
        // Fall back to the _id when there is no payment intent to name, so the
        // value is unique either way and the index can still build.
        const txRef = doc.stripePaymentIntentId
            ? `LEGACY-${doc.stripePaymentIntentId}`
            : `LEGACY-${doc._id}`
        await orders.updateOne({ _id: doc._id }, { $set: { txRef } })
        console.log(`  ${doc._id} (${doc.status}) -> txRef=${txRef}`)
    }

    /* 2. Drop the stale Stripe index. The field is gone from the schema, so
       nothing reads or writes it and the index protects nothing. */
    const names = (await orders.indexes()).map((i) => i.name)
    if (names.includes(STALE_INDEX)) {
        await orders.dropIndex(STALE_INDEX)
        console.log(`\nDropped ${STALE_INDEX}`)
    } else {
        console.log(`\n${STALE_INDEX} already absent — nothing to drop`)
    }

    /* 3. Build the index the schema has been asking for all along. Non-sparse
       is correct here: txRef is `required` on the model, so every order that
       can be created from now on has one. */
    await orders.createIndex({ txRef: 1 }, { unique: true, name: 'txRef_1' })
    console.log('Ensured txRef_1 (unique)')

    console.log('\nAFTER — indexes on orders:')
    console.log(show(await orders.indexes()))

    const missing = await orders.countDocuments({ txRef: { $exists: false } })
    console.log(`\nOrders still without txRef: ${missing} (expected 0)`)

    await mongoose.disconnect()
}

main().catch((err) => {
    console.error('FAILED:', err.message)
    process.exit(1)
})
