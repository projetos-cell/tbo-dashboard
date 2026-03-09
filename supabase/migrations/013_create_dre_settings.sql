-- Migration 013: Criar tabela dre_settings
--
-- PROBLEMA: O código frontend referenciava dre_settings mas a tabela não existia.
-- Ficou oculto porque types.ts era placeholder.
--
-- REGRA: NUNCA modificar migrations existentes — sempre criar nova

CREATE TABLE IF NOT EXISTS dre_settings (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    tax_rate   NUMERIC(5,2),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE dre_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dre_settings_tenant_isolation"
    ON dre_settings FOR ALL
    USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()))
    WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE TRIGGER set_dre_settings_updated_at
    BEFORE UPDATE ON dre_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
