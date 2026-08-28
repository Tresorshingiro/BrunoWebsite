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
                <button key={key} type="button" className="filter-pill"
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

          {/* A filter that matches nothing must say so, or it reads as a page
              that failed to load. */}
          {!loading && orders.length > 0 && shown.length === 0 && (
            <p className="text-ink-600 py-8">No orders in this view.</p>
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
