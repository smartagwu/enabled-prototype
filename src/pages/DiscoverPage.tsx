import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { UserCard } from '../components/users/UserCard'
import { EmptyState } from '../components/common/EmptyState'

export function DiscoverPage() {
  const users = useAppStore((state) => state.users)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const results = users
    .filter((u) => u.id !== currentUserId)
    .filter(
      (u) =>
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.headline.toLowerCase().includes(q) ||
        u.interests.some((i) => i.toLowerCase().includes(q)) ||
        u.location.toLowerCase().includes(q),
    )

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Discover people</h1>
        <p className="text-sm text-slate-600">Find members by name, interest, or location, and send a follow request.</p>
      </div>

      <div>
        <label htmlFor="discover-search" className="sr-only">
          Search members
        </label>
        <input
          id="discover-search"
          type="search"
          className="input"
          placeholder="Search by name, interest, or location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {results.length === 0 ? (
        <EmptyState title="No members found" description="Try a different search term." />
      ) : (
        <div className="space-y-3">
          {results.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  )
}
