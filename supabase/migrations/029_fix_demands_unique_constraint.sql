-- ============================================================================
-- TBO OS — Migration 029: Fix demands unique constraint
-- PostgREST nao suporta ON CONFLICT com partial unique indexes.
-- Solucao: adicionar UNIQUE constraint direta em notion_page_id.
-- ============================================================================

-- Remover o index parcial que nao funciona com upsert
DROP INDEX IF EXISTS idx_demands_notion_page_id;

-- Adicionar UNIQUE constraint direta (aceita NULLs multiplos por padrao no PG15+)
ALTER TABLE demands ADD CONSTRAINT uq_demands_notion_page_id UNIQUE (notion_page_id);

-- Fazer o mesmo para projects (substituir index parcial por constraint)
DROP INDEX IF EXISTS idx_projects_notion_page_id;
ALTER TABLE projects ADD CONSTRAINT uq_projects_notion_page_id UNIQUE (notion_page_id);
