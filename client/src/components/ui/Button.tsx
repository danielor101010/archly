import { cn } from '../../lib/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20',
  ghost: 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10',
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
      'inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-150',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variants[variant], sizes[size], className
    )}
  >
    {children}
  </button>
)
