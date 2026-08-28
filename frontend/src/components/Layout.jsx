import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

// Routes whose first section is a full-bleed dark hero the nav can sit on top of.
const OVERLAY_ROUTES = [
  '/', '/about', '/my-work', '/books', '/blog', '/events', '/contact',
  '/cart', '/orders', '/profile', '/order-success',
]

// Book detail pages open with the same dark product panel, and their ids are
// dynamic, so they are matched by prefix rather than listed.
const OVERLAY_PREFIXES = ['/books/', '/blog/', '/events/', '/orders/']

// Checkout strips the nav: fewer ways to wander off mid-purchase.
const MINIMAL_HEADER_ROUTES = ['/checkout']
// Both transactional pages get the reduced footer — but Order Success keeps its
// full nav, because a customer who has just paid should be able to leave.
const REDUCED_FOOTER_ROUTES = ['/checkout', '/order-success']

const isOverlayRoute = (pathname) =>
  OVERLAY_ROUTES.includes(pathname) || OVERLAY_PREFIXES.some((p) => pathname.startsWith(p))

export default function Layout() {
  const { pathname } = useLocation()
  const minimalHeader = MINIMAL_HEADER_ROUTES.includes(pathname)
  const reducedFooter = REDUCED_FOOTER_ROUTES.includes(pathname)
  const headerVariant = minimalHeader ? 'minimal' : isOverlayRoute(pathname) ? 'overlay' : 'solid'

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant={headerVariant} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer variant={reducedFooter ? 'reduced' : 'full'} />
    </div>
  )
}
