import { Link } from 'react-router-dom'
import type { Forum } from '../../types'

export function ForumCard({ forum }: { forum: Forum }) {
  return (
    <Link to={`/forums/${forum.id}`} className="card-interactive flex min-w-0 flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-slate-900">{forum.title}</h2>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            forum.visibility === 'private' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {forum.visibility === 'private' ? 'Private' : 'Public'}
        </span>
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-brand-700">{forum.topic}</p>
      <p className="text-sm text-slate-600">{forum.description}</p>
      <p className="mt-auto text-xs text-slate-600">{forum.memberIds.length} members</p>
    </Link>
  )
}
