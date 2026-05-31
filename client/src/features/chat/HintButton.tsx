import { useState } from 'react'
import { Lightbulb, X } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { useSessionStore } from '../../stores/sessionStore'
import { sendWS } from '../../lib/ws'

export const HintButton = () => {
  const [showModal, setShowModal] = useState(false)
  const { isStreaming, setPendingHint } = useChatStore()
  const { sessionId } = useSessionStore()

  const requestHint = () => {
    if (!sessionId) return
    setPendingHint(true)
    sendWS('REQUEST_HINT', { sessionId })
    setShowModal(false)
  }

  if (isStreaming || !sessionId) return null

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 text-[11px] text-amber-400/70 hover:text-amber-400 transition-colors px-2 py-1 rounded-md hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20"
      >
        <Lightbulb size={11} />
        Hint
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center">
                <Lightbulb size={18} className="text-amber-400" />
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                <X size={16} />
              </button>
            </div>
            <h3 className="text-white font-semibold text-base mb-2">Hold on...</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              The struggle is where the learning happens. Are you sure you don't want to sit with it a little longer?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
              >
                You're right, I'll think harder
              </button>
              <button
                onClick={requestHint}
                className="w-full py-2 rounded-xl text-zinc-500 hover:text-zinc-400 text-sm transition-colors"
              >
                Give me a hint anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

