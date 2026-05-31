import { Section, Callout, CodeBlock, TradeoffTable } from './components'

export const Serverless = () => (
  <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-white mb-3">Serverless</h1>
      <p className="text-zinc-400 leading-relaxed">
        "Serverless" doesn't mean no servers — it means you don't manage them. The cloud provider handles provisioning, scaling, patching, and capacity planning. You write a function; the cloud runs it. Pay per invocation, not per hour of idle capacity.
      </p>
    </div>

    <Section title="The Lambda Execution Model">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        AWS Lambda is the canonical serverless compute service. When a function is invoked, Lambda either reuses a warm execution environment or creates a new one (a cold start).
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm mb-4">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Execution environment:</strong> A MicroVM (Firecracker) with your function code, runtime (Node.js, Python, Java…), and dependencies. Environments are reused across invocations while traffic continues.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Warm invocation:</strong> Execution environment already exists. Lambda reuses it. ~1ms overhead. This is the fast path.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Cold start:</strong> No environment available. Lambda creates one: allocate MicroVM, download code, initialize runtime, run init code. Adds 100ms–10s latency depending on runtime and package size.</span></li>
      </ul>
      <CodeBlock>{`// Cold start latency benchmarks (typical p99):
// Node.js 20   ~200ms  (fastest runtime)
// Python 3.12  ~250ms
// Java 21      ~1-3s   (JVM startup is slow)
// .NET 8       ~500ms

// Package size effect (Node.js):
// Minimal function (1MB)      → ~150ms cold start
// Express + SDKs (50MB)       → ~1500ms cold start
// Avoid bundling unused SDKs`}</CodeBlock>
    </Section>

    <Section title="Cold Start Mitigation">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Cold starts are often acceptable for background jobs, but they're a problem for user-facing APIs. Here are the main mitigation strategies:
      </p>
      <TradeoffTable rows={[
        { name: 'Provisioned Concurrency', pro: 'Eliminates cold starts entirely for that concurrency level', con: 'Costs ~$0.015/hour per provisioned env — pay even when idle', use: 'Customer-facing APIs with latency SLAs, peak traffic periods' },
        { name: 'Smaller packages', pro: 'Free, reduces cold start 2-10x', con: 'Requires build tooling discipline', use: 'Always do this first — bundle only what you need (esbuild, tree-shaking)' },
        { name: 'Faster runtime', pro: 'Node.js/Python start 5-10x faster than Java', con: 'May not match your team\'s language', use: 'New functions — choose Node.js or Python over Java for latency-sensitive work' },
        { name: 'SnapStart (Java)', pro: 'Snapshots initialized env, sub-second Java cold starts', con: 'Java-only, adds deployment complexity', use: 'Existing Java Lambda functions you can\'t rewrite' },
      ]} />
      <Callout type="insight">
        The most common interview mistake on cold starts: proposing "scheduled warm-up pings" (invoking your function every 5 minutes to keep it warm). This works but is fragile — Lambda scales to hundreds of environments under load, and pinging one instance doesn't warm them all. Provisioned Concurrency is the production-grade solution.
      </Callout>
    </Section>

    <Section title="Event Triggers">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Lambda functions are invoked by events from dozens of AWS services. Understanding the invocation models is critical:
      </p>
      <ul className="space-y-3 text-zinc-400 text-sm">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">API Gateway / Function URL:</strong> Synchronous (request-response). Caller waits for the function to complete. Max 29s timeout (API GW limit). Use for HTTP APIs.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">S3 events:</strong> Asynchronous. S3 calls Lambda and doesn't wait. Lambda receives the S3 object key and processes it. Use for: image resize on upload, CSV processing, virus scanning.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">SQS:</strong> Lambda polls the queue (event source mapping). Processes messages in batches. Failed batches can be retried or sent to a dead-letter queue. Great for high-volume background processing.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">EventBridge:</strong> Event bus. Route events from AWS services or custom sources to Lambda based on rules. Use for: scheduled tasks (cron), event-driven architectures, cross-account event routing.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">DynamoDB Streams / Kinesis:</strong> Lambda reads from the stream. Maintains ordering per shard/partition. One Lambda per shard at a time. Use for: CDC, real-time aggregations.</span></li>
      </ul>
    </Section>

    <Section title="Lambda Limits You Must Know">
      <CodeBlock>{`Execution timeout:     15 minutes max
Memory:                128 MB – 10,240 MB (CPU scales with memory)
Ephemeral storage (/tmp): 512 MB – 10,240 MB
Deployment package:    50 MB zipped, 250 MB unzipped
Container image:       10 GB
Concurrent executions: 1,000 per region (soft limit, can increase)
Payload (sync):        6 MB request, 6 MB response
Payload (async):       256 KB

# Critical: Lambda is STATELESS
# /tmp is shared across warm invocations (same env) but NOT across envs
# Never rely on /tmp persisting between invocations at scale`}</CodeBlock>
      <Callout type="failure">
        The 15-minute timeout kills many naive serverless designs. A Lambda processing a large database migration or video transcode will time out. For long-running work: Step Functions (orchestrate chains of Lambdas), Fargate (containers, no timeout), or EC2 Batch.
      </Callout>
    </Section>

    <Section title="Serverless vs Containers — When to Use Each">
      <TradeoffTable rows={[
        { name: 'Lambda wins', pro: 'Zero ops, infinite scale, pay-per-request, event-driven', con: 'Cold starts, 15min timeout, stateless', use: 'Infrequent jobs, webhooks, event processing, APIs with variable traffic' },
        { name: 'Fargate wins', pro: 'No cold starts, custom runtimes, long-running tasks, more predictable latency', con: 'Slower to scale (minutes not seconds), per-vCPU/GB billing even if idle', use: 'Background workers, long-running processes, WebSocket servers' },
        { name: 'EC2 wins', pro: 'Maximum control, sustained high-throughput, lowest per-unit cost at scale', con: 'Full ops burden, over-provisioning risk', use: 'Databases, sustained compute, GPU workloads' },
      ]} />
    </Section>

    <Section title="Step Functions for Orchestration">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        AWS Step Functions lets you orchestrate multiple Lambda functions into a workflow with branching, retries, parallelism, and error handling — without writing that orchestration logic in your application code.
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm">
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">State machine:</strong> Define workflow as JSON (Amazon States Language). Each step can invoke Lambda, call AWS APIs, wait for a callback, or run in parallel.</span></li>
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Express vs Standard:</strong> Standard = exactly-once, 1-year max duration, auditable (for business processes). Express = at-least-once, 5-minute max, high-volume event processing.</span></li>
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Wait for callback:</strong> Lambda sends a task token to an external service, pauses. When the service calls back with the token, the workflow resumes. Use for: human approval steps, third-party API callbacks.</span></li>
      </ul>
      <Callout type="insight">
        Step Functions is the answer to "how do you handle long-running workflows in serverless?" Each Lambda step runs within 15 minutes; Step Functions coordinates the chain and maintains state between steps. An order fulfillment flow (validate → charge → reserve inventory → ship) is a classic Step Functions use case.
      </Callout>
    </Section>

    <Section title="Interview Questions">
      <div className="space-y-3">
        {[
          { q: "You're building an image processing pipeline: users upload photos, you need to create 3 thumbnail sizes. Design it.", a: "S3 PUT event triggers Lambda. Lambda reads original from S3, uses Sharp/Pillow to generate 3 thumbnails in parallel (Promise.all), writes them back to S3. If images are large (>6MB), use SQS between S3 and Lambda to decouple. Store metadata (key, sizes) in DynamoDB." },
          { q: "Your Lambda cold starts are causing p99 latency to spike. How do you fix it?", a: "First: reduce package size (esbuild, tree-shaking). Second: switch to Node.js/Python if using Java. Third: enable Provisioned Concurrency for the peak concurrency level. Measure cold start frequency with CloudWatch INIT_DURATION metric first — don't optimise before measuring." },
          { q: "How do you handle failures in Lambda — what happens if a function throws an error?", a: "Depends on invocation type. Sync (API GW): error returned to caller immediately. Async (S3 events): Lambda retries 2x with backoff, then sends to DLQ if configured. SQS trigger: failed batch returned to queue, retried up to maxReceiveCount, then sent to DLQ." },
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
