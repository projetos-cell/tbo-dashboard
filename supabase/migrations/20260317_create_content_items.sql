-- ============================================================
-- TBO OS — content_items table + RLS
-- Feature #88 — Migration: marketing content items
-- ============================================================

CREATE TYPE IF NOT EXISTS public.content_type AS ENUM (
  'post_social', 'blog', 'video', 'email', 'stories',
  'reels', 'carrossel', 'infografico', 'ebook', 'outro'
);

CREATE TYPE IF NOT EXISTS public.content_status AS ENUM (
  'ideia', 'briefing', 'em_producao', 'revisao',
  'aprovado', 'agendado', 'publicado', 'arquivado'
);

CREATE TABLE IF NOT EXISTS public.content_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  type           public.content_type NOT NULL DEFAULT 'outro',
  status         public.content_status NOT NULL DEFAULT 'ideia',
  channel        TEXT,
  scheduled_date TIMESTAMPTZ,
  published_date TIMESTAMPTZ,
  author_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  brief_id       UUID,   -- FK added after content_briefs is created
  campaign_id    UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  tags           TEXT[] NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_content_items_tenant     ON public.content_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_items_status     ON public.content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_type       ON public.content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_campaign   ON public.content_items(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_items_scheduled  ON public.content_items(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_items_tags       ON public.content_items USING GIN(tags);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_content_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS content_items_updated_at ON public.content_items;
CREATE TRIGGER content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.set_content_items_updated_at();

-- RLS
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_items_select" ON public.content_items;
CREATE POLICY "content_items_select" ON public.content_items
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "content_items_insert" ON public.content_items;
CREATE POLICY "content_items_insert" ON public.content_items
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "content_items_update" ON public.content_items;
CREATE POLICY "content_items_update" ON public.content_items
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "content_items_delete" ON public.content_items;
CREATE POLICY "content_items_delete" ON public.content_items
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Add FK to campaign_pieces for bidirectional relation (feature #67)
ALTER TABLE public.campaign_pieces
  ADD COLUMN IF NOT EXISTS content_item_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL;
