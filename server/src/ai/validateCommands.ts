import type { CanvasCommand } from './architectureParser.js'
import type { NodeType } from '../types.js'

// ── Server-side canvas-command validation ───────────────────────────────────────
// The LLM emits <canvas:...> commands as free text, so it routinely hallucinates:
// edges pointing at node ids that were never created, mis-typed node types, or
// mutations against nodes that don't exist. Applying those blindly produces broken,
// disconnected diagrams. This validator drops structurally-invalid commands BEFORE
// they mutate the graph and reports why, so the canvas only ever reflects a
// coherent architecture.

const NODE_TYPES: ReadonlySet<NodeType> = new Set<NodeType>([
  'client', 'cdn', 'load_balancer', 'api_gateway', 'api_service', 'cache',
  'message_queue', 'database', 'search_cluster', 'object_storage',
  'notification_service', 'websocket_gateway', 'k8s_cluster',
])

export interface RejectedCommand {
  type: CanvasCommand['type']
  reason: string
  ref: string
}

export interface ValidationResult {
  valid: CanvasCommand[]
  rejected: RejectedCommand[]
}

/**
 * Validate a batch of canvas commands against the current graph.
 * Commands are processed in emission order: a node added earlier in the same
 * batch counts as "known" for later edges/updates in that batch.
 *
 * @param commands       Parsed canvas commands, in order.
 * @param existingNodeIds Node ids already present in the session graph.
 */
export function validateCanvasCommands(
  commands: CanvasCommand[],
  existingNodeIds: Iterable<string>,
): ValidationResult {
  const known = new Set<string>(existingNodeIds)
  const valid: CanvasCommand[] = []
  const rejected: RejectedCommand[] = []

  for (const cmd of commands) {
    switch (cmd.type) {
      case 'add_node': {
        const node = cmd.node
        if (!node || !node.id) {
          rejected.push({ type: cmd.type, reason: 'missing node id', ref: node?.id ?? '?' })
          break
        }
        if (!node.label || !node.label.trim()) {
          rejected.push({ type: cmd.type, reason: 'missing label', ref: node.id })
          break
        }
        if (!NODE_TYPES.has(node.type)) {
          rejected.push({ type: cmd.type, reason: `unknown node type "${node.type}"`, ref: node.id })
          break
        }
        if (known.has(node.id)) {
          // Re-adding an existing node — harmless downstream but noise; drop it.
          rejected.push({ type: cmd.type, reason: 'duplicate node id', ref: node.id })
          break
        }
        // A declared parent must resolve; otherwise keep the node but drop the bad parent ref.
        if (node.parentId && !known.has(node.parentId)) {
          node.parentId = undefined
        }
        known.add(node.id)
        valid.push(cmd)
        break
      }

      case 'add_edge': {
        const edge = cmd.edge
        if (!edge || !edge.id) {
          rejected.push({ type: cmd.type, reason: 'missing edge id', ref: edge?.id ?? '?' })
          break
        }
        if (!known.has(edge.from)) {
          rejected.push({ type: cmd.type, reason: `edge source "${edge.from}" does not exist`, ref: edge.id })
          break
        }
        if (!known.has(edge.to)) {
          rejected.push({ type: cmd.type, reason: `edge target "${edge.to}" does not exist`, ref: edge.id })
          break
        }
        if (edge.from === edge.to) {
          rejected.push({ type: cmd.type, reason: 'self-loop edge', ref: edge.id })
          break
        }
        valid.push(cmd)
        break
      }

      case 'update_node':
      case 'highlight':
      case 'failure':
      case 'remove_node': {
        const ref = cmd.nodeId ?? '?'
        if (!cmd.nodeId || !known.has(cmd.nodeId)) {
          rejected.push({ type: cmd.type, reason: `target node "${ref}" does not exist`, ref })
          break
        }
        if (cmd.type === 'remove_node') known.delete(cmd.nodeId)
        valid.push(cmd)
        break
      }

      default: {
        // Unknown command shape — drop defensively.
        rejected.push({ type: (cmd as CanvasCommand).type, reason: 'unknown command type', ref: '?' })
      }
    }
  }

  return { valid, rejected }
}
