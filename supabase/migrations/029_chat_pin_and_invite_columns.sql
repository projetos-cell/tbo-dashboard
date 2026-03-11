-- ============================================================================
-- 029: Add is_pinned to chat_messages + invited_by to chat_channel_members
-- ============================================================================

-- ── 1. is_pinned on chat_messages ──────────────────────────────────────────
ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- ── 2. invited_by on chat_channel_members ──────────────────────────────────
ALTER TABLE chat_channel_members
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id);
