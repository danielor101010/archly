/** Persist AI-generated quiz questions in localStorage so they never need regenerating. */

const KEY = (slug: string) => `sdt-quiz-gen-${slug}`

export function loadGeneratedQuestions<T>(slug: string): T[] {
  try {
    const raw = localStorage.getItem(KEY(slug))
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

export function saveGeneratedQuestions<T>(slug: string, questions: T[]): void {
  if (!questions.length) return
  try {
    const existing = loadGeneratedQuestions<T>(slug)
    // Deduplicate by id
    const existingIds = new Set((existing as Array<{ id?: string }>).map(q => q.id))
    const fresh = (questions as Array<{ id?: string }>).filter(q => !existingIds.has(q.id))
    if (fresh.length) {
      localStorage.setItem(KEY(slug), JSON.stringify([...existing, ...fresh]))
    }
  } catch {}
}
