import { type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'green' | 'red' | 'yellow' | 'blue' | 'purple'
  className?: string
}

const variants = {
  default: 'bg-surface-elevated text-text-secondary border border-border-subtle',
  green: 'bg-green-500/10 text-green-400 border border-green-500/25',
  red: 'bg-red-500/10 text-red-400 border border-red-500/25',
  yellow: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
  blue: 'bg-accent-soft text-accent border border-accent-soft-border',
  // kept for callers still passing "purple" — maps to the single accent, not a second hue
  purple: 'bg-accent-soft text-accent border border-accent-soft-border',
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => (
  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', variants[variant], className)}>
    {children}
  </span>
)
