-- ============================================================================
-- TBO OS — Migration 025: Banco de Talentos + Vagas + Contratos
-- Módulo Pessoas — Expansão operacional
-- Idempotente: seguro re-executar.
-- ============================================================================

-- ============================================================================
-- 1. Tabela talents (Banco de Talentos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS talents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  specialty     TEXT,
  seniority     TEXT,
  city          TEXT,
  state         TEXT,
  portfolio_url TEXT,
  linkedin_url  TEXT,
  status        TEXT DEFAULT 'available',
  tags          TEXT[],
  notes         TEXT,
  source        TEXT,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_talents_status'
  ) THEN
    ALTER TABLE talents ADD CONSTRAINT chk_talents_status
      CHECK (status IN ('available','contacted','in_process','hired','archived'));
  END IF;
END $$;

-- ============================================================================
-- 2. Tabela vacancies (Vagas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vacancies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  area            TEXT,
  description     TEXT,
  requirements    TEXT,
  responsible_id  UUID REFERENCES auth.users(id),
  status          TEXT DEFAULT 'open',
  priority        TEXT DEFAULT 'medium',
  notes           TEXT,
  created_by      UUID REFERENCES auth.users(id),
  opened_at       TIMESTAMPTZ DEFAULT now(),
  closed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_vacancies_status'
  ) THEN
    ALTER TABLE vacancies ADD CONSTRAINT chk_vacancies_status
      CHECK (status IN ('draft','open','in_progress','paused','closed','filled'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_vacancies_priority'
  ) THEN
    ALTER TABLE vacancies ADD CONSTRAINT chk_vacancies_priority
      CHECK (priority IN ('low','medium','high','urgent'));
  END IF;
END $$;

-- ============================================================================
-- 3. Tabela vacancy_candidates (junction Vaga ↔ Talento)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vacancy_candidates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vacancy_id  UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
  talent_id   UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  stage       TEXT DEFAULT 'applied',
  notes       TEXT,
  linked_by   UUID REFERENCES auth.users(id),
  linked_at   TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_vc_stage'
  ) THEN
    ALTER TABLE vacancy_candidates ADD CONSTRAINT chk_vc_stage
      CHECK (stage IN ('applied','screening','interview','offer','hired','rejected'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'uq_vacancy_talent'
  ) THEN
    ALTER TABLE vacancy_candidates ADD CONSTRAINT uq_vacancy_talent
      UNIQUE(vacancy_id, talent_id);
  END IF;
END $$;

-- ============================================================================
-- 4. Tabela contracts (Contratos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS contracts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  person_id     UUID REFERENCES auth.users(id),
  person_name   TEXT,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  start_date    DATE,
  end_date      DATE,
  status        TEXT DEFAULT 'active',
  monthly_value NUMERIC(12,2),
  file_url      TEXT,
  file_name     TEXT,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_contracts_type'
  ) THEN
    ALTER TABLE contracts ADD CONSTRAINT chk_contracts_type
      CHECK (type IN ('pj','nda','aditivo','freelancer','clt','outro'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_contracts_status'
  ) THEN
    ALTER TABLE contracts ADD CONSTRAINT chk_contracts_status
      CHECK (status IN ('draft','active','expired','cancelled','renewed'));
  END IF;
END $$;

-- ============================================================================
-- 5. Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_talents_tenant    ON talents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_talents_status    ON talents(status);
CREATE INDEX IF NOT EXISTS idx_talents_specialty ON talents(specialty);

CREATE INDEX IF NOT EXISTS idx_vacancies_tenant  ON vacancies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vacancies_status  ON vacancies(status);

CREATE INDEX IF NOT EXISTS idx_vc_vacancy        ON vacancy_candidates(vacancy_id);
CREATE INDEX IF NOT EXISTS idx_vc_talent         ON vacancy_candidates(talent_id);

CREATE INDEX IF NOT EXISTS idx_contracts_tenant  ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_person  ON contracts(person_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status  ON contracts(status);

-- ============================================================================
-- 6. RLS — talents
-- ============================================================================

ALTER TABLE talents ENABLE ROW LEVEL SECURITY;

-- SELECT: membros do tenant podem ver talentos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'talents_select' AND tablename = 'talents') THEN
    CREATE POLICY talents_select ON talents
      FOR SELECT USING (
        tenant_id IN (
          SELECT tenant_id FROM tenant_members
          WHERE user_id = auth.uid() AND is_active = TRUE
        )
      );
  END IF;
END $$;

-- INSERT: admin, diretor, project_owner
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'talents_insert' AND tablename = 'talents') THEN
    CREATE POLICY talents_insert ON talents
      FOR INSERT WITH CHECK (
        tenant_id IN (
          SELECT tm.tenant_id FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
            AND r.slug IN ('owner', 'admin', 'diretor', 'project_owner')
        )
      );
  END IF;
END $$;

-- UPDATE: admin, diretor, project_owner
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'talents_update' AND tablename = 'talents') THEN
    CREATE POLICY talents_update ON talents
      FOR UPDATE USING (
        tenant_id IN (
          SELECT tm.tenant_id FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
            AND r.slug IN ('owner', 'admin', 'diretor', 'project_owner')
        )
      );
  END IF;
END $$;

-- DELETE: owner, admin
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'talents_delete' AND tablename = 'talents') THEN
    CREATE POLICY talents_delete ON talents
      FOR DELETE USING (
        tenant_id IN (
          SELECT tm.tenant_id FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
            AND r.slug IN ('owner', 'admin')
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 7. RLS — vacancies
-- ============================================================================

ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vacancies_select' AND tablename = 'vacancies') THEN
    CREATE POLICY vacancies_select ON vacancies
      FOR SELECT USING (
        tenant_id IN (
          SELECT tenant_id FROM tenant_members
          WHERE user_id = auth.uid() AND is_active = TRUE
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vacancies_insert' AND tablename = 'vacancies') THEN
    CREATE POLICY vacancies_insert ON vacancies
      FOR INSERT WITH CHECK (
        tenant_id IN (
          SELECT tm.tenant_id FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
            AND r.slug IN ('owner', 'admin', 'diretor')
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vacancies_update' AND tablename = 'vacancies') THEN
    CREATE POLICY vacancies_update ON vacancies
      FOR UPDATE USING (
        tenant_id IN (
          SELECT tm.tenant_id FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
            AND r.slug IN ('owner', 'admin', 'diretor')
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vacancies_delete' AND tablename = 'vacancies') THEN
    CREATE POLICY vacancies_delete ON vacancies
      FOR DELETE USING (
        tenant_id IN (
          SELECT tm.tenant_id FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
            AND r.slug = 'owner'
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 8. RLS — vacancy_candidates
-- ============================================================================

ALTER TABLE vacancy_candidates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vc_select' AND tablename = 'vacancy_candidates') THEN
    CREATE POLICY vc_select ON vacancy_candidates
      FOR SELECT USING (
        tenant_id IN (
          SELECT tenant_id FROM tenant_members
          WHERE user_id = auth.uid() AND is_active = TRUE
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vc_insert' AND tablename = 'vacancy_candidates') THEN
    CREATE POLICY vc_insert ON vacancy_candidates
      FOR INSERT WITH CHECK (
        tenant_id IN (
          SELECT tm.tenant_id FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
            AND r.slug IN ('owner', 'admin', 'diretor')
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vc_update' AND tablename = 'vacancy_candidates') THEN
    CREATE POLICY vc_update ON vacancy_candidates
      FOR UPDATE USING (
        tenant_id IN (
          SELECT tm.tenant_id FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
            AND r.slug IN ('owner', 'admin', 'diretor')
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vc_delete' AND tablename = 'vacancy_candidates') THEN
    CREATE POLICY vc_delete ON vacancy_candidates
      FOR DELETE USING (
        tenant_id IN (
          SELECT tm.tenant_id FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
            AND r.slug IN ('owner', 'admin')
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 9. RLS — contracts (RESTRITO: owner, admin, diretor, financeiro)
-- ============================================================================

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- SELECT: RESTRITO a owner, admin, diretor, financeiro
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'contracts_select' AND tablename = 'contracts') THEN
    CREATE POLICY contracts_select ON contracts
      FOR SELECT USING (
        tenant_id IN (
          SELECT tm.tenant_id FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
            AND r.slug IN ('owner', 'admin', 'diretor', 'financeiro', 'finance')
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'contracts_insert' AND tablename = 'contracts') THEN
    CREATE POLICY contracts_insert ON contracts
      FOR INSERT WITH CHECK (
        tenant_id IN (
          SELECT tm.tenant_id FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
            AND r.slug IN ('owner', 'admin', 'diretor')
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'contracts_update' AND tablename = 'contracts') THEN
    CREATE POLICY contracts_update ON contracts
      FOR UPDATE USING (
        tenant_id IN (
          SELECT tm.tenant_id FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
            AND r.slug IN ('owner', 'admin', 'diretor')
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'contracts_delete' AND tablename = 'contracts') THEN
    CREATE POLICY contracts_delete ON contracts
      FOR DELETE USING (
        tenant_id IN (
          SELECT tm.tenant_id FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
            AND r.slug = 'owner'
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 10. Audit triggers (reusar fn_audit_trigger da migration 006)
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_talents') THEN
    CREATE TRIGGER trg_audit_talents
      AFTER INSERT OR UPDATE OR DELETE ON talents
      FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
  END IF;
EXCEPTION
  WHEN undefined_function THEN
    RAISE NOTICE 'fn_audit_trigger não existe — pulando trigger de audit para talents';
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_vacancies') THEN
    CREATE TRIGGER trg_audit_vacancies
      AFTER INSERT OR UPDATE OR DELETE ON vacancies
      FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
  END IF;
EXCEPTION
  WHEN undefined_function THEN
    RAISE NOTICE 'fn_audit_trigger não existe — pulando trigger de audit para vacancies';
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_vacancy_candidates') THEN
    CREATE TRIGGER trg_audit_vacancy_candidates
      AFTER INSERT OR UPDATE OR DELETE ON vacancy_candidates
      FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
  END IF;
EXCEPTION
  WHEN undefined_function THEN
    RAISE NOTICE 'fn_audit_trigger não existe — pulando trigger de audit para vacancy_candidates';
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_contracts') THEN
    CREATE TRIGGER trg_audit_contracts
      AFTER INSERT OR UPDATE OR DELETE ON contracts
      FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
  END IF;
EXCEPTION
  WHEN undefined_function THEN
    RAISE NOTICE 'fn_audit_trigger não existe — pulando trigger de audit para contracts';
END $$;

-- ============================================================================
-- FIM da Migration 025
-- ============================================================================
