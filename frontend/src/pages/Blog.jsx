import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import { blogApi, subscribeApi } from '../lib/api'
import { cldResize, cldSrcSet } from '../lib/images'
import Reveal from '../components/Reveal'
import ClipWords from '../components/ClipWords'
import { useHeroLoad } from '../hooks/useMotion'
import toast from 'react-hot-toast'

const CATEGORIES = ['Faith', 'Forgiveness', 'Personal Growth', 'Rwanda', 'Healing', 'General']

const formatDate = (value) => {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/* ── Newsletter band ─────────────────────────────────────────────────────── */
function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await subscribeApi.subscribe(email.trim())
      setSubscribed(true)
      setEmail('')
      toast.success('Successfully subscribed!')
    } catch (err) {
      toast.error(err.message || 'Could not subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-ink-50 band">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <Reveal>
          <p className="eyebrow">Stay in the loop</p>
          <h2 className="section-heading mt-4 mb-0">
            One email when there&apos;s something worth reading
          </h2>
          <p className="text-lg text-ink-600 leading-relaxed max-w-[44ch] mt-5">
            No schedule, no marketing. Bruno writes when he has something to say, and
            you&apos;ll hear about it the same day.
          </p>
        </Reveal>

        <Reveal delay={1}>
          {subscribed ? (
            <div className="border border-brand-600/30 bg-white/60 rounded-card px-6 py-7">
              <p className="font-serif text-xl text-ink-900 mb-1.5">You&apos;re subscribed.</p>
              <p className="text-ink-600">
                You&apos;ll get an email whenever a new post goes up.
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  aria-label="Email address"
                  className="flex-1 min-w-[240px] bg-white/65 border border-ink-950/[.14] rounded-edge px-4 py-3.5 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-colors"
                />
                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                  {loading ? 'Subscribing…' : 'Subscribe'}
                  {!loading && <ArrowRight size={16} className="arw" />}
                </button>
              </form>
              <p className="text-sm text-ink-500 mt-4">
                Unsubscribe in one click. Your address is never shared.
              </p>
            </>
          )}
        </Reveal>
      </div>
    </section>
  )
}

/* ── Featured post — the newest, only on an unfiltered first page ────────── */
function FeaturedPost({ post }) {
  const date = formatDate(post.createdAt)
  return (
    <section className="bg-ink-100 pt-[var(--band)] pb-12 md:pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <Link to={`/blog/${post.slug}`} className="feat-link group">
            <div className="feat-media">
              {post.coverImage && (
                <img
                  src={cldResize(post.coverImage, 720)}
                  srcSet={cldSrcSet(post.coverImage, 720)}
                  alt=""
                  loading="eager"
                  decoding="async"
                />
              )}
            </div>
            <div>
              <span className="inline-block text-[.66rem] font-semibold uppercase tracking-[.2em] text-brand-800 bg-brand-500/15 rounded-full px-3 py-1.5 mb-4">
                Latest
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink-950 leading-tight tracking-tight transition-colors group-hover:text-brand-700">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-lg text-ink-600 leading-relaxed max-w-[50ch] mt-4">
                  {post.excerpt}
                </p>
              )}
              <div className="meta-dots mt-6">
                {date && (
                  <>
                    <span>{date}</span>
                    <i aria-hidden="true" />
                  </>
                )}
                <span>{post.category}</span>
                <i aria-hidden="true" />
                <span>{post.readTime || 5} min read</span>
              </div>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

/* ── Archive row ─────────────────────────────────────────────────────────── */
function PostRow({ post, delay }) {
  return (
    <Reveal as="div" delay={delay}>
      <Link to={`/blog/${post.slug}`} className="post-row group">
        <div className="post-media">
          {post.coverImage && (
            <img
              src={cldResize(post.coverImage, 220)}
              srcSet={cldSrcSet(post.coverImage, 220)}
              alt=""
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        <div>
          <div className="text-[.66rem] font-semibold uppercase tracking-[.18em] text-brand-600 mb-1.5">
            {post.category}
          </div>
          <h3 className="font-serif text-2xl md:text-3xl font-semibold text-ink-950 leading-tight transition-colors group-hover:text-brand-700">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-ink-600 leading-relaxed max-w-[54ch] mt-2.5 line-clamp-2">
              {post.excerpt}
            </p>
          )}
        </div>
        <div className="post-row-meta">
          <span>{post.readTime || 5} min read</span>
          <ArrowRight size={18} className="post-go" />
        </div>
      </Link>
    </Reveal>
  )
}

export default function Blog() {
  const loaded = useHeroLoad()

  const [data, setData] = useState({ posts: [], total: 0, pages: 1, page: 1 })
  const [inputValue, setInputValue] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef(null)

  const fetchPosts = useCallback(() => {
    setLoading(true)
    blogApi
      .getPublished({ page, limit: 9, search, category })
      .then((res) =>
        setData({
          posts: res.posts || [],
          total: res.total || 0,
          pages: res.pages || 1,
          page: res.page || 1,
        })
      )
      .catch(() => setData({ posts: [], total: 0, pages: 1, page: 1 }))
      .finally(() => setLoading(false))
  }, [page, search, category])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  const handleSearchInput = (e) => {
    const value = e.target.value
    setInputValue(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(value.trim())
      setPage(1)
    }, 400)
  }

  const pickCategory = (value) => {
    setCategory(value)
    setPage(1)
  }

  const clearFilters = () => {
    clearTimeout(debounceRef.current)
    setInputValue('')
    setSearch('')
    setCategory('')
    setPage(1)
  }

  const hasFilters = Boolean(search || category)

  // The featured slot only makes sense on an unfiltered first page — under a
  // filter, "Latest" would be a lie, and the rows already lead with the newest.
  const showFeatured = !hasFilters && page === 1 && data.posts.length > 0
  const featured = showFeatured ? data.posts[0] : null
  const rows = showFeatured ? data.posts.slice(1) : data.posts

  return (
    <div className={loaded ? 'loaded' : undefined}>
      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="on-dark relative bg-ink-950 text-ink-100 overflow-hidden pt-32 pb-10 md:pt-44 md:pb-12">
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
          <p className="eyebrow hero-fade">Blog</p>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight max-w-[16ch] mt-5">
            <ClipWords text="Thinking out loud," />
            <ClipWords text="slowly" offset={3} accent />
          </h1>
          <p className="hero-fade text-lg text-ink-100/70 leading-relaxed max-w-[52ch] mt-7" data-d="2">
            Essays on faith, forgiveness, and the ordinary work of healing — written
            between books, usually after something happened that Bruno couldn&apos;t stop
            turning over.
          </p>
        </div>
      </section>

      {/* ── FILTERS — still on the dark ground, below a hairline ────────── */}
      <section className="on-dark bg-ink-950 pb-8 md:pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-x-6 gap-y-4 items-center justify-between border-t border-ink-100/15 pt-6">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              <button
                type="button"
                className="pill"
                aria-pressed={category === ''}
                onClick={() => pickCategory('')}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="pill"
                  aria-pressed={category === cat}
                  onClick={() => pickCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="blog-search relative flex-[0_1_300px] min-w-[220px]">
              <Search
                size={15}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-100/45 pointer-events-none"
              />
              <input
                type="search"
                value={inputValue}
                onChange={handleSearchInput}
                placeholder="Search the blog"
                aria-label="Search posts"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={clearFilters}
                  aria-label="Clear search"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-100/45 hover:text-brand-300 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {!loading && hasFilters && (
            <p className="text-sm text-ink-100/55 mt-5">
              {data.total} {data.total === 1 ? 'post' : 'posts'}
              {search && (
                <>
                  {' '}
                  for &ldquo;<span className="text-ink-50">{search}</span>&rdquo;
                </>
              )}
              {category && (
                <>
                  {' '}
                  in <span className="text-ink-50">{category}</span>
                </>
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="ml-3 text-brand-300 hover:underline"
              >
                Clear
              </button>
            </p>
          )}
        </div>
      </section>

      {/* ── POSTS ──────────────────────────────────────────────────────── */}
      {loading ? (
        <section className="bg-ink-100 band">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-8 items-center">
                <div className="w-[110px] md:w-[170px] aspect-[4/3] bg-ink-200/60 rounded-card animate-pulse shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-24 bg-ink-200/50 rounded animate-pulse" />
                  <div className="h-7 w-2/3 bg-ink-200/60 rounded animate-pulse" />
                  <div className="h-10 w-full bg-ink-200/40 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : data.posts.length === 0 ? (
        <section className="bg-ink-100 band">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-ink-500">
            <p className="mb-3">No posts found.</p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="link-more mx-auto"
              >
                Clear filters <ArrowRight size={15} className="arw" />
              </button>
            )}
          </div>
        </section>
      ) : (
        <>
          {featured && <FeaturedPost post={featured} />}

          {rows.length > 0 && (
            <section className={`bg-ink-100 ${featured ? 'pb-[var(--band)]' : 'band'}`}>
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-baseline justify-between gap-8 mb-4">
                  <h2 className="bk-label">{hasFilters ? 'Results' : 'Earlier'}</h2>
                  <span className="bk-count">
                    {data.total} {data.total === 1 ? 'post' : 'posts'}
                  </span>
                </div>

                <div className="post-rows">
                  {rows.map((post, i) => (
                    <PostRow key={post._id} post={post} delay={i < 3 ? i : undefined} />
                  ))}
                </div>

                {data.pages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-12">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="btn-secondary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand-600"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-ink-500 px-3">
                      Page {page} of {data.pages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= data.pages}
                      onClick={() => setPage((p) => p + 1)}
                      className="btn-secondary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand-600"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}

      <Newsletter />
    </div>
  )
}
