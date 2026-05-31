import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, HelpCircle, ChevronRight, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { PROBLEMS } from '../../config/problems'
import { TOPICS } from '../../config/topics'
import { LANGUAGES } from '../../config/languages'
import { useUserStore } from '../../stores/userStore'
import { GoogleSignIn } from '../../components/GoogleSignIn'
import { apiUrl } from '../../lib/api'

const diffColor: Record<string, string> = {
  Easy:   'text-green-400 bg-green-400/10 border-green-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Hard:   'text-red-400 bg-red-400/10 border-red-400/20',
}
const diffDot: Record<string, string> = {
  Easy: 'bg-green-400', Medium: 'bg-yellow-400', Hard: 'bg-red-400',
}

const topicDiffColor: Record<string, string> = {
  Beginner:     'text-green-400 bg-green-400/10 border-green-400/20',
  Intermediate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Advanced:     'text-red-400 bg-red-400/10 border-red-400/20',
}

const COMPANY_COLORS: Record<string, string> = {
  Google:       'text-blue-400',
  Meta:         'text-blue-500',
  Facebook:     'text-blue-500',
  Amazon:       'text-orange-400',
  Apple:        'text-zinc-300',
  Netflix:      'text-red-500',
  Microsoft:    'text-sky-400',
  Uber:         'text-zinc-200',
  Lyft:         'text-pink-400',
  Twitter:      'text-sky-400',
  Slack:        'text-violet-400',
  Stripe:       'text-indigo-400',
  PayPal:       'text-blue-400',
  Dropbox:      'text-blue-400',
  Airbnb:       'text-rose-400',
  Instagram:    'text-pink-500',
  WhatsApp:     'text-green-400',
  YouTube:      'text-red-400',
  TikTok:       'text-teal-400',
  ByteDance:    'text-teal-400',
  Twitch:       'text-violet-500',
  Booking:      'text-blue-400',
  'Booking.com':'text-blue-400',
  Expedia:      'text-yellow-400',
  NASDAQ:       'text-emerald-400',
  NYSE:         'text-emerald-400',
  Gmail:        'text-red-400',
  Redis:        'text-red-400',
  Memcached:    'text-zinc-400',
  'YouTube Live':'text-red-400',
}

function companyColor(name: string): string {
  return COMPANY_COLORS[name] ?? 'text-zinc-500'
}

const PREVIEW_PROBLEMS = PROBLEMS.slice(0, 8)
const PREVIEW_TOPICS   = TOPICS.slice(0, 8)
const PREVIEW_LANGS    = LANGUAGES.slice(0, 8)

function SectionHeader({ title, subtitle, cta, onCta }: { title: string; subtitle: string; cta: string; onCta: () => void }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-white font-bold text-base mb-0.5">{title}</h2>
        <p className="text-zinc-500 text-xs">{subtitle}</p>
      </div>
      <button
        onClick={onCta}
        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors shrink-0"
      >
        {cta} <ChevronRight size={12} />
      </button>
    </div>
  )
}

export const PracticeSetup = () => {
  const navigate = useNavigate()
  const name = useUserStore(s => s.name)
  const [customSystem, setCustomSystem] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggesting, setSuggesting] = useState(false)

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input.trim() || input.trim().length < 3) { setSuggestions([]); return }
    setSuggesting(true)
    try {
      const resp = await fetch(apiUrl('/api/suggest-systems'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      const data = await resp.json() as { suggestions?: string[] }
      setSuggestions(data.suggestions ?? [])
    } catch { setSuggestions([]) }
    finally { setSuggesting(false) }
  }, [])

  if (!name) {
    return (
      <div className="min-h-screen bg-page flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <HelpCircle size={24} className="text-indigo-400" />
          </div>
          <h1 className="text-white font-bold text-2xl mb-2">Sign in to practice</h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            Create a free account to track your progress, save quiz results, and access all 25 system design problems.
          </p>
          <GoogleSignIn onSuccess={() => {}} />
          <button
            onClick={() => navigate('/')}
            className="mt-5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page">

      {/* Nav */}
      <div className="border-b border-white/[0.04] bg-page/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 relative flex items-center">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
            <ArrowLeft size={14} /> <span className="hidden sm:inline">Home</span>
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 text-white font-semibold text-sm pointer-events-none">Practice Hub</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-14">

        {/* ── 1 · SYSTEM DESIGN ──────────────────────────────── */}
        <section>
          <SectionHeader
            title="System Design"
            subtitle="25 classic problems — practice or interview mode"
            cta={`View all ${PROBLEMS.length}`}
            onCta={() => navigate('/problems')}
          />

          {/* Custom system input */}
          <div className="mb-5">
            <div className="flex gap-2 items-start">
              <div className="flex-1 relative">
                <textarea
                  value={customSystem}
                  onChange={e => { setCustomSystem(e.target.value); setSuggestions([]) }}
                  placeholder="Or describe your own system… e.g. real-time collaboration tool"
                  rows={1}
                  className="w-full bg-card border border-white/[0.05] rounded-xl px-4 py-2.5 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500/40 resize-none transition-colors leading-relaxed"
                  style={{ minHeight: '40px' }}
                />
              </div>
              <button
                onClick={() => fetchSuggestions(customSystem)}
                disabled={suggesting || customSystem.trim().length < 3}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 text-xs font-medium transition-all disabled:opacity-40 shrink-0"
                title="Get AI suggestions"
              >
                {suggesting
                  ? <div className="w-3.5 h-3.5 border border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                  : <Sparkles size={13} />}
                <span className="hidden sm:inline">Suggest</span>
              </button>
              <button
                disabled={!customSystem.trim()}
                onClick={() => navigate(`/practice/custom-${Date.now()}`, { state: { customProblem: { title: customSystem.trim(), description: '' } } })}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-all disabled:opacity-40 shrink-0"
              >
                <Zap size={12} /> <span className="hidden sm:inline">Practice</span>
              </button>
              <button
                disabled={!customSystem.trim()}
                onClick={() => navigate(`/interview/custom-${Date.now()}`, { state: { customProblem: { title: customSystem.trim(), description: '' } } })}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/[0.05] text-zinc-300 text-xs font-medium rounded-xl transition-all disabled:opacity-40 shrink-0"
              >
                <ArrowRight size={12} /> <span className="hidden sm:inline">Interview</span>
              </button>
            </div>

            {/* AI suggestions */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="mt-2 flex flex-col gap-1"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setCustomSystem(s); setSuggestions([]) }}
                      className="text-left px-3 py-2 rounded-lg bg-violet-500/8 hover:bg-violet-500/15 border border-violet-500/15 text-zinc-300 text-xs transition-all"
                    >
                      <span className="text-violet-400 font-medium mr-1.5">{i + 1}.</span>{s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PREVIEW_PROBLEMS.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                onClick={() => navigate(`/problem/${p.id}`)}
                className="group relative p-4 rounded-xl bg-card border border-white/[0.05] hover:border-white/15 cursor-pointer transition-all duration-200 flex flex-col overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                  p.difficulty === 'Easy' ? 'bg-green-500/15' : p.difficulty === 'Medium' ? 'bg-yellow-500/15' : 'bg-red-500/15'
                }`} />

                <div className="relative flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-0.5 ${diffDot[p.difficulty]}`} />
                    <h3 className="text-white font-semibold text-xs group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
                      {p.title}
                    </h3>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ml-1.5 shrink-0 ${diffColor[p.difficulty]}`}>
                    {p.difficulty}
                  </span>
                </div>

                <p className="text-zinc-500 text-[10px] mb-3 line-clamp-2 leading-relaxed relative">{p.description}</p>

                <div className="relative flex items-center justify-between mt-auto">
                  <div className="flex gap-1">
                    {p.companies.slice(0, 1).map(c => (
                      <span key={c} className={`text-[9px] font-medium ${companyColor(c)}`}>{c}</span>
                    ))}
                  </div>
                  <span className="flex items-center gap-0.5 text-zinc-700 text-[9px]">
                    <Clock size={8} />{p.duration}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 2 · CONCEPTS ───────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Concepts"
            subtitle="Learn a topic, take a quiz, or chat with the AI tutor"
            cta={`View all ${TOPICS.length}`}
            onCta={() => navigate('/learn')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PREVIEW_TOPICS.map((topic, i) => (
              <motion.div
                key={topic.slug}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className="group relative p-4 rounded-xl bg-card border border-white/[0.05] hover:border-white/15 cursor-pointer transition-all duration-200 flex flex-col overflow-hidden"
                onClick={() => topic.hasContent ? navigate(`/learn/${topic.slug}`) : navigate(`/concept/${topic.slug}`)}
              >
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-indigo-500/10" />

                <div className="relative flex items-start justify-between mb-1.5">
                  <h3 className="text-white font-semibold text-xs group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2 flex-1 mr-1.5">
                    {topic.title}
                  </h3>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium shrink-0 ${topicDiffColor[topic.difficulty]}`}>
                    {topic.difficulty}
                  </span>
                </div>

                <p className="text-zinc-500 text-[10px] mb-3 leading-relaxed line-clamp-2 relative">{topic.description}</p>

                <button
                  onClick={e => { e.stopPropagation(); navigate(`/quiz/${topic.slug}`) }}
                  className="relative mt-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/12 hover:bg-indigo-500/22 text-indigo-400 hover:text-indigo-300 text-[10px] font-semibold transition-all"
                >
                  <HelpCircle size={9} /> Quiz
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 3 · LANGUAGES ──────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Languages & Tools"
            subtitle="Quiz yourself on language concepts, syntax, and gotchas"
            cta={`See all ${LANGUAGES.length}`}
            onCta={() => navigate('/languages')}
          />
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {PREVIEW_LANGS.map((lang, i) => (
              <motion.button
                key={lang.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.18 }}
                onClick={() => navigate(`/languages/${lang.slug}`)}
                className="group relative flex flex-col items-center gap-1.5 py-3.5 px-2 bg-card border border-white/8 rounded-xl hover:border-white/20 transition-all duration-200 overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at center, ${lang.color}14 0%, transparent 70%)` }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: lang.color }} />
                <span className="text-xl leading-none relative">{lang.icon}</span>
                <span className="text-zinc-300 text-[10px] font-medium relative group-hover:text-white transition-colors leading-tight text-center">{lang.name}</span>
              </motion.button>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
