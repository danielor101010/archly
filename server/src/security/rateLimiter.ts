import type { Request, Response, NextFunction } from 'express'
import { config } from '../config.js'
import type { AuthRequest } from '../auth.js'

// ── In-memory fixed-window rate limiter ─────────────────────────────────────────
// v1 decision: no Redis. A single-process in-memory limiter is sufficient. Each
// window is a simple counter that rolls over after `windowMs`. Stale windows are
// swept periodically so the map cannot grow unbounded.

interface CounterWindow {
  count: number
  resetAt: number
}

class FixedWindowLimiter {
  private windows = new Map<string, CounterWindow>()

  constructor(private readonly limit: number, private readonly windowMs: number) {
    const timer = setInterval(() => this.sweep(), windowMs)
    // Don't keep the event loop alive just for cleanup.
    if (typeof timer.unref === 'function') timer.unref()
  }

  hit(key: string): { allowed: boolean; retryAfterSec: number } {
    const now = Date.now()
    let w = this.windows.get(key)
    if (!w || now >= w.resetAt) {
      w = { count: 0, resetAt: now + this.windowMs }
      this.windows.set(key, w)
    }
    if (w.count >= this.limit) {
      return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((w.resetAt - now) / 1000)) }
    }
    w.count += 1
    return { allowed: true, retryAfterSec: 0 }
  }

  private sweep(): void {
    const now = Date.now()
    for (const [k, w] of this.windows) {
      if (now >= w.resetAt) this.windows.delete(k)
    }
  }
}

// Per-user LLM limiter (WS + REST LLM endpoints).
const llmLimiter = new FixedWindowLimiter(config.llmRateLimitPerMin, 60_000)
// Per-IP coarse limiter on the sign-in endpoint.
const authIpLimiter = new FixedWindowLimiter(config.authRateLimitPerMin, 60_000)
// Per-IP coarse limiter on new WebSocket connections.
const wsConnIpLimiter = new FixedWindowLimiter(config.wsConnectRateLimitPerMin, 60_000)

export const LLM_RATE_MESSAGE =
  "You're sending requests too quickly. Please wait a moment and try again."

/** Direct check for the per-user LLM limiter (used by the WebSocket hub). */
export function checkLlmRate(userId: string): { allowed: boolean; retryAfterSec: number } {
  return llmLimiter.hit(userId || 'anon')
}

/** Direct check for the per-IP WebSocket connection limiter. */
export function checkWsConnRate(ip: string): { allowed: boolean; retryAfterSec: number } {
  return wsConnIpLimiter.hit(ip || 'anon')
}

/** Express middleware: per-user LLM rate limit (identity from the verified token). */
export function llmRateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = (req as AuthRequest).googleId || req.ip || 'anon'
  const { allowed, retryAfterSec } = llmLimiter.hit(key)
  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfterSec))
    res.status(429).json({ error: LLM_RATE_MESSAGE })
    return
  }
  next()
}

/** Express middleware: per-IP coarse limit for the sign-in endpoint. */
export function authIpRateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || req.socket.remoteAddress || 'anon'
  const { allowed, retryAfterSec } = authIpLimiter.hit(key)
  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfterSec))
    res.status(429).json({ error: 'Too many sign-in attempts. Please wait a minute and try again.' })
    return
  }
  next()
}
