import { useEffect, useState } from 'react'
import { adminApi, booksApi } from '../lib/api'
import toast from 'react-hot-toast'

function BookForm({ book, onSave, onCancel }) {
  const isEdit = !!book
  const [form, setForm] = useState({
    title: book?.title ?? '',
    subtitle: book?.subtitle ?? '',
    description: book?.description ?? '',
    genre: book?.genre ?? 'Memoir/Christian',
    publishedDate: book?.publishedDate ? new Date(book.publishedDate).toISOString().slice(0, 10) : '',
    featured: Boolean(book?.featured),
    price: typeof book?.price === 'number' ? book.price : '',
    inStock: book?.inStock !== false,
    pages: book?.pages !== undefined && book?.pages !== null && book?.pages !== '' ? String(book.pages) : '',
  })
  const [coverFile, setCoverFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description || ' ')
      if (form.subtitle) fd.append('subtitle', form.subtitle)
      fd.append('genre', form.genre)
      if (form.publishedDate) fd.append('publishedDate', form.publishedDate)
      fd.append('featured', form.featured ? 'true' : 'false')
      const priceNum = form.price === '' || form.price == null ? 0 : Number(form.price)
      fd.append('price', String(Number.isFinite(priceNum) ? priceNum : 0))
      fd.append('inStock', form.inStock ? 'true' : 'false')
      fd.append('availableFormats', JSON.stringify({ physical: true, digital: false }))
      if (form.pages !== '' && form.pages != null) fd.append('pages', String(form.pages))
      if (coverFile) fd.append('coverImage', coverFile)
      if (isEdit) {
        await adminApi.books.update(book._id, fd)
        toast.success('Book updated.')
      } else {
        await adminApi.books.create(fd)
        toast.success('Book created.')
      }
      onSave()
    } catch (err) {
      toast.error(err.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Title *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Subtitle</label>
        <input
          type="text"
          value={form.subtitle}
          onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Description *</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Cover image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-ink-600"
        />
        {isEdit && book?.coverImage && !coverFile && (
          <img src={book.coverImage} alt="" className="mt-2 w-32 h-auto rounded" />
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Genre</label>
          <input
            type="text"
            value={form.genre}
            onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-ink-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Published date</label>
          <input
            type="date"
            value={form.publishedDate}
            onChange={(e) => setForm((f) => ({ ...f, publishedDate: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-ink-200"
          />
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
          />
          <span className="text-sm">Featured</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
          />
          <span className="text-sm">In stock</span>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Price (RWF)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.price === '' || form.price == null ? '' : form.price}
            onChange={(e) => {
              const v = e.target.value
              setForm((f) => ({ ...f, price: v === '' ? '' : parseFloat(v) || 0 }))
            }}
            className="w-full px-4 py-2 rounded-lg border border-ink-200"
            placeholder="e.g. 15000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Number of pages</label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.pages}
            onChange={(e) => setForm((f) => ({ ...f, pages: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-ink-200"
            placeholder="e.g. 200"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : isEdit ? 'Update book' : 'Create book'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const fetchBooks = () => {
    booksApi.getAll().then(setBooks).catch(() => setBooks([])).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this book?')) return
    try {
      await adminApi.books.delete(id)
      toast.success('Book deleted.')
      fetchBooks()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl text-ink-900">Books</h1>
        <button
          type="button"
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary"
        >
          Add book
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-white rounded-xl border border-ink-100">
          <h2 className="font-serif text-lg text-ink-900 mb-4">{editing ? 'Edit book' : 'New book'}</h2>
          <BookForm
            book={editing}
            onSave={() => { setShowForm(false); setEditing(null); fetchBooks(); }}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-ink-500">Loading...</p>
      ) : books.length === 0 ? (
        <p className="text-ink-500">No books yet. Add one above.</p>
      ) : (
        <div className="bg-white rounded-xl border border-ink-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-ink-50 border-b border-ink-100">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-ink-700">Cover</th>
                <th className="text-left py-3 px-4 font-medium text-ink-700">Title</th>
                <th className="text-left py-3 px-4 font-medium text-ink-700">Price</th>
                <th className="text-left py-3 px-4 font-medium text-ink-700">Featured</th>
                <th className="text-right py-3 px-4 font-medium text-ink-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id} className="border-b border-ink-50">
                  <td className="py-3 px-4">
                    <img src={book.coverImage} alt="" className="w-12 h-16 object-cover rounded" />
                  </td>
                  <td className="py-3 px-4 font-medium text-ink-900">{book.title}</td>
                  <td className="py-3 px-4 text-ink-600">{(book.price ?? 0).toLocaleString()} RWF</td>
                  <td className="py-3 px-4">{book.featured ? 'Yes' : '—'}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => { setEditing(book); setShowForm(true); }}
                      className="text-brand-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(book._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
