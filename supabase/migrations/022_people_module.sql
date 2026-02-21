-- ============================================================================
-- TBO OS — Migration 022: People Module (PRD People v1.0)
-- Evolui profiles + cria teams para gestão de pessoas completa.
-- Idempotente: seguro re-executar.
-- ============================================================================

-- ============================================================================
-- 1. Novas colunas em profiles
-- ============================================================================

-- Telefone (opcional)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Gestor direto (FK para auth.users — mesmo padrão de project_memberships)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'manager_id') THEN
    ALTER TABLE profiles ADD COLUMN manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Status granular (substitui is_active boolean para estados ricos)
-- is_active mantido para retrocompatibilidade — trigger sincroniza
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') THEN
    ALTER TABLE profiles ADD COLUMN status TEXT DEFAULT 'active';
    ALTER TABLE profiles ADD CONSTRAINT chk_profiles_status
      CHECK (status IN ('active','inactive','vacation','away','onboarding','suspended'));
  END IF;
END $$;

-- team_id (FK para teams — adicionada após criação da tabela)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'team_id') THEN
    ALTER TABLE profiles ADD COLUMN team_id UUID;
  END IF;
END $$;

-- ============================================================================
-- 2. Tabela teams
-- ============================================================================

CREATE TABLE IF NOT EXISTS teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#64748B',
  icon        TEXT DEFAULT 'users',
  manager_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- FK profiles.team_id → teams(id)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_profiles_team_id'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT fk_profiles_team_id
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- 3. Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_manager_id ON profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_tenant_id ON teams(tenant_id);
CREATE INDEX IF NOT EXISTS idx_teams_manager ON teams(manager_user_id);

-- ============================================================================
-- 4. RLS para teams
-- ============================================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- SELECT: membros do tenant podem ver teams
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'teams_select' AND tablename = 'teams') THEN
    CREATE POLICY teams_select ON teams
      FOR SELECT USING (
        tenant_id IN (
          SELECT tenant_id FROM tenant_members
          WHERE user_id = auth.uid() AND is_active = TRUE
        )
      );
  END IF;
END $$;

-- INSERT: apenas admin/founder
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'teams_insert' AND tablename = 'teams') THEN
    CREATE POLICY teams_insert ON teams
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

-- UPDATE: apenas admin/founder
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'teams_update' AND tablename = 'teams') THEN
    CREATE POLICY teams_update ON teams
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

-- DELETE: apenas owner
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'teams_delete' AND tablename = 'teams') THEN
    CREATE POLICY teams_delete ON teams
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
-- 5. Trigger: sincronizar is_active ↔ status
-- Garante retrocompatibilidade — código existente checa is_active
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_sync_profile_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando status muda → atualizar is_active
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.is_active := NEW.status IN ('active', 'onboarding');
  END IF;
  -- Quando is_active muda diretamente (código legado) → atualizar status
  IF TG_OP = 'UPDATE' AND NEW.is_active IS DISTINCT FROM OLD.is_active AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
    IF NEW.is_active = TRUE THEN
      NEW.status := 'active';
    ELSE
      NEW.status := 'inactive';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sync_profile_status') THEN
    CREATE TRIGGER trg_sync_profile_status
      BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION fn_sync_profile_status();
  END IF;
END $$;

-- ============================================================================
-- 6. Audit trigger para teams
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_teams') THEN
    CREATE TRIGGER trg_audit_teams
      AFTER INSERT OR UPDATE OR DELETE ON teams
      FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
  END IF;
EXCEPTION
  WHEN undefined_function THEN
    RAISE NOTICE 'fn_audit_trigger não existe — pulando trigger de audit para teams';
END $$;

-- ============================================================================
-- 7. Seed teams das BUs existentes (para cada tenant)
-- ============================================================================

INSERT INTO teams (tenant_id, name, description, color, icon)
SELECT t.id, bu.name, bu.description, bu.color, bu.icon
FROM tenants t
CROSS JOIN (
  VALUES
    ('Branding',    'BU de Branding e Identidade Visual',   '#8B5CF6', 'palette'),
    ('Digital 3D',  'BU de Visualização 3D e Renders',      '#3A7BD5', 'box'),
    ('Marketing',   'BU de Marketing e Performance',        '#F59E0B', 'megaphone'),
    ('Vendas',      'BU de Vendas e Comercial',             '#2ECC71', 'trending-up')
) AS bu(name, description, color, icon)
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ============================================================================
-- 8. Backfill: profiles.status a partir de is_active
-- ============================================================================

UPDATE profiles SET status = 'active'   WHERE is_active = TRUE  AND (status IS NULL OR status = '');
UPDATE profiles SET status = 'inactive' WHERE is_active = FALSE AND (status IS NULL OR status = '');

-- ============================================================================
-- 9. Backfill: profiles.team_id a partir de profiles.bu
-- Só vincula se BU corresponde a um team do mesmo tenant
-- ============================================================================

UPDATE profiles p
SET team_id = t.id
FROM teams t
WHERE p.bu = t.name
  AND p.tenant_id = t.tenant_id
  AND p.team_id IS NULL
  AND p.bu IS NOT NULL AND p.bu != '';

-- ============================================================================
-- FIM da Migration 022
-- ============================================================================
