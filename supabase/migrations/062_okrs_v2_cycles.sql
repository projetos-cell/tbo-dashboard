-- ============================================================================
-- TBO OS — Migration 062: OKRs v2 — Cycles + Schema Evolution
-- Adds okr_cycles table, evolves objectives/KRs with sort_order, weight,
-- cadence, status_override, archived_at. Backward-compat with period field.
-- ============================================================================

-- ============================================================================
-- 1. okr_cycles — Ciclos de OKR (Q1 2026, H1 2026, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS okr_cycles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  is_active   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE okr_cycles IS 'Ciclos de OKR — trimestral, semestral, anual';
COMMENT ON COLUMN okr_cycles.is_active IS 'Apenas um ciclo ativo por tenant de cada vez';

ALTER TABLE okr_cycles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_cycles' AND policyname = 'okr_cycles_select') THEN
    CREATE POLICY okr_cycles_select ON okr_cycles FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_cycles' AND policyname = 'okr_cycles_insert') THEN
    CREATE POLICY okr_cycles_insert ON okr_cycles FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_cycles' AND policyname = 'okr_cycles_update') THEN
    CREATE POLICY okr_cycles_update ON okr_cycles FOR UPDATE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'okr_cycles' AND policyname = 'okr_cycles_delete') THEN
    CREATE POLICY okr_cycles_delete ON okr_cycles FOR DELETE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_okr_cycles_tenant ON okr_cycles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_okr_cycles_active ON okr_cycles(tenant_id, is_active);

DROP TRIGGER IF EXISTS trg_okr_cycles_updated_at ON okr_cycles;
CREATE TRIGGER trg_okr_cycles_updated_at
  BEFORE UPDATE ON okr_cycles
  FOR EACH ROW EXECUTE FUNCTION okr_set_updated_at();


-- ============================================================================
-- 2. Evolve okr_objectives — add cycle_id, sort_order, status_override, archived_at
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'okr_objectives' AND column_name = 'cycle_id') THEN
    ALTER TABLE okr_objectives ADD COLUMN cycle_id UUID REFERENCES okr_cycles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'okr_objectives' AND column_name = 'sort_order') THEN
    ALTER TABLE okr_objectives ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'okr_objectives' AND column_name = 'status_override') THEN
    ALTER TABLE okr_objectives ADD COLUMN status_override TEXT DEFAULT NULL
      CHECK (status_override IS NULL OR status_override IN ('on_track', 'attention', 'at_risk'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'okr_objectives' AND column_name = 'archived_at') THEN
    ALTER TABLE okr_objectives ADD COLUMN archived_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_okr_objectives_cycle ON okr_objectives(cycle_id);
CREATE INDEX IF NOT EXISTS idx_okr_objectives_sort ON okr_objectives(cycle_id, sort_order);

-- Expand level CHECK to include directorate and squad
-- We need to drop and re-create the constraint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.check_constraints
             WHERE constraint_name = 'okr_objectives_level_check') THEN
    ALTER TABLE okr_objectives DROP CONSTRAINT okr_objectives_level_check;
  END IF;
  ALTER TABLE okr_objectives ADD CONSTRAINT okr_objectives_level_check
    CHECK (level IN ('company', 'directorate', 'squad', 'individual', 'bu', 'personal'));
END $$;


-- ============================================================================
-- 3. Evolve okr_key_results — add weight, cadence, status_override, sort_order, archived_at
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'okr_key_results' AND column_name = 'weight') THEN
    ALTER TABLE okr_key_results ADD COLUMN weight NUMERIC(3,2) DEFAULT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'okr_key_results' AND column_name = 'cadence') THEN
    ALTER TABLE okr_key_results ADD COLUMN cadence TEXT DEFAULT 'weekly'
      CHECK (cadence IN ('weekly', 'biweekly', 'monthly'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'okr_key_results' AND column_name = 'status_override') THEN
    ALTER TABLE okr_key_results ADD COLUMN status_override TEXT DEFAULT NULL
      CHECK (status_override IS NULL OR status_override IN ('on_track', 'attention', 'at_risk'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'okr_key_results' AND column_name = 'sort_order') THEN
    ALTER TABLE okr_key_results ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'okr_key_results' AND column_name = 'archived_at') THEN
    ALTER TABLE okr_key_results ADD COLUMN archived_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
END $$;

-- Expand metric_type CHECK to include 'percent', 'binary', 'points'
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.check_constraints
             WHERE constraint_name = 'okr_key_results_metric_type_check') THEN
    ALTER TABLE okr_key_results DROP CONSTRAINT okr_key_results_metric_type_check;
  END IF;
  ALTER TABLE okr_key_results ADD CONSTRAINT okr_key_results_metric_type_check
    CHECK (metric_type IN ('number', 'percentage', 'currency', 'boolean', 'percent', 'binary', 'points'));
END $$;

CREATE INDEX IF NOT EXISTS idx_okr_kr_sort ON okr_key_results(objective_id, sort_order);


-- ============================================================================
-- 4. Seed default cycles from existing period data
-- ============================================================================

-- Create cycles for each unique tenant_id + period combination in okr_objectives
-- Then link objectives to cycles via cycle_id
DO $$
DECLARE
  r RECORD;
  cycle_uuid UUID;
  sd DATE;
  ed DATE;
  yr TEXT;
BEGIN
  FOR r IN
    SELECT DISTINCT tenant_id, period
    FROM okr_objectives
    WHERE period IS NOT NULL AND cycle_id IS NULL
  LOOP
    -- Parse period into dates
    yr := split_part(r.period, '-', 1);
    IF yr = '' OR yr IS NULL THEN yr := '2026'; END IF;

    IF r.period LIKE '%-Q1' THEN
      sd := (yr || '-01-01')::DATE; ed := (yr || '-03-31')::DATE;
    ELSIF r.period LIKE '%-Q2' THEN
      sd := (yr || '-04-01')::DATE; ed := (yr || '-06-30')::DATE;
    ELSIF r.period LIKE '%-Q3' THEN
      sd := (yr || '-07-01')::DATE; ed := (yr || '-09-30')::DATE;
    ELSIF r.period LIKE '%-Q4' THEN
      sd := (yr || '-10-01')::DATE; ed := (yr || '-12-31')::DATE;
    ELSIF r.period LIKE '%-H1' THEN
      sd := (yr || '-01-01')::DATE; ed := (yr || '-06-30')::DATE;
    ELSIF r.period LIKE '%-H2' THEN
      sd := (yr || '-07-01')::DATE; ed := (yr || '-12-31')::DATE;
    ELSE
      sd := (yr || '-01-01')::DATE; ed := (yr || '-12-31')::DATE;
    END IF;

    -- Check if cycle already exists
    SELECT id INTO cycle_uuid
    FROM okr_cycles
    WHERE tenant_id = r.tenant_id AND name = r.period
    LIMIT 1;

    IF cycle_uuid IS NULL THEN
      INSERT INTO okr_cycles (tenant_id, name, start_date, end_date, is_active)
      VALUES (r.tenant_id, r.period, sd, ed, false)
      RETURNING id INTO cycle_uuid;
    END IF;

    -- Link objectives to cycle
    UPDATE okr_objectives
    SET cycle_id = cycle_uuid
    WHERE tenant_id = r.tenant_id AND period = r.period AND cycle_id IS NULL;
  END LOOP;

  -- Mark the most recent cycle as active per tenant
  UPDATE okr_cycles c
  SET is_active = true
  WHERE c.id IN (
    SELECT DISTINCT ON (tenant_id) id
    FROM okr_cycles
    ORDER BY tenant_id, end_date DESC
  );
END $$;
