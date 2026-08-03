import { CheckCircle2, BarChart2, Zap } from 'lucide-react'
import { formatTokens } from './helpers'

interface StatsRowProps {
  solvedCount: number
  sessionsCompleted: number
  totalTokensUsed: number
}

export function StatsRow({ solvedCount, sessionsCompleted, totalTokensUsed }: StatsRowProps) {
  const stats = [
    { icon: CheckCircle2, label: 'Problems', value: solvedCount, color: 'text-green-400' },
    { icon: BarChart2,    label: 'Sessions', value: sessionsCompleted, color: 'text-blue-400' },
    { icon: Zap,          label: 'Tokens',   value: formatTokens(totalTokensUsed), color: 'text-amber-400' },
  ]
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="bg-surface border border-border-subtle rounded-lg p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 mb-1">
            <Icon size={12} className={color} />
            <span className="text-text-subtle text-[11px]">{label}</span>
          </div>
          <span className="text-2xl font-bold text-text-primary">{value}</span>
        </div>
      ))}
    </div>
  )
}
