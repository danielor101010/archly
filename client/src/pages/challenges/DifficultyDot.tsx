import type { Problem } from '../../config/problems'

const DOT: Record<Problem['difficulty'], string> = {
  Easy: 'bg-green-400', Medium: 'bg-amber-400', Hard: 'bg-red-400',
}

export function DifficultyDot({ difficulty }: { difficulty: Problem['difficulty'] }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-text-subtle">
      <span className={`w-1.5 h-1.5 rounded-full ${DOT[difficulty]}`} />
      {difficulty}
    </span>
  )
}

export function CompletedMark() {
  return <span className="text-[11px] font-mono uppercase tracking-wide text-green-400">✓ Completed</span>
}
