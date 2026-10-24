import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { useAnnounce } from '../common/AnnounceContext'
import { Modal } from '../common/Modal'

const REASONS = [
  'Harassment or bullying',
  'Spam or scams',
  'Inappropriate content',
  'Pretending to be someone else',
  'Something else',
]

interface ReportUserModalProps {
  userId: string
  userName: string
  onClose: () => void
  /** Called after the person is also blocked as part of the report. */
  onBlocked?: () => void
}

export function ReportUserModal({ userId, userName, onClose, onBlocked }: ReportUserModalProps) {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const reportUser = useAppStore((state) => state.reportUser)
  const blockUser = useAppStore((state) => state.blockUser)
  const announce = useAnnounce()
  const [reason, setReason] = useState(REASONS[0])
  const [details, setDetails] = useState('')
  const [alsoBlock, setAlsoBlock] = useState(false)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!currentUserId) return
    reportUser(currentUserId, userId, reason, details)
    if (alsoBlock) blockUser(currentUserId, userId)
    announce(alsoBlock ? `Report sent and ${userName} blocked` : `Report about ${userName} sent`)
    onClose()
    if (alsoBlock) onBlocked?.()
  }

  return (
    <Modal title={`Report ${userName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          Reports are reviewed by the Enabled team. {userName} won't be told that you reported them.
        </p>
        <fieldset>
          <legend className="label">What's the problem?</legend>
          <div className="space-y-2">
            {REASONS.map((r, index) => (
              <label key={r} className="flex min-h-[44px] items-center gap-3 rounded-lg border border-slate-200 px-3 text-sm">
                <input
                  type="radio"
                  name="report-reason"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  data-autofocus={index === 0 ? true : undefined}
                />
                {r}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="report-details" className="label">
            Anything else we should know? (optional)
          </label>
          <textarea
            id="report-details"
            className="input"
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>
        <label className="flex min-h-[44px] items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={alsoBlock}
            onChange={(e) => setAlsoBlock(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-brand-700"
          />
          Also block {userName}
        </label>
        <button type="submit" className="btn-primary w-full">
          Send report
        </button>
      </form>
    </Modal>
  )
}
