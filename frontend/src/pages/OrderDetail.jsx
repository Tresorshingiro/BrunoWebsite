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
    let cancelled = false
    ordersApi.getById(id)
      .then((o) => { if (!cancelled) { setOrder(o); setState('ready') } })
      // The endpoint scopes by userId, so another user's order is a 404 —
      // indistinguishable from one that does not exist, which is the point.
      .catch(() => { if (!cancelled) setState('missing') })
    return () => { cancelled = true }
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
