import { useState, useRef, useEffect } from 'react'
import { ChevronDown, CheckCircle2 } from 'lucide-react'
import type { UserLevel } from '../../stores/userStore'
import { LEVELS, LEVEL_COLORS } from './helpers'

export function LevelDropdown({ value, onChange }: { value: UserLevel; onChange: (l: UserLevel) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const cur = LEVELS.find(l => l.id === value)!

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold transition-colors ${LEVEL_COLORS[value]}`}
      >
        {cur.label}
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-64 bg-surface-elevated border border-border-default rounded-lg shadow-xl overflow-hidden">
          {LEVELS.map(l => (
            <button
              key={l.id}
              onClick={() => { onChange(l.id); setOpen(false) }}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface transition-colors ${
                value === l.id ? 'bg-surface' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold mb-0.5 ${LEVEL_COLORS[l.id].split(' ')[0]}`}>{l.label}</div>
                <p className="text-[11px] text-text-subtle leading-relaxed">{l.desc}</p>
              </div>
              {value === l.id && <CheckCircle2 size={13} className="text-accent shrink-0 mt-0.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
