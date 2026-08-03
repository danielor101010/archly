import { useNavigate } from 'react-router-dom'
import type { CvProblem } from '../../stores/userStore'

interface CvSectionProps {
  cvText: string
  cvSkills: string[]
  cvProblems: CvProblem[]
  isAnalyzingCv: boolean
  onCvTextChange: (text: string) => void
  onAnalyze: () => void
}

export function CvSection({ cvText, cvSkills, cvProblems, isAnalyzingCv, onCvTextChange, onAnalyze }: CvSectionProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle">
        <p className="text-text-primary font-semibold text-sm">CV-Based Problems</p>
        <p className="text-text-subtle text-xs mt-0.5">Paste your CV to get personalised system design questions</p>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        <textarea
          value={cvText}
          onChange={e => onCvTextChange(e.target.value)}
          placeholder="Paste your CV / resume here…"
          rows={4}
          className="w-full bg-surface-sunken border border-border-subtle rounded-lg px-3 py-2.5 text-text-secondary text-xs placeholder:text-text-subtle outline-none focus:border-accent/40 resize-none leading-relaxed"
        />
        <button
          onClick={onAnalyze}
          disabled={!cvText.trim() || isAnalyzingCv}
          className="self-start flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white text-xs font-semibold rounded-md transition-colors"
        >
          {isAnalyzingCv ? <><div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />Analyzing…</> : 'Analyze CV'}
        </button>

        {cvSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cvSkills.map(s => <span key={s} className="px-2 py-0.5 bg-accent-soft border border-accent-soft-border text-accent text-[11px] rounded-md">{s}</span>)}
          </div>
        )}

        {cvProblems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
            {cvProblems.map(p => (
              <div key={p.id} className="bg-surface-sunken border border-border-subtle rounded-lg p-3 flex flex-col gap-2">
                <p className="text-text-primary text-xs font-semibold">{p.title}</p>
                <p className="text-text-subtle text-[11px] leading-relaxed flex-1">{p.description}</p>
                <div className="flex flex-wrap gap-1">
                  {p.relevantSkills.map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 bg-surface text-text-subtle rounded">{s}</span>)}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/practice/${p.id}`, { state: { customProblem: { title: p.title, description: p.description } } })}
                    className="flex-1 py-1.5 text-[11px] font-medium bg-accent hover:bg-accent-hover text-white rounded-md transition-colors">Practice</button>
                  <button onClick={() => navigate(`/interview/${p.id}`, { state: { customProblem: { title: p.title, description: p.description } } })}
                    className="flex-1 py-1.5 text-[11px] font-medium bg-surface-elevated hover:bg-surface text-text-secondary rounded-md border border-border-default transition-colors">Interview</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
