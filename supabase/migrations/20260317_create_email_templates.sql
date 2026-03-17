-- ============================================================
-- TBO OS — email_templates table + RLS
-- Feature #85 — Migration: email studio templates
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  subject       TEXT NOT NULL DEFAULT '',
  html_content  TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT,
  category      TEXT,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_email_templates_tenant   ON public.email_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_tags     ON public.email_templates USING GIN(tags);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS email_templates_updated_at ON public.email_templates;
CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_email_templates_updated_at();

-- RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_templates_select" ON public.email_templates;
CREATE POLICY "email_templates_select" ON public.email_templates
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "email_templates_insert" ON public.email_templates;
CREATE POLICY "email_templates_insert" ON public.email_templates
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "email_templates_update" ON public.email_templates;
CREATE POLICY "email_templates_update" ON public.email_templates
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "email_templates_delete" ON public.email_templates;
CREATE POLICY "email_templates_delete" ON public.email_templates
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
