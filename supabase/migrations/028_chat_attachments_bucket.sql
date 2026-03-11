-- ============================================================================
-- 028: Chat Attachments Storage Bucket + Policies
-- Creates the 'chat-attachments' bucket and restricts access to
-- authenticated users within the same tenant.
-- ============================================================================

-- ── 1. Create the storage bucket ─────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  true,           -- public URLs (access controlled by RLS on who can upload)
  10485760,       -- 10 MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Storage policies ──────────────────────────────────────────────────────

-- INSERT: authenticated users can upload to their tenant's folder
CREATE POLICY chat_attachments_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-attachments'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] IN (
      SELECT unnest(get_user_tenant_ids())::text
    )
  );

-- SELECT: authenticated users can read files from their tenant
CREATE POLICY chat_attachments_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-attachments'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] IN (
      SELECT unnest(get_user_tenant_ids())::text
    )
  );

-- DELETE: only founder/diretoria or the file uploader
CREATE POLICY chat_attachments_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'chat-attachments'
    AND auth.uid() IS NOT NULL
    AND (
      owner = auth.uid()
      OR is_founder_or_admin()
    )
  );
