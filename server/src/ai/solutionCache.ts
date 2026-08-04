import type { CanvasCommand } from './architectureParser.js'

// ── Reference-solution cache ────────────────────────────────────────────────────
// Reference solutions are identical every time for the same problem — the 25
// canonical problems get requested repeatedly across every user who reveals a
// solution, yet were being regenerated at ~3k tokens per request. Cache the
// final text + the exact commands that were dispatched (whichever path
// produced them — hardcoded template or AI-parsed) so a cache hit replays both
// with zero LLM calls. Simple FIFO cap so unique custom-problem titles (which
// rarely repeat, so rarely benefit from caching) can't grow this unbounded.

interface CachedSolution {
  text: string
  commands: CanvasCommand[]
}

const MAX_ENTRIES = 200
const cache = new Map<string, CachedSolution>()

export function solutionCacheKey(problemId: string, customTitle?: string): string {
  return customTitle ? `${problemId}::${customTitle}` : problemId
}

export function getCachedSolution(key: string): CachedSolution | undefined {
  return cache.get(key)
}

export function setCachedSolution(key: string, value: CachedSolution): void {
  if (cache.size >= MAX_ENTRIES && !cache.has(key)) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(key, value)
}
