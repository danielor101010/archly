import OpenAI from 'openai'
import { Session } from '../types.js'
import {
  INTERVIEWER_STATIC_PROMPT,
  PRACTICE_STATIC_PROMPT,
  SOLUTION_DISCUSSION_PROMPT,
  CV_INTERVIEW_STATIC_PROMPT,
  CODING_STATIC_PROMPT,
  CONCEPT_STATIC_PROMPT,
  buildInterviewContext,
  buildPracticeContext,
  buildCvInterviewContext,
  buildCodingContext,
  buildConceptContext,
  buildSolutionPrompt,
  buildCvAnalysisPrompt,
  buildCvGapPrompt,
  SOLUTION_CANVAS_TEMPLATES,
} from './prompts.js'
import { parseCanvasCommands, CanvasCommand } from './architectureParser.js'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY ?? '',
})

export interface StreamCallbacks {
  onTextDelta: (delta: string) => void
  onCanvasCommand: (cmd: CanvasCommand) => void
  onComplete: (fullText: string) => void
  onError: (err: Error) => void
}

export async function streamAIResponse(
  session: Session,
  userMessage: string,
  callbacks: StreamCallbacks
): Promise<void> {
  // Solution discussion mode overrides everything — the solution has been revealed
  const solutionShown = session.messages.some(m =>
    m.content.startsWith('[REFERENCE SOLUTION]') ||
    m.content === 'Reference solution loaded. Ask me anything about the architecture, design decisions, or tradeoffs — I now have the full solution in context.'
  )

  let staticPrompt: string
  let dynamicContext: string

  if (solutionShown) {
    staticPrompt = SOLUTION_DISCUSSION_PROMPT
    dynamicContext = `Problem: ${session.problemId}${session.customProblemTitle ? ` (${session.customProblemTitle})` : ''}\nThe reference solution is in the conversation history. Answer the user's question about it.`
  } else {
    switch (session.mode) {
      case 'interview':
        staticPrompt = INTERVIEWER_STATIC_PROMPT
        dynamicContext = buildInterviewContext(session)
        break
      case 'cv-interview':
        staticPrompt = CV_INTERVIEW_STATIC_PROMPT
        dynamicContext = buildCvInterviewContext(session)
        break
      case 'coding':
        staticPrompt = CODING_STATIC_PROMPT
        dynamicContext = buildCodingContext(session)
        break
      case 'concept':
        staticPrompt = CONCEPT_STATIC_PROMPT
        dynamicContext = buildConceptContext(session)
        break
      default:
        staticPrompt = PRACTICE_STATIC_PROMPT
        dynamicContext = buildPracticeContext(session)
    }
  }

  const systemInstruction = `${staticPrompt}\n\n${dynamicContext}`

  const rawHistory = session.messages.slice(-30)
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemInstruction },
    ...rawHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]

  let fullText = ''

  try {
    const stream = await client.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages,
      max_tokens: 1024,
      stream: true,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? ''
      if (!delta) continue
      fullText += delta
      callbacks.onTextDelta(delta)
    }

    const commands = parseCanvasCommands(fullText)
    for (const cmd of commands) {
      console.log('[AI] Canvas command:', cmd.type, cmd.node?.id ?? cmd.nodeId ?? '')
      callbacks.onCanvasCommand(cmd)
    }

    callbacks.onComplete(fullText)
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)))
  }
}

export async function explainNode(
  session: Session,
  nodeId: string,
  nodeType: string,
  nodeLabel: string
): Promise<string> {
  const nodes = Object.values(session.graph.nodes)
  const edges = Object.values(session.graph.edges)

  const nodeList = nodes.map(n => `- ${n.label} (${n.type})`).join('\n')
  const edgeList = edges.map(e => {
    const from = nodes.find(n => n.id === e.from)?.label ?? e.from
    const to = nodes.find(n => n.id === e.to)?.label ?? e.to
    return `  ${from} → ${to}${e.label ? ` [${e.label}]` : ''}`
  }).join('\n')

  const prompt = `You are reviewing a "${session.problemId}" system design.

Current architecture nodes:
${nodeList}

Connections:
${edgeList || '  (none yet)'}

In 2-3 sentences, explain the specific role of "${nodeLabel}" (${nodeType}) in THIS design — what calls it, what it calls next, and its key responsibility in this system. Be concrete about data flow, not generic.`

  const response = await client.chat.completions.create({
    model: 'google/gemini-2.0-flash-001',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
    stream: false,
  })

  return response.choices[0]?.message?.content?.trim() ?? 'No explanation available.'
}

export async function analyzeCv(cvText: string, userLevel?: string): Promise<{ skills: string[]; problems: Array<{ id: string; title: string; description: string; relevantSkills: string[]; difficulty: string }> }> {
  const prompt = buildCvAnalysisPrompt(cvText, userLevel)

  const response = await client.chat.completions.create({
    model: 'google/gemini-2.0-flash-001',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
    stream: false,
  })

  const text = response.choices[0]?.message?.content?.trim() ?? ''
  // Strip markdown code blocks if present
  const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    return { skills: [], problems: [] }
  }
}

export interface CvGapResult {
  matchScore: number
  strengths: string[]
  skillGaps: string[]
  actionItems: string[]
  topicsToStudy: string[]
}

export async function analyzeCvGap(cvText: string, jobDescription: string): Promise<CvGapResult> {
  const prompt = buildCvGapPrompt(cvText, jobDescription)
  const response = await client.chat.completions.create({
    model: 'google/gemini-2.0-flash-001',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
    stream: false,
  })
  const text = response.choices[0]?.message?.content?.trim() ?? ''
  const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    return { matchScore: 0, strengths: [], skillGaps: [], actionItems: [], topicsToStudy: [] }
  }
}

export async function streamSolutionResponse(
  problemId: string,
  callbacks: StreamCallbacks,
  customTitle?: string,
  customDesc?: string
): Promise<void> {
  const hasHardcodedTemplate = !!SOLUTION_CANVAS_TEMPLATES[problemId]
  // Allow AI canvas commands for: custom problems AND any problem without a hardcoded template
  const useAICanvas = !hasHardcodedTemplate
  const prompt = buildSolutionPrompt(problemId, customTitle, customDesc, useAICanvas)
  let fullText = ''

  try {
    const stream = await client.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
      stream: true,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? ''
      if (!delta) continue
      fullText += delta
      callbacks.onTextDelta(delta)
    }

    const template = SOLUTION_CANVAS_TEMPLATES[problemId]
    if (template) {
      // Hardcoded template for 5 original problems — precise, prevents duplicates
      const templateCommands = parseCanvasCommands(template)
      for (const cmd of templateCommands) {
        callbacks.onCanvasCommand(cmd)
      }
    } else {
      // All other problems (custom CV or any of the 20+ new problems):
      // use AI-generated canvas commands from the solution text
      const commands = parseCanvasCommands(fullText)
      for (const cmd of commands) {
        callbacks.onCanvasCommand(cmd)
      }
    }

    callbacks.onComplete(fullText)
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)))
  }
}
