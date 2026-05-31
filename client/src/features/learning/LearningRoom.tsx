import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle, Zap } from 'lucide-react'
import { LoadBalancing } from './topics/LoadBalancing'
import { Caching } from './topics/Caching'
import { Queues } from './topics/Queues'
import { Databases } from './topics/Databases'
import { CAPTheorem } from './topics/CAPTheorem'
import { CloudFundamentals } from './topics/CloudFundamentals'
import { CloudNetworking } from './topics/CloudNetworking'
import { CloudStorage } from './topics/CloudStorage'
import { Serverless } from './topics/Serverless'
import { IaC } from './topics/IaC'
import { CloudSecurity } from './topics/CloudSecurity'
import { TOPICS } from '../../config/topics'
import { ConceptChatPanel } from './ConceptChatPanel'

const topicComponents: Record<string, React.ComponentType> = {
  'load-balancing': LoadBalancing,
  'caching': Caching,
  'queues': Queues,
  'databases': Databases,
  'cap-theorem': CAPTheorem,
  'cloud-fundamentals': CloudFundamentals,
  'cloud-networking': CloudNetworking,
  'cloud-storage': CloudStorage,
  'serverless': Serverless,
  'iac': IaC,
  'cloud-security': CloudSecurity,
}

export const LearningRoom = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const TopicComponent = slug ? topicComponents[slug] : null
  const topic = TOPICS.find(t => t.slug === slug)

  if (!TopicComponent) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="text-zinc-500 mb-4">Topic not found</div>
          <button onClick={() => navigate('/learn')} className="text-indigo-400 hover:text-indigo-300 text-sm">
            Back to topics →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="sticky top-0 z-20 border-b border-white/8 bg-page/95 backdrop-blur-sm px-8 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/learn')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">All topics</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/quiz/${slug}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
          >
            <HelpCircle size={12} /> Quiz
          </button>
          <button
            onClick={() => navigate('/practice')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 hover:text-orange-300 text-xs transition-colors"
          >
            <Zap size={12} /> Practice
          </button>
        </div>
      </div>
      <TopicComponent />
      <ConceptChatPanel topicSlug={slug ?? ''} topicTitle={topic?.title ?? ''} />
    </div>
  )
}
