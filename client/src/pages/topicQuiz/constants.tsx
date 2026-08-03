import { Zap, AlertTriangle, ArrowRightLeft, Lightbulb } from 'lucide-react'
import type { QuizQuestion } from '../../config/quizQuestions'
import type { ScenarioType } from '../../config/topicScenarios'
import { TOPICS } from '../../config/topics'

export const LEVEL_LABELS: Record<string, string> = {
  learner: 'Learner', junior: 'Junior', mid: 'Mid', senior: 'Senior',
}

export const LEVEL_COLORS: Record<string, string> = {
  learner: 'text-green-400 bg-green-500/10 border-green-500/20',
  junior:  'text-blue-400 bg-blue-500/10 border-blue-500/20',
  mid:     'text-amber-400 bg-amber-500/10 border-amber-500/20',
  senior:  'text-red-400 bg-red-500/10 border-red-500/20',
}

export const TOPIC_TITLES: Record<string, string> = Object.fromEntries(TOPICS.map(t => [t.slug, t.title]))

export const TYPE_CONFIG: Record<ScenarioType, { label: string; icon: React.ReactNode; color: string }> = {
  'scenario':  { label: 'Scenario',  icon: <Zap size={10} />,           color: 'text-accent bg-accent-soft border-accent-soft-border' },
  'edge-case': { label: 'Edge Case', icon: <AlertTriangle size={10} />, color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  'tradeoff':  { label: 'Tradeoff',  icon: <ArrowRightLeft size={10} />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/25' },
  'gotcha':    { label: 'Gotcha',    icon: <Lightbulb size={10} />,     color: 'text-red-400 bg-red-500/10 border-red-500/25' },
}

export const DIFF_BADGE = {
  Easy:   'text-green-400 bg-green-500/10 border-green-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Hard:   'text-red-400 bg-red-500/10 border-red-500/20',
}

export function getLetterGrade(score: number, total: number): { grade: string; color: string } {
  if (total === 0) return { grade: '-', color: 'text-text-muted' }
  const ratio = score / total
  if (ratio >= 0.85) return { grade: 'A', color: 'text-green-400' }
  if (ratio >= 0.70) return { grade: 'B', color: 'text-blue-400' }
  if (ratio >= 0.55) return { grade: 'C', color: 'text-amber-400' }
  if (ratio >= 0.40) return { grade: 'D', color: 'text-orange-400' }
  return { grade: 'F', color: 'text-red-400' }
}

export function selectQuestions(allQuestions: QuizQuestion[], userLevel: string) {
  if (!allQuestions || allQuestions.length === 0) return []
  const easy   = allQuestions.filter(q => q.difficulty === 'Easy')
  const medium = allQuestions.filter(q => q.difficulty === 'Medium')
  const hard   = allQuestions.filter(q => q.difficulty === 'Hard')

  if (easy.length === 0 && medium.length === 0 && hard.length === 0) {
    const cap = userLevel === 'learner' ? 7 : userLevel === 'junior' ? 10 : userLevel === 'mid' ? 12 : 15
    return allQuestions.slice(0, cap)
  }

  switch (userLevel) {
    case 'learner': return [...easy, ...medium.slice(0, 3)].slice(0, 10)
    case 'junior':  return [...easy, ...medium, ...hard.slice(0, 2)].slice(0, 12)
    case 'mid':     return [...medium, ...hard, ...easy.slice(0, 2)].slice(0, 15)
    case 'senior':  return [...hard, ...medium, ...easy].slice(0, 20)
    default:        return allQuestions.slice(0, 10)
  }
}
