import { useState, useCallback } from 'react'
import { authFetch } from '../../lib/api'
import { useNodesState, useEdgesState, addEdge } from 'reactflow'
import type { Connection, Edge, Node } from 'reactflow'
import type { EntityField, EntityNodeData, ChatMessage } from './types'
import { EDGE_STROKE, EDGE_LABEL_TEXT, EDGE_LABEL_BG } from './types'

let nodeIdCounter = 1
function getNodeId() { return `entity-${nodeIdCounter++}` }

export function useModelingCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<EntityNodeData>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null)
  const [showRelPopup, setShowRelPopup] = useState(false)
  const [showRelHint, setShowRelHint] = useState(false)

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Add your entities and relationships, then ask me to review your model. I can check normalization, suggest improvements, or generate SQL.' },
  ])
  const [aiLoading, setAiLoading] = useState(false)

  const handleNameChange = useCallback((id: string, name: string) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, name } } : n)))
  }, [setNodes])

  const handleFieldChange = useCallback((id: string, idx: number, field: EntityField) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== id) return n
      const fields = [...n.data.fields]
      fields[idx] = field
      return { ...n, data: { ...n.data, fields } }
    }))
  }, [setNodes])

  const handleFieldAdd = useCallback((id: string) => {
    setNodes((nds) => nds.map((n) => n.id !== id ? n : { ...n, data: { ...n.data, fields: [...n.data.fields, { name: 'field', type: 'String' }] } }))
  }, [setNodes])

  const handleFieldDelete = useCallback((id: string, idx: number) => {
    setNodes((nds) => nds.map((n) => n.id !== id ? n : { ...n, data: { ...n.data, fields: n.data.fields.filter((_, i) => i !== idx) } }))
  }, [setNodes])

  const handleNodeDelete = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id))
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
  }, [setNodes, setEdges])

  function buildNode(pos: { x: number; y: number }): Node<EntityNodeData> {
    const id = getNodeId()
    return {
      id, type: 'entityNode', position: pos,
      data: {
        name: 'Entity', fields: [{ name: 'id', type: 'UUID' }],
        onNameChange: handleNameChange, onFieldChange: handleFieldChange,
        onFieldAdd: handleFieldAdd, onFieldDelete: handleFieldDelete, onNodeDelete: handleNodeDelete,
      },
    }
  }

  function addEntity() {
    const offset = () => Math.floor(Math.random() * 200) - 100
    setNodes((nds) => [...nds, buildNode({ x: 300 + offset(), y: 200 + offset() })])
  }

  const onConnect = useCallback((connection: Connection) => {
    setPendingConnection(connection)
    setShowRelPopup(true)
  }, [])

  function confirmRelationship(label: string) {
    if (!pendingConnection) return
    const edge: Edge = {
      id: `e-${Date.now()}`,
      source: pendingConnection.source ?? '',
      target: pendingConnection.target ?? '',
      sourceHandle: pendingConnection.sourceHandle ?? undefined,
      targetHandle: pendingConnection.targetHandle ?? undefined,
      label, type: 'smoothstep', animated: false,
      style: { stroke: EDGE_STROKE },
      labelStyle: { fill: EDGE_LABEL_TEXT, fontSize: 11, fontFamily: 'monospace' },
      labelBgStyle: { fill: EDGE_LABEL_BG, fillOpacity: 0.9 },
    }
    setEdges((eds) => addEdge(edge, eds))
    setPendingConnection(null)
    setShowRelPopup(false)
  }

  function cancelRelationship() {
    if (pendingConnection) confirmRelationship('1:N')
    else setShowRelPopup(false)
  }

  function getModelData() {
    const entities = nodes.map((n) => ({ name: n.data.name, fields: n.data.fields }))
    const relationships = edges.map((e) => {
      const fromNode = nodes.find((n) => n.id === e.source)
      const toNode = nodes.find((n) => n.id === e.target)
      return { from: fromNode?.data.name ?? e.source, to: toNode?.data.name ?? e.target, label: typeof e.label === 'string' ? e.label : '1:N' }
    })
    return { entities, relationships }
  }

  async function sendMessage(userMessage: string) {
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setAiLoading(true)
    const { entities, relationships } = getModelData()
    try {
      const response = await authFetch('/api/model-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entities, relationships, userMessage }),
      })
      const data = (await response.json()) as { reply: string }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Could not reach the server. Make sure it is running on port 3001.' }])
    } finally {
      setAiLoading(false)
    }
  }

  return {
    nodes, edges, onNodesChange, onEdgesChange, onConnect, addEntity,
    pendingConnection, showRelPopup, setShowRelPopup, showRelHint, setShowRelHint,
    confirmRelationship, cancelRelationship,
    messages, aiLoading, sendMessage,
  }
}
