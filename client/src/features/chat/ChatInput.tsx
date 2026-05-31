import { useState, useRef, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { useSessionStore } from '../../stores/sessionStore'
import { sendWS } from '../../lib/ws'
import { HintButton } from './HintButton'
import { SolutionButton } from './SolutionButton'

interface ChatInputProps { mode: 'practice' | 'interview' }

const placeholders = {
  interview: 'Describe your architecture...',
  practice: 'Start designing your system...',
}

export const ChatInput = ({ mode }: ChatInputProps) => {
  const [value, setValue] = useState('')
  const { isStreaming, addMessage } = useChatStore()
  const { sessionId } = useSessionStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    // Auto-resize
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }
  }

  const submit = () => {
    const text = value.trim()
    if (!text || isStreaming || !sessionId) return

    addMessage({ role: 'user', content: text })
    sendWS('USER_MESSAGE', { sessionId, content: text })
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const isDisabled = isStreaming || !sessionId

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      <div className={`
        flex items-end gap-2 bg-card border rounded-xl px-3 py-2.5 transition-all duration-150
        ${isDisabled ? 'border-white/5 opacity-60' : 'border-white/10 focus-within:border-indigo-500/40 focus-within:shadow-[0_0_0_1px_rgba(99,102,241,0.2)]'}
      `}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKey}
          placeholder={isStreaming ? 'AI is thinking...' : placeholders[mode]}
          disabled={isDisabled}
          rows={1}
          className="flex-1 bg-transparent text-zinc-200 text-sm placeholder-zinc-600 resize-none outline-none leading-relaxed min-h-[20px] max-h-[120px]"
          style={{ scrollbarWidth: 'none' }}
        />
        <button
          onClick={submit}
          disabled={isDisabled || !value.trim()}
          className="shrink-0 w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <Send size={12} className="text-white" />
        </button>
      </div>
      <div className="flex justify-between mt-1.5 px-1">
        <div className="flex items-center gap-2">
          <HintButton />
          <SolutionButton />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-zinc-700">Enter to send Â· Shift+Enter for newline</span>
          {value.length > 150 && (
            <span className={`text-[10px] font-mono ${value.length > 280 ? 'text-red-400' : 'text-zinc-600'}`}>
              {value.length}/300
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

