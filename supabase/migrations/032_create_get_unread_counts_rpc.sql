-- Migration: create get_unread_counts RPC
-- Needed by frontend/features/chat/hooks/use-chat.ts → useUnreadCounts()

DROP FUNCTION IF EXISTS get_unread_counts(UUID, UUID);

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

GRANT EXECUTE ON FUNCTION get_unread_counts(UUID, UUID) TO authenticated;
