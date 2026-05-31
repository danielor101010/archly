# AI System Design Mastery Platform — Production Planning Document

> World-class interactive platform for distributed systems interview training through live visual simulations, AI pressure, and architecture visualization.

---

## 1. Executive Product Vision

**Mission:** Engineers don't just read about systems — they *feel* them under load, watch them fail, and defend them under interview pressure.

**Core Thesis:** System design mastery requires three things current platforms fail to provide simultaneously:
1. **Visceral visual feedback** — seeing latency spread, queues grow, nodes die
2. **Pressure simulation** — real interviewer behavior, not polite Q&A
3. **Active construction** — building architecture live, not selecting from templates

**Target Users:**
- Senior engineers (L4–L6) preparing for FAANG/staff-level interviews
- Mid-level engineers leveling up to senior
- Engineering leads sharpening systems intuition
- CS students entering the industry

**Differentiation Matrix:**

| Platform | Visual Sim | AI Pressure | Live Architecture | Failure Drama |
|---|---|---|---|---|
| **Ours** | ✅ Full | ✅ Aggressive | ✅ Real-time | ✅ Cinematic |
| Exponent | ❌ | ❌ | ❌ | ❌ |
| HelloInterview | ❌ | Partial | ❌ | ❌ |
| Interviewing.io | ❌ | Human only | ❌ | ❌ |
| ByteByteGo | Static | ❌ | ❌ | ❌ |

**Business Model:**
- Freemium: 3 free sessions/month, limited topics
- Pro ($29/mo): Unlimited sessions, full interview mode, scoring
- Teams ($99/seat/mo): Cohort tracking, analytics, dashboards
- Enterprise: Custom scenarios, private deployments, recruiter integrations

---

## 2. UX Philosophy

**The Governing Principle:** *The UI is the product.* Every pixel communicates system state. Every animation teaches a concept.

**Five Design Laws:**

1. **Information Density Without Clutter** — inspired by Datadog and Linear. Every visual element earns its place. If something moves, it means something.
2. **Pressure Is a Feature** — UX shifts emotional register. Learning mode: calm. Interview mode: tense, reactive, unforgiving.
3. **Physics-Driven Metaphors** — Latency = slow particles. Queue buildup = physical expansion. Overload = shaking + red glow.
4. **Zero Distraction** — No modals. No interruption dialogs. All state transitions happen contextually.
5. **The Canvas Is Alive** — Even at rest: subtle ambient node pulses, slow edge shimmers, cursor-reactive highlights.

**Visual Language:**
- Typography: Geist Mono for metrics, Inter for prose
- Color: Dark base `#0A0A0F`, semantic node colors, neon health state accents
- Motion: Spring physics for structural changes, linear for data flows, ease-out for failures

---

## 3. User Journey

```
Landing → Instant Demo (no signup) → Watch URL shortener designed live
  → "Design your own system" CTA → Skill Assessment (5 questions, 90s)
  → Personalized path → First session begins immediately
```

**Learning:** Topic → Concept explanation → Interactive simulation → "Break it" mode → Quiz → Next topic

**Practice:** Select problem → Blank canvas + chat → User types → Canvas builds live → AI flags SPOFs → Scored breakdown

**Interview:** Select difficulty → Timer starts → AI introduces problem → Chaos injected at key moments → Full debrief with scores

---

## 4. Core Modes

### Learning Mode
Interactive rooms for 21 system design concepts. Each includes:
- Explanation + real-world examples + architecture diagrams
- Interactive simulations (toggle cache off, watch DB flood)
- Tradeoffs table + failure scenarios + interview questions
- WHY it works, WHY it fails, WHEN to use/avoid it

Topics: Load Balancing, API Gateway, Redis Caching, CDN, SQL vs NoSQL, Replication, Sharding, Partitioning, Kafka/Queues, Event-Driven Systems, Rate Limiting, WebSockets, Distributed Locks, CAP Theorem, Consistency Models, Microservices, Scaling Strategies, Database Indexing, Read/Write Separation, Search Systems, Real-Time Systems

### Practice Mode
Open-ended system design problems. AI parses user text, builds live architecture canvas, detects bottlenecks/SPOFs, analyzes tradeoffs. Canvas updates LIVE as user explains.

Problems: Instagram, Uber, YouTube, WhatsApp, Dropbox, URL Shortener, Ticket Booking

### Interview Mode
Simulates a real high-pressure FAANG interview. AI interviewer:
- Interrupts users mid-sentence
- Changes requirements mid-session (10x scale spike)
- Introduces failures ("Your DB just crashed. Fix it.")
- Pressures weak decisions
- Adapts aggression to user skill level (1–10 scale)
- Injects chaos events at scheduled intervals

---

## 5. Main Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Logo | Mode Badge | Timer | End Session               │
├────────────────────────────────┬────────────────────────────────┤
│  CHAT (70%)                    │  CANVAS (30%)                  │
│  - Streaming AI responses      │  - Live architecture graph     │
│  - Typing indicators           │  - Animated request particles  │
│  - Interruption overlays       │  - Node health states          │
│  - Inline highlights           │  - Latency visualization       │
│                                │  - Failure animations          │
├────────────────────────────────┴────────────────────────────────┤
│  Bottom Tabs: Tradeoffs | Metrics | Score (collapsible 160px)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Visual Simulation System

### Graph Rendering Architecture
- **React Flow** — node/edge layout, interaction (DOM-based, accessible)
- **HTML5 Canvas overlay** — particle animations (60fps, not in React state)
- **CSS transforms** — node health state animations (GPU-accelerated)
- **Framer Motion** — structural transitions, entrance/exit animations

### Node Types
`client` | `cdn` | `load_balancer` | `api_gateway` | `api_service` | `cache` | `message_queue` | `database` | `search_cluster` | `object_storage` | `notification_service` | `websocket_gateway` | `analytics_service` | `ml_service`

### Node Health States
```
healthy  → soft green glow, smooth pulse
elevated → amber glow, faster pulse
stressed → orange + faster animation
critical → red glow + shake animation (Framer Motion)
dead     → 30% opacity, grayscale, broken edges
scaling  → new node spawning animation
```

### Request Particle States
```
green  → successful request
blue   → cache hit
yellow → waiting / queued
orange → retrying
red    → failed
purple → async queue event
```

Particle behavior: slow movement during latency, duplication during retries, disappearance on timeout, bursts during spikes.

---

## 7. Failure Visualization Engine

### Failure Types
```typescript
type FailureType =
  | 'node_crash' | 'node_overload' | 'network_partition'
  | 'cache_eviction_storm' | 'retry_storm' | 'queue_backup'
  | 'region_failure' | 'split_brain' | 'thundering_herd'
```

### DB Overload Sequence
```
T+0ms:    DB border turns orange, load meter fills
T+500ms:  Particle speed on DB edges decreases 60%
T+1000ms: DB glows deep red, shake animation starts
T+1500ms: Queue particles accumulate at DB input
T+2000ms: Upstream API nodes begin orange pulse (backpressure)
T+3000ms: Retry particles spawn (orange color)
T+4000ms: AI: "Your database is now the bottleneck. What do you do?"
T+5000ms: Educational callout: "Consider: read replicas, caching, connection pooling"
```

### Cache Miss Storm
```
T+0ms:    Cache dims, "HIT RATIO: 12%" badge appears
T+300ms:  All particles reroute direct to DB
T+800ms:  DB input edges saturate, particle density 5x
T+2000ms: AI: "Your cache just had a cold start. How do you warm it?"
```

---

## 8. Simulation Engine Design

```typescript
class SimulationEngine {
  // Deterministic, time-stepped discrete event simulator
  // Runs server-side at 100ms tick intervals
  // Pushes state via WebSocket
  
  tick(deltaMs: number): SimEvent[] // returns events for this frame
  
  // Latency model: Little's Law + queuing theory
  // < 70% utilization: linear growth
  // 70-90%: exponential growth  
  // > 90%: queue-based (latency = baseMs + queueDepth * 50ms)
  
  // Auto-scaling: scale-out at >80% load, scale-in at <20%
  // 30s cooldown between scale events
}
```

---

## 9. AI Interview Brain

### Orchestration Pipeline
```
User Message
  → Intent Parser (lightweight, fast)
  → Architecture Updater (graph mutation)
  → Weakness Detector (SPOFs, bottlenecks, gaps)
  → Interview State Machine (phase, aggression, pending challenges)
  → Response Generator (Claude API, streamed)
  → Post-Process (streaming + UI side effects via embedded commands)
```

### Dynamic System Prompt Assembly
```
[STATIC CORE — cached with Claude prompt caching ~2000 tokens]
You are a senior staff engineer at {company} conducting a system design interview.

[DYNAMIC CONTEXT — rebuilt each turn ~500 tokens]
Current architecture: {graph_json}
Detected weaknesses: {weakness_list}
Phase: {phase} | Aggression: {1-10} | Time: {minutes}
Pending challenges: {challenge_list}
```

### Embedded Canvas Commands (parsed from AI output)
```xml
<canvas:add_node id="lb1" type="load_balancer" label="Load Balancer"/>
<canvas:add_edge id="e1" from="lb1" to="api1"/>
<canvas:update_node id="db1" health="critical"/>
<canvas:highlight nodeId="db1"/>
<canvas:failure type="node_overload" nodeId="db1"/>
<simulation:spike multiplier="10" duration="30000"/>
```

### Chaos Events
```typescript
const chaosEvents = [
  { trigger: { timeElapsed: 15 * 60 }, description: "Traffic just spiked 10x. How does your system handle this?" },
  { trigger: { weakness: 'no_db_replication' }, description: "Your primary database just went down. What happens?" },
  { trigger: { timeElapsed: 25 * 60 }, description: "New constraint: all responses must be under 50ms globally." }
]
```

### Aggression Model
- 1–3: Supportive, gentle clarifying questions
- 4–6: Neutral professional, expects precision
- 7–8: Challenging, interrupts, demands specifics
- 9–10: Hostile, challenges everything, rapid-fire

Aggression increases with: time elapsed, unaddressed weaknesses, vague answers.

---

## 10. Multi-Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      AI ORCHESTRATION LAYER                    │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Interview   │ Architecture │  Simulation  │   Feedback/Score   │
│    Agent     │    Parser    │    Agent     │      Agent         │
├──────────────┴──────────────┴──────────────┴────────────────────┤
│   Scoring Agent  │    UX Agent    │   Visualization Agent       │
└──────────────────┴────────────────┴─────────────────────────────┘
```

Agents communicate via in-process event bus (not HTTP). All agents process each user message in parallel via `Promise.all`.

---

## 11. Frontend Architecture

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React 19 + TypeScript | Concurrent features, type safety |
| Styling | Tailwind CSS + CSS vars | Utility-first + theme tokens |
| Animation | Framer Motion + Canvas API | DOM anims + high-perf particles |
| Graph | React Flow v12 | Layout, interaction, extensibility |
| State | Zustand + Immer | Simple, performant, immutable |
| WebSocket | Native WS + reconnect logic | Full control |
| Build | Vite | Fast HMR |

### State Architecture
```typescript
// sessionStore — metadata, phase, mode, timer
// graphStore   — React Flow nodes/edges, SPOF flags
// chatStore    — messages, streaming state (NOT particles)
// uiStore      — panels, selected node
// scoreStore   — live score dimensions

// CRITICAL: Particle positions are NOT React state
// They live in a plain JS ParticleManager, updated 60fps on Canvas
```

---

## 12. Backend Architecture

```
backend/
├── api-gateway/     → Entry, auth, rate limiting
├── session-service/ → Session lifecycle, event sourcing
├── ai-orchestrator/ → Multi-agent coordination, Claude API
├── simulation-engine/ → Deterministic sim, 100ms ticks
├── graph-service/   → Architecture analysis, SPOF detection
├── scoring-service/ → Real-time score computation
└── user-service/    → Profiles, progress, preferences
```

**Event Sourcing:** All session mutations are events. State = fold(initialState, events). Enables replay, undo, time-travel debugging.

**Claude API Streaming:** Response streams token-by-token → backend parses embedded canvas commands mid-stream → strips them from text → forwards text chunks AND graph updates simultaneously via WebSocket.

---

## 13. WebSocket Event System

```typescript
// Client → Server
'USER_MESSAGE'        | 'CANVAS_INTERACTION' | 'SIMULATION_CONTROL' | 'PING'

// Server → Client
'AI_STREAM_CHUNK'     // streaming AI text delta
'AI_STREAM_END'       // stream complete
'GRAPH_UPDATE'        // canvas mutations (add/remove/update node/edge)
'SIM_TICK'            // simulation state snapshot (100ms)
'FAILURE_EVENT'       // triggers visual failure sequence + AI message
'SCORE_UPDATE'        // live score change after each exchange
'INTERVIEWER_INTERRUPT' // forced interruption overlay
'PANEL_UPDATE'        // bottom panel data
'PONG'
```

**Connection management:** 30s heartbeat, exponential backoff reconnect (1s→2s→4s→8s→30s max), session state in Redis for resume.

---

## 14. System Graph Data Model

```typescript
interface GraphNode {
  id: string
  type: NodeType
  label: string
  position: Vector2D
  healthState: NodeHealthState
  sim: {
    loadPercentage: number
    requestsPerSecond: number
    latencyMs: number
    errorRate: number
    queueDepth: number
    replicaCount: number
  }
  isSPOF: boolean
  bottleneckScore: number
}

interface GraphEdge {
  id: string
  sourceId: string
  targetId: string
  type: 'sync' | 'async' | 'event' | 'replica_sync'
  label?: string
  isHealthy: boolean
  isCriticalPath: boolean
}
```

### Graph Analysis
- **SPOF detection:** Remove each non-redundant node, check if graph disconnects
- **Critical path:** Dijkstra on latency weights (client → DB)
- **Bottleneck score:** inDegree × 2 + outDegree + (criticalPath ? 5 : 0) × (hasReplica ? 0.5 : 1.0)

---

## 15. Database Design

```sql
CREATE TABLE users (id UUID PK, email TEXT UNIQUE, display_name TEXT, ...);

CREATE TABLE sessions (
  id UUID PK, user_id UUID, mode session_mode,
  problem_id TEXT, started_at TIMESTAMPTZ, ended_at TIMESTAMPTZ,
  scores JSONB, graph_final JSONB
);

CREATE TABLE session_events (          -- event sourcing
  id UUID PK, session_id UUID, sequence INT,
  type TEXT, payload JSONB, actor_id TEXT,
  UNIQUE(session_id, sequence)
);

CREATE TABLE topic_progress (
  user_id UUID, topic_slug TEXT,
  mastery_score INT, attempts INT, last_practiced_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, topic_slug)
);

CREATE TABLE user_rankings (
  user_id UUID PK, overall_score INT, rank_tier TEXT,
  topics_mastered INT, streak_days INT
);
```

**Redis:**
```
session:{id}:state     → JSON (2hr TTL)
session:{id}:graph     → JSON (2hr TTL)
ws:buffer:{id}         → LIST of messages (5min TTL)
ratelimit:user:{id}    → COUNTER
```

---

## 16. Scoring System

```typescript
interface ScoreState {
  architecture: {
    scalability: number    // handles projected load?
    reliability: number    // SPOFs eliminated?
    consistency: number    // data model makes sense?
    completeness: number   // all requirements addressed?
  }
  communication: {
    clarity: number
    tradeoffAwareness: number
    technicalPrecision: number
  }
  pressureHandling: {
    composure: number
    adaptability: number
    defensibility: number
  }
  overall: number   // weighted composite
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'
  verdict: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'No Hire' | 'Strong No Hire'
}
```

Scores update after every exchange. Architecture score based on graph analysis (components present, SPOFs removed, replicas added). Communication scored via pattern matching on AI-evaluated responses.

---

## 17. AI Prompt Orchestration

### Prompt Caching Strategy
```typescript
// ~80% cost reduction on long sessions via Claude prompt caching
const buildCachedPrompt = (session) => ({
  system: [
    {
      type: 'text',
      text: STATIC_PERSONA_PROMPT,     // ~2000 tokens, cached
      cache_control: { type: 'ephemeral' }
    },
    {
      type: 'text', 
      text: buildDynamicContext(session) // ~500 tokens, not cached
    }
  ]
})
```

### Interview Prompt Behavioral Rules
- Maximum response: 3 sentences unless asking for redesign
- If user pauses: ask a direct, uncomfortable question
- Reference specific components the user mentioned
- Emit `<canvas:...>` commands to build architecture in real-time
- Inject chaos events at scheduled intervals or on weakness detection

---

## 18. Adaptive Difficulty Engine

```typescript
interface SkillProfile {
  distributed_systems_fundamentals: number  // 0-100
  scalability_thinking: number
  failure_mode_reasoning: number
  tradeoff_articulation: number
  pressure_handling: number
}

// Skill signals increase/decrease dimensions per exchange:
// 'mentioned_sharding_strategy' → scalability_thinking +8
// 'failed_to_identify_spof' → architecture_breadth -6
// 'gave_vague_answer_under_pressure' → pressure_handling -10
// 'proactively_mentioned_cap_theorem' → fundamentals +15

// If user is crushing it: aggressionDelta +2, inject chaos early
// If user is struggling: aggressionDelta -1, offer hint
```

---

## 19. Observability Layer

**Request Inspector:** Click any particle → inspect request trace:
```
Request 7f3a2b (200ms total)
├─ Load Balancer      2ms
├─ API Gateway        3ms
├─ Auth Service      12ms
├─ API Service       45ms
│  ├─ Cache lookup    3ms ✅ HIT
│  └─ Business logic 40ms
├─ DB Write          95ms ⚠️ SLOW
└─ Response          43ms
```

**Simulated Jaeger-style distributed tracing** — teaches tracing as a side effect of using it.

**Live Metrics Panel:**
- Global RPS, P50/P95/P99 latency, error rate
- Per-node: CPU, memory, connections, queue depth, cache hit rate
- Time series: last 5 minutes, 10s buckets

---

## 20. Motion System

| Event | Animation | Duration | Easing |
|---|---|---|---|
| Node added | Scale from 0, fade in | 400ms | spring(0.6, 0.8) |
| Node removed | Scale to 0, fade out | 300ms | ease-in |
| Edge drawn | Path length animation | 600ms | ease-out |
| Node healthy | Soft ambient pulse | 3000ms | ease-in-out (loop) |
| Node stressed | Faster pulse, orange | 1000ms | loop |
| Node critical | Shake + red glow | continuous | random micro-jitter |
| Node dead | Fade to 20%, grayscale | 800ms | ease-out |
| Replica spawn | New node from parent | 600ms | spring(0.4, 0.9) |
| Failure event | Screen edge flash | 200ms | ease-out |
| AI interrupt | Overlay slides from right | 200ms | ease-out |

---

## 21. Folder Structure

```
system-design-trainer/
├── client/                          # React 19 frontend (Vite)
│   └── src/
│       ├── features/
│       │   ├── canvas/              # Architecture graph + nodes
│       │   ├── chat/                # Chat interface + streaming
│       │   ├── learning/            # Learning rooms + content
│       │   ├── interview/           # Interview mode pages
│       │   ├── practice/            # Practice mode pages
│       │   └── scoring/             # Score display panel
│       ├── stores/                  # Zustand state stores
│       ├── lib/                     # WS client, API client
│       ├── layouts/                 # SessionLayout (70/30 split)
│       ├── pages/                   # Route-level pages
│       └── components/              # Shared design system UI
│
└── server/                          # Node.js backend
    └── src/
        ├── routes/                  # Express routes
        ├── ws/                      # WebSocket hub
        ├── ai/                      # Claude orchestration + prompts
        ├── simulation/              # Sim engine
        ├── services/                # Session, graph, scoring
        └── store.ts                 # In-memory storage
```

---

## 22. Deployment Architecture

```
Cloudflare (CDN + DDoS + WS proxy)
  → AWS ALB (SSL, sticky sessions for WS)
    → ECS (React app, 2 replicas)
    → ECS (Node.js API, 3 replicas + auto-scale)
      → RDS PostgreSQL Multi-AZ
      → ElastiCache Redis (2 shards)
      → Anthropic Claude API
```

**WebSocket scaling:** ALB IP hash for sticky sessions. Redis Pub/Sub for cross-server fan-out on reconnect.

---

## 23. MVP Scope (8 weeks / 2 engineers)

**In MVP:**
- [x] Auth (Google OAuth or anonymous)
- [x] 5 learning rooms: Load Balancing, Caching, Queues, Databases, CAP Theorem
- [x] Architecture canvas (React Flow, static health visualization)
- [x] Practice mode: 3 problems (URL Shortener, Instagram, YouTube)
- [x] Interview mode: basic pressure, no chaos injection yet
- [x] AI chat with architecture parsing (canvas builds from text)
- [x] Session saving + basic scoring
- [x] Dark cinematic UI

**Excluded from MVP:** Particle animations, live failure visualization, chaos injection, observability panels, gamification, multi-region, mobile.

---

## 24. V2 Scope

- [ ] Full particle animation system
- [ ] Live failure visualization (all failure types)
- [ ] Chaos injection in interview mode
- [ ] Request inspector / distributed tracing UI
- [ ] Adaptive difficulty (full implementation)
- [ ] All 21 learning rooms
- [ ] 15+ practice problems
- [ ] Gamification: ranks, scores, streaks, leaderboard
- [ ] Session replay
- [ ] Shareable architecture snapshots
- [ ] Learning path recommendations

**V3:** Live pair design, voice mode, real infrastructure analysis, incident simulation, verified credentials.

---

## 25. Engineering Team Split

| Role | Owns |
|---|---|
| Frontend 1 — Canvas & Simulation | React Flow, particle canvas, node/edge components |
| Frontend 2 — Chat, UX & Panels | Chat interface, streaming UI, panels, motion |
| Backend 1 — AI & Orchestration | AI orchestrator, prompts, Claude API, sessions |
| Backend 2 — Simulation & Infra | Sim engine, WebSocket hub, graph analysis, scoring |

---

## 26. Security Considerations

- JWT with 15min access / 7d refresh, httpOnly cookies (XSS protection)
- Rate limiting: 60 req/min per user
- Input sanitization before Claude API calls (strip XML tags, 4000 char limit, log injection attempts)
- AI output rendered as markdown only — never raw HTML
- `<canvas:...>` commands allowlisted — only known types dispatched
- No PII in simulation events beyond userId
- User owns their data — full export + delete available

---

## 27. Future Expansion Ideas

**Near-term (V3–V4):**
- Live pair designing (two engineers, one canvas, AI as moderator)
- Company-specific interview modes (Meta E5 vs startup CTO — different styles)
- Voice mode: speak your architecture, AI builds canvas live

**Medium-term:**
- Connect to real infrastructure (AWS/GCP/k8s) — visualize your production system
- Incident simulation: recreate real-world outages (Facebook BGP, AWS us-east-1 failure)
- Custom failure library builder for teams

**Long-term:**
- Verified credentials (pass staff-level simulation → shareable credential companies trust)
- Recruiter integrations (candidates share scores — replaces take-home design exercises)
- Cohort learning for bootcamps/universities with instructor dashboards
- Multiplayer: two candidates compete on same problem, AI judges

---

*This platform will become the definitive distributed systems interview training tool — where engineers feel the systems they design.*
