import OpenAI from 'openai'
import { config } from '../config.js'

// ── Shared LLM client ───────────────────────────────────────────────────────────
// One lazily-constructed OpenAI-compatible client for the whole server, pointed at
// the configured provider (DeepSeek by default). Lazy construction matters: the
// OpenAI SDK throws if instantiated with an empty apiKey, so building it on first
// use (not at import time) lets the server still boot when no LLM key is set —
// AI features degrade instead of crashing the process.

let client: OpenAI | null = null

export function getLLMClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ baseURL: config.llmBaseUrl, apiKey: config.llmApiKey })
  }
  return client
}

/** The chat model id for the configured provider (e.g. "deepseek-chat"). */
export const LLM_MODEL = config.llmModel
