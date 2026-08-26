import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { Avatar } from '../common/Avatar'
import { userById } from '../../lib/selectors'

export function AccountMenu() {
  const users = useAppStore((state) => state.users)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const setCurrentUser = useAppStore((state) => state.setCurrentUser)
  const resetAppData = useAppStore((state) => state.resetAppData)
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
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

  if (!currentUser) return null

  function switchTo(userId: string) {
    setCurrentUser(userId)
    setOpen(false)
    navigate('/')
  }

  function handleReset() {
    setOpen(false)
    if (window.confirm('Restore every profile, message, and post to how it started? This cannot be undone.')) {
      resetAppData()
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-[44px] items-center gap-2 rounded-full py-1 pl-1 pr-3 text-left hover:bg-slate-100"
      >
        <Avatar id={currentUser.id} name={currentUser.name} size="sm" />
        <span className="hidden text-sm font-medium text-slate-900 sm:inline">{currentUser.name}</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
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
          className="absolute right-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-lg"
        >
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar id={currentUser.id} name={currentUser.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{currentUser.name}</p>
              <p className="truncate text-xs text-slate-500">{currentUser.headline}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false)
              navigate(`/profile/${currentUser.id}`)
            }}
            className="flex w-full min-h-[40px] items-center px-3 text-sm text-slate-700 hover:bg-slate-50"
          >
            View my profile
          </button>

          <div className="my-2 border-t border-slate-100" />

          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Switch profile</p>
          <div className="max-h-56 overflow-y-auto">
            {otherUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => switchTo(user.id)}
                className="flex w-full min-h-[44px] items-center gap-3 px-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <Avatar id={user.id} name={user.name} size="sm" />
                <span className="truncate">{user.name}</span>
              </button>
            ))}
          </div>

          <div className="my-2 border-t border-slate-100" />

          <button
            type="button"
            onClick={handleReset}
            className="flex w-full min-h-[40px] items-center px-3 text-sm text-red-700 hover:bg-red-50"
          >
            Reset app data
          </button>
        </div>
      )}
    </div>
  )
}
