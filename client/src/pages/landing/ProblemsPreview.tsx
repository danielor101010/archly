import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { SAMPLE_PROBLEMS, DIFFICULTY_DOT, fadeUp } from './data'

interface ProblemsPreviewProps {
  onOpen: (id?: string) => void
}

export const ProblemsPreview = ({ onOpen }: ProblemsPreviewProps) => (
  <section className="relative z-10 px-4 sm:px-6 pb-16 sm:pb-24">
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="flex items-end justify-between mb-6 sm:mb-8"
      >
        <div>
          <p className="text-xs font-mono font-medium text-accent uppercase tracking-widest mb-2">Problem Bank</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">25 canonical problems</h2>
          <p className="mt-2 text-text-muted text-sm">The list every interviewer at Google, Meta, and Amazon draws from.</p>
        </div>
        <button
          onClick={() => onOpen()}
          className="hidden md:flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover font-medium transition-colors"
        >
          View all 25 problems <ArrowRight size={14} />
        </button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SAMPLE_PROBLEMS.map((p, i) => (
          <motion.div
            key={p.id}
            custom={i}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            onClick={() => onOpen(p.id)}
            className="p-5 rounded-lg bg-surface border border-border-subtle hover:border-border-default cursor-pointer transition-colors duration-150"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-text-primary text-sm">{p.title}</h4>
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wide text-text-subtle">
                <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_DOT[p.difficulty]}`} />
                {p.difficulty}
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed mb-3">{p.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {p.companies.map(c => (
                <span key={c} className="text-xs px-2 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-subtle">
                  {c}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex justify-center mt-8 md:hidden"
      >
        <button onClick={() => onOpen()} className="flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover font-medium transition-colors">
          View all 25 problems <ArrowRight size={14} />
        </button>
      </motion.div>
    </div>
  </section>
)
