import { Section, Callout, CodeBlock, TradeoffTable } from './components'

export const Databases = () => (
  <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-white mb-3">Databases Deep Dive</h1>
      <p className="text-zinc-400 leading-relaxed">
        Database design is the foundation of every system design. Wrong database choices are catastrophically expensive to fix at scale.
      </p>
    </div>

    <Section title="SQL vs NoSQL">
      <TradeoffTable rows={[
        { name: 'PostgreSQL / MySQL', pro: 'ACID, joins, mature, schemas enforce correctness', con: 'Harder to scale horizontally, schema migrations at scale', use: 'User data, financial transactions, anything relational' },
        { name: 'MongoDB', pro: 'Flexible schema, good for nested documents', con: 'No joins, consistency tradeoffs', use: 'Content management, catalogs, when schema changes frequently' },
        { name: 'Cassandra', pro: 'Massive write throughput, multi-region, wide column', con: 'No joins, tunable consistency, complex data model', use: 'Time-series, IoT, 100M+ rows per table' },
        { name: 'DynamoDB', pro: 'Managed, predictable latency, auto-scaling', con: 'Expensive at scale, query patterns must be designed upfront', use: 'Serverless, key-value, single-table design patterns' },
      ]} />
    </Section>

    <Section title="Horizontal Sharding">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        When a single DB can't handle your write throughput or data volume, you split data across multiple database servers (shards). Each shard owns a subset of data.
      </p>
      <TradeoffTable rows={[
        { name: 'Range-based', pro: 'Simple, good for range queries', con: 'Hot spots if data is skewed (all recent users on shard 3)', use: 'Time-series, when range queries are common' },
        { name: 'Hash-based', pro: 'Even distribution', con: 'Range queries require scatter-gather across all shards', use: 'User data, when you query by exact ID' },
        { name: 'Directory-based', pro: 'Flexible, can rebalance without formula changes', con: 'Directory becomes a bottleneck and SPOF', use: 'When you need fine-grained control over placement' },
      ]} />
      <Callout type="failure">
        Adding a shard to a hash-based scheme requires re-hashing all data. This is why consistent hashing (virtual nodes) is used — adding a node only moves 1/N of data.
      </Callout>
    </Section>

    <Section title="Replication">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Replication creates copies of your data on multiple servers for fault tolerance and read scaling.
      </p>
      <ul className="space-y-2 text-sm text-zinc-400">
        <li className="flex gap-2"><span className="text-green-400">→</span><span><strong className="text-white">Leader-Follower (Primary-Replica):</strong> All writes go to primary. Reads can go to replicas. Replication is async by default (risk: replica lag). Simple to operate.</span></li>
        <li className="flex gap-2"><span className="text-green-400">→</span><span><strong className="text-white">Multi-Primary:</strong> Multiple nodes accept writes. Complex conflict resolution. Avoid unless you need it (active-active multi-region).</span></li>
      </ul>
      <Callout type="insight">
        Read replicas are one of the most impactful scaling techniques. A read-heavy system at 90% reads can 10x its read capacity by adding replicas.
      </Callout>
    </Section>

    <Section title="Indexing">
      <p className="text-zinc-400 text-sm leading-relaxed">
        Indexes trade write overhead and storage for read speed. A full table scan on 1B rows takes seconds. An index lookup takes milliseconds.
      </p>
      <CodeBlock>{`-- Without index: full table scan O(n)
SELECT * FROM users WHERE email = 'dan@example.com';

-- With index: B-tree lookup O(log n)
CREATE INDEX idx_users_email ON users(email);

-- Composite index: covers both columns
CREATE INDEX idx_posts_user_created
ON posts(user_id, created_at DESC);`}</CodeBlock>
    </Section>

    <Section title="Interview Questions">
      <div className="space-y-3">
        {[
          { q: "When would you choose Cassandra over PostgreSQL?", a: "When you need 100K+ writes/second, multi-region active-active, or time-series data. If you need ACID or complex queries, PostgreSQL wins." },
          { q: "How do you handle a hot partition in your sharded DB?", a: "Identify the hot shard. Options: split the shard, add a cache layer, use consistent hashing to rebalance, or redesign the partition key." },
          { q: "What's the risk of async replication?", a: "Replica lag — a follower might be seconds behind the primary. If the primary fails, you may lose those seconds of data. For critical data, use synchronous replication (at latency cost)." },
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
