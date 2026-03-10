-- ============================================================
-- Migration 023: Update profiles_role_check to include RBAC roles
-- OLD: founder, project_owner, artist, finance, comercial
-- NEW: adds diretoria, lider, colaborador (keeps legacy for compat)
-- ============================================================

ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'founder', 'diretoria', 'lider', 'colaborador',
    'project_owner', 'artist', 'finance', 'comercial'
  ));
