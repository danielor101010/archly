import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart2, Zap, ArrowRight, CheckCircle2, TrendingUp,
  Clock, ArrowLeft, LogOut, ChevronDown, BookOpen, Code2, Layers,
} from 'lucide-react'
import { useUserStore, type UserLevel, type SessionRecord } from '../stores/userStore'
import { sendWS } from '../lib/ws'
import { useWeaknessAnalysis } from '../hooks/useWeaknessAnalysis'
import { ThemeToggle } from '../components/ThemeToggle'
import { GoogleSignIn } from '../components/GoogleSignIn'
import { TOPICS } from '../config/topics'
import { LANGUAGES } from '../config/languages'
import { PROBLEMS } from '../config/problems'

const LEVELS: { id: UserLevel; label: string; desc: string }[] = [
  { id: 'learner', label: 'Learner',  desc: 'New to system design — load balancers, caches, databases' },
  { id: 'junior',  label: 'Junior',   desc: 'Knows components, REST APIs, basic scaling' },
  { id: 'mid',     label: 'Mid',      desc: 'CAP theorem, sharding, consistent hashing, queues' },
  { id: 'senior',  label: 'Senior',   desc: 'Multi-region, cost tradeoffs, failure scenarios, full depth' },
]

const LEVEL_COLORS: Record<UserLevel, string> = {
  learner: 'text-green-400 bg-green-500/10 border-green-500/30',
  junior:  'text-blue-400 bg-blue-500/10 border-blue-500/30',
  mid:     'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  senior:  'text-red-400 bg-red-500/10 border-red-500/30',
}

function formatTokens(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n) }
function toTitleCase(s: string) { return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
function relativeTime(ts: number) {
  const d = Math.floor((Date.now() - ts) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 7) return `${d} days ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function gradeClasses(g: string) {
  if (g === 'A' || g === 'A+') return 'text-green-400 bg-green-500/10 border-green-500/30'
  if (g === 'B' || g === 'B+') return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
  if (g === 'C') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
  return 'text-red-400 bg-red-500/10 border-red-500/30'
}
function barColor(n: number) { return n >= 70 ? 'bg-green-500' : n >= 50 ? 'bg-yellow-500' : 'bg-red-500' }
function diffColor(d: string) {
  return d === 'Easy' || d === 'Beginner' ? 'bg-green-400'
       : d === 'Medium' || d === 'Intermediate' ? 'bg-yellow-400'
       : 'bg-red-400'
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').join('').slice(0, 2)
}

/* ── Level dropdown ──────────────────────────────────────────────────────────── */
function LevelDropdown({ value, onChange }: { value: UserLevel; onChange: (l: UserLevel) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const cur = LEVELS.find(l => l.id === value)!

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${LEVEL_COLORS[value]}`}
      >
        {cur.label}
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-64 bg-card border border-white/12 rounded-xl shadow-2xl overflow-hidden">
          {LEVELS.map(l => (
            <button
              key={l.id}
              onClick={() => { onChange(l.id); setOpen(false) }}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors ${
                value === l.id ? 'bg-white/[0.04]' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold mb-0.5 ${LEVEL_COLORS[l.id].split(' ')[0]}`}>{l.label}</div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{l.desc}</p>
              </div>
              {value === l.id && <CheckCircle2 size={13} className="text-indigo-400 shrink-0 mt-0.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Session card ─────────────────────────────────────────────────────────────── */
function SessionCard({ record }: { record: SessionRecord }) {
  const title = record.problemTitle && record.problemTitle !== record.problemId
    ? record.problemTitle : toTitleCase(record.problemId)

  return (
    <div className="bg-page border border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold leading-snug truncate mb-1">{title}</p>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
              record.mode === 'interview'
                ? 'text-red-400 bg-red-500/10 border-red-500/30'
                : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
            }`}>{record.mode === 'interview' ? 'Interview' : 'Practice'}</span>
            <span className="text-[10px] text-zinc-600">{relativeTime(record.date)}</span>
          </div>
        </div>
        <span className={`text-lg font-black px-2.5 py-1 rounded-lg border shrink-0 ${gradeClasses(record.scores.grade)}`}>
          {record.scores.grade}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {(['Architecture', 'Scalability', 'Reliability', 'Communication'] as const).map(label => {
          const key = label.toLowerCase() as keyof typeof record.scores
          const val = record.scores[key] as number
          return (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-600 w-20 shrink-0">{label}</span>
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor(val)}`} style={{ width: `${val}%` }} />
              </div>
              <span className="text-[10px] text-zinc-500 w-5 text-right">{val}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Main page ────────────────────────────────────────────────────────────────── */
export const DashboardPage = () => {
  const navigate = useNavigate()
  const {
    name, level, sessionsCompleted, totalTokensUsed, solvedProblems, setLevel,
    cvText, cvSkills, cvProblems, isAnalyzingCv, setCvText, setAnalyzingCv,
    sessionHistory, quizProgress, avatar, googleId, signOut,
  } = useUserStore()
  const weaknesses = useWeaknessAnalysis()

  if (!name) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-8">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-5">
            <Layers size={26} className="text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Arch<span className="text-indigo-400">ly</span></h1>
          <p className="text-zinc-400 text-sm mb-8">Sign in to track your progress across all topics</p>
          <GoogleSignIn />
        </div>
      </div>
    )
  }

  const quizzedTopics   = TOPICS.filter(t => quizProgress[`topic-${t.slug}`])
  const quizzedLangs    = LANGUAGES.filter(l => quizProgress[`lang-${l.slug}`])
  const solvedProblemList = PROBLEMS.filter(p => solvedProblems.includes(p.id))

  return (
    <div className="min-h-screen bg-page">
      {/* ── Nav ──────────────────────────────────────────────────── */}
      <div className="border-b border-white/[0.05] bg-page/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
            <ArrowLeft size={14} /> <span className="hidden sm:inline">Home</span>
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 text-white font-semibold text-sm pointer-events-none">Profile</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">

        {/* ── Profile card ─────────────────────────────────────── */}
        <div className="bg-card border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          {/* Avatar */}
          {googleId && avatar
            ? <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover border-2 border-white/10 shrink-0" referrerPolicy="no-referrer" />
            : <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0">{getInitials(name)}</div>
          }

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-lg leading-tight truncate">{name}</p>
            {googleId && <p className="text-zinc-500 text-xs mt-0.5">{useUserStore.getState().email ?? ''}</p>}
          </div>

          {/* Level + sign out */}
          <div className="flex items-center gap-2 shrink-0">
            <LevelDropdown value={level} onChange={setLevel} />
            <button onClick={signOut} title="Sign out"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-500 hover:text-zinc-300 flex items-center justify-center transition-colors">
              <LogOut size={13} />
            </button>
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: CheckCircle2, label: 'Problems', value: solvedProblems.length, color: 'text-green-400' },
            { icon: BarChart2,    label: 'Sessions',  value: sessionsCompleted,     color: 'text-blue-400'  },
            { icon: Zap,          label: 'Tokens',    value: formatTokens(totalTokensUsed), color: 'text-yellow-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-card border border-white/[0.05] rounded-xl p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} className={color} />
                <span className="text-zinc-500 text-[11px]">{label}</span>
              </div>
              <span className="text-2xl font-bold text-white">{value}</span>
            </div>
          ))}
        </div>

        {/* ── Quiz Progress ────────────────────────────────────────── */}
        <div>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">Progress</p>
          <div className="rounded-2xl border border-white/[0.05] overflow-hidden divide-y divide-white/6">

            {/* System Design */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers size={12} className="text-indigo-400" />
                  <span className="text-xs font-semibold text-white">System Design</span>
                </div>
                <span className="text-[11px] text-zinc-600">{solvedProblemList.length} / {PROBLEMS.length}</span>
              </div>
              {solvedProblemList.length === 0 ? (
                <button onClick={() => navigate('/practice')} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
                  Start practicing <ArrowRight size={10} />
                </button>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {solvedProblemList.map(p => (
                    <span key={p.id} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/4 text-[11px] text-zinc-400">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${diffColor(p.difficulty)}`} />
                      {p.title}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Concepts */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={12} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Concepts</span>
                </div>
                <span className="text-[11px] text-zinc-600">{quizzedTopics.length} / {TOPICS.length}</span>
              </div>
              {quizzedTopics.length === 0 ? (
                <button onClick={() => navigate('/learn')} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
                  Start learning <ArrowRight size={10} />
                </button>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1">
                  {quizzedTopics.map(t => {
                    const p = quizProgress[`topic-${t.slug}`]
                    return (
                      <div key={t.slug} className="flex items-center gap-2 py-1">
                        <span className="text-[11px] text-zinc-400 flex-1 truncate">{t.title}</span>
                        <span className="text-[10px] text-zinc-600">{p.score}/{p.total}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${gradeClasses(p.grade)}`}>{p.grade}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Languages */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code2 size={12} className="text-violet-400" />
                  <span className="text-xs font-semibold text-white">Languages</span>
                </div>
                <span className="text-[11px] text-zinc-600">{quizzedLangs.length} / {LANGUAGES.length}</span>
              </div>
              {quizzedLangs.length === 0 ? (
                <button onClick={() => navigate('/languages')} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
                  Start quizzing <ArrowRight size={10} />
                </button>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1">
                  {quizzedLangs.map(l => {
                    const p = quizProgress[`lang-${l.slug}`]
                    return (
                      <div key={l.slug} className="flex items-center gap-2 py-1">
                        <span className="text-sm leading-none shrink-0">{l.icon}</span>
                        <span className="text-[11px] text-zinc-400 flex-1 truncate">{l.name}</span>
                        <span className="text-[10px] text-zinc-600">{p.score}/{p.total}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${gradeClasses(p.grade)}`}>{p.grade}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Areas to focus ───────────────────────────────────────── */}
        {sessionHistory.length >= 3 && (
          <div className="bg-card border border-white/5 rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.04] flex items-center gap-2">
              <TrendingUp size={13} className="text-zinc-400" />
              <p className="text-white font-semibold text-sm">Areas to Focus On</p>
              <span className="text-zinc-600 text-[11px] ml-auto">Last {sessionHistory.length} sessions</span>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              {weaknesses.map(w => (
                <div key={w.category} className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-400 w-24 shrink-0">{w.category}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${barColor(w.avg)}`} style={{ width: `${w.avg}%` }} />
                  </div>
                  <span className={`text-[11px] font-semibold w-8 text-right ${w.avg >= 70 ? 'text-green-400' : w.avg >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {w.avg}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent sessions ──────────────────────────────────────── */}
        {sessionHistory.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={13} className="text-zinc-500" />
              <h2 className="text-sm font-semibold text-white">Recent Sessions</h2>
            </div>
            <div className="flex flex-col gap-3">
              {sessionHistory.slice(0, 5).map(r => <SessionCard key={r.id} record={r} />)}
            </div>
          </div>
        )}

        {/* ── CV section ───────────────────────────────────────────── */}
        <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05]">
            <p className="text-white font-semibold text-sm">CV-Based Problems</p>
            <p className="text-zinc-500 text-xs mt-0.5">Paste your CV to get personalised system design questions</p>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            <textarea
              value={cvText}
              onChange={e => setCvText(e.target.value)}
              placeholder="Paste your CV / resume here…"
              rows={4}
              className="w-full bg-page border border-white/5 rounded-xl px-3 py-2.5 text-zinc-300 text-xs placeholder:text-zinc-600 outline-none focus:border-indigo-500/40 resize-none leading-relaxed"
            />
            <button
              onClick={() => { if (!cvText.trim() || isAnalyzingCv) return; setAnalyzingCv(true); sendWS('ANALYZE_CV', { cvText, userLevel: level }) }}
              disabled={!cvText.trim() || isAnalyzingCv}
              className="self-start flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {isAnalyzingCv ? <><div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />Analyzing…</> : 'Analyze CV'}
            </button>

            {cvSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {cvSkills.map(s => <span key={s} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] rounded-md">{s}</span>)}
              </div>
            )}

            {cvProblems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                {cvProblems.map(p => (
                  <div key={p.id} className="bg-page border border-white/5 rounded-xl p-3 flex flex-col gap-2">
                    <p className="text-white text-xs font-semibold">{p.title}</p>
                    <p className="text-zinc-500 text-[11px] leading-relaxed flex-1">{p.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.relevantSkills.map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 bg-white/5 text-zinc-600 rounded">{s}</span>)}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/practice/${p.id}`, { state: { customProblem: { title: p.title, description: p.description } } })}
                        className="flex-1 py-1.5 text-[11px] font-medium bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-lg transition-colors">Practice</button>
                      <button onClick={() => navigate(`/interview/${p.id}`, { state: { customProblem: { title: p.title, description: p.description } } })}
                        className="flex-1 py-1.5 text-[11px] font-medium bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg border border-white/10 transition-colors">Interview</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <button onClick={() => navigate('/practice')}
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
          Start Practicing <ArrowRight size={16} />
        </button>

      </div>
    </div>
  )
}
