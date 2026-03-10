import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { admin, login } = useAdmin()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (admin) {
      navigate('/admin/dashboard')
    }
  }, [admin, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Email and password are required.')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back.')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-ink-100 p-4 sm:p-6 md:p-8">
        <h1 className="font-serif text-xl sm:text-2xl text-ink-900 mb-1.5 sm:mb-2">Admin sign in</h1>
        <p className="text-ink-500 text-xs sm:text-sm mb-4 sm:mb-6">Sign in to manage books, blog, events, and orders.</p>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-w-0"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-ink-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-w-0"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 text-sm sm:text-base py-2.5 sm:py-3">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
      <p className="text-center text-ink-500 text-xs sm:text-sm mt-3 sm:mt-4">
        <a href="/" className="text-brand-600 hover:underline">Back to site</a>
      </p>
    </div>
  )
}
