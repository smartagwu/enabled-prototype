import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Avatar } from '../components/common/Avatar'
import { FollowButton } from '../components/users/FollowButton'
import { PostCard } from '../components/posts/PostCard'
import { EmptyState } from '../components/common/EmptyState'
import { canMessage, followersOf, followingOf, userById } from '../lib/selectors'
import { formatShortDate } from '../lib/format'

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const users = useAppStore((state) => state.users)
  const follows = useAppStore((state) => state.follows)
  const posts = useAppStore((state) => state.posts)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const startDirectConversation = useAppStore((state) => state.startDirectConversation)

  const user = userById(users, userId)

  if (!user) {
    return <EmptyState title="Member not found" description="This profile doesn't exist or may have been removed." />
  }

  const isSelf = user.id === currentUserId
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
              <p className="text-sm text-slate-500">{user.pronouns}</p>
              <p className="text-sm text-slate-700">{user.headline}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isSelf && <FollowButton targetUserId={user.id} targetName={user.name} />}
            {!isSelf && currentUserId && canMessage(follows, currentUserId, user.id) && (
              <button type="button" className="btn-secondary" onClick={handleMessage}>
                Message
              </button>
            )}
          </div>
        </div>

        <dl className="mt-4 flex gap-6 text-sm">
          <div>
            <dt className="text-slate-500">Followers</dt>
            <dd className="font-semibold text-slate-900">{followerCount}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Following</dt>
            <dd className="font-semibold text-slate-900">{followingCount}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Member since</dt>
            <dd className="font-semibold text-slate-900">{formatShortDate(user.joinedAt)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-sm text-slate-700">{user.bio}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</h2>
            <p className="text-sm text-slate-700">{user.location}</p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Interests</h2>
            <div className="mt-1 flex flex-wrap gap-1">
              {user.interests.map((interest) => (
                <span key={interest} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                  {interest}
                </span>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Accessibility notes</h2>
            <p className="text-sm text-slate-700">{user.accessibilityNotes}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Posts by {user.name}</h2>
        {authoredPosts.length === 0 ? (
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
