import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'

export function ProtectedRoute() {
  const [ready, setReady] = useState(false)
  const googleId = useUserStore(s => s.googleId)
  const token = useUserStore(s => s.token)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) return null
  // Treat a missing token the same as no session — the server now requires a Bearer token.
  if (!googleId || !token) return <Navigate to="/" replace state={{ requireSignIn: true }} />
  return <Outlet />
}
