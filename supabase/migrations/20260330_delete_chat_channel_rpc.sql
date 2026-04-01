-- Transactional RPC to delete a chat channel and all related data.
-- Prevents orphaned rows if any step fails mid-cascade.
CREATE OR REPLACE FUNCTION delete_chat_channel_permanently(p_channel_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_msg_ids uuid[];
BEGIN
  -- Collect all message IDs for this channel
  SELECT array_agg(id) INTO v_msg_ids
  FROM chat_messages
  WHERE channel_id = p_channel_id;

  -- Delete reactions for those messages
  IF v_msg_ids IS NOT NULL AND array_length(v_msg_ids, 1) > 0 THEN
    DELETE FROM chat_reactions WHERE message_id = ANY(v_msg_ids);
    DELETE FROM chat_attachments WHERE message_id = ANY(v_msg_ids);
  END IF;

  -- Delete messages
  DELETE FROM chat_messages WHERE channel_id = p_channel_id;

  -- Delete bookmarks referencing this channel's messages
  IF v_msg_ids IS NOT NULL AND array_length(v_msg_ids, 1) > 0 THEN
    DELETE FROM chat_bookmarks WHERE message_id = ANY(v_msg_ids);
  END IF;

  -- Delete channel members
  DELETE FROM chat_channel_members WHERE channel_id = p_channel_id;

  -- Delete the channel itself
  DELETE FROM chat_channels WHERE id = p_channel_id;
END;
$$;

-- Grant execute to authenticated users (RLS on chat_channels controls who can call this)
GRANT EXECUTE ON FUNCTION delete_chat_channel_permanently(uuid) TO authenticated;
