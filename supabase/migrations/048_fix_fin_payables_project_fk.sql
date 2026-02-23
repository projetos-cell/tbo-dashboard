-- ============================================================================
-- TBO OS — Migration 048: Fix fin_payables → projects FK relationship
--
-- PostgREST/Supabase requires a foreign key to resolve the join
-- `project:projects(name)` used in the financeiro queries.
-- The FK may be missing if the projects table was created after fin_payables.
--
-- Also adds FK for fin_receivables and fin_transactions → projects.
--
-- IDEMPOTENTE: seguro executar múltiplas vezes.
-- ============================================================================

-- ── 1. fin_payables.project_id → projects(id) ──────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fin_payables_project_id_fkey'
      AND table_name = 'fin_payables'
  ) THEN
    ALTER TABLE fin_payables
      ADD CONSTRAINT fin_payables_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id);
  END IF;
END$$;

-- ── 2. fin_receivables.project_id → projects(id) ───────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fin_receivables_project_id_fkey'
      AND table_name = 'fin_receivables'
  ) THEN
    ALTER TABLE fin_receivables
      ADD CONSTRAINT fin_receivables_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id);
  END IF;
END$$;

-- ── 3. fin_transactions.project_id → projects(id) ──────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fin_transactions_project_id_fkey'
      AND table_name = 'fin_transactions'
  ) THEN
    ALTER TABLE fin_transactions
      ADD CONSTRAINT fin_transactions_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id);
  END IF;
END$$;

-- ── 4. Index para performance do join ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_fin_payables_project ON fin_payables(project_id);
