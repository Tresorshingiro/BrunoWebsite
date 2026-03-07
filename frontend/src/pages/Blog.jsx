import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { blogApi } from '../lib/api'

const categories = ['all', 'Faith', 'Forgiveness', 'Personal Growth', 'Rwanda', 'Healing', 'General']

export default function Blog() {
  const [data, setData] = useState({ posts: [], total: 0, pages: 1, page: 1 })
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    blogApi
      .getPublished({ category: category === 'all' ? '' : category, page, limit: 9 })
      .then((res) => setData({
        posts: res.posts || [],
        total: res.total || 0,
        pages: res.pages || 1,
        page: res.page || 1,
      }))
      .catch(() => setData({ posts: [], total: 0, pages: 1, page: 1 }))
      .finally(() => setLoading(false))
  }, [category, page])

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <header className="text-center mb-12">
          <h1 className="section-heading">Blog</h1>
          <p className="text-ink-600 max-w-2xl mx-auto">
            Thoughts on faith, forgiveness, healing, and purposeful living.
          </p>
        </header>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                category === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl bg-ink-100 h-72 animate-pulse" />
            ))}
          </div>
        ) : data.posts.length === 0 ? (
          <div className="text-center py-16 text-ink-500">
            <p>No posts yet. Check back soon.</p>
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
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt=""
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {!post.coverImage && (
                    <div className="w-full h-48 bg-ink-100 flex items-center justify-center text-ink-400 font-serif text-4xl">
                      “
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
                      <span className="text-brand-600 text-sm font-medium group-hover:text-brand-700 flex items-center gap-1">
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
