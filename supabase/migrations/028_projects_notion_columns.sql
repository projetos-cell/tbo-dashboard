-- ============================================================================
-- TBO OS — Migration 028: Cria tabela projects + colunas operacionais/Notion
--
-- A tabela projects é a entidade central de gestão de projetos da TBO.
-- Esta migration cria a tabela caso não exista (idempotente) e adiciona
-- as colunas operacionais necessárias para o Quadro de Projetos e sync Notion.
--
-- IDEMPOTENTE: seguro executar múltiplas vezes.
-- ============================================================================

-- ── 1. Criar tabela projects (caso não exista) ────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  client         TEXT,
  client_company TEXT,
  status         TEXT NOT NULL DEFAULT 'briefing',
  owner_id       UUID,
  owner_name     TEXT,
  value          NUMERIC(15,2),
  services       TEXT[],
  priority       TEXT DEFAULT 'media',
  source         TEXT,
  notes          TEXT,
  proposal_id    UUID,
  google_folder_id TEXT,
  -- Colunas operacionais / Notion sync
  construtora    TEXT,
  bus            TEXT[],
  code           TEXT,
  due_date_start DATE,
  due_date_end   DATE,
  notion_url     TEXT,
  notion_page_id TEXT,
  -- Timestamps
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Adicionar colunas caso a tabela já existisse sem elas ──────────────────
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS tenant_id        UUID REFERENCES tenants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS client           TEXT,
  ADD COLUMN IF NOT EXISTS client_company   TEXT,
  ADD COLUMN IF NOT EXISTS owner_id         UUID,
  ADD COLUMN IF NOT EXISTS owner_name       TEXT,
  ADD COLUMN IF NOT EXISTS value            NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS services         TEXT[],
  ADD COLUMN IF NOT EXISTS priority         TEXT DEFAULT 'media',
  ADD COLUMN IF NOT EXISTS source           TEXT,
  ADD COLUMN IF NOT EXISTS notes            TEXT,
  ADD COLUMN IF NOT EXISTS proposal_id      UUID,
  ADD COLUMN IF NOT EXISTS google_folder_id TEXT,
  ADD COLUMN IF NOT EXISTS construtora      TEXT,
  ADD COLUMN IF NOT EXISTS bus              TEXT[],
  ADD COLUMN IF NOT EXISTS code             TEXT,
  ADD COLUMN IF NOT EXISTS due_date_start   DATE,
  ADD COLUMN IF NOT EXISTS due_date_end     DATE,
  ADD COLUMN IF NOT EXISTS notion_url       TEXT,
  ADD COLUMN IF NOT EXISTS notion_page_id   TEXT,
  ADD COLUMN IF NOT EXISTS created_at       TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT NOW();

-- ── 3. Índices ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_tenant_status_updated
  ON projects (tenant_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_tenant_construtora
  ON projects (tenant_id, construtora)
  WHERE construtora IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_notion_page_id
  ON projects (notion_page_id)
  WHERE notion_page_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_due_date_end
  ON projects (tenant_id, due_date_end)
  WHERE due_date_end IS NOT NULL;

-- ── 4. Trigger updated_at ─────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_projects_updated_at'
  ) THEN
    CREATE TRIGGER trg_projects_updated_at
      BEFORE UPDATE ON projects
      FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
  END IF;
EXCEPTION WHEN undefined_function THEN
  -- moddatetime extension não disponível, ignorar trigger
  NULL;
END $$;

-- ── 5. RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select"     ON projects;
DROP POLICY IF EXISTS "projects_insert"     ON projects;
DROP POLICY IF EXISTS "projects_update"     ON projects;
DROP POLICY IF EXISTS "projects_delete"     ON projects;
DROP POLICY IF EXISTS "rls_projects_select" ON projects;
DROP POLICY IF EXISTS "rls_projects_insert" ON projects;
DROP POLICY IF EXISTS "rls_projects_update" ON projects;
DROP POLICY IF EXISTS "rls_projects_delete" ON projects;

CREATE POLICY "rls_projects_select" ON projects FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_projects_insert" ON projects FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_projects_update" ON projects FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_projects_delete" ON projects FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );

-- ── 6. Realtime ───────────────────────────────────────────────────────────────
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE projects;
EXCEPTION WHEN duplicate_object THEN
  -- já adicionado
  NULL;
END $$;

-- ============================================================================
-- FIM DA MIGRATION 028
-- ============================================================================
