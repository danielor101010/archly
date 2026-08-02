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
      recentManualEdits: [],
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

  removeEdge(sessionId: string, edgeId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    delete session.graph.edges[edgeId]
    this.touch(session)
  }

  /** Record a note of a direct-on-canvas edit (capped; oldest dropped past 12). */
  recordManualEdit(sessionId: string, note: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    session.recentManualEdits.push(note)
    if (session.recentManualEdits.length > 12) session.recentManualEdits.shift()
    this.touch(session)
  }

  clearManualEdits(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) session.recentManualEdits = []
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

  /**
   * Deterministic, side-effect-free scoring rubric.
   *
   * Philosophy: a design is only as good as it is CONNECTED. The old logic
   * graded almost entirely on the count of distinct node TYPES, so dropping 8
   * unconnected components scored "A+ / Strong Hire" — a meaningless signal for
   * a paid product. The rubric below gates every graph dimension behind real
   * connectivity (edges + non-orphan nodes), rewards redundancy and resilience
   * patterns only when the relevant nodes are actually wired in, and treats raw
   * message volume as a deliberately weak signal. Top grades require breadth
   * (diverse components) AND depth (well-connected, redundant, resilient) AND
   * interaction. A near-empty design lands at D / Strong No Hire.
   *
   * NOTE: this is the deterministic interim. PRODUCTION_PLAN §3.4 calls for an
   * LLM rubric over the transcript + final graph as a separate future
   * increment; this method must stay deterministic, network-free, and pure
   * (its only side effect is assigning `session.scores`).
   */
  updateScores(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

    const nodes = Object.values(session.graph.nodes)
    const edges = Object.values(session.graph.edges)
    const nodeCount = nodes.length

    // ---- Connectivity: the master gate -------------------------------------
    // Degree per node, counting only VALID edges (both endpoints exist, no
    // self-loops). Stale edges left behind by node removal are ignored.
    const nodeIds = new Set(nodes.map((n) => n.id))
    const degree = new Map<string, number>()
    for (const n of nodes) degree.set(n.id, 0)
    let validEdges = 0
    for (const e of edges) {
      if (e.from !== e.to && nodeIds.has(e.from) && nodeIds.has(e.to)) {
        degree.set(e.from, (degree.get(e.from) ?? 0) + 1)
        degree.set(e.to, (degree.get(e.to) ?? 0) + 1)
        validEdges++
      }
    }
    const connectedNodes = nodes.filter((n) => (degree.get(n.id) ?? 0) > 0)
    const connectedCount = connectedNodes.length

    // Fraction of nodes actually wired in (orphan penalty). 0 when no nodes.
    const connectivity = nodeCount > 0 ? connectedCount / nodeCount : 0
    // Do we have enough edges to plausibly connect the graph? A connected graph
    // needs >= nodeCount-1 edges; denominator is floored at 1 to avoid div-by-0.
    const edgeDensity = Math.min(1, validEdges / Math.max(1, nodeCount - 1))
    // Combined wiring gate in [0,1]. Zero for an empty or edgeless graph, so
    // every graph dimension below collapses toward 0 without connectivity.
    const wiring = 0.6 * connectivity + 0.4 * edgeDensity
    // Depth grows with the size of the CONNECTED core; ~6 connected nodes for
    // full credit. Stops a trivial 2-3 node line from banking full wiring bonus.
    const depthScale = Math.min(1, connectedCount / 6)

    // Type presence is measured over CONNECTED nodes only: a disconnected node
    // contributes nothing. `typesConnected` therefore encodes "present AND wired".
    const typesConnected = new Set(connectedNodes.map((n) => n.type))
    const connCountOf = (t: string) =>
      connectedNodes.filter((n) => n.type === t).length

    // ---- Architecture: sensible layers, wired together, plus diversity ------
    // Three tiers, each credited only if a member is connected:
    //   entry/edge  → LB / gateway / CDN / websocket gateway
    //   compute     → api_service / k8s_cluster
    //   data        → database / cache / object_storage / search_cluster
    const entryLayer = ['load_balancer', 'api_gateway', 'cdn', 'websocket_gateway'].some((t) => typesConnected.has(t as any))
    const computeLayer = ['api_service', 'k8s_cluster'].some((t) => typesConnected.has(t as any))
    const dataLayer = ['database', 'cache', 'object_storage', 'search_cluster'].some((t) => typesConnected.has(t as any))
    const layersPresent = [entryLayer, computeLayer, dataLayer].filter(Boolean).length // 0..3
    session.scores.architecture = clamp(
      layersPresent * 15 +                       // wired layers: up to 45
        Math.min(30, typesConnected.size * 5) +  // connected component diversity: up to 30
        wiring * depthScale * 25                 // wiring quality, scaled by core size: up to 25
    )

    // ---- Scalability: horizontal-scaling components, scaled by connectivity -
    const scalabilityRaw =
      (typesConnected.has('load_balancer') ? 28 : 0) +
      (typesConnected.has('cache') ? 24 : 0) +
      (typesConnected.has('message_queue') ? 22 : 0) +
      (typesConnected.has('cdn') ? 16 : 0) +
      (typesConnected.has('k8s_cluster') ? 10 : 0) // orchestrator = elastic scaling
    session.scores.scalability = clamp(scalabilityRaw * (0.6 + 0.4 * wiring))

    // ---- Reliability: redundancy + resilience, only when connected ----------
    // Redundancy = 2+ CONNECTED instances of a stateless service or the datastore.
    // A lone LB with no edges is NOT reliability — hence typesConnected gating.
    const serviceRedundancy = connCountOf('api_service') >= 2
    const dbRedundancy = connCountOf('database') >= 2
    const reliabilityRaw =
      (serviceRedundancy ? 25 : 0) +                          // no service-tier SPOF
      (dbRedundancy ? 20 : 0) +                               // no data-tier SPOF
      (typesConnected.has('load_balancer') ? 18 : 0) +       // eliminates web-tier SPOF
      (typesConnected.has('message_queue') ? 14 : 0) +       // async decoupling absorbs spikes
      (typesConnected.has('cache') ? 12 : 0) +               // reads survive DB pressure
      (typesConnected.has('cdn') ? 11 : 0)                   // static content stays up
    session.scores.reliability = clamp(reliabilityRaw * (0.6 + 0.4 * wiring))

    // ---- Communication: deliberately WEAK deterministic signal --------------
    // Message VOLUME is a poor proxy for quality (the old `*8` was trivially
    // maxed). Cap the contribution low; real communication scoring needs the
    // LLM rubric (§3.4). Volume alone must never drive a high overall grade.
    const userMsgs = session.messages.filter((m) => m.role === 'user').length
    session.scores.communication = clamp(Math.min(50, userMsgs * 7))

    // ---- Overall: weighted blend --------------------------------------------
    // Architecture leads; scalability and reliability matter equally; the weak
    // communication signal is kept at a low weight so it cannot carry a design.
    session.scores.overall = clamp(
      session.scores.architecture * 0.35 +
        session.scores.scalability * 0.25 +
        session.scores.reliability * 0.25 +
        session.scores.communication * 0.15
    )

    // ---- Grade & verdict: recalibrated so top grades are genuinely hard -----
    // Communication caps at 50, so the practical overall ceiling is ~93; A+
    // therefore demands near-maxed architecture, scalability and reliability
    // (breadth + depth + redundancy) plus real interaction.
    const score = session.scores.overall
    session.scores.grade =
      score >= 88
        ? 'A+'
        : score >= 76
          ? 'A'
          : score >= 66
            ? 'B+'
            : score >= 54
              ? 'B'
              : score >= 40
                ? 'C'
                : 'D'

    session.scores.verdict =
      score >= 85
        ? 'Strong Hire'
        : score >= 70
          ? 'Hire'
          : score >= 54
            ? 'Lean Hire'
            : score >= 38
              ? 'No Hire'
              : 'Strong No Hire'
  }
}

export const sessionStore = new SessionStore()
