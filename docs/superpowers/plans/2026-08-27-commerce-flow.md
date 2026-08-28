# Commerce Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate payments from Stripe to Flutterwave v3 and rebuild the five commerce pages (Cart, Checkout, Order Success, Orders, plus new Order Detail and Profile) from the 2026-08-27 mockups.

**Architecture:** The order is written to MongoDB as `pending` *before* payment, so verification has a server-computed total to compare against. Flutterwave's browser callback and its webhook both converge on one idempotent `markOrderPaid`. The frontend keeps the mockup's payment tiles and opens Flutterwave's inline modal scoped to the chosen method, so card data never touches our code.

**Tech Stack:** Express 5 · Mongoose 9 · `flutterwave-node-v3` · React 18 · Vite 5 · Tailwind 3 · `flutterwave-react-v3` · Vitest

**Spec:** `docs/superpowers/specs/2026-08-27-commerce-flow-design.md`

## Global Constraints

- **Currency is RWF, sent to Flutterwave as whole numbers.** Never multiply by 100. `amount: 20000` means 20,000 RWF.
- **Delivery fee is `2000` RWF flat anywhere in Rwanda; `0` for collection.** Only these two methods exist.
- **The server never trusts a client-supplied price, subtotal, fee or total.** Every amount is recomputed from the database in `initiate`.
- **Fonts stay Cormorant Garamond (`font-serif`) + Source Sans 3 (`font-sans`).** The mockups' Fraunces/Newsreader/Archivo is not adopted — take layout and motion from them, never typography.
- **Palette tokens only** — `brand-*`, `ink-*`, plus the new `sky`. Never raw hex in JSX.
- **`brand-500` is 3.49:1 on white** — decorative and dark-ground use only, never body text on a light background.
- **Radii:** buttons `rounded-edge` (2px), cards `rounded-card` (3px).
- **Everything is physical.** No digital format is offered; delivery always applies.
- **Reduced motion:** every animation sits behind the top-level `prefers-reduced-motion` guard in `index.css`.
- **Commits are the user's to run.** Per the project's standing rule, do not run `git commit` or `git push`. Each task's final step prints the command for the user; stop there and let them run it.

## Migration note — the old Stripe flow breaks at Task 2, deliberately

Task 2 removes `stripePaymentIntentId` from the Order model, which stops the
existing Stripe checkout from working. This is intended. That flow creates
PaymentIntents in **USD** from **RWF** prices — a 20,000 RWF book charges
$20,000, roughly 1,400× the intended amount. It must not be used, and the orders
collection is empty, so there is nothing to preserve.

## File structure

```
backend/
  config/delivery.js            NEW  DELIVERY_FEE, computeTotals — the only place a total is produced
  services/flutterwave.js       NEW  SDK wrapper: genTxRef, verifyTransaction
  services/orders.js            NEW  markOrderPaid — the verification guard, idempotent
  services/orderEmail.js        NEW  SendGrid HTTP confirmation mail
  models/Order.js               MOD  RW address, delivery, statusHistory, txRef
  models/User.js                MOD  RW address shape
  controllers/paymentController.js  MOD  initiate / verify / webhook
  controllers/userController.js MOD  getOrder (single, scoped to req.user.id)
  routes/payment.js             MOD
  routes/users.js               MOD

frontend/src/
  lib/orders.js                 NEW  formatters, DELIVERY_FEE, status maps
  lib/rwanda.js                 NEW  5 provinces → 30 districts
  components/order/             NEW  OrderItems, OrderTimeline, OrderFacts, OrderRef, StatusPill
  pages/Cart|Checkout|OrderSuccess|Orders.jsx   MOD  rebuild
  pages/OrderDetail.jsx         NEW
  pages/Profile.jsx             NEW
```

**Markup source of truth:** the four mockups in `~/Downloads/`. Where a step
says "port from `bruno-cart.html:88-120`", open that file and translate its CSS
to the equivalent Tailwind token. The mockups are exact; do not invent markup.

---

## Task 1: Delivery pricing + backend test harness

The money math, first, with tests. Every later amount flows through this.

**Files:**
- Create: `backend/config/delivery.js`
- Create: `backend/config/delivery.test.mjs`
- Modify: `backend/package.json`

**Interfaces:**
- Consumes: nothing
- Produces: `DELIVERY_FEE: number` (2000), `DELIVERY_METHODS: string[]`, `computeTotals(items, deliveryMethod) -> { subtotal, deliveryFee, total }` where `items` is `Array<{ price: number, quantity: number }>`

> **Why `.test.mjs`:** the backend is CommonJS (no `"type": "module"`). Naming
> test files `.mjs` makes them unambiguously ESM so they can `import` the CJS
> module under test, without changing how the Express app loads.

- [ ] **Step 1: Install Vitest**

```bash
cd backend && npm install --save-dev vitest
```

- [ ] **Step 2: Add the test script**

In `backend/package.json`, replace the placeholder `test` script:

```json
"scripts": {
  "start": "node server.js",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Write the failing test**

Create `backend/config/delivery.test.mjs`:

```js
import { describe, it, expect } from 'vitest'
import delivery from './delivery.js'

const { DELIVERY_FEE, computeTotals } = delivery

describe('computeTotals', () => {
  it('charges the flat fee for standard delivery', () => {
    const r = computeTotals([{ price: 20000, quantity: 2 }], 'standard')
    expect(r).toEqual({ subtotal: 40000, deliveryFee: 2000, total: 42000 })
  })

  it('charges nothing for collection', () => {
    const r = computeTotals([{ price: 20000, quantity: 2 }], 'collect')
    expect(r).toEqual({ subtotal: 40000, deliveryFee: 0, total: 40000 })
  })

  it('sums multiple line items', () => {
    const r = computeTotals(
      [{ price: 20000, quantity: 1 }, { price: 15000, quantity: 3 }],
      'standard'
    )
    expect(r.subtotal).toBe(65000)
    expect(r.total).toBe(67000)
  })

  it('defaults an unknown method to standard rather than free', () => {
    // A typo or a tampered payload must never silently zero the fee.
    expect(computeTotals([{ price: 1000, quantity: 1 }], 'nonsense').deliveryFee)
      .toBe(DELIVERY_FEE)
  })

  it('rejects an empty basket', () => {
    expect(() => computeTotals([], 'standard')).toThrow(/empty/i)
  })

  it('rejects a non-positive price', () => {
    expect(() => computeTotals([{ price: 0, quantity: 1 }], 'standard'))
      .toThrow(/price/i)
  })

  it('rejects a non-positive quantity', () => {
    expect(() => computeTotals([{ price: 100, quantity: 0 }], 'standard'))
      .toThrow(/quantity/i)
  })

  it('never produces a fractional amount', () => {
    // RWF has no minor unit; Flutterwave takes whole numbers.
    const r = computeTotals([{ price: 333, quantity: 3 }], 'standard')
    expect(Number.isInteger(r.total)).toBe(true)
  })
})
```

- [ ] **Step 4: Run it and watch it fail**

Run: `cd backend && npm test`
Expected: FAIL — `Cannot find module './delivery.js'`

- [ ] **Step 5: Implement**

Create `backend/config/delivery.js`:

```js
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
        if (!Number.isFinite(price) || price <= 0) {
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

    return {
        subtotal: Math.round(subtotal),
        deliveryFee,
        total: Math.round(subtotal) + deliveryFee,
    }
}

module.exports = { DELIVERY_FEE, DELIVERY_METHODS, computeTotals }
```

- [ ] **Step 6: Run the tests**

Run: `cd backend && npm test`
Expected: PASS — 8 tests

- [ ] **Step 7: Hand the commit to the user**

```bash
git add backend/config/delivery.js backend/config/delivery.test.mjs backend/package.json backend/package-lock.json
git commit -m "feat(backend): delivery pricing + vitest harness"
```

---

## Task 2: Order and User models

**Files:**
- Modify: `backend/models/Order.js`
- Modify: `backend/models/User.js`

**Interfaces:**
- Consumes: nothing
- Produces: `Order` with `txRef, flwTransactionId, paymentMethod, customerPhone, subtotal, deliveryFee, totalAmount, deliveryMethod, signed, notes, shippingAddress{province,district,sector,street}, statusHistory[{status,at,note}]`; `User.address` in the same four-field shape

- [ ] **Step 1: Rewrite the Order schema**

Replace the body of `backend/models/Order.js`:

```js
const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    title: { type: String, required: true },
    coverImage: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    format: { type: String, enum: ['physical', 'digital'], default: 'physical' },
})

/* Rwandan addresses have no State and no ZIP. Asking for them produced the
   empty fields that rendered as "Gikondo, Kigali, , Rwanda". */
const addressSchema = new mongoose.Schema({
    province: { type: String, trim: true },
    district: { type: String, trim: true },
    sector: { type: String, trim: true },
    street: { type: String, trim: true },
}, { _id: false })

/* One entry per status change. This is what lets the customer-facing timeline
   print a real date instead of guessing — createdAt/updatedAt alone cannot say
   when an order shipped. */
const statusEventSchema = new mongoose.Schema({
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    note: { type: String, trim: true },
}, { _id: false })

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    // The courier calls before delivering, so this is not optional.
    customerPhone: { type: String, required: true, trim: true },

    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    deliveryMethod: { type: String, enum: ['standard', 'collect'], default: 'standard' },
    shippingAddress: { type: addressSchema, default: () => ({}) },
    signed: { type: Boolean, default: false },
    notes: { type: String, trim: true },

    // Flutterwave. txRef is ours and generated before payment; flwTransactionId
    // comes back from them on verification.
    txRef: { type: String, required: true, unique: true, index: true },
    flwTransactionId: { type: String },
    paymentMethod: { type: String, enum: ['momo', 'airtel', 'card', 'bank'] },

    status: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
    },
    statusHistory: { type: [statusEventSchema], default: [] },
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
```

> `stripePaymentIntentId` is **removed**, not deprecated. The orders collection
> is empty, so there is nothing to migrate.

- [ ] **Step 2: Match User.address to the same shape**

In `backend/models/User.js`, replace the `address` block:

```js
    address: {
        province: { type: String, trim: true },
        district: { type: String, trim: true },
        sector: { type: String, trim: true },
        street: { type: String, trim: true },
    },
```

- [ ] **Step 3: Verify the schemas load**

Run: `cd backend && node -e "require('./models/Order'); require('./models/User'); console.log('schemas ok')"`
Expected: `schemas ok`

- [ ] **Step 4: Hand the commit to the user**

```bash
git add backend/models/Order.js backend/models/User.js
git commit -m "feat(backend): RW address, delivery + statusHistory on Order"
```

---

## Task 3: Flutterwave service and the verification guard

The security-critical task. These tests are the ones that matter most in the
whole plan.

**Files:**
- Create: `backend/services/flutterwave.js`
- Create: `backend/services/orders.js`
- Create: `backend/services/orders.test.mjs`
- Modify: `backend/package.json`

**Interfaces:**
- Consumes: `Order` model (Task 2)
- Produces:
  - `flutterwave.genTxRef() -> string`
  - `flutterwave.verifyTransaction(transactionId) -> Promise<{ status, currency, amount, tx_ref, id, payment_type }>`
  - `orders.assertPaymentMatches(order, flwData) -> void` (throws on mismatch)
  - `orders.markOrderPaid(order, flwData) -> Promise<Order>` (idempotent)

- [ ] **Step 1: Install the SDK**

```bash
cd backend && npm install flutterwave-node-v3
```

- [ ] **Step 2: Write the SDK wrapper**

Create `backend/services/flutterwave.js`:

```js
const Flutterwave = require('flutterwave-node-v3')

const flw = new Flutterwave(
    process.env.FLW_PUBLIC_KEY,
    process.env.FLW_SECRET_KEY
)

/** Our own reference, generated before payment so verification has an anchor. */
function genTxRef() {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
    return `BRUNO-${Date.now()}-${rand}`
}

/**
 * Ask Flutterwave what actually happened. Returns their `data` object.
 * Throws if the call fails or returns no data — callers must treat any throw
 * as "not paid".
 */
async function verifyTransaction(transactionId) {
    const res = await flw.Transaction.verify({ id: String(transactionId) })
    if (!res || !res.data) {
        throw new Error('Flutterwave returned no transaction data')
    }
    return res.data
}

module.exports = { flw, genTxRef, verifyTransaction }
```

- [ ] **Step 3: Write the failing test for the guard**

Create `backend/services/orders.test.mjs`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ordersModule from './orders.js'

const { assertPaymentMatches, markOrderPaid } = ordersModule

const goodOrder = () => ({
  txRef: 'BRUNO-123-ABCDEF',
  totalAmount: 42000,
  status: 'pending',
  statusHistory: [],
  save: vi.fn().mockResolvedValue(undefined),
})

const goodFlw = () => ({
  status: 'successful',
  currency: 'RWF',
  amount: 42000,
  tx_ref: 'BRUNO-123-ABCDEF',
  id: 987654,
  payment_type: 'mobilemoneyrw',
})

describe('assertPaymentMatches', () => {
  it('passes when everything lines up', () => {
    expect(() => assertPaymentMatches(goodOrder(), goodFlw())).not.toThrow()
  })

  it('rejects a transaction that did not succeed', () => {
    expect(() => assertPaymentMatches(goodOrder(), { ...goodFlw(), status: 'failed' }))
      .toThrow(/status/i)
  })

  it('rejects a different currency', () => {
    // Guards against an account misconfigured to present USD.
    expect(() => assertPaymentMatches(goodOrder(), { ...goodFlw(), currency: 'USD' }))
      .toThrow(/currency/i)
  })

  it('rejects a mismatched tx_ref', () => {
    expect(() => assertPaymentMatches(goodOrder(), { ...goodFlw(), tx_ref: 'BRUNO-999-ZZZZZZ' }))
      .toThrow(/reference/i)
  })

  it('rejects an underpayment', () => {
    // The whole point: paying 100 must never settle a 42,000 order.
    expect(() => assertPaymentMatches(goodOrder(), { ...goodFlw(), amount: 100 }))
      .toThrow(/amount/i)
  })

  it('accepts an overpayment', () => {
    expect(() => assertPaymentMatches(goodOrder(), { ...goodFlw(), amount: 50000 }))
      .not.toThrow()
  })
})

describe('markOrderPaid', () => {
  let order
  beforeEach(() => { order = goodOrder() })

  it('marks a pending order paid and records history', async () => {
    await markOrderPaid(order, goodFlw())
    expect(order.status).toBe('paid')
    expect(order.flwTransactionId).toBe('987654')
    expect(order.statusHistory).toHaveLength(1)
    expect(order.statusHistory[0].status).toBe('paid')
    expect(order.save).toHaveBeenCalledOnce()
  })

  it('is idempotent — the webhook and the browser callback both arrive', async () => {
    await markOrderPaid(order, goodFlw())
    order.save.mockClear()
    await markOrderPaid(order, goodFlw())
    expect(order.status).toBe('paid')
    expect(order.statusHistory).toHaveLength(1)
    expect(order.save).not.toHaveBeenCalled()
  })

  it('leaves the order pending when verification fails', async () => {
    await expect(markOrderPaid(order, { ...goodFlw(), amount: 1 })).rejects.toThrow(/amount/i)
    expect(order.status).toBe('pending')
    expect(order.save).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 4: Run it and watch it fail**

Run: `cd backend && npm test`
Expected: FAIL — `Cannot find module './orders.js'`

- [ ] **Step 5: Implement the guard**

Create `backend/services/orders.js`:

```js
/**
 * Everything that decides whether an order has actually been paid for.
 *
 * The order is written as `pending` before the customer ever reaches a payment
 * form, so `order.totalAmount` here is server-computed and untouchable by the
 * client. That is what makes this comparison meaningful — the previous Stripe
 * integration took `items` and `total` straight from the request body and never
 * compared them to anything.
 */

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
    if (Number(flw.amount) < Number(order.totalAmount)) {
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

    await order.save()
    return order
}

module.exports = { assertPaymentMatches, markOrderPaid, PAYMENT_TYPE_MAP }
```

- [ ] **Step 6: Run the tests**

Run: `cd backend && npm test`
Expected: PASS — 17 tests total (8 from Task 1, 9 here)

- [ ] **Step 7: Hand the commit to the user**

```bash
git add backend/services/ backend/package.json backend/package-lock.json
git commit -m "feat(backend): Flutterwave service + payment verification guard"
```

---

## Task 4: `POST /api/payment/initiate`

**Files:**
- Modify: `backend/controllers/paymentController.js`
- Modify: `backend/routes/payment.js`

**Interfaces:**
- Consumes: `computeTotals` (Task 1), `Order` (Task 2), `genTxRef` (Task 3)
- Produces: `POST /api/payment/initiate` returning `{ orderId, txRef, amount, publicKey, customer: { name, email, phone_number }, summary: { items, subtotal, deliveryFee, total } }`

- [ ] **Step 1: Replace `createPaymentIntent` with `initiate`**

In `backend/controllers/paymentController.js`, replace the Stripe require and
`createPaymentIntent` with:

```js
const Order = require('../models/Order')
const Book = require('../models/Book')
const { computeTotals, DELIVERY_METHODS } = require('../config/delivery')
const { genTxRef, verifyTransaction } = require('../services/flutterwave')
const { markOrderPaid } = require('../services/orders')

// POST /api/payment/initiate
const initiate = async (req, res) => {
    try {
        const {
            items, customerName, customerEmail, customerPhone,
            deliveryMethod = 'standard', shippingAddress = {}, signed = false, notes = '',
        } = req.body

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items provided' })
        }
        if (!customerName?.trim() || !customerEmail?.trim() || !customerPhone?.trim()) {
            return res.status(400).json({ message: 'Name, email and phone are required' })
        }
        if (!DELIVERY_METHODS.includes(deliveryMethod)) {
            return res.status(400).json({ message: 'Invalid delivery method' })
        }
        // Collection needs no address; standard delivery does.
        if (deliveryMethod === 'standard') {
            const { province, district, sector, street } = shippingAddress
            if (!province || !district || !sector || !street) {
                return res.status(400).json({ message: 'A full delivery address is required' })
            }
        }

        // Re-price everything from the database. Client prices are never read.
        const orderItems = []
        for (const item of items) {
            const book = await Book.findById(item.bookId)
            if (!book) {
                return res.status(404).json({ message: `Book not found: ${item.bookId}` })
            }
            if (!book.inStock) {
                return res.status(400).json({ message: `"${book.title}" is out of stock` })
            }
            if (!book.price || book.price <= 0) {
                return res.status(400).json({ message: `"${book.title}" is not available for purchase` })
            }
            orderItems.push({
                bookId: book._id,
                title: book.title,
                coverImage: book.coverImage,
                price: book.price,
                quantity: Math.max(1, parseInt(item.quantity) || 1),
                format: 'physical',
            })
        }

        const { subtotal, deliveryFee, total } = computeTotals(orderItems, deliveryMethod)
        const txRef = genTxRef()

        // Written before payment, so verification has a total it can trust.
        const order = await Order.create({
            userId: req.user?.id,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            customerPhone: customerPhone.trim(),
            items: orderItems,
            subtotal,
            deliveryFee,
            totalAmount: total,
            deliveryMethod,
            shippingAddress: deliveryMethod === 'collect' ? {} : shippingAddress,
            signed: Boolean(signed),
            notes,
            txRef,
            status: 'pending',
            statusHistory: [{ status: 'pending', at: new Date() }],
        })

        res.status(201).json({
            orderId: order._id,
            txRef,
            amount: total,
            publicKey: process.env.FLW_PUBLIC_KEY,
            customer: {
                name: order.customerName,
                email: order.customerEmail,
                phone_number: order.customerPhone,
            },
            summary: { items: orderItems, subtotal, deliveryFee, total },
        })
    } catch (err) {
        console.error('Initiate error:', err)
        res.status(500).json({ message: err.message })
    }
}
```

- [ ] **Step 2: Wire the route**

In `backend/routes/payment.js`, replace the create-intent line:

```js
router.post('/initiate', userAuthMiddleware, initiate)
```

and update the destructured import at the top to pull `initiate` instead of
`createPaymentIntent`. Leave the admin routes untouched.

- [ ] **Step 3: Verify the server still boots**

Run: `cd backend && node -e "require('./routes/payment'); console.log('routes ok')"`
Expected: `routes ok`

- [ ] **Step 4: Hand the commit to the user**

```bash
git add backend/controllers/paymentController.js backend/routes/payment.js
git commit -m "feat(backend): POST /api/payment/initiate — order created before payment"
```

---

## Task 5: `verify`, `webhook`, and route wiring

**Files:**
- Modify: `backend/controllers/paymentController.js`
- Modify: `backend/routes/payment.js`

**Interfaces:**
- Consumes: `verifyTransaction` (Task 3), `markOrderPaid` (Task 3), `Order` (Task 2)
- Produces: `POST /api/payment/verify` returning the Order; `POST /api/payment/webhook` returning `{ received: true }`

- [ ] **Step 1: Replace `confirmOrder` with `verify` and add `webhook`**

```js
// POST /api/payment/verify  — called when the browser returns from Flutterwave
const verify = async (req, res) => {
    try {
        const { txRef, transactionId } = req.body
        if (!txRef || !transactionId) {
            return res.status(400).json({ message: 'txRef and transactionId are required' })
        }

        const order = await Order.findOne({ txRef })
        if (!order) return res.status(404).json({ message: 'Order not found' })

        // Scope: a user may only verify their own order.
        if (order.userId && req.user?.id && String(order.userId) !== String(req.user.id)) {
            return res.status(404).json({ message: 'Order not found' })
        }

        if (order.status !== 'pending') return res.json(order)

        const flwData = await verifyTransaction(transactionId)
        await markOrderPaid(order, flwData)

        res.json(order)
    } catch (err) {
        console.error('Verify error:', err.message)
        // The order stays pending. Never report success on a failed check.
        res.status(400).json({ message: err.message })
    }
}

// POST /api/payment/webhook — Flutterwave's server-to-server notification.
// Public, but authenticated by the shared secret hash.
const webhook = async (req, res) => {
    const signature = req.headers['verif-hash']
    if (!signature || signature !== process.env.FLW_SECRET_HASH) {
        return res.status(401).json({ message: 'Invalid signature' })
    }

    // Acknowledge immediately — Flutterwave retries on a slow response.
    res.json({ received: true })

    try {
        const payload = req.body?.data || req.body
        const txRef = payload?.tx_ref
        const transactionId = payload?.id
        if (!txRef || !transactionId) return

        const order = await Order.findOne({ txRef })
        if (!order || order.status !== 'pending') return

        const flwData = await verifyTransaction(transactionId)
        await markOrderPaid(order, flwData)
        console.log('Webhook settled order', order._id.toString())
    } catch (err) {
        console.error('Webhook error:', err.message)
    }
}
```

Export `initiate, verify, webhook` alongside the existing admin handlers, and
delete `createPaymentIntent` and `confirmOrder`.

- [ ] **Step 2: Wire the routes**

`backend/routes/payment.js` — the user and webhook block:

```js
router.post('/initiate', userAuthMiddleware, initiate)
router.post('/verify', userAuthMiddleware, verify)
// No auth middleware: Flutterwave has no user token. Verified by verif-hash.
router.post('/webhook', webhook)
```

- [ ] **Step 3: Add statusHistory to the admin status update**

Still in `paymentController.js`, replace `updateOrderStatus` — without this the
customer-facing timeline is permanently empty:

```js
// PATCH /api/payment/orders/:id/status (admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body
        const order = await Order.findById(req.params.id)
        if (!order) return res.status(404).json({ message: 'Order not found' })

        if (order.status !== status) {
            order.status = status
            // The customer timeline reads this. Skipping it makes tracking decorative.
            order.statusHistory.push({ status, at: new Date(), note })
            await order.save()
        }
        res.json(order)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
```

- [ ] **Step 4: Verify it loads**

Run: `cd backend && node -e "require('./routes/payment'); console.log('routes ok')"`
Expected: `routes ok`

- [ ] **Step 5: Hand the commit to the user**

```bash
git add backend/controllers/paymentController.js backend/routes/payment.js
git commit -m "feat(backend): payment verify + webhook, statusHistory on admin status change"
```

---

## Task 6: `GET /api/users/orders/:id`

The endpoint Order Detail depends on. `GET /api/payment/orders/:id` exists but
is admin-only, so a customer currently has no way to fetch their own order.

**Files:**
- Modify: `backend/controllers/userController.js`
- Modify: `backend/routes/users.js`

**Interfaces:**
- Consumes: `Order` (Task 2)
- Produces: `GET /api/users/orders/:id` returning one Order, scoped to `req.user.id`

- [ ] **Step 1: Add the handler**

In `backend/controllers/userController.js`, after `getUserOrders`:

```js
// GET /api/users/orders/:id (protected) — one order, scoped to its owner
const getUserOrder = async (req, res) => {
    try {
        const Order = require('../models/Order')
        // userId is part of the query, not a check afterwards: another user's
        // order is indistinguishable from one that does not exist.
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user.id,
        }).lean()
        if (!order) return res.status(404).json({ message: 'Order not found' })
        res.json(order)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
```

Add `getUserOrder` to `module.exports`.

- [ ] **Step 2: Wire the route**

In `backend/routes/users.js`, add below the orders route and update the import:

```js
router.get('/orders/:id', userAuthMiddleware, getUserOrder)
```

- [ ] **Step 3: Verify it loads**

Run: `cd backend && node -e "require('./routes/users'); console.log('routes ok')"`
Expected: `routes ok`

- [ ] **Step 4: Hand the commit to the user**

```bash
git add backend/controllers/userController.js backend/routes/users.js
git commit -m "feat(backend): user-scoped single order endpoint"
```

---

## Task 7: Order confirmation email

The success page promises "a receipt is on its way to your email." Nothing
sends one today. Uses the SendGrid **HTTP API** like `contactController` — not
the SMTP path `subscriberController` uses, which Render blocks.

**Files:**
- Create: `backend/services/orderEmail.js`
- Modify: `backend/services/orders.js`

**Interfaces:**
- Consumes: `Order` (Task 2)
- Produces: `sendOrderConfirmation(order) -> Promise<void>` (never throws)

- [ ] **Step 1: Write the mailer**

Create `backend/services/orderEmail.js`:

```js
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const rwf = (n) => `${Number(n || 0).toLocaleString('en-US')} RWF`
const ref = (order) => `#${String(order._id).slice(-8).toUpperCase()}`

/** Filters empty parts so a missing field never produces a stray comma. */
const formatAddress = (a = {}) =>
    [a.street, a.sector, a.district, a.province].filter(Boolean).join(', ')

/**
 * Fire-and-forget. A failed email must never fail an order that has been paid
 * for, so this resolves even on error and only logs.
 */
async function sendOrderConfirmation(order) {
    try {
        if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
            console.warn('Order email skipped: SendGrid not configured')
            return
        }

        const rows = order.items.map((i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">
          ${i.title}<br><span style="color:#6b7280;font-size:12px;">Paperback · qty ${i.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;color:#111827;font-size:14px;white-space:nowrap;">
          ${rwf(i.price * i.quantity)}
        </td>
      </tr>`).join('')

        const delivery = order.deliveryMethod === 'collect'
            ? 'Collection in person'
            : `Delivery to ${formatAddress(order.shippingAddress)}`

        await sgMail.send({
            from: { name: 'Bruno Iradukunda', email: process.env.SENDGRID_FROM_EMAIL },
            to: order.customerEmail,
            subject: `Order confirmed — ${ref(order)}`,
            html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#17332C;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#F4F2EC;font-size:20px;">Your order is confirmed</h1>
          <p style="margin:6px 0 0;color:rgba(244,242,236,.7);font-size:13px;">Order ${ref(order)}</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr><td style="color:#6b7280;font-size:14px;padding:4px 0;">Subtotal</td>
                <td style="text-align:right;font-size:14px;">${rwf(order.subtotal)}</td></tr>
            <tr><td style="color:#6b7280;font-size:14px;padding:4px 0;">Delivery</td>
                <td style="text-align:right;font-size:14px;">${order.deliveryFee ? rwf(order.deliveryFee) : 'Free'}</td></tr>
            <tr><td style="font-weight:700;padding-top:10px;border-top:1px solid #e5e7eb;">Paid</td>
                <td style="text-align:right;font-weight:700;padding-top:10px;border-top:1px solid #e5e7eb;">${rwf(order.totalAmount)}</td></tr>
          </table>
          <p style="margin:24px 0 0;color:#6b7280;font-size:14px;line-height:1.7;">
            ${delivery}<br>We will call ${order.customerPhone} before delivering.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
        })
        console.log('Order email sent for', ref(order))
    } catch (err) {
        console.error('Order email failed:', err.message)
    }
}

module.exports = { sendOrderConfirmation, formatAddress }
```

- [ ] **Step 2: Call it from `markOrderPaid`**

In `backend/services/orders.js`, add the require at the top and the call just
before `return order`:

```js
const { sendOrderConfirmation } = require('./orderEmail')
```

```js
    await order.save()
    // Fire and forget — a mail failure must not fail a paid order.
    sendOrderConfirmation(order).catch(() => {})
    return order
```

- [ ] **Step 3: Re-run the suite**

The Task 3 tests mock `order.save` but not the mailer, so confirm nothing broke.

First add the mock to the top of `backend/services/orders.test.mjs`, below the
existing imports — `orderEmail.js` calls `sgMail.setApiKey()` at module load,
which throws when the key is absent:

```js
vi.mock('./orderEmail.js', () => ({ sendOrderConfirmation: vi.fn() }))
```

Run: `cd backend && npm test`
Expected: PASS — 17 tests

- [ ] **Step 4: Hand the commit to the user**

```bash
git add backend/services/orderEmail.js backend/services/orders.js
git commit -m "feat(backend): order confirmation email via SendGrid HTTP"
```

---

## Task 8: Environment and admin correctness pass

**Files:**
- Modify: `backend/.env.example`
- Modify: `frontend/.env.example`
- Modify: `frontend/src/admin/AdminOrders.jsx`

**Interfaces:**
- Consumes: `Order` (Task 2)
- Produces: nothing new

- [ ] **Step 1: Rewrite `backend/.env.example`**

```
# Database
# NOTE: server.js reads MONGO_URI — this file previously documented MONGODB_URI.
MONGO_URI=mongodb://localhost:27017/brunowebsite

JWT_SECRET=your_jwt_secret_key_here
CLIENT_ORIGIN=http://localhost:5173
PORT=5000

# Flutterwave (test keys shown; live keys are the same names)
FLW_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxx-X
FLW_SECRET_KEY=FLWSECK_TEST-xxxxxxxx-X
FLW_ENCRYPTION_KEY=FLWSECK_TESTxxxxxxxx
# Invent this, then paste the same value into the dashboard webhook config.
FLW_SECRET_HASH=some_long_random_string

# Cloudinary
CLOUDINARY_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET_KEY=

# Email
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
NOTIFY_EMAIL=
```

- [ ] **Step 2: Rewrite `frontend/.env.example`**

```
# API base URL
# Development: http://localhost:5000 · Production: https://brunobackend.onrender.com
VITE_API_URL=http://localhost:5000

# Flutterwave publishable key — same value as FLW_PUBLIC_KEY in the backend .env
VITE_FLW_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxx-X
```

- [ ] **Step 3: Update AdminOrders for the new shape**

In `frontend/src/admin/AdminOrders.jsx`:

1. Replace the shipping-address render with the four RW fields joined through a
   filter, matching `formatAddress`:
   `[a.street, a.sector, a.district, a.province].filter(Boolean).join(', ')`
2. Add a line showing `order.customerPhone` — fulfilment depends on it.
3. Show `order.deliveryMethod === 'collect' ? 'Collection' : 'Delivery'` and
   `order.deliveryFee`.
4. Show a "Signed copy requested" flag when `order.signed`.
5. Change the status labels to match the `statusLabel` map from Task 9 so admin
   and customer describe an order identically. (Task 9 lands after this one in
   file order but the map is fixed by the spec's §3.4 table — copy it from there:
   `paid`/`processing` -> Preparing, `shipped` -> On the way, `delivered` -> Delivered.)

- [ ] **Step 4: Verify the build**

Run: `cd frontend && npm run build`
Expected: build succeeds

- [ ] **Step 5: Hand the commit to the user**

```bash
git add backend/.env.example frontend/.env.example frontend/src/admin/AdminOrders.jsx
git commit -m "chore: Flutterwave env vars, MONGO_URI fix, admin order fields"
```

---

## Task 9: Frontend foundation — formatters, Rwanda data, tokens, API

**Files:**
- Create: `frontend/src/lib/orders.js`
- Create: `frontend/src/lib/orders.test.js`
- Create: `frontend/src/lib/rwanda.js`
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/lib/api.js`
- Modify: `frontend/package.json`, `frontend/vite.config.js`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `DELIVERY_FEE: 2000`, `formatRWF(n) -> string`, `formatAddress(addr) -> string`
  - `statusLabel(status) -> string`, `statusTone(status) -> 'neutral'|'amber'|'sky'|'moss'|'rose'`
  - `orderRef(order) -> string`, `isInProgress(order) -> boolean`, `TIMELINE_STAGES`
  - `stageDate(order, stage) -> Date | null`, `formatDate(d) -> string`
  - `PROVINCES: string[]`, `DISTRICTS: Record<string, string[]>`
  - `paymentApi.initiate(data)`, `paymentApi.verify(data)`, `ordersApi.getAll()`, `ordersApi.getById(id)`, `profileApi.update(data)`

- [ ] **Step 1: Install Vitest**

```bash
cd frontend && npm install --save-dev vitest
```

- [ ] **Step 2: Add the test script and config**

`frontend/package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

`frontend/vite.config.js` — add a `test` block beside `server`:

```js
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
```

- [ ] **Step 3: Write the failing test**

Create `frontend/src/lib/orders.test.js`:

```js
import { describe, it, expect } from 'vitest'
import {
  DELIVERY_FEE, formatRWF, formatAddress,
  statusLabel, statusTone, orderRef, isInProgress,
} from './orders'

describe('formatRWF', () => {
  it('groups thousands and appends the unit', () => {
    expect(formatRWF(42000)).toBe('42,000 RWF')
  })
  it('treats null and undefined as zero', () => {
    expect(formatRWF(null)).toBe('0 RWF')
    expect(formatRWF(undefined)).toBe('0 RWF')
  })
})

describe('formatAddress', () => {
  it('joins street, sector, district, province in that order', () => {
    expect(formatAddress({
      street: 'KK 15 Ave', sector: 'Gikondo',
      district: 'Kicukiro', province: 'Kigali City',
    })).toBe('KK 15 Ave, Gikondo, Kicukiro, Kigali City')
  })

  it('drops empty parts instead of leaving a stray comma', () => {
    // The old page rendered "Gikondo, Kigali, , Rwanda".
    expect(formatAddress({ sector: 'Gikondo', province: 'Kigali City' }))
      .toBe('Gikondo, Kigali City')
  })

  it('returns an empty string for an empty or missing address', () => {
    expect(formatAddress({})).toBe('')
    expect(formatAddress(undefined)).toBe('')
  })

  it('ignores whitespace-only fields', () => {
    expect(formatAddress({ street: '   ', sector: 'Gikondo' })).toBe('Gikondo')
  })
})

describe('statusLabel', () => {
  it('renames the enum for customers', () => {
    expect(statusLabel('paid')).toBe('Preparing')
    expect(statusLabel('processing')).toBe('Preparing')
    expect(statusLabel('shipped')).toBe('On the way')
    expect(statusLabel('delivered')).toBe('Delivered')
    expect(statusLabel('pending')).toBe('Awaiting payment')
  })
  it('falls back readably on an unknown status', () => {
    expect(statusLabel('weird')).toBe('Weird')
  })
})

describe('statusTone', () => {
  it('maps colour to meaning, not to status name', () => {
    // Previously Paid and Delivered were both green, so the badge said nothing.
    expect(statusTone('paid')).toBe('amber')
    expect(statusTone('shipped')).toBe('sky')
    expect(statusTone('delivered')).toBe('moss')
    expect(statusTone('cancelled')).toBe('rose')
  })
})

describe('orderRef', () => {
  it('is the last 8 characters of the id, uppercased', () => {
    expect(orderRef({ _id: '65f1a2b3c4d5e676ffba25' })).toBe('#76FFBA25')
  })
})

describe('isInProgress', () => {
  it('is true while the customer is waiting for something', () => {
    expect(isInProgress({ status: 'paid' })).toBe(true)
    expect(isInProgress({ status: 'processing' })).toBe(true)
    expect(isInProgress({ status: 'shipped' })).toBe(true)
  })
  it('excludes unpaid, finished and cancelled orders', () => {
    // An unpaid order is not "in progress" — no work is happening on it.
    expect(isInProgress({ status: 'pending' })).toBe(false)
    expect(isInProgress({ status: 'delivered' })).toBe(false)
    expect(isInProgress({ status: 'cancelled' })).toBe(false)
  })
})

describe('DELIVERY_FEE', () => {
  it('matches the backend constant', () => {
    expect(DELIVERY_FEE).toBe(2000)
  })
})
```

- [ ] **Step 4: Run it and watch it fail**

Run: `cd frontend && npm test`
Expected: FAIL — cannot resolve `./orders`

- [ ] **Step 5: Implement `lib/orders.js`**

```js
/* Order formatting and vocabulary, shared by the cart, checkout, the order
   pages and the admin panel — so every surface describes an order identically.

   DELIVERY_FEE is a twin of backend/config/delivery.js. This copy exists only
   so the cart can show a total before checkout; the server recomputes on every
   initiate and never reads a client number. */

export const DELIVERY_FEE = 2000

export const formatRWF = (n) => `${Number(n || 0).toLocaleString('en-US')} RWF`

/** Filters empty parts before joining, so a missing field never leaves a comma. */
export function formatAddress(addr) {
  if (!addr) return ''
  return [addr.street, addr.sector, addr.district, addr.province]
    .filter((p) => p && String(p).trim())
    .map((p) => String(p).trim())
    .join(', ')
}

const LABELS = {
  pending: 'Awaiting payment',
  paid: 'Preparing',
  processing: 'Preparing',
  shipped: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

/* Colour carries meaning: amber in progress, sky moving, moss done. */
const TONES = {
  pending: 'neutral',
  paid: 'amber',
  processing: 'amber',
  shipped: 'sky',
  delivered: 'moss',
  cancelled: 'rose',
  refunded: 'neutral',
}

export const statusLabel = (status) =>
  LABELS[status] || String(status || '').charAt(0).toUpperCase() + String(status || '').slice(1)

export const statusTone = (status) => TONES[status] || 'neutral'

export const orderRef = (order) => `#${String(order?._id || '').slice(-8).toUpperCase()}`

/** Drives the Orders filter pills. Unpaid is deliberately not "in progress". */
export const isInProgress = (order) =>
  ['paid', 'processing', 'shipped'].includes(order?.status)

/* The four stages the customer sees. `match` lists the statuses that mean this
   stage is complete. */
export const TIMELINE_STAGES = [
  { key: 'placed', title: 'Order received', match: ['paid', 'processing', 'shipped', 'delivered'] },
  { key: 'packed', title: 'Signed and packed', match: ['processing', 'shipped', 'delivered'] },
  { key: 'out', title: 'Out for delivery', match: ['shipped', 'delivered'] },
  { key: 'done', title: 'Delivered', match: ['delivered'] },
]

/** The date a stage completed, from statusHistory, or null if it has not. */
export function stageDate(order, stage) {
  const hit = (order?.statusHistory || []).find((e) => stage.match.includes(e.status))
  return hit ? new Date(hit.at) : null
}

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
```

- [ ] **Step 6: Run the tests**

Run: `cd frontend && npm test`
Expected: PASS — 15 tests

- [ ] **Step 7: Create `lib/rwanda.js`**

```js
/* Rwanda's 5 provinces and 30 districts, for the checkout and profile address
   selects. Sectors are free text — there are over 400 and a select would be
   worse than an input. */

export const PROVINCES = [
  'Kigali City',
  'Eastern Province',
  'Northern Province',
  'Southern Province',
  'Western Province',
]

export const DISTRICTS = {
  'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
}

export const districtsFor = (province) => DISTRICTS[province] || []
```

- [ ] **Step 8: Add the `sky` token**

In `frontend/tailwind.config.js`, inside `theme.extend.colors`, after `ink`:

```js
        // The one mockup colour with no existing token: the "on the way" status.
        // sky-700 is 5.9:1 on ink-50, so it clears AA as pill text.
        sky: {
          100: '#DCE8F0',
          600: '#2F6690',
          700: '#265A7E',
        },
```

- [ ] **Step 9: Replace the Stripe API helpers**

In `frontend/src/lib/api.js`, replace the `paymentApi` block and add two more:

```js
export const paymentApi = {
  initiate: (data) => api.post('/api/payment/initiate', data),
  verify: (data) => api.post('/api/payment/verify', data),
}
export const ordersApi = {
  getAll: () => api.get('/api/users/orders'),
  getById: (id) => api.get(`/api/users/orders/${id}`),
}
export const profileApi = {
  get: () => api.get('/api/users/me'),
  update: (data) => api.put('/api/users/profile', data),
}
```

- [ ] **Step 10: Verify build and tests**

Run: `cd frontend && npm test && npm run build`
Expected: 15 tests pass; build succeeds

- [ ] **Step 11: Hand the commit to the user**

```bash
git add frontend/src/lib/ frontend/tailwind.config.js frontend/package.json frontend/package-lock.json frontend/vite.config.js
git commit -m "feat(frontend): order formatters, Rwanda data, sky token, payment API"
```

---

## Task 10: Commerce CSS components

**Files:**
- Modify: `frontend/src/index.css`

**Interfaces:**
- Consumes: `sky` token (Task 9)
- Produces: `.summary-card`, `.status`, `.status-{neutral,amber,sky,moss,rose}`, `.steps`, `.step`, `.qty`, `.tstep`, `.pill`, `.pay-tile`

- [ ] **Step 1: Append the commerce block**

Add to `frontend/src/index.css`, after the existing `.detail` block. Port the
visual values from `bruno-cart.html:104-160`, `bruno-checkout.html:57-75` and
`bruno-orders.html:75-95`:

```css
/* ── COMMERCE ─────────────────────────────────────────────────────────────
   Cart, checkout and order pages. Reuses .fld / .fld-pair / .detail from the
   contact page rather than introducing a second form system. */

.summary-card {
  background: theme('colors.ink.50');
  border: 1px solid rgba(18, 22, 21, .14);
  border-radius: theme('borderRadius.card');
  padding: 1.5rem;
}
@media (min-width: 860px) {
  .summary-card { position: sticky; top: 5.5rem; }
}

/* Status pill — colour maps to meaning, not to status name. */
.status {
  display: inline-flex; align-items: center; gap: .45rem;
  font-size: .7rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
  padding: .35rem .75rem; border-radius: 100px;
}
.status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.status-neutral { background: rgba(18, 22, 21, .08); color: theme('colors.ink.600'); }
.status-amber   { background: rgba(183, 121, 31, .14); color: #8A5A12; }
.status-sky     { background: rgba(47, 102, 144, .14); color: theme('colors.sky.700'); }
.status-moss    { background: rgba(78, 150, 131, .16); color: theme('colors.brand.700'); }
.status-rose    { background: rgba(163, 58, 58, .13); color: #8F3030; }

/* Checkout step indicator */
.steps { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.step  { display: flex; align-items: center; gap: .55rem; font-size: .85rem; color: rgba(234, 232, 225, .45); }
.step b {
  width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center;
  font-size: .72rem; font-weight: 700; border: 1px solid rgba(234, 232, 225, .28);
}
.step-on  { color: theme('colors.ink.50'); }
.step-on b { background: theme('colors.brand.300'); border-color: theme('colors.brand.300'); color: theme('colors.brand.900'); }
.step-done b { background: rgba(156, 211, 196, .2); border-color: transparent; color: theme('colors.brand.300'); }
.step-sep { width: 22px; height: 1px; background: rgba(234, 232, 225, .2); }

/* Quantity stepper */
.qty { display: inline-flex; align-items: center; border: 1px solid rgba(18, 22, 21, .14);
       border-radius: theme('borderRadius.edge'); background: rgba(255, 255, 255, .6); }
.qty button { width: 38px; height: 40px; border: 0; background: transparent; cursor: pointer;
              font-size: 1.05rem; color: theme('colors.ink.950'); }
.qty button:hover:not(:disabled) { background: rgba(18, 22, 21, .06); }
.qty button:disabled { opacity: .3; cursor: not-allowed; }
.qty span { min-width: 34px; text-align: center; font-weight: 600; font-size: .92rem; }

/* Filter pills */
.pill { font-size: .83rem; font-weight: 500; padding: .45rem 1rem; border-radius: 100px;
        border: 1px solid rgba(18, 22, 21, .14); background: transparent;
        color: theme('colors.ink.600'); cursor: pointer;
        transition: all .2s var(--ease); }
.pill:hover { border-color: theme('colors.brand.600'); color: theme('colors.brand.600'); }
.pill[aria-pressed="true"] { background: theme('colors.brand.900'); border-color: theme('colors.brand.900');
                             color: theme('colors.ink.50'); }

/* Payment method tile */
.pay-tile { border: 1px solid rgba(18, 22, 21, .14); border-radius: theme('borderRadius.edge');
            background: #fff; cursor: pointer; padding: .9rem 1rem; text-align: left;
            transition: border-color .2s var(--ease), background .2s var(--ease); }
.pay-tile:hover { border-color: theme('colors.brand.600'); }
.pay-tile[aria-pressed="true"] { border-color: theme('colors.brand.900'); background: rgba(78, 150, 131, .07); }

/* Timeline */
.tstep { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 1rem;
         padding-bottom: 1.4rem; position: relative; }
.tstep:last-child { padding-bottom: 0; }
.tstep::before { content: ""; position: absolute; left: 10px; top: 20px; bottom: 0;
                 width: 1px; background: rgba(18, 22, 21, .14); }
.tstep:last-child::before { display: none; }
.tdot { width: 21px; height: 21px; border-radius: 50%; border: 1px solid rgba(18, 22, 21, .14);
        background: theme('colors.ink.50'); display: grid; place-items: center; z-index: 1; }
.tstep-done .tdot { background: theme('colors.brand.900'); border-color: theme('colors.brand.900'); }
.js .tstep-done .tdot { animation: fillDot .4s var(--ease) both; }
.js .tstep-done:nth-child(2) .tdot { animation-delay: .1s; }
.js .tstep-done:nth-child(3) .tdot { animation-delay: .2s; }
.js .tstep-done:nth-child(4) .tdot { animation-delay: .3s; }
@keyframes fillDot { from { transform: scale(.6); opacity: 0 } to { transform: none; opacity: 1 } }

/* Success tick */
.tick { animation: pop .5s var(--ease) both; }
@keyframes pop { from { transform: scale(.7); opacity: 0 } to { transform: none; opacity: 1 } }
```

> The top-level `@media (prefers-reduced-motion: reduce)` block already in
> `index.css` neutralises `fillDot` and `pop`. Do not add a second guard.

- [ ] **Step 2: Verify the build**

Run: `cd frontend && npm run build`
Expected: build succeeds, no `theme()` resolution errors

- [ ] **Step 3: Hand the commit to the user**

```bash
git add frontend/src/index.css
git commit -m "feat(frontend): commerce CSS — status pills, steps, timeline, summary card"
```

---

## Task 11: Header minimal variant, Footer, Layout routing

**Files:**
- Modify: `frontend/src/components/Header.jsx`
- Modify: `frontend/src/components/Footer.jsx`
- Modify: `frontend/src/components/Layout.jsx`

**Interfaces:**
- Consumes: nothing
- Produces: `<Header variant="minimal" />`, `<Footer variant="reduced" />`

- [ ] **Step 1: Add the minimal branch to Header**

At the top of the returned JSX in `Header.jsx`, before the existing markup:

```jsx
  // Checkout only: wordmark and a lock, nothing to click away with.
  if (variant === 'minimal') {
    return (
      <header className="sticky top-0 inset-x-0 z-50 bg-ink-950 border-b border-ink-100/15">
        <div className="w-full px-[var(--gut)] h-14 md:h-16 flex items-center gap-8">
          <Link to="/" className="font-serif text-xl md:text-2xl font-semibold text-ink-100 mr-auto">
            Bruno Iradukunda
          </Link>
          <span className="flex items-center gap-2 text-xs text-ink-100/60">
            <Lock className="w-3.5 h-3.5" strokeWidth={1.8} />
            Secure checkout
          </span>
        </div>
      </header>
    )
  }
```

Add `Lock` to the `lucide-react` import.

- [ ] **Step 2: Add the reduced Footer variant**

In `Footer.jsx`, accept `variant` and return early when reduced:

```jsx
export default function Footer({ variant = 'full' }) {
  if (variant === 'reduced') {
    return (
      <footer className="bg-ink-950 text-ink-100/45 py-10">
        <div className="w-full px-[var(--gut)] flex flex-wrap gap-4 justify-between text-sm">
          <span>© {new Date().getFullYear()} Bruno Iradukunda</span>
          <span>
            <Link to="/books#ordering" className="text-ink-100/70 hover:text-brand-300">Ordering &amp; delivery</Link>
            {' · '}
            <Link to="/contact" className="text-ink-100/70 hover:text-brand-300">Contact</Link>
          </span>
        </div>
      </footer>
    )
  }
  // ...existing full footer unchanged
```

- [ ] **Step 3: Route the variants in Layout**

Replace the route constants and body of `Layout.jsx`:

```jsx
const OVERLAY_ROUTES = [
  '/', '/about', '/my-work', '/books', '/blog', '/events', '/contact',
  '/cart', '/orders', '/profile',
]
const OVERLAY_PREFIXES = ['/books/', '/blog/', '/events/', '/orders/']

// Checkout and the success page strip the furniture — fewer ways to wander
// off mid-purchase.
const MINIMAL_ROUTES = ['/checkout', '/order-success']

export default function Layout() {
  const { pathname } = useLocation()
  const minimal = MINIMAL_ROUTES.includes(pathname)
  const variant = minimal
    ? 'minimal'
    : (OVERLAY_ROUTES.includes(pathname) || OVERLAY_PREFIXES.some((p) => pathname.startsWith(p)))
      ? 'overlay'
      : 'solid'

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant={variant} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer variant={minimal ? 'reduced' : 'full'} />
    </div>
  )
}
```

- [ ] **Step 4: Verify the build**

Run: `cd frontend && npm run build`
Expected: build succeeds

- [ ] **Step 5: Hand the commit to the user**

```bash
git add frontend/src/components/Header.jsx frontend/src/components/Footer.jsx frontend/src/components/Layout.jsx
git commit -m "feat(frontend): minimal checkout nav, reduced footer, overlay routes"
```

---

## Task 12: Shared order components

Order Success and Order Detail are ~70% the same content. Build it once.

**Files:**
- Create: `frontend/src/components/order/StatusPill.jsx`
- Create: `frontend/src/components/order/OrderRef.jsx`
- Create: `frontend/src/components/order/OrderItems.jsx`
- Create: `frontend/src/components/order/OrderFacts.jsx`
- Create: `frontend/src/components/order/OrderTimeline.jsx`

**Interfaces:**
- Consumes: `lib/orders.js` (Task 9), `lib/images.js` (existing)
- Produces:
  - `<StatusPill status={string} />`
  - `<OrderRef order={Order} onDark={boolean} />`
  - `<OrderItems order={Order} />`
  - `<OrderFacts order={Order} />`
  - `<OrderTimeline order={Order} />`

- [ ] **Step 1: StatusPill**

```jsx
import { statusLabel, statusTone } from '../../lib/orders'

export default function StatusPill({ status }) {
  return <span className={`status status-${statusTone(status)}`}>{statusLabel(status)}</span>
}
```

- [ ] **Step 2: OrderRef — the pill with copy-to-clipboard**

```jsx
import { useState } from 'react'
import { orderRef } from '../../lib/orders'

export default function OrderRef({ order, onDark = false }) {
  const [copied, setCopied] = useState(false)
  const ref = orderRef(order)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ref)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard is unavailable over plain http and in some browsers.
      // The reference is visible either way, so fail quietly.
    }
  }

  return (
    <span className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm ${
      onDark ? 'border-ink-100/20 text-ink-100/75' : 'border-ink-950/15 text-ink-600'
    }`}>
      Order <b className={onDark ? 'text-ink-50' : 'text-ink-900'}>{ref}</b>
      <button
        type="button" onClick={copy}
        className={`text-xs font-semibold ${onDark ? 'text-brand-300' : 'text-brand-600'}`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </span>
  )
}
```

- [ ] **Step 3: OrderItems — lines plus totals**

```jsx
import { formatRWF } from '../../lib/orders'
import { cldResize } from '../../lib/images'

export default function OrderItems({ order }) {
  return (
    <>
      {order.items.map((item, i) => (
        <div key={i} className="grid grid-cols-[52px_minmax(0,1fr)_auto] gap-4 items-center py-3 border-b border-ink-950/[.14] last:border-b-0">
          {item.coverImage
            ? <img src={cldResize(item.coverImage, 104)} alt="" className="aspect-[2/3] w-full object-cover rounded-edge" />
            : <div className="aspect-[2/3] w-full rounded-edge bg-brand-900" />}
          <div className="min-w-0">
            <div className="font-semibold text-ink-900 truncate">{item.title}</div>
            <div className="text-sm text-ink-500">
              Paperback · qty {item.quantity}{order.signed ? ' · signed' : ''}
            </div>
          </div>
          <div className="font-semibold text-ink-900 whitespace-nowrap">
            {formatRWF(item.price * item.quantity)}
          </div>
        </div>
      ))}

      <div className="pt-3">
        <div className="flex justify-between py-1 text-sm">
          <span className="text-ink-600">Subtotal</span>
          <span className="font-semibold">{formatRWF(order.subtotal)}</span>
        </div>
        <div className="flex justify-between py-1 text-sm">
          <span className="text-ink-600">
            {order.deliveryMethod === 'collect' ? 'Collection' : 'Standard delivery'}
          </span>
          <span className="font-semibold">
            {order.deliveryFee ? formatRWF(order.deliveryFee) : 'Free'}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-ink-950/[.14]">
        <span className="font-semibold text-sm">
          {order.status === 'pending' ? 'Total' : 'Paid'}
        </span>
        <span className="font-serif text-2xl text-ink-900">{formatRWF(order.totalAmount)}</span>
      </div>
    </>
  )
}
```

- [ ] **Step 4: OrderFacts — "Delivering to" ∥ "Paid with"**

```jsx
import { formatAddress, formatDate } from '../../lib/orders'

const METHOD_NAMES = {
  momo: 'MTN Mobile Money',
  airtel: 'Airtel Money',
  card: 'Card',
  bank: 'Bank transfer',
}

function Card({ title, children }) {
  return (
    <div className="bg-ink-50 border border-ink-950/[.14] rounded-card p-5 md:p-7">
      <h2 className="font-serif text-xl text-ink-900 mb-4">{title}</h2>
      <dl>{children}</dl>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <>
      <dt className="text-[.68rem] uppercase tracking-[.16em] text-ink-500 mb-1.5">{label}</dt>
      <dd className="m-0 mb-4 last:mb-0 text-[.95rem] text-ink-800">{children}</dd>
    </>
  )
}

export default function OrderFacts({ order }) {
  const address = formatAddress(order.shippingAddress)
  const collecting = order.deliveryMethod === 'collect'

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Card title={collecting ? 'Collection' : 'Delivering to'}>
        <Row label={collecting ? 'Arrangement' : 'Address'}>
          {collecting
            ? <>Pick up in person — we will call to arrange a time.</>
            : <>{order.customerName}{address && <><br />{address}</>}</>}
        </Row>
        <Row label="Phone">{order.customerPhone}</Row>
      </Card>

      <Card title="Paid with">
        <Row label="Method">{METHOD_NAMES[order.paymentMethod] || '—'}</Row>
        <Row label="Date">{formatDate(order.createdAt)}</Row>
      </Card>
    </div>
  )
}
```

- [ ] **Step 5: OrderTimeline**

```jsx
import { Check } from 'lucide-react'
import { TIMELINE_STAGES, stageDate, formatDate } from '../../lib/orders'

/* Copy for stages that have not happened yet. Once a stage completes we print
   its real date from statusHistory instead — never a guess. */
const PENDING_COPY = {
  placed: 'As soon as payment is confirmed.',
  packed: 'Within a day or two — signing adds a little time.',
  out: 'The courier will call before arriving.',
  done: 'We will mark this once it reaches you.',
}

export default function OrderTimeline({ order }) {
  return (
    <div>
      {TIMELINE_STAGES.map((stage) => {
        const at = stageDate(order, stage)
        return (
          <div key={stage.key} className={`tstep ${at ? 'tstep-done' : ''}`}>
            <span className="tdot">
              {at && <Check className="w-3 h-3 text-ink-50" strokeWidth={3} />}
            </span>
            <div>
              <h3 className={`font-sans text-base font-semibold ${at ? 'text-brand-900' : 'text-ink-900'}`}>
                {stage.title}
              </h3>
              <p className="text-sm text-ink-600 mt-0.5">
                {at ? formatDate(at) : PENDING_COPY[stage.key]}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 6: Verify the build**

Run: `cd frontend && npm run build`
Expected: build succeeds

- [ ] **Step 7: Hand the commit to the user**

```bash
git add frontend/src/components/order/
git commit -m "feat(frontend): shared order components"
```

---

## Task 13: Cart rebuild

**Files:**
- Modify: `frontend/src/pages/Cart.jsx`

**Interfaces:**
- Consumes: `useCart`, `lib/orders.js`, `booksApi`, `lib/images.js`
- Produces: nothing consumed elsewhere

**Mockup:** `~/Downloads/bruno-cart.html` — item rows at `:88-120`, summary at `:124-145`, empty state at `:158-180`.

- [ ] **Step 1: Add the price-refresh effect**

The cart stores whole book objects in `localStorage`, so an admin price edit
leaves stale figures in a customer's cart indefinitely. The server re-prices on
`initiate`, so nobody is ever charged the stale number — but they would see one
figure and be charged another.

Add to `CartContext.jsx` a `refreshPrices` action and dispatch case:

```js
    case 'REFRESH': {
      // Re-seat each line on the current catalogue record. Books that no longer
      // exist are dropped — they cannot be ordered.
      const byId = action.payload
      return {
        items: state.items
          .filter((i) => byId[i.book._id])
          .map((i) => ({ ...i, book: { ...i.book, ...byId[i.book._id] } })),
      }
    }
```

and expose:

```js
  const refreshPrices = useCallback(async (books) => {
    const byId = Object.fromEntries(books.map((b) => [b._id, b]))
    dispatch({ type: 'REFRESH', payload: byId })
  }, [])
```

Add `refreshPrices` to the context value.

- [ ] **Step 2: Rebuild Cart.jsx**

```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ShieldCheck, Truck, PenLine } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { booksApi } from '../lib/api'
import { formatRWF, DELIVERY_FEE } from '../lib/orders'
import { cldResize, cldSrcSet } from '../lib/images'
import Reveal from '../components/Reveal'

const ASSURANCES = [
  [ShieldCheck, 'Secure checkout'],
  [Truck, 'Kigali delivery in 2–3 days'],
  [PenLine, 'Ask for a signed copy at checkout'],
]

export default function Cart() {
  const { items, totalItems, totalAmount, removeItem, setQuantity, refreshPrices } = useCart()
  const [books, setBooks] = useState([])

  // Prices can change between adding to the cart and opening it.
  useEffect(() => {
    booksApi.getAll()
      .then((all) => { setBooks(all); refreshPrices(all) })
      .catch(() => {})
  }, [refreshPrices])

  const empty = items.length === 0

  return (
    <>
      <header className="bg-ink-950 text-ink-50 band pt-28 md:pt-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="font-serif text-3xl md:text-5xl">Your cart</h1>
          <p className="text-ink-100/70 mt-3">
            {empty ? 'Nothing here yet'
              : `${totalItems} ${totalItems === 1 ? 'item' : 'items'} · ready when you are`}
          </p>
        </div>
      </header>

      <main className="bg-ink-100 band">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {empty ? <Empty books={books} /> : (
            <div className="grid lg:grid-cols-[minmax(0,1fr)_21rem] gap-8 lg:gap-12 items-start">
              <div>
                <div className="border-t border-ink-950/[.14]">
                  {items.map(({ book, quantity, format }) => (
                    <Row key={`${book._id}-${format}`} book={book} quantity={quantity}
                         format={format} onQty={setQuantity} onRemove={removeItem} />
                  ))}
                </div>
                <Link to="/books" className="link-more inline-flex mt-7">← Continue shopping</Link>
              </div>

              <aside className="summary-card">
                <h2 className="font-serif text-xl text-ink-900 mb-4">Order summary</h2>
                <div className="flex justify-between py-2 text-[.95rem]">
                  <span>Subtotal</span><span className="font-semibold">{formatRWF(totalAmount)}</span>
                </div>
                <div className="flex justify-between py-2 text-[.95rem]">
                  <span className="text-ink-600">Delivery</span>
                  <span className="text-ink-600 font-medium">{formatRWF(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-ink-950/[.14]">
                  <span className="font-semibold text-[.95rem]">Total</span>
                  <span className="font-serif text-2xl">{formatRWF(totalAmount + DELIVERY_FEE)}</span>
                </div>
                <p className="text-[.82rem] text-ink-600 mt-3">
                  Flat rate anywhere in Rwanda. Collection in person is free — choose at checkout.
                </p>

                <Link to="/checkout" className="btn-primary w-full mt-5">
                  Proceed to checkout <span className="arw">→</span>
                </Link>

                <div className="grid gap-2.5 mt-5 pt-5 border-t border-ink-950/[.14]">
                  {ASSURANCES.map(([Icon, label]) => (
                    <span key={label} className="flex items-center gap-2 text-[.83rem] text-ink-600">
                      <Icon className="w-3.5 h-3.5 text-brand-600 flex-none" strokeWidth={1.8} />
                      {label}
                    </span>
                  ))}
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
```

- [ ] **Step 3: The item row**

Port the grid from `bruno-cart.html:88-120`. Note the **quiet Remove** — red is
for errors, and removing a book from a cart is not an error.

```jsx
function Row({ book, quantity, format, onQty, onRemove }) {
  const price = book.price || 0
  return (
    <div className="grid grid-cols-[68px_minmax(0,1fr)] sm:grid-cols-[88px_minmax(0,1fr)_auto] gap-5 py-6 border-b border-ink-950/[.14] items-start">
      <img
        src={cldResize(book.coverImage, 176)} srcSet={cldSrcSet(book.coverImage, 88)}
        alt="" className="aspect-[2/3] w-full object-cover rounded-edge shadow-lg"
      />
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-[.14em] text-brand-600 font-semibold mb-1">
          Paperback
        </div>
        <h3 className="font-serif text-xl text-ink-900">
          <Link to={`/books/${book._id}`} className="hover:text-brand-600 transition-colors">
            {book.title}
          </Link>
        </h3>
        <p className="text-sm text-ink-500 mt-1 mb-4">
          {formatRWF(price)} each{book.pages ? ` · ${book.pages} pages` : ''}
        </p>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="qty" role="group" aria-label="Quantity">
            <button type="button" onClick={() => onQty(book._id, format, quantity - 1)}
                    disabled={quantity <= 1} aria-label="Decrease">−</button>
            <span>{quantity}</span>
            <button type="button" onClick={() => onQty(book._id, format, Math.min(20, quantity + 1))}
                    disabled={quantity >= 20} aria-label="Increase">+</button>
          </div>
          <button
            type="button" onClick={() => onRemove(book._id, format)}
            className="text-[.85rem] text-ink-500 underline underline-offset-[3px] hover:text-red-700 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="font-serif text-xl whitespace-nowrap col-start-2 sm:col-start-3">
        {formatRWF(price * quantity)}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: The empty state**

An empty screen is a place to offer something. Port from `bruno-cart.html:158-180`.

```jsx
function Empty({ books }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 mx-auto mb-6 rounded-full border border-ink-950/[.14] grid place-items-center">
        <ShoppingBag className="w-5 h-5 text-brand-600" strokeWidth={1.5} />
      </div>
      <h2 className="font-serif text-2xl md:text-3xl text-ink-900 mb-3">Nothing in the cart yet</h2>
      <p className="text-ink-600 max-w-[42ch] mx-auto mb-8">
        Browse the catalogue — Bruno's memoir, and more from the publishing house he co-founded.
      </p>
      <Link to="/books" className="btn-primary">Browse the books <span className="arw">→</span></Link>

      {books.length > 0 && (
        <div className="mt-16 text-left">
          <h3 className="eyebrow mb-5">Available now</h3>
          <div className="border-t border-ink-950/[.14]">
            {books.slice(0, 4).map((b) => (
              <Link key={b._id} to={`/books/${b._id}`}
                    className="grid grid-cols-[72px_minmax(0,1fr)_auto] gap-5 items-center py-5 border-b border-ink-950/[.14] hover:bg-white/50 transition-colors">
                <img src={cldResize(b.coverImage, 144)} alt=""
                     className="aspect-[2/3] w-full object-cover rounded-edge" />
                <div className="min-w-0">
                  <h4 className="font-serif text-lg text-ink-900">{b.title}</h4>
                  {b.subtitle && <p className="text-sm text-ink-600 mt-0.5 truncate">{b.subtitle}</p>}
                </div>
                <span className="font-serif text-lg whitespace-nowrap">{formatRWF(b.price)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Verify in the browser**

Run: `cd frontend && npm run dev`
Check: add two books → quantities step and clamp at 1 and 20; totals update;
delivery shows 2,000 RWF; remove both → empty state lists available titles.

- [ ] **Step 6: Hand the commit to the user**

```bash
git add frontend/src/pages/Cart.jsx frontend/src/context/CartContext.jsx
git commit -m "feat(frontend): cart rebuild — sticky summary, delivery, empty state"
```

---

## Task 14: Checkout rebuild

**Files:**
- Modify: `frontend/src/pages/Checkout.jsx`
- Modify: `frontend/package.json`

**Interfaces:**
- Consumes: `paymentApi.initiate` (Task 9), `lib/rwanda.js`, `useCart`, `useUser`
- Produces: nothing consumed elsewhere

**Mockup:** `~/Downloads/bruno-checkout.html` — steps at `:180-190`, form cards at `:196-290`, delivery options at `:256-282`, payment tiles at `:305-320`.

- [ ] **Step 1: Install the Flutterwave React package**

```bash
cd frontend && npm install flutterwave-react-v3
```

- [ ] **Step 2: Build the form state and step 1**

Two steps with an indicator — without one, "Continue to payment" reads as the
final action and the second screen feels like an error.

```jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { paymentApi, profileApi } from '../lib/api'
import { PROVINCES, districtsFor } from '../lib/rwanda'
import { formatRWF, DELIVERY_FEE } from '../lib/orders'

const PAY_TILES = [
  { id: 'momo',   name: 'MTN Mobile Money', sub: 'Pay from your MoMo balance', opt: 'mobilemoneyrwanda' },
  { id: 'airtel', name: 'Airtel Money',     sub: 'Pay from your Airtel wallet', opt: 'mobilemoneyrwanda' },
  { id: 'card',   name: 'Card',             sub: 'Visa or Mastercard',          opt: 'card' },
  { id: 'bank',   name: 'Bank transfer',    sub: 'Pay from your bank account',  opt: 'banktransfer' },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { items, totalAmount } = useCart()
  const { user } = useUser()

  const [step, setStep] = useState(1)
  const [method, setMethod] = useState('momo')
  const [saveProfile, setSaveProfile] = useState(true)
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(null)   // { txRef, amount, publicKey, customer }

  const [form, setForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '',
    deliveryMethod: 'standard',
    province: 'Kigali City', district: 'Gasabo', sector: '', street: '',
    notes: '', signed: false,
  })

  // Pre-fill from the saved profile — the payoff for having one.
  useEffect(() => {
    if (!user) return
    setForm((f) => ({
      ...f,
      customerName: f.customerName || user.name || '',
      customerEmail: f.customerEmail || user.email || '',
      customerPhone: f.customerPhone || user.phone || '',
      province: user.address?.province || f.province,
      district: user.address?.district || f.district,
      sector: user.address?.sector || f.sector,
      street: user.address?.street || f.street,
    }))
  }, [user])

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => (k === 'province'
      // Changing province invalidates the district below it.
      ? { ...f, province: v, district: districtsFor(v)[0] || '' }
      : { ...f, [k]: v }))
  }

  const collecting = form.deliveryMethod === 'collect'
  const deliveryFee = collecting ? 0 : DELIVERY_FEE
  const total = totalAmount + deliveryFee
```

- [ ] **Step 3: Validate and initiate**

Address is required only for standard delivery; name, email and phone are
required either way, because collection is arranged by phone.

```jsx
  const continueToPayment = async (e) => {
    e.preventDefault()
    if (!form.customerName.trim() || !form.customerEmail.trim() || !form.customerPhone.trim()) {
      toast.error('Name, email and phone are required.')
      return
    }
    if (!collecting && (!form.sector.trim() || !form.street.trim())) {
      toast.error('Please give a sector and a street or landmark.')
      return
    }

    setLoading(true)
    try {
      const res = await paymentApi.initiate({
        items: items.map(({ book, quantity }) => ({ bookId: book._id, quantity })),
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
        deliveryMethod: form.deliveryMethod,
        shippingAddress: collecting ? {} : {
          province: form.province, district: form.district,
          sector: form.sector.trim(), street: form.street.trim(),
        },
        signed: form.signed,
        notes: form.notes.trim(),
      })
      setSession(res)
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })

      if (saveProfile && user) {
        profileApi.update({
          name: form.customerName.trim(),
          phone: form.customerPhone.trim(),
          address: collecting ? undefined : {
            province: form.province, district: form.district,
            sector: form.sector.trim(), street: form.street.trim(),
          },
        }).catch(() => {})   // Saving is a convenience; never block checkout.
      }
    } catch (err) {
      toast.error(err.message || 'Could not start checkout')
    } finally {
      setLoading(false)
    }
  }
```

- [ ] **Step 4: Wire the Flutterwave modal, scoped to the chosen tile**

```jsx
  const tile = PAY_TILES.find((t) => t.id === method)

  const config = session && {
    public_key: session.publicKey,
    tx_ref: session.txRef,
    amount: session.amount,
    currency: 'RWF',            // whole numbers — never multiply by 100
    payment_options: tile.opt,  // only the method the customer picked
    customer: session.customer,
    customizations: {
      title: 'Bruno Iradukunda',
      description: 'Book order',
    },
  }

  const openPayment = useFlutterwave(config || {})

  const pay = () => {
    if (!session) return
    openPayment({
      callback: (response) => {
        closePaymentModal()
        // The server decides whether this actually paid — the redirect alone
        // proves nothing. OrderSuccess calls verify.
        navigate(`/order-success?tx_ref=${session.txRef}&transaction_id=${response.transaction_id}`)
      },
      onClose: () => {
        // The order stays pending; they can pay again from /orders.
        toast('Payment cancelled — your order is saved as unpaid.')
      },
    })
  }
```

- [ ] **Step 5: Render both steps**

Port the markup from the mockup. Structure:

```jsx
  if (items.length === 0 && !session) {
    return (
      <div className="bg-ink-100 band pt-28 text-center">
        <p className="text-ink-600 mb-5">Your cart is empty.</p>
        <button type="button" onClick={() => navigate('/books')} className="btn-primary">
          Browse books
        </button>
      </div>
    )
  }

  return (
    <>
      <header className="bg-ink-950 text-ink-50 band pt-28 md:pt-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="font-serif text-3xl md:text-5xl">Checkout</h1>
          <div className="steps mt-6">
            <span className={`step ${step > 1 ? 'step-done' : 'step-on'}`}><b>1</b> Delivery details</span>
            <span className="step-sep" />
            <span className={`step ${step === 2 ? 'step-on' : ''}`}><b>2</b> Payment</span>
            <span className="step-sep" />
            <span className="step"><b>3</b> Confirmation</span>
          </div>
        </div>
      </header>

      <main className="bg-ink-100 band">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[minmax(0,1fr)_21rem] gap-8 lg:gap-12 items-start">
          <div>
            {step === 1 && (/* three cards — see steps 6-8 */)}
            {step === 2 && (/* payment tiles — see step 9 */)}
          </div>
          <aside className="summary-card">{/* items, subtotal, delivery, total, Edit cart */}</aside>
        </div>
      </main>
    </>
  )
}
```

- [ ] **Step 6: Card one — "Who's ordering"**

Three `.fld` fields: name, email, and **phone marked required** with the hint
"The courier will call this number before delivering." The current form has no
phone field at all. Use `.fld-pair` for name/email, full width for phone.

- [ ] **Step 7: Card two — "Where it's going"**

Rendered only when `!collecting`. Two `.fld-pair` rows:

- Province `<select>` from `PROVINCES` → District `<select>` from `districtsFor(form.province)`
- Sector `<input>` (free text — there are 400+) → Street or landmark `<input>`, placeholder `"KK 15 Ave, near SP filling station"`

Then a `<textarea>` for delivery notes, hint "Optional, but it helps the courier
find you first time." Below the card, the save-to-profile checkbox bound to
`saveProfile`, shown only when `user` is set.

- [ ] **Step 8: Card three — "How it gets there"**

Two radio options as `.opt` labels (port `bruno-checkout.html:256-282`, dropping
the next-day tier):

```jsx
{[
  ['standard', 'Standard delivery', formatRWF(DELIVERY_FEE), 'Flat rate anywhere in Rwanda, 2–3 working days in Kigali.'],
  ['collect', 'Collect in person', 'Free', 'Pick up at a Vital Readings event, or arrange a time.'],
].map(([value, title, price, desc]) => (
  <label key={value} className={`flex items-start gap-3.5 p-4 border rounded-edge bg-white cursor-pointer transition-colors ${
    form.deliveryMethod === value ? 'border-brand-900 bg-brand-600/[.06]' : 'border-ink-950/[.14] hover:border-brand-600'
  }`}>
    <input type="radio" name="ship" value={value} checked={form.deliveryMethod === value}
           onChange={set('deliveryMethod')} className="mt-1 accent-brand-900 flex-none" />
    <span className="flex-1">
      <span className="font-semibold text-[.95rem] flex justify-between gap-4">
        <span>{title}</span><span>{price}</span>
      </span>
      <span className="block text-[.86rem] text-ink-600 mt-0.5">{desc}</span>
    </span>
  </label>
))}
```

Then the signed checkbox: "Ask Bruno to sign this copy — no extra charge, adds
a day or two." Then the submit button, "Continue to payment →".

- [ ] **Step 9: Step two — payment tiles**

```jsx
<div className="bg-ink-50 border border-ink-950/[.14] rounded-card p-5 md:p-7">
  <h2 className="font-serif text-xl text-ink-900 mb-1">How you'd like to pay</h2>
  <p className="text-[.88rem] text-ink-600 mb-6">
    Your details go straight to the payment provider — they never touch this site.
  </p>
  <div className="grid sm:grid-cols-2 gap-2.5">
    {PAY_TILES.map((t) => (
      <button key={t.id} type="button" className="pay-tile"
              aria-pressed={method === t.id} onClick={() => setMethod(t.id)}>
        <span className="block font-semibold text-[.92rem]">{t.name}</span>
        <span className="text-[.78rem] text-ink-500">{t.sub}</span>
      </button>
    ))}
  </div>
</div>

<button type="button" onClick={pay} className="btn-primary w-full mt-5">
  Pay {formatRWF(session.amount)}
</button>
<p className="text-center mt-4">
  <button type="button" onClick={() => setStep(1)} className="link-more">
    ← Back to delivery details
  </button>
</p>
```

> **Verify before shipping:** MTN and Airtel both map to `mobilemoneyrwanda` —
> Flutterwave's Rwanda form detects the network from the number prefix, so the
> two tiles are a recognition affordance rather than two code paths. Confirm the
> option strings against the current Flutterwave docs; this is the one detail in
> the plan taken from documentation rather than a working integration.

- [ ] **Step 10: Verify in the browser with test keys**

Run: `cd frontend && npm run dev` (backend running, `FLW_*_TEST` keys set)
Check: step 1 validates; choosing collection hides the address card and drops
the total by 2,000; step 2 opens the Flutterwave modal with **only** the chosen
method; a test MoMo payment auto-authorizes and lands on `/order-success`.

- [ ] **Step 11: Hand the commit to the user**

```bash
git add frontend/src/pages/Checkout.jsx frontend/package.json frontend/package-lock.json
git commit -m "feat(frontend): checkout rebuild — two steps, RW address, Flutterwave"
```

---

## Task 15: Order Success rebuild

**Files:**
- Modify: `frontend/src/pages/OrderSuccess.jsx`

**Interfaces:**
- Consumes: `paymentApi.verify` (Task 9), order components (Task 12), `useCart`
- Produces: nothing consumed elsewhere

**Mockup:** `~/Downloads/bruno-order-success.html` — head at `:130-146`, cards at `:150-200`, timeline at `:202-240`.

- [ ] **Step 1: Implement the three-state machine**

The current page calls `clearCart()` and declares success **inside its own
`catch` block**, so a failed confirmation is indistinguishable from a
successful one. Three states, not one.

```jsx
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, AlertCircle } from 'lucide-react'
import { paymentApi } from '../lib/api'
import { useCart } from '../context/CartContext'
import OrderRef from '../components/order/OrderRef'
import OrderItems from '../components/order/OrderItems'
import OrderFacts from '../components/order/OrderFacts'
import OrderTimeline from '../components/order/OrderTimeline'

export default function OrderSuccess() {
  const [params] = useSearchParams()
  const txRef = params.get('tx_ref')
  const transactionId = params.get('transaction_id')
  const { clearCart } = useCart()

  const [state, setState] = useState('verifying')  // verifying | confirmed | unconfirmed
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (!txRef || !transactionId) { setState('unconfirmed'); return }
    let cancelled = false

    paymentApi.verify({ txRef, transactionId })
      .then((o) => {
        if (cancelled) return
        setOrder(o)
        // Only clear the cart against a verified order.
        if (o.status !== 'pending') { clearCart(); setState('confirmed') }
        else setState('unconfirmed')
      })
      .catch(() => { if (!cancelled) setState('unconfirmed') })

    return () => { cancelled = true }
  }, [txRef, transactionId, clearCart])

  if (state === 'verifying') {
    return (
      <div className="bg-ink-950 text-ink-50 band pt-28 text-center min-h-[60vh]">
        <p className="text-ink-100/70">Confirming your payment…</p>
      </div>
    )
  }
```

- [ ] **Step 2: The unconfirmed branch**

Never claim success on a redirect alone.

```jsx
  if (state === 'unconfirmed') {
    return (
      <>
        <header className="bg-ink-950 text-ink-50 band pt-28 md:pt-32 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-amber-400/15 grid place-items-center">
              <AlertCircle className="w-6 h-6 text-amber-300" strokeWidth={2} />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl">Payment is still processing</h1>
            <p className="text-ink-100/70 mt-4 max-w-[44ch] mx-auto">
              We have not had confirmation yet. Your order is saved — if payment went
              through it will appear in your orders shortly.
            </p>
            {order && <div className="mt-7"><OrderRef order={order} onDark /></div>}
          </div>
        </header>
        <main className="bg-ink-100 band text-center">
          <div className="max-w-2xl mx-auto px-4 flex flex-wrap gap-3 justify-center">
            <Link to="/orders" className="btn-primary">Check my orders <span className="arw">→</span></Link>
            <Link to="/contact" className="btn-secondary">Get in touch</Link>
          </div>
        </main>
      </>
    )
  }
```

- [ ] **Step 3: The confirmed branch**

Head with the animated tick and the copyable reference, then the shared body.

```jsx
  return (
    <>
      <header className="bg-ink-950 text-ink-50 band pt-28 md:pt-32 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="tick w-14 h-14 mx-auto mb-6 rounded-full bg-brand-300/15 grid place-items-center">
            <Check className="w-6 h-6 text-brand-300" strokeWidth={2.2} />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl">Your order is confirmed</h1>
          <p className="text-ink-100/70 mt-4 max-w-[44ch] mx-auto">
            Payment received. A receipt is on its way to your email — and everything
            you need is on this page too.
          </p>
          <div className="mt-7"><OrderRef order={order} onDark /></div>
        </div>
      </header>

      <main className="bg-ink-100 band">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
          <div className="bg-ink-50 border border-ink-950/[.14] rounded-card p-5 md:p-7">
            <h2 className="font-serif text-xl text-ink-900 mb-4">What's coming</h2>
            <OrderItems order={order} />
          </div>

          <OrderFacts order={order} />

          <div className="bg-ink-50 border border-ink-950/[.14] rounded-card p-5 md:p-7">
            <h2 className="font-serif text-xl text-ink-900 mb-5">What happens next</h2>
            <OrderTimeline order={order} />
            <div className="flex flex-wrap gap-3 mt-7">
              <Link to={`/orders/${order._id}`} className="btn-primary">
                Track this order <span className="arw">→</span>
              </Link>
              <Link to="/books" className="btn-secondary">Back to books</Link>
            </div>
          </div>

          <p className="text-center text-sm text-ink-600">
            Something wrong with the order? <Link to="/contact" className="link-more">Get in touch</Link>{' '}
            and quote your order reference.
          </p>
        </div>
      </main>
    </>
  )
}
```

- [ ] **Step 4: Verify all three states**

Run: `cd frontend && npm run dev`
Check: a real test payment → confirmed, cart cleared, timeline shows "Order
received" with today's date. Then open `/order-success` with no query params →
unconfirmed branch, cart **not** cleared, no success language anywhere.

- [ ] **Step 5: Hand the commit to the user**

```bash
git add frontend/src/pages/OrderSuccess.jsx
git commit -m "feat(frontend): order success rebuild — verify, timeline, honest failure state"
```

---

## Task 16: Orders rebuild

**Files:**
- Modify: `frontend/src/pages/Orders.jsx`
- Create: `frontend/src/components/order/AccountNav.jsx`

**Interfaces:**
- Consumes: `ordersApi.getAll` (Task 9), `StatusPill` (Task 12), `useCart`, `useUser`
- Produces: `<AccountNav current="orders" />`

**Mockup:** `~/Downloads/bruno-orders.html` — account nav at `:141-147`, filters at `:151-155`, order cards at `:158-180`.

- [ ] **Step 1: AccountNav**

```jsx
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'

const TABS = [['orders', 'Orders', '/orders'], ['profile', 'Profile', '/profile']]

export default function AccountNav({ current }) {
  const { logout } = useUser()
  const navigate = useNavigate()

  return (
    <nav className="flex gap-6 mt-8 overflow-x-auto">
      {TABS.map(([key, label, to]) => (
        <Link key={key} to={to}
              aria-current={current === key ? 'page' : undefined}
              className={`text-sm font-medium pb-3.5 border-b-2 whitespace-nowrap transition-colors ${
                current === key
                  ? 'text-ink-50 border-brand-300'
                  : 'text-ink-100/60 border-transparent hover:text-ink-100'
              }`}>
          {label}
        </Link>
      ))}
      <button type="button"
              onClick={() => { logout(); navigate('/') }}
              className="text-sm font-medium pb-3.5 border-b-2 border-transparent text-ink-100/60 hover:text-ink-100 whitespace-nowrap">
        Sign out
      </button>
    </nav>
  )
}
```

- [ ] **Step 2: Rebuild Orders.jsx**

```jsx
import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ordersApi, booksApi } from '../lib/api'
import { useUser } from '../context/UserContext'
import { useCart } from '../context/CartContext'
import { formatRWF, formatAddress, formatDate, isInProgress, orderRef } from '../lib/orders'
import { cldResize } from '../lib/images'
import StatusPill from '../components/order/StatusPill'
import AccountNav from '../components/order/AccountNav'

const FILTERS = [
  ['all', 'All', () => true],
  ['progress', 'In progress', isInProgress],
  ['done', 'Delivered', (o) => o.status === 'delivered'],
]

export default function Orders() {
  const { user } = useUser()
  const { addItem } = useCart()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user) return
    ordersApi.getAll().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false))
  }, [user])

  const shown = useMemo(() => {
    const test = FILTERS.find((f) => f[0] === filter)[2]
    return orders.filter(test)
  }, [orders, filter])

  /* Re-resolve against the live catalogue rather than replaying the stored
     snapshot — a book may have been deleted, gone out of stock, or changed
     price since. The snapshot stays correct as a record of what was bought. */
  const orderAgain = async (order) => {
    try {
      const all = await booksApi.getAll()
      const byId = Object.fromEntries(all.map((b) => [b._id, b]))
      const missing = []
      let added = 0
      for (const item of order.items) {
        const book = byId[String(item.bookId)]
        if (book && book.inStock && book.price > 0) { addItem(book, item.quantity, 'physical'); added++ }
        else missing.push(item.title)
      }
      if (missing.length) toast(`No longer available: ${missing.join(', ')}`)
      if (added === 0) toast.error('None of these are available right now.')
      else toast.success('Added to your cart')
    } catch {
      toast.error('Could not reach the catalogue')
    }
  }
```

- [ ] **Step 3: Render head, filters and cards**

```jsx
  return (
    <>
      <header className="bg-ink-950 text-ink-50 band pt-28 md:pt-32 pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="font-serif text-3xl md:text-5xl">My orders</h1>
          <p className="text-ink-100/65 mt-3">
            {loading ? 'Loading…'
              : orders.length === 0 ? 'No orders yet.'
              : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}, all time.`}
          </p>
          <AccountNav current="orders" />
        </div>
      </header>

      <main className="bg-ink-100 band">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {orders.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-7" role="group" aria-label="Filter orders">
              {FILTERS.map(([key, label]) => (
                <button key={key} type="button" className="pill"
                        aria-pressed={filter === key} onClick={() => setFilter(key)}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="text-center py-12">
              <h2 className="font-serif text-2xl text-ink-900 mb-3">No orders yet</h2>
              <p className="text-ink-600 max-w-[40ch] mx-auto mb-7">
                When you order a book it will appear here, with tracking and receipts.
              </p>
              <Link to="/books" className="btn-primary">Browse the books <span className="arw">→</span></Link>
            </div>
          )}

          {shown.map((order) => (
            <article key={order._id} className="bg-ink-50 border border-ink-950/[.14] rounded-card mb-4 overflow-hidden">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 sm:px-6 py-4 border-b border-ink-950/[.14] bg-white/40">
                <span className="font-semibold text-[.95rem] tracking-[.03em]">{orderRef(order)}</span>
                <span className="text-[.85rem] text-ink-500">{formatDate(order.createdAt)}</span>
                <span className="ml-auto"><StatusPill status={order.status} /></span>
              </div>

              <div className="px-4 sm:px-6 py-4">
                {order.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-[46px_minmax(0,1fr)_auto] gap-3.5 items-center py-2">
                    {item.coverImage
                      ? <img src={cldResize(item.coverImage, 92)} alt="" className="aspect-[2/3] w-full object-cover rounded-edge" />
                      : <div className="aspect-[2/3] w-full rounded-edge bg-brand-900" />}
                    <div className="min-w-0">
                      <div className="text-[.95rem] font-semibold truncate">{item.title}</div>
                      <div className="text-[.82rem] text-ink-500">Paperback · qty {item.quantity}</div>
                    </div>
                    <div className="text-[.9rem] font-semibold whitespace-nowrap">
                      {formatRWF(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 sm:px-6 py-4 border-t border-ink-950/[.14]">
                <span className="text-[.9rem]">
                  Total <b className="font-serif text-xl ml-1.5">{formatRWF(order.totalAmount)}</b>
                </span>
                <span className="text-[.85rem] text-ink-500">
                  {order.deliveryMethod === 'collect'
                    ? 'Collection in person'
                    : formatAddress(order.shippingAddress) || 'Delivery'}
                </span>
                <span className="ml-auto flex flex-wrap gap-2">
                  {order.status === 'delivered'
                    ? <button type="button" onClick={() => orderAgain(order)} className="btn-primary">Order again</button>
                    : <Link to={`/orders/${order._id}`} className="btn-primary">Track order <span className="arw">→</span></Link>}
                  <Link to={`/orders/${order._id}`} className="btn-secondary">View details</Link>
                </span>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  )
}
```

- [ ] **Step 4: Verify**

Run: `cd frontend && npm run dev`
Check: filters narrow the list; a `paid` order shows amber "Preparing", a
`shipped` one sky "On the way", `delivered` moss; "Order again" refills the cart.

- [ ] **Step 5: Hand the commit to the user**

```bash
git add frontend/src/pages/Orders.jsx frontend/src/components/order/AccountNav.jsx
git commit -m "feat(frontend): orders rebuild — account nav, filters, meaningful status colours"
```

---

## Task 17: Order Detail page

**Files:**
- Create: `frontend/src/pages/OrderDetail.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: `ordersApi.getById` (Task 9), order components (Task 12)
- Produces: route `/orders/:id`

- [ ] **Step 1: Write the page**

```jsx
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ordersApi } from '../lib/api'
import { formatDate, orderRef } from '../lib/orders'
import StatusPill from '../components/order/StatusPill'
import OrderRef from '../components/order/OrderRef'
import OrderItems from '../components/order/OrderItems'
import OrderFacts from '../components/order/OrderFacts'
import OrderTimeline from '../components/order/OrderTimeline'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [state, setState] = useState('loading')   // loading | ready | missing

  useEffect(() => {
    ordersApi.getById(id)
      .then((o) => { setOrder(o); setState('ready') })
      // The endpoint scopes by userId, so another user's order is a 404 —
      // indistinguishable from one that does not exist, which is the point.
      .catch(() => setState('missing'))
  }, [id])

  if (state === 'loading') {
    return <div className="bg-ink-100 band pt-28 text-center"><p className="text-ink-500">Loading…</p></div>
  }

  if (state === 'missing') {
    return (
      <div className="bg-ink-100 band pt-28 text-center">
        <h1 className="font-serif text-2xl text-ink-900 mb-3">Order not found</h1>
        <p className="text-ink-600 mb-7">This order does not exist, or it is not on your account.</p>
        <Link to="/orders" className="btn-primary">Back to my orders</Link>
      </div>
    )
  }

  return (
    <>
      <header className="bg-ink-950 text-ink-50 band pt-28 md:pt-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-ink-100/70 hover:text-brand-300 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> All orders
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-serif text-3xl md:text-4xl">Order {orderRef(order)}</h1>
            <StatusPill status={order.status} />
          </div>
          <p className="text-ink-100/65 mt-3">Placed {formatDate(order.createdAt)}</p>
          <div className="mt-6"><OrderRef order={order} onDark /></div>
        </div>
      </header>

      <main className="bg-ink-100 band">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
          <div className="bg-ink-50 border border-ink-950/[.14] rounded-card p-5 md:p-7">
            <h2 className="font-serif text-xl text-ink-900 mb-5">Progress</h2>
            <OrderTimeline order={order} />
          </div>

          <div className="bg-ink-50 border border-ink-950/[.14] rounded-card p-5 md:p-7">
            <h2 className="font-serif text-xl text-ink-900 mb-4">What's in it</h2>
            <OrderItems order={order} />
          </div>

          <OrderFacts order={order} />

          <p className="text-center text-sm text-ink-600">
            Questions about this order? <Link to="/contact" className="link-more">Get in touch</Link>{' '}
            and quote {orderRef(order)}.
          </p>
        </div>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Register the route**

In `frontend/src/App.jsx`, import `OrderDetail` and add inside the `Layout`
block, **after** `/orders` so the static path wins:

```jsx
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
```

- [ ] **Step 3: Verify**

Run: `cd frontend && npm run dev`
Check: "Track order" from `/orders` opens the detail page; the timeline shows
real dates for completed stages; editing an unrelated id in the URL gives the
not-found state rather than an error.

- [ ] **Step 4: Hand the commit to the user**

```bash
git add frontend/src/pages/OrderDetail.jsx frontend/src/App.jsx
git commit -m "feat(frontend): order detail page with tracking timeline"
```

---

## Task 18: Profile page

**Files:**
- Create: `frontend/src/pages/Profile.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: `profileApi` (Task 9), `AccountNav` (Task 16), `lib/rwanda.js`
- Produces: route `/profile`

- [ ] **Step 1: Write the page**

```jsx
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { profileApi } from '../lib/api'
import { useUser } from '../context/UserContext'
import { PROVINCES, districtsFor } from '../lib/rwanda'
import AccountNav from '../components/order/AccountNav'

export default function Profile() {
  const { user, updateProfile } = useUser()
  const [form, setForm] = useState({
    name: '', phone: '', province: 'Kigali City', district: 'Gasabo', sector: '', street: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      province: user.address?.province || 'Kigali City',
      district: user.address?.district || 'Gasabo',
      sector: user.address?.sector || '',
      street: user.address?.street || '',
    })
  }, [user])

  const set = (k) => (e) => {
    const v = e.target.value
    setForm((f) => (k === 'province'
      ? { ...f, province: v, district: districtsFor(v)[0] || '' }
      : { ...f, [k]: v }))
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: {
          province: form.province, district: form.district,
          sector: form.sector.trim(), street: form.street.trim(),
        },
      })
      toast.success('Profile saved')
    } catch (err) {
      toast.error(err.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className="bg-ink-950 text-ink-50 band pt-28 md:pt-32 pb-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="font-serif text-3xl md:text-5xl">Profile</h1>
          <p className="text-ink-100/65 mt-3">Saved here, filled in for you at checkout.</p>
          <AccountNav current="profile" />
        </div>
      </header>

      <main className="bg-ink-100 band">
        <form onSubmit={save} className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-ink-50 border border-ink-950/[.14] rounded-card p-5 md:p-7 mb-5">
            <h2 className="font-serif text-xl text-ink-900 mb-5">You</h2>
            <div className="fld-pair">
              <div className="fld">
                <label htmlFor="name">Full name</label>
                <input id="name" value={form.name} onChange={set('name')} required />
              </div>
              <div className="fld">
                <label htmlFor="email">Email</label>
                <input id="email" value={user?.email || ''} disabled />
                <p className="fld-hint">Your email cannot be changed here.</p>
              </div>
            </div>
            <div className="fld">
              <label htmlFor="phone">Phone number</label>
              <input id="phone" type="tel" value={form.phone} onChange={set('phone')}
                     placeholder="+250 7•• ••• •••" />
              <p className="fld-hint">Used by the courier when a delivery is on its way.</p>
            </div>
          </div>

          <div className="bg-ink-50 border border-ink-950/[.14] rounded-card p-5 md:p-7">
            <h2 className="font-serif text-xl text-ink-900 mb-5">Delivery address</h2>
            <div className="fld-pair">
              <div className="fld">
                <label htmlFor="province">Province / City</label>
                <select id="province" value={form.province} onChange={set('province')}>
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="fld">
                <label htmlFor="district">District</label>
                <select id="district" value={form.district} onChange={set('district')}>
                  {districtsFor(form.province).map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="fld-pair">
              <div className="fld">
                <label htmlFor="sector">Sector</label>
                <input id="sector" value={form.sector} onChange={set('sector')} placeholder="Gikondo" />
              </div>
              <div className="fld">
                <label htmlFor="street">Street or landmark</label>
                <input id="street" value={form.street} onChange={set('street')}
                       placeholder="KK 15 Ave, near SP filling station" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary mt-6 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Register the route**

In `App.jsx`, import `Profile` and add inside the `Layout` block:

```jsx
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
```

- [ ] **Step 3: Verify the round trip**

Run: `cd frontend && npm run dev`
Check: save an address, reload — it persists; open `/checkout` and confirm every
field is pre-filled; changing province resets the district list.

- [ ] **Step 4: Hand the commit to the user**

```bash
git add frontend/src/pages/Profile.jsx frontend/src/App.jsx
git commit -m "feat(frontend): profile page — saved details pre-fill checkout"
```

---

## Task 19: Remove Stripe, final verification

**Files:**
- Modify: `frontend/package.json`, `backend/package.json`
- Modify: `frontend/README.md`

**Interfaces:**
- Consumes: everything
- Produces: nothing

- [ ] **Step 1: Confirm nothing still imports Stripe**

```bash
grep -rn -i "stripe" backend/ frontend/src/ --include=*.js --include=*.jsx | grep -v node_modules
```

Expected: only `.StripeElement` CSS rules in `index.css`, which step 3 removes.
Any JS hit means an earlier task is incomplete — fix it before continuing.

- [ ] **Step 2: Uninstall**

```bash
cd backend  && npm uninstall stripe
cd ../frontend && npm uninstall @stripe/stripe-js @stripe/react-stripe-js
```

- [ ] **Step 3: Drop the orphaned Stripe CSS**

Remove the `.StripeElement`, `.StripeElement--focus` and `.StripeElement--invalid`
rules from `frontend/src/index.css` — Flutterwave renders in its own iframe and
takes no styling from us.

- [ ] **Step 4: Update the README**

In `frontend/README.md`, replace the `VITE_STRIPE_PUBLISHABLE_KEY` line with
`VITE_FLW_PUBLIC_KEY`, and describe the Flutterwave test-mode flow: sign up,
stay in test mode, copy the test keys, and note that Rwandan mobile money
auto-authorizes after a few seconds in test mode.

- [ ] **Step 5: Full verification**

```bash
cd backend  && npm test
cd ../frontend && npm test && npm run build
```

Expected: 17 backend tests pass, 15 frontend tests pass, build succeeds.

Then, by hand against test keys, walk the whole path:

1. Add two books to the cart → totals include 2,000 RWF delivery
2. Checkout step 1 → validation rejects a missing phone
3. Choose collection → address card hides, total drops by 2,000
4. Choose standard → address required again
5. Step 2 → pick MTN MoMo → modal opens with mobile money only
6. Pay (test mode auto-authorizes) → lands on Order Success, **confirmed**
7. Cart is empty; confirmation email arrives
8. `/orders` lists it as amber "Preparing"
9. "Track order" → detail page, timeline shows "Order received" with today's date
10. In `/admin/orders`, set the order to `shipped` → customer timeline gains
    "Out for delivery" with today's date and the pill turns sky "On the way"

Step 10 is the one that proves `statusHistory` is wired end to end.

- [ ] **Step 6: Hand the commit to the user**

```bash
git add -A
git commit -m "chore: remove Stripe, update README for Flutterwave"
```

---

## Going live

No code change. Once Flutterwave KYC is approved, swap four env vars on Render
and one on Vercel from `FLWPUBK_TEST-…`/`FLWSECK_TEST-…` to the live pair, and
re-point the dashboard webhook at the production URL with the same
`FLW_SECRET_HASH`.
