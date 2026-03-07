import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { blogApi } from '../lib/api'

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    blogApi
      .getBySlug(slug)
      .then(setPost)
      .catch(() => setError('Post not found'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="py-16 max-w-3xl mx-auto px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-ink-100 rounded w-3/4" />
          <div className="h-4 bg-ink-100 rounded w-1/3" />
          <div className="h-64 bg-ink-100 rounded" />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-600">{error || 'Post not found.'}</p>
        <Link to="/blog" className="text-brand-600 font-medium mt-2 inline-block hover:underline">
          Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <article className="py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link to="/blog" className="text-brand-600 font-medium hover:underline mb-8 inline-block">
          ← Back to Blog
        </Link>
        <header className="mb-8">
          <span className="text-brand-600 font-medium">{post.category}</span>
          <h1 className="font-serif text-3xl md:text-4xl text-ink-900 mt-1 mb-4">
            {post.title}
          </h1>
          {post.readTime && (
            <p className="text-ink-500 text-sm">{post.readTime} min read</p>
          )}
        </header>
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt=""
            className="w-full rounded-xl shadow-lg mb-10 object-cover max-h-96"
          />
        )}
        <div
          className="prose-custom prose-lg"
          dangerouslySetInnerHTML={{
            __html: post.content?.replace(/\n/g, '<br />') || '',
          }}
        />
      </div>
    </article>
  )
}
