import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingBag, User, LogOut, Menu, X, Package } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { useScrolled } from '../hooks/useMotion'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/my-work', label: 'My Work' },
  { to: '/books', label: 'Books' },
  { to: '/blog', label: 'Blog' },
  { to: '/events', label: 'Events' },
  { to: '/contact', label: 'Contact' },
]

/**
 * variant="overlay" — fixed and transparent over a full-bleed dark hero,
 *                     fading to the solid bar past 40px of scroll. Homepage only.
 * variant="solid"   — sticky, renders the solid bar immediately. Everywhere else.
 */
export default function Header({ variant = 'solid' }) {
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { totalItems } = useCart()
  const { user, logout } = useUser()
  const scrolled = useScrolled(40)

  const isOverlay = variant === 'overlay'
  // The overlay starts transparent; once scrolled (or on any solid page) it
  // becomes the blurred moss bar.
  const solidBar = !isOverlay || scrolled || open

  return (
    <header
      className={[
        isOverlay ? 'fixed' : 'sticky',
        'top-0 inset-x-0 z-50 border-b',
        'transition-[background-color,border-color,padding] duration-300 ease-ease',
        solidBar
          ? 'bg-ink-950/[.92] backdrop-blur-md border-ink-100/15'
          : // Scrim, not full transparency: the hero portrait is light behind
            // the right-hand links, which would otherwise be unreadable.
            'bg-gradient-to-b from-ink-950/85 via-ink-950/45 to-transparent border-transparent',
      ].join(' ')}
    >
      {/* Full-bleed: brand sits at the left edge, nav + utilities at the right,
          with fluid gutters (--gut) rather than a centred max-width column. */}
      <div
        className={`w-full px-[var(--gut)] flex items-center gap-8 transition-all duration-300 ease-ease ${
          solidBar ? 'h-14 md:h-16' : 'h-16 md:h-20'
        }`}
      >
        <Link
          to="/"
          className="font-serif text-xl md:text-2xl font-semibold text-ink-100 hover:text-brand-300 transition-colors mr-auto"
        >
          Bruno Iradukunda
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `group relative text-sm font-medium pb-1 transition-colors ${
                  isActive ? 'text-ink-100' : 'text-ink-100/75 hover:text-ink-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {label}
                  <span
                    className={`absolute left-0 bottom-0 h-px w-full bg-brand-300 origin-left transition-transform duration-300 ease-ease ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Utilities */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/cart"
            className="relative p-2 text-ink-100/80 hover:text-brand-300 transition-colors"
            aria-label={`Cart${totalItems > 0 ? `, ${totalItems} item${totalItems === 1 ? '' : 's'}` : ''}`}
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.6} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 min-w-[1.1rem] h-[1.1rem] px-1 flex items-center justify-center text-[10px] font-semibold bg-brand-300 text-brand-900 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center p-2 text-ink-100/80 hover:text-brand-300 transition-colors"
                aria-label="Account menu"
                aria-expanded={userMenuOpen}
              >
                <User className="w-5 h-5" strokeWidth={1.6} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-ink-950 border border-ink-100/15 rounded-card shadow-xl z-20 py-2">
                    <div className="px-4 py-3 border-b border-ink-100/10">
                      <p className="text-sm font-medium text-ink-100 truncate">{user.name}</p>
                      <p className="text-xs text-ink-300 mt-0.5 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-200 hover:text-brand-300 hover:bg-ink-100/5 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Package className="w-4 h-4" strokeWidth={1.6} />
                      My Orders
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout()
                        setUserMenuOpen(false)
                        window.location.href = '/'
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={1.6} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden lg:inline text-sm font-medium text-ink-100/80 hover:text-brand-300 transition-colors"
            >
              Log in
            </Link>
          )}

          <button
            type="button"
            className="lg:hidden p-2 text-ink-100/80 hover:text-brand-300 transition-colors"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-ink-950 border-t border-ink-100/10">
          <nav className="px-[var(--gut)] py-4 flex flex-col">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-2.5 text-base font-medium border-b border-ink-100/5 transition-colors ${
                    isActive ? 'text-brand-300' : 'text-ink-100/80 hover:text-ink-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {user ? (
              <div className="pt-4 mt-2">
                <p className="text-sm font-medium text-ink-100">{user.name}</p>
                <p className="text-xs text-ink-300 mt-0.5 mb-3 truncate">{user.email}</p>
                <Link
                  to="/orders"
                  className="flex items-center gap-2 py-2 text-ink-100/80 hover:text-brand-300 font-medium"
                  onClick={() => setOpen(false)}
                >
                  <Package className="w-4 h-4" strokeWidth={1.6} />
                  My Orders
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setOpen(false)
                    window.location.href = '/'
                  }}
                  className="flex items-center gap-2 w-full text-left py-2 text-red-400 font-medium"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.6} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="py-3 mt-2 text-brand-300 font-medium"
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
