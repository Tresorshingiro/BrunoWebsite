/**
 * The single place an order total is ever produced.
 *
 * RWF has no minor unit and Flutterwave takes whole numbers, so amounts here
 * are plain integers — never multiply by 100. (The previous Stripe integration
 * did, in USD, which charged roughly 1,400x.)
 *
 * Twin: frontend/src/lib/orders.js holds the same DELIVERY_FEE so the cart can
 * show a total before checkout. That copy is a display estimate only — this
 * file is authoritative and the server recomputes on every initiate.
 */

const DELIVERY_FEE = 2000 // RWF, flat, anywhere in Rwanda
const DELIVERY_METHODS = ['standard', 'collect']

function computeTotals(items, deliveryMethod) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Cannot price an empty basket')
    }

    let subtotal = 0
    for (const item of items) {
        const price = Number(item.price)
        const quantity = Number(item.quantity)
        if (!Number.isInteger(price) || price <= 0) {
            throw new Error(`Invalid price: ${item.price}`)
        }
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error(`Invalid quantity: ${item.quantity}`)
        }
        subtotal += price * quantity
    }

    // Anything that is not an explicit 'collect' pays the fee. An unrecognised
    // method must never be the cheap path.
    const deliveryFee = deliveryMethod === 'collect' ? 0 : DELIVERY_FEE

    // Provably a no-op given the integer guards above — kept as a floor in case
    // that validation is ever loosened.
    const rounded = Math.round(subtotal)

    return {
        subtotal: rounded,
        deliveryFee,
        total: rounded + deliveryFee,
    }
}

module.exports = { DELIVERY_FEE, DELIVERY_METHODS, computeTotals }
