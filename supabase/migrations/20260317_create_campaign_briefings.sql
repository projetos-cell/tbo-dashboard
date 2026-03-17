-- ============================================================
-- TBO OS — campaign_briefings table + RLS
-- Feature #82 — Migration: campaign briefings
-- ============================================================

CREATE TABLE IF NOT EXISTS public.campaign_briefings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id     UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  objective       TEXT,
  target_audience TEXT,
  key_messages    TEXT[] NOT NULL DEFAULT '{}',
  deliverables    TEXT[] NOT NULL DEFAULT '{}',
  references      TEXT[] NOT NULL DEFAULT '{}',
  approved_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at     TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','pending_approval','approved','revision')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(campaign_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_campaign_briefings_tenant   ON public.campaign_briefings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_briefings_campaign ON public.campaign_briefings(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_briefings_status   ON public.campaign_briefings(status);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_campaign_briefings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS campaign_briefings_updated_at ON public.campaign_briefings;
CREATE TRIGGER campaign_briefings_updated_at
  BEFORE UPDATE ON public.campaign_briefings
  FOR EACH ROW EXECUTE FUNCTION public.set_campaign_briefings_updated_at();

-- RLS
ALTER TABLE public.campaign_briefings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaign_briefings_select" ON public.campaign_briefings;
CREATE POLICY "campaign_briefings_select" ON public.campaign_briefings
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "campaign_briefings_insert" ON public.campaign_briefings;
CREATE POLICY "campaign_briefings_insert" ON public.campaign_briefings
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "campaign_briefings_update" ON public.campaign_briefings;
CREATE POLICY "campaign_briefings_update" ON public.campaign_briefings
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "campaign_briefings_delete" ON public.campaign_briefings;
CREATE POLICY "campaign_briefings_delete" ON public.campaign_briefings
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
