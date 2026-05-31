import { motion } from 'framer-motion'
import { Bot, Zap } from 'lucide-react'

export const TypingIndicator = ({ mode = 'practice' }: { mode?: 'practice' | 'interview' | 'concept' }) => {
  const ModeIcon = mode === 'interview' ? Zap : Bot
  const accent = mode === 'interview' ? 'bg-red-500/20' : mode === 'concept' ? 'bg-emerald-500/20' : 'bg-blue-500/20'
  const dotColor = mode === 'interview' ? 'bg-red-400' : mode === 'concept' ? 'bg-emerald-400' : 'bg-blue-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3"
    >
      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${accent}`}>
        <ModeIcon size={12} className={mode === 'interview' ? 'text-red-400' : 'text-blue-400'} />
      </div>
      <div className="bg-card border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

