import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnnounceContext } from './AnnounceContext'

function LiveAnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const announce = useCallback((next: string) => {
    setMessage('')
    // Clearing then re-setting on a tick forces screen readers to re-announce repeated messages.
    timeoutRef.current = setTimeout(() => setMessage(next), 50)
  }, [])

  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div aria-live="polite" role="status" className="sr-only">
        {message}
      </div>
    </AnnounceContext.Provider>
  )
}

export default LiveAnnouncerProvider