-- ============================================
-- F01: Task Entities — Novas tabelas auxiliares
-- Tabela principal (os_tasks) já existe
-- ============================================

-- ────────────────────────────────────────────
-- TASK_COLLABORATORS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_collaborators (
  task_id UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, user_id)
);

-- ────────────────────────────────────────────
-- TAGS + TASK_TAGS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, tenant_id)
);

CREATE TABLE IF NOT EXISTS task_tags (
  task_id UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- ────────────────────────────────────────────
-- TASK_DEPENDENCIES
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  predecessor_id UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  successor_id UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'finish_to_start'
    CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(predecessor_id, successor_id)
);

-- ────────────────────────────────────────────
-- TASK_COMMENTS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  content JSONB NOT NULL,
  parent_comment_id UUID REFERENCES task_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────
-- TASK_ATTACHMENTS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────
-- LIKES (polimórfica)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('task', 'comment')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

-- ────────────────────────────────────────────
-- CUSTOM FIELDS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'select', 'multi_select', 'date', 'person', 'checkbox')),
  options JSONB DEFAULT '[]',
  is_required BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_custom_field_values (
  task_id UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  value JSONB NOT NULL,
  PRIMARY KEY (task_id, field_id)
);

-- ────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────
ALTER TABLE task_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_custom_field_values ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_pred ON task_dependencies(predecessor_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_succ ON task_dependencies(successor_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_tags_tenant ON tags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_defs_tenant ON custom_field_definitions(tenant_id);

-- ────────────────────────────────────────────
-- TRIGGERS
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_comments_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ────────────────────────────────────────────
-- RLS POLICIES (base — ajustar conforme RBAC real)
-- ────────────────────────────────────────────

-- Tags: tenant-scoped
CREATE POLICY "tags_tenant_access" ON tags
  FOR ALL USING (
    tenant_id IN (SELECT get_user_tenant_ids())
  );

-- Task comments: anyone who can see the task
CREATE POLICY "task_comments_access" ON task_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM os_tasks t
      WHERE t.id = task_comments.task_id
    )
  );

-- Task attachments: same as comments
CREATE POLICY "task_attachments_access" ON task_attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM os_tasks t
      WHERE t.id = task_attachments.task_id
    )
  );

-- Likes: user can manage own likes
CREATE POLICY "likes_own" ON likes
  FOR ALL USING (user_id = auth.uid());

-- Custom field definitions: tenant-scoped
CREATE POLICY "custom_field_defs_tenant" ON custom_field_definitions
  FOR ALL USING (
    tenant_id IN (SELECT get_user_tenant_ids())
  );

-- Custom field values: anyone who can see the task
CREATE POLICY "custom_field_values_access" ON task_custom_field_values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM os_tasks t
      WHERE t.id = task_custom_field_values.task_id
    )
  );

-- Task collaborators: anyone who can see the task
CREATE POLICY "task_collaborators_access" ON task_collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM os_tasks t
      WHERE t.id = task_collaborators.task_id
    )
  );

-- Task tags: anyone who can see the task
CREATE POLICY "task_tags_access" ON task_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM os_tasks t
      WHERE t.id = task_tags.task_id
    )
  );

-- Task dependencies: anyone who can see either task
CREATE POLICY "task_dependencies_access" ON task_dependencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM os_tasks t
      WHERE t.id = task_dependencies.predecessor_id
         OR t.id = task_dependencies.successor_id
    )
  );
