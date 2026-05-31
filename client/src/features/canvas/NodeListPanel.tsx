import { useState } from 'react'
import { X, Pencil, Trash2, Check, AlertTriangle, ArrowRight } from 'lucide-react'
import { useGraphStore } from '../../stores/graphStore'

const TYPE_COLORS: Record<string, string> = {
  client:               '#94a3b8',
  cdn:                  '#06b6d4',
  load_balancer:        '#3b82f6',
  api_gateway:          '#8b5cf6',
  api_service:          '#6366f1',
  cache:                '#eab308',
  database:             '#22c55e',
  message_queue:        '#a855f7',
  search_cluster:       '#f97316',
  object_storage:       '#10b981',
  notification_service: '#ec4899',
  websocket_gateway:    '#0ea5e9',
  k8s_cluster:          '#06b6d4',
}

const TYPE_LABELS: Record<string, string> = {
  client:               'Client',
  cdn:                  'CDN',
  load_balancer:        'Load Balancer',
  api_gateway:          'API Gateway',
  api_service:          'API Service',
  cache:                'Cache',
  database:             'Database',
  message_queue:        'Message Queue',
  search_cluster:       'Search Cluster',
  object_storage:       'Object Storage',
  notification_service: 'Notifications',
  websocket_gateway:    'WebSocket GW',
  k8s_cluster:          'K8s Cluster',
}

interface DeleteConfirmProps {
  nodeId: string
  nodeLabel: string
  partnerLabels: string[]
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirm({ nodeLabel, partnerLabels, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-white/10 rounded-2xl p-5 max-w-xs w-full shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-yellow-400 shrink-0" />
          <h3 className="text-white font-semibold text-sm">Remove "{nodeLabel}"?</h3>
        </div>
        {partnerLabels.length > 0 && (
          <div className="mb-4">
            <p className="text-zinc-400 text-xs mb-2">This will also remove {partnerLabels.length} connection{partnerLabels.length > 1 ? 's' : ''} to:</p>
            <ul className="space-y-1">
              {partnerLabels.map(l => (
                <li key={l} className="flex items-center gap-1.5 text-zinc-300 text-xs">
                  <ArrowRight size={10} className="text-zinc-600" /> {l}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-1.5 rounded-lg border border-white/10 text-zinc-400 text-xs hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs font-medium transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

interface NodeListPanelProps {
  onClose: () => void
}

export const NodeListPanel = ({ onClose }: NodeListPanelProps) => {
  const { nodes, edges, removeNodeById, updateNodeLabel } = useGraphStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const liveNodes = nodes.filter(n => !n.parentId) // show top-level nodes, children appear indented

  const getConnectedPartners = (nodeId: string) => {
    const connected = edges
      .filter(e => e.source === nodeId || e.target === nodeId)
      .map(e => {
        const partnerId = e.source === nodeId ? e.target : e.source
        return nodes.find(n => n.id === partnerId)?.data.label ?? partnerId
      })
    return [...new Set(connected)]
  }

  const startEdit = (id: string, currentLabel: string) => {
    setEditingId(id)
    setEditLabel(currentLabel)
  }

  const saveEdit = () => {
    if (editingId && editLabel.trim()) {
      updateNodeLabel(editingId, editLabel.trim())
    }
    setEditingId(null)
  }

  const handleDelete = (nodeId: string) => {
    const partners = getConnectedPartners(nodeId)
    if (partners.length > 0) {
      setDeleteTarget(nodeId)
    } else {
      removeNodeById(nodeId)
    }
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      // Remove all edges connected to this node
      const connectedEdgeIds = edges
        .filter(e => e.source === deleteTarget || e.target === deleteTarget)
        .map(e => e.id)
      connectedEdgeIds.forEach(eid => {
        useGraphStore.setState(s => ({ edges: s.edges.filter(e => e.id !== eid) }))
      })
      removeNodeById(deleteTarget)
      setDeleteTarget(null)
    }
  }

  const deleteTargetNode = nodes.find(n => n.id === deleteTarget)
  const deletePartners = deleteTarget ? getConnectedPartners(deleteTarget) : []

  return (
    <>
      <div className="absolute top-3 left-3 z-20 w-64 border border-white/10 rounded-xl shadow-2xl overflow-hidden" style={{ background: 'var(--c-bg-card)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/8">
          <span className="text-white text-xs font-semibold">Components ({liveNodes.length})</span>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={13} />
          </button>
        </div>

        {/* Node list */}
        <div className="max-h-80 overflow-y-auto">
          {liveNodes.length === 0 && (
            <p className="text-zinc-600 text-xs text-center py-6">No components yet</p>
          )}
          {liveNodes.map(node => {
            const color = TYPE_COLORS[node.data.type] ?? '#6b7280'
            const typeLabel = TYPE_LABELS[node.data.type] ?? node.data.type
            const isEditing = editingId === node.id
            const childCount = nodes.filter(n => n.parentId === node.id).length

            return (
              <div
                key={node.id}
                className="flex items-center gap-2 px-3 py-2 hover:bg-white/[0.03] border-b border-white/4 last:border-0 group"
              >
                {/* Color dot */}
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />

                {/* Label / editor */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                      onBlur={saveEdit}
                      className="w-full text-xs text-white bg-transparent border-b border-indigo-500/60 outline-none pb-0.5"
                    />
                  ) : (
                    <div>
                      <span className="text-white text-xs truncate block">{node.data.label}</span>
                      <span className="text-zinc-600 text-[10px]">
                        {typeLabel}{childCount > 0 ? ` · ${childCount} pods` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {isEditing ? (
                    <button onClick={saveEdit} className="text-green-400 hover:text-green-300">
                      <Check size={12} />
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(node.id, node.data.label)}
                      className="text-zinc-500 hover:text-zinc-300"
                      title="Rename"
                    >
                      <Pencil size={11} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(node.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && deleteTargetNode && (
        <DeleteConfirm
          nodeId={deleteTarget}
          nodeLabel={deleteTargetNode.data.label}
          partnerLabels={deletePartners}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
