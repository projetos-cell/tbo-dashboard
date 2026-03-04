-- 083_finance_status_expansion.sql
-- FASE 1: Reestruturação de Confiabilidade Financeira
-- Expands finance_transactions.status to new values, migrates data,
-- adds responsible_id column, and recreates indexes.

BEGIN;

-- ── 1. Migrate existing data to new statuses ────────────────────────────────
UPDATE finance_transactions SET status = 'previsto'      WHERE status = 'pendente';
UPDATE finance_transactions SET status = 'provisionado'  WHERE status = 'parcial';

-- ── 2. Drop old CHECK constraint and create new one ─────────────────────────
-- The constraint name may vary; try common patterns.
DO $$
BEGIN
  -- Try dropping by known possible names
  BEGIN
    ALTER TABLE finance_transactions DROP CONSTRAINT IF EXISTS finance_transactions_status_check;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  BEGIN
    ALTER TABLE finance_transactions DROP CONSTRAINT IF EXISTS finance_transactions_check;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  BEGIN
    ALTER TABLE finance_transactions DROP CONSTRAINT IF EXISTS chk_finance_status;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
END $$;

-- Add new CHECK with expanded statuses
ALTER TABLE finance_transactions
  ADD CONSTRAINT finance_transactions_status_check
  CHECK (status IN ('previsto', 'provisionado', 'pago', 'atrasado', 'recorrente', 'cancelado'));

-- ── 3. Add responsible_id column ────────────────────────────────────────────
ALTER TABLE finance_transactions
  ADD COLUMN IF NOT EXISTS responsible_id UUID REFERENCES profiles(id);

-- ── 4. Recreate partial indexes for new statuses ────────────────────────────
DROP INDEX IF EXISTS idx_finance_tx_pending_due;
DROP INDEX IF EXISTS idx_finance_tx_paid_date;

CREATE INDEX idx_finance_tx_open_due
  ON finance_transactions (tenant_id, due_date)
  WHERE status IN ('previsto', 'provisionado', 'atrasado');

CREATE INDEX idx_finance_tx_paid
  ON finance_transactions (tenant_id, paid_date)
  WHERE status = 'pago';

-- ── 5. Add sort column to user_table_preferences ────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_table_preferences'
  ) THEN
    ALTER TABLE user_table_preferences
      ADD COLUMN IF NOT EXISTS sort JSONB DEFAULT '{}';
  END IF;
END $$;

COMMIT;
