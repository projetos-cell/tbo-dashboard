-- Intake forms: public forms that create tasks in a project section
CREATE TABLE IF NOT EXISTS intake_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES os_projects(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Formulário de Intake',
  description text,
  fields_json jsonb NOT NULL DEFAULT '[
    {"key":"title","label":"Título","type":"text","required":true},
    {"key":"description","label":"Descrição","type":"textarea","required":false}
  ]'::jsonb,
  target_section_id uuid REFERENCES os_project_sections(id) ON DELETE SET NULL,
  default_status text DEFAULT 'pendente',
  default_priority text,
  token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique token for public access
CREATE UNIQUE INDEX IF NOT EXISTS intake_forms_token_idx ON intake_forms(token);

-- RLS
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intake_forms_select" ON intake_forms
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "intake_forms_insert" ON intake_forms
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "intake_forms_update" ON intake_forms
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "intake_forms_delete" ON intake_forms
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
