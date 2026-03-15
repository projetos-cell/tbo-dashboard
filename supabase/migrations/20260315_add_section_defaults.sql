-- A02: Add default fields to os_sections
-- When a task is moved to a section, these defaults can be auto-applied.

ALTER TABLE os_sections
  ADD COLUMN IF NOT EXISTS default_status TEXT,
  ADD COLUMN IF NOT EXISTS default_priority TEXT,
  ADD COLUMN IF NOT EXISTS default_assignee_id UUID;
