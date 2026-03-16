-- Migration: #42 — Limite de upload configurável por canal
-- Adds max_file_size_mb to chat_channels (null = use global default of 10MB)

ALTER TABLE chat_channels ADD COLUMN IF NOT EXISTS max_file_size_mb integer;

-- Constraint: between 1MB and 100MB
ALTER TABLE chat_channels ADD CONSTRAINT chat_channels_max_file_size_check
  CHECK (max_file_size_mb IS NULL OR (max_file_size_mb >= 1 AND max_file_size_mb <= 100));

-- Comment
COMMENT ON COLUMN chat_channels.max_file_size_mb IS
  'Max upload file size in MB for this channel. NULL = global default (10 MB). Range: 1-100.';
