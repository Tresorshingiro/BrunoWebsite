import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/books', label: 'Books' },
  { to: '/admin/blog', label: 'Blog' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/messages', label: 'Messages' },
]

export default function AdminLayout() {
  const { admin, loading, logout } = useAdmin()
  const navigate = useNavigate()
  const isLoggedIn = !!admin

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {isLoggedIn ? (
        <div className="flex">
          <aside className="w-56 min-h-screen bg-ink-900 text-white flex flex-col fixed">
            <div className="p-4 border-b border-ink-700">
              <Link to="/" className="font-serif text-lg font-semibold text-white hover:text-brand-400">
                Bruno Site
              </Link>
              <p className="text-ink-400 text-sm mt-1">Admin</p>
            </div>
            <nav className="p-2 flex-1">
              {adminNav.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-brand-600 text-white' : 'text-ink-300 hover:bg-ink-800 hover:text-white'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="p-2 border-t border-ink-700">
              <Link to="/" className="block px-3 py-2 text-sm text-ink-400 hover:text-white">
                View site
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-sm text-ink-400 hover:text-white"
              >
                Log out
              </button>
            </div>
          </aside>
          <main className="flex-1 ml-56 p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      ) : (
        <main className="min-h-screen flex items-center justify-center p-4">
          {loading ? (
            <p className="text-ink-500">Loading...</p>
          ) : (
            <Outlet />
          )}
        </main>
      )}
    </div>
  )
}
