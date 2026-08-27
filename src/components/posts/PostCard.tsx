import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Post } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { Avatar } from '../common/Avatar'
import { MentionText } from '../common/MentionText'
import { CommentList } from './CommentList'
import { formatRelativeTime } from '../../lib/format'
import { userById } from '../../lib/selectors'

export function PostCard({ post, showForumTag = false }: { post: Post; showForumTag?: boolean }) {
  const users = useAppStore((state) => state.users)
  const forums = useAppStore((state) => state.forums)
  const author = userById(users, post.authorId)
  const forum = showForumTag ? forums.find((f) => f.id === post.forumId) : undefined
  const [commentsOpen, setCommentsOpen] = useState(post.comments.length > 0 && post.comments.length <= 2)
  const now = new Date().toISOString()

  if (!author) return null

  return (
    <article className="card p-4">
      <div className="flex items-start gap-3">
        <Link to={`/profile/${author.id}`}>
          <Avatar id={author.id} name={author.name} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <Link to={`/profile/${author.id}`} className="font-semibold text-slate-900 hover:underline">
              {author.name}
            </Link>
            <span className="text-xs text-slate-500">{formatRelativeTime(post.createdAt, now)}</span>
            {forum && (
              <Link to={`/forums/${forum.id}`} className="text-xs font-medium text-brand-700 hover:underline">
                in {forum.title}
              </Link>
            )}
          </div>
          <MentionText body={post.body} className="mt-1 text-slate-800" />

          <button
            type="button"
            onClick={() => setCommentsOpen((v) => !v)}
            className="btn-ghost mt-2 px-2 py-1 text-xs"
            aria-expanded={commentsOpen}
          >
            {post.comments.length === 0
              ? 'Add a comment'
              : `${commentsOpen ? 'Hide' : 'Show'} ${post.comments.length} comment${post.comments.length === 1 ? '' : 's'}`}
          </button>

          {commentsOpen && <CommentList postId={post.id} comments={post.comments} />}
        </div>
      </div>
    </article>
  )
}
