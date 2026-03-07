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
    <div>
      <h1 className="font-serif text-2xl text-ink-900 mb-6">Orders</h1>
      {orders.length === 0 ? (
        <p className="text-ink-500">No orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl border border-ink-100 p-6"
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <p className="font-medium text-ink-900">{order.customerName}</p>
                  <p className="text-sm text-ink-500">{order.customerEmail}</p>
                  <p className="text-xs text-ink-400 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink-900">{(order.totalAmount ?? 0).toLocaleString()} RWF</span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    disabled={updating === order._id}
                    className="px-3 py-1.5 rounded-lg border border-ink-200 text-sm"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDelete(order._id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {order.shippingAddress && (order.shippingAddress.street || order.shippingAddress.city) && (
                <p className="text-sm text-ink-600 mb-2">
                  Ship to: {[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.country, order.shippingAddress.zipCode].filter(Boolean).join(', ')}
                </p>
              )}
              <ul className="border-t border-ink-100 pt-3 space-y-1">
                {order.items?.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{item.title} × {item.quantity} ({item.format})</span>
                    <span>{(item.price * item.quantity).toLocaleString()} RWF</span>
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
