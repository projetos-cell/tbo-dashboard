-- T01: Approval status for tasks
-- T02: Milestone flag for tasks
-- T03: Effort estimation (estimated/logged hours)

ALTER TABLE os_tasks
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'none'
    CHECK (approval_status IN ('none', 'pending', 'approved', 'changes_requested')),
  ADD COLUMN IF NOT EXISTS is_milestone boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS estimated_hours numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS logged_hours numeric DEFAULT NULL;

-- Index for quick filtering by approval status
CREATE INDEX IF NOT EXISTS idx_os_tasks_approval_status ON os_tasks (approval_status) WHERE approval_status <> 'none';

-- Index for milestone queries
CREATE INDEX IF NOT EXISTS idx_os_tasks_is_milestone ON os_tasks (is_milestone) WHERE is_milestone = true;
