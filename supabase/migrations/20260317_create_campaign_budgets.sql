-- ============================================================
-- TBO OS — campaign_budgets table + RLS
-- Feature #84 — Migration: campaign budget line items
-- ============================================================

CREATE TABLE IF NOT EXISTS public.campaign_budgets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  description TEXT,
  planned     NUMERIC(14,2) NOT NULL DEFAULT 0,
  actual      NUMERIC(14,2) NOT NULL DEFAULT 0,
  vendor      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_campaign_budgets_tenant   ON public.campaign_budgets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_budgets_campaign ON public.campaign_budgets(campaign_id);

-- Trigger: sync campaign.spent on budget change
CREATE OR REPLACE FUNCTION public.sync_campaign_spent()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.marketing_campaigns
  SET spent = (
    SELECT COALESCE(SUM(actual), 0)
    FROM public.campaign_budgets
    WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.campaign_id, OLD.campaign_id);

  -- Also update updated_at on current row (if UPDATE)
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS campaign_budgets_sync_spent ON public.campaign_budgets;
CREATE TRIGGER campaign_budgets_sync_spent
  AFTER INSERT OR UPDATE OR DELETE ON public.campaign_budgets
  FOR EACH ROW EXECUTE FUNCTION public.sync_campaign_spent();

-- RLS
ALTER TABLE public.campaign_budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaign_budgets_select" ON public.campaign_budgets;
CREATE POLICY "campaign_budgets_select" ON public.campaign_budgets
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "campaign_budgets_insert" ON public.campaign_budgets;
CREATE POLICY "campaign_budgets_insert" ON public.campaign_budgets
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "campaign_budgets_update" ON public.campaign_budgets;
CREATE POLICY "campaign_budgets_update" ON public.campaign_budgets
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "campaign_budgets_delete" ON public.campaign_budgets;
CREATE POLICY "campaign_budgets_delete" ON public.campaign_budgets
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
