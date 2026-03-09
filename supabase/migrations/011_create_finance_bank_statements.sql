-- Migration 011: Criar tabela finance_bank_statements para extrato bancário do Omie
--
-- PROBLEMA: Nenhuma implementação de sync importava movimentações de extrato bancário.
-- O fluxo de caixa ficava vazio porque não existia tabela dedicada.
--
-- SOLUÇÃO: Tabela separada de finance_transactions porque extrato tem campos próprios
-- (saldo após movimento, natureza do lançamento) e não é AP/AR.
--
-- Endpoint Omie: POST /api/v1/financas/extrato/ method ListarExtrato
--
-- REGRA: NUNCA modificar migrations existentes — sempre criar nova

CREATE TABLE IF NOT EXISTS finance_bank_statements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    bank_account_id UUID REFERENCES finance_bank_accounts(id) ON DELETE SET NULL,
    omie_id         TEXT,
    date            DATE NOT NULL,
    description     TEXT,
    amount          NUMERIC(15,2) NOT NULL DEFAULT 0,
    balance         NUMERIC(15,2),
    type            TEXT NOT NULL DEFAULT 'credit'
                    CHECK (type IN ('credit', 'debit')),
    category        TEXT,
    document_number TEXT,
    omie_raw        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_finance_bank_statements_tenant_omie UNIQUE (tenant_id, omie_id)
);

-- Índices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_finance_bank_statements_tenant_date
    ON finance_bank_statements(tenant_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_finance_bank_statements_bank_account
    ON finance_bank_statements(bank_account_id)
    WHERE bank_account_id IS NOT NULL;

-- RLS: mesma política de tenant isolation das demais finance_*
ALTER TABLE finance_bank_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "finance_bank_statements_tenant_isolation"
    ON finance_bank_statements
    FOR ALL
    USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
        )
    );

-- Trigger updated_at
CREATE TRIGGER set_finance_bank_statements_updated_at
    BEFORE UPDATE ON finance_bank_statements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Adicionar coluna extrato_synced no sync_log
ALTER TABLE omie_sync_log
    ADD COLUMN IF NOT EXISTS extrato_synced INTEGER DEFAULT 0;

COMMENT ON TABLE finance_bank_statements IS
    'Extrato bancário importado do Omie via ListarExtrato. '
    'Cada registro é um lançamento no extrato de uma conta corrente.';

-- Publicar no realtime (se necessário)
-- ALTER PUBLICATION supabase_realtime ADD TABLE finance_bank_statements;
