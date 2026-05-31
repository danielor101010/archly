import { memo } from 'react'
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow'
import type { EdgeProps } from 'reactflow'
import { useThemeStore } from '../../../stores/themeStore'
import { useGraphStore } from '../../../stores/graphStore'

export const SystemEdge = memo(({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, label, data, selected
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  const theme = useThemeStore(s => s.theme)
  const traceEdgeId      = useGraphStore(s => s.traceEdgeId)
  const traceEdgeReverse = useGraphStore(s => s.traceEdgeReverse)
  const demoRunning      = useGraphStore(s => s.traceHighlightId !== null)
  const isTraceActive    = traceEdgeId === id
  const isAsync = (data as { type?: string })?.type === 'async' || (data as { type?: string })?.type === 'event'
  const isFailed = (data as { health?: string })?.health === 'dead'
  const defaultStroke = theme === 'light' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.18)'

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: isFailed
            ? 'rgba(239,68,68,0.6)'
            : isTraceActive
            ? 'rgba(99,102,241,0.8)'
            : selected
            ? 'rgba(99,102,241,0.9)'
            : defaultStroke,
          strokeWidth: isTraceActive ? 2.5 : selected ? 2 : 1.5,
          strokeDasharray: isAsync ? '6 4' : undefined,
        }}
      />
      {/* Regular tiny dot — hidden during demo so only the demo packet is visible */}
      {!isFailed && !isTraceActive && !demoRunning && (
        <circle r="2.5" fill={isAsync ? '#a855f7' : '#6366f1'} opacity="0.8">
          <animateMotion
            dur={isAsync ? '2.5s' : '1.8s'}
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}
      {/* Demo packet — loops on active edge; reverses direction for response route */}
      {isTraceActive && (() => {
        const kp = traceEdgeReverse ? '1;0' : '0;1'
        const fill = traceEdgeReverse ? '#22c55e' : '#6366f1'
        const glow = traceEdgeReverse ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.35)'
        return (
          <>
            <circle key={`${id}-glow-${traceEdgeReverse}`} r="9" fill="none" stroke={glow} strokeWidth="2.5">
              <animateMotion dur="1.6s" repeatCount="indefinite" keyPoints={kp} keyTimes="0;1" calcMode="linear" path={edgePath} />
            </circle>
            <circle key={`${id}-pkt-${traceEdgeReverse}`} r="5.5" fill={fill} opacity="0.95">
              <animateMotion dur="1.6s" repeatCount="indefinite" keyPoints={kp} keyTimes="0;1" calcMode="linear" path={edgePath} />
            </circle>
          </>
        )
      })()}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="text-[10px] text-zinc-500 bg-card border border-white/8 px-1.5 py-0.5 rounded-md font-mono"
          >
            {label as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

SystemEdge.displayName = 'SystemEdge'
