import { TrendingUp } from 'lucide-react'
import type { WeaknessData } from '../../hooks/useWeaknessAnalysis'
import { barColor } from './helpers'

export function WeaknessesPanel({ weaknesses, sessionCount }: { weaknesses: WeaknessData[]; sessionCount: number }) {
  return (
    <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-2">
        <TrendingUp size={13} className="text-text-muted" />
        <p className="text-text-primary font-semibold text-sm">Areas to Focus On</p>
        <span className="text-text-subtle text-[11px] ml-auto">Last {sessionCount} sessions</span>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        {weaknesses.map(w => (
          <div key={w.category} className="flex items-center gap-3">
            <span className="text-[11px] text-text-muted w-24 shrink-0">{w.category}</span>
            <div className="flex-1 h-1.5 bg-border-subtle rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${barColor(w.avg)}`} style={{ width: `${w.avg}%` }} />
            </div>
            <span className={`text-[11px] font-semibold w-8 text-right ${w.avg >= 70 ? 'text-green-400' : w.avg >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {w.avg}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
