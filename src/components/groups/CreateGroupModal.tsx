import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, useFollowingUsers } from '../../store/useAppStore'
import { Modal } from '../common/Modal'
import { Avatar } from '../common/Avatar'
import { useAnnounce } from '../common/AnnounceContext'

export function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const createGroup = useAppStore((state) => state.createGroup)
  const followingUsers = useFollowingUsers(currentUserId)
  const announce = useAnnounce()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [memberIds, setMemberIds] = useState<string[]>([])

  function toggleMember(id: string) {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!currentUserId || !name.trim() || memberIds.length === 0) return
    const groupId = createGroup(currentUserId, name, description, memberIds)
    announce(`Group "${name}" created`)
    onClose()
    navigate(`/messages/${groupId}`)
  }

  return (
    <Modal title="Create a group" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="group-name" className="label">
            Group name
          </label>
          <input
            id="group-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Accessible Hiking Crew"
          />
        </div>
        <div>
          <label htmlFor="group-description" className="label">
            Description (optional)
          </label>
          <textarea
            id="group-description"
            className="input"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this group about?"
          />
        </div>

        <fieldset>
          <legend className="label">Add members you follow</legend>
          {followingUsers.length === 0 ? (
            <p className="text-sm text-slate-500">
              You aren't following anyone yet. Follow people from Discover before starting a group.
            </p>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
              {followingUsers.map((user) => (
                <label key={user.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={memberIds.includes(user.id)}
                    onChange={() => toggleMember(user.id)}
                  />
                  <Avatar id={user.id} name={user.name} size="sm" />
                  <span className="text-sm text-slate-900">{user.name}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <button type="submit" className="btn-primary w-full" disabled={!name.trim() || memberIds.length === 0}>
          Create group
        </button>
      </form>
    </Modal>
  )
}
