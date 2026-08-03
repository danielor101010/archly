interface QuizTabsProps {
  active: 'quiz' | 'scenarios'
  onChange: (tab: 'quiz' | 'scenarios') => void
  quizCount: number
  scenarioCount: number
}

export function QuizTabs({ active, onChange, quizCount, scenarioCount }: QuizTabsProps) {
  const tabClass = (tab: 'quiz' | 'scenarios') =>
    `flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
      active === tab ? 'bg-accent-soft border border-accent-soft-border text-accent' : 'text-text-subtle hover:text-text-secondary'
    }`

  return (
    <div className="flex gap-1 p-1 bg-surface border border-border-subtle rounded-lg mb-6">
      <button onClick={() => onChange('quiz')} className={tabClass('quiz')}>
        Quiz <span className="ml-2 text-[11px] opacity-60">{quizCount}</span>
      </button>
      <button onClick={() => onChange('scenarios')} className={tabClass('scenarios')}>
        <span className="hidden sm:inline">Scenarios & Edge Cases</span>
        <span className="sm:hidden">Scenarios</span>
        <span className="ml-2 text-[11px] opacity-60">{scenarioCount}</span>
      </button>
    </div>
  )
}
