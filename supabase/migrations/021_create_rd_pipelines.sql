-- ============================================================================
-- Migration 021: RD Station Pipelines (source of truth)
-- Store actual pipelines + stages from RD Station per tenant
-- ============================================================================

-- 1. RD Pipelines table with embedded stages
CREATE TABLE IF NOT EXISTS rd_pipelines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rd_pipeline_id text NOT NULL,
  name text NOT NULL,
  stages jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- stages format: [{"id": "abc123", "name": "Qualificação", "order": 0}, ...]
  owner_name text,
  deal_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, rd_pipeline_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rd_pipelines_tenant ON rd_pipelines(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rd_pipelines_rd_id ON rd_pipelines(rd_pipeline_id);

-- RLS
ALTER TABLE rd_pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rd_pipelines_select" ON rd_pipelines
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rd_pipelines_insert" ON rd_pipelines
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rd_pipelines_update" ON rd_pipelines
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rd_pipelines_delete" ON rd_pipelines
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- 2. Add RD stage tracking columns to crm_deals
ALTER TABLE crm_deals ADD COLUMN IF NOT EXISTS rd_stage_id text;
ALTER TABLE crm_deals ADD COLUMN IF NOT EXISTS rd_stage_name text;

CREATE INDEX IF NOT EXISTS idx_crm_deals_rd_stage ON crm_deals(rd_pipeline_id, rd_stage_id);
