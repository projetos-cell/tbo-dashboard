-- ============================================================
-- Migration 063: Reportei Integration — Extend RSM for API sync
-- Adds: reportei_account_id to rsm_accounts, source tracking
--        to rsm_metrics, reportei_sync_runs log table, unique
--        constraint for upsert, and clicks/saves columns.
-- All idempotent.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Extend rsm_accounts with Reportei mapping
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rsm_accounts' AND column_name = 'reportei_account_id') THEN
    ALTER TABLE rsm_accounts ADD COLUMN reportei_account_id TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rsm_accounts' AND column_name = 'platform_id') THEN
    ALTER TABLE rsm_accounts ADD COLUMN platform_id TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_rsm_accounts_reportei ON rsm_accounts(reportei_account_id) WHERE reportei_account_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 2. Extend rsm_metrics with source tracking + extra columns
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rsm_metrics' AND column_name = 'source') THEN
    ALTER TABLE rsm_metrics ADD COLUMN source TEXT NOT NULL DEFAULT 'manual'
      CHECK (source IN ('manual', 'reportei', 'meta_api', 'import'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rsm_metrics' AND column_name = 'clicks') THEN
    ALTER TABLE rsm_metrics ADD COLUMN clicks INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rsm_metrics' AND column_name = 'saves') THEN
    ALTER TABLE rsm_metrics ADD COLUMN saves INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rsm_metrics' AND column_name = 'profile_views') THEN
    ALTER TABLE rsm_metrics ADD COLUMN profile_views INTEGER DEFAULT 0;
  END IF;
END $$;

-- Unique constraint for upsert (account + date + source)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_rsm_metrics_upsert') THEN
    CREATE UNIQUE INDEX idx_rsm_metrics_upsert ON rsm_metrics(account_id, date, source);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 3. Extend rsm_posts with Reportei post mapping
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rsm_posts' AND column_name = 'external_post_id') THEN
    ALTER TABLE rsm_posts ADD COLUMN external_post_id TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rsm_posts' AND column_name = 'source') THEN
    ALTER TABLE rsm_posts ADD COLUMN source TEXT NOT NULL DEFAULT 'manual'
      CHECK (source IN ('manual', 'reportei', 'meta_api', 'import'));
  END IF;
END $$;

-- Prevent duplicate post imports
CREATE UNIQUE INDEX IF NOT EXISTS idx_rsm_posts_external
  ON rsm_posts(account_id, external_post_id) WHERE external_post_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 4. reportei_sync_runs — ETL execution log
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reportei_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial', 'error')),
  accounts_synced INTEGER DEFAULT 0,
  metrics_upserted INTEGER DEFAULT 0,
  posts_upserted INTEGER DEFAULT 0,
  error_message TEXT,
  details JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_reportei_sync_runs_tenant ON reportei_sync_runs(tenant_id, started_at DESC);

ALTER TABLE reportei_sync_runs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reportei_sync_runs_select' AND tablename = 'reportei_sync_runs') THEN
    CREATE POLICY "reportei_sync_runs_select" ON reportei_sync_runs
      FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reportei_sync_runs_insert' AND tablename = 'reportei_sync_runs') THEN
    CREATE POLICY "reportei_sync_runs_insert" ON reportei_sync_runs
      FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reportei_sync_runs_update' AND tablename = 'reportei_sync_runs') THEN
    CREATE POLICY "reportei_sync_runs_update" ON reportei_sync_runs
      FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;
