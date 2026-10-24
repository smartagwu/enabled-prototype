import { useAppStore } from '../../store/useAppStore'
import type { EventItem } from '../../types'
import { useAnnounce } from '../common/AnnounceContext'

export function RsvpControls({ event }: { event: EventItem }) {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const rsvpToEvent = useAppStore((state) => state.rsvpToEvent)
  const cancelRsvp = useAppStore((state) => state.cancelRsvp)
  const announce = useAnnounce()

  if (!currentUserId) return null

  const myRsvp = event.rsvps.find((r) => r.userId === currentUserId)

  // Pressing a pressed button again withdraws that response, as aria-pressed implies.
  function toggle(status: 'going' | 'interested', announcement: string) {
    if (!currentUserId) return
    if (myRsvp?.status === status) {
      cancelRsvp(event.id, currentUserId)
      announce(`RSVP cancelled for ${event.title}`)
    } else {
      rsvpToEvent(event.id, currentUserId, status)
      announce(announcement)
    }
  }

  const isGoing = myRsvp?.status === 'going'
  const isInterested = myRsvp?.status === 'interested'

  return (
    <div role="group" aria-label="RSVP to this event" className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-pressed={isGoing}
        className={isGoing ? 'btn-primary' : 'btn-secondary'}
        onClick={() => toggle('going', `RSVP'd as going to ${event.title}`)}
      >
        {isGoing && <span aria-hidden="true">✓</span>}
        I'm going
      </button>
      <button
        type="button"
        aria-pressed={isInterested}
        className={isInterested ? 'btn-primary' : 'btn-secondary'}
        onClick={() => toggle('interested', `Marked interested in ${event.title}`)}
      >
        {isInterested && <span aria-hidden="true">✓</span>}
        Interested
      </button>
      {myRsvp && (
        <button
          type="button"
          className="min-h-[44px] rounded-lg px-2 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-800 hover:underline"
          onClick={(e) => {
            // This button disappears once the RSVP is cancelled; move focus to the first RSVP button.
            e.currentTarget.parentElement?.querySelector('button')?.focus()
            cancelRsvp(event.id, currentUserId)
            announce(`RSVP cancelled for ${event.title}`)
          }}
        >
          Cancel RSVP
        </button>
      )}
    </div>
  )
}
