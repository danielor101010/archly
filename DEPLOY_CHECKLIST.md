# Deploy Checklist — do before pushing Phase 1

> Phase 1 (security) is committed on local `main` (5 commits ahead of origin, **not pushed**).
> The hardened server now refuses to boot without valid config, so do these first.
> Pushing `main` triggers your Vercel deploy — do it LAST, after 1–4 below.

## 1. DeepSeek — fund with a small prepaid balance (do this first)
- [ ] Create a DeepSeek API key and top up a SMALL prepaid balance.
      DeepSeek is prepaid, so the balance itself is your hard spend ceiling — the
      app's own MAX_DAILY_COST_USD breaker sits on top of it.

## 2. Server environment variables (on your server host)
Required — the server exits at boot if any are missing or insecure:
- [ ] `JWT_SECRET` = a fresh strong secret. Generate with: `openssl rand -base64 48`
      (must NOT be the old `dev-secret-change-in-prod`)
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `CLIENT_URL` = your exact production client origin (used for strict CORS)
- [ ] `DEEPSEEK_API_KEY` = your DeepSeek key (powers all AI). Defaults use
      `LLM_BASE_URL=https://api.deepseek.com` and `LLM_MODEL=deepseek-chat` —
      only set those to switch providers. (`OPENROUTER_API_KEY` still works as a fallback.)
- [ ] `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` (email)

Optional (sane defaults exist — see `server/.env.example`):
- [ ] `MAX_DAILY_COST_USD` (default 5) — global daily LLM spend cap
- [ ] `LLM_RATE_LIMIT_PER_MIN` (15), `AUTH_RATE_LIMIT_PER_MIN` (10),
      `WS_CONNECT_RATE_LIMIT_PER_MIN` (30), `SESSION_TTL_HOURS` (2)

## 3. Client environment variables (Vercel)
- [ ] `VITE_API_URL` = your production server URL
- [ ] `VITE_WS_URL` = your production WebSocket URL (wss://…)

## 4. Supabase migration
- [ ] Apply `server/migrations/001_usage_ledger.sql` in the Supabase SQL editor
      (creates `usage_ledger` + `subscriptions`; ledger writes are best-effort until then)

## 5. Review + deploy
- [ ] Review the Phase 1 diff: `git log origin/main..main` and `git diff origin/main..main`
- [ ] Push: `git push origin main` (this deploys)
- [ ] Smoke-test prod: sign in works; an unauthenticated API call returns 401; a session runs end-to-end

---
*Full context: PRODUCTION_PLAN.md (§1–§2). The LLM client is now lazy-initialized, so a
missing AI key degrades AI features instead of crashing boot.*
