import { useState } from 'react'
import { contactApi } from '../lib/api'
import toast from 'react-hot-toast'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name?.trim() || !form.email?.trim() || !form.subject?.trim() || !form.message?.trim()) {
      toast.error('Please fill in all fields.')
      return
    }
    setSending(true)
    try {
      await contactApi.submit(form)
      toast.success('Message sent successfully. We\'ll get back to you soon.')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <header className="text-center mb-12">
          <h1 className="section-heading">Contact</h1>
          <p className="text-ink-600">
            Get in touch for events, collaborations, or inquiries about Bruno&apos;s work.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-ink-700 mb-1">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              value={form.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="What is this about?"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-ink-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-y"
              placeholder="Your message..."
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="btn-primary w-full sm:w-auto disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}
