import { useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { PostComposer } from '../components/posts/PostComposer'
import { PostCard } from '../components/posts/PostCard'
import { Avatar } from '../components/common/Avatar'
import { EmptyState } from '../components/common/EmptyState'
import { userById } from '../lib/selectors'
import { useAnnounce } from '../components/common/AnnounceContext'

export function ForumDetailPage() {
  const { forumId } = useParams<{ forumId: string }>()
  const forum = useAppStore((state) => state.forums.find((f) => f.id === forumId))
  const users = useAppStore((state) => state.users)
  const posts = useAppStore((state) => state.posts.filter((p) => p.forumId === forumId))
  const currentUserId = useAppStore((state) => state.currentUserId)
  const joinPublicForum = useAppStore((state) => state.joinPublicForum)
  const requestToJoinForum = useAppStore((state) => state.requestToJoinForum)
  const respondToJoinRequest = useAppStore((state) => state.respondToJoinRequest)
  const leaveForum = useAppStore((state) => state.leaveForum)
  const announce = useAnnounce()

  if (!forum || !currentUserId) {
    return <EmptyState title="Forum not found" description="This forum doesn't exist or may have been removed." />
  }

  const isMember = forum.memberIds.includes(currentUserId)
  const isOwner = forum.ownerId === currentUserId
  const owner = userById(users, forum.ownerId)
  const myJoinRequest = forum.joinRequests.find((r) => r.userId === currentUserId)
  const pendingRequests = forum.joinRequests.filter((r) => r.status === 'pending')
  const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{forum.title}</h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  forum.visibility === 'private' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {forum.visibility === 'private' ? 'Private' : 'Public'}
              </span>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-700">{forum.topic}</p>
          </div>

          {!isMember && forum.visibility === 'public' && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                joinPublicForum(forum.id, currentUserId)
                announce(`Joined ${forum.title}`)
              }}
            >
              Join forum
            </button>
          )}

          {!isMember && forum.visibility === 'private' && myJoinRequest?.status !== 'pending' && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                requestToJoinForum(forum.id, currentUserId)
                announce(`Requested to join ${forum.title}`)
              }}
            >
              {myJoinRequest?.status === 'declined' ? 'Request again' : 'Request to join'}
            </button>
          )}

          {!isMember && myJoinRequest?.status === 'pending' && (
            <span className="btn-secondary cursor-default">Request pending</span>
          )}

          {isMember && !isOwner && (
            <button
              type="button"
              className="btn-ghost text-sm"
              onClick={() => {
                leaveForum(forum.id, currentUserId)
                announce(`Left ${forum.title}`)
              }}
            >
              Leave forum
            </button>
          )}
        </div>

        <p className="mt-3 text-sm text-slate-700">{forum.description}</p>
        <p className="mt-3 text-xs text-slate-500">
          {forum.memberIds.length} member{forum.memberIds.length === 1 ? '' : 's'} · Created by{' '}
          {owner?.name ?? 'a member'}
        </p>
      </div>

      {isOwner && pendingRequests.length > 0 && (
        <div className="card p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Join requests ({pendingRequests.length})</h2>
          <ul className="space-y-2">
            {pendingRequests.map((request) => {
              const requester = userById(users, request.userId)
              if (!requester) return null
              return (
                <li key={request.userId} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar id={requester.id} name={requester.name} size="sm" />
                    <span className="text-sm text-slate-900">{requester.name}</span>
                  </div>
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
        </div>
      )}

      {isMember ? (
        <>
          <PostComposer forumId={forum.id} idPrefix={`forum-${forum.id}`} placeholder={`Post something in ${forum.title}…`} />
          {sortedPosts.length === 0 ? (
            <EmptyState title="No posts yet" description="Start the conversation in this forum." />
          ) : (
            <div className="space-y-4">
              {sortedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title={forum.visibility === 'private' ? 'This is a private forum' : 'Join to see discussions'}
          description={
            forum.visibility === 'private'
              ? 'Request to join to see posts and take part in the discussion.'
              : 'Join this forum to see posts and take part in the discussion.'
          }
        />
      )}
    </div>
  )
}
