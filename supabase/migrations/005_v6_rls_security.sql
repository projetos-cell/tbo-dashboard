-- ============================================================================
-- TBO OS v2 — Migration v6: Row Level Security Completa
-- Adiciona RLS multi-tenant a TODAS as tabelas que estavam sem isolamento
-- Executar no Supabase SQL Editor
--
-- IMPORTANTE: Esta migration e IDEMPOTENTE — seguro executar multiplas vezes.
-- Usa DROP POLICY IF EXISTS antes de cada CREATE POLICY.
-- Usa CREATE OR REPLACE para funcoes.
-- Usa DO $$ blocks com IF NOT EXISTS para ALTER TABLE.
--
-- Versao: 6.0.0
-- Data: 2026-02-19
-- Autor: Marco (founder)
-- ============================================================================

-- ============================================================================
-- SECAO 0: FUNCOES AUXILIARES
-- Funcoes reutilizaveis para evitar repeticao de subqueries em policies
-- ============================================================================

-- ── get_user_tenant_ids() ──────────────────────────────────────────────────
-- Retorna todos os tenant_ids do usuario autenticado.
-- Usada em TODAS as policies RLS baseadas em tenant_id.
-- SECURITY DEFINER garante que a funcao executa com permissoes elevadas,
-- permitindo acessar tenant_members mesmo quando RLS esta ativo.
CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS SETOF UUID AS $$
  SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── get_user_role_in_tenant() ──────────────────────────────────────────────
-- Retorna o slug do role do usuario em um tenant especifico.
-- Util para policies que precisam verificar cargo (ex: admin, socio).
CREATE OR REPLACE FUNCTION get_user_role_in_tenant(p_tenant_id UUID)
RETURNS TEXT AS $$
  SELECT r.slug
  FROM tenant_members tm
  JOIN roles r ON r.id = tm.role_id
  WHERE tm.user_id = auth.uid()
    AND tm.tenant_id = p_tenant_id
    AND tm.is_active = true
  LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── is_founder_or_admin() ──────────────────────────────────────────────────
-- Verifica se o usuario e founder/admin em QUALQUER tenant que pertence.
-- Usado para policies de tabelas sensiveis (audit, config, financeiro).
CREATE OR REPLACE FUNCTION is_founder_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tenant_members tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = auth.uid()
      AND tm.is_active = true
      AND r.slug IN ('admin', 'socio')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── get_session_context() ──────────────────────────────────────────────────
-- RPC que retorna todo o contexto do usuario em uma unica chamada.
-- Evita multiplas queries no frontend para obter user, tenants, roles, permissions.
-- Parametro p_tenant_id opcional: se fornecido, retorna contexto daquele tenant.
CREATE OR REPLACE FUNCTION get_session_context(p_tenant_id UUID DEFAULT NULL)
RETURNS JSON AS $$
  SELECT json_build_object(
    'user_id', auth.uid(),
    'tenants', (
      SELECT COALESCE(json_agg(json_build_object(
        'tenant_id', t.id,
        'tenant_name', t.name,
        'tenant_slug', t.slug,
        'role_slug', r.slug,
        'role_name', r.name,
        'is_active', tm.is_active,
        'joined_at', tm.joined_at
      )), '[]'::json)
      FROM tenant_members tm
      JOIN tenants t ON t.id = tm.tenant_id
      LEFT JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.is_active = true
        AND (p_tenant_id IS NULL OR tm.tenant_id = p_tenant_id)
    ),
    'permissions', (
      SELECT COALESCE(json_agg(json_build_object(
        'tenant_id', r.tenant_id,
        'module', rp.module,
        'can_view', rp.can_view,
        'can_create', rp.can_create,
        'can_edit', rp.can_edit,
        'can_delete', rp.can_delete,
        'can_export', rp.can_export
      )), '[]'::json)
      FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      JOIN role_permissions rp ON rp.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.is_active = true
        AND (p_tenant_id IS NULL OR tm.tenant_id = p_tenant_id)
    ),
    'profile', (
      SELECT row_to_json(p.*)
      FROM profiles p
      WHERE p.id = auth.uid()
    )
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================================
-- SECAO 1: TABELA audit_logs (nova, com schema correto)
-- A tabela antiga audit_log continua existindo; esta e a versao melhorada.
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);


-- ============================================================================
-- SECAO 2: ADICIONAR tenant_id EM TABELAS QUE NAO TEM
-- Garante que business_config, financial_data, document_versions,
-- contract_attachments, decisions, meetings, time_entries, knowledge_items,
-- monthly_closings e company_context tenham tenant_id.
-- ============================================================================

DO $$
BEGIN
    -- business_config: adicionar tenant_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='business_config' AND column_name='tenant_id') THEN
        ALTER TABLE business_config ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;

    -- financial_data: adicionar tenant_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_data' AND column_name='tenant_id') THEN
        ALTER TABLE financial_data ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;

    -- document_versions: adicionar tenant_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='document_versions' AND column_name='tenant_id') THEN
        ALTER TABLE document_versions ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;

    -- contract_attachments: adicionar tenant_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contract_attachments' AND column_name='tenant_id') THEN
        ALTER TABLE contract_attachments ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;

    -- decisions: adicionar tenant_id (se nao existir)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='decisions' AND column_name='tenant_id') THEN
        ALTER TABLE decisions ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;

    -- meetings: adicionar tenant_id (se nao existir)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meetings' AND column_name='tenant_id') THEN
        ALTER TABLE meetings ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;

    -- time_entries: adicionar tenant_id (se nao existir)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='time_entries' AND column_name='tenant_id') THEN
        ALTER TABLE time_entries ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;

    -- knowledge_items: adicionar tenant_id (se nao existir)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='knowledge_items' AND column_name='tenant_id') THEN
        ALTER TABLE knowledge_items ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;

    -- monthly_closings: adicionar tenant_id (se nao existir)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monthly_closings' AND column_name='tenant_id') THEN
        ALTER TABLE monthly_closings ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;

    -- company_context: adicionar tenant_id (se nao existir)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='company_context' AND column_name='tenant_id') THEN
        ALTER TABLE company_context ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
END$$;

-- Indexes para as novas colunas tenant_id
CREATE INDEX IF NOT EXISTS idx_business_config_tenant ON business_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_financial_data_tenant ON financial_data(tenant_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_tenant ON document_versions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contract_attachments_tenant ON contract_attachments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_decisions_tenant ON decisions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_meetings_tenant ON meetings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_tenant ON time_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_tenant ON knowledge_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_monthly_closings_tenant ON monthly_closings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_company_context_tenant ON company_context(tenant_id);


-- ============================================================================
-- SECAO 3: BACKFILL — Preencher tenant_id existente com o tenant padrao (TBO)
-- Para dados que ja existem e nao tinham tenant_id.
-- ============================================================================

DO $$
DECLARE
    v_default_tenant UUID;
BEGIN
    SELECT id INTO v_default_tenant FROM tenants WHERE slug = 'tbo' LIMIT 1;

    IF v_default_tenant IS NOT NULL THEN
        -- Backfill em todas as tabelas que receberam tenant_id
        UPDATE profiles SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE projects SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE tasks SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE crm_deals SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE deliverables SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE proposals SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE notifications SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE document_versions SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE contract_attachments SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE decisions SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE meetings SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE time_entries SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE knowledge_items SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE business_config SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE financial_data SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE company_context SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        UPDATE monthly_closings SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
        -- audit_log (tabela antiga) — backfill se tiver tenant_id
        UPDATE audit_log SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
    END IF;
END$$;


-- ============================================================================
-- SECAO 4: RLS PARA profiles
-- Caso especial: PK e id = auth.uid() (nao usa tenant_id no filtro principal)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas (v1)
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON profiles;
DROP POLICY IF EXISTS "profiles_update_founder" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;
DROP POLICY IF EXISTS "rls_profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "rls_profiles_select_tenant" ON profiles;
DROP POLICY IF EXISTS "rls_profiles_insert" ON profiles;
DROP POLICY IF EXISTS "rls_profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "rls_profiles_update_admin" ON profiles;
DROP POLICY IF EXISTS "rls_profiles_delete_admin" ON profiles;

-- SELECT: usuario ve seu proprio perfil
CREATE POLICY "rls_profiles_select_own" ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

-- SELECT: membros do mesmo tenant veem perfis uns dos outros
CREATE POLICY "rls_profiles_select_tenant" ON profiles FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- INSERT: service_role e triggers criam perfis (via handle_new_user)
-- Usuarios autenticados nao precisam inserir diretamente
CREATE POLICY "rls_profiles_insert" ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- UPDATE: usuario pode atualizar seu proprio perfil
CREATE POLICY "rls_profiles_update_own" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- UPDATE: admin/socio pode atualizar perfis do mesmo tenant
CREATE POLICY "rls_profiles_update_admin" ON profiles FOR UPDATE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );

-- DELETE: somente admin/socio pode remover perfis
CREATE POLICY "rls_profiles_delete_admin" ON profiles FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 5: RLS PARA projects
-- ============================================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select" ON projects;
DROP POLICY IF EXISTS "projects_insert" ON projects;
DROP POLICY IF EXISTS "projects_update" ON projects;
DROP POLICY IF EXISTS "projects_delete" ON projects;
DROP POLICY IF EXISTS "rls_projects_select" ON projects;
DROP POLICY IF EXISTS "rls_projects_insert" ON projects;
DROP POLICY IF EXISTS "rls_projects_update" ON projects;
DROP POLICY IF EXISTS "rls_projects_delete" ON projects;

CREATE POLICY "rls_projects_select" ON projects FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_projects_insert" ON projects FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_projects_update" ON projects FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_projects_delete" ON projects FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 6: RLS PARA tasks
-- ============================================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_delete" ON tasks;
DROP POLICY IF EXISTS "rls_tasks_select" ON tasks;
DROP POLICY IF EXISTS "rls_tasks_insert" ON tasks;
DROP POLICY IF EXISTS "rls_tasks_update" ON tasks;
DROP POLICY IF EXISTS "rls_tasks_delete" ON tasks;

CREATE POLICY "rls_tasks_select" ON tasks FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_tasks_insert" ON tasks FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_tasks_update" ON tasks FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_tasks_delete" ON tasks FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 7: RLS PARA crm_deals
-- ============================================================================

ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_deals_select" ON crm_deals;
DROP POLICY IF EXISTS "crm_deals_insert" ON crm_deals;
DROP POLICY IF EXISTS "crm_deals_update" ON crm_deals;
DROP POLICY IF EXISTS "crm_deals_delete" ON crm_deals;
DROP POLICY IF EXISTS "rls_crm_deals_select" ON crm_deals;
DROP POLICY IF EXISTS "rls_crm_deals_insert" ON crm_deals;
DROP POLICY IF EXISTS "rls_crm_deals_update" ON crm_deals;
DROP POLICY IF EXISTS "rls_crm_deals_delete" ON crm_deals;

CREATE POLICY "rls_crm_deals_select" ON crm_deals FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_crm_deals_insert" ON crm_deals FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_crm_deals_update" ON crm_deals FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_crm_deals_delete" ON crm_deals FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 8: RLS PARA deliverables
-- ============================================================================

ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deliverables_select" ON deliverables;
DROP POLICY IF EXISTS "deliverables_insert" ON deliverables;
DROP POLICY IF EXISTS "deliverables_update" ON deliverables;
DROP POLICY IF EXISTS "deliverables_delete" ON deliverables;
DROP POLICY IF EXISTS "rls_deliverables_select" ON deliverables;
DROP POLICY IF EXISTS "rls_deliverables_insert" ON deliverables;
DROP POLICY IF EXISTS "rls_deliverables_update" ON deliverables;
DROP POLICY IF EXISTS "rls_deliverables_delete" ON deliverables;

CREATE POLICY "rls_deliverables_select" ON deliverables FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_deliverables_insert" ON deliverables FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_deliverables_update" ON deliverables FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_deliverables_delete" ON deliverables FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 9: RLS PARA proposals
-- ============================================================================

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proposals_select" ON proposals;
DROP POLICY IF EXISTS "proposals_insert" ON proposals;
DROP POLICY IF EXISTS "proposals_update" ON proposals;
DROP POLICY IF EXISTS "proposals_delete" ON proposals;
DROP POLICY IF EXISTS "rls_proposals_select" ON proposals;
DROP POLICY IF EXISTS "rls_proposals_insert" ON proposals;
DROP POLICY IF EXISTS "rls_proposals_update" ON proposals;
DROP POLICY IF EXISTS "rls_proposals_delete" ON proposals;

CREATE POLICY "rls_proposals_select" ON proposals FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_proposals_insert" ON proposals FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_proposals_update" ON proposals FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_proposals_delete" ON proposals FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 10: RLS PARA notifications
-- Caso especial: filtro por user_id para notificacoes proprias,
-- tenant_id para admins verem todas do tenant.
-- ============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;
DROP POLICY IF EXISTS "notifications_delete" ON notifications;
DROP POLICY IF EXISTS "rls_notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "rls_notifications_select_admin" ON notifications;
DROP POLICY IF EXISTS "rls_notifications_insert" ON notifications;
DROP POLICY IF EXISTS "rls_notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "rls_notifications_delete_own" ON notifications;

-- SELECT: usuario ve suas proprias notificacoes
CREATE POLICY "rls_notifications_select_own" ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- SELECT: admin/socio veem notificacoes de todo o tenant
CREATE POLICY "rls_notifications_select_admin" ON notifications FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );

-- INSERT: qualquer membro do tenant pode criar notificacoes (triggers, automacoes)
CREATE POLICY "rls_notifications_insert" ON notifications FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

-- UPDATE: usuario so atualiza suas proprias notificacoes (marcar como lida)
CREATE POLICY "rls_notifications_update_own" ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- DELETE: usuario so deleta suas proprias notificacoes
CREATE POLICY "rls_notifications_delete_own" ON notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());


-- ============================================================================
-- SECAO 11: RLS PARA document_versions
-- ============================================================================

ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doc_versions_select" ON document_versions;
DROP POLICY IF EXISTS "doc_versions_insert" ON document_versions;
DROP POLICY IF EXISTS "doc_versions_update" ON document_versions;
DROP POLICY IF EXISTS "doc_versions_delete" ON document_versions;
DROP POLICY IF EXISTS "rls_document_versions_select" ON document_versions;
DROP POLICY IF EXISTS "rls_document_versions_insert" ON document_versions;
DROP POLICY IF EXISTS "rls_document_versions_update" ON document_versions;
DROP POLICY IF EXISTS "rls_document_versions_delete" ON document_versions;

CREATE POLICY "rls_document_versions_select" ON document_versions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_document_versions_insert" ON document_versions FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_document_versions_update" ON document_versions FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_document_versions_delete" ON document_versions FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 12: RLS PARA contract_attachments
-- ============================================================================

ALTER TABLE contract_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contract_attachments_select" ON contract_attachments;
DROP POLICY IF EXISTS "contract_attachments_insert" ON contract_attachments;
DROP POLICY IF EXISTS "contract_attachments_delete" ON contract_attachments;
DROP POLICY IF EXISTS "rls_contract_attachments_select" ON contract_attachments;
DROP POLICY IF EXISTS "rls_contract_attachments_insert" ON contract_attachments;
DROP POLICY IF EXISTS "rls_contract_attachments_update" ON contract_attachments;
DROP POLICY IF EXISTS "rls_contract_attachments_delete" ON contract_attachments;

CREATE POLICY "rls_contract_attachments_select" ON contract_attachments FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_contract_attachments_insert" ON contract_attachments FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_contract_attachments_update" ON contract_attachments FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_contract_attachments_delete" ON contract_attachments FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 13: RLS PARA audit_log (tabela antiga — manter compatibilidade)
-- Logs de auditoria: INSERT liberado para todos (automacoes geram logs),
-- SELECT restrito a admins/socios, UPDATE e DELETE proibidos.
-- ============================================================================

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_select" ON audit_log;
DROP POLICY IF EXISTS "audit_log_insert" ON audit_log;
DROP POLICY IF EXISTS "rls_audit_log_select" ON audit_log;
DROP POLICY IF EXISTS "rls_audit_log_insert" ON audit_log;

-- SELECT: somente admin/socio pode ver logs de auditoria
CREATE POLICY "rls_audit_log_select" ON audit_log FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );

-- INSERT: qualquer usuario autenticado pode gerar logs (triggers, automacoes)
CREATE POLICY "rls_audit_log_insert" ON audit_log FOR INSERT TO authenticated
  WITH CHECK (true);

-- Sem UPDATE/DELETE — logs de auditoria sao imutaveis


-- ============================================================================
-- SECAO 14: RLS PARA audit_logs (tabela nova)
-- Mesma logica da audit_log: INSERT aberto, SELECT restrito a admins.
-- ============================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rls_audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "rls_audit_logs_insert" ON audit_logs;

-- SELECT: somente admin/socio pode ver logs
CREATE POLICY "rls_audit_logs_select" ON audit_logs FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );

-- INSERT: qualquer autenticado pode gerar log (todos geram atividade)
CREATE POLICY "rls_audit_logs_insert" ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- Sem UPDATE/DELETE — logs sao imutaveis


-- ============================================================================
-- SECAO 15: RLS PARA decisions
-- ============================================================================

ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "decisions_select" ON decisions;
DROP POLICY IF EXISTS "decisions_insert" ON decisions;
DROP POLICY IF EXISTS "decisions_update" ON decisions;
DROP POLICY IF EXISTS "decisions_delete" ON decisions;
DROP POLICY IF EXISTS "rls_decisions_select" ON decisions;
DROP POLICY IF EXISTS "rls_decisions_insert" ON decisions;
DROP POLICY IF EXISTS "rls_decisions_update" ON decisions;
DROP POLICY IF EXISTS "rls_decisions_delete" ON decisions;

CREATE POLICY "rls_decisions_select" ON decisions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_decisions_insert" ON decisions FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_decisions_update" ON decisions FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_decisions_delete" ON decisions FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 16: RLS PARA meetings
-- ============================================================================

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meetings_select" ON meetings;
DROP POLICY IF EXISTS "meetings_insert" ON meetings;
DROP POLICY IF EXISTS "meetings_update" ON meetings;
DROP POLICY IF EXISTS "meetings_delete" ON meetings;
DROP POLICY IF EXISTS "rls_meetings_select" ON meetings;
DROP POLICY IF EXISTS "rls_meetings_insert" ON meetings;
DROP POLICY IF EXISTS "rls_meetings_update" ON meetings;
DROP POLICY IF EXISTS "rls_meetings_delete" ON meetings;

CREATE POLICY "rls_meetings_select" ON meetings FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_meetings_insert" ON meetings FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_meetings_update" ON meetings FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_meetings_delete" ON meetings FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 17: RLS PARA time_entries
-- ============================================================================

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "time_entries_select" ON time_entries;
DROP POLICY IF EXISTS "time_entries_insert" ON time_entries;
DROP POLICY IF EXISTS "time_entries_update" ON time_entries;
DROP POLICY IF EXISTS "time_entries_delete" ON time_entries;
DROP POLICY IF EXISTS "rls_time_entries_select" ON time_entries;
DROP POLICY IF EXISTS "rls_time_entries_insert" ON time_entries;
DROP POLICY IF EXISTS "rls_time_entries_update" ON time_entries;
DROP POLICY IF EXISTS "rls_time_entries_delete" ON time_entries;

-- SELECT: usuario ve suas proprias entradas OU admin/socio ve todas do tenant
CREATE POLICY "rls_time_entries_select" ON time_entries FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      user_id = auth.uid()
      OR is_founder_or_admin()
    )
  );

CREATE POLICY "rls_time_entries_insert" ON time_entries FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

-- UPDATE: usuario edita suas proprias entradas OU admin edita qualquer uma do tenant
CREATE POLICY "rls_time_entries_update" ON time_entries FOR UPDATE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      user_id = auth.uid()
      OR is_founder_or_admin()
    )
  );

-- DELETE: usuario deleta suas proprias OU admin deleta qualquer uma
CREATE POLICY "rls_time_entries_delete" ON time_entries FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      user_id = auth.uid()
      OR is_founder_or_admin()
    )
  );


-- ============================================================================
-- SECAO 18: RLS PARA knowledge_items
-- ============================================================================

ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "knowledge_items_select" ON knowledge_items;
DROP POLICY IF EXISTS "knowledge_items_insert" ON knowledge_items;
DROP POLICY IF EXISTS "knowledge_items_update" ON knowledge_items;
DROP POLICY IF EXISTS "knowledge_items_delete" ON knowledge_items;
DROP POLICY IF EXISTS "rls_knowledge_items_select" ON knowledge_items;
DROP POLICY IF EXISTS "rls_knowledge_items_insert" ON knowledge_items;
DROP POLICY IF EXISTS "rls_knowledge_items_update" ON knowledge_items;
DROP POLICY IF EXISTS "rls_knowledge_items_delete" ON knowledge_items;

CREATE POLICY "rls_knowledge_items_select" ON knowledge_items FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_knowledge_items_insert" ON knowledge_items FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_knowledge_items_update" ON knowledge_items FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "rls_knowledge_items_delete" ON knowledge_items FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 19: RLS PARA business_config
-- Tabela sensivel: somente admin/socio pode ver e editar configuracoes.
-- ============================================================================

ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can read business_config" ON business_config;
DROP POLICY IF EXISTS "Anon can manage business_config" ON business_config;
DROP POLICY IF EXISTS "rls_business_config_select" ON business_config;
DROP POLICY IF EXISTS "rls_business_config_insert" ON business_config;
DROP POLICY IF EXISTS "rls_business_config_update" ON business_config;
DROP POLICY IF EXISTS "rls_business_config_delete" ON business_config;

-- SELECT: qualquer membro do tenant pode ler configs (necessario para o app funcionar)
CREATE POLICY "rls_business_config_select" ON business_config FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- INSERT: somente admin/socio pode criar configs
CREATE POLICY "rls_business_config_insert" ON business_config FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );

-- UPDATE: somente admin/socio pode atualizar configs
CREATE POLICY "rls_business_config_update" ON business_config FOR UPDATE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );

-- DELETE: somente admin/socio pode deletar configs
CREATE POLICY "rls_business_config_delete" ON business_config FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 20: RLS PARA financial_data
-- Tabela sensivel: dados financeiros tem acesso restrito.
-- ============================================================================

ALTER TABLE financial_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can read financial_data" ON financial_data;
DROP POLICY IF EXISTS "Anon can manage financial_data" ON financial_data;
DROP POLICY IF EXISTS "rls_financial_data_select" ON financial_data;
DROP POLICY IF EXISTS "rls_financial_data_insert" ON financial_data;
DROP POLICY IF EXISTS "rls_financial_data_update" ON financial_data;
DROP POLICY IF EXISTS "rls_financial_data_delete" ON financial_data;

-- SELECT: membros do tenant podem ver dados financeiros
-- (controle fino por role deve ser feito no frontend/API)
CREATE POLICY "rls_financial_data_select" ON financial_data FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- INSERT: somente admin/socio pode inserir dados financeiros
CREATE POLICY "rls_financial_data_insert" ON financial_data FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );

-- UPDATE: somente admin/socio pode atualizar dados financeiros
CREATE POLICY "rls_financial_data_update" ON financial_data FOR UPDATE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );

-- DELETE: somente admin/socio pode deletar dados financeiros
CREATE POLICY "rls_financial_data_delete" ON financial_data FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 21: RLS PARA company_context
-- Tabela sensivel: contexto da empresa (key-value store).
-- ============================================================================

ALTER TABLE company_context ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "company_context_select" ON company_context;
DROP POLICY IF EXISTS "company_context_all_founder" ON company_context;
DROP POLICY IF EXISTS "rls_company_context_select" ON company_context;
DROP POLICY IF EXISTS "rls_company_context_insert" ON company_context;
DROP POLICY IF EXISTS "rls_company_context_update" ON company_context;
DROP POLICY IF EXISTS "rls_company_context_delete" ON company_context;

-- SELECT: membros do tenant podem ler contexto
CREATE POLICY "rls_company_context_select" ON company_context FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- INSERT: somente admin/socio
CREATE POLICY "rls_company_context_insert" ON company_context FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );

-- UPDATE: somente admin/socio
CREATE POLICY "rls_company_context_update" ON company_context FOR UPDATE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );

-- DELETE: somente admin/socio
CREATE POLICY "rls_company_context_delete" ON company_context FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 22: RLS PARA monthly_closings
-- Tabela sensivel: fechamentos mensais so podem ser alterados por admins.
-- ============================================================================

ALTER TABLE monthly_closings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "monthly_closings_select" ON monthly_closings;
DROP POLICY IF EXISTS "monthly_closings_all_founder" ON monthly_closings;
DROP POLICY IF EXISTS "rls_monthly_closings_select" ON monthly_closings;
DROP POLICY IF EXISTS "rls_monthly_closings_insert" ON monthly_closings;
DROP POLICY IF EXISTS "rls_monthly_closings_update" ON monthly_closings;
DROP POLICY IF EXISTS "rls_monthly_closings_delete" ON monthly_closings;

-- SELECT: membros do tenant podem ver fechamentos
CREATE POLICY "rls_monthly_closings_select" ON monthly_closings FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- INSERT: somente admin/socio pode criar fechamentos
CREATE POLICY "rls_monthly_closings_insert" ON monthly_closings FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );

-- UPDATE: somente admin/socio pode editar fechamentos
CREATE POLICY "rls_monthly_closings_update" ON monthly_closings FOR UPDATE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );

-- DELETE: somente admin/socio pode remover fechamentos
CREATE POLICY "rls_monthly_closings_delete" ON monthly_closings FOR DELETE TO authenticated
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND is_founder_or_admin()
  );


-- ============================================================================
-- SECAO 23: GRANT EXECUTE nas funcoes auxiliares
-- Garante que usuarios autenticados possam chamar as funcoes helper.
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_user_tenant_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role_in_tenant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_founder_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_session_context(UUID) TO authenticated;


-- ============================================================================
-- SECAO 24: CHANGELOG
-- Registrar esta migration no changelog
-- ============================================================================

INSERT INTO changelog_entries (version, title, description, author, tag, published_at) VALUES
(
  '2.3.0',
  'RLS Multi-tenant Completo',
  'Row Level Security aplicada a TODAS as tabelas com isolamento por tenant_id. '
  || 'Funcoes auxiliares get_user_tenant_ids(), is_founder_or_admin(), get_session_context(). '
  || 'Tabela audit_logs criada com schema correto. '
  || 'Backfill de tenant_id em tabelas existentes. '
  || 'Policies antigas removidas e substituidas por policies baseadas em tenant.',
  'Marco',
  'security',
  '2026-02-19'
)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- RESUMO DA MIGRATION
-- ============================================================================
--
-- Funcoes criadas:
--   1. get_user_tenant_ids()       - Retorna tenant_ids do usuario
--   2. get_user_role_in_tenant()   - Retorna role slug em tenant especifico
--   3. is_founder_or_admin()       - Verifica se e admin/socio
--   4. get_session_context()       - RPC completo de contexto do usuario
--
-- Tabela criada:
--   1. audit_logs (nova, com tenant_id, resource_type, ip_address, user_agent)
--
-- Colunas adicionadas (tenant_id):
--   business_config, financial_data, document_versions, contract_attachments,
--   decisions, meetings, time_entries, knowledge_items, monthly_closings,
--   company_context
--
-- RLS aplicado (18 tabelas):
--   1.  profiles             - own + tenant (admin pode editar outros)
--   2.  projects             - tenant_id (delete: admin only)
--   3.  tasks                - tenant_id (delete: admin only)
--   4.  crm_deals            - tenant_id (delete: admin only)
--   5.  deliverables         - tenant_id (delete: admin only)
--   6.  proposals            - tenant_id (delete: admin only)
--   7.  notifications        - user_id own (admin ve todo tenant)
--   8.  document_versions    - tenant_id (delete: admin only)
--   9.  contract_attachments - tenant_id (delete: admin only)
--   10. audit_log            - insert: todos, select: admin only
--   11. audit_logs           - insert: todos, select: admin only
--   12. decisions            - tenant_id (delete: admin only)
--   13. meetings             - tenant_id (delete: admin only)
--   14. time_entries         - tenant_id + user_id own (admin ve tudo)
--   15. knowledge_items      - tenant_id (delete: admin only)
--   16. business_config      - select: tenant, write: admin only
--   17. financial_data       - select: tenant, write: admin only
--   18. company_context      - select: tenant, write: admin only
--   19. monthly_closings     - select: tenant, write: admin only
--
-- ============================================================================
-- FIM DA MIGRATION v6
-- ============================================================================
