/** Central server URL config. Set VITE_API_URL + VITE_WS_URL in production. */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001'
export const WS_URL   = (import.meta.env.VITE_WS_URL  as string | undefined) ?? 'ws://localhost:3001/ws'

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}
