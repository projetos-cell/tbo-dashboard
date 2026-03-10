-- Add pipeline fields to crm_deals for multi-funnel support (Gustavo / Ruy)
ALTER TABLE crm_deals
  ADD COLUMN IF NOT EXISTS rd_pipeline_id text,
  ADD COLUMN IF NOT EXISTS rd_pipeline_name text,
  ADD COLUMN IF NOT EXISTS rd_user_id text;

-- Index for fast pipeline filtering
CREATE INDEX IF NOT EXISTS idx_crm_deals_pipeline ON crm_deals(rd_pipeline_name) WHERE rd_pipeline_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_owner ON crm_deals(owner_name) WHERE owner_name IS NOT NULL;
