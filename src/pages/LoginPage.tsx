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
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-brand-800">Enabled</h1>
        <p className="mt-2 text-slate-600">
          A community for people with disability to connect, chat, join forums, and attend social events.
        </p>
        <p className="mt-4 text-sm text-slate-500">
          This is a prototype — no real sign-up. Pick a demo profile below to explore the app as that person. You can
          switch profiles anytime from the header.
        </p>
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
              className="card flex w-full items-center gap-3 p-4 text-left hover:border-brand-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
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
    </div>
  )
}
