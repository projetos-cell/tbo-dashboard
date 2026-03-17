-- ============================================================
-- TBO OS — content_assets table + RLS
-- Feature #90 — Migration: content assets (Supabase Storage backed)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.content_assets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  file_url     TEXT NOT NULL,
  file_type    TEXT NOT NULL,    -- MIME type (image/png, video/mp4, application/pdf, etc.)
  file_size    BIGINT NOT NULL DEFAULT 0,  -- bytes
  storage_path TEXT,             -- Supabase Storage object path for deletion
  tags         TEXT[] NOT NULL DEFAULT '{}',
  campaign_id  UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  uploaded_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  width        INT,              -- image/video dimensions (optional)
  height       INT,
  duration_ms  INT,              -- video/audio duration in milliseconds (optional)
  alt_text     TEXT,             -- accessibility
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_content_assets_tenant    ON public.content_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_campaign  ON public.content_assets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_file_type ON public.content_assets(file_type);
CREATE INDEX IF NOT EXISTS idx_content_assets_tags      ON public.content_assets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_assets_uploader  ON public.content_assets(uploaded_by);

-- RLS
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_assets_select" ON public.content_assets;
CREATE POLICY "content_assets_select" ON public.content_assets
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "content_assets_insert" ON public.content_assets;
CREATE POLICY "content_assets_insert" ON public.content_assets
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "content_assets_update" ON public.content_assets;
CREATE POLICY "content_assets_update" ON public.content_assets
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "content_assets_delete" ON public.content_assets;
CREATE POLICY "content_assets_delete" ON public.content_assets
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Storage bucket for marketing assets (run once, idempotent via DO block)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'marketing-assets',
    'marketing-assets',
    false,
    52428800,  -- 50 MB limit
    ARRAY[
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage RLS policies
DROP POLICY IF EXISTS "marketing_assets_select" ON storage.objects;
CREATE POLICY "marketing_assets_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'marketing-assets'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "marketing_assets_insert" ON storage.objects;
CREATE POLICY "marketing_assets_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'marketing-assets'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "marketing_assets_delete" ON storage.objects;
CREATE POLICY "marketing_assets_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'marketing-assets'
    AND auth.role() = 'authenticated'
  );
