import type { Session, NodeType, NodeHealth } from '../types.js'
import type { CanvasCommand } from './architectureParser.js'
import { getLLMClient, LLM_MODEL } from './llm.js'
import { recordSpend } from '../security/costTracker.js'

// ── Graph mutation extraction — the "split prose from mutations" fix ──────────
// The persona prompt (prompts.ts) no longer asks the model to interleave
// <canvas:...> XML into its conversational reply — that forced one generation
// to simultaneously role-play AND emit exact tags with exact IDs, which is the
// root cause of hallucinated/malformed commands. Instead, once the reply is
// complete, THIS module makes a second, small, non-streamed, low-temperature,
// JSON-constrained call whose only job is: "given this exchange, what changed
// on the architecture diagram?" Its output is converted to the existing
// CanvasCommand shape and run through the same validateCanvasCommands as
// before, so nothing downstream (dispatch, client rendering) had to change.

const NODE_TYPES = [
  'client', 'cdn', 'load_balancer', 'api_gateway', 'api_service', 'cache',
  'message_queue', 'database', 'search_cluster', 'object_storage',
  'notification_service', 'websocket_gateway', 'k8s_cluster',
] as const

interface RawMutation {
  action?: string
  id?: string
  type?: string
  label?: string
  parentId?: string
  from?: string
  to?: string
  health?: string
}

export function toCanvasCommand(m: RawMutation): CanvasCommand | null {
  switch (m.action) {
    case 'add_node':
      if (!m.id || !m.type || !m.label) return null
      return { type: 'add_node', node: { id: m.id, type: m.type as NodeType, label: m.label, health: 'healthy', metrics: {}, parentId: m.parentId || undefined } }
    case 'add_edge':
      if (!m.id || !m.from || !m.to) return null
      return { type: 'add_edge', edge: { id: m.id, from: m.from, to: m.to, label: m.label, type: 'sync' } }
    case 'update_node':
      if (!m.id || !m.health) return null
      return { type: 'update_node', nodeId: m.id, health: m.health as NodeHealth }
    case 'remove_node':
      if (!m.id) return null
      return { type: 'remove_node', nodeId: m.id }
    case 'highlight':
      if (!m.id) return null
      return { type: 'highlight', nodeId: m.id }
    default:
      return null
  }
}

/**
 * Situational guidance injected into the extraction prompt so it can tell
 * "the candidate stated a requirement" apart from "the candidate described a
 * component to add" — the actual, content-level distinction that matters.
 * The code-level phase GATE below deliberately stays permissive (a cheap
 * early-exit, not a precision instrument — see its own doc comment below);
 * this is where real precision belongs, since only the model sees what was
 * actually said this turn.
 */
export function phaseGuidance(phase: Session['phase']): string {
  switch (phase) {
    case 'api_design':
    case 'data_models':
      return 'CONVERSATION STAGE: still early — likely discussing functional/non-functional requirements, API endpoints, or data models, NOT yet system architecture. Be CONSERVATIVE here.'
    case 'high_level_design':
    case 'deep_dive':
      return 'CONVERSATION STAGE: the candidate is actively describing system architecture.'
    default:
      return ''
  }
}

/**
 * Whether this session's current phase permits drawing at all.
 *
 * BUG HISTORY: this originally only allowed 'high_level_design'/'deep_dive'.
 * But 'high_level_design' is only reached once nodes.length >= 1 (see
 * prompts.ts phase derivation) — a deadlock where the FIRST node can never be
 * created, since creating it requires a phase that itself requires a node to
 * already exist. 'api_design' and 'data_models', by contrast, are reachable
 * purely by message count with zero nodes, so excluding only 'requirements'
 * (the one phase the original design most strongly insists on — "NEVER emit
 * canvas commands in Steps 1-2" was never really honored past step 1 anyway)
 * breaks the deadlock. The extraction prompt's own instructions ("only add a
 * node for a component the candidate EXPLICITLY named... if nothing changed,
 * return an empty mutations array") are the real correctness guard — this gate
 * is just a cheap optimization to skip the call during pure early requirements
 * chat, not a precision instrument, so it should err permissive.
 */
export function phaseAllowsMutations(session: Session): boolean {
  return session.phase !== 'requirements'
}

/**
 * Ask a small, cheap, structured call what changed on the diagram this turn.
 * Self-accounts its own cost via recordSpend regardless of caller. Never
 * throws — any failure (network, parse) yields an empty mutation list so a
 * flaky provider call can never break the primary conversational reply.
 */
export async function extractGraphMutations(
  session: Session,
  userMessage: string,
  assistantReply: string,
): Promise<CanvasCommand[]> {
  const nodes = Object.values(session.graph.nodes)
  const edges = Object.values(session.graph.edges)

  const nodeList = nodes.length
    ? nodes.map(n => `  id="${n.id}" type="${n.type}" label="${n.label}"`).join('\n')
    : '  (none yet)'
  const edgeList = edges.length
    ? edges.map(e => `  id="${e.id}" from="${e.from}" to="${e.to}"`).join('\n')
    : '  (none yet)'

  const prompt = `You track architecture-diagram changes for a system design tool. Given the latest exchange, output ONLY the diagram mutations implied by what the CANDIDATE explicitly described (not what the coach/interviewer merely asked about).

${phaseGuidance(session.phase)}

EXISTING NODES (use these exact ids — never invent a different id for an existing node):
${nodeList}

EXISTING EDGES:
${edgeList}

LATEST EXCHANGE:
Candidate: ${userMessage.slice(0, 1500)}
Coach: ${assistantReply.slice(0, 1500)}

Node types allowed: ${NODE_TYPES.join(', ')}

Rules:
- CRITICAL DISTINCTION — requirements/API/data talk is NOT architecture: do NOT extract a mutation just because a system-like noun was mentioned while the candidate is stating a REQUIREMENT ("the system needs to store photos", "users need to log in", "it must handle 1M requests/sec"), defining an API endpoint ("GET /photos returns a list"), or naming a data field ("User has an email and createdAt"). None of those are architecture components.
- Only extract when the candidate describes an actual COMPONENT they are ADDING TO THE DESIGN — e.g. "I'll put a load balancer in front of the API servers", "I'll use Redis as a cache", "let's add a Postgres database for user data". This is about what goes ON THE DIAGRAM, not what the system should do.
- When genuinely unsure whether something is a requirement or a component, return an empty mutations array — a missed mutation is far cheaper than a wrong one on the candidate's diagram.
- Only add a node for a component the candidate EXPLICITLY named. Do not invent supporting infrastructure they didn't mention.
- Never re-add a node whose id/label already exists above.
- New node ids: short kebab-case, unique, not already in the existing list (e.g. "cache-1", "db-2").
- Edges must reference ids that exist above OR that you are adding in this same response.
- Kubernetes/K8s: add the cluster first as type "k8s_cluster", then add each service with "parentId" set to that cluster's id.
- update_node health values: healthy | elevated | stressed | critical | dead — only when the coach explicitly flagged a failure/stress on an EXISTING node.
- If nothing changed, return an empty mutations array. Do not force a mutation just to have something to return.

Return ONLY this JSON shape, no markdown:
{"mutations": [{"action": "add_node", "id": "...", "type": "...", "label": "...", "parentId": "..."}, {"action": "add_edge", "id": "...", "from": "...", "to": "...", "label": "..."}, {"action": "update_node", "id": "...", "health": "..."}, {"action": "remove_node", "id": "..."}, {"action": "highlight", "id": "..."}]}`

  try {
    const completion = await getLLMClient().chat.completions.create({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      stream: false,
    })
    const raw = completion.choices[0]?.message?.content?.trim() ?? ''
    recordSpend(prompt.length, raw.length)

    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(clean) as { mutations?: RawMutation[] }
    const mutations = Array.isArray(parsed.mutations) ? parsed.mutations : []
    return mutations.map(toCanvasCommand).filter((c): c is CanvasCommand => c !== null)
  } catch (err) {
    console.warn('[AI] Mutation extraction failed (non-fatal, no mutations applied):', err instanceof Error ? err.message : err)
    return []
  }
}
