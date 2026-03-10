-- ============================================================
-- TBO OS — team_members table + RLS
-- Migration: create_team_members
-- ============================================================

-- 1. Tabela principal
CREATE TABLE IF NOT EXISTS public.team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'colaborador'
              CHECK (role IN ('socio', 'product_owner', 'colaborador', 'viewer', 'guest')),
  department  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_sign_in_at TIMESTAMPTZ
);

-- 2. Indices
CREATE INDEX IF NOT EXISTS idx_team_members_role ON public.team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_is_active ON public.team_members(is_active);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);

-- 3. RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Socio: acesso total
CREATE POLICY "socio_full_access" ON public.team_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.id = auth.uid() AND tm.role = 'socio'
    )
  );

-- Product Owner: le todos, edita roles inferiores
CREATE POLICY "po_read_all" ON public.team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.id = auth.uid() AND tm.role IN ('socio', 'product_owner')
    )
  );

CREATE POLICY "po_update_lower" ON public.team_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.id = auth.uid() AND tm.role = 'product_owner'
    )
    AND role IN ('colaborador', 'viewer', 'guest')
  );

-- Colaborador: le todos, edita apenas seu proprio registro
CREATE POLICY "colaborador_read_all" ON public.team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.id = auth.uid() AND tm.role = 'colaborador'
    )
  );

CREATE POLICY "self_update" ON public.team_members
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    role = (SELECT tm.role FROM public.team_members tm WHERE tm.id = auth.uid())
  );

-- Viewer e Guest: le apenas dados basicos (mesma policy, read-only)
CREATE POLICY "viewer_guest_read" ON public.team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.id = auth.uid() AND tm.role IN ('viewer', 'guest')
    )
  );

-- 4. Trigger para updated_at automatico
CREATE OR REPLACE FUNCTION public.update_team_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_updated_at();

-- 5. Helper function para sync last_sign_in_at (chamada via Edge Function/webhook)
CREATE OR REPLACE FUNCTION public.update_last_sign_in(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.team_members
  SET last_sign_in_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
