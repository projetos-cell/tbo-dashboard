-- Add appearance preferences JSON column to profiles
-- Stores: theme, ui_density
-- Avoids localStorage as source of truth (CLAUDE.md requirement)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::jsonb;

-- No RLS policy needed — profiles already has user-level RLS policies
-- The preferences field is written/read through existing profile UPDATE policies
