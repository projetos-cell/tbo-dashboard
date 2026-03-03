-- ============================================================================
-- TBO OS — Migration 081: Omie v2 — Schema Evolution
-- Expande omie_sync_log, cria fin_bank_accounts, adiciona omie_id a fin_categories
-- ============================================================================

-- ──────────────────────────────────────────────
-- 1. EXPANDIR omie_sync_log COM CAMPOS NOVOS
-- ──────────────────────────────────────────────
ALTER TABLE omie_sync_log
  ADD COLUMN IF NOT EXISTS categories_synced INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bank_accounts_synced INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duration_ms INT,
  ADD COLUMN IF NOT EXISTS trigger_source TEXT DEFAULT 'manual'
    CHECK (trigger_source IN ('manual', 'cron', 'webhook'));

-- ──────────────────────────────────────────────
-- 2. CRIAR fin_bank_accounts (Contas Correntes)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fin_bank_accounts (
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
  is_active       BOOLEAN DEFAULT TRUE,
  omie_synced_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index para upsert por omie_id (tenant-scoped, ignora NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_fin_bank_accounts_omie
  ON fin_bank_accounts(tenant_id, omie_id) WHERE omie_id IS NOT NULL;

-- Index de consulta por tenant
CREATE INDEX IF NOT EXISTS idx_fin_bank_accounts_tenant
  ON fin_bank_accounts(tenant_id, is_active);

-- RLS
ALTER TABLE fin_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY fin_bank_accounts_select ON fin_bank_accounts
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY fin_bank_accounts_insert ON fin_bank_accounts
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY fin_bank_accounts_update ON fin_bank_accounts
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY fin_bank_accounts_delete ON fin_bank_accounts
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- ──────────────────────────────────────────────
-- 3. ADICIONAR omie_id / omie_synced_at A fin_categories
-- ──────────────────────────────────────────────
ALTER TABLE fin_categories
  ADD COLUMN IF NOT EXISTS omie_id TEXT,
  ADD COLUMN IF NOT EXISTS omie_synced_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fin_categories_omie
  ON fin_categories(tenant_id, omie_id) WHERE omie_id IS NOT NULL;

-- ──────────────────────────────────────────────
-- 4. REALTIME — habilitar para omie_sync_log
-- (permite Realtime subscription no frontend)
-- ──────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE omie_sync_log;

-- ──────────────────────────────────────────────
-- 5. SERVICE-ROLE BYPASS para Edge Functions
-- (Edge Functions usam service_role key, bypass RLS,
--  mas precisamos de policies de INSERT/UPDATE para logs)
-- ──────────────────────────────────────────────
-- Já existem policies de insert/update na 019, ok.
-- Adicionar policy de update para fin_bank_accounts via service_role
-- (service_role já bypassa RLS por default, nada extra necessário)
