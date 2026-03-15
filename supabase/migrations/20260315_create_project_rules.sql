-- Project Rules Engine: automation rules per project
CREATE TABLE IF NOT EXISTS project_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES os_projects(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Nova regra',
  trigger_type text NOT NULL CHECK (trigger_type IN (
    'task_moved_to_section',
    'task_status_changed',
    'task_overdue',
    'task_assigned',
    'task_created'
  )),
  trigger_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  conditions_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  actions_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE project_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_rules_select" ON project_rules
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "project_rules_insert" ON project_rules
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "project_rules_update" ON project_rules
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "project_rules_delete" ON project_rules
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
