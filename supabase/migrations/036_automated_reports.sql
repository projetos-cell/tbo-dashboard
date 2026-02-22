-- ============================================================
-- Migration 036: Automated Reports (Relatórios Automatizados)
-- Tasks #17-20 — TBO-OS
-- Daily/Weekly/Monthly partner reports + Weekly client reports
-- ============================================================

-- 1. Create report_schedules table
CREATE TABLE IF NOT EXISTS report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'client')),
  name TEXT NOT NULL,
  description TEXT,
  cron TEXT NOT NULL DEFAULT '0 8 * * *', -- default: 8h00 BRT daily
  recipients JSONB DEFAULT '[]', -- array of { email, name, role }
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}', -- type-specific config (client_id, filters, etc.)
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create report_runs table
CREATE TABLE IF NOT EXISTS report_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  schedule_id UUID REFERENCES report_schedules(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'client')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'error')),
  generated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  content JSONB DEFAULT '{}', -- rendered report data (KPIs, sections, etc.)
  html_content TEXT, -- pre-rendered HTML for preview
  error TEXT,
  metadata JSONB DEFAULT '{}', -- period, filters, stats
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_report_schedules_tenant ON report_schedules(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_report_runs_tenant ON report_runs(tenant_id, type, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_runs_schedule ON report_runs(schedule_id, generated_at DESC);

-- 4. Enable RLS
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_runs ENABLE ROW LEVEL SECURITY;

-- 5. Policies for report_schedules
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tenant users can view report schedules' AND tablename = 'report_schedules') THEN
    CREATE POLICY "Tenant users can view report schedules" ON report_schedules
      FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tenant users can insert report schedules' AND tablename = 'report_schedules') THEN
    CREATE POLICY "Tenant users can insert report schedules" ON report_schedules
      FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tenant users can update report schedules' AND tablename = 'report_schedules') THEN
    CREATE POLICY "Tenant users can update report schedules" ON report_schedules
      FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tenant users can delete report schedules' AND tablename = 'report_schedules') THEN
    CREATE POLICY "Tenant users can delete report schedules" ON report_schedules
      FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- 6. Policies for report_runs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tenant users can view report runs' AND tablename = 'report_runs') THEN
    CREATE POLICY "Tenant users can view report runs" ON report_runs
      FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tenant users can insert report runs' AND tablename = 'report_runs') THEN
    CREATE POLICY "Tenant users can insert report runs" ON report_runs
      FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tenant users can update report runs' AND tablename = 'report_runs') THEN
    CREATE POLICY "Tenant users can update report runs" ON report_runs
      FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- 7. Seed default schedules (idempotent — skip if exists)
-- These will be created per-tenant on first module load via the app,
-- but we document the expected structure here for reference.
-- Example:
-- INSERT INTO report_schedules (tenant_id, type, name, description, cron, recipients, enabled)
-- VALUES
--   ('<tenant_uuid>', 'daily',   'Relatório Diário - Sócios',   'KPIs, insights, decisões pendentes', '0 11 * * 1-5', '[]', true),
--   ('<tenant_uuid>', 'weekly',  'Relatório Semanal - Sócios',  'KPIs semanais, comparativos, conquistas', '0 11 * * 5', '[]', true),
--   ('<tenant_uuid>', 'monthly', 'Relatório Mensal - Sócios',   'KPIs mensais, projeções, exportação PDF', '0 11 L * *', '[]', true),
--   ('<tenant_uuid>', 'client',  'Relatório Semanal - Clientes', 'Resumo por cliente com projetos', '0 11 * * 1', '[]', true);
