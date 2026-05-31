import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, RotateCcw, ChevronRight } from 'lucide-react'
import { useGraphStore } from '../../stores/graphStore'
import type { UseRequestTraceReturn } from './useRequestTrace'

const NODE_COLORS: Record<string, string> = {
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

interface RequestTracerProps {
  trace: UseRequestTraceReturn
}

export const RequestTracer = ({ trace }: RequestTracerProps) => {
  const { active, loading, animating, steps, stepIndex, start, advance, stop } = trace

  if (!active) return null

  const current   = steps[stepIndex]
  const isLast    = stepIndex >= steps.length - 1
  const isReturn  = current?.isReturn ?? false
  const color     = isReturn ? '#22c55e' : (NODE_COLORS[current?.nodeType ?? ''] ?? '#6366f1')
  const progress  = steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 0

  return (
    <AnimatePresence>
      <motion.div
        key="tracer-bar"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="absolute bottom-4 left-4 right-4 z-30 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{ background: 'var(--c-bg-card)' }}
      >
        {/* Progress bar across top */}
        <div className="h-0.5 bg-white/5 relative">
          <motion.div
            className="h-full"
            style={{ background: color }}
            animate={{ width: loading ? '0%' : `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Loading state — AI analyzing whole canvas */}
        {loading && (
          <div className="flex items-center gap-3 px-5 py-5">
            <div className="flex gap-1">
              {[0, 0.15, 0.3].map(d => (
                <motion.div
                  key={d}
                  className="w-2 h-2 rounded-full bg-indigo-400"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
                  transition={{ duration: 0.9, delay: d, repeat: Infinity }}
                />
              ))}
            </div>
            <span className="text-zinc-400 text-sm">Analyzing your architecture…</span>
            <button onClick={stop} className="ml-auto text-zinc-600 hover:text-zinc-400"><X size={14} /></button>
          </div>
        )}

        {/* Active step */}
        {!loading && current && (
          <>
            {/* Header: node name + breadcrumb + step count */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/6">
              <motion.div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: color }}
                animate={{ scale: animating ? [1, 1.4, 1] : [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: animating ? 0.6 : 1.8 }}
              />
              <span className="text-white font-semibold text-sm truncate">{current.nodeLabel}</span>

              {/* Path breadcrumb */}
              {stepIndex > 0 && (
                <div className="flex items-center gap-1 text-zinc-600 text-[10px] overflow-hidden">
                  {steps.slice(Math.max(0, stepIndex - 2), stepIndex).map((s, i) => (
                    <span key={i} className="flex items-center gap-0.5">
                      {i > 0 && <ChevronRight size={8} />}
                      <span className="truncate max-w-[60px]">{s.nodeLabel}</span>
                    </span>
                  ))}
                  <ChevronRight size={8} />
                </div>
              )}

              <span className="text-zinc-600 text-xs ml-auto shrink-0">
                {stepIndex + 1} / {steps.length}
              </span>
              <button onClick={stop} className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0">
                <X size={13} />
              </button>
            </div>

            {/* Explanation */}
            <div className="px-5 py-4">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-zinc-200 text-sm leading-relaxed"
                >
                  {animating ? (
                    <span className="text-zinc-500 italic">Routing request…</span>
                  ) : current.explanation}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Action row */}
            <div className="px-5 pb-4 flex items-center gap-3">
              {isLast ? (
                <>
                  <span className="text-zinc-500 text-xs flex-1">
                    ✓ Response delivered — full round-trip traced
                  </span>
                  <button
                    onClick={start}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white text-xs transition-colors"
                  >
                    <RotateCcw size={11} /> Trace again
                  </button>
                </>
              ) : (
                <>
                  <span className="text-zinc-600 text-xs flex-1">
                    {isReturn ? '← ' : ''}
                    <span className="text-zinc-400">{steps[stepIndex + 1]?.nodeLabel}</span>
                  </span>
                  <button
                    onClick={advance}
                    disabled={animating}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                    style={{
                      background: `${color}20`,
                      border: `1px solid ${color}40`,
                      color,
                    }}
                  >
                    {animating ? 'Routing…' : isReturn ? 'Continue ←' : 'Continue'}
                    <ArrowRight size={13} style={{ transform: isReturn ? 'rotate(180deg)' : 'none' }} />
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
