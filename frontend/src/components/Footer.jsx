import { Link } from 'react-router-dom'

const links = [
  { to: '/about', label: 'About' },
  { to: '/books', label: 'Books' },
  { to: '/blog', label: 'Blog' },
  { to: '/events', label: 'Events' },
  { to: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-ink-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link to="/" className="font-serif text-xl font-semibold text-white hover:text-brand-400 transition-colors">
              Bruno Iradukunda
            </Link>
            <p className="mt-3 text-sm leading-relaxed max-w-xs">
              Author, mentor, and advocate for stories of forgiveness and purposeful living.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Explore</h3>
            <ul className="space-y-2">
              {links.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm hover:text-brand-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Connect</h3>
            <p className="text-sm">
              <Link to="/contact" className="hover:text-brand-400 transition-colors">
                Get in touch
              </Link>
              {' · '}
              <a
                href="https://vitalreadings.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-400 transition-colors"
              >
                Vital Readings
              </a>
            </p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-ink-700 text-center text-sm text-ink-500">
          © {new Date().getFullYear()} Bruno Iradukunda. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
