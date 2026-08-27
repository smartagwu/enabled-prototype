import { Navigate, Outlet } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'

export function RequireAuth() {
  const currentUserId = useAppStore((state) => state.currentUserId)
  if (!currentUserId) return <Navigate to="/login" replace />
  return <Outlet />
}
