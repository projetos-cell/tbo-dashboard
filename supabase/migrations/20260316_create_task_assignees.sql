-- Create task_assignees junction table for multi-assignee support
CREATE TABLE IF NOT EXISTS task_assignees (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id     UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role        TEXT DEFAULT 'assignee',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_assignees_task ON task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_user ON task_assignees(user_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_tenant ON task_assignees(tenant_id);

ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_assignees_select" ON task_assignees;
CREATE POLICY "task_assignees_select" ON task_assignees
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "task_assignees_insert" ON task_assignees;
CREATE POLICY "task_assignees_insert" ON task_assignees
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "task_assignees_update" ON task_assignees;
CREATE POLICY "task_assignees_update" ON task_assignees
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "task_assignees_delete" ON task_assignees;
CREATE POLICY "task_assignees_delete" ON task_assignees
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
