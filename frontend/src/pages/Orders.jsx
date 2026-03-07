import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useUser } from '../context/UserContext'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      api.get('/api/users/orders')
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setLoading(false))
    }
  }, [user])

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-ink-100 text-ink-800'
    }
  }

  if (loading) {
    return (
      <div className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-ink-500">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="section-heading mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-ink-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-ink-600 text-lg mb-6">You haven't placed any orders yet.</p>
            <Link to="/books" className="btn-primary">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl border border-ink-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-ink-600">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-ink-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        {item.coverImage && (
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-serif text-base text-ink-900">{item.title}</h3>
                          <p className="text-sm text-ink-600 mt-1">
                            Quantity: {item.quantity} × {item.price.toLocaleString()} RWF
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-ink-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-ink-700">Total</span>
                    <span className="text-lg font-semibold text-ink-900">
                      {order.totalAmount.toLocaleString()} RWF
                    </span>
                  </div>

                  {order.shippingAddress && (
                    <div className="mt-4 pt-4 border-t border-ink-100">
                      <p className="text-xs font-medium text-ink-700 mb-1">Shipping Address</p>
                      <p className="text-sm text-ink-600">
                        {order.shippingAddress.street && `${order.shippingAddress.street}, `}
                        {order.shippingAddress.city && `${order.shippingAddress.city}, `}
                        {order.shippingAddress.state && `${order.shippingAddress.state} `}
                        {order.shippingAddress.zipCode}
                        {order.shippingAddress.country && `, ${order.shippingAddress.country}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
