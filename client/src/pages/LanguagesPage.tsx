import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { LANGUAGES, LANGUAGE_CATEGORIES, type LanguageCategory } from '../config/languages'
import { LANGUAGE_QUESTIONS } from '../config/languageQuestions'

const diffBadge: Record<string, string> = {
  Beginner:     'text-green-400 bg-green-500/10 border-green-500/20',
  Intermediate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  Advanced:     'text-red-400 bg-red-500/10 border-red-500/20',
}

export const LanguagesPage = () => {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<LanguageCategory | 'All'>('All')

  const filtered = activeCategory === 'All'
    ? LANGUAGES
    : LANGUAGES.filter(l => l.category === activeCategory)

  return (
    <div className="min-h-screen bg-page p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> <span className="hidden sm:inline">Home</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Languages & Technologies</h1>
          <p className="text-zinc-400 text-sm">Test your knowledge in programming languages, frameworks, and infrastructure tools.</p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 p-1 bg-card border border-white/[0.05] rounded-xl w-fit mb-8">
          {(['All', ...LANGUAGE_CATEGORIES] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lang, i) => {
            const questionCount = LANGUAGE_QUESTIONS[lang.slug]?.length ?? 0
            const hasQuestions = questionCount > 0
            return (
              <motion.div
                key={lang.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/languages/${lang.slug}`)}
                className="group relative bg-card border border-white/[0.05] rounded-2xl p-5 cursor-pointer hover:border-white/12 transition-all duration-200 overflow-hidden"
              >
                {/* Subtle color glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at top left, ${lang.color}10 0%, transparent 60%)` }}
                />

                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl leading-none">{lang.icon}</span>
                      <div>
                        <h3 className="text-white font-semibold text-sm group-hover:text-indigo-300 transition-colors">
                          {lang.name}
                        </h3>
                        <span className="text-zinc-600 text-[10px]">{lang.category}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${diffBadge[lang.difficulty]}`}>
                      {lang.difficulty}
                    </span>
                  </div>

                  <p className="text-zinc-500 text-xs leading-relaxed mb-4">{lang.description}</p>

                  {/* Topic pills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {lang.topics.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/6 text-zinc-500">{t}</span>
                    ))}
                    {lang.topics.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/6 text-zinc-600">+{lang.topics.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600 text-[11px]">
                      {hasQuestions ? `${questionCount} questions` : 'AI-generated'}
                    </span>
                    <div
                      className="flex items-center gap-1 text-xs font-medium transition-colors"
                      style={{ color: lang.color }}
                    >
                      Start Quiz <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
