import { useState, useMemo, useCallback, useEffect } from 'react'
import { authFetch } from '../../lib/api'
import { QUIZ_QUESTIONS, type QuizQuestion } from '../../config/quizQuestions'
import { shuffleQuestions } from '../../lib/shuffleQuiz'
import { loadGeneratedQuestions, saveGeneratedQuestions } from '../../lib/quizCache'
import { useUserStore } from '../../stores/userStore'
import { selectQuestions, getLetterGrade } from './constants'

type AnswerMap = Record<number, number>

export function useTopicQuiz(slug: string | undefined, topicTitle: string) {
  const userLevel = useUserStore(s => s.level)
  const allQuestions = slug ? (QUIZ_QUESTIONS[slug] ?? undefined) : undefined
  const questions = useMemo(
    () => shuffleQuestions(selectQuestions(allQuestions ?? [], userLevel)),
    [slug, userLevel, allQuestions],
  )

  const [extraQuestions, setExtraQuestions] = useState<QuizQuestion[]>(() =>
    slug ? shuffleQuestions(loadGeneratedQuestions(slug)) : [])
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')

  // On mount, if localStorage was cleared, fetch cached questions from DB
  useEffect(() => {
    if (!slug) return
    if (loadGeneratedQuestions(slug).length > 0) return
    authFetch('/api/generate-quiz-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicSlug: slug, topicTitle, existingIds: [] }),
    })
      .then(r => r.json())
      .then((data: { questions?: QuizQuestion[] }) => {
        if (data.questions?.length) {
          saveGeneratedQuestions(slug, data.questions)
          setExtraQuestions(shuffleQuestions(data.questions))
        }
      })
      .catch(() => {})
  }, [slug, topicTitle])

  const generateMore = useCallback(async () => {
    if (!slug || generating) return
    setGenerating(true)
    setGenerateError('')
    try {
      const existingIds = [...(allQuestions ?? []), ...extraQuestions, ...loadGeneratedQuestions<{ id: string }>(slug)].map(q => q.id)
      const resp = await authFetch('/api/generate-quiz-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicSlug: slug, topicTitle, existingIds }),
      })
      const data = await resp.json() as { questions?: QuizQuestion[]; error?: string }
      if (data.questions?.length) {
        saveGeneratedQuestions(slug, data.questions)
        setExtraQuestions(prev => [...prev, ...shuffleQuestions(data.questions ?? [])])
      } else {
        setGenerateError(data.error ?? 'No questions returned')
      }
    } catch {
      setGenerateError('Failed to connect to server')
    } finally {
      setGenerating(false)
    }
  }, [slug, topicTitle, allQuestions, extraQuestions, generating])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [showResults, setShowResults] = useState(false)
  const [quizKey, setQuizKey] = useState(0)

  const allActiveQuestions = useMemo(() => [...questions, ...extraQuestions], [questions, extraQuestions])
  const currentQuestion = allActiveQuestions[Math.min(currentIndex, allActiveQuestions.length - 1)]
  const hasAnswered = answers[currentIndex] !== undefined
  const selectedOption = answers[currentIndex]
  const isCorrect = selectedOption === currentQuestion?.correct

  const handleAnswer = (optionIndex: number) => {
    if (hasAnswered) return
    setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }))
  }

  const handleNext = () => {
    if (currentIndex < allActiveQuestions.length - 1) setCurrentIndex(i => i + 1)
    else setShowResults(true)
  }

  const handleRetake = () => {
    setAnswers({})
    setCurrentIndex(0)
    setShowResults(false)
    setQuizKey(k => k + 1)
  }

  const answeredCount = Object.keys(answers).length
  const score = allActiveQuestions.reduce(
    (acc, _, idx) => acc + (answers[idx] === allActiveQuestions[idx].correct ? 1 : 0), 0)
  const { grade, color: gradeColor } = getLetterGrade(score, answeredCount)

  useEffect(() => {
    if (showResults && slug) {
      useUserStore.getState().recordQuizResult(`topic-${slug}`, score, answeredCount, grade)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults])

  return {
    userLevel, allQuestions, allActiveQuestions, currentIndex, currentQuestion,
    hasAnswered, selectedOption, isCorrect, answers, showResults, quizKey,
    generating, generateError, score, answeredCount, grade, gradeColor,
    handleAnswer, handleNext, handleRetake, generateMore, setCurrentIndex, setShowResults,
  }
}
