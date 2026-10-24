import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Avatar } from '../components/common/Avatar'
import { FollowButton } from '../components/users/FollowButton'
import { PostCard } from '../components/posts/PostCard'
import { EmptyState } from '../components/common/EmptyState'
import { useAnnounce } from '../components/common/AnnounceContext'
import { UserSafetyActions } from '../components/users/UserSafetyActions'
import { canMessage, followersOf, followingOf, hasBlocked, isBlockedEitherWay, userById } from '../lib/selectors'
import { formatShortDate } from '../lib/format'
import { focusPageHeading } from '../lib/focus'

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const users = useAppStore((state) => state.users)
  const follows = useAppStore((state) => state.follows)
  const posts = useAppStore((state) => state.posts)
  const blocks = useAppStore((state) => state.blocks)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const startDirectConversation = useAppStore((state) => state.startDirectConversation)
  const unblockUser = useAppStore((state) => state.unblockUser)
  const announce = useAnnounce()

  const user = userById(users, userId)

  if (!user) {
    return <EmptyState title="Member not found" description="This profile doesn't exist or may have been removed." />
  }

  const isSelf = user.id === currentUserId
  const iBlockedThem = !!currentUserId && hasBlocked(blocks, currentUserId, user.id)
  const eitherBlocked = !!currentUserId && isBlockedEitherWay(blocks, currentUserId, user.id)
  const messageable = !!currentUserId && !eitherBlocked && canMessage(follows, currentUserId, user.id)
  const followerCount = followersOf(follows, user.id).length
  const followingCount = followingOf(follows, user.id).length
  const authoredPosts = posts
    .filter((p) => p.authorId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const profileUserId = user.id

  function handleMessage() {
    if (!currentUserId) return
    const id = startDirectConversation(currentUserId, profileUserId)
    navigate(`/messages/${id}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar id={user.id} name={user.name} size="xl" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
              <p className="text-sm text-slate-600">{user.pronouns}</p>
              <p className="text-sm text-slate-700">{user.headline}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isSelf && <FollowButton targetUserId={user.id} targetName={user.name} />}
            {!isSelf && messageable && (
              <button type="button" className="btn-secondary" onClick={handleMessage}>
                Message
              </button>
            )}
          </div>
        </div>

        {!isSelf && currentUserId && !eitherBlocked && !messageable && (
          <p className="mt-3 text-sm text-slate-600">
            You can message {user.name} once they've accepted your follow request.
          </p>
        )}

        {!isSelf && iBlockedThem && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
            <span>You've blocked {user.name}. Their posts and messages are hidden.</span>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (!currentUserId) return
                unblockUser(currentUserId, user.id)
                announce(`Unblocked ${user.name}`)
                // This button is removed once they're unblocked, so keep focus on the page.
                requestAnimationFrame(() => focusPageHeading())
              }}
            >
              Unblock<span className="sr-only"> {user.name}</span>
            </button>
          </div>
        )}

        {!isSelf && !iBlockedThem && (
          <div className="-ml-4 mt-2 flex flex-wrap">
            <UserSafetyActions userId={user.id} userName={user.name} />
          </div>
        )}

        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="text-slate-600">Followers</dt>
            <dd className="font-semibold text-slate-900">{followerCount}</dd>
          </div>
          <div>
            <dt className="text-slate-600">Following</dt>
            <dd className="font-semibold text-slate-900">{followingCount}</dd>
          </div>
          <div>
            <dt className="text-slate-600">Member since</dt>
            <dd className="font-semibold text-slate-900">{formatShortDate(user.joinedAt)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-sm text-slate-700">{user.bio}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Location</h2>
            <p className="text-sm text-slate-700">{user.location}</p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Interests</h2>
            <div className="mt-1 flex flex-wrap gap-1">
              {user.interests.map((interest) => (
                <span key={interest} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                  {interest}
                </span>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Accessibility notes</h2>
            <p className="text-sm text-slate-700">{user.accessibilityNotes}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Posts by {user.name}</h2>
        {iBlockedThem ? (
          <EmptyState title="Posts hidden" description={`You've blocked ${user.name}.`} />
        ) : authoredPosts.length === 0 ? (
          <EmptyState title="No posts yet" />
        ) : (
          <div className="space-y-4">
            {authoredPosts.map((post) => (
              <PostCard key={post.id} post={post} showForumTag />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
