-- ============================================================================
-- Migration 060: Fix RLS policies to match actual role names
-- Roles in DB use capitalized names (Founder, Owner) but policies used lowercase.
-- This migration uses LOWER() for case-insensitive matching.
-- ============================================================================

-- 1. recognition_rewards admin policies
DROP POLICY IF EXISTS rewards_insert_admin ON recognition_rewards;
CREATE POLICY rewards_insert_admin ON recognition_rewards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = recognition_rewards.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

DROP POLICY IF EXISTS rewards_update_admin ON recognition_rewards;
CREATE POLICY rewards_update_admin ON recognition_rewards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = recognition_rewards.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

DROP POLICY IF EXISTS rewards_delete_admin ON recognition_rewards;
CREATE POLICY rewards_delete_admin ON recognition_rewards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = recognition_rewards.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

-- 2. recognition_redemptions admin policy
DROP POLICY IF EXISTS redemptions_update_admin ON recognition_redemptions;
CREATE POLICY redemptions_update_admin ON recognition_redemptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = recognition_redemptions.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

-- Also fix the redemptions_select to include Founder
DROP POLICY IF EXISTS redemptions_select ON recognition_redemptions;
CREATE POLICY redemptions_select ON recognition_redemptions
  FOR SELECT USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM tenant_members tm
        JOIN roles r ON r.id = tm.role_id
        WHERE tm.user_id = auth.uid()
          AND tm.tenant_id = recognition_redemptions.tenant_id
          AND LOWER(r.name) IN ('owner', 'admin', 'founder')
      )
    )
  );

-- 3. culture_pages admin policies
DROP POLICY IF EXISTS culture_pages_update_admin ON culture_pages;
CREATE POLICY culture_pages_update_admin ON culture_pages
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = culture_pages.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

DROP POLICY IF EXISTS culture_pages_delete_admin ON culture_pages;
CREATE POLICY culture_pages_delete_admin ON culture_pages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = culture_pages.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

-- ============================================================================
-- FIM da Migration 060
-- ============================================================================
