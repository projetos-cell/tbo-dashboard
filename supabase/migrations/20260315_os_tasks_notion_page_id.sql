-- Add notion_page_id to os_tasks for Notion import deduplication
ALTER TABLE os_tasks ADD COLUMN IF NOT EXISTS notion_page_id text;

-- Index for fast lookup during sync
CREATE INDEX IF NOT EXISTS idx_os_tasks_notion_page_id
  ON os_tasks (notion_page_id)
  WHERE notion_page_id IS NOT NULL;
