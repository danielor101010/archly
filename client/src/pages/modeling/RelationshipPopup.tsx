import { AnimatePresence, motion } from 'framer-motion'
import { RELATIONSHIP_LABELS } from './types'

interface RelPopupProps {
  onSelect: (label: string) => void
  onClose: () => void
}

export function RelationshipPopup({ onSelect, onClose }: RelPopupProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className="bg-surface-elevated border border-border-default rounded-lg p-4 shadow-2xl w-64" onClick={(e) => e.stopPropagation()}>
          <p className="text-xs text-text-muted mb-3 font-medium">Select relationship type</p>
          <div className="grid grid-cols-2 gap-2">
            {RELATIONSHIP_LABELS.map((label) => (
              <button
                key={label}
                onClick={() => onSelect(label)}
                className="px-3 py-2 rounded-md bg-surface hover:bg-accent-soft border border-border-subtle hover:border-accent-soft-border text-sm text-text-secondary hover:text-text-primary transition-colors font-mono"
              >
                {label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="mt-3 w-full text-xs text-text-subtle hover:text-text-secondary">
            Cancel (use 1:N)
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
