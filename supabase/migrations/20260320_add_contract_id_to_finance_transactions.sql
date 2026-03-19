-- Add contract_id to finance_transactions for automatic contract revenue generation
ALTER TABLE finance_transactions
  ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL;

-- Index for fast lookups by contract + date range (idempotency checks)
CREATE INDEX IF NOT EXISTS idx_finance_transactions_contract_id
  ON finance_transactions(contract_id)
  WHERE contract_id IS NOT NULL;

-- Composite index for idempotent contract revenue generation
CREATE INDEX IF NOT EXISTS idx_finance_transactions_contract_month
  ON finance_transactions(contract_id, date)
  WHERE contract_id IS NOT NULL;

COMMENT ON COLUMN finance_transactions.contract_id IS 'FK to contracts table — set when transaction was auto-generated from a contract';
