import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'

const TABS = [['orders', 'Orders', '/orders'], ['profile', 'Profile', '/profile']]

export default function AccountNav({ current }) {
  const { logout } = useUser()
  const navigate = useNavigate()

  return (
    <nav className="flex gap-6 mt-8 overflow-x-auto">
      {TABS.map(([key, label, to]) => (
        <Link key={key} to={to}
              aria-current={current === key ? 'page' : undefined}
              className={`text-sm font-medium pb-3.5 border-b-2 whitespace-nowrap transition-colors ${
                current === key
                  ? 'text-ink-50 border-brand-300'
                  : 'text-ink-100/60 border-transparent hover:text-ink-100'
              }`}>
          {label}
        </Link>
      ))}
      <button type="button"
              onClick={() => { logout(); navigate('/') }}
              className="text-sm font-medium pb-3.5 border-b-2 border-transparent text-ink-100/60 hover:text-ink-100 whitespace-nowrap">
        Sign out
      </button>
    </nav>
  )
}
