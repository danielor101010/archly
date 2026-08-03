import { ArrowLeft, MessageSquare } from 'lucide-react'
import type { Topic } from '../../config/topics'
import { LEVEL_LABELS, LEVEL_COLORS } from './constants'

const DIFF_COLOR: Record<string, string> = {
  Beginner: 'text-green-400 bg-green-500/10 border-green-500/20',
  Intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Advanced: 'text-red-400 bg-red-500/10 border-red-500/20',
}

interface QuizHeaderProps {
  topicTitle: string
  topicData?: Topic
  userLevel: string
  questionCount: number
  onBack: () => void
  onChat: () => void
}

export function QuizHeader({ topicTitle, topicData, userLevel, questionCount, onBack, onChat }: QuizHeaderProps) {
  return (
    <>
      <button onClick={onBack} className="flex items-center gap-2 text-text-subtle hover:text-text-secondary text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to {topicTitle}
      </button>

      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary leading-tight">{topicTitle}</h1>
          <button onClick={onChat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent-soft border border-accent-soft-border text-accent text-xs transition-colors shrink-0">
            <MessageSquare size={11} /> <span className="hidden sm:inline">AI </span>Chat
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {topicData && (
            <span className={`text-[11px] px-2 py-0.5 rounded-md border ${DIFF_COLOR[topicData.difficulty]}`}>{topicData.difficulty}</span>
          )}
          <span className={`text-[11px] px-2 py-0.5 rounded-md border ${LEVEL_COLORS[userLevel]}`}>{LEVEL_LABELS[userLevel]}</span>
          <span className="text-text-subtle text-[11px] font-mono">{questionCount} questions</span>
        </div>
      </div>
    </>
  )
}
