-- A06: Add reminder_days field to os_tasks
-- Stores how many days before due_date to send a reminder notification.

ALTER TABLE os_tasks
  ADD COLUMN IF NOT EXISTS reminder_days INTEGER;
