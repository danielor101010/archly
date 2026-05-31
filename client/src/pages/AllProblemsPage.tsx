import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Search, Zap, ArrowRight, PenLine, LayoutGrid, List } from 'lucide-react'
import { PROBLEMS } from '../config/problems'

type DiffFilter = 'All' | 'Easy' | 'Medium' | 'Hard'

const diffColor: Record<string, string> = {
  Easy:   'text-green-400 bg-green-400/10 border-green-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Hard:   'text-red-400 bg-red-400/10 border-red-400/20',
}
const diffDot: Record<string, string> = {
  Easy: 'bg-green-400', Medium: 'bg-yellow-400', Hard: 'bg-red-400',
}

const COMPANY_COLORS: Record<string, string> = {
  Google:'text-blue-400', Meta:'text-blue-500', Facebook:'text-blue-500',
  Amazon:'text-orange-400', Apple:'text-zinc-300', Netflix:'text-red-500',
  Microsoft:'text-sky-400', Uber:'text-zinc-200', Lyft:'text-pink-400',
  Twitter:'text-sky-400', Slack:'text-violet-400', Stripe:'text-indigo-400',
  PayPal:'text-blue-400', Dropbox:'text-blue-400', Airbnb:'text-rose-400',
  Instagram:'text-pink-500', WhatsApp:'text-green-400', YouTube:'text-red-400',
  TikTok:'text-teal-400', ByteDance:'text-teal-400', Twitch:'text-violet-500',
  'Booking.com':'text-blue-400', Expedia:'text-yellow-400',
  NASDAQ:'text-emerald-400', NYSE:'text-emerald-400', Gmail:'text-red-400',
  Redis:'text-red-400', 'YouTube Live':'text-red-400',
}
function companyColor(name: string) { return COMPANY_COLORS[name] ?? 'text-zinc-500' }

export const AllProblemsPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [diffFilter, setDiffFilter] = useState<DiffFilter>('All')
  const [customSystem, setCustomSystem] = useState('')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return PROBLEMS.filter(p => {
      if (diffFilter !== 'All' && p.difficulty !== diffFilter) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.companies.some(c => c.toLowerCase().includes(q)) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    })
  }, [search, diffFilter])

  return (
    <div className="min-h-screen bg-page">
      <div className="border-b border-white/[0.04] bg-page/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center">
          <button onClick={() => navigate('/practice')} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
            <ArrowLeft size={14} /> <span className="hidden sm:inline">Practice Hub</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-5">
          <h1 className="text-white font-bold text-lg sm:text-xl mb-0.5">System Design Problems</h1>
          <p className="text-zinc-500 text-xs sm:text-sm">25 classic problems — guided practice or pressure interview mode</p>
        </div>

        <div className="flex flex-col gap-2 mb-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, company, or tag…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-card border border-white/[0.05] rounded-xl pl-8 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
              />
            </div>
            {/* Layout toggle */}
            <div className="flex gap-1 p-1 bg-card border border-white/[0.05] rounded-xl shrink-0">
              <button onClick={() => setLayout('grid')} className={`p-1.5 rounded-lg transition-colors ${layout === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-400'}`} title="Grid view">
                <LayoutGrid size={14} />
              </button>
              <button onClick={() => setLayout('list')} className={`p-1.5 rounded-lg transition-colors ${layout === 'list' ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-400'}`} title="List view">
                <List size={14} />
              </button>
            </div>
          </div>
          <div className="flex gap-1.5">
            {(['All', 'Easy', 'Medium', 'Hard'] as DiffFilter[]).map(d => (
              <button key={d} onClick={() => setDiffFilter(d)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  diffFilter === d
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-card border-white/[0.05] text-zinc-400 hover:text-zinc-200'
                }`}
              >{d}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <p className="text-zinc-600 text-sm text-center py-12">No problems match your search.</p>
        )}

        {layout === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18, delay: i * 0.015 }}
                onClick={() => navigate(`/problem/${p.id}`)}
                className="group relative p-4 rounded-xl bg-card border border-white/[0.05] hover:border-white/15 cursor-pointer transition-all duration-200 flex flex-col overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                  p.difficulty === 'Easy' ? 'bg-green-500/15' : p.difficulty === 'Medium' ? 'bg-yellow-500/15' : 'bg-red-500/15'
                }`} />
                <div className="relative flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-0.5 ${diffDot[p.difficulty]}`} />
                    <h3 className="text-white font-semibold text-xs group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">{p.title}</h3>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ml-1.5 shrink-0 ${diffColor[p.difficulty]}`}>{p.difficulty}</span>
                </div>
                <p className="text-zinc-500 text-[10px] mb-2 line-clamp-2 leading-relaxed relative">{p.description}</p>
                <div className="relative flex items-center justify-between mt-auto">
                  <div className="flex gap-1">
                    {p.companies.slice(0, 1).map(c => (
                      <span key={c} className={`text-[9px] font-medium ${companyColor(c)}`}>{c}</span>
                    ))}
                  </div>
                  <span className="flex items-center gap-0.5 text-zinc-700 text-[9px]"><Clock size={8} />{p.duration}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 mb-10">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, delay: i * 0.01 }}
                onClick={() => navigate(`/problem/${p.id}`)}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-white/[0.05] hover:border-white/15 cursor-pointer transition-all"
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${diffDot[p.difficulty]}`} />
                <span className="text-white text-sm font-medium group-hover:text-indigo-300 transition-colors flex-1 truncate">{p.title}</span>
                <span className="text-zinc-600 text-xs hidden sm:block truncate max-w-[200px]">{p.description}</span>
                <div className="flex items-center gap-3 shrink-0">
                  {p.companies.slice(0, 1).map(c => (
                    <span key={c} className={`text-[10px] font-medium hidden sm:block ${companyColor(c)}`}>{c}</span>
                  ))}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${diffColor[p.difficulty]}`}>{p.difficulty}</span>
                  <span className="text-zinc-700 text-[10px] flex items-center gap-0.5"><Clock size={9} />{p.duration}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Custom problem */}
        <div className="border-t border-white/[0.04] pt-8">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-1.5 mb-2">
              <PenLine size={12} className="text-zinc-500" />
              <span className="text-zinc-400 text-xs font-medium">Design your own system</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSystem}
                onChange={e => setCustomSystem(e.target.value)}
                placeholder="e.g. Design a real-time collaborative editor…"
                className="flex-1 bg-card border border-white/[0.05] rounded-xl px-4 py-2 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
              />
              <button disabled={!customSystem.trim()} onClick={() => navigate(`/practice/custom-${Date.now()}`, { state: { customProblem: { title: customSystem.trim(), description: '' } } })}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                <Zap size={12} /> Practice
              </button>
              <button disabled={!customSystem.trim()} onClick={() => navigate(`/interview/custom-${Date.now()}`, { state: { customProblem: { title: customSystem.trim(), description: '' } } })}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                <ArrowRight size={12} /> Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
