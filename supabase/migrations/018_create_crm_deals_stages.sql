-- ============================================================================
-- 018 · CRM Deals & Stages
-- Tabelas core do módulo Comercial (pipeline kanban)
-- ============================================================================

-- ── crm_stages ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.crm_stages (
  id         text        PRIMARY KEY,
  label      text        NOT NULL,
  sort_order integer     NOT NULL DEFAULT 0,
  color      text,
  bg         text,
  tenant_id  uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_crm_stages_tenant ON public.crm_stages(tenant_id);

ALTER TABLE public.crm_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_stages_tenant_read"
  ON public.crm_stages FOR SELECT
  USING (tenant_id = ANY (public.get_user_tenant_ids()));

CREATE POLICY "crm_stages_tenant_write"
  ON public.crm_stages FOR ALL
  USING (tenant_id = ANY (public.get_user_tenant_ids()))
  WITH CHECK (tenant_id = ANY (public.get_user_tenant_ids()));

-- ── crm_deals ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.crm_deals (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name           text        NOT NULL,
  company        text,
  contact        text,
  contact_email  text,
  stage          text        NOT NULL DEFAULT 'lead',
  value          numeric,
  probability    numeric,
  owner_id       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_name     text,
  source         text        DEFAULT 'manual',
  rd_deal_id     text,
  expected_close date,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Indexes para queries frequentes
CREATE INDEX idx_crm_deals_tenant       ON public.crm_deals(tenant_id);
CREATE INDEX idx_crm_deals_stage        ON public.crm_deals(tenant_id, stage);
CREATE INDEX idx_crm_deals_rd_deal_id   ON public.crm_deals(tenant_id, rd_deal_id);
CREATE INDEX idx_crm_deals_owner        ON public.crm_deals(tenant_id, owner_id);
CREATE INDEX idx_crm_deals_source       ON public.crm_deals(tenant_id, source);

ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_deals_tenant_read"
  ON public.crm_deals FOR SELECT
  USING (tenant_id = ANY (public.get_user_tenant_ids()));

CREATE POLICY "crm_deals_tenant_write"
  ON public.crm_deals FOR ALL
  USING (tenant_id = ANY (public.get_user_tenant_ids()))
  WITH CHECK (tenant_id = ANY (public.get_user_tenant_ids()));

-- ── Trigger updated_at ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.trg_crm_deals_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_crm_deals_updated_at
  BEFORE UPDATE ON public.crm_deals
  FOR EACH ROW EXECUTE FUNCTION public.trg_crm_deals_updated_at();
