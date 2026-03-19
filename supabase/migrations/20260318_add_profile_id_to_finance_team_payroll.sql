-- ============================================================
-- TBO OS — Add profile_id FK to finance_team_payroll
-- Links payroll entries to canonical profiles table
-- ============================================================

ALTER TABLE public.finance_team_payroll
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ftp_profile_id
ON public.finance_team_payroll(profile_id);
