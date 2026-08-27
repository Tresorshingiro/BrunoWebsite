import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { booksApi } from '../lib/api'
import Reveal from '../components/Reveal'
import ClipWords from '../components/ClipWords'
import BookCover3D from '../components/BookCover3D'
import { useHeroLoad } from '../hooks/useMotion'
import { byBruno, metaFor, pluralTitles } from '../lib/books'

/* ─────────────────────────────────────────────────────────────────────────
   BOOKS INDEX — a catalogue, not a product page.
   Specs, quantity, add-to-cart, "what's inside" and the excerpt all live on
   the detail page. This page only has to show what exists and get you to the
   right one.

   Ordering and the FAQ are shop-wide rather than per-book, so they live here
   once and the detail page links back to them.
   ───────────────────────────────────────────────────────────────────────── */

/* Card-only while checkout runs on Stripe. When the Flutterwave migration
   lands, add 'MTN MoMo' and 'Airtel Money' here — this array is the only
   thing that needs to change. Until then the page must not claim payment
   methods the checkout cannot actually take. */
const PAY_METHODS = ['Visa', 'Mastercard', 'Bank transfer']

const ORDERING = [
  {
    title: 'Payment',
    paras: [
      'Card and bank transfer. Checkout is handled by a licensed provider — card details never touch this site.',
    ],
    chips: PAY_METHODS,
  },
  {
    title: 'Delivery',
    paras: [
      'Kigali in 2–3 working days. Elsewhere in Rwanda, allow 4–6 days.',
      'International shipping is available — write first and we will quote for your country.',
    ],
  },
  {
    title: 'If something goes wrong',
    paras: [
      'Damaged or wrong order? Email within 14 days and we will replace it or refund you in full.',
      'Questions before you buy are welcome too.',
    ],
  },
]

const FAQ = [
  {
    q: 'Can I get a signed copy?',
    a: 'Yes. Add a note at checkout and Bruno will sign it before it ships. No extra charge, but it adds a day or two.',
  },
  {
    q: 'Is there an ebook or audiobook?',
    a: 'Not yet — paperback is the only edition. Join the mailing list and you will hear first if that changes.',
  },
  {
    q: 'Do you sell in bulk to churches or schools?',
    a: 'Yes, at a reduced rate for ten copies or more. Send us the quantity you need and we will quote.',
  },
  {
    q: 'Can I buy at an event instead?',
    a: 'Copies are available at every in-person event, and Bruno usually stays afterwards to sign them.',
  },
]

/* ── One catalogue row. The whole row is the link. ───────────────────────── */
function BookRow({ book, tagged, solidCta }) {
  const meta = metaFor(book)

  return (
    <Reveal as="div">
      <Link to={`/books/${book._id}`} className="bk-row group">
        <div>
          <BookCover3D src={book.coverImage} alt="" rest={-8} max={7} thickness={12} width={150} />
        </div>

        <div>
          {tagged && (
            <span className="inline-block text-[.64rem] font-semibold uppercase tracking-[.2em] text-brand-800 bg-brand-500/15 rounded-full px-2.5 py-1.5 mb-3.5">
              Bruno&apos;s own book
            </span>
          )}
          {book.genre && (
            <div className="text-[.66rem] font-semibold uppercase tracking-[.18em] text-brand-600 mb-1.5">
              {book.genre}
            </div>
          )}
          <h3 className="font-serif text-2xl md:text-3xl font-semibold text-ink-950 leading-tight transition-colors group-hover:text-brand-700">
            {book.title}
          </h3>
          {book.subtitle && (
            <p className="font-serif italic text-ink-500 mt-1.5 mb-2">{book.subtitle}</p>
          )}
          {book.author && !tagged && (
            <p className="text-sm text-ink-500 mb-2">by {book.author}</p>
          )}
          {book.description && (
            <p className="text-ink-600 leading-relaxed max-w-[50ch] line-clamp-3">
              {book.description}
            </p>
          )}
          {meta.length > 0 && (
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3.5 text-sm text-ink-400">
              {meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          )}
        </div>

        <div className="bk-row-buy">
          {book.price > 0 && (
            <div className="font-serif text-2xl font-semibold text-ink-950 whitespace-nowrap tracking-tight">
              {book.price.toLocaleString()}{' '}
              <span className="font-sans text-xs font-medium text-ink-500">RWF</span>
            </div>
          )}
          {/* A span, not a button — the row itself is already the link. */}
          <span className={solidCta ? 'btn-primary' : 'btn-secondary'}>
            View book <ArrowRight size={15} className="arw" />
          </span>
        </div>
      </Link>
    </Reveal>
  )
}

/* ── FAQ accordion ───────────────────────────────────────────────────────── */
function FaqItem({ item, open, onToggle, id }) {
  return (
    <div className="border-b border-ink-950/[.14]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`faq-panel-${id}`}
        className="w-full flex items-start justify-between gap-6 text-left py-5 font-semibold text-ink-900 hover:text-brand-700 transition-colors"
      >
        {item.q}
        <span
          aria-hidden="true"
          className={`bk-faq-sign text-2xl font-normal leading-none text-brand-600 shrink-0 ${open ? 'is-open' : ''}`}
        >
          +
        </span>
      </button>
      <div id={`faq-panel-${id}`} role="region" className={`bk-faq-panel ${open ? 'is-open' : ''}`}>
        <div>
          <p className="text-ink-600 leading-relaxed max-w-[62ch] pb-6">{item.a}</p>
        </div>
      </div>
    </div>
  )
}

export default function Books() {
  const loaded = useHeroLoad()

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    booksApi
      .getAll()
      .then((data) => setBooks(Array.isArray(data) ? data : []))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false))
  }, [])

  const brunoTitles = books.filter(byBruno)
  const houseTitles = books.filter((b) => !byBruno(b))

  return (
    <div className={loaded ? 'loaded' : undefined}>
      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="on-dark relative bg-ink-950 text-ink-100 overflow-hidden pt-32 pb-14 md:pt-44 md:pb-20">
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
          <p className="eyebrow hero-fade">Books</p>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight max-w-[14ch] mt-5">
            <ClipWords text="Written for anyone still" />
            <ClipWords text="carrying something" offset={4} accent />
          </h1>
          <p className="hero-fade text-lg text-ink-100/70 leading-relaxed max-w-[50ch] mt-7" data-d="2">
            Bruno&apos;s own memoir, and the growing list of the publishing house he
            co-founded. Delivered anywhere in Rwanda, and worldwide on request.
          </p>
        </div>
      </section>

      {/* ── CATALOGUE ────────────────────────────────────────────────────── */}
      <section className="bg-ink-100 band">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="space-y-8">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-8 items-center">
                  <div className="w-[110px] md:w-[150px] aspect-[2/3] bg-ink-200/60 rounded-card animate-pulse shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-7 w-1/2 bg-ink-200/60 rounded animate-pulse" />
                    <div className="h-4 w-1/3 bg-ink-200/50 rounded animate-pulse" />
                    <div className="h-14 w-full bg-ink-200/40 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center text-ink-500">
              <p>No books listed yet. Check back soon.</p>
              <Link to="/" className="link-more mt-3">
                Back to home <ArrowRight size={15} className="arw" />
              </Link>
            </div>
          ) : (
            <>
              {brunoTitles.length > 0 && (
                <>
                  <Reveal className="bk-group-head">
                    <h2 className="bk-label">By Bruno</h2>
                    <span className="bk-count">{pluralTitles(brunoTitles.length)}</span>
                  </Reveal>
                  <div className="bk-rows">
                    {brunoTitles.map((book) => (
                      <BookRow key={book._id} book={book} tagged solidCta />
                    ))}
                  </div>
                </>
              )}

              {houseTitles.length > 0 && (
                <>
                  <Reveal className={brunoTitles.length > 0 ? 'pt-12 md:pt-16' : ''}>
                    <div className="bk-group-head">
                      <h2 className="bk-label">From Vitalreadings Publishers</h2>
                      <span className="bk-count">{pluralTitles(houseTitles.length)}</span>
                    </div>
                    <p className="text-ink-600 leading-relaxed max-w-[60ch] mb-6">
                      Bruno co-founded Vitalreadings to publish stories of faith, resilience,
                      and restoration by Rwandan authors.
                      {brunoTitles.length > 0
                        ? ' These are not his books — they are books he helped bring into the world.'
                        : ''}
                    </p>
                  </Reveal>
                  <div className="bk-rows">
                    {houseTitles.map((book) => (
                      <BookRow key={book._id} book={book} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── ORDERING — shop-wide, so it lives here once ──────────────────── */}
      <section id="ordering" className="bg-ink-50 band scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="max-w-[34ch] mb-10 md:mb-14">
            <p className="eyebrow">Ordering</p>
            <h2 className="section-heading mt-4 mb-0">What happens after you pay</h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-x-10 border-t border-ink-950/[.14]">
            {ORDERING.map((block, i) => (
              <Reveal
                key={block.title}
                delay={i}
                className="py-7 border-b border-ink-950/[.14] md:border-b-0"
              >
                <h3 className="font-serif text-xl font-semibold text-ink-900 mb-2">{block.title}</h3>
                {block.paras.map((para, j) => (
                  <p key={j} className="text-ink-600 leading-relaxed max-w-[34ch] mb-3 last:mb-0">
                    {para}
                  </p>
                ))}
                {block.chips && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {block.chips.map((chip, k) => (
                      <span
                        key={chip}
                        className="chip-in text-xs font-semibold border border-ink-950/[.14] rounded-edge px-2.5 py-1.5 text-ink-600 bg-white/50"
                        style={{ '--chip-d': `${k * 60}ms` }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 md:mt-16 border-t border-ink-950/[.14]">
            {FAQ.map((item, i) => (
              <FaqItem
                key={item.q}
                id={i}
                item={item}
                open={openFaq === i}
                onToggle={() => setOpenFaq((cur) => (cur === i ? null : i))}
              />
            ))}
          </Reveal>
        </div>
      </section>
    </div>
  )
}
