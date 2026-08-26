import { useAppStore } from '../store/useAppStore'
import { PostComposer } from '../components/posts/PostComposer'
import { PostCard } from '../components/posts/PostCard'
import { EmptyState } from '../components/common/EmptyState'

export function TimelinePage() {
  const posts = useAppStore((state) => state.posts.filter((p) => p.forumId === null))
  const sorted = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Timeline</h1>
        <p className="text-sm text-slate-600">Ask a question, share a win, or answer someone else's.</p>
      </div>

      <PostComposer forumId={null} idPrefix="timeline" />

      {sorted.length === 0 ? (
        <EmptyState title="No posts yet" description="Be the first to share something with the community." />
      ) : (
        <div className="space-y-4">
          {sorted.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
