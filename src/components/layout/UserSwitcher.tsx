import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { userById } from '../../lib/selectors'

export function UserSwitcher() {
  const users = useAppStore((state) => state.users)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const setCurrentUser = useAppStore((state) => state.setCurrentUser)
  const navigate = useNavigate()

  const currentUser = userById(users, currentUserId)

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="user-switcher" className="sr-only">
        Browsing as
      </label>
      <select
        id="user-switcher"
        className="input min-h-[40px] max-w-[10rem] py-1 text-sm sm:max-w-none"
        value={currentUserId ?? ''}
        onChange={(e) => setCurrentUser(e.target.value)}
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            Browsing as {user.name}
          </option>
        ))}
      </select>
      {currentUser && (
        <button type="button" className="btn-ghost text-sm" onClick={() => navigate(`/profile/${currentUser.id}`)}>
          My profile
        </button>
      )}
    </div>
  )
}
