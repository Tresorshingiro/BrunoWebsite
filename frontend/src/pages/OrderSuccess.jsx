import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { paymentApi } from '../lib/api'
import { useCart } from '../context/CartContext'

export default function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const paymentIntentId = searchParams.get('payment_intent')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(!!paymentIntentId)
  const { clearCart } = useCart()

  useEffect(() => {
    if (!paymentIntentId) {
      const raw = sessionStorage.getItem('pendingOrder')
      if (raw) {
        try {
          const data = JSON.parse(raw)
          if (data.paymentIntentId) {
            sessionStorage.removeItem('pendingOrder')
            confirmOrder(data)
          }
        } catch (_) {}
      }
      return
    }
    const raw = sessionStorage.getItem('pendingOrder')
    if (!raw) {
      setLoading(false)
      setConfirmed(true)
      return
    }
    try {
      const data = JSON.parse(raw)
      if (data.paymentIntentId === paymentIntentId) {
        sessionStorage.removeItem('pendingOrder')
        confirmOrder(data)
      } else {
        setLoading(false)
      }
    } catch (_) {
      setLoading(false)
    }
  }, [paymentIntentId])

  async function confirmOrder(data) {
    try {
      await paymentApi.confirmOrder({
        paymentIntentId: data.paymentIntentId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        items: data.items,
        shippingAddress: data.shippingAddress,
        total: data.total,
      })
      clearCart()
      setConfirmed(true)
    } catch (_) {
      clearCart()
      setConfirmed(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <p className="text-ink-600">Confirming your order...</p>
      </div>
    )
  }

  return (
    <div className="py-16 md:py-24 text-center">
      <div className="max-w-lg mx-auto px-4">
        <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl text-ink-900 mb-2">Thank you for your order</h1>
        <p className="text-ink-600 mb-8">
          Your payment was successful. You will receive a confirmation by email shortly.
        </p>
        <Link to="/books" className="btn-primary">
          Continue browsing
        </Link>
      </div>
    </div>
  )
}
