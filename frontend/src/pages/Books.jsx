import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { booksApi } from '../lib/api'
import BookCard from '../components/BookCard'

export default function Books() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    booksApi
      .getAll()
      .then(setBooks)
      .catch(() => setBooks([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <header className="text-center mb-12 md:mb-16">
          <h1 className="section-heading">Books</h1>
          <p className="text-ink-600 max-w-2xl mx-auto">
            Discover Bruno&apos;s published works—memoir, faith, and stories of forgiveness and purposeful living.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl bg-ink-100 aspect-[2/3] w-full animate-pulse" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16 text-ink-500">
            <p>No books listed yet. Check back soon.</p>
            <Link to="/" className="text-brand-600 font-medium mt-2 inline-block hover:underline">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
