import { PROBLEMS, type Problem } from '../../config/problems'

export function getDailyProblem(): Problem {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  return PROBLEMS[dayOfYear % PROBLEMS.length]
}

export function getWeeklyProblem(): Problem {
  const now = new Date()
  const weekOfYear = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7)
  const harder = PROBLEMS.filter(p => p.difficulty !== 'Easy')
  return harder[(weekOfYear * 7) % harder.length]
}

export function dailyKey(): string {
  return `${new Date().toISOString().slice(0, 10)}-daily`
}

export function weeklyKey(): string {
  const d = new Date()
  const week = Math.ceil(d.getDate() / 7)
  return `${d.getFullYear()}-${d.getMonth() + 1}-W${week}-weekly`
}

export function dailyCountdown(): string {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diffMs = midnight.getTime() - now.getTime()
  const h = Math.floor(diffMs / 3600000)
  const m = Math.floor((diffMs % 3600000) / 60000)
  return `${h}h ${m}m`
}

export function weeklyCountdown(): string {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 1=Mon … 6=Sat
  const daysUntilMonday = day === 0 ? 1 : 8 - day
  const nextMonday = new Date(now)
  nextMonday.setDate(now.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0)
  const diffMs = nextMonday.getTime() - now.getTime()
  const days = Math.ceil(diffMs / 86400000)
  return `${days} day${days !== 1 ? 's' : ''}`
}

export function formatChallengeKey(key: string): { date: string; type: 'Daily' | 'Weekly' } {
  const isWeekly = key.endsWith('-weekly')
  if (isWeekly) {
    const parts = key.replace('-weekly', '').split('-')
    return { date: `${parts[0]}-${parts[1].padStart(2, '0')} ${parts[2]}`, type: 'Weekly' }
  }
  return { date: key.replace('-daily', ''), type: 'Daily' }
}

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' as const },
  }),
}
