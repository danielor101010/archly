import { useEffect, useCallback, useState, useMemo } from 'react'
import ReactFlow, {
  Background, BackgroundVariant,
  useNodesState, useEdgesState, ReactFlowProvider, useReactFlow,
} from 'reactflow'
import type { EdgeTypes } from 'reactflow'
import { AnimatePresence } from 'framer-motion'
import 'reactflow/dist/style.css'
import { useGraphStore } from '../../stores/graphStore'
import { useSessionStore } from '../../stores/sessionStore'
import { sendWS } from '../../lib/ws'
import { nodeTypes } from './nodes'
import { SystemEdge } from './edges/SystemEdge'
import { CanvasToolbar } from './CanvasToolbar'
import { EmptyCanvasState } from './EmptyCanvasState'
import { StressTestPanel } from './StressTestPanel'
import { NodeExplanation } from './NodeExplanation'
import { NodeListPanel } from './NodeListPanel'
import { RequestTracer } from './RequestTracer'
import { useRequestTrace } from './useRequestTrace'

const edgeTypes: EdgeTypes = { systemEdge: SystemEdge }

function CanvasInner() {
  const { nodes: liveNodes, edges: liveEdges, snapshots, viewingSnapshotIdx, isStressTesting, isCanvasFullscreen, setCanvasFullscreen, nodeExplanationText, nodeExplanationLoading, setNodeExplanationLoading, clearNodeExplanation, pendingFitView, clearFitView, traceHighlightId } = useGraphStore()
  const { sessionId } = useSessionStore()
  const { fitView } = useReactFlow()
  const [selectedExplanation, setSelectedExplanation] = useState<{ type: string; label: string } | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const trace = useRequestTrace()

  useEffect(() => {
    if (pendingFitView) {
      setTimeout(() => { fitView({ padding: 0.25, duration: 400 }); clearFitView() }, 100)
    }
  }, [pendingFitView, fitView, clearFitView])

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (selectedExplanation) { setSelectedExplanation(null); return }
      if (isCanvasFullscreen) setCanvasFullscreen(false)
    }
  }, [isCanvasFullscreen, setCanvasFullscreen, selectedExplanation])

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  const rawNodes = viewingSnapshotIdx !== null
    ? (snapshots[viewingSnapshotIdx]?.nodes ?? liveNodes)
    : liveNodes

  // Memoize: only recompute when rawNodes or traceHighlightId actually change.
  // Without useMemo the .map() creates a new array every render → infinite setNodes loop.
  const storeNodes = useMemo(() => {
    if (!traceHighlightId) return rawNodes
    return rawNodes.map(n => {
      const want = n.id === traceHighlightId
      const have = n.data.isHighlighted ?? false
      if (want === have) return n // same reference — no new object
      return { ...n, data: { ...n.data, isHighlighted: want } }
    })
  }, [rawNodes, traceHighlightId])
  const storeEdges = viewingSnapshotIdx !== null
    ? (snapshots[viewingSnapshotIdx]?.edges ?? liveEdges)
    : liveEdges

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges)

  useEffect(() => { setNodes(storeNodes) }, [storeNodes, setNodes])
  useEffect(() => { setEdges(storeEdges) }, [storeEdges, setEdges])

  const isEmpty = liveNodes.length === 0

  return (
    <div className={`relative h-full bg-page transition-opacity duration-300 ${viewingSnapshotIdx !== null ? 'opacity-75' : ''}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'systemEdge', animated: isStressTesting }}
        onNodeClick={(_evt, node) => {
          setSelectedExplanation({ type: node.data.type, label: node.data.label })
          if (sessionId) {
            setNodeExplanationLoading(true)
            sendWS('NODE_EXPLAIN', { sessionId, nodeId: node.id, nodeType: node.data.type, nodeLabel: node.data.label })
          }
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(128,128,128,0.12)"
        />
      </ReactFlow>

      <CanvasToolbar nodeCount={liveNodes.length} onTogglePanel={() => setPanelOpen(o => !o)} panelOpen={panelOpen} trace={trace} />
      {panelOpen && <NodeListPanel onClose={() => setPanelOpen(false)} />}
      <RequestTracer trace={trace} />
      <StressTestPanel />
      {isEmpty && <EmptyCanvasState />}
      <AnimatePresence>
        {selectedExplanation && (
          <NodeExplanation
            nodeType={selectedExplanation.type}
            nodeLabel={selectedExplanation.label}
            contextText={nodeExplanationText}
            isLoading={nodeExplanationLoading}
            onClose={() => { setSelectedExplanation(null); clearNodeExplanation() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export const ArchitectureCanvas = () => (
  <ReactFlowProvider>
    <CanvasInner />
  </ReactFlowProvider>
)
