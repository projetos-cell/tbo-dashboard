-- ============================================================================
-- TBO OS — Migration 056: OKRs System
-- Tabelas: okr_objectives, okr_key_results, okr_checkins
-- Hierarquia: Company → BU → Personal (via parent_id self-ref)
-- ============================================================================

-- Shared trigger function for updated_at
CREATE OR REPLACE FUNCTION okr_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. okr_objectives — Objetivos estrategicos (OKR "O")
-- ============================================================================

CREATE TABLE IF NOT EXISTS okr_objectives (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  owner_id      UUID NOT NULL REFERENCES auth.users(id),
  period        TEXT NOT NULL,
  level         TEXT NOT NULL DEFAULT 'personal'
                  CHECK (level IN ('company', 'bu', 'personal')),
  bu            TEXT,
  parent_id     UUID REFERENCES okr_objectives(id) ON DELETE SET NULL,
  status        TEXT DEFAULT 'active'
                  CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  progress      NUMERIC(5,2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE okr_objectives IS 'Objetivos OKR — company, bu ou personal';
COMMENT ON COLUMN okr_objectives.period IS 'Periodo: 2026-Q1, 2026-Q2, 2026-H1, 2026';
COMMENT ON COLUMN okr_objectives.parent_id IS 'Hierarquia: company→bu→personal';
COMMENT ON COLUMN okr_objectives.progress IS 'Media automatica dos KR progress (0-100)';

-- RLS
ALTER TABLE okr_objectives ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_objectives' AND policyname = 'okr_objectives_select') THEN
    CREATE POLICY okr_objectives_select ON okr_objectives FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_objectives' AND policyname = 'okr_objectives_insert') THEN
    CREATE POLICY okr_objectives_insert ON okr_objectives FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_objectives' AND policyname = 'okr_objectives_update') THEN
    CREATE POLICY okr_objectives_update ON okr_objectives FOR UPDATE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_objectives' AND policyname = 'okr_objectives_delete') THEN
    CREATE POLICY okr_objectives_delete ON okr_objectives FOR DELETE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_okr_objectives_tenant    ON okr_objectives(tenant_id);
CREATE INDEX IF NOT EXISTS idx_okr_objectives_period    ON okr_objectives(tenant_id, period);
CREATE INDEX IF NOT EXISTS idx_okr_objectives_level     ON okr_objectives(tenant_id, level);
CREATE INDEX IF NOT EXISTS idx_okr_objectives_parent    ON okr_objectives(parent_id);
CREATE INDEX IF NOT EXISTS idx_okr_objectives_owner     ON okr_objectives(owner_id);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_okr_objectives_updated_at ON okr_objectives;
CREATE TRIGGER trg_okr_objectives_updated_at
  BEFORE UPDATE ON okr_objectives
  FOR EACH ROW EXECUTE FUNCTION okr_set_updated_at();


-- ============================================================================
-- 2. okr_key_results — Key Results (KR) de cada objetivo
-- ============================================================================

CREATE TABLE IF NOT EXISTS okr_key_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  objective_id  UUID NOT NULL REFERENCES okr_objectives(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  metric_type   TEXT DEFAULT 'number'
                  CHECK (metric_type IN ('number', 'percentage', 'currency', 'boolean')),
  start_value   NUMERIC(12,2) DEFAULT 0,
  target_value  NUMERIC(12,2) NOT NULL,
  current_value NUMERIC(12,2) DEFAULT 0,
  unit          TEXT,
  owner_id      UUID REFERENCES auth.users(id),
  confidence    TEXT DEFAULT 'on_track'
                  CHECK (confidence IN ('on_track', 'at_risk', 'behind')),
  status        TEXT DEFAULT 'active'
                  CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE okr_key_results IS 'Key Results — metricas mensuraveis de cada objetivo';
COMMENT ON COLUMN okr_key_results.metric_type IS 'Tipo: number, percentage, currency, boolean';
COMMENT ON COLUMN okr_key_results.confidence IS 'Confianca: on_track, at_risk, behind';

-- RLS
ALTER TABLE okr_key_results ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_key_results' AND policyname = 'okr_key_results_select') THEN
    CREATE POLICY okr_key_results_select ON okr_key_results FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_key_results' AND policyname = 'okr_key_results_insert') THEN
    CREATE POLICY okr_key_results_insert ON okr_key_results FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_key_results' AND policyname = 'okr_key_results_update') THEN
    CREATE POLICY okr_key_results_update ON okr_key_results FOR UPDATE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_key_results' AND policyname = 'okr_key_results_delete') THEN
    CREATE POLICY okr_key_results_delete ON okr_key_results FOR DELETE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_okr_kr_tenant       ON okr_key_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_okr_kr_objective    ON okr_key_results(objective_id);
CREATE INDEX IF NOT EXISTS idx_okr_kr_confidence   ON okr_key_results(tenant_id, confidence);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_okr_key_results_updated_at ON okr_key_results;
CREATE TRIGGER trg_okr_key_results_updated_at
  BEFORE UPDATE ON okr_key_results
  FOR EACH ROW EXECUTE FUNCTION okr_set_updated_at();


-- ============================================================================
-- 3. okr_checkins — Historico de atualizacoes de KR
-- ============================================================================

CREATE TABLE IF NOT EXISTS okr_checkins (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key_result_id  UUID NOT NULL REFERENCES okr_key_results(id) ON DELETE CASCADE,
  previous_value NUMERIC(12,2),
  new_value      NUMERIC(12,2) NOT NULL,
  confidence     TEXT DEFAULT 'on_track'
                   CHECK (confidence IN ('on_track', 'at_risk', 'behind')),
  notes          TEXT,
  author_id      UUID NOT NULL REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE okr_checkins IS 'Check-ins semanais — historico de progresso dos KRs';

-- RLS
ALTER TABLE okr_checkins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_checkins' AND policyname = 'okr_checkins_select') THEN
    CREATE POLICY okr_checkins_select ON okr_checkins FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_checkins' AND policyname = 'okr_checkins_insert') THEN
    CREATE POLICY okr_checkins_insert ON okr_checkins FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_checkins' AND policyname = 'okr_checkins_update') THEN
    CREATE POLICY okr_checkins_update ON okr_checkins FOR UPDATE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_checkins' AND policyname = 'okr_checkins_delete') THEN
    CREATE POLICY okr_checkins_delete ON okr_checkins FOR DELETE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_okr_checkins_tenant   ON okr_checkins(tenant_id);
CREATE INDEX IF NOT EXISTS idx_okr_checkins_kr       ON okr_checkins(key_result_id);
CREATE INDEX IF NOT EXISTS idx_okr_checkins_timeline ON okr_checkins(key_result_id, created_at DESC);
