import { apiUrl } from '../lib/api'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserLevel = 'learner' | 'junior' | 'mid' | 'senior'

export interface CvProblem {
  id: string
  title: string
  description: string
  relevantSkills: string[]
  difficulty: 'junior' | 'mid' | 'senior'
}

export interface SessionRecord {
  id: string
  problemId: string
  problemTitle: string
  mode: 'practice' | 'interview'
  date: number
  scores: {
    architecture: number
    scalability: number
    reliability: number
    communication: number
    overall: number
    grade: string
  }
}

export interface UserProfile {
  name: string
  level: UserLevel
  sessionsCompleted: number
  totalTokensUsed: number
  solvedProblems: string[]
  createdAt: number
  cvText: string
  cvSkills: string[]
  cvProblems: CvProblem[]
  sessionHistory: SessionRecord[]
  streakDays: number
  lastChallengeCompletedDate: string | null
  completedChallengeIds: string[]
  quizProgress: Record<string, { score: number; total: number; grade: string; completedAt: number }>
  googleId?: string
  email?: string
  avatar?: string
}

interface UserState extends UserProfile {
  setName: (name: string) => void
  setLevel: (level: UserLevel) => void
  recordSession: (problemId: string) => void
  addTokens: (n: number) => void
  isAnalyzingCv: boolean
  setCvText: (text: string) => void
  setCvAnalysis: (skills: string[], problems: CvProblem[]) => void
  setAnalyzingCv: (v: boolean) => void
  addSessionRecord: (record: SessionRecord) => void
  recordChallengeComplete: (challengeKey: string) => void
  recordQuizResult: (key: string, score: number, total: number, grade: string) => void
  setGoogleUser: (info: { googleId: string; name: string; email: string; avatar: string }) => void
  signOut: () => void
  restoreProgress: (saved: Partial<UserProfile>) => void
  syncToServer: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: '',
      level: 'junior',
      sessionsCompleted: 0,
      totalTokensUsed: 0,
      solvedProblems: [],
      createdAt: Date.now(),
      cvText: '',
      cvSkills: [],
      cvProblems: [],
      sessionHistory: [],
      isAnalyzingCv: false,
      streakDays: 0,
      lastChallengeCompletedDate: null,
      completedChallengeIds: [],
      quizProgress: {},
      googleId: undefined,
      email: undefined,
      avatar: undefined,

      setName: (name) => set({ name }),

      setLevel: (level) => set({ level }),

      recordSession: (problemId) => {
        const { solvedProblems, sessionsCompleted } = get()
        set({
          sessionsCompleted: sessionsCompleted + 1,
          solvedProblems: solvedProblems.includes(problemId)
            ? solvedProblems
            : [...solvedProblems, problemId],
        })
      },

      addTokens: (n) => set((state) => ({ totalTokensUsed: state.totalTokensUsed + n })),

      setCvText: (text) => set({ cvText: text }),
      setCvAnalysis: (skills, problems) => set({ cvSkills: skills, cvProblems: problems, isAnalyzingCv: false }),
      setAnalyzingCv: (v) => set({ isAnalyzingCv: v }),

      addSessionRecord: (record) => {
        const { solvedProblems, sessionsCompleted, sessionHistory } = get()
        const updatedHistory = [record, ...sessionHistory].slice(0, 50)
        set({
          sessionHistory: updatedHistory,
          sessionsCompleted: sessionsCompleted + 1,
          solvedProblems: solvedProblems.includes(record.problemId)
            ? solvedProblems
            : [...solvedProblems, record.problemId],
        })
        setTimeout(() => get().syncToServer(), 0)
      },

      recordQuizResult: (key, score, total, grade) => {
        const { quizProgress } = get()
        set({
          quizProgress: {
            ...quizProgress,
            [key]: { score, total, grade, completedAt: Date.now() },
          },
        })
        setTimeout(() => get().syncToServer(), 0)
      },

      setGoogleUser: ({ googleId, name, email, avatar }) => {
        set({ googleId, name, email, avatar })
        setTimeout(() => get().syncToServer(), 0)
      },

      signOut: () => set({ name: '', googleId: undefined, email: undefined, avatar: undefined }),

      restoreProgress: (saved) => {
        const cur = get()
        const mergedQuizProgress = { ...(saved.quizProgress ?? {}), ...cur.quizProgress }
        const mergedSolved = Array.from(new Set([...(saved.solvedProblems ?? []), ...cur.solvedProblems]))
        const mergedHistory = [...cur.sessionHistory, ...(saved.sessionHistory ?? [])
          .filter(r => !cur.sessionHistory.some(c => c.id === r.id))].slice(0, 50)
        const mergedChallenges = Array.from(new Set([...(saved.completedChallengeIds ?? []), ...cur.completedChallengeIds]))
        set({
          quizProgress: mergedQuizProgress,
          solvedProblems: mergedSolved,
          sessionHistory: mergedHistory,
          completedChallengeIds: mergedChallenges,
          level: saved.level ?? cur.level,
          sessionsCompleted: Math.max(saved.sessionsCompleted ?? 0, cur.sessionsCompleted),
          totalTokensUsed: Math.max(saved.totalTokensUsed ?? 0, cur.totalTokensUsed),
          streakDays: Math.max(saved.streakDays ?? 0, cur.streakDays),
          lastChallengeCompletedDate: saved.lastChallengeCompletedDate ?? cur.lastChallengeCompletedDate,
        })
      },

      syncToServer: () => {
        const s = get()
        if (!s.googleId) return
        fetch(apiUrl('/api/users/sync'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleId: s.googleId, name: s.name, email: s.email, avatar: s.avatar,
            level: s.level, sessionsCompleted: s.sessionsCompleted, totalTokensUsed: s.totalTokensUsed,
            streakDays: s.streakDays, lastChallengeDate: s.lastChallengeCompletedDate,
            completedChallengeIds: s.completedChallengeIds, solvedProblems: s.solvedProblems,
            createdAt: s.createdAt, quizProgress: s.quizProgress, sessionHistory: s.sessionHistory,
          }),
        }).catch(() => {})
      },

      recordChallengeComplete: (challengeKey) => {
        const { completedChallengeIds, streakDays, lastChallengeCompletedDate } = get()
        if (completedChallengeIds.includes(challengeKey)) return

        const today = new Date().toISOString().slice(0, 10)
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

        let newStreak: number
        if (lastChallengeCompletedDate === yesterday) {
          newStreak = streakDays + 1
        } else if (lastChallengeCompletedDate === today) {
          newStreak = streakDays
        } else {
          newStreak = 1
        }

        set({
          completedChallengeIds: [...completedChallengeIds, challengeKey],
          streakDays: newStreak,
          lastChallengeCompletedDate: today,
        })
      },
    }),
    {
      name: 'sdt-user',
      partialize: (state) => ({
        name: state.name,
        level: state.level,
        sessionsCompleted: state.sessionsCompleted,
        totalTokensUsed: state.totalTokensUsed,
        solvedProblems: state.solvedProblems,
        createdAt: state.createdAt,
        cvText: state.cvText,
        cvSkills: state.cvSkills,
        cvProblems: state.cvProblems,
        sessionHistory: state.sessionHistory,
        streakDays: state.streakDays,
        lastChallengeCompletedDate: state.lastChallengeCompletedDate,
        completedChallengeIds: state.completedChallengeIds,
        quizProgress: state.quizProgress,
        googleId: state.googleId,
        email: state.email,
        avatar: state.avatar,
      }),
    }
  )
)
