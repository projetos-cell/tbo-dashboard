-- CL02: Add portal_token to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portal_token TEXT UNIQUE;

-- CL03: Add client approval fields to os_tasks
ALTER TABLE os_tasks ADD COLUMN IF NOT EXISTS requires_client_approval BOOLEAN DEFAULT false;
ALTER TABLE os_tasks ADD COLUMN IF NOT EXISTS client_approval_status TEXT DEFAULT 'none' CHECK (client_approval_status IN ('none', 'pending', 'approved', 'rejected'));
ALTER TABLE os_tasks ADD COLUMN IF NOT EXISTS client_approval_comment TEXT;
ALTER TABLE os_tasks ADD COLUMN IF NOT EXISTS client_approval_at TIMESTAMPTZ;

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_projects_portal_token ON projects(portal_token) WHERE portal_token IS NOT NULL;
