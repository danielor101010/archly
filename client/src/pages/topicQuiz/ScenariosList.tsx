import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import type { TopicScenario } from '../../config/topicScenarios'
import { TYPE_CONFIG, DIFF_BADGE } from './constants'

interface ScenariosListProps {
  scenarios: TopicScenario[]
  onAskAI: (question: string) => void
}

export function ScenariosList({ scenarios, onAskAI }: ScenariosListProps) {
  if (scenarios.length === 0) {
    return <p className="text-text-subtle text-sm text-center py-10">No scenarios available for this topic yet.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {scenarios.map((s, i) => {
        const tc = TYPE_CONFIG[s.type]
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="bg-surface border border-border-subtle rounded-lg p-4 hover:border-border-default transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 shrink-0">
                <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${tc.color}`}>
                  {tc.icon}{tc.label}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md border ${DIFF_BADGE[s.difficulty]}`}>{s.difficulty}</span>
              </div>
              <button
                onClick={() => onAskAI(s.q)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent-soft hover:bg-accent-soft border border-accent-soft-border text-accent text-[11px] shrink-0 transition-colors"
              >
                <MessageSquare size={10} /> Ask AI
              </button>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">{s.q}</p>
          </motion.div>
        )
      })}
    </div>
  )
}
