-- ============================================================
-- 066 — OKR Comments + cleanup
-- ============================================================

-- Comments on objectives / key results
CREATE TABLE IF NOT EXISTS okr_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  objective_id uuid REFERENCES okr_objectives(id) ON DELETE CASCADE,
  key_result_id uuid REFERENCES okr_key_results(id) ON DELETE CASCADE,
  author_id   uuid NOT NULL,
  body        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_okr_comment_target CHECK (
    (objective_id IS NOT NULL AND key_result_id IS NULL) OR
    (objective_id IS NULL AND key_result_id IS NOT NULL)
  )
);

CREATE INDEX idx_okr_comments_objective ON okr_comments(objective_id) WHERE objective_id IS NOT NULL;
CREATE INDEX idx_okr_comments_kr ON okr_comments(key_result_id) WHERE key_result_id IS NOT NULL;
CREATE INDEX idx_okr_comments_tenant ON okr_comments(tenant_id);

-- RLS
ALTER TABLE okr_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "okr_comments_tenant_read"
  ON okr_comments FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "okr_comments_tenant_insert"
  ON okr_comments FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "okr_comments_author_update"
  ON okr_comments FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "okr_comments_author_delete"
  ON okr_comments FOR DELETE
  USING (author_id = auth.uid());

-- Allow soft-delete (archive) of objectives
ALTER TABLE okr_objectives ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Update cycle to support editing
ALTER TABLE okr_cycles ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE okr_cycles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
