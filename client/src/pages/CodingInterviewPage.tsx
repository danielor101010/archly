import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Code2, X } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import { useSessionStore } from '../stores/sessionStore'
import { useUserStore } from '../stores/userStore'
import { wsClient, sendWS } from '../lib/ws'

export const CodingInterviewPage = () => {
  const navigate = useNavigate()
  const level = useUserStore((s) => s.level)
  const sessionId = useSessionStore((s) => s.sessionId)

  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const streamingContent = useChatStore((s) => s.streamingContent)
  const clearMessages = useChatStore((s) => s.clearMessages)
  const startStreaming = useChatStore((s) => s.startStreaming)

  const [input, setInput] = useState('')
  const [code, setCode] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionStarted = useRef(false)

  // Connect and start coding session on mount
  useEffect(() => {
    if (sessionStarted.current) return
    sessionStarted.current = true

    clearMessages()
    wsClient.connect()

    // Small delay to allow connection to establish if not already open
    const timer = setTimeout(() => {
      sendWS('CREATE_SESSION', {
        mode: 'coding',
        problemId: 'coding-interview',
        userLevel: level,
      })
    }, 200)

    return () => clearTimeout(timer)
  }, [level, clearMessages])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearMessages()
    }
  }, [clearMessages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const sendMessage = (content: string) => {
    if (!content.trim() || !sessionId) return
    startStreaming()
    sendWS('USER_MESSAGE', { sessionId, content })
    setInput('')
  }

  const handleSend = () => sendMessage(input)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSubmitCode = () => {
    if (!code.trim() || !sessionId) return
    const codeMessage = `[CODE SUBMISSION]\n\`\`\`\n${code}\n\`\`\``
    sendMessage(codeMessage)
    setCode('')
  }

  const handleEnd = () => {
    clearMessages()
    navigate('/dashboard')
  }

  return (
    <div className="h-screen bg-page text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 h-14 border-b border-white/[0.06] flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-indigo-400" />
            <span className="text-sm font-semibold text-white">Coding Interview</span>
          </div>
        </div>
        <button
          onClick={handleEnd}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors border border-white/[0.06] hover:border-red-400/30 px-3 py-1.5 rounded-lg"
        >
          <X size={13} />
          End Session
        </button>
      </div>

      {/* Main split panel */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Chat Panel (~55%) */}
        <div className="flex flex-col" style={{ width: '55%', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.length === 0 && !isStreaming && (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-zinc-600">Connecting to interviewer...</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-zinc-800/60 text-zinc-200 rounded-bl-sm border border-white/[0.06]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Streaming bubble */}
            {isStreaming && streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 bg-zinc-800/60 border border-white/[0.06] text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {streamingContent}
                  <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
                </div>
              </div>
            )}

            {/* Typing indicator */}
            {isStreaming && !streamingContent && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-zinc-800/60 border border-white/[0.06]">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 border-t border-white/[0.06] p-4">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer... (Enter to send, Shift+Enter for newline)"
                rows={3}
                className="flex-1 bg-card border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !sessionId || isStreaming}
                className="self-end flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Code Editor (~45%) */}
        <div className="flex flex-col" style={{ width: '45%' }}>
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Code Editor</span>
            </div>
            <span className="text-xs text-zinc-600">Paste or type your solution</span>
          </div>

          <div className="flex-1 flex flex-col p-4 gap-3 min-h-0">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste or type your code here..."
              className="flex-1 bg-page border border-white/[0.06] rounded-xl px-4 py-4 text-sm text-zinc-200 placeholder-zinc-700 resize-none focus:outline-none focus:border-indigo-500/30 transition-colors min-h-0"
              style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}
              spellCheck={false}
            />

            <button
              onClick={handleSubmitCode}
              disabled={!code.trim() || !sessionId || isStreaming}
              className="flex-shrink-0 w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-700 disabled:cursor-not-allowed text-zinc-200 text-sm font-semibold rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-150"
            >
              <Send size={14} />
              Submit Code to AI
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

