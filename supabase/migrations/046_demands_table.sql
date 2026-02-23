-- ============================================================================
-- TBO OS — Migration 046: Criar tabela demands
--
-- Demandas vinculadas a projetos. Podem ser criadas manualmente ou
-- sincronizadas via Notion (edge function notion-sync-projects-demands).
--
-- IDEMPOTENTE: seguro executar múltiplas vezes.
-- ============================================================================

CREATE TABLE IF NOT EXISTS demands (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id     UUID REFERENCES projects(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'A fazer',
  responsible    TEXT,
  due_date       DATE,
  bus            TEXT[],
  notion_url     TEXT,
  notion_page_id TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS demands_tenant_id_idx  ON demands(tenant_id);
CREATE INDEX IF NOT EXISTS demands_project_id_idx ON demands(project_id);
CREATE INDEX IF NOT EXISTS demands_status_idx     ON demands(status);

-- RLS
ALTER TABLE demands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "demands_select" ON demands;
DROP POLICY IF EXISTS "demands_insert" ON demands;
DROP POLICY IF EXISTS "demands_update" ON demands;
DROP POLICY IF EXISTS "demands_delete" ON demands;

CREATE POLICY "demands_select" ON demands
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "demands_insert" ON demands
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "demands_update" ON demands
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "demands_delete" ON demands
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
