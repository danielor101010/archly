import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'

export function ProtectedRoute() {
  const [ready, setReady] = useState(false)
  const googleId = useUserStore(s => s.googleId)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) return null
  if (!googleId) return <Navigate to="/" replace state={{ requireSignIn: true }} />
  return <Outlet />
}
