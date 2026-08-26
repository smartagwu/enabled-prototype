import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ForumVisibility } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { Modal } from '../common/Modal'
import { useAnnounce } from '../common/AnnounceContext'

export function CreateForumModal({ onClose }: { onClose: () => void }) {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const createForum = useAppStore((state) => state.createForum)
  const announce = useAnnounce()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<ForumVisibility>('public')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!currentUserId || !title.trim()) return
    const forumId = createForum(currentUserId, title, topic, description, visibility)
    announce(`Forum "${title}" created`)
    onClose()
    navigate(`/forums/${forumId}`)
  }

  return (
    <Modal title="Create a forum" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="forum-title" className="label">
            Forum name
          </label>
          <input
            id="forum-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Wheelchair Basketball League"
          />
        </div>
        <div>
          <label htmlFor="forum-topic" className="label">
            Topic
          </label>
          <input
            id="forum-topic"
            className="input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Adaptive sports"
          />
        </div>
        <div>
          <label htmlFor="forum-description" className="label">
            Description
          </label>
          <textarea
            id="forum-description"
            className="input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this forum about, and who is it for?"
          />
        </div>
        <fieldset>
          <legend className="label">Visibility</legend>
          <div className="space-y-2">
            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                className="mt-1"
              />
              <span>
                <span className="block font-medium text-slate-900">Public</span>
                <span className="block text-slate-600">Anyone can find and join immediately.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
                className="mt-1"
              />
              <span>
                <span className="block font-medium text-slate-900">Private</span>
                <span className="block text-slate-600">People can find it, but must request to join and be approved by you.</span>
              </span>
            </label>
          </div>
        </fieldset>
        <button type="submit" className="btn-primary w-full" disabled={!title.trim()}>
          Create forum
        </button>
      </form>
    </Modal>
  )
}
