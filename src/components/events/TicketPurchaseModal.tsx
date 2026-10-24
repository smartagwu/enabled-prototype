import { useEffect, useRef, useState } from 'react'
import type { EventItem, Ticket } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { useAnnounce } from '../common/AnnounceContext'
import { Modal } from '../common/Modal'
import { formatCurrency } from '../../lib/format'
import { isFreeEvent, spotsRemaining } from '../../lib/selectors'

const MAX_PER_ORDER = 10

export function TicketPurchaseModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const purchaseTicket = useAppStore((state) => state.purchaseTicket)
  const announce = useAnnounce()
  const [tierId, setTierId] = useState(event.ticketTiers[0]?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [confirmedTicket, setConfirmedTicket] = useState<Ticket | null>(null)
  const doneRef = useRef<HTMLButtonElement>(null)

  const free = isFreeEvent(event)
  const tier = event.ticketTiers.find((t) => t.id === tierId)
  const spotsLeft = spotsRemaining(event)
  const maxQuantity = Math.min(MAX_PER_ORDER, spotsLeft)
  const soldOut = maxQuantity < 1
  const total = (tier?.price ?? 0) * quantity

  // Submitting swaps the form for the confirmation, which would drop focus onto <body>.
  useEffect(() => {
    if (confirmedTicket) doneRef.current?.focus()
  }, [confirmedTicket])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId || !tierId || soldOut) return
    const ticket = purchaseTicket(event.id, currentUserId, tierId, quantity)
    if (!ticket) return
    setConfirmedTicket(ticket)
    announce(`Ticket purchased for ${event.title}, confirmation ${ticket.confirmationCode}`)
  }

  function changeQuantity(next: number) {
    setQuantity(Math.min(maxQuantity, Math.max(1, next)))
  }

  if (confirmedTicket) {
    return (
      <Modal title={free ? "You're registered!" : "You're all set!"} onClose={onClose}>
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Your {free ? 'registration' : 'ticket'} for <strong>{event.title}</strong> is confirmed.
          </p>
          <div className="rounded-lg bg-brand-50 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-brand-700">Confirmation code</p>
            <p className="text-2xl font-bold text-brand-900">{confirmedTicket.confirmationCode}</p>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm text-slate-600">
            <dt>Tier</dt>
            <dd>{tier?.name}</dd>
            <dt>Quantity</dt>
            <dd>{confirmedTicket.quantity}</dd>
            <dt>Total paid</dt>
            <dd>{formatCurrency((tier?.price ?? 0) * confirmedTicket.quantity)}</dd>
          </dl>
          <button ref={doneRef} type="button" className="btn-primary w-full" onClick={onClose}>
            Done
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={`${free ? 'Register' : 'Get tickets'} — ${event.title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {soldOut && (
          <p role="alert" className="rounded-lg bg-amber-100 p-3 text-sm text-amber-800">
            This event is full, so there are no spots left.
          </p>
        )}

        <fieldset>
          <legend className="label">Ticket type</legend>
          <div className="space-y-2">
            {event.ticketTiers.map((t, index) => (
              <label
                key={t.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${
                  tierId === t.id ? 'border-brand-600 ring-1 ring-brand-600' : 'border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={t.id}
                  checked={tierId === t.id}
                  onChange={() => setTierId(t.id)}
                  data-autofocus={index === 0 ? true : undefined}
                  className="mt-1"
                />
                <span>
                  <span className="block font-medium text-slate-900">
                    {t.name} — {formatCurrency(t.price)}
                  </span>
                  <span className="block text-slate-600">{t.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div role="group" aria-labelledby="ticket-quantity-label">
          <p id="ticket-quantity-label" className="label">
            Quantity
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-secondary w-11 px-0 text-lg aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
              aria-label="Decrease quantity"
              aria-disabled={quantity <= 1}
              onClick={() => changeQuantity(quantity - 1)}
            >
              <span aria-hidden="true">−</span>
            </button>
            <span aria-live="polite" className="min-w-[2rem] text-center text-lg font-semibold text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              className="btn-secondary w-11 px-0 text-lg aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
              aria-label="Increase quantity"
              aria-disabled={quantity >= maxQuantity}
              onClick={() => changeQuantity(quantity + 1)}
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            {soldOut ? 'No spots left.' : `Up to ${maxQuantity} per order · ${spotsLeft} spots left`}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-medium text-slate-700">
            Order total
            {tier && total > 0 && (
              <span className="block text-xs font-normal text-slate-600">
                {quantity} × {formatCurrency(tier.price)}
              </span>
            )}
          </span>
          <span aria-live="polite" className="text-lg font-semibold text-slate-900">
            {formatCurrency(total)}
          </span>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={!tierId || soldOut}>
          {total === 0 ? (free ? 'Confirm registration' : 'Confirm RSVP') : `Confirm purchase · ${formatCurrency(total)}`}
        </button>
      </form>
    </Modal>
  )
}
