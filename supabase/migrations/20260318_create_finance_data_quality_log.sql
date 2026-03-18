-- Finance Data Quality Log
-- Tracks periodic data quality checks and corrections

CREATE TABLE IF NOT EXISTS finance_data_quality_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  trigger_source text NOT NULL DEFAULT 'cron', -- 'cron' | 'manual'

  -- Phase results
  paid_amount_fixed int NOT NULL DEFAULT 0,
  status_fixed int NOT NULL DEFAULT 0,
  counterpart_resolved int NOT NULL DEFAULT 0,
  rateio_split int NOT NULL DEFAULT 0,
  reconciled int NOT NULL DEFAULT 0,
  anomalies_flagged int NOT NULL DEFAULT 0,

  -- Confidence score (0-100)
  confidence_score numeric(5,2),

  -- Details
  details jsonb NOT NULL DEFAULT '[]'::jsonb,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add data_quality_flags column to finance_transactions for anomaly tracking
ALTER TABLE finance_transactions
  ADD COLUMN IF NOT EXISTS dq_flags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dq_last_checked_at timestamptz;

-- RLS
ALTER TABLE finance_data_quality_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "finance_dq_log_tenant_isolation" ON finance_data_quality_log
  FOR ALL USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Index for cron lookups
CREATE INDEX IF NOT EXISTS idx_finance_dq_log_tenant_started
  ON finance_data_quality_log(tenant_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_finance_tx_dq_flags
  ON finance_transactions USING gin(dq_flags) WHERE array_length(dq_flags, 1) > 0;
