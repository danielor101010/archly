import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import type { QuizQuestion } from '../../config/quizQuestions'

const OPTION_PREFIX = ['A', 'B', 'C', 'D']

function optionClass(hasAnswered: boolean, idx: number, correct: number, selected: number | undefined) {
  if (!hasAnswered) return 'bg-surface-elevated border-border-subtle text-text-secondary hover:bg-surface hover:border-border-default cursor-pointer'
  if (idx === correct) return 'bg-green-500/15 border-green-500/40 text-green-300 cursor-default'
  if (idx === selected) return 'bg-red-500/15 border-red-500/40 text-red-300 cursor-default'
  return 'bg-surface-elevated border-border-subtle text-text-subtle cursor-default'
}

function prefixClass(hasAnswered: boolean, idx: number, correct: number, selected: number | undefined) {
  if (!hasAnswered) return 'bg-surface text-text-muted'
  if (idx === correct) return 'bg-green-500/30 text-green-300'
  if (idx === selected) return 'bg-red-500/30 text-red-300'
  return 'bg-surface text-text-subtle'
}

interface QuestionCardProps {
  question: QuizQuestion
  index: number
  total: number
  hasAnswered: boolean
  selectedOption: number | undefined
  isCorrect: boolean
  isLast: boolean
  generating: boolean
  generateError: string
  onAnswer: (idx: number) => void
  onNext: () => void
  onFinish: () => void
  onGenerateMore: () => void
}

export function QuestionCard({
  question, index, total, hasAnswered, selectedOption, isCorrect, isLast,
  generating, generateError, onAnswer, onNext, onFinish, onGenerateMore,
}: QuestionCardProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-text-subtle text-sm">Question {index + 1} of {total}</span>
      </div>

      <div className="w-full h-1.5 bg-border-subtle rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={false}
          animate={{ width: `${((index + (hasAnswered ? 1 : 0)) / total) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <div className="bg-surface border border-border-subtle rounded-lg p-6 mb-4">
            <p className="text-text-primary text-base leading-relaxed mb-6">{question.question}</p>
            <div className="flex flex-col gap-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => onAnswer(idx)}
                  disabled={hasAnswered}
                  className={`w-full text-left flex items-start gap-3 p-4 rounded-lg border transition-colors duration-150 ${optionClass(hasAnswered, idx, question.correct, selectedOption)}`}
                >
                  <span className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold mt-0.5 ${prefixClass(hasAnswered, idx, question.correct, selectedOption)}`}>
                    {OPTION_PREFIX[idx]}
                  </span>
                  <span className="text-sm leading-relaxed">{option}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {hasAnswered && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className={`rounded-lg border p-4 mb-4 ${isCorrect ? 'bg-green-500/8 border-green-500/20' : 'bg-red-500/8 border-red-500/20'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isCorrect ? <CheckCircle2 size={14} className="text-green-400 shrink-0" /> : <XCircle size={14} className="text-red-400 shrink-0" />}
                  <span className={`text-xs font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                </div>
                <p className="text-text-muted text-xs leading-relaxed">{question.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {hasAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                className="flex flex-col gap-2 sticky bottom-4 sm:static"
              >
                {!isLast ? (
                  <button onClick={onNext} className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors">
                    Next Question →
                  </button>
                ) : (
                  <>
                    <button onClick={onFinish} className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors">
                      Finish &amp; See Results →
                    </button>
                    <button
                      onClick={onGenerateMore}
                      disabled={generating}
                      className="w-full py-2.5 flex items-center justify-center gap-2 bg-surface-elevated hover:bg-surface border border-border-default text-text-secondary text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {generating
                        ? <><div className="w-3.5 h-3.5 border border-border-strong border-t-accent rounded-full animate-spin" /> Generating…</>
                        : <><Sparkles size={14} className="text-accent" /> Add 10 more questions</>}
                    </button>
                    {generateError && <p className="text-red-400 text-xs text-center">{generateError}</p>}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
