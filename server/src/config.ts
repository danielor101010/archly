import 'dotenv/config'

// ── Fail-fast configuration ────────────────────────────────────────────────────
// Validates all required environment variables at boot. If anything critical is
// missing (or dangerously left at a dev default) the process exits immediately
// with a clear, actionable message instead of failing later at request time.

const DEV_SECRET = 'dev-secret-change-in-prod'

function num(name: string, def: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw.trim() === '') return def
  const n = Number(raw)
  return Number.isFinite(n) ? n : def
}

const REQUIRED: Record<string, string | undefined> = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  JWT_SECRET: process.env.JWT_SECRET,
}

const missing = Object.entries(REQUIRED)
  .filter(([, v]) => !v || v.trim() === '')
  .map(([k]) => k)

if (missing.length > 0) {
  console.error(
    `\n[config] FATAL: missing required environment variable(s):\n  - ${missing.join(
      '\n  - '
    )}\nSet them (see server/.env.example) and restart.\n`
  )
  process.exit(1)
}

if (process.env.JWT_SECRET === DEV_SECRET) {
  console.error(
    `\n[config] FATAL: JWT_SECRET is still the insecure development default ('${DEV_SECRET}').\nGenerate a strong, unique secret (e.g. \`openssl rand -base64 48\`) and restart.\n`
  )
  process.exit(1)
}

// Warn-only: the app boots without these but the affected features degrade.
const resolvedLlmKey = process.env.DEEPSEEK_API_KEY ?? process.env.OPENROUTER_API_KEY ?? ''
if (!resolvedLlmKey) {
  console.warn('[config] WARNING: no LLM API key set (DEEPSEEK_API_KEY) — AI features will fail.')
}
if (!process.env.BREVO_API_KEY) {
  console.warn('[config] WARNING: BREVO_API_KEY is not set — welcome emails will be skipped.')
}

export const config = {
  // Required (validated above)
  supabaseUrl: process.env.SUPABASE_URL as string,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  jwtSecret: process.env.JWT_SECRET as string,

  // LLM provider — DeepSeek by default (OpenAI-compatible API). Falls back to an
  // OpenRouter key if that's all that's set; base URL + model overridable via env.
  llmApiKey: process.env.DEEPSEEK_API_KEY ?? process.env.OPENROUTER_API_KEY ?? '',
  llmBaseUrl: process.env.LLM_BASE_URL ?? 'https://api.deepseek.com',
  llmModel: process.env.LLM_MODEL ?? 'deepseek-chat',

  // Optional integrations
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  brevoApiKey: process.env.BREVO_API_KEY ?? '',
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL ?? 'danior878@gmail.com',
  clientUrl: process.env.CLIENT_URL ?? '',

  // Server
  port: num('PORT', 3001),

  // Cost / rate-limit knobs
  maxDailyCostUsd: num('MAX_DAILY_COST_USD', 5),
  // Blended price-per-1k-tokens estimate for the LLM (input+output). Conservative
  // default; DeepSeek is cheaper, so the cost breaker over-estimates (safe).
  llmPricePer1kUsd: num('LLM_PRICE_PER_1K_USD', 0.001),
  llmRateLimitPerMin: num('LLM_RATE_LIMIT_PER_MIN', 15),
  authRateLimitPerMin: num('AUTH_RATE_LIMIT_PER_MIN', 10),
  wsConnectRateLimitPerMin: num('WS_CONNECT_RATE_LIMIT_PER_MIN', 30),

  // In-memory session eviction
  sessionTtlMs: num('SESSION_TTL_HOURS', 2) * 60 * 60 * 1000,
} as const
