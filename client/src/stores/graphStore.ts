import type React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Node, type Edge } from 'reactflow'

export type NodeHealth = 'healthy' | 'elevated' | 'stressed' | 'critical' | 'dead'
export type NodeType = 'client' | 'cdn' | 'load_balancer' | 'api_gateway' | 'api_service' | 'cache' | 'message_queue' | 'database' | 'search_cluster' | 'object_storage' | 'notification_service' | 'websocket_gateway' | 'k8s_cluster'

export interface SystemNodeData {
  label: string
  type: NodeType
  health: NodeHealth
  isHighlighted?: boolean
  isSPOF?: boolean
  metrics?: { rps?: number; latencyMs?: number; loadPct?: number; queueDepth?: number }
}

export interface CanvasSnapshot {
  nodes: Node<SystemNodeData>[]
  edges: Edge[]
  turnLabel: string
}

// Auto-layout positions per node type
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  client:               { x: 60,   y: 260 },
  cdn:                  { x: 60,   y: 80  },
  load_balancer:        { x: 320,  y: 260 },
  api_gateway:          { x: 320,  y: 80  },
  api_service:          { x: 580,  y: 180 },
  cache:                { x: 840,  y: 80  },
  database:             { x: 840,  y: 320 },
  message_queue:        { x: 580,  y: 400 },
  search_cluster:       { x: 1100, y: 180 },
  object_storage:       { x: 1100, y: 400 },
  notification_service: { x: 580,  y: 560 },
  websocket_gateway:    { x: 320,  y: 440 },
  k8s_cluster:          { x: 520,  y: 240 },
}

interface GraphState {
  nodes: Node<SystemNodeData>[]
  edges: Edge[]
  nodeTypeCounts: Record<string, number>
  snapshots: CanvasSnapshot[]
  viewingSnapshotIdx: number | null

  isStressTesting: boolean
  isCanvasFullscreen: boolean
  tempNodeIds: string[]
  tempEdgeIds: string[]
  pendingFitView: boolean
  traceHighlightId: string | null
  traceEdgeId: string | null
  traceEdgeReverse: boolean
  nodeExplanationText: string | null
  nodeExplanationLoading: boolean

  addNode: (node: { id: string; type: string; label: string; health?: NodeHealth; parentId?: string; position?: { x: number; y: number } }) => void
  addEdge: (edge: { id: string; from: string; to: string; label?: string }) => void
  updateNodeHealth: (id: string, health: NodeHealth) => void
  updateNodeLabel: (id: string, label: string) => void
  updateNodeMetrics: (id: string, metrics: Partial<NonNullable<SystemNodeData['metrics']>>) => void
  addTempNode: (node: { id: string; type: string; label: string; parentId?: string; position?: { x: number; y: number }; style?: React.CSSProperties }) => void
  addTempEdge: (edge: { id: string; from: string; to: string; label?: string }) => void
  removeEdgeById: (id: string) => void
  removeTempEdges: () => void
  hideEdge: (id: string) => void
  showEdge: (id: string) => void
  removeNodeById: (id: string) => void
  removeTempNodes: () => void
  updateNodePosition: (id: string, position: { x: number; y: number }) => void
  setNodeParent: (id: string, parentId: string, relativePos: { x: number; y: number }) => void
  clearNodeParent: (id: string, absolutePos: { x: number; y: number }) => void
  triggerFitView: () => void
  clearFitView: () => void
  clearStressMetrics: () => void
  highlightNode: (id: string) => void
  clearHighlights: () => void
  clearGraph: () => void
  saveSnapshot: (turnLabel: string) => void
  navigateSnapshot: (idx: number | null) => void
  setStressTesting: (v: boolean) => void
  setCanvasFullscreen: (v: boolean) => void
  setTraceHighlight: (id: string | null) => void
  setTraceEdge: (id: string | null, reverse?: boolean) => void
  setNodeExplanation: (text: string) => void
  setNodeExplanationLoading: (v: boolean) => void
  clearNodeExplanation: () => void
}

export const useGraphStore = create<GraphState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      nodeTypeCounts: {},
      snapshots: [],
      viewingSnapshotIdx: null,
      isStressTesting: false,
      isCanvasFullscreen: false,
      tempNodeIds: [],
      tempEdgeIds: [],
      pendingFitView: false,
      traceHighlightId: null,
      traceEdgeId: null,
      traceEdgeReverse: false,
      nodeExplanationText: null,
      nodeExplanationLoading: false,

      addNode: (nodeData) => {
        const { nodeTypeCounts, nodes } = get()
        if (nodes.find(n => n.id === nodeData.id)) return

        const type = nodeData.type as NodeType
        const count = nodeTypeCounts[type] || 0

        let position: { x: number; y: number }
        let extraProps: Partial<Node<SystemNodeData>> = {}

        if (nodeData.position) {
          position = nodeData.position
          if (type === 'k8s_cluster') {
            extraProps = { style: { width: 460, height: 220, zIndex: -1 } }
          }
        } else if (nodeData.parentId) {
          position = { x: 30 + count * 140, y: 70 }
          extraProps = { parentId: nodeData.parentId, extent: 'parent' as const }
        } else if (type === 'k8s_cluster') {
          const basePos = NODE_POSITIONS[type] || { x: 400, y: 200 }
          position = { x: basePos.x + count * 30, y: basePos.y + count * 30 }
          extraProps = { style: { width: 460, height: 220, zIndex: -1 } }
        } else {
          const basePos = NODE_POSITIONS[type] || { x: 400, y: 300 }
          position = { x: basePos.x + count * 20, y: basePos.y + count * 90 }
        }

        const newNode: Node<SystemNodeData> = {
          id: nodeData.id,
          type: 'systemNode',
          position,
          data: {
            label: nodeData.label,
            type,
            health: nodeData.health || 'healthy',
            metrics: {},
          },
          ...extraProps,
        }

        set((s) => ({
          nodes: [...s.nodes, newNode],
          nodeTypeCounts: { ...s.nodeTypeCounts, [type]: count + 1 },
          viewingSnapshotIdx: null,
        }))
      },

      addEdge: (edgeData) => {
        const { edges } = get()
        if (edges.find(e => e.id === edgeData.id)) return

        const newEdge: Edge = {
          id: edgeData.id,
          source: edgeData.from,
          target: edgeData.to,
          label: edgeData.label,
          type: 'systemEdge',
          animated: false,
        }

        set((s) => ({
          edges: [...s.edges, newEdge],
          viewingSnapshotIdx: null,
        }))
      },

      updateNodeHealth: (id, health) => {
        set((s) => ({
          nodes: s.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, health } } : n)
        }))
      },

      updateNodeLabel: (id, label) => {
        set((s) => ({
          nodes: s.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, label } } : n)
        }))
      },

      updateNodeMetrics: (id, metrics) => {
        set((s) => ({
          nodes: s.nodes.map(n =>
            n.id === id ? { ...n, data: { ...n.data, metrics: { ...n.data.metrics, ...metrics } } } : n
          )
        }))
      },

      addTempNode: (nodeData) => {
        const { nodeTypeCounts, nodes, tempNodeIds } = get()
        if (nodes.find(n => n.id === nodeData.id)) return

        const type = nodeData.type as NodeType
        // Count existing temp pod nodes inside the same parent (for vertical stacking)
        const siblingsInParent = nodes.filter(n => n.parentId === nodeData.parentId && tempNodeIds.includes(n.id)).length
        const count = nodeTypeCounts[type] || 0

        let position: { x: number; y: number }
        let extraProps: Partial<Node<SystemNodeData>> = {}

        if (nodeData.position) {
          // Explicit position provided (e.g. stress test in-place K8s)
          position = nodeData.position
          if (type === 'k8s_cluster') {
            extraProps = { style: nodeData.style ?? { width: 260, height: 340, zIndex: -1 } }
          }
        } else if (nodeData.parentId) {
          // Stack pods vertically inside the cluster
          position = { x: 20, y: 20 + siblingsInParent * 82 }
          extraProps = { parentId: nodeData.parentId, extent: 'parent' as const }
        } else if (type === 'k8s_cluster') {
          // Place cluster to the right of all existing canvas nodes to avoid overlap
          const rightmost = nodes.length > 0
            ? Math.max(...nodes.map(n => n.position.x + ((n.style?.width as number) || 160)))
            : 400
          position = { x: rightmost + 60, y: 80 }
          extraProps = { style: { width: 260, height: 340, zIndex: -1 } }
        } else {
          const basePos = NODE_POSITIONS[type] || { x: 400, y: 300 }
          position = { x: basePos.x + count * 20, y: basePos.y + count * 90 }
        }

        const newNode: Node<SystemNodeData> = {
          id: nodeData.id,
          type: 'systemNode',
          position,
          data: { label: nodeData.label, type, health: 'healthy', metrics: {} },
          ...extraProps,
        }

        set((s) => ({
          nodes: [...s.nodes, newNode],
          tempNodeIds: [...s.tempNodeIds, nodeData.id],
        }))
      },

      removeNodeById: (id) => {
        set((s) => ({
          nodes: s.nodes.filter(n => n.id !== id),
          tempNodeIds: s.tempNodeIds.filter(tid => tid !== id),
        }))
      },

      addTempEdge: (edgeData) => {
        const { edges, tempEdgeIds } = get()
        if (edges.find(e => e.id === edgeData.id)) return
        const newEdge: Edge = {
          id: edgeData.id,
          source: edgeData.from,
          target: edgeData.to,
          label: edgeData.label,
          type: 'systemEdge',
          animated: true,
        }
        set((s) => ({ edges: [...s.edges, newEdge], tempEdgeIds: [...tempEdgeIds, edgeData.id] }))
      },

      removeEdgeById: (id) => {
        set((s) => ({
          edges: s.edges.filter(e => e.id !== id),
          tempEdgeIds: s.tempEdgeIds.filter(tid => tid !== id),
        }))
      },

      removeTempEdges: () => {
        set((s) => ({
          edges: s.edges.filter(e => !s.tempEdgeIds.includes(e.id)),
          tempEdgeIds: [],
        }))
      },

      hideEdge: (id) => {
        set((s) => ({ edges: s.edges.map(e => e.id === id ? { ...e, hidden: true } : e) }))
      },

      showEdge: (id) => {
        set((s) => ({ edges: s.edges.map(e => e.id === id ? { ...e, hidden: false } : e) }))
      },

      removeTempNodes: () => {
        set((s) => ({
          nodes: s.nodes.filter(n => !s.tempNodeIds.includes(n.id)),
          tempNodeIds: [],
        }))
      },

      updateNodePosition: (id, position) => {
        set((s) => ({
          nodes: s.nodes.map(n => n.id === id ? { ...n, position } : n)
        }))
      },

      setNodeParent: (id, parentId, relativePos) => {
        set((s) => ({
          nodes: s.nodes.map(n => n.id === id
            ? { ...n, position: relativePos, parentId, extent: 'parent' as const }
            : n
          )
        }))
      },

      clearNodeParent: (id, absolutePos) => {
        set((s) => ({
          nodes: s.nodes.map(n => n.id === id
            ? { ...n, position: absolutePos, parentId: undefined, extent: undefined }
            : n
          )
        }))
      },

      triggerFitView: () => set({ pendingFitView: true }),
      clearFitView: () => set({ pendingFitView: false }),

      clearStressMetrics: () => {
        set((s) => ({
          nodes: s.nodes.map(n => ({ ...n, data: { ...n.data, metrics: {} } }))
        }))
      },

      highlightNode: (id) => {
        set((s) => ({
          nodes: s.nodes.map(n => ({
            ...n,
            data: { ...n.data, isHighlighted: n.id === id }
          }))
        }))
        setTimeout(() => {
          set((s) => ({
            nodes: s.nodes.map(n => ({ ...n, data: { ...n.data, isHighlighted: false } }))
          }))
        }, 3000)
      },

      clearHighlights: () => {
        set((s) => ({
          nodes: s.nodes.map(n => ({ ...n, data: { ...n.data, isHighlighted: false } }))
        }))
      },

      clearGraph: () => set({ nodes: [], edges: [], nodeTypeCounts: {}, snapshots: [], viewingSnapshotIdx: null, tempNodeIds: [] }),

      saveSnapshot: (turnLabel) => {
        const { nodes, edges, snapshots } = get()
        if (nodes.length === 0) return
        const snapshot: CanvasSnapshot = {
          nodes: nodes.map(n => ({ ...n, data: { ...n.data } })),
          edges: [...edges],
          turnLabel,
        }
        set({ snapshots: [...snapshots, snapshot], viewingSnapshotIdx: null })
      },

      navigateSnapshot: (idx) => {
        set({ viewingSnapshotIdx: idx })
      },

      setStressTesting: (v) => set({ isStressTesting: v }),

      setCanvasFullscreen: (v) => set({ isCanvasFullscreen: v }),

      setTraceHighlight: (id) => set({ traceHighlightId: id }),
      setTraceEdge: (id, reverse = false) => set({ traceEdgeId: id, traceEdgeReverse: reverse }),
      setNodeExplanation: (text) => set({ nodeExplanationText: text, nodeExplanationLoading: false }),
      setNodeExplanationLoading: (v) => set({ nodeExplanationLoading: v }),
      clearNodeExplanation: () => set({ nodeExplanationText: null, nodeExplanationLoading: false }),
    }),
    {
      name: 'sdt-graph',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        nodeTypeCounts: state.nodeTypeCounts,
        snapshots: state.snapshots,
      }),
    }
  )
)
