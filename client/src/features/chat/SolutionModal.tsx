import { useEffect, useRef, useState } from 'react'
import { X, Sparkles, LayoutGrid } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { renderContent } from './solutionModal/markdownRenderer'
import { ClassDiagramView } from './solutionModal/ClassDiagramView'

type TabId = 'solution' | 'diagram'

export const SolutionModal = () => {
  const { solutionText, isSolutionStreaming, isSolutionVisible, closeSolution } = useChatStore()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<TabId>('solution')

  useEffect(() => {
    if (isSolutionStreaming && activeTab === 'solution') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [solutionText, isSolutionStreaming, activeTab])

  useEffect(() => {
    if (isSolutionStreaming) setActiveTab('solution')
  }, [isSolutionStreaming])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSolution() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeSolution])

  if (!isSolutionVisible) return null

  // Strip canvas/board commands — complete ones and any partial trailing ones left by streaming
  const text = (solutionText ?? '')
    .replace(/<canvas:[^>]+\/>/g, '')
    .replace(/<board:[^>]+\/>/g, '')
    .replace(/<canvas:[^<\n]*/g, '')
    .replace(/<board:[^<\n]*/g, '')
    .replace(/\n{3,}/g, '\n\n')
  const diagramReady = !isSolutionStreaming && text.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) closeSolution() }}
    >
      <div className="bg-surface-sunken border border-border-default rounded-lg w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl">

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} strokeWidth={1.75} className="text-accent" />
            <div>
              <div className="text-text-primary font-semibold text-sm">Reference Solution</div>
              <div className="text-text-subtle text-[10px]">Senior engineer level answer</div>
            </div>
          </div>
          <button onClick={closeSolution} className="w-7 h-7 rounded-md flex items-center justify-center text-text-subtle hover:text-text-primary hover:bg-surface-elevated transition-colors" aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-3 pb-0 shrink-0 border-b border-border-subtle">
          <button
            onClick={() => setActiveTab('solution')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
              activeTab === 'solution' ? 'text-text-primary border-accent' : 'text-text-subtle border-transparent hover:text-text-secondary'
            }`}
          >
            <Sparkles size={11} /> Solution
            {isSolutionStreaming && <span className="inline-block w-1 h-3 bg-accent ml-0.5 rounded-sm animate-pulse" />}
          </button>

          <button
            onClick={() => { if (diagramReady) setActiveTab('diagram') }}
            disabled={!diagramReady}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
              activeTab === 'diagram' ? 'text-text-primary border-accent'
              : diagramReady ? 'text-text-subtle border-transparent hover:text-text-secondary'
              : 'text-text-subtle/50 border-transparent cursor-not-allowed'
            }`}
            title={diagramReady ? undefined : 'Available after streaming completes'}
          >
            <LayoutGrid size={11} /> Class Diagram
            {!diagramReady && isSolutionStreaming && <span className="text-[9px] text-text-subtle ml-0.5">…</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
          {activeTab === 'solution' && (
            <>
              {isSolutionStreaming && text === '' ? (
                <div className="flex items-center gap-2 text-text-subtle text-xs">
                  <div className="w-3 h-3 border-2 border-border-default border-t-accent rounded-full animate-spin" />
                  Generating solution…
                </div>
              ) : (
                <div>
                  {renderContent(text)}
                  {isSolutionStreaming && <span className="inline-block w-0.5 h-3.5 bg-accent ml-0.5 animate-pulse" />}
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}

          {activeTab === 'diagram' && <ClassDiagramView text={text} />}
        </div>
      </div>
    </div>
  )
}
