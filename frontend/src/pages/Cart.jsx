import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, totalItems, totalAmount, removeItem, setQuantity } = useCart()

  if (items.length === 0) {
    return (
      <div className="py-16 md:py-24 text-center">
        <div className="max-w-md mx-auto px-4">
          <p className="text-ink-600 text-lg mb-6">Your cart is empty.</p>
          <Link to="/books" className="btn-primary">
            Browse Books
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="section-heading mb-8">Your Cart</h1>
        <div className="space-y-6">
          {items.map(({ book, quantity, format }) => {
            const price = book.price || 0
            const subtotal = price * quantity
            return (
              <div
                key={`${book._id}-${format}`}
                className="flex gap-4 p-4 rounded-xl border border-ink-100 bg-white"
              >
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-lg text-ink-900">{book.title}</h2>
                  <p className="text-ink-700 font-medium mt-1">{(price || 0).toLocaleString()} RWF each</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(book._id, format, quantity - 1)}
                      className="w-8 h-8 rounded border border-ink-200 flex items-center justify-center hover:bg-ink-50"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(book._id, format, quantity + 1)}
                      className="w-8 h-8 rounded border border-ink-200 flex items-center justify-center hover:bg-ink-50"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(book._id, format)}
                      className="ml-4 text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-ink-900">{subtotal.toLocaleString()} RWF</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link to="/books" className="text-brand-600 font-medium hover:underline">
            ← Continue shopping
          </Link>
          <div className="flex items-center gap-6">
            <p className="text-lg font-semibold text-ink-900">
              Total ({totalItems} {totalItems === 1 ? 'item' : 'items'}): {totalAmount.toLocaleString()} RWF
            </p>
            <Link to="/checkout" className="btn-primary">
              Proceed to checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
