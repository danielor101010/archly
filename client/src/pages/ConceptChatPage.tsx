import { useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import { ChatInterface } from '../features/chat/ChatInterface'
import { useChatStore } from '../stores/chatStore'
import { useGraphStore } from '../stores/graphStore'
import { useSessionStore } from '../stores/sessionStore'
import { useUserStore } from '../stores/userStore'
import { wsClient, sendWS } from '../lib/ws'
import { TOPICS } from '../config/topics'
import { ThemeToggle } from '../components/ThemeToggle'

export const ConceptChatPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const openingQuestion = (location.state as { question?: string } | null)?.question
  const { clearMessages } = useChatStore()
  const { clearGraph } = useGraphStore()
  const { startSession } = useSessionStore()
  const userLevel = useUserStore(s => s.level)

  const topic = TOPICS.find(t => t.slug === slug)
  const topicTitle = topic?.title ?? (slug?.replace(/-/g, ' ') ?? 'Topic')

  useEffect(() => {
    if (!slug) return
    wsClient.connect()
    clearMessages()
    clearGraph()
    startSession('concept', `topic-${slug}`)
    const timer = setTimeout(() => {
      sendWS('CREATE_SESSION', {
        mode: 'concept',
        problemId: `topic-${slug}`,
        userLevel,
        customProblem: {
          title: `Deep Dive: ${topicTitle}`,
          description: openingQuestion
            ? `Start by discussing this specific question with the user: "${openingQuestion}" — then explore the topic. This is a teaching conversation, not a design interview.`
            : `Teach and quiz on ${topicTitle} concepts. This is a learning conversation, not a design interview.`,
        },
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [slug, openingQuestion])

  return (
    <div className="flex flex-col h-screen bg-page overflow-hidden">
      <header className="relative flex items-center justify-between px-4 h-12 border-b border-white/8 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
        >
          <ArrowLeft size={14} /> <span className="hidden sm:inline">Back</span>
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
          <span className="text-white font-semibold text-sm truncate max-w-[180px] sm:max-w-none">{topicTitle}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-medium hidden sm:inline">
            LEARNING
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => navigate(`/quiz/${slug}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
          >
            <HelpCircle size={12} /> Take Quiz
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ChatInterface mode="concept" />
      </div>
    </div>
  )
}
