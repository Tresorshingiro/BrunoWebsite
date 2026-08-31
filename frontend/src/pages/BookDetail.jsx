import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Minus, Plus, Check, ShieldCheck, Truck, PenLine } from 'lucide-react'
import { booksApi } from '../lib/api'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import Reveal from '../components/Reveal'
import ClipWords from '../components/ClipWords'
import BookCover3D from '../components/BookCover3D'
import { useScrolledPast } from '../hooks/useMotion'
import { byBruno, specsFor, paragraphs } from '../lib/books'

/* ─────────────────────────────────────────────────────────────────────────
   BOOK DETAIL — the product page.

   Everything transactional lives here: specs, quantity, add-to-cart, the
   excerpt and "what's inside". The Books index only lists what exists.

   Every editorial band below is driven by a per-book field and hides itself
   when that field is empty. This page renders for any title in the
   catalogue, not just Bruno's, so none of that content can be hardcoded —
   doing so would attribute one author's words to another.

   Payment, delivery and returns are shop-wide, so they live on /books once
   and this page links back to them.
   ───────────────────────────────────────────────────────────────────────── */

const ASSURANCES = [
  { Icon: ShieldCheck, label: 'Secure checkout — card details never touch this site' },
  { Icon: Truck, label: 'Kigali delivery in 2–3 working days' },
  { Icon: PenLine, label: 'Ask for a signed copy at checkout — no extra charge' },
]

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { user } = useUser()

  const [book, setBook] = useState(null)
  const [others, setOthers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const [buyPanelRef, pastBuyPanel] = useScrolledPast()

  useEffect(() => {
    setLoading(true)
    setError(null)
    setQty(1)
    booksApi
      .getById(id)
      .then(setBook)
      .catch(() => setError('Book not found'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    booksApi
      .getAll()
      .then((all) => setOthers((Array.isArray(all) ? all : []).filter((b) => b._id !== id)))
      .catch(() => setOthers([]))
  }, [id])

  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 1800)
    return () => clearTimeout(t)
  }, [added])

  if (loading) {
    return (
      <div className="bg-ink-950 pt-32 md:pt-44 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[minmax(0,.7fr)_minmax(0,1fr)] gap-12">
          <div className="aspect-[2/3] max-w-[320px] w-full bg-ink-800 rounded-card animate-pulse" />
          <div className="space-y-4 pt-2">
            <div className="h-10 w-2/3 bg-ink-800 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-ink-800/70 rounded animate-pulse" />
            <div className="h-24 w-full bg-ink-800/50 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="bg-ink-950 text-ink-100 pt-32 md:pt-44 pb-24 text-center">
        <p className="text-ink-100/70">{error || 'Book not found.'}</p>
        <Link to="/books" className="link-more mt-4 justify-center">
          Back to books <ArrowRight size={15} className="arw" />
        </Link>
      </div>
    )
  }

  const specs = specsFor(book)
  const canBuy = book.price > 0 && book.availableFormats?.physical !== false
  const inStock = book.inStock !== false
  const about = paragraphs(book.aboutLong)
  const excerpt = paragraphs(book.excerpt)
  const points = book.insidePoints || []
  const isBrunos = byBruno(book)

  const handleAdd = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/books/${book._id}` } } })
      return
    }
    addItem(book, qty, 'physical')
    setAdded(true)
  }

  return (
    <div>
      {/* ── PRODUCT PANEL ────────────────────────────────────────────────── */}
      <section
        ref={buyPanelRef}
        className="on-dark relative bg-ink-950 text-ink-100 overflow-hidden pt-28 pb-16 md:pt-40 md:pb-24"
      >
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            right: '-14%',
            top: '-30%',
            width: '58vw',
            height: '58vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(31,70,60,.5) 0%, transparent 62%)',
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="bk-crumbs mb-9">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/books">Books</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink-100/85">{book.title}</span>
          </nav>

          <div className="grid lg:grid-cols-[minmax(0,.7fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-start">
            <div className="max-w-[320px] w-full">
              <BookCover3D
                src={book.coverImage}
                alt={`Cover of ${book.title}`}
                thickness={22}
                showcase
                width={320}
                eager
              />
            </div>

            <Reveal>
              {book.genre && (
                <div
                  className="stagger-item text-[.66rem] font-semibold uppercase tracking-[.18em] text-brand-300 mb-3"
                  style={{ '--s-d': '0ms' }}
                >
                  {book.genre}
                </div>
              )}
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.04] tracking-tight">
                <ClipWords text={book.title} selfStart />
              </h1>
              {book.subtitle && (
                <p
                  className="stagger-item font-serif italic text-xl text-ink-100/70 mt-4 max-w-[46ch]"
                  style={{ '--s-d': '140ms' }}
                >
                  {book.subtitle}
                </p>
              )}
              {book.author && !isBrunos && (
                <p className="stagger-item text-sm text-ink-100/60 mt-3" style={{ '--s-d': '200ms' }}>
                  by {book.author}
                </p>
              )}

              {book.description && (
                <div className="stagger-item mt-6 max-w-[52ch] text-ink-100/75 leading-relaxed" style={{ '--s-d': '260ms' }}>
                  {paragraphs(book.description).map((para, i) => (
                    <p key={i} className="mb-4 last:mb-0">
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {specs.length > 0 && (
                <dl className="stagger-item bk-specs my-8" style={{ '--s-d': '320ms' }}>
                  {specs.map(([label, value]) => (
                    <div key={label} className="py-4 pr-4">
                      <dt className="text-[.65rem] uppercase tracking-[.16em] text-ink-100/45 mb-1">
                        {label}
                      </dt>
                      <dd className="font-semibold text-sm text-ink-50">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {canBuy ? (
                <>
                  <div className="stagger-item flex flex-wrap items-center gap-5" style={{ '--s-d': '380ms' }}>
                    <div className="font-serif text-4xl font-semibold leading-none tracking-tight">
                      {book.price.toLocaleString()}{' '}
                      <span className="font-sans text-sm font-medium text-ink-100/55 tracking-wide">
                        RWF
                      </span>
                    </div>

                    <div
                      className="inline-flex items-center border border-ink-100/25 rounded-edge"
                      role="group"
                      aria-label="Quantity"
                    >
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                        aria-label="Decrease quantity"
                        className="w-11 h-12 grid place-items-center hover:bg-ink-100/10 disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
                      >
                        <Minus size={15} />
                      </button>
                      <span aria-live="polite" className="min-w-[2.4rem] text-center font-semibold text-sm">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.min(20, q + 1))}
                        disabled={qty >= 20}
                        aria-label="Increase quantity"
                        className="w-11 h-12 grid place-items-center hover:bg-ink-100/10 disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="stagger-item flex flex-wrap gap-3 mt-6" style={{ '--s-d': '440ms' }}>
                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={!inStock}
                      className="btn-accent min-w-[200px] disabled:opacity-40"
                    >
                      {added ? (
                        <>
                          Added to cart <Check size={16} />
                        </>
                      ) : (
                        <>
                          Add to cart <ArrowRight size={16} className="arw" />
                        </>
                      )}
                    </button>
                    <Link to="/cart" className="btn-ghost">
                      View cart
                    </Link>
                  </div>

                  <p className={`bk-stock ${inStock ? '' : 'is-out'}`}>
                    <span className="bk-dot" aria-hidden="true" />
                    {inStock ? 'In stock — ships from Kigali' : 'Currently out of stock'}
                  </p>
                </>
              ) : (
                <p className="text-ink-100/60 mt-2">
                  This title is not available for purchase online.
                </p>
              )}

              <div className="stagger-item grid gap-2.5 mt-7 text-sm text-ink-100/60" style={{ '--s-d': '500ms' }}>
                {ASSURANCES.map(({ Icon, label }) => (
                  <span key={label} className="inline-flex items-start gap-2.5">
                    <Icon size={15} className="text-brand-300 shrink-0 mt-0.5" />
                    {label}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── ABOUT THE BOOK ───────────────────────────────────────────────── */}
      {(about.length > 0 || points.length > 0) && (
        <section className="bg-ink-100 band stage">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              {about.length > 0 && (
                <Reveal>
                  <p className="eyebrow">About the book</p>
                  <h2 className="section-heading mt-4 mb-0">In more detail</h2>
                  <div className="mt-6 max-w-[58ch] text-ink-700 leading-relaxed text-lg">
                    {about.map((para, i) => (
                      <p key={i} className="mb-5 last:mb-0">
                        {para}
                      </p>
                    ))}
                  </div>
                </Reveal>
              )}

              {points.length > 0 && (
                <Reveal delay={1}>
                  <h3 className="font-serif text-2xl font-semibold text-ink-900 mb-5">
                    What&apos;s inside
                  </h3>
                  <div className="border-t border-ink-950/[.14]">
                    {points.map((point) => (
                      <div
                        key={point.title}
                        className="bk-lift border-b border-ink-950/[.14] last:border-b-0 py-5 px-4 -mx-4"
                      >
                        <h4 className="font-serif text-xl font-semibold text-ink-900 mb-1">
                          {point.title}
                        </h4>
                        {point.body && (
                          <p className="text-ink-600 leading-relaxed max-w-[44ch]">{point.body}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── EXCERPT ──────────────────────────────────────────────────────── */}
      {excerpt.length > 0 && (
        <section className="bg-brand-900 text-ink-50 band">
          <Reveal variant="reveal-3d" className="max-w-3xl mx-auto px-4 sm:px-6">
            <p className="eyebrow on-dark text-brand-300">From the book</p>
            <blockquote className="mt-6">
              {excerpt.map((para, i) => (
                <p key={i} className="font-serif italic text-2xl md:text-3xl leading-relaxed mb-6">
                  {para}
                </p>
              ))}
              {book.excerptSource && (
                <footer className="text-[.72rem] uppercase tracking-[.18em] text-ink-50/50">
                  {book.excerptSource}
                </footer>
              )}
            </blockquote>
          </Reveal>
        </section>
      )}

      {/* ── AUTHOR ───────────────────────────────────────────────────────── */}
      {book.authorBio && (
        <section className="bg-ink-50 band">
          <Reveal className="max-w-4xl mx-auto px-4 sm:px-6 grid sm:grid-cols-[auto_minmax(0,1fr)] gap-8 items-start">
            {isBrunos && (
              <img
                src="/images/bruno-portrait.png"
                alt=""
                className="w-28 h-28 rounded-full object-cover object-top bg-ink-200"
              />
            )}
            <div>
              <p className="eyebrow">The author</p>
              <div className="font-serif text-3xl font-semibold text-ink-950 mt-3">
                {book.author || 'The author'}
              </div>
              <p className="text-ink-600 leading-relaxed max-w-[56ch] mt-4">{book.authorBio}</p>
              {isBrunos && (
                <div className="flex flex-wrap gap-3 mt-6">
                  <Link to="/about" className="btn-secondary">
                    More about Bruno
                  </Link>
                  <Link to="/contact" className="btn-secondary">
                    Invite him to speak
                  </Link>
                </div>
              )}
            </div>
          </Reveal>
        </section>
      )}

      {/* ── ORDERING POINTER — the detail lives on /books ─────────────────── */}
      <section className="bg-ink-100 py-12 md:py-16">
        <Reveal className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap gap-6 items-center justify-between border-t border-ink-950/[.14] pt-10">
          <div>
            <h3 className="font-serif text-xl font-semibold text-ink-900 mb-1.5">
              Ordering and delivery
            </h3>
            <p className="text-ink-600 leading-relaxed max-w-[52ch]">
              Card or bank transfer. Kigali in 2–3 working days, elsewhere in Rwanda 4–6.
              Bulk rates for ten copies or more.
            </p>
          </div>
          <Link to="/books#ordering" className="btn-secondary">
            Full ordering details <ArrowRight size={15} className="arw" />
          </Link>
        </Reveal>
      </section>

      {/* ── ALSO ON THE LIST ─────────────────────────────────────────────── */}
      {others.length > 0 && (
        <section className="bg-ink-50 band">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal className="mb-8">
              <p className="eyebrow">Also on the list</p>
              <h2 className="section-heading mt-4 mb-0">More from the catalogue</h2>
            </Reveal>
            <div className="bk-rows">
              {others.map((other) => (
                <Reveal as="div" key={other._id}>
                  <Link to={`/books/${other._id}`} className="bk-row group">
                    <div>
                      <BookCover3D src={other.coverImage} alt="" rest={-8} max={7} thickness={12} width={150} />
                    </div>
                    <div>
                      {other.genre && (
                        <div className="text-[.66rem] font-semibold uppercase tracking-[.18em] text-brand-600 mb-1.5">
                          {other.genre}
                        </div>
                      )}
                      <h3 className="font-serif text-2xl font-semibold text-ink-950 leading-tight transition-colors group-hover:text-brand-700">
                        {other.title}
                      </h3>
                      {other.author && (
                        <p className="text-sm text-ink-500 mt-1.5 mb-2">by {other.author}</p>
                      )}
                      {other.description && (
                        <p className="text-ink-600 leading-relaxed max-w-[50ch] line-clamp-2">
                          {other.description}
                        </p>
                      )}
                    </div>
                    <div className="bk-row-buy">
                      {other.price > 0 && (
                        <div className="font-serif text-2xl font-semibold text-ink-950 whitespace-nowrap tracking-tight">
                          {other.price.toLocaleString()}{' '}
                          <span className="font-sans text-xs font-medium text-ink-500">RWF</span>
                        </div>
                      )}
                      <span className="btn-secondary">
                        View book <ArrowRight size={15} className="arw" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── STICKY BUY BAR — only once the real buy panel is gone ─────────── */}
      {canBuy && (
        <div className={`bk-sticky ${pastBuyPanel ? 'is-shown' : ''}`} aria-hidden={!pastBuyPanel}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-4">
            <div className="font-serif text-lg font-semibold text-ink-50 truncate">{book.title}</div>
            <div className="font-serif text-lg font-semibold text-ink-50 whitespace-nowrap ml-auto">
              {book.price.toLocaleString()}{' '}
              <span className="font-sans text-xs font-medium text-ink-100/55">RWF</span>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!inStock}
              tabIndex={pastBuyPanel ? 0 : -1}
              className="btn-accent py-2.5 px-5 shrink-0 disabled:opacity-40"
            >
              {added ? 'Added' : 'Add to cart'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
