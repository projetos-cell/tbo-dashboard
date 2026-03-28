-- ============================================================
-- TBO OS — Fix marketing-assets bucket: public + RLS policies
-- Bug: blog cover upload failing with 400 because:
--   1. Bucket was private but code uses getPublicUrl()
--   2. Storage policies were anon-only, blocking authenticated users
-- ============================================================

-- 1. Make bucket public (covers are public content)
UPDATE storage.buckets
SET public = true
WHERE id = 'marketing-assets';

-- 2. Drop broken anon-only policies
DROP POLICY IF EXISTS "temp_anon_insert_marketing_assets" ON storage.objects;
DROP POLICY IF EXISTS "temp_anon_select_marketing_assets" ON storage.objects;

-- 3. Recreate with proper authenticated role
CREATE POLICY "marketing_assets_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'marketing-assets');

CREATE POLICY "marketing_assets_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'marketing-assets');

CREATE POLICY "marketing_assets_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'marketing-assets');

CREATE POLICY "marketing_assets_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'marketing-assets');
