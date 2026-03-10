import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, PenSquare, Calendar, ShoppingCart, MessageSquare, TrendingUp, DollarSign } from 'lucide-react'
import { authApi, adminApi } from '../lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    authApi
      .stats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    adminApi.orders
      .getAll()
      .then((orders) => {
        // Get the 5 most recent orders
        const recent = orders.slice(0, 5)
        setRecentOrders(recent)
      })
      .catch(() => setRecentOrders([]))
      .finally(() => setLoadingOrders(false))
  }, [])

  if (loading) {
    return <p className="text-ink-500">Loading dashboard...</p>
  }

  const cards = [
    { label: 'Books', value: stats?.books ?? 0, to: '/admin/books', icon: BookOpen, color: 'text-brand-600', bgColor: 'bg-brand-50' },
    { label: 'Blog posts', value: stats?.posts ?? 0, to: '/admin/blog', icon: PenSquare, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Upcoming events', value: stats?.events ?? 0, to: '/admin/events', icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Orders', value: stats?.orders ?? 0, to: '/admin/orders', icon: ShoppingCart, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Unread messages', value: stats?.unreadMessages ?? 0, to: '/admin/messages', icon: MessageSquare, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ]

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="w-full max-w-full min-w-0">
      <div className="mb-4 sm:mb-6">
        <h1 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl text-ink-900 mb-1">Dashboard</h1>
        <p className="text-ink-500 text-xs sm:text-sm">Welcome back! Here's what's happening with your site.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
        {cards.map(({ label, value, to, icon: Icon, color, bgColor }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-lg sm:rounded-xl border border-ink-100 p-3 sm:p-4 md:p-5 lg:p-6 hover:shadow-md hover:border-ink-200 transition-all flex items-center justify-between min-w-0 group">
            <div className="min-w-0 flex-1">
              <p className="text-ink-500 text-xs sm:text-sm font-medium break-words mb-1">{label}</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-ink-900">{value}</p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0 ml-3 group-hover:scale-110 transition-transform`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${color}`} />
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue and Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-base sm:text-lg md:text-xl flex items-center gap-2">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
              Total Revenue
            </h2>
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 opacity-80" />
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">
            {typeof stats?.revenue === 'number' ? stats.revenue.toLocaleString() : '0'} RWF
          </p>
          <p className="text-brand-100 text-xs sm:text-sm">From all paid orders</p>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-ink-100 p-4 sm:p-5 md:p-6">
          <h2 className="font-serif text-base sm:text-lg md:text-xl text-ink-900 mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-ink-600 text-xs sm:text-sm">Total Content</span>
              <span className="font-semibold text-ink-900 text-sm sm:text-base">
                {(stats?.books ?? 0) + (stats?.posts ?? 0) + (stats?.events ?? 0)} items
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-600 text-xs sm:text-sm">Pending Orders</span>
              <span className="font-semibold text-ink-900 text-sm sm:text-base">{stats?.orders ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-600 text-xs sm:text-sm">Unread Messages</span>
              <span className="font-semibold text-orange-600 text-sm sm:text-base">{stats?.unreadMessages ?? 0}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-ink-100">
              <span className="text-ink-600 text-xs sm:text-sm font-medium">Average Order Value</span>
              <span className="font-semibold text-brand-600 text-sm sm:text-base">
                {stats?.orders && stats?.revenue ? Math.round(stats.revenue / Math.max(stats.orders, 1)).toLocaleString() : '0'} RWF
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-4 sm:mt-6 bg-white rounded-lg sm:rounded-xl border border-ink-100 p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-base sm:text-lg md:text-xl text-ink-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-brand-600 hover:text-brand-700 text-xs sm:text-sm font-medium">
            View all →
          </Link>
        </div>
        {loadingOrders ? (
          <p className="text-ink-500 text-sm">Loading orders...</p>
        ) : recentOrders.length === 0 ? (
          <p className="text-ink-500 text-sm">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-ink-50 rounded-lg hover:bg-ink-100 transition-colors">
                <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                  <p className="font-medium text-ink-900 text-sm sm:text-base break-words">{order.customerName}</p>
                  <p className="text-ink-500 text-xs sm:text-sm break-all">{order.customerEmail}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="font-semibold text-ink-900 text-sm sm:text-base whitespace-nowrap">
                    {(order.totalAmount ?? 0).toLocaleString()} RWF
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
