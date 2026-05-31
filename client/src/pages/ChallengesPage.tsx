import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Building2, CheckCircle2, Flame, Trophy, CalendarDays } from 'lucide-react'
import { useUserStore } from '../stores/userStore'
import { PROBLEMS, type Problem } from '../config/problems'

// ---------------------------------------------------------------------------
// Deterministic problem selection
// ---------------------------------------------------------------------------

function getDailyProblem(): Problem {
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  )
  return PROBLEMS[dayOfYear % PROBLEMS.length]
}

function getWeeklyProblem(): Problem {
  const now = new Date()
  const weekOfYear = Math.ceil(
    (now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7
  )
  const harder = PROBLEMS.filter((p) => p.difficulty !== 'Easy')
  return harder[(weekOfYear * 7) % harder.length]
}

function dailyKey(): string {
  return `${new Date().toISOString().slice(0, 10)}-daily`
}

function weeklyKey(): string {
  const d = new Date()
  const week = Math.ceil(d.getDate() / 7)
  return `${d.getFullYear()}-${d.getMonth() + 1}-W${week}-weekly`
}

// ---------------------------------------------------------------------------
// Countdown helpers
// ---------------------------------------------------------------------------

function dailyCountdown(): string {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diffMs = midnight.getTime() - now.getTime()
  const h = Math.floor(diffMs / 3600000)
  const m = Math.floor((diffMs % 3600000) / 60000)
  return `${h}h ${m}m`
}

function weeklyCountdown(): string {
  const now = new Date()
  // Next Monday midnight
  const day = now.getDay() // 0=Sun, 1=Mon … 6=Sat
  const daysUntilMonday = day === 0 ? 1 : 8 - day
  const nextMonday = new Date(now)
  nextMonday.setDate(now.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0)
  const diffMs = nextMonday.getTime() - now.getTime()
  const days = Math.ceil(diffMs / 86400000)
  return `${days} day${days !== 1 ? 's' : ''}`
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function DifficultyBadge({ difficulty }: { difficulty: Problem['difficulty'] }) {
  const colors: Record<Problem['difficulty'], string> = {
    Easy: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    Hard: 'bg-red-500/20 text-red-400 border border-red-500/30',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[difficulty]}`}>
      {difficulty}
    </span>
  )
}

function CompletedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
      <CheckCircle2 size={12} />
      Completed
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' as const },
  }),
}

export default function  ChallengesPage() {
  const navigate = useNavigate()
  const { streakDays, completedChallengeIds, recordChallengeComplete } = useUserStore()

  const dailyProblem = useMemo(() => getDailyProblem(), [])
  const weeklyProblem = useMemo(() => getWeeklyProblem(), [])
  const dKey = dailyKey()
  const wKey = weeklyKey()
  const isDailyDone = completedChallengeIds.includes(dKey)
  const isWeeklyDone = completedChallengeIds.includes(wKey)

  function handlePractice(problem: Problem, key: string) {
    recordChallengeComplete(key)
    navigate(`/practice/${problem.id}`)
  }

  function handleInterview(problem: Problem, key: string) {
    recordChallengeComplete(key)
    navigate(`/interview/${problem.id}`)
  }

  // Last 5 completions for recent history
  const recentCompletions = useMemo(
    () => [...completedChallengeIds].reverse().slice(0, 5),
    [completedChallengeIds]
  )

  // Last 14 days for streak calendar
  const last14Days = useMemo(() => {
    const days: { label: string; isoDate: string; active: boolean }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const iso = d.toISOString().slice(0, 10)
      const active = completedChallengeIds.some((id) => id.startsWith(iso))
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1),
        isoDate: iso,
        active,
      })
    }
    return days
  }, [completedChallengeIds])

  function formatChallengeKey(key: string): { date: string; type: 'Daily' | 'Weekly' } {
    const isWeekly = key.endsWith('-weekly')
    if (isWeekly) {
      // format: "2026-5-W4-weekly" → extract year-month-week
      const parts = key.replace('-weekly', '').split('-')
      return { date: `${parts[0]}-${parts[1].padStart(2, '0')} ${parts[2]}`, type: 'Weekly' }
    }
    // daily format: "YYYY-MM-DD-daily"
    return { date: key.replace('-daily', ''), type: 'Daily' }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between"
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-100 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Challenges</h1>
            <Trophy size={22} className="text-amber-400" />
          </div>

          {/* Streak badge */}
          {streakDays > 0 ? (
            <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full px-3 py-1">
              <Flame size={16} className="text-amber-400" />
              <span className="text-sm font-bold text-amber-400">{streakDays} day streak</span>
            </div>
          ) : (
            <span className="text-xs text-gray-500 italic">Start your streak today</span>
          )}
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Daily Challenge card */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative rounded-2xl overflow-hidden border border-indigo-500/30 bg-gradient-to-br from-indigo-900/40 via-indigo-800/20 to-gray-900/60 p-6 shadow-xl"
        >
          {/* Top row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Daily Challenge
              </span>
              <CalendarDays size={14} className="text-indigo-400" />
            </div>
            <div className="flex items-center gap-2">
              {isDailyDone && <CompletedBadge />}
              <DifficultyBadge difficulty={dailyProblem.difficulty} />
            </div>
          </div>

          {/* Problem info */}
          <h2 className="text-2xl font-bold text-white mb-1">{dailyProblem.title}</h2>
          <p className="text-sm text-indigo-300 mb-3">{dailyProblem.subtitle}</p>
          <p className="text-sm text-gray-300 mb-4">{dailyProblem.description}</p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-6 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {dailyProblem.duration}
            </span>
            <span className="inline-flex items-center gap-1">
              <Building2 size={12} />
              {dailyProblem.companies.join(', ')}
            </span>
          </div>

          {/* Actions / countdown */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            {!isDailyDone ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handlePractice(dailyProblem, dKey)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                  Practice
                </button>
                <button
                  onClick={() => handleInterview(dailyProblem, dKey)}
                  className="px-4 py-2 rounded-lg border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:text-white text-sm font-semibold transition-colors"
                >
                  Interview
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => handlePractice(dailyProblem, dKey)}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-semibold transition-colors"
                >
                  Practice again
                </button>
              </div>
            )}
            <span className="text-xs text-gray-500">
              Resets in {dailyCountdown()}
            </span>
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Weekly Challenge card */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative rounded-2xl overflow-hidden border border-violet-500/30 bg-gradient-to-br from-violet-900/40 via-violet-800/20 to-gray-900/60 p-5 shadow-xl"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                Weekly Challenge
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isWeeklyDone && <CompletedBadge />}
              <DifficultyBadge difficulty={weeklyProblem.difficulty} />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">{weeklyProblem.title}</h2>
          <p className="text-sm text-violet-300 mb-2">{weeklyProblem.subtitle}</p>
          <p className="text-sm text-gray-300 mb-4">{weeklyProblem.description}</p>

          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {weeklyProblem.duration}
            </span>
            <span className="inline-flex items-center gap-1">
              <Building2 size={12} />
              {weeklyProblem.companies.join(', ')}
            </span>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            {!isWeeklyDone ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handlePractice(weeklyProblem, wKey)}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
                >
                  Practice
                </button>
                <button
                  onClick={() => handleInterview(weeklyProblem, wKey)}
                  className="px-4 py-2 rounded-lg border border-violet-500/50 hover:border-violet-400 text-violet-300 hover:text-white text-sm font-semibold transition-colors"
                >
                  Interview
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => handlePractice(weeklyProblem, wKey)}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-semibold transition-colors"
                >
                  Practice again
                </button>
              </div>
            )}
            <span className="text-xs text-gray-500">
              Resets in {weeklyCountdown()}
            </span>
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Streak calendar — last 14 days */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5"
        >
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Flame size={15} className="text-amber-400" />
            Last 14 Days
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {last14Days.map((day) => (
              <div key={day.isoDate} className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-600">{day.label}</span>
                <div
                  title={day.isoDate}
                  className={`w-7 h-7 rounded-md transition-colors ${
                    day.active
                      ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'bg-gray-800 border border-gray-700'
                  }`}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Recent completions */}
        {/* ---------------------------------------------------------------- */}
        {recentCompletions.length > 0 && (
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5"
          >
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              Recent Completions
            </h3>
            <ul className="space-y-2">
              {recentCompletions.map((key) => {
                const { date, type } = formatChallengeKey(key)
                return (
                  <li key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Completed a challenge on {date}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        type === 'Daily'
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      }`}
                    >
                      {type}
                    </span>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}

        {/* Empty state for recent completions */}
        {recentCompletions.length === 0 && (
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/30 p-8 text-center"
          >
            <Flame size={32} className="text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No challenges completed yet.</p>
            <p className="text-xs text-gray-600 mt-1">Complete today's challenge to start your streak!</p>
          </motion.div>
        )}

      </div>
    </div>
  )
}
