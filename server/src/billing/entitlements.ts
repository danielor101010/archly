import { getSubscription, countSessionsThisMonth } from '../db.js'

// ── Entitlements ─────────────────────────────────────────────────────────────
// Free tier: 3 practice/interview sessions per calendar month, no solution
// reveal, no CV features. Pro: unlimited sessions (the existing per-user daily
// LLM rate limit is still the fair-use ceiling), solution reveal, CV analysis
// + CV interview. See PRODUCTION_PLAN.md §6.3.

export type Plan = 'free' | 'pro'
export type Feature = 'session' | 'solution' | 'cv'

export const FREE_SESSIONS_PER_MONTH = 3

export async function getPlan(userId: string): Promise<Plan> {
  const sub = await getSubscription(userId)
  return sub && sub.plan === 'pro' && sub.status === 'active' ? 'pro' : 'free'
}

export interface EntitlementResult {
  allowed: boolean
  plan: Plan
  sessionsUsed?: number
}

/**
 * Pure decision core — no I/O, given an already-resolved plan (and session
 * count, only needed/meaningful for the 'session' feature on the free plan).
 * Separated from checkEntitlement so it's directly unit-testable without
 * touching Supabase.
 */
export function decideEntitlement(plan: Plan, feature: Feature, sessionsUsed: number): EntitlementResult {
  if (plan === 'pro') return { allowed: true, plan }
  if (feature === 'solution' || feature === 'cv') return { allowed: false, plan }
  // feature === 'session'
  return { allowed: sessionsUsed < FREE_SESSIONS_PER_MONTH, plan, sessionsUsed }
}

export async function checkEntitlement(userId: string, feature: Feature): Promise<EntitlementResult> {
  const plan = await getPlan(userId)
  const sessionsUsed = plan === 'free' && feature === 'session' ? await countSessionsThisMonth(userId) : 0
  return decideEntitlement(plan, feature, sessionsUsed)
}
