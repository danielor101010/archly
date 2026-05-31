import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Building2, Clock, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import { PROBLEMS } from '../config/problems'
import { useSessionStore } from '../stores/sessionStore'
import { useUserStore } from '../stores/userStore'
import { sendWS } from '../lib/ws'

const diffBadge: Record<string, string> = {
  Easy:   'text-green-400 bg-green-500/10 border-green-500/20',
  Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  Hard:   'text-red-400 bg-red-500/10 border-red-500/20',
}

const PROBLEM_REQUIREMENTS: Record<string, string[]> = {
  'url-shortener': [
    'Generate unique 7-character short codes via hashing (MD5/Base62)',
    'Redirect from short URL to original in under 10ms',
    'Support custom aliases and configurable expiry dates',
    'Handle 100M stored URLs with read:write ratio of 100:1',
    'Track click analytics (count, referrer, geography) per link',
  ],
  instagram: [
    'Upload photos and videos with automatic resizing and CDN distribution',
    'Generate a personalized feed from followed accounts using fan-out-on-write',
    'Support likes, comments, and story expiry at 24 hours',
    'Handle 500M DAU with sub-200ms feed load times',
    'Search users and hashtags with Elasticsearch',
  ],
  youtube: [
    'Accept raw video uploads and transcode into multiple resolutions (240p–4K)',
    'Deliver video chunks via CDN with adaptive bitrate streaming',
    'Store metadata (title, description, tags) and support full-text search',
    'Support 1B daily views with < 2s video start time globally',
    'Track view counts, likes, and comments with eventual consistency',
  ],
  uber: [
    'Match riders to nearby drivers in real-time using geospatial indexing',
    'Broadcast driver GPS location updates every 4 seconds at 5M concurrent drivers',
    'Calculate ETAs and surge pricing based on supply/demand heatmaps',
    'Handle trip state transitions (requested → matched → en-route → completed)',
    'Process payments and settlements with idempotency guarantees',
  ],
  whatsapp: [
    'Deliver messages end-to-end encrypted within 1 second for online users',
    'Queue messages reliably for offline recipients with retry and delivery receipts',
    'Support group chats up to 256 members with fan-out delivery',
    'Sync message history across multiple devices for the same account',
    'Handle 100B messages/day with a write-heavy workload',
  ],
  'twitter-feed': [
    'Publish tweets and fan-out to follower timelines (push vs pull hybrid)',
    'Handle celebrity accounts with 50M+ followers using pull-on-read',
    'Generate real-time trending topics from tweet volume and engagement',
    'Support reply threads, retweets, and quote-tweets in the data model',
    'Serve personalized feeds within 100ms for 500M daily active users',
  ],
  'google-drive': [
    'Upload files of any size with chunked uploads and resumable sessions',
    'Sync file changes across devices with delta sync (only changed blocks)',
    'Maintain version history with the ability to restore any previous version',
    'Share files with configurable permissions (view, comment, edit)',
    'Handle concurrent edits with conflict detection and resolution',
  ],
  'rate-limiter': [
    'Enforce per-user and per-IP request limits (e.g. 100 req/min)',
    'Implement token bucket and sliding window counter algorithms',
    'Distribute rate limit state across multiple API gateway nodes via Redis',
    'Return 429 with Retry-After header when limits are exceeded',
    'Support different rate limit tiers per API key or user plan',
  ],
  'search-autocomplete': [
    'Return top-10 suggestions within 50ms for any prefix query',
    'Build a trie or inverted index from the historical query dataset',
    'Weight suggestions by query frequency and recency',
    'Handle 100M QPS at peak with horizontal scaling',
    'Refresh the suggestion index from logs every few hours',
  ],
  'notification-system': [
    'Send push, email, and SMS notifications through provider APIs',
    'Fan-out a single event to millions of subscribers asynchronously',
    'Deduplicate notifications to prevent double-sending on retries',
    'Respect user notification preferences and do-not-disturb windows',
    'Track delivery status (sent, delivered, opened) per channel',
  ],
  'payment-system': [
    'Process payments with ACID guarantees and idempotency keys',
    'Detect and decline fraudulent transactions in under 200ms',
    'Handle distributed transactions across payer and payee accounts',
    'Maintain a complete immutable audit log for every transaction',
    'Support currency conversion and international payment networks',
  ],
  slack: [
    'Deliver messages to channel members via WebSocket in real-time',
    'Handle 10M concurrent WebSocket connections across multiple servers',
    'Index message content for full-text search with millisecond latency',
    'Support threads, reactions, and file attachments in channels',
    'Replay missed messages after reconnection using offset-based pagination',
  ],
  netflix: [
    'Serve pre-transcoded video at multiple quality levels via CDN edge nodes',
    'Generate personalised recommendations using collaborative filtering',
    'Ingest and transcode new content asynchronously in a processing pipeline',
    'Handle 250M subscribers streaming across global regions with < 1% buffering',
    'Track watch history and playback position to resume across devices',
  ],
  'tiktok-feed': [
    'Serve a personalized short-video feed ranked by an ML model',
    'Ingest creator uploads, transcode, and add to the recommendation pool',
    'Pre-compute and cache ranked feeds for active users',
    'Track engagement signals (watch time, likes, shares) for model training',
    'Serve 1B+ daily users with sub-100ms feed load latency',
  ],
  dropbox: [
    'Upload large files in 4MB chunks with checksums for integrity',
    'Detect changes by comparing block hashes and sync only deltas',
    'Resolve sync conflicts with a last-write-wins or user-choice strategy',
    'Index metadata in a relational DB and store blocks in object storage',
    'Handle 500M registered users with peak concurrent sync from many devices',
  ],
  airbnb: [
    'Search listings by location, date range, and filters with geo-indexing',
    'Manage availability calendar with atomic booking to prevent double-booking',
    'Calculate dynamic pricing based on seasonality and demand',
    'Handle the booking flow: search → hold → confirm → payment atomically',
    'Serve 150M users with search latency under 200ms globally',
  ],
  'web-crawler': [
    'Discover new URLs from seed pages and maintain a distributed URL frontier',
    'Deduplicate URLs using a Bloom filter or seen-URL set',
    'Respect robots.txt and implement per-domain politeness delays',
    'Store crawled content in a document store and extract links',
    'Scale to crawl 1B pages per month across thousands of worker nodes',
  ],
  'live-streaming': [
    "Ingest a streamer's video feed and transcode in real-time to HLS/DASH",
    'Distribute to viewers via CDN edge nodes with sub-3s end-to-end latency',
    'Handle stream start/stop and viewer count changes gracefully',
    'Support live chat synced with the video stream timestamp',
    'Record streams for VOD playback after the live session ends',
  ],
  'ride-sharing': [
    'Match a rider to the nearest available driver using a geospatial index',
    'Continuously update driver positions and recalculate ETAs',
    'Manage driver state machine (available → en-route → on-trip → available)',
    'Handle surge pricing by computing demand density in geohash cells',
    'Process trip completion, rating, and payment settlement atomically',
  ],
  'news-feed': [
    "Fan-out new posts to followers' feeds using push for regular users",
    'Use pull for celebrity accounts to avoid thundering herd on writes',
    'Rank feed items by a relevance score (EdgeRank-style) per user',
    'Paginate feeds with cursor-based pagination for infinite scroll',
    'Serve 3B users with feed generation under 200ms at peak load',
  ],
  'typeahead-search': [
    'Return the top-5 search suggestions in under 20ms for any prefix',
    'Build a compressed trie from the query log, updated every few hours',
    "Support personalised ranking using the user's recent search history",
    'Cache hot prefixes in Redis to handle 100K+ QPS per datacenter',
    'Handle multilingual queries and special characters gracefully',
  ],
  'distributed-cache': [
    'Distribute keys across nodes using consistent hashing with virtual nodes',
    'Support configurable eviction policies: LRU, LFU, TTL',
    'Replicate each key to N nodes for fault tolerance',
    'Guarantee read-your-writes for a single client session',
    'Handle node joins and leaves by remapping only 1/N of the keyspace',
  ],
  'hotel-booking': [
    'Search available hotels by location, date range, and amenities',
    'Reserve inventory atomically to prevent overbooking under high concurrency',
    'Display accurate real-time availability without showing stale results',
    'Process payment and confirmation as an atomic transaction',
    'Support cancellation policies with partial refunds and re-availability',
  ],
  'stock-exchange': [
    'Match buy and sell orders using a price-time priority order book',
    'Process order placement and matching under 1ms latency',
    'Broadcast real-time market data (quotes, trades) to subscribers',
    'Guarantee no duplicate executions with idempotent order processing',
    'Maintain a full immutable audit trail for regulatory compliance',
  ],
  'email-service': [
    'Accept outbound emails via SMTP and route through sending providers',
    'Filter spam using ML scoring and DNS-based block lists',
    "Index email bodies for full-text search within a user's mailbox",
    'Store attachments in object storage and metadata in a database',
    'Deliver to 1B+ mailboxes with retry on temporary failures and bounce handling',
  ],
}

export const ProblemDescriptionPage = () => {
  const { problemId } = useParams<{ problemId: string }>()
  const navigate = useNavigate()
  const { startSession } = useSessionStore()
  const userLevel = useUserStore(s => s.level)

  const problem = PROBLEMS.find(p => p.id === problemId)
  if (!problem) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Problem not found.</p>
          <button onClick={() => navigate('/practice')} className="text-indigo-400 hover:text-indigo-300 text-sm">
            ← Back to problems
          </button>
        </div>
      </div>
    )
  }

  const requirements = PROBLEM_REQUIREMENTS[problemId ?? ''] ?? []

  const handlePractice = () => {
    startSession('practice', problem.id)
    setTimeout(() => {
      sendWS('CREATE_SESSION', { mode: 'practice', problemId: problem.id, userLevel })
    }, 300)
    navigate(`/practice/${problem.id}`)
  }

  const handleInterview = () => {
    navigate(`/interview/${problem.id}`)
  }

  return (
    <div className="min-h-screen bg-page p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <button
            onClick={() => navigate('/practice')}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> Back to problems
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white leading-tight">{problem.title}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 mt-1 ${diffBadge[problem.difficulty]}`}>
                {problem.difficulty}
              </span>
            </div>
            <p className="text-zinc-400 text-sm mb-3">{problem.subtitle}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {problem.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 size={12} />
                {problem.companies.join(', ')}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border border-white/8 rounded-2xl p-5 mb-4">
            <p className="text-zinc-300 text-sm leading-relaxed">{problem.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {problem.tags.map(tag => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/8 text-zinc-500">
                {tag}
              </span>
            ))}
          </div>

          {/* Requirements */}
          {requirements.length > 0 && (
            <div className="bg-card border border-white/8 rounded-2xl p-5 mb-8">
              <h2 className="text-white font-semibold text-sm mb-4">What you'll design</h2>
              <ul className="flex flex-col gap-3">
                {requirements.map((req, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-zinc-300 text-sm leading-relaxed">{req}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePractice}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
            >
              <Zap size={15} />
              Start Practice
            </button>
            <button
              onClick={handleInterview}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white font-semibold rounded-xl transition-colors"
            >
              Start Interview
              <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
