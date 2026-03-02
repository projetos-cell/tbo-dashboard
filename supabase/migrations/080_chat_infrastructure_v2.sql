-- Migration 080: Chat Infrastructure v2
-- Fix tenant_id on chat_messages/reactions, add search, unread RPCs, channel settings
-- Executar no Supabase SQL Editor

-- ══════════════════════════════════════════════════════════════════════════
-- 1. FIX: ADD tenant_id to chat_messages (bug: service filters by it but column missing)
-- ══════════════════════════════════════════════════════════════════════════
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Backfill from parent channel
UPDATE chat_messages m
SET tenant_id = c.tenant_id
FROM chat_channels c
WHERE m.channel_id = c.id AND m.tenant_id IS NULL;

-- Enforce NOT NULL after backfill
DO $$ BEGIN
  ALTER TABLE chat_messages ALTER COLUMN tenant_id SET NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_chat_messages_tenant ON chat_messages(tenant_id);

-- ══════════════════════════════════════════════════════════════════════════
-- 2. FIX: ADD tenant_id to chat_reactions
-- ══════════════════════════════════════════════════════════════════════════
ALTER TABLE chat_reactions ADD COLUMN IF NOT EXISTS tenant_id UUID;

UPDATE chat_reactions r
SET tenant_id = c.tenant_id
FROM chat_messages m
JOIN chat_channels c ON m.channel_id = c.id
WHERE r.message_id = m.id AND r.tenant_id IS NULL;

DO $$ BEGIN
  ALTER TABLE chat_reactions ALTER COLUMN tenant_id SET NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ══════════════════════════════════════════════════════════════════════════
-- 3. Full-text search on messages (Portuguese)
-- ══════════════════════════════════════════════════════════════════════════
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('portuguese', coalesce(content, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_chat_messages_search
  ON chat_messages USING GIN(search_vector);

-- ══════════════════════════════════════════════════════════════════════════
-- 4. Channel settings (permissions per channel)
-- ══════════════════════════════════════════════════════════════════════════
-- settings JSON shape: { "who_can_post": "all"|"admins_only", "is_read_only": false }
ALTER TABLE chat_channels ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- ══════════════════════════════════════════════════════════════════════════
-- 5. Member mute preference
-- ══════════════════════════════════════════════════════════════════════════
ALTER TABLE chat_channel_members ADD COLUMN IF NOT EXISTS muted BOOLEAN DEFAULT false;

-- ══════════════════════════════════════════════════════════════════════════
-- 6. Optimized index for unread count queries
-- ══════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_created_active
  ON chat_messages(channel_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- ══════════════════════════════════════════════════════════════════════════
-- 7. Recreate msg_select RLS policy (optimized)
-- ══════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "msg_select" ON chat_messages;
CREATE POLICY "msg_select" ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_channel_members
      WHERE channel_id = chat_messages.channel_id
      AND user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- ══════════════════════════════════════════════════════════════════════════
-- 8. RPC: get_unread_counts — efficient single query for all channels
-- ══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_unread_counts(p_user_id UUID, p_tenant_id UUID)
RETURNS TABLE(channel_id UUID, unread_count BIGINT) AS $$
  SELECT
    ccm.channel_id,
    COUNT(cm.id) AS unread_count
  FROM chat_channel_members ccm
  JOIN chat_channels cc ON cc.id = ccm.channel_id
  LEFT JOIN chat_messages cm
    ON cm.channel_id = ccm.channel_id
    AND cm.created_at > COALESCE(ccm.last_read_at, '1970-01-01'::timestamptz)
    AND cm.deleted_at IS NULL
    AND cm.sender_id != p_user_id
  WHERE ccm.user_id = p_user_id
    AND cc.tenant_id = p_tenant_id
    AND cc.is_archived = false
  GROUP BY ccm.channel_id;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ══════════════════════════════════════════════════════════════════════════
-- 9. RPC: search_chat_messages — full-text search scoped to user's channels
-- ══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION search_chat_messages(
  p_tenant_id UUID,
  p_user_id UUID,
  p_query TEXT,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS SETOF chat_messages AS $$
  SELECT m.*
  FROM chat_messages m
  JOIN chat_channel_members ccm
    ON ccm.channel_id = m.channel_id AND ccm.user_id = p_user_id
  WHERE m.tenant_id = p_tenant_id
    AND m.deleted_at IS NULL
    AND m.search_vector @@ plainto_tsquery('portuguese', p_query)
  ORDER BY ts_rank(m.search_vector, plainto_tsquery('portuguese', p_query)) DESC
  LIMIT p_limit OFFSET p_offset;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ══════════════════════════════════════════════════════════════════════════
-- 10. Ensure realtime is enabled for all relevant tables
-- ══════════════════════════════════════════════════════════════════════════
-- These are idempotent (no-op if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_channel_members;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_reactions;
EXCEPTION WHEN others THEN NULL;
END $$;
