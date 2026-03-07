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
        <label className="block text-sm font-medium text-ink-700 mb-1">Description *</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Date *</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-ink-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Time *</label>
          <input
            type="text"
            required
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-ink-200"
            placeholder="e.g. 2:00 PM"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Location *</label>
        <input
          type="text"
          required
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200"
          placeholder="City, Venue or 'Online'"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Type</label>
        <select
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          className="px-4 py-2 rounded-lg border border-ink-200"
        >
          <option value="in-person">In person</option>
          <option value="online">Online</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Registration link</label>
        <input
          type="url"
          value={form.registrationLink}
          onChange={(e) => setForm((f) => ({ ...f, registrationLink: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-ink-200"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-ink-600"
        />
        {isEdit && event?.image && !imageFile && (
          <img src={event.image} alt="" className="mt-2 w-32 h-auto rounded" />
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl text-ink-900">Events</h1>
        <button
          type="button"
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary"
        >
          Add event
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-white rounded-xl border border-ink-100">
          <h2 className="font-serif text-lg text-ink-900 mb-4">{editing ? 'Edit event' : 'New event'}</h2>
          <EventForm
            event={editing}
            onSave={() => { setShowForm(false); setEditing(null); fetchEvents(); }}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-ink-500">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-ink-500">No events yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-ink-100 overflow-hidden">
          <table className="w-full">
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
                  <td className="py-3 px-4 font-medium text-ink-900">{ev.title}</td>
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
      )}
    </div>
  )
}
