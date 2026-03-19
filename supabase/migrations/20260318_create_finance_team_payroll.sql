-- ============================================================
-- TBO OS — finance_team_payroll table + RLS
-- Fonte canonica de folha de pagamento mensal (substitui Google Sheets)
-- ============================================================

-- 1. Tabela principal
CREATE TABLE IF NOT EXISTS public.finance_team_payroll (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES public.tenants(id),
  month       TEXT NOT NULL CHECK (month ~ '^\d{4}-\d{2}$'),
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT '',
  section     TEXT NOT NULL DEFAULT 'equipe'
              CHECK (section IN ('equipe', 'vendas', 'outros')),
  salary      NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  notes       TEXT,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (tenant_id, month, name)
);

-- 2. Indices
CREATE INDEX IF NOT EXISTS idx_ftp_tenant_month
  ON public.finance_team_payroll(tenant_id, month);
CREATE INDEX IF NOT EXISTS idx_ftp_tenant_active
  ON public.finance_team_payroll(tenant_id, is_active);

-- 3. RLS
ALTER TABLE public.finance_team_payroll ENABLE ROW LEVEL SECURITY;

-- Leitura: diretoria+
CREATE POLICY "ftp_select_diretoria"
  ON public.finance_team_payroll FOR SELECT
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('founder', 'diretoria')
    )
  );

-- Insert/Update/Delete: founder + diretoria
CREATE POLICY "ftp_insert_diretoria"
  ON public.finance_team_payroll FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "ftp_update_diretoria"
  ON public.finance_team_payroll FOR UPDATE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "ftp_delete_diretoria"
  ON public.finance_team_payroll FOR DELETE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('founder', 'diretoria')
    )
  );

-- 4. Trigger updated_at
CREATE TRIGGER finance_team_payroll_updated_at
  BEFORE UPDATE ON public.finance_team_payroll
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- 5. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.finance_team_payroll;
