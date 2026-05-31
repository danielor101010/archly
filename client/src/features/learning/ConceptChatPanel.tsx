import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { useSessionStore } from '../../stores/sessionStore'
import { useGraphStore } from '../../stores/graphStore'
import { useUserStore } from '../../stores/userStore'
import { wsClient, sendWS } from '../../lib/ws'
import { MessageItem } from '../chat/MessageItem'
import { TypingIndicator } from '../chat/TypingIndicator'

interface ConceptChatPanelProps {
  topicSlug: string
  topicTitle: string
}

export const ConceptChatPanel = ({ topicSlug, topicTitle }: ConceptChatPanelProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [sessionStarted, setSessionStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, isStreaming, clearMessages, addMessage } = useChatStore()
  const { sessionId, startSession } = useSessionStore()
  const { clearGraph } = useGraphStore()
  const userLevel = useUserStore(s => s.level)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  const startConceptSession = useCallback(() => {
    if (sessionStarted) return
    setSessionStarted(true)
    wsClient.connect()
    clearMessages()
    clearGraph()
    startSession('concept', `topic-${topicSlug}`)
    setTimeout(() => {
      sendWS('CREATE_SESSION', {
        mode: 'concept',
        problemId: `topic-${topicSlug}`,
        userLevel,
        customProblem: {
          title: `Deep Dive: ${topicTitle}`,
          description: `Teach and quiz on ${topicTitle} concepts. This is a learning conversation — never ask to design a system.`,
        },
      })
    }, 300)
  }, [topicSlug, topicTitle, userLevel, sessionStarted])

  const handleOpen = () => {
    setIsOpen(true)
    startConceptSession()
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const submit = () => {
    const text = input.trim()
    if (!text || isStreaming || !sessionId) return
    addMessage({ role: 'user', content: text })
    sendWS('USER_MESSAGE', { sessionId, content: text })
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 100)}px`
    }
  }

  const unreadCount = !isOpen && messages.filter(m => m.role === 'assistant').length

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={handleOpen}
            className="fixed bottom-5 right-5 z-40 w-14 h-14 sm:w-14 sm:h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/50 flex items-center justify-center transition-colors touch-manipulation"
            title={`Ask AI about ${topicTitle}`}
          >
            <MessageCircle size={22} className="text-white" />
            {!!unreadCount && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Slide-in panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (subtle) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={handleClose}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              className="fixed right-0 top-0 bottom-0 z-40 w-full sm:w-[380px] flex flex-col shadow-2xl"
              style={{ background: 'var(--c-bg-card)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/8 shrink-0">
                <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <Bot size={14} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold leading-tight">{topicTitle}</p>
                  <p className="text-emerald-400 text-[10px]">AI Tutor</p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && !isStreaming && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Bot size={20} className="text-emerald-400" />
                    </div>
                    <p className="text-zinc-400 text-sm">Starting up…</p>
                  </div>
                )}
                {messages.map(msg => (
                  <MessageItem key={msg.id} message={msg} mode="concept" />
                ))}
                {isStreaming && <TypingIndicator mode="concept" />}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-3 pb-3 pt-2 shrink-0 border-t border-white/8">
                <div className={`
                  flex items-end gap-2 bg-white/5 border rounded-xl px-3 py-2 transition-all
                  ${isStreaming || !sessionId ? 'border-white/5 opacity-60' : 'border-white/10 focus-within:border-indigo-500/40'}
                `}>
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKey}
                    placeholder={isStreaming ? 'AI is thinking…' : 'Ask anything about this topic…'}
                    disabled={isStreaming || !sessionId}
                    rows={1}
                    className="flex-1 bg-transparent text-zinc-200 text-sm placeholder-zinc-600 resize-none outline-none leading-relaxed min-h-[20px] max-h-[100px]"
                    style={{ scrollbarWidth: 'none' }}
                  />
                  <button
                    onClick={submit}
                    disabled={isStreaming || !sessionId || !input.trim()}
                    className="shrink-0 w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 flex items-center justify-center transition-colors"
                  >
                    <Send size={12} className="text-white" />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-700 mt-1 px-1">Enter to send · Shift+Enter for newline</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
