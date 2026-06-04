import { OAuth2Client } from 'google-auth-library'
import { createHmac, timingSafeEqual } from 'crypto'
import type { Request, Response, NextFunction } from 'express'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-prod'

// Simple signed token: base64(payload).base64(hmac)
function b64(s: string) { return Buffer.from(s).toString('base64url') }
function unb64(s: string) { return Buffer.from(s, 'base64url').toString() }
function hmac(data: string) { return createHmac('sha256', SECRET).update(data).digest('base64url') }

export function signToken(googleId: string): string {
  const payload = b64(JSON.stringify({ googleId, exp: Date.now() + 7 * 86400_000 }))
  return `${payload}.${hmac(payload)}`
}

export function verifyToken(token: string): { googleId: string } | null {
  try {
    const [payload, sig] = token.split('.')
    const expected = Buffer.from(hmac(payload))
    const actual   = Buffer.from(sig)
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null
    const data = JSON.parse(unb64(payload)) as { googleId: string; exp: number }
    if (data.exp < Date.now()) return null
    return { googleId: data.googleId }
  } catch { return null }
}

export async function verifyGoogleCredential(credential: string): Promise<{ googleId: string; email: string; name: string; avatar: string } | null> {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const p = ticket.getPayload()
    if (!p?.sub) return null
    return { googleId: p.sub, email: p.email ?? '', name: p.name ?? '', avatar: p.picture ?? '' }
  } catch { return null }
}

export interface AuthRequest extends Request { googleId: string }

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  if (req.path === '/auth/google' || req.path === '/health') { next(); return }
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return }
  const payload = verifyToken(auth.slice(7))
  if (!payload) { res.status(401).json({ error: 'Invalid or expired token' }); return }
  ;(req as AuthRequest).googleId = payload.googleId
  next()
}
