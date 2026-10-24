import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
const FIELD_SELECTOR = 'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'

let openDialogs = 0

/** Makes everything behind the dialog inert and stops the page scrolling underneath it. */
function lockPage() {
  openDialogs += 1
  if (openDialogs > 1) return
  const root = document.getElementById('root')
  if (root) root.inert = true
  // Reserve the scrollbar's width so the page doesn't jump sideways when it disappears.
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  document.body.style.overflow = 'hidden'
  if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`
}

function unlockPage() {
  openDialogs = Math.max(0, openDialogs - 1)
  if (openDialogs > 0) return
  const root = document.getElementById('root')
  if (root) root.inert = false
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}

export function Modal({ title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const titleId = useId()
  // Read through a ref so the keydown listener (registered once) always calls the latest onClose.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    lockPage()

    // Start on an element marked data-autofocus, else the first form field, else the dialog itself
    // (so its title is read out). Never the close button.
    const initial = dialog?.querySelector<HTMLElement>('[data-autofocus]') ?? dialog?.querySelector<HTMLElement>(FIELD_SELECTOR)
    ;(initial ?? dialog)?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        // An open suggestion list (e.g. @mentions) takes the first Escape to close itself.
        if ((event.target as HTMLElement | null)?.closest?.('[aria-expanded="true"][role="combobox"]')) return
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      if (event.key === 'Tab' && dialog) {
        const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement
        if (event.shiftKey && (active === first || active === dialog)) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      unlockPage()
      previouslyFocused.current?.focus()
    }
  }, [])

  // Portalled out of #root so that #root can be made inert while the dialog is open.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-surface p-6 shadow-xl focus:outline-none"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost -mr-2 -mt-2 px-2" aria-label="Close dialog">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
