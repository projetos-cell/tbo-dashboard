-- ============================================================================
-- TBO OS — Migration 028: Notion Projects & Demands Sync
-- Cria infraestrutura para importar BD Projetos e BD Demandas do Notion
-- para Supabase (fonte unica da verdade).
--
-- Tabelas criadas/alteradas:
--   - projects (ALTER: adiciona notion_page_id, construtora, bus, due_date_start/end)
--   - demands (CREATE: demandas do Notion)
--   - notion_pages_raw (CREATE: staging de payloads brutos)
--   - notion_sync_runs (CREATE: log de execucoes de sync)
--
-- IDEMPOTENTE: seguro executar multiplas vezes.
-- ============================================================================

-- ============================================================================
-- SECAO 1: ALTERAR TABELA projects (adicionar campos Notion)
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='notion_page_id') THEN
    ALTER TABLE projects ADD COLUMN notion_page_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='construtora') THEN
    ALTER TABLE projects ADD COLUMN construtora TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='bus') THEN
    ALTER TABLE projects ADD COLUMN bus TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='due_date_start') THEN
    ALTER TABLE projects ADD COLUMN due_date_start DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='due_date_end') THEN
    ALTER TABLE projects ADD COLUMN due_date_end DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='notion_url') THEN
    ALTER TABLE projects ADD COLUMN notion_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='notion_synced_at') THEN
    ALTER TABLE projects ADD COLUMN notion_synced_at TIMESTAMPTZ;
  END IF;
END $$;

-- Unique index no notion_page_id (para upsert idempotente)
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_notion_page_id
  ON projects (notion_page_id) WHERE notion_page_id IS NOT NULL;

-- ============================================================================
-- SECAO 2: TABELA demands
-- ============================================================================

CREATE TABLE IF NOT EXISTS demands (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  notion_page_id TEXT,
  title         TEXT NOT NULL,
  status        TEXT DEFAULT 'Briefing',
  due_date      DATE,
  responsible   TEXT,
  responsible_email TEXT,
  bus           TEXT[] DEFAULT '{}',
  priority      TEXT,
  media_type    TEXT[] DEFAULT '{}',
  info          TEXT,
  formalization_url TEXT,
  notion_url    TEXT,

  -- Relacionamentos
  project_id    UUID REFERENCES projects(id) ON DELETE SET NULL,
  parent_demand_id UUID REFERENCES demands(id) ON DELETE SET NULL,

  -- Controle de sync
  notion_synced_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Unique index no notion_page_id (para upsert idempotente)
CREATE UNIQUE INDEX IF NOT EXISTS idx_demands_notion_page_id
  ON demands (notion_page_id) WHERE notion_page_id IS NOT NULL;

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_demands_project_id ON demands (project_id);
CREATE INDEX IF NOT EXISTS idx_demands_parent_demand_id ON demands (parent_demand_id);
CREATE INDEX IF NOT EXISTS idx_demands_status ON demands (status);
CREATE INDEX IF NOT EXISTS idx_demands_due_date ON demands (due_date);
CREATE INDEX IF NOT EXISTS idx_demands_tenant_id ON demands (tenant_id);

-- ============================================================================
-- SECAO 3: TABELA notion_pages_raw (staging)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notion_pages_raw (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notion_page_id TEXT NOT NULL,
  database_id   TEXT NOT NULL,
  payload       JSONB NOT NULL,
  synced_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (notion_page_id, database_id)
);

CREATE INDEX IF NOT EXISTS idx_notion_pages_raw_db
  ON notion_pages_raw (database_id);

-- ============================================================================
-- SECAO 4: TABELA notion_sync_runs (log de execucoes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notion_sync_runs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at    TIMESTAMPTZ DEFAULT now(),
  finished_at   TIMESTAMPTZ,
  status        TEXT DEFAULT 'running',  -- running | success | error
  projects_synced INTEGER DEFAULT 0,
  demands_synced  INTEGER DEFAULT 0,
  errors        JSONB DEFAULT '[]',
  triggered_by  TEXT  -- 'manual' | 'cron' | user_id
);

-- ============================================================================
-- SECAO 5: RLS — demands
-- ============================================================================

ALTER TABLE demands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rls_demands_select" ON demands;
DROP POLICY IF EXISTS "rls_demands_insert" ON demands;
DROP POLICY IF EXISTS "rls_demands_update" ON demands;
DROP POLICY IF EXISTS "rls_demands_delete" ON demands;

CREATE POLICY "rls_demands_select" ON demands FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_demands_insert" ON demands FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_demands_update" ON demands FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_demands_delete" ON demands FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );

-- ============================================================================
-- SECAO 6: RLS — notion_pages_raw (somente service_role e admin)
-- ============================================================================

ALTER TABLE notion_pages_raw ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rls_notion_raw_select" ON notion_pages_raw;
CREATE POLICY "rls_notion_raw_select" ON notion_pages_raw FOR SELECT TO authenticated
  USING (is_founder_or_admin());

-- notion_sync_runs: somente admin le
ALTER TABLE notion_sync_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rls_sync_runs_select" ON notion_sync_runs;
CREATE POLICY "rls_sync_runs_select" ON notion_sync_runs FOR SELECT TO authenticated
  USING (is_founder_or_admin());

-- ============================================================================
-- SECAO 7: INDEX adicional para projects
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_due_date_start ON projects (due_date_start);

-- ============================================================================
-- SECAO 8: Trigger updated_at para demands
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_demands_updated_at ON demands;
CREATE TRIGGER trg_demands_updated_at
  BEFORE UPDATE ON demands
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================================
-- FIM da migration 028
-- ============================================================================
