-- ============================================================
-- Migration 022: Fix profiles RLS + RBAC helper functions
--
-- ROOT CAUSE: is_founder_or_admin() only checked slugs
-- 'admin','socio' but roles table has 'owner','founder'.
-- Also: only 2/11 users have tenant_members entries.
-- FIX: Update function + populate tenant_members + add roles.
-- ============================================================

-- 1. Add missing roles to roles table
INSERT INTO roles (tenant_id, name, slug, description, label, color, is_system, sort_order)
VALUES
  ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Diretoria', 'diretoria', 'Acesso executivo, financeiro e estrategico', 'Diretoria', '#8b5cf6', true, 200),
  ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Lider', 'lider', 'Gestao de equipe e projetos', 'Lider', '#3b82f6', true, 300),
  ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Colaborador', 'colaborador', 'Acesso operacional padrao', 'Colaborador', '#94a3b8', true, 400)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- 2. Fix is_founder_or_admin() to check ALL valid admin slugs + profiles.role fallback
CREATE OR REPLACE FUNCTION is_founder_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tenant_members tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = auth.uid()
      AND tm.is_active = true
      AND r.slug IN ('admin', 'socio', 'founder', 'owner', 'diretoria')
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('founder', 'diretoria')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Populate tenant_members for ALL profiles missing entries
INSERT INTO tenant_members (tenant_id, user_id, role_id, is_active)
SELECT
  p.tenant_id,
  p.id,
  r.id,
  p.is_active
FROM profiles p
JOIN roles r ON r.slug = p.role AND r.tenant_id = p.tenant_id
WHERE p.tenant_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM tenant_members tm
    WHERE tm.user_id = p.id AND tm.tenant_id = p.tenant_id
  );

-- 4. Add INSERT policy for admins
DROP POLICY IF EXISTS rls_profiles_insert_admin ON profiles;
CREATE POLICY rls_profiles_insert_admin ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    is_founder_or_admin()
    AND tenant_id IN (SELECT get_user_tenant_ids())
  );

-- 5. Create helper function for role hierarchy
CREATE OR REPLACE FUNCTION get_role_level(role_slug TEXT)
RETURNS INT AS $$
  SELECT CASE role_slug
    WHEN 'founder' THEN 4
    WHEN 'diretoria' THEN 3
    WHEN 'lider' THEN 2
    WHEN 'colaborador' THEN 1
    ELSE 0
  END
$$ LANGUAGE sql IMMUTABLE;

-- 6. Create trigger to auto-sync tenant_members when profiles.role changes
CREATE OR REPLACE FUNCTION sync_profile_to_tenant_member()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NOT NULL AND NEW.role IS NOT NULL THEN
    INSERT INTO tenant_members (tenant_id, user_id, role_id, is_active)
    SELECT
      NEW.tenant_id,
      NEW.id,
      r.id,
      COALESCE(NEW.is_active, true)
    FROM roles r
    WHERE r.slug = NEW.role AND r.tenant_id = NEW.tenant_id
    ON CONFLICT (tenant_id, user_id) DO UPDATE SET
      role_id = EXCLUDED.role_id,
      is_active = EXCLUDED.is_active;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_profile_tenant_member ON profiles;
CREATE TRIGGER trg_sync_profile_tenant_member
  AFTER INSERT OR UPDATE OF role, is_active, tenant_id ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_to_tenant_member();
