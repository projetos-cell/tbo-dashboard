-- ============================================================
-- Creative Review Module — Migration
-- ============================================================

-- 1. REVIEW PROJECTS
CREATE TABLE IF NOT EXISTS review_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  code text,
  client_name text,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  description text,
  thumbnail_url text,
  workflow_stage text NOT NULL DEFAULT 'clay_approval'
    CHECK (workflow_stage IN (
      'clay_approval', 'internal_preview', 'client_review', 'revisions', 'final_approval', 'delivered'
    )),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  created_by uuid NOT NULL,
  share_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  share_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS review_projects_tenant_idx ON review_projects(tenant_id);
CREATE INDEX IF NOT EXISTS review_projects_project_idx ON review_projects(project_id);

-- 2. REVIEW SCENES
CREATE TABLE IF NOT EXISTS review_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES review_projects(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  scene_type text NOT NULL DEFAULT 'still'
    CHECK (scene_type IN ('still', 'animation', 'panorama', 'video')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS review_scenes_project_idx ON review_scenes(project_id);

-- 3. REVIEW VERSIONS
CREATE TABLE IF NOT EXISTS review_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id uuid NOT NULL REFERENCES review_scenes(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  version_label text NOT NULL,
  version_number integer NOT NULL DEFAULT 0,
  file_url text NOT NULL,
  file_path text,
  thumbnail_url text,
  file_size_bytes bigint,
  mime_type text,
  width integer,
  height integer,
  uploaded_by uuid NOT NULL,
  uploaded_by_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_review', 'approved', 'changes_requested', 'superseded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scene_id, version_number)
);

CREATE INDEX IF NOT EXISTS review_versions_scene_idx ON review_versions(scene_id);

-- 4. REVIEW ANNOTATIONS
CREATE TABLE IF NOT EXISTS review_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES review_versions(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  parent_id uuid REFERENCES review_annotations(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT '',
  author_avatar_url text,
  x_pct numeric CHECK (x_pct >= 0 AND x_pct <= 100),
  y_pct numeric CHECK (y_pct >= 0 AND y_pct <= 100),
  content text NOT NULL DEFAULT '',
  resolved boolean NOT NULL DEFAULT false,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS review_annotations_version_idx ON review_annotations(version_id);
CREATE INDEX IF NOT EXISTS review_annotations_parent_idx ON review_annotations(parent_id);

-- 5. REVIEW APPROVALS
CREATE TABLE IF NOT EXISTS review_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES review_versions(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (version_id, user_id)
);

CREATE INDEX IF NOT EXISTS review_approvals_version_idx ON review_approvals(version_id);

-- 6. REVIEW SHARE LINKS
CREATE TABLE IF NOT EXISTS review_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES review_projects(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  reviewer_name text,
  reviewer_email text,
  permissions text NOT NULL DEFAULT 'view_comment'
    CHECK (permissions IN ('view_only', 'view_comment', 'view_approve')),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS review_share_links_token_idx ON review_share_links(token);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE review_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_share_links ENABLE ROW LEVEL SECURITY;

-- review_projects
CREATE POLICY "review_projects_select" ON review_projects
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_projects_insert" ON review_projects
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_projects_update" ON review_projects
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_projects_delete" ON review_projects
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- review_scenes
CREATE POLICY "review_scenes_select" ON review_scenes
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_scenes_insert" ON review_scenes
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_scenes_update" ON review_scenes
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_scenes_delete" ON review_scenes
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- review_versions
CREATE POLICY "review_versions_select" ON review_versions
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_versions_insert" ON review_versions
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_versions_update" ON review_versions
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_versions_delete" ON review_versions
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- review_annotations
CREATE POLICY "review_annotations_select" ON review_annotations
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_annotations_insert" ON review_annotations
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_annotations_update" ON review_annotations
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_annotations_delete" ON review_annotations
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- review_approvals
CREATE POLICY "review_approvals_select" ON review_approvals
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_approvals_insert" ON review_approvals
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_approvals_update" ON review_approvals
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- review_share_links
CREATE POLICY "review_share_links_select" ON review_share_links
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_share_links_insert" ON review_share_links
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "review_share_links_update" ON review_share_links
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-assets', 'review-assets', false)
ON CONFLICT DO NOTHING;
