import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi
      .stats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-ink-500">Loading dashboard...</p>
  }

  const cards = [
    { label: 'Books', value: stats?.books ?? 0, to: '/admin/books', color: 'bg-brand-500' },
    { label: 'Blog posts', value: stats?.posts ?? 0, to: '/admin/blog', color: 'bg-ink-600' },
    { label: 'Upcoming events', value: stats?.events ?? 0, to: '/admin/events', color: 'bg-brand-600' },
    { label: 'Orders', value: stats?.orders ?? 0, to: '/admin/orders', color: 'bg-ink-700' },
    { label: 'Unread messages', value: stats?.unreadMessages ?? 0, to: '/admin/messages', color: 'bg-ink-800' },
  ]

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink-900 mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, to, color }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-xl border border-ink-100 p-6 hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div>
              <p className="text-ink-500 text-sm font-medium">{label}</p>
              <p className="text-2xl font-semibold text-ink-900 mt-1">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${color} opacity-80`} />
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-ink-100 p-6">
        <h2 className="font-serif text-lg text-ink-900 mb-2">Revenue</h2>
        <p className="text-3xl font-semibold text-brand-600">
          {typeof stats?.revenue === 'number' ? stats.revenue.toLocaleString() : '0'} RWF
        </p>
        <p className="text-ink-500 text-sm mt-1">From paid orders</p>
      </div>
    </div>
  )
}
