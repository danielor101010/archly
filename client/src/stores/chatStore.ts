import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  hasCanvasUpdate?: boolean
  isHint?: boolean
}

interface ChatState {
  messages: ChatMessage[]
  isStreaming: boolean
  streamingContent: string
  pendingHint: boolean
  solutionText: string | null
  isSolutionStreaming: boolean
  isSolutionVisible: boolean

  addMessage: (msg: Pick<ChatMessage, 'role' | 'content'>) => void
  startStreaming: () => void
  appendToStream: (delta: string) => void
  finalizeStream: (cleanText?: string) => void
  clearMessages: () => void
  setPendingHint: (v: boolean) => void
  startSolutionStream: () => void
  appendToSolution: (delta: string) => void
  finalizeSolution: (fullText: string) => void
  closeSolution: () => void
  reopenSolution: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isStreaming: false,
      streamingContent: '',
      pendingHint: false,
      solutionText: null,
      isSolutionStreaming: false,
      isSolutionVisible: false,

      addMessage: (msg) => set((s) => ({
        messages: [...s.messages, { ...msg, id: uuidv4(), timestamp: Date.now() }]
      })),

      startStreaming: () => set({ isStreaming: true, streamingContent: '' }),

      appendToStream: (delta) => {
        const { isStreaming, streamingContent } = get()
        if (!isStreaming) set({ isStreaming: true, streamingContent: '' })
        set({ streamingContent: streamingContent + delta })
      },

      finalizeStream: (cleanText?: string) => {
        const { streamingContent, pendingHint } = get()
        const content = cleanText?.trim() ? cleanText : streamingContent
        if (!content.trim()) { set({ isStreaming: false, streamingContent: '' }); return }
        set((s) => ({
          messages: [...s.messages, { id: uuidv4(), role: 'assistant', content, timestamp: Date.now(), hasCanvasUpdate: true, isHint: s.pendingHint }],
          isStreaming: false,
          streamingContent: '',
          pendingHint: false,
        }))
      },

      clearMessages: () => set({ messages: [], isStreaming: false, streamingContent: '', solutionText: null, isSolutionVisible: false, isSolutionStreaming: false }),

      setPendingHint: (v) => set({ pendingHint: v }),

      startSolutionStream: () => set({ isSolutionStreaming: true, isSolutionVisible: true, solutionText: '' }),
      appendToSolution: (delta) => set(s => ({ solutionText: (s.solutionText ?? '') + delta })),
      finalizeSolution: (fullText) => set({ isSolutionStreaming: false, solutionText: fullText || get().solutionText }),
      closeSolution: () => set({ isSolutionVisible: false, isSolutionStreaming: false }),
      reopenSolution: () => set({ isSolutionVisible: true }),
    }),
    {
      name: 'sdt-chat',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
)
