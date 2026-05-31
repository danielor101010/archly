import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Bot, User, Zap, GitBranch, Lightbulb } from 'lucide-react'
import type { Node } from 'reactflow'
import type { ChatMessage } from '../../stores/chatStore'
import type { SystemNodeData } from '../../stores/graphStore'
import { useGraphStore } from '../../stores/graphStore'

interface MessageItemProps {
  message: ChatMessage
  mode: 'practice' | 'interview'
}

// Map keyword → node type
const KEYWORD_TYPE_MAP: { keyword: string; type: string }[] = [
  // Longer/more specific phrases first to avoid partial matches
  { keyword: 'load balancer', type: 'load_balancer' },
  { keyword: 'api gateway', type: 'api_gateway' },
  { keyword: 'message queue', type: 'message_queue' },
  { keyword: 'object storage', type: 'object_storage' },
  { keyword: 'search cluster', type: 'search_cluster' },
  { keyword: 'notification service', type: 'notification_service' },
  { keyword: 'websocket gateway', type: 'websocket_gateway' },
  { keyword: 'websocket', type: 'websocket_gateway' },
  { keyword: 'elasticsearch', type: 'search_cluster' },
  { keyword: 'opensearch', type: 'search_cluster' },
  { keyword: 'cloudfront', type: 'cdn' },
  { keyword: 'memcached', type: 'cache' },
  { keyword: 'rabbitmq', type: 'message_queue' },
  { keyword: 'mongodb', type: 'database' },
  { keyword: 'postgres', type: 'database' },
  { keyword: 'mysql', type: 'database' },
  { keyword: 'kafka', type: 'message_queue' },
  { keyword: 'redis', type: 'cache' },
  { keyword: 'kubernetes', type: 'k8s_cluster' },
  { keyword: 'k8s', type: 'k8s_cluster' },
  { keyword: 'cache', type: 'cache' },
  { keyword: 'database', type: 'database' },
  { keyword: 'cdn', type: 'cdn' },
  { keyword: 's3', type: 'object_storage' },
  { keyword: 'sqs', type: 'message_queue' },
]

// Build a single regex from all keywords (longest first, already ordered above)
const KEYWORDS_PATTERN = new RegExp(
  `(${KEYWORD_TYPE_MAP.map(({ keyword }) => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
  'gi'
)

function highlightComponents(
  text: string,
  nodes: Node<SystemNodeData>[],
  onHighlight: (id: string) => void
): ReactNode {
  // Split on markdown bold/code AND component keywords
  // We process line by line to preserve existing renderContent logic
  const lines = text.split('\n')

  return lines.map((line, lineIdx) => {
    // First split on bold/code markers
    const mdParts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)

    const rendered: ReactNode[] = mdParts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={partIdx} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        )
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={partIdx} className="text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        )
      }

      // Plain text — apply keyword highlighting
      const segments = part.split(KEYWORDS_PATTERN)
      return (
        <span key={partIdx}>
          {segments.map((seg, segIdx) => {
            if (!seg) return null
            // Check if this segment matches a keyword
            const lower = seg.toLowerCase()
            const mapping = KEYWORD_TYPE_MAP.find(({ keyword }) => keyword === lower)
            if (mapping) {
              const matchingNode = nodes.find(n => n.data.type === mapping.type)
              if (matchingNode) {
                return (
                  <button
                    key={segIdx}
                    className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 cursor-pointer"
                    onClick={() => onHighlight(matchingNode.id)}
                  >
                    {seg}
                  </button>
                )
              }
            }
            return <span key={segIdx}>{seg}</span>
          })}
        </span>
      )
    })

    return (
      <span key={lineIdx}>
        {rendered}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    )
  })
}


export const MessageItem = ({ message, mode }: MessageItemProps) => {
  const isUser = message.role === 'user'
  const modeAccent = mode === 'interview' ? 'bg-red-500/20' : 'bg-blue-500/20'
  const ModeIcon = mode === 'interview' ? Zap : Bot
  const { nodes, highlightNode } = useGraphStore()

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 justify-end"
      >
        <div className="bg-indigo-600/80 border border-indigo-500/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
          <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        <div className="w-7 h-7 rounded-full shrink-0 bg-indigo-500/20 flex items-center justify-center">
          <User size={12} className="text-indigo-400" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${modeAccent}`}>
        <ModeIcon size={12} className={mode === 'interview' ? 'text-red-400' : 'text-blue-400'} />
      </div>
      <div className="space-y-1 max-w-[85%]">
        {message.isHint && (
          <div className="flex items-center gap-1 text-[10px] text-amber-400/70 pl-2 mb-1">
            <Lightbulb size={9} />
            Hint
          </div>
        )}
        <div className={`rounded-2xl rounded-tl-sm px-4 py-3 ${message.isHint ? 'border border-amber-500/25 bg-amber-500/5' : 'bg-card border border-white/8'}`}>
          <p className="text-zinc-200 text-sm leading-relaxed">
            {highlightComponents(message.content, nodes, highlightNode)}
          </p>
        </div>
        {message.hasCanvasUpdate && (
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 pl-2">
            <GitBranch size={9} />
            Architecture updated
          </div>
        )}
      </div>
    </motion.div>
  )
}
