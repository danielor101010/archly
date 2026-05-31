import { useEffect } from 'react'
import { apiUrl } from '../lib/api'
import { useUserStore } from '../stores/userStore'

// Minimal typings for the Google Identity Services SDK loaded via CDN
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          prompt: () => void
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void
          disableAutoSelect: () => void
          revoke: (hint: string, done: () => void) => void
        }
      }
    }
  }
}

interface DecodedGoogleJwt {
  sub: string
  name: string
  email: string
  picture: string
  [key: string]: unknown
}

function decodeGoogleJwt(credential: string): DecodedGoogleJwt | null {
  try {
    const parts = credential.split('.')
    if (parts.length !== 3) return null
    // Base64url → Base64 → JSON
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '='))
    return JSON.parse(json) as DecodedGoogleJwt
  } catch {
    return null
  }
}

interface GoogleSignInProps {
  /** Called after the user successfully signs in */
  onSuccess?: () => void
}

export function GoogleSignIn({ onSuccess }: GoogleSignInProps) {
  const { setGoogleUser } = useUserStore()
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

  useEffect(() => {
    if (!clientId) {
      console.warn(
        '[GoogleSignIn] VITE_GOOGLE_CLIENT_ID is not set. ' +
          'Create client/.env with VITE_GOOGLE_CLIENT_ID=<your-client-id> to enable Google Sign-In.',
      )
    }
  }, [clientId])

  useEffect(() => {
    // Wait for the GSI script to load
    const init = () => {
      if (!window.google?.accounts?.id) return

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          const decoded = decodeGoogleJwt(response.credential)
          if (!decoded) {
            console.error('[GoogleSignIn] Failed to decode JWT credential.')
            return
          }
          setGoogleUser({
            googleId: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            avatar: decoded.picture,
          })

          // Restore saved progress from server (survives localStorage clears)
          fetch(`${apiUrl(`/api/users/${decoded.sub}`)}`)
            .then(r => r.json())
            .then((data: { found: boolean; user?: Record<string, unknown> }) => {
              if (data.found && data.user) {
                useUserStore.getState().restoreProgress(data.user as never)
              }
            })
            .catch(() => {})

          // Server deduplicates — safe to call every sign-in, only sends once ever
          fetch(apiUrl('/api/send-welcome-email'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: decoded.email, name: decoded.name, googleId: decoded.sub }),
            }).catch(() => {})
          onSuccess?.()
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      })
    }

    // GSI script may already be loaded or still loading
    if (window.google?.accounts?.id) {
      init()
    } else {
      // Poll briefly — the script has async/defer so it usually loads quickly
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval)
          init()
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [clientId, setGoogleUser, onSuccess])

  const handleClick = () => {
    if (!window.google?.accounts?.id) {
      console.warn('[GoogleSignIn] Google Identity Services not loaded yet.')
      return
    }
    window.google.accounts.id.prompt()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        w-full flex items-center justify-center gap-3
        bg-white dark:bg-white
        hover:bg-zinc-50 dark:hover:bg-zinc-100
        text-zinc-800
        font-medium text-sm
        px-5 py-3
        rounded-xl
        border border-zinc-200 dark:border-zinc-300
        shadow-sm hover:shadow
        transition-all duration-150
        select-none
      "
    >
      {/* Official Google "G" logo SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="20"
        height="20"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="#EA4335"
          d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.09-6.09C34.46 3.19 29.53 1 24 1 14.82 1 6.97 6.49 3.18 14.29l7.08 5.5C12.1 13.69 17.57 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.52 24.5c0-1.64-.15-3.22-.42-4.74H24v9.01h12.7c-.55 2.96-2.2 5.47-4.68 7.16l7.19 5.59C43.17 37.42 46.52 31.44 46.52 24.5z"
        />
        <path
          fill="#FBBC05"
          d="M10.26 28.21A14.55 14.55 0 0 1 9.5 24c0-1.46.24-2.88.66-4.21l-7.08-5.5A23.96 23.96 0 0 0 0 24c0 3.88.93 7.54 2.57 10.79l7.69-6.58z"
        />
        <path
          fill="#34A853"
          d="M24 47c5.53 0 10.17-1.84 13.56-4.98l-7.19-5.59c-1.84 1.23-4.19 1.97-6.37 1.97-6.43 0-11.9-4.19-13.74-9.79l-7.69 6.58C6.97 41.51 14.82 47 24 47z"
        />
        <path fill="none" d="M0 0h48v48H0z" />
      </svg>
      Continue with Google
    </button>
  )
}
