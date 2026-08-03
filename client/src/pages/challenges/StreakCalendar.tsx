import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { fadeUp } from './data'

interface Day { label: string; isoDate: string; active: boolean }

export function StreakCalendar({ days }: { days: Day[] }) {
  return (
    <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="rounded-lg border border-border-subtle bg-surface p-5">
      <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
        <Flame size={15} className="text-amber-400" /> Last 14 Days
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => (
          <div key={day.isoDate} className="flex flex-col items-center gap-1">
            <span className="text-xs text-text-subtle font-mono">{day.label}</span>
            <div
              title={day.isoDate}
              className={`w-7 h-7 rounded-md ${day.active ? 'bg-amber-500' : 'bg-surface-elevated border border-border-subtle'}`}
            />
          </div>
        ))}
      </div>
    </motion.div>
  )
}
