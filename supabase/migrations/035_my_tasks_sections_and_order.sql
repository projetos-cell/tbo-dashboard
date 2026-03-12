-- ============================================================
-- Migration 035: My Tasks Sections & Order (Asana-style personal task views)
-- ============================================================

-- ─── 1. Personal sections for "Minhas Tarefas" ─────────────
CREATE TABLE IF NOT EXISTS my_tasks_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order REAL NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_my_tasks_sections_user ON my_tasks_sections(user_id, sort_order);
CREATE INDEX idx_my_tasks_sections_tenant ON my_tasks_sections(tenant_id);

-- Trigger for updated_at
CREATE TRIGGER my_tasks_sections_updated_at
  BEFORE UPDATE ON my_tasks_sections
  FOR EACH ROW EXECUTE FUNCTION os_set_updated_at();

-- RLS
ALTER TABLE my_tasks_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "my_tasks_sections_select" ON my_tasks_sections
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "my_tasks_sections_insert" ON my_tasks_sections
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "my_tasks_sections_update" ON my_tasks_sections
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "my_tasks_sections_delete" ON my_tasks_sections
  FOR DELETE USING (user_id = auth.uid() AND is_default = false);


-- ─── 2. Personal task ordering within sections ─────────────
CREATE TABLE IF NOT EXISTS my_tasks_order (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  section_id UUID REFERENCES my_tasks_sections(id) ON DELETE SET NULL,
  sort_order REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, task_id)
);

CREATE INDEX idx_my_tasks_order_section ON my_tasks_order(section_id, sort_order);
CREATE INDEX idx_my_tasks_order_user ON my_tasks_order(user_id);

-- RLS
ALTER TABLE my_tasks_order ENABLE ROW LEVEL SECURITY;

CREATE POLICY "my_tasks_order_select" ON my_tasks_order
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "my_tasks_order_insert" ON my_tasks_order
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "my_tasks_order_update" ON my_tasks_order
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "my_tasks_order_delete" ON my_tasks_order
  FOR DELETE USING (user_id = auth.uid());


-- ─── 3. Function to auto-create default section for new users ───
CREATE OR REPLACE FUNCTION ensure_default_my_tasks_section(
  p_user_id UUID,
  p_tenant_id UUID
) RETURNS UUID AS $$
DECLARE
  v_section_id UUID;
BEGIN
  SELECT id INTO v_section_id
  FROM my_tasks_sections
  WHERE user_id = p_user_id AND is_default = true
  LIMIT 1;

  IF v_section_id IS NULL THEN
    INSERT INTO my_tasks_sections (tenant_id, user_id, name, sort_order, is_default)
    VALUES (p_tenant_id, p_user_id, 'Atribuídas recentemente', 0, true)
    RETURNING id INTO v_section_id;
  END IF;

  RETURN v_section_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── 4. My Tasks view preferences (sort, filter, group, view mode) ───
CREATE TABLE IF NOT EXISTS my_tasks_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  view_mode TEXT NOT NULL DEFAULT 'list' CHECK (view_mode IN ('list', 'board', 'calendar')),
  sort_by TEXT NOT NULL DEFAULT 'manual',
  sort_direction TEXT NOT NULL DEFAULT 'asc' CHECK (sort_direction IN ('asc', 'desc')),
  group_by TEXT NOT NULL DEFAULT 'section',
  show_completed BOOLEAN NOT NULL DEFAULT false,
  filters JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE my_tasks_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "my_tasks_prefs_select" ON my_tasks_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "my_tasks_prefs_insert" ON my_tasks_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "my_tasks_prefs_update" ON my_tasks_preferences
  FOR UPDATE USING (user_id = auth.uid());


-- ─── 5. Future-proof: rules table (phase 2, just schema) ───
CREATE TABLE IF NOT EXISTS my_tasks_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}',
  action_type TEXT NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE my_tasks_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "my_tasks_rules_all" ON my_tasks_rules
  FOR ALL USING (user_id = auth.uid());
