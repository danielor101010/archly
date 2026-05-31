import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Clock, Zap, Building2, AlertTriangle, Search } from 'lucide-react'
import { useSessionStore } from '../../stores/sessionStore'
import { PROBLEMS } from '../../config/problems'

type DifficultyFilter = 'All' | 'Easy' | 'Medium' | 'Hard'

const diffColor: Record<string, string> = {
  Easy: 'text-green-400 bg-green-500/10 border-green-500/20',
  Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  Hard: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const diffFilterBtn: Record<DifficultyFilter, string> = {
  All: 'text-zinc-300 bg-zinc-700/40 border-zinc-600/40 hover:border-zinc-500/60',
  Easy: 'text-green-400 bg-green-500/10 border-green-500/30 hover:border-green-400/50',
  Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-400/50',
  Hard: 'text-red-400 bg-red-500/10 border-red-500/30 hover:border-red-400/50',
}

const diffFilterActive: Record<DifficultyFilter, string> = {
  All: 'text-zinc-100 bg-zinc-600/60 border-zinc-400/60',
  Easy: 'text-green-300 bg-green-500/20 border-green-400/60',
  Medium: 'text-yellow-300 bg-yellow-500/20 border-yellow-400/60',
  Hard: 'text-red-300 bg-red-500/20 border-red-400/60',
}

export const InterviewSetup = () => {
  const navigate = useNavigate()
  const { startSession } = useSessionStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [diffFilter, setDiffFilter] = useState<DifficultyFilter>('All')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return PROBLEMS.filter((p) => {
      const matchesDiff = diffFilter === 'All' || p.difficulty === diffFilter
      if (!matchesDiff) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.companies.some((c) => c.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [search, diffFilter])

  const handleStart = () => {
    if (!selected) return
    startSession('interview', selected)
    navigate(`/interview/${selected}`)
  }

  return (
    <div className="min-h-screen bg-page p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />Back
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={20} className="text-red-400" />
            <h1 className="text-3xl font-bold text-white">Interview Mode</h1>
          </div>
          <p className="text-zinc-400 mb-4">Face a real FAANG-level AI interviewer. Expect interruptions, failures, and requirement changes.</p>
          <div className="flex items-start gap-2 bg-red-500/8 border border-red-500/15 rounded-xl p-3">
            <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-300 text-xs leading-relaxed">
              The AI will challenge your decisions, inject failures, and demand specifics. SPOFs and missing components will be called out aggressively.
            </p>
          </div>
        </div>

        {/* Search + Difficulty filters */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search problems, companies, or tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['All', 'Easy', 'Medium', 'Hard'] as DifficultyFilter[]).map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  diffFilter === d ? diffFilterActive[d] : diffFilterBtn[d]
                }`}
              >
                {d}
              </button>
            ))}
            <span className="ml-auto text-zinc-600 text-xs">{filtered.length} problem{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {filtered.length === 0 && (
            <p className="text-zinc-600 text-sm text-center py-8">No problems match your filters.</p>
          )}
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelected(p.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selected === p.id
                  ? 'bg-red-500/8 border-red-500/30'
                  : 'bg-card border-white/8 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected === p.id ? 'border-red-400 bg-red-400' : 'border-zinc-600'}`}>
                    {selected === p.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{p.title}</span>
                      <span className="text-zinc-500 text-xs">{p.subtitle}</span>
                    </div>
                    <p className="text-zinc-500 text-xs mt-0.5">{p.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <div className="flex items-center gap-1 text-zinc-600 text-xs">
                    <Building2 size={10} />
                    {p.companies.join(', ')}
                  </div>
                  <div className="flex items-center gap-1 text-zinc-500 text-xs">
                    <Clock size={10} />{p.duration}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${diffColor[p.difficulty]}`}>{p.difficulty}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={handleStart}
          disabled={!selected}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          <Zap size={16} />
          Begin Interview
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
