import { useState, useRef, useEffect } from 'react'
import { Zap, RefreshCw, Shield } from 'lucide-react'
import { useGraphStore } from '../../stores/graphStore'
import { useSessionStore } from '../../stores/sessionStore'
import { sendWS } from '../../lib/ws'
import { useChatStore } from '../../stores/chatStore'

const tests = [
  { key: 'scalability', label: 'Scalability', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20', description: '1M users / 10K RPS' },
  { key: 'consistency', label: 'Consistency', icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20', description: 'Network partition' },
  { key: 'reliability', label: 'Reliability', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20', description: 'Node failure' },
] as const

export const StressTestPanel = () => {
  const [open, setOpen] = useState(false)
  const { nodes, setStressTesting, isStressTesting, updateNodeMetrics, addTempNode, addTempEdge, removeNodeById, removeEdgeById, clearStressMetrics, updateNodePosition, setNodeParent, clearNodeParent, hideEdge, showEdge } = useGraphStore()
  // All canvas state read via getState() inside animation to avoid stale closures
  const { sessionId } = useSessionStore()
  const { isStreaming } = useChatStore()
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout) }, [])

  if (nodes.length === 0 || !sessionId) return null

  const schedule = (ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
  }

  const cancelAnimation = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    clearStressMetrics()
    useGraphStore.getState().removeTempNodes()
  }

  const runScalabilityAnimation = () => {
    const currentNodes = useGraphStore.getState().nodes
    const currentEdges = useGraphStore.getState().edges
    const lbNode      = currentNodes.find(n => n.data.type === 'load_balancer')
    const apiNode     = currentNodes.find(n => n.data.type === 'api_service' && !n.parentId)
    const existingK8s = currentNodes.find(n => n.data.type === 'k8s_cluster')

    const k8sId      = existingK8s?.id ?? 'stress-k8s'
    const createdK8s = !existingK8s
    const podLabel   = apiNode?.data.label ?? 'Service'

    const apiX = apiNode?.position.x ?? 580
    const apiY = apiNode?.position.y ?? 180

    // ── K8s box dimensions (tall enough for 3 stacked pods) ──────────────────
    const POD_H   = 82   // height of one rendered api_service node (w-36 + icon + label + load bar)
    const POD_GAP = 12
    const PAD_X   = 18
    const PAD_TOP = 28
    const K8S_W   = 182  // PAD_X + w-36(144px) + PAD_X = 180, +2 for border
    const K8S_H   = PAD_TOP + 3 * (POD_H + POD_GAP) + 20

    const k8sX = apiX - PAD_X
    const k8sY = apiY - PAD_TOP

    // Absolute canvas positions for each pod (standalone, not children — avoids messy edges)
    // Stacked vertically inside the K8s bounding box
    const absPos = (slot: number) => ({
      x: k8sX + PAD_X,
      y: k8sY + PAD_TOP + slot * (POD_H + POD_GAP),
    })

    // ── Find existing edges to hide (replaced by K8s routing) ────────────────
    const edgeLB2api   = currentEdges.find(e => e.source === lbNode?.id && e.target === apiNode?.id)
    const edgeApi2down = currentEdges.find(e => e.source === apiNode?.id && e.target !== lbNode?.id)
    const downstreamId = edgeApi2down?.target

    // Entry node that feeds into K8s (prefer LB, fallback to apiNode source)
    const entryId = lbNode?.id

    // ── Nodes to push to make room ────────────────────────────────────────────
    const PUSH_X       = K8S_W + 120
    const PUSH_Y_TOP   = 180
    const PUSH_Y_BOT   = K8S_H + 80   // must clear the full K8s box height
    const pushRight  = currentNodes.filter(n => !n.parentId && n.id !== apiNode?.id && n.position.x > apiX + 50)
    const pushTop    = currentNodes.filter(n => !n.parentId && n.id !== apiNode?.id
      && Math.abs(n.position.x - apiX) < K8S_W + 60 && n.position.y < apiY - 40)
    // Catch ANY node below the api service within the K8s horizontal footprint
    const pushBottom = currentNodes.filter(n => !n.parentId && n.id !== apiNode?.id
      && Math.abs(n.position.x - apiX) < K8S_W + 60 && n.position.y > apiY + 20)
    const savedPos = new Map<string, { x: number; y: number }>([
      ...pushRight.map(n  => [n.id, { ...n.position }] as [string, { x: number; y: number }]),
      ...pushTop.map(n    => [n.id, { ...n.position }] as [string, { x: number; y: number }]),
      ...pushBottom.map(n => [n.id, { ...n.position }] as [string, { x: number; y: number }]),
    ])

    // ── Phase 1: Traffic ramps up ─────────────────────────────────────────────
    schedule(0,    () => { if (lbNode) updateNodeMetrics(lbNode.id, { rps: 1500 }); if (apiNode) updateNodeMetrics(apiNode.id, { loadPct: 42 }) })
    schedule(800,  () => { if (lbNode) updateNodeMetrics(lbNode.id, { rps: 4200 }); if (apiNode) updateNodeMetrics(apiNode.id, { loadPct: 71 }) })
    schedule(1600, () => { if (lbNode) updateNodeMetrics(lbNode.id, { rps: 7800 }); if (apiNode) updateNodeMetrics(apiNode.id, { loadPct: 89 }) })

    // ── Phase 2: 100% load — HPA fires, K8s cluster box appears ──────────────
    schedule(2400, () => {
      if (lbNode)  updateNodeMetrics(lbNode.id,  { rps: 10000 })
      if (apiNode) updateNodeMetrics(apiNode.id, { loadPct: 100 })

      if (createdK8s) {
        addTempNode({
          id: k8sId, type: 'k8s_cluster', label: 'K8s (HPA)',
          position: { x: k8sX, y: k8sY },
          style: { width: K8S_W, height: K8S_H, zIndex: -1 },
        } as Parameters<typeof addTempNode>[0])
      }

      // Push neighbouring nodes to make visual room for the cluster
      pushRight.forEach(n  => updateNodePosition(n.id, { x: n.position.x + PUSH_X,     y: n.position.y }))
      pushTop.forEach(n    => updateNodePosition(n.id, { x: n.position.x, y: n.position.y - PUSH_Y_TOP }))
      pushBottom.forEach(n => updateNodePosition(n.id, { x: n.position.x, y: n.position.y + PUSH_Y_BOT }))

      // Hide the direct LB→api and api→downstream edges
      if (edgeLB2api)   hideEdge(edgeLB2api.id)
      if (edgeApi2down) hideEdge(edgeApi2down.id)

      // Move apiNode to slot 0 inside the K8s box (standalone — NOT a React Flow child)
      // so the visual is: pods stacked left-to-right inside K8s without messy parent edges
      if (apiNode) updateNodePosition(apiNode.id, absPos(0))

      // ── Traffic routing: FROM LB into each pod (left side of K8s) ───────────
      // ── From each pod, traffic exits via K8s → downstream (right side) ──────
      // Only the K8s→downstream edge added now; pod-specific entry edges added as pods spawn
      if (entryId) addTempEdge({ id: 'stress-in-0', from: entryId, to: apiNode?.id ?? k8sId })
      if (downstreamId) addTempEdge({ id: 'stress-out', from: k8sId, to: downstreamId })
    })

    // ── Phase 3: Replica pods spawn, each gets its own entry edge from LB ─────
    schedule(3200, () => {
      addTempNode({ id: 'stress-pod-2', type: 'api_service', label: `${podLabel} ×2`, position: absPos(1) })
      if (entryId) addTempEdge({ id: 'stress-in-2', from: entryId, to: 'stress-pod-2' })
      if (apiNode) updateNodeMetrics(apiNode.id, { loadPct: 75 })
    })
    schedule(3900, () => {
      addTempNode({ id: 'stress-pod-3', type: 'api_service', label: `${podLabel} ×3`, position: absPos(2) })
      if (entryId) addTempEdge({ id: 'stress-in-3', from: entryId, to: 'stress-pod-3' })
      if (apiNode) updateNodeMetrics(apiNode.id, { loadPct: 52 })
      if (lbNode)  updateNodeMetrics(lbNode.id,  { rps: 9200 })
    })
    // ── Phase 4: Load subsides, pods scale down one by one ────────────────────
    schedule(7500,  () => { if (lbNode) updateNodeMetrics(lbNode.id, { rps: 5500 }); removeNodeById('stress-pod-3'); removeEdgeById('stress-in-3') })
    schedule(9500,  () => { if (lbNode) updateNodeMetrics(lbNode.id, { rps: 3000 }); removeNodeById('stress-pod-2'); removeEdgeById('stress-in-2') })
    schedule(11500, () => {
      if (lbNode)  updateNodeMetrics(lbNode.id,  { rps: 1400 })
      if (apiNode) updateNodeMetrics(apiNode.id, { loadPct: 22 })
    })

    // ── Phase 5: Full cleanup — restore everything ────────────────────────────
    schedule(13500, () => {
      clearStressMetrics()
      setStressTesting(false) // ensure button resets even if AI_STREAM_END is delayed

      // Remove temp edges
      removeEdgeById('stress-in-0')
      removeEdgeById('stress-out')

      // Restore apiNode to its original position
      if (apiNode) updateNodePosition(apiNode.id, { x: apiX, y: apiY })

      // Remove K8s cluster
      if (createdK8s) removeNodeById(k8sId)

      // Restore hidden edges
      if (edgeLB2api)   showEdge(edgeLB2api.id)
      if (edgeApi2down) showEdge(edgeApi2down.id)

      // Restore pushed neighbours
      savedPos.forEach((pos, id) => updateNodePosition(id, pos))
    })
  }

  const runTest = (testType: 'scalability' | 'consistency' | 'reliability') => {
    cancelAnimation()
    setStressTesting(true)
    sendWS('STRESS_TEST', { sessionId, testType })
    setOpen(false)
    if (testType === 'scalability') runScalabilityAnimation()
  }

  const disabled = isStreaming || isStressTesting

  return (
    <div className="absolute bottom-3 left-3 z-10">
      {open && (
        <div className="mb-2 bg-card border border-white/10 rounded-xl p-2 flex flex-col gap-1 shadow-xl">
          {tests.map(({ key, label, icon: Icon, color, bg, description }) => (
            <button
              key={key}
              onClick={() => runTest(key)}
              disabled={disabled}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all ${bg} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Icon size={13} className={color} />
              <div>
                <div className={`text-xs font-medium ${color}`}>{label}</div>
                <div className="text-[10px] text-zinc-600">{description}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        disabled={disabled}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all
          ${isStressTesting
            ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 animate-pulse'
            : 'bg-card border-white/10 text-zinc-400 hover:text-white hover:bg-white/8'
          }
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
      >
        <Zap size={11} className={isStressTesting ? 'text-orange-400' : ''} />
        {isStressTesting ? 'Testing...' : 'Simulate'}
      </button>
    </div>
  )
}
