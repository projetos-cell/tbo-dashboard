-- T04: Add recurrence field to os_tasks
ALTER TABLE os_tasks ADD COLUMN IF NOT EXISTS recurrence text NOT NULL DEFAULT 'none';
