import { Session, GraphNode, GraphEdge, Message } from './types.js'
import { v4 as uuidv4 } from 'uuid'
import { config } from './config.js'
import { LIMITS } from './security/limits.js'

const SWEEP_INTERVAL_MS = 10 * 60 * 1000 // evict stale sessions every 10 minutes

class SessionStore {
  private sessions = new Map<string, Session>()

  constructor() {
    // Periodically evict sessions idle longer than the configured TTL so the
    // in-memory Map cannot grow forever (memory-leak guard).
    const timer = setInterval(() => this.sweep(), SWEEP_INTERVAL_MS)
    if (typeof timer.unref === 'function') timer.unref()
  }

  create(ownerId: string, mode: Session['mode'], problemId: string, userLevel?: string, customProblem?: { title: string; description: string }): Session {
    const now = Date.now()
    const session: Session = {
      id: uuidv4(),
      mode,
      problemId,
      userLevel,
      ownerId,
      startedAt: now,
      lastActivity: now,
      messages: [],
      graph: { nodes: {}, edges: {} },
      scores: {
        architecture: 0,
        scalability: 0,
        reliability: 0,
        communication: 0,
        overall: 0,
        grade: '-',
        verdict: 'In Progress',
      },
      customProblemTitle: customProblem?.title,
      customProblemDesc: customProblem?.description,
    }
    this.sessions.set(session.id, session)
    return session
  }

  get(id: string): Session | undefined {
    return this.sessions.get(id)
  }

  /** Fetch a session only if it is owned by `ownerId`; otherwise undefined. */
  getOwned(id: string, ownerId: string): Session | undefined {
    const session = this.sessions.get(id)
    if (!session || session.ownerId !== ownerId) return undefined
    return session
  }

  private touch(session: Session): void {
    session.lastActivity = Date.now()
  }

  addMessage(sessionId: string, msg: Omit<Message, 'id' | 'timestamp'>): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    session.messages.push({ ...msg, id: uuidv4(), timestamp: Date.now() })
    this.touch(session)
  }

  /** Adds a node unless the per-session cap is reached. Returns whether it was added. */
  addNode(sessionId: string, node: GraphNode): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    const isNew = !(node.id in session.graph.nodes)
    if (isNew && Object.keys(session.graph.nodes).length >= LIMITS.maxNodes) return false
    session.graph.nodes[node.id] = node
    this.touch(session)
    return true
  }

  /** Adds an edge unless the per-session cap is reached. Returns whether it was added. */
  addEdge(sessionId: string, edge: GraphEdge): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    const isNew = !(edge.id in session.graph.edges)
    if (isNew && Object.keys(session.graph.edges).length >= LIMITS.maxEdges) return false
    session.graph.edges[edge.id] = edge
    this.touch(session)
    return true
  }

  removeNode(sessionId: string, nodeId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    delete session.graph.nodes[nodeId]
    // Also remove all edges that reference this node
    for (const [edgeId, edge] of Object.entries(session.graph.edges)) {
      if (edge.from === nodeId || edge.to === nodeId) {
        delete session.graph.edges[edgeId]
      }
    }
    this.touch(session)
  }

  updateNodeHealth(sessionId: string, nodeId: string, health: GraphNode['health']): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    if (session.graph.nodes[nodeId]) {
      session.graph.nodes[nodeId].health = health
      this.touch(session)
    }
  }

  /** Evicts sessions whose last activity is older than the configured TTL. */
  private sweep(): void {
    const cutoff = Date.now() - config.sessionTtlMs
    for (const [id, session] of this.sessions) {
      if (session.lastActivity < cutoff) this.sessions.delete(id)
    }
  }

  updateScores(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const nodes = Object.values(session.graph.nodes)
    const nodeTypes = new Set(nodes.map((n) => n.type))

    // Architecture score: based on component diversity and structure
    const hasLB = nodeTypes.has('load_balancer')
    const hasCache = nodeTypes.has('cache')
    const hasDB = nodeTypes.has('database')
    const hasQueue = nodeTypes.has('message_queue')
    const hasGateway = nodeTypes.has('api_gateway')

    const componentScore = Math.min(100, nodeTypes.size * 12)
    const structureBonus = [hasLB, hasCache, hasDB, hasGateway].filter(Boolean).length * 8

    session.scores.architecture = Math.min(100, componentScore + structureBonus)
    session.scores.scalability = Math.min(
      100,
      (hasLB ? 30 : 0) +
        (hasCache ? 30 : 0) +
        (hasQueue ? 25 : 0) +
        componentScore * 0.2
    )
    // Reliability: based on architecture redundancy and resilience patterns
    const hasCDN = nodeTypes.has('cdn')
    const hasNotification = nodeTypes.has('notification_service')
    const hasSearch = nodeTypes.has('search_cluster')
    session.scores.reliability = Math.min(
      100,
      (hasLB ? 30 : 0) +            // LB eliminates web-tier SPOF
      (hasDB ? 20 : 0) +             // persistent storage = durable
      (hasQueue ? 20 : 0) +          // async decoupling = resilient to spikes
      (hasCache ? 15 : 0) +          // cache = DB failures don't kill reads
      (hasCDN ? 10 : 0) +            // CDN = static content stays up
      (nodes.length >= 5 ? 5 : 0)    // breadth bonus
    )
    session.scores.communication = Math.min(
      100,
      session.messages.filter((m) => m.role === 'user').length * 8
    )

    session.scores.overall = Math.round(
      session.scores.architecture * 0.3 +
        session.scores.scalability * 0.25 +
        session.scores.reliability * 0.25 +
        session.scores.communication * 0.2
    )

    const score = session.scores.overall
    session.scores.grade =
      score >= 90
        ? 'A+'
        : score >= 80
          ? 'A'
          : score >= 70
            ? 'B+'
            : score >= 60
              ? 'B'
              : score >= 50
                ? 'C'
                : 'D'

    session.scores.verdict =
      score >= 80
        ? 'Strong Hire'
        : score >= 65
          ? 'Hire'
          : score >= 50
            ? 'Lean Hire'
            : score >= 35
              ? 'No Hire'
              : 'Strong No Hire'
  }
}

export const sessionStore = new SessionStore()
