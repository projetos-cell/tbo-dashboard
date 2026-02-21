-- ============================================================================
-- TBO OS — Migration 019: Omie ERP Sync Support
-- Adiciona omie_id + indexes + sync log para integracao Omie → Supabase
-- ============================================================================

-- 1. Adicionar omie_id a fin_vendors e fin_clients (as unicas tabelas que faltam)
ALTER TABLE fin_vendors ADD COLUMN IF NOT EXISTS omie_id TEXT;
ALTER TABLE fin_clients ADD COLUMN IF NOT EXISTS omie_id TEXT;

-- 2. Unique indexes para upsert por omie_id (tenant-scoped, partial — ignora NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_fin_vendors_omie
  ON fin_vendors(tenant_id, omie_id) WHERE omie_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fin_clients_omie
  ON fin_clients(tenant_id, omie_id) WHERE omie_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fin_payables_omie
  ON fin_payables(tenant_id, omie_id) WHERE omie_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fin_receivables_omie
  ON fin_receivables(tenant_id, omie_id) WHERE omie_id IS NOT NULL;

-- 3. Colunas de controle de sync (timestamp da ultima sincronizacao)
ALTER TABLE fin_vendors ADD COLUMN IF NOT EXISTS omie_synced_at TIMESTAMPTZ;
ALTER TABLE fin_clients ADD COLUMN IF NOT EXISTS omie_synced_at TIMESTAMPTZ;
ALTER TABLE fin_payables ADD COLUMN IF NOT EXISTS omie_synced_at TIMESTAMPTZ;
ALTER TABLE fin_receivables ADD COLUMN IF NOT EXISTS omie_synced_at TIMESTAMPTZ;

-- 4. Tabela de log de sincronizacao Omie
CREATE TABLE IF NOT EXISTS omie_sync_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  started_at          TIMESTAMPTZ DEFAULT NOW(),
  finished_at         TIMESTAMPTZ,
  status              TEXT DEFAULT 'running'
                      CHECK (status IN ('running','success','partial','error')),
  vendors_synced      INT DEFAULT 0,
  clients_synced      INT DEFAULT 0,
  payables_synced     INT DEFAULT 0,
  receivables_synced  INT DEFAULT 0,
  errors              JSONB DEFAULT '[]',
  triggered_by        UUID
);

-- 5. RLS para omie_sync_log
ALTER TABLE omie_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY omie_sync_log_select ON omie_sync_log
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY omie_sync_log_insert ON omie_sync_log
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY omie_sync_log_update ON omie_sync_log
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- 6. Indice para consultas de historico
CREATE INDEX IF NOT EXISTS idx_omie_sync_log_tenant
  ON omie_sync_log(tenant_id, started_at DESC);
