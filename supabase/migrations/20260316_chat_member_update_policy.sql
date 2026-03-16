-- ============================================================================
-- TBO OS — Migration: Allow members to update their own chat_channel_members row
-- Fixes: mark-as-read (updateLastRead) was silently blocked by missing UPDATE policy
-- ============================================================================

CREATE POLICY mem_update_own ON chat_channel_members
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
