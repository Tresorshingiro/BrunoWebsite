import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '../context/CartContext'
import { paymentApi } from '../lib/api'
import toast from 'react-hot-toast'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise =
  stripePublishableKey && typeof stripePublishableKey === 'string' && stripePublishableKey.startsWith('pk_')
    ? loadStripe(stripePublishableKey)
    : null

function CheckoutForm({ clientSecret, paymentIntentId, orderItems, total, customerName, customerEmail, shippingAddress, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
          receipt_email: customerEmail,
          payment_method_data: {
            billing_details: {
              name: customerName,
              email: customerEmail,
              address: shippingAddress?.street ? {
                line1: shippingAddress.street,
                city: shippingAddress.city,
                state: shippingAddress.state,
                country: shippingAddress.country,
                postal_code: shippingAddress.zipCode,
              } : undefined,
            },
          },
        },
      })
      if (error) {
        toast.error(error.message || 'Payment failed')
        setProcessing(false)
        return
      }
      // Store for order-success page (in case redirect doesn't include query params in some flows)
      sessionStorage.setItem('pendingOrder', JSON.stringify({
        paymentIntentId,
        customerName,
        customerEmail,
        items: orderItems,
        shippingAddress: shippingAddress || {},
        total,
      }))
      onSuccess()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn-primary w-full mt-6 disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay ${total.toLocaleString()} RWF`}
      </button>
    </form>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, totalAmount, clearCart } = useCart()
  const [step, setStep] = useState('form')
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [orderItems, setOrderItems] = useState([])
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0 && !clientSecret) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-600 mb-4">Your cart is empty.</p>
        <button type="button" onClick={() => navigate('/books')} className="btn-primary">
          Browse Books
        </button>
      </div>
    )
  }

  const handleContinueToPayment = async (e) => {
    e.preventDefault()
    if (!form.customerName?.trim() || !form.customerEmail?.trim()) {
      toast.error('Please enter your name and email.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = {
        items: items.map(({ book, quantity, format }) => ({
          bookId: book._id,
          quantity,
          format: format || 'physical',
        })),
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
      }
      if (form.street || form.city || form.country) {
        payload.shippingAddress = {
          street: form.street || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          country: form.country || undefined,
          zipCode: form.zipCode || undefined,
        }
      }
      const res = await paymentApi.createIntent(payload)
      setClientSecret(res.clientSecret)
      setPaymentIntentId(res.paymentIntentId)
      setOrderItems(res.orderItems || [])
      setStep('payment')
      sessionStorage.setItem('pendingOrder', JSON.stringify({
        paymentIntentId: res.paymentIntentId,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        items: res.orderItems,
        shippingAddress: payload.shippingAddress || {},
        total: res.total,
      }))
    } catch (err) {
      setError(err.message || 'Failed to initialize payment')
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <h1 className="section-heading mb-8">Checkout</h1>

        {step === 'form' && (
          <form onSubmit={handleContinueToPayment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-ink-200 focus:ring-2 focus:ring-brand-500"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.customerEmail}
                onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-ink-200 focus:ring-2 focus:ring-brand-500"
                placeholder="you@example.com"
              />
            </div>
            <div className="border-t border-ink-100 pt-4">
              <p className="text-sm font-medium text-ink-700 mb-3">Shipping address (optional for digital)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                  className="sm:col-span-2 w-full px-4 py-2 rounded-lg border border-ink-200"
                  placeholder="Street"
                />
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-ink-200"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-ink-200"
                  placeholder="State"
                />
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-ink-200"
                  placeholder="Country"
                />
                <input
                  type="text"
                  value={form.zipCode}
                  onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-ink-200"
                  placeholder="ZIP / Postal code"
                />
              </div>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex justify-between items-center">
              <button type="button" onClick={() => navigate('/cart')} className="text-ink-600 hover:underline">
                Back to cart
              </button>
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                {loading ? 'Loading...' : `Continue to payment (${totalAmount.toLocaleString()} RWF)`}
              </button>
            </div>
          </form>
        )}

        {step === 'payment' && clientSecret && (
          <div>
            <p className="text-ink-600 mb-2">Complete your payment below.</p>
            <p className="font-medium text-ink-900">Total: {(orderItems.reduce((s, i) => s + i.price * i.quantity, 0)).toLocaleString()} RWF</p>
            {!stripePromise ? (
              <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                <p className="font-medium">Payment form not configured</p>
                <p className="mt-1">Set <code className="bg-amber-100 px-1 rounded">VITE_STRIPE_PUBLISHABLE_KEY</code> in your frontend <code className="bg-amber-100 px-1 rounded">.env</code> (use the same value as <code className="bg-amber-100 px-1 rounded">STRIPE_PUBLISHABLE_KEY</code> from the backend) to enable Stripe checkout.</p>
              </div>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: { colorPrimary: '#2e949c' },
                  },
                }}
              >
                <CheckoutForm
                  clientSecret={clientSecret}
                  paymentIntentId={paymentIntentId}
                  orderItems={orderItems}
                  total={orderItems.reduce((s, i) => s + i.price * i.quantity, 0)}
                  customerName={form.customerName}
                  customerEmail={form.customerEmail}
                  shippingAddress={
                    form.street || form.city || form.country
                      ? {
                          street: form.street,
                          city: form.city,
                          state: form.state,
                          country: form.country,
                          zipCode: form.zipCode,
                        }
                      : undefined
                  }
                  onSuccess={() => {
                    clearCart()
                    navigate('/order-success?payment_intent=' + paymentIntentId)
                  }}
                />
              </Elements>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
