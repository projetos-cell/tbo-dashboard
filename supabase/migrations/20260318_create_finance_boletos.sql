-- ============================================================
-- TBO OS — finance_boletos table + RLS
-- Item 05: Geração automática de boletos (integração bancária)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.finance_boletos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES public.tenants(id),
  invoice_id       UUID,                                     -- FK opcional para faturas
  barcode          TEXT NOT NULL,                            -- código de barras (44 dígitos numéricos)
  digitable_line   TEXT NOT NULL,                            -- linha digitável formatada
  due_date         DATE NOT NULL,
  amount           NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  status           TEXT NOT NULL DEFAULT 'emitido'
                   CHECK (status IN ('emitido', 'pago', 'vencido', 'cancelado', 'substituido')),
  bank_return_code TEXT,                                     -- código de retorno do arquivo CNAB 400
  paid_at          TIMESTAMPTZ,
  paid_amount      NUMERIC(14,2),
  nosso_numero     TEXT NOT NULL,                            -- número sequencial no banco (max 10 dígitos BB)
  remessa_sent_at  TIMESTAMPTZ,                              -- quando o arquivo de remessa foi enviado
  payer_name       TEXT,
  payer_document   TEXT,                                     -- CPF ou CNPJ do pagador
  payer_address    TEXT,
  instructions     TEXT,                                     -- instruções ao banco (ex: "Não receber após vencimento")
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fbol_tenant  ON public.finance_boletos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fbol_status  ON public.finance_boletos(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_fbol_due     ON public.finance_boletos(tenant_id, due_date);
CREATE INDEX IF NOT EXISTS idx_fbol_invoice ON public.finance_boletos(invoice_id) WHERE invoice_id IS NOT NULL;

ALTER TABLE public.finance_boletos ENABLE ROW LEVEL SECURITY;

-- SELECT: diretoria+
CREATE POLICY "fbol_select"
  ON public.finance_boletos FOR SELECT
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.tenant_id = finance_boletos.tenant_id
        AND p.role IN ('founder', 'diretoria')
    )
  );

-- INSERT: diretoria+
CREATE POLICY "fbol_insert"
  ON public.finance_boletos FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.tenant_id = finance_boletos.tenant_id
        AND p.role IN ('founder', 'diretoria')
    )
  );

-- UPDATE: diretoria+
CREATE POLICY "fbol_update"
  ON public.finance_boletos FOR UPDATE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.tenant_id = finance_boletos.tenant_id
        AND p.role IN ('founder', 'diretoria')
    )
  );

-- DELETE: founder only
CREATE POLICY "fbol_delete"
  ON public.finance_boletos FOR DELETE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.tenant_id = finance_boletos.tenant_id
        AND p.role = 'founder'
    )
  );

-- Trigger updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'fbol_set_updated_at'
  ) THEN
    CREATE TRIGGER fbol_set_updated_at
      BEFORE UPDATE ON public.finance_boletos
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;
