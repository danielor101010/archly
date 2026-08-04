import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { config } from './config.js'

export const db = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  realtime: { transport: ws as never },
})

export type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correct: number
  explanation: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export type DbSessionRecord = {
  id: string
  user_id: string
  problem_id: string
  problem_title: string
  mode: string
  date: number
  score_architecture: number
  score_scalability: number
  score_reliability: number
  score_communication: number
  score_overall: number
  score_grade: string
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUser(googleId: string) {
  const { data } = await db.from('users').select('*').eq('id', googleId).single()
  return data as Record<string, unknown> | null
}

export async function upsertUser(googleId: string, fields: Record<string, unknown>) {
  await db.from('users').upsert({ id: googleId, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'id' })
}

export async function setWelcomed(googleId: string) {
  await db.from('users').upsert({ id: googleId, welcomed: true, updated_at: new Date().toISOString() }, { onConflict: 'id' })
}

export async function isWelcomed(googleId: string): Promise<boolean> {
  const { data } = await db.from('users').select('welcomed').eq('id', googleId).single()
  return (data as { welcomed?: boolean } | null)?.welcomed ?? false
}

// ── Quiz Progress ─────────────────────────────────────────────────────────────

export async function upsertQuizProgress(userId: string, topicKey: string, score: number, total: number, grade: string, completedAt: number) {
  await db.from('user_quiz_progress').upsert({ user_id: userId, topic_key: topicKey, score, total, grade, completed_at: completedAt }, { onConflict: 'user_id,topic_key' })
}

export async function getQuizProgress(userId: string): Promise<Record<string, { score: number; total: number; grade: string; completedAt: number }>> {
  const { data } = await db.from('user_quiz_progress').select('*').eq('user_id', userId)
  const result: Record<string, { score: number; total: number; grade: string; completedAt: number }> = {}
  for (const row of (data ?? []) as Array<{ topic_key: string; score: number; total: number; grade: string; completed_at: number }>) {
    result[row.topic_key] = { score: row.score, total: row.total, grade: row.grade, completedAt: row.completed_at }
  }
  return result
}

// ── Session Records ────────────────────────────────────────────────────────────

export async function upsertSessionRecord(record: DbSessionRecord) {
  await db.from('session_records').upsert(record, { onConflict: 'id' })
}

export async function getSessionRecords(userId: string) {
  const { data } = await db.from('session_records').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(50)
  return (data ?? []) as DbSessionRecord[]
}

// ── Generated Quiz Questions ──────────────────────────────────────────────────

export async function getGeneratedQuestions(topicSlug: string): Promise<QuizQuestion[]> {
  const { data } = await db.from('generated_quiz_questions').select('*').eq('topic_slug', topicSlug)
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    question: r.question as string,
    options: r.options as string[],
    correct: r.correct as number,
    explanation: r.explanation as string,
    difficulty: r.difficulty as QuizQuestion['difficulty'],
  }))
}

export async function saveGeneratedQuestions(topicSlug: string, questions: QuizQuestion[]) {
  const rows = questions.map(q => ({ ...q, topic_slug: topicSlug }))
  await db.from('generated_quiz_questions').upsert(rows, { onConflict: 'id' })
}

// ── Usage Ledger (best-effort) ──────────────────────────────────────────────────
// Increments a per-user/per-day usage row. Intentionally swallows ALL errors so the
// app keeps working even if the `usage_ledger` migration has not been applied yet.

export async function recordLedgerUsage(
  userId: string,
  delta: { sessionsStarted?: number; tokensIn?: number; tokensOut?: number; costCents?: number }
): Promise<void> {
  try {
    if (!userId) return
    const day = new Date().toISOString().slice(0, 10) // UTC YYYY-MM-DD
    const { data } = await db
      .from('usage_ledger')
      .select('sessions_started, tokens_in, tokens_out, cost_cents')
      .eq('user_id', userId)
      .eq('day', day)
      .single()
    const cur = (data ?? {}) as {
      sessions_started?: number; tokens_in?: number; tokens_out?: number; cost_cents?: number
    }
    await db.from('usage_ledger').upsert({
      user_id: userId,
      day,
      sessions_started: (cur.sessions_started ?? 0) + (delta.sessionsStarted ?? 0),
      tokens_in: (cur.tokens_in ?? 0) + (delta.tokensIn ?? 0),
      tokens_out: (cur.tokens_out ?? 0) + (delta.tokensOut ?? 0),
      cost_cents: (cur.cost_cents ?? 0) + (delta.costCents ?? 0),
    }, { onConflict: 'user_id,day' })
  } catch {
    // best-effort — table may be absent; never throw
  }
}

// ── Subscriptions (best-effort) ─────────────────────────────────────────────────
// Same philosophy as the usage ledger: the app must keep working — with everyone
// correctly treated as 'free' — even if the `subscriptions` migration hasn't been
// applied yet. Never throw.

export type SubscriptionRow = {
  user_id: string
  plan: string
  status: string
  provider_customer_id?: string | null
  current_period_end?: string | null
}

export async function getSubscription(userId: string): Promise<SubscriptionRow | null> {
  try {
    const { data } = await db.from('subscriptions').select('*').eq('user_id', userId).single()
    return (data as SubscriptionRow) ?? null
  } catch {
    return null
  }
}

export async function upsertSubscription(row: SubscriptionRow): Promise<void> {
  try {
    await db.from('subscriptions').upsert(row, { onConflict: 'user_id' })
  } catch {
    // best-effort — table may be absent; never throw
  }
}

/**
 * Sum of `sessions_started` in the current UTC calendar month. The caller
 * (hub.ts) only increments this for practice/interview session creates, so it
 * directly represents billable session usage against the free-tier quota.
 *
 * Fails OPEN (returns 0) on any error — including a missing migration. This is
 * deliberate: a DB hiccup or an unapplied migration must never lock every user
 * out of the free tier they're entitled to. The tradeoff is explicit: until the
 * migration is applied, the free-tier session cap is not enforced at all.
 */
export async function countSessionsThisMonth(userId: string): Promise<number> {
  try {
    const now = new Date()
    const firstOfMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`
    const { data } = await db
      .from('usage_ledger')
      .select('sessions_started')
      .eq('user_id', userId)
      .gte('day', firstOfMonth)
    return (data ?? []).reduce((sum: number, row: { sessions_started?: number }) => sum + (row.sessions_started ?? 0), 0)
  } catch {
    return 0
  }
}
