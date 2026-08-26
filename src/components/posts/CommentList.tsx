import { useState } from 'react'
import type { Comment } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { useAnnounce } from '../common/LiveAnnouncer'
import { Avatar } from '../common/Avatar'
import { MentionText } from '../common/MentionText'
import { MentionTextarea } from '../common/MentionTextarea'
import { formatRelativeTime } from '../../lib/format'
import { userById } from '../../lib/selectors'

export function CommentList({ postId, comments }: { postId: string; comments: Comment[] }) {
  const users = useAppStore((state) => state.users)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const addComment = useAppStore((state) => state.addComment)
  const announce = useAnnounce()
  const [draft, setDraft] = useState('')
  const now = new Date().toISOString()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!currentUserId || !draft.trim()) return
    addComment(postId, currentUserId, draft)
    setDraft('')
    announce('Comment added')
  }

  return (
    <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
      {comments.map((comment) => {
        const author = userById(users, comment.authorId)
        if (!author) return null
        return (
          <div key={comment.id} className="flex items-start gap-3">
            <Avatar id={author.id} name={author.name} size="sm" />
            <div className="min-w-0 flex-1 rounded-lg bg-slate-50 px-3 py-2">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-slate-900">{author.name}</span>
                <span className="text-xs text-slate-500">{formatRelativeTime(comment.createdAt, now)}</span>
              </div>
              <MentionText body={comment.body} className="text-sm text-slate-700" />
            </div>
          </div>
        )
      })}

      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex items-start gap-3">
          <Avatar id={currentUserId} name={userById(users, currentUserId)?.name ?? ''} size="sm" />
          <div className="min-w-0 flex-1">
            <MentionTextarea
              id={`comment-${postId}`}
              label="Add a comment"
              value={draft}
              onChange={setDraft}
              placeholder="Write a reply… use @ to mention someone"
              rows={2}
              excludeUserId={currentUserId}
              hideLabel
            />
            <div className="mt-2 flex justify-end">
              <button type="submit" className="btn-secondary" disabled={!draft.trim()}>
                Reply
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
