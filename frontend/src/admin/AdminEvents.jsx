import { useEffect, useState } from 'react'
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
  })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

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
      if (imageFile) fd.append('image', imageFile)
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
        <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Description *</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Date *</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Time *</label>
          <input
            type="text"
            required
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
            placeholder="e.g. 2:00 PM"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Location *</label>
        <input
          type="text"
          required
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
          placeholder="City, Venue or 'Online'"
        />
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Type</label>
        <select
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
        >
          <option value="in-person">In person</option>
          <option value="online">Online</option>
        </select>
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Registration link</label>
        <input
          type="url"
          value={form.registrationLink}
          onChange={(e) => setForm((f) => ({ ...f, registrationLink: e.target.value }))}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-ink-200 min-w-0"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full text-xs sm:text-sm text-ink-600"
        />
        {imageFile && (
          <div className="mt-2">
            <img 
              src={URL.createObjectURL(imageFile)} 
              alt="Preview" 
              className="w-32 h-auto rounded border border-ink-200" 
            />
          </div>
        )}
        {isEdit && event?.image && !imageFile && (
          <div className="mt-2">
            <img src={event.image} alt="Current" className="w-32 h-auto rounded border border-ink-200" />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : isEdit ? 'Update event' : 'Create event'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const fetchEvents = () => {
    adminApi.events.getAll().then(setEvents).catch(() => setEvents([])).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchEvents()
  }, [])

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

  const formatDate = (d) => new Date(d).toLocaleDateString()

  return (
    <div className="w-full max-w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
        <h1 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl text-ink-900">Events</h1>
        <button
          type="button"
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary w-full sm:w-auto text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-2.5"
        >
          Add event
        </button>
      </div>

      {showForm ? (
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 bg-white rounded-lg sm:rounded-xl border border-ink-100 max-w-full overflow-hidden">
          <h2 className="font-serif text-base sm:text-lg text-ink-900 mb-3 sm:mb-4">{editing ? 'Edit event' : 'New event'}</h2>
          <EventForm
            event={editing}
            onSave={() => { setShowForm(false); setEditing(null); fetchEvents(); }}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      ) : loading ? (
        <p className="text-ink-500">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-ink-500">No events yet.</p>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-2.5 sm:space-y-3">
            {events.map((ev) => (
              <div key={ev._id} className="bg-white rounded-lg sm:rounded-xl border border-ink-100 p-3 sm:p-4 overflow-hidden">
                <div className="flex flex-col gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink-900 text-base mb-2 break-words">{ev.title}</h3>
                    <div className="text-sm text-ink-600 space-y-1 mb-3">
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Date:</span>
                        <span>{formatDate(ev.date)} · {ev.time}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Location:</span>
                        <span className="break-words">{ev.location}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditing(ev); setShowForm(true); }}
                      className="flex-1 px-4 py-2.5 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg font-medium text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ev._id)}
                      className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
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
                    <th className="text-left py-3 px-4 font-medium text-ink-700">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-ink-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-ink-700">Location</th>
                    <th className="text-right py-3 px-4 font-medium text-ink-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev._id} className="border-b border-ink-50">
                      <td className="py-3 px-4 font-medium text-ink-900 break-words">{ev.title}</td>
                      <td className="py-3 px-4 text-ink-600">{formatDate(ev.date)} · {ev.time}</td>
                      <td className="py-3 px-4 text-ink-600">{ev.location}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => { setEditing(ev); setShowForm(true); }}
                          className="text-brand-600 hover:underline mr-3"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ev._id)}
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
