-- ============================================================================
-- TBO OS — Migration 082: Financeiro Reset
-- Cria schema financeiro simplificado (finance_*) com RLS restrito a
-- founder/owner/diretoria. Tabelas antigas fin_* permanecem intactas
-- (deprecated) para referencia e rollback.
-- ============================================================================

-- ──────────────────────────────────────────────
-- HELPER: funcao reutilizavel para checar role financeiro
-- Retorna TRUE se o usuario autenticado tem role founder/owner/diretoria
-- no tenant informado.
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_finance_admin(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tenant_members tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = auth.uid()
      AND tm.tenant_id = p_tenant_id
      AND tm.is_active = TRUE
      AND r.slug IN ('founder', 'owner', 'diretoria')
  );
$$;

GRANT EXECUTE ON FUNCTION is_finance_admin(UUID) TO authenticated;

COMMENT ON FUNCTION is_finance_admin(UUID) IS
  'Retorna TRUE se o usuario autenticado tem role founder/owner/diretoria '
  'no tenant informado. Usada nas RLS policies do modulo financeiro.';


-- ──────────────────────────────────────────────
-- 1. finance_categories
-- Categorias de receita/despesa (simplificado)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'despesa'
                  CHECK (type IN ('receita', 'despesa')),
  omie_id         TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE finance_categories
  ADD CONSTRAINT uq_finance_categories_tenant_omie UNIQUE (tenant_id, omie_id);

CREATE INDEX IF NOT EXISTS idx_finance_categories_tenant
  ON finance_categories(tenant_id, is_active);

-- Trigger updated_at
CREATE OR REPLACE TRIGGER trg_finance_categories_updated
  BEFORE UPDATE ON finance_categories
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- RLS
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY finance_categories_select ON finance_categories
  FOR SELECT USING (is_finance_admin(tenant_id));

CREATE POLICY finance_categories_insert ON finance_categories
  FOR INSERT WITH CHECK (is_finance_admin(tenant_id));

CREATE POLICY finance_categories_update ON finance_categories
  FOR UPDATE USING (is_finance_admin(tenant_id));

CREATE POLICY finance_categories_delete ON finance_categories
  FOR DELETE USING (is_finance_admin(tenant_id));


-- ──────────────────────────────────────────────
-- 2. finance_cost_centers
-- Centros de custo
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_cost_centers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code            TEXT NOT NULL,
  name            TEXT NOT NULL,
  omie_id         TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE finance_cost_centers
  ADD CONSTRAINT uq_finance_cost_centers_tenant_omie UNIQUE (tenant_id, omie_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_finance_cost_centers_code
  ON finance_cost_centers(tenant_id, code);

CREATE INDEX IF NOT EXISTS idx_finance_cost_centers_tenant
  ON finance_cost_centers(tenant_id, is_active);

CREATE OR REPLACE TRIGGER trg_finance_cost_centers_updated
  BEFORE UPDATE ON finance_cost_centers
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- RLS
ALTER TABLE finance_cost_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY finance_cost_centers_select ON finance_cost_centers
  FOR SELECT USING (is_finance_admin(tenant_id));

CREATE POLICY finance_cost_centers_insert ON finance_cost_centers
  FOR INSERT WITH CHECK (is_finance_admin(tenant_id));

CREATE POLICY finance_cost_centers_update ON finance_cost_centers
  FOR UPDATE USING (is_finance_admin(tenant_id));

CREATE POLICY finance_cost_centers_delete ON finance_cost_centers
  FOR DELETE USING (is_finance_admin(tenant_id));


-- ──────────────────────────────────────────────
-- 3. finance_transactions
-- Tabela central de transacoes financeiras
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Classificacao
  type            TEXT NOT NULL DEFAULT 'despesa'
                  CHECK (type IN ('receita', 'despesa', 'transferencia')),
  status          TEXT NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado', 'parcial')),

  -- Descritivo
  description     TEXT NOT NULL,
  notes           TEXT,
  tags            TEXT[] DEFAULT '{}',

  -- Valores
  amount          NUMERIC(15,2) NOT NULL DEFAULT 0,
  paid_amount     NUMERIC(15,2) DEFAULT 0,

  -- Datas
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE,
  paid_date       DATE,

  -- Relacionamentos
  category_id     UUID REFERENCES finance_categories(id) ON DELETE SET NULL,
  cost_center_id  UUID REFERENCES finance_cost_centers(id) ON DELETE SET NULL,
  project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Contraparte (fornecedor/cliente inline — sem tabela separada)
  counterpart     TEXT,
  counterpart_doc TEXT,

  -- Pagamento
  payment_method  TEXT,
  bank_account    TEXT,

  -- Omie sync
  omie_id         TEXT,
  omie_synced_at  TIMESTAMPTZ,
  omie_raw        JSONB,

  -- Audit
  created_by      UUID REFERENCES auth.users(id),
  updated_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
ALTER TABLE finance_transactions
  ADD CONSTRAINT uq_finance_transactions_tenant_omie UNIQUE (tenant_id, omie_id);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_tenant
  ON finance_transactions(tenant_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_status
  ON finance_transactions(tenant_id, status) WHERE status != 'cancelado';

CREATE INDEX IF NOT EXISTS idx_finance_transactions_type
  ON finance_transactions(tenant_id, type, date DESC);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_due
  ON finance_transactions(tenant_id, due_date)
  WHERE due_date IS NOT NULL AND status IN ('pendente', 'atrasado');

CREATE INDEX IF NOT EXISTS idx_finance_transactions_project
  ON finance_transactions(project_id) WHERE project_id IS NOT NULL;

CREATE OR REPLACE TRIGGER trg_finance_transactions_updated
  BEFORE UPDATE ON finance_transactions
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- RLS
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY finance_transactions_select ON finance_transactions
  FOR SELECT USING (is_finance_admin(tenant_id));

CREATE POLICY finance_transactions_insert ON finance_transactions
  FOR INSERT WITH CHECK (is_finance_admin(tenant_id));

CREATE POLICY finance_transactions_update ON finance_transactions
  FOR UPDATE USING (is_finance_admin(tenant_id));

CREATE POLICY finance_transactions_delete ON finance_transactions
  FOR DELETE USING (is_finance_admin(tenant_id));


-- ──────────────────────────────────────────────
-- 4. finance_snapshots_daily
-- Snapshot diario de saldo/receita/despesa para graficos
-- Populado via Edge Function ou cron
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_snapshots_daily (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  snapshot_date   DATE NOT NULL,

  -- Totais do dia
  total_receitas  NUMERIC(15,2) DEFAULT 0,
  total_despesas  NUMERIC(15,2) DEFAULT 0,
  saldo_dia       NUMERIC(15,2) DEFAULT 0,

  -- Acumulados
  saldo_acumulado NUMERIC(15,2) DEFAULT 0,

  -- Contas a pagar/receber em aberto no dia
  payables_open   NUMERIC(15,2) DEFAULT 0,
  receivables_open NUMERIC(15,2) DEFAULT 0,

  -- Meta
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_finance_snapshots_tenant
  ON finance_snapshots_daily(tenant_id, snapshot_date DESC);

-- RLS
ALTER TABLE finance_snapshots_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY finance_snapshots_daily_select ON finance_snapshots_daily
  FOR SELECT USING (is_finance_admin(tenant_id));

CREATE POLICY finance_snapshots_daily_insert ON finance_snapshots_daily
  FOR INSERT WITH CHECK (is_finance_admin(tenant_id));

CREATE POLICY finance_snapshots_daily_update ON finance_snapshots_daily
  FOR UPDATE USING (is_finance_admin(tenant_id));


-- ──────────────────────────────────────────────
-- 5. Realtime — habilitar para finance_transactions
-- (permite subscription no frontend para sync status)
-- ──────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE finance_transactions;


-- ──────────────────────────────────────────────
-- 6. Seed — categorias e centros de custo padrao
-- (roda apenas se tabelas estao vazias)
-- ──────────────────────────────────────────────
DO $$
DECLARE
  v_tid UUID;
BEGIN
  SELECT id INTO v_tid FROM tenants WHERE slug = 'tbo';
  IF v_tid IS NULL THEN RETURN; END IF;

  -- Categorias padrao
  IF NOT EXISTS (SELECT 1 FROM finance_categories WHERE tenant_id = v_tid) THEN
    INSERT INTO finance_categories (tenant_id, name, type) VALUES
      (v_tid, 'Servicos Prestados',     'receita'),
      (v_tid, 'Licenciamento',          'receita'),
      (v_tid, 'Reembolso',              'receita'),
      (v_tid, 'Salarios e Encargos',    'despesa'),
      (v_tid, 'Software e Ferramentas', 'despesa'),
      (v_tid, 'Infraestrutura',         'despesa'),
      (v_tid, 'Marketing',              'despesa'),
      (v_tid, 'Impostos',               'despesa'),
      (v_tid, 'Freelancers',            'despesa'),
      (v_tid, 'Outros',                 'despesa');
  END IF;

  -- Centros de custo padrao
  IF NOT EXISTS (SELECT 1 FROM finance_cost_centers WHERE tenant_id = v_tid) THEN
    INSERT INTO finance_cost_centers (tenant_id, code, name) VALUES
      (v_tid, 'ADM',  'Administrativo'),
      (v_tid, 'PROJ', 'Projetos'),
      (v_tid, 'COM',  'Comercial'),
      (v_tid, 'MKT',  'Marketing'),
      (v_tid, 'TI',   'Tecnologia'),
      (v_tid, 'RH',   'Recursos Humanos');
  END IF;
END$$;
