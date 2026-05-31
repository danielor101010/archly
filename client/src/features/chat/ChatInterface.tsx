import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '../../stores/chatStore'
import { MessageItem } from './MessageItem'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { Bot, Zap } from 'lucide-react'

interface ChatInterfaceProps { mode: 'practice' | 'interview' | 'concept' | string }

export const ChatInterface = ({ mode }: ChatInterfaceProps) => {
  const { messages, isStreaming, streamingContent } = useChatStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const modeAccent = mode === 'interview' ? 'text-red-400' : mode === 'concept' ? 'text-emerald-400' : 'text-blue-400'
  const modeLabel = mode === 'interview' ? 'AI Interviewer' : mode === 'concept' ? 'AI Tutor' : 'Practice Coach'
  const ModeIcon = mode === 'interview' ? Zap : Bot

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8 shrink-0">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-current/10 ${modeAccent}`}>
          <ModeIcon size={12} className={modeAccent} />
        </div>
        <span className={`text-xs font-medium ${modeAccent}`}>{modeLabel}</span>
        {isStreaming && (
          <span className="text-[10px] text-zinc-500 ml-2 animate-pulse">thinking…</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} mode={mode} />
          ))}
        </AnimatePresence>

        {/* Typing indicator shown for the full duration — response loads in background */}
        <AnimatePresence>
          {isStreaming && <TypingIndicator mode={mode} />}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <ChatInput mode={mode} />
    </div>
  )
}

