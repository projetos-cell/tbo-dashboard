-- Add columns preference to my_tasks_preferences
-- Schema: [{ id: string, visible: boolean, width: number }]
-- Empty array = use defaults
ALTER TABLE my_tasks_preferences
  ADD COLUMN IF NOT EXISTS columns JSONB NOT NULL DEFAULT '[]'::jsonb;
