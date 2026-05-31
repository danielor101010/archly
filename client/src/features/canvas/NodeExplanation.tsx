import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'
import { NODE_DOCS } from '../../data/nodeExplanations'

interface NodeExplanationProps {
  nodeType: string
  nodeLabel: string
  contextText: string | null
  isLoading: boolean
  onClose: () => void
}

export const NodeExplanation = ({ nodeType, nodeLabel, contextText, isLoading, onClose }: NodeExplanationProps) => {
  const doc = NODE_DOCS[nodeType]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!doc) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute bottom-16 right-3 z-20 w-72 bg-card border border-white/10 rounded-xl p-4 shadow-2xl"
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Close"
      >
        <X size={12} />
      </button>

      <div className="pr-8 mb-3">
        <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-0.5">{nodeLabel}</div>
        <div className="text-white font-semibold text-sm">{doc.title}</div>
      </div>

      {/* Context-aware role in this system */}
      <div className="mb-3">
        <div className="text-[10px] text-indigo-400/70 font-medium uppercase tracking-wider mb-1.5">Role in this design</div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-zinc-500 text-xs py-1">
            <div className="w-3 h-3 border border-zinc-600 border-t-indigo-400 rounded-full animate-spin shrink-0" />
            Analyzing your architecture...
          </div>
        ) : contextText ? (
          <p className="text-zinc-300 text-xs leading-relaxed">{contextText}</p>
        ) : (
          <p className="text-zinc-500 text-xs leading-relaxed italic">Start a session to see this node's role in your design.</p>
        )}
      </div>

      {/* Doc links */}
      <div className="border-t border-white/6 pt-2.5 flex flex-col gap-1.5">
        {doc.docLinks.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-indigo-400/70 text-xs hover:text-indigo-300 transition-colors group"
          >
            <ExternalLink size={10} className="shrink-0 opacity-70 group-hover:opacity-100" />
            {link.label}
          </a>
        ))}
      </div>
    </motion.div>
  )
}
