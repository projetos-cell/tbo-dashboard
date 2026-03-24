-- ============================================================
-- TBO OS — blog_posts table + RLS
-- CMS de Blog interno
-- ============================================================

-- Status enum
DO $$ BEGIN
  CREATE TYPE public.blog_post_status AS ENUM (
    'rascunho', 'revisao', 'publicado', 'arquivado'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Main table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL,
  excerpt       TEXT,
  body          TEXT NOT NULL DEFAULT '',
  cover_url     TEXT,
  status        public.blog_post_status NOT NULL DEFAULT 'rascunho',
  author_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  published_at  TIMESTAMPTZ,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_blog_posts_tenant     ON public.blog_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status     ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author     ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published  ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug       ON public.blog_posts(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags       ON public.blog_posts USING GIN(tags);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_blog_posts_updated_at();

-- RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_posts_select" ON public.blog_posts;
CREATE POLICY "blog_posts_select" ON public.blog_posts
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "blog_posts_insert" ON public.blog_posts;
CREATE POLICY "blog_posts_insert" ON public.blog_posts
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "blog_posts_update" ON public.blog_posts;
CREATE POLICY "blog_posts_update" ON public.blog_posts
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "blog_posts_delete" ON public.blog_posts;
CREATE POLICY "blog_posts_delete" ON public.blog_posts
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
