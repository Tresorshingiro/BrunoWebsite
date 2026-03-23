import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { adminApi } from '../lib/api'
import toast from 'react-hot-toast'

function EventForm({ event, onSave, onCancel }) {
  const isEdit = !!event
  const [form, setForm] = useState({
    title: event?.title ?? '',
    description: event?.description ?? '',
    date: event?.date ? new Date(event.date).toISOString().slice(0, 10) : '',
    time: event?.time ?? '',
    location: event?.location ?? '',
    type: event?.type ?? 'in-person',
    registrationLink: event?.registrationLink ?? '',
    videoUrl: event?.videoUrl ?? '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([]) // new files to upload
  const [saving, setSaving] = useState(false)
  const galleryInputRef = useRef(null)

  const addGalleryFiles = (e) => {
    const newFiles = Array.from(e.target.files || [])
    setGalleryFiles((prev) => [...prev, ...newFiles])
    // Reset input so the same file can be re-selected if needed
    e.target.value = ''
  }

  const removeGalleryFile = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('date', form.date)
      fd.append('time', form.time)
      fd.append('location', form.location)
      fd.append('type', form.type)
      if (form.registrationLink) fd.append('registrationLink', form.registrationLink)
      if (form.videoUrl) fd.append('videoUrl', form.videoUrl)
      if (imageFile) fd.append('image', imageFile)
      galleryFiles.forEach((f) => fd.append('gallery', f))

      if (isEdit) {
        await adminApi.events.update(event._id, fd)
        toast.success('Event updated.')
      } else {
        await adminApi.events.create(fd)
        toast.success('Event created.')
      }
      onSave()
    } catch (err) {
      toast.error(err.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl w-full min-w-0">
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Title *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="What will happen at this event? For past events, describe what happened."
          className="w-full px-4 py-2 rounded-lg border border-ink-200 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Date *</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-ink-200 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Time *</label>
          <input
            type="text"
            required
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-ink-200 text-sm"
            placeholder="e.g. 2:00 PM"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Location *</label>
          <input
            type="text"
            required
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-ink-200 text-sm"
            placeholder="City, Venue or 'Online'"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-ink-200 text-sm"
          >
            <option value="in-person">In Person</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Registration Link</label>
        <input
          type="url"
          value={form.registrationLink}
          onChange={(e) => setForm((f) => ({ ...f, registrationLink: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200 text-sm"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">
          Video URL <span className="text-ink-400 font-normal">(YouTube or Vimeo)</span>
        </label>
        <input
          type="url"
          value={form.videoUrl}
          onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200 text-sm"
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
        />
        <p className="text-xs text-ink-400 mt-1">For past events: paste the recording URL. For upcoming: a preview/promo video.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-ink-600"
          />
          {imageFile && (
            <img src={URL.createObjectURL(imageFile)} alt="Preview" className="mt-2 w-32 h-20 object-cover rounded-lg border border-ink-200" />
          )}
          {isEdit && event?.image && !imageFile && (
            <img src={event.image} alt="Current" className="mt-2 w-32 h-20 object-cover rounded-lg border border-ink-200" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Photo Gallery
          </label>

          {/* Existing gallery (edit mode) */}
          {isEdit && event?.gallery?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-ink-500 mb-2">Current photos (uploading new ones will replace these):</p>
              <div className="flex flex-wrap gap-2">
                {event.gallery.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-ink-200" />
                ))}
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={addGalleryFiles}
            className="hidden"
          />

          {/* Add photos button */}
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-ink-300 hover:border-brand-400 text-ink-500 hover:text-brand-600 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {galleryFiles.length > 0 ? 'Add More Photos' : 'Add Photos'}
          </button>

          {/* New files preview */}
          {galleryFiles.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-ink-500 mb-2">{galleryFiles.length} photo{galleryFiles.length > 1 ? 's' : ''} selected:</p>
              <div className="flex flex-wrap gap-2">
                {galleryFiles.map((f, i) => (
                  <div key={i} className="relative group">
                    <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 object-cover rounded-lg border border-ink-200" />
                    <button
                      type="button"
                      onClick={() => removeGalleryFile(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const view = searchParams.get('view')
  const editId = searchParams.get('id')
  const showForm = view === 'add' || view === 'edit'
  const editing = editId ? events.find((e) => e._id === editId) ?? null : null

  const fetchEvents = () => {
    adminApi.events.getAll().then(setEvents).catch(() => setEvents([])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchEvents() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    try {
      await adminApi.events.delete(id)
      toast.success('Event deleted.')
      fetchEvents()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const isPast = (d) => new Date(d) < new Date()

  return (
    <div className="w-full max-w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 md:mb-6">
        <h1 className="font-serif text-xl md:text-2xl lg:text-3xl text-ink-900">Events</h1>
        <button
          type="button"
          onClick={() => navigate('?view=add')}
          className="btn-primary w-full sm:w-auto text-sm"
        >
          Add Event
        </button>
      </div>

      {showForm ? (
        <div className="p-4 md:p-6 bg-white rounded-xl border border-ink-100 max-w-full overflow-hidden">
          <h2 className="font-serif text-lg text-ink-900 mb-4">{editing ? 'Edit Event' : 'New Event'}</h2>
          <EventForm
            event={editing}
            onSave={() => { navigate('/admin/events'); fetchEvents() }}
            onCancel={() => navigate('/admin/events')}
          />
        </div>
      ) : loading ? (
        <p className="text-ink-500">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-ink-500">No events yet.</p>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {events.map((ev) => (
              <div key={ev._id} className="bg-white rounded-xl border border-ink-100 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${isPast(ev.date) ? 'bg-ink-100 text-ink-500' : 'bg-brand-50 text-brand-700'}`}>
                      {isPast(ev.date) ? 'Past' : 'Upcoming'}
                    </span>
                    <h3 className="font-semibold text-ink-900 mt-1">{ev.title}</h3>
                    <p className="text-sm text-ink-500">{formatDate(ev.date)} · {ev.time}</p>
                    <p className="text-sm text-ink-500">{ev.location}</p>
                  </div>
                  {ev.image && <img src={ev.image} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />}
                </div>
                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={() => navigate(`?view=edit&id=${ev._id}`)}
                    className="flex-1 px-3 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg text-sm font-medium transition-colors">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(ev._id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-ink-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-ink-50 border-b border-ink-100">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-ink-700 text-sm">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-ink-700 text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-ink-700 text-sm">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-ink-700 text-sm">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-ink-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev._id} className="border-b border-ink-50 hover:bg-ink-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {ev.image && <img src={ev.image} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />}
                        <span className="font-medium text-ink-900">{ev.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-ink-600 text-sm">{formatDate(ev.date)} · {ev.time}</td>
                    <td className="py-3 px-4 text-ink-600 text-sm">{ev.location}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${isPast(ev.date) ? 'bg-ink-100 text-ink-500' : 'bg-green-50 text-green-700'}`}>
                        {isPast(ev.date) ? 'Past' : 'Upcoming'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button type="button" onClick={() => navigate(`?view=edit&id=${ev._id}`)}
                        className="text-brand-600 hover:underline text-sm mr-3">Edit</button>
                      <button type="button" onClick={() => handleDelete(ev._id)}
                        className="text-red-600 hover:underline text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
