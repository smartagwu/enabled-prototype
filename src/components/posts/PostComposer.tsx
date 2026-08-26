import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { MentionTextarea } from '../common/MentionTextarea'
import { useAnnounce } from '../common/LiveAnnouncer'

export function PostComposer({
  forumId,
  idPrefix,
  placeholder = "Ask a question or share something with the community…",
}: {
  forumId: string | null
  idPrefix: string
  placeholder?: string
}) {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const createPost = useAppStore((state) => state.createPost)
  const announce = useAnnounce()
  const [body, setBody] = useState('')

  if (!currentUserId) return null

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!currentUserId || !body.trim()) return
    createPost(currentUserId, body, forumId)
    setBody('')
    announce('Post shared')
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <MentionTextarea
        id={`${idPrefix}-composer`}
        label="Share a post"
        value={body}
        onChange={setBody}
        placeholder={placeholder}
        rows={3}
        excludeUserId={currentUserId}
      />
      <div className="mt-3 flex justify-end">
        <button type="submit" className="btn-primary" disabled={!body.trim()}>
          Post
        </button>
      </div>
    </form>
  )
}
