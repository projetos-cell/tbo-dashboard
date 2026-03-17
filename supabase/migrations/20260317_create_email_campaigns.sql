-- ============================================================
-- TBO OS — email_campaigns table + RLS
-- Feature #86 — Migration: email studio campaigns
-- ============================================================

CREATE TYPE IF NOT EXISTS public.email_campaign_status AS ENUM (
  'draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'
);

CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  subject      TEXT NOT NULL DEFAULT '',
  template_id  UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  status       public.email_campaign_status NOT NULL DEFAULT 'draft',
  list_id      TEXT,
  list_name    TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at      TIMESTAMPTZ,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_email_campaigns_tenant   ON public.email_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status   ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_template ON public.email_campaigns(template_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_email_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS email_campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_email_campaigns_updated_at();

-- RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_campaigns_select" ON public.email_campaigns;
CREATE POLICY "email_campaigns_select" ON public.email_campaigns
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "email_campaigns_insert" ON public.email_campaigns;
CREATE POLICY "email_campaigns_insert" ON public.email_campaigns
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "email_campaigns_update" ON public.email_campaigns;
CREATE POLICY "email_campaigns_update" ON public.email_campaigns
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "email_campaigns_delete" ON public.email_campaigns;
CREATE POLICY "email_campaigns_delete" ON public.email_campaigns
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
