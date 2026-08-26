import { Link } from 'react-router-dom'
import type { User } from '../../types'
import { Avatar } from '../common/Avatar'
import { FollowButton } from './FollowButton'

export function UserCard({ user }: { user: User }) {
  return (
    <div className="card flex items-start gap-4 p-4">
      <Link to={`/profile/${user.id}`} className="shrink-0">
        <Avatar id={user.id} name={user.name} size="lg" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/profile/${user.id}`} className="font-semibold text-slate-900 hover:underline">
          {user.name}
        </Link>
        <p className="text-sm text-slate-500">{user.pronouns}</p>
        <p className="mt-1 text-sm text-slate-700">{user.headline}</p>
        <p className="mt-1 text-xs text-slate-500">{user.location}</p>
      </div>
      <FollowButton targetUserId={user.id} targetName={user.name} />
    </div>
  )
}
