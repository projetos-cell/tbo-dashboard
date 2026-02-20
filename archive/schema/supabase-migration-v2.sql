-- ============================================================================
-- TBO OS — Supabase Migration v2
-- Fixes: comercial role, is_active flag, audit_log details column,
--        CRM deals RLS for comercial, user management
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================================

-- ============================================================================
-- 1. FIX: Add 'comercial' role to profiles CHECK constraint
-- ============================================================================
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('founder', 'project_owner', 'artist', 'finance', 'comercial'));

-- ============================================================================
-- 2. ADD: is_active flag for user management (deactivate instead of delete)
-- ============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Index for quick filtering of active users
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(is_active);

-- ============================================================================
-- 3. FIX: audit_log — add 'details' JSONB column (used by erp-core.js)
-- The app sends { details: { from, to, reason, entityName } }
-- ============================================================================
ALTER TABLE public.audit_log
  ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}';

-- ============================================================================
-- 4. FIX: CRM deals — allow 'comercial' role to update deals
-- ============================================================================
DROP POLICY IF EXISTS "crm_deals_update" ON public.crm_deals;
CREATE POLICY "crm_deals_update" ON public.crm_deals FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('founder', 'project_owner', 'comercial')
    )
  );

-- Also allow comercial to insert deals
DROP POLICY IF EXISTS "crm_deals_insert" ON public.crm_deals;
CREATE POLICY "crm_deals_insert" ON public.crm_deals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- 5. FIX: proposals — allow 'comercial' role to manage proposals
-- ============================================================================
DROP POLICY IF EXISTS "proposals_update" ON public.proposals;
CREATE POLICY "proposals_update" ON public.proposals FOR UPDATE
  USING (
    owner_id = auth.uid() OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('founder', 'project_owner', 'comercial')
    )
  );

-- ============================================================================
-- 6. ADD: Realtime for projects, tasks, deliverables (live updates)
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deliverables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_deals;

-- ============================================================================
-- 7. FIX: Update handle_new_user to include is_active
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role, email, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'artist'),
    NEW.email,
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. ADD: View for active team members (used by UI dropdowns)
-- ============================================================================
CREATE OR REPLACE VIEW public.active_team AS
  SELECT id, username, full_name, role, bu, is_coordinator, avatar_url, email
  FROM public.profiles
  WHERE is_active = TRUE
  ORDER BY full_name;

-- ============================================================================
-- DONE! Migration v2 applied.
-- Next: Create users in Supabase Auth and seed project data.
-- ============================================================================
