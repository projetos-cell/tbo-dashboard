-- ============================================
-- F06: Task Projects — Multi-home (uma tarefa em vários projetos)
-- ============================================

CREATE TABLE IF NOT EXISTS task_projects (
  task_id    UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, project_id)
);

ALTER TABLE task_projects ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_task_projects_task    ON task_projects(task_id);
CREATE INDEX IF NOT EXISTS idx_task_projects_project ON task_projects(project_id);

-- RLS: acesso pelo tenant via os_tasks
CREATE POLICY "task_projects_access" ON task_projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM os_tasks t
      WHERE t.id = task_projects.task_id
    )
  );
