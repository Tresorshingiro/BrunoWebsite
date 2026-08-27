import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useUser } from '../context/UserContext'
import ClipWords from '../components/ClipWords'
import toast from 'react-hot-toast'

/* ─────────────────────────────────────────────────────────────────────────
   LOGIN — split shell.

   The previous page was a grey background with a generic white card: no
   serif, no colour, no imagery. It looked like a different site, which is a
   poor thing to feel just before typing a password.

   The left panel carries the real photograph of the printed book rather than
   a CSS stand-in. It is decorative, so it is marked aria-hidden and the panel
   is hidden entirely below lg — on a phone it would push the form off screen.
   ───────────────────────────────────────────────────────────────────────── */

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login, register } = useUser()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
        toast.success('Welcome back!')
      } else {
        await register(name, email, password)
        toast.success('Account created successfully!')
      }
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      {/* ── BRAND PANEL ────────────────────────────────────────────────── */}
      <aside className="auth-side hidden lg:flex">
        <img
          src="/images/book-display.png"
          alt=""
          aria-hidden="true"
          className="auth-photo"
        />
        <div className="auth-scrim" aria-hidden="true" />

        <Link to="/" className="brandmark font-serif text-xl text-ink-50">
          Bruno Iradukunda
        </Link>

        {/* Quote and copyright travel together at the foot of the panel, where
            the scrim is heaviest. Centred, the quote landed on the book covers
            and vanished into them. */}
        <div>
          <div className="max-w-[22ch]">
            <blockquote className="font-serif text-3xl xl:text-4xl font-semibold leading-[1.18] tracking-tight text-ink-50">
              Forgiveness is something you <em className="italic text-brand-300">decide</em>, and
              then keep deciding.
            </blockquote>
            <cite className="block mt-5 not-italic text-[.72rem] uppercase tracking-[.2em] text-ink-50/70">
              Bruno Iradukunda
            </cite>
          </div>

          <p className="text-sm text-ink-50/45 mt-10">
            © {new Date().getFullYear()} Bruno Iradukunda
          </p>
        </div>
      </aside>

      {/* ── FORM ───────────────────────────────────────────────────────── */}
      <main className="auth-pane">
        <div className="auth-form">
          {/* Wordmark for the breakpoints where the panel is hidden. */}
          <Link to="/" className="lg:hidden font-serif text-xl text-ink-900 block mb-10">
            Bruno Iradukunda
          </Link>

          <p className="eyebrow">Your account</p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink-950 leading-tight tracking-tight mt-4">
            <ClipWords text={isLogin ? 'Welcome back' : 'Create an account'} selfStart />
          </h1>
          <p className="text-ink-600 leading-relaxed mt-4 mb-9">
            {isLogin
              ? 'Sign in to comment on the blog, track an order, and get event dates before they go public.'
              : 'An account lets you comment on the blog, buy books, and follow your orders.'}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <div className="fld">
                <label htmlFor="name">Your name</label>
                <input
                  id="name"
                  type="text"
                  required={!isLogin}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Uwase"
                />
              </div>
            )}

            <div className="fld">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="fld">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  /* A real empty field. The old page used dots as the
                     placeholder, which read as an already-filled password. */
                  placeholder="Your password"
                  className="pr-20"
                />
                <button
                  type="button"
                  className="peek"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {!isLogin && (
                <p className="fld-hint">At least six characters.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 disabled:opacity-50"
            >
              {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
              {!loading && <ArrowRight size={16} className="arw" />}
            </button>
          </form>

          <div className="auth-or">or</div>

          <button
            type="button"
            onClick={() => setIsLogin((v) => !v)}
            className="btn-secondary w-full"
          >
            {isLogin ? 'Create an account' : 'Sign in instead'}
          </button>

          <p className="text-sm text-ink-500 mt-8">
            {isLogin
              ? 'No account yet? Creating one takes about thirty seconds.'
              : 'Already have an account? Sign in above.'}
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-brand-700 transition-colors mt-6"
          >
            <ArrowLeft size={15} />
            Back to the site
          </Link>
        </div>
      </main>
    </div>
  )
}
