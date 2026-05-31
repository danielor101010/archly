import { useState } from 'react'
import { Lightbulb, Eye, X, AlertTriangle } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { useSessionStore } from '../../stores/sessionStore'
import { sendWS } from '../../lib/ws'

export const SolutionButton = () => {
  const [showConfirm, setShowConfirm] = useState(false)
  const { isStreaming, isSolutionStreaming, solutionText, startSolutionStream, reopenSolution } = useChatStore()
  const { sessionId } = useSessionStore()

  if (!sessionId) return null

  const hasSolution = solutionText !== null && solutionText !== ''

  const handleConfirm = () => {
    setShowConfirm(false)
    startSolutionStream()
    sendWS('REQUEST_SOLUTION', { sessionId })
  }

  // Solution already exists — show green "View Solution" button
  if (hasSolution) {
    return (
      <button
        onClick={reopenSolution}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-green-500/20 bg-green-500/8 text-green-400 text-xs font-medium hover:bg-green-500/15 transition-colors"
      >
        <Eye size={11} />
        View Solution
      </button>
    )
  }

  // Currently streaming — show disabled state
  if (isSolutionStreaming) {
    return (
      <button
        disabled
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-zinc-500 text-xs font-medium cursor-not-allowed"
      >
        <div className="w-2.5 h-2.5 border border-zinc-600 border-t-indigo-400 rounded-full animate-spin" />
        Generating...
      </button>
    )
  }

  // No solution yet — show yellow button with confirmation modal
  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isStreaming}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-yellow-500/20 bg-yellow-500/8 text-yellow-400 text-xs font-medium hover:bg-yellow-500/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Lightbulb size={11} />
        Solution
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-card border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} className="text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Show perfect solution?</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  This reveals a senior-engineer reference answer — requirements, API design, architecture, and tradeoffs. You'll miss the learning from figuring it out yourself.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
              >
                I'll keep trying
              </button>
              <button
                onClick={handleConfirm}
                className="px-3 py-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white text-xs transition-colors"
              >
                Show it
              </button>
            </div>
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-400"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
