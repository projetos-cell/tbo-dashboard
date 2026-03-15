-- #29 — Canal read-only / Announcement mode
-- Adds a JSONB settings column to chat_channels to store per-channel configurations
-- such as is_read_only and who_can_post.

ALTER TABLE chat_channels
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

COMMENT ON COLUMN chat_channels.settings IS
  'Per-channel settings: { is_read_only?: boolean, who_can_post?: "everyone" | "admins" }';
