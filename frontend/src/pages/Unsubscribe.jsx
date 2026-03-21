import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { subscribeApi } from '../lib/api'

export default function Unsubscribe() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading') // loading | success | error

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    subscribeApi.unsubscribe(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <p className="text-ink-500 animate-pulse">Processing your request…</p>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-ink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl text-ink-900 mb-3">You've been unsubscribed</h1>
            <p className="text-ink-500 mb-8">
              You will no longer receive email notifications for new blog posts. You can resubscribe any time from the blog page.
            </p>
            <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors">
              Back to Blog
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl text-ink-900 mb-3">Invalid link</h1>
            <p className="text-ink-500 mb-8">
              This unsubscribe link is invalid or has already been used.
            </p>
            <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-ink-200 text-ink-700 font-medium hover:bg-ink-50 transition-colors">
              Back to Blog
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
