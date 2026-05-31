import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiUrl } from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, FileSearch, Loader2, CheckCircle2, XCircle, ListChecks, BookMarked } from 'lucide-react'

interface CvGapResult {
  matchScore: number
  strengths: string[]
  skillGaps: string[]
  actionItems: string[]
  topicsToStudy: string[]
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'text-green-400 border-green-400/30 bg-green-400/10'
      : score >= 60
      ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
      : 'text-red-400 border-red-400/30 bg-red-400/10'

  return (
    <div className={`inline-flex flex-col items-center justify-center w-28 h-28 rounded-full border-2 ${color}`}>
      <span className="text-4xl font-bold leading-none">{score}</span>
      <span className="text-xs mt-1 opacity-70">/ 100</span>
    </div>
  )
}

export const CvAnalysisPage = () => {
  const navigate = useNavigate()
  const [cvText, setCvText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CvGapResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!cvText.trim() || !jobDescription.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(apiUrl('/api/analyze-cv-gap'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? `Server error ${res.status}`)
      }
      const data: CvGapResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-page text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-indigo-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Back to home
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
            <FileSearch size={12} />
            CV Gap Analyzer
          </div>
          <h1 className="text-4xl font-bold tracking-tight">CV Gap Analyzer</h1>
          <p className="mt-2 text-zinc-400">
            Understand exactly what you need to improve before your next interview.
          </p>
        </motion.div>

        {/* Inputs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Paste Your CV / Resume</label>
            <textarea
              rows={12}
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your full CV or resume text here..."
              className="flex-1 p-4 rounded-xl bg-card border border-white/[0.08] text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Job Description</label>
            <textarea
              rows={12}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job posting you're interviewing for..."
              className="flex-1 p-4 rounded-xl bg-card border border-white/[0.08] text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <button
            onClick={handleAnalyze}
            disabled={loading || !cvText.trim() || !jobDescription.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/40 disabled:text-indigo-300/40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 text-sm"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing gaps...
              </>
            ) : (
              <>
                <FileSearch size={16} />
                Analyze Gaps →
              </>
            )}
          </button>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-10 space-y-6"
            >
              {/* Match Score */}
              <div className="p-8 rounded-2xl bg-card border border-white/[0.08] flex flex-col items-center text-center gap-3">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Match Score</p>
                <ScoreBadge score={result.matchScore} />
                <p className="text-sm text-zinc-400 max-w-xs">
                  {result.matchScore >= 80
                    ? 'Strong match — your CV aligns well with this role.'
                    : result.matchScore >= 60
                    ? 'Moderate match — some gaps to address before the interview.'
                    : 'Significant gaps — focused preparation will make a major difference.'}
                </p>
              </div>

              {/* Strengths */}
              {result.strengths.length > 0 && (
                <div className="p-6 rounded-2xl bg-card border border-white/[0.08]">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={16} className="text-green-400" />
                    <h3 className="text-sm font-semibold text-white">Strengths</h3>
                    <span className="text-xs text-zinc-500">— what you bring to the table</span>
                  </div>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skill Gaps */}
              {result.skillGaps.length > 0 && (
                <div className="p-6 rounded-2xl bg-card border border-white/[0.08]">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle size={16} className="text-red-400" />
                    <h3 className="text-sm font-semibold text-white">Skill Gaps</h3>
                    <span className="text-xs text-zinc-500">— what's missing or weak</span>
                  </div>
                  <ul className="space-y-2">
                    {result.skillGaps.map((g, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {result.actionItems.length > 0 && (
                <div className="p-6 rounded-2xl bg-card border border-white/[0.08]">
                  <div className="flex items-center gap-2 mb-4">
                    <ListChecks size={16} className="text-indigo-400" />
                    <h3 className="text-sm font-semibold text-white">Action Items</h3>
                    <span className="text-xs text-zinc-500">— concrete next steps</span>
                  </div>
                  <ol className="space-y-3">
                    {result.actionItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-xs flex items-center justify-center font-medium">
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Topics to Study */}
              {result.topicsToStudy.length > 0 && (
                <div className="p-6 rounded-2xl bg-card border border-white/[0.08]">
                  <div className="flex items-center gap-2 mb-4">
                    <BookMarked size={16} className="text-violet-400" />
                    <h3 className="text-sm font-semibold text-white">Key Topics to Study</h3>
                    <span className="text-xs text-zinc-500">— focus areas for prep</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.topicsToStudy.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
