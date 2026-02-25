-- ============================================================================
-- TBO OS — Migration 053: Demand Custom Fields
--
-- 1. Add start_date and tags columns to demands table
-- 2. Create demand_field_values table (custom field values per demand)
--
-- Reuses os_custom_fields for field definitions (migration 049).
-- IDEMPOTENT: safe to run multiple times.
-- ============================================================================

-- ═══ 1. Add missing built-in columns to demands ═══

ALTER TABLE demands ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE demands ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- ═══ 2. demand_field_values — Custom field values per demand ═══

CREATE TABLE IF NOT EXISTS demand_field_values (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  demand_id   UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
  field_id    UUID NOT NULL REFERENCES os_custom_fields(id) ON DELETE CASCADE,
  value_json  JSONB NOT NULL DEFAULT 'null',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT dfv_unique UNIQUE (demand_id, field_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS dfv_demand_idx
  ON demand_field_values(demand_id);
CREATE INDEX IF NOT EXISTS dfv_field_idx
  ON demand_field_values(field_id);
CREATE INDEX IF NOT EXISTS dfv_tenant_idx
  ON demand_field_values(tenant_id);

-- RLS
ALTER TABLE demand_field_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dfv_select" ON demand_field_values;
DROP POLICY IF EXISTS "dfv_insert" ON demand_field_values;
DROP POLICY IF EXISTS "dfv_update" ON demand_field_values;
DROP POLICY IF EXISTS "dfv_delete" ON demand_field_values;

CREATE POLICY "dfv_select" ON demand_field_values
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "dfv_insert" ON demand_field_values
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "dfv_update" ON demand_field_values
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "dfv_delete" ON demand_field_values
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- updated_at trigger (reuses os_set_updated_at from migration 049)
DROP TRIGGER IF EXISTS dfv_updated_at ON demand_field_values;
CREATE TRIGGER dfv_updated_at
  BEFORE UPDATE ON demand_field_values FOR EACH ROW EXECUTE FUNCTION os_set_updated_at();
