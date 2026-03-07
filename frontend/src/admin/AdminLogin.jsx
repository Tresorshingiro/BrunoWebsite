import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAdmin()
  const navigate = useNavigate()

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
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg border border-ink-100 p-8">
        <h1 className="font-serif text-2xl text-ink-900 mb-2">Admin sign in</h1>
        <p className="text-ink-500 text-sm mb-6">Sign in to manage books, blog, events, and orders.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
      <p className="text-center text-ink-500 text-sm mt-4">
        <a href="/" className="text-brand-600 hover:underline">Back to site</a>
      </p>
    </div>
  )
}
