import { useState } from 'react'
import type { EventItem, Ticket } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { useAnnounce } from '../common/LiveAnnouncer'
import { Modal } from '../common/Modal'
import { formatCurrency } from '../../lib/format'

export function TicketPurchaseModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const purchaseTicket = useAppStore((state) => state.purchaseTicket)
  const announce = useAnnounce()
  const [tierId, setTierId] = useState(event.ticketTiers[0]?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [confirmedTicket, setConfirmedTicket] = useState<Ticket | null>(null)

  const tier = event.ticketTiers.find((t) => t.id === tierId)
  const total = (tier?.price ?? 0) * quantity

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId || !tierId) return
    const ticket = purchaseTicket(event.id, currentUserId, tierId, quantity)
    setConfirmedTicket(ticket)
    announce(`Ticket purchased for ${event.title}, confirmation ${ticket.confirmationCode}`)
  }

  if (confirmedTicket) {
    return (
      <Modal title="You're all set!" onClose={onClose}>
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Your ticket for <strong>{event.title}</strong> is confirmed.
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
            <dd>{formatCurrency(total)}</dd>
          </dl>
          <button type="button" className="btn-primary w-full" onClick={onClose}>
            Done
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={`Get tickets — ${event.title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset>
          <legend className="label">Ticket type</legend>
          <div className="space-y-2">
            {event.ticketTiers.map((t) => (
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

        <div>
          <label htmlFor="ticket-quantity" className="label">
            Quantity
          </label>
          <input
            id="ticket-quantity"
            type="number"
            min={1}
            max={10}
            className="input max-w-[6rem]"
            value={quantity}
            onChange={(e) => setQuantity(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
          />
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-medium text-slate-700">Total</span>
          <span className="text-lg font-semibold text-slate-900">{formatCurrency(total)}</span>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={!tierId}>
          Confirm {total === 0 ? 'RSVP' : 'purchase'}
        </button>
      </form>
    </Modal>
  )
}
