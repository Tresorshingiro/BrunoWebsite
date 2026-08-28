import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, AlertCircle } from 'lucide-react'
import { paymentApi } from '../lib/api'
import { useCart } from '../context/CartContext'
import OrderRef from '../components/order/OrderRef'
import OrderItems from '../components/order/OrderItems'
import OrderFacts from '../components/order/OrderFacts'
import OrderTimeline from '../components/order/OrderTimeline'

/* Three states, not one. The page this replaces called clearCart() and declared
   success inside its own catch block, so a failed confirmation was
   indistinguishable from a successful one. A redirect from a payment provider
   is not proof of payment — only the server's verification is. */
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
