-- ============================================================
-- TBO OS — content_briefs table + RLS
-- Feature #89 — Migration: content briefs with approval flow
-- ============================================================

CREATE TYPE IF NOT EXISTS public.content_brief_status AS ENUM (
  'draft', 'approved', 'revision', 'cancelled'
);

CREATE TABLE IF NOT EXISTS public.content_briefs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  objective       TEXT,
  target_audience TEXT,
  key_messages    TEXT[] NOT NULL DEFAULT '{}',
  references      TEXT[] NOT NULL DEFAULT '{}',
  deliverables    TEXT[] NOT NULL DEFAULT '{}',
  deadline        TIMESTAMPTZ,
  status          public.content_brief_status NOT NULL DEFAULT 'draft',
  feedback        TEXT,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_content_briefs_tenant  ON public.content_briefs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_briefs_status  ON public.content_briefs(status);
CREATE INDEX IF NOT EXISTS idx_content_briefs_creator ON public.content_briefs(created_by);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_content_briefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS content_briefs_updated_at ON public.content_briefs;
CREATE TRIGGER content_briefs_updated_at
  BEFORE UPDATE ON public.content_briefs
  FOR EACH ROW EXECUTE FUNCTION public.set_content_briefs_updated_at();

-- Add FK from content_items to content_briefs (deferred until this table exists)
ALTER TABLE public.content_items
  ADD CONSTRAINT fk_content_items_brief
    FOREIGN KEY (brief_id) REFERENCES public.content_briefs(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE public.content_briefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_briefs_select" ON public.content_briefs;
CREATE POLICY "content_briefs_select" ON public.content_briefs
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "content_briefs_insert" ON public.content_briefs;
CREATE POLICY "content_briefs_insert" ON public.content_briefs
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "content_briefs_update" ON public.content_briefs;
CREATE POLICY "content_briefs_update" ON public.content_briefs
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "content_briefs_delete" ON public.content_briefs;
CREATE POLICY "content_briefs_delete" ON public.content_briefs
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
