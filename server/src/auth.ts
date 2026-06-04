import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-prod'

export async function verifyGoogleCredential(credential: string): Promise<{ googleId: string; email: string; name: string; avatar: string } | null> {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const p = ticket.getPayload()
    if (!p?.sub) return null
    return { googleId: p.sub, email: p.email ?? '', name: p.name ?? '', avatar: p.picture ?? '' }
  } catch {
    return null
  }
}

export function signToken(googleId: string): string {
  return jwt.sign({ googleId }, JWT_SECRET, { expiresIn: '7d' })
}

export interface AuthRequest extends Request {
  googleId: string
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // Skip public endpoints
  if (req.path === '/auth/google' || req.path === '/health') { next(); return }

  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return }

  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { googleId: string }
    ;(req as AuthRequest).googleId = payload.googleId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
