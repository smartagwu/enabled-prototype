import { useAppStore } from '../../store/useAppStore'
import { useAnnounce } from '../common/LiveAnnouncer'
import type { EventItem } from '../../types'

export function RsvpControls({ event }: { event: EventItem }) {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const rsvpToEvent = useAppStore((state) => state.rsvpToEvent)
  const cancelRsvp = useAppStore((state) => state.cancelRsvp)
  const announce = useAnnounce()

  if (!currentUserId) return null

  const myRsvp = event.rsvps.find((r) => r.userId === currentUserId)

  return (
    <div role="group" aria-label="RSVP to this event" className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={myRsvp?.status === 'going' ? 'btn-primary' : 'btn-secondary'}
        onClick={() => {
          rsvpToEvent(event.id, currentUserId, 'going')
          announce(`RSVP'd as going to ${event.title}`)
        }}
      >
        {myRsvp?.status === 'going' ? "✓ You're going" : "I'm going"}
      </button>
      <button
        type="button"
        className={myRsvp?.status === 'interested' ? 'btn-primary' : 'btn-secondary'}
        onClick={() => {
          rsvpToEvent(event.id, currentUserId, 'interested')
          announce(`Marked interested in ${event.title}`)
        }}
      >
        {myRsvp?.status === 'interested' ? '✓ Interested' : 'Interested'}
      </button>
      {myRsvp && (
        <button
          type="button"
          className="btn-ghost text-sm"
          onClick={() => {
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
