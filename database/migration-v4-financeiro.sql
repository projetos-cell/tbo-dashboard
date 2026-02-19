-- ============================================
-- TBO OS v2 — Migration v4: Schema Financeiro Nativo
-- Executar no Supabase SQL Editor
-- ============================================

-- 1. CATEGORIAS FINANCEIRAS
CREATE TABLE IF NOT EXISTS fin_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'transferencia')),
    parent_id UUID REFERENCES fin_categories(id),
    color TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

-- 2. CENTROS DE CUSTO
CREATE TABLE IF NOT EXISTS fin_cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

-- 3. FORNECEDORES
CREATE TABLE IF NOT EXISTS fin_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cnpj TEXT,
    email TEXT,
    phone TEXT,
    category TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CLIENTES FINANCEIROS
CREATE TABLE IF NOT EXISTS fin_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cnpj TEXT,
    email TEXT,
    phone TEXT,
    contact_name TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. NOTAS FISCAIS (antes de fin_transactions que referencia esta tabela)
CREATE TABLE IF NOT EXISTS fin_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    series TEXT,
    type TEXT CHECK (type IN ('nfse', 'nfe', 'nfce', 'outros')),
    client_id UUID REFERENCES fin_clients(id),
    vendor_id UUID REFERENCES fin_vendors(id),
    amount NUMERIC(15,2) NOT NULL,
    tax_amount NUMERIC(15,2) DEFAULT 0,
    issue_date DATE NOT NULL,
    status TEXT DEFAULT 'emitida' CHECK (status IN ('rascunho', 'emitida', 'cancelada', 'substituida')),
    pdf_url TEXT,
    xml_url TEXT,
    omie_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. LANCAMENTOS FINANCEIROS (tabela principal)
CREATE TABLE IF NOT EXISTS fin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'transferencia')),
    description TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    date DATE NOT NULL,
    due_date DATE,
    paid_date DATE,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado', 'parcial')),
    category_id UUID REFERENCES fin_categories(id),
    cost_center_id UUID REFERENCES fin_cost_centers(id),
    vendor_id UUID REFERENCES fin_vendors(id),
    client_id UUID REFERENCES fin_clients(id),
    project_id UUID REFERENCES projects(id),
    invoice_id UUID REFERENCES fin_invoices(id),
    recurrence TEXT CHECK (recurrence IN ('none', 'monthly', 'quarterly', 'semiannual', 'annual')),
    recurrence_end DATE,
    payment_method TEXT,
    bank_account TEXT,
    document_number TEXT,
    notes TEXT,
    tags TEXT[],
    omie_id TEXT,
    is_realized BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. CONTAS A RECEBER
CREATE TABLE IF NOT EXISTS fin_receivables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES fin_clients(id),
    project_id UUID REFERENCES projects(id),
    invoice_id UUID REFERENCES fin_invoices(id),
    description TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    amount_paid NUMERIC(15,2) DEFAULT 0,
    due_date DATE NOT NULL,
    paid_date DATE,
    status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'parcial', 'pago', 'atrasado', 'cancelado')),
    installment_number INT,
    installment_total INT,
    payment_method TEXT,
    notes TEXT,
    omie_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. CONTAS A PAGAR
CREATE TABLE IF NOT EXISTS fin_payables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES fin_vendors(id),
    project_id UUID REFERENCES projects(id),
    invoice_id UUID REFERENCES fin_invoices(id),
    description TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    amount_paid NUMERIC(15,2) DEFAULT 0,
    due_date DATE NOT NULL,
    paid_date DATE,
    status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'parcial', 'pago', 'atrasado', 'cancelado')),
    category_id UUID REFERENCES fin_categories(id),
    cost_center_id UUID REFERENCES fin_cost_centers(id),
    payment_method TEXT,
    notes TEXT,
    omie_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. IMPORTACOES BANCARIAS
CREATE TABLE IF NOT EXISTS bank_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('ofx', 'csv')),
    bank_name TEXT,
    account_number TEXT,
    period_start DATE,
    period_end DATE,
    transaction_count INT DEFAULT 0,
    matched_count INT DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    imported_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. TRANSACOES BANCARIAS (importadas de OFX/CSV)
CREATE TABLE IF NOT EXISTS bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_id UUID NOT NULL REFERENCES bank_imports(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    description TEXT,
    memo TEXT,
    fitid TEXT,
    type TEXT,
    balance NUMERIC(15,2),
    match_status TEXT DEFAULT 'unmatched' CHECK (match_status IN ('unmatched', 'matched', 'ignored', 'manual')),
    matched_transaction_id UUID REFERENCES fin_transactions(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. REGRAS DE CONCILIACAO
CREATE TABLE IF NOT EXISTS reconciliation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    match_field TEXT NOT NULL CHECK (match_field IN ('description', 'amount', 'both')),
    pattern TEXT NOT NULL,
    category_id UUID REFERENCES fin_categories(id),
    vendor_id UUID REFERENCES fin_vendors(id),
    client_id UUID REFERENCES fin_clients(id),
    auto_match BOOLEAN DEFAULT false,
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. AUDIT DE CONCILIACAO
CREATE TABLE IF NOT EXISTS reconciliation_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    bank_transaction_id UUID REFERENCES bank_transactions(id),
    fin_transaction_id UUID REFERENCES fin_transactions(id),
    action TEXT NOT NULL CHECK (action IN ('auto_match', 'manual_match', 'unmatch', 'ignore', 'create')),
    matched_by UUID REFERENCES auth.users(id),
    rule_id UUID REFERENCES reconciliation_rules(id),
    confidence NUMERIC(3,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_fin_transactions_tenant ON fin_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fin_transactions_date ON fin_transactions(date);
CREATE INDEX IF NOT EXISTS idx_fin_transactions_status ON fin_transactions(status);
CREATE INDEX IF NOT EXISTS idx_fin_transactions_type ON fin_transactions(type);
CREATE INDEX IF NOT EXISTS idx_fin_receivables_tenant ON fin_receivables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fin_receivables_due ON fin_receivables(due_date);
CREATE INDEX IF NOT EXISTS idx_fin_receivables_status ON fin_receivables(status);
CREATE INDEX IF NOT EXISTS idx_fin_payables_tenant ON fin_payables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fin_payables_due ON fin_payables(due_date);
CREATE INDEX IF NOT EXISTS idx_fin_payables_status ON fin_payables(status);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_import ON bank_transactions(import_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON bank_transactions(date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_match ON bank_transactions(match_status);

-- ============================================
-- SEED CATEGORIAS PADRAO
-- ============================================
INSERT INTO fin_categories (tenant_id, name, slug, type) VALUES
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Receita de Projetos', 'receita-projetos', 'receita'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Receita Recorrente', 'receita-recorrente', 'receita'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Receita Academy', 'receita-academy', 'receita'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Folha de Pagamento', 'folha-pagamento', 'despesa'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Fornecedores', 'fornecedores', 'despesa'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Software & Ferramentas', 'software-ferramentas', 'despesa'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Marketing & Vendas', 'marketing-vendas', 'despesa'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Infraestrutura', 'infraestrutura', 'despesa'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Impostos', 'impostos', 'despesa'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Outros', 'outros', 'despesa')
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Seed centros de custo
INSERT INTO fin_cost_centers (tenant_id, name, slug) VALUES
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Digital 3D', 'digital-3d'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Branding', 'branding'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Marketing', 'marketing'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Audiovisual', 'audiovisual'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Interiores', 'interiores'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Gamificacao', 'gamificacao'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Academy', 'academy'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Administrativo', 'administrativo')
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- ============================================
-- RLS
-- ============================================
ALTER TABLE fin_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_audit ENABLE ROW LEVEL SECURITY;

-- Policies: leitura para membros do tenant
CREATE POLICY "fin_categories_read" ON fin_categories FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "fin_cost_centers_read" ON fin_cost_centers FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "fin_vendors_read" ON fin_vendors FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "fin_clients_read" ON fin_clients FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "fin_transactions_read" ON fin_transactions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "fin_invoices_read" ON fin_invoices FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "fin_receivables_read" ON fin_receivables FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "fin_payables_read" ON fin_payables FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "bank_imports_read" ON bank_imports FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "bank_transactions_read" ON bank_transactions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "reconciliation_rules_read" ON reconciliation_rules FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "reconciliation_audit_read" ON reconciliation_audit FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- Write policies para membros do tenant
CREATE POLICY "fin_transactions_insert" ON fin_transactions FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "fin_transactions_update" ON fin_transactions FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "fin_receivables_insert" ON fin_receivables FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "fin_receivables_update" ON fin_receivables FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "fin_payables_insert" ON fin_payables FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "fin_payables_update" ON fin_payables FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "bank_imports_insert" ON bank_imports FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "bank_transactions_insert" ON bank_transactions FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "reconciliation_rules_insert" ON reconciliation_rules FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "reconciliation_rules_update" ON reconciliation_rules FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "reconciliation_audit_insert" ON reconciliation_audit FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- Triggers updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_fin_categories') THEN
        CREATE TRIGGER set_updated_at_fin_categories BEFORE UPDATE ON fin_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_fin_vendors') THEN
        CREATE TRIGGER set_updated_at_fin_vendors BEFORE UPDATE ON fin_vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_fin_clients') THEN
        CREATE TRIGGER set_updated_at_fin_clients BEFORE UPDATE ON fin_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_fin_transactions') THEN
        CREATE TRIGGER set_updated_at_fin_transactions BEFORE UPDATE ON fin_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_fin_invoices') THEN
        CREATE TRIGGER set_updated_at_fin_invoices BEFORE UPDATE ON fin_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_fin_receivables') THEN
        CREATE TRIGGER set_updated_at_fin_receivables BEFORE UPDATE ON fin_receivables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_fin_payables') THEN
        CREATE TRIGGER set_updated_at_fin_payables BEFORE UPDATE ON fin_payables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;
