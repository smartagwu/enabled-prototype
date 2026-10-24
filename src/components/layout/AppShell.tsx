import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAppStore, usePendingRequestCount } from '../../store/useAppStore'
import { AccountMenu } from './AccountMenu'
import { focusPageHeading } from '../../lib/focus'

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Home',
    end: true,
    icon: 'm2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  },
  {
    to: '/people',
    label: 'Discover',
    icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
  },
  {
    to: '/messages',
    label: 'Messages',
    icon: 'M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75',
  },
  {
    to: '/forums',
    label: 'Forums',
    icon: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155',
  },
  {
    to: '/events',
    label: 'Events',
    icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
  },
  {
    to: '/requests',
    label: 'Requests',
    icon: 'M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0',
  },
]

export function AppShell() {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const requestCount = usePendingRequestCount(currentUserId)
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const previousPath = useRef<string | null>(null)

  // On each page change: update the tab title, scroll to the top and move focus to the new page, since
  // a client-side route change doesn't do any of that on its own. Initial load is left alone.
  useEffect(() => {
    const heading = document.querySelector('main h1')?.textContent
    document.title = heading ? `${heading} · Enabled` : 'Enabled'

    const previous = previousPath.current
    previousPath.current = pathname
    if (previous === null || previous === pathname) return

    // Picking another conversation keeps you on the Messages page, so don't jump back to the top.
    const staysInMessages = previous.startsWith('/messages') && pathname.startsWith('/messages')
    if (!staysInMessages) window.scrollTo(0, 0)

    // A page can name a better target than its <h1> (e.g. an open conversation) with data-route-focus.
    const target = mainRef.current?.querySelector<HTMLElement>('[data-route-focus]')
    if (target) target.focus({ preventScroll: true })
    else if (!focusPageHeading()) mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="min-h-screen bg-page">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {/* The sticky wrapper has no backdrop-filter itself: that would trap the fixed mobile tab bar inside it. */}
      <div className="sticky top-0 z-20 scaled:max-md:static large:static">
        <header className="border-b border-slate-200 bg-surface/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2">
            <NavLink
              to="/"
              className="inline-flex min-h-[44px] shrink-0 items-center text-lg font-bold tracking-tight text-brand-800"
            >
              Enabled
            </NavLink>
            {currentUserId && <AccountMenu />}
          </div>
        </header>

        {currentUserId && (
          // A fixed tab bar on small screens so every destination stays visible. At larger text sizes the labels
          // no longer fit in one row, so it drops into the page and wraps instead.
          <nav
            aria-label="Primary"
            className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-surface pb-[env(safe-area-inset-bottom)] md:static md:border-b md:border-t-0 scaled:static scaled:border-b scaled:border-t-0"
          >
            <ul className="mx-auto grid max-w-5xl grid-cols-6 md:flex md:gap-1 md:px-4 md:py-1 scaled:flex scaled:flex-wrap scaled:gap-1 scaled:px-4 scaled:py-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.to} className="min-w-0 md:shrink-0 scaled:shrink-0">
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 whitespace-nowrap px-0 text-[0.6875rem] font-medium transition-colors md:min-h-[44px] md:flex-row md:rounded-lg md:px-3 md:text-sm scaled:min-h-[44px] scaled:flex-row scaled:rounded-lg scaled:px-3 scaled:text-sm ${
                        isActive
                          ? 'bg-brand-700 text-white'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-6 w-6 md:hidden scaled:hidden"
                    >
                      <path d={item.icon} />
                    </svg>
                    {item.label}
                    {item.to === '/requests' && requestCount > 0 && (
                      <>
                        <span className="sr-only">, {requestCount} pending</span>
                        <span
                          aria-hidden="true"
                          className="absolute right-1 top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white md:static md:ml-1.5 scaled:static scaled:ml-1.5"
                        >
                          {requestCount}
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto max-w-5xl px-4 pb-24 pt-6 focus:outline-none md:pb-6 scaled:pb-6"
      >
        <Outlet />
      </main>
    </div>
  )
}
