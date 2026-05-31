import { Section, Callout, CodeBlock, TradeoffTable } from './components'

export const Caching = () => (
  <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-white mb-3">Redis & Caching</h1>
      <p className="text-zinc-400 leading-relaxed">
        Caching stores frequently-accessed data in fast memory (Redis, Memcached) to avoid slow recomputation or DB queries. A well-designed cache can reduce database load by 90%+ and cut latency from 50ms to 0.5ms.
      </p>
    </div>

    <Section title="Cache Hit Rate Math">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        If DB query = 10ms, cache lookup = 0.5ms, and hit rate = 80%:
      </p>
      <CodeBlock>{`avg_latency = hit_rate * cache_latency + miss_rate * db_latency
             = 0.80 * 0.5ms + 0.20 * 10ms
             = 0.4ms + 2.0ms
             = 2.4ms  (vs 10ms without cache — 4x faster)

At 95% hit rate: 0.95 * 0.5 + 0.05 * 10 = 0.975ms (10x faster)`}</CodeBlock>
    </Section>

    <Section title="Cache Patterns">
      <TradeoffTable rows={[
        { name: 'Cache-Aside', pro: 'App controls cache, resilient to cache failures', con: 'Cache miss causes 2x reads (cache + DB)', use: 'Most read-heavy workloads' },
        { name: 'Write-Through', pro: 'Cache always consistent with DB', con: 'Write latency doubles, cache fills with infrequently-read data', use: 'When reads follow writes immediately' },
        { name: 'Write-Behind', pro: 'Writes are fast (async to DB)', con: 'Risk of data loss if cache crashes before DB write', use: 'High-write workloads where some loss is acceptable' },
        { name: 'Read-Through', pro: 'Cache handles misses transparently', con: 'Cold start — first request always slow', use: 'When you want transparent caching layer' },
      ]} />
    </Section>

    <Section title="Cache Stampede (Thundering Herd)">
      <Callout type="failure">
        A popular cache key expires. 1000 requests simultaneously find a cache miss and all hit the database at once, overwhelming it. The DB latency spikes. Requests time out. You now have a cascading failure.
      </Callout>
      <p className="text-zinc-400 text-sm mt-3 mb-2 leading-relaxed">Solutions:</p>
      <ul className="space-y-2 text-sm text-zinc-400">
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Mutex/lock:</strong> Only one request recomputes; others wait or return stale data</span></li>
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Probabilistic early expiration:</strong> Random chance to refresh before TTL expires</span></li>
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Background refresh:</strong> Async refresh before TTL, always serve from cache</span></li>
      </ul>
    </Section>

    <Section title="Cache Invalidation">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        <em>"There are only two hard things in computer science: cache invalidation and naming things."</em>
      </p>
      <ul className="space-y-2 text-sm text-zinc-400">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">TTL-based:</strong> Simple, but stale data between TTL windows</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Event-driven:</strong> DB change event → invalidate cache key. More complex but consistent</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Version tags:</strong> Cache key includes data version. Old keys become orphaned</span></li>
      </ul>
      <Callout type="insight">
        In interviews, always ask "what's the TTL strategy?" and "how do you handle cache invalidation on writes?" These are the two weak points of every cache design.
      </Callout>
    </Section>

    <Section title="Redis vs Memcached">
      <TradeoffTable rows={[
        { name: 'Redis', pro: 'Data structures (lists, sets, sorted sets), persistence, pub/sub, Lua scripts', con: 'Single-threaded (mostly), more complex', use: 'Most use cases — default choice' },
        { name: 'Memcached', pro: 'Multi-threaded, simpler, slightly lower memory overhead', con: 'No persistence, no data structures, no replication', use: 'Pure key-value cache, extreme throughput' },
      ]} />
    </Section>

    <Section title="CDN Caching">
      <p className="text-zinc-400 text-sm leading-relaxed">
        CDNs (Cloudflare, Fastly, AWS CloudFront) cache static assets and API responses at edge nodes globally. The key concepts:
      </p>
      <ul className="space-y-2 text-sm text-zinc-400 mt-3">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Cache-Control headers:</strong> You control what CDNs cache and for how long</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Origin shield:</strong> Single CDN PoP acts as proxy to origin — protects against cache stampede at origin</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Cache warming:</strong> Pre-populate CDN nodes before traffic spike (product launch)</span></li>
      </ul>
    </Section>

    <Section title="Interview Questions">
      <div className="space-y-3">
        {[
          { q: "Your cache just crashed. What happens to your system?", a: "All requests fall through to the DB. If your DB can't handle the full load, this cascades. You need circuit breakers and graceful degradation." },
          { q: "How do you handle consistency between cache and DB?", a: "For most read-heavy systems, eventual consistency is fine with short TTLs. For financial data, use write-through or invalidate on write." },
          { q: "What's the difference between a cache and a CDN?", a: "Cache reduces DB load. CDN reduces origin server load AND network latency by serving from geographically distributed edge nodes." },
        ].map(({ q, a }) => (
          <div key={q} className="bg-card border border-white/8 rounded-xl p-4">
            <p className="text-white text-sm font-medium mb-2">{q}</p>
            <p className="text-zinc-500 text-xs leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    </Section>
  </div>
)
