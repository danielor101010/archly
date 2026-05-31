import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Sparkles, ChevronRight } from 'lucide-react'
import { LANGUAGES } from '../config/languages'
import { LANGUAGE_QUESTIONS, type LangQuestion } from '../config/languageQuestions'
import { shuffleQuestions } from '../lib/shuffleQuiz'
import { apiUrl } from '../lib/api'
import { loadGeneratedQuestions, saveGeneratedQuestions } from '../lib/quizCache'
import { useUserStore } from '../stores/userStore'

function getLetterGrade(score: number, total: number) {
  if (total === 0) return { grade: '-', color: 'text-zinc-400' }
  const r = score / total
  if (r >= 0.85) return { grade: 'A', color: 'text-green-400' }
  if (r >= 0.70) return { grade: 'B', color: 'text-blue-400' }
  if (r >= 0.55) return { grade: 'C', color: 'text-yellow-400' }
  if (r >= 0.40) return { grade: 'D', color: 'text-orange-400' }
  return { grade: 'F', color: 'text-red-400' }
}

const diffBadge: Record<string, string> = {
  Easy:   'text-green-400 bg-green-500/10 border-green-500/20',
  Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  Hard:   'text-red-400 bg-red-500/10 border-red-500/20',
}

const optionPrefix = ['A', 'B', 'C', 'D']

export const LanguageQuizPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const lang = LANGUAGES.find(l => l.slug === slug)
  const baseQuestions = useMemo(() => shuffleQuestions(LANGUAGE_QUESTIONS[slug ?? ''] ?? []), [slug])

  const [extraQuestions, setExtraQuestions] = useState<LangQuestion[]>(() =>
    slug ? shuffleQuestions(loadGeneratedQuestions<LangQuestion>(slug)) : []
  )
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [quizKey, setQuizKey] = useState(0)

  const allQuestions = useMemo(() => [...baseQuestions, ...extraQuestions], [baseQuestions, extraQuestions])

  const current = allQuestions[Math.min(currentIndex, allQuestions.length - 1)]
  const hasAnswered = answers[currentIndex] !== undefined
  const selected = answers[currentIndex]
  const isCorrect = selected === current?.correct
  const isLast = currentIndex === allQuestions.length - 1
  const answeredCount = Object.keys(answers).length
  const score = allQuestions.reduce((acc, _, idx) => acc + (answers[idx] === allQuestions[idx]?.correct ? 1 : 0), 0)
  const { grade, color: gradeColor } = getLetterGrade(score, answeredCount)

  useEffect(() => {
    if (showResults && slug) {
      useUserStore.getState().recordQuizResult(`lang-${slug}`, score, answeredCount, grade)
    }
  }, [showResults])

  const generateMore = useCallback(async () => {
    if (!slug || !lang || generating) return
    setGenerating(true)
    setGenError('')
    try {
      const existingIds = allQuestions.map(q => q.id)
      const resp = await fetch(apiUrl('/api/generate-quiz-questions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicSlug: slug,
          topicTitle: lang.name,
          existingIds,
          context: `This is a programming language quiz about ${lang.name}. Questions should test language-specific knowledge: syntax, concepts, gotchas, best practices. NOT system design.`,
        }),
      })
      const data = await resp.json() as { questions?: LangQuestion[]; error?: string }
      if (data.questions?.length) {
        saveGeneratedQuestions(slug, data.questions as LangQuestion[])
        setExtraQuestions(prev => [...prev, ...shuffleQuestions(data.questions ?? [])])
      } else {
        setGenError(data.error ?? 'No questions returned')
      }
    } catch {
      setGenError('Failed to connect to server')
    } finally {
      setGenerating(false)
    }
  }, [slug, lang, allQuestions, generating])

  if (!lang) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Language not found.</p>
          <button onClick={() => navigate('/languages')} className="text-indigo-400 hover:text-indigo-300 text-sm">← Back</button>
        </div>
      </div>
    )
  }

  if (allQuestions.length === 0 && !generating) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <span className="text-5xl mb-4 block">{lang.icon}</span>
          <h2 className="text-white font-bold text-xl mb-2">{lang.name}</h2>
          <p className="text-zinc-400 text-sm mb-6">No built-in questions yet. Generate 10 questions with AI to start the quiz.</p>
          <button
            onClick={generateMore}
            className="flex items-center gap-2 px-5 py-2.5 mx-auto bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors"
          >
            <Sparkles size={15} /> Generate Questions
          </button>
          {genError && <p className="text-red-400 text-xs mt-3">{genError}</p>}
        </div>
      </div>
    )
  }

  if (generating && allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Generating questions for {lang.name}…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/languages')}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> {lang.name} Quiz
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{lang.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">{lang.name}</h1>
            <p className="text-zinc-500 text-xs mt-0.5">{allQuestions.length} questions · {lang.category}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div key={`quiz-${quizKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Progress */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-500 text-sm">Question {currentIndex + 1} of {allQuestions.length}</span>
                {current?.topic && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-zinc-500">{current.topic}</span>
                )}
              </div>
              <div className="w-full h-1.5 bg-white/8 rounded-full mb-6 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: lang.color }}
                  animate={{ width: `${((currentIndex + (hasAnswered ? 1 : 0)) / allQuestions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18 }}
                >
                  {/* Difficulty badge */}
                  {current?.difficulty && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium mb-3 inline-block ${diffBadge[current.difficulty]}`}>
                      {current.difficulty}
                    </span>
                  )}

                  <div className="bg-card border border-white/8 rounded-2xl p-6 mb-4">
                    <p className="text-white text-base leading-relaxed mb-6">{current?.question}</p>
                    <div className="space-y-3">
                      {current?.options.map((opt, idx) => {
                        let cls = 'w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all duration-150 '
                        if (!hasAnswered) {
                          cls += 'bg-white/3 border-white/8 text-zinc-300 hover:bg-white/8 hover:border-white/20 cursor-pointer'
                        } else if (idx === current.correct) {
                          cls += 'bg-green-500/15 border-green-500/40 text-green-300 cursor-default'
                        } else if (idx === selected && idx !== current.correct) {
                          cls += 'bg-red-500/15 border-red-500/40 text-red-300 cursor-default'
                        } else {
                          cls += 'bg-white/3 border-white/5 text-zinc-600 cursor-default'
                        }
                        return (
                          <button key={idx} onClick={() => { if (!hasAnswered) setAnswers(p => ({ ...p, [currentIndex]: idx })) }} className={cls} disabled={hasAnswered}>
                            <span className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold mt-0.5 ${
                              !hasAnswered ? 'bg-white/8 text-zinc-400'
                              : idx === current.correct ? 'bg-green-500/30 text-green-300'
                              : idx === selected ? 'bg-red-500/30 text-red-300'
                              : 'bg-white/5 text-zinc-600'
                            }`}>{optionPrefix[idx]}</span>
                            <span className="text-sm leading-relaxed">{opt}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <AnimatePresence>
                    {hasAnswered && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`rounded-xl border p-4 mb-4 ${isCorrect ? 'bg-green-500/8 border-green-500/20' : 'bg-red-500/8 border-red-500/20'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {isCorrect ? <CheckCircle2 size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400" />}
                          <span className={`text-xs font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? 'Correct!' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed">{current?.explanation}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {hasAnswered && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
                        {!isLast ? (
                          <button
                            onClick={() => setCurrentIndex(i => i + 1)}
                            className="w-full py-3 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                            style={{ background: lang.color + 'cc' }}
                          >
                            Next Question <ChevronRight size={15} />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setShowResults(true)}
                              className="w-full py-3 text-white font-medium rounded-xl transition-colors"
                              style={{ background: lang.color + 'cc' }}
                            >
                              Finish &amp; See Results →
                            </button>
                            <button
                              onClick={async () => { await generateMore(); setCurrentIndex(i => i + 1) }}
                              disabled={generating}
                              className="w-full py-2.5 flex items-center justify-center gap-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/25 text-violet-300 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                            >
                              {generating ? <><div className="w-3.5 h-3.5 border border-violet-400/30 border-t-violet-400 rounded-full animate-spin" /> Generating…</> : <><Sparkles size={14} /> Add 10 More Questions</>}
                            </button>
                            {genError && <p className="text-red-400 text-xs text-center">{genError}</p>}
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <span className="text-4xl mb-3 block">{lang.icon}</span>
                <h1 className="text-2xl font-bold text-white mb-1">Quiz Complete</h1>
                <p className="text-zinc-500 text-sm">{lang.name}</p>
              </div>
              <div className="bg-card border border-white/8 rounded-2xl p-8 text-center mb-6">
                <div className={`text-7xl font-black mb-2 ${gradeColor}`}>{grade}</div>
                <div className="text-white text-2xl font-bold mb-1">{score} / {answeredCount}</div>
                <p className="text-zinc-500 text-sm">
                  {score === answeredCount ? 'Perfect! You know this well.' : score >= answeredCount * 0.7 ? 'Great job.' : score >= answeredCount * 0.5 ? 'Good effort — review the explanations.' : 'Keep studying and try again.'}
                </p>
              </div>
              <div className="space-y-3 mb-8">
                {allQuestions.slice(0, answeredCount).map((q, idx) => {
                  const ua = answers[idx]
                  const ok = ua === q.correct
                  return (
                    <div key={q.id} className={`bg-card border rounded-xl p-4 ${ok ? 'border-white/8' : 'border-red-500/20'}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">{ok ? <CheckCircle2 size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}</div>
                        <div className="min-w-0">
                          <p className="text-zinc-300 text-sm mb-1 leading-snug">{q.question}</p>
                          {!ok && (
                            <>
                              <p className="text-red-400 text-xs mb-0.5">Your answer: {ua !== undefined ? q.options[ua] : 'Not answered'}</p>
                              <p className="text-green-400 text-xs mb-1">Correct: {q.options[q.correct]}</p>
                              <p className="text-zinc-500 text-xs leading-relaxed">{q.explanation}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setAnswers({}); setCurrentIndex(0); setShowResults(false); setQuizKey(k => k + 1) }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-colors">
                  <RotateCcw size={15} /> Retake
                </button>
                <button onClick={() => navigate('/languages')}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors">
                  All Languages
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
