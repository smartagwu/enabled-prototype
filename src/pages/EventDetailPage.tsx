import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { RsvpControls } from '../components/events/RsvpControls'
import { TicketPurchaseModal } from '../components/events/TicketPurchaseModal'
import { EmptyState } from '../components/common/EmptyState'
import { formatCurrency, formatEventRange } from '../lib/format'

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const event = useAppStore((state) => state.events.find((e) => e.id === eventId))
  const currentUserId = useAppStore((state) => state.currentUserId)
  const [showTicketModal, setShowTicketModal] = useState(false)

  if (!event) {
    return <EmptyState title="Event not found" description="This event doesn't exist or may have already passed." />
  }

  const goingCount = event.rsvps.filter((r) => r.status === 'going').length
  const spotsLeft = Math.max(0, event.capacity - goingCount)
  const myTickets = currentUserId ? event.tickets.filter((t) => t.userId === currentUserId) : []

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className={`h-40 w-full rounded-xl bg-gradient-to-br ${event.coverColor}`} aria-hidden="true" />

      <div>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800">{event.category}</span>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{event.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{formatEventRange(event.startsAt, event.endsAt)}</p>
        <p className="text-sm text-slate-600">Organized by {event.organizer}</p>
      </div>

      <div className="card p-4">
        <h2 className="font-semibold text-slate-900">{event.location.name}</h2>
        <p className="text-sm text-slate-600">{event.location.address}</p>
        <p className="mt-2 text-sm text-slate-700">
          <span className="font-medium">Accessibility: </span>
          {event.location.accessibility}
        </p>
      </div>

      <div className="card space-y-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <RsvpControls event={event} />
          <button type="button" className="btn-primary sm:shrink-0" onClick={() => setShowTicketModal(true)}>
            Get tickets
          </button>
        </div>
        <p className="text-sm text-slate-500">
          {goingCount} going · {spotsLeft} of {event.capacity} spots left
        </p>
      </div>

      {myTickets.length > 0 && (
        <div className="card p-4">
          <h2 className="mb-2 font-semibold text-slate-900">Your tickets</h2>
          <ul className="space-y-2">
            {myTickets.map((ticket) => {
              const tier = event.ticketTiers.find((t) => t.id === ticket.tierId)
              return (
                <li key={ticket.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span>
                    {tier?.name} × {ticket.quantity}
                  </span>
                  <span className="font-mono font-semibold text-brand-700">{ticket.confirmationCode}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <section>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Summary</h2>
        <p className="text-sm text-slate-700">{event.summary}</p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">What to expect</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {event.expectations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Timeline</h2>
        <ol className="space-y-3 border-l-2 border-brand-100 pl-4">
          {event.agenda.map((item) => (
            <li key={item.time}>
              <p className="text-sm font-semibold text-brand-800">{item.time}</p>
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              {item.detail && <p className="text-sm text-slate-600">{item.detail}</p>}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Instructions</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {event.instructions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Who can attend</h2>
        <p className="text-sm text-slate-700">{event.whoCanAttend}</p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Things to know</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {event.thingsToKnow.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Tickets</h2>
        <ul className="space-y-2">
          {event.ticketTiers.map((tier) => (
            <li key={tier.id} className="card flex items-center justify-between p-3 text-sm">
              <span>
                <span className="block font-medium text-slate-900">{tier.name}</span>
                <span className="text-slate-600">{tier.description}</span>
              </span>
              <span className="font-semibold text-slate-900">{formatCurrency(tier.price)}</span>
            </li>
          ))}
        </ul>
      </section>

      {showTicketModal && <TicketPurchaseModal event={event} onClose={() => setShowTicketModal(false)} />}
    </div>
  )
}
