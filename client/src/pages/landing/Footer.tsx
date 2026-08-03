import { ArchlyMark } from '../../components/ArchlyLogo'

export const Footer = () => (
  <footer className="relative z-10 border-t border-border-subtle px-8 py-8">
    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <ArchlyMark size={20} />
        <span className="text-sm font-semibold text-text-secondary">Arch<span className="text-accent">ly</span></span>
      </div>
      <p className="text-xs text-text-subtle font-mono">AI-powered system design training</p>
    </div>
  </footer>
)
