import { ZoomIn, ZoomOut, Maximize2, Trash2, ChevronLeft, ChevronRight, Expand, Shrink, Layers, Play, Square } from 'lucide-react'
import { useReactFlow } from 'reactflow'
import { useGraphStore } from '../../stores/graphStore'
import type { UseRequestTraceReturn } from './useRequestTrace'

interface CanvasToolbarProps {
  nodeCount: number
  onTogglePanel: () => void
  panelOpen: boolean
  trace: UseRequestTraceReturn
}

const Btn = ({ onClick, title, active, danger, children }: {
  onClick: () => void; title?: string; active?: boolean; danger?: boolean; children: React.ReactNode
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`h-7 px-1.5 min-w-[28px] flex items-center justify-center rounded-md border transition-colors text-xs ${
      danger
        ? 'border-white/8 text-red-400 hover:text-red-300 hover:bg-red-500/10'
        : active
        ? 'border-indigo-500/40 bg-indigo-500/20 text-indigo-300'
        : 'border-white/8 text-zinc-400 hover:text-white hover:bg-white/10'
    }`}
  >
    {children}
  </button>
)

export const CanvasToolbar = ({ nodeCount, onTogglePanel, panelOpen, trace }: CanvasToolbarProps) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const { clearGraph, snapshots, viewingSnapshotIdx, navigateSnapshot, isCanvasFullscreen, setCanvasFullscreen } = useGraphStore()

  const isViewingHistory = viewingSnapshotIdx !== null
  const currentSnap = isViewingHistory ? viewingSnapshotIdx! : snapshots.length - 1
  const hasHistory = snapshots.length > 1
  const canGoBack = isViewingHistory ? viewingSnapshotIdx! > 0 : snapshots.length >= 2
  const canGoForward = isViewingHistory

  const goBack = () => {
    const target = isViewingHistory ? viewingSnapshotIdx! - 1 : snapshots.length - 2
    if (target >= 0) navigateSnapshot(target)
  }
  const goForward = () => {
    if (!isViewingHistory) return
    const target = viewingSnapshotIdx! + 1
    if (target >= snapshots.length) navigateSnapshot(null)
    else navigateSnapshot(target)
  }

  if (isCanvasFullscreen) {
    // ── Fullscreen: right-side vertical column ────────────────────────────────
    return (
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
        {nodeCount > 0 && (
          <>
            <Btn onClick={() => trace.active ? trace.stop() : trace.start()} active={trace.active} title={trace.active ? 'Stop demo' : 'Demo a request'}>
              {trace.active ? <Square size={10} fill="currentColor" /> : <Play size={11} />}
            </Btn>
            <Btn onClick={onTogglePanel} active={panelOpen} title="Components">
              <Layers size={11} />
            </Btn>
          </>
        )}
        {hasHistory && (
          <div className="flex flex-col gap-0.5 bg-card border border-white/8 rounded-md p-1">
            <button onClick={goBack} disabled={!canGoBack} className="w-6 h-5 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 transition-colors">
              <ChevronLeft size={11} />
            </button>
            <span className="text-[9px] font-mono text-zinc-500 text-center px-0.5">
              {isViewingHistory ? snapshots[viewingSnapshotIdx!]?.turnLabel?.replace('Turn ', 'T') : 'Live'}
            </span>
            <button onClick={goForward} disabled={!canGoForward} className="w-6 h-5 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 transition-colors">
              <ChevronRight size={11} />
            </button>
          </div>
        )}
        <Btn onClick={() => zoomIn()} title="Zoom in"><ZoomIn size={11} /></Btn>
        <Btn onClick={() => zoomOut()} title="Zoom out"><ZoomOut size={11} /></Btn>
        <Btn onClick={() => fitView({ padding: 0.3 })} title="Fit view"><Maximize2 size={11} /></Btn>
        <Btn onClick={() => setCanvasFullscreen(false)} title="Exit fullscreen"><Shrink size={11} /></Btn>
        {nodeCount > 0 && !isViewingHistory && (
          <Btn onClick={() => { if (window.confirm('Clear the canvas?')) clearGraph() }} danger title="Clear canvas">
            <Trash2 size={11} />
          </Btn>
        )}
        {isViewingHistory && (
          <button onClick={() => navigateSnapshot(null)} className="text-[9px] bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-md px-1.5 py-1 hover:bg-amber-500/30 transition-colors">
            Live
          </button>
        )}
      </div>
    )
  }

  // ── Normal mode: horizontal top bar ──────────────────────────────────────────
  return (
    <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5 z-10 pointer-events-none">

      {/* Left group: demo + component panel */}
      {nodeCount > 0 && (
        <div className="pointer-events-auto flex items-center gap-1 px-1.5 py-1 bg-card border border-white/8 rounded-xl">
          <Btn onClick={() => trace.active ? trace.stop() : trace.start()} active={trace.active} title={trace.active ? 'Stop demo' : 'Demo a request'}>
            {trace.active ? <Square size={10} fill="currentColor" /> : <Play size={11} />}
            <span className="ml-1 text-[11px]">{trace.active ? 'Stop' : 'Demo'}</span>
          </Btn>
          <div className="w-px h-4 bg-white/8" />
          <Btn onClick={onTogglePanel} active={panelOpen} title="Components">
            <Layers size={11} />
          </Btn>
        </div>
      )}

      {/* Center group: history navigation */}
      {hasHistory && (
        <div className="pointer-events-auto flex items-center gap-1 px-2 py-1 bg-card border border-white/8 rounded-xl">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Previous turn"
          >
            <ChevronLeft size={12} />
          </button>
          <span className="text-[11px] font-mono text-zinc-400 min-w-[32px] text-center">
            {isViewingHistory ? snapshots[currentSnap]?.turnLabel : 'Live'}
          </span>
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Next turn"
          >
            <ChevronRight size={12} />
          </button>
          {isViewingHistory && (
            <button
              onClick={() => navigateSnapshot(null)}
              className="text-[10px] ml-1 text-amber-400 hover:text-amber-300 transition-colors"
            >
              → Live
            </button>
          )}
        </div>
      )}

      {/* Right group: zoom + fullscreen + clear (pushed to right via ml-auto) */}
      <div className="ml-auto pointer-events-auto flex items-center gap-1 px-1.5 py-1 bg-card border border-white/8 rounded-xl">
        <Btn onClick={() => zoomIn()} title="Zoom in"><ZoomIn size={11} /></Btn>
        <Btn onClick={() => zoomOut()} title="Zoom out"><ZoomOut size={11} /></Btn>
        <Btn onClick={() => fitView({ padding: 0.3 })} title="Fit view"><Maximize2 size={11} /></Btn>
        <div className="w-px h-4 bg-white/8" />
        <Btn onClick={() => setCanvasFullscreen(true)} title="Fullscreen"><Expand size={11} /></Btn>
        {nodeCount > 0 && !isViewingHistory && (
          <>
            <div className="w-px h-4 bg-white/8" />
            <Btn onClick={() => { if (window.confirm('Clear the canvas?')) clearGraph() }} danger title="Clear">
              <Trash2 size={11} />
            </Btn>
          </>
        )}
      </div>
    </div>
  )
}
