import { create } from 'zustand'

interface Scores {
  architecture: number
  scalability: number
  reliability: number
  communication: number
  overall: number
  grade: string
  verdict: string
}

interface ScoreState {
  scores: Scores
  setScores: (scores: Scores) => void
  reset: () => void
}

const defaultScores: Scores = {
  architecture: 0, scalability: 0, reliability: 0, communication: 0,
  overall: 0, grade: '-', verdict: 'In Progress'
}

export const useScoreStore = create<ScoreState>((set) => ({
  scores: defaultScores,
  setScores: (scores) => set({ scores }),
  reset: () => set({ scores: defaultScores }),
}))
