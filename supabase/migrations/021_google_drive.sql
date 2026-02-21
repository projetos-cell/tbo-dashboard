-- ============================================================================
-- TBO OS — Migration 021: Google Drive Integration
-- Tabela para arquivos de projetos sincronizados do Google Drive.
-- PRD v1.2 — Integração Google Drive obrigatória
-- ============================================================================

-- 1. Tabela de arquivos
CREATE TABLE IF NOT EXISTS project_files (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id        UUID REFERENCES projects(id) ON DELETE SET NULL,
  profile_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  google_file_id    TEXT,
  name              TEXT NOT NULL,
  mime_type         TEXT,
  size_bytes        BIGINT,
  web_view_link     TEXT,
  web_content_link  TEXT,
  thumbnail_link    TEXT,
  icon_link         TEXT,
  google_folder_id  TEXT,
  last_modified_by  TEXT,
  last_modified_at  TIMESTAMPTZ,
  synced_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- 2. Coluna google_folder_id em projects (link para pasta do Drive)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS google_folder_id TEXT;

-- 3. Unique index para upsert por google_file_id (tenant-scoped)
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_files_google
  ON project_files(tenant_id, google_file_id) WHERE google_file_id IS NOT NULL;

-- 4. Indexes para queries comuns
CREATE INDEX IF NOT EXISTS idx_project_files_project
  ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_tenant
  ON project_files(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_files_name
  ON project_files(name);

-- 5. RLS — project_files
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY project_files_select ON project_files
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY project_files_insert ON project_files
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY project_files_update ON project_files
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY project_files_delete ON project_files
  FOR DELETE USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM tenant_members tm
      JOIN profiles p ON p.id = tm.user_id
      WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
      AND p.role IN ('founder','admin')
    )
  );

-- ============================================================================
-- FIM da Migration 021
-- ============================================================================
