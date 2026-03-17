-- ============================================================
-- TBO OS — email_sends table + RLS
-- Feature #87 — Migration: email send history with metrics
-- ============================================================

CREATE TYPE IF NOT EXISTS public.email_send_status AS ENUM (
  'queued', 'sending', 'completed', 'failed'
);

CREATE TABLE IF NOT EXISTS public.email_sends (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id      UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  recipient_count  INT NOT NULL DEFAULT 0,
  delivered        INT NOT NULL DEFAULT 0,
  opened           INT NOT NULL DEFAULT 0,
  clicked          INT NOT NULL DEFAULT 0,
  bounced          INT NOT NULL DEFAULT 0,
  unsubscribed     INT NOT NULL DEFAULT 0,
  status           public.email_send_status NOT NULL DEFAULT 'queued',
  sent_at          TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Derived metrics stored for fast querying
  open_rate        NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN delivered > 0 THEN ROUND((opened::NUMERIC / delivered) * 100, 2) ELSE 0 END
  ) STORED,
  click_rate       NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN delivered > 0 THEN ROUND((clicked::NUMERIC / delivered) * 100, 2) ELSE 0 END
  ) STORED,
  bounce_rate      NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN recipient_count > 0 THEN ROUND((bounced::NUMERIC / recipient_count) * 100, 2) ELSE 0 END
  ) STORED
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_email_sends_tenant   ON public.email_sends(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_campaign ON public.email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_status   ON public.email_sends(status);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_email_sends_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS email_sends_updated_at ON public.email_sends;
CREATE TRIGGER email_sends_updated_at
  BEFORE UPDATE ON public.email_sends
  FOR EACH ROW EXECUTE FUNCTION public.set_email_sends_updated_at();

-- RLS
ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_sends_select" ON public.email_sends;
CREATE POLICY "email_sends_select" ON public.email_sends
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "email_sends_insert" ON public.email_sends;
CREATE POLICY "email_sends_insert" ON public.email_sends
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "email_sends_update" ON public.email_sends;
CREATE POLICY "email_sends_update" ON public.email_sends
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "email_sends_delete" ON public.email_sends;
CREATE POLICY "email_sends_delete" ON public.email_sends
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
