export interface Field { name: string; type: string }
export interface Entity { name: string; fields: Field[] }

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

export function parseDataModels(text: string): Entity[] {
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
