import { useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useSessionStore } from '../../stores/sessionStore'
import { useChatStore } from '../../stores/chatStore'
import { useGraphStore } from '../../stores/graphStore'
import { useScoreStore } from '../../stores/scoreStore'
import { useUserStore } from '../../stores/userStore'
import { sendWS } from '../../lib/ws'
import { SessionLayout } from '../../layouts/SessionLayout'

export const PracticeSession = () => {
  const { problemId } = useParams<{ problemId: string }>()
  const location = useLocation()
  const customProblem = location.state?.customProblem as { title: string; description: string } | undefined
  const sessionMode = (location.state?.sessionMode ?? 'practice') as 'practice' | 'concept'
  const { startSession } = useSessionStore()
  const { clearMessages, closeSolution } = useChatStore()
  const { clearGraph } = useGraphStore()
  const { reset: resetScore } = useScoreStore()
  const userLevel = useUserStore((s) => s.level)

  useEffect(() => {
    if (!problemId) return
    clearMessages()
    clearGraph()
    resetScore()
    closeSolution()  // clear any solution from a previous session
    startSession(sessionMode, problemId)
    // Session creation is triggered after WS connects and sends CREATE_SESSION
    const timer = setTimeout(() => {
      sendWS('CREATE_SESSION', { mode: sessionMode, problemId, userLevel, ...(customProblem ? { customProblem } : {}) })
    }, 500)
    return () => clearTimeout(timer)
  }, [problemId])

  return <SessionLayout mode="practice" />
}
