import { ArrowRight, User } from 'lucide-react'
import { ArchlyMark } from '../../components/ArchlyLogo'
import { ThemeToggle } from '../../components/ThemeToggle'

function getInitials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').join('').slice(0, 2)
}

interface NavProps {
  name: string
  avatar?: string
  onProfile: () => void
  onPrimary: () => void
}

export const Nav = ({ name, avatar, onProfile, onPrimary }: NavProps) => (
  <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-border-subtle bg-page/80 backdrop-blur-sm">
    <div className="flex items-center gap-2">
      <ArchlyMark size={28} />
      <span className="font-semibold text-text-primary text-sm sm:text-base tracking-tight">
        Arch<span className="text-accent">ly</span>
      </span>
    </div>
    <div className="flex items-center gap-1 sm:gap-3">
      <button onClick={onProfile} className="flex items-center gap-2 hover:opacity-80 transition-opacity" title="Profile">
        {name ? (
          avatar
            ? <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover border border-border-default" />
            : <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold">{getInitials(name)}</div>
        ) : (
          <><User size={14} className="text-text-muted" /><span className="hidden sm:inline text-sm text-text-muted">Profile</span></>
        )}
      </button>
      <ThemeToggle />
      <button
        onClick={onPrimary}
        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-accent hover:bg-accent-hover text-white rounded-md transition-colors"
      >
        <span className="hidden sm:inline">Start Practicing</span>
        <span className="sm:hidden">Practice</span>
        <ArrowRight size={13} />
      </button>
    </div>
  </nav>
)
