-- ============================================================
-- TBO OS — finance bank reconciliation tables + RLS
-- Item 01: Schema base para conciliação bancária
-- ============================================================

-- 1. finance_bank_accounts — contas bancárias cadastradas
CREATE TABLE IF NOT EXISTS public.finance_bank_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  bank_code       TEXT NOT NULL,                        -- código FEBRABAN (ex: 001 = BB)
  bank_name       TEXT NOT NULL DEFAULT '',
  agency          TEXT NOT NULL,
  account_number  TEXT NOT NULL,
  account_type    TEXT NOT NULL DEFAULT 'corrente'
                  CHECK (account_type IN ('corrente', 'poupanca', 'investimento', 'pagamento')),
  balance         NUMERIC(14,2) NOT NULL DEFAULT 0,
  last_sync_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive', 'error')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, bank_code, agency, account_number)
);

CREATE INDEX IF NOT EXISTS idx_fba_tenant ON public.finance_bank_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fba_status  ON public.finance_bank_accounts(tenant_id, status);

ALTER TABLE public.finance_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fba_select"
  ON public.finance_bank_accounts FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "fba_insert"
  ON public.finance_bank_accounts FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.tenant_id = finance_bank_accounts.tenant_id
        AND p.role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "fba_update"
  ON public.finance_bank_accounts FOR UPDATE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.tenant_id = finance_bank_accounts.tenant_id
        AND p.role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "fba_delete"
  ON public.finance_bank_accounts FOR DELETE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.tenant_id = finance_bank_accounts.tenant_id
        AND p.role = 'founder'
    )
  );

-- 2. finance_bank_transactions — transações importadas do extrato bancário
CREATE TABLE IF NOT EXISTS public.finance_bank_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES public.tenants(id),
  bank_account_id   UUID NOT NULL REFERENCES public.finance_bank_accounts(id) ON DELETE CASCADE,
  transaction_date  DATE NOT NULL,
  amount            NUMERIC(14,2) NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  description       TEXT NOT NULL DEFAULT '',
  category          TEXT,
  reference_id      TEXT,                               -- ID externo (OFX FITID, CNAB nosso número)
  ofx_id            TEXT,                               -- FITID do OFX (deduplication)
  reconciled        BOOLEAN NOT NULL DEFAULT FALSE,
  reconciled_at     TIMESTAMPTZ,
  reconciled_by     UUID REFERENCES auth.users(id),
  finance_tx_id     UUID,                               -- FK para finance_transactions (quando reconciliado)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bank_account_id, ofx_id)                     -- evita duplicação de importação
);

CREATE INDEX IF NOT EXISTS idx_fbt_tenant         ON public.finance_bank_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fbt_account        ON public.finance_bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_fbt_date           ON public.finance_bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_fbt_reconciled     ON public.finance_bank_transactions(tenant_id, reconciled);

ALTER TABLE public.finance_bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fbt_select"
  ON public.finance_bank_transactions FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "fbt_insert"
  ON public.finance_bank_transactions FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.tenant_id = finance_bank_transactions.tenant_id
        AND p.role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "fbt_update"
  ON public.finance_bank_transactions FOR UPDATE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.tenant_id = finance_bank_transactions.tenant_id
        AND p.role IN ('founder', 'diretoria')
    )
  );

-- 3. finance_reconciliation_rules — regras de matching automático
CREATE TABLE IF NOT EXISTS public.finance_reconciliation_rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES public.tenants(id),
  name        TEXT NOT NULL,
  pattern     TEXT NOT NULL,                            -- regex ou substring para match na descrição
  category    TEXT,
  description TEXT,
  auto_match  BOOLEAN NOT NULL DEFAULT FALSE,           -- se true: reconcilia automaticamente se score > 85
  priority    INTEGER NOT NULL DEFAULT 10,              -- menor = maior prioridade
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_frr_tenant          ON public.finance_reconciliation_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_frr_tenant_active   ON public.finance_reconciliation_rules(tenant_id, is_active, priority);

ALTER TABLE public.finance_reconciliation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "frr_select"
  ON public.finance_reconciliation_rules FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "frr_insert"
  ON public.finance_reconciliation_rules FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.tenant_id = finance_reconciliation_rules.tenant_id
        AND p.role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "frr_update"
  ON public.finance_reconciliation_rules FOR UPDATE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.tenant_id = finance_reconciliation_rules.tenant_id
        AND p.role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "frr_delete"
  ON public.finance_reconciliation_rules FOR DELETE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.tenant_id = finance_reconciliation_rules.tenant_id
        AND p.role = 'founder'
    )
  );

-- 4. Trigger updated_at para finance_bank_accounts
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'fba_set_updated_at'
  ) THEN
    CREATE TRIGGER fba_set_updated_at
      BEFORE UPDATE ON public.finance_bank_accounts
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'frr_set_updated_at'
  ) THEN
    CREATE TRIGGER frr_set_updated_at
      BEFORE UPDATE ON public.finance_reconciliation_rules
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;
