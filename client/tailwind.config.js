/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Legacy raw-color tokens (still the source of truth for page/card
        // backgrounds — do not remove, widely used across components).
        page:        'var(--c-bg-page)',
        card:        'var(--c-bg-card)',
        'card-dark': 'var(--c-bg-card-dark)',
        bg: {
          base: '#0A0A0F',
          panel: '#111116',
          elevated: '#18181f',
        },

        // ── Semantic design-system tokens ──────────────────────────────
        // Backed by the CSS custom properties defined in src/index.css
        // (":root" = dark, ".light" = light). See the token banner at the
        // top of that file for the full list and the component migration
        // path (e.g. `text-zinc-400` -> `text-text-muted`).
        text: {
          primary: 'var(--text-primary)',     // text-text-primary
          secondary: 'var(--text-secondary)', // text-text-secondary
          muted: 'var(--text-muted)',         // text-text-muted
          subtle: 'var(--text-subtle)',       // text-text-subtle
        },
        surface: {
          DEFAULT: 'var(--surface)',          // bg-surface           (alias of bg-card)
          elevated: 'var(--surface-elevated)',// bg-surface-elevated  (modals/popups)
          sunken: 'var(--surface-sunken)',    // bg-surface-sunken    (alias of bg-page)
        },
        border: {
          subtle: 'var(--border-subtle)',
          default: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
        accent: {
          DEFAULT: 'var(--accent)',   // bg-accent / text-accent / border-accent
          hover: 'var(--accent-hover)',
        },
        // Pre-mixed low-opacity accent fills/borders (badges, icon chips, hover
        // washes). CSS-variable colors can't reliably take Tailwind's `/opacity`
        // modifier, so the alpha is baked into the variable itself instead.
        'accent-soft':        'var(--accent-subtle)',
        'accent-soft-border': 'var(--accent-subtle-border)',
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
