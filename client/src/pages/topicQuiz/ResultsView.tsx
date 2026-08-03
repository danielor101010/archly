import { CheckCircle2, XCircle, RotateCcw, MessageSquare } from 'lucide-react'
import type { QuizQuestion } from '../../config/quizQuestions'

interface ResultsViewProps {
  topicTitle: string
  questions: QuizQuestion[]
  answers: Record<number, number>
  score: number
  answeredCount: number
  grade: string
  gradeColor: string
  onRetake: () => void
  onChat: () => void
}

export function ResultsView({ topicTitle, questions, answers, score, answeredCount, grade, gradeColor, onRetake, onChat }: ResultsViewProps) {
  const summary = score === answeredCount
    ? 'Perfect score! You nailed it.'
    : score >= answeredCount * 0.7
    ? 'Great job! Solid understanding.'
    : score >= answeredCount * 0.5
    ? 'Good effort. Review the explanations below.'
    : 'Keep studying — review the topic and try again.'

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Quiz Complete</h1>
        <p className="text-text-subtle text-sm">{topicTitle}</p>
      </div>

      <div className="bg-surface border border-border-subtle rounded-lg p-8 text-center mb-6">
        <div className={`text-7xl font-black mb-2 ${gradeColor}`}>{grade}</div>
        <div className="text-text-primary text-2xl font-bold mb-1">{score} / {answeredCount}</div>
        <p className="text-text-subtle text-sm">{summary}</p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {questions.map((q, idx) => {
          const userAnswer = answers[idx]
          const correct = userAnswer === q.correct
          return (
            <div key={q.id} className={`bg-surface border rounded-lg p-4 ${correct ? 'border-border-subtle' : 'border-red-500/20'}`}>
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {correct ? <CheckCircle2 size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}
                </div>
                <div className="min-w-0">
                  <p className="text-text-secondary text-sm mb-1 leading-snug">{q.question}</p>
                  {!correct && (
                    <>
                      <p className="text-red-400 text-xs mb-0.5">Your answer: {userAnswer !== undefined ? q.options[userAnswer] : 'Not answered'}</p>
                      <p className="text-green-400 text-xs mb-1">Correct: {q.options[q.correct]}</p>
                      <p className="text-text-subtle text-xs leading-relaxed">{q.explanation}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={onRetake} className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-elevated hover:bg-surface border border-border-default text-text-primary font-medium rounded-lg transition-colors">
          <RotateCcw size={15} /> Retake Quiz
        </button>
        <button onClick={onChat} className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors">
          <MessageSquare size={15} /> AI Chat on This
        </button>
      </div>
    </>
  )
}
