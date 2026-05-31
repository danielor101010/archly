import { useUserStore } from '../stores/userStore'

export interface WeaknessData {
  category: string
  avg: number
  count: number
  color: string
}

export function useWeaknessAnalysis(): WeaknessData[] {
  const history = useUserStore(s => s.sessionHistory)
  if (history.length === 0) return []

  const categories = [
    { key: 'architecture' as const, label: 'Architecture', color: 'indigo' },
    { key: 'scalability' as const, label: 'Scalability', color: 'blue' },
    { key: 'reliability' as const, label: 'Reliability', color: 'purple' },
    { key: 'communication' as const, label: 'Communication', color: 'cyan' },
  ]

  return categories.map(cat => {
    const scores = history.map(s => s.scores[cat.key]).filter(n => n > 0)
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    return { category: cat.label, avg, count: scores.length, color: cat.color }
  }).sort((a, b) => a.avg - b.avg) // weakest first
}
