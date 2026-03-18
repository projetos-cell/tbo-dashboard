-- ── finance_reconciliation_log ────────────────────────────────────────────────
-- Audit trail para todas as conciliações bancárias (auto, manual, rule-based)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.finance_reconciliation_log (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  bank_tx_id      uuid not null,
  finance_tx_id   uuid not null,
  reconciled_by   uuid references auth.users(id) on delete set null,
  method          text not null check (method in ('auto', 'manual', 'rule')),
  score           numeric(5, 2),           -- confidence score (0-100), null for manual
  reversed_at     timestamptz,             -- set when reconciliation is undone
  reversed_by     uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

-- Indices for common query patterns
create index if not exists finance_reconciliation_log_tenant_idx
  on public.finance_reconciliation_log (tenant_id);

create index if not exists finance_reconciliation_log_bank_tx_idx
  on public.finance_reconciliation_log (bank_tx_id);

create index if not exists finance_reconciliation_log_finance_tx_idx
  on public.finance_reconciliation_log (finance_tx_id);

create index if not exists finance_reconciliation_log_created_idx
  on public.finance_reconciliation_log (created_at desc);

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public.finance_reconciliation_log enable row level security;

-- Tenant members can view logs for their tenant
create policy "tenant members can view reconciliation logs"
  on public.finance_reconciliation_log
  for select
  using (
    tenant_id in (
      select tenant_id
      from public.tenant_members
      where user_id = auth.uid()
    )
  );

-- Tenant members can insert logs (engine or user-triggered)
create policy "tenant members can insert reconciliation logs"
  on public.finance_reconciliation_log
  for insert
  with check (
    tenant_id in (
      select tenant_id
      from public.tenant_members
      where user_id = auth.uid()
    )
  );

-- Tenant members can update logs (e.g. mark as reversed)
create policy "tenant members can update reconciliation logs"
  on public.finance_reconciliation_log
  for update
  using (
    tenant_id in (
      select tenant_id
      from public.tenant_members
      where user_id = auth.uid()
    )
  );

-- No delete: audit logs are immutable
