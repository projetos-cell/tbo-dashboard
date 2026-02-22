-- ============================================================
-- Migration 037: Project System (Kanban + Tasks + Comments)
-- Task #22 — TBO-OS Sistema de Projetos
-- ============================================================

-- 1. project_boards — Kanban boards per project
CREATE TABLE IF NOT EXISTS project_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT 'Board Principal',
  -- columns: [{ id, name, color, order }]
  columns JSONB NOT NULL DEFAULT '[
    {"id":"col_briefing","name":"Briefing","color":"#8B5CF6","order":0},
    {"id":"col_producao","name":"Em produção","color":"#3B82F6","order":1},
    {"id":"col_review","name":"Review","color":"#F59E0B","order":2},
    {"id":"col_entregue","name":"Entregue","color":"#22C55E","order":3}
  ]'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_boards_tenant ON project_boards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_boards_project ON project_boards(project_id);

ALTER TABLE project_boards ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_boards_select' AND tablename = 'project_boards') THEN
    CREATE POLICY "project_boards_select" ON project_boards FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_boards_insert' AND tablename = 'project_boards') THEN
    CREATE POLICY "project_boards_insert" ON project_boards FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_boards_update' AND tablename = 'project_boards') THEN
    CREATE POLICY "project_boards_update" ON project_boards FOR UPDATE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_boards_delete' AND tablename = 'project_boards') THEN
    CREATE POLICY "project_boards_delete" ON project_boards FOR DELETE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- 2. project_tasks — Tasks with priority, assignment, subtasks
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  board_id UUID NOT NULL REFERENCES project_boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'col_briefing',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id UUID,
  due_date DATE,
  order_index DOUBLE PRECISION DEFAULT 0,
  parent_task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  client_id UUID,
  tags JSONB DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_tenant ON project_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_board ON project_tasks(board_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee ON project_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_parent ON project_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_client ON project_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_priority ON project_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due ON project_tasks(due_date);

ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_tasks_select' AND tablename = 'project_tasks') THEN
    CREATE POLICY "project_tasks_select" ON project_tasks FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_tasks_insert' AND tablename = 'project_tasks') THEN
    CREATE POLICY "project_tasks_insert" ON project_tasks FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_tasks_update' AND tablename = 'project_tasks') THEN
    CREATE POLICY "project_tasks_update" ON project_tasks FOR UPDATE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_tasks_delete' AND tablename = 'project_tasks') THEN
    CREATE POLICY "project_tasks_delete" ON project_tasks FOR DELETE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- 3. project_task_comments — Comments on tasks
CREATE TABLE IF NOT EXISTS project_task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  user_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_task_comments_tenant ON project_task_comments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_task_comments_task ON project_task_comments(task_id);

ALTER TABLE project_task_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_task_comments_select' AND tablename = 'project_task_comments') THEN
    CREATE POLICY "project_task_comments_select" ON project_task_comments FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_task_comments_insert' AND tablename = 'project_task_comments') THEN
    CREATE POLICY "project_task_comments_insert" ON project_task_comments FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_task_comments_update' AND tablename = 'project_task_comments') THEN
    CREATE POLICY "project_task_comments_update" ON project_task_comments FOR UPDATE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_task_comments_delete' AND tablename = 'project_task_comments') THEN
    CREATE POLICY "project_task_comments_delete" ON project_task_comments FOR DELETE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- 4. Updated_at trigger for project_boards and project_tasks
CREATE OR REPLACE FUNCTION update_project_system_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trg_project_boards_updated_at') THEN
    CREATE TRIGGER trg_project_boards_updated_at
      BEFORE UPDATE ON project_boards
      FOR EACH ROW EXECUTE FUNCTION update_project_system_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trg_project_tasks_updated_at') THEN
    CREATE TRIGGER trg_project_tasks_updated_at
      BEFORE UPDATE ON project_tasks
      FOR EACH ROW EXECUTE FUNCTION update_project_system_updated_at();
  END IF;
END $$;
