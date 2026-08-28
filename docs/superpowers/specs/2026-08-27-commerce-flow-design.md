# Commerce Flow — Payment Migration, Cart, Checkout, Orders

**Date:** 2026-08-27
**Status:** Approved, ready for implementation planning
**Scope:** Frontend **and** backend. Payment provider migration plus five pages.
**Mockups:** `~/Downloads/bruno-cart.html`, `bruno-checkout.html`,
`bruno-order-success.html`, `bruno-orders.html` (2026-08-27)

## Context

The site is a React 18 / Vite 5 / Tailwind 3 frontend with an Express 5 /
Mongoose 9 backend, for author Bruno Iradukunda. The 2026-08-25 redesign
established the editorial moss/aqua/paper design system and rebuilt Home,
About and My Work. This pass takes the same treatment through the commerce
flow — and, unlike that one, it is not frontend-only.

Four mockups propose redesigns of Cart, Checkout, Order Success and Orders.
They also imply a fifth page (Order Detail) that has never existed, and they
depend on backend capabilities the project does not currently have: delivery
pricing, Rwandan address fields, a customer-facing single-order endpoint, and
per-status timestamps.

Most importantly, the checkout mockup leads with **MTN Mobile Money and Airtel
Money**. Stripe offers neither, and does not onboard businesses in Rwanda at
all — which is also the root cause of the currency bug tracked since
2026-08-25. That makes a payment provider change the precondition for the
rest of the work, not a follow-up to it.

**The orders collection is empty.** No real order has ever been placed through
the site. Every schema change below is therefore a clean replacement with no
migration path and no legacy accommodation.

## Decisions

Settled with the project owner before writing this spec:

| Decision | Choice | Rationale |
|---|---|---|
| Payment provider | **Flutterwave v3**, replacing Stripe | Settles MTN MoMo and Airtel Money in Rwanda natively; prices in RWF; local settlement ~24h |
| API version | **v3**, not v4 | v4 is public beta with a different (OAuth 2.0) auth model; v3 is the stable path with no deprecation planned. One moving part at a time during a migration |
| Integration shape | **Our tiles → Flutterwave inline modal, scoped by `payment_options`** | Keeps the mockup's payment card; card data never touches our code, so no PCI surface |
| Scope | **One pass** — payment, schema and all pages together | A delivery-method selector with no shipping field behind it is a lie; Order Detail cannot exist without a user-scoped endpoint |
| Delivery | **2,000 RWF flat anywhere in Rwanda**, collection free | Owner decision. One constant, one field, no zone lookup |
| Delivery options | **Standard and collect-in-person only** | Owner decision — the mockup's next-day tier is dropped |
| Account nav | **Orders / Profile / Sign out** | Addresses folds into Profile; Email preferences is already served by the unsubscribe link in every email |
| Checkout nav | **Stripped** — wordmark and a secure-checkout lock only | Fewer escape routes mid-purchase. Needs a third `Header` variant |
| Typography | **Unchanged** — Cormorant Garamond + Source Sans 3 | Consistent with 2026-08-25; the mockups' Fraunces/Newsreader/Archivo is not adopted |
| Currency bug | **Fixed by the migration itself** | Flutterwave takes RWF as whole numbers; the `* 100` disappears rather than being patched |

## Non-goals

- Receipt PDF generation (the mockup's "Download PDF" link is omitted, not shipped dead)
- Status-change notification emails — only the order confirmation is built
- Multiple saved addresses per user
- International checkout — routes to the contact form, matching existing Books copy
- Digital editions — see §4.1
- The admin panel's visual redesign (a correctness pass only, §9)
- The public admin-registration endpoint and the SMTP subscriber bug, both still open from the 2026-08-26 analysis

---

## 1. Why the payment layer changes first

Three defects in the current Stripe integration are fixed structurally by this
migration rather than individually:

**1. The currency bug (live money).** `paymentController.js:44` creates
PaymentIntents with `currency: 'usd'` and `amount: Math.round(total * 100)`,
while every price surface renders RWF. A 20,000 RWF book charges $20,000 USD.
Flutterwave takes RWF natively as a whole number — `amount: 20000` means
20,000 RWF — so the multiplication and the presentment-currency question both
cease to exist.

**2. Client-trusted totals.** `confirmOrder` verifies that a PaymentIntent
succeeded, then saves `items` and `total` **straight from the request body**,
never comparing them against what was actually charged. The fix is structural:
the order is created *before* payment, so verification has a trustworthy stored
total to compare against (§2).

**3. No webhook.** If the browser closes between payment and `confirm-order`,
Stripe holds the money and no order exists. Flutterwave webhooks are part of
the design below, and converge with the browser callback on one idempotent
handler.

---

## 2. Payment flow

```
Checkout step 1  ──▶  POST /api/payment/initiate        (userAuthMiddleware)
                      · re-prices every item from the DB
                      · deliveryFee = 2000 | 0 by method
                      · generates tx_ref
                      · saves Order  status: 'pending'
                      · returns { txRef, amount, publicKey, customer, summary }
                              │
                      FlutterwaveCheckout({ payment_options: <chosen tile> })
                              │
                      customer pays
                              │
                      redirect → /order-success?status=…&tx_ref=…&transaction_id=…
                              │
       ┌──────────────────────┴──────────────────────┐
       ▼                                             ▼
POST /api/payment/verify                    POST /api/payment/webhook
(browser returned)                          (always; survives a closed browser)
       └──────────────────────┬──────────────────────┘
                              ▼
                      markOrderPaid()  — idempotent
```

### 2.1 Creating the order before payment

`initiate` writes a `pending` Order and returns only a `txRef` and an amount.
This is the load-bearing decision of the whole design: it means the amount to
verify against is **server-computed and stored** before the customer ever
reaches a payment form. Nothing the client sends afterwards can change it.

`tx_ref` format: `BRUNO-<timestamp>-<6 random chars>`, unique.

### 2.2 Verification rules

Both `verify` and the webhook call Flutterwave's
`GET /v3/transactions/:id/verify` (`flw.Transaction.verify({ id })`) and refuse
to mark an order paid unless **all** of the following hold:

| Check | Rule |
|---|---|
| Status | `data.status === 'successful'` |
| Currency | `data.currency === 'RWF'` |
| Reference | `data.tx_ref === order.txRef` |
| Amount | `data.amount >= order.totalAmount` |

Any failure leaves the order `pending` and is logged. A customer is never told
an order succeeded on the strength of a redirect alone.

`markOrderPaid(order, flwData)` is **idempotent** — if the order is already
`paid`, it returns unchanged. The webhook and the browser callback routinely
both arrive; whichever is second must be a no-op.

### 2.3 Webhook

`POST /api/payment/webhook`, public but hash-verified: the `verif-hash` header
must equal `process.env.FLW_SECRET_HASH`. Mismatches return 401 without
touching the database.

Registered in the Flutterwave dashboard against the Render URL. Must be mounted
**before** any auth middleware and must not require a user token.

### 2.4 The four tiles

The mockup draws MTN MoMo / Airtel Money / Card / Bank transfer. Under Standard
checkout these map to:

| Tile | `payment_options` |
|---|---|
| MTN Mobile Money | `mobilemoneyrwanda` |
| Airtel Money | `mobilemoneyrwanda` |
| Card | `card` |
| Bank transfer | `banktransfer` |

> **Note for implementation:** MTN and Airtel both route to the same
> `payment_options` value — Flutterwave's Rwanda mobile money form detects the
> network from the number prefix. The two tiles are a recognition affordance,
> not two code paths. Confirm the exact option strings against current docs
> before building; they are the one detail here taken from documentation rather
> than from a working integration.

### 2.5 Endpoints

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /api/payment/initiate` | user | replaces `create-intent` |
| `POST /api/payment/verify` | user | replaces `confirm-order` |
| `POST /api/payment/webhook` | hash | **new** |
| `GET /api/users/orders/:id` | user | **new**, scoped to `req.user.id` |

That last one is why Order Detail cannot exist today:
`GET /api/payment/orders/:id` is admin-only, so a customer has no way to fetch
one of their own orders.

### 2.6 Packages and environment

Removed: `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`.
Added: `flutterwave-node-v3`, `flutterwave-react-v3`.

```
# backend/.env
FLW_PUBLIC_KEY=FLWPUBK_TEST-...
FLW_SECRET_KEY=FLWSECK_TEST-...
FLW_ENCRYPTION_KEY=FLWSECK_TEST...
FLW_SECRET_HASH=<invented; must match the dashboard webhook config>

# frontend/.env
VITE_FLW_PUBLIC_KEY=FLWPUBK_TEST-...
```

Also fix `backend/.env.example`, which documents `MONGODB_URI` while
`server.js:69` reads `MONGO_URI`.

`DELIVERY_FEE = 2000` is declared on both sides — `backend/config/delivery.js`
and `frontend/src/lib/orders.js` — each commenting the other as its twin. The
**server recomputes it on every `initiate` and never reads the client's
number**; the frontend copy exists only so the cart can show a total before
checkout begins.

---

## 3. Data model

### 3.1 Order

```js
txRef            { type: String, required: true, unique: true, index: true }
flwTransactionId { type: String }
paymentMethod    { type: String, enum: ['momo','airtel','card','bank'] }

customerName     { type: String, required: true, trim: true }
customerEmail    { type: String, required: true, lowercase: true, trim: true }
customerPhone    { type: String, required: true, trim: true }   // courier calls it

items            [orderItemSchema]        // unchanged
subtotal         { type: Number, required: true }
deliveryFee      { type: Number, default: 0 }
totalAmount      { type: Number, required: true }   // subtotal + deliveryFee

deliveryMethod   { type: String, enum: ['standard','collect'], default: 'standard' }
signed           { type: Boolean, default: false }
notes            { type: String }         // delivery notes from the form

shippingAddress: {
  province: String,   // e.g. 'Kigali City'
  district: String,   // e.g. 'Kicukiro'
  sector:   String,   // e.g. 'Gikondo'
  street:   String,   // street or landmark
}

statusHistory    [{ status: String, at: Date, note: String }]
status           // enum unchanged
```

`stripePaymentIntentId` is **removed**, not deprecated — the collection is empty.

`shippingAddress` replaces the previous `{street, city, state, country,
zipCode}`. Rwandan addresses have no State and no ZIP; asking for them produced
the empty fields that render as the mockup's flagged
`"Gikondo, Kigali, , Rwanda"`.

### 3.2 statusHistory

This is what makes the mockup's timeline honest. Today only `createdAt` and
`updatedAt` exist, so "Delivered 17 March" is unrenderable — it would be a
guess. An entry is pushed on creation (`pending`), on payment (`paid`), and by
the admin on every subsequent change. The timeline renders a real date for each
completed stage and leaves future stages undated.

**If `updateOrderStatus` does not push to `statusHistory`, the customer-facing
timeline is permanently empty.** See §9.

### 3.3 User

`User.address` changes to the same four-field Rwandan shape, so a saved profile
can pre-fill checkout and a checkout can offer to save back.

### 3.4 Status vocabulary

The enum does not change; only its presentation does.

| status | Label | Tone |
|---|---|---|
| `pending` | Awaiting payment | neutral |
| `paid` | Preparing | amber |
| `processing` | Preparing | amber |
| `shipped` | On the way | sky |
| `delivered` | Delivered | moss |
| `cancelled` | Cancelled | rose |
| `refunded` | Refunded | neutral |

Colours map to meaning: amber in progress, sky moving, moss done. Currently
`Orders.jsx:22` gives Paid and Delivered the same green and Shipped an
off-palette purple, so the badge carries no information at a glance.

`sky` (#2F6690) is added to the Tailwind palette — it is the one colour in the
mockups with no existing token.

---

## 4. Shared modules

Order Success and Order Detail are ~70% identical content — items and totals,
address, payment, timeline. Only the framing differs: one celebrates, one
informs. The body is therefore factored out once.

```
frontend/src/components/order/
  OrderItems.jsx      item rows + subtotal / delivery / total
  OrderTimeline.jsx   statusHistory → four stages
  OrderFacts.jsx      "Delivering to" ∥ "Paid with"
  OrderRef.jsx        the #REF pill with copy-to-clipboard
  StatusPill.jsx      label + tone from status

frontend/src/lib/orders.js
  DELIVERY_FEE, formatRWF, formatAddress,
  statusLabel, statusTone, orderRef, isInProgress

frontend/src/lib/rwanda.js
  PROVINCES → DISTRICTS (5 provinces, 30 districts)
```

`formatAddress(parts)` filters empty values **before** joining. Every address
render on the site goes through it.

`orderRef(order)` returns `#` + the last 8 characters of `_id`, uppercased —
the convention already used at `Orders.jsx:66`.

`isInProgress(order)` is true for `paid`, `processing` and `shipped` — the
statuses where the customer is waiting for something. It drives the Orders
filter pills. `pending` is deliberately excluded: an unpaid order is not in
progress, and grouping it with paid ones would imply work is happening on it.
`cancelled` and `refunded` appear only under "All".

`computeTotals(items, deliveryMethod)` is the **server-side** counterpart, in
`backend/config/delivery.js`. It is the single place a total is ever produced,
called by `initiate` and asserted against in tests (§10). The frontend never
computes an authoritative total — only a display estimate.

### 4.1 Format

Everything is physical. `BookDetail.jsx:112` hardcodes
`addItem(book, qty, 'physical')` and the Books FAQ states paperback is the only
edition, so the cart's `digital` branch is already unreachable. The field stays
on the model; no digital option is offered, and delivery therefore always
applies.

---

## 5. Pages

### 5.1 Cart

Dark head band; items left, **sticky summary card right**. The current page puts
the total and the checkout button in a bare flex row under the items, giving
the most important control on the page the least emphasis.

- Item row: 88px cover (2:3), aqua format label, title link, unit price, quantity stepper, quiet Remove, line total. Below 640px the thumb drops to 68px and the line total moves under the title.
- **Remove is a quiet underlined text button**, hover rose. Red is for errors; removing a book from a cart is not an error.
- Delivery is stated **in the cart**, not discovered at checkout — an unexplained jump in the total is a common abandon point.
- Assurance list: secure checkout, delivery time, signed copies.
- Empty state: framed mark, heading, and the two available titles as suggestion rows fetched from `booksApi.getAll()`. An empty screen is a place to offer something.

**Stale prices.** The cart stores whole book objects in `localStorage`, so a
price edited in the admin panel persists in a customer's cart indefinitely. The
server re-prices on `initiate`, so nobody is ever charged the stale figure — but
they would see one number and be charged another. **Cart re-fetches its books
on mount** and updates the stored copies.

### 5.2 Checkout

Two steps with an indicator. Without one, "Continue to payment" reads as the
final action and the second screen feels like an error.

**Step 1 — three cards:**

1. *Who's ordering* — name, email, **phone (required)**. The courier calls before delivering; the current form has no phone field at all.
2. *Where it's going* — Province → District (dependent select) → Sector → street or landmark → delivery notes. Hidden entirely when collection is chosen.
3. *How it gets there* — Standard delivery 2,000 RWF, or collect in person, free. Plus the "ask Bruno to sign this copy" checkbox.

**Collection orders require no address.** Province, district, sector and street
are validated only when `deliveryMethod === 'standard'`; choosing collection
hides the card and stores an empty `shippingAddress`. Name, email and phone stay
required either way — the pickup is arranged by phone.

A **"save these details to my profile"** checkbox sits under the address card,
checked by default for logged-in users whose profile is still empty. It writes
through the same `PUT /api/users/profile` as §5.6.

**Step 2 — payment:** the four tiles, then the Flutterwave modal scoped to the
chosen method (§2.4).

Sticky order summary throughout, with an Edit cart link. Saved profile details
pre-fill every field.

### 5.3 Order Success

Celebration head — tick, heading, and the `#REF` pill with copy-to-clipboard —
then the shared body, the timeline, and "Track this order".

Three states, not one:

| State | Behaviour |
|---|---|
| Verifying | "Confirming your payment…" — no claims made |
| Verified | Full confirmation, cart cleared |
| Not confirmed | "Payment is still processing" + the ref + contact route. **Never** a success message |

The current page calls `clearCart()` and declares success **inside its own
`catch` block** (`OrderSuccess.jsx:57`), so a failed confirmation is
indistinguishable from a successful one.

### 5.4 Orders

Account nav strip, filter pills (All / In progress / Delivered, client-side),
and order cards: header (ref, date, status), body (items), footer (total,
delivery summary, actions). Delivered orders offer "Order again", which pushes
the items back into the cart. Empty state as drawn.

**"Order again" re-resolves each item against the live catalogue** rather than
trusting the order's stored snapshot — a book may have been deleted, gone out of
stock, or changed price since. Titles that no longer resolve are skipped with a
toast naming them; if none resolve, the button routes to `/books` instead. The
stored snapshot stays correct as a historical record of what was bought.

### 5.5 Order Detail — `/orders/:id` — new

Back link, `#REF`, date, status pill. The **timeline is the main event**, then
the shared body, then help text quoting the reference. This is the destination
"Track order" and "View details" have been pointing at.

Fetches `GET /api/users/orders/:id`. A 404 (including another user's order,
which is scoped out server-side) renders a not-found state, not an error toast.

### 5.6 Profile — `/profile` — new

Name, email (read-only), phone, and delivery address in the Rwandan shape.
Saves through the existing `PUT /api/users/profile`. Its purpose is
checkout pre-fill.

---

## 6. Navigation

`Header` gains a third variant:

```jsx
<Header variant="overlay" />   // dark-hero pages
<Header variant="solid"   />   // light pages
<Header variant="minimal" />   // '/checkout' only — wordmark + secure lock
```

**Minimal** removes the nav links, cart and account menu. Fewer ways to wander
off mid-purchase. Order Success and Checkout also get a reduced footer.

`OVERLAY_ROUTES` in `Layout.jsx` gains `/cart`, `/orders`, `/profile` and the
`/orders/` prefix — all now open with dark bands and currently receive the
solid nav.

---

## 7. Order confirmation email

The success page says "a receipt is on its way to your email." **No order email
exists anywhere in the codebase.** Rather than delete the sentence, the email is
built: `sendOrderConfirmation(order)` in a new `backend/services/orderEmail.js`,
using the same SendGrid HTTP path as `contactController` — which works, unlike
the SMTP path `subscriberController` still uses.

Called from `markOrderPaid`, fire-and-forget, failure logged and never blocking
the response.

---

## 8. Motion

Restraint. These are transactional pages: the existing `Reveal` and section
stagger carry them, and nothing tilts or parallaxes.

| Target | Effect |
|---|---|
| Success tick | Single pop on mount |
| Timeline dots | Completed stages fill in sequence |
| Quantity stepper | Number cross-fades on change |

All three sit behind the top-level `prefers-reduced-motion` guard in
`index.css`. Forms reuse the existing `.fld`, `.fld-pair` and `.detail` classes
built for the Contact page rather than introducing a second form system.

---

## 9. Admin panel — correctness pass

Not a redesign, but required in the same change:

- `updateOrderStatus` **must push a `statusHistory` entry**, or the customer-facing timeline is permanently empty and §3.2 is decorative.
- `AdminOrders.jsx` reads the old address shape and must move to `formatAddress`.
- It must display `customerPhone`, `deliveryMethod`, `deliveryFee` and the `signed` flag — the phone especially, since fulfilment depends on it.
- Status labels align with §3.4 so admin and customer describe an order identically.

---

## 10. Testing

The project has no test infrastructure. This spec does not propose fixing that
generally — but this change moves money, so **Vitest** is added with a small
suite covering exactly the expensive-to-be-wrong parts:

- `computeTotals()` — subtotal from DB prices, fee by delivery method, total
- The verification guard — a mismatched amount, wrong currency, or wrong `tx_ref` is **rejected**
- `markOrderPaid` idempotency — webhook and callback both arriving
- `formatAddress` with missing fields; `statusLabel` / `statusTone`; `formatRWF`

~15 tests against pure functions plus one mocked Flutterwave response. No React
rendering.

Then end-to-end by hand in **Flutterwave test mode**, where Rwandan mobile money
charges auto-authorize after a few seconds — so the full MoMo path is
exercisable without a phone or real money.

---

## 11. Rollout

1. Sign up; the account starts in **test mode automatically**, no KYC required.
2. Build and test everything against test keys.
3. Submit KYC in parallel — business documents, legal address, and either a website or a social account (the site satisfies this).
4. On approval the account flips to live; swap the four env vars on Render and Vercel. **No code change.**

Development never waits on approval.

---

## 12. Files touched

```
backend/models/Order.js                      RW address, delivery, statusHistory, txRef
backend/models/User.js                       RW address shape
backend/controllers/paymentController.js     rewrite: initiate / verify / webhook
backend/controllers/userController.js        getOrder (single, scoped)
backend/routes/payment.js                    new routes
backend/routes/users.js                      GET /orders/:id
backend/services/orderEmail.js               new
backend/config/delivery.js                   new — DELIVERY_FEE
backend/.env.example                         FLW keys; MONGO_URI fix
backend/package.json                         -stripe +flutterwave-node-v3

frontend/src/lib/orders.js                   new — formatters, fee, status maps
frontend/src/lib/rwanda.js                   new — provinces → districts
frontend/src/lib/api.js                      payment + order endpoints
frontend/src/components/order/*.jsx          new — 5 shared components
frontend/src/components/Header.jsx           minimal variant
frontend/src/components/Footer.jsx           reduced variant
frontend/src/components/Layout.jsx           overlay routes, variant routing
frontend/src/pages/Cart.jsx                  rebuild
frontend/src/pages/Checkout.jsx              rebuild — two steps, Flutterwave
frontend/src/pages/OrderSuccess.jsx          rebuild — three states
frontend/src/pages/Orders.jsx                rebuild
frontend/src/pages/OrderDetail.jsx           new
frontend/src/pages/Profile.jsx               new
frontend/src/App.jsx                         /orders/:id, /profile
frontend/src/admin/AdminOrders.jsx           correctness pass
frontend/tailwind.config.js                  sky token
frontend/src/index.css                       status pills, steps, timeline
frontend/package.json                        -stripe +flutterwave-react-v3
```

---

## 13. Known issues carried forward

Still open from the 2026-08-26 analysis, deliberately out of scope:

- **`POST /api/auth/register` is unauthenticated** — anyone can mint an admin account. This is the most serious remaining defect in the project and should be the next piece of work after this one.
- `subscriberController` still sends over SMTP on a host that blocks it; those emails are silently failing.
- `findByIdAndUpdate` spreads `req.body` wholesale in the book/blog/event controllers.
- `Event.isPast` only recomputes in `pre('save')`, so admin edits never refresh it.
- No rate limiting, no helmet, no request validation.
- 833 KB unsplit JS bundle.
