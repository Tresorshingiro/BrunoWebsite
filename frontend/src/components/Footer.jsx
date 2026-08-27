import { Link } from 'react-router-dom'

const explore = [
  { to: '/about', label: 'About Bruno' },
  { to: '/books', label: 'Books' },
  { to: '/blog', label: 'Journal' },
  { to: '/events', label: 'Events' },
  { to: '/my-work', label: 'My Work' },
]

export default function Footer() {
  return (
    <footer className="on-dark bg-ink-950 text-ink-100 border-t border-ink-100/15">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-14 md:pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr] gap-10 md:gap-16">
          <div>
            <Link
              to="/"
              className="font-serif text-2xl font-semibold text-ink-100 hover:text-brand-300 transition-colors"
            >
              Bruno Iradukunda
            </Link>
            <p className="mt-4 text-ink-300 leading-relaxed max-w-[34ch]">
              Author, speaker, and advocate for stories of forgiveness and
              purposeful living.
            </p>
          </div>

          <div>
            <h3 className="text-[.72rem] font-semibold uppercase tracking-[.2em] text-ink-400 mb-5">
              Explore
            </h3>
            <ul className="space-y-3">
              {explore.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-[.92rem] text-ink-200 hover:text-brand-300 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[.72rem] font-semibold uppercase tracking-[.2em] text-ink-400 mb-5">
              Get in touch
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:iradukundabruno2034@gmail.com"
                  className="text-[.92rem] text-ink-200 hover:text-brand-300 transition-colors break-anywhere"
                >
                  iradukundabruno2034@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+250784642822"
                  className="text-[.92rem] text-ink-200 hover:text-brand-300 transition-colors"
                >
                  +250 784 642 822
                </a>
              </li>
              <li className="text-[.92rem] text-ink-300">Kigali, Rwanda</li>
              <li>
                <a
                  href="https://vitalreadings.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[.92rem] text-ink-200 hover:text-brand-300 transition-colors"
                >
                  Vital Readings ↗
                </a>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-[.92rem] text-brand-300 hover:text-brand-200 transition-colors"
                >
                  Send a message →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 md:mt-20 pt-6 border-t border-ink-100/15 flex flex-wrap gap-3 justify-between text-[.82rem] text-ink-400">
          <span>© {new Date().getFullYear()} Bruno Iradukunda. All rights reserved.</span>
          <span>Replies usually within two business days.</span>
        </div>
      </div>
    </footer>
  )
}
