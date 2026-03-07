import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/books', label: 'Books' },
  { to: '/blog', label: 'Blog' },
  { to: '/events', label: 'Events' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { totalItems } = useCart()
  const { user, logout } = useUser()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-ink-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-18">
        <Link to="/" className="font-serif text-xl md:text-2xl font-semibold text-ink-900 hover:text-brand-600 transition-colors">
          Bruno Iradukunda
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `font-medium transition-colors ${
                  isActive ? 'text-brand-600' : 'text-ink-600 hover:text-ink-900'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            className="relative p-2 text-ink-600 hover:text-brand-600 transition-colors rounded-lg hover:bg-ink-50"
            aria-label="Cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 flex items-center justify-center text-xs font-medium bg-brand-600 text-white rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 text-ink-600 hover:text-brand-600 hover:bg-ink-50 rounded-lg transition-colors"
                aria-label="User menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-ink-200 shadow-lg z-20 py-2">
                    <div className="px-4 py-3 border-b border-ink-100">
                      <p className="text-sm font-medium text-ink-900">{user.name}</p>
                      <p className="text-xs text-ink-600 mt-0.5">{user.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setUserMenuOpen(false)
                        window.location.href = '/'
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            className="md:hidden p-2 text-ink-600 hover:bg-ink-50 rounded-lg"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink-100 bg-white">
          <nav className="px-4 py-4 flex flex-col gap-2">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-2 font-medium ${
                    isActive ? 'text-brand-600' : 'text-ink-600 hover:text-ink-900'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {user ? (
              <div className="pt-4 mt-4 border-t border-ink-100">
                <div className="px-2 py-2 mb-2">
                  <p className="text-sm font-medium text-ink-900">{user.name}</p>
                  <p className="text-xs text-ink-600 mt-0.5">{user.email}</p>
                </div>
                <Link 
                  to="/orders" 
                  className="flex items-center gap-2 py-2 text-ink-700 font-medium"
                  onClick={() => setOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setOpen(false)
                    window.location.href = '/'
                  }}
                  className="flex items-center gap-2 w-full text-left py-2 text-red-600 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="py-2 text-brand-600 font-medium" onClick={() => setOpen(false)}>
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
