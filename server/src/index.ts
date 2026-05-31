import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { createWSHub } from './ws/hub.js'
import { sessionStore } from './store.js'
import { analyzeCvGap } from './ai/orchestrator.js'
import { getUser, upsertUser, setWelcomed, isWelcomed, upsertQuizProgress, getQuizProgress, upsertSessionRecord, getSessionRecords, getGeneratedQuestions, saveGeneratedQuestions } from './db.js'

const app = express()
const PORT = Number(process.env.PORT) || 3001

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://project-08fnm.vercel.app',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
]
app.use(cors({ origin: (origin, cb) => {
  if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
    cb(null, true)
  } else {
    cb(new Error('Not allowed by CORS'))
  }
}}))
app.use(express.json())

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── REST: Get session by ID ───────────────────────────────────────────────────
app.get('/api/sessions/:id', (req: Request, res: Response) => {
  const session = sessionStore.get(String(req.params.id))
  if (!session) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.json(session)
})

// ── REST: List available problems ─────────────────────────────────────────────
app.get('/api/problems', (_req: Request, res: Response) => {
  res.json([
    {
      id: 'url-shortener',
      title: 'Design URL Shortener',
      difficulty: 'Easy',
      duration: '30 min',
      companies: ['Google', 'Amazon'],
    },
    {
      id: 'instagram',
      title: 'Design Instagram',
      difficulty: 'Medium',
      duration: '45 min',
      companies: ['Meta', 'Instagram'],
    },
    {
      id: 'youtube',
      title: 'Design YouTube',
      difficulty: 'Medium',
      duration: '45 min',
      companies: ['Google', 'YouTube'],
    },
    {
      id: 'uber',
      title: 'Design Uber',
      difficulty: 'Hard',
      duration: '60 min',
      companies: ['Uber', 'Lyft'],
    },
    {
      id: 'whatsapp',
      title: 'Design WhatsApp',
      difficulty: 'Hard',
      duration: '60 min',
      companies: ['Meta', 'WhatsApp'],
    },
  ])
})

// ── REST: CV gap analysis ─────────────────────────────────────────────────────
app.post('/api/analyze-cv-gap', async (req: Request, res: Response) => {
  const { cvText, jobDescription } = req.body
  if (!cvText || !jobDescription) {
    res.status(400).json({ error: 'cvText and jobDescription are required' })
    return
  }
  try {
    const result = await analyzeCvGap(cvText as string, jobDescription as string)
    res.json(result)
  } catch (err) {
    console.error('[API] CV gap error:', err)
    res.status(500).json({ error: 'Analysis failed' })
  }
})

// ── REST: Data model review ───────────────────────────────────────────────────
app.post('/api/model-review', async (req: Request, res: Response) => {
  const { entities, relationships, userMessage } = req.body as {
    entities: Array<{ name: string; fields: Array<{ name: string; type: string }> }>
    relationships: Array<{ from: string; to: string; label: string }>
    userMessage: string
  }

  const entityList = entities.map(e =>
    `${e.name}:\n${e.fields.map(f => `  - ${f.name}: ${f.type}`).join('\n')}`
  ).join('\n\n')

  const relList = relationships.length
    ? relationships.map(r => `${r.from} ${r.label} ${r.to}`).join('\n')
    : '(none defined yet)'

  const prompt = `You are a senior database architect reviewing a data model.

Entities:
${entityList}

Relationships:
${relList}

User question: ${userMessage}

Answer in 3-6 sentences. Be specific about the model the user provided — reference actual entity names and field names. If reviewing, check: primary keys, foreign keys, normalization, missing relationships, data types. If generating SQL, write proper CREATE TABLE statements with constraints.`

  try {
    const OpenAI = (await import('openai')).default
    const client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY ?? '',
    })
    const completion = await client.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      stream: false,
    })
    const reply = completion.choices[0]?.message?.content?.trim() ?? 'No response.'
    res.json({ reply })
  } catch (err) {
    console.error('[API] Model review error:', err)
    res.status(500).json({ reply: 'Analysis failed. Please try again.' })
  }
})

// ── REST: AI system design suggestions ───────────────────────────────────────
app.post('/api/suggest-systems', async (req: Request, res: Response) => {
  const { input } = req.body as { input?: string }
  if (!input?.trim()) { res.status(400).json({ suggestions: [] }); return }

  const prompt = `A user is designing their own system. They have typed: "${input.trim()}"

Generate exactly 3 concise, specific system design problem descriptions based on their input.
Each should be a single sentence that could be used as a system design interview question.
Make them progressively more specific/challenging.

Return ONLY valid JSON (no markdown):
{"suggestions": ["...", "...", "..."]}`

  try {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey: process.env.OPENROUTER_API_KEY ?? '' })
    const completion = await client.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      stream: false,
    })
    const raw = completion.choices[0]?.message?.content?.trim() ?? ''
    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(clean)
    res.json({ suggestions: parsed.suggestions ?? [] })
  } catch {
    res.status(500).json({ suggestions: [] })
  }
})

// ── User progress sync ────────────────────────────────────────────────────────
app.post('/api/users/sync', async (req: Request, res: Response) => {
  const { googleId, name, email, avatar, level, sessionsCompleted, totalTokensUsed,
    streakDays, lastChallengeDate, completedChallengeIds, solvedProblems, createdAt,
    quizProgress, sessionHistory } = req.body as {
    googleId?: string; name?: string; email?: string; avatar?: string
    level?: string; sessionsCompleted?: number; totalTokensUsed?: number
    streakDays?: number; lastChallengeDate?: string; completedChallengeIds?: string[]
    solvedProblems?: string[]; createdAt?: number
    quizProgress?: Record<string, { score: number; total: number; grade: string; completedAt: number }>
    sessionHistory?: Array<{ id: string; problemId: string; problemTitle: string; mode: string; date: number; scores: { architecture: number; scalability: number; reliability: number; communication: number; overall: number; grade: string } }>
  }
  if (!googleId) { res.status(400).json({ ok: false }); return }

  try {
    // Upsert core user fields
    if (name && email) {
      await upsertUser(googleId, { name, email, avatar, level, sessions_completed: sessionsCompleted,
        total_tokens_used: totalTokensUsed, streak_days: streakDays,
        last_challenge_date: lastChallengeDate, completed_challenge_ids: completedChallengeIds,
        solved_problems: solvedProblems, created_at: createdAt })
    }
    // Upsert quiz progress entries
    if (quizProgress) {
      for (const [key, val] of Object.entries(quizProgress)) {
        await upsertQuizProgress(googleId, key, val.score, val.total, val.grade, val.completedAt)
      }
    }
    // Upsert session records
    if (sessionHistory) {
      for (const r of sessionHistory) {
        await upsertSessionRecord({
          id: r.id, user_id: googleId, problem_id: r.problemId, problem_title: r.problemTitle,
          mode: r.mode, date: r.date,
          score_architecture: r.scores.architecture, score_scalability: r.scores.scalability,
          score_reliability: r.scores.reliability, score_communication: r.scores.communication,
          score_overall: r.scores.overall, score_grade: r.scores.grade,
        })
      }
    }
    res.json({ ok: true })
  } catch (err) {
    console.error('[DB] sync error:', err)
    res.status(500).json({ ok: false })
  }
})

app.get('/api/users/:googleId', async (req: Request, res: Response) => {
  try {
    const googleId = String(req.params.googleId)
    const user = await getUser(googleId)
    if (!user) { res.status(404).json({ found: false }); return }

    const quizProgress = await getQuizProgress(googleId)
    const records = await getSessionRecords(googleId)
    const sessionHistory = records.map(r => ({
      id: r.id, problemId: r.problem_id, problemTitle: r.problem_title,
      mode: r.mode, date: r.date,
      scores: { architecture: r.score_architecture, scalability: r.score_scalability,
        reliability: r.score_reliability, communication: r.score_communication,
        overall: r.score_overall, grade: r.score_grade },
    }))

    // Map snake_case DB fields to camelCase for the client
    res.json({ found: true, user: {
      level: user.level,
      sessionsCompleted: user.sessions_completed,
      totalTokensUsed: user.total_tokens_used,
      streakDays: user.streak_days,
      lastChallengeCompletedDate: user.last_challenge_date,
      completedChallengeIds: user.completed_challenge_ids,
      solvedProblems: user.solved_problems,
      quizProgress,
      sessionHistory,
    } })
  } catch (err) {
    console.error('[DB] fetch user error:', err)
    res.status(500).json({ found: false })
  }
})

// ── REST: Send welcome email — only on true sign-up (never seen this googleId before) ──
app.post('/api/send-welcome-email', async (req: Request, res: Response) => {
  const { email, name, googleId } = req.body as { email?: string; name?: string; googleId?: string }
  if (!email || !name || !googleId) { res.status(400).json({ ok: false }); return }

  // Already welcomed — this is a login, not a sign-up
  if (await isWelcomed(googleId)) {
    res.json({ ok: false, reason: 'already_sent' })
    return
  }

  const brevoKey = process.env.BREVO_API_KEY
  if (!brevoKey) {
    console.warn('[Email] BREVO_API_KEY not set — welcome email skipped')
    res.json({ ok: false, reason: 'no_credentials' })
    return
  }

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0f0f11;color:#e4e4e7;border-radius:16px">
      <h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Welcome, ${name}! 🎉</h1>
      <p style="color:#a1a1aa;margin-bottom:24px">Thanks for signing up to <strong style="color:#818cf8">Archly</strong> — your FAANG-level system design prep tool.</p>
      <hr style="border:none;border-top:1px solid #27272a;margin:24px 0"/>
      <p style="font-size:15px;line-height:1.6;margin-bottom:16px">Here's what you can do right now:</p>
      <ul style="padding-left:20px;line-height:2;color:#a1a1aa">
        <li>🏗️ Practice all <strong style="color:#e4e4e7">25 classic system design problems</strong></li>
        <li>📚 Learn concepts — load balancing, caching, CAP theorem, and more</li>
        <li>💻 Quiz yourself on programming languages (JavaScript, Python, SQL…)</li>
        <li>🤖 Chat with an AI tutor that teaches without giving away the answers</li>
        <li>📊 Track your progress across every topic</li>
      </ul>
      <hr style="border:none;border-top:1px solid #27272a;margin:24px 0"/>
      <p style="color:#71717a;font-size:13px">Questions? Just reply to this email.<br/>Good luck with your prep! 💪</p>
    </div>
  `

  try {
    const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Archly', email: process.env.BREVO_SENDER_EMAIL ?? 'danior878@gmail.com' },
        to: [{ email }],
        subject: `Welcome to Archly, ${name}!`,
        htmlContent: html,
      }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      console.error('[Email] Brevo error:', err)
      res.json({ ok: false, reason: 'send_failed' })
      return
    }
    // Only mark as welcomed after confirmed delivery
    await setWelcomed(googleId)
    res.json({ ok: true })
  } catch (err) {
    console.error('[Email] Send error:', err)
    res.json({ ok: false, reason: 'send_failed' })
  }
})

// ── REST: Test email (dev/debug only) ────────────────────────────────────────
app.get('/api/test-email', async (_req: Request, res: Response) => {
  const brevoKey = process.env.BREVO_API_KEY
  if (!brevoKey) { res.json({ ok: false, reason: 'no_credentials' }); return }
  try {
    const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Archly', email: process.env.BREVO_SENDER_EMAIL ?? 'danior878@gmail.com' },
        to: [{ email: process.env.BREVO_SENDER_EMAIL ?? 'danior878@gmail.com' }],
        subject: 'Archly email test',
        htmlContent: '<p>Email is working!</p>',
      }),
    })
    const data = await resp.json() as unknown
    res.json({ ok: resp.ok, data })
  } catch (err) {
    res.json({ ok: false, error: String(err) })
  }
})

// ── REST: Generate more quiz questions for a topic ────────────────────────────
app.post('/api/generate-quiz-questions', async (req: Request, res: Response) => {
  const { topicSlug, topicTitle, existingIds } = req.body as {
    topicSlug: string
    topicTitle: string
    existingIds?: string[]
  }
  if (!topicSlug || !topicTitle) {
    res.status(400).json({ error: 'topicSlug and topicTitle required' })
    return
  }

  // Return DB-cached questions if available
  const cached = await getGeneratedQuestions(topicSlug)
  if (cached.length > 0) {
    res.json({ questions: cached })
    return
  }

  const existingList = (existingIds ?? []).join(', ')
  const prompt = `Generate exactly 10 multiple-choice quiz questions about "${topicTitle}" for software engineers studying system design.

Rules:
- Each question must test UNDERSTANDING of how the technology works, not ask the user to design anything
- Mix difficulties: 3 Easy, 4 Medium, 3 Hard
- 4 answer options per question, exactly one correct
- The correct answer index must be 0, 1, 2, or 3 (0-based)
- Explanation must be 1-2 sentences explaining WHY the answer is correct
- Questions must be DIFFERENT from these existing IDs: ${existingList || 'none'}
- Use IDs like "gen-${topicSlug}-1" through "gen-${topicSlug}-10"

Return ONLY valid JSON (no markdown):
{
  "questions": [
    {
      "id": "gen-${topicSlug}-1",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct": 1,
      "explanation": "...",
      "difficulty": "Easy"
    }
  ]
}`

  try {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey: process.env.OPENROUTER_API_KEY ?? '' })
    const completion = await client.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2500,
      stream: false,
    })
    const raw = completion.choices[0]?.message?.content?.trim() ?? ''
    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(clean)
    const questions = parsed.questions ?? []
    // Persist to DB for future requests
    await saveGeneratedQuestions(topicSlug, questions)
    res.json({ questions })
  } catch (err) {
    console.error('[API] Quiz generation error:', err)
    res.status(500).json({ error: 'Failed to generate questions' })
  }
})

// ── REST: Full canvas trace (pre-computes all steps in one AI call) ───────────
app.post('/api/trace-full', async (req: Request, res: Response) => {
  const { nodes, edges } = req.body as {
    nodes: Array<{ id: string; type: string; label: string }>
    edges: Array<{ id: string; from: string; to: string; label?: string }>
  }
  if (!nodes?.length) { res.status(400).json({ error: 'No nodes' }); return }

  const nodeList = nodes.map(n => `- id="${n.id}" label="${n.label}" type="${n.type}"`).join('\n')
  const edgeList = edges.map(e => {
    const from = nodes.find(n => n.id === e.from)?.label ?? e.from
    const to   = nodes.find(n => n.id === e.to)?.label   ?? e.to
    return `- id="${e.id}" from="${e.from}" (${from}) to="${e.to}" (${to})${e.label ? ` label="${e.label}"` : ''}`
  }).join('\n')

  const prompt = `You are analyzing a distributed system architecture and generating a step-by-step request trace.

Nodes:
${nodeList}

Edges:
${edgeList}

Generate the complete journey of ONE typical HTTP request through this system, from the entry point to the final destination.
Choose the most realistic "happy path" — assume caches hit when sensible, avoid error paths.
Follow ACTUAL edges only — each step must use an edge that exists in the edge list above.

Return ONLY valid JSON (no markdown):
{
  "path": [
    {
      "nodeId": "exact-node-id-from-list",
      "edgeId": null,
      "stepLabel": "Very short label (4-6 words)",
      "explanation": "2-3 sentences: what this component does RIGHT NOW with this specific request. Be concrete."
    },
    {
      "nodeId": "next-exact-node-id",
      "edgeId": "exact-edge-id-used-to-get-here",
      "stepLabel": "Short label",
      "explanation": "2-3 sentences about what happens here."
    }
  ]
}

Rules:
- 4-8 steps total
- First step: edgeId must be null
- All subsequent steps: edgeId must be an exact id from the edge list
- Each nodeId must be an exact id from the node list
- End at a terminal node (database, storage, or back to client)
- explanations must reference THIS system's actual component names`

  try {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey: process.env.OPENROUTER_API_KEY ?? '' })
    const completion = await client.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      stream: false,
    })
    const raw = completion.choices[0]?.message?.content?.trim() ?? ''
    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(clean)
    res.json(parsed)
  } catch (err) {
    console.error('[API] Full trace error:', err)
    res.status(500).json({ error: 'Analysis failed' })
  }
})

// ── REST: Request trace step ──────────────────────────────────────────────────
app.post('/api/trace-step', async (req: Request, res: Response) => {
  const { nodes, edges, currentNodeId, history } = req.body as {
    nodes: Array<{ id: string; type: string; label: string }>
    edges: Array<{ id: string; from: string; to: string; label?: string }>
    currentNodeId: string
    history: string[]
  }
  const currentNode = nodes.find(n => n.id === currentNodeId)
  if (!currentNode) { res.status(400).json({ error: 'Node not found' }); return }

  const outgoing = edges.filter(e => e.from === currentNodeId)
  const nodeList = nodes.map(n => `- ${n.label} (${n.type})`).join('\n')
  const edgeList = edges.map(e => {
    const from = nodes.find(n => n.id === e.from)?.label ?? e.from
    const to   = nodes.find(n => n.id === e.to)?.label   ?? e.to
    return `  ${from} → ${to}${e.label ? ` [${e.label}]` : ''}`
  }).join('\n')

  const prompt = `You are narrating a real HTTP request traveling through a distributed system step by step.

Architecture:
${nodeList}

Connections:
${edgeList || '  (none)'}

Journey so far: ${history.length > 0 ? history.join(' → ') : '(just started)'}

Request is NOW AT: ${currentNode.label} (${currentNode.type})

Outgoing connections:
${outgoing.length > 0 ? outgoing.map(e => {
    const toNode = nodes.find(n => n.id === e.to)
    return `  → ${toNode?.label ?? e.to} [edgeId: ${e.id}, targetNodeId: ${e.to}]`
  }).join('\n') : '  (none — terminal node)'}

In 3-4 sentences, explain what ${currentNode.label} does with this request RIGHT NOW. Be concrete — mention actual operations (cache lookup, DB write, health check, routing decision). Narrate as if in real time.

Return ONLY valid JSON (no markdown):
{
  "explanation": "...",
  "nextSteps": [
    { "label": "Short label max 7 words", "targetNodeId": "exact-id", "edgeId": "exact-id" }
  ],
  "isTerminal": ${outgoing.length === 0}
}`

  try {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey: process.env.OPENROUTER_API_KEY ?? '' })
    const completion = await client.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      stream: false,
    })
    const raw = completion.choices[0]?.message?.content?.trim() ?? ''
    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(clean)
    if (outgoing.length === 0) parsed.isTerminal = true
    res.json(parsed)
  } catch (err) {
    console.error('[API] Trace step error:', err)
    res.status(500).json({
      explanation: 'Could not generate explanation. Check the server logs.',
      nextSteps: outgoing.map(e => ({
        label: `→ ${nodes.find(n => n.id === e.to)?.label ?? e.to}`,
        targetNodeId: e.to,
        edgeId: e.id,
      })),
      isTerminal: outgoing.length === 0,
    })
  }
})

// ── HTTP + WebSocket server ───────────────────────────────────────────────────
const server = createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })
createWSHub(wss)

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`WebSocket ready on ws://localhost:${PORT}/ws`)
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('WARNING: OPENROUTER_API_KEY not set — AI features will fail')
  }
})
