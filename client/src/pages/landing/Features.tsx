import { motion } from 'framer-motion'
import { FEATURES, fadeUp } from './data'

export const Features = () => (
  <section className="relative z-10 px-4 sm:px-6 pb-16 sm:pb-24">
    <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
      {FEATURES.map((f, i) => (
        <motion.div
          key={f.title}
          custom={i}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="p-6 rounded-lg bg-surface border border-border-subtle hover:border-border-default transition-colors duration-200"
        >
          <f.icon size={20} strokeWidth={1.75} className="text-accent mb-4" />
          <h3 className="text-base font-semibold text-text-primary mb-2">{f.title}</h3>
          <p className="text-sm text-text-muted leading-relaxed">{f.description}</p>
        </motion.div>
      ))}
    </div>
  </section>
)
