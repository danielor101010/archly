import { Navigate, Outlet } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'

export function ProtectedRoute() {
  const googleId = useUserStore(s => s.googleId)
  if (!googleId) return <Navigate to="/" replace />
  return <Outlet />
}
