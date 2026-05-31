import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useUserStore } from '../stores/userStore'
import { GoogleSignIn } from '../components/GoogleSignIn'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  MonitorPlay,
  Zap,
  BookOpen,
  FileSearch,
  User,
} from 'lucide-react'
import { ArchlyMark } from '../components/ArchlyLogo'
import { ThemeToggle } from '../components/ThemeToggle'

const SAMPLE_PROBLEMS = [
  {
    id: 'url-shortener',
    title: 'URL Shortener',
    difficulty: 'Easy' as const,
    companies: ['Google', 'Amazon'],
    description: 'Design a scalable URL shortening service handling 100M URLs with sub-10ms redirect latency.',
  },
  {
    id: 'instagram',
    title: 'Instagram',
    difficulty: 'Medium' as const,
    companies: ['Meta', 'Instagram'],
    description: 'Build a photo-sharing platform with feed generation, upload pipeline, and 500M daily active users.',
  },
  {
    id: 'youtube',
    title: 'YouTube',
    difficulty: 'Medium' as const,
    companies: ['Google', 'YouTube'],
    description: 'Design a video hosting and streaming platform with transcoding, CDN delivery, and global scale.',
  },
  {
    id: 'uber',
    title: 'Uber',
    difficulty: 'Hard' as const,
    companies: ['Uber', 'Lyft'],
    description: 'Real-time ride-matching with GPS tracking, driver-rider pairing in seconds, and 5M daily trips.',
  },
  {
    id: 'slack',
    title: 'Slack',
    difficulty: 'Hard' as const,
    companies: ['Slack', 'Microsoft'],
    description: 'Architect a real-time messaging platform for 10M concurrent users with channels, threads, and search.',
  },
  {
    id: 'payment-system',
    title: 'Payment System',
    difficulty: 'Hard' as const,
    companies: ['Stripe', 'PayPal'],
    description: 'Design a payment processing system with ACID guarantees, idempotency, and fraud detection at $1B/day.',
  },
]

const FEATURES = [
  {
    icon: MonitorPlay,
    title: 'Live Architecture Canvas',
    description:
      'As you talk through your design, a real-time canvas builds itself â€" nodes appear, edges connect, and components update live based on your words.',
    accent: 'text-indigo-400',
    glow: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    icon: Zap,
    title: 'FAANG-Level AI Interviewer',
    description:
      'Face an interviewer that injects failure scenarios, changes requirements mid-design, challenges every vague answer, and escalates pressure over time.',
    accent: 'text-red-400',
    glow: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  {
    icon: BookOpen,
    title: '25 Classic Problems',
    description:
      'From URL shortener to stock exchange â€" all 25 canonical system design problems, organized by difficulty and annotated with FAANG company tags.',
    accent: 'text-emerald-400',
    glow: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
]

const difficultyColor = {
  Easy: 'text-green-400 bg-green-400/10 border-green-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/20',
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').join('').slice(0, 2)
}

export const Landing = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const name   = useUserStore(s => s.name)
  const avatar = useUserStore(s => s.avatar)
  const [showSignIn, setShowSignIn] = useState(false)
  const signInRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if ((location.state as { requireSignIn?: boolean } | null)?.requireSignIn) {
      setShowSignIn(true)
    }
  }, [location.state])

  return (
    <div className="min-h-screen bg-page text-white overflow-x-hidden">
      {/* Sign-in modal */}
      <AnimatePresence>
        {showSignIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowSignIn(false) }}
          >
            <motion.div
              ref={signInRef}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-white/10 rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-1">Sign in to continue</h2>
              <p className="text-zinc-400 text-sm mb-6">You need an account to access this feature.</p>
              <GoogleSignIn onSuccess={() => setShowSignIn(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/3 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-purple-600/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      {/* â"€â"€ Nav â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/[0.06] backdrop-blur-sm bg-page/60">
        <div className="flex items-center gap-2">
          <ArchlyMark size={30} />
          <span className="font-bold text-white text-sm sm:text-base tracking-tight">Arch<span className="text-indigo-400">ly</span></span>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          <button onClick={() => name ? navigate('/dashboard') : setShowSignIn(true)} className="flex items-center gap-2 hover:opacity-80 transition-opacity" title="Profile">
            {name ? (
              avatar
                ? <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover border border-white/20" />
                : <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">{getInitials(name)}</div>
            ) : (
              <><User size={14} className="text-zinc-400" /><span className="hidden sm:inline text-sm text-zinc-400">Profile</span></>
            )}
          </button>
          <ThemeToggle />
          <button
            onClick={() => name ? navigate('/practice') : setShowSignIn(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <span className="hidden sm:inline">Start Practicing</span>
            <span className="sm:hidden">Practice</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left — copy */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              FAANG-level AI · Live Canvas · 25 problems
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.06 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.06] mb-5"
            >
              Master system design.<br />
              <span className="text-zinc-400 font-normal text-3xl sm:text-4xl lg:text-5xl">Get the FAANG offer.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8 max-w-md"
            >
              A live architecture canvas that draws itself as you talk. An AI interviewer that never lets a vague answer slide. 25 classic problems from URL shorteners to stock exchanges.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={() => name ? navigate('/practice') : setShowSignIn(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/30 text-sm"
              >
                Start for free <ArrowRight size={15} />
              </button>
              <button
                onClick={() => name ? navigate('/cv-analysis') : setShowSignIn(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white font-semibold rounded-xl transition-all bg-white/[0.03] text-sm"
              >
                <FileSearch size={15} /> Analyze my CV
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-xs text-zinc-600"
            >
              {['25 design problems', 'Live canvas', 'Quiz & concepts', 'Language quizzes', 'CV gap analysis'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />{t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — product preview */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="flex-1 w-full max-w-lg lg:max-w-none hidden lg:block"
          >
            <div className="relative rounded-2xl border border-white/8 bg-zinc-950/60 shadow-2xl flex flex-col" style={{ aspectRatio: '4/3' }}>
              {/* Fake canvas header */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/6 bg-black/20">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-zinc-600 text-[10px] ml-2 font-mono">Instagram · Practice · 14:32</span>
              </div>
              {/* Fake canvas nodes */}
              <div className="relative flex-1 min-h-0 p-5">
                {[
                  { label: 'Client', color: '#94a3b8', x: '4%',  y: '40%' },
                  { label: 'CDN',    color: '#06b6d4', x: '4%',  y: '15%' },
                  { label: 'LB',     color: '#3b82f6', x: '30%', y: '40%' },
                  { label: 'API',    color: '#6366f1', x: '56%', y: '28%' },
                  { label: 'Cache',  color: '#eab308', x: '78%', y: '15%' },
                  { label: 'DB',     color: '#22c55e', x: '78%', y: '52%' },
                  { label: 'Queue',  color: '#a855f7', x: '56%', y: '65%' },
                ].map((n, i) => (
                  <motion.div
                    key={n.label}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.12, type: 'spring', stiffness: 300, damping: 22 }}
                    className="absolute flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-semibold"
                    style={{
                      left: n.x, top: n.y,
                      background: `${n.color}12`,
                      borderColor: `${n.color}30`,
                      color: n.color,
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: n.color }} />
                    {n.label}
                  </motion.div>
                ))}
                {/* SVG edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.25 }}>
                  <line x1="13%" y1="43%" x2="30%" y2="43%" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 3" />
                  <line x1="38%" y1="43%" x2="56%" y2="32%" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 3" />
                  <line x1="67%" y1="30%" x2="78%" y2="20%" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 3" />
                  <line x1="67%" y1="34%" x2="78%" y2="56%" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 3" />
                  <line x1="63%" y1="40%" x2="63%" y2="65%" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 3" />
                </svg>
                {/* Chat bubble overlay */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6, duration: 0.4 }}
                  className="absolute bottom-4 left-4 right-4 rounded-xl px-3 py-2.5 backdrop-blur-sm border"
                  style={{ background: 'var(--c-bg-card)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-400 leading-relaxed">
                    <span className="text-indigo-400 font-semibold">AI: </span>
                    You added a load balancer — good. But what happens when the LB itself goes down? What's your redundancy plan?
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>


      {/* â"€â"€ Feature highlights â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <section className="relative z-10 px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className={`relative p-6 rounded-2xl bg-card border border-white/[0.08] ${f.border} hover:border-opacity-50 transition-all duration-300 group overflow-hidden`}
            >
              <div className={`absolute inset-0 ${f.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className={`relative w-10 h-10 rounded-xl ${f.glow} border ${f.border} flex items-center justify-center mb-4`}>
                <f.icon size={18} className={f.accent} />
              </div>
              <h3 className="relative text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="relative text-sm text-zinc-400 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* â"€â"€ Problems preview â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <section className="relative z-10 px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between mb-6 sm:mb-8"
          >
            <div>
              <p className="text-xs font-medium text-indigo-400 uppercase tracking-widest mb-2">Problem Bank</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">25 Classic Problems</h2>
              <p className="mt-2 text-zinc-400 text-sm">The canonical list every FAANG interviewer draws from.</p>
            </div>
            <button
              onClick={() => name ? navigate('/practice') : setShowSignIn(true)}
              className="hidden md:flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              View all 25 problems
              <ArrowRight size={14} />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_PROBLEMS.map((p, i) => (
              <motion.div
                key={p.id}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                onClick={() => name ? navigate(`/practice/${p.id}`) : setShowSignIn(true)}
                className="p-5 rounded-xl bg-card border border-white/[0.08] hover:border-white/[0.18] cursor-pointer transition-all duration-200 hover:bg-card group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-white group-hover:text-indigo-300 transition-colors text-sm">
                    {p.title}
                  </h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${difficultyColor[p.difficulty]}`}>
                    {p.difficulty}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3">{p.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.companies.map((c) => (
                    <span key={c} className="text-xs px-2 py-0.5 rounded bg-white/[0.05] text-zinc-400 border border-white/[0.06]">
                      {c}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex justify-center mt-8 md:hidden"
          >
            <button
              onClick={() => name ? navigate('/practice') : setShowSignIn(true)}
              className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              View all 25 problems
              <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* â"€â"€ CV Analysis CTA â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <section className="relative z-10 px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative p-6 sm:p-10 md:p-14 rounded-2xl bg-card border border-white/[0.08] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/8 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-600/6 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative flex flex-col gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
                  <FileSearch size={12} /> CV Gap Analyzer
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3">
                  Know your gaps before the interview
                </h2>
                <p className="text-zinc-400 leading-relaxed text-sm">
                  Paste your CV and the job description. Get a match score, specific skill gaps,
                  and an actionable list of system design topics to study.
                </p>
              </div>
              <button
                onClick={() => name ? navigate('/cv-analysis') : setShowSignIn(true)}
                className="self-start flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all text-sm"
              >
                Analyze My CV Free <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* â"€â"€ Footer â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ArchlyMark size={22} />
            <span className="text-sm font-bold text-zinc-300">Arch<span className="text-indigo-400">ly</span></span>
          </div>
          <p className="text-xs text-zinc-600">AI-Powered System Design Training</p>
        </div>
      </footer>
    </div>
  )
}

