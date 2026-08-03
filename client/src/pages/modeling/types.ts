export interface EntityField {
  name: string
  type: string
}

export interface EntityNodeData {
  name: string
  fields: EntityField[]
  onNameChange: (id: string, name: string) => void
  onFieldChange: (id: string, idx: number, field: EntityField) => void
  onFieldAdd: (id: string) => void
  onFieldDelete: (id: string, idx: number) => void
  onNodeDelete: (id: string) => void
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export const RELATIONSHIP_LABELS = ['1:1', '1:N', 'N:M', 'has one', 'has many', 'belongs to']

export const AI_ACTIONS = [
  { label: 'Review my model', prompt: 'Review my model' },
  { label: 'Suggest improvements', prompt: 'Suggest improvements for my data model' },
  { label: 'Check normalization', prompt: 'Check my data model for 1NF, 2NF, 3NF, and BCNF compliance' },
  { label: 'Find missing relationships', prompt: 'Find any missing relationships or foreign keys in my model' },
  { label: 'Generate SQL schema', prompt: 'Generate SQL CREATE TABLE statements for my data model' },
]

// Edge/label colors use the raw accent hex — inline reactflow style objects,
// not Tailwind classes, so they can't reference the CSS custom property.
export const EDGE_STROKE = '#0ea5e9'
export const EDGE_LABEL_TEXT = '#7dd3fc'
export const EDGE_LABEL_BG = '#111116'
