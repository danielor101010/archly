import { motion } from 'framer-motion'
import { ArrowRight, FileSearch } from 'lucide-react'

const TRUST_ITEMS = ['25 design problems', 'Live canvas', 'Quiz & concepts', 'Language quizzes', 'CV gap analysis']

interface HeroProps {
  onStart: () => void
  onCv: () => void
}

export const Hero = ({ onStart, onCv }: HeroProps) => (
  <div className="flex-1 min-w-0">
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-accent text-[11px] font-mono font-medium mb-6 uppercase tracking-widest"
    >
      Live canvas · AI interviewer · 25 problems
    </motion.p>

    <motion.h1
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-5 text-text-primary"
    >
      Design systems that work.<br />
      <span className="text-text-muted font-normal text-3xl sm:text-4xl lg:text-5xl">
        Then watch what happens when they don't.
      </span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="text-text-muted text-sm sm:text-base leading-relaxed mb-8 max-w-md"
    >
      A live architecture canvas that builds itself as you talk. An AI interviewer that pushes on every
      vague answer. 25 canonical problems, from URL shorteners to payment systems at $1B/day.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="flex flex-col sm:flex-row gap-3"
    >
      <button
        onClick={onStart}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-md transition-colors text-sm"
      >
        Start for free <ArrowRight size={15} />
      </button>
      <button
        onClick={onCv}
        className="flex items-center justify-center gap-2 px-6 py-3 border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary font-semibold rounded-md transition-colors text-sm"
      >
        <FileSearch size={15} /> Analyze my CV
      </button>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35 }}
      className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-xs text-text-subtle font-mono"
    >
      {TRUST_ITEMS.map(t => (
        <span key={t} className="flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-text-subtle" />{t}
        </span>
      ))}
    </motion.div>
  </div>
)
