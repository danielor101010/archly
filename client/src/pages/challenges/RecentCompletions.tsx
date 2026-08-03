import { motion } from 'framer-motion'
import { CheckCircle2, Flame } from 'lucide-react'
import { formatChallengeKey, fadeUp } from './data'

export function RecentCompletions({ keys }: { keys: string[] }) {
  if (keys.length === 0) {
    return (
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="rounded-lg border border-dashed border-border-default bg-surface/50 p-8 text-center">
        <Flame size={28} strokeWidth={1.75} className="text-text-subtle mx-auto mb-3" />
        <p className="text-sm text-text-muted">No challenges completed yet.</p>
        <p className="text-xs text-text-subtle mt-1">Complete today's challenge to start your streak.</p>
      </motion.div>
    )
  }

  return (
    <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="rounded-lg border border-border-subtle bg-surface p-5">
      <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
        <CheckCircle2 size={15} className="text-green-400" /> Recent Completions
      </h3>
      <ul className="flex flex-col gap-2.5">
        {keys.map(key => {
          const { date, type } = formatChallengeKey(key)
          return (
            <li key={key} className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Completed a challenge on {date}</span>
              <span className={`text-[11px] font-mono uppercase tracking-wide ${type === 'Daily' ? 'text-accent' : 'text-text-muted'}`}>
                {type}
              </span>
            </li>
          )
        })}
      </ul>
    </motion.div>
  )
}
