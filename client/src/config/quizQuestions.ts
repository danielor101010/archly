export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct: number
  explanation: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
}

export const QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  'load-balancing': [
    {
      id: 'lb-1',
      question: 'A load balancer uses consistent hashing. You add a new server to the pool. What percentage of keys need to be remapped on average?',
      options: [
        '0% — consistent hashing never remaps',
        '1/N where N is the new total servers',
        '50% of all keys',
        '100% — all keys are rehashed',
      ],
      correct: 1,
      explanation: 'Consistent hashing only remaps 1/N of the key space when adding a server, making it much more efficient than modular hashing which would remap ~100% of keys.',
    },
    {
      id: 'lb-2',
      question: 'Your application requires that all requests from the same user session go to the same backend server. Which load balancing strategy should you use?',
      options: [
        'Round-robin',
        'Least connections',
        'Sticky sessions (session affinity)',
        'Random selection',
      ],
      correct: 2,
      explanation: 'Sticky sessions (session affinity) bind a client to a specific server using a cookie or IP hash, ensuring all requests in a session reach the same instance.',
    },
    {
      id: 'lb-3',
      question: 'What is the primary difference between an L4 and L7 load balancer?',
      options: [
        'L4 is faster but L7 handles more connections',
        'L4 routes by IP/TCP without reading content; L7 can route by HTTP headers, URL path, or cookies',
        'L4 supports SSL termination; L7 does not',
        'L4 is software-based; L7 is always hardware',
      ],
      correct: 1,
      explanation: 'L4 load balancers operate at the transport layer and route based on IP and port only, while L7 load balancers inspect application-layer data (HTTP headers, paths, cookies) to make smarter routing decisions.',
    },
    {
      id: 'lb-4',
      question: 'A load balancer health check marks a backend server as unhealthy. What should happen to in-flight requests already routed to that server?',
      options: [
        'They are immediately terminated',
        'They are retried on a healthy server automatically by the load balancer',
        'They continue to completion on the unhealthy server; only new requests are rerouted',
        'The load balancer sends a 503 for all requests until the server recovers',
      ],
      correct: 2,
      explanation: 'In-flight requests are typically allowed to complete (connection draining) while the server is marked unhealthy so new connections are not routed to it, balancing reliability with graceful degradation.',
    },
    {
      id: 'lb-5',
      question: 'Virtual nodes (vnodes) in consistent hashing are primarily used to:',
      options: [
        'Reduce the memory footprint of the hash ring',
        'Enable TLS termination at the load balancer',
        'Achieve a more uniform key distribution across heterogeneous nodes',
        'Allow a single physical server to serve multiple ports',
      ],
      correct: 2,
      explanation: 'Virtual nodes assign each physical server multiple positions on the hash ring, evening out the distribution especially when servers have different capacities or when the number of servers is small.',
    },
    {
      id: 'lb-6',
      question: 'Which load balancing algorithm is best suited when backend servers have significantly different processing capacities?',
      options: [
        'Round-robin',
        'Weighted round-robin',
        'Random',
        'First available',
      ],
      correct: 1,
      explanation: 'Weighted round-robin allows you to assign higher weights to more powerful servers so they receive a proportionally larger share of traffic, maximizing resource utilization.',
    },
    {
      id: 'lb-7',
      question: 'An active-passive load balancer setup means:',
      options: [
        'Both load balancers handle traffic simultaneously and share state',
        'One load balancer handles all traffic; the second is on standby and takes over on failure',
        'Traffic is split 50/50 between two load balancers at all times',
        'The passive node only handles read traffic while the active node handles writes',
      ],
      correct: 1,
      explanation: 'In active-passive HA, the standby load balancer monitors the active one via heartbeat and assumes its virtual IP address if the active node fails, minimizing downtime without needing shared state.',
    },
  ],

  'caching': [
    {
      id: 'cache-1',
      question: 'Your cache has a 90% hit rate. The cache read takes 1ms and the database read takes 100ms. What is the average read latency?',
      options: [
        '1ms',
        '10.9ms',
        '50.5ms',
        '100ms',
      ],
      correct: 1,
      explanation: 'Average latency = (0.9 × 1ms) + (0.1 × 100ms) = 0.9ms + 10ms = 10.9ms. A high cache hit rate dramatically reduces average latency even when misses are expensive.',
    },
    {
      id: 'cache-2',
      question: 'What is a cache stampede (also called thundering herd) in the context of caching?',
      options: [
        'When a cache node is overloaded with write operations',
        'When many concurrent requests for the same expired key all hit the database simultaneously',
        'When cache eviction removes too many items at once, causing memory fragmentation',
        'When replication lag causes inconsistent data between cache replicas',
      ],
      correct: 1,
      explanation: 'Cache stampede occurs when a popular cache entry expires and many concurrent requests simultaneously miss and query the database, potentially overwhelming it. Solutions include mutex locks, probabilistic early expiration, or background refresh.',
    },
    {
      id: 'cache-3',
      question: 'In the cache-aside (lazy loading) pattern, when does data get written to the cache?',
      options: [
        'On every write to the database, data is simultaneously written to the cache',
        'During application startup, all data is preloaded into the cache',
        'Only after a cache miss — the application reads from DB and then populates the cache',
        'The cache automatically syncs from the database on a schedule',
      ],
      correct: 2,
      explanation: 'Cache-aside (lazy loading) only caches data on demand: on a miss, the application fetches from the DB and writes to the cache. This avoids caching data that is never read but introduces latency on first access.',
    },
    {
      id: 'cache-4',
      question: 'Write-through caching differs from write-behind (write-back) caching in that:',
      options: [
        'Write-through updates the cache only; write-behind updates both cache and DB simultaneously',
        'Write-through synchronously updates both cache and DB; write-behind queues DB writes asynchronously',
        'Write-through uses TTL expiration; write-behind uses LRU eviction',
        'Write-through is only suitable for read-heavy workloads; write-behind for write-heavy',
      ],
      correct: 1,
      explanation: 'Write-through keeps cache and DB in sync synchronously (no data loss, but higher write latency), while write-behind batches DB writes asynchronously for lower write latency at the risk of data loss if the cache crashes.',
    },
    {
      id: 'cache-5',
      question: 'Redis EXPIRE is set to 60 seconds on a key. A user updates the underlying data at t=50s. What is the worst-case stale data window?',
      options: [
        '0 seconds — Redis detects the update via pub/sub',
        '10 seconds (60 − 50)',
        '60 seconds — if the cache was just refreshed before the update',
        '120 seconds — TTL resets on access',
      ],
      correct: 2,
      explanation: 'If the key was just set or refreshed milliseconds before the update, clients could read stale data for nearly the full TTL of 60 seconds. Choosing the right TTL requires balancing freshness with cache effectiveness.',
    },
    {
      id: 'cache-6',
      question: 'Which eviction policy should you choose for a cache where recent data is far more likely to be re-requested than older data?',
      options: [
        'FIFO (First In First Out)',
        'Random eviction',
        'LRU (Least Recently Used)',
        'LFU (Least Frequently Used)',
      ],
      correct: 2,
      explanation: 'LRU evicts the least recently accessed item, making it ideal for workloads with temporal locality where recently accessed data is more likely to be accessed again soon.',
    },
    {
      id: 'cache-7',
      question: 'A distributed cache cluster uses consistent hashing across 4 nodes. One node fails. What happens to the data it was serving?',
      options: [
        'All requests for that data return errors until the node recovers',
        'The data is lost permanently and must be rebuilt from the source',
        'Requests for that key ring segment go to the next node; if no replication, those are cache misses',
        'The cluster automatically redistributes all data across the remaining 3 nodes immediately',
      ],
      correct: 2,
      explanation: 'Without replication, keys on the failed node result in cache misses; with replication, the replica node seamlessly takes over. The cluster does not automatically rebalance all keys — only the affected ring segment shifts to the adjacent node.',
    },
  ],

  'queues': [
    {
      id: 'q-1',
      question: 'A Kafka consumer group has 3 consumers and a topic with 6 partitions. You add a 4th consumer. How many partitions will the new consumer handle?',
      options: [
        '0 — Kafka does not support adding consumers beyond the original group size',
        '1 — Kafka rebalances evenly: 2 consumers get 2 partitions, 2 consumers get 1 partition',
        'All 6 — the new consumer takes over',
        '3 — half of the partitions are reassigned',
      ],
      correct: 1,
      explanation: 'Kafka rebalances partitions across all consumers in the group. With 6 partitions and 4 consumers, two consumers get 2 partitions each and two get 1 partition each (6÷4 = 1 remainder 2).',
    },
    {
      id: 'q-2',
      question: 'What is the key difference between "at-least-once" and "exactly-once" delivery semantics in messaging systems?',
      options: [
        'At-least-once guarantees order; exactly-once does not',
        'At-least-once may deliver duplicates on retry; exactly-once guarantees no duplicates but requires more coordination overhead',
        'At-least-once uses persistent storage; exactly-once uses in-memory queues',
        'Exactly-once only works within a single data center; at-least-once works globally',
      ],
      correct: 1,
      explanation: 'At-least-once delivery retries on failure, potentially causing duplicate processing. Exactly-once requires distributed transactions or idempotent producers/consumers and deduplication, adding significant complexity and overhead.',
    },
    {
      id: 'q-3',
      question: 'What is a dead letter queue (DLQ) and when should you use it?',
      options: [
        'A high-priority queue for urgent messages that bypass normal processing',
        'A queue for messages that repeatedly fail processing, so they can be inspected without blocking the main queue',
        'A backup queue that mirrors the primary queue for disaster recovery',
        'A queue used during system shutdown to drain in-flight messages safely',
      ],
      correct: 1,
      explanation: 'A DLQ captures messages that exceed the retry limit or fail processing, preventing poison-pill messages from blocking the main queue and enabling manual inspection and replay after fixing the root cause.',
    },
    {
      id: 'q-4',
      question: 'Your payment service consumes from a queue faster than it can commit transactions. What is the correct way to apply backpressure?',
      options: [
        'Drop messages when the consumer is slow',
        'Increase the queue\'s retention period so messages wait longer',
        'Reduce prefetch/max-in-flight count so the broker only sends messages the consumer can handle',
        'Add more partitions to spread the load',
      ],
      correct: 2,
      explanation: 'Reducing prefetch count (max-in-flight) limits how many unacknowledged messages the broker pushes to a consumer at once, creating natural backpressure and preventing the consumer from being overwhelmed.',
    },
    {
      id: 'q-5',
      question: 'Kafka retains messages after they are consumed. What major operational capability does this enable that traditional queues like RabbitMQ do not?',
      options: [
        'Faster message delivery due to in-memory storage',
        'Consumer replay — rewinding offsets to reprocess historical messages',
        'Push-based delivery to consumers without polling',
        'Guaranteed ordering across all partitions',
      ],
      correct: 1,
      explanation: 'Because Kafka stores messages on disk with configurable retention, consumers can reset their offset and replay events — enabling features like reprocessing after bugs, adding new downstream systems, or rebuilding derived state.',
    },
    {
      id: 'q-6',
      question: 'In an event-driven architecture, Service A publishes an "OrderPlaced" event and Services B, C, and D each need to react. What messaging pattern best handles this?',
      options: [
        'Point-to-point queue — Service A sends directly to each service',
        'Request-reply — Service A waits for acknowledgements from all three services',
        'Publish-subscribe (fan-out) — Service A publishes once; each service subscribes independently',
        'Competing consumers — all three services share a single queue and compete for messages',
      ],
      correct: 2,
      explanation: 'Publish-subscribe decouples producers from consumers. Each subscriber independently processes events without the publisher needing to know about them, making it easy to add new consumers without changing Service A.',
    },
    {
      id: 'q-7',
      question: 'Why does increasing Kafka partition count improve throughput, and what is the main cost of having too many partitions?',
      options: [
        'More partitions = faster disk I/O; cost is increased replication traffic between brokers',
        'More partitions allow more parallel consumers; cost is increased metadata overhead, election time on failure, and end-to-end latency',
        'More partitions improve ordering guarantees; cost is higher consumer lag',
        'More partitions reduce consumer group rebalancing; cost is larger message payload sizes',
      ],
      correct: 1,
      explanation: 'Each partition can be consumed by one consumer in a group in parallel, so more partitions mean more parallelism. However, each partition has file handles, memory, and ZooKeeper/metadata overhead; thousands of partitions also increase leader election time during broker failures.',
    },
  ],

  'databases': [
    {
      id: 'db-1',
      question: 'You need to shard a users table by user_id. Which sharding strategy minimizes hotspots when user IDs are auto-incrementing integers?',
      options: [
        'Range sharding by user_id — shard 1 gets IDs 1-1M, shard 2 gets 1M-2M, etc.',
        'Hash-based sharding — hash(user_id) % N determines the shard',
        'Alphabetical sharding by username',
        'Date-based sharding by account creation date',
      ],
      correct: 1,
      explanation: 'Range sharding on sequential IDs creates hotspots because all new writes go to the last shard. Hash-based sharding distributes writes evenly across shards, though it makes range queries harder.',
    },
    {
      id: 'db-2',
      question: 'What does "read-your-writes" consistency guarantee in a replicated database?',
      options: [
        'Any client can always read the latest write from any replica immediately',
        'After a client writes a value, that same client will always see that value in subsequent reads',
        'All replicas converge to the same value within a fixed time window',
        'Reads are always served from the primary node to guarantee freshness',
      ],
      correct: 1,
      explanation: 'Read-your-writes consistency ensures a client\'s own writes are visible to that client\'s subsequent reads, even if replicas haven\'t fully caught up. Other clients may still see stale data until replication completes.',
    },
    {
      id: 'db-3',
      question: 'A PostgreSQL query with "SELECT ... FOR UPDATE" is used to prevent a double-booking race condition. What is the performance implication at high concurrency?',
      options: [
        'None — SELECT FOR UPDATE is a read operation and does not cause contention',
        'Rows are locked, causing other transactions to block or fail, reducing throughput under contention',
        'It increases CPU usage by 2x due to MVCC overhead',
        'Queries run slower because PostgreSQL disables the query planner cache',
      ],
      correct: 1,
      explanation: 'SELECT FOR UPDATE acquires a row-level lock, so concurrent transactions trying to lock the same row must wait. At high concurrency on contested rows (e.g., a popular seat), this creates a serialization bottleneck.',
    },
    {
      id: 'db-4',
      question: 'What is the difference between synchronous and asynchronous replication in terms of durability and latency?',
      options: [
        'Synchronous has lower latency; asynchronous has stronger durability',
        'Synchronous waits for replica acknowledgement before confirming the write (stronger durability, higher latency); asynchronous confirms immediately and replicates in the background (lower latency, risk of data loss on failover)',
        'Both are equivalent — modern databases use the same replication protocol regardless of the label',
        'Asynchronous replication is ACID-compliant; synchronous is not',
      ],
      correct: 1,
      explanation: 'Synchronous replication guarantees no data loss on primary failure but adds latency equal to the round-trip to the replica. Asynchronous replication is faster but a primary crash before the replica catches up means data loss.',
    },
    {
      id: 'db-5',
      question: 'When should you choose a wide-column store (e.g., Cassandra) over a relational database?',
      options: [
        'When you need strong ACID transactions across multiple rows',
        'When you have complex multi-table joins and ad-hoc query patterns',
        'When you need high write throughput, linear horizontal scalability, and can model access patterns upfront',
        'When your data is highly normalized and schema changes are frequent',
      ],
      correct: 2,
      explanation: 'Cassandra excels at high-volume writes distributed across many nodes, but requires upfront data modeling around known query patterns. It sacrifices joins and transactions for scalability and availability.',
    },
    {
      id: 'db-6',
      question: 'An index speeds up a SELECT query but has what cost on write operations?',
      options: [
        'No cost — indexes are updated lazily in the background',
        'Each INSERT/UPDATE/DELETE must also update the index structure, adding write overhead and storage',
        'Writes become sequential, eliminating random I/O but reducing parallelism',
        'Indexes only slow down DELETE operations, not INSERT or UPDATE',
      ],
      correct: 1,
      explanation: 'Every write to an indexed column must also update the B-tree or other index structure. Tables with many indexes trade write performance for read performance, so over-indexing write-heavy tables is a common anti-pattern.',
    },
    {
      id: 'db-7',
      question: 'You run "EXPLAIN ANALYZE" on a slow query and see "Seq Scan" instead of "Index Scan". The indexed column exists. What is the most likely reason?',
      options: [
        'The index is corrupt and needs to be rebuilt with REINDEX',
        'The query planner estimates a sequential scan is cheaper because the query returns a large fraction of rows',
        'PostgreSQL only uses indexes for primary key lookups',
        'The query was run inside a transaction, which disables index usage',
      ],
      correct: 1,
      explanation: 'The query planner chooses a sequential scan when the estimated cost is lower — typically when the query returns >5-10% of rows, making random I/O from an index scan more expensive than a single sequential read of the table.',
    },
  ],

  'cap-theorem': [
    {
      id: 'cap-1',
      question: 'According to the CAP theorem, during a network partition, a distributed system must choose between:',
      options: [
        'Consistency and availability — it cannot guarantee both simultaneously',
        'Partition tolerance and consistency — you can choose to drop partition tolerance',
        'Latency and throughput — the fundamental tradeoff is performance',
        'Durability and availability — you must choose whether to persist data',
      ],
      correct: 0,
      explanation: 'CAP theorem states that during a network partition (P — which you cannot avoid in distributed systems), you must choose between consistency (all nodes return the same data) and availability (every request gets a response). P is not a choice.',
    },
    {
      id: 'cap-2',
      question: 'Apache Cassandra is classified as an AP system. What does this mean operationally?',
      options: [
        'Cassandra is always perfectly consistent and always available under any failure',
        'During a partition, Cassandra prioritizes availability — it continues accepting reads and writes but may return stale data',
        'Cassandra stops accepting writes during a partition to preserve data integrity',
        'Cassandra uses a consensus algorithm to ensure strong consistency at the cost of availability',
      ],
      correct: 1,
      explanation: 'As an AP system, Cassandra allows reads and writes to continue during partitions, potentially returning stale or divergent data. Eventual consistency is the guarantee — nodes will converge once the partition heals.',
    },
    {
      id: 'cap-3',
      question: 'HBase and traditional relational databases with synchronous replication are classified as CP systems. What happens to availability during a network partition?',
      options: [
        'They remain fully available but may return slightly stale data',
        'They reject reads and writes (or block) to prevent inconsistent data from being served',
        'They automatically switch to eventual consistency mode until the partition heals',
        'They buffer all writes locally and sync them when the partition heals',
      ],
      correct: 1,
      explanation: 'CP systems choose consistency over availability: during a partition, rather than risk serving inconsistent data, they refuse requests or block until quorum is re-established, resulting in downtime for the partition duration.',
    },
    {
      id: 'cap-4',
      question: 'The PACELC theorem extends CAP by adding what additional tradeoff that applies even without a partition?',
      options: [
        'Performance vs. cost — faster hardware always improves both latency and consistency',
        'Even without a partition, there is a tradeoff between latency (L) and consistency (C)',
        'Storage efficiency vs. query flexibility in distributed databases',
        'Horizontal vs. vertical scaling strategies',
      ],
      correct: 1,
      explanation: 'PACELC observes that CAP only covers partition scenarios. Even in normal operation (no partition), distributed systems trade off latency against consistency: stronger consistency requires coordination across nodes, adding latency.',
    },
    {
      id: 'cap-5',
      question: 'In a distributed system using quorum reads and writes (e.g., R+W > N), what does "quorum" guarantee?',
      options: [
        'All nodes always have identical data at any point in time',
        'At least one node in the read set has seen the most recent write, ensuring strong consistency',
        'Writes are asynchronous and will eventually propagate to all nodes',
        'The system is fully available as long as one node is reachable',
      ],
      correct: 1,
      explanation: 'When R+W > N (e.g., majority read and write quorums), any read quorum must overlap with any write quorum by at least one node, guaranteeing the latest write is visible in reads and providing linearizable consistency.',
    },
    {
      id: 'cap-6',
      question: 'Eventual consistency in distributed systems means:',
      options: [
        'Data is always consistent but may be slightly delayed',
        'If no new updates are made, all replicas will eventually converge to the same value',
        'The system guarantees consistency within a configurable time window (e.g., 1 second)',
        'Consistency is only guaranteed for reads that follow a write by the same client',
      ],
      correct: 1,
      explanation: 'Eventual consistency only guarantees convergence in the absence of new updates — it makes no timing guarantee. Systems like DynamoDB or Cassandra with eventual consistency may serve stale data indefinitely if updates keep arriving.',
    },
    {
      id: 'cap-7',
      question: 'You are designing a system where banking transactions must never show an incorrect balance, even during infrastructure failures. Which consistency model is required?',
      options: [
        'Eventual consistency — performance is the priority for financial systems',
        'Read-your-writes consistency',
        'Monotonic read consistency',
        'Linearizability (strong consistency) — every operation appears instantaneous and globally ordered',
      ],
      correct: 3,
      explanation: 'Financial systems require linearizability to prevent anomalies like double-spending. Every read must reflect all prior writes globally, requiring distributed coordination (e.g., Paxos/Raft consensus) that trades latency for correctness.',
    },
  ],

  'rate-limiting': [
    { id: 'rl-1', question: 'Which rate limiting algorithm best handles traffic bursts while enforcing a long-term average rate?', options: ['Fixed window counter', 'Token bucket — allows bursts up to bucket capacity then enforces the refill rate', 'Sliding window log', 'Leaky bucket — smooths all bursts into a constant output rate'], correct: 1, explanation: 'Token bucket allows short bursts (up to the bucket size) then limits to the token refill rate. This models real-world tolerable spikes while maintaining a long-term average — perfect for APIs that allow occasional bursts.' },
    { id: 'rl-2', question: 'A fixed-window rate limiter allows 100 requests/minute. A client sends 100 requests at 00:59 and 100 at 01:01. How many total requests slip through in a 2-second window?', options: ['100', '150', '200 — a boundary attack doubles the effective limit', '50'], correct: 2, explanation: 'The fixed window boundary attack: 100 requests at the end of window 1 + 100 at the start of window 2 = 200 requests in ~2 seconds, effectively doubling the rate. Sliding window log/counter algorithms prevent this.' },
    { id: 'rl-3', question: 'You need to rate limit across 50 API server instances. What is the fundamental challenge?', options: ['Each server must run the same OS', 'Each server has its own local counter, so globally a user can exceed limits by a factor of the server count', 'Rate limiting is only possible on a single server', 'You cannot use Redis for distributed rate limiting'], correct: 1, explanation: 'Without a shared state (e.g., Redis), each server counts independently. A user can hit 100 req/min × 50 servers = 5000 req/min globally. The fix: centralize counters in Redis using atomic INCR + TTL.' },
    { id: 'rl-4', question: 'A leaky bucket processes requests at a constant rate. What happens when the bucket is full?', options: ['Requests are queued indefinitely', 'The rate automatically increases', 'Excess requests are dropped (or return 429 Too Many Requests)', 'The bucket empties instantly to accept the burst'], correct: 2, explanation: 'Leaky bucket uses a fixed-size queue (bucket) that drains at a constant rate. Once full, incoming requests overflow and are rejected. This smooths traffic to a constant output but cannot absorb any burst.' },
    { id: 'rl-5', question: 'What HTTP status code should a rate-limited response return, and what header communicates the retry time?', options: ['503 Service Unavailable with no standard header', '429 Too Many Requests with Retry-After header', '400 Bad Request with X-Rate-Limit header', '503 with X-RateLimit-Reset header'], correct: 1, explanation: '429 Too Many Requests is the correct status for rate limiting. The Retry-After header (value in seconds or HTTP date) tells clients when they can retry, enabling polite backoff instead of retry storms.' },
    { id: 'rl-6', question: 'A sliding window log rate limiter stores every request timestamp. What is its main drawback at high volume?', options: ['It cannot enforce per-user limits', 'Memory usage scales linearly with request count — storing millions of timestamps is expensive', 'It cannot prevent the boundary attack', 'It only works for fixed 1-minute windows'], correct: 1, explanation: 'Sliding window log stores the exact timestamp of each request within the window. At 10K RPS per user, this means storing 600K timestamps per minute per user. The sliding window counter approximation uses far less memory.' },
    { id: 'rl-7', question: 'You rate limit by user ID but an attacker creates 10,000 accounts. What secondary limiting strategy mitigates this?', options: ['Rate limit by user ID only — account limits are sufficient', 'Add IP-based rate limiting as a secondary layer to limit account creation and request volume per source IP', 'Use CAPTCHA for every API request', 'Increase the per-user limit to make multi-account attacks impractical'], correct: 1, explanation: 'Layered rate limiting (by user ID AND by IP) makes account farming costly. The IP limit caps total requests from one source even if spread across fake accounts. Combine with CAPTCHA for account creation to raise the attack cost further.' },
  ],

  'cdn': [
    { id: 'cdn-1', question: 'A CDN edge node receives a request for an object it does not have cached. What happens?', options: ['The request fails with 404', 'The edge node returns a stale cached version', 'The edge performs an origin pull — fetches from origin, caches it, then serves it', 'The user is redirected to the origin server directly'], correct: 2, explanation: 'On a cache miss, the edge node acts as a proxy and fetches the object from the origin (origin pull). It caches the response per the Cache-Control headers, then serves it to the user and future requesters from cache.' },
    { id: 'cdn-2', question: 'What does Cache-Control: max-age=86400, s-maxage=3600 mean for a CDN edge node?', options: ['The CDN caches for 86400 seconds; browsers cache for 3600 seconds', 'Browsers cache for 86400 seconds; CDN edge caches for 3600 seconds (s-maxage overrides max-age for shared caches)', 'Both browser and CDN cache for the same duration', 'The object is never cached by the CDN'], correct: 1, explanation: 's-maxage overrides max-age for shared caches (CDNs, proxies). So browsers follow max-age (86400s = 24h) while the CDN uses s-maxage (3600s = 1h), allowing shorter CDN TTLs for more frequent purging without impacting browser caching.' },
    { id: 'cdn-3', question: 'You push a critical bug fix to your website. Users still see the old version. What is the correct fix?', options: ['Increase TTL so the CDN fetches updates faster', 'Trigger a CDN cache purge/invalidation for the affected URLs', 'Restart the origin server', 'Switch to a different CDN provider'], correct: 1, explanation: 'Cache purge (or invalidation) removes cached objects from edge nodes before their TTL expires, forcing a fresh origin pull on the next request. Most CDNs provide API-based purge by URL, path prefix, or tag.' },
    { id: 'cdn-4', question: 'What is the difference between a CDN PoP (Point of Presence) and the origin server?', options: ['PoPs serve cached content from geographically distributed edge nodes; origin is the authoritative source', 'PoPs are backup origins that serve identical copies of the origin database', 'Origin servers are faster than PoPs because they have the full data', 'PoP and origin are the same thing in modern CDN architectures'], correct: 0, explanation: 'PoPs (edge nodes) are geographically distributed caches that serve content close to users, reducing latency. The origin is the single authoritative source. A cache miss at any PoP triggers an origin pull.' },
    { id: 'cdn-5', question: 'You are streaming live video globally. What CDN feature is critical for reducing latency to viewers?', options: ['Longer TTLs on video segments', 'Edge computing to transcode video at the PoP', 'Anycast routing to direct users to the nearest PoP automatically', 'Origin shielding to reduce load on the origin'], correct: 2, explanation: 'Anycast routing advertises the same IP from multiple PoPs, and BGP routes each user to the nearest one automatically — no application-layer routing needed. This minimizes geographic latency for latency-sensitive live video.' },
    { id: 'cdn-6', question: 'What is "origin shielding" in CDN architecture?', options: ['Encrypting traffic between CDN and origin with mTLS', 'Adding a second origin for failover', 'A designated mid-tier CDN node that aggregates cache misses from all edge PoPs, reducing origin traffic', 'A WAF that blocks malicious traffic before it reaches the origin'], correct: 2, explanation: 'Origin shielding adds a mid-tier caching layer between edges and origin. Instead of all 200 PoPs independently pulling from origin on cache misses, they all pull from the shield node. This collapses origin traffic dramatically.' },
    { id: 'cdn-7', question: 'When should you NOT cache a response at the CDN edge?', options: ['Static images that rarely change', 'User-specific or session-specific responses (e.g., account pages, shopping carts)', 'Publicly accessible CSS and JavaScript bundles', 'Marketing pages that update monthly'], correct: 1, explanation: 'CDN caches are shared across all users. Caching user-specific content (Set-Cookie responses, personalized pages) would serve one user\'s data to another. Use Cache-Control: private or no-store for authenticated/personalized responses.' },
  ],

  'cqrs': [
    { id: 'cq-1', question: 'In CQRS, what is the fundamental separation that defines the pattern?', options: ['Separating the database from the application layer', 'Separating write operations (Commands) from read operations (Queries) into distinct models', 'Using two separate programming languages for reads and writes', 'Separating synchronous and asynchronous operations'], correct: 1, explanation: 'CQRS separates the write side (Command Model — handles state mutations) from the read side (Query Model — optimized for data retrieval). This allows each model to be optimized, scaled, and evolved independently.' },
    { id: 'cq-2', question: 'You have a write-heavy social media platform where timeline reads are slow. How does CQRS help?', options: ['It automatically shards the database', 'The read model can be a pre-computed, denormalized view (e.g., cached timeline) updated asynchronously from write events — making reads fast', 'CQRS reduces write latency by batching commands', 'It eliminates the need for a database entirely'], correct: 1, explanation: 'CQRS allows a separate read model — a denormalized, pre-computed view stored in a fast-read store (Redis, Elasticsearch). Write events update the read model asynchronously, so reads are O(1) lookups instead of expensive joins.' },
    { id: 'cq-3', question: 'What consistency trade-off does CQRS typically introduce?', options: ['Strong consistency — all reads immediately reflect writes', 'CQRS always violates CAP theorem', 'Eventual consistency — the read model lags behind the write model by the propagation delay', 'CQRS has no consistency implications'], correct: 2, explanation: 'When the read model is updated asynchronously, there is a propagation delay. A user who just posted may not immediately see their post in their timeline. This is eventual consistency — acceptable for many use cases but must be communicated clearly.' },
    { id: 'cq-4', question: 'CQRS is often paired with Event Sourcing. What does Event Sourcing add to CQRS?', options: ['A way to enforce synchronous writes', 'The write side stores events (not current state), enabling audit logs, time-travel debugging, and projection rebuilds', 'A synchronization mechanism between read and write databases', 'It replaces the Command Model with a REST API'], correct: 1, explanation: 'Event Sourcing stores every state change as an immutable event. Combined with CQRS, the write side appends events to an event log; the read side builds projections (query models) by replaying events. This gives full audit trails and the ability to rebuild any view.' },
    { id: 'cq-5', question: 'When is CQRS NOT a good fit?', options: ['High-traffic e-commerce platforms with complex reporting', 'Simple CRUD applications with uniform read/write load and straightforward queries', 'Systems that need audit logs of every state change', 'Microservices with independent scaling requirements'], correct: 1, explanation: 'CQRS adds significant complexity: two models, synchronization logic, eventual consistency. For simple CRUD apps with low traffic, a single model is simpler and more maintainable. CQRS pays off only when read and write scalability or models genuinely diverge.' },
    { id: 'cq-6', question: 'In a CQRS system, a Command is rejected by the write side. What should the read model do?', options: ['Roll back the last applied event', 'Nothing — the read model only changes when events are successfully committed by the write side', 'Immediately revert the UI to the previous state', 'Send a compensating event to the read model'], correct: 1, explanation: 'The read model only receives events that were successfully committed. A rejected Command produces no event, so the read model is unaffected. The calling service receives the rejection and can inform the user — the read model stays consistent.' },
    { id: 'cq-7', question: 'You need to rebuild a CQRS read model from scratch after a bug corrupted the projection. What do you do?', options: ['Restore from a database backup', 'Replay all historical events from the event log to rebuild the projection', 'Re-run all Commands to regenerate the read state', 'Import data from the write model directly'], correct: 1, explanation: 'If using Event Sourcing, you can replay the entire event log to rebuild any projection. This is one of the key benefits — projections are derived views and can be discarded and rebuilt at any time from the immutable event history.' },
  ],

  'circuit-breaker': [
    { id: 'cb-1', question: 'What problem does the Circuit Breaker pattern solve?', options: ['Slow database queries', 'Cascading failures — when a slow/failing dependency causes your service to exhaust threads/connections, eventually failing too', 'Load balancing between service instances', 'Encrypting inter-service communication'], correct: 1, explanation: 'Without a circuit breaker, calls to a failing dependency queue up, consuming threads and resources. This cascades upstream — your service appears to fail even though the root cause is a dependency. Circuit breaker stops calls early, protecting your resources.' },
    { id: 'cb-2', question: 'A circuit breaker transitions from Closed → Open → Half-Open. What triggers the Open → Half-Open transition?', options: ['A manual deployment reset', 'A time-based timeout — after a configured wait period, the breaker allows a probe request through', 'A health check from a monitoring system', 'The dependency service restarting'], correct: 1, explanation: 'After opening (stopping calls), the circuit breaker waits a configurable period before entering Half-Open state and sending a single probe request. If it succeeds, the breaker closes (normal operation resumes). If it fails, it re-opens and waits again.' },
    { id: 'cb-3', question: 'In the Closed state, the circuit breaker tracks failures. What metric typically triggers opening?', options: ['Total number of requests exceeds a threshold', 'Failure rate (e.g., >50% failures in the last 10 seconds) or consecutive failure count', 'Response time exceeds 100ms', 'Memory usage of the downstream service'], correct: 1, explanation: 'Circuit breakers typically track failure rate (failures / total requests in a rolling window) or consecutive failure count. A threshold like "open if >50% of last 20 requests fail" prevents opening on transient blips while catching real outages.' },
    { id: 'cb-4', question: 'What should a service return to callers when the circuit is Open?', options: ['Always throw an exception to signal failure', 'Return a cached response, a default fallback value, or a fast failure — configured per use case', 'Queue the request until the circuit closes', 'Retry the request indefinitely'], correct: 1, explanation: 'When open, instead of hitting the failing dependency, the circuit breaker can return a stale cached response, a sensible default (e.g., empty recommendations list), or fail fast with a clear error. The choice depends on whether stale/empty data is acceptable.' },
    { id: 'cb-5', question: 'How does a circuit breaker differ from a retry mechanism?', options: ['They are identical — circuit breakers are just named retries', 'Retries assume transient failures and retry immediately; circuit breakers detect persistent failures and stop retrying entirely for a period', 'Circuit breakers only work for synchronous calls; retries work for async', 'Retries are for network errors; circuit breakers are for application errors'], correct: 1, explanation: 'Retries are useful for transient errors (brief network hiccup). Circuit breakers handle sustained failures — repeatedly retrying a down service wastes resources and amplifies load on recovery. Circuit breakers stop calls early so the dependency has space to recover.' },
    { id: 'cb-6', question: 'You have a circuit breaker with a 30-second Open state timeout. The dependency recovers in 10 seconds. What is the impact?', options: ['No impact — the system recovers at exactly 10 seconds', 'The system continues rejecting requests for 20 extra seconds after the dependency is healthy', 'The circuit breaker detects recovery via health checks automatically', 'The timeout is extended to 60 seconds on recovery'], correct: 1, explanation: 'The circuit breaker is time-based, not health-check-based. Until the 30-second timeout fires and a probe succeeds in Half-Open, all requests are rejected — even though the dependency is healthy. Tune the timeout to balance protection vs. recovery speed.' },
    { id: 'cb-7', question: 'At what granularity should circuit breakers be applied in a microservices system?', options: ['One global breaker for the entire application', 'Per downstream dependency — each external call (service A→B, service A→C) has its own breaker', 'Per HTTP endpoint within a service', 'Per user session'], correct: 1, explanation: 'Per-dependency circuit breakers isolate failures. If Service B is down, its breaker opens without affecting calls to Service C. A single global breaker would shut down all downstream calls when any one dependency fails, causing unnecessary outages.' },
  ],

  'event-sourcing': [
    { id: 'es-1', question: 'Instead of storing current state, Event Sourcing stores _____. Current state is derived by _____.',  options: ['Snapshots of the full object; comparing consecutive snapshots', 'Every state-changing event that occurred; replaying all events from the beginning (or a snapshot)', 'SQL UPDATE statements as logs; re-executing them in order', 'The difference between old and new state; adding differences together'], correct: 1, explanation: 'Event Sourcing stores an append-only log of events (e.g., "OrderPlaced", "ItemAdded", "OrderShipped"). Current state is a left-fold over all events. This preserves full history but requires replaying events to read state (mitigated by snapshots).' },
    { id: 'es-2', question: 'An event log grows to 10 million events. Reading current state requires replaying all 10M events. What optimization solves this?', options: ['Deleting old events to keep the log small', 'Periodic snapshots — store the current state at a point in time and only replay events after that snapshot', 'Increasing server RAM to cache all events', 'Switching to a traditional relational database'], correct: 1, explanation: 'Snapshots checkpoint the current state at a point in time. To read current state, load the most recent snapshot then replay only the events that occurred after it. This bounds replay time without losing history (old events are kept).' },
    { id: 'es-3', question: 'You discover a bug that caused events to be recorded incorrectly for the past hour. In Event Sourcing, how do you correct this?', options: ['Delete the incorrect events and rewrite them', 'Apply a compensating event that reverses the effect of the buggy events — the log remains immutable', 'Restore from a database backup to before the bug', 'Events cannot be corrected in Event Sourcing'], correct: 1, explanation: 'The event log is immutable — you never delete or modify past events. Instead, append a compensating event (e.g., "CorrectionApplied") that negates the incorrect ones. This preserves the full audit trail and is the correct Event Sourcing approach.' },
    { id: 'es-4', question: 'What is a "projection" in Event Sourcing?', options: ['A future event that is scheduled to occur', 'A read model built by processing a subset of events — used to answer specific queries efficiently', 'The process of persisting an event to the log', 'A database index on event timestamps'], correct: 1, explanation: 'Projections consume events and build denormalized read models optimized for specific queries. Multiple projections can be built from the same event log — e.g., one for current order status, another for customer analytics, another for inventory.' },
    { id: 'es-5', question: 'Event Sourcing is often described as the "source of truth." Why?', options: ['Because it uses SQL, which is always consistent', 'Because every state change is a recorded fact — the event log is the authoritative history, and all other views (projections, caches) are derived from it', 'Because it eliminates the need for backups', 'Because events are stored in an encrypted format'], correct: 1, explanation: 'In Event Sourcing, the event log is the source of truth. All other state representations (read models, caches, current-state snapshots) are derived views that can be rebuilt by replaying events. If a projection is corrupted, replay the log to rebuild it.' },
    { id: 'es-6', question: 'What is the main challenge of evolving event schemas over time?', options: ['Events cannot be changed once created', 'Old events must be readable by new code — backward compatibility is essential, often requiring upcasting (transforming old events to new format on read)', 'You must rewrite the entire event log when the schema changes', 'Event schema changes require database migrations'], correct: 1, explanation: 'The event log is permanent. When you change an event schema (add/rename fields), old events with the old schema still exist. Your system must handle both: either through upcasting (transforming old events to the new schema on read) or maintaining backward-compatible event versions.' },
    { id: 'es-7', question: 'When is Event Sourcing NOT a good fit?', options: ['Financial systems needing complete audit trails', 'Simple CRUD operations where current state is all that matters and history has no business value', 'Collaborative editing systems needing conflict resolution', 'Reporting systems that query historical data'], correct: 1, explanation: 'Event Sourcing adds complexity: event schema management, projection rebuilds, eventual consistency. For a simple app where you only care about current state and have no need for audit history or temporal queries, a regular CRUD model is simpler and more appropriate.' },
  ],

  'saga-pattern': [
    { id: 'sg-1', question: 'The Saga pattern solves which specific distributed systems problem?', options: ['Slow database reads across services', 'Managing multi-step transactions across multiple microservices without using distributed two-phase commit (2PC)', 'Load balancing between service instances', 'Service discovery in Kubernetes'], correct: 1, explanation: 'When a business process spans multiple microservices (e.g., create order → reserve inventory → charge payment → ship), ACID cannot span service boundaries. Saga coordinates these steps using local transactions + compensating transactions on failure, avoiding 2PC.' },
    { id: 'sg-2', question: 'A saga for order processing fails at the "Charge Payment" step. What happens to the preceding steps?', options: ['Nothing — the saga completes partially', 'Compensating transactions execute in reverse order: release inventory reservation, cancel order', 'The entire system rolls back to its original state atomically', 'The payment step is retried until it succeeds'], correct: 1, explanation: 'Sagas use compensating transactions (semantic undo) instead of database rollback. If payment fails, the saga triggers compensating actions: ReleaseInventory (undoes ReserveInventory), then CancelOrder (undoes CreateOrder). These are separate forward-running transactions.' },
    { id: 'sg-3', question: 'What is the difference between Choreography-based and Orchestration-based Sagas?', options: ['Choreography uses a central coordinator; Orchestration uses events', 'Choreography: services communicate via events (no central coordinator); Orchestration: a central saga orchestrator directs each step explicitly', 'They are identical patterns with different names', 'Choreography only works for two services; Orchestration scales to many'], correct: 1, explanation: 'Choreography sagas emit domain events (OrderCreated → InventoryService listens and reserves, emits InventoryReserved → PaymentService listens, etc.) with no central controller. Orchestration uses a saga orchestrator that explicitly calls each service in sequence.' },
    { id: 'sg-4', question: 'A choreography saga has 5 services each listening to events. How does failure detection work?', options: ['A central monitor detects failures automatically', 'Each service must publish a success/failure event; other services react. A saga coordinator (or the service itself) tracks timeouts and triggers compensation if no success event arrives', 'Services call each other synchronously to detect failures', 'Failure detection is impossible in choreography sagas'], correct: 1, explanation: 'In choreography, each service publishes outcome events. A missing success event triggers a timeout in the waiting service, which then publishes a failure/compensation event. Tracking saga state across services requires careful event design or a separate saga state machine.' },
    { id: 'sg-5', question: 'Saga guarantees eventual consistency but NOT isolation. What anomaly can this cause?', options: ['Deadlocks between services', 'A "dirty read" where another transaction sees intermediate saga state (e.g., inventory is reserved but order not yet confirmed)', 'Data loss when a service crashes', 'Infinite compensation loops'], correct: 1, explanation: 'Without isolation, other transactions can observe intermediate saga states. For example, during an order saga, inventory is reserved (visible to other queries) before payment is confirmed. This is called a "dirty read" in the saga context — mitigated by countermeasures like semantic locks.' },
    { id: 'sg-6', question: 'Why is 2PC (Two-Phase Commit) generally avoided in microservices, making Saga the preferred alternative?', options: ['2PC only works with MySQL databases', '2PC requires all participating services to hold locks for the duration of the distributed transaction — blocking and failing if any participant is unavailable, creating tight coupling', 'Saga is faster because it uses HTTP instead of TCP', '2PC has patent restrictions preventing its use'], correct: 1, explanation: '2PC requires a coordinator to lock resources across all services during the prepare and commit phases. Any unavailable service blocks the entire transaction. In microservices with independent deployments and failures, this blocking + tight coupling is unacceptable — Saga uses async coordination instead.' },
    { id: 'sg-7', question: 'A compensating transaction itself fails during a saga rollback. What is the standard approach?', options: ['The saga accepts partial failure as acceptable', 'Retry the compensating transaction with exponential backoff until it succeeds — compensating transactions must be idempotent and eventually succeed', 'Roll back to a 2PC-style global transaction', 'Manually intervene in the database'], correct: 1, explanation: 'Compensating transactions must be designed to be retriable (idempotent). If "ReleaseInventory" fails, the saga retries it. Because compensating transactions are crucial for system correctness, they are often made idempotent using idempotency keys and implemented with retry queues.' },
  ],

  'observability': [
    { id: 'ob-1', question: 'What are the three pillars of observability in distributed systems?', options: ['CPU, Memory, and Disk metrics', 'Logs, Metrics, and Traces — each providing a different lens on system behavior', 'Uptime, Latency, and Throughput', 'Alerts, Dashboards, and On-call rotations'], correct: 1, explanation: 'Logs (timestamped events), Metrics (numerical measurements over time), and Traces (request flow across services) form the three observability pillars. Logs debug specific events, metrics show aggregate trends, and traces reveal where latency occurs in distributed request paths.' },
    { id: 'ob-2', question: 'What is the difference between SLA, SLO, and SLI?', options: ['They are three different names for uptime guarantees', 'SLI is the metric (e.g., 99.5% requests < 200ms). SLO is the internal target (e.g., 99.9% availability). SLA is the contractual agreement with customers (with penalties for violation)', 'SLA is internal, SLO is customer-facing, SLI is the monitoring tool', 'SLO and SLA are the same; SLI is a logging format'], correct: 1, explanation: 'SLI = the actual measurement (e.g., request success rate). SLO = the target you aim to maintain internally (e.g., 99.9%). SLA = the contractual commitment to customers, usually slightly looser than SLO (e.g., 99.5%), with financial penalties for breach.' },
    { id: 'ob-3', question: 'A request in a microservices system is slow. You have logs showing the request entered the system. What do you need to identify which service added latency?', options: ['Application logs from each service searched by timestamp', 'Distributed tracing — a trace ID propagated through all services shows each service\'s contribution to total latency', 'Infrastructure metrics (CPU/memory) from each server', 'A network packet capture across all services'], correct: 1, explanation: 'Distributed tracing (e.g., Jaeger, Zipkin, OpenTelemetry) propagates a trace ID through every service. Each service creates a "span" recording its processing time. The trace viewer shows the full call tree and each service\'s latency contribution — impossible to reconstruct from logs alone.' },
    { id: 'ob-4', question: 'Your on-call engineer receives 200 alerts in 10 minutes during an incident. What is this called and how is it addressed?', options: ['A DDoS attack on the alerting system', 'Alert fatigue / alert storm — addressed by alert grouping, correlation, and routing only actionable alerts (symptom-based alerts vs. cause-based)', 'Normal operating behavior for high-traffic systems', 'A sign the monitoring system is working correctly'], correct: 1, explanation: 'Alert fatigue occurs when too many alerts fire simultaneously (often correlated symptoms of one root cause). Solutions: alert on symptoms (user-visible impact) rather than causes, group correlated alerts, set alert thresholds that reflect genuine user impact, and use anomaly detection instead of static thresholds.' },
    { id: 'ob-5', question: 'What is an "error budget" in SRE practice?', options: ['The financial budget allocated for fixing bugs', 'The allowed amount of downtime/errors before violating the SLO — calculated as (1 - SLO) × time period', 'The maximum number of 5xx errors per minute before paging on-call', 'The CPU budget reserved for error handling code'], correct: 1, explanation: 'Error budget = 1 - SLO. At 99.9% availability, your monthly error budget is 0.1% × 43,200 minutes = 43.2 minutes of downtime. Teams spend this budget on risky deployments and incidents. Exhausting it triggers reliability work over new features.' },
    { id: 'ob-6', question: 'You must monitor p50, p95, and p99 latency. Why not just monitor average latency?', options: ['Percentile calculations are faster to compute than averages', 'Average latency hides tail latencies — p99 shows the worst 1% of requests. In distributed systems, one slow request can block others, so tail latency matters more than average', 'Average latency is deprecated in modern observability tools', 'Percentiles are more accurate due to floating-point precision'], correct: 1, explanation: 'Average latency is skewed by bimodal distributions (e.g., most requests fast, a few very slow). p99 tells you: "99% of requests are faster than X." At scale, 1% of 1M requests/day = 10K slow requests. p99 is a much better proxy for user experience than the average.' },
    { id: 'ob-7', question: 'What is the purpose of a "dead man\'s switch" alert in monitoring?', options: ['An alert that fires when a server dies unexpectedly', 'An alert that fires when a monitoring heartbeat STOPS — detecting when the monitoring pipeline itself fails or a service stops reporting', 'An alert for high CPU usage on database servers', 'An alert that auto-resolves after 5 minutes'], correct: 1, explanation: 'A dead man\'s switch (or heartbeat alert) fires if it does NOT receive a periodic signal. This detects silence — when a service or the monitoring pipeline itself stops sending data. Without it, a crashed monitoring agent would cause zero alerts, giving a false sense of health.' },
  ],

  'consensus': [
    { id: 'co-1', question: 'The Raft consensus algorithm elects a leader. Under what condition can a new leader be elected?', options: ['Any node can declare itself leader at any time', 'A candidate wins a majority (quorum) of votes — more than N/2 of the N nodes in the cluster', 'The current leader must resign before a new one is elected', 'Leaders are assigned round-robin without voting'], correct: 1, explanation: 'Raft requires a candidate to receive votes from a majority (quorum) of nodes. In a 5-node cluster, 3 votes are needed. This quorum requirement ensures only one leader can be elected at a time, even during network partitions — a minority partition cannot elect a leader.' },
    { id: 'co-2', question: 'In Raft, what happens to writes attempted on the minority partition during a network split?', options: ['Writes succeed and are reconciled later', 'Writes fail — the minority partition cannot achieve quorum, so no leader can be elected or writes committed', 'Writes are queued and applied when the partition heals', 'The minority partition continues serving reads and writes as usual'], correct: 1, explanation: 'During a partition, the minority side loses quorum. No leader can be elected (needs N/2+1 votes), so no writes are accepted. This is the CP (Consistency + Partition tolerance) choice: sacrifice availability for correctness. Only the majority partition can serve writes.' },
    { id: 'co-3', question: 'What is a "split-brain" scenario in distributed systems?', options: ['When a server\'s CPU and memory disagree on a value', 'When two nodes both believe they are the primary/leader simultaneously, causing conflicting writes', 'When a database splits into read and write replicas', 'When a service discovery system returns multiple IP addresses'], correct: 1, explanation: 'Split-brain occurs when network partitions cause two nodes to each believe they\'re the sole leader, both accepting writes. This leads to conflicting, irreconcilable state. Quorum-based consensus (requiring majority agreement) prevents split-brain by ensuring only one partition can elect a leader.' },
    { id: 'co-4', question: 'Paxos and Raft both achieve consensus. What makes Raft preferable for implementation?', options: ['Raft is faster due to using UDP instead of TCP', 'Raft was designed for understandability — it has a clear leader, explicit log structure, and defined leader election, making it easier to implement correctly vs. Paxos\'s complex multi-phase protocol', 'Raft requires fewer nodes than Paxos', 'Paxos is patented; Raft is open source'], correct: 1, explanation: 'Paxos is notoriously difficult to implement correctly due to underspecified details (leader election, log compaction). Raft was designed explicitly for understandability, decomposing consensus into leader election, log replication, and safety — making correct implementations far more achievable.' },
    { id: 'co-5', question: 'etcd uses Raft consensus and is used in Kubernetes. What does it store?', options: ['Container images and application code', 'Cluster state — all Kubernetes API objects (pods, services, deployments, config) in a strongly consistent key-value store', 'Logs from every pod running in the cluster', 'Network routing tables for pod-to-pod communication'], correct: 1, explanation: 'etcd is the Kubernetes "brain" — it stores all cluster state as key-value pairs. Because Kubernetes must have a consistent view of cluster state (which pods exist, their assignments, etc.), it uses Raft-based etcd for strong consistency, not an eventually consistent store.' },
    { id: 'co-6', question: 'A 5-node Raft cluster. 2 nodes fail. Can the cluster still serve reads and writes?', options: ['No — any node failure causes total outage', 'Yes — 3 nodes remain, which is a quorum (3 > 5/2), so the cluster remains operational', 'Only reads work; writes require all 5 nodes', 'The cluster downgrades to eventual consistency automatically'], correct: 1, explanation: '5-node cluster needs quorum = floor(5/2)+1 = 3. With 3 nodes alive, the leader can still replicate to 2 followers and commit entries (committed when majority=3 acknowledges). The cluster remains fully operational — this is why 5 nodes (tolerates 2 failures) is a common production choice.' },
    { id: 'co-7', question: 'What is the role of "log compaction" in Raft?', options: ['Compressing log entries to save disk space using gzip', 'Truncating the log and replacing old entries with a snapshot to bound memory/disk usage — without it the log grows forever', 'Merging multiple Raft logs from different terms', 'Deleting logs after they are applied to the state machine'], correct: 1, explanation: 'Without compaction, the Raft log grows unboundedly. Log compaction creates a snapshot of the state machine at a given log index, then discards all log entries before that index. New nodes joining the cluster receive the snapshot instead of replaying the entire log history.' },
  ],

  'outbox-pattern': [
    { id: 'op-1', difficulty: 'Medium' as const, question: 'What dual-write problem does the Outbox pattern solve?', options: ['Writing to two databases simultaneously', 'The risk of saving to DB but failing to publish the event (or vice versa) — making the DB state and message queue inconsistent', 'Preventing duplicate writes to the same database', 'Synchronizing two read replicas'], correct: 1, explanation: 'Without the outbox, you might save an order to the DB and then fail to publish the OrderCreated event (or publish the event after a crash before the DB commit). The outbox writes both the entity and the event to the DB in one ACID transaction, guaranteeing atomicity.' },
    { id: 'op-2', difficulty: 'Medium' as const, question: 'How does the Outbox pattern guarantee the event is eventually published to the message queue?', options: ['By using a 2PC transaction across the DB and message broker', 'A background relay process polls the outbox table for unpublished events and publishes them, then marks them as sent', 'Events are published synchronously within the DB transaction', 'The message broker directly reads from the database'], correct: 1, explanation: 'A relay/publisher process (or CDC) continuously polls the outbox table for rows where published=false, publishes them to the broker, then marks them published. This decouples event publishing from the business transaction while guaranteeing at-least-once delivery.' },
    { id: 'op-3', difficulty: 'Hard' as const, question: 'The outbox relay publishes the same event twice due to a crash after publishing but before marking it as sent. How is this handled?', options: ['Events are deduplicated in the outbox table using a unique constraint', 'Consumers must be idempotent — they handle duplicate events by checking if they\'ve already processed a given event ID', 'The relay uses distributed locks to prevent duplicate publishing', 'Events are never duplicated because the relay uses transactions'], correct: 1, explanation: 'The outbox relay guarantees at-least-once delivery — it may publish duplicates on crash/retry. Consumers must be idempotent: check if the event ID was already processed (e.g., via a processed_events table or idempotency key) and skip duplicates.' },
    { id: 'op-4', difficulty: 'Hard' as const, question: 'What is Change Data Capture (CDC) and how does it relate to the Outbox pattern?', options: ['CDC is a backup strategy unrelated to outbox', 'CDC reads the database\'s binary replication log to detect changes and publish them as events — an alternative to polling the outbox table that reduces DB load', 'CDC replaces the outbox table entirely by writing events to the message queue directly', 'CDC is only available in MongoDB'], correct: 1, explanation: 'CDC tools (Debezium, Maxwell) tail the database binary log (binlog/WAL) and emit events when rows change. Combined with the outbox pattern, they detect new outbox rows from the replication log without polling, reducing DB load and improving freshness.' },
    { id: 'op-5', difficulty: 'Hard' as const, question: 'Can the Outbox pattern work with NoSQL databases like DynamoDB or MongoDB?', options: ['No — it only works with relational databases that support transactions', 'Yes — if the database supports atomic multi-document writes or conditional writes that can write both the entity and the outbox event atomically', 'Only with MongoDB, not DynamoDB', 'NoSQL databases have built-in event streaming that replaces the outbox pattern'], correct: 1, explanation: 'MongoDB supports multi-document transactions (since 4.0) allowing atomic outbox writes. DynamoDB supports transactional writes across items in the same table. The key requirement is writing the entity and outbox event atomically — achievable in any store with appropriate transaction support.' },
    { id: 'op-6', difficulty: 'Hard' as const, question: 'Why does the Outbox pattern NOT use a Kafka transaction (transactional producer) to solve the dual-write problem?', options: ['Kafka transactions are not supported', 'Kafka transactions guarantee atomicity within Kafka but not between Kafka and an external database — you still have the dual-write problem between DB and Kafka', 'Kafka transactions are too slow', 'This would require a global transaction coordinator'], correct: 1, explanation: 'Kafka transactional producers guarantee exactly-once within Kafka (across topics/partitions) but cannot span a database transaction. Writing to both PostgreSQL and Kafka atomically would require 2PC — the outbox avoids this by using only the DB transaction as the atomic unit.' },
    { id: 'op-7', difficulty: 'Medium' as const, question: 'The outbox table grows indefinitely. How do you manage it?', options: ['The outbox table never grows because events are deleted on publish', 'Archive or delete published rows after a retention period using a background cleanup job, keeping only recent or unpublished events', 'Partition the outbox table by time and drop old partitions', 'Both B and C are valid strategies'], correct: 3, explanation: 'Both strategies work: a cleanup job that deletes rows where published=true AND created_at < retention_period, or time-based table partitioning (PostgreSQL/MySQL) where old partitions are dropped. The outbox must retain unpublished events indefinitely but can purge successfully published ones.' },
  ],

  'service-discovery': [
    { id: 'sd-1', difficulty: 'Easy' as const, question: 'What problem does service discovery solve in a microservices architecture?', options: ['Encrypting traffic between services', 'Services dynamically finding each other\'s network addresses without hardcoded IPs — as instances scale up/down', 'Balancing load across service instances', 'Monitoring service health'], correct: 1, explanation: 'In dynamic environments (containers, auto-scaling), service IPs change constantly. Service discovery provides a registry where services register on startup and query to find others — eliminating hardcoded IPs that become stale.' },
    { id: 'sd-2', difficulty: 'Easy' as const, question: 'What is the difference between client-side and server-side service discovery?', options: ['Client-side is faster; server-side is more secure', 'Client-side: the client queries the registry and selects an instance. Server-side: a router queries the registry and forwards the request — the client sends to a fixed endpoint', 'They are identical patterns', 'Client-side uses DNS; server-side uses HTTP'], correct: 1, explanation: 'Client-side discovery (Eureka + Ribbon) couples the client to the registry. Server-side discovery (AWS ALB, Kubernetes Services) delegates registry lookup to an intermediary, keeping clients simple at the cost of an extra network hop.' },
    { id: 'sd-3', difficulty: 'Medium' as const, question: 'A service registers on startup but crashes without deregistering. How does the registry handle stale entries?', options: ['The registry keeps the dead entry forever', 'TTL-based leases and health checks — entries expire if the service stops sending heartbeats or fails active health checks', 'Manual operator cleanup is required', 'All traffic to the dead service is queued'], correct: 1, explanation: 'Registries like Consul and Eureka use TTL leases: services must renew periodically. A crashed service stops renewing; after the TTL its entry is removed. Active health checks detect failures faster than TTL expiry alone.' },
    { id: 'sd-4', difficulty: 'Medium' as const, question: 'How does Kubernetes service discovery work internally?', options: ['Kubernetes uses Consul embedded in the control plane', 'Kubernetes Services create a stable virtual IP + DNS name (service.namespace.svc.cluster.local). kube-dns resolves these to healthy pod IPs — managed automatically by the control plane', 'Pods register themselves with an etcd registry directly', 'Kubernetes uses mDNS for peer-to-peer service lookup'], correct: 1, explanation: 'Kubernetes Services create a stable ClusterIP and DNS name. kube-proxy maintains iptables rules mapping the ClusterIP to healthy pod IPs. kube-dns (CoreDNS) resolves service names. Unlike Consul, pods don\'t self-register — the control plane manages the registry via pod health.' },
    { id: 'sd-5', difficulty: 'Hard' as const, question: 'Your service discovery registry becomes unavailable for 30 seconds. What is the impact on running services?', options: ['All services stop immediately', 'Existing connections continue; new lookups fail. Services with cached registry data can route to known instances, but detecting new instances or instance failures is delayed', 'Services automatically switch to DNS-based discovery', 'No impact — services cache all data permanently'], correct: 1, explanation: 'Existing calls on cached routes continue. New instance registrations and failure deregistrations are not propagated during the outage. Services may briefly route to unhealthy instances if a failure occurs during the registry outage. High-availability registry clusters (3-node Consul, replicated etcd) prevent this.' },
    { id: 'sd-6', difficulty: 'Medium' as const, question: 'What is a sidecar proxy in the context of a service mesh?', options: ['A backup service that takes over on failure', 'A proxy co-located with each service instance (Envoy) that transparently handles service discovery, load balancing, retries, and observability without application code changes', 'A monitoring agent injected into each pod', 'A DNS server running alongside each service'], correct: 1, explanation: 'Service meshes (Istio, Linkerd) inject a sidecar proxy (Envoy) into each pod. All outbound traffic is intercepted by the proxy, which resolves service addresses via xDS API, load balances, and enforces mTLS — the application only talks to localhost.' },
    { id: 'sd-7', difficulty: 'Hard' as const, question: 'Why should service discovery cache TTLs be short (30s) rather than long (1h)?', options: ['Short TTLs reduce memory usage', 'Short TTLs ensure stale entries (crashed instances, scaled-down pods) are detected quickly — a 1h TTL means clients route to dead instances for up to 1 hour', 'Long TTLs cause higher registry query load', 'TTL length has no security implications'], correct: 1, explanation: 'With a 1-hour TTL, a crashed service remains discoverable for up to 1 hour. Clients fail on every connection attempt for that window. Short TTLs (30s) limit the stale-routing window, at the cost of slightly more registry traffic — an acceptable tradeoff for reliability.' },
  ],

  'bulkhead': [
    { id: 'bh-1', difficulty: 'Easy' as const, question: 'The Bulkhead pattern is named after ship bulkheads. What does this analogy represent in software?', options: ['Encrypting compartments of data independently', 'Isolating failure in one part of the system from spreading — like watertight compartments preventing a single breach from sinking the ship', 'Creating replicas of a service for redundancy', 'Segmenting network traffic by priority'], correct: 1, explanation: 'Ship bulkheads compartmentalize the hull. In software, bulkheads isolate resources (thread pools, connection pools) so overload or failure in one service doesn\'t exhaust shared resources and cascade to others.' },
    { id: 'bh-2', difficulty: 'Easy' as const, question: 'You have a shared thread pool of 100 threads for calls to Services A, B, and C. Service A is slow and uses all 100 threads. What happens to B and C?', options: ['Only Service A calls fail', 'All 100 threads are consumed, so calls to B and C also fail — even though B and C are healthy', 'Service A is automatically scaled', 'The pool expands automatically'], correct: 1, explanation: 'Without bulkheads, shared thread pools create coupling. A slow dependency hogs all threads, starving others. Fix: give each downstream a dedicated thread pool so slowness in A cannot starve B or C.' },
    { id: 'bh-3', difficulty: 'Medium' as const, question: 'What is the difference between thread pool and semaphore isolation in bulkhead implementations?', options: ['Thread pool isolation uses locks; semaphore uses threads', 'Thread pool: calls run on a separate thread pool (supports timeouts). Semaphore: a counter limits concurrent callers on the same thread (no timeout on the downstream call)', 'They are identical', 'Semaphores are always slower'], correct: 1, explanation: 'Thread pool isolation runs calls on a dedicated pool — you can time out the pool thread while returning to caller. Semaphore isolation uses a counter on the calling thread — lower overhead but cannot enforce timeouts on the downstream call itself (only on the calling thread\'s wait).' },
    { id: 'bh-4', difficulty: 'Medium' as const, question: 'In a multi-tenant SaaS app, Tenant A sends 100x more traffic than normal. How do bulkheads protect other tenants?', options: ['By rate limiting at the API gateway', 'Per-tenant resource pools ensure Tenant A\'s burst fills only its own pool — other tenants\' pools remain unaffected', 'By deploying separate servers per tenant', 'Bulkheads do not apply to multi-tenancy'], correct: 1, explanation: 'Per-tenant bulkheads (thread pool, queue, connection pool limits per tenant) isolate the noisy neighbor. Tenant A\'s burst exhausts its own pool first; excess requests for Tenant A fail without consuming resources allocated to Tenant B or C.' },
    { id: 'bh-5', difficulty: 'Hard' as const, question: 'How do you correctly size a bulkhead thread pool using Little\'s Law?', options: ['Always use 10 threads', 'pool_size ≈ throughput × latency. Example: 50 RPS × 200ms average = 10 concurrent threads at steady state. Add 20-50% buffer for variance', 'Use CPU count / number of downstream services', 'Start at 100 and reduce until failures appear'], correct: 1, explanation: 'Little\'s Law: L (concurrent) = λ (arrival rate) × W (service time). 50 RPS × 200ms = 10 concurrent calls needed at steady state. Add headroom for variance (latency spikes). Too small causes queueing; too large defeats isolation.' },
    { id: 'bh-6', difficulty: 'Easy' as const, question: 'Which Hystrix/Resilience4j configuration implements the bulkhead pattern?', options: ['commandTimeout', 'circuitBreakerEnabled', 'Bulkhead with maxConcurrentCalls or thread pool isolation with a named thread pool key', 'fallbackEnabled'], correct: 2, explanation: 'Resilience4j Bulkhead limits maxConcurrentCalls per downstream. Hystrix uses threadPoolKey to assign commands to named, isolated thread pools. Commands with different keys have completely separate resource pools — the bulkhead implementation.' },
    { id: 'bh-7', difficulty: 'Hard' as const, question: 'How do Bulkhead and Circuit Breaker complement each other?', options: ['They are mutually exclusive — use one or the other', 'Bulkhead limits concurrency to prevent resource exhaustion; Circuit Breaker stops calling a failed dependency. Together: circuit breaker opens before bulkhead fills, stopping calls before resources are exhausted', 'Circuit Breaker is a type of Bulkhead', 'Bulkhead replaces Circuit Breaker'], correct: 1, explanation: 'Bulkhead handles slow dependencies (caps resource consumption). Circuit Breaker handles failed dependencies (stops calls entirely). Bulkhead prevents resource starvation; circuit breaker prevents wasted calls. Using both: circuit breaker trips first (fast fail), bulkhead bounds the damage if the breaker is slow to open.' },
  ],

  'strangler-fig': [
    { id: 'sf-1', difficulty: 'Easy' as const, question: 'What is the core idea of the Strangler Fig migration pattern?', options: ['Rewriting the monolith in a big-bang release', 'Incrementally replacing parts of a monolith by routing traffic to new microservices piece-by-piece while the old system continues running', 'Running old and new systems forever in parallel', 'Extracting only the database layer first'], correct: 1, explanation: 'Named after the fig tree that slowly envelops its host, the pattern incrementally migrates a monolith by extracting functionality into new services and routing their traffic away. The monolith shrinks until it can be decommissioned — no risky big-bang cutover.' },
    { id: 'sf-2', difficulty: 'Medium' as const, question: 'What is the role of the facade/proxy in the Strangler Fig pattern?', options: ['It monitors traffic', 'It sits in front of both old and new systems, routing requests to the appropriate backend — new service for migrated features, monolith for everything else — transparently to clients', 'It translates between API formats', 'It provides a fallback when the new service fails'], correct: 1, explanation: 'The facade routes all traffic initially to the monolith. As features migrate, the facade routes specific paths to new services. Clients always call the same URL — the routing logic changes over time, not the client.' },
    { id: 'sf-3', difficulty: 'Medium' as const, question: 'How do you handle data migration when the new service uses a separate database from the monolith?', options: ['Stop all traffic, migrate data, then switch', 'Dual-write to both databases during migration, backfill historical data, then read from the new DB once verified, then stop writing to the old one', 'The new service reads directly from the monolith\'s database always', 'Services can share a database indefinitely'], correct: 1, explanation: 'Dual-write keeps both databases current during the migration window. Backfill historical data. Read from the new DB only after verifying consistency. This allows rollback — just switch reads back to old if issues arise, since old data remains complete.' },
    { id: 'sf-4', difficulty: 'Easy' as const, question: 'What is a "dark launch" (shadow traffic) in the context of a migration?', options: ['Deploying only to staging', 'Routing a copy of production traffic to the new service without serving its response to users — comparing outputs silently to verify correctness before cutover', 'Disabling a feature before removal', 'A deployment that runs at night only'], correct: 1, explanation: 'Shadow traffic validates the new service against real production load with zero user impact. You compare responses between old and new — any divergence is caught before users are affected. Safe to run at 100% traffic volume before flipping the facade.' },
    { id: 'sf-5', difficulty: 'Hard' as const, question: 'Which features should be migrated FIRST in a Strangler Fig migration?', options: ['The most complex, core tightly-coupled features', 'Peripheral, loosely-coupled features with clear boundaries and minimal data dependencies', 'Authentication (affects all features)', 'Highest-traffic endpoints for immediate performance benefits'], correct: 1, explanation: 'Start with isolated, low-risk features to build confidence and establish deployment patterns. Core tightly-coupled features come later once patterns are proven. Migrating auth first risks breaking all features; high-traffic features risk user impact if the new service has issues.' },
    { id: 'sf-6', difficulty: 'Medium' as const, question: 'When is Strangler Fig NOT the right approach?', options: ['When the monolith has poor test coverage', 'When the monolith is so tightly coupled that clean extraction is impossible, or migration ROI doesn\'t justify the facade complexity', 'When the system handles high traffic', 'When the team is large'], correct: 1, explanation: 'Tightly-coupled monoliths with shared tables and deep cross-cutting concerns can make clean extraction impractical. If extracting any service requires replicating most of the codebase, the cost may exceed the benefit. Modularizing in-place first may be a better precursor.' },
    { id: 'sf-7', difficulty: 'Hard' as const, question: 'How do feature flags complement the Strangler Fig pattern?', options: ['Feature flags are unrelated to migrations', 'Feature flags allow routing a percentage of traffic to the new service with instant rollback — safer than facade-level routing which requires a deployment to revert', 'Feature flags replace the facade entirely', 'Feature flags are only for A/B testing'], correct: 1, explanation: 'Feature flags (1% → 10% → 100%) let you incrementally route traffic to the new service without redeployment. Flip to 0% instantly if issues arise. This is faster rollback than changing facade config and redeploying, making canary cutover much safer.' },
  ],

  'api-design': [
    { id: 'ad-1', difficulty: 'Easy' as const, question: 'What is the key difference between REST and GraphQL in how data is fetched?', options: ['REST is faster than GraphQL', 'REST: fixed endpoints return fixed shapes (may over-fetch/under-fetch). GraphQL: client specifies exactly what fields it needs in a single query', 'GraphQL only works with relational databases', 'REST supports real-time; GraphQL does not'], correct: 1, explanation: 'REST endpoints return fixed data — GET /user returns all fields whether needed or not (over-fetch). GraphQL lets clients request exactly the fields needed across multiple resources in one query, eliminating over-fetch and multiple REST roundtrips.' },
    { id: 'ad-2', difficulty: 'Easy' as const, question: 'Which HTTP methods are idempotent?', options: ['Only GET', 'GET, PUT, DELETE, HEAD, OPTIONS — calling them N times has the same effect as calling once', 'POST and PUT only', 'All HTTP methods are idempotent'], correct: 1, explanation: 'Idempotent: same effect whether called once or N times. DELETE /user/1 twice = user deleted (same state). PUT /user/1 with same body twice = same state. POST is NOT idempotent — POST /orders twice = two orders created.' },
    { id: 'ad-3', difficulty: 'Medium' as const, question: 'You have a list endpoint with 10M records. Why is cursor-based pagination preferred over offset pagination?', options: ['Cursor pagination is faster to implement', 'Offset breaks when items are inserted/deleted between requests (duplicates/skips). Cursors use a stable reference (last item ID) unaffected by concurrent writes', 'Offset pagination requires more memory', 'Cursor pagination only works with NoSQL'], correct: 1, explanation: 'Offset pagination: if item is inserted before your current offset, all items shift — the next page skips one or duplicates one. Cursor pagination uses the last item\'s ID/timestamp as the page reference — stable regardless of concurrent inserts/deletes. Also O(1) vs O(N) for offset DB scans.' },
    { id: 'ad-4', difficulty: 'Medium' as const, question: 'How should you handle breaking API changes?', options: ['Update the endpoint immediately — clients must adapt', 'Version the URL (/v1/ → /v2/) or use Accept headers. Maintain both versions during a deprecation period', 'Use feature flags to toggle behavior', 'Always make APIs 100% backward-compatible — versioning is never needed'], correct: 1, explanation: 'Breaking changes (removing fields, changing types) require a new version. URL versioning (/v1, /v2) is explicit and cacheable. Maintain old versions during a deprecation window (3-12 months) to give consumers time to migrate.' },
    { id: 'ad-5', difficulty: 'Hard' as const, question: 'What is an idempotency key and when is it critical?', options: ['A unique API key that never expires', 'A client-generated UUID sent with non-idempotent requests (POST). If the server receives a duplicate key, it returns the cached response without re-executing — preventing double charges', 'A server-side cache key for GET responses', 'A key used for rate limiting'], correct: 1, explanation: 'For non-idempotent operations (payments, order creation), a client-generated idempotency key in the header allows safe retries. If the network times out and the client retries, the server detects the duplicate key and returns the original result without creating a second order or charge.' },
    { id: 'ad-6', difficulty: 'Easy' as const, question: 'When should you use POST vs PUT for resource creation?', options: ['POST for reads; PUT for writes', 'POST when the server determines the ID (returns 201 + Location). PUT when the client determines the full URI — creates or replaces idempotently', 'PUT is deprecated; always use POST', 'POST creates collections; PUT creates individual items'], correct: 1, explanation: 'POST is appropriate when the server assigns the ID (POST /users → server creates /users/123). PUT is appropriate when the client knows the full URI and wants create-or-replace semantics. PUT is idempotent; POST is not.' },
    { id: 'ad-7', difficulty: 'Hard' as const, question: 'How can you avoid sending a full response body when the resource hasn\'t changed since the client\'s last request?', options: ['Use compression to reduce payload', 'Conditional requests: ETag + If-None-Match (or Last-Modified + If-Modified-Since). Server returns 304 Not Modified with no body if unchanged', 'Use WebSockets to push only diffs', 'Return an empty 200 if nothing changed'], correct: 1, explanation: 'The client stores the ETag from the previous response and sends it as If-None-Match. If the server\'s current ETag matches, it returns 304 Not Modified with no body — saving bandwidth. Critical for polling clients that frequently request the same resource.' },
  ],

  'grpc-websockets': [
    { id: 'gw-1', difficulty: 'Easy' as const, question: 'What is the main advantage of gRPC over REST+JSON for inter-service communication?', options: ['gRPC supports more HTTP methods', 'gRPC uses Protocol Buffers (binary) over HTTP/2: 3-10x smaller payloads, faster parse, multiplexed streams, and schema contracts', 'gRPC is easier to debug in browsers', 'gRPC eliminates load balancers'], correct: 1, explanation: 'Protocol Buffers are binary (not text) and schema-validated at compile time. HTTP/2 multiplexes streams on one connection. Together: significantly lower CPU, bandwidth, and latency than REST+JSON for high-throughput service-to-service calls.' },
    { id: 'gw-2', difficulty: 'Easy' as const, question: 'When should you choose WebSockets over HTTP long-polling?', options: ['WebSockets are always better', 'WebSockets: low-latency bidirectional real-time messaging (chat, gaming, collaboration). Long-polling: low message frequency or when WebSocket infrastructure is unavailable', 'Long-polling is deprecated; never use it', 'WebSockets only work within one datacenter'], correct: 1, explanation: 'WebSockets maintain a persistent full-duplex TCP connection with ~1ms overhead per message. Long-polling reopens HTTP requests each time (~100-500ms overhead). For high-frequency bidirectional communication, WebSockets are far more efficient; long-polling remains a useful HTTP-only fallback.' },
    { id: 'gw-3', difficulty: 'Medium' as const, question: 'Which gRPC streaming type is best for streaming a large dataset from server to client?', options: ['Unary (request-response)', 'Server streaming — one request, a continuous stream of responses', 'Client streaming — stream of requests, one response', 'Bidirectional streaming'], correct: 1, explanation: 'Server streaming lets the server push a stream of responses to a single client request. Ideal for large query results, live event feeds, or file downloads chunked over time — without the client sending multiple requests.' },
    { id: 'gw-4', difficulty: 'Medium' as const, question: 'A WebSocket server handles 1M concurrent connections. What is the primary resource constraint?', options: ['CPU clock speed', 'Memory: each connection consumes OS file descriptors + per-connection application state. 1M × ~10KB = ~10GB RAM minimum, plus OS tuning (ulimit, somaxconn)', 'Network bandwidth only', 'GPU for TLS termination'], correct: 1, explanation: 'Each WebSocket connection needs a file descriptor and per-connection state. 1M connections is achievable (C10M problem is solved) but requires careful OS tuning, event-loop architecture (epoll/kqueue), and minimizing per-connection memory footprint.' },
    { id: 'gw-5', difficulty: 'Hard' as const, question: 'How do you scale WebSocket connections across multiple server instances?', options: ['Round-robin load balancing — WebSockets work fine', 'Sticky sessions to keep each client on the same server, OR a pub/sub broker (Redis Pub/Sub) to route messages between servers regardless of which holds the connection', 'WebSockets cannot scale horizontally', 'Use only vertical scaling for WebSocket servers'], correct: 1, explanation: 'WebSocket connections are stateful — a client is pinned to one server. A message published via server A can\'t reach a client on server B without a broker. Solutions: sticky sessions (IP hash) for simplicity, or Redis Pub/Sub to fan out messages to all server instances.' },
    { id: 'gw-6', difficulty: 'Medium' as const, question: 'What is SSE (Server-Sent Events) and how does it differ from WebSockets?', options: ['SSE is bidirectional; WebSockets are server-to-client only', 'SSE: server pushes data over a persistent HTTP connection (unidirectional, server→client). WebSockets: bidirectional. SSE uses text/event-stream, reconnects automatically, works over HTTP/1.1', 'SSE requires HTTP/2; WebSockets use HTTP/1.1', 'They are the same protocol'], correct: 1, explanation: 'SSE is simpler for server-push use cases (live feeds, progress, notifications). It uses a regular HTTP response that stays open, sends text events, and browsers auto-reconnect with Last-Event-ID. No library needed for browsers. For bidirectional, WebSockets are needed.' },
    { id: 'gw-7', difficulty: 'Hard' as const, question: 'Protocol Buffers require shared .proto files. What benefit and tradeoff does this create?', options: ['Shared protos reduce bandwidth; tradeoff is higher latency', 'Strict compile-time schema contracts prevent serialization mismatches. Tradeoff: schema changes require coordinated updates across all clients/servers', 'Protos enable encryption; tradeoff is CPU overhead', 'Protos compress data; tradeoff is human readability only'], correct: 1, explanation: 'Proto files define a typed, versioned schema: if you rename a field, both sides must update or communication breaks. This compile-time contract prevents runtime JSON mismatches. The tradeoff is deployment coupling — careful backward-compatible schema evolution (field numbering, deprecation) is required.' },
  ],

  'auth': [
    { id: 'au-1', difficulty: 'Easy' as const, question: 'What is the fundamental difference between authentication and authorization?', options: ['They are the same thing', 'Authentication: proving who you are (identity). Authorization: determining what you are allowed to do (permissions)', 'Authentication is for users; authorization is for services', 'Authorization happens before authentication'], correct: 1, explanation: 'Authentication (authn) establishes identity: "Who are you?" Authorization (authz) checks permissions: "What can you do?" You can be authenticated (logged in) but unauthorized (lacking permission for a resource).' },
    { id: 'au-2', difficulty: 'Medium' as const, question: 'A JWT is signed but not encrypted. What can an attacker see if they intercept one?', options: ['Nothing — JWTs are encrypted by default', 'The header and payload are Base64-encoded (trivially decodable). Never put sensitive data (passwords, PII) in the JWT payload', 'Only the signing algorithm', 'The server\'s private key'], correct: 1, explanation: 'JWT = Base64URL(header).Base64URL(payload).Signature. Header and payload are plain Base64 — decode them with any Base64 decoder. The signature verifies tamper-resistance but does not hide content. Sensitive data must stay out of the payload.' },
    { id: 'au-3', difficulty: 'Medium' as const, question: 'What is the security difference between storing a JWT in localStorage vs. an HttpOnly cookie?', options: ['localStorage is faster; cookies are slower', 'localStorage: readable by JavaScript (vulnerable to XSS theft). HttpOnly cookies: inaccessible to JavaScript — XSS cannot steal them, though CSRF becomes a concern', 'Cookies expire; localStorage does not', 'There is no security difference'], correct: 1, explanation: 'An XSS attack can execute JavaScript that reads localStorage and exfiltrates the JWT. HttpOnly cookies are never accessible to JavaScript — the browser sends them automatically but scripts can\'t read them. Tradeoff: cookies need CSRF protection; localStorage needs strict XSS prevention.' },
    { id: 'au-4', difficulty: 'Hard' as const, question: 'What is the difference between OAuth 2.0 Authorization Code flow and Implicit flow? Which is preferred today?', options: ['They are identical; Implicit is newer', 'Authorization Code: exchanges a short-lived code for tokens via a back-channel (tokens not in URL). Implicit: tokens in URL fragment (exposed in browser history). Authorization Code + PKCE is the modern standard; Implicit is deprecated', 'Implicit is more secure (no server required)', 'Auth Code requires client secret; Implicit is for all clients'], correct: 1, explanation: 'Implicit flow returns access tokens in the redirect URL fragment — visible in browser history, referrer headers, and server logs. Authorization Code returns a code; the server exchanges it securely. For SPAs/mobile (public clients), Auth Code + PKCE replaces Implicit without needing a client_secret.' },
    { id: 'au-5', difficulty: 'Medium' as const, question: 'Why should JWT access tokens have short expiry (15 min) rather than long expiry (30 days)?', options: ['Short expiry reduces server load', 'JWTs cannot be revoked once issued — a stolen token is valid until expiry. Short TTL limits the damage window; refresh tokens handle session continuity', 'Short expiry makes tokens smaller', 'Long-lived JWTs consume more memory'], correct: 1, explanation: 'JWTs are stateless — no server-side revocation without a denylist (which defeats statelessness). A stolen token is valid until it expires. Short access tokens (15min) + rotatable refresh tokens (7 days, stored securely) balance security and usability.' },
    { id: 'au-6', difficulty: 'Easy' as const, question: 'What is mTLS (mutual TLS) and when is it used?', options: ['A load balancing strategy for TLS', 'Both client AND server present certificates to authenticate each other — used for service-to-service auth in zero-trust architectures', 'A protocol for database encryption', 'A way to issue shorter TLS certificates'], correct: 1, explanation: 'Standard TLS: only the server is authenticated. mTLS: the client also presents a certificate the server validates. This enables cryptographic service identity — a microservice can only call another if it has a certificate from a trusted CA, regardless of network perimeter.' },
    { id: 'au-7', difficulty: 'Hard' as const, question: 'What is zero-trust architecture?', options: ['A system with no security controls', 'Never trust, always verify — every request (even internal) must authenticate and authorize. Assumes breach; verifies identity, device health, and context per request regardless of network location', 'Zero-trust means no VPN is needed', 'A single strong perimeter replacing all internal controls'], correct: 1, explanation: 'Traditional perimeter security trusts the internal network. Zero-trust assumes the network is compromised: every service call requires authentication (mTLS/OIDC), authorization (RBAC/ABAC), and continuous verification. Breaches are contained because lateral movement requires explicit authorization.' },
  ],
}
