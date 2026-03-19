-- ── Integração Contábil: Plano de Contas + DRE Snapshots ─────────────────────
-- Item 07 — finance accounting module

-- Plano de contas (chart of accounts)
CREATE TABLE IF NOT EXISTS finance_chart_of_accounts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code          text NOT NULL,                        -- e.g. "3.1.1.01"
  name          text NOT NULL,
  dre_group     text NOT NULL,                        -- 'receita_bruta' | 'deducoes' | 'custo_producao' | 'despesa_pessoal' | 'despesa_marketing' | 'despesa_admin' | 'despesa_tecnologia' | 'despesa_financeira' | 'depreciacao' | 'impostos_renda' | 'outros'
  dre_order     integer NOT NULL DEFAULT 0,           -- display order within group
  tipo          text NOT NULL CHECK (tipo IN ('receita', 'despesa', 'neutro')),
  is_active     boolean NOT NULL DEFAULT true,
  omie_id       text,
  parent_id     uuid REFERENCES finance_chart_of_accounts(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- DRE monthly snapshots
CREATE TABLE IF NOT EXISTS finance_dre_snapshots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  month           text NOT NULL,                    -- 'YYYY-MM'
  -- Receita
  receita_bruta   numeric(15,2) NOT NULL DEFAULT 0,
  deducoes        numeric(15,2) NOT NULL DEFAULT 0, -- impostos (ISS, PIS, COFINS, etc.)
  receita_liquida numeric(15,2) GENERATED ALWAYS AS (receita_bruta - deducoes) STORED,
  -- Custos
  custo_producao  numeric(15,2) NOT NULL DEFAULT 0,
  lucro_bruto     numeric(15,2) GENERATED ALWAYS AS (receita_bruta - deducoes - custo_producao) STORED,
  -- Despesas operacionais
  desp_pessoal    numeric(15,2) NOT NULL DEFAULT 0,
  desp_marketing  numeric(15,2) NOT NULL DEFAULT 0,
  desp_admin      numeric(15,2) NOT NULL DEFAULT 0,
  desp_tecnologia numeric(15,2) NOT NULL DEFAULT 0,
  desp_outros     numeric(15,2) NOT NULL DEFAULT 0,
  total_desp_op   numeric(15,2) GENERATED ALWAYS AS (desp_pessoal + desp_marketing + desp_admin + desp_tecnologia + desp_outros) STORED,
  -- EBITDA
  ebitda          numeric(15,2) GENERATED ALWAYS AS (receita_bruta - deducoes - custo_producao - desp_pessoal - desp_marketing - desp_admin - desp_tecnologia - desp_outros) STORED,
  -- Depreciação / Amortização
  depreciacao     numeric(15,2) NOT NULL DEFAULT 0,
  ebit            numeric(15,2) GENERATED ALWAYS AS (receita_bruta - deducoes - custo_producao - desp_pessoal - desp_marketing - desp_admin - desp_tecnologia - desp_outros - depreciacao) STORED,
  -- Resultado financeiro
  result_financeiro numeric(15,2) NOT NULL DEFAULT 0,  -- positivo = receita fin., negativo = despesa
  lair            numeric(15,2) GENERATED ALWAYS AS (receita_bruta - deducoes - custo_producao - desp_pessoal - desp_marketing - desp_admin - desp_tecnologia - desp_outros - depreciacao + result_financeiro) STORED,
  -- Impostos sobre renda
  irpj_csll       numeric(15,2) NOT NULL DEFAULT 0,
  lucro_liquido   numeric(15,2) GENERATED ALWAYS AS (receita_bruta - deducoes - custo_producao - desp_pessoal - desp_marketing - desp_admin - desp_tecnologia - desp_outros - depreciacao + result_financeiro - irpj_csll) STORED,
  -- Meta
  meta_receita    numeric(15,2),
  meta_ebitda     numeric(15,2),
  -- Controle
  source          text NOT NULL DEFAULT 'omie',   -- 'omie' | 'manual'
  notes           text,
  computed_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, month)
);

-- RLS
ALTER TABLE finance_chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_dre_snapshots ENABLE ROW LEVEL SECURITY;

-- Plano de contas: diretoria+ read, founder write
CREATE POLICY "finance_chart_of_accounts_select" ON finance_chart_of_accounts
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles
      WHERE id = auth.uid() AND role IN ('founder', 'diretoria', 'lider', 'colaborador')
    )
  );

CREATE POLICY "finance_chart_of_accounts_insert" ON finance_chart_of_accounts
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles
      WHERE id = auth.uid() AND role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "finance_chart_of_accounts_update" ON finance_chart_of_accounts
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles
      WHERE id = auth.uid() AND role IN ('founder', 'diretoria')
    )
  );

-- DRE snapshots: diretoria+ only
CREATE POLICY "finance_dre_snapshots_select" ON finance_dre_snapshots
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles
      WHERE id = auth.uid() AND role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "finance_dre_snapshots_insert" ON finance_dre_snapshots
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles
      WHERE id = auth.uid() AND role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "finance_dre_snapshots_update" ON finance_dre_snapshots
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles
      WHERE id = auth.uid() AND role IN ('founder', 'diretoria')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_finance_chart_of_accounts_tenant ON finance_chart_of_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_dre_snapshots_tenant_month ON finance_dre_snapshots(tenant_id, month DESC);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_finance_accounting_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_finance_chart_updated_at
  BEFORE UPDATE ON finance_chart_of_accounts
  FOR EACH ROW EXECUTE FUNCTION update_finance_accounting_updated_at();

CREATE TRIGGER trg_finance_dre_updated_at
  BEFORE UPDATE ON finance_dre_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_finance_accounting_updated_at();
