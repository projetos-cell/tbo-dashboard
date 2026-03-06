-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 070 — fin_cash_entries
-- Manual cash balance log for the Founder Dashboard "Caixa Real" feature.
-- Allows the team to record the actual consolidated bank balance at any point
-- in time, independently of the Omie sync (which may lag or differ).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Table ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.fin_cash_entries (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  amount       numeric     NOT NULL,                    -- absolute balance in BRL
  note         text,                                    -- optional observation
  recorded_at  timestamptz NOT NULL DEFAULT now(),      -- when the balance was observed
  created_at   timestamptz NOT NULL DEFAULT now()       -- row insertion timestamp
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS fin_cash_entries_tenant_recorded_idx
  ON public.fin_cash_entries (tenant_id, recorded_at DESC);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.fin_cash_entries ENABLE ROW LEVEL SECURITY;

-- Tenant members can read their own entries
CREATE POLICY "fin_cash_entries_select"
  ON public.fin_cash_entries
  FOR SELECT
  USING (tenant_id = ANY(get_user_tenant_ids()));

-- Tenant members can insert entries (any diretoria/admin/etc. can log a balance)
CREATE POLICY "fin_cash_entries_insert"
  ON public.fin_cash_entries
  FOR INSERT
  WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

-- Only allow update/delete by service role (no user edits — immutable log)
-- Service role bypasses RLS by default, so no explicit policy needed.

-- ── Comment ───────────────────────────────────────────────────────────────────

COMMENT ON TABLE public.fin_cash_entries IS
  'Immutable log of manually-entered consolidated cash balances for the Founder Dashboard. '
  'The most recent row (by recorded_at) is used as the effective caixa when displaying '
  'Caixa Atual, Runway, and Caixa Previsto (30d) KPIs.';
