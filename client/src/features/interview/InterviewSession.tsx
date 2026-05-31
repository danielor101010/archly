import { useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useSessionStore } from '../../stores/sessionStore'
import { useChatStore } from '../../stores/chatStore'
import { useGraphStore } from '../../stores/graphStore'
import { useScoreStore } from '../../stores/scoreStore'
import { useUserStore } from '../../stores/userStore'
import { sendWS } from '../../lib/ws'
import { SessionLayout } from '../../layouts/SessionLayout'

export const InterviewSession = () => {
  const { problemId } = useParams<{ problemId: string }>()
  const location = useLocation()
  const customProblem = location.state?.customProblem as { title: string; description: string } | undefined
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
    closeSolution()
    startSession('interview', problemId)
    const timer = setTimeout(() => {
      sendWS('CREATE_SESSION', { mode: 'interview', problemId, userLevel, ...(customProblem ? { customProblem } : {}) })
    }, 500)
    return () => clearTimeout(timer)
  }, [problemId])

  return <SessionLayout mode="interview" />
}
