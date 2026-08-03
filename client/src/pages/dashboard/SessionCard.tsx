import type { SessionRecord } from '../../stores/userStore'
import { toTitleCase, relativeTime, gradeClasses, barColor } from './helpers'

const SCORE_LABELS = ['Architecture', 'Scalability', 'Reliability', 'Communication'] as const

export function SessionCard({ record }: { record: SessionRecord }) {
  const title = record.problemTitle && record.problemTitle !== record.problemId
    ? record.problemTitle : toTitleCase(record.problemId)

  return (
    <div className="bg-surface-sunken border border-border-subtle rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-text-primary text-sm font-semibold leading-snug truncate mb-1">{title}</p>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
              record.mode === 'interview'
                ? 'text-red-400 bg-red-500/10 border-red-500/30'
                : 'text-accent bg-accent-soft border-accent-soft-border'
            }`}>{record.mode === 'interview' ? 'Interview' : 'Practice'}</span>
            <span className="text-[10px] text-text-subtle">{relativeTime(record.date)}</span>
          </div>
        </div>
        <span className={`text-lg font-black px-2.5 py-1 rounded-md border shrink-0 ${gradeClasses(record.scores.grade)}`}>
          {record.scores.grade}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {SCORE_LABELS.map(label => {
          const key = label.toLowerCase() as keyof typeof record.scores
          const val = record.scores[key] as number
          return (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[10px] text-text-subtle w-20 shrink-0">{label}</span>
              <div className="flex-1 h-1 bg-border-subtle rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor(val)}`} style={{ width: `${val}%` }} />
              </div>
              <span className="text-[10px] text-text-muted w-5 text-right">{val}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
