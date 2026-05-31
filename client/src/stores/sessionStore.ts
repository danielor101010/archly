import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SessionState {
  sessionId: string | null
  mode: 'practice' | 'interview' | 'concept' | null
  problemId: string | null
  startedAt: number | null
  isActive: boolean

  setSessionId: (id: string) => void
  startSession: (mode: 'practice' | 'interview' | 'concept', problemId: string) => void
  endSession: () => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: null,
      mode: null,
      problemId: null,
      startedAt: null,
      isActive: false,

      setSessionId: (id) => set({ sessionId: id }),
      startSession: (mode, problemId) => set({ mode, problemId, startedAt: Date.now(), isActive: true }),
      endSession: () => set({ sessionId: null, mode: null, problemId: null, startedAt: null, isActive: false }),
      clearSession: () => set({ sessionId: null, mode: null, problemId: null, startedAt: null, isActive: false }),
    }),
    {
      name: 'sdt-session',
      partialize: (state) => ({
        sessionId: state.sessionId,
        mode: state.mode,
        problemId: state.problemId,
        startedAt: state.startedAt,
      }),
    }
  )
)
