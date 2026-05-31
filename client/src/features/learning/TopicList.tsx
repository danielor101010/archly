import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, HelpCircle, MessageSquare, Search, LayoutGrid, List } from 'lucide-react'
import { TOPICS, TOPIC_CATEGORIES, type TopicCategory } from '../../config/topics'

const difficultyColor = {
  Beginner:     'text-green-400 bg-green-500/10 border-green-500/25',
  Intermediate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25',
  Advanced:     'text-red-400 bg-red-500/10 border-red-500/25',
}

const categoryAccent: Record<string, string> = {
  'Distributed Systems': 'bg-blue-500/10 border-blue-500/25 text-blue-400',
  'Design Patterns':     'bg-purple-500/10 border-purple-500/25 text-purple-400',
  'API & Networking':    'bg-cyan-500/10 border-cyan-500/25 text-cyan-400',
  'Cloud':               'bg-orange-500/10 border-orange-500/25 text-orange-400',
}

export const TopicList = () => {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<TopicCategory | 'All'>('All')
  const [search, setSearch] = useState('')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return TOPICS.filter(t => {
      if (activeCategory !== 'All' && t.category !== activeCategory) return false
      if (!q) return true
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.concepts.some(c => c.toLowerCase().includes(q))
      )
    })
  }, [activeCategory, search])

  const grouped = useMemo(() =>
    TOPIC_CATEGORIES.reduce<Record<string, typeof TOPICS>>((acc, cat) => {
      acc[cat] = filtered.filter(t => t.category === cat)
      return acc
    }, {}),
  [filtered])

  const handleStudy = (slug: string, hasContent: boolean) => {
    if (hasContent) {
      navigate(`/learn/${slug}`)
    } else {
      navigate(`/concept/${slug}`)
    }
  }

  return (
    <div className="min-h-screen bg-page p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to home
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Learning Hub</h1>
          <p className="text-zinc-400 text-sm">{TOPICS.length} concepts · distributed systems, design patterns, networking, cloud</p>
        </div>

        {/* Search + layout toggle */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search topics, concepts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-card border border-white/[0.05] rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
            />
          </div>
          <div className="flex gap-1 p-1 bg-card border border-white/[0.05] rounded-xl shrink-0">
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded-lg transition-colors ${layout === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-1.5 rounded-lg transition-colors ${layout === 'list' ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          {(['All', ...TOPIC_CATEGORIES] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-card border-white/[0.05] text-zinc-400 hover:text-zinc-200 hover:border-white/15'
              }`}
            >
              {cat}
              <span className="ml-1.5 opacity-50">
                {cat === 'All' ? TOPICS.length : TOPICS.filter(t => t.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <p className="text-zinc-600 text-sm text-center py-16">No topics match your search.</p>
        )}

        {/* Topics */}
        {TOPIC_CATEGORIES.map(cat => {
          const items = grouped[cat] ?? []
          if (items.length === 0) return null
          return (
            <div key={cat} className="mb-10">
              {/* Category divider */}
              {(activeCategory === 'All' || search) && (
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${categoryAccent[cat] ?? 'bg-white/5 border-white/10 text-zinc-400'}`}>
                    {cat}
                  </span>
                  <div className="flex-1 h-px bg-white/[0.05]" />
                </div>
              )}

              {/* Grid layout */}
              {layout === 'grid' && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {items.map((topic, i) => (
                    <motion.div
                      key={topic.slug}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="group bg-card border border-white/[0.05] rounded-xl overflow-hidden hover:border-white/12 transition-all duration-200 cursor-pointer"
                      onClick={() => handleStudy(topic.slug, topic.hasContent)}
                    >
                      <div className="h-0.5" style={{ background: topic.color }} />
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${topic.color}18` }}>
                            <div className="w-2 h-2 rounded-full" style={{ background: topic.color }} />
                          </div>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${difficultyColor[topic.difficulty]}`}>
                            {topic.difficulty}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold text-xs mb-1 line-clamp-1 group-hover:text-indigo-300 transition-colors">{topic.title}</h3>
                        <p className="text-zinc-500 text-[10px] leading-relaxed mb-3 line-clamp-2">{topic.description}</p>
                        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/quiz/${topic.slug}`)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 text-[10px] transition-all"
                          >
                            <HelpCircle size={9} /> Quiz
                          </button>
                          <button
                            onClick={() => navigate(`/concept/${topic.slug}`)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 text-[10px] transition-all ml-auto"
                          >
                            <MessageSquare size={9} /> AI
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* List layout */}
              {layout === 'list' && (
                <div className="flex flex-col gap-1.5">
                  {items.map((topic, i) => (
                    <motion.div
                      key={topic.slug}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="group flex items-center gap-3 px-4 py-3 bg-card border border-white/[0.05] rounded-xl hover:border-white/12 cursor-pointer transition-all"
                      onClick={() => handleStudy(topic.slug, topic.hasContent)}
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: topic.color }} />
                      <span className="text-white text-sm font-medium group-hover:text-indigo-300 transition-colors flex-1 truncate">{topic.title}</span>
                      <span className="text-zinc-600 text-xs hidden sm:block truncate max-w-[260px]">{topic.description}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border hidden sm:inline ${difficultyColor[topic.difficulty]}`}>
                          {topic.difficulty}
                        </span>
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/quiz/${topic.slug}`)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 text-[10px] transition-all"
                          >
                            <HelpCircle size={9} /> Quiz
                          </button>
                          <button
                            onClick={() => navigate(`/concept/${topic.slug}`)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 text-[10px] transition-all"
                          >
                            <MessageSquare size={9} /> AI
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
