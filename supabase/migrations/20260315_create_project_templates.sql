-- TM02: Project templates (user-saved)
CREATE TABLE IF NOT EXISTS project_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  sections_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON project_templates
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "tenant_insert" ON project_templates
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "tenant_update" ON project_templates
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "tenant_delete" ON project_templates
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
