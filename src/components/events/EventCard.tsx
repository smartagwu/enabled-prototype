import { Link } from 'react-router-dom'
import type { EventItem } from '../../types'
import { formatEventRange } from '../../lib/format'

export function EventCard({ event }: { event: EventItem }) {
  const goingCount = event.rsvps.filter((r) => r.status === 'going').length

  return (
    <Link
      to={`/events/${event.id}`}
      className="card-interactive group flex flex-col overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
    >
      <div className={`h-28 w-full bg-gradient-to-br ${event.coverColor}`} aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800">
          {event.category}
        </span>
        <h3 className="text-base font-semibold text-slate-900 group-hover:underline">{event.title}</h3>
        <p className="text-sm text-slate-600">{formatEventRange(event.startsAt, event.endsAt)}</p>
        <p className="text-sm text-slate-500">{event.location.name}</p>
        <p className="mt-auto text-xs text-slate-500">
          {goingCount} going · {event.capacity - goingCount} spots left
        </p>
      </div>
    </Link>
  )
}
