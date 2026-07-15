// ── Server-side input hardening limits ─────────────────────────────────────────
// Reject (never silently truncate) oversized input at the entry points. Graph
// caps bound per-session memory growth.

export const LIMITS = {
  userMessage: 4000,
  cvText: 20000,
  jobDescription: 20000,
  customTitle: 500,
  customDescription: 500,
  nodeLabel: 80,
  nodeType: 80,
  nodeId: 200,
  suggestInput: 4000,
  topicField: 200,
  maxNodes: 60,
  maxEdges: 120,
} as const

/** True when `value` is a string longer than `max`. */
export function tooLong(value: unknown, max: number): boolean {
  return typeof value === 'string' && value.length > max
}
