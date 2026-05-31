import { useState, useCallback, useRef, useEffect } from 'react'
import { apiUrl } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  Handle,
  Position,
} from 'reactflow'
import type { NodeProps, Connection, Edge, Node } from 'reactflow'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  GitFork,
  Sparkles,
  ChevronDown,
  Send,
  X,
} from 'lucide-react'
import 'reactflow/dist/style.css'

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface EntityField {
  name: string
  type: string
}

interface EntityNodeData {
  name: string
  fields: EntityField[]
  onNameChange: (id: string, name: string) => void
  onFieldChange: (id: string, idx: number, field: EntityField) => void
  onFieldAdd: (id: string) => void
  onFieldDelete: (id: string, idx: number) => void
  onNodeDelete: (id: string) => void
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

// â”€â”€ Entity Node â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function EntityNodeComponent({ id, data, selected }: NodeProps<EntityNodeData>) {
  const [editingName, setEditingName] = useState(false)
  const [editingField, setEditingField] = useState<number | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingName && nameRef.current) {
      nameRef.current.focus()
      nameRef.current.select()
    }
  }, [editingName])

  return (
    <div
      className={`bg-card border rounded-xl min-w-[180px] ${
        selected ? 'border-indigo-500/60 ring-1 ring-indigo-500/20' : 'border-white/[0.12]'
      }`}
    >
      {/* Handles on all 4 sides */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-src"
        className="!w-2.5 !h-2.5 !bg-zinc-700 !border-zinc-500 hover:!bg-indigo-400 transition-colors"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-tgt"
        className="!w-2.5 !h-2.5 !bg-zinc-700 !border-zinc-500 hover:!bg-indigo-400 transition-colors"
        style={{ left: '40%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-src"
        className="!w-2.5 !h-2.5 !bg-zinc-700 !border-zinc-500 hover:!bg-indigo-400 transition-colors"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-tgt"
        className="!w-2.5 !h-2.5 !bg-zinc-700 !border-zinc-500 hover:!bg-indigo-400 transition-colors"
        style={{ left: '60%' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-src"
        className="!w-2.5 !h-2.5 !bg-zinc-700 !border-zinc-500 hover:!bg-indigo-400 transition-colors"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-tgt"
        className="!w-2.5 !h-2.5 !bg-zinc-700 !border-zinc-500 hover:!bg-indigo-400 transition-colors"
        style={{ top: '40%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-src"
        className="!w-2.5 !h-2.5 !bg-zinc-700 !border-zinc-500 hover:!bg-indigo-400 transition-colors"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-tgt"
        className="!w-2.5 !h-2.5 !bg-zinc-700 !border-zinc-500 hover:!bg-indigo-400 transition-colors"
        style={{ top: '60%' }}
      />

      {/* Header */}
      <div className="bg-indigo-500/15 border-b border-white/[0.08] px-3 py-2 rounded-t-xl flex items-center justify-between gap-2 group">
        {editingName ? (
          <input
            ref={nameRef}
            defaultValue={data.name}
            onBlur={(e) => {
              data.onNameChange(id, e.target.value || data.name)
              setEditingName(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                data.onNameChange(id, e.currentTarget.value || data.name)
                setEditingName(false)
              }
              if (e.key === 'Escape') setEditingName(false)
            }}
            className="flex-1 bg-transparent text-white text-sm font-semibold outline-none border-b border-indigo-400/60 min-w-0"
          />
        ) : (
          <span
            className="flex-1 font-semibold text-sm text-white cursor-pointer select-none"
            onDoubleClick={() => setEditingName(true)}
            onClick={() => setEditingName(true)}
          >
            {data.name}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            data.onNodeDelete(id)
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 nodrag"
        >
          <X size={12} />
        </button>
      </div>

      {/* Fields */}
      <div className="py-1">
        {data.fields.map((field, idx) => (
          <div key={idx} className="px-3 py-0.5">
            {editingField === idx ? (
              <div className="flex items-center gap-1 py-0.5">
                <input
                  autoFocus
                  defaultValue={field.name}
                  placeholder="field"
                  onBlur={(e) =>
                    data.onFieldChange(id, idx, { ...field, name: e.target.value || field.name })
                  }
                  className="w-20 bg-transparent text-white text-xs font-mono outline-none border-b border-indigo-400/40"
                />
                <span className="text-zinc-500 text-xs font-mono">:</span>
                <input
                  defaultValue={field.type}
                  placeholder="type"
                  onBlur={(e) => {
                    data.onFieldChange(id, idx, { name: field.name, type: e.target.value || field.type })
                    setEditingField(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') setEditingField(null)
                  }}
                  className="w-20 bg-transparent text-zinc-400 text-xs font-mono outline-none border-b border-indigo-400/40"
                />
                <button
                  onClick={() => data.onFieldDelete(id, idx)}
                  className="text-zinc-600 hover:text-red-400 nodrag ml-1"
                >
                  <X size={10} />
                </button>
              </div>
            ) : (
              <div
                className="flex items-center gap-0.5 text-xs font-mono cursor-pointer hover:bg-white/5 rounded px-0.5 group/field"
                onClick={() => setEditingField(idx)}
              >
                <span className="text-white truncate">{field.name}</span>
                <span className="text-zinc-500">: {field.type}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add field */}
      <div
        className="text-zinc-600 hover:text-zinc-300 text-[10px] px-3 py-1.5 cursor-pointer nodrag border-t border-white/[0.05]"
        onClick={() => data.onFieldAdd(id)}
      >
        + field
      </div>
    </div>
  )
}

const nodeTypes = { entityNode: EntityNodeComponent }

// â”€â”€ Relationship Label Popup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const RELATIONSHIP_LABELS = ['1:1', '1:N', 'N:M', 'has one', 'has many', 'belongs to']

interface RelPopupProps {
  onSelect: (label: string) => void
  onClose: () => void
}

function RelationshipPopup({ onSelect, onClose }: RelPopupProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-card border border-white/[0.12] rounded-xl p-4 shadow-2xl w-64"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xs text-zinc-400 mb-3 font-medium">Select relationship type</p>
          <div className="grid grid-cols-2 gap-2">
            {RELATIONSHIP_LABELS.map((label) => (
              <button
                key={label}
                onClick={() => onSelect(label)}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 border border-white/[0.08] hover:border-indigo-500/30 text-sm text-zinc-300 hover:text-white transition-all font-mono"
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="mt-3 w-full text-xs text-zinc-500 hover:text-zinc-300"
          >
            Cancel (use 1:N)
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// â”€â”€ Ask AI Dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AskAiDropdownProps {
  onAction: (prompt: string) => void
}

const AI_ACTIONS = [
  { label: 'Review my model', prompt: 'Review my model' },
  { label: 'Suggest improvements', prompt: 'Suggest improvements for my data model' },
  { label: 'Check normalization', prompt: 'Check my data model for 1NF, 2NF, 3NF, and BCNF compliance' },
  { label: 'Find missing relationships', prompt: 'Find any missing relationships or foreign keys in my model' },
  { label: 'Generate SQL schema', prompt: 'Generate SQL CREATE TABLE statements for my data model' },
]

function AskAiDropdown({ onAction }: AskAiDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as unknown as globalThis.Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
      >
        <Sparkles size={14} />
        Ask AI
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 top-full mt-1.5 w-56 bg-card border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {AI_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  onAction(action.prompt)
                  setOpen(false)
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                {action.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// â”€â”€ Chat Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ChatPanelProps {
  messages: ChatMessage[]
  loading: boolean
  onSend: (text: string) => void
}

function ChatPanel({ messages, loading, onSend }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function send() {
    const text = input.trim()
    if (!text || loading) return
    onSend(text)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-card border-l border-white/[0.08]">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Sparkles size={12} className="text-indigo-400" />
          </div>
          <span className="text-xs font-medium text-indigo-400">AI Model Reviewer</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-card border border-white/[0.08] text-zinc-200 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-start"
          >
            <div className="bg-card border border-white/[0.08] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-white/[0.08]">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your model... (Enter to send, Shift+Enter for newline)"
            rows={2}
            className="flex-1 resize-none bg-page border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-indigo-500/50 transition-colors"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/40 disabled:text-indigo-300/40 disabled:cursor-not-allowed text-white transition-all"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-[10px] text-zinc-600 mt-1.5">Enter sends Â· Shift+Enter for newline</p>
      </div>
    </div>
  )
}

// â”€â”€ Main Canvas Inner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let nodeIdCounter = 1

function getNodeId() {
  return `entity-${nodeIdCounter++}`
}

function ModelingCanvasInner() {
  const navigate = useNavigate()

  const [nodes, setNodes, onNodesChange] = useNodesState<EntityNodeData>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null)
  const [showRelPopup, setShowRelPopup] = useState(false)
  const [showRelHint, setShowRelHint] = useState(false)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Add your entities and relationships, then ask me to review your model. I can check normalization, suggest improvements, or generate SQL.',
    },
  ])
  const [aiLoading, setAiLoading] = useState(false)

  // â”€â”€ Node data callbacks (stable refs via useCallback) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleNameChange = useCallback((id: string, name: string) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, name } } : n))
    )
  }, [setNodes])

  const handleFieldChange = useCallback((id: string, idx: number, field: EntityField) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n
        const fields = [...n.data.fields]
        fields[idx] = field
        return { ...n, data: { ...n.data, fields } }
      })
    )
  }, [setNodes])

  const handleFieldAdd = useCallback((id: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n
        return {
          ...n,
          data: {
            ...n.data,
            fields: [...n.data.fields, { name: 'field', type: 'String' }],
          },
        }
      })
    )
  }, [setNodes])

  const handleFieldDelete = useCallback((id: string, idx: number) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n
        const fields = n.data.fields.filter((_, i) => i !== idx)
        return { ...n, data: { ...n.data, fields } }
      })
    )
  }, [setNodes])

  const handleNodeDelete = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id))
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
  }, [setNodes, setEdges])

  // â”€â”€ Build node with callbacks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  function buildNode(pos: { x: number; y: number }): Node<EntityNodeData> {
    const id = getNodeId()
    return {
      id,
      type: 'entityNode',
      position: pos,
      data: {
        name: 'Entity',
        fields: [{ name: 'id', type: 'UUID' }],
        onNameChange: handleNameChange,
        onFieldChange: handleFieldChange,
        onFieldAdd: handleFieldAdd,
        onFieldDelete: handleFieldDelete,
        onNodeDelete: handleNodeDelete,
      },
    }
  }

  function addEntity() {
    const offset = () => Math.floor(Math.random() * 200) - 100
    const node = buildNode({ x: 300 + offset(), y: 200 + offset() })
    setNodes((nds) => [...nds, node])
  }

  // â”€â”€ Edge connection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const onConnect = useCallback(
    (connection: Connection) => {
      setPendingConnection(connection)
      setShowRelPopup(true)
    },
    []
  )

  function confirmRelationship(label: string) {
    if (!pendingConnection) return
    const edge: Edge = {
      id: `e-${Date.now()}`,
      source: pendingConnection.source ?? '',
      target: pendingConnection.target ?? '',
      sourceHandle: pendingConnection.sourceHandle ?? undefined,
      targetHandle: pendingConnection.targetHandle ?? undefined,
      label,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#6366f1' },
      labelStyle: { fill: '#a5b4fc', fontSize: 11, fontFamily: 'monospace' },
      labelBgStyle: { fill: '#111116', fillOpacity: 0.9 },
    }
    setEdges((eds) => addEdge(edge, eds))
    setPendingConnection(null)
    setShowRelPopup(false)
  }

  function cancelRelationship() {
    if (pendingConnection) {
      confirmRelationship('1:N')
    } else {
      setShowRelPopup(false)
    }
  }

  // â”€â”€ Derive entities/relationships for AI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  function getModelData() {
    const entities = nodes.map((n) => ({
      name: n.data.name,
      fields: n.data.fields,
    }))
    const relationships = edges.map((e) => {
      const fromNode = nodes.find((n) => n.id === e.source)
      const toNode = nodes.find((n) => n.id === e.target)
      return {
        from: fromNode?.data.name ?? e.source,
        to: toNode?.data.name ?? e.target,
        label: typeof e.label === 'string' ? e.label : '1:N',
      }
    })
    return { entities, relationships }
  }

  // â”€â”€ AI call â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async function sendMessage(userMessage: string) {
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setAiLoading(true)
    const { entities, relationships } = getModelData()
    try {
      const response = await fetch(apiUrl('/api/model-review'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entities, relationships, userMessage }),
      })
      const data = (await response.json()) as { reply: string }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Could not reach the server. Make sure it is running on port 3001.' },
      ])
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-page text-white overflow-hidden">
      {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.08] shrink-0 bg-page z-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="w-px h-4 bg-white/[0.08]" />

        <span className="font-semibold text-sm text-white">Data Modeling</span>

        <div className="flex-1" />

        {/* + Entity */}
        <button
          onClick={addEntity}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-zinc-300 text-sm transition-colors"
        >
          <Plus size={14} />
          Entity
        </button>

        {/* + Relationship */}
        <div className="relative">
          <button
            onClick={() => setShowRelHint((h) => !h)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-zinc-300 text-sm transition-colors"
          >
            <GitFork size={14} />
            Relationship
          </button>
          <AnimatePresence>
            {showRelHint && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full mt-1.5 w-64 bg-card border border-white/[0.12] rounded-xl p-3 text-xs text-zinc-400 shadow-xl z-50"
              >
                Drag from a handle (dot) on one entity to a handle on another entity to draw a relationship.
                <button
                  onClick={() => setShowRelHint(false)}
                  className="absolute top-2 right-2 text-zinc-600 hover:text-zinc-300"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ask AI */}
        <AskAiDropdown onAction={sendMessage} />
      </header>

      {/* â”€â”€ Body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: canvas (60%) */}
        <div className="flex-[3] h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.4 }}
            minZoom={0.3}
            maxZoom={2.5}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: false,
              style: { stroke: '#6366f1' },
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="rgba(255,255,255,0.035)"
            />
            <Controls
              className="!bg-card !border-white/10 !rounded-xl [&>button]:!bg-transparent [&>button]:!border-white/10 [&>button]:!text-zinc-400 [&>button:hover]:!bg-white/10"
              showInteractive={false}
            />
          </ReactFlow>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-zinc-600 text-sm">Click &ldquo;+ Entity&rdquo; to add your first entity</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-white/[0.08] shrink-0" />

        {/* Right: chat (40%) */}
        <div className="flex-[2] h-full overflow-hidden">
          <ChatPanel messages={messages} loading={aiLoading} onSend={sendMessage} />
        </div>
      </div>

      {/* Relationship type popup */}
      {showRelPopup && (
        <RelationshipPopup onSelect={confirmRelationship} onClose={cancelRelationship} />
      )}
    </div>
  )
}

// â”€â”€ Page export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function ModelingPage() {
  return (
    <ReactFlowProvider>
      <ModelingCanvasInner />
    </ReactFlowProvider>
  )
}

