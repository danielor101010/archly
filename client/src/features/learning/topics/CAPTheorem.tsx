import { Section, Callout, CodeBlock, TradeoffTable } from './components'

export const CAPTheorem = () => (
  <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-white mb-3">CAP Theorem</h1>
      <p className="text-zinc-400 leading-relaxed">
        In a distributed system, during a network partition, you must choose between consistency and availability. This is the central tradeoff in distributed systems design.
      </p>
    </div>

    <Section title="The Three Properties">
      <div className="grid grid-cols-3 gap-4">
        {[
          { letter: 'C', name: 'Consistency', desc: 'Every read receives the most recent write or an error. All nodes see the same data at the same time.', color: '#6366f1' },
          { letter: 'A', name: 'Availability', desc: 'Every request receives a response (not an error). The system remains operational.', color: '#22c55e' },
          { letter: 'P', name: 'Partition Tolerance', desc: 'The system continues to operate despite network partitions (message loss between nodes).', color: '#f97316' },
        ].map(({ letter, name, desc, color }) => (
          <div key={letter} className="bg-card border border-white/8 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold mb-2" style={{ color }}>{letter}</div>
            <div className="text-white text-sm font-medium mb-2">{name}</div>
            <div className="text-zinc-500 text-xs leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Why Not All Three?">
      <p className="text-zinc-400 text-sm leading-relaxed mb-4">
        Partition tolerance is not optional in distributed systems — networks fail. So the real choice is: during a partition, do you prioritize C or A?
      </p>
      <TradeoffTable rows={[
        { name: 'CP Systems', pro: 'Consistent reads, never returns stale data', con: 'May return errors or block during partitions', use: 'Banking, inventory, distributed locks' },
        { name: 'AP Systems', pro: 'Always available, never returns errors', con: 'May return stale data during partitions', use: 'Social feeds, product catalogs, DNS' },
      ]} />
      <CodeBlock>{`CP Examples: HBase, Zookeeper, etcd, Redis (with sync replication)
AP Examples: Cassandra, CouchDB, DynamoDB (default), DNS

Banks are CP: "Sorry, service unavailable" is better than
              "Here's your balance: $1000" (when it's really $0)`}</CodeBlock>
    </Section>

    <Section title="Consistency Models (the spectrum)">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        "Consistent" isn't binary. There's a spectrum from strongest to weakest:
      </p>
      <div className="space-y-2">
        {[
          { level: 'Strong / Linearizable', desc: 'Operations appear instantaneous. All reads see latest write. Highest cost.', color: 'text-red-400' },
          { level: 'Sequential', desc: 'Operations are in some global order. Each process sees ops in the order it executed them.', color: 'text-orange-400' },
          { level: 'Causal', desc: 'Causally related operations are seen in order. Concurrent ops may be in any order.', color: 'text-yellow-400' },
          { level: 'Eventual', desc: 'If no new updates, all replicas will eventually converge. Lowest cost, most scalable.', color: 'text-green-400' },
        ].map(({ level, desc, color }) => (
          <div key={level} className="flex gap-3 text-sm">
            <span className={`${color} font-medium w-36 shrink-0 text-xs pt-0.5`}>{level}</span>
            <span className="text-zinc-400 text-xs leading-relaxed">{desc}</span>
          </div>
        ))}
      </div>
      <Callout type="insight">
        Most systems don't need linearizability. Eventual consistency with causal ordering (what Cassandra/DynamoDB offer with tunable consistency) is sufficient for 95% of use cases.
      </Callout>
    </Section>

    <Section title="PACELC — The Better Model">
      <p className="text-zinc-400 text-sm leading-relaxed">
        CAP only covers partitions. PACELC extends it: even when the network is healthy (no partition), distributed systems face a latency vs. consistency tradeoff.
      </p>
      <CodeBlock>{`PACELC: If Partition → choose between A and C
        Else   → choose between L (latency) and C (consistency)

DynamoDB: PA/EL — Available during partition, Low latency normally
Cassandra: PA/EL — Available during partition, Low latency normally
PostgreSQL: PC/EC — Consistent during partition, Consistent normally`}</CodeBlock>
    </Section>

    <Section title="Interview Questions">
      <div className="space-y-3">
        {[
          { q: "Is your system CP or AP? Why?", a: "This is question-dependent. For user profile reads: AP is fine (slightly stale). For payment processing: CP required (never show wrong balance)." },
          { q: "What happens in Cassandra during a network partition?", a: "Cassandra is AP. It accepts writes on both sides of the partition. When the partition heals, it reconciles via last-write-wins (LWW) or vector clocks. You may see conflicting data briefly." },
          { q: "How does distributed consensus (Raft/Paxos) relate to CAP?", a: "Consensus algorithms are CP — they require a quorum to accept writes. During a partition where a quorum can't be reached, writes are rejected (prefer consistency over availability)." },
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
