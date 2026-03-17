-- ============================================================
-- TBO OS — marketing_campaigns table + RLS
-- Feature #81 — Migration: marketing module campaigns
-- ============================================================

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'planejamento'
                CHECK (status IN (
                  'planejamento','briefing','em_producao',
                  'ativa','pausada','finalizada','cancelada'
                )),
  start_date    DATE,
  end_date      DATE,
  budget        NUMERIC(14,2),
  spent         NUMERIC(14,2) DEFAULT 0,
  owner_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  channels      TEXT[] NOT NULL DEFAULT '{}',
  tags          TEXT[] NOT NULL DEFAULT '{}',
  is_favorited  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_mktg_campaigns_tenant   ON public.marketing_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mktg_campaigns_status   ON public.marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_mktg_campaigns_owner    ON public.marketing_campaigns(owner_id);
CREATE INDEX IF NOT EXISTS idx_mktg_campaigns_dates    ON public.marketing_campaigns(start_date, end_date);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_marketing_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS marketing_campaigns_updated_at ON public.marketing_campaigns;
CREATE TRIGGER marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_marketing_campaigns_updated_at();

-- RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mktg_campaigns_select" ON public.marketing_campaigns;
CREATE POLICY "mktg_campaigns_select" ON public.marketing_campaigns
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "mktg_campaigns_insert" ON public.marketing_campaigns;
CREATE POLICY "mktg_campaigns_insert" ON public.marketing_campaigns
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "mktg_campaigns_update" ON public.marketing_campaigns;
CREATE POLICY "mktg_campaigns_update" ON public.marketing_campaigns
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "mktg_campaigns_delete" ON public.marketing_campaigns;
CREATE POLICY "mktg_campaigns_delete" ON public.marketing_campaigns
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
