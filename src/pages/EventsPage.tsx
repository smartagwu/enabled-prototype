import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { EventCard } from '../components/events/EventCard'
import { EmptyState } from '../components/common/EmptyState'
import type { EventCategory } from '../types'

export function EventsPage() {
  const events = useAppStore((state) => state.events)
  const [category, setCategory] = useState<EventCategory | 'All'>('All')

  const categories: (EventCategory | 'All')[] = [
    'All',
    ...Array.from(new Set(events.map((e) => e.category))),
  ]

  const sorted = [...events].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  const filtered = category === 'All' ? sorted : sorted.filter((e) => e.category === category)

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upcoming events</h1>
        <p className="text-sm text-slate-600">
          Social meetups, dance nights, games days, movie nights, and more — organized by the Enabled team.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`min-h-[40px] rounded-full px-3 text-sm font-medium ${
              category === c ? 'bg-brand-700 text-white' : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No events in this category" description="Check back soon or browse another category." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
