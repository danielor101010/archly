import { MonitorPlay, Zap, BookOpen } from 'lucide-react'

export interface SampleProblem {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  companies: string[]
  description: string
}

export const SAMPLE_PROBLEMS: SampleProblem[] = [
  {
    id: 'url-shortener',
    title: 'URL Shortener',
    difficulty: 'Easy',
    companies: ['Google', 'Amazon'],
    description: 'Design a scalable URL shortening service handling 100M URLs with sub-10ms redirect latency.',
  },
  {
    id: 'instagram',
    title: 'Instagram',
    difficulty: 'Medium',
    companies: ['Meta', 'Instagram'],
    description: 'Build a photo-sharing platform with feed generation, upload pipeline, and 500M daily active users.',
  },
  {
    id: 'youtube',
    title: 'YouTube',
    difficulty: 'Medium',
    companies: ['Google', 'YouTube'],
    description: 'Design a video hosting and streaming platform with transcoding, CDN delivery, and global scale.',
  },
  {
    id: 'uber',
    title: 'Uber',
    difficulty: 'Hard',
    companies: ['Uber', 'Lyft'],
    description: 'Real-time ride-matching with GPS tracking, driver-rider pairing in seconds, and 5M daily trips.',
  },
  {
    id: 'slack',
    title: 'Slack',
    difficulty: 'Hard',
    companies: ['Slack', 'Microsoft'],
    description: 'Architect a real-time messaging platform for 10M concurrent users with channels, threads, and search.',
  },
  {
    id: 'payment-system',
    title: 'Payment System',
    difficulty: 'Hard',
    companies: ['Stripe', 'PayPal'],
    description: 'Design a payment processing system with ACID guarantees, idempotency, and fraud detection at $1B/day.',
  },
]

export const FEATURES = [
  {
    icon: MonitorPlay,
    title: 'Live architecture canvas',
    description: 'As you talk through your design, a real-time canvas builds itself — nodes appear, edges connect, components update live based on your words.',
  },
  {
    icon: Zap,
    title: 'An interviewer that pushes back',
    description: 'Injects failure scenarios, changes requirements mid-design, challenges every vague answer, and escalates pressure as the session goes on.',
  },
  {
    icon: BookOpen,
    title: '25 classic problems',
    description: 'From URL shortener to stock exchange — every canonical system design problem, organized by difficulty and tagged by the companies that ask it.',
  },
]

export const DIFFICULTY_DOT: Record<SampleProblem['difficulty'], string> = {
  Easy: 'bg-green-500',
  Medium: 'bg-amber-500',
  Hard: 'bg-red-500',
}

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08 },
  }),
}
