import { useEffect, useState } from 'react'
import { adminApi } from '../lib/api'
import toast from 'react-hot-toast'

const statusOptions = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const fetchOrders = () => {
    adminApi.orders.getAll().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await adminApi.orders.updateStatus(orderId, newStatus)
      toast.success('Order updated.')
      fetchOrders()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this order record?')) return
    try {
      await adminApi.orders.delete(id)
      toast.success('Order deleted.')
      fetchOrders()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleString()

  if (loading) {
    return <p className="text-ink-500">Loading orders...</p>
  }

  return (
    <div className="w-full max-w-full min-w-0">
      <h1 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl text-ink-900 mb-3 sm:mb-4 md:mb-6">Orders</h1>
      {orders.length === 0 ? (
        <p className="text-ink-500">No orders yet.</p>
      ) : (
        <div className="space-y-3 sm:space-y-4 md:space-y-6 max-w-full">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg sm:rounded-xl border border-ink-100 p-3 sm:p-4 md:p-5 lg:p-6 max-w-full overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink-900 break-words">{order.customerName}</p>
                  <p className="text-sm text-ink-500 break-all">{order.customerEmail}</p>
                  <p className="text-xs text-ink-400 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <span className="font-semibold text-ink-900 text-lg">{(order.totalAmount ?? 0).toLocaleString()} RWF</span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    disabled={updating === order._id}
                    className="px-3 py-2 sm:py-1.5 rounded-lg border border-ink-200 text-sm w-full sm:w-auto"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDelete(order._id)}
                    className="px-3 sm:px-4 py-2 sm:py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {order.shippingAddress && (order.shippingAddress.street || order.shippingAddress.city) && (
                <p className="text-sm text-ink-600 mb-2 break-words">
                  Ship to: {[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.country, order.shippingAddress.zipCode].filter(Boolean).join(', ')}
                </p>
              )}
              <ul className="border-t border-ink-100 pt-3 space-y-1">
                {order.items?.map((item, i) => (
                  <li key={i} className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                    <span className="text-ink-900 break-words">{item.title} × {item.quantity} ({item.format})</span>
                    <span className="text-ink-600 font-medium">{(item.price * item.quantity).toLocaleString()} RWF</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
