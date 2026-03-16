-- #44 — Chat channel linked to a project
-- Adds project_id to chat_channels so channels can be auto-created per project

ALTER TABLE chat_channels
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_chat_channels_project_id ON chat_channels(project_id);

COMMENT ON COLUMN chat_channels.project_id IS
  'Optional link to a project. When set, this channel was auto-created for that project.';
