-- ============================================================================
-- 027: Chat RLS Hardening
-- Fixes:
--   1. channels_insert: restrict to founder/diretoria/lider roles
--   2. sections_insert/update/delete: restrict to founder/diretoria roles
--   3. msg_delete: add global role fallback (founder/diretoria can delete any)
-- ============================================================================

-- ── 1. Restrict channel creation to lider+ roles ───────────────────────────

DROP POLICY IF EXISTS channels_insert ON chat_channels;
CREATE POLICY channels_insert ON chat_channels
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND tenant_id IN (SELECT unnest(get_user_tenant_ids()))
    AND (
      is_founder_or_admin()
      OR EXISTS (
        SELECT 1 FROM tenant_members tm
        JOIN roles r ON r.id = tm.role_id
        WHERE tm.user_id = auth.uid()
          AND tm.is_active = true
          AND r.slug IN ('lider')
      )
    )
  );

-- ── 2. Restrict channel deletion to founder/diretoria ──────────────────────

DROP POLICY IF EXISTS channels_delete ON chat_channels;
CREATE POLICY channels_delete ON chat_channels
  FOR DELETE USING (
    created_by = auth.uid()
    AND is_founder_or_admin()
  );

-- ── 3. Restrict section mutation to founder/diretoria ──────────────────────

DROP POLICY IF EXISTS sections_insert ON chat_channel_sections;
CREATE POLICY sections_insert ON chat_channel_sections
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND tenant_id IN (SELECT unnest(get_user_tenant_ids()))
    AND is_founder_or_admin()
  );

DROP POLICY IF EXISTS sections_update ON chat_channel_sections;
CREATE POLICY sections_update ON chat_channel_sections
  FOR UPDATE USING (
    tenant_id IN (SELECT unnest(get_user_tenant_ids()))
    AND is_founder_or_admin()
  );

DROP POLICY IF EXISTS sections_delete ON chat_channel_sections;
CREATE POLICY sections_delete ON chat_channel_sections
  FOR DELETE USING (
    tenant_id IN (SELECT unnest(get_user_tenant_ids()))
    AND is_founder_or_admin()
  );

-- ── 4. msg_delete: add founder/diretoria global override ───────────────────

DROP POLICY IF EXISTS msg_delete ON chat_messages;
CREATE POLICY msg_delete ON chat_messages
  FOR DELETE USING (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM chat_channel_members cm
      WHERE cm.channel_id = chat_messages.channel_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
    OR is_founder_or_admin()
  );
