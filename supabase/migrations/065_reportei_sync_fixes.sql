-- ============================================================================
-- Migration 065: Reportei Sync Fixes
-- TBO OS — RSM Module
-- 1. Add UNIQUE constraint on reportei_account_id (required for upsert)
-- 2. Insert Reportei integration config for all tenants (with API key)
-- All idempotent.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────
-- 1. UNIQUE constraint on rsm_accounts.reportei_account_id
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_rsm_accounts_reportei_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_rsm_accounts_reportei_unique
      ON rsm_accounts(reportei_account_id) WHERE reportei_account_id IS NOT NULL;
  END IF;
END $$;

-- Drop the old non-unique index if it exists (replaced by unique above)
DROP INDEX IF EXISTS idx_rsm_accounts_reportei;

-- ─────────────────────────────────────────────────────────────
-- 2. Insert Reportei integration config for all tenants
-- ─────────────────────────────────────────────────────────────
INSERT INTO integration_configs (tenant_id, provider, settings, is_active)
SELECT
  t.id,
  'reportei',
  '{"api_key": "1r7vHQhI4CC2ebTDDvrd30mvCyGtNnLj3zJWVTIa"}'::jsonb,
  true
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM integration_configs ic
  WHERE ic.tenant_id = t.id AND ic.provider = 'reportei'
);

-- Update existing reportei configs that don't have api_key in settings
UPDATE integration_configs
SET settings = settings || '{"api_key": "1r7vHQhI4CC2ebTDDvrd30mvCyGtNnLj3zJWVTIa"}'::jsonb,
    is_active = true,
    updated_at = now()
WHERE provider = 'reportei'
  AND (settings->>'api_key' IS NULL OR settings->>'api_key' = '');

-- ============================================================================
-- FIM da Migration 065
-- ============================================================================
