-- G2: RLS para tabelas finance core
-- Migration 007: finance_transactions, finance_categories, finance_cost_centers
--
-- REGRA: NUNCA modificar migrations existentes — sempre criar nova
-- Autor: Claude (omie-fix G2)
-- Data: 2026-03-09

-- ── Padrão de idempotência ────────────────────────────────────────────────────
-- Policies são criadas dentro de blocos DO $$ com verificação em pg_policies,
-- evitando erros em re-runs da migration.

-- ── 1. finance_transactions ───────────────────────────────────────────────────

ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'finance_transactions'
      AND policyname = 'finance_transactions_tenant_select'
  ) THEN
    CREATE POLICY "finance_transactions_tenant_select"
      ON finance_transactions FOR SELECT TO authenticated
      USING (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'finance_transactions'
      AND policyname = 'finance_transactions_tenant_insert'
  ) THEN
    CREATE POLICY "finance_transactions_tenant_insert"
      ON finance_transactions FOR INSERT TO authenticated
      WITH CHECK (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'finance_transactions'
      AND policyname = 'finance_transactions_tenant_update'
  ) THEN
    CREATE POLICY "finance_transactions_tenant_update"
      ON finance_transactions FOR UPDATE TO authenticated
      USING (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ))
      WITH CHECK (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'finance_transactions'
      AND policyname = 'finance_transactions_tenant_delete'
  ) THEN
    CREATE POLICY "finance_transactions_tenant_delete"
      ON finance_transactions FOR DELETE TO authenticated
      USING (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ));
  END IF;
END $$;

-- ── 2. finance_categories ─────────────────────────────────────────────────────

ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'finance_categories'
      AND policyname = 'finance_categories_tenant_select'
  ) THEN
    CREATE POLICY "finance_categories_tenant_select"
      ON finance_categories FOR SELECT TO authenticated
      USING (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'finance_categories'
      AND policyname = 'finance_categories_tenant_insert'
  ) THEN
    CREATE POLICY "finance_categories_tenant_insert"
      ON finance_categories FOR INSERT TO authenticated
      WITH CHECK (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'finance_categories'
      AND policyname = 'finance_categories_tenant_update'
  ) THEN
    CREATE POLICY "finance_categories_tenant_update"
      ON finance_categories FOR UPDATE TO authenticated
      USING (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ))
      WITH CHECK (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'finance_categories'
      AND policyname = 'finance_categories_tenant_delete'
  ) THEN
    CREATE POLICY "finance_categories_tenant_delete"
      ON finance_categories FOR DELETE TO authenticated
      USING (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ));
  END IF;
END $$;

-- ── 3. finance_cost_centers ───────────────────────────────────────────────────

ALTER TABLE finance_cost_centers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'finance_cost_centers'
      AND policyname = 'finance_cost_centers_tenant_select'
  ) THEN
    CREATE POLICY "finance_cost_centers_tenant_select"
      ON finance_cost_centers FOR SELECT TO authenticated
      USING (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'finance_cost_centers'
      AND policyname = 'finance_cost_centers_tenant_insert'
  ) THEN
    CREATE POLICY "finance_cost_centers_tenant_insert"
      ON finance_cost_centers FOR INSERT TO authenticated
      WITH CHECK (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'finance_cost_centers'
      AND policyname = 'finance_cost_centers_tenant_update'
  ) THEN
    CREATE POLICY "finance_cost_centers_tenant_update"
      ON finance_cost_centers FOR UPDATE TO authenticated
      USING (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ))
      WITH CHECK (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'finance_cost_centers'
      AND policyname = 'finance_cost_centers_tenant_delete'
  ) THEN
    CREATE POLICY "finance_cost_centers_tenant_delete"
      ON finance_cost_centers FOR DELETE TO authenticated
      USING (tenant_id IN (
        SELECT tenant_members.tenant_id FROM tenant_members
        WHERE tenant_members.user_id = auth.uid()
      ));
  END IF;
END $$;
