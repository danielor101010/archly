import { HTTP_METHODS, METHOD_COLORS, SECTION_ICONS } from './sectionConfig'

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={key++}>{text.slice(last, match.index)}</span>)
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(<strong key={key++} className="font-semibold text-text-primary">{token.slice(2, -2)}</strong>)
    } else {
      parts.push(<code key={key++} className="bg-surface-elevated text-accent font-mono text-[0.7rem] px-1 py-0.5 rounded">{token.slice(1, -1)}</code>)
    }
    last = match.index + token.length
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>)
  return parts
}

function tryRenderEndpoint(line: string, key: number): React.ReactNode | null {
  const methodPattern = new RegExp(`^\\s*[-*]?\\s*(${HTTP_METHODS.join('|')})\\s+(/[\\w/{}:?=&_-]*)(.*)$`)
  const m = line.match(methodPattern)
  if (!m) return null
  const [, method, path, rest] = m
  return (
    <div key={key} className="flex items-center gap-2 font-mono text-xs my-1 pl-1">
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${METHOD_COLORS[method] ?? ''}`}>{method}</span>
      <span className="text-text-secondary">{path}</span>
      {rest && <span className="text-text-subtle font-sans">{parseInline(rest.trim())}</span>}
    </div>
  )
}

export function renderContent(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      const title = line.slice(3).trim()
      const meta = SECTION_ICONS[title]
      nodes.push(
        <div key={i} className="flex items-center gap-2 mt-6 mb-2 first:mt-0 border-b border-border-subtle pb-2">
          {meta ? <span className={meta.color}>{meta.icon}</span> : <span className="w-1 h-4 rounded-sm bg-accent inline-block" />}
          <h2 className="text-text-primary font-semibold text-sm">{title}</h2>
        </div>,
      )
      continue
    }

    if (line.startsWith('### ')) {
      nodes.push(<h3 key={i} className="text-accent font-medium text-xs mt-4 mb-1">{line.slice(4).trim()}</h3>)
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      const content = line.slice(2)
      const endpoint = tryRenderEndpoint(content, i)
      if (endpoint) { nodes.push(endpoint); continue }
      nodes.push(
        <div key={i} className="flex gap-2 text-text-secondary text-xs leading-relaxed mb-0.5">
          <span className="text-accent shrink-0 mt-0.5">•</span>
          <span>{parseInline(content)}</span>
        </div>,
      )
      continue
    }

    if (line.trim() === '') { nodes.push(<div key={i} className="h-2" />); continue }

    const endpoint = tryRenderEndpoint(line, i)
    if (endpoint) { nodes.push(endpoint); continue }

    if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
      nodes.push(<div key={i} className="text-text-primary font-semibold text-xs mt-3 mb-0.5">{line.slice(2, -2)}</div>)
      continue
    }

    nodes.push(<div key={i} className="text-text-secondary text-xs leading-relaxed">{parseInline(line)}</div>)
  }

  return nodes
}
