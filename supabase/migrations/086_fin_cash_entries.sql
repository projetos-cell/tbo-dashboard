-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 086 — fin_cash_entries
-- Manual cash balance log for the Founder Dashboard "Caixa Real" feature.
-- Allows the team to record the actual consolidated bank balance at any point
-- in time, independently of the Omie sync (which may lag or differ).
--
-- NOTE: Renumbered from 070 (duplicate prefix with 070_cultura_enterprise).
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

-- Tenant finance admins can read their own entries
DROP POLICY IF EXISTS "fin_cash_entries_select" ON public.fin_cash_entries;
CREATE POLICY "fin_cash_entries_select"
  ON public.fin_cash_entries
  FOR SELECT
  USING (is_finance_admin(tenant_id));

-- Tenant finance admins can insert entries
DROP POLICY IF EXISTS "fin_cash_entries_insert" ON public.fin_cash_entries;
CREATE POLICY "fin_cash_entries_insert"
  ON public.fin_cash_entries
  FOR INSERT
  WITH CHECK (is_finance_admin(tenant_id));

-- Only allow update/delete by service role (no user edits — immutable log)
-- Service role bypasses RLS by default, so no explicit policy needed.

-- ── Comment ───────────────────────────────────────────────────────────────────

COMMENT ON TABLE public.fin_cash_entries IS
  'Immutable log of manually-entered consolidated cash balances for the Founder Dashboard. '
  'The most recent row (by recorded_at) is used as the effective caixa when displaying '
  'Caixa Atual, Runway, and Caixa Previsto (30d) KPIs.';
