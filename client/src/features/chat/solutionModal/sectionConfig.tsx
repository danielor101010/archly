import { CheckCircle2, Gauge, Code2, Database, Layers, GitBranch, TrendingUp } from 'lucide-react'

// One quiet neutral icon color for every section — icon SHAPE distinguishes
// categories, not a rainbow of hues (that's decoration, not information; unlike
// a grade or difficulty, these headings don't encode differing states).
const NEUTRAL = 'text-text-muted'

export const SECTION_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  'Functional Requirements':     { icon: <CheckCircle2 size={13} />, color: NEUTRAL },
  'Non-Functional Requirements': { icon: <Gauge size={13} />,        color: NEUTRAL },
  'API Design':                  { icon: <Code2 size={13} />,        color: NEUTRAL },
  'Data Models':                 { icon: <Database size={13} />,     color: NEUTRAL },
  'High-Level Architecture':     { icon: <Layers size={13} />,       color: NEUTRAL },
  'Key Design Decisions':        { icon: <GitBranch size={13} />,    color: NEUTRAL },
  'Scalability & Bottlenecks':   { icon: <TrendingUp size={13} />,   color: NEUTRAL },
}

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const

// HTTP verbs are genuinely different actions — multi-color here is real
// information (as in any API client), not decoration.
export const METHOD_COLORS: Record<string, string> = {
  GET:    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  POST:   'bg-blue-500/15 text-blue-300 border border-blue-500/25',
  PUT:    'bg-amber-500/15 text-amber-300 border border-amber-500/25',
  DELETE: 'bg-red-500/15 text-red-300 border border-red-500/25',
  PATCH:  'bg-orange-500/15 text-orange-300 border border-orange-500/25',
}

// Distinguishing sibling data entities from each other in the diagram view is
// meaningful (like any ER-diagram tool) — kept multi-hue, but built from a
// rotation that no longer includes the retired indigo brand color.
export const ENTITY_ACCENT_COLORS = [
  '#0ea5e9', // accent (sky)
  '#a855f7', // purple
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
]
