import { Navigate, Outlet } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'

export function ProtectedRoute() {
  const hydrated = useUserStore(s => s._hydrated)
  const googleId = useUserStore(s => s.googleId)

  if (!hydrated) return null  // wait for localStorage to rehydrate before deciding
  if (!googleId) return <Navigate to="/" replace />
  return <Outlet />
}
