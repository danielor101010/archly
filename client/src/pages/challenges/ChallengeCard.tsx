import { motion } from 'framer-motion'
import { Clock, Building2, CalendarDays } from 'lucide-react'
import type { Problem } from '../../config/problems'
import { DifficultyDot, CompletedMark } from './DifficultyDot'
import { fadeUp } from './data'

interface ChallengeCardProps {
  index: number
  kind: 'daily' | 'weekly'
  problem: Problem
  isDone: boolean
  countdown: string
  onPractice: () => void
  onInterview: () => void
}

// Daily is the primary, more frequent challenge and gets the accent treatment;
// Weekly is secondary emphasis — a real hierarchy, not a second decorative hue.
export function ChallengeCard({ index, kind, problem, isDone, countdown, onPractice, onInterview }: ChallengeCardProps) {
  const isDaily = kind === 'daily'
  const labelColor = isDaily ? 'text-accent' : 'text-text-muted'

  return (
    <motion.div
      custom={index} variants={fadeUp} initial="hidden" animate="visible"
      className={`rounded-lg border bg-surface p-6 ${isDaily ? 'border-accent-soft-border' : 'border-border-subtle'}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-bold uppercase tracking-widest ${labelColor}`}>
            {isDaily ? 'Daily Challenge' : 'Weekly Challenge'}
          </span>
          {isDaily && <CalendarDays size={14} className="text-accent" />}
        </div>
        <div className="flex items-center gap-3">
          {isDone && <CompletedMark />}
          <DifficultyDot difficulty={problem.difficulty} />
        </div>
      </div>

      <h2 className="text-xl font-bold text-text-primary mb-1">{problem.title}</h2>
      <p className={`text-sm mb-2 ${labelColor}`}>{problem.subtitle}</p>
      <p className="text-sm text-text-muted mb-4">{problem.description}</p>

      <div className="flex flex-wrap items-center gap-3 mb-6 text-xs text-text-subtle font-mono">
        <span className="inline-flex items-center gap-1"><Clock size={12} />{problem.duration}</span>
        <span className="inline-flex items-center gap-1"><Building2 size={12} />{problem.companies.join(', ')}</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        {!isDone ? (
          <div className="flex gap-3">
            <button onClick={onPractice} className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-colors">
              Practice
            </button>
            <button onClick={onInterview} className="px-4 py-2 rounded-md border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary text-sm font-semibold transition-colors">
              Interview
            </button>
          </div>
        ) : (
          <button onClick={onPractice} className="px-4 py-2 rounded-md bg-surface-elevated hover:bg-surface border border-border-subtle text-text-secondary text-sm font-semibold transition-colors">
            Practice again
          </button>
        )}
        <span className="text-xs text-text-subtle font-mono">Resets in {countdown}</span>
      </div>
    </motion.div>
  )
}
