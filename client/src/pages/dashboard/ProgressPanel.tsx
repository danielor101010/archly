import { Layers, BookOpen, Code2, ArrowRight } from 'lucide-react'
import type { UserProfile } from '../../stores/userStore'
import type { Topic } from '../../config/topics'
import type { Language } from '../../config/languages'
import type { Problem } from '../../config/problems'
import { diffColor, gradeClasses } from './helpers'

interface ProgressPanelProps {
  quizProgress: UserProfile['quizProgress']
  quizzedTopics: Topic[]
  quizzedLangs: Language[]
  solvedProblemList: Problem[]
  totalProblems: number
  totalTopics: number
  totalLangs: number
  onNavigate: (path: string) => void
}

export function ProgressPanel({
  quizProgress, quizzedTopics, quizzedLangs, solvedProblemList,
  totalProblems, totalTopics, totalLangs, onNavigate,
}: ProgressPanelProps) {
  return (
    <div>
      <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">Progress</p>
      <div className="rounded-lg border border-border-subtle overflow-hidden divide-y divide-border-subtle">

        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers size={12} className="text-accent" />
              <span className="text-xs font-semibold text-text-primary">System Design</span>
            </div>
            <span className="text-[11px] text-text-subtle">{solvedProblemList.length} / {totalProblems}</span>
          </div>
          {solvedProblemList.length === 0 ? (
            <button onClick={() => onNavigate('/practice')} className="flex items-center gap-1 text-accent hover:text-accent-hover text-xs transition-colors">
              Start practicing <ArrowRight size={10} />
            </button>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {solvedProblemList.map(p => (
                <span key={p.id} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface text-[11px] text-text-muted">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${diffColor(p.difficulty)}`} />
                  {p.title}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={12} className="text-emerald-400" />
              <span className="text-xs font-semibold text-text-primary">Concepts</span>
            </div>
            <span className="text-[11px] text-text-subtle">{quizzedTopics.length} / {totalTopics}</span>
          </div>
          {quizzedTopics.length === 0 ? (
            <button onClick={() => onNavigate('/learn')} className="flex items-center gap-1 text-accent hover:text-accent-hover text-xs transition-colors">
              Start learning <ArrowRight size={10} />
            </button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1">
              {quizzedTopics.map(t => {
                const p = quizProgress[`topic-${t.slug}`]
                return (
                  <div key={t.slug} className="flex items-center gap-2 py-1">
                    <span className="text-[11px] text-text-muted flex-1 truncate">{t.title}</span>
                    <span className="text-[10px] text-text-subtle">{p.score}/{p.total}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${gradeClasses(p.grade)}`}>{p.grade}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Code2 size={12} className="text-accent" />
              <span className="text-xs font-semibold text-text-primary">Languages</span>
            </div>
            <span className="text-[11px] text-text-subtle">{quizzedLangs.length} / {totalLangs}</span>
          </div>
          {quizzedLangs.length === 0 ? (
            <button onClick={() => onNavigate('/languages')} className="flex items-center gap-1 text-accent hover:text-accent-hover text-xs transition-colors">
              Start quizzing <ArrowRight size={10} />
            </button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1">
              {quizzedLangs.map(l => {
                const p = quizProgress[`lang-${l.slug}`]
                return (
                  <div key={l.slug} className="flex items-center gap-2 py-1">
                    <span className="text-sm leading-none shrink-0">{l.icon}</span>
                    <span className="text-[11px] text-text-muted flex-1 truncate">{l.name}</span>
                    <span className="text-[10px] text-text-subtle">{p.score}/{p.total}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${gradeClasses(p.grade)}`}>{p.grade}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
