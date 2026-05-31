import { useState, useCallback } from 'react'
import { apiUrl } from '../../lib/api'
import { useGraphStore } from '../../stores/graphStore'

export interface TracePathStep {
  nodeId: string
  nodeLabel: string
  nodeType: string
  edgeId: string | null   // edge used to arrive here (null for first step)
  stepLabel: string
  explanation: string
  isReturn?: boolean       // true for the response route back to client
}

export interface UseRequestTraceReturn {
  active: boolean
  loading: boolean           // true while initial AI analysis is running
  animating: boolean         // true while the dot is traveling
  steps: TracePathStep[]
  stepIndex: number          // current step (0-based)
  start: () => Promise<void>
  advance: () => void
  stop: () => void
}

const PACKET_DURATION = 1400  // ms — must match animateMotion dur in SystemEdge

const RETURN_EXPLANATIONS: Record<string, string> = {
  client:               'Response arrives at the client — request complete.',
  cdn:                  'CDN edge node caches the response payload for future requests from nearby users, then forwards it to the client.',
  load_balancer:        'Load balancer routes the response back on the same connection it came in on.',
  api_gateway:          'API Gateway validates the response, applies rate-limit headers, and passes it upstream to the caller.',
  api_service:          'Service serialises the result and hands it back to the calling layer.',
  cache:                'Result is written into the cache (TTL set) so the next identical request is served instantly without hitting the DB.',
  database:             'Query results are returned from the database to the calling service.',
  message_queue:        'Acknowledgement is sent back through the queue confirming the message was processed.',
  search_cluster:       'Search results are returned and optionally cached at this layer.',
  object_storage:       'Object URL or data stream is returned to the requesting service.',
  notification_service: 'Delivery receipt travels back confirming the notification was dispatched.',
  websocket_gateway:    'Response is pushed over the open WebSocket connection directly to the connected client.',
  k8s_cluster:          'Pod returns the processed response to the service mesh, which routes it back toward the client.',
}

export function useRequestTrace(): UseRequestTraceReturn {
  const [active,    setActive]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [animating, setAnimating] = useState(false)
  const [steps,     setSteps]     = useState<TracePathStep[]>([])
  const [stepIndex, setStepIndex] = useState(0)

  const getGraphData = () => {
    const state = useGraphStore.getState()
    const nodes = state.nodes
      .filter(n => !n.parentId)
      .map(n => ({ id: n.id, type: n.data.type as string, label: n.data.label }))
    const edges = state.edges
      .filter(e => !e.hidden)
      .map(e => ({ id: e.id, from: e.source, to: e.target, label: e.label as string | undefined }))
    return { nodes, edges }
  }

  const showStep = (step: TracePathStep) => {
    useGraphStore.getState().setTraceHighlight(step.nodeId)
    useGraphStore.getState().setTraceEdge(step.edgeId ?? null, step.isReturn ?? false)
  }

  const start = useCallback(async () => {
    const { nodes, edges } = getGraphData()
    if (!nodes.length) return

    setActive(true)
    setLoading(true)
    setSteps([])
    setStepIndex(0)
    useGraphStore.getState().setTraceEdge(null)
    useGraphStore.getState().setTraceHighlight(null)

    try {
      const resp = await fetch(apiUrl('/api/trace-full'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      })
      const data = await resp.json() as { path: Array<{ nodeId: string; edgeId: string | null; stepLabel: string; explanation: string }> }
      const path = data.path ?? []

      // Enrich each step with label/type from the nodes list
      const enriched: TracePathStep[] = path.map(s => {
        const node = nodes.find(n => n.id === s.nodeId)
        return {
          nodeId: s.nodeId,
          nodeLabel: node?.label ?? s.nodeId,
          nodeType: node?.type ?? 'api_service',
          edgeId: s.edgeId,
          stepLabel: s.stepLabel,
          explanation: s.explanation,
        }
      })

      if (enriched.length > 0) {
        // Generate the return journey: same edges in reverse, green dot
        const returnSteps: TracePathStep[] = enriched
          .slice(0, -1)               // all steps except the last (already at terminal)
          .reverse()
          .map(s => ({
            ...s,
            stepLabel: `← ${s.nodeLabel}`,
            explanation: RETURN_EXPLANATIONS[s.nodeType] ?? `Response passes back through ${s.nodeLabel}.`,
            isReturn: true,
          }))

        setSteps([...enriched, ...returnSteps])
        setStepIndex(0)
        showStep(enriched[0])
      }
    } catch {
      // Show a minimal 1-step fallback
      const first = nodes[0]
      setSteps([{
        nodeId: first.id,
        nodeLabel: first.label,
        nodeType: first.type,
        edgeId: null,
        stepLabel: 'Start',
        explanation: 'Could not analyze this canvas. Check the server is running.',
      }])
      setStepIndex(0)
    } finally {
      setLoading(false)
    }
  }, [])

  const advance = useCallback(() => {
    const nextIdx = stepIndex + 1
    if (nextIdx >= steps.length || animating) return

    const nextStep = steps[nextIdx]
    if (!nextStep) return

    if (nextStep.edgeId) {
      setAnimating(true)
      // Switch dot to the next edge immediately (reversed for return journey)
      useGraphStore.getState().setTraceEdge(nextStep.edgeId, nextStep.isReturn ?? false)
      setTimeout(() => {
        useGraphStore.getState().setTraceHighlight(nextStep.nodeId)
        setStepIndex(nextIdx)
        setAnimating(false)
      }, PACKET_DURATION)
    } else {
      // Terminal step — no edge, just update highlight
      showStep(nextStep)
      setStepIndex(nextIdx)
    }
  }, [stepIndex, steps, animating])

  const stop = useCallback(() => {
    setActive(false)
    setLoading(false)
    setAnimating(false)
    setSteps([])
    setStepIndex(0)
    useGraphStore.getState().setTraceHighlight(null)
    useGraphStore.getState().setTraceEdge(null)
    useGraphStore.getState().clearHighlights()
  }, [])

  return { active, loading, animating, steps, stepIndex, start, advance, stop }
}
