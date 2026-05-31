/** Shuffle the answer options of a quiz question, updating the correct index to match. */
export function shuffleQuestion<T extends { options: string[]; correct: number }>(q: T): T {
  const indexed = q.options.map((opt, i) => ({ opt, isCorrect: i === q.correct }))
  // Fisher-Yates
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indexed[i], indexed[j]] = [indexed[j], indexed[i]]
  }
  return {
    ...q,
    options: indexed.map(x => x.opt),
    correct: indexed.findIndex(x => x.isCorrect),
  }
}

export function shuffleQuestions<T extends { options: string[]; correct: number }>(qs: T[]): T[] {
  return qs.map(shuffleQuestion)
}
