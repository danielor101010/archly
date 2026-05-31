import { Section, Callout, CodeBlock, TradeoffTable } from './components'

export const Queues = () => (
  <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-white mb-3">Message Queues & Kafka</h1>
      <p className="text-zinc-400 leading-relaxed">
        Message queues decouple producers from consumers, enabling async processing, load leveling, and fault isolation. They're the backbone of event-driven architectures.
      </p>
    </div>

    <Section title="Why Queues?">
      <p className="text-zinc-400 text-sm leading-relaxed mb-3">
        Without queues: If your email service is slow, your order service waits. If email crashes, order fails. With queues: order service publishes an event and returns immediately. Email service processes when ready.
      </p>
      <TradeoffTable rows={[
        { name: 'Synchronous (no queue)', pro: 'Simple, immediate feedback', con: 'Tight coupling, cascading failures, no load leveling', use: 'Simple flows, when you need the response immediately' },
        { name: 'Queue-based async', pro: 'Decoupled, resilient, handles traffic spikes', con: 'Eventual consistency, harder to debug, complexity', use: 'Email/notification, media processing, analytics' },
      ]} />
    </Section>

    <Section title="Kafka Architecture">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Kafka is a distributed log. Key concepts:
      </p>
      <ul className="space-y-2 text-sm text-zinc-400">
        <li className="flex gap-2"><span className="text-purple-400">→</span><span><strong className="text-white">Topic:</strong> A named category of messages (e.g., "user-signups")</span></li>
        <li className="flex gap-2"><span className="text-purple-400">→</span><span><strong className="text-white">Partition:</strong> Topics split into ordered, immutable logs. Key for parallelism and ordering</span></li>
        <li className="flex gap-2"><span className="text-purple-400">→</span><span><strong className="text-white">Consumer Group:</strong> Multiple consumers share partitions. Each partition → one consumer at a time</span></li>
        <li className="flex gap-2"><span className="text-purple-400">→</span><span><strong className="text-white">Offset:</strong> Consumer's position in the log. Stored in Kafka (or Zookeeper). Enables replay</span></li>
      </ul>
      <CodeBlock>{`Producer → Topic (3 partitions)
              ├── Partition 0 → Consumer A
              ├── Partition 1 → Consumer B
              └── Partition 2 → Consumer C

Scale: Add consumer → rebalance partitions
       Add partition → enable more parallelism`}</CodeBlock>
    </Section>

    <Section title="Delivery Semantics">
      <TradeoffTable rows={[
        { name: 'At-most-once', pro: 'No duplicates, fastest', con: 'Messages can be lost on failure', use: 'Metrics, non-critical logs' },
        { name: 'At-least-once', pro: 'No message loss', con: 'Duplicates possible — consumer must be idempotent', use: 'Email, notifications (with deduplication)' },
        { name: 'Exactly-once', pro: 'No loss, no duplicates', con: 'High overhead, requires transactional APIs', use: 'Financial transactions, inventory updates' },
      ]} />
    </Section>

    <Section title="Dead Letter Queues">
      <Callout type="failure">
        A message fails to process 5 times (malformed data, downstream service down). Without a DLQ, it blocks all subsequent messages in the partition or gets silently dropped.
      </Callout>
      <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
        A Dead Letter Queue (DLQ) receives messages that failed after N retries. This prevents "poison pills" from blocking your consumer. You can inspect DLQ messages, fix the bug, and replay them.
      </p>
    </Section>

    <Section title="Backpressure">
      <p className="text-zinc-400 text-sm leading-relaxed">
        When producers are faster than consumers, the queue grows. The queue is absorbing the spike — this is the point. But if it grows indefinitely, you have a memory/storage problem. Solutions: consumer scaling (Kubernetes HPA on consumer lag), producer rate limiting, message TTLs.
      </p>
      <Callout type="insight">
        Always ask: "What's the maximum consumer lag acceptable?" This drives your consumer scaling policy and queue retention settings.
      </Callout>
    </Section>

    <Section title="Kafka vs SQS vs RabbitMQ">
      <TradeoffTable rows={[
        { name: 'Kafka', pro: 'Massive throughput, durable log, replay, stream processing', con: 'Complex to operate, not great for task queues', use: 'Event sourcing, analytics pipelines, high throughput' },
        { name: 'AWS SQS', pro: 'Managed, simple, integrates with Lambda', con: 'No replay, limited ordering (FIFO queues exist)', use: 'Serverless, decoupled microservices on AWS' },
        { name: 'RabbitMQ', pro: 'Flexible routing (exchanges), lower latency', con: 'Not a log, messages consumed and gone', use: 'Complex routing, task queues, RPC patterns' },
      ]} />
    </Section>

    <Section title="Interview Questions">
      <div className="space-y-3">
        {[
          { q: "How do you ensure message ordering with Kafka?", a: "Ordering is guaranteed per partition. Use a consistent partition key (e.g., user_id) to ensure all events for a user go to the same partition." },
          { q: "What happens when a consumer falls behind?", a: "Consumer lag grows. Alert on lag (Kafka consumer lag monitoring). Scale out consumers. If lag is too old, messages may have expired (check retention settings)." },
          { q: "How do you handle duplicate messages in an at-least-once system?", a: "Make consumers idempotent: store a processed event ID, check before processing, skip if already seen. Redis SET with TTL works well for this." },
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
