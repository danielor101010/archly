import { config } from '../config.js'

// ── Global daily LLM cost circuit breaker ───────────────────────────────────────
// Maintains an in-memory running estimate of today's LLM spend. Tokens are
// estimated from character length (~4 chars/token) and priced with a configurable
// per-1k-token constant. When the estimate crosses MAX_DAILY_COST_USD every LLM
// entry point short-circuits with a friendly message INSTEAD of calling OpenRouter.
// The running total resets at UTC midnight.

export const FRIENDLY_CAPACITY_MESSAGE =
  'The service is at capacity right now, please try again later'

const CHARS_PER_TOKEN = 4

let currentDay = utcDay()
let spendUsd = 0

function utcDay(): string {
  // YYYY-MM-DD in UTC
  return new Date().toISOString().slice(0, 10)
}

function rollover(): void {
  const today = utcDay()
  if (today !== currentDay) {
    currentDay = today
    spendUsd = 0
  }
}

export function estimateTokens(chars: number): number {
  return Math.ceil(Math.max(0, chars) / CHARS_PER_TOKEN)
}

/** True when today's estimated spend has reached the configured cap. */
export function isOverDailyBudget(): boolean {
  rollover()
  return spendUsd >= config.maxDailyCostUsd
}

/**
 * Add an estimated LLM call to today's running spend.
 * Returns the token/cost estimate so callers can persist it if they wish.
 */
export function recordSpend(
  inputChars: number,
  outputChars: number
): { costUsd: number; tokensIn: number; tokensOut: number } {
  rollover()
  const tokensIn = estimateTokens(inputChars)
  const tokensOut = estimateTokens(outputChars)
  const costUsd = ((tokensIn + tokensOut) / 1000) * config.llmPricePer1kUsd
  spendUsd += costUsd
  return { costUsd, tokensIn, tokensOut }
}

export function getDailySpendUsd(): number {
  rollover()
  return spendUsd
}
