-- ============================================================================
-- TBO OS — Migration: Role-aware RLS for finance + CRM tables
-- Enforces RBAC at database level (not just frontend guards)
-- Only founder + diretoria can access finance; founder + diretoria + lider for CRM
-- ============================================================================

-- Helper: get current user's role slug from tenant_members
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT r.slug
     FROM public.tenant_members tm
     JOIN public.roles r ON r.id = tm.role_id
     WHERE tm.user_id = auth.uid()
       AND tm.is_active = true
     LIMIT 1),
    'colaborador'
  );
$$;

-- ============================================================================
-- FINANCE TABLES: founder + diretoria only
-- ============================================================================

-- finance_transactions: replace existing SELECT policy
DROP POLICY IF EXISTS "finance_transactions_select" ON finance_transactions;
CREATE POLICY "finance_transactions_select" ON finance_transactions
  FOR SELECT USING (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() IN ('founder', 'diretoria')
  );

-- finance_categories: replace existing SELECT policy
DROP POLICY IF EXISTS "finance_categories_select" ON finance_categories;
CREATE POLICY "finance_categories_select" ON finance_categories
  FOR SELECT USING (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() IN ('founder', 'diretoria')
  );

-- finance_cost_centers: replace existing SELECT policy
DROP POLICY IF EXISTS "finance_cost_centers_select" ON finance_cost_centers;
CREATE POLICY "finance_cost_centers_select" ON finance_cost_centers
  FOR SELECT USING (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() IN ('founder', 'diretoria')
  );

-- Also restrict INSERT/UPDATE/DELETE on finance tables to founder + diretoria
DROP POLICY IF EXISTS "finance_transactions_insert" ON finance_transactions;
CREATE POLICY "finance_transactions_insert" ON finance_transactions
  FOR INSERT WITH CHECK (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() IN ('founder', 'diretoria')
  );

DROP POLICY IF EXISTS "finance_transactions_update" ON finance_transactions;
CREATE POLICY "finance_transactions_update" ON finance_transactions
  FOR UPDATE USING (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() IN ('founder', 'diretoria')
  );

DROP POLICY IF EXISTS "finance_transactions_delete" ON finance_transactions;
CREATE POLICY "finance_transactions_delete" ON finance_transactions
  FOR DELETE USING (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() IN ('founder', 'diretoria')
  );

-- ============================================================================
-- CRM TABLES: founder + diretoria + lider
-- ============================================================================

-- crm_deals: replace existing SELECT policy
DROP POLICY IF EXISTS "crm_deals_select" ON crm_deals;
CREATE POLICY "crm_deals_select" ON crm_deals
  FOR SELECT USING (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() IN ('founder', 'diretoria', 'lider')
  );

DROP POLICY IF EXISTS "crm_deals_insert" ON crm_deals;
CREATE POLICY "crm_deals_insert" ON crm_deals
  FOR INSERT WITH CHECK (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() IN ('founder', 'diretoria', 'lider')
  );

DROP POLICY IF EXISTS "crm_deals_update" ON crm_deals;
CREATE POLICY "crm_deals_update" ON crm_deals
  FOR UPDATE USING (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() IN ('founder', 'diretoria', 'lider')
  );

DROP POLICY IF EXISTS "crm_deals_delete" ON crm_deals;
CREATE POLICY "crm_deals_delete" ON crm_deals
  FOR DELETE USING (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() IN ('founder', 'diretoria')
  );

-- crm_stages: same access as crm_deals
DROP POLICY IF EXISTS "crm_stages_select" ON crm_stages;
CREATE POLICY "crm_stages_select" ON crm_stages
  FOR SELECT USING (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() IN ('founder', 'diretoria', 'lider')
  );
