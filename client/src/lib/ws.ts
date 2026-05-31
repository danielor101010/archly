import { WS_URL } from './api'
import { useChatStore } from '../stores/chatStore'
import { useGraphStore } from '../stores/graphStore'
import { useScoreStore } from '../stores/scoreStore'
import { useSessionStore } from '../stores/sessionStore'
import { useBoardStore } from '../stores/boardStore'
import { useUserStore } from '../stores/userStore'

type WSMessage = { type: string; [key: string]: unknown }

class WSClient {
  private ws: WebSocket | null = null
  private reconnectDelay = 1000
  private maxReconnectDelay = 30000
  private pingInterval: ReturnType<typeof setInterval> | null = null
  private queue: string[] = []  // buffer messages until socket is open
  private streamBuf = ''        // buffer for stripping split canvas/board commands

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.ws = new WebSocket(WS_URL)

    this.ws.onopen = () => {
      console.log('[WS] Connected')
      this.reconnectDelay = 1000
      this.startPing()
      // flush queued messages
      this.queue.forEach(msg => this.ws!.send(msg))
      this.queue = []
    }

    this.ws.onmessage = (event) => {
      let msg: WSMessage
      try { msg = JSON.parse(event.data as string) } catch { return }
      this.dispatch(msg)
    }

    this.ws.onclose = () => {
      console.log('[WS] Disconnected, reconnecting in', this.reconnectDelay, 'ms')
      this.stopPing()
      setTimeout(() => {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay)
        this.connect()
      }, this.reconnectDelay)
    }

    this.ws.onerror = (err) => console.error('[WS] Error:', err)
  }

  private dispatch(msg: WSMessage) {
    const chatStore = useChatStore.getState()
    const graphStore = useGraphStore.getState()
    const scoreStore = useScoreStore.getState()
    const sessionStore = useSessionStore.getState()
    const boardStore = useBoardStore.getState()

    switch (msg.type) {
      case 'SESSION_CREATED':
        sessionStore.setSessionId(msg.sessionId as string)
        chatStore.addMessage({ role: 'assistant', content: msg.greeting as string })
        useUserStore.getState().recordSession(msg.problemId as string)
        useBoardStore.getState().clearBoard()
        graphStore.clearGraph()
        break
      case 'AI_STREAM_CHUNK': {
        // Ensure streaming state is active so the typing indicator shows immediately
        if (!chatStore.isStreaming) chatStore.startStreaming()
        this.streamBuf += msg.delta as string
        // Strip complete canvas/board commands from buffer
        let processed = this.streamBuf
          .replace(/<canvas:[^>]+\/>/g, '')
          .replace(/<board:[^>]+\/>/g, '')
        // If an incomplete tag remains at the end, hold it in the buffer
        const partial = processed.match(/<(?:canvas|board):[^>]*$/)
        if (partial && partial.index !== undefined) {
          const safe = processed.slice(0, partial.index)
          this.streamBuf = processed.slice(partial.index)
          if (safe) chatStore.appendToStream(safe)
        } else {
          this.streamBuf = ''
          if (processed) chatStore.appendToStream(processed)
        }
        break
      }
      case 'AI_STREAM_END': {
        // Flush any buffered partial tag (discard it — it was a canvas command)
        this.streamBuf = ''
        chatStore.finalizeStream(msg.cleanText as string | undefined)
        const turnNum = chatStore.messages.length + 1
        graphStore.saveSnapshot(`Turn ${Math.ceil(turnNum / 2)}`)
        graphStore.setStressTesting(false)
        useUserStore.getState().addTokens(Math.ceil((msg.cleanText as string ?? '').length / 4))
        // Process board commands
        const boardCmds = (msg.boardCommands as Array<Record<string, string>> | undefined) ?? []
        for (const cmd of boardCmds) {
          if (cmd.type === 'req') boardStore.addRequirement({ id: cmd.id, type: cmd.reqType as 'FR' | 'NFR', text: cmd.text ?? '' })
          if (cmd.type === 'api') boardStore.addEndpoint({ id: cmd.id, method: cmd.method ?? '', path: cmd.path ?? '', desc: cmd.desc ?? '' })
          if (cmd.type === 'model') boardStore.addModel({ id: cmd.id, name: cmd.name ?? '', fields: cmd.fields ?? '' })
        }
        break
      }
      case 'CANVAS_CLEAR':
        graphStore.clearGraph()
        break
      case 'SOLUTION_STREAM_CHUNK': {
        const delta = msg.delta as string
        const clean = delta.replace(/<canvas:[^>]+\/>/g, '').replace(/<board:[^>]+\/>/g, '')
        chatStore.appendToSolution(clean)
        break
      }
      case 'SOLUTION_STREAM_END': {
        chatStore.finalizeSolution(msg.fullText as string)
        chatStore.addMessage({ role: 'assistant', content: 'Reference solution loaded. Ask me anything about the architecture, design decisions, or tradeoffs — I now have the full solution in context.' })
        // Process board commands from solution
        const solBoardCmds = (msg.boardCommands as Array<Record<string, string>> | undefined) ?? []
        for (const cmd of solBoardCmds) {
          if (cmd.type === 'req') boardStore.addRequirement({ id: cmd.id, type: cmd.reqType as 'FR' | 'NFR', text: cmd.text ?? '' })
          if (cmd.type === 'api') boardStore.addEndpoint({ id: cmd.id, method: cmd.method ?? '', path: cmd.path ?? '', desc: cmd.desc ?? '' })
          if (cmd.type === 'model') boardStore.addModel({ id: cmd.id, name: cmd.name ?? '', fields: cmd.fields ?? '' })
        }
        // Fit canvas view after solution nodes are rendered
        setTimeout(() => useGraphStore.getState().triggerFitView(), 300)
        break
      }
      case 'GRAPH_UPDATE':
        if (msg.op === 'add_node' && msg.node) {
          const n = msg.node as { id: string; type: string; label: string; health?: string; parentId?: string; position?: { x: number; y: number } }
          graphStore.addNode(n as never)
        }
        if (msg.op === 'add_edge' && msg.edge) graphStore.addEdge(msg.edge as never)
        if (msg.op === 'update_node' && msg.nodeId && msg.node) graphStore.updateNodeHealth(msg.nodeId as string, (msg.node as { health: string }).health as never)
        if (msg.op === 'highlight' && msg.nodeId) graphStore.highlightNode(msg.nodeId as string)
        if (msg.op === 'remove_node' && msg.nodeId) graphStore.removeNodeById(msg.nodeId as string)
        break
      case 'NODE_EXPLANATION':
        graphStore.setNodeExplanation(msg.text as string)
        break
      case 'SCORE_UPDATE':
        scoreStore.setScores(msg.scores as never)
        // Record session history when we get final scores
        if (sessionStore.sessionId) {
          const scores = msg.scores as import('../stores/scoreStore').ScoreState['scores']
          // Only record if we have a meaningful session (overall > 0)
          if (scores.overall > 0) {
            const problemId = sessionStore.problemId ?? 'unknown'
            useUserStore.getState().addSessionRecord({
              id: crypto.randomUUID(),
              problemId,
              problemTitle: problemId,
              mode: sessionStore.mode ?? 'practice',
              date: Date.now(),
              scores,
            })
          }
        }
        break
      case 'CV_ANALYZED': {
        const skills = msg.skills as string[]
        const problems = msg.problems as import('../stores/userStore').CvProblem[]
        useUserStore.getState().setCvAnalysis(skills, problems)
        break
      }
      case 'ERROR':
        console.error('[WS] Server error:', msg.message)
        chatStore.finalizeStream()
        chatStore.addMessage({ role: 'assistant', content: `⚠️ Error: ${msg.message as string}` })
        // If session not found, clear the stored session so user can start fresh
        if ((msg.message as string)?.includes('Session not found')) {
          useSessionStore.getState().clearSession()
        }
        break
    }
  }

  send(type: string, payload?: Record<string, unknown>) {
    const msg = JSON.stringify({ type, ...payload })
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(msg)
    } else {
      this.queue.push(msg)  // buffer until connected
    }
  }

  private startPing() {
    this.pingInterval = setInterval(() => this.send('PING'), 25000)
  }

  private stopPing() {
    if (this.pingInterval) clearInterval(this.pingInterval)
  }
}

export const wsClient = new WSClient()
export const sendWS = (type: string, payload?: Record<string, unknown>) => wsClient.send(type, payload)
