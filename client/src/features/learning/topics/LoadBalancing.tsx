import { Section, Callout, CodeBlock, TradeoffTable } from './components'

export const LoadBalancing = () => (
  <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-white mb-3">Load Balancing</h1>
      <p className="text-zinc-400 leading-relaxed">
        A load balancer distributes incoming network traffic across multiple backend servers. Without one, a single server becomes your ceiling for capacity — and a single point of failure.
      </p>
    </div>

    <Section title="Why it matters">
      <p className="text-zinc-400 text-sm leading-relaxed">
        A single server handling all traffic means: (1) you can't scale beyond its hardware limits, (2) any deployment requires downtime, (3) a server crash takes down your entire service. Load balancers solve all three.
      </p>
    </Section>

    <Section title="Load Balancing Algorithms">
      <TradeoffTable rows={[
        { name: 'Round Robin', pro: 'Simple, equal distribution', con: 'Ignores server capacity differences', use: 'Identical servers, stateless requests' },
        { name: 'Least Connections', pro: 'Routes to least busy server', con: 'Overhead tracking connections', use: 'Long-lived connections (WebSockets)' },
        { name: 'IP Hash', pro: 'Same client → same server (sticky)', con: 'Uneven if clients have different traffic patterns', use: 'When you need session persistence' },
        { name: 'Weighted Round Robin', pro: 'Respects server capacity differences', con: 'Requires knowing server capacities', use: 'Heterogeneous server fleet' },
      ]} />
    </Section>

    <Section title="L4 vs L7 Load Balancing">
      <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
        <strong className="text-white">Layer 4 (Transport)</strong> — operates on TCP/UDP. Routes based on IP and port. Faster, but can't inspect HTTP content. Example: AWS NLB.
      </p>
      <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
        <strong className="text-white">Layer 7 (Application)</strong> — operates on HTTP/HTTPS. Can route based on URL path, headers, cookies, or content. Enables: path-based routing (/api → API servers, /static → CDN), A/B testing, JWT inspection. Example: AWS ALB, Nginx, HAProxy.
      </p>
      <Callout type="insight">
        In most modern architectures, use L7 at the edge and L4 for internal service-to-service communication. L7 is worth the overhead for the routing flexibility.
      </Callout>
    </Section>

    <Section title="Health Checks">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Load balancers continuously check server health to avoid routing to dead servers:
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Passive:</strong> Marks server unhealthy after N consecutive failures on real traffic</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Active:</strong> Sends periodic synthetic requests (e.g., GET /health every 5s)</span></li>
      </ul>
      <CodeBlock>{`# Nginx health check config
upstream backend {
  server api1:8080;
  server api2:8080;
  keepalive 32;
}
# Active health check (Nginx Plus):
# health_check interval=5s fails=3 passes=2;`}</CodeBlock>
    </Section>

    <Section title="The LB Itself as a SPOF">
      <Callout type="failure">
        <strong>Failure scenario:</strong> Your load balancer dies. All traffic fails instantly. You've eliminated N server SPOFs but created 1 LB SPOF.
      </Callout>
      <p className="text-zinc-400 text-sm mt-3 leading-relaxed">Solutions:</p>
      <ul className="space-y-2 text-zinc-400 text-sm mt-2">
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Active-passive pair:</strong> Standby LB takes over via heartbeat (keepalived + VIP)</span></li>
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Anycast DNS:</strong> Multiple LBs, DNS routes to nearest available</span></li>
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Cloud managed:</strong> AWS ALB/NLB are inherently redundant within AZ</span></li>
      </ul>
    </Section>

    <Section title="Sticky Sessions — Why They're Dangerous">
      <p className="text-zinc-400 text-sm leading-relaxed">
        Sticky sessions route a user to the same server every time (via cookie or IP hash). This enables server-side session storage but creates problems: if that server dies, the user loses their session. It also causes uneven load distribution.
      </p>
      <Callout type="insight">
        The better solution: store sessions in Redis (shared state). Now any server can serve any user, and you can scale freely.
      </Callout>
    </Section>

    <Section title="Interview Questions">
      <div className="space-y-3">
        {[
          { q: "How does your load balancer handle a server that's slow (but not dead)?", a: "Active health checks detect slow servers via timeout thresholds. Passive checks use circuit breakers." },
          { q: "What's the difference between load balancing and service discovery?", a: "LB routes external traffic. Service discovery (Consul, k8s DNS) handles internal service-to-service routing." },
          { q: "Why can't you just use round-robin DNS?", a: "DNS TTLs mean changes are slow to propagate, clients cache aggressively, and you can't do health checks." },
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
