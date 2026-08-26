import { Link } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Avatar } from '../components/common/Avatar'
import { EmptyState } from '../components/common/EmptyState'
import { pendingIncomingRequests, userById } from '../lib/selectors'
import { useAnnounce } from '../components/common/AnnounceContext'

export function RequestsPage() {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const users = useAppStore((state) => state.users)
  const follows = useAppStore((state) => state.follows)
  const forums = useAppStore((state) => state.forums)
  const respondToFollowRequest = useAppStore((state) => state.respondToFollowRequest)
  const respondToJoinRequest = useAppStore((state) => state.respondToJoinRequest)
  const announce = useAnnounce()

  if (!currentUserId) return null

  const followRequests = pendingIncomingRequests(follows, currentUserId)
  const ownedForumsWithRequests = forums
    .filter((f) => f.ownerId === currentUserId)
    .map((f) => ({ forum: f, requests: f.joinRequests.filter((r) => r.status === 'pending') }))
    .filter((entry) => entry.requests.length > 0)

  const hasNothing = followRequests.length === 0 && ownedForumsWithRequests.length === 0

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Requests</h1>
        <p className="text-sm text-slate-600">Follow requests and forum join requests waiting on you.</p>
      </div>

      {hasNothing && <EmptyState title="You're all caught up" description="No pending requests right now." />}

      {followRequests.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold text-slate-900">Follow requests</h2>
          <ul className="space-y-2">
            {followRequests.map((edge) => {
              const requester = userById(users, edge.followerId)
              if (!requester) return null
              return (
                <li key={edge.id} className="card flex items-center justify-between gap-3 p-3">
                  <Link to={`/profile/${requester.id}`} className="flex items-center gap-3">
                    <Avatar id={requester.id} name={requester.name} />
                    <span>
                      <span className="block text-sm font-medium text-slate-900">{requester.name}</span>
                      <span className="block text-xs text-slate-500">wants to follow you</span>
                    </span>
                  </Link>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-primary px-3 py-1 text-xs"
                      onClick={() => {
                        respondToFollowRequest(edge.id, true)
                        announce(`Accepted follow request from ${requester.name}`)
                      }}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="btn-secondary px-3 py-1 text-xs"
                      onClick={() => {
                        respondToFollowRequest(edge.id, false)
                        announce(`Declined follow request from ${requester.name}`)
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {ownedForumsWithRequests.map(({ forum, requests }) => (
        <section key={forum.id}>
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            Join requests for{' '}
            <Link to={`/forums/${forum.id}`} className="text-brand-700 hover:underline">
              {forum.title}
            </Link>
          </h2>
          <ul className="space-y-2">
            {requests.map((request) => {
              const requester = userById(users, request.userId)
              if (!requester) return null
              return (
                <li key={request.userId} className="card flex items-center justify-between gap-3 p-3">
                  <Link to={`/profile/${requester.id}`} className="flex items-center gap-3">
                    <Avatar id={requester.id} name={requester.name} />
                    <span className="text-sm font-medium text-slate-900">{requester.name}</span>
                  </Link>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-primary px-3 py-1 text-xs"
                      onClick={() => {
                        respondToJoinRequest(forum.id, request.userId, true)
                        announce(`Approved ${requester.name} to join ${forum.title}`)
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn-secondary px-3 py-1 text-xs"
                      onClick={() => {
                        respondToJoinRequest(forum.id, request.userId, false)
                        announce(`Declined ${requester.name}'s request to join ${forum.title}`)
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
