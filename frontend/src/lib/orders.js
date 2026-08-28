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

/** The date a stage completed, from statusHistory, or null if it has not.
    Sorted by time rather than trusting array order: the two backend writers
    both append today, but nothing enforces that, and a timeline showing the
    wrong date against a stage is worse than a cheap sort. */
export function stageDate(order, stage) {
  const history = [...(order?.statusHistory || [])]
    .filter((e) => e && e.at)
    .sort((a, b) => new Date(a.at) - new Date(b.at))
  const hit = history.find((e) => stage.match.includes(e.status))
  return hit ? new Date(hit.at) : null
}

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
