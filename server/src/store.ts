import { Session, GraphNode, GraphEdge, Message } from './types.js'
import { v4 as uuidv4 } from 'uuid'

class SessionStore {
  private sessions = new Map<string, Session>()

  create(mode: Session['mode'], problemId: string, userLevel?: string, customProblem?: { title: string; description: string }): Session {
    const session: Session = {
      id: uuidv4(),
      mode,
      problemId,
      userLevel,
      startedAt: Date.now(),
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

  addMessage(sessionId: string, msg: Omit<Message, 'id' | 'timestamp'>): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    session.messages.push({ ...msg, id: uuidv4(), timestamp: Date.now() })
  }

  addNode(sessionId: string, node: GraphNode): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    session.graph.nodes[node.id] = node
  }

  addEdge(sessionId: string, edge: GraphEdge): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    session.graph.edges[edge.id] = edge
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
  }

  updateNodeHealth(sessionId: string, nodeId: string, health: GraphNode['health']): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    if (session.graph.nodes[nodeId]) {
      session.graph.nodes[nodeId].health = health
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
