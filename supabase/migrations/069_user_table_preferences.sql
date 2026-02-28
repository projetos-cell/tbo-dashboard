-- ============================================================================
-- Migration 069: User Table Preferences — Column order, visibility, width
-- Persists per-user, per-table configuration for reorderable columns
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_table_preferences (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_id   TEXT NOT NULL,  -- e.g. 'projetos', 'tarefas', 'entregas'
  columns    JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- columns: [{ id: string, visible: boolean, width?: number }]
  -- order is implicit from array position
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_table_pref UNIQUE (tenant_id, user_id, table_id)
);

COMMENT ON TABLE user_table_preferences IS 'Per-user column order/visibility for data tables';
COMMENT ON COLUMN user_table_preferences.table_id IS 'Module identifier: projetos, tarefas, entregas, demands, payables, receivables';
COMMENT ON COLUMN user_table_preferences.columns IS 'Array of {id, visible, width?} in display order';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_table_pref_user ON user_table_preferences(user_id, table_id);
CREATE INDEX IF NOT EXISTS idx_user_table_pref_tenant ON user_table_preferences(tenant_id);

-- RLS
ALTER TABLE user_table_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_table_pref_own_read"
  ON user_table_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_table_pref_own_insert"
  ON user_table_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid() AND tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "user_table_pref_own_update"
  ON user_table_preferences FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "user_table_pref_own_delete"
  ON user_table_preferences FOR DELETE
  USING (user_id = auth.uid());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION user_table_pref_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_table_pref_updated_at
  BEFORE UPDATE ON user_table_preferences
  FOR EACH ROW EXECUTE FUNCTION user_table_pref_set_updated_at();
