import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { booksApi } from '../lib/api'
import { useCart } from '../context/CartContext'

export default function BookDetail() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { addItem } = useCart()

  useEffect(() => {
    booksApi
      .getById(id)
      .then(setBook)
      .catch(() => setError('Book not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="py-16 max-w-6xl mx-auto px-4">
        <div className="animate-pulse flex flex-col md:flex-row gap-8">
          <div className="w-64 h-96 bg-ink-100 rounded-xl" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-ink-100 rounded w-3/4" />
            <div className="h-4 bg-ink-100 rounded w-1/2" />
            <div className="h-24 bg-ink-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-600">{error || 'Book not found.'}</p>
        <Link to="/books" className="text-brand-600 font-medium mt-2 inline-block hover:underline">
          Back to Books
        </Link>
      </div>
    )
  }

  const canPurchase = book.price > 0 && (book.availableFormats?.physical !== false)

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link to="/books" className="text-brand-600 font-medium hover:underline mb-8 inline-block">
          ← Back to Books
        </Link>
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <div className="flex justify-center md:justify-start">
            <img
              src={book.coverImage}
              alt={book.title}
              className="rounded-xl shadow-xl w-full max-w-sm"
            />
          </div>
          <div>
            <span className="text-brand-600 font-medium">{book.genre}</span>
            <h1 className="font-serif text-3xl md:text-4xl text-ink-900 mt-1 mb-2">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="text-lg text-ink-600 mb-4">{book.subtitle}</p>
            )}
            <div className="prose-custom mb-6" dangerouslySetInnerHTML={{ __html: book.description?.replace(/\n/g, '<br />') || '' }} />
            {(book.publishedDate || book.pages || book.isbn) && (
              <p className="text-sm text-ink-500 mb-2">
                {book.publishedDate && `Published ${new Date(book.publishedDate).getFullYear()}`}
                {book.pages && ` · ${book.pages} pages`}
                {book.isbn && ` · ISBN ${book.isbn}`}
              </p>
            )}

            {canPurchase && (
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <span className="font-semibold text-ink-900">{(book.price || 0).toLocaleString()} RWF</span>
                <button
                  type="button"
                  onClick={() => addItem(book, 1, 'physical')}
                  className="btn-primary py-2"
                >
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
