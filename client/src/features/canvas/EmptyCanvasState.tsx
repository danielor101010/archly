import { Network } from 'lucide-react'

export const EmptyCanvasState = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="text-center max-w-xs">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-4">
        <Network size={28} className="text-zinc-500" />
      </div>
      <h3 className="text-zinc-400 font-medium mb-2">Architecture Canvas</h3>
      <p className="text-zinc-600 text-sm leading-relaxed">
        Describe your system in the chat and the architecture will appear here in real-time
      </p>
      <div className="mt-4 text-xs text-zinc-700 font-mono bg-white/3 rounded-lg p-3 border border-white/5">
        "I'll put a load balancer in front of my API servers..."
      </div>
    </div>
  </div>
)
