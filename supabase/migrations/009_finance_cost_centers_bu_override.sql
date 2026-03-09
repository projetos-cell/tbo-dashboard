-- G5: Adicionar business_unit_override em finance_cost_centers
-- Migration 009: Permite definir BU manualmente, com prioridade sobre derivação por regex
--
-- REGRA: NUNCA modificar migrations existentes — sempre criar nova
-- Autor: Claude (omie-fix G5)
-- Data: 2026-03-09

ALTER TABLE finance_cost_centers
  ADD COLUMN IF NOT EXISTS business_unit_override TEXT;

COMMENT ON COLUMN finance_cost_centers.business_unit_override IS
  'BU explícita definida manualmente via Supabase ou interface admin. '
  'Tem prioridade absoluta sobre derivação por regex no omie-sync. '
  'Valores válidos: TBO, TBO Content, TBO Strategy, TBO Performance, TBO Creative, Matriz, etc. '
  'NULL = usar fallback regex automático.';
