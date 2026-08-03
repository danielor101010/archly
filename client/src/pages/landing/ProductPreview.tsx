import { motion } from 'framer-motion'

// Neutral by default; the node the chat overlay references gets the accent so
// the eye connects "what the AI is talking about" to "the thing on the canvas."
const NODES = [
  { label: 'Client', x: '4%',  y: '40%', accent: false },
  { label: 'CDN',    x: '4%',  y: '15%', accent: false },
  { label: 'LB',     x: '30%', y: '40%', accent: true },
  { label: 'API',    x: '56%', y: '28%', accent: false },
  { label: 'Cache',  x: '78%', y: '15%', accent: false },
  { label: 'DB',     x: '78%', y: '52%', accent: false },
  { label: 'Queue',  x: '56%', y: '65%', accent: false },
]

const EDGES = [
  [13, 43, 30, 43], [38, 43, 56, 32], [67, 30, 78, 20],
  [67, 34, 78, 56], [63, 40, 63, 65],
]

export const ProductPreview = () => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.15 }}
    className="flex-1 w-full max-w-lg lg:max-w-none hidden lg:block"
  >
    <div className="relative rounded-lg border border-border-default bg-surface shadow-xl flex flex-col overflow-hidden" style={{ aspectRatio: '4/3' }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle">
        <span className="text-text-subtle text-[10px] font-mono">instagram · practice · 00:14:32</span>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> live
        </span>
      </div>

      <div className="relative flex-1 min-h-0 p-5 bg-blueprint-grid">
        {NODES.map((n, i) => (
          <motion.div
            key={n.label}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 300, damping: 22 }}
            className={`absolute flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[10px] font-mono font-medium ${
              n.accent
                ? 'bg-accent-soft border-accent-soft-border text-accent'
                : 'bg-surface-elevated border-border-default text-text-secondary'
            }`}
            style={{ left: n.x, top: n.y }}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${n.accent ? 'bg-accent' : 'bg-text-subtle'}`} />
            {n.label}
          </motion.div>
        ))}

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {EDGES.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
              stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 3" />
          ))}
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.35 }}
          className="absolute bottom-4 left-4 right-4 rounded-md px-3 py-2.5 border border-border-default bg-surface-elevated"
        >
          <p className="text-[10px] text-text-muted leading-relaxed">
            <span className="text-accent font-mono font-semibold">AI: </span>
            You added a load balancer — good. But what happens when the LB itself goes down? What's your redundancy plan?
          </p>
        </motion.div>
      </div>
    </div>
  </motion.div>
)
