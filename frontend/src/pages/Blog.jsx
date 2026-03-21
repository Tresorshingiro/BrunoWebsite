import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { blogApi, subscribeApi } from '../lib/api'
import toast from 'react-hot-toast'

function SubscribeBanner() {
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

  if (subscribed) {
    return (
      <div className="bg-brand-50 border border-brand-200 rounded-2xl px-6 py-8 text-center mb-10">
        <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-serif text-lg text-ink-900 mb-1">You're subscribed!</p>
        <p className="text-ink-500 text-sm">You'll receive an email whenever a new post is published.</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-ink-900 to-ink-800 rounded-2xl px-6 py-8 mb-10 flex flex-col sm:flex-row items-center gap-6">
      <div className="flex-1 text-center sm:text-left">
        <p className="font-serif text-xl text-white mb-1">Stay in the loop</p>
        <p className="text-ink-400 text-sm">Get notified by email when Bruno publishes a new post.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="flex-1 sm:w-56 px-4 py-2.5 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
    </div>
  )
}

const CATEGORIES = ['Faith', 'Forgiveness', 'Personal Growth', 'Rwanda', 'Healing', 'General']

export default function Blog() {
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
      .then((res) => setData({
        posts: res.posts || [],
        total: res.total || 0,
        pages: res.pages || 1,
        page: res.page || 1,
      }))
      .catch(() => setData({ posts: [], total: 0, pages: 1, page: 1 }))
      .finally(() => setLoading(false))
  }, [page, search, category])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  // Debounce: update search state 400ms after user stops typing
  const handleSearchInput = (e) => {
    const value = e.target.value
    setInputValue(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(value.trim())
      setPage(1)
    }, 400)
  }

  const handleCategoryChange = (e) => {
    setCategory(e.target.value)
    setPage(1)
  }

  const clearFilters = () => {
    setInputValue('')
    setSearch('')
    setCategory('')
    setPage(1)
  }

  const hasFilters = search || category

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <header className="text-center mb-10">
          <h1 className="section-heading">Blogs</h1>
          <p className="text-ink-600 max-w-2xl mx-auto">
            Thoughts on faith, forgiveness, healing, and purposeful living.
          </p>
        </header>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          {/* Search input — filters as you type */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={inputValue}
              onChange={handleSearchInput}
              placeholder="Search posts…"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
            />
            {inputValue && (
              <button
                type="button"
                onClick={clearFilters}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="flex gap-2">
            <select
              value={category}
              onChange={handleCategoryChange}
              className="px-4 py-2.5 rounded-lg border border-ink-200 text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2.5 rounded-lg border border-ink-200 text-sm text-ink-600 hover:bg-ink-50 transition-colors whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {!loading && hasFilters && (
          <p className="text-sm text-ink-500 mb-6">
            {data.total} {data.total === 1 ? 'post' : 'posts'} found
            {search && <> for &ldquo;<span className="text-ink-800 font-medium">{search}</span>&rdquo;</>}
            {category && <> in <span className="text-ink-800 font-medium">{category}</span></>}
          </p>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl bg-ink-100 h-72 animate-pulse" />
            ))}
          </div>
        ) : data.posts.length === 0 ? (
          <div className="text-center py-16 text-ink-500">
            <p className="mb-3">No posts found.</p>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="text-brand-600 font-medium hover:underline text-sm">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.posts.map((post) => (
                <Link
                  key={post._id}
                  to={`/blog/${post.slug}`}
                  className="group block bg-white rounded-xl border border-ink-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt=""
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-ink-100 flex items-center justify-center text-ink-400 font-serif text-4xl">
                      &ldquo;
                    </div>
                  )}
                  <div className="p-5">
                    <span className="text-sm text-brand-600 font-medium">{post.category}</span>
                    <h2 className="font-serif text-xl text-ink-900 mt-1 group-hover:text-brand-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-ink-600 text-sm mt-2 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-4">
                      {post.readTime && (
                        <p className="text-ink-400 text-xs">{post.readTime} min read</p>
                      )}
                      <span className="text-brand-600 text-sm font-medium group-hover:text-brand-700 flex items-center gap-1 ml-auto">
                        Read more
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12">
              <SubscribeBanner />
            </div>

            {data.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-lg border border-ink-200 disabled:opacity-50 hover:bg-ink-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-ink-600">
                  Page {page} of {data.pages}
                </span>
                <button
                  type="button"
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-lg border border-ink-200 disabled:opacity-50 hover:bg-ink-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
