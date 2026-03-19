-- ── Recurring Transaction Rules ──────────────────────────────────────────────
-- Auto-generates monthly transactions for fixed expenses/revenues (softwares,
-- loans, accounting fees, associations, etc.) independent of OMIE sync status.

CREATE TABLE IF NOT EXISTS public.finance_recurring_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- What to generate
  type            TEXT NOT NULL DEFAULT 'despesa'
                  CHECK (type IN ('receita', 'despesa')),
  description     TEXT NOT NULL,
  amount          NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  category_id     UUID REFERENCES public.finance_categories(id) ON DELETE SET NULL,
  cost_center_id  UUID REFERENCES public.finance_cost_centers(id) ON DELETE SET NULL,
  counterpart     TEXT,
  counterpart_doc TEXT,
  payment_method  TEXT,
  bank_account    TEXT,
  business_unit   TEXT CHECK (business_unit IS NULL OR business_unit IN (
    'Branding', 'Digital 3D', 'Marketing', 'Audiovisual', 'Interiores'
  )),
  tags            TEXT[] DEFAULT '{}',

  -- When to generate
  frequency       TEXT NOT NULL DEFAULT 'monthly'
                  CHECK (frequency IN ('monthly')),
  day_of_month    INT NOT NULL DEFAULT 1 CHECK (day_of_month BETWEEN 1 AND 28),
  start_month     TEXT NOT NULL CHECK (start_month ~ '^\d{4}-\d{2}$'),
  end_month       TEXT CHECK (end_month IS NULL OR end_month ~ '^\d{4}-\d{2}$'),

  -- State
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  notes           TEXT,

  -- Audit
  created_by      UUID REFERENCES auth.users(id),
  updated_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK on finance_transactions to track which rule generated it
ALTER TABLE public.finance_transactions
  ADD COLUMN IF NOT EXISTS recurring_rule_id UUID
  REFERENCES public.finance_recurring_rules(id) ON DELETE SET NULL;

-- Prevent duplicate generation for the same rule + date
CREATE UNIQUE INDEX IF NOT EXISTS idx_ft_recurring_rule_date
  ON public.finance_transactions(recurring_rule_id, date)
  WHERE recurring_rule_id IS NOT NULL;

-- Query indices
CREATE INDEX IF NOT EXISTS idx_frr_tenant_active
  ON public.finance_recurring_rules(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ft_recurring_rule
  ON public.finance_transactions(recurring_rule_id)
  WHERE recurring_rule_id IS NOT NULL;

-- RLS (same pattern as finance_transactions: founder + diretoria)
ALTER TABLE public.finance_recurring_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "frr_select" ON public.finance_recurring_rules FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "frr_insert" ON public.finance_recurring_rules FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "frr_update" ON public.finance_recurring_rules FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "frr_delete" ON public.finance_recurring_rules FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role IN ('founder', 'diretoria')
    )
  );

-- Updated_at trigger
CREATE TRIGGER finance_recurring_rules_updated_at
  BEFORE UPDATE ON public.finance_recurring_rules
  FOR EACH ROW EXECUTE FUNCTION update_finance_accounting_updated_at();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.finance_recurring_rules;
