import { NavLink, Outlet } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { AccountMenu } from './AccountMenu'
import { pendingIncomingRequests } from '../../lib/selectors'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/people', label: 'Discover' },
  { to: '/messages', label: 'Messages' },
  { to: '/forums', label: 'Forums' },
  { to: '/events', label: 'Events' },
  { to: '/requests', label: 'Requests' },
]

export function AppShell() {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const follows = useAppStore((state) => state.follows)
  const forums = useAppStore((state) => state.forums)

  const followRequestCount = currentUserId ? pendingIncomingRequests(follows, currentUserId).length : 0
  const forumRequestCount = currentUserId
    ? forums
        .filter((f) => f.ownerId === currentUserId)
        .reduce((sum, f) => sum + f.joinRequests.filter((r) => r.status === 'pending').length, 0)
    : 0
  const requestCount = followRequestCount + forumRequestCount

  return (
    <div className="min-h-screen bg-slate-50">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/" className="shrink-0 text-lg font-bold tracking-tight text-brand-800">
            Enabled
          </NavLink>
          {currentUserId && <AccountMenu />}
        </div>

        {currentUserId && (
          <nav aria-label="Primary" className="border-t border-slate-100">
            <ul className="no-scrollbar mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.to} className="shrink-0">
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `relative flex min-h-[40px] items-center whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors ${
                        isActive ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    {item.label}
                    {item.to === '/requests' && requestCount > 0 && (
                      <span
                        className="ml-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white"
                        aria-label={`${requestCount} pending`}
                      >
                        {requestCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
