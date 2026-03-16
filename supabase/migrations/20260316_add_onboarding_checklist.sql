-- ============================================================================
-- TBO OS — Migration: Add onboarding_checklist to profiles
-- Stores self-service onboarding progress as JSONB
-- Format: { "task_id": { "completed": true, "completed_at": "ISO" } }
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_checklist JSONB DEFAULT '{}';

-- Index for querying incomplete onboarding
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_incomplete
  ON profiles (tenant_id)
  WHERE onboarding_wizard_completed = true
    AND onboarding_checklist = '{}';
