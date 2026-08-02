import dagre from 'dagre'
import type { Node, Edge } from 'reactflow'
import type { SystemNodeData } from '../../stores/graphStore'

// ── Auto-layout ─────────────────────────────────────────────────────────────────
// Arrange the graph left-to-right with dagre so a hand-built (or AI-built) diagram
// reads as a clean request flow: client → edge → compute → data. Only top-level
// nodes are laid out; nodes nested inside a container (parentId, e.g. pods inside a
// k8s cluster) keep their relative position and travel with their parent.

const DEFAULT_W = 150
const DEFAULT_H = 84

function dims(n: Node<SystemNodeData>): { width: number; height: number } {
  return {
    width: (n.style?.width as number) ?? DEFAULT_W,
    height: (n.style?.height as number) ?? DEFAULT_H,
  }
}

export function layoutGraph(
  nodes: Node<SystemNodeData>[],
  edges: Edge[],
): Node<SystemNodeData>[] {
  const top = nodes.filter(n => !n.parentId)
  if (top.length === 0) return nodes

  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'LR', nodesep: 55, ranksep: 95, marginx: 20, marginy: 20 })
  g.setDefaultEdgeLabel(() => ({}))

  for (const n of top) g.setNode(n.id, dims(n))
  const topIds = new Set(top.map(n => n.id))
  for (const e of edges) {
    if (topIds.has(e.source) && topIds.has(e.target)) g.setEdge(e.source, e.target)
  }

  dagre.layout(g)

  return nodes.map(n => {
    if (n.parentId) return n // child nodes keep their in-container position
    const p = g.node(n.id)
    if (!p) return n
    const { width, height } = dims(n)
    // dagre gives the node center; React Flow wants the top-left corner.
    return { ...n, position: { x: p.x - width / 2, y: p.y - height / 2 } }
  })
}
