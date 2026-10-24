import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnnounceContext } from './AnnounceContext'

function LiveAnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const announce = useCallback((next: string) => {
    clearTimeout(timeoutRef.current)
    setMessage('')
    // Clearing then re-setting on a tick forces screen readers to re-announce repeated messages.
    timeoutRef.current = setTimeout(() => setMessage(next), 50)
  }, [])

  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      {/* Portalled to <body>: #root is made inert while a dialog is open, which would silence it. */}
      {createPortal(
        <div aria-live="polite" role="status" className="sr-only">
          {message}
        </div>,
        document.body,
      )}
    </AnnounceContext.Provider>
  )
}

export default LiveAnnouncerProvider