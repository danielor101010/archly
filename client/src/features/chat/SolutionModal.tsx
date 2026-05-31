import { useEffect, useRef, useState } from 'react'
import {
  X,
  Sparkles,
  CheckCircle2,
  Gauge,
  Code2,
  Database,
  Layers,
  GitBranch,
  TrendingUp,
  LayoutGrid,
} from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Field {
  name: string
  type: string
}

interface Entity {
  name: string
  fields: Field[]
}

type TabId = 'solution' | 'diagram'

// ─── Section icon map ─────────────────────────────────────────────────────────

const SECTION_ICONS: Record<
  string,
  { icon: React.ReactNode; color: string }
> = {
  'Functional Requirements': {
    icon: <CheckCircle2 size={13} />,
    color: 'text-emerald-400',
  },
  'Non-Functional Requirements': {
    icon: <Gauge size={13} />,
    color: 'text-blue-400',
  },
  'API Design': {
    icon: <Code2 size={13} />,
    color: 'text-purple-400',
  },
  'Data Models': {
    icon: <Database size={13} />,
    color: 'text-yellow-400',
  },
  'High-Level Architecture': {
    icon: <Layers size={13} />,
    color: 'text-indigo-400',
  },
  'Key Design Decisions': {
    icon: <GitBranch size={13} />,
    color: 'text-orange-400',
  },
  'Scalability & Bottlenecks': {
    icon: <TrendingUp size={13} />,
    color: 'text-red-400',
  },
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const
const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  POST: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
  PUT: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/25',
  DELETE: 'bg-red-500/15 text-red-300 border border-red-500/25',
  PATCH: 'bg-orange-500/15 text-orange-300 border border-orange-500/25',
}

const ENTITY_ACCENT_COLORS = [
  '#6366f1', // indigo
  '#a855f7', // purple
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
]

// ─── Inline text parser (bold + inline code) ─────────────────────────────────

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  // Tokenise: **bold**, `code`, plain
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<span key={key++}>{text.slice(last, match.index)}</span>)
    }
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      )
    } else {
      parts.push(
        <code
          key={key++}
          className="bg-white/8 text-sky-300 font-mono text-[0.7rem] px-1 py-0.5 rounded"
        >
          {token.slice(1, -1)}
        </code>
      )
    }
    last = match.index + token.length
  }
  if (last < text.length) {
    parts.push(<span key={key++}>{text.slice(last)}</span>)
  }
  return parts
}

// ─── HTTP endpoint line detector ──────────────────────────────────────────────

function tryRenderEndpoint(
  line: string,
  key: number
): React.ReactNode | null {
  const methodPattern = new RegExp(
    `^\\s*[-*]?\\s*(${HTTP_METHODS.join('|')})\\s+(/[\\w/{}:?=&_-]*)(.*)$`
  )
  const m = line.match(methodPattern)
  if (!m) return null
  const [, method, path, rest] = m
  return (
    <div
      key={key}
      className="flex items-center gap-2 font-mono text-xs my-1 pl-1"
    >
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${METHOD_COLORS[method] ?? ''}`}
      >
        {method}
      </span>
      <span className="text-zinc-200">{path}</span>
      {rest && (
        <span className="text-zinc-500 font-sans">{parseInline(rest.trim())}</span>
      )}
    </div>
  )
}

// ─── Main markdown renderer ───────────────────────────────────────────────────

function renderContent(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // ## Heading
    if (line.startsWith('## ')) {
      const title = line.slice(3).trim()
      const meta = SECTION_ICONS[title]
      nodes.push(
        <div
          key={i}
          className="flex items-center gap-2 mt-6 mb-2 first:mt-0 border-b border-white/8 pb-2"
        >
          {meta ? (
            <span className={meta.color}>{meta.icon}</span>
          ) : (
            <span className="w-1 h-4 rounded-full bg-indigo-500 inline-block" />
          )}
          <h2 className="text-white font-semibold text-sm">{title}</h2>
        </div>
      )
      continue
    }

    // ### Sub-heading
    if (line.startsWith('### ')) {
      nodes.push(
        <h3 key={i} className="text-indigo-300 font-medium text-xs mt-4 mb-1">
          {line.slice(4).trim()}
        </h3>
      )
      continue
    }

    // Bullet line — try endpoint first
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const content = line.slice(2)
      const endpoint = tryRenderEndpoint(content, i)
      if (endpoint) {
        nodes.push(endpoint)
        continue
      }
      nodes.push(
        <div
          key={i}
          className="flex gap-2 text-zinc-300 text-xs leading-relaxed mb-0.5"
        >
          <span className="text-indigo-500 shrink-0 mt-0.5">•</span>
          <span>{parseInline(content)}</span>
        </div>
      )
      continue
    }

    // Blank line
    if (line.trim() === '') {
      nodes.push(<div key={i} className="h-2" />)
      continue
    }

    // Standalone HTTP endpoint line (no leading bullet)
    const endpoint = tryRenderEndpoint(line, i)
    if (endpoint) {
      nodes.push(endpoint)
      continue
    }

    // Full-line bold (entity / label)
    if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
      nodes.push(
        <div key={i} className="text-white font-semibold text-xs mt-3 mb-0.5">
          {line.slice(2, -2)}
        </div>
      )
      continue
    }

    // Regular paragraph / mixed inline
    nodes.push(
      <div key={i} className="text-zinc-300 text-xs leading-relaxed">
        {parseInline(line)}
      </div>
    )
  }

  return nodes
}

// ─── Data-model parser ────────────────────────────────────────────────────────

function stripMarkup(s: string): string {
  return s.replace(/\*\*/g, '').replace(/`/g, '').trim()
}

function parseField(chunk: string): Field | null {
  const s = stripMarkup(chunk)
  if (!s || s.startsWith('|') || /^[-:]+$/.test(s)) return null
  // Strip trailing notes like ", Primary Key" or ", Nullable"
  const clean = s.replace(/[,;]\s*(primary key|foreign key|pk|fk|unique|nullable|not null|index|default[^,]*)/gi, '').trim()
  // "name (type)"
  const parenM = clean.match(/^(\w+)\s*\(([^)]+)\)/)
  if (parenM) return { name: parenM[1], type: parenM[2].trim() }
  // "name: type"
  const colonM = clean.match(/^(\w+)\s*:\s*(.+)/)
  if (colonM) return { name: colonM[1], type: colonM[2].replace(/\s*[-–—,].*$/, '').trim() }
  // bare word
  if (/^\w+$/.test(clean)) return { name: clean, type: '' }
  return null
}

function parseDataModels(text: string): Entity[] {
  // Try several possible section headings (AI sometimes varies the name)
  const sectionPatterns = [
    /##\s*Data\s+Models?[^\n]*\n([\s\S]*?)(?=\n{1,3}##\s)/i,
    /##\s*Data\s+Models?[^\n]*\n([\s\S]*?)(?=\n{1,3}##|$)/i,
    /##\s*(?:Database|Schema|Entities|Entity|Data\s+Schema)[^\n]*\n([\s\S]*?)(?=\n{1,3}##\s)/i,
    /##\s*(?:Database|Schema|Entities|Entity|Data\s+Schema)[^\n]*\n([\s\S]*?)(?=\n{1,3}##|$)/i,
  ]

  let section = ''
  for (const pat of sectionPatterns) {
    const m = text.match(pat)
    if (m && m[1].trim().length > 10) { section = m[1]; break }
  }

  // Fallback: scan whole document for bold entity headings followed by bullet fields
  if (!section) section = text

  const entities: Entity[] = []
  let current: Entity | null = null

  for (const raw of section.split('\n')) {
    const line = raw.trim()
    if (!line) continue

    // Skip markdown table separator rows
    if (/^\|?[\s\-:]+\|/.test(line)) continue

    // ### EntityName or #### EntityName sub-headers
    const h3match = line.match(/^#{2,4}\s+(.+)$/)
    if (h3match) {
      const name = stripMarkup(h3match[1]).replace(/:$/, '').trim()
      if (name.length > 0 && name.length < 40) {
        current = { name, fields: [] }
        entities.push(current)
      }
      continue
    }

    // **EntityName** — bold entity heading (possibly with inline fields)
    const boldMatch = line.match(/^\*\*([^*]{1,40}?)\*\*\s*[—–:-]?\s*(.*)$/)
    if (boldMatch) {
      const name = stripMarkup(boldMatch[1]).replace(/:$/, '').trim()
      const rest = boldMatch[2].trim()
      current = { name, fields: [] }
      entities.push(current)
      // Inline fields: "id: UUID, shortCode: varchar, ..."
      if (rest && !/^[—–]/.test(rest)) {
        for (const chunk of rest.split(/,(?![^()]*\))/)) {
          const f = parseField(chunk)
          if (f && f.name.length < 30) current.fields.push(f)
        }
      }
      continue
    }

    // Markdown table row: | field | type | ... |
    if (line.startsWith('|') && current) {
      const cells = line.split('|').map(c => stripMarkup(c)).filter(Boolean)
      if (cells.length >= 1) {
        const fieldName = cells[0]
        const fieldType = cells[1] ?? ''
        const skip = ['field', 'column', 'name', 'attribute', 'property', 'type']
        if (fieldName.length < 30 && !skip.includes(fieldName.toLowerCase())) {
          current.fields.push({ name: fieldName, type: fieldType })
        }
      }
      continue
    }

    // Bullet / numbered field line
    const bulletMatch = line.match(/^[-*•]\s+(.+)$/) ?? line.match(/^\d+\.\s+(.+)$/)
    if (bulletMatch) {
      const content = stripMarkup(bulletMatch[1])

      // "EntityName: field1 (type), field2 (type)" — multi-word entity names allowed
      const entityLine = content.match(/^([A-Z][A-Za-z0-9]*(?:\s+[A-Za-z][A-Za-z0-9]*)*):\s+(.+)$/)
      if (entityLine && entityLine[1].length < 40) {
        current = { name: entityLine[1], fields: [] }
        entities.push(current)
        for (const chunk of entityLine[2].split(/,(?![^()]*\))/)) {
          const f = parseField(chunk)
          if (f && f.name.length < 30) current.fields.push(f)
        }
        continue
      }

      // Plain field belonging to current entity
      if (current) {
        const f = parseField(content)
        if (f && f.name.length < 30) current.fields.push(f)
      }
      continue
    }

    // Indented line (2+ spaces): likely a field
    if (raw.startsWith('  ') && current) {
      const f = parseField(line)
      if (f && /^[a-z_]/i.test(f.name) && f.name.length < 30) current.fields.push(f)
    }
  }

  return entities.filter(e => e.name.length > 0 && e.name.length < 50)
}

// ─── Class Diagram view ───────────────────────────────────────────────────────

function ClassDiagramView({ text }: { text: string }) {
  const entities = parseDataModels(text)

  if (entities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Database size={32} className="text-zinc-600 mb-3" />
        <p className="text-zinc-500 text-sm">No data models found in this solution.</p>
        <p className="text-zinc-600 text-xs mt-1">
          The solution may not contain a{' '}
          <span className="font-mono text-zinc-500">## Data Models</span> section.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 py-2">
      {entities.map((entity, idx) => {
        const accent = ENTITY_ACCENT_COLORS[idx % ENTITY_ACCENT_COLORS.length]
        return (
          <div
            key={entity.name}
            className="bg-card border border-white/10 rounded-xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div
              className="flex items-center gap-2.5 px-4 py-2.5"
              style={{ borderLeft: `3px solid ${accent}` }}
            >
              <span className="text-white font-semibold text-sm">{entity.name}</span>
            </div>
            {/* Divider */}
            <div className="h-px bg-white/8 mx-0" />
            {/* Fields */}
            <div className="px-4 py-3 flex flex-col gap-1.5 flex-1">
              {entity.fields.length === 0 ? (
                <span className="text-zinc-600 text-xs italic">No fields parsed</span>
              ) : (
                entity.fields.map((field, fi) => (
                  <div key={fi} className="flex items-center justify-between gap-2">
                    <span className="font-mono text-white text-xs">{field.name}</span>
                    <span className="text-zinc-400 text-[10px] italic shrink-0">{field.type}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export const SolutionModal = () => {
  const { solutionText, isSolutionStreaming, isSolutionVisible, closeSolution } =
    useChatStore()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<TabId>('solution')

  // Auto-scroll while streaming
  useEffect(() => {
    if (isSolutionStreaming && activeTab === 'solution') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [solutionText, isSolutionStreaming, activeTab])

  // Reset to solution tab when a new solution starts
  useEffect(() => {
    if (isSolutionStreaming) setActiveTab('solution')
  }, [isSolutionStreaming])

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSolution()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeSolution])

  if (!isSolutionVisible) return null

  // Strip canvas/board commands — complete ones and any partial trailing ones left by streaming
  const text = (solutionText ?? '')
    .replace(/<canvas:[^>]+\/>/g, '')
    .replace(/<board:[^>]+\/>/g, '')
    .replace(/<canvas:[^<\n]*/g, '')
    .replace(/<board:[^<\n]*/g, '')
    .replace(/\n{3,}/g, '\n\n')
  const diagramReady = !isSolutionStreaming && text.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSolution()
      }}
    >
      <div className="bg-card-dark border border-white/10 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Sparkles size={13} className="text-yellow-400" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Reference Solution</div>
              <div className="text-zinc-500 text-[10px]">Senior engineer level answer</div>
            </div>
          </div>
          <button
            onClick={closeSolution}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/8 transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 px-5 pt-3 pb-0 shrink-0 border-b border-white/8">
          <button
            onClick={() => setActiveTab('solution')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-md border-b-2 transition-colors -mb-px ${
              activeTab === 'solution'
                ? 'text-white border-indigo-500'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            <Sparkles size={11} />
            Solution
            {isSolutionStreaming && (
              <span className="inline-block w-1 h-3 bg-indigo-400 ml-0.5 rounded-sm animate-pulse" />
            )}
          </button>

          <button
            onClick={() => {
              if (diagramReady) setActiveTab('diagram')
            }}
            disabled={!diagramReady}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-md border-b-2 transition-colors -mb-px ${
              activeTab === 'diagram'
                ? 'text-white border-indigo-500'
                : diagramReady
                ? 'text-zinc-500 border-transparent hover:text-zinc-300'
                : 'text-zinc-700 border-transparent cursor-not-allowed'
            }`}
            title={diagramReady ? undefined : 'Available after streaming completes'}
          >
            <LayoutGrid size={11} />
            Class Diagram
            {!diagramReady && isSolutionStreaming && (
              <span className="text-[9px] text-zinc-600 ml-0.5">…</span>
            )}
          </button>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
          {activeTab === 'solution' && (
            <>
              {isSolutionStreaming && text === '' ? (
                <div className="flex items-center gap-2 text-zinc-500 text-xs">
                  <div className="w-3 h-3 border-2 border-zinc-600 border-t-indigo-500 rounded-full animate-spin" />
                  Generating solution…
                </div>
              ) : (
                <div>
                  {renderContent(text)}
                  {isSolutionStreaming && (
                    <span className="inline-block w-0.5 h-3.5 bg-indigo-400 ml-0.5 animate-pulse" />
                  )}
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}

          {activeTab === 'diagram' && (
            <ClassDiagramView text={text} />
          )}
        </div>
      </div>
    </div>
  )
}
