import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { useAnnounce } from '../common/AnnounceContext'
import { ReportUserModal } from './ReportUserModal'
import { focusPageHeading } from '../../lib/focus'

interface UserSafetyActionsProps {
  userId: string
  userName: string
  /** Runs after blocking; by default focus moves to the page heading. */
  onBlocked?: () => void
}

/** Block and report buttons for another member's profile or direct-message thread. */
export function UserSafetyActions({ userId, userName, onBlocked }: UserSafetyActionsProps) {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const blockUser = useAppStore((state) => state.blockUser)
  const announce = useAnnounce()
  const [reporting, setReporting] = useState(false)

  if (!currentUserId || currentUserId === userId) return null

  function afterBlock() {
    if (onBlocked) onBlocked()
    else requestAnimationFrame(() => focusPageHeading())
  }

  function handleBlock() {
    if (!currentUserId) return
    if (
      !window.confirm(
        `Block ${userName}? You won't see their posts or messages, and neither of you can follow or message the other. You can unblock them later from their profile.`,
      )
    ) {
      return
    }
    blockUser(currentUserId, userId)
    announce(`Blocked ${userName}`)
    afterBlock()
  }

  return (
    <>
      <button type="button" className="btn-ghost" onClick={handleBlock}>
        Block<span className="sr-only"> {userName}</span>
      </button>
      <button type="button" className="btn-ghost" onClick={() => setReporting(true)}>
        Report<span className="sr-only"> {userName}</span>
      </button>
      {reporting && (
        <ReportUserModal
          userId={userId}
          userName={userName}
          onClose={() => setReporting(false)}
          onBlocked={afterBlock}
        />
      )}
    </>
  )
}
