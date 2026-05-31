import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserCheck, Cpu, Brain, MessageSquare } from 'lucide-react'
import { useUserStore } from '../stores/userStore'

export const CvInterviewPage = () => {
  const navigate = useNavigate()
  const cvText = useUserStore((s) => s.cvText)
  const level = useUserStore((s) => s.level)

  const handleStart = () => {
    navigate('/interview/cv-interview', {
      state: {
        customProblem: {
          title: 'Personalized CV Interview',
          description: cvText.slice(0, 3000),
        },
        sessionMode: 'cv-interview',
      },
    })
  }

  const hasCv = cvText.trim().length > 0

  return (
    <div className="min-h-screen bg-page text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-indigo-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
            <UserCheck size={12} />
            CV-Based Interview
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Personalized CV Interview</h1>
          <p className="mt-2 text-zinc-400">
            AI interviews you based on your actual experience — no generic questions.
          </p>
        </div>

        {/* CV Preview */}
        <div className="mb-6 p-5 rounded-2xl bg-card border border-white/[0.08]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">Your CV</span>
            {hasCv ? (
              <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                CV loaded
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                No CV found
              </span>
            )}
          </div>

          {hasCv ? (
            <p className="text-sm text-zinc-400 font-mono leading-relaxed line-clamp-4">
              {cvText.slice(0, 300)}
              {cvText.length > 300 ? '...' : ''}
            </p>
          ) : (
            <p className="text-sm text-zinc-500">
              No CV found. Go to your{' '}
              <button
                onClick={() => navigate('/dashboard')}
                className="text-indigo-400 underline hover:text-indigo-300 transition-colors"
              >
                Dashboard
              </button>{' '}
              to add your CV and unlock personalized interviews.
            </p>
          )}
        </div>

        {/* What to expect */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
            What to expect
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-card border border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center mb-3">
                <Brain size={16} className="text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Background Deep Dive</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Questions about your most complex projects and the decisions behind them.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center mb-3">
                <Cpu size={16} className="text-violet-400" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Technical Grilling</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Deep dives on your specific tech stack — Redis, Kafka, or whatever you listed.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center mb-3">
                <MessageSquare size={16} className="text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Behavioral Questions</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Conflict resolution, ownership, and production incidents from your background.
              </p>
            </div>
          </div>
        </div>

        {/* Level badge */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xs text-zinc-500">Interview level:</span>
          <span className="text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full capitalize">
            {level}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={!hasCv}
          className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/40 disabled:text-indigo-300/40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200"
        >
          <UserCheck size={18} />
          Start Interview
          <span className="ml-1">→</span>
        </button>

        {!hasCv && (
          <p className="mt-3 text-center text-xs text-zinc-600">
            Add your CV in the Dashboard to enable personalized interviews.
          </p>
        )}
      </div>
    </div>
  )
}
