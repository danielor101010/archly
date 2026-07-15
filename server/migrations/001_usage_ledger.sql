-- 001_usage_ledger.sql
-- Per-user/per-day usage accounting + subscription stub.
-- The application boots and runs WITHOUT this migration applied (ledger writes are
-- best-effort and swallow errors). Apply it to enable durable usage tracking.

create table if not exists usage_ledger (
  user_id          text        not null,
  day              date        not null,
  sessions_started integer     not null default 0,
  tokens_in        integer     not null default 0,
  tokens_out       integer     not null default 0,
  cost_cents       integer     not null default 0,
  updated_at       timestamptz not null default now(),
  primary key (user_id, day)
);

create index if not exists usage_ledger_day_idx on usage_ledger (day);

-- Subscription stub — populated later by the billing integration.
create table if not exists subscriptions (
  user_id             text        primary key,
  plan                text        not null default 'free',
  status              text        not null default 'inactive',
  provider_customer_id text,
  current_period_end  timestamptz
);
