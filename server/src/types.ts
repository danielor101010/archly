export type NodeType =
  | 'client'
  | 'cdn'
  | 'load_balancer'
  | 'api_gateway'
  | 'api_service'
  | 'cache'
  | 'message_queue'
  | 'database'
  | 'search_cluster'
  | 'object_storage'
  | 'notification_service'
  | 'websocket_gateway'
  | 'k8s_cluster'

export type NodeHealth = 'healthy' | 'elevated' | 'stressed' | 'critical' | 'dead'

export type SessionMode = 'practice' | 'interview' | 'cv-interview' | 'coding' | 'concept'

export interface GraphNode {
  id: string
  type: NodeType
  label: string
  health: NodeHealth
  metrics: {
    rps?: number
    latencyMs?: number
    loadPct?: number
    queueDepth?: number
  }
  isSPOF?: boolean
  position?: { x: number; y: number }
  parentId?: string
}

export interface GraphEdge {
  id: string
  from: string
  to: string
  label?: string
  type?: 'sync' | 'async' | 'event'
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Session {
  id: string
  mode: SessionMode
  problemId: string
  userLevel?: string
  startedAt: number
  messages: Message[]
  graph: {
    nodes: Record<string, GraphNode>
    edges: Record<string, GraphEdge>
  }
  scores: ScoreState
  customProblemTitle?: string
  customProblemDesc?: string
}

export interface ScoreState {
  architecture: number   // 0-100
  scalability: number    // 0-100
  reliability: number    // 0-100
  communication: number  // 0-100
  overall: number
  grade: string
  verdict: string
}

export interface BoardCommand {
  type: 'req' | 'api' | 'model'
  id: string
  reqType?: 'FR' | 'NFR'
  text?: string
  method?: string
  path?: string
  desc?: string
  name?: string
  fields?: string
}

// WebSocket message types
export type WSClientMessage =
  | { type: 'CREATE_SESSION'; mode: SessionMode; problemId: string; userLevel?: string; customProblem?: { title: string; description: string } }
  | { type: 'USER_MESSAGE'; sessionId: string; content: string }
  | { type: 'REQUEST_HINT'; sessionId: string }
  | { type: 'STRESS_TEST'; sessionId: string; testType: 'scalability' | 'consistency' | 'reliability' }
  | { type: 'REQUEST_SOLUTION'; sessionId: string }
  | { type: 'NODE_EXPLAIN'; sessionId: string; nodeId: string; nodeType: string; nodeLabel: string }
  | { type: 'ANALYZE_CV'; cvText: string; userLevel?: string }
  | { type: 'PING' }

export type WSServerMessage =
  | { type: 'SESSION_CREATED'; sessionId: string; greeting: string; problemId: string }
  | { type: 'AI_STREAM_CHUNK'; delta: string }
  | { type: 'AI_STREAM_END'; cleanText: string; boardCommands?: BoardCommand[] }
  | { type: 'SOLUTION_STREAM_CHUNK'; delta: string }
  | { type: 'SOLUTION_STREAM_END'; fullText: string; boardCommands?: BoardCommand[] }
  | { type: 'CANVAS_CLEAR' }
  | { type: 'GRAPH_UPDATE'; op: 'add_node' | 'add_edge' | 'update_node' | 'highlight' | 'remove_node'; node?: GraphNode; edge?: GraphEdge; nodeId?: string }
  | { type: 'SCORE_UPDATE'; scores: ScoreState }
  | { type: 'NODE_EXPLANATION'; nodeId: string; text: string }
  | { type: 'CV_ANALYZED'; skills: string[]; problems: Array<{ id: string; title: string; description: string; relevantSkills: string[]; difficulty: string }> }
  | { type: 'ERROR'; message: string }
  | { type: 'PONG' }
