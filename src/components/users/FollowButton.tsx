import { useAppStore } from '../../store/useAppStore'
import { followStateBetween } from '../../lib/selectors'
import { useAnnounce } from '../common/AnnounceContext'

export function FollowButton({ targetUserId, targetName }: { targetUserId: string; targetName: string }) {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const follows = useAppStore((state) => state.follows)
  const sendFollowRequest = useAppStore((state) => state.sendFollowRequest)
  const unfollow = useAppStore((state) => state.unfollow)
  const announce = useAnnounce()

  if (!currentUserId || currentUserId === targetUserId) return null

  const status = followStateBetween(follows, currentUserId, targetUserId)

  if (status === 'accepted') {
    return (
      <button
        type="button"
        className="btn-secondary"
        onClick={() => {
          unfollow(currentUserId, targetUserId)
          announce(`Unfollowed ${targetName}`)
        }}
      >
        Following
      </button>
    )
  }

  if (status === 'pending') {
    return (
      <button
        type="button"
        className="btn-secondary"
        onClick={() => {
          unfollow(currentUserId, targetUserId)
          announce(`Cancelled follow request to ${targetName}`)
        }}
      >
        Requested
      </button>
    )
  }

  return (
    <button
      type="button"
      className="btn-primary"
      onClick={() => {
        sendFollowRequest(currentUserId, targetUserId)
        announce(`Follow request sent to ${targetName}`)
      }}
    >
      Follow
    </button>
  )
}
