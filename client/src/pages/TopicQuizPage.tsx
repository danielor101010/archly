import { useState, useMemo, useCallback, useEffect } from 'react'
import { apiUrl } from '../lib/api'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, MessageSquare, Zap, AlertTriangle, ArrowRightLeft, Lightbulb, Sparkles } from 'lucide-react'
import { QUIZ_QUESTIONS } from '../config/quizQuestions'
import { shuffleQuestions } from '../lib/shuffleQuiz'
import { loadGeneratedQuestions, saveGeneratedQuestions } from '../lib/quizCache'
import { TOPIC_SCENARIOS, type ScenarioType } from '../config/topicScenarios'
import { TOPICS } from '../config/topics'
import { useUserStore } from '../stores/userStore'

const LEVEL_LABELS: Record<string, string> = {
  learner: 'Learner',
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
}

const LEVEL_COLORS: Record<string, string> = {
  learner: 'text-green-400 bg-green-500/10 border-green-500/20',
  junior: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  mid: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  senior: 'text-red-400 bg-red-500/10 border-red-500/20',
}

function selectQuestions(allQuestions: ReturnType<typeof QUIZ_QUESTIONS[string]>, userLevel: string) {
  if (!allQuestions || allQuestions.length === 0) return []
  const easy   = allQuestions.filter(q => q.difficulty === 'Easy')
  const medium = allQuestions.filter(q => q.difficulty === 'Medium')
  const hard   = allQuestions.filter(q => q.difficulty === 'Hard')

  // If no questions have difficulty tags, return all questions up to level cap
  if (easy.length === 0 && medium.length === 0 && hard.length === 0) {
    const cap = userLevel === 'learner' ? 7 : userLevel === 'junior' ? 10 : userLevel === 'mid' ? 12 : 15
    return allQuestions.slice(0, cap)
  }

  switch (userLevel) {
    case 'learner': return [...easy, ...medium.slice(0, 3)].slice(0, 10)
    case 'junior':  return [...easy, ...medium, ...hard.slice(0, 2)].slice(0, 12)
    case 'mid':     return [...medium, ...hard, ...easy.slice(0, 2)].slice(0, 15)
    case 'senior':  return [...hard, ...medium, ...easy].slice(0, 20)
    default:        return allQuestions.slice(0, 10)
  }
}

const TOPIC_TITLES: Record<string, string> = Object.fromEntries(
  TOPICS.map(t => [t.slug, t.title])
)

const typeConfig: Record<ScenarioType, { label: string; icon: React.ReactNode; color: string }> = {
  'scenario':   { label: 'Scenario',   icon: <Zap size={10} />,           color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25' },
  'edge-case':  { label: 'Edge Case',  icon: <AlertTriangle size={10} />,  color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25' },
  'tradeoff':   { label: 'Tradeoff',   icon: <ArrowRightLeft size={10} />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/25' },
  'gotcha':     { label: 'Gotcha',     icon: <Lightbulb size={10} />,      color: 'text-red-400 bg-red-500/10 border-red-500/25' },
}

const diffBadge = {
  Easy:   'text-green-400 bg-green-500/10 border-green-500/20',
  Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  Hard:   'text-red-400 bg-red-500/10 border-red-500/20',
}

const TOPIC_DIFFICULTY: Record<string, { label: string; color: string }> = {
  'load-balancing': { label: 'Beginner', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  'caching': { label: 'Beginner', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  'queues': { label: 'Intermediate', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  'databases': { label: 'Intermediate', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  'cap-theorem': { label: 'Advanced', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
}

function getLetterGrade(score: number, total: number): { grade: string; color: string } {
  if (total === 0) return { grade: '-', color: 'text-zinc-400' }
  const ratio = score / total
  if (ratio >= 0.85) return { grade: 'A', color: 'text-green-400' }
  if (ratio >= 0.70) return { grade: 'B', color: 'text-blue-400' }
  if (ratio >= 0.55) return { grade: 'C', color: 'text-yellow-400' }
  if (ratio >= 0.40) return { grade: 'D', color: 'text-orange-400' }
  return { grade: 'F', color: 'text-red-400' }
}

type AnswerMap = Record<number, number>

export const TopicQuizPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const topicTitle = slug ? TOPIC_TITLES[slug] ?? slug : ''
  const userLevel = useUserStore(s => s.level)
  const topicData = TOPICS.find(t => t.slug === slug)
  const scenarios = slug ? (TOPIC_SCENARIOS[slug] ?? []) : []
  const allQuestions = slug ? (QUIZ_QUESTIONS[slug] ?? undefined) : undefined
  const questions = useMemo(
    () => shuffleQuestions(selectQuestions(allQuestions ?? [], userLevel)),
    [slug, userLevel]
  )
  const [activeTab, setActiveTab] = useState<'quiz' | 'scenarios'>('quiz')
  const [extraQuestions, setExtraQuestions] = useState<typeof allQuestions>(() =>
    slug ? shuffleQuestions(loadGeneratedQuestions(slug)) : []
  )
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')

  const generateMore = useCallback(async () => {
    if (!slug || generating) return
    setGenerating(true)
    setGenerateError('')
    try {
      const existingIds = [...(allQuestions ?? []), ...(extraQuestions ?? [])].map(q => q.id)
      const resp = await fetch(apiUrl('/api/generate-quiz-questions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicSlug: slug, topicTitle, existingIds }),
      })
      const data = await resp.json() as { questions?: typeof allQuestions; error?: string }
      if (data.questions?.length) {
        saveGeneratedQuestions(slug, data.questions)
        setExtraQuestions(prev => [...(prev ?? []), ...shuffleQuestions(data.questions ?? [])])
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

  if (!allQuestions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-zinc-400 text-lg mb-4">Quiz not available for this topic yet.</p>
          <button
            onClick={() => navigate('/learn')}
            className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
          >
            ← Back to Learning Hub
          </button>
        </div>
      </div>
    )
  }

  const allActiveQuestions = useMemo(
    () => [...questions, ...(extraQuestions ?? [])],
    [questions, extraQuestions]
  )

  const currentQuestion = allActiveQuestions[Math.min(currentIndex, allActiveQuestions.length - 1)]
  const hasAnswered = answers[currentIndex] !== undefined
  const selectedOption = answers[currentIndex]
  const isCorrect = selectedOption === currentQuestion?.correct

  const handleAnswer = (optionIndex: number) => {
    if (hasAnswered) return
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }))
  }

  const handleNext = () => {
    if (currentIndex < allActiveQuestions.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      setShowResults(true)
    }
  }

  const handleRetake = () => {
    setAnswers({})
    setCurrentIndex(0)
    setShowResults(false)
    setQuizKey((k) => k + 1)
  }

  const handleInterviewMe = () => {
    navigate(`/concept/${slug}`)
  }

  const answeredCount = Object.keys(answers).length
  const score = allActiveQuestions.reduce(
    (acc, _, idx) => acc + (answers[idx] === allActiveQuestions[idx].correct ? 1 : 0),
    0,
  )
  const { grade, color: gradeColor } = getLetterGrade(score, answeredCount)

  useEffect(() => {
    if (showResults && slug) {
      useUserStore.getState().recordQuizResult(`topic-${slug}`, score, answeredCount, grade)
    }
  }, [showResults])

  const optionPrefix = ['A', 'B', 'C', 'D']

  return (
    <div className="min-h-screen bg-page p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(topicData?.hasContent ? `/learn/${slug}` : '/learn')}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to {topicTitle}
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{topicTitle}</h1>
            <button
              onClick={handleInterviewMe}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 text-xs transition-all shrink-0"
            >
              <MessageSquare size={11} /> <span className="hidden sm:inline">AI </span>Chat
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {topicData && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                topicData.difficulty === 'Beginner' ? 'text-green-400 bg-green-500/10 border-green-500/20'
                : topicData.difficulty === 'Intermediate' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                : 'text-red-400 bg-red-500/10 border-red-500/20'
              }`}>{topicData.difficulty}</span>
            )}
            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${LEVEL_COLORS[userLevel]}`}>
              {LEVEL_LABELS[userLevel]}
            </span>
            <span className="text-zinc-600 text-[11px]">{allActiveQuestions.length} questions</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-card border border-white/8 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'quiz'
                ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Quiz
            <span className="ml-2 text-[11px] opacity-60">{allActiveQuestions.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'scenarios'
                ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="hidden sm:inline">Scenarios & Edge Cases</span>
            <span className="sm:hidden">Scenarios</span>
            <span className="ml-2 text-[11px] opacity-60">{scenarios.length}</span>
          </button>
        </div>

        {/* Scenarios tab */}
        {activeTab === 'scenarios' && (
          <div className="flex flex-col gap-3">
            {scenarios.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-10">No scenarios available for this topic yet.</p>
            ) : (
              scenarios.map((s, i) => {
                const tc = typeConfig[s.type]
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="bg-card border border-white/8 rounded-xl p-4 hover:border-white/16 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${tc.color}`}>
                          {tc.icon}{tc.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${diffBadge[s.difficulty]}`}>
                          {s.difficulty}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/concept/${slug}`, { state: { question: s.q } })}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-[11px] shrink-0 transition-all"
                      >
                        <MessageSquare size={10} /> Ask AI
                      </button>
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed">{s.q}</p>
                  </motion.div>
                )
              })
            )}
          </div>
        )}

        {/* Quiz tab */}
        {activeTab === 'quiz' && <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key={`quiz-${quizKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Progress */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-500 text-sm">Question {currentIndex + 1} of {allActiveQuestions.length}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-white/8 rounded-full mb-8 overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500 rounded-full"
                  initial={false}
                  animate={{ width: `${((currentIndex + (hasAnswered ? 1 : 0)) / allActiveQuestions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Question card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-card border border-white/8 rounded-2xl p-6 mb-4">
                    <p className="text-white text-base leading-relaxed mb-6">
                      {currentQuestion.question}
                    </p>

                    <div className="space-y-3">
                      {currentQuestion.options.map((option, idx) => {
                        let btnClass =
                          'w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all duration-150 '

                        if (!hasAnswered) {
                          btnClass +=
                            'bg-white/3 border-white/8 text-zinc-300 hover:bg-white/8 hover:border-white/20 cursor-pointer'
                        } else if (idx === currentQuestion.correct) {
                          btnClass +=
                            'bg-green-500/15 border-green-500/40 text-green-300 cursor-default'
                        } else if (idx === selectedOption && idx !== currentQuestion.correct) {
                          btnClass +=
                            'bg-red-500/15 border-red-500/40 text-red-300 cursor-default'
                        } else {
                          btnClass +=
                            'bg-white/3 border-white/5 text-zinc-600 cursor-default'
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className={btnClass}
                            disabled={hasAnswered}
                          >
                            <span
                              className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold mt-0.5 ${
                                !hasAnswered
                                  ? 'bg-white/8 text-zinc-400'
                                  : idx === currentQuestion.correct
                                  ? 'bg-green-500/30 text-green-300'
                                  : idx === selectedOption
                                  ? 'bg-red-500/30 text-red-300'
                                  : 'bg-white/5 text-zinc-600'
                              }`}
                            >
                              {optionPrefix[idx]}
                            </span>
                            <span className="text-sm leading-relaxed">{option}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Explanation */}
                  <AnimatePresence>
                    {hasAnswered && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`rounded-xl border p-4 mb-4 ${
                          isCorrect
                            ? 'bg-green-500/8 border-green-500/20'
                            : 'bg-red-500/8 border-red-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {isCorrect ? (
                            <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                          ) : (
                            <XCircle size={14} className="text-red-400 flex-shrink-0" />
                          )}
                          <span className={`text-xs font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? 'Correct!' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                          {currentQuestion.explanation}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Next / finish buttons */}
                  <AnimatePresence>
                    {hasAnswered && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col gap-2"
                      >
                        {currentIndex < allActiveQuestions.length - 1 ? (
                          <button
                            onClick={handleNext}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors"
                          >
                            Next Question →
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setShowResults(true)}
                              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors"
                            >
                              Finish &amp; See Results →
                            </button>
                            <button
                              onClick={async () => {
                                await generateMore()
                                setCurrentIndex(i => i + 1)
                              }}
                              disabled={generating}
                              className="w-full py-2.5 flex items-center justify-center gap-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/25 text-violet-300 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                            >
                              {generating ? (
                                <><div className="w-3.5 h-3.5 border border-violet-400/30 border-t-violet-400 rounded-full animate-spin" /> Generating…</>
                              ) : (
                                <><Sparkles size={14} /> Add 10 More Questions</>
                              )}
                            </button>
                            {generateError && <p className="text-red-400 text-xs text-center">{generateError}</p>}
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Results header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-1">Quiz Complete</h1>
                <p className="text-zinc-500 text-sm">{topicTitle}</p>
              </div>

              {/* Score card */}
              <div className="bg-card border border-white/8 rounded-2xl p-8 text-center mb-6">
                <div className={`text-7xl font-black mb-2 ${gradeColor}`}>{grade}</div>
                <div className="text-white text-2xl font-bold mb-1">
                  {score} / {answeredCount}
                </div>
                <p className="text-zinc-500 text-sm">
                  {score === answeredCount
                    ? 'Perfect score! You nailed it.'
                    : score >= answeredCount * 0.7
                    ? 'Great job! Solid understanding.'
                    : score >= answeredCount * 0.5
                    ? 'Good effort. Review the explanations below.'
                    : 'Keep studying — review the topic and try again.'}
                </p>
              </div>

              {/* Per-question review */}
              <div className="space-y-3 mb-8">
                {allActiveQuestions.map((q, idx) => {
                  const userAnswer = answers[idx]
                  const correct = userAnswer === q.correct

                  return (
                    <div
                      key={q.id}
                      className={`bg-card border rounded-xl p-4 ${
                        correct ? 'border-white/8' : 'border-red-500/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {correct ? (
                            <CheckCircle2 size={16} className="text-green-400" />
                          ) : (
                            <XCircle size={16} className="text-red-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-zinc-300 text-sm mb-1 leading-snug">{q.question}</p>
                          {!correct && (
                            <>
                              <p className="text-red-400 text-xs mb-0.5">
                                Your answer: {userAnswer !== undefined ? q.options[userAnswer] : 'Not answered'}
                              </p>
                              <p className="text-green-400 text-xs mb-1">
                                Correct: {q.options[q.correct]}
                              </p>
                              <p className="text-zinc-500 text-xs leading-relaxed">{q.explanation}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleRetake}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-colors"
                >
                  <RotateCcw size={15} />
                  Retake Quiz
                </button>
                <button
                  onClick={handleInterviewMe}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors"
                >
                  <MessageSquare size={15} />
                  AI Chat on This
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>}
      </div>
    </div>
  )
}
