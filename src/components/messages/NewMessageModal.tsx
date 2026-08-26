import { useNavigate } from 'react-router-dom'
import { useAppStore, useFollowingUsers } from '../../store/useAppStore'
import { Modal } from '../common/Modal'
import { Avatar } from '../common/Avatar'

export function NewMessageModal({ onClose }: { onClose: () => void }) {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const startDirectConversation = useAppStore((state) => state.startDirectConversation)
  const followingUsers = useFollowingUsers(currentUserId)
  const navigate = useNavigate()

  function handlePick(otherId: string) {
    if (!currentUserId) return
    const id = startDirectConversation(currentUserId, otherId)
    onClose()
    navigate(`/messages/${id}`)
  }

  return (
    <Modal title="New message" onClose={onClose}>
      {followingUsers.length === 0 ? (
        <p className="text-sm text-slate-600">
          You can only message people you follow. Head to Discover to follow someone first.
        </p>
      ) : (
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {followingUsers.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => handlePick(user.id)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-slate-50"
              >
                <Avatar id={user.id} name={user.name} size="sm" />
                <span className="text-sm font-medium text-slate-900">{user.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
