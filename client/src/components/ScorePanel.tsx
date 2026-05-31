import { useScoreStore } from '../stores/scoreStore'

const ScoreBar = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-zinc-400">{label}</span>
      <span className="text-zinc-300 font-mono">{value}</span>
    </div>
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${value}%`,
          background: value >= 70 ? '#22c55e' : value >= 40 ? '#f59e0b' : '#ef4444'
        }}
      />
    </div>
  </div>
)

export const ScorePanel = () => {
  const { scores } = useScoreStore()

  const gradeColor = ['A+', 'A'].includes(scores.grade) ? 'text-green-400'
    : ['B+', 'B'].includes(scores.grade) ? 'text-yellow-400'
    : 'text-red-400'

  return (
    <div className="h-full p-4 flex gap-8">
      <div className="flex-1 space-y-3">
        <ScoreBar label="Architecture" value={scores.architecture} />
        <ScoreBar label="Scalability" value={scores.scalability} />
        <ScoreBar label="Reliability" value={scores.reliability} />
        <ScoreBar label="Communication" value={scores.communication} />
      </div>
      <div className="flex flex-col items-center justify-center w-32 border-l border-white/8 pl-8">
        <span className={`text-5xl font-bold ${gradeColor}`}>{scores.grade}</span>
        <span className="text-xs text-zinc-500 mt-1 text-center">{scores.verdict}</span>
        <span className="text-2xl font-mono text-white mt-2">{scores.overall}</span>
        <span className="text-xs text-zinc-500">/ 100</span>
      </div>
    </div>
  )
}
