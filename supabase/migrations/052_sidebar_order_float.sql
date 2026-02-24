-- ============================================================================
-- Migration 052: Converter order_index para DOUBLE PRECISION
-- ============================================================================
-- O SidebarService usa steps fracionários (0.01) para ordenar children dentro
-- de workspaces. O tipo INTEGER original trunca esses valores e a constraint
-- UNIQUE(tenant_id, order_index) causa conflitos durante reordenamento.
-- Esta migração converte para DOUBLE PRECISION e remove a constraint UNIQUE
-- (mantendo um índice não-único para performance).
-- ============================================================================

DO $$
BEGIN
  -- 1. Dropar o constraint UNIQUE se existir
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sidebar_items_tenant_id_order_index_key'
  ) THEN
    ALTER TABLE sidebar_items DROP CONSTRAINT sidebar_items_tenant_id_order_index_key;
    RAISE NOTICE '[052] Dropped UNIQUE(tenant_id, order_index) constraint.';
  END IF;

  -- 2. Alterar tipo de INTEGER para DOUBLE PRECISION
  ALTER TABLE sidebar_items
    ALTER COLUMN order_index TYPE DOUBLE PRECISION USING order_index::DOUBLE PRECISION;
  RAISE NOTICE '[052] Changed order_index from INTEGER to DOUBLE PRECISION.';

  -- 3. Dropar índice antigo se existir
  DROP INDEX IF EXISTS idx_sidebar_items_order;

  -- 4. Recriar índice não-único para performance de queries ORDER BY
  CREATE INDEX IF NOT EXISTS idx_sidebar_items_order
    ON sidebar_items (tenant_id, order_index);
  RAISE NOTICE '[052] Recreated non-unique index on (tenant_id, order_index).';
END $$;
