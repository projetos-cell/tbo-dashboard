-- Track how a transaction was confirmed as paid: 'manual' (user reconciliation), 'auto' (data-quality cron), 'omie' (OMIE sync)
-- When reconciled_source IN ('manual', 'auto'), OMIE sync should NOT overwrite status/paid_date/paid_amount
ALTER TABLE finance_transactions
  ADD COLUMN IF NOT EXISTS reconciled_source TEXT DEFAULT NULL
  CHECK (reconciled_source IN ('manual', 'auto', 'omie', NULL));

CREATE INDEX IF NOT EXISTS idx_finance_transactions_reconciled_source
  ON finance_transactions(reconciled_source)
  WHERE reconciled_source IS NOT NULL;

COMMENT ON COLUMN finance_transactions.reconciled_source IS 'Source of payment confirmation: manual (user), auto (data-quality cron), omie (OMIE sync). Used to prevent OMIE from overwriting native reconciliation.';
