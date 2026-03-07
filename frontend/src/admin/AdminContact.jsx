import { useEffect, useState } from 'react'
import { adminApi } from '../lib/api'
import toast from 'react-hot-toast'

export default function AdminContact() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = () => {
    adminApi.contact.getAll().then(setMessages).catch(() => setMessages([])).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const toggleRead = async (id) => {
    try {
      await adminApi.contact.toggleRead(id)
      fetchMessages()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return
    try {
      await adminApi.contact.delete(id)
      toast.success('Message deleted.')
      fetchMessages()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleString()

  if (loading) {
    return <p className="text-ink-500">Loading messages...</p>
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink-900 mb-6">Contact messages</h1>
      {messages.length === 0 ? (
        <p className="text-ink-500">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`rounded-xl border p-6 ${msg.read ? 'bg-white border-ink-100' : 'bg-brand-50/30 border-brand-200'}`}
            >
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <p className="font-medium text-ink-900">{msg.name}</p>
                  <p className="text-sm text-ink-500">{msg.email}</p>
                  <p className="text-sm font-medium text-ink-700 mt-1">{msg.subject}</p>
                  <p className="text-xs text-ink-400 mt-1">{formatDate(msg.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRead(msg._id)}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    {msg.read ? 'Mark unread' : 'Mark read'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(msg._id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-3 text-ink-700 whitespace-pre-wrap">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
