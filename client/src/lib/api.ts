import { useUserStore } from '../stores/userStore'

/** Central server URL config. Set VITE_API_URL + VITE_WS_URL in production. */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001'
export const WS_URL   = (import.meta.env.VITE_WS_URL  as string | undefined) ?? 'ws://localhost:3001/ws'

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}

/**
 * Clear the persisted session and bounce the user to the landing page so they can
 * re-authenticate. Called on a 401 (REST) or an AUTH_ERROR (WS).
 */
export function forceReSignIn(): void {
  try {
    useUserStore.getState().signOut()
  } catch {
    /* store not ready — ignore */
  }
  if (typeof window !== 'undefined' && window.location.pathname !== '/') {
    window.location.href = '/'
  }
}

/**
 * `fetch` wrapper for every authenticated API request. Reads the current auth token
 * live from `userStore` and attaches `Authorization: Bearer <token>`. On a 401 it
 * clears the session and redirects to '/' to force re-sign-in.
 *
 * Do NOT use this for the sign-in call itself (`POST /api/auth/google`) — there is no
 * token yet at that point; use plain `fetch(apiUrl(...))` there.
 *
 * @param path server-relative path (e.g. '/api/me'); `apiUrl` is applied internally.
 */
export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = useUserStore.getState().token
  const headers = new Headers(options.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(apiUrl(path), { ...options, headers })
  if (res.status === 401) forceReSignIn()
  return res
}
