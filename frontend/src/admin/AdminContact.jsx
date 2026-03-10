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
    <div className="w-full max-w-full min-w-0">
      <h1 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl text-ink-900 mb-3 sm:mb-4 md:mb-6">Contact messages</h1>
      {messages.length === 0 ? (
        <p className="text-ink-500">No messages yet.</p>
      ) : (
        <div className="space-y-2.5 sm:space-y-3 md:space-y-4 max-w-full">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`rounded-lg sm:rounded-xl border p-3 sm:p-4 md:p-5 lg:p-6 max-w-full overflow-hidden ${msg.read ? 'bg-white border-ink-100' : 'bg-brand-50/30 border-brand-200'}`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink-900 break-words">{msg.name}</p>
                  <p className="text-sm text-ink-500 break-all">{msg.email}</p>
                  <p className="text-sm font-medium text-ink-700 mt-1 break-words">{msg.subject}</p>
                  <p className="text-xs text-ink-400 mt-1">{formatDate(msg.createdAt)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => toggleRead(msg._id)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg font-medium transition-colors"
                  >
                    {msg.read ? 'Mark unread' : 'Mark read'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(msg._id)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-3 text-ink-700 whitespace-pre-wrap break-words text-sm sm:text-base">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
