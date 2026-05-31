import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, Timer, X, User, Home, RotateCcw } from 'lucide-react'
import { useSessionStore } from '../stores/sessionStore'
import { useUserStore } from '../stores/userStore'
import { useUIStore } from '../stores/uiStore'
import { useGraphStore } from '../stores/graphStore'
import { useChatStore } from '../stores/chatStore'
import { useBoardStore } from '../stores/boardStore'
import { wsClient, sendWS } from '../lib/ws'
import { PROBLEMS } from '../config/problems'
import { ScorePanel } from '../components/ScorePanel'
import { ThemeToggle } from '../components/ThemeToggle'
import { ChatInterface } from '../features/chat/ChatInterface'
import { ArchitectureCanvas } from '../features/canvas/ArchitectureCanvas'
import { InterviewBoard } from '../features/board/InterviewBoard'
import { SolutionModal } from '../features/chat/SolutionModal'

interface SessionLayoutProps {
  mode: 'practice' | 'interview'
}

function toTitleCase(s: string) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function MobileBlock({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center px-8 text-center">
      <div className="text-5xl mb-6">🖥️</div>
      <h1 className="text-white font-bold text-2xl mb-3">Desktop Only</h1>
      <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mb-8">
        The system design canvas and split-pane layout require a larger screen. Please open this on a laptop or desktop.
      </p>
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
      >
        ← Go Back
      </button>
    </div>
  )
}

export const SessionLayout = ({ mode }: SessionLayoutProps) => {
  const navigate = useNavigate()
  const isMobile = useMemo(() => window.innerWidth < 768, [])
  const { problemId: urlProblemId } = useParams<{ problemId: string }>()
  const { endSession, startedAt, sessionId, problemId, clearSession } = useSessionStore()
  const { activeBottomPanel, setBottomPanel } = useUIStore()
  const { isCanvasFullscreen, clearGraph } = useGraphStore()
  const { messages, clearMessages } = useChatStore()
  const { clearBoard } = useBoardStore()
  const [elapsed, setElapsed] = useState(0)
  const [splitPct, setSplitPct] = useState(65)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Only show the resume banner when: same problem ID as URL, existing session, and existing messages
  const [showResumeBanner, setShowResumeBanner] = useState<boolean>(() => {
    const state = useSessionStore.getState()
    const chatState = useChatStore.getState()
    return (
      state.sessionId != null &&
      chatState.messages.length > 0 &&
      state.problemId === urlProblemId   // must be the same problem
    )
  })

  useEffect(() => {
    wsClient.connect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (startedAt) setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    setSplitPct(Math.min(80, Math.max(25, pct)))
  }, [])

  const onMouseUp = useCallback(() => {
    isDragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  const startDrag = () => {
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleEnd = () => {
    endSession()
    navigate('/')
  }

  const handleStartFresh = () => {
    // Save before clearing
    const savedProblemId = problemId
    const savedMode = mode
    const userLevel = useUserStore.getState().level

    clearMessages()
    clearGraph()
    clearBoard()
    clearSession()
    useChatStore.getState().closeSolution()
    setShowResumeBanner(false)

    if (savedProblemId) {
      // Restart the same problem without navigating away
      useSessionStore.getState().startSession(savedMode, savedProblemId)
      setTimeout(() => {
        sendWS('CREATE_SESSION', { mode: savedMode, problemId: savedProblemId, userLevel })
      }, 300)
    } else {
      navigate(savedMode === 'practice' ? '/practice' : '/interview')
    }
  }

  const handleContinue = () => {
    setShowResumeBanner(false)
  }

  const modeColor = mode === 'interview' ? 'text-red-400' : 'text-blue-400'
  const modeBg = mode === 'interview' ? 'bg-red-500/10 border-red-500/20' : 'bg-blue-500/10 border-blue-500/20'

  const cvProblem = useUserStore(s => s.cvProblems.find(p => p.id === problemId))
  const stdProblem = PROBLEMS.find(p => p.id === problemId)
  const problemName = cvProblem?.title ?? stdProblem?.title ?? (problemId ? toTitleCase(problemId) : 'Unknown Problem')

  if (isMobile) return <MobileBlock onBack={() => navigate(-1)} />

  return (
    <div className="flex flex-col h-screen bg-page overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-12 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-sm">Arch<span className="text-indigo-400">ly</span></span>
          <button
            onClick={() => navigate('/')}
            className="text-zinc-500 hover:text-zinc-200 transition-colors p-1"
            title="Home"
          >
            <Home size={14} />
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-zinc-500 hover:text-zinc-200 transition-colors p-1"
            title="Profile"
          >
            <User size={14} />
          </button>
          <ThemeToggle />
          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${modeBg} ${modeColor}`}>
            {mode === 'interview' ? 'INTERVIEW' : 'PRACTICE'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-zinc-400 text-sm font-mono">
            <Timer size={14} />
            <span>{formatTime(elapsed)}</span>
          </div>
          <button
            onClick={handleEnd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-white/8 transition-colors"
          >
            <X size={12} />
            End Session
          </button>
        </div>
      </header>

      {/* Resume banner */}
      {showResumeBanner && sessionId && (
        <div className="bg-indigo-950/60 border-b border-indigo-500/25 px-4 py-2.5 flex items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${modeBg} ${modeColor}`}>
              {mode === 'interview' ? 'INTERVIEW' : 'PRACTICE'}
            </span>
            <span className="text-zinc-400 text-xs">Resuming</span>
            <span className="text-white text-sm font-semibold truncate">{problemName}</span>
            <span className="text-zinc-600 text-xs shrink-0">{messages.length} messages</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleStartFresh}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/8 rounded-lg border border-white/10 transition-colors"
            >
              <RotateCcw size={11} />
              Restart Problem
            </button>
            <button
              onClick={handleContinue}
              className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Main: Chat + Resizable Divider + Canvas */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        <div
          style={{ width: isCanvasFullscreen ? '0%' : `${splitPct}%` }}
          className="border-r border-white/8 overflow-hidden flex flex-col min-w-0 transition-all duration-300"
        >
          <ChatInterface mode={mode} />
        </div>

        {/* Drag handle — hidden when fullscreen */}
        {!isCanvasFullscreen && (
          <div
            onMouseDown={startDrag}
            className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-indigo-500/40 active:bg-indigo-500/60 transition-colors duration-150 group relative"
            title="Drag to resize"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full bg-white/10 group-hover:bg-indigo-400/60 transition-colors" />
          </div>
        )}

        <div
          style={{ width: isCanvasFullscreen ? '100%' : `${100 - splitPct}%` }}
          className="overflow-hidden min-w-0 transition-all duration-300"
        >
          <ArchitectureCanvas />
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="border-t border-white/8 shrink-0">
        <div className="flex items-center gap-1 px-4 h-9">
          {(['board', 'score', 'tradeoffs'] as const).map((panel) => (
            <button
              key={panel}
              onClick={() => setBottomPanel(panel)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-colors ${
                activeBottomPanel === panel
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {panel === 'board' ? 'Interview Board' : panel === 'score' ? 'Score' : 'Tradeoffs'}
              {activeBottomPanel === panel ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
            </button>
          ))}
        </div>
        {activeBottomPanel && (
          <div className={`border-t border-white/8 overflow-hidden ${activeBottomPanel === 'board' ? 'h-56' : 'h-40'}`}>
            {activeBottomPanel === 'board' && <InterviewBoard />}
            {activeBottomPanel === 'score' && <ScorePanel />}
            {activeBottomPanel === 'tradeoffs' && (
              <div className="p-4 text-zinc-500 text-sm">
                Tradeoff analysis appears here during your session.
              </div>
            )}
          </div>
        )}
      </div>

      <SolutionModal />
    </div>
  )
}
