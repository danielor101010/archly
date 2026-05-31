/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page:        'var(--c-bg-page)',
        card:        'var(--c-bg-card)',
        'card-dark': 'var(--c-bg-card-dark)',
        bg: {
          base: '#0A0A0F',
          panel: '#111116',
          elevated: '#18181f',
        },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          default: 'rgba(255,255,255,0.12)',
          strong: 'rgba(255,255,255,0.2)',
        },
        accent: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          glow: 'rgba(99,102,241,0.3)',
        },
        node: {
          healthy: '#22c55e',
          elevated: '#f59e0b',
          stressed: '#f97316',
          critical: '#ef4444',
          dead: '#52525b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 5px rgba(99,102,241,0.3)' },
          to: { boxShadow: '0 0 20px rgba(99,102,241,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
