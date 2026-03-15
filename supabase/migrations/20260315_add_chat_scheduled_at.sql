-- Add scheduled_at to chat_messages for scheduled message delivery
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

-- Index for efficient lookup of pending scheduled messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_scheduled_at
  ON chat_messages (channel_id, sender_id, scheduled_at)
  WHERE scheduled_at IS NOT NULL AND deleted_at IS NULL;

COMMENT ON COLUMN chat_messages.scheduled_at IS
  'When set, message is scheduled for future delivery. Not shown in regular message list until dispatched.';
