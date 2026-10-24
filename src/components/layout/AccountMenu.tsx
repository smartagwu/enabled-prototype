import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, usePendingRequestCount } from '../../store/useAppStore'
import type { TextSize } from '../../types'
import { Avatar } from '../common/Avatar'
import { userById } from '../../lib/selectors'

const TEXT_SIZES: TextSize[] = [100, 125, 150]

const SECTION_LABEL = 'px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-600'

export function AccountMenu() {
  const users = useAppStore((state) => state.users)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const setCurrentUser = useAppStore((state) => state.setCurrentUser)
  const resetAppData = useAppStore((state) => state.resetAppData)
  const signOut = useAppStore((state) => state.signOut)
  const display = useAppStore((state) => state.display)
  const setDisplay = useAppStore((state) => state.setDisplay)
  const pendingCount = usePendingRequestCount(currentUserId)
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  const currentUser = userById(users, currentUserId)
  const otherUsers = users.filter((u) => u.id !== currentUserId)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>('button, input')?.focus()
  }, [open])

  if (!currentUser) return null

  // Closes the panel after an action. Focus returns to the trigger; a route change then moves it on to the new page.
  function closeMenu() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function handleBlur(event: React.FocusEvent) {
    // Tabbing out of the account menu closes it. A null relatedTarget (e.g. a click on plain text) is ignored.
    if (open && event.relatedTarget && !containerRef.current?.contains(event.relatedTarget as Node)) setOpen(false)
  }

  function switchTo(userId: string) {
    setCurrentUser(userId)
    closeMenu()
    navigate('/')
  }

  function handleSignOut() {
    closeMenu()
    signOut()
    navigate('/login', { state: { focusHeading: true } })
  }

  function handleReset() {
    closeMenu()
    if (window.confirm('Restore every profile, message, and post to how it started? This cannot be undone.')) {
      resetAppData()
    }
  }

  return (
    <div className="relative" ref={containerRef} onBlur={handleBlur}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="dialog"
        className="flex min-h-[44px] items-center gap-2 rounded-full py-1 pl-1 pr-3 text-left hover:bg-slate-100"
      >
        <span className="relative">
          <Avatar id={currentUser.id} name={currentUser.name} size="sm" />
          {pendingCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-2 -top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white"
            >
              {pendingCount}
            </span>
          )}
        </span>
        <span className="sr-only text-sm font-medium text-slate-900 sm:not-sr-only">{currentUser.name}</span>
        {pendingCount > 0 && <span className="sr-only">, {pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'}</span>}
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-label="Account and display settings"
          className="absolute right-0 top-full z-30 mt-2 max-h-[calc(100vh-5rem)] w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-slate-200 bg-surface py-2 shadow-lg"
        >
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar id={currentUser.id} name={currentUser.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{currentUser.name}</p>
              <p className="truncate text-xs text-slate-600">{currentUser.headline}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              closeMenu()
              navigate(`/profile/${currentUser.id}`)
            }}
            className="flex min-h-[44px] w-full items-center px-3 text-sm text-slate-700 hover:bg-slate-50 focus-visible:-outline-offset-2"
          >
            View my profile
          </button>

          <div className="my-2 border-t border-slate-100" />

          <fieldset className="px-3 pb-1">
            <legend className={`${SECTION_LABEL} px-0`}>Display</legend>
            <p id={`${panelId}-text-size`} className="mb-1 text-sm font-medium text-slate-700">
              Text size
            </p>
            <div role="radiogroup" aria-labelledby={`${panelId}-text-size`} className="grid grid-cols-3 gap-1">
              {TEXT_SIZES.map((size) => (
                <label key={size} className="relative">
                  <input
                    type="radio"
                    name="text-size"
                    value={size}
                    checked={display.textSize === size}
                    onChange={() => setDisplay({ textSize: size })}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 peer-checked:bg-brand-700 peer-checked:text-white peer-checked:ring-brand-700 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600">
                    {size}%
                  </span>
                </label>
              ))}
            </div>
            <DisplayToggle
              label="High contrast"
              checked={display.highContrast}
              onChange={(highContrast) => setDisplay({ highContrast })}
            />
            <DisplayToggle
              label="Reduce motion"
              checked={display.reduceMotion}
              onChange={(reduceMotion) => setDisplay({ reduceMotion })}
            />
            <DisplayToggle
              label="Dark theme"
              checked={display.darkTheme}
              onChange={(darkTheme) => setDisplay({ darkTheme })}
            />
          </fieldset>

          <div className="my-2 border-t border-slate-100" />

          <p className={SECTION_LABEL}>Switch profile</p>
          <div className="max-h-56 overflow-y-auto">
            {otherUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => switchTo(user.id)}
                className="flex w-full min-h-[44px] items-center gap-3 px-3 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:-outline-offset-2"
              >
                <Avatar id={user.id} name={user.name} size="sm" />
                <span className="truncate">{user.name}</span>
              </button>
            ))}
          </div>

          <div className="my-2 border-t border-slate-100" />

          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-[44px] w-full items-center px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:-outline-offset-2"
          >
            Sign out
          </button>

          <div className="my-2 border-t border-slate-200" />

          <p className={SECTION_LABEL}>Prototype tools</p>
          <button
            type="button"
            onClick={handleReset}
            className="flex min-h-[44px] w-full items-center px-3 text-sm text-red-700 hover:bg-red-50 focus-visible:-outline-offset-2"
          >
            Reset app data
          </button>
        </div>
      )}
    </div>
  )
}

function DisplayToggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 accent-brand-700"
      />
      {label}
    </label>
  )
}
