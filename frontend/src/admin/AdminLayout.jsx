import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { useState, useEffect } from 'react'
import { LayoutDashboard, BookOpen, PenSquare, Calendar, ShoppingCart, MessageSquare, Globe, LogOut, ChevronLeft, ChevronRight, User, Menu, X } from 'lucide-react'

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/books', label: 'Books', icon: BookOpen },
  { to: '/admin/blog', label: 'Blog', icon: PenSquare },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
]

export default function AdminLayout() {
  const { admin, loading, logout } = useAdmin()
  const navigate = useNavigate()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isLoggedIn = !!admin

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  const getInitials = (name) => {
    if (!name) return 'A'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-ink-50 overflow-x-hidden max-w-[100vw]">
      {isLoggedIn ? (
        <div className="flex relative min-h-screen overflow-x-hidden">
          {/* Mobile Overlay */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside className={`
            ${sidebarCollapsed ? 'w-20' : 'w-64 max-w-[80vw]'} 
            h-screen bg-gradient-to-b from-ink-900 to-ink-800 text-white flex flex-col fixed top-0 left-0 transition-all duration-300 shadow-xl z-50 overflow-hidden
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-4 border-b border-ink-700/50 flex-shrink-0">
              <div className="flex items-center justify-between">
                {!sidebarCollapsed && (
                  <Link to="/" className="font-serif text-xl font-bold text-white hover:text-brand-400 transition-colors">
                    Bruno Site
                  </Link>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  {/* Close button for mobile */}
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-ink-700 rounded-lg transition-colors lg:hidden"
                    title="Close menu"
                  >
                    <X size={20} />
                  </button>
                  {/* Desktop collapse button */}
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-2 hover:bg-ink-700 rounded-lg transition-colors hidden lg:block"
                    title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  >
                    {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                  </button>
                </div>
              </div>
              {!sidebarCollapsed && (
                <p className="text-ink-400 text-sm mt-1">Admin Panel</p>
              )}
            </div>
            
            <nav className="p-3 flex-1 space-y-1 overflow-y-auto min-h-0 scrollbar-thin">
              {adminNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' 
                        : 'text-ink-300 hover:bg-ink-700/50 hover:text-white'
                    }`
                  }
                  title={sidebarCollapsed ? label : ''}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </nav>
            
            <div className="p-3 border-t border-ink-700/50 space-y-1 flex-shrink-0 bg-ink-900">
              <Link 
                to="/" 
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-ink-400 hover:bg-ink-700/50 hover:text-white rounded-lg transition-all"
                title={sidebarCollapsed ? 'View site' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Globe size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="truncate">View Site</span>}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-ink-400 hover:bg-red-900/20 hover:text-red-400 rounded-lg transition-all"
                title={sidebarCollapsed ? 'Log out' : ''}
              >
                <LogOut size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Log Out</span>}
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className={`flex-1 min-w-0 transition-all duration-300 overflow-x-hidden ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
            {/* Top Navbar */}
            <nav className="bg-white border-b border-ink-200 sticky top-0 z-30 shadow-sm w-full">
              <div className="px-4 sm:px-6 py-3 sm:py-4 max-w-full overflow-hidden">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    {/* Mobile Menu Button */}
                    <button
                      onClick={() => setMobileMenuOpen(true)}
                      className="p-2 hover:bg-ink-50 rounded-lg transition-colors lg:hidden flex-shrink-0"
                      aria-label="Open menu"
                    >
                      <Menu size={20} className="text-ink-900" />
                    </button>
                    <h2 className="text-base sm:text-lg font-semibold text-ink-900 truncate">
                      Welcome, <span className="hidden sm:inline">back, </span>{admin?.username || 'Admin'}
                    </h2>
                  </div>

                  {/* Profile Menu */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 hover:bg-ink-50 rounded-lg transition-colors"
                    >
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-ink-900">{admin?.username}</p>
                        <p className="text-xs text-ink-500">{admin?.email}</p>
                      </div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white font-semibold shadow-md text-sm">
                        {getInitials(admin?.username || 'Admin')}
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {profileMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setProfileMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-ink-200 py-2 z-50">
                          <div className="px-4 py-3 border-b border-ink-100">
                            <p className="text-sm font-semibold text-ink-900">{admin?.username}</p>
                            <p className="text-xs text-ink-500 mt-0.5">{admin?.email}</p>
                          </div>
                          <Link
                            to="/admin/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <User size={18} />
                            <span>Profile Settings</span>
                          </Link>
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                          </Link>
                          <div className="border-t border-ink-100 mt-2 pt-2">
                            <button
                              onClick={() => {
                                setProfileMenuOpen(false)
                                handleLogout()
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut size={18} />
                              <span>Log Out</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </nav>

            {/* Page Content */}
            <main className="p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden w-full">
              <div className="w-full max-w-full min-w-0">
                <Outlet />
              </div>
            </main>
          </div>
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
