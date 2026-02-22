-- ============================================================================
-- TBO OS — Migration 030: Fix projects status check constraint
-- Adiciona status do Notion (parado, em_andamento, finalizado) ao constraint.
-- ============================================================================

-- Remover constraint existente
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Recriar com todos os status possiveis (existentes + Notion)
ALTER TABLE projects ADD CONSTRAINT projects_status_check
  CHECK (status IN (
    -- Status originais do TBO OS
    'briefing', 'planejamento', 'em_andamento', 'revisao',
    'aprovacao', 'entrega', 'finalizado', 'cancelado', 'archived',
    -- Status vindos do Notion
    'parado',
    -- Outros status existentes no banco
    'pausado', 'aguardando', 'producao'
  ));
