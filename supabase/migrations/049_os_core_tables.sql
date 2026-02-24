-- ============================================================================
-- TBO OS — Migration 049: OS Core Tables (Tasks, Sections, Custom Fields)
--
-- Foundation for the TBO-OS task management engine.
-- Tables: os_sections, os_tasks, os_custom_fields, os_task_field_values
--
-- IDEMPOTENT: safe to run multiple times.
-- ============================================================================

-- ═══ Updated_at trigger function (shared) ═══
CREATE OR REPLACE FUNCTION os_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- os_sections — Project sections (columns in Kanban, groups in List)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS os_sections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT 'Sem título',
  order_index  INTEGER NOT NULL DEFAULT 0,
  color        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS os_sections_project_idx
  ON os_sections(project_id, order_index);
CREATE INDEX IF NOT EXISTS os_sections_tenant_idx
  ON os_sections(tenant_id);

ALTER TABLE os_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "os_sections_select" ON os_sections;
DROP POLICY IF EXISTS "os_sections_insert" ON os_sections;
DROP POLICY IF EXISTS "os_sections_update" ON os_sections;
DROP POLICY IF EXISTS "os_sections_delete" ON os_sections;

CREATE POLICY "os_sections_select" ON os_sections
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "os_sections_insert" ON os_sections
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "os_sections_update" ON os_sections
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "os_sections_delete" ON os_sections
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP TRIGGER IF EXISTS os_sections_updated_at ON os_sections;
CREATE TRIGGER os_sections_updated_at
  BEFORE UPDATE ON os_sections FOR EACH ROW EXECUTE FUNCTION os_set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- os_tasks — Tasks within projects, assigned to sections
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS os_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section_id      UUID REFERENCES os_sections(id) ON DELETE SET NULL,
  parent_id       UUID REFERENCES os_tasks(id) ON DELETE CASCADE,
  title           TEXT NOT NULL DEFAULT '',
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'todo',
  assignee_id     UUID,
  assignee_name   TEXT,
  start_date      DATE,
  due_date        DATE,
  completed_at    TIMESTAMPTZ,
  priority        TEXT,
  order_index     INTEGER NOT NULL DEFAULT 0,
  is_completed    BOOLEAN DEFAULT FALSE,
  legacy_demand_id UUID,
  created_by      UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS os_tasks_project_section_idx
  ON os_tasks(project_id, section_id, order_index);
CREATE INDEX IF NOT EXISTS os_tasks_tenant_idx
  ON os_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS os_tasks_assignee_idx
  ON os_tasks(assignee_id) WHERE assignee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS os_tasks_parent_idx
  ON os_tasks(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS os_tasks_status_idx
  ON os_tasks(project_id, status);
CREATE INDEX IF NOT EXISTS os_tasks_legacy_idx
  ON os_tasks(legacy_demand_id) WHERE legacy_demand_id IS NOT NULL;

ALTER TABLE os_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "os_tasks_select" ON os_tasks;
DROP POLICY IF EXISTS "os_tasks_insert" ON os_tasks;
DROP POLICY IF EXISTS "os_tasks_update" ON os_tasks;
DROP POLICY IF EXISTS "os_tasks_delete" ON os_tasks;

CREATE POLICY "os_tasks_select" ON os_tasks
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "os_tasks_insert" ON os_tasks
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "os_tasks_update" ON os_tasks
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "os_tasks_delete" ON os_tasks
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP TRIGGER IF EXISTS os_tasks_updated_at ON os_tasks;
CREATE TRIGGER os_tasks_updated_at
  BEFORE UPDATE ON os_tasks FOR EACH ROW EXECUTE FUNCTION os_set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- os_custom_fields — Field definitions (project-scoped or global)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS os_custom_fields (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  scope        TEXT NOT NULL DEFAULT 'project',
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL,
  config_json  JSONB DEFAULT '{}',
  order_index  INTEGER NOT NULL DEFAULT 0,
  is_visible   BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT os_cf_scope_check CHECK (
    (scope = 'global' AND project_id IS NULL) OR
    (scope = 'project' AND project_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS os_custom_fields_tenant_idx
  ON os_custom_fields(tenant_id);
CREATE INDEX IF NOT EXISTS os_custom_fields_project_idx
  ON os_custom_fields(project_id, order_index) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS os_custom_fields_scope_idx
  ON os_custom_fields(tenant_id, scope);

ALTER TABLE os_custom_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "os_custom_fields_select" ON os_custom_fields;
DROP POLICY IF EXISTS "os_custom_fields_insert" ON os_custom_fields;
DROP POLICY IF EXISTS "os_custom_fields_update" ON os_custom_fields;
DROP POLICY IF EXISTS "os_custom_fields_delete" ON os_custom_fields;

CREATE POLICY "os_custom_fields_select" ON os_custom_fields
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "os_custom_fields_insert" ON os_custom_fields
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "os_custom_fields_update" ON os_custom_fields
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "os_custom_fields_delete" ON os_custom_fields
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP TRIGGER IF EXISTS os_custom_fields_updated_at ON os_custom_fields;
CREATE TRIGGER os_custom_fields_updated_at
  BEFORE UPDATE ON os_custom_fields FOR EACH ROW EXECUTE FUNCTION os_set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- os_task_field_values — Values for custom fields per task
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS os_task_field_values (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id     UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  field_id    UUID NOT NULL REFERENCES os_custom_fields(id) ON DELETE CASCADE,
  value_json  JSONB NOT NULL DEFAULT 'null',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT os_tfv_unique UNIQUE (task_id, field_id)
);

CREATE INDEX IF NOT EXISTS os_tfv_task_idx
  ON os_task_field_values(task_id);
CREATE INDEX IF NOT EXISTS os_tfv_field_idx
  ON os_task_field_values(field_id);
CREATE INDEX IF NOT EXISTS os_tfv_tenant_idx
  ON os_task_field_values(tenant_id);

ALTER TABLE os_task_field_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "os_tfv_select" ON os_task_field_values;
DROP POLICY IF EXISTS "os_tfv_insert" ON os_task_field_values;
DROP POLICY IF EXISTS "os_tfv_update" ON os_task_field_values;
DROP POLICY IF EXISTS "os_tfv_delete" ON os_task_field_values;

CREATE POLICY "os_tfv_select" ON os_task_field_values
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "os_tfv_insert" ON os_task_field_values
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "os_tfv_update" ON os_task_field_values
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "os_tfv_delete" ON os_task_field_values
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP TRIGGER IF EXISTS os_tfv_updated_at ON os_task_field_values;
CREATE TRIGGER os_tfv_updated_at
  BEFORE UPDATE ON os_task_field_values FOR EACH ROW EXECUTE FUNCTION os_set_updated_at();
