import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'

export default function BookCard({ book, showAddToCart = true }) {
  const { addItem } = useCart()
  const { user } = useUser()
  const navigate = useNavigate()
  const canPurchase = book.price > 0 && (book.availableFormats?.physical !== false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/books/${book._id}` } } })
      return
    }
    
    if (book.price > 0) addItem(book, 1, 'physical')
  }

  return (
    <article className="group flex flex-col bg-white rounded-xl border border-ink-200 overflow-hidden hover:shadow-lg hover:border-brand-300 transition-all duration-300 w-full">
      <Link to={`/books/${book._id}`} className="block">
        <div className="w-full aspect-[2/3] bg-ink-100 overflow-hidden flex items-center justify-center">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h2 className="font-serif text-base font-semibold text-ink-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-tight mb-1">
            {book.title}
          </h2>
          {book.genre && (
            <span className="inline-block text-xs text-brand-600 font-medium uppercase tracking-wide">{book.genre}</span>
          )}
          {book.price > 0 && (
            <p className="text-sm font-semibold text-ink-800 mt-2">{(book.price || 0).toLocaleString()} RWF</p>
          )}
        </div>
      </Link>
      {showAddToCart && canPurchase && (
        <div className="px-4 pb-4 mt-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-2 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      )}
    </article>
  )
}
