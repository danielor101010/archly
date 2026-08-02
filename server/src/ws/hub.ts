import { WebSocket, WebSocketServer } from 'ws'
import { IncomingMessage } from 'http'
import { v4 as uuidv4 } from 'uuid'
import { sessionStore } from '../store.js'
import { streamAIResponse, streamSolutionResponse, explainNode, analyzeCv } from '../ai/orchestrator.js'
import { WSClientMessage, WSServerMessage, Session } from '../types.js'
import { PROBLEM_GREETINGS, PRACTICE_GREETINGS, buildStressTestPrompt } from '../ai/prompts.js'
import { parseBoardCommands, stripBoardCommands, CanvasCommand } from '../ai/architectureParser.js'
import { verifyToken } from '../auth.js'
import { checkLlmRate, checkWsConnRate, LLM_RATE_MESSAGE } from '../security/rateLimiter.js'
import { isOverDailyBudget, recordSpend, FRIENDLY_CAPACITY_MESSAGE } from '../security/costTracker.js'
import { LIMITS } from '../security/limits.js'
import { recordLedgerUsage } from '../db.js'

interface Connection {
  ws: WebSocket
  sessionId?: string
  googleId?: string
  authenticated: boolean
}

const connections = new Map<string, Connection>()

// Sockets have this long to send their AUTH message before we drop them.
const AUTH_GRACE_MS = 5_000
// Rough fixed cost (system prompt + instructions) added to every LLM input estimate.
const SYSTEM_PROMPT_OVERHEAD_CHARS = 4_000

function send(ws: WebSocket, message: WSServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

function clientIp(req: IncomingMessage): string {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) return xff.split(',')[0].trim()
  return req.socket.remoteAddress ?? 'unknown'
}

// Strip inline canvas/board commands from streaming text — they drive canvas events.
function streamDelta(ws: WebSocket, delta: string): void {
  const stripped = delta.replace(/<canvas:[^>]*\/?>/g, '').replace(/<board:[^>]*\/?>/g, '')
  if (stripped) send(ws, { type: 'AI_STREAM_CHUNK', delta: stripped })
}

// Shared canvas-command dispatcher. Only the allowlisted command types produced by
// architectureParser are honored; unknown shapes are ignored.
function handleCanvasCommand(ws: WebSocket, session: Session, cmd: CanvasCommand): void {
  switch (cmd.type) {
    case 'add_node':
      if (cmd.node && sessionStore.addNode(session.id, cmd.node)) {
        send(ws, { type: 'GRAPH_UPDATE', op: 'add_node', node: cmd.node })
      }
      break
    case 'add_edge':
      if (cmd.edge && sessionStore.addEdge(session.id, cmd.edge)) {
        send(ws, { type: 'GRAPH_UPDATE', op: 'add_edge', edge: cmd.edge })
      }
      break
    case 'update_node':
      if (cmd.nodeId && cmd.health) {
        sessionStore.updateNodeHealth(session.id, cmd.nodeId, cmd.health)
        const node = session.graph.nodes[cmd.nodeId]
        if (node) send(ws, { type: 'GRAPH_UPDATE', op: 'update_node', nodeId: cmd.nodeId, node: { ...node, health: cmd.health } })
      }
      break
    case 'highlight':
      if (cmd.nodeId) send(ws, { type: 'GRAPH_UPDATE', op: 'highlight', nodeId: cmd.nodeId })
      break
    case 'failure':
      if (cmd.nodeId) {
        sessionStore.updateNodeHealth(session.id, cmd.nodeId, 'critical')
        const node = session.graph.nodes[cmd.nodeId]
        if (node) send(ws, { type: 'GRAPH_UPDATE', op: 'update_node', nodeId: cmd.nodeId, node: { ...node, health: 'critical' } })
      }
      break
    case 'remove_node':
      if (cmd.nodeId) {
        sessionStore.removeNode(session.id, cmd.nodeId)
        send(ws, { type: 'GRAPH_UPDATE', op: 'remove_node', nodeId: cmd.nodeId })
      }
      break
  }
}

function estimateInputChars(session: Session, extra = 0): number {
  let total = SYSTEM_PROMPT_OVERHEAD_CHARS + extra
  for (const m of session.messages) total += m.content.length
  return total
}

// Record an LLM call against the daily cost estimate and (best-effort) the DB ledger.
function accountUsage(ownerId: string, inputChars: number, outputChars: number): void {
  const { costUsd, tokensIn, tokensOut } = recordSpend(inputChars, outputChars)
  void recordLedgerUsage(ownerId, { tokensIn, tokensOut, costCents: Math.round(costUsd * 100) })
}

export function createWSHub(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    // Per-IP coarse limit on new connections — reject floods before auth.
    const ip = clientIp(req)
    if (!checkWsConnRate(ip).allowed) {
      send(ws, { type: 'AUTH_ERROR', message: 'Too many connections. Please slow down.' })
      ws.close()
      return
    }

    const connId = uuidv4()
    const conn: Connection = { ws, authenticated: false }
    connections.set(connId, conn)

    // Drop sockets that never authenticate within the grace window.
    let authTimer: NodeJS.Timeout | null = setTimeout(() => {
      if (!conn.authenticated) {
        send(ws, { type: 'AUTH_ERROR', message: 'Authentication timeout' })
        ws.close()
      }
    }, AUTH_GRACE_MS)

    // Heartbeat — keep the connection alive and detect stale sockets.
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping()
      } else {
        clearInterval(heartbeat)
      }
    }, 30_000)

    const clearAuthTimer = () => {
      if (authTimer) {
        clearTimeout(authTimer)
        authTimer = null
      }
    }

    ws.on('message', async (data) => {
      let msg: WSClientMessage
      try {
        msg = JSON.parse(data.toString()) as WSClientMessage
      } catch {
        send(ws, { type: 'ERROR', message: 'Invalid JSON' })
        return
      }

      // ── Handshake: the first message must authenticate the connection ──────────
      if (msg.type === 'AUTH') {
        const payload = typeof msg.token === 'string' ? verifyToken(msg.token) : null
        if (!payload) {
          send(ws, { type: 'AUTH_ERROR', message: 'Invalid or expired token' })
          ws.close()
          return
        }
        conn.googleId = payload.googleId
        conn.authenticated = true
        clearAuthTimer()
        send(ws, { type: 'AUTH_OK' })
        return
      }

      // Every other message type is rejected until the connection is authenticated.
      if (!conn.authenticated || !conn.googleId) {
        send(ws, { type: 'ERROR', message: 'Not authenticated' })
        return
      }
      const googleId = conn.googleId

      switch (msg.type) {
        case 'PING': {
          send(ws, { type: 'PONG' })
          break
        }

        case 'CREATE_SESSION': {
          if (msg.customProblem) {
            if ((msg.customProblem.title?.length ?? 0) > LIMITS.customTitle) {
              send(ws, { type: 'ERROR', message: `Title too long (max ${LIMITS.customTitle} chars)` })
              return
            }
            if ((msg.customProblem.description?.length ?? 0) > LIMITS.customDescription) {
              send(ws, { type: 'ERROR', message: `Description too long (max ${LIMITS.customDescription} chars)` })
              return
            }
          }

          const session = sessionStore.create(googleId, msg.mode, msg.problemId, msg.userLevel, msg.customProblem)
          conn.sessionId = session.id
          void recordLedgerUsage(googleId, { sessionsStarted: 1 })

          let greeting: string
          if (msg.mode === 'concept') {
            const topicName = msg.customProblem?.title?.replace('Deep Dive: ', '') ?? msg.problemId
            greeting = `Let's dive into ${topicName}. What do you already know about this topic — and what's fuzzy or unclear for you?`
          } else if (msg.mode === 'cv-interview') {
            greeting = msg.customProblem?.description
              ? `I've reviewed your background. You have experience with: ${msg.customProblem.description.slice(0, 100)}... Let's begin. Walk me through the most technically complex project you've shipped.`
              : "Let's conduct your personalized interview. Start by describing your most recent technical role and the main systems you worked on."
          } else if (msg.mode === 'coding') {
            greeting = "Welcome to your coding interview. What's your preferred programming language? Once you tell me, I'll give you a problem to work through."
          } else if (msg.customProblem) {
            greeting = msg.mode === 'interview'
              ? `Let's dive into: ${msg.customProblem.title}. ${msg.customProblem.description} Start with your requirements — what does this system need to do?`
              : `Let's design: ${msg.customProblem.title}. ${msg.customProblem.description}\n\nStart by listing the core functional requirements.`
          } else {
            const greetings = msg.mode === 'interview' ? PROBLEM_GREETINGS : PRACTICE_GREETINGS
            greeting = greetings[msg.problemId] ?? `Let's design ${msg.problemId}. Walk me through your approach.`
          }

          // Persist greeting as first assistant message
          sessionStore.addMessage(session.id, { role: 'assistant', content: greeting })

          send(ws, { type: 'SESSION_CREATED', sessionId: session.id, greeting, problemId: msg.problemId })
          break
        }

        case 'USER_MESSAGE': {
          const session = sessionStore.getOwned(msg.sessionId, googleId)
          if (!session) {
            send(ws, { type: 'ERROR', message: 'Session not found' })
            return
          }
          if ((msg.content?.length ?? 0) > LIMITS.userMessage) {
            send(ws, { type: 'ERROR', message: `Message too long (max ${LIMITS.userMessage} chars)` })
            return
          }
          const rl = checkLlmRate(googleId)
          if (!rl.allowed) {
            send(ws, { type: 'ERROR', message: LLM_RATE_MESSAGE })
            send(ws, { type: 'AI_STREAM_END', cleanText: '' })
            return
          }
          if (isOverDailyBudget()) {
            send(ws, { type: 'ERROR', message: FRIENDLY_CAPACITY_MESSAGE })
            send(ws, { type: 'AI_STREAM_END', cleanText: '' })
            return
          }

          // Persist user message before streaming
          sessionStore.addMessage(session.id, { role: 'user', content: msg.content })

          await streamAIResponse(session, msg.content, {
            onTextDelta: (delta) => streamDelta(ws, delta),
            onCanvasCommand: (cmd) => handleCanvasCommand(ws, session, cmd),
            onComplete: (fullText) => {
              const boardCommands = parseBoardCommands(fullText)
              const cleanText = stripBoardCommands(
                fullText.replace(/<canvas:[^>]+\/>/g, '')
              ).replace(/\n{3,}/g, '\n\n').trim()
              sessionStore.addMessage(session.id, { role: 'assistant', content: cleanText })
              sessionStore.updateScores(session.id)
              accountUsage(googleId, estimateInputChars(session), fullText.length)

              const updated = sessionStore.get(session.id)
              if (updated) {
                send(ws, { type: 'AI_STREAM_END', cleanText, boardCommands })
                send(ws, { type: 'SCORE_UPDATE', scores: updated.scores })
              }
            },
            onError: (err) => {
              console.error('[WS] AI streaming error:', err)
              send(ws, { type: 'ERROR', message: `AI error: ${err.message}` })
              send(ws, { type: 'AI_STREAM_END', cleanText: '' })
            },
          })
          // Manual canvas edits have now been shown to the AI this turn — reset.
          sessionStore.clearManualEdits(session.id)
          break
        }

        case 'REQUEST_HINT': {
          const session = sessionStore.getOwned(msg.sessionId, googleId)
          if (!session) {
            send(ws, { type: 'ERROR', message: 'Session not found' })
            return
          }
          const rl = checkLlmRate(googleId)
          if (!rl.allowed) {
            send(ws, { type: 'ERROR', message: LLM_RATE_MESSAGE })
            send(ws, { type: 'AI_STREAM_END', cleanText: '' })
            return
          }
          if (isOverDailyBudget()) {
            send(ws, { type: 'ERROR', message: FRIENDLY_CAPACITY_MESSAGE })
            send(ws, { type: 'AI_STREAM_END', cleanText: '' })
            return
          }

          sessionStore.addMessage(session.id, { role: 'user', content: '[HINT_REQUEST]' })

          await streamAIResponse(session, '[HINT_REQUEST]', {
            onTextDelta: (delta) => streamDelta(ws, delta),
            onCanvasCommand: (cmd) => handleCanvasCommand(ws, session, cmd),
            onComplete: (fullText) => {
              const boardCommands = parseBoardCommands(fullText)
              const cleanText = stripBoardCommands(
                fullText.replace(/<canvas:[^>]+\/>/g, '')
              ).replace(/\n{3,}/g, '\n\n').trim()
              sessionStore.addMessage(session.id, { role: 'assistant', content: cleanText })
              sessionStore.updateScores(session.id)
              accountUsage(googleId, estimateInputChars(session), fullText.length)

              const updated = sessionStore.get(session.id)
              if (updated) {
                send(ws, { type: 'AI_STREAM_END', cleanText, boardCommands })
                send(ws, { type: 'SCORE_UPDATE', scores: updated.scores })
              }
            },
            onError: (err) => {
              console.error('[WS] AI streaming error:', err)
              send(ws, { type: 'ERROR', message: `AI error: ${err.message}` })
              send(ws, { type: 'AI_STREAM_END', cleanText: '' })
            },
          })
          break
        }

        case 'STRESS_TEST': {
          const session = sessionStore.getOwned(msg.sessionId, googleId)
          if (!session) {
            send(ws, { type: 'ERROR', message: 'Session not found' })
            return
          }
          const rl = checkLlmRate(googleId)
          if (!rl.allowed) {
            send(ws, { type: 'ERROR', message: LLM_RATE_MESSAGE })
            send(ws, { type: 'AI_STREAM_END', cleanText: '' })
            return
          }
          if (isOverDailyBudget()) {
            send(ws, { type: 'ERROR', message: FRIENDLY_CAPACITY_MESSAGE })
            send(ws, { type: 'AI_STREAM_END', cleanText: '' })
            return
          }

          const nodes = Object.values(session.graph.nodes)
          const edges = Object.values(session.graph.edges)
          const stressPrompt = buildStressTestPrompt(msg.testType, nodes, edges)

          sessionStore.addMessage(session.id, { role: 'user', content: `[STRESS_TEST:${msg.testType}]` })

          await streamAIResponse(session, stressPrompt, {
            onTextDelta: (delta) => streamDelta(ws, delta),
            onCanvasCommand: (cmd) => handleCanvasCommand(ws, session, cmd),
            onComplete: (fullText) => {
              const cleanText = stripBoardCommands(
                fullText.replace(/<canvas:[^>]+\/>/g, '')
              ).replace(/\n{3,}/g, '\n\n').trim()
              sessionStore.addMessage(session.id, { role: 'assistant', content: cleanText })
              accountUsage(googleId, estimateInputChars(session, stressPrompt.length), fullText.length)
              const updated = sessionStore.get(session.id)
              if (updated) {
                send(ws, { type: 'AI_STREAM_END', cleanText })
                send(ws, { type: 'SCORE_UPDATE', scores: updated.scores })
              }
            },
            onError: (err) => {
              console.error('[WS] Stress test error:', err)
              send(ws, { type: 'ERROR', message: `Stress test error: ${err.message}` })
              send(ws, { type: 'AI_STREAM_END', cleanText: '' })
            },
          })
          break
        }

        case 'REQUEST_SOLUTION': {
          const session = sessionStore.getOwned(msg.sessionId, googleId)
          if (!session) {
            send(ws, { type: 'ERROR', message: 'Session not found' })
            return
          }
          const rl = checkLlmRate(googleId)
          if (!rl.allowed) {
            send(ws, { type: 'ERROR', message: LLM_RATE_MESSAGE })
            send(ws, { type: 'SOLUTION_STREAM_END', fullText: '' })
            return
          }
          if (isOverDailyBudget()) {
            send(ws, { type: 'ERROR', message: FRIENDLY_CAPACITY_MESSAGE })
            send(ws, { type: 'SOLUTION_STREAM_END', fullText: '' })
            return
          }

          // Clear existing canvas so solution draws clean
          send(ws, { type: 'CANVAS_CLEAR' })

          await streamSolutionResponse(session.problemId, {
            onTextDelta: (delta) => {
              send(ws, { type: 'SOLUTION_STREAM_CHUNK', delta })
            },
            onCanvasCommand: (cmd) => handleCanvasCommand(ws, session, cmd),
            onComplete: (fullText) => {
              const boardCommands = parseBoardCommands(fullText)
              const cleanText = stripBoardCommands(
                fullText.replace(/<canvas:[^>]+\/>/g, '')
              ).replace(/\n{3,}/g, '\n\n').trim()
              // Add solution to session history so the AI can answer follow-up questions about it
              sessionStore.addMessage(session.id, { role: 'assistant', content: `[REFERENCE SOLUTION]\n${cleanText}` })
              accountUsage(googleId, estimateInputChars(session), fullText.length)
              send(ws, { type: 'SOLUTION_STREAM_END', fullText: cleanText, boardCommands })
            },
            onError: (err) => {
              console.error('[WS] Solution error:', err)
              send(ws, { type: 'ERROR', message: `Solution error: ${err.message}` })
              send(ws, { type: 'SOLUTION_STREAM_END', fullText: '' })
            },
          }, session.customProblemTitle, session.customProblemDesc)
          break
        }

        case 'ANALYZE_CV': {
          if ((msg.cvText?.length ?? 0) > LIMITS.cvText) {
            send(ws, { type: 'ERROR', message: `CV text too long (max ${LIMITS.cvText} chars)` })
            return
          }
          if (isOverDailyBudget()) {
            send(ws, { type: 'ERROR', message: FRIENDLY_CAPACITY_MESSAGE })
            return
          }
          try {
            const result = await analyzeCv(msg.cvText, msg.userLevel)
            accountUsage(googleId, (msg.cvText?.length ?? 0) + SYSTEM_PROMPT_OVERHEAD_CHARS, JSON.stringify(result).length)
            send(ws, { type: 'CV_ANALYZED', skills: result.skills, problems: result.problems })
          } catch (err) {
            console.error('[WS] CV analysis error:', err)
            send(ws, { type: 'ERROR', message: 'CV analysis failed' })
          }
          break
        }

        case 'NODE_EXPLAIN': {
          const session = sessionStore.getOwned(msg.sessionId, googleId)
          if (!session) {
            send(ws, { type: 'ERROR', message: 'Session not found' })
            return
          }
          if ((msg.nodeLabel?.length ?? 0) > LIMITS.nodeLabel || (msg.nodeType?.length ?? 0) > LIMITS.nodeType || (msg.nodeId?.length ?? 0) > LIMITS.nodeId) {
            send(ws, { type: 'ERROR', message: 'Node fields too long' })
            return
          }
          if (isOverDailyBudget()) {
            send(ws, { type: 'ERROR', message: FRIENDLY_CAPACITY_MESSAGE })
            return
          }
          try {
            const text = await explainNode(session, msg.nodeId, msg.nodeType, msg.nodeLabel)
            accountUsage(googleId, estimateInputChars(session), text.length)
            send(ws, { type: 'NODE_EXPLANATION', nodeId: msg.nodeId, text })
          } catch (err) {
            console.error('[WS] Node explain error:', err)
          }
          break
        }

        case 'CANVAS_EDIT': {
          // The user edited the canvas directly (not via chat). Mirror the change
          // into the server's graph and record a note so the AI can react next turn.
          const session = sessionStore.getOwned(msg.sessionId, googleId)
          if (!session) { send(ws, { type: 'ERROR', message: 'Session not found' }); break }
          switch (msg.action) {
            case 'add_node':
              if (msg.node && (msg.node.label?.length ?? 0) <= LIMITS.nodeLabel) {
                sessionStore.addNode(session.id, { id: msg.node.id, type: msg.node.type, label: msg.node.label, health: 'healthy', metrics: {} })
                sessionStore.recordManualEdit(session.id, `added ${msg.node.type} "${msg.node.label}"`)
              }
              break
            case 'add_edge':
              if (msg.edge) {
                sessionStore.addEdge(session.id, { id: msg.edge.id, from: msg.edge.from, to: msg.edge.to, type: 'sync' })
                const from = session.graph.nodes[msg.edge.from]?.label ?? msg.edge.from
                const to = session.graph.nodes[msg.edge.to]?.label ?? msg.edge.to
                sessionStore.recordManualEdit(session.id, `connected ${from} → ${to}`)
              }
              break
            case 'remove_node':
              if (msg.nodeId) {
                const label = session.graph.nodes[msg.nodeId]?.label ?? msg.nodeId
                sessionStore.removeNode(session.id, msg.nodeId)
                sessionStore.recordManualEdit(session.id, `removed ${label}`)
              }
              break
            case 'remove_edge':
              if (msg.edgeId) {
                sessionStore.removeEdge(session.id, msg.edgeId)
                sessionStore.recordManualEdit(session.id, 'removed a connection')
              }
              break
          }
          break
        }

        default: {
          send(ws, { type: 'ERROR', message: 'Unknown message type' })
          break
        }
      }
    })

    ws.on('close', () => {
      clearInterval(heartbeat)
      clearAuthTimer()
      connections.delete(connId)
    })

    ws.on('error', (err) => {
      console.error('[WS] Socket error:', err)
      clearInterval(heartbeat)
      clearAuthTimer()
      connections.delete(connId)
    })
  })
}
