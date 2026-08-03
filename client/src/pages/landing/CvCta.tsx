import { motion } from 'framer-motion'
import { ArrowRight, FileSearch } from 'lucide-react'

interface CvCtaProps {
  onClick: () => void
}

export const CvCta = ({ onClick }: CvCtaProps) => (
  <section className="relative z-10 px-4 sm:px-6 pb-16 sm:pb-24">
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="p-6 sm:p-10 md:p-14 rounded-lg bg-surface border border-border-subtle"
      >
        <div className="flex flex-col gap-6">
          <div>
            <p className="flex items-center gap-1.5 text-accent text-xs font-mono font-medium mb-4 uppercase tracking-widest">
              <FileSearch size={12} /> CV gap analysis
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary mb-3">
              Know your gaps before the interview
            </h2>
            <p className="text-text-muted leading-relaxed text-sm max-w-lg">
              Paste your CV and the job description. Get a match score, specific skill gaps,
              and an actionable list of system design topics to study.
            </p>
          </div>
          <button
            onClick={onClick}
            className="self-start flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-md transition-colors text-sm"
          >
            Analyze my CV free <ArrowRight size={15} />
          </button>
        </div>
      </motion.div>
    </div>
  </section>
)
