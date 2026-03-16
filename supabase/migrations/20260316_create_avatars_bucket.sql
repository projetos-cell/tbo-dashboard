-- ============================================================================
-- TBO OS — Migration: Create avatars storage bucket + RLS policies
-- Required for onboarding avatar upload and profile photos
-- ============================================================================

-- Create the bucket (public, 5MB limit, image types only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload their own avatars
CREATE POLICY "avatars_insert_own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: anyone can read avatars (public bucket)
CREATE POLICY "avatars_select_public"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

-- RLS: users can update/overwrite their own avatars
CREATE POLICY "avatars_update_own"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: users can delete their own avatars; founder/diretoria can delete any
CREATE POLICY "avatars_delete_own_or_admin"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('founder', 'diretoria')
  )
);
