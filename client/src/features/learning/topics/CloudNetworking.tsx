import { Section, Callout, CodeBlock, TradeoffTable } from './components'

export const CloudNetworking = () => (
  <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-white mb-3">Cloud Networking</h1>
      <p className="text-zinc-400 leading-relaxed">
        Cloud networking is the invisible skeleton of every cloud system. Get it wrong and you expose data, create bottlenecks, or pay 10x for egress. Get it right and you have a secure, globally-distributed, low-latency foundation that scales automatically.
      </p>
    </div>

    <Section title="VPC Architecture">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        A <strong className="text-white">Virtual Private Cloud (VPC)</strong> is your logically isolated network within AWS. Think of it as your own data centre within AWS's data centre — you control the IP ranges, subnets, routing, and access controls.
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm mb-4">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">CIDR blocks:</strong> e.g. 10.0.0.0/16 gives you 65,536 IPs. Split into subnets like 10.0.1.0/24 (256 IPs each). AWS reserves 5 IPs per subnet.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Public subnet:</strong> Has a route to the Internet Gateway (IGW). Resources here can receive inbound internet traffic (e.g. load balancers).</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Private subnet:</strong> No route to IGW. Resources here (databases, app servers) cannot be directly reached from the internet. They reach the internet through a NAT Gateway.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Internet Gateway (IGW):</strong> Allows bidirectional internet traffic for public subnets. Scales automatically, no management needed.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">NAT Gateway:</strong> Allows private subnet resources to initiate outbound internet traffic (e.g. downloading packages) without being reachable inbound. Lives in a public subnet. Costs ~$0.045/hr + $0.045/GB — a significant cost driver.</span></li>
      </ul>
      <CodeBlock>{`# Standard 3-tier VPC layout (per AZ, repeated 3x)
VPC: 10.0.0.0/16
  Public subnet  10.0.1.0/24  → route to IGW       (ALB, NAT GW, bastion)
  Private subnet 10.0.2.0/24  → route to NAT GW    (app servers, EKS nodes)
  Data subnet    10.0.3.0/24  → no internet route   (RDS, ElastiCache)

# Route table for private subnet:
# 10.0.0.0/16  → local
# 0.0.0.0/0    → nat-gateway-id`}</CodeBlock>
      <Callout type="insight">
        Always put databases in a separate data subnet with no route to the internet and no NAT Gateway. Security groups provide application-layer isolation, but network-level isolation (no route) is defence-in-depth.
      </Callout>
    </Section>

    <Section title="Security Groups vs NACLs">
      <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
        AWS provides two layers of network access control that are commonly confused:
      </p>
      <TradeoffTable rows={[
        { name: 'Security Groups', pro: 'Stateful (return traffic auto-allowed), easy to manage', con: 'Only allow rules (no explicit deny), instance-level only', use: 'Primary access control for EC2, RDS, Lambda — attach to resources' },
        { name: 'NACLs', pro: 'Subnet-level, explicit deny rules, stateless granularity', con: 'Stateless (must configure inbound AND outbound), numbered rules complexity', use: 'Subnet-wide blocking (block a CIDR range or country IP block)' },
      ]} />
      <p className="text-zinc-400 text-sm mt-4 leading-relaxed">
        <strong className="text-white">Stateful vs stateless:</strong> Security groups are stateful — if you allow port 443 inbound, the response traffic is automatically allowed outbound. NACLs are stateless — you must explicitly allow both inbound port 443 AND outbound ephemeral ports (1024–65535) for the response.
      </p>
    </Section>

    <Section title="VPC Peering and Transit Gateway">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        When you need multiple VPCs to communicate (e.g. prod VPC, staging VPC, shared services VPC), you have two options:
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">VPC Peering:</strong> Direct encrypted connection between two VPCs. Non-transitive — if A peers with B and B peers with C, A cannot talk to C. Good for 2-5 VPCs.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Transit Gateway (TGW):</strong> Hub-and-spoke model. All VPCs connect to TGW, and TGW routes between them. Supports 5,000+ VPCs. Transitive routing. Essential for large multi-VPC organisations.</span></li>
      </ul>
      <Callout type="failure">
        VPC peering does not support overlapping CIDR ranges. Plan your IP addressing before you need to peer VPCs — retrofitting non-overlapping CIDRs across 20 VPCs is extremely painful.
      </Callout>
    </Section>

    <Section title="DNS with Route 53 Routing Policies">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Route 53 is AWS's DNS service. Beyond simple A records, it supports powerful routing policies for resilience and global traffic management:
      </p>
      <ul className="space-y-3 text-zinc-400 text-sm">
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Simple:</strong> Returns a single IP. No health checks. Use for single-server setups.</span></li>
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Weighted:</strong> Route 10% to v2, 90% to v1. Perfect for canary deployments and A/B testing.</span></li>
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Latency:</strong> Routes to the region with lowest measured latency for the user. Essential for global APIs — a Tokyo user should hit ap-northeast-1, not us-east-1.</span></li>
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Failover:</strong> Active-passive. Health check monitors primary endpoint. If it fails, Route 53 automatically returns the failover IP. ~30–60s DNS propagation delay to consider.</span></li>
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Geolocation:</strong> Routes based on user's country/continent. Use for GDPR (EU users → EU region) or localisation.</span></li>
      </ul>
      <Callout type="insight">
        Latency-based routing and failover routing are frequently confused in interviews. Latency routing is always-on optimisation. Failover routing is disaster recovery — it only activates when health checks fail. Combine them: use latency routing normally, with failover on each regional endpoint.
      </Callout>
    </Section>

    <Section title="CDN and Edge Caching">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        A CDN (Content Delivery Network) caches content at geographically distributed <strong className="text-white">Points of Presence (PoPs)</strong> so users get responses from a nearby edge node instead of your origin server. AWS CloudFront has 450+ PoPs globally; Cloudflare has 300+.
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm mb-4">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Cache-Control headers:</strong> You control what CDNs cache. <code className="text-zinc-300">Cache-Control: public, max-age=86400</code> caches for 24 hours. <code className="text-zinc-300">s-maxage</code> overrides for shared caches (CDN) specifically.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Origin shield:</strong> A single intermediate CDN layer between all edge nodes and your origin. Collapses many simultaneous cache misses into one origin request — critical for protecting your origin from thundering herd.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Cache invalidation:</strong> CloudFront invalidation costs $0.005/path after first 1,000/month. Use versioned filenames (main.abc123.js) instead — no invalidation needed, old version serves from cache until TTL expires.</span></li>
      </ul>
      <TradeoffTable rows={[
        { name: 'CDN (CloudFront)', pro: 'Reduces latency for all users globally, offloads origin', con: 'Stale content risk, debugging cache misses is hard', use: 'Static assets, public APIs, large media files' },
        { name: 'Global Accelerator', pro: 'Routes via AWS backbone (not public internet), reduces jitter', con: 'Does not cache — just network path optimisation', use: 'Real-time APIs, gaming, VoIP — latency-sensitive TCP/UDP' },
      ]} />
      <Callout type="insight">
        The key distinction: CDN = cache at the edge (reduces origin load AND latency). Global Accelerator = optimised network path with no caching (reduces latency and packet loss for dynamic, non-cacheable traffic). Use both together for latency-critical global apps.
      </Callout>
    </Section>

    <Section title="Interview Questions">
      <div className="space-y-3">
        {[
          { q: "A database in your private subnet needs to download a software update. How does it reach the internet?", a: "Via NAT Gateway in the public subnet. The private subnet route table has 0.0.0.0/0 → NAT GW. NAT GW translates the source IP to its own public IP and routes outbound. Return traffic is translated back. The DB is never directly reachable inbound." },
          { q: "How would you do a zero-downtime deploy to a new region?", a: "Provision the new region infrastructure with IaC. Replicate data (RDS cross-region read replica, promote to primary). Configure Route 53 weighted routing at 0% to new region. Warm up, verify health checks pass. Gradually shift weight: 5% → 25% → 100%. Remove old region." },
          { q: "What's the difference between a security group and a firewall?", a: "Security groups are stateful, instance-level, allow-only. Traditional firewalls are stateless, network-perimeter, allow+deny. AWS NACLs are closer to a traditional firewall. In practice, 95% of AWS security is done via security groups — NACLs are for broad subnet-level blocks." },
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
