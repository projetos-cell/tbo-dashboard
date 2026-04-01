-- Add density preference to user_table_preferences
-- Supports compact / normal / expanded row density per table
ALTER TABLE user_table_preferences
  ADD COLUMN IF NOT EXISTS density TEXT
    NOT NULL DEFAULT 'normal'
    CHECK (density IN ('compact', 'normal', 'expanded'));
