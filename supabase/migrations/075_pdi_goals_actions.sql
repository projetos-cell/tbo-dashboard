-- ============================================================================
-- TBO People OS — Migration 075: PDI Goals + Actions
--
-- Creates:
--   1. pdi_goals — Development goals within a PDI
--   2. pdi_actions — Concrete actions to achieve goals
--   3. Indexes & RLS policies
--
-- Links:
--   - pdi_goals.skill_id -> person_skills(id)  (optional, for Scorecard)
--   - one_on_one_actions.pdi_link_id -> pdis(id) (already exists as column)
--
-- IDEMPOTENT: safe to run multiple times.
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- pdi_goals — Metas de desenvolvimento dentro de um PDI
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pdi_goals (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  pdi_id                UUID NOT NULL REFERENCES pdis(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL DEFAULT '',
  description           TEXT,
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  target_date           DATE,
  skill_id              UUID REFERENCES person_skills(id) ON DELETE SET NULL,
  target_level_percent  SMALLINT CHECK (target_level_percent IS NULL OR (target_level_percent >= 0 AND target_level_percent <= 100)),
  sort_order            SMALLINT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pdi_goals_tenant  ON pdi_goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pdi_goals_pdi     ON pdi_goals(pdi_id);
CREATE INDEX IF NOT EXISTS idx_pdi_goals_skill   ON pdi_goals(skill_id) WHERE skill_id IS NOT NULL;

ALTER TABLE pdi_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pdi_goals_select" ON pdi_goals;
DROP POLICY IF EXISTS "pdi_goals_insert" ON pdi_goals;
DROP POLICY IF EXISTS "pdi_goals_update" ON pdi_goals;
DROP POLICY IF EXISTS "pdi_goals_delete" ON pdi_goals;

CREATE POLICY "pdi_goals_select" ON pdi_goals
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "pdi_goals_insert" ON pdi_goals
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "pdi_goals_update" ON pdi_goals
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "pdi_goals_delete" ON pdi_goals
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ═══════════════════════════════════════════════════════════════════════════
-- pdi_actions — Ações concretas para alcançar metas de PDI
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pdi_actions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  pdi_goal_id           UUID NOT NULL REFERENCES pdi_goals(id) ON DELETE CASCADE,
  text                  TEXT NOT NULL DEFAULT '',
  completed             BOOLEAN NOT NULL DEFAULT false,
  completed_at          TIMESTAMPTZ,
  due_date              DATE,
  assignee_id           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  one_on_one_action_id  UUID REFERENCES one_on_one_actions(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pdi_actions_tenant   ON pdi_actions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pdi_actions_goal     ON pdi_actions(pdi_goal_id);
CREATE INDEX IF NOT EXISTS idx_pdi_actions_1on1     ON pdi_actions(one_on_one_action_id) WHERE one_on_one_action_id IS NOT NULL;

ALTER TABLE pdi_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pdi_actions_select" ON pdi_actions;
DROP POLICY IF EXISTS "pdi_actions_insert" ON pdi_actions;
DROP POLICY IF EXISTS "pdi_actions_update" ON pdi_actions;
DROP POLICY IF EXISTS "pdi_actions_delete" ON pdi_actions;

CREATE POLICY "pdi_actions_select" ON pdi_actions
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "pdi_actions_insert" ON pdi_actions
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "pdi_actions_update" ON pdi_actions
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "pdi_actions_delete" ON pdi_actions
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
