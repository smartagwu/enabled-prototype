import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { ForumCard } from '../components/forums/ForumCard'
import { CreateForumModal } from '../components/forums/CreateForumModal'
import { EmptyState } from '../components/common/EmptyState'

export function ForumsPage() {
  const forums = useAppStore((state) => state.forums)
  const [query, setQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const q = query.trim().toLowerCase()
  const results = forums.filter(
    (f) =>
      !q ||
      f.title.toLowerCase().includes(q) ||
      f.topic.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q),
  )

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Forums</h1>
          <p className="text-sm text-slate-600">Public forums are open to join. Private forums require approval.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowCreate(true)}>
          Create forum
        </button>
      </div>

      <label htmlFor="forum-search" className="sr-only">
        Search forums
      </label>
      <input
        id="forum-search"
        type="search"
        className="input"
        placeholder="Search forums by name, topic, or description…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {results.length === 0 ? (
        <EmptyState title="No forums found" description="Try a different search, or start your own forum." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((forum) => (
            <ForumCard key={forum.id} forum={forum} />
          ))}
        </div>
      )}

      {showCreate && <CreateForumModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
