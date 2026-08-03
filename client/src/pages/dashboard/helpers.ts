import type { UserLevel } from '../../stores/userStore'

export const LEVELS: { id: UserLevel; label: string; desc: string }[] = [
  { id: 'learner', label: 'Learner',  desc: 'New to system design — load balancers, caches, databases' },
  { id: 'junior',  label: 'Junior',   desc: 'Knows components, REST APIs, basic scaling' },
  { id: 'mid',     label: 'Mid',      desc: 'CAP theorem, sharding, consistent hashing, queues' },
  { id: 'senior',  label: 'Senior',   desc: 'Multi-region, cost tradeoffs, failure scenarios, full depth' },
]

export const LEVEL_COLORS: Record<UserLevel, string> = {
  learner: 'text-green-400 bg-green-500/10 border-green-500/30',
  junior:  'text-blue-400 bg-blue-500/10 border-blue-500/30',
  mid:     'text-amber-400 bg-amber-500/10 border-amber-500/30',
  senior:  'text-red-400 bg-red-500/10 border-red-500/30',
}

export function formatTokens(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n) }
export function toTitleCase(s: string) { return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }

export function relativeTime(ts: number) {
  const d = Math.floor((Date.now() - ts) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 7) return `${d} days ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function gradeClasses(g: string) {
  if (g === 'A' || g === 'A+') return 'text-green-400 bg-green-500/10 border-green-500/30'
  if (g === 'B' || g === 'B+') return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
  if (g === 'C') return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  return 'text-red-400 bg-red-500/10 border-red-500/30'
}

export function barColor(n: number) { return n >= 70 ? 'bg-green-500' : n >= 50 ? 'bg-amber-500' : 'bg-red-500' }

export function diffColor(d: string) {
  return d === 'Easy' || d === 'Beginner' ? 'bg-green-400'
       : d === 'Medium' || d === 'Intermediate' ? 'bg-amber-400'
       : 'bg-red-400'
}

export function getInitials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').join('').slice(0, 2)
}
