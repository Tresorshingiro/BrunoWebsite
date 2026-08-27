import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { adminApi, booksApi } from '../lib/api'
import toast from 'react-hot-toast'

function BookForm({ book, onSave, onCancel }) {
  const isEdit = !!book
  const [form, setForm] = useState({
    title: book?.title ?? '',
    subtitle: book?.subtitle ?? '',
    author: book?.author ?? '',
    description: book?.description ?? '',
    genre: book?.genre ?? 'Memoir/Christian',
    publishedDate: book?.publishedDate ? new Date(book.publishedDate).toISOString().slice(0, 10) : '',
    featured: Boolean(book?.featured),
    price: typeof book?.price === 'number' ? book.price : '',
    inStock: book?.inStock !== false,
    pages: book?.pages !== undefined && book?.pages !== null && book?.pages !== '' ? String(book.pages) : '',
    aboutLong: book?.aboutLong ?? '',
    // One point per line, "Title | Body" — kept as text in the form and
    // parsed on submit, so the admin needs no repeatable-field widget.
    insidePoints: (book?.insidePoints ?? [])
      .map((p) => (p.body ? `${p.title} | ${p.body}` : p.title))
      .join('\n'),
    excerpt: book?.excerpt ?? '',
    excerptSource: book?.excerptSource ?? '',
    authorBio: book?.authorBio ?? '',
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
      fd.append('author', form.author || '')
      fd.append('genre', form.genre)
      if (form.publishedDate) fd.append('publishedDate', form.publishedDate)
      fd.append('featured', form.featured ? 'true' : 'false')
      const priceNum = form.price === '' || form.price == null ? 0 : Number(form.price)
      fd.append('price', String(Number.isFinite(priceNum) ? priceNum : 0))
      fd.append('inStock', form.inStock ? 'true' : 'false')
      fd.append('availableFormats', JSON.stringify({ physical: true, digital: false }))
      if (form.pages !== '' && form.pages != null) fd.append('pages', String(form.pages))
      fd.append('aboutLong', form.aboutLong || '')
      fd.append('excerpt', form.excerpt || '')
      fd.append('excerptSource', form.excerptSource || '')
      fd.append('authorBio', form.authorBio || '')
      fd.append(
        'insidePoints',
        JSON.stringify(
          form.insidePoints
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [title, ...rest] = line.split('|')
              return { title: title.trim(), body: rest.join('|').trim() }
            })
            .filter((p) => p.title)
        )
      )
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
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 max-w-2xl w-full min-w-0">
      <div>
        <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Title *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
        />
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Subtitle</label>
        <input
          type="text"
          value={form.subtitle}
          onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
        />
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Author</label>
        <input
          type="text"
          value={form.author}
          onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
          placeholder="Bruno Iradukunda"
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
        />
        <p className="text-xs text-ink-500 mt-1">
          Books credited to Bruno Iradukunda lead the Books page. Anything else is
          listed under the Vitalreadings catalogue.
        </p>
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Description *</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
        />
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Cover image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          className="w-full text-xs sm:text-sm text-ink-600"
        />
        {coverFile && (
          <div className="mt-2">
            <img 
              src={URL.createObjectURL(coverFile)} 
              alt="Preview" 
              className="w-32 h-auto rounded border border-ink-200" 
            />
          </div>
        )}
        {isEdit && book?.coverImage && !coverFile && (
          <div className="mt-2">
            <img src={book.coverImage} alt="Current" className="w-32 h-auto rounded border border-ink-200" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Genre</label>
          <input
            type="text"
            value={form.genre}
            onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Published date</label>
          <input
            type="date"
            value={form.publishedDate}
            onChange={(e) => setForm((f) => ({ ...f, publishedDate: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            className="w-4 h-4"
          />
          <span className="text-xs sm:text-sm">Featured</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
            className="w-4 h-4"
          />
          <span className="text-xs sm:text-sm">In stock</span>
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Price (RWF)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.price === '' || form.price == null ? '' : form.price}
            onChange={(e) => {
              const v = e.target.value
              setForm((f) => ({ ...f, price: v === '' ? '' : parseFloat(v) || 0 }))
            }}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
            placeholder="e.g. 15000"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Number of pages</label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.pages}
            onChange={(e) => setForm((f) => ({ ...f, pages: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
            placeholder="e.g. 200"
          />
        </div>
      </div>
      {/* Detail-page content. Every field is optional — an empty one simply
          hides its band on /books/:id, so a thin record still renders. */}
      <fieldset className="border-t border-ink-200 pt-4 space-y-3 sm:space-y-4">
        <legend className="text-xs sm:text-sm font-semibold text-ink-800 px-2 -ml-2">
          Detail page content <span className="font-normal text-ink-500">(all optional)</span>
        </legend>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">
            About the book
          </label>
          <textarea
            rows={5}
            value={form.aboutLong}
            onChange={(e) => setForm((f) => ({ ...f, aboutLong: e.target.value }))}
            placeholder="The longer description. Blank line between paragraphs."
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">
            What&apos;s inside
          </label>
          <textarea
            rows={4}
            value={form.insidePoints}
            onChange={(e) => setForm((f) => ({ ...f, insidePoints: e.target.value }))}
            placeholder={'One per line:\nThe account | What happened in 1994, told without embellishment.'}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0 font-mono"
          />
          <p className="text-xs text-ink-500 mt-1">
            One point per line, as <code>Title | Description</code>. The description is optional.
          </p>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Excerpt</label>
          <textarea
            rows={4}
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            placeholder="A short passage from the book. Blank line between paragraphs."
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
          />
          <input
            type="text"
            value={form.excerptSource}
            onChange={(e) => setForm((f) => ({ ...f, excerptSource: e.target.value }))}
            placeholder="Source, e.g. My Forgiveness Story, chapter one"
            className="w-full mt-2 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
          />
          <p className="text-xs text-ink-500 mt-1">
            Must be the author&apos;s real words — this is published as a quotation from the book.
          </p>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">
            Author biography
          </label>
          <textarea
            rows={3}
            value={form.authorBio}
            onChange={(e) => setForm((f) => ({ ...f, authorBio: e.target.value }))}
            placeholder="A short note on whoever wrote this book."
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
          />
        </div>
      </fieldset>

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
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const view = searchParams.get('view')
  const editId = searchParams.get('id')
  const showForm = view === 'add' || view === 'edit'
  const editing = editId ? books.find((b) => b._id === editId) ?? null : null

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
    <div className="w-full max-w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
        <h1 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl text-ink-900">Books</h1>
        <button
          type="button"
          onClick={() => navigate('?view=add')}
          className="btn-primary w-full sm:w-auto text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-2.5"
        >
          Add book
        </button>
      </div>

      {showForm ? (
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl border border-ink-100 max-w-full overflow-hidden">
          <h2 className="font-serif text-base sm:text-lg text-ink-900 mb-3 sm:mb-4">{editing ? 'Edit book' : 'New book'}</h2>
          <BookForm
            book={editing}
            onSave={() => { navigate('/admin/books'); fetchBooks(); }}
            onCancel={() => navigate('/admin/books')}
          />
        </div>
      ) : loading ? (
        <p className="text-ink-500">Loading...</p>
      ) : books.length === 0 ? (
        <p className="text-ink-500">No books yet. Add one above.</p>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3 sm:space-y-4">
            {books.map((book) => (
              <div key={book._id} className="bg-white rounded-lg sm:rounded-xl border border-ink-100 p-3 sm:p-4 overflow-hidden">
                <div className="flex gap-4">
                  <img 
                    src={book.coverImage} 
                    alt={book.title} 
                    className="w-20 h-28 object-cover rounded flex-shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink-900 text-base mb-1 break-words">{book.title}</h3>
                    <p className="text-brand-600 font-medium mb-2">{(book.price ?? 0).toLocaleString()} RWF</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {book.featured && (
                        <span className="px-2 py-1 bg-brand-100 text-brand-700 rounded">Featured</span>
                      )}
                      {!book.inStock && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-ink-100">
                  <button
                    type="button"
                    onClick={() => navigate(`?view=edit&id=${book._id}`)}
                    className="flex-1 px-4 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg font-medium text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(book._id)}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block bg-white rounded-xl border border-ink-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
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
                      <td className="py-3 px-4 font-medium text-ink-900 break-words">{book.title}</td>
                      <td className="py-3 px-4 text-ink-600">{(book.price ?? 0).toLocaleString()} RWF</td>
                      <td className="py-3 px-4">{book.featured ? 'Yes' : '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`?view=edit&id=${book._id}`)}
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
          </div>
        </>
      )}
    </div>
  )
}
