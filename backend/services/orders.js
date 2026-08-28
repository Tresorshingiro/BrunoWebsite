/**
 * Everything that decides whether an order has actually been paid for.
 *
 * The order is written as `pending` before the customer ever reaches a payment
 * form, so `order.totalAmount` here is server-computed and untouchable by the
 * client. That is what makes this comparison meaningful — the previous Stripe
 * integration took `items` and `total` straight from the request body and never
 * compared them to anything.
 */

const { sendOrderConfirmation } = require('./orderEmail')

const PAYMENT_TYPE_MAP = {
    mobilemoneyrw: 'momo',
    mobilemoney: 'momo',
    card: 'card',
    banktransfer: 'bank',
    account: 'bank',
}

/** Throws unless the transaction genuinely settles this order. */
function assertPaymentMatches(order, flw) {
    if (flw.status !== 'successful') {
        throw new Error(`Payment status is "${flw.status}", not successful`)
    }
    if (flw.currency !== 'RWF') {
        throw new Error(`Payment currency is "${flw.currency}", expected RWF`)
    }
    if (flw.tx_ref !== order.txRef) {
        throw new Error('Payment reference does not match this order')
    }
    // Number(undefined) is NaN, and NaN < x is false — so an absent or
    // non-numeric amount would sail past a bare `<` comparison and settle the
    // order without the amount ever being checked. Reject it explicitly first.
    const paid = Number(flw.amount)
    const owed = Number(order.totalAmount)
    if (!Number.isFinite(paid)) {
        throw new Error(`Payment amount is not a number: ${flw.amount}`)
    }
    if (!Number.isFinite(owed)) {
        throw new Error(`Order total is not a number: ${order.totalAmount}`)
    }
    if (paid < owed) {
        throw new Error(
            `Payment amount ${flw.amount} is below the order total ${order.totalAmount}`
        )
    }
}

/**
 * Idempotent. The webhook and the browser callback routinely both arrive;
 * whichever is second must be a no-op rather than a duplicate history entry.
 */
async function markOrderPaid(order, flw) {
    if (order.status !== 'pending') return order

    assertPaymentMatches(order, flw)

    order.status = 'paid'
    order.flwTransactionId = String(flw.id)
    order.paymentMethod = PAYMENT_TYPE_MAP[flw.payment_type] || order.paymentMethod
    order.statusHistory.push({ status: 'paid', at: new Date() })

    try {
        await order.save()
    } catch (err) {
        // Lost the race with the other settlement path. If the order is already
        // paid, the payment succeeded — that is success for this caller too, not
        // an error to hand back to a customer who has paid.
        const Order = require('../models/Order')
        const fresh = await Order.findById(order._id)
        if (fresh && fresh.status === 'paid') return fresh
        throw err
    }

    // Fire and forget — a mail failure must not fail a paid order.
    sendOrderConfirmation(order).catch(() => {})

    return order
}

module.exports = { assertPaymentMatches, markOrderPaid, PAYMENT_TYPE_MAP }
