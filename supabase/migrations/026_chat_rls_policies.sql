-- ============================================================================
-- 026: Enable RLS + Full Policy Set on Chat Tables
-- Tables: chat_channels, chat_messages, chat_channel_members,
--         chat_channel_sections, chat_reactions, chat_attachments
-- ============================================================================

-- ── 1. Enable RLS on all chat tables ──────────────────────────────────────

ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;

-- chat_messages already has RLS enabled (from consolidated schema),
-- but only has a SELECT policy. We add INSERT/UPDATE/DELETE below.

-- ── 2. Helper: check if user is member of a channel ───────────────────────

CREATE OR REPLACE FUNCTION is_channel_member(p_channel_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM chat_channel_members
    WHERE channel_id = p_channel_id
      AND user_id = p_user_id
  );
$$;

-- ── 3. chat_channels ─────────────────────────────────────────────────────

-- SELECT: user can see channels they are a member of
CREATE POLICY channels_select ON chat_channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_channel_members
      WHERE chat_channel_members.channel_id = chat_channels.id
        AND chat_channel_members.user_id = auth.uid()
    )
  );

-- INSERT: authenticated users with matching tenant
CREATE POLICY channels_insert ON chat_channels
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND tenant_id IN (SELECT unnest(get_user_tenant_ids()))
  );

-- UPDATE: only channel creator or chat_channel_members with role 'admin'
CREATE POLICY channels_update ON chat_channels
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM chat_channel_members
      WHERE chat_channel_members.channel_id = chat_channels.id
        AND chat_channel_members.user_id = auth.uid()
        AND chat_channel_members.role = 'admin'
    )
  );

-- DELETE: only channel creator (archive preferred, but protect anyway)
CREATE POLICY channels_delete ON chat_channels
  FOR DELETE USING (
    created_by = auth.uid()
  );

-- ── 4. chat_channel_members ──────────────────────────────────────────────

-- SELECT: members can see other members in their channels
CREATE POLICY members_select ON chat_channel_members
  FOR SELECT USING (
    is_channel_member(channel_id, auth.uid())
  );

-- INSERT: channel admins/creators can add members, or user can join public channels
CREATE POLICY members_insert ON chat_channel_members
  FOR INSERT WITH CHECK (
    -- Self-join (for public channels or when invited)
    user_id = auth.uid()
    -- OR admin/creator adding others
    OR EXISTS (
      SELECT 1 FROM chat_channel_members cm
      WHERE cm.channel_id = chat_channel_members.channel_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM chat_channels ch
      WHERE ch.id = chat_channel_members.channel_id
        AND ch.created_by = auth.uid()
    )
  );

-- UPDATE: user can update own membership (e.g., last_read_at, muted)
-- or channel admin can update roles
CREATE POLICY members_update ON chat_channel_members
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM chat_channel_members cm
      WHERE cm.channel_id = chat_channel_members.channel_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
  );

-- DELETE: user can leave (remove self) or admin can remove others
CREATE POLICY members_delete ON chat_channel_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM chat_channel_members cm
      WHERE cm.channel_id = chat_channel_members.channel_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM chat_channels ch
      WHERE ch.id = chat_channel_members.channel_id
        AND ch.created_by = auth.uid()
    )
  );

-- ── 5. chat_messages (add INSERT/UPDATE/DELETE — SELECT already exists) ──

-- INSERT: only channel members can send messages
CREATE POLICY msg_insert ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND is_channel_member(channel_id, auth.uid())
  );

-- UPDATE: only the sender can edit their own message
CREATE POLICY msg_update ON chat_messages
  FOR UPDATE USING (
    sender_id = auth.uid()
  );

-- DELETE: sender can delete own, or channel admin/creator
CREATE POLICY msg_delete ON chat_messages
  FOR DELETE USING (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM chat_channel_members cm
      WHERE cm.channel_id = chat_messages.channel_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
  );

-- ── 6. chat_channel_sections ─────────────────────────────────────────────

-- SELECT: tenant isolation
CREATE POLICY sections_select ON chat_channel_sections
  FOR SELECT USING (
    tenant_id IN (SELECT unnest(get_user_tenant_ids()))
  );

-- INSERT: authenticated + tenant match
CREATE POLICY sections_insert ON chat_channel_sections
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND tenant_id IN (SELECT unnest(get_user_tenant_ids()))
  );

-- UPDATE: creator or tenant member
CREATE POLICY sections_update ON chat_channel_sections
  FOR UPDATE USING (
    created_by = auth.uid()
    OR tenant_id IN (SELECT unnest(get_user_tenant_ids()))
  );

-- DELETE: creator only
CREATE POLICY sections_delete ON chat_channel_sections
  FOR DELETE USING (
    created_by = auth.uid()
  );

-- ── 7. chat_reactions ────────────────────────────────────────────────────

-- SELECT: channel members can see reactions on messages in their channels
CREATE POLICY reactions_select ON chat_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_messages m
      JOIN chat_channel_members cm ON cm.channel_id = m.channel_id
      WHERE m.id = chat_reactions.message_id
        AND cm.user_id = auth.uid()
    )
  );

-- INSERT: user can add their own reaction if they are a channel member
CREATE POLICY reactions_insert ON chat_reactions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_messages m
      JOIN chat_channel_members cm ON cm.channel_id = m.channel_id
      WHERE m.id = chat_reactions.message_id
        AND cm.user_id = auth.uid()
    )
  );

-- DELETE: user can remove their own reactions
CREATE POLICY reactions_delete ON chat_reactions
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- ── 8. chat_attachments ──────────────────────────────────────────────────

-- SELECT: channel members can see attachments on messages in their channels
CREATE POLICY attachments_select ON chat_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_messages m
      JOIN chat_channel_members cm ON cm.channel_id = m.channel_id
      WHERE m.id = chat_attachments.message_id
        AND cm.user_id = auth.uid()
    )
  );

-- INSERT: channel members can add attachments to their own messages
CREATE POLICY attachments_insert ON chat_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_messages m
      WHERE m.id = chat_attachments.message_id
        AND m.sender_id = auth.uid()
    )
  );

-- DELETE: attachment owner (via message sender) can delete
CREATE POLICY attachments_delete ON chat_attachments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chat_messages m
      WHERE m.id = chat_attachments.message_id
        AND m.sender_id = auth.uid()
    )
  );
