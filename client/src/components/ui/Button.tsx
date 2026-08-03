import { cn } from '../../lib/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-accent hover:bg-accent-hover text-white',
  ghost: 'bg-surface-elevated hover:bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-default hover:border-border-strong',
  danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = ({ variant = 'ghost', size = 'md', className, children, ...props }: ButtonProps) => (
  <button
    {...props}
    className={cn(
      'inline-flex items-center gap-2 rounded-md font-medium transition-colors duration-150',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variants[variant], sizes[size], className
    )}
  >
    {children}
  </button>
)
