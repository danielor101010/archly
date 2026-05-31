import { Section, Callout, CodeBlock, TradeoffTable } from './components'

export const CloudStorage = () => (
  <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-white mb-3">Cloud Storage</h1>
      <p className="text-zinc-400 leading-relaxed">
        Choosing the wrong storage type is one of the most expensive cloud architecture mistakes. Object storage, block storage, file storage, and managed databases each have distinct performance profiles, cost models, and use cases. Pick the wrong one and you'll be paying for IOPS you don't need — or hitting performance cliffs you can't fix without a full migration.
      </p>
    </div>

    <Section title="Storage Types Comparison">
      <TradeoffTable rows={[
        { name: 'Object Storage (S3)', pro: 'Infinite scale, 99.999999999% durability, cheap, HTTP API', con: 'High latency (~10-100ms), no random-write, no locking', use: 'Media files, backups, data lakes, static website assets' },
        { name: 'Block Storage (EBS)', pro: 'Low latency (<1ms), random read/write, acts like a hard drive', con: 'Attached to one EC2 instance (except io2 multi-attach), limited size', use: 'OS volumes, databases on EC2 (Postgres, MySQL)' },
        { name: 'File Storage (EFS)', pro: 'Multi-instance shared access, POSIX filesystem', con: '3-5x more expensive than EBS, higher latency than EBS', use: 'Shared config, CMS media, Lambda /tmp alternative' },
        { name: 'Database-as-a-Service', pro: 'Managed backups, replication, failover, patching', con: 'Less control, potential vendor lock-in', use: 'Application primary datastores — RDS, Aurora, DynamoDB' },
      ]} />
    </Section>

    <Section title="Object Storage — S3 Deep Dive">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        S3 stores objects in <strong className="text-white">buckets</strong>. Every object has a key (the "path"), data, and metadata. There's no real directory hierarchy — the slash in <code className="text-zinc-300">images/2024/photo.jpg</code> is just part of the key name. The S3 console pretends they're folders.
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm mb-4">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Multipart upload:</strong> For objects over 100MB, split into parts and upload in parallel. Required for objects over 5GB. Dramatically improves throughput and allows resumable uploads on failure.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Versioning:</strong> When enabled, every PUT creates a new version. Deletes create a delete marker (old versions still exist). Protects against accidental deletion but increases storage costs.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Strong consistency:</strong> As of 2020, S3 provides strong read-after-write consistency for PUTs and DELETEs. No more eventual consistency race conditions.</span></li>
      </ul>
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        <strong className="text-white">S3 Storage Classes</strong> — S3 automatically moves objects between tiers based on lifecycle policies:
      </p>
      <CodeBlock>{`S3 Standard          → $0.023/GB/mo  — active data, &lt;1% of all objects
S3 Standard-IA       → $0.0125/GB/mo — infrequent access, retrieval fee
S3 One Zone-IA       → $0.01/GB/mo   — single AZ, non-critical data
S3 Glacier Instant   → $0.004/GB/mo  — archive, ms retrieval
S3 Glacier Flexible  → $0.0036/GB/mo — archive, 3-5hr retrieval
S3 Glacier Deep      → $0.00099/GB/mo — compliance archive, 12hr retrieval

# Lifecycle rule example:
Transition to Standard-IA after 30 days
Transition to Glacier after 90 days
Expire (delete) after 2555 days (7 years)`}</CodeBlock>
    </Section>

    <Section title="Block Storage — EBS Types">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        EBS volumes are attached to EC2 instances and behave like network-attached block devices. They persist independently of the instance (unlike instance store). Choose the right type based on your IOPS and throughput needs:
      </p>
      <TradeoffTable rows={[
        { name: 'gp3 (SSD)', pro: 'Baseline 3,000 IOPS + 125 MB/s included, cost-effective', con: 'Max 16,000 IOPS (extra cost above baseline)', use: 'Default for most workloads: boot volumes, dev databases' },
        { name: 'io2 Block Express (SSD)', pro: 'Up to 256,000 IOPS, 99.999% durability, multi-attach', con: '3-4x more expensive than gp3', use: 'High-performance databases: Oracle, SQL Server, large Postgres' },
        { name: 'st1 (HDD)', pro: 'Cheap, 500 MB/s throughput for sequential reads', con: 'No random I/O, 500 IOPS max', use: 'Big data, Kafka log storage, data warehouse ETL staging' },
        { name: 'sc1 (HDD)', pro: 'Cheapest EBS option, cold storage', con: 'Lowest performance (250 MB/s max)', use: 'Infrequently accessed large datasets' },
      ]} />
      <Callout type="insight">
        gp3 is almost always the right default. Only move to io2 when your database profiler shows you're hitting IOPS limits. The jump from gp3 to io2 can be 4x the cost — verify the bottleneck is actually IOPS before over-provisioning.
      </Callout>
    </Section>

    <Section title="File Storage — EFS and FSx">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        When multiple EC2 instances or containers need shared filesystem access simultaneously, EFS (Elastic File System) or FSx are the options:
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">EFS:</strong> NFS-based, Linux-only, scales to petabytes automatically, multi-AZ. Good for: shared app config, CMS uploads (WordPress), machine learning training data shared across nodes.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">FSx for Windows:</strong> SMB protocol, Active Directory integration. Good for Windows workloads migrated from on-premises.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">FSx for Lustre:</strong> High-performance parallel filesystem. Integrates with S3. Good for HPC, ML training, video rendering.</span></li>
      </ul>
    </Section>

    <Section title="Database-as-a-Service">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Managed databases eliminate the operational burden of patching, backups, and failover — at the cost of some control.
      </p>
      <ul className="space-y-3 text-zinc-400 text-sm mb-4">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">RDS Multi-AZ:</strong> Synchronous standby in another AZ. Automatic failover in 1-2 minutes. Standby is NOT readable — it exists only for failover. Protects against AZ failure, not read scaling.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">RDS Read Replicas:</strong> Asynchronous replication (slight lag). Up to 15 replicas. Readable — offload reporting/analytics queries. Can be promoted to standalone in DR scenarios. Can be in different regions.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Aurora:</strong> AWS's proprietary MySQL/Postgres-compatible engine. Storage auto-scales to 128TB. Up to 15 read replicas with &lt;10ms replica lag. 5x faster than RDS MySQL. Aurora Global Database spans multiple regions with &lt;1s replication.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">DynamoDB:</strong> Serverless NoSQL, single-digit millisecond latency at any scale. Global Tables for multi-region active-active. Pay per request or provisioned capacity. Great for high-throughput key-value or document workloads.</span></li>
      </ul>
      <Callout type="failure">
        A common interview mistake: saying "I'll add a read replica to scale writes." Read replicas only scale reads. To scale writes in RDS you need vertical scaling, sharding, or a different database entirely. If write throughput is your bottleneck, consider DynamoDB or a purpose-built system.
      </Callout>
    </Section>

    <Section title="Interview Questions">
      <div className="space-y-3">
        {[
          { q: "You need to store 50TB of user-uploaded videos with rare access after 30 days. How do you architect storage?", a: "S3 Standard for fresh uploads (first 30 days). S3 Lifecycle policy transitions to S3 Standard-IA at 30 days, then Glacier Flexible at 180 days. CloudFront CDN in front of S3 for serving playback. Multipart upload for files >100MB." },
          { q: "What's the difference between RDS Multi-AZ and a read replica?", a: "Multi-AZ is synchronous replication to a standby for automatic failover — the standby is NOT readable. Read replicas are asynchronous copies that ARE readable, for scaling read workloads. They serve completely different purposes: one is for HA, one is for performance." },
          { q: "When would you choose EBS over S3?", a: "EBS when you need a filesystem mounted on an OS (databases, application servers, boot volumes) — it acts like a hard drive with random I/O. S3 for storing and retrieving discrete objects via an HTTP API. Databases running on EC2 must use EBS — S3 is too high-latency for transactional workloads." },
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
