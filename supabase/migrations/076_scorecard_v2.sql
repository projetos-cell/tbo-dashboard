-- ============================================================================
-- Migration 076: Scorecard TBO 2.0 — Fase 1 (Skill Layer)
-- TBO OS — People Module (Supabase)
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════
-- 1. SCORECARD_SKILLS — Catalogo das 10 habilidades
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scorecard_skills (
  id          TEXT PRIMARY KEY,                -- e.g. 'project_mgmt'
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,                   -- e.g. 'Gestao de Projetos & Rituais'
  description TEXT,
  category    TEXT DEFAULT 'technical',        -- 'technical' | 'behavioral'
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, id)
);

CREATE INDEX idx_scorecard_skills_tenant ON scorecard_skills(tenant_id);

ALTER TABLE scorecard_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scorecard_skills_select" ON scorecard_skills
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "scorecard_skills_insert" ON scorecard_skills
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = scorecard_skills.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

CREATE POLICY "scorecard_skills_update" ON scorecard_skills
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = scorecard_skills.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- 2. SCORECARD_CONFIG — Pesos das camadas e thresholds
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scorecard_config (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  skill_weight    NUMERIC(4,2) DEFAULT 0.35,
  impact_weight   NUMERIC(4,2) DEFAULT 0.45,
  culture_weight  NUMERIC(4,2) DEFAULT 0.20,
  elite_threshold      INT DEFAULT 90,
  high_perf_threshold  INT DEFAULT 75,
  stable_threshold     INT DEFAULT 60,
  evaluation_period    TEXT DEFAULT 'monthly' CHECK (evaluation_period IN ('monthly', 'quarterly')),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id)
);

ALTER TABLE scorecard_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scorecard_config_select" ON scorecard_config
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "scorecard_config_upsert" ON scorecard_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = scorecard_config.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- 3. SCORECARD_SKILL_WEIGHTS — Peso de cada skill por cargo
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scorecard_skill_weights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  skill_id    TEXT NOT NULL,
  role_name   TEXT NOT NULL,                    -- cargo: 'designer', 'dev', 'pm', etc.
  weight      NUMERIC(4,2) DEFAULT 1.0,         -- peso relativo
  expected_level INT DEFAULT 70,                -- nivel esperado (%)
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, skill_id, role_name)
);

CREATE INDEX idx_skill_weights_tenant ON scorecard_skill_weights(tenant_id);

ALTER TABLE scorecard_skill_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skill_weights_select" ON scorecard_skill_weights
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "skill_weights_manage" ON scorecard_skill_weights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = scorecard_skill_weights.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- 4. EMPLOYEE_SKILL_SCORES — Scores individuais por skill/periodo
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS employee_skill_scores (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES auth.users(id),
  skill_id          TEXT NOT NULL,
  level_percentage  INT NOT NULL CHECK (level_percentage BETWEEN 0 AND 100),
  expected_level    INT DEFAULT 70 CHECK (expected_level BETWEEN 0 AND 100),
  period            TEXT NOT NULL,              -- e.g. '2026-03'
  evaluated_by      UUID REFERENCES auth.users(id),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, employee_id, skill_id, period)
);

CREATE INDEX idx_emp_skills_tenant    ON employee_skill_scores(tenant_id);
CREATE INDEX idx_emp_skills_employee  ON employee_skill_scores(employee_id);
CREATE INDEX idx_emp_skills_period    ON employee_skill_scores(period);

ALTER TABLE employee_skill_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "emp_skills_select" ON employee_skill_scores
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "emp_skills_insert" ON employee_skill_scores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = employee_skill_scores.tenant_id
        AND r.name IN ('owner', 'admin', 'coordinator')
    )
  );

CREATE POLICY "emp_skills_update" ON employee_skill_scores
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = employee_skill_scores.tenant_id
        AND r.name IN ('owner', 'admin', 'coordinator')
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- 5. EMPLOYEE_PERFORMANCE_SNAPSHOT — Snapshot mensal consolidado
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS employee_performance_snapshot (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES auth.users(id),
  skill_score     NUMERIC(5,2),
  impact_score    NUMERIC(5,2),
  culture_score   NUMERIC(5,2),
  final_score     NUMERIC(5,2),
  trend           TEXT CHECK (trend IN ('up', 'down', 'stable')),
  period          TEXT NOT NULL,                -- e.g. '2026-03'
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, employee_id, period)
);

CREATE INDEX idx_perf_snap_tenant    ON employee_performance_snapshot(tenant_id);
CREATE INDEX idx_perf_snap_employee  ON employee_performance_snapshot(employee_id);
CREATE INDEX idx_perf_snap_period    ON employee_performance_snapshot(period);
CREATE INDEX idx_perf_snap_score     ON employee_performance_snapshot(final_score);

ALTER TABLE employee_performance_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perf_snap_select" ON employee_performance_snapshot
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "perf_snap_manage" ON employee_performance_snapshot
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = employee_performance_snapshot.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );
