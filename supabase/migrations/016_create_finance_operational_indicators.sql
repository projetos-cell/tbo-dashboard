-- Migration 016: Create finance_operational_indicators table
-- Manual input for operational metrics (headcount, payroll, fixed costs, targets)
-- These values override/complement Omie-calculated values in the dashboard.

CREATE TABLE finance_operational_indicators (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  month text NOT NULL,                    -- "2026-03" (YYYY-MM)
  headcount integer,
  folha_pagamento numeric(15,2),
  custos_fixos numeric(15,2),
  meta_receita numeric(15,2),
  meta_margem numeric(5,2),               -- percentual (ex: 35.00 = 35%)
  churn_clientes_perdidos integer,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, month)
);

-- RLS
ALTER TABLE finance_operational_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON finance_operational_indicators
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

-- Index for fast lookups by tenant + month
CREATE INDEX idx_fin_op_indicators_tenant_month
  ON finance_operational_indicators(tenant_id, month);
