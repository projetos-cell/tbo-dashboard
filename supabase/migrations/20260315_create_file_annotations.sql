-- File annotations: pin comments on image files for proofing
CREATE TABLE IF NOT EXISTS file_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES project_attachments(id) ON DELETE CASCADE,
  task_id uuid REFERENCES os_tasks(id) ON DELETE SET NULL,
  tenant_id uuid NOT NULL,
  author_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT '',
  x_pct numeric NOT NULL CHECK (x_pct >= 0 AND x_pct <= 100),
  y_pct numeric NOT NULL CHECK (y_pct >= 0 AND y_pct <= 100),
  content text NOT NULL DEFAULT '',
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by file
CREATE INDEX IF NOT EXISTS file_annotations_file_idx ON file_annotations(file_id);

-- RLS
ALTER TABLE file_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "file_annotations_select" ON file_annotations
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "file_annotations_insert" ON file_annotations
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "file_annotations_update" ON file_annotations
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "file_annotations_delete" ON file_annotations
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
