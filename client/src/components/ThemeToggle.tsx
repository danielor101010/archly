import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'

export const ThemeToggle = () => {
  const { theme, toggle } = useThemeStore()
  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/8 transition-colors"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  )
}
