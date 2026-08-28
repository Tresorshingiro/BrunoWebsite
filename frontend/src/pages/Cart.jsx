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
            <Reveal className="grid lg:grid-cols-[minmax(0,1fr)_21rem] gap-8 lg:gap-12 items-start">
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
            </Reveal>
          )}
        </div>
      </main>
    </>
  )
}

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
