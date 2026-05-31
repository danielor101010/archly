import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import type { SystemNodeData } from '../../../stores/graphStore'

export const K8sClusterNode = memo(({ data, selected }: NodeProps<SystemNodeData>) => (
  <div className={`
    w-full h-full rounded-2xl border-2 border-dashed relative overflow-visible
    bg-cyan-500/5
    ${selected ? 'border-cyan-400/70' : 'border-cyan-500/30'}
    ${data.health === 'critical' ? 'border-red-500/60 bg-red-500/5' : ''}
    ${data.health === 'stressed' ? 'border-orange-500/50 bg-orange-500/5' : ''}
  `}>
    <Handle type="target" position={Position.Left} className="!bg-cyan-400/60 !border-cyan-300/40 !w-2 !h-2" />
    {/* Header label inside top of container */}
    <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
      <svg width="14" height="14" viewBox="0 0 32 32" fill="none" className="shrink-0">
        <circle cx="16" cy="16" r="13" stroke="#06b6d4" strokeWidth="2" fill="none"/>
        <circle cx="16" cy="16" r="3" fill="#06b6d4"/>
        {[0,60,120,180,240,300].map((deg, i) => (
          <line key={i}
            x1="16" y1="16"
            x2={16 + 10 * Math.cos((deg - 90) * Math.PI / 180)}
            y2={16 + 10 * Math.sin((deg - 90) * Math.PI / 180)}
            stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round"
          />
        ))}
      </svg>
      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">K8s</span>
      <span className="text-xs text-white/70 font-medium ml-1">{data.label}</span>
    </div>
    <Handle type="source" position={Position.Right} className="!bg-cyan-400/60 !border-cyan-300/40 !w-2 !h-2" />
  </div>
))
K8sClusterNode.displayName = 'K8sClusterNode'
