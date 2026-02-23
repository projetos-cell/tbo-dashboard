-- ============================================================================
-- TBO OS — Migration 028: Adiciona colunas Notion/operacionais à tabela projects
--
-- Adiciona os campos necessários para o Quadro de Projetos e sync com Notion:
--   - construtora  : nome do cliente/construtora
--   - bus          : business units envolvidas (array de texto)
--   - code         : código interno do projeto (ex: TBO-001)
--   - due_date_start : data de início prevista
--   - due_date_end   : data de entrega prevista
--   - notion_url     : URL da página no Notion
--   - notion_page_id : ID da página no Notion (para sync)
--
-- IDEMPOTENTE: usa ADD COLUMN IF NOT EXISTS em cada coluna.
-- ============================================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS construtora     TEXT,
  ADD COLUMN IF NOT EXISTS bus             TEXT[],
  ADD COLUMN IF NOT EXISTS code            TEXT,
  ADD COLUMN IF NOT EXISTS due_date_start  DATE,
  ADD COLUMN IF NOT EXISTS due_date_end    DATE,
  ADD COLUMN IF NOT EXISTS notion_url      TEXT,
  ADD COLUMN IF NOT EXISTS notion_page_id  TEXT;

-- ── Índices úteis para filtragem no Quadro de Projetos ───────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_tenant_construtora
  ON projects (tenant_id, construtora)
  WHERE construtora IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_notion_page_id
  ON projects (notion_page_id)
  WHERE notion_page_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_due_date_end
  ON projects (tenant_id, due_date_end)
  WHERE due_date_end IS NOT NULL;

-- ============================================================================
-- FIM DA MIGRATION 028
-- ============================================================================
