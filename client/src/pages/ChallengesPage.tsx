import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Flame } from 'lucide-react'
import { useUserStore } from '../stores/userStore'
import { ChallengeCard } from './challenges/ChallengeCard'
import { StreakCalendar } from './challenges/StreakCalendar'
import { RecentCompletions } from './challenges/RecentCompletions'
import {
  getDailyProblem, getWeeklyProblem, dailyKey, weeklyKey,
  dailyCountdown, weeklyCountdown, fadeUp,
} from './challenges/data'

export default function ChallengesPage() {
  const navigate = useNavigate()
  const { streakDays, completedChallengeIds, recordChallengeComplete } = useUserStore()

  const dailyProblem = useMemo(() => getDailyProblem(), [])
  const weeklyProblem = useMemo(() => getWeeklyProblem(), [])
  const dKey = dailyKey()
  const wKey = weeklyKey()
  const isDailyDone = completedChallengeIds.includes(dKey)
  const isWeeklyDone = completedChallengeIds.includes(wKey)

  const handlePractice = (problemId: string, key: string) => { recordChallengeComplete(key); navigate(`/practice/${problemId}`) }
  const handleInterview = (problemId: string, key: string) => { recordChallengeComplete(key); navigate(`/interview/${problemId}`) }

  const recentCompletions = useMemo(() => [...completedChallengeIds].reverse().slice(0, 5), [completedChallengeIds])

  const last14Days = useMemo(() => {
    const days: { label: string; isoDate: string; active: boolean }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const iso = d.toISOString().slice(0, 10)
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1),
        isoDate: iso,
        active: completedChallengeIds.some(id => id.startsWith(iso)),
      })
    }
    return days
  }, [completedChallengeIds])

  return (
    <div className="min-h-screen bg-page text-text-primary">
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">

        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm text-text-subtle hover:text-text-secondary transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">Challenges</h1>
            <Trophy size={20} className="text-amber-400" />
          </div>
          {streakDays > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-mono font-semibold text-amber-400">
              <Flame size={15} /> {streakDays} day streak
            </span>
          ) : (
            <span className="text-xs text-text-subtle italic">Start your streak today</span>
          )}
        </motion.div>

        <ChallengeCard
          index={1} kind="daily" problem={dailyProblem} isDone={isDailyDone} countdown={dailyCountdown()}
          onPractice={() => handlePractice(dailyProblem.id, dKey)}
          onInterview={() => handleInterview(dailyProblem.id, dKey)}
        />

        <ChallengeCard
          index={2} kind="weekly" problem={weeklyProblem} isDone={isWeeklyDone} countdown={weeklyCountdown()}
          onPractice={() => handlePractice(weeklyProblem.id, wKey)}
          onInterview={() => handleInterview(weeklyProblem.id, wKey)}
        />

        <StreakCalendar days={last14Days} />
        <RecentCompletions keys={recentCompletions} />

      </div>
    </div>
  )
}
