import { Navigate, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Avatar } from '../components/common/Avatar'

export function LoginPage() {
  const currentUserId = useAppStore((state) => state.currentUserId)
  const users = useAppStore((state) => state.users)
  const setCurrentUser = useAppStore((state) => state.setCurrentUser)
  const navigate = useNavigate()

  if (currentUserId) return <Navigate to="/" replace />

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-2xl font-bold text-white">
          E
        </span>
        <h1 className="text-3xl font-bold text-slate-900">Enabled</h1>
        <p className="mt-2 max-w-md text-slate-600">
          A community where people with disability connect, chat, join forums, and find social events built for them.
        </p>
        <h2 className="mt-8 text-base font-semibold text-slate-900">Choose a profile to continue</h2>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {users.map((user) => (
          <li key={user.id}>
            <button
              type="button"
              onClick={() => {
                setCurrentUser(user.id)
                navigate('/')
              }}
              className="card-interactive flex w-full items-center gap-3 p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              <Avatar id={user.id} name={user.name} size="lg" />
              <span className="min-w-0">
                <span className="block font-semibold text-slate-900">{user.name}</span>
                <span className="block text-sm text-slate-500">{user.pronouns}</span>
                <span className="block truncate text-sm text-slate-600">{user.headline}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-sm text-slate-500">You can switch profiles anytime from the account menu.</p>
    </div>
  )
}
