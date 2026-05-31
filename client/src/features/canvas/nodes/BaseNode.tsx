import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import type { SystemNodeData } from '../../../stores/graphStore'

// Health state styles
const healthStyles: Record<string, { border: string; glow: string; pulse?: boolean; shake?: boolean }> = {
  healthy: {
    border: 'border-green-500/20',
    glow: '0 0 8px rgba(34,197,94,0.15)',
  },
  elevated: {
    border: 'border-yellow-500/30',
    glow: '0 0 12px rgba(245,158,11,0.25)',
    pulse: true,
  },
  stressed: {
    border: 'border-orange-500/40',
    glow: '0 0 16px rgba(249,115,22,0.35)',
    pulse: true,
  },
  critical: {
    border: 'border-red-500/60',
    glow: '0 0 20px rgba(239,68,68,0.5)',
    shake: true,
  },
  dead: {
    border: 'border-zinc-700/30',
    glow: 'none',
  },
}

const healthDot: Record<string, string> = {
  healthy: 'bg-green-500',
  elevated: 'bg-yellow-500',
  stressed: 'bg-orange-500',
  critical: 'bg-red-500',
  dead: 'bg-zinc-600',
}

interface BaseNodeProps extends NodeProps<SystemNodeData> {
  icon: React.ReactNode
  accentColor?: string
}

export const BaseNode = memo(({ data, selected, icon, accentColor = '#6366f1' }: BaseNodeProps) => {
  const health = data.health || 'healthy'
  const style = healthStyles[health] || healthStyles.healthy
  const isDead = health === 'dead'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{
        opacity: isDead ? 0.35 : 1,
        scale: 1,
        filter: isDead ? 'grayscale(100%)' : 'grayscale(0%)',
        ...(style.shake ? { x: [-2, 2, -2, 2, 0] } : {}),
      }}
      transition={
        style.shake
          ? { x: { repeat: Infinity, duration: 0.35, repeatDelay: 0.8 }, default: { type: 'spring', stiffness: 300, damping: 20 } }
          : { type: 'spring', stiffness: 300, damping: 20 }
      }
      style={{
        boxShadow: style.pulse || style.shake
          ? undefined
          : style.glow,
      }}
      className={`
        relative w-36 bg-card border rounded-xl px-3 py-2.5 cursor-pointer
        transition-colors duration-200
        ${style.border}
        ${selected ? '!border-indigo-500/70 ring-1 ring-indigo-500/30' : ''}
        ${data.isHighlighted ? '!border-indigo-400/80 ring-2 ring-indigo-400/20' : ''}
      `}
    >
      {/* Animated glow for pulse states */}
      {(style.pulse || style.shake) && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: style.shake ? 0.8 : 1.5 }}
          style={{ boxShadow: style.glow, borderRadius: 12 }}
        />
      )}

      {/* Visible handles — Left (target) and Right (source) */}
      <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !bg-zinc-600 !border-zinc-500 hover:!bg-indigo-400 transition-colors" />
      <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-2 !bg-zinc-600 !border-zinc-500 hover:!bg-indigo-400 transition-colors" />
      {/* Hidden handles on Top/Bottom — allows edges from any direction to route cleanly */}
      <Handle type="target" position={Position.Top}    id="top"    style={{ opacity: 0, width: 6, height: 6, top: 0 }} />
      <Handle type="source" position={Position.Top}    id="top-s"  style={{ opacity: 0, width: 6, height: 6, top: 0 }} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ opacity: 0, width: 6, height: 6, bottom: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom-s" style={{ opacity: 0, width: 6, height: 6, bottom: 0 }} />

      {/* Top: icon + health dot */}
      <div className="flex items-center justify-between mb-1.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${accentColor}20` }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {data.isSPOF && (
            <div className="text-red-400 flex items-center" title="Single Point of Failure">
              <AlertTriangle size={10} />
            </div>
          )}
          <div className={`w-1.5 h-1.5 rounded-full ${healthDot[health] ?? 'bg-green-500'} ${health !== 'dead' && health !== 'healthy' ? 'animate-pulse' : ''}`} />
        </div>
      </div>

      {/* Label */}
      <div className="text-white text-xs font-medium leading-tight truncate">{data.label}</div>

      {/* Metrics row */}
      {(data.metrics?.rps !== undefined || data.metrics?.latencyMs !== undefined) && (
        <div className="flex gap-2 mt-1 flex-wrap">
          {data.metrics.rps !== undefined && (
            <span className="text-orange-400 text-[10px] font-mono font-semibold">
              {data.metrics.rps >= 1000 ? `${(data.metrics.rps / 1000).toFixed(1)}k` : data.metrics.rps} rps
            </span>
          )}
          {data.metrics.latencyMs !== undefined && (
            <span className="text-zinc-500 text-[10px] font-mono">{data.metrics.latencyMs}ms</span>
          )}
        </div>
      )}

      {/* Load percentage bar */}
      {data.metrics?.loadPct !== undefined && data.metrics.loadPct > 0 && (
        <div className="mt-1 flex items-center gap-1">
          <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                data.metrics.loadPct > 80 ? 'bg-red-500' : data.metrics.loadPct > 60 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              animate={{ width: `${data.metrics.loadPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className={`text-[10px] font-mono ${data.metrics.loadPct > 80 ? 'text-red-400' : 'text-zinc-400'}`}>
            {data.metrics.loadPct}%
          </span>
        </div>
      )}

      {/* Queue depth */}
      {data.metrics?.queueDepth !== undefined && data.metrics.queueDepth > 0 && (
        <div className="mt-1 flex items-center gap-1">
          <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500/70 transition-all duration-300"
              style={{ width: `${Math.min(100, data.metrics.queueDepth)}%` }}
            />
          </div>
          <span className="text-orange-400 text-[10px] font-mono">{data.metrics.queueDepth}</span>
        </div>
      )}

      {/* SPOF warning */}
      <AnimatePresence>
        {data.isSPOF && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] bg-red-500/90 text-white px-1.5 py-0.5 rounded whitespace-nowrap"
          >
            SPOF
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

BaseNode.displayName = 'BaseNode'

