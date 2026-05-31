import { GraphNode, GraphEdge, NodeType, NodeHealth, BoardCommand } from '../types.js'

export interface CanvasCommand {
  type: 'add_node' | 'add_edge' | 'update_node' | 'highlight' | 'failure' | 'remove_node'
  node?: GraphNode
  edge?: GraphEdge
  nodeId?: string
  health?: NodeHealth
  failureType?: string
}

// Regex patterns for canvas commands
const ADD_NODE_RE = /<canvas:add_node\s+id="([^"]+)"\s+type="([^"]+)"\s+label="([^"]+)"(?:\s+parent="([^"]*)")?(?:\s+x="([^"]*)")?(?:\s+y="([^"]*)")?\s*\/>/g
const ADD_EDGE_RE =
  /<canvas:add_edge\s+id="([^"]+)"\s+from="([^"]+)"\s+to="([^"]+)"(?:\s+label="([^"]*)")?\s*\/>/g
const UPDATE_NODE_RE = /<canvas:update_node\s+id="([^"]+)"\s+health="([^"]+)"\s*\/>/g
const HIGHLIGHT_RE = /<canvas:highlight\s+nodeId="([^"]+)"\s*\/>/g
const FAILURE_RE = /<canvas:failure\s+type="([^"]+)"\s+nodeId="([^"]+)"\s*\/>/g
const REMOVE_NODE_RE = /<canvas:remove_node\s+id="([^"]+)"\s*\/>/g
const ALL_COMMANDS_RE = /<canvas:[^>]+\/>/g

// Board command regexes
const BOARD_REQ_RE = /<board:req\s+id="([^"]+)"\s+type="([^"]+)"\s+text="([^"]*)"\s*\/>/g
const BOARD_API_RE = /<board:api\s+id="([^"]+)"\s+method="([^"]+)"\s+path="([^"]+)"\s+desc="([^"]*)"\s*\/>/g
const BOARD_MODEL_RE = /<board:model\s+id="([^"]+)"\s+name="([^"]+)"\s+fields="([^"]*)"\s*\/>/g
const ALL_BOARD_RE = /<board:[^>]+\/>/g

export function parseCanvasCommands(text: string): CanvasCommand[] {
  const commands: CanvasCommand[] = []

  for (const match of text.matchAll(ADD_NODE_RE)) {
    commands.push({
      type: 'add_node',
      node: {
        id: match[1],
        type: match[2] as NodeType,
        label: match[3],
        health: 'healthy',
        metrics: {},
        parentId: match[4] || undefined,
        position: (match[5] && match[6]) ? { x: Number(match[5]), y: Number(match[6]) } : undefined,
      },
    })
  }

  for (const match of text.matchAll(ADD_EDGE_RE)) {
    commands.push({
      type: 'add_edge',
      edge: {
        id: match[1],
        from: match[2],
        to: match[3],
        label: match[4] || undefined,
        type: 'sync',
      },
    })
  }

  for (const match of text.matchAll(UPDATE_NODE_RE)) {
    commands.push({
      type: 'update_node',
      nodeId: match[1],
      health: match[2] as NodeHealth,
    })
  }

  for (const match of text.matchAll(HIGHLIGHT_RE)) {
    commands.push({ type: 'highlight', nodeId: match[1] })
  }

  for (const match of text.matchAll(FAILURE_RE)) {
    commands.push({ type: 'failure', nodeId: match[2], failureType: match[1] })
  }

  for (const match of text.matchAll(REMOVE_NODE_RE)) {
    commands.push({ type: 'remove_node', nodeId: match[1] })
  }

  return commands
}

export function stripCanvasCommands(text: string): string {
  return text.replace(ALL_COMMANDS_RE, '').replace(/\n{3,}/g, '\n\n')
}

export function parseBoardCommands(text: string): BoardCommand[] {
  const commands: BoardCommand[] = []

  for (const match of text.matchAll(BOARD_REQ_RE)) {
    commands.push({ type: 'req', id: match[1], reqType: match[2] as 'FR' | 'NFR', text: match[3] })
  }
  for (const match of text.matchAll(BOARD_API_RE)) {
    commands.push({ type: 'api', id: match[1], method: match[2], path: match[3], desc: match[4] })
  }
  for (const match of text.matchAll(BOARD_MODEL_RE)) {
    commands.push({ type: 'model', id: match[1], name: match[2], fields: match[3] })
  }

  return commands
}

export function stripBoardCommands(text: string): string {
  return text.replace(ALL_BOARD_RE, '').replace(/\n{3,}/g, '\n\n')
}
