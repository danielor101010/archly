import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const url = process.env.SUPABASE_URL ?? ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const db = createClient(url, key, {
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
