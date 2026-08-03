import { useState, useRef, useEffect } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'
import { X } from 'lucide-react'
import type { EntityNodeData } from './types'

const HANDLE_CLASS = '!w-2.5 !h-2.5 !bg-border-strong !border-text-subtle hover:!bg-accent transition-colors'

export function EntityNodeComponent({ id, data, selected }: NodeProps<EntityNodeData>) {
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
    <div className={`bg-surface border rounded-lg min-w-[180px] ${selected ? 'border-accent/60 ring-1 ring-accent/20' : 'border-border-default'}`}>
      <Handle type="source" position={Position.Top} id="top-src" className={HANDLE_CLASS} />
      <Handle type="target" position={Position.Top} id="top-tgt" className={HANDLE_CLASS} style={{ left: '40%' }} />
      <Handle type="source" position={Position.Bottom} id="bottom-src" className={HANDLE_CLASS} />
      <Handle type="target" position={Position.Bottom} id="bottom-tgt" className={HANDLE_CLASS} style={{ left: '60%' }} />
      <Handle type="source" position={Position.Left} id="left-src" className={HANDLE_CLASS} />
      <Handle type="target" position={Position.Left} id="left-tgt" className={HANDLE_CLASS} style={{ top: '40%' }} />
      <Handle type="source" position={Position.Right} id="right-src" className={HANDLE_CLASS} />
      <Handle type="target" position={Position.Right} id="right-tgt" className={HANDLE_CLASS} style={{ top: '60%' }} />

      <div className="bg-accent-soft border-b border-border-subtle px-3 py-2 rounded-t-lg flex items-center justify-between gap-2 group">
        {editingName ? (
          <input
            ref={nameRef}
            defaultValue={data.name}
            onBlur={(e) => { data.onNameChange(id, e.target.value || data.name); setEditingName(false) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { data.onNameChange(id, e.currentTarget.value || data.name); setEditingName(false) }
              if (e.key === 'Escape') setEditingName(false)
            }}
            className="flex-1 bg-transparent text-text-primary text-sm font-semibold outline-none border-b border-accent/60 min-w-0"
          />
        ) : (
          <span className="flex-1 font-semibold text-sm text-text-primary cursor-pointer select-none" onDoubleClick={() => setEditingName(true)} onClick={() => setEditingName(true)}>
            {data.name}
          </span>
        )}
        <button onClick={(e) => { e.stopPropagation(); data.onNodeDelete(id) }} className="opacity-0 group-hover:opacity-100 transition-opacity text-text-subtle hover:text-red-400 nodrag">
          <X size={12} />
        </button>
      </div>

      <div className="py-1">
        {data.fields.map((field, idx) => (
          <div key={idx} className="px-3 py-0.5">
            {editingField === idx ? (
              <div className="flex items-center gap-1 py-0.5">
                <input
                  autoFocus
                  defaultValue={field.name}
                  placeholder="field"
                  onBlur={(e) => data.onFieldChange(id, idx, { ...field, name: e.target.value || field.name })}
                  className="w-20 bg-transparent text-text-primary text-xs font-mono outline-none border-b border-accent/40"
                />
                <span className="text-text-subtle text-xs font-mono">:</span>
                <input
                  defaultValue={field.type}
                  placeholder="type"
                  onBlur={(e) => { data.onFieldChange(id, idx, { name: field.name, type: e.target.value || field.type }); setEditingField(null) }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditingField(null) }}
                  className="w-20 bg-transparent text-text-muted text-xs font-mono outline-none border-b border-accent/40"
                />
                <button onClick={() => data.onFieldDelete(id, idx)} className="text-text-subtle hover:text-red-400 nodrag ml-1">
                  <X size={10} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-0.5 text-xs font-mono cursor-pointer hover:bg-surface-elevated rounded px-0.5 group/field" onClick={() => setEditingField(idx)}>
                <span className="text-text-primary truncate">{field.name}</span>
                <span className="text-text-subtle">: {field.type}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-text-subtle hover:text-text-secondary text-[10px] px-3 py-1.5 cursor-pointer nodrag border-t border-border-subtle" onClick={() => data.onFieldAdd(id)}>
        + field
      </div>
    </div>
  )
}

export const nodeTypes = { entityNode: EntityNodeComponent }
