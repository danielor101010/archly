interface ArchlyLogoProps {
  size?: number
  className?: string
}

/** The Archly "A" mark — a stylised A built from two diagonal strokes and a crossbar,
 *  evoking a system-design node graph. */
export function ArchlyMark({ size = 32, className = '' }: ArchlyLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="url(#archly-grad)" />
      {/* Left leg */}
      <path d="M8 24L16 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Right leg */}
      <path d="M24 24L16 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Crossbar */}
      <path d="M11 18.5H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Node dots */}
      <circle cx="16" cy="8" r="2" fill="#a5b4fc" />
      <circle cx="8" cy="24" r="2" fill="#a5b4fc" />
      <circle cx="24" cy="24" r="2" fill="#a5b4fc" />
      <defs>
        <linearGradient id="archly-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function ArchlyWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight ${className}`}>
      Arch<span className="text-indigo-400">ly</span>
    </span>
  )
}
