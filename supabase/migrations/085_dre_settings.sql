-- Migration 085: DRE configurable tax rate per tenant
-- Stores the tax rate (Impostos/ISS/COFINS) percentage used in DRE calculation.

CREATE TABLE IF NOT EXISTS public.dre_settings (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id   UUID         NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tax_rate    NUMERIC(5,2) NOT NULL DEFAULT 15.0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  updated_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_by  UUID         REFERENCES auth.users(id),
  UNIQUE (tenant_id)
);

ALTER TABLE public.dre_settings ENABLE ROW LEVEL SECURITY;

-- All tenant members can read their own settings
CREATE POLICY "Tenant members can read dre_settings"
  ON public.dre_settings FOR SELECT
  USING (tenant_id = ANY(get_user_tenant_ids()));

-- All tenant members can manage (insert/update) their settings
-- (access control to diretoria role is enforced at the app layer)
CREATE POLICY "Tenant members can manage dre_settings"
  ON public.dre_settings FOR ALL
  USING (tenant_id = ANY(get_user_tenant_ids()))
  WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.update_dre_settings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER dre_settings_updated_at
  BEFORE UPDATE ON public.dre_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_dre_settings_updated_at();
