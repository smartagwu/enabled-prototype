import { Link } from 'react-router-dom'
import type { User } from '../../types'
import { Avatar } from '../common/Avatar'
import { FollowButton } from './FollowButton'

export function UserCard({ user }: { user: User }) {
  return (
    // flex-wrap: at large text sizes on narrow screens the Follow button drops under the details instead of overflowing.
    <div className="card flex flex-wrap items-start gap-4 p-4">
      {/* The name link below goes to the same place, so the avatar link is left out of the tab order. */}
      <Link to={`/profile/${user.id}`} className="shrink-0" tabIndex={-1} aria-hidden="true">
        <Avatar id={user.id} name={user.name} size="lg" />
      </Link>
      <div className="min-w-0 flex-1 basis-24">
        <Link to={`/profile/${user.id}`} className="font-semibold text-slate-900 hover:underline">
          {user.name}
        </Link>
        <p className="text-sm text-slate-600">{user.pronouns}</p>
        <p className="mt-1 text-sm text-slate-700">{user.headline}</p>
        <p className="mt-1 text-xs text-slate-600">{user.location}</p>
      </div>
      <FollowButton targetUserId={user.id} targetName={user.name} />
    </div>
  )
}
