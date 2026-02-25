-- ============================================================================
-- TBO OS — Migration 054: Demand Comments
--
-- Create demand_comments table for task comments with @mentions support.
-- Stores mention metadata as JSONB array for efficient notification dispatch.
--
-- IDEMPOTENT: safe to run multiple times.
-- ============================================================================

-- ═══ 1. demand_comments — Comments per demand ═══

CREATE TABLE IF NOT EXISTS demand_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  demand_id   UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  mentions    JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS dc_demand_created_idx
  ON demand_comments(demand_id, created_at);
CREATE INDEX IF NOT EXISTS dc_author_idx
  ON demand_comments(author_id);
CREATE INDEX IF NOT EXISTS dc_tenant_idx
  ON demand_comments(tenant_id);

-- RLS
ALTER TABLE demand_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dc_select" ON demand_comments;
DROP POLICY IF EXISTS "dc_insert" ON demand_comments;
DROP POLICY IF EXISTS "dc_update" ON demand_comments;
DROP POLICY IF EXISTS "dc_delete" ON demand_comments;

CREATE POLICY "dc_select" ON demand_comments
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "dc_insert" ON demand_comments
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "dc_update" ON demand_comments
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()) AND author_id = auth.uid());
CREATE POLICY "dc_delete" ON demand_comments
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()) AND author_id = auth.uid());

-- updated_at trigger (reuses os_set_updated_at from migration 049)
DROP TRIGGER IF EXISTS dc_updated_at ON demand_comments;
CREATE TRIGGER dc_updated_at
  BEFORE UPDATE ON demand_comments FOR EACH ROW EXECUTE FUNCTION os_set_updated_at();
