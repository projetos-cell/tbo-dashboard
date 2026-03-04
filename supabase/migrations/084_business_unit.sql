-- 084_business_unit.sql
-- FASE 2: Business Unit categorization + project linking
-- Adds business_unit column to finance_transactions for revenue-per-BU analysis.

BEGIN;

-- ── 1. Add business_unit column ───────────────────────────────────────────────
ALTER TABLE finance_transactions
  ADD COLUMN IF NOT EXISTS business_unit TEXT;

-- ── 2. Add CHECK constraint for allowed BU values ─────────────────────────────
-- NULL is allowed (not all transactions belong to a BU, e.g. overhead expenses)
ALTER TABLE finance_transactions
  ADD CONSTRAINT finance_transactions_business_unit_check
  CHECK (business_unit IS NULL OR business_unit IN (
    'Branding',
    'Digital 3D',
    'Marketing',
    'Audiovisual',
    'Interiores'
  ));

-- ── 3. Index for BU-based queries ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_finance_tx_bu
  ON finance_transactions (tenant_id, business_unit)
  WHERE business_unit IS NOT NULL;

-- ── 4. Index for project-based queries (project_id column already exists) ─────
CREATE INDEX IF NOT EXISTS idx_finance_tx_project
  ON finance_transactions (tenant_id, project_id)
  WHERE project_id IS NOT NULL;

COMMIT;
