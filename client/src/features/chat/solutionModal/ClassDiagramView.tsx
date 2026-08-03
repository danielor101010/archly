import { Database } from 'lucide-react'
import { parseDataModels } from './dataModelParser'
import { ENTITY_ACCENT_COLORS } from './sectionConfig'

export function ClassDiagramView({ text }: { text: string }) {
  const entities = parseDataModels(text)

  if (entities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Database size={32} className="text-text-subtle mb-3" />
        <p className="text-text-muted text-sm">No data models found in this solution.</p>
        <p className="text-text-subtle text-xs mt-1">
          The solution may not contain a <span className="font-mono text-text-muted">## Data Models</span> section.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 py-2">
      {entities.map((entity, idx) => {
        const accent = ENTITY_ACCENT_COLORS[idx % ENTITY_ACCENT_COLORS.length]
        return (
          <div key={entity.name} className="bg-surface border border-border-default rounded-lg overflow-hidden flex flex-col">
            <div className="flex items-center gap-2.5 px-4 py-2.5" style={{ borderLeft: `3px solid ${accent}` }}>
              <span className="text-text-primary font-semibold text-sm">{entity.name}</span>
            </div>
            <div className="h-px bg-border-subtle" />
            <div className="px-4 py-3 flex flex-col gap-1.5 flex-1">
              {entity.fields.length === 0 ? (
                <span className="text-text-subtle text-xs italic">No fields parsed</span>
              ) : (
                entity.fields.map((field, fi) => (
                  <div key={fi} className="flex items-center justify-between gap-2">
                    <span className="font-mono text-text-primary text-xs">{field.name}</span>
                    <span className="text-text-muted text-[10px] italic shrink-0">{field.type}</span>
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
