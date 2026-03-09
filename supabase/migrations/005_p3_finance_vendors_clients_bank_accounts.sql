-- P3: Consolidação de schemas paralelos fin_* e finance_*
-- Migration 005: Criar tabelas finance_vendors, finance_clients, finance_bank_accounts
--               com RLS e migrar dados existentes dos legados fin_*
--
-- REGRA: NUNCA modificar migrations existentes — sempre criar nova
-- Autor: Claude (P3 Path B – Progressive)
-- Data: 2026-03-09

-- ── 1. finance_vendors ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS finance_vendors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    cnpj            TEXT,
    email           TEXT,
    phone           TEXT,
    category        TEXT,
    notes           TEXT,
    is_active       BOOLEAN DEFAULT true,
    omie_id         TEXT,
    omie_synced_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, omie_id)
);

-- RLS
ALTER TABLE finance_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_finance_vendors"
    ON finance_vendors FOR SELECT
    USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_insert_finance_vendors"
    ON finance_vendors FOR INSERT
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_update_finance_vendors"
    ON finance_vendors FOR UPDATE
    USING (tenant_id = ANY(get_user_tenant_ids()))
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_delete_finance_vendors"
    ON finance_vendors FOR DELETE
    USING (tenant_id = ANY(get_user_tenant_ids()));

-- Index para lookups por omie_id
CREATE INDEX IF NOT EXISTS idx_finance_vendors_tenant_omie
    ON finance_vendors (tenant_id, omie_id)
    WHERE omie_id IS NOT NULL;

-- ── 2. finance_clients ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS finance_clients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    cnpj            TEXT,
    email           TEXT,
    phone           TEXT,
    contact_name    TEXT,
    notes           TEXT,
    is_active       BOOLEAN DEFAULT true,
    omie_id         TEXT,
    omie_synced_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, omie_id)
);

-- RLS
ALTER TABLE finance_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_finance_clients"
    ON finance_clients FOR SELECT
    USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_insert_finance_clients"
    ON finance_clients FOR INSERT
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_update_finance_clients"
    ON finance_clients FOR UPDATE
    USING (tenant_id = ANY(get_user_tenant_ids()))
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_delete_finance_clients"
    ON finance_clients FOR DELETE
    USING (tenant_id = ANY(get_user_tenant_ids()));

-- Index para lookups por omie_id
CREATE INDEX IF NOT EXISTS idx_finance_clients_tenant_omie
    ON finance_clients (tenant_id, omie_id)
    WHERE omie_id IS NOT NULL;

-- ── 3. finance_bank_accounts ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS finance_bank_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    omie_id         TEXT,
    name            TEXT NOT NULL,
    bank_code       TEXT,
    bank_name       TEXT,
    agency          TEXT,
    account_number  TEXT,
    account_type    TEXT DEFAULT 'corrente',
    balance         NUMERIC(15,2) DEFAULT 0,
    is_active       BOOLEAN DEFAULT true,
    omie_synced_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, omie_id)
);

-- RLS
ALTER TABLE finance_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_finance_bank_accounts"
    ON finance_bank_accounts FOR SELECT
    USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_insert_finance_bank_accounts"
    ON finance_bank_accounts FOR INSERT
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_update_finance_bank_accounts"
    ON finance_bank_accounts FOR UPDATE
    USING (tenant_id = ANY(get_user_tenant_ids()))
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_delete_finance_bank_accounts"
    ON finance_bank_accounts FOR DELETE
    USING (tenant_id = ANY(get_user_tenant_ids()));

-- Index para lookups por omie_id
CREATE INDEX IF NOT EXISTS idx_finance_bank_accounts_tenant_omie
    ON finance_bank_accounts (tenant_id, omie_id)
    WHERE omie_id IS NOT NULL;

-- ── 4. Migrar dados: fin_* → finance_* ───────────────────────────────────────
-- Copia registros existentes para as novas tabelas.
-- ON CONFLICT DO NOTHING garante idempotência (pode rodar N vezes sem duplicar).

-- Vendors
INSERT INTO finance_vendors (
    id, tenant_id, name, cnpj, email, phone, category, notes,
    is_active, omie_id, omie_synced_at, created_at, updated_at
)
SELECT
    id, tenant_id, name, cnpj, email, phone, category, notes,
    is_active, omie_id, omie_synced_at, created_at, updated_at
FROM fin_vendors
ON CONFLICT (tenant_id, omie_id) DO NOTHING;

-- Clients
INSERT INTO finance_clients (
    id, tenant_id, name, cnpj, email, phone, contact_name, notes,
    is_active, omie_id, omie_synced_at, created_at, updated_at
)
SELECT
    id, tenant_id, name, cnpj, email, phone, contact_name, notes,
    is_active, omie_id, omie_synced_at, created_at, updated_at
FROM fin_clients
ON CONFLICT (tenant_id, omie_id) DO NOTHING;

-- Bank accounts
INSERT INTO finance_bank_accounts (
    id, tenant_id, omie_id, name, bank_code, bank_name, agency,
    account_number, account_type, balance, is_active, omie_synced_at,
    created_at, updated_at
)
SELECT
    id, tenant_id, omie_id, name, bank_code, bank_name, agency,
    account_number, account_type, balance, is_active, omie_synced_at,
    created_at, updated_at
FROM fin_bank_accounts
ON CONFLICT (tenant_id, omie_id) DO NOTHING;

-- ── 5. Adicionar UNIQUE INDEX retroativo nos legados ──────────────────────────
-- fin_vendors e fin_clients não tinham constraint única em (tenant_id, omie_id),
-- o que fazia os upserts do omie-sync falhar silenciosamente.
-- Adicionamos agora para garantir consistência até a remoção das tabelas legadas.

CREATE UNIQUE INDEX IF NOT EXISTS idx_fin_vendors_tenant_omie_uniq
    ON fin_vendors (tenant_id, omie_id)
    WHERE omie_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fin_clients_tenant_omie_uniq
    ON fin_clients (tenant_id, omie_id)
    WHERE omie_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fin_bank_accounts_tenant_omie_uniq
    ON fin_bank_accounts (tenant_id, omie_id)
    WHERE omie_id IS NOT NULL;
