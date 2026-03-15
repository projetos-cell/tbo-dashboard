-- T07: Task templates — save and reuse task structures
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subtasks_json JSONB DEFAULT '[]'::jsonb,
  priority TEXT DEFAULT 'media',
  estimated_hours NUMERIC,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_templates_tenant_isolation" ON task_templates
  FOR ALL USING (tenant_id IN (SELECT get_user_tenant_ids()));
