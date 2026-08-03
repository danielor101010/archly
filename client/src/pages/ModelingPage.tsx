import { useNavigate } from 'react-router-dom'
import ReactFlow, { Background, BackgroundVariant, Controls, ReactFlowProvider } from 'reactflow'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Plus, GitFork, X } from 'lucide-react'
import 'reactflow/dist/style.css'
import { nodeTypes } from './modeling/EntityNode'
import { RelationshipPopup } from './modeling/RelationshipPopup'
import { AskAiDropdown } from './modeling/AskAiDropdown'
import { ChatPanel } from './modeling/ChatPanel'
import { useModelingCanvas } from './modeling/useModelingCanvas'
import { EDGE_STROKE } from './modeling/types'

function ModelingCanvasInner() {
  const navigate = useNavigate()
  const m = useModelingCanvas()

  return (
    <div className="flex flex-col h-screen bg-page text-text-primary overflow-hidden">
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle shrink-0 bg-page z-20">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-subtle hover:text-text-secondary transition-colors">
          <ArrowLeft size={15} /> Back
        </button>

        <div className="w-px h-4 bg-border-subtle" />
        <span className="font-semibold text-sm text-text-primary">Data Modeling</span>
        <div className="flex-1" />

        <button onClick={m.addEntity} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-surface border border-border-subtle text-text-secondary text-sm transition-colors">
          <Plus size={14} /> Entity
        </button>

        <div className="relative">
          <button onClick={() => m.setShowRelHint((h) => !h)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-surface border border-border-subtle text-text-secondary text-sm transition-colors">
            <GitFork size={14} /> Relationship
          </button>
          <AnimatePresence>
            {m.showRelHint && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full mt-1.5 w-64 bg-surface-elevated border border-border-default rounded-lg p-3 text-xs text-text-muted shadow-xl z-50"
              >
                Drag from a handle (dot) on one entity to a handle on another entity to draw a relationship.
                <button onClick={() => m.setShowRelHint(false)} className="absolute top-2 right-2 text-text-subtle hover:text-text-secondary">
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AskAiDropdown onAction={m.sendMessage} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-[3] h-full relative">
          <ReactFlow
            nodes={m.nodes}
            edges={m.edges}
            onNodesChange={m.onNodesChange}
            onEdgesChange={m.onEdgesChange}
            onConnect={m.onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.4 }}
            minZoom={0.3}
            maxZoom={2.5}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{ type: 'smoothstep', animated: false, style: { stroke: EDGE_STROKE } }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.035)" />
            <Controls
              className="!bg-surface-elevated !border-border-default !rounded-lg [&>button]:!bg-transparent [&>button]:!border-border-default [&>button]:!text-text-muted [&>button:hover]:!bg-surface"
              showInteractive={false}
            />
          </ReactFlow>

          {m.nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-text-subtle text-sm">Click &ldquo;+ Entity&rdquo; to add your first entity</p>
            </div>
          )}
        </div>

        <div className="w-px bg-border-subtle shrink-0" />

        <div className="flex-[2] h-full overflow-hidden">
          <ChatPanel messages={m.messages} loading={m.aiLoading} onSend={m.sendMessage} />
        </div>
      </div>

      {m.showRelPopup && <RelationshipPopup onSelect={m.confirmRelationship} onClose={m.cancelRelationship} />}
    </div>
  )
}

export default function ModelingPage() {
  return (
    <ReactFlowProvider>
      <ModelingCanvasInner />
    </ReactFlowProvider>
  )
}
