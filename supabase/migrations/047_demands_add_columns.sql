-- ============================================================================
-- TBO OS — Migration 047: Adicionar colunas à tabela demands
--
-- Adiciona as colunas do Notion CSV: due_date_end, prioridade, info,
-- formalizacao, tipo_midia, subitem, item_principal, feito, milestones,
-- notion_project_name (nome do projeto vindo do Notion).
--
-- IDEMPOTENTE: seguro executar múltiplas vezes.
-- ============================================================================

ALTER TABLE demands
  ADD COLUMN IF NOT EXISTS due_date_end       DATE,
  ADD COLUMN IF NOT EXISTS prioridade         TEXT,
  ADD COLUMN IF NOT EXISTS info               TEXT,
  ADD COLUMN IF NOT EXISTS formalizacao       TEXT,
  ADD COLUMN IF NOT EXISTS tipo_midia         TEXT[],
  ADD COLUMN IF NOT EXISTS subitem            TEXT,
  ADD COLUMN IF NOT EXISTS item_principal     TEXT,
  ADD COLUMN IF NOT EXISTS feito              BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS milestones         TEXT,
  ADD COLUMN IF NOT EXISTS notion_project_name TEXT;

-- Índice para filtro por prioridade
CREATE INDEX IF NOT EXISTS demands_prioridade_idx
  ON demands(prioridade)
  WHERE prioridade IS NOT NULL;

-- Índice para filtro por due_date range
CREATE INDEX IF NOT EXISTS demands_due_date_range_idx
  ON demands(tenant_id, due_date, due_date_end)
  WHERE due_date IS NOT NULL;

-- ============================================================================
-- FIM DA MIGRATION 047
-- ============================================================================
