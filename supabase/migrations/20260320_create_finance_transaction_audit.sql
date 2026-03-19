-- Audit trail for manual changes to finance transactions (status, amount, etc.)
CREATE TABLE IF NOT EXISTS finance_transaction_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  transaction_id UUID NOT NULL REFERENCES finance_transactions(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'auto', 'omie', 'system'))
);

ALTER TABLE finance_transaction_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "finance_tx_audit_tenant_isolation" ON finance_transaction_audit
  FOR ALL USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE INDEX idx_finance_tx_audit_transaction ON finance_transaction_audit(transaction_id, changed_at DESC);
CREATE INDEX idx_finance_tx_audit_tenant ON finance_transaction_audit(tenant_id, changed_at DESC);

COMMENT ON TABLE finance_transaction_audit IS 'Audit trail for manual changes to finance transactions — who changed what, when, from/to';
