import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

// Routes whose first section is a full-bleed dark hero the nav can sit on top of.
const OVERLAY_ROUTES = ['/', '/about', '/my-work', '/books', '/blog', '/events', '/contact']

// Book detail pages open with the same dark product panel, and their ids are
// dynamic, so they are matched by prefix rather than listed.
const OVERLAY_PREFIXES = ['/books/', '/blog/', '/events/']

const isOverlayRoute = (pathname) =>
  OVERLAY_ROUTES.includes(pathname) || OVERLAY_PREFIXES.some((p) => pathname.startsWith(p))

export default function Layout() {
  const { pathname } = useLocation()
  const variant = isOverlayRoute(pathname) ? 'overlay' : 'solid'

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant={variant} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
