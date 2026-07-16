# Archly — Production Readiness Plan

> Staff-level engineering plan based on a full audit of the codebase (client + server) as of 2026-07-15.
> This replaces the aspirational parts of PLANNING.md with a grounded, sequenced path to a paid product.
> No code here — decisions, priorities, and acceptance criteria only.

---

## 0. Honest Current-State Assessment

**What exists and works:**
- React 19 + Vite client (Vercel), Express + WebSocket server (Docker, single instance), Supabase Postgres, Google Sign-In, OpenRouter → `gemini-2.5-flash`, Brevo email.
- Real feature surface: practice/interview/concept/CV/coding session modes, live AI-driven canvas, quizzes with DB caching, learning rooms, ERD modeling page, request tracer, stress tests, scoring, dashboard.

**What PLANNING.md describes but does not exist (and should be de-scoped, not built):**
multi-agent orchestration layer, event sourcing, simulation engine with 100ms ticks, Redis, ECS/RDS/ElastiCache deployment, particle animation engine. **Do not build any of this before revenue.** The monolith is correct at this stage.

**The critical gaps, in one sentence each:**
1. Authentication is effectively OFF — the middleware exists (`server/src/auth.ts`) but is never applied (commit ced7a78 disabled it; the client never sends the JWT).
2. Every LLM endpoint (REST and WebSocket) is callable by anyone on the internet with zero rate limiting — your OpenRouter balance is one script away from being drained.
3. `GET /api/users/:googleId` and `POST /api/users/sync` let anyone read or overwrite any user's data (IDOR).
4. CORS trusts any `*.vercel.app` origin; `JWT_SECRET` falls back to a hardcoded dev string; `/api/test-email` is an open spam endpoint against your Brevo quota.
5. Sessions live in an in-memory `Map` with no TTL and no cleanup — they leak memory forever and vanish on every deploy.
6. Scores, progress, streaks, and token counts are computed/stored client-side and trusted by the server — incompatible with paid entitlements.
7. Zero tests, zero CI, zero error tracking, zero usage/cost observability.
8. `server/.env.example` is stale (lists `ANTHROPIC_API_KEY`; actual env is `OPENROUTER_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_ID`, `JWT_SECRET`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `CLIENT_URL`).

---

## 1. Security Plan — P0, blocks everything else

Subscriptions, cost control, and trust all depend on this. Order of operations:

### 1.1 Turn authentication on end-to-end
- Client attaches `Authorization: Bearer <token>` to every REST call; server applies the existing `authenticate` middleware globally (allowlist only `/health`, `/api/auth/google`).
- WebSocket: authenticate at connection time (token in query string or a mandatory first `AUTH` message; server closes unauthenticated sockets after 5s). Bind `googleId` to the connection; every session created is owned by that user; `USER_MESSAGE` etc. verified against ownership.
- Fail fast at boot if `JWT_SECRET` is missing or equals the dev default. The custom HMAC token in `auth.ts` is structurally fine (HMAC-SHA256, timing-safe compare, expiry); keep it, but add token refresh (re-issue on activity) rather than a hard 7-day cliff.

### 1.2 Fix resource authorization (IDOR)
- Replace `GET /api/users/:googleId` with `GET /api/me`; identity comes from the token, never the URL or body.
- `POST /api/users/sync`: derive `googleId` from token. Long-term (§6), stop syncing scores/progress from the client at all — compute server-side.
- Delete `/api/test-email` (or gate behind an `ADMIN_TOKEN` env check).

### 1.3 Rate limiting and quotas (also your cost firewall)
- Per-user: N LLM calls per minute (e.g. 10) and a daily token/cost budget stored in a `usage_ledger` table (see §6). Enforce before every OpenRouter call — REST and WS.
- Per-IP: coarse limiter on auth endpoint and WS connections.
- Global circuit breaker: `MAX_DAILY_COST_USD` env var; when exceeded, LLM endpoints return a friendly "at capacity" message instead of calling OpenRouter. This is the single control that guarantees you can never wake up to a surprise bill.

### 1.4 Input hardening
- Length caps enforced server-side: user message ≤ 4k chars, CV text ≤ 20k, custom problem title/description ≤ 500, node labels ≤ 80. Reject, don't truncate silently.
- Cap graph size per session (e.g. 60 nodes / 120 edges) and message history length.
- Prompt-injection hygiene: wrap user-supplied content (CV text, custom problems) in clear delimiters with an instruction that content inside is data, not instructions. The regex allowlist for `<canvas:>`/`<board:>` commands is already a good containment layer — keep it even after moving to structured outputs (§3).

### 1.5 Perimeter and secrets
- CORS: exact origin allowlist only (your production domain + localhost). Remove `endsWith('.vercel.app')`.
- Buy a real domain (also fixes the CORS problem and looks production-grade).
- Add `helmet` security headers; JSON body size limit (e.g. 100kb).
- Rotate any secret that has ever been in a commit (verify with git history scan); confirm Supabase service-role key lives only in server env. Turn Supabase RLS ON as defense-in-depth even though the service key bypasses it.
- Dependency audit in CI (`npm audit` gate on high severity).

### 1.6 Audit logging
- Structured logs (pino): auth failures, rate-limit hits, LLM cost per call, webhook events. Request IDs on REST; connection IDs on WS (already exist).

**Acceptance criteria:** an unauthenticated curl cannot trigger a single OpenRouter call, read/write another user's row, or send an email. A load script hitting the WS gets throttled, then blocked, and total daily spend cannot exceed the configured cap.

---

## 2. Production Readiness — P0/P1

- **Session persistence:** move `sessionStore` from in-memory Map to Supabase (a `live_sessions` table with JSONB graph + messages, `updated_at` TTL sweep) so deploys don't kill active interviews. Redis/Upstash is optional later; Postgres is fine at this scale. At minimum interim: add TTL eviction to the Map (sessions currently leak forever).
- **Hosting:** server on Railway/Fly.io (avoid free tiers that cold-start — they kill WebSockets); client stays on Vercel. Target infra bill: ≤ $10/month.
- **Docker hygiene:** multi-stage build (build stage + slim runtime), `npm ci --omit=dev` for runtime, non-root user, pinned Node version.
- **Graceful shutdown + resume:** on SIGTERM, stop accepting WS, flush sessions to DB. Client reconnect already exists; server must rehydrate the session on reconnect (currently a restart = "Session not found").
- **Error tracking:** Sentry free tier on both client and server. You currently cannot see production errors at all.
- **Product analytics:** PostHog free tier. Minimum events: sign-up, session started, session completed, solution revealed, quota hit, paywall viewed. Business decisions in §7 need this data.
- **CI (GitHub Actions):** on PR — typecheck + lint + build for both packages; on main — deploy. Half your recent commit history is "fix build" commits that CI would have caught pre-push.
- **Tests (minimal, strategic — not coverage theater):**
  - Unit: `architectureParser` (command parsing/stripping), `auth` token sign/verify/expiry, quota enforcement.
  - One Playwright smoke test: sign in (mocked Google) → start practice → send message → node appears → score updates.
- **Env validation at boot:** enumerate required vars, exit with a clear list if missing. Fix `.env.example` to match reality.
- **Uptime monitoring:** UptimeRobot/BetterStack free tier on `/health`.

---

## 3. LLM Quality Plan — fixing hallucination at the root

The hallucination is not a model problem; it's an architecture problem. Current design asks one free-form text generation to simultaneously (a) role-play an interviewer, (b) follow a phase state machine, (c) emit exact XML with exact IDs matching hidden state. That's the maximum-hallucination configuration.

### 3.1 Separate prose from graph mutations (highest-impact change)
- Two-step per turn: **(1)** conversational reply (streamed, no commands at all), **(2)** a second, small, non-streamed call with a strict JSON schema ("given this graph and this exchange, return the list of graph mutations — or none") using OpenRouter structured outputs / tool calling.
- Server validates every mutation against session state before applying: edge endpoints must exist, no duplicate IDs, node types from the enum, phase must allow mutations. Invalid → dropped and logged (today they're applied or silently malformed).
- Server generates IDs deterministically; the model references nodes by label, server resolves to IDs. Models are bad at ID bookkeeping — stop asking them to do it.

### 3.2 Move the state machine out of the prompt
- The interview phases (requirements → API → data model → HLD → deep dive) are currently enforced by prompt prose. Track `phase` explicitly in the session; advance it server-side (heuristics + a cheap classifier call); include **only the current phase's instructions** in the system prompt. Smaller prompt, better compliance, fewer tokens.

### 3.3 JSON endpoint hygiene (quiz gen, CV analysis, traces, suggestions)
- Use `response_format: json` / structured outputs instead of "return ONLY valid JSON" + regex stripping.
- Low temperature (~0.2) for all structured tasks; one retry on parse failure; log every failure (today they silently return empty arrays and you never know).
- Quiz quality: add a self-check pass (second cheap call: "is the marked answer actually correct?") before persisting, plus a "report this question" button feeding a review queue. Cached questions live forever — one hallucinated answer poisons every future user.

### 3.4 Fix scoring (currently misleading)
- `store.ts` grades "Strong Hire" from counting node types — a user who adds 8 components silently gets an A+ without saying anything intelligent. Replace with a server-side, end-of-session rubric evaluation: one LLM call over transcript + final graph returning dimension scores with one-line justifications, blended with the deterministic graph analysis (SPOF/redundancy checks) for the architecture dimension. Show justifications in the debrief — that's also a feature (§8).

### 3.5 Model strategy and evals
- Keep a Flash-class model for structured/cheap tasks; consider a stronger model (Gemini Pro-class or Claude Sonnet-class via OpenRouter) for the interviewer persona as a **paid-tier feature** — "smarter interviewer" is a legible upgrade reason.
- Build a tiny eval harness before touching prompts again: 20–30 golden conversations, replayed on any prompt/model change, measuring: command validity rate, phase compliance, repetition ("never repeat back" violations), response length. Without this you're changing prompts blind.
- Trim context: summarize turns older than ~15 exchanges instead of `slice(-30)` raw; never include `[REFERENCE SOLUTION]` blobs verbatim in every subsequent turn (summarize once).

---

## 4. Draw Panel Excellence

Today the canvas is AI-write-only: static per-type coordinate table (`NODE_POSITIONS`) with offset stacking, no way for the user to add nodes or draw edges, no undo, no export. The canvas is your differentiator and your marketing screenshot — it deserves the biggest product investment.

### 4.1 Accuracy and layout
- **Auto-layout engine:** ELK.js (layered/orthogonal) or dagre, re-run after each batch of AI mutations, animated transitions to new positions. Kills the overlap problem permanently; the static coordinate map can't survive >10 nodes.
- **Pin-on-drag:** when the user moves a node, mark it pinned; auto-layout respects pins. Best of both worlds.
- **Edge rendering:** direction arrowheads, orthogonal routing, visual grammar — solid = sync, dashed = async/queue, dotted = replication. Right now edge semantics exist in the data model but not visually.
- **Containers:** generalize the k8s-cluster special case into "zone" containers (VPC, region, availability zone, cluster) — needed for senior-level multi-region designs.

### 4.2 Manual editing parity (user can draw, AI reacts)
- Component palette sidebar: drag a component type onto the canvas.
- `onConnect` wired: user drags edges between handles, with type-aware validation (client → database directly ⇒ inline warning badge, which is itself teaching).
- Delete key / context menu: remove node or edge, rename, duplicate, "explain this".
- **Two-way sync — the killer feature:** manual canvas edits are sent to the server as events and enter the AI context ("candidate added a Redis cache between API and DB"), so the interviewer challenges what you *drew*, not just what you *said*. No competitor has this. This turns the canvas from a visualization into the actual interview medium.

### 4.3 Quality-of-life
- Undo/redo command stack (separate from per-turn snapshots).
- Alignment guides + grid snap.
- Export to PNG/SVG and a shareable read-only link — every shared design is free marketing.
- Snapshot storage diet: localStorage currently stores full node/edge copies per turn; store diffs or cap history.
- Performance: verify custom nodes are memoized; cap ~100 nodes; keep highlight updates reference-stable (partially done).

---

## 5. Design Refresh — killing the "base44 look"

The current UI *is* the AI-template aesthetic: near-black `#0A0A0F`, indigo/purple accents, glassy `white/5` translucent cards, glow keyframes, emoji in product copy and emails, gradient feature cards. Any user who has seen base44/Lovable/v0 output will pattern-match instantly.

### 5.1 Pick one distinctive identity (recommendation: "engineer's blueprint")
- Technical-drawing aesthetic: graph-paper canvas texture, drafting-style node silhouettes, one saturated accent (signal orange or blueprint blue — not indigo/purple), squared corners, visible structure instead of glass and glow.
- Typography does the branding: strong grotesque for headings, mono for metrics/labels (already half-true), tighter tracking, real scale contrast. Cut Inter-purple-glass entirely.
- Custom node iconography: one consistent stroke-icon set for the 13 component types, designed as a family. This is what appears in every screenshot and shared export — it IS the brand.

### 5.2 Kill the template tells (checklist)
- No glow animations, no gradient hero text, no emoji in UI or transactional emails, no icon+gradient feature-card grid on the landing page.
- Landing page shows the *product*: an auto-playing canvas demo (a design building itself) above the fold, not marketing cards.
- Health states communicated by border weight/badge/pattern — not neon aura.

### 5.3 Fix the theming debt while you're in there
- The `.light .text-zinc-400 { !important }` override wall in `index.css` (~100 lines) is a maintenance trap. Replace with semantic tokens (`--text-primary`, `--text-muted`, `--surface`, `--border`) consumed by Tailwind config, themed by flipping token values. One-time cost, permanent payoff, and a prerequisite for any redesign anyway.

---

## 6. Subscription Implementation

### 6.1 Payment provider — decision
- **Recommendation: a Merchant of Record (Paddle, or Lemon Squeezy for simpler setup).** As a solo developer selling globally, MoR handles VAT/sales-tax registration, invoicing, and compliance in every jurisdiction — that's dozens of hours and real legal risk you don't take on. Cost: ~5% + fees vs Stripe's ~3%. At your scale the delta is trivia; the compliance offload is not.
- Stripe Billing + Stripe Tax is the alternative if you already have a business entity and want lower fees + more control. Decide once; migration later is painful.

### 6.2 Server-side entitlements (hard prerequisite: §1 auth)
- New tables: `subscriptions` (user_id, plan, status, provider_customer_id, current_period_end) and `usage_ledger` (user_id, day, sessions_started, tokens_in, tokens_out, cost_cents).
- Provider webhooks (subscribe/renew/cancel/fail) update `subscriptions`; webhook signature verification mandatory.
- A single `checkEntitlement(userId, feature)` gate runs before every LLM call and session creation. The client renders quota state but never decides it. All the current client-side counters (sessionsCompleted, totalTokensUsed in zustand/localStorage) become display-only.

### 6.3 Gating model (meter sessions, not tokens — users understand sessions)
- **Free:** 3 practice/interview sessions per month, learning rooms and cached quizzes unlimited (near-zero marginal cost, they're the acquisition surface), no solution reveal, no CV mode.
- **Pro:** unlimited sessions (fair-use daily cap, e.g. 10/day), solution reveal + solution discussion, CV analysis + CV interview, stronger interviewer model, full session history + debrief reports.
- Paywall moments (instrument all three): 4th session start, solution-reveal click, CV upload.

### 6.4 Don't build in v1
Coupons, team seats, annual proration, in-app cancellation flows (MoR-hosted portal covers billing management), regional pricing.

---

## 7. Business Model

### 7.1 Pricing
- PLANNING.md's $29/mo is above market for a solo-built tool without a track record (competitors' full-featured tiers sit lower, and interview prep spending is bursty — people buy 1–3 months before interviews).
- **Recommendation:** Pro at **$15–19/month**, plus a **quarterly "Interview Sprint" at ~2× monthly price** (matches how people actually prep and improves cash timing). Optional early-adopter lifetime deal (first ~100 users) to seed testimonials — cap it.
- Teams/bootcamps/universities: real opportunity, defer 6+ months. It needs cohort dashboards you shouldn't build yet.

### 7.2 Unit economics sanity check
- A 45-minute session ≈ 20–30 LLM exchanges. With a Flash-class model, rough magnitude is **cents per session** (verify against current OpenRouter pricing — model prices move; put the real numbers in the usage_ledger and let data replace this estimate).
- Even a heavy Pro user (30 sessions/month) should cost low single-digit dollars → >75% gross margin at $15/mo. The margin risk is not the model price — it's unmetered abuse, which §1.3 eliminates.

### 7.3 Positioning
- The wedge vs HelloInterview/Exponent/interviewing.io/ByteByteGo: **the live canvas that builds and gets challenged as you speak**. Everything in marketing should show the canvas moving.
- Free growth loops: shareable canvas exports and public debrief reports (§8), plus learning rooms as SEO surface.
- Focus discipline: coding-interview mode and language quizzes dilute the story. Keep them for retention, market only system design.

### 7.4 Metrics that decide everything
Activation (completed first session), D7/D30 retention, sessions per active user, conversion at each paywall moment, cost per session, MRR. PostHog events from §2 feed all of these.

---

## 8. Cost Control Before Revenue

Ranked by protection-per-effort:
1. **OpenRouter credit limit** on the API key itself (provider-side hard cap) — do this today; it's a dashboard setting.
2. **Auth required for every LLM call** (§1.1) — no anonymous inference, period.
3. **Global daily circuit breaker** (§1.3) — bounded worst case regardless of bugs.
4. **Per-user daily budgets** — bounds any single abuser or runaway client loop.
5. **Cache what's deterministic:**
   - Reference solutions per problem ID — identical every time, currently regenerated per request at ~3k tokens; cache once in DB, stream from cache. Biggest single saving.
   - Node explanations keyed by (problem, node type, graph shape hash).
   - `trace-full` keyed by graph hash. Quiz questions already cached — good pattern, extend it.
6. **Token diet:** phase-scoped prompts (§3.2), summarized history, `max_tokens` already conservative — keep.
7. **Daily cost email** to yourself from the usage_ledger + OpenRouter dashboard check. Alert thresholds at 50%/80% of monthly budget.

Fixed infra target: ≤ $10/month (Vercel free + Railway/Fly ~$5 + Supabase free + Brevo free + Sentry/PostHog free tiers). The only variable cost is OpenRouter, now bounded on four sides.

---

## 9. New Feature Ideas (ranked)

**Quick wins (days each, high leverage):**
1. **Shareable debrief report** — end-of-session page: rubric scores with justifications (§3.4), key transcript moments, gaps to study, final canvas snapshot. Public link = growth loop + the artifact users pay for.
2. **Solution diff on canvas** — overlay reference solution vs user design; missing components pulse. Deterministic graph comparison, no LLM cost.
3. **Back-of-envelope calculator panel** — QPS/storage/bandwidth estimation worksheet with AI sanity-check; core interview skill, mostly deterministic.
4. **Daily failure drill** — one 10-minute scenario per day ("your cache cluster just died — mitigate"), streak-tracked. Retention mechanic on existing infra.
5. **Company interviewer personas** — Meta/Amazon/startup-CTO prompt variants (Amazon = capacity-estimate obsessed, Meta = product-thinking). Prompt work only; strong marketing hook.

**Medium (weeks):**
6. **Voice mode** — speak your design (Web Speech API), AI interrupts audibly. Real interviews are spoken; nobody in this space has it; pairs perfectly with the live canvas.
7. **Session replay** — scrub through canvas snapshots + transcript in sync (snapshot infra already exists).
8. **Adaptive learning path** — quiz + session data → "your weakness is consistency models, do these 3 things next."

**Defer (post-revenue):** multiplayer mock interviews, recruiter-shareable verified credentials, real-infra import (AWS/k8s visualization), incident recreations.

---

## 10. Sequenced Roadmap

**Phase 1 — Lock the doors (Weeks 1–2):** §1 complete + OpenRouter credit cap + Sentry + env validation + CI. *Exit: no unauthenticated path to spend or data.*

**Phase 2 — Make the AI trustworthy (Weeks 3–4):** §3.1–3.4 (structured mutations, phase state machine, JSON hygiene, scoring rework) + solution caching + eval harness. *Exit: command validity >99% on the eval set; scores defensible.*

**Phase 3 — Make the canvas the product (Weeks 5–6):** §4 auto-layout, manual editing with two-way sync, undo/redo, export. *Exit: a user can build a design by hand, get challenged on it, and share a PNG.*

**Phase 4 — Charge money (Weeks 7–8):** §6 MoR integration, entitlements, usage ledger, pricing page, three instrumented paywall moments. *Exit: a stranger can pay you and abuse is bounded.*

**Continuous:** design refresh (§5 — tokens first, landing next, canvas skin during Phase 3), session persistence (§2, during Phase 1–2), analytics events from day one.

**Launch checklist:** domain + SSL; privacy policy & ToS (MoR requires them; you process CVs = personal data — include export/delete); support email; status page; backups verified (Supabase PITR); load test the WS path; secrets rotated; `.env.example` accurate.

---

*The one-line strategy: lock down the server, split prose from graph mutations so the AI stops hallucinating, make the canvas bidirectional so it becomes the interview itself, then charge $15/month behind server-side entitlements — in that order, because each phase is the foundation of the next.*
