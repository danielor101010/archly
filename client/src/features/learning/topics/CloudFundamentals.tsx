import { Section, Callout, CodeBlock, TradeoffTable } from './components'

export const CloudFundamentals = () => (
  <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-white mb-3">Cloud Fundamentals</h1>
      <p className="text-zinc-400 leading-relaxed">
        Cloud computing delivers on-demand compute, storage, and services over the internet with pay-as-you-go pricing. Understanding the service models, shared responsibility, and core architecture concepts is the foundation for every cloud design decision.
      </p>
    </div>

    <Section title="IaaS vs PaaS vs SaaS">
      <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
        The three cloud service models differ in how much the cloud provider manages versus how much you manage.
      </p>
      <TradeoffTable rows={[
        { name: 'IaaS', pro: 'Maximum control, flexible', con: 'You manage OS, runtime, patching', use: 'EC2, GCE, Azure VMs — full control over infra' },
        { name: 'PaaS', pro: 'Focus on code, not infra', con: 'Less control, vendor lock-in risk', use: 'Heroku, AWS Elastic Beanstalk, GCP App Engine' },
        { name: 'SaaS', pro: 'Zero ops, just use the product', con: 'No customisation of infra at all', use: 'Gmail, Salesforce, GitHub, Datadog' },
      ]} />
      <Callout type="insight">
        In interviews, the framing is: IaaS = rent the hardware, PaaS = rent the platform, SaaS = rent the software. A real-world rule of thumb: if you're writing Dockerfiles, you're in IaaS territory. If you're just writing app code and pushing to git, you're in PaaS territory.
      </Callout>
    </Section>

    <Section title="The Shared Responsibility Model">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Security responsibilities are split between you and the cloud provider, and the split point shifts based on service model.
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">AWS is responsible for:</strong> Physical hardware, network infrastructure, hypervisor, managed service availability</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">You are responsible for:</strong> Data, IAM configuration, OS patching (IaaS), network ACLs, encryption settings</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">The grey area:</strong> Misconfigured S3 buckets, open security groups, leaked IAM keys — these are YOUR responsibility even though AWS provides the tools</span></li>
      </ul>
      <Callout type="failure">
        The most common cloud security breaches are not AWS failures — they are customer misconfigurations. Public S3 buckets, over-permissive IAM roles, and secrets in environment variables. The cloud provider secures the infrastructure; you secure your configuration.
      </Callout>
    </Section>

    <Section title="Regions and Availability Zones">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        AWS is organised into <strong className="text-white">Regions</strong> (geographic areas like us-east-1, eu-west-2) each containing multiple <strong className="text-white">Availability Zones</strong> (AZs). An AZ is one or more physically separate data centres with independent power, cooling, and networking.
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm mb-4">
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Why 3 AZs per region?</strong> Quorum for distributed systems. With 3 AZs, you can tolerate a full AZ failure and still have a majority available for consensus.</span></li>
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">AZ failure scenario:</strong> us-east-1a goes down. If your RDS primary is in 1a, it fails over to standby in 1b (Multi-AZ). If your EC2 ASG spans 1a/1b/1c, instances rebalance across remaining AZs.</span></li>
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Region failure:</strong> Much rarer (once every few years). Requires active-active or active-passive cross-region replication. Route 53 failover routing handles DNS cutover.</span></li>
      </ul>
      <CodeBlock>{`# AWS well-architected multi-AZ pattern
# RDS: primary in us-east-1a, standby in us-east-1b
# ALB: spans 1a, 1b, 1c — routes to healthy instances
# EC2 ASG: min 3 instances, one per AZ
# EFS: replicates across all AZs in region automatically

# Rough latency: within AZ ~0.5ms, cross-AZ ~1-2ms, cross-region ~50-100ms`}</CodeBlock>
    </Section>

    <Section title="Elasticity vs Scalability">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        These terms are often used interchangeably but mean different things:
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Scalability:</strong> The ability to handle increased load by adding resources (scale out = horizontal, scale up = vertical). A pre-planned capacity expansion.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Elasticity:</strong> The ability to automatically provision and de-provision resources in real time based on current demand — and pay only for what you use. AWS Auto Scaling is elastic.</span></li>
      </ul>
      <Callout type="insight">
        Elasticity is the core financial argument for cloud. On-premises, you provision for peak load (Black Friday traffic) and pay for idle capacity 360 days a year. In the cloud, you auto-scale up for Black Friday and scale back down, paying only for the hours you used it.
      </Callout>
    </Section>

    <Section title="CapEx vs OpEx">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Traditional data centres are <strong className="text-white">CapEx</strong> (capital expenditure): buy servers, depreciate over 3-5 years, need upfront capital. Cloud is <strong className="text-white">OpEx</strong> (operational expenditure): pay monthly bills, expensed immediately, no upfront commitment.
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span>CapEx benefits: predictable cost long-term, asset ownership, sometimes cheaper at huge scale</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span>OpEx benefits: no upfront capital, variable cost tracks usage, faster to provision, no hardware lifecycle management</span></li>
      </ul>
    </Section>

    <Section title="The 5 Pillars of the Well-Architected Framework">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        AWS's Well-Architected Framework (WAF) defines five pillars for evaluating cloud workloads:
      </p>
      <ul className="space-y-3 text-zinc-400 text-sm">
        <li className="flex gap-2"><span className="text-orange-400">1</span><span><strong className="text-white">Operational Excellence:</strong> Automate everything. Use IaC, CI/CD, runbooks. Measure with CloudWatch. Perform game days to test failure scenarios.</span></li>
        <li className="flex gap-2"><span className="text-orange-400">2</span><span><strong className="text-white">Security:</strong> Least privilege IAM. Encrypt at rest and in transit. Enable CloudTrail and GuardDuty. Isolate workloads in separate VPCs/accounts.</span></li>
        <li className="flex gap-2"><span className="text-orange-400">3</span><span><strong className="text-white">Reliability:</strong> Multi-AZ deployments. Auto Scaling. Automated backups and restore testing. Use Route 53 health checks for failover.</span></li>
        <li className="flex gap-2"><span className="text-orange-400">4</span><span><strong className="text-white">Performance Efficiency:</strong> Right-size instances. Use managed services (RDS, ElastiCache). Choose the right compute (Lambda for event-driven, Fargate for containers, EC2 for sustained).</span></li>
        <li className="flex gap-2"><span className="text-orange-400">5</span><span><strong className="text-white">Cost Optimisation:</strong> Right-size + Reserved Instances (1-3yr commitment, up to 72% savings) + Savings Plans + Spot Instances (up to 90% savings for fault-tolerant workloads).</span></li>
      </ul>
      <Callout type="insight">
        In system design interviews, anchoring your cloud design choices to WAF pillars demonstrates architectural maturity. "I chose multi-AZ RDS to satisfy the Reliability pillar" is a much stronger answer than "I chose it because it's safer."
      </Callout>
    </Section>

    <Section title="Interview Questions">
      <div className="space-y-3">
        {[
          { q: "What's the difference between scaling up and scaling out?", a: "Scaling up (vertical) means bigger instances — more CPU/RAM on the same machine. Scaling out (horizontal) means more instances. Scale out is preferred in cloud because it avoids single-point-of-failure and has no hard ceiling." },
          { q: "You're designing a system that processes payroll. What cloud service model would you use?", a: "IaaS or PaaS for compute (EC2/Fargate), RDS for the database. Not SaaS — payroll data is sensitive and needs strong control over data residency and IAM." },
          { q: "An AZ goes down in your region. Walk me through what happens to your system.", a: "ALB stops routing to instances in the failed AZ. ASG launches replacement instances in remaining AZs. RDS fails over to standby (Multi-AZ). Users see a brief hiccup (~30–60s for RDS failover) then normal operation resumes." },
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
