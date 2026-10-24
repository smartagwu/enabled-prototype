import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Post } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { Avatar } from '../common/Avatar'
import { useAnnounce } from '../common/AnnounceContext'
import { RelativeTime } from '../common/RelativeTime'
import { MentionText } from '../common/MentionText'
import { CommentList } from './CommentList'
import { focusNeighbourAfterRemoval } from '../../lib/focus'
import { hasBlocked, userById } from '../../lib/selectors'

export function PostCard({ post, showForumTag = false }: { post: Post; showForumTag?: boolean }) {
  const users = useAppStore((state) => state.users)
  const forums = useAppStore((state) => state.forums)
  const blocks = useAppStore((state) => state.blocks)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const deletePost = useAppStore((state) => state.deletePost)
  const announce = useAnnounce()
  const author = userById(users, post.authorId)
  const forum = showForumTag ? forums.find((f) => f.id === post.forumId) : undefined
  const [commentsOpen, setCommentsOpen] = useState(post.comments.length > 0 && post.comments.length <= 2)

  if (!author) return null
  // Posts from people you've blocked are hidden.
  if (currentUserId && hasBlocked(blocks, currentUserId, post.authorId)) return null

  const comments = post.comments.filter((c) => !(currentUserId && hasBlocked(blocks, currentUserId, c.authorId)))
  const isOwnPost = post.authorId === currentUserId

  return (
    <article className="card p-4">
      <div className="flex items-start gap-3">
        {/* The name link below goes to the same place, so the avatar link is left out of the tab order. */}
        <Link to={`/profile/${author.id}`} tabIndex={-1} aria-hidden="true">
          <Avatar id={author.id} name={author.name} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <Link to={`/profile/${author.id}`} className="font-semibold text-slate-900 hover:underline">
              {author.name}
            </Link>
            <RelativeTime iso={post.createdAt} className="text-xs text-slate-600" />
            {forum && (
              <Link to={`/forums/${forum.id}`} className="py-1 text-xs font-medium text-brand-700 hover:underline">
                in {forum.title}
              </Link>
            )}
          </div>
          <MentionText body={post.body} className="mt-1 text-slate-800" />

          <div className="mt-2 flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setCommentsOpen((v) => !v)}
              className="btn-ghost px-2"
              aria-expanded={commentsOpen}
            >
              {comments.length === 0
                ? 'Add a comment'
                : `${commentsOpen ? 'Hide' : 'Show'} ${comments.length} comment${comments.length === 1 ? '' : 's'}`}
            </button>
            {isOwnPost && (
              <button
                type="button"
                className="btn-ghost px-2 text-red-700"
                onClick={(e) => {
                  if (!window.confirm('Delete this post? This cannot be undone.')) return
                  focusNeighbourAfterRemoval(e.currentTarget.closest('article'))
                  deletePost(post.id, currentUserId)
                  announce('Post deleted')
                }}
              >
                Delete<span className="sr-only"> post</span>
              </button>
            )}
          </div>

          {commentsOpen && <CommentList postId={post.id} comments={comments} />}
        </div>
      </div>
    </article>
  )
}
