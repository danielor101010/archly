import { WebSocket, WebSocketServer } from 'ws'
import { IncomingMessage } from 'http'
import { v4 as uuidv4 } from 'uuid'
import { sessionStore } from '../store.js'
import { streamAIResponse, streamSolutionResponse, explainNode, analyzeCv } from '../ai/orchestrator.js'
import { WSClientMessage, WSServerMessage } from '../types.js'
import { PROBLEM_GREETINGS, PRACTICE_GREETINGS, buildStressTestPrompt } from '../ai/prompts.js'
import { parseBoardCommands, stripBoardCommands } from '../ai/architectureParser.js'

interface Connection {
  ws: WebSocket
  sessionId?: string
}

const connections = new Map<string, Connection>()

function send(ws: WebSocket, message: WSServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

export function createWSHub(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
    const connId = uuidv4()
    connections.set(connId, { ws })

    // Heartbeat â€” keep the connection alive and detect stale sockets
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping()
      } else {
        clearInterval(heartbeat)
      }
    }, 30_000)

    ws.on('message', async (data) => {
      let msg: WSClientMessage
      try {
        msg = JSON.parse(data.toString()) as WSClientMessage
      } catch {
        send(ws, { type: 'ERROR', message: 'Invalid JSON' })
        return
      }

      const conn = connections.get(connId)
      if (!conn) return

      switch (msg.type) {
        case 'PING': {
          send(ws, { type: 'PONG' })
          break
        }

        case 'CREATE_SESSION': {
          const session = sessionStore.create(msg.mode, msg.problemId, msg.userLevel, msg.customProblem)
          conn.sessionId = session.id

          let greeting: string
          if (msg.mode === 'concept') {
            const topicName = msg.customProblem?.title?.replace('Deep Dive: ', '') ?? msg.problemId
            greeting = `Let's dive into ${topicName}. What do you already know about this topic â€” and what's fuzzy or unclear for you?`
          } else if (msg.mode === 'cv-interview') {
            greeting = msg.customProblem?.description
              ? `I've reviewed your background. You have experience with: ${msg.customProblem.description.slice(0, 100)}... Let's begin. Walk me through the most technically complex project you've shipped.`
              : "Let's conduct your personalized interview. Start by describing your most recent technical role and the main systems you worked on."
          } else if (msg.mode === 'coding') {
            greeting = "Welcome to your coding interview. What's your preferred programming language? Once you tell me, I'll give you a problem to work through."
          } else if (msg.customProblem) {
            greeting = msg.mode === 'interview'
              ? `Let's dive into: ${msg.customProblem.title}. ${msg.customProblem.description} Start with your requirements â€” what does this system need to do?`
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
          const session = sessionStore.get(msg.sessionId)
          if (!session) {
            send(ws, { type: 'ERROR', message: 'Session not found' })
            return
          }

          // Persist user message before streaming
          sessionStore.addMessage(session.id, { role: 'user', content: msg.content })

          await streamAIResponse(session, msg.content, {
            onTextDelta: (delta) => {
              // Strip canvas/board commands from streaming text — they are handled by canvas events
              const stripped = delta.replace(/<canvas:[^>]*\/?>/g, '').replace(/<board:[^>]*\/?>/g, '')
              if (stripped) send(ws, { type: 'AI_STREAM_CHUNK', delta: stripped })
            },

            onCanvasCommand: (cmd) => {
              switch (cmd.type) {
                case 'add_node': {
                  if (cmd.node) {
                    sessionStore.addNode(session.id, cmd.node)
                    send(ws, { type: 'GRAPH_UPDATE', op: 'add_node', node: cmd.node })
                  }
                  break
                }
                case 'add_edge': {
                  if (cmd.edge) {
                    sessionStore.addEdge(session.id, cmd.edge)
                    send(ws, { type: 'GRAPH_UPDATE', op: 'add_edge', edge: cmd.edge })
                  }
                  break
                }
                case 'update_node': {
                  if (cmd.nodeId && cmd.health) {
                    sessionStore.updateNodeHealth(session.id, cmd.nodeId, cmd.health)
                    const existingNode = session.graph.nodes[cmd.nodeId]
                    if (existingNode) {
                      send(ws, {
                        type: 'GRAPH_UPDATE',
                        op: 'update_node',
                        nodeId: cmd.nodeId,
                        node: { ...existingNode, health: cmd.health },
                      })
                    }
                  }
                  break
                }
                case 'highlight': {
                  if (cmd.nodeId) {
                    send(ws, { type: 'GRAPH_UPDATE', op: 'highlight', nodeId: cmd.nodeId })
                  }
                  break
                }
                case 'failure': {
                  // Treat failure as a critical health update
                  if (cmd.nodeId) {
                    sessionStore.updateNodeHealth(session.id, cmd.nodeId, 'critical')
                    const existingNode = session.graph.nodes[cmd.nodeId]
                    if (existingNode) {
                      send(ws, {
                        type: 'GRAPH_UPDATE',
                        op: 'update_node',
                        nodeId: cmd.nodeId,
                        node: { ...existingNode, health: 'critical' },
                      })
                    }
                  }
                  break
                }
                case 'remove_node': {
                  if (cmd.nodeId) {
                    sessionStore.removeNode(session.id, cmd.nodeId)
                    send(ws, { type: 'GRAPH_UPDATE', op: 'remove_node', nodeId: cmd.nodeId })
                  }
                  break
                }
              }
            },

            onComplete: (fullText) => {
              const boardCommands = parseBoardCommands(fullText)
              const cleanText = stripBoardCommands(
                fullText.replace(/<canvas:[^>]+\/>/g, '')
              ).replace(/\n{3,}/g, '\n\n').trim()
              sessionStore.addMessage(session.id, { role: 'assistant', content: cleanText })
              sessionStore.updateScores(session.id)

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

        case 'REQUEST_HINT': {
          const session = sessionStore.get(msg.sessionId)
          if (!session) {
            send(ws, { type: 'ERROR', message: 'Session not found' })
            return
          }

          sessionStore.addMessage(session.id, { role: 'user', content: '[HINT_REQUEST]' })

          await streamAIResponse(session, '[HINT_REQUEST]', {
            onTextDelta: (delta) => {
              // Strip canvas/board commands from streaming text — they are handled by canvas events
              const stripped = delta.replace(/<canvas:[^>]*\/?>/g, '').replace(/<board:[^>]*\/?>/g, '')
              if (stripped) send(ws, { type: 'AI_STREAM_CHUNK', delta: stripped })
            },

            onCanvasCommand: (cmd) => {
              switch (cmd.type) {
                case 'add_node': {
                  if (cmd.node) {
                    sessionStore.addNode(session.id, cmd.node)
                    send(ws, { type: 'GRAPH_UPDATE', op: 'add_node', node: cmd.node })
                  }
                  break
                }
                case 'add_edge': {
                  if (cmd.edge) {
                    sessionStore.addEdge(session.id, cmd.edge)
                    send(ws, { type: 'GRAPH_UPDATE', op: 'add_edge', edge: cmd.edge })
                  }
                  break
                }
                case 'update_node': {
                  if (cmd.nodeId && cmd.health) {
                    sessionStore.updateNodeHealth(session.id, cmd.nodeId, cmd.health)
                    const existingNode = session.graph.nodes[cmd.nodeId]
                    if (existingNode) {
                      send(ws, {
                        type: 'GRAPH_UPDATE',
                        op: 'update_node',
                        nodeId: cmd.nodeId,
                        node: { ...existingNode, health: cmd.health },
                      })
                    }
                  }
                  break
                }
                case 'highlight': {
                  if (cmd.nodeId) {
                    send(ws, { type: 'GRAPH_UPDATE', op: 'highlight', nodeId: cmd.nodeId })
                  }
                  break
                }
                case 'failure': {
                  if (cmd.nodeId) {
                    sessionStore.updateNodeHealth(session.id, cmd.nodeId, 'critical')
                    const existingNode = session.graph.nodes[cmd.nodeId]
                    if (existingNode) {
                      send(ws, {
                        type: 'GRAPH_UPDATE',
                        op: 'update_node',
                        nodeId: cmd.nodeId,
                        node: { ...existingNode, health: 'critical' },
                      })
                    }
                  }
                  break
                }
              }
            },

            onComplete: (fullText) => {
              const boardCommands = parseBoardCommands(fullText)
              const cleanText = stripBoardCommands(
                fullText.replace(/<canvas:[^>]+\/>/g, '')
              ).replace(/\n{3,}/g, '\n\n').trim()
              sessionStore.addMessage(session.id, { role: 'assistant', content: cleanText })
              sessionStore.updateScores(session.id)

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
          const session = sessionStore.get(msg.sessionId)
          if (!session) {
            send(ws, { type: 'ERROR', message: 'Session not found' })
            return
          }

          const nodes = Object.values(session.graph.nodes)
          const edges = Object.values(session.graph.edges)
          const stressPrompt = buildStressTestPrompt(msg.testType, nodes, edges)

          sessionStore.addMessage(session.id, { role: 'user', content: `[STRESS_TEST:${msg.testType}]` })

          await streamAIResponse(session, stressPrompt, {
            onTextDelta: (delta) => {
              // Strip canvas/board commands from streaming text — they are handled by canvas events
              const stripped = delta.replace(/<canvas:[^>]*\/?>/g, '').replace(/<board:[^>]*\/?>/g, '')
              if (stripped) send(ws, { type: 'AI_STREAM_CHUNK', delta: stripped })
            },
            onCanvasCommand: (cmd) => {
              switch (cmd.type) {
                case 'add_node': {
                  if (cmd.node) {
                    sessionStore.addNode(session.id, cmd.node)
                    send(ws, { type: 'GRAPH_UPDATE', op: 'add_node', node: cmd.node })
                  }
                  break
                }
                case 'add_edge': {
                  if (cmd.edge) {
                    sessionStore.addEdge(session.id, cmd.edge)
                    send(ws, { type: 'GRAPH_UPDATE', op: 'add_edge', edge: cmd.edge })
                  }
                  break
                }
                case 'update_node': {
                  if (cmd.nodeId && cmd.health) {
                    sessionStore.updateNodeHealth(session.id, cmd.nodeId, cmd.health)
                    const existingNode = session.graph.nodes[cmd.nodeId]
                    if (existingNode) {
                      send(ws, { type: 'GRAPH_UPDATE', op: 'update_node', nodeId: cmd.nodeId, node: { ...existingNode, health: cmd.health } })
                    }
                  }
                  break
                }
                default: break
              }
            },
            onComplete: (fullText) => {
              const cleanText = stripBoardCommands(
                fullText.replace(/<canvas:[^>]+\/>/g, '')
              ).replace(/\n{3,}/g, '\n\n').trim()
              sessionStore.addMessage(session.id, { role: 'assistant', content: cleanText })
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
          const session = sessionStore.get(msg.sessionId)
          if (!session) {
            send(ws, { type: 'ERROR', message: 'Session not found' })
            return
          }

          // Clear existing canvas so solution draws clean
          send(ws, { type: 'CANVAS_CLEAR' })

          await streamSolutionResponse(session.problemId, {
            onTextDelta: (delta) => {
              send(ws, { type: 'SOLUTION_STREAM_CHUNK', delta })
            },
            onCanvasCommand: (cmd) => {
              switch (cmd.type) {
                case 'add_node': {
                  if (cmd.node) {
                    sessionStore.addNode(session.id, cmd.node)
                    send(ws, { type: 'GRAPH_UPDATE', op: 'add_node', node: cmd.node })
                  }
                  break
                }
                case 'add_edge': {
                  if (cmd.edge) {
                    sessionStore.addEdge(session.id, cmd.edge)
                    send(ws, { type: 'GRAPH_UPDATE', op: 'add_edge', edge: cmd.edge })
                  }
                  break
                }
                case 'update_node': {
                  if (cmd.nodeId && cmd.health) {
                    sessionStore.updateNodeHealth(session.id, cmd.nodeId, cmd.health)
                    const node = session.graph.nodes[cmd.nodeId]
                    if (node) send(ws, { type: 'GRAPH_UPDATE', op: 'update_node', nodeId: cmd.nodeId, node: { ...node, health: cmd.health } })
                  }
                  break
                }
                default: break
              }
            },
            onComplete: (fullText) => {
              const boardCommands = parseBoardCommands(fullText)
              const cleanText = stripBoardCommands(
                fullText.replace(/<canvas:[^>]+\/>/g, '')
              ).replace(/\n{3,}/g, '\n\n').trim()
              // Add solution to session history so the AI can answer follow-up questions about it
              sessionStore.addMessage(session.id, { role: 'assistant', content: `[REFERENCE SOLUTION]\n${cleanText}` })
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
          try {
            const result = await analyzeCv(msg.cvText, msg.userLevel)
            send(ws, { type: 'CV_ANALYZED', skills: result.skills, problems: result.problems })
          } catch (err) {
            console.error('[WS] CV analysis error:', err)
            send(ws, { type: 'ERROR', message: 'CV analysis failed' })
          }
          break
        }

        case 'NODE_EXPLAIN': {
          const session = sessionStore.get(msg.sessionId)
          if (!session) {
            send(ws, { type: 'ERROR', message: 'Session not found' })
            return
          }
          try {
            const text = await explainNode(session, msg.nodeId, msg.nodeType, msg.nodeLabel)
            send(ws, { type: 'NODE_EXPLANATION', nodeId: msg.nodeId, text })
          } catch (err) {
            console.error('[WS] Node explain error:', err)
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
      connections.delete(connId)
    })

    ws.on('error', (err) => {
      console.error('[WS] Socket error:', err)
      connections.delete(connId)
    })
  })
}


