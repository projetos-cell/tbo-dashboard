-- ============================================
-- TBO OS — Migration 017: Financeiro MVP
-- Estende tabelas financeiras existentes (003_v4_financeiro)
-- Adiciona: approval workflow, auditoria, cost center categories,
--           balance snapshots, índices adicionais, seeds.
-- ============================================

-- ─── 1. ESTENDER fin_payables: approval workflow + auditoria ────────────

-- Remover constraint antiga e recriar com novos status
ALTER TABLE fin_payables
  DROP CONSTRAINT IF EXISTS fin_payables_status_check;

ALTER TABLE fin_payables
  ADD CONSTRAINT fin_payables_status_check
    CHECK (status IN ('rascunho','aguardando_aprovacao','aprovado','aberto','parcial','pago','atrasado','cancelado'));

ALTER TABLE fin_payables
  ALTER COLUMN status SET DEFAULT 'rascunho';

-- Colunas de auditoria e aprovação
ALTER TABLE fin_payables
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- ─── 2. ESTENDER fin_receivables: workflow + auditoria ──────────────────

ALTER TABLE fin_receivables
  DROP CONSTRAINT IF EXISTS fin_receivables_status_check;

ALTER TABLE fin_receivables
  ADD CONSTRAINT fin_receivables_status_check
    CHECK (status IN ('previsto','emitido','aberto','parcial','pago','atrasado','cancelado'));

ALTER TABLE fin_receivables
  ALTER COLUMN status SET DEFAULT 'previsto';

ALTER TABLE fin_receivables
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- ─── 3. ESTENDER fin_cost_centers: macro-category + requires_project ────

ALTER TABLE fin_cost_centers
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS requires_project BOOLEAN DEFAULT false;

-- ─── 4. TABELA DE SALDO MANUAL (snapshots) ─────────────────────────────

CREATE TABLE IF NOT EXISTS fin_balance_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    balance NUMERIC(15,2) NOT NULL,
    note TEXT,
    recorded_by UUID REFERENCES auth.users(id),
    recorded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fin_balance_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies para balance snapshots
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fin_balance_read' AND tablename = 'fin_balance_snapshots') THEN
    CREATE POLICY "fin_balance_read" ON fin_balance_snapshots FOR SELECT TO authenticated
      USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fin_balance_insert' AND tablename = 'fin_balance_snapshots') THEN
    CREATE POLICY "fin_balance_insert" ON fin_balance_snapshots FOR INSERT TO authenticated
      WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
  END IF;
END$$;

-- ─── 5. WRITE POLICIES PARA VENDORS E CLIENTS (CRUD completo) ──────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fin_vendors_insert' AND tablename = 'fin_vendors') THEN
    CREATE POLICY "fin_vendors_insert" ON fin_vendors FOR INSERT TO authenticated
      WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fin_vendors_update' AND tablename = 'fin_vendors') THEN
    CREATE POLICY "fin_vendors_update" ON fin_vendors FOR UPDATE TO authenticated
      USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fin_clients_insert' AND tablename = 'fin_clients') THEN
    CREATE POLICY "fin_clients_insert" ON fin_clients FOR INSERT TO authenticated
      WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fin_clients_update' AND tablename = 'fin_clients') THEN
    CREATE POLICY "fin_clients_update" ON fin_clients FOR UPDATE TO authenticated
      USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fin_cost_centers_insert' AND tablename = 'fin_cost_centers') THEN
    CREATE POLICY "fin_cost_centers_insert" ON fin_cost_centers FOR INSERT TO authenticated
      WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fin_cost_centers_update' AND tablename = 'fin_cost_centers') THEN
    CREATE POLICY "fin_cost_centers_update" ON fin_cost_centers FOR UPDATE TO authenticated
      USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
  END IF;
END$$;

-- ─── 6. ÍNDICES ADICIONAIS ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_fin_payables_cost_center ON fin_payables(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_fin_payables_vendor ON fin_payables(vendor_id);
CREATE INDEX IF NOT EXISTS idx_fin_payables_created_by ON fin_payables(created_by);
CREATE INDEX IF NOT EXISTS idx_fin_receivables_client ON fin_receivables(client_id);
CREATE INDEX IF NOT EXISTS idx_fin_receivables_project ON fin_receivables(project_id);
CREATE INDEX IF NOT EXISTS idx_fin_balance_tenant ON fin_balance_snapshots(tenant_id, recorded_at DESC);

-- ─── 7. SEED: Atualizar centros de custo com categorias ─────────────────

UPDATE fin_cost_centers SET category = 'Projetos & Produção', requires_project = true
  WHERE slug IN ('digital-3d','branding','audiovisual','interiores','gamificacao');

UPDATE fin_cost_centers SET category = 'Infraestrutura & Operação'
  WHERE slug IN ('administrativo','academy');

UPDATE fin_cost_centers SET category = 'Financeiro & Encargos'
  WHERE slug IN ('marketing');

-- Inserir novos centros de custo
INSERT INTO fin_cost_centers (tenant_id, name, slug, category, requires_project)
  SELECT id, 'Equipe / Pessoas', 'equipe-pessoas', 'Financeiro & Encargos', false FROM tenants WHERE slug = 'tbo'
  ON CONFLICT (tenant_id, slug) DO NOTHING;

INSERT INTO fin_cost_centers (tenant_id, name, slug, category, requires_project)
  SELECT id, 'Impostos & Encargos', 'impostos-encargos', 'Financeiro & Encargos', false FROM tenants WHERE slug = 'tbo'
  ON CONFLICT (tenant_id, slug) DO NOTHING;

INSERT INTO fin_cost_centers (tenant_id, name, slug, category, requires_project)
  SELECT id, 'Comercial', 'comercial', 'Infraestrutura & Operação', false FROM tenants WHERE slug = 'tbo'
  ON CONFLICT (tenant_id, slug) DO NOTHING;
