import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { paymentApi } from '../lib/api'
import { PROVINCES, districtsFor } from '../lib/rwanda'
import { formatRWF, DELIVERY_FEE } from '../lib/orders'
import { cldResize } from '../lib/images'

/* MTN and Airtel both map to `mobilemoneyrwanda` — Flutterwave's Rwanda form
   detects the network from the number prefix, so the two tiles are a
   recognition affordance rather than two code paths.

   The mockup's fourth tile, bank transfer, is not offered: Flutterwave lists
   only `card` and `mobilemoneyrwanda` for RWF, and the option string the plan
   carried (`banktransfer`) is not valid in any currency — it is `bank transfer`
   with a space, and NGN only. A tile that opens a modal with nothing in it is
   worse than one tile fewer. */
const PAY_TILES = [
  { id: 'momo', name: 'MTN Mobile Money', sub: 'Pay from your MoMo balance', opt: 'mobilemoneyrwanda' },
  { id: 'airtel', name: 'Airtel Money', sub: 'Pay from your Airtel wallet', opt: 'mobilemoneyrwanda' },
  { id: 'card', name: 'Card', sub: 'Visa or Mastercard', opt: 'card' },
]

const DELIVERY_OPTIONS = [
  ['standard', 'Standard delivery', formatRWF(DELIVERY_FEE), 'Flat rate anywhere in Rwanda, 2–3 working days in Kigali.'],
  ['collect', 'Collect in person', 'Free', 'Pick up at a Vital Readings event, or arrange a time.'],
]

export default function Checkout() {
  const navigate = useNavigate()
  const { items, totalAmount } = useCart()
  const { user, updateProfile } = useUser()

  const [step, setStep] = useState(1)
  const [method, setMethod] = useState('momo')
  const [saveProfile, setSaveProfile] = useState(true)
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(null)   // { orderId, txRef, amount, publicKey, customer }

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

  /* Once the server has priced the order, the summary shows *its* figures. The
     cart's numbers can be stale — the server re-prices from the catalogue — and
     a page that quotes one total beside a button charging another is the exact
     confusion the pre-payment order write exists to prevent. */
  const view = session?.summary
    ? {
        lines: session.summary.items.map((i) => ({
          key: `${i.bookId}-${i.format}`, title: i.title,
          coverImage: i.coverImage, price: i.price, quantity: i.quantity,
        })),
        subtotal: session.summary.subtotal,
        deliveryFee: session.summary.deliveryFee,
        total: session.summary.total,
      }
    : {
        lines: items.map(({ book, quantity, format }) => ({
          key: `${book._id}-${format}`, title: book.title,
          coverImage: book.coverImage, price: book.price || 0, quantity,
        })),
        subtotal: totalAmount,
        deliveryFee,
        total,
      }

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
        // Saving is a convenience; never block checkout. updateProfile also
        // refreshes the context user, so /profile does not show stale details.
        updateProfile({
          name: form.customerName.trim(),
          phone: form.customerPhone.trim(),
          address: collecting ? undefined : {
            province: form.province, district: form.district,
            sector: form.sector.trim(), street: form.street.trim(),
          },
        }).catch(() => {})
      }
    } catch (err) {
      toast.error(err.message || 'Could not start checkout')
    } finally {
      setLoading(false)
    }
  }

  const tile = PAY_TILES.find((t) => t.id === method) || PAY_TILES[0]

  // The server sends the key it initiated against; the env var is a fallback so
  // a missing FLW_PUBLIC_KEY on the server fails loudly rather than silently.
  const publicKey = session?.publicKey || import.meta.env.VITE_FLW_PUBLIC_KEY

  const openPayment = useFlutterwave(session ? {
    public_key: publicKey,
    tx_ref: session.txRef,
    amount: session.amount,
    currency: 'RWF',            // whole numbers — never multiply by 100
    payment_options: tile.opt,  // only the method the customer picked
    customer: session.customer,
    customizations: {
      title: 'Bruno Iradukunda',
      description: 'Book order',
    },
  } : {})

  const pay = () => {
    if (!session) return
    if (!publicKey) {
      toast.error('Payment is not configured. Please contact us and we will take the order by hand.')
      return
    }
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
            {step === 1 ? (
              <form onSubmit={continueToPayment} noValidate>
                <Card title="Who's ordering" note="We'll send your receipt here.">
                  <div className="fld-pair">
                    <div className="fld">
                      <label htmlFor="name">Full name <Req /></label>
                      <input id="name" type="text" required autoComplete="name" placeholder="Jane Uwase"
                             value={form.customerName} onChange={set('customerName')} />
                    </div>
                    <div className="fld">
                      <label htmlFor="email">Email <Req /></label>
                      <input id="email" type="email" required autoComplete="email" placeholder="you@example.com"
                             value={form.customerEmail} onChange={set('customerEmail')} />
                    </div>
                  </div>
                  {/* Phone is not optional in Rwanda: the courier calls before delivering. */}
                  <div className="fld !mb-0">
                    <label htmlFor="phone">Phone number <Req /></label>
                    <input id="phone" type="tel" required autoComplete="tel" placeholder="+250 7•• ••• •••"
                           value={form.customerPhone} onChange={set('customerPhone')} />
                    <p className="fld-hint">The courier will call this number before delivering.</p>
                  </div>
                </Card>

                {/* Ahead of the address, because choosing collection removes it. */}
                <Card title="How it gets there">
                  <div className="grid gap-2.5">
                    {DELIVERY_OPTIONS.map(([value, label, price, desc]) => (
                      <label key={value} className={`flex items-start gap-3.5 p-4 border rounded-edge cursor-pointer transition-colors ${
                        form.deliveryMethod === value
                          ? 'border-brand-900 bg-brand-600/[.07]'
                          : 'border-ink-950/[.14] bg-white hover:border-brand-600'
                      }`}>
                        <input type="radio" name="ship" value={value}
                               checked={form.deliveryMethod === value}
                               onChange={set('deliveryMethod')}
                               className="mt-1 accent-brand-900 flex-none" />
                        <span className="flex-1">
                          <span className="font-semibold text-[.95rem] flex justify-between gap-4">
                            <span>{label}</span><span>{price}</span>
                          </span>
                          <span className="block text-[.86rem] text-ink-600 mt-0.5">{desc}</span>
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-5 pt-5 border-t border-ink-950/[.14]">
                    <label className="flex items-start gap-2.5 text-[.92rem] cursor-pointer">
                      <input type="checkbox" checked={form.signed} onChange={set('signed')}
                             className="mt-1 accent-brand-900 flex-none" />
                      <span>Ask Bruno to sign this copy — no extra charge, adds a day or two.</span>
                    </label>
                  </div>
                </Card>

                {!collecting && (
                  <>
                    <Card title="Where it's going" note="All fields required — these are physical books.">
                      <div className="fld-pair">
                        <div className="fld">
                          <label htmlFor="province">Province / City <Req /></label>
                          <select id="province" value={form.province} onChange={set('province')}>
                            {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                          </select>
                        </div>
                        <div className="fld">
                          <label htmlFor="district">District <Req /></label>
                          <select id="district" value={form.district} onChange={set('district')}>
                            {districtsFor(form.province).map((d) => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="fld-pair">
                        <div className="fld">
                          <label htmlFor="sector">Sector <Req /></label>
                          <input id="sector" type="text" required placeholder="Gikondo"
                                 value={form.sector} onChange={set('sector')} />
                        </div>
                        <div className="fld">
                          <label htmlFor="street">Street or landmark <Req /></label>
                          <input id="street" type="text" required placeholder="KK 15 Ave, near SP filling station"
                                 value={form.street} onChange={set('street')} />
                        </div>
                      </div>

                      <div className="fld !mb-0">
                        <label htmlFor="notes">Delivery notes</label>
                        <textarea id="notes" placeholder="Gate colour, building name, best time to call…"
                                  value={form.notes} onChange={set('notes')} />
                        <p className="fld-hint">Optional, but it helps the courier find you first time.</p>
                      </div>
                    </Card>

                    {user && (
                      <label className="flex items-start gap-2.5 text-[.9rem] text-ink-600 -mt-1 mb-6 cursor-pointer">
                        <input type="checkbox" checked={saveProfile}
                               onChange={(e) => setSaveProfile(e.target.checked)}
                               className="mt-0.5 accent-brand-900 flex-none" />
                        <span>Save these details to my profile for next time.</span>
                      </label>
                    )}
                  </>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                  {loading ? 'Starting checkout…' : <>Continue to payment <span className="arw">→</span></>}
                </button>
              </form>
            ) : (
              <>
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
                  {tile.opt === 'mobilemoneyrwanda' && (
                    <p className="fld-hint mt-5">
                      You'll get a prompt on your phone to approve the payment.
                    </p>
                  )}
                </div>

                <button type="button" onClick={pay} className="btn-primary w-full mt-5">
                  Pay {formatRWF(session.amount)}
                </button>
                <p className="text-center mt-4">
                  <button type="button" onClick={() => setStep(1)} className="link-more">
                    ← Back to delivery details
                  </button>
                </p>
              </>
            )}
          </div>

          <aside className="summary-card">
            <h2 className="font-serif text-xl text-ink-900 mb-4">Your order</h2>
            {view.lines.map((l) => (
              <div key={l.key}
                   className="grid grid-cols-[46px_minmax(0,1fr)_auto] gap-3.5 items-center py-3 border-b border-ink-950/[.14]">
                <img src={cldResize(l.coverImage, 92)} alt=""
                     className="aspect-[2/3] w-full object-cover rounded-edge" />
                <div className="min-w-0">
                  <div className="font-serif text-[.98rem] text-ink-900 leading-tight">{l.title}</div>
                  <div className="text-[.8rem] text-ink-500 mt-0.5">Paperback · qty {l.quantity}</div>
                </div>
                <div className="text-[.9rem] font-semibold whitespace-nowrap">
                  {formatRWF(l.price * l.quantity)}
                </div>
              </div>
            ))}

            <div className="pt-3">
              <div className="flex justify-between py-2 text-[.95rem]">
                <span>Subtotal</span><span className="font-semibold">{formatRWF(view.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2 text-[.95rem]">
                <span className="text-ink-600">Delivery</span>
                <span className="text-ink-600 font-medium">
                  {view.deliveryFee === 0 ? 'Free' : formatRWF(view.deliveryFee)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-ink-950/[.14]">
              <span className="font-semibold text-[.95rem]">Total</span>
              <span className="font-serif text-2xl">{formatRWF(view.total)}</span>
            </div>

            {step === 1 && (
              <Link to="/cart" className="link-more inline-flex mt-5">← Edit cart</Link>
            )}
          </aside>
        </div>
      </main>
    </>
  )
}

function Card({ title, note, children }) {
  return (
    <div className="bg-ink-50 border border-ink-950/[.14] rounded-card p-5 md:p-7 mb-5">
      <h2 className="font-serif text-xl text-ink-900 mb-1">{title}</h2>
      {note
        ? <p className="text-[.88rem] text-ink-600 mb-6">{note}</p>
        : <div className="mb-5" />}
      {children}
    </div>
  )
}

const Req = () => <span className="text-red-700" aria-hidden="true">*</span>
