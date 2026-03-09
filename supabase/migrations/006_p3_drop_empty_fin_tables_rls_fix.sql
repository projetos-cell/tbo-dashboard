-- P3: Consolidação de schemas paralelos fin_* e finance_*
-- Migration 006: Drop tabelas fin_* confirmadas vazias + adicionar RLS nas que ficam
--
-- REGRA: NUNCA modificar migrations existentes — sempre criar nova
-- Autor: Claude (P3 Path B – Progressive)
-- Data: 2026-03-09

-- ── 1. DROP tabelas fin_* confirmadas vazias ──────────────────────────────────
-- Diagnóstico P3 confirmou que estas tabelas nunca foram populadas.
-- fin_receivables, fin_payables → substituídas por finance_transactions
-- fin_balance_snapshots → modelo descontinuado
-- fin_invoices → nunca foi usada ativamente

-- fin_receivables (FK dep → fin_payables, fin_transactions não referencia ela)
DROP TABLE IF EXISTS fin_receivables CASCADE;

-- fin_payables (tem FK para fin_vendors, fin_invoices — CASCADE resolve)
DROP TABLE IF EXISTS fin_payables CASCADE;

-- fin_balance_snapshots (sem FKs de saída)
DROP TABLE IF EXISTS fin_balance_snapshots CASCADE;

-- fin_invoices (FKs para fin_clients, fin_vendors — CASCADE resolve)
-- ATENÇÃO: fin_transactions tem FK para fin_invoices(id) via invoice_id
-- Se fin_transactions tiver dados com invoice_id não-null, o CASCADE vai nullificar.
-- Como fin_transactions legada não é populada pelo omie-sync, é seguro.
DROP TABLE IF EXISTS fin_invoices CASCADE;

-- ── 2. RLS para fin_cost_centers ─────────────────────────────────────────────
-- Atualmente SEM RLS — vulnerabilidade crítica.
-- Tabela ainda referenciada pelo frontend até migração de código (P3 em progresso).

ALTER TABLE fin_cost_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_fin_cost_centers"
    ON fin_cost_centers FOR SELECT
    USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_insert_fin_cost_centers"
    ON fin_cost_centers FOR INSERT
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_update_fin_cost_centers"
    ON fin_cost_centers FOR UPDATE
    USING (tenant_id = ANY(get_user_tenant_ids()))
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_delete_fin_cost_centers"
    ON fin_cost_centers FOR DELETE
    USING (tenant_id = ANY(get_user_tenant_ids()));

-- ── 3. RLS para fin_categories ────────────────────────────────────────────────
-- Atualmente SEM RLS — vulnerabilidade crítica.

ALTER TABLE fin_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_fin_categories"
    ON fin_categories FOR SELECT
    USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_insert_fin_categories"
    ON fin_categories FOR INSERT
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_update_fin_categories"
    ON fin_categories FOR UPDATE
    USING (tenant_id = ANY(get_user_tenant_ids()))
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_delete_fin_categories"
    ON fin_categories FOR DELETE
    USING (tenant_id = ANY(get_user_tenant_ids()));

-- ── 4. RLS para fin_transactions ──────────────────────────────────────────────
-- Atualmente SEM RLS — vulnerabilidade crítica.
-- Mantida porque bank_transactions e reconciliation_audit têm FK referencing this table.

ALTER TABLE fin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_fin_transactions"
    ON fin_transactions FOR SELECT
    USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_insert_fin_transactions"
    ON fin_transactions FOR INSERT
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_update_fin_transactions"
    ON fin_transactions FOR UPDATE
    USING (tenant_id = ANY(get_user_tenant_ids()))
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_delete_fin_transactions"
    ON fin_transactions FOR DELETE
    USING (tenant_id = ANY(get_user_tenant_ids()));

-- ── 5. RLS para fin_vendors (temporário até drop pós-migração de código) ──────
ALTER TABLE fin_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_fin_vendors"
    ON fin_vendors FOR SELECT
    USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_insert_fin_vendors"
    ON fin_vendors FOR INSERT
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_update_fin_vendors"
    ON fin_vendors FOR UPDATE
    USING (tenant_id = ANY(get_user_tenant_ids()))
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_delete_fin_vendors"
    ON fin_vendors FOR DELETE
    USING (tenant_id = ANY(get_user_tenant_ids()));

-- ── 6. RLS para fin_clients (temporário até drop pós-migração de código) ──────
ALTER TABLE fin_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_fin_clients"
    ON fin_clients FOR SELECT
    USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_insert_fin_clients"
    ON fin_clients FOR INSERT
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_update_fin_clients"
    ON fin_clients FOR UPDATE
    USING (tenant_id = ANY(get_user_tenant_ids()))
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_delete_fin_clients"
    ON fin_clients FOR DELETE
    USING (tenant_id = ANY(get_user_tenant_ids()));

-- ── 7. RLS para fin_bank_accounts (temporário até drop pós-migração de código) ─
ALTER TABLE fin_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_fin_bank_accounts"
    ON fin_bank_accounts FOR SELECT
    USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_insert_fin_bank_accounts"
    ON fin_bank_accounts FOR INSERT
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_update_fin_bank_accounts"
    ON fin_bank_accounts FOR UPDATE
    USING (tenant_id = ANY(get_user_tenant_ids()))
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY "tenant_delete_fin_bank_accounts"
    ON fin_bank_accounts FOR DELETE
    USING (tenant_id = ANY(get_user_tenant_ids()));

-- ── PRÓXIMO PASSO (Migration 007 — após deploy e verificação) ─────────────────
-- Quando o código estiver 100% migrado para finance_vendors/clients/bank_accounts:
--   DROP TABLE fin_vendors CASCADE;
--   DROP TABLE fin_clients CASCADE;
--   DROP TABLE fin_bank_accounts CASCADE;
--   DROP TABLE fin_cost_centers CASCADE;  -- se omie-sync não sincronizar mais aqui
