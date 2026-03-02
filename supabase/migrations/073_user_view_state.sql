-- ============================================================================
-- Migration 073: user_view_state — Persists filter/sort/search per user/view
--
-- Supports the People OS Phase 2 server-side filter engine.
-- Generic enough to reuse across any workspace/view.
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_view_state (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace    TEXT NOT NULL,          -- e.g. 'pessoas', 'projetos'
  view_key     TEXT NOT NULL,          -- e.g. 'visao_geral', 'colaboradores'
  filters_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_json    JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_view_state UNIQUE (user_id, workspace, view_key)
);

COMMENT ON TABLE user_view_state IS 'Per-user persistent filter/sort state for workspace views';
COMMENT ON COLUMN user_view_state.workspace IS 'Module slug: pessoas, projetos, tarefas, etc.';
COMMENT ON COLUMN user_view_state.view_key IS 'View identifier within workspace: visao_geral, colaboradores, etc.';
COMMENT ON COLUMN user_view_state.filters_json IS 'JSON with active filters: {status:[], search:"", area:[], kpi:"at_risk", ...}';
COMMENT ON COLUMN user_view_state.sort_json IS 'JSON array of sort specs: [{field:"full_name", dir:"asc"}]';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_view_state_user
  ON user_view_state(user_id, workspace, view_key);
CREATE INDEX IF NOT EXISTS idx_user_view_state_tenant
  ON user_view_state(tenant_id);

-- RLS
ALTER TABLE user_view_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_view_state_own_select"
  ON user_view_state FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_view_state_own_insert"
  ON user_view_state FOR INSERT
  WITH CHECK (user_id = auth.uid() AND tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "user_view_state_own_update"
  ON user_view_state FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "user_view_state_own_delete"
  ON user_view_state FOR DELETE
  USING (user_id = auth.uid());

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION user_view_state_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_view_state_updated_at
  BEFORE UPDATE ON user_view_state
  FOR EACH ROW EXECUTE FUNCTION user_view_state_set_updated_at();
