-- ============================================================================
-- TBO OS — Schema Completo Consolidado (Source of Truth)
-- Consolida todas as 15 migrations (schema.sql, v2.3, v3..v11) num unico ficheiro.
--
-- IDEMPOTENTE: Seguro executar multiplas vezes.
-- Usa CREATE TABLE IF NOT EXISTS, CREATE OR REPLACE FUNCTION,
-- DROP POLICY IF EXISTS + CREATE POLICY, ON CONFLICT DO NOTHING.
--
-- Versao: 3.0.0
-- Data: 2026-02-20
-- Autor: Marco (founder)
-- ============================================================================


-- ============================================================================
-- S1: EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================================
-- S2: MULTI-TENANT CORE TABLES
-- ============================================================================

-- ── Tenants ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Roles ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    label TEXT,
    color TEXT DEFAULT '#94a3b8',
    is_system BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

-- ── Permissions (catalogo granular) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(module, action)
);

-- ── Role Permissions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module TEXT NOT NULL,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT true,
    can_view BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_export BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(role_id, module)
);

-- ── Tenant Members ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenant_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);

-- ── Project Memberships (override de role por projeto) ──────────────────────
CREATE TABLE IF NOT EXISTS project_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    granted_at TIMESTAMPTZ DEFAULT now(),
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE(project_id, user_id)
);


-- ============================================================================
-- S3: HELPER FUNCTIONS
-- ============================================================================

-- ── update_updated_at_column() ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── get_user_tenant_ids() ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS SETOF UUID AS $$
  SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── get_user_role_in_tenant(UUID) ───────────────────────────────────────────
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

-- ── is_founder_or_admin() ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_founder_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tenant_members tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = auth.uid()
      AND tm.is_active = true
      AND r.slug IN ('admin', 'owner')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── get_session_context(UUID) ───────────────────────────────────────────────
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

-- ── get_colaborador_id() ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_colaborador_id()
RETURNS uuid AS $$
  SELECT id FROM colaboradores WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── get_perfil_acesso() ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_perfil_acesso()
RETURNS text AS $$
  SELECT perfil_acesso FROM colaboradores WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── check_module_access(UUID, TEXT) ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_module_access(p_user_id UUID, p_module TEXT)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM tenant_members tm
        JOIN role_permissions rp ON rp.role_id = tm.role_id
        WHERE tm.user_id = p_user_id
          AND tm.is_active = true
          AND rp.module = p_module
          AND rp.can_view = true
    )
$$;

-- ── check_permission(UUID, TEXT, TEXT) ───────────────────────────────────────
CREATE OR REPLACE FUNCTION check_permission(p_user_id UUID, p_module TEXT, p_action TEXT)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM tenant_members tm
        JOIN role_permissions rp ON rp.role_id = tm.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE tm.user_id = p_user_id
          AND tm.is_active = true
          AND p.module = p_module
          AND p.action = p_action
          AND rp.granted = true
    )
$$;

-- ── get_user_permissions(UUID) ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE(module TEXT, action TEXT, granted BOOLEAN)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
    SELECT DISTINCT p.module, p.action, rp.granted
    FROM tenant_members tm
    JOIN role_permissions rp ON rp.role_id = tm.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE tm.user_id = p_user_id
      AND tm.is_active = true
      AND rp.granted = true
    ORDER BY p.module, p.action
$$;

-- ── get_all_roles_with_permissions(UUID) ────────────────────────────────────
CREATE OR REPLACE FUNCTION get_all_roles_with_permissions(p_tenant_id UUID)
RETURNS TABLE(
    role_id UUID, role_slug TEXT, role_name TEXT, role_label TEXT,
    role_color TEXT, role_sort_order INT, is_system BOOLEAN, permissions JSONB
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id AS role_id, r.slug AS role_slug, r.name AS role_name,
        r.label AS role_label, r.color AS role_color, r.sort_order AS role_sort_order,
        r.is_system,
        COALESCE(
            (SELECT jsonb_agg(jsonb_build_object(
                'permission_id', p.id, 'module', p.module,
                'action', p.action, 'granted', rp.granted
            ) ORDER BY p.sort_order)
            FROM role_permissions rp
            JOIN permissions p ON p.id = rp.permission_id
            WHERE rp.role_id = r.id AND rp.granted = true),
            '[]'::jsonb
        ) AS permissions
    FROM roles r
    WHERE r.tenant_id = p_tenant_id
    ORDER BY r.sort_order;
END;
$$;

-- ── get_user_role_in_tenant(UUID, UUID) — versao com 2 params ───────────────
CREATE OR REPLACE FUNCTION get_user_role_in_tenant(p_user_id UUID, p_tenant_id UUID)
RETURNS TABLE(role_name TEXT, role_label TEXT, permissions JSONB)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.slug AS role_name, r.name AS role_label,
        COALESCE(
            (SELECT jsonb_agg(jsonb_build_object(
                'module', rp.module, 'can_view', rp.can_view,
                'can_create', rp.can_create, 'can_edit', rp.can_edit,
                'can_delete', rp.can_delete, 'can_export', rp.can_export
            ))
            FROM role_permissions rp WHERE rp.role_id = r.id),
            '[]'::jsonb
        ) AS permissions
    FROM tenant_members tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = p_user_id AND tm.tenant_id = p_tenant_id AND tm.is_active = true
    LIMIT 1;
END;
$$;

-- ── log_audit_event() ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION log_audit_event(
    p_action TEXT, p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL, p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID; v_user_id UUID; v_log_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN RETURN NULL; END IF;
    SELECT tm.tenant_id INTO v_tenant_id FROM tenant_members tm
    WHERE tm.user_id = v_user_id AND tm.is_active = true LIMIT 1;
    INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, metadata)
    VALUES (v_tenant_id, v_user_id, p_action, p_entity_type, p_entity_id, p_metadata)
    RETURNING id INTO v_log_id;
    RETURN v_log_id;
END;
$$;


-- ============================================================================
-- S4: CORE TABLES
-- ============================================================================

-- ── Changelog Entries ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS changelog_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    author TEXT,
    tag TEXT CHECK (tag IN ('feature', 'fix', 'improvement', 'breaking', 'security')),
    module TEXT,
    published_at DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Collaborator History ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collaborator_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- ── Integration Configs ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS integration_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    provider TEXT NOT NULL,
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    last_sync_status TEXT,
    last_sync_error TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, provider)
);

-- ── Sync Logs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    provider TEXT NOT NULL,
    direction TEXT CHECK (direction IN ('pull', 'push', 'bidirectional')),
    entity_type TEXT,
    records_fetched INT DEFAULT 0,
    records_created INT DEFAULT 0,
    records_updated INT DEFAULT 0,
    records_errors INT DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial', 'error')),
    error_details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Culture Pages ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS culture_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT,
    category TEXT CHECK (category IN ('valores', 'praticas', 'rituais', 'padroes', 'geral')),
    order_index INT DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

-- ── Audit Logs (tabela nova — v6/v7) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    resource_type TEXT,
    resource_id UUID,
    details JSONB,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Document Versions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    document_type TEXT NOT NULL DEFAULT 'deliverable'
      CHECK (document_type IN ('deliverable', 'proposal', 'contract', 'template', 'knowledge')),
    version INTEGER NOT NULL DEFAULT 1,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    mime_type TEXT DEFAULT '',
    thumbnail_path TEXT,
    changelog TEXT,
    uploaded_by UUID,
    uploaded_by_name TEXT,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(document_id, version)
);

-- ── Dynamic Templates ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dynamic_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'proposta'
      CHECK (type IN ('proposta', 'contrato', 'email', 'briefing', 'relatorio', 'ata', 'outro')),
    name TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL DEFAULT '',
    variables JSONB DEFAULT '[]',
    category TEXT DEFAULT 'geral',
    is_default BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_by UUID,
    created_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Digest Logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS digest_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'weekly' CHECK (type IN ('daily', 'weekly', 'financial')),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    subject TEXT NOT NULL,
    content_html TEXT,
    snapshot JSONB DEFAULT '{}',
    sent_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);

-- ── Person Tasks ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS person_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    person_id TEXT NOT NULL,
    assigned_by UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','em_andamento','concluida','cancelada')),
    priority TEXT DEFAULT 'media' CHECK (priority IN ('alta','media','baixa')),
    due_date DATE,
    category TEXT DEFAULT 'general' CHECK (category IN ('pdi','onboarding','1on1_action','general')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── ALTER TABLE tenant_id em tabelas pre-existentes ─────────────────────────
DO $$
BEGIN
    -- profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='tenant_id') THEN
        ALTER TABLE profiles ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='first_login_completed') THEN
        ALTER TABLE profiles ADD COLUMN first_login_completed BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='onboarding_wizard_completed') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_wizard_completed BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='module_tours_completed') THEN
        ALTER TABLE profiles ADD COLUMN module_tours_completed JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='cargo') THEN
        ALTER TABLE profiles ADD COLUMN cargo TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='department') THEN
        ALTER TABLE profiles ADD COLUMN department TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='salary_pj') THEN
        ALTER TABLE profiles ADD COLUMN salary_pj NUMERIC(15,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='contract_type') THEN
        ALTER TABLE profiles ADD COLUMN contract_type TEXT DEFAULT 'pj';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='start_date') THEN
        ALTER TABLE profiles ADD COLUMN start_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='document_cnpj') THEN
        ALTER TABLE profiles ADD COLUMN document_cnpj TEXT;
    END IF;
    -- projects
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='tenant_id') THEN
        ALTER TABLE projects ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- tasks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='tenant_id') THEN
        ALTER TABLE tasks ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- deliverables
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliverables' AND column_name='tenant_id') THEN
        ALTER TABLE deliverables ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- proposals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='tenant_id') THEN
        ALTER TABLE proposals ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- crm_deals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crm_deals' AND column_name='tenant_id') THEN
        ALTER TABLE crm_deals ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- notifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='tenant_id') THEN
        ALTER TABLE notifications ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='trigger_type') THEN
        ALTER TABLE notifications ADD COLUMN trigger_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='entity_type') THEN
        ALTER TABLE notifications ADD COLUMN entity_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='entity_id') THEN
        ALTER TABLE notifications ADD COLUMN entity_id UUID;
    END IF;
    -- audit_log (tabela antiga)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='tenant_id') THEN
        ALTER TABLE audit_log ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- business_config
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='business_config' AND column_name='tenant_id') THEN
        ALTER TABLE business_config ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- financial_data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_data' AND column_name='tenant_id') THEN
        ALTER TABLE financial_data ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- document_versions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='document_versions' AND column_name='tenant_id') THEN
        ALTER TABLE document_versions ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- contract_attachments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contract_attachments' AND column_name='tenant_id') THEN
        ALTER TABLE contract_attachments ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- decisions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='decisions' AND column_name='tenant_id') THEN
        ALTER TABLE decisions ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- meetings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meetings' AND column_name='tenant_id') THEN
        ALTER TABLE meetings ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- time_entries
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='time_entries' AND column_name='tenant_id') THEN
        ALTER TABLE time_entries ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- knowledge_items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='knowledge_items' AND column_name='tenant_id') THEN
        ALTER TABLE knowledge_items ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- monthly_closings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monthly_closings' AND column_name='tenant_id') THEN
        ALTER TABLE monthly_closings ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- company_context
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='company_context' AND column_name='tenant_id') THEN
        ALTER TABLE company_context ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- colaboradores
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='colaboradores' AND column_name='tenant_id') THEN
        ALTER TABLE colaboradores ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
END$$;


-- ============================================================================
-- S5: ONBOARDING SYSTEM
-- ============================================================================

-- ── Colaboradores ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS colaboradores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid REFERENCES auth.users(id),
    nome text NOT NULL,
    email text UNIQUE NOT NULL,
    telefone text,
    foto_url text,
    cargo text NOT NULL,
    tipo_contrato text,
    perfil_acesso text DEFAULT 'colaborador',
    data_inicio date NOT NULL,
    buddy_id uuid REFERENCES colaboradores(id),
    cadastrado_por uuid REFERENCES colaboradores(id),
    status text DEFAULT 'pre-onboarding',
    tipo_onboarding text DEFAULT 'completo',
    onboarding_concluido_em timestamptz,
    quiz_score_final int,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS convites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id uuid REFERENCES colaboradores(id) ON DELETE CASCADE,
    token text UNIQUE NOT NULL,
    expira_em timestamptz NOT NULL,
    usado_em timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS onboarding_dias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    numero int NOT NULL,
    titulo text NOT NULL,
    tema text,
    carga text,
    tipo_onboarding text NOT NULL,
    tem_checkin_humano boolean DEFAULT false,
    duracao_checkin_min int
);

CREATE TABLE IF NOT EXISTS onboarding_atividades (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dia_id uuid REFERENCES onboarding_dias(id) ON DELETE CASCADE,
    ordem int NOT NULL,
    titulo text NOT NULL,
    descricao text,
    tipo text NOT NULL,
    url_conteudo text,
    tempo_estimado_min int,
    acao_conclusao text,
    score_minimo int,
    obrigatorio boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS onboarding_progresso (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id uuid REFERENCES colaboradores(id) ON DELETE CASCADE,
    atividade_id uuid REFERENCES onboarding_atividades(id) ON DELETE CASCADE,
    concluido boolean DEFAULT false,
    concluido_em timestamptz,
    tentativas int DEFAULT 0,
    score int,
    resposta_tarefa text,
    UNIQUE(colaborador_id, atividade_id)
);

CREATE TABLE IF NOT EXISTS onboarding_dias_liberados (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id uuid REFERENCES colaboradores(id) ON DELETE CASCADE,
    dia_id uuid REFERENCES onboarding_dias(id) ON DELETE CASCADE,
    liberado_em timestamptz DEFAULT now(),
    concluido boolean DEFAULT false,
    concluido_em timestamptz,
    UNIQUE(colaborador_id, dia_id)
);

CREATE TABLE IF NOT EXISTS onboarding_checkins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id uuid REFERENCES colaboradores(id) ON DELETE CASCADE,
    responsavel_id uuid REFERENCES colaboradores(id),
    dia_numero int,
    agendado_para timestamptz,
    duracao_min int,
    realizado boolean DEFAULT false,
    realizado_em timestamptz,
    anotacoes text
);

CREATE TABLE IF NOT EXISTS onboarding_notificacoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id uuid REFERENCES colaboradores(id) ON DELETE CASCADE,
    tipo text,
    gatilho text,
    destinatario text,
    mensagem text,
    enviado_em timestamptz DEFAULT now(),
    status text DEFAULT 'enviado',
    lida boolean DEFAULT false,
    lida_em timestamptz
);

CREATE TABLE IF NOT EXISTS colaboradores_status_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id uuid REFERENCES colaboradores(id) ON DELETE CASCADE,
    status_anterior text,
    status_novo text,
    alterado_em timestamptz DEFAULT now()
);

-- ── Onboarding Functions ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  UPDATE colaboradores SET auth_user_id = NEW.id
  WHERE email = NEW.email AND auth_user_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION gerar_convite()
RETURNS trigger AS $$
DECLARE _token text;
BEGIN
  _token := encode(gen_random_bytes(32), 'hex');
  INSERT INTO convites (colaborador_id, token, expira_em)
  VALUES (NEW.id, _token, now() + interval '7 days');
  IF NEW.status = 'pre-onboarding' THEN
    UPDATE colaboradores SET status = 'aguardando_inicio' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_gerar_convite ON colaboradores;
CREATE TRIGGER trg_gerar_convite
  AFTER INSERT ON colaboradores
  FOR EACH ROW EXECUTE FUNCTION gerar_convite();

CREATE OR REPLACE FUNCTION verificar_conclusao_dia()
RETURNS trigger AS $$
DECLARE _dia_id uuid; _total_obrigatorias int; _total_concluidas int; _colaborador_id uuid;
BEGIN
  _colaborador_id := NEW.colaborador_id;
  SELECT a.dia_id INTO _dia_id FROM onboarding_atividades a WHERE a.id = NEW.atividade_id;
  IF _dia_id IS NULL THEN RETURN NEW; END IF;
  SELECT COUNT(*) INTO _total_obrigatorias FROM onboarding_atividades WHERE dia_id = _dia_id AND obrigatorio = true;
  SELECT COUNT(*) INTO _total_concluidas FROM onboarding_progresso p
    JOIN onboarding_atividades a ON a.id = p.atividade_id
    WHERE p.colaborador_id = _colaborador_id AND a.dia_id = _dia_id AND a.obrigatorio = true AND p.concluido = true;
  IF _total_concluidas >= _total_obrigatorias THEN
    UPDATE onboarding_dias_liberados SET concluido = true, concluido_em = now()
    WHERE colaborador_id = _colaborador_id AND dia_id = _dia_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_verificar_conclusao_dia ON onboarding_progresso;
CREATE TRIGGER trg_verificar_conclusao_dia
  AFTER UPDATE OF concluido ON onboarding_progresso
  FOR EACH ROW WHEN (NEW.concluido = true) EXECUTE FUNCTION verificar_conclusao_dia();

DROP TRIGGER IF EXISTS trg_verificar_conclusao_dia_insert ON onboarding_progresso;
CREATE TRIGGER trg_verificar_conclusao_dia_insert
  AFTER INSERT ON onboarding_progresso
  FOR EACH ROW WHEN (NEW.concluido = true) EXECUTE FUNCTION verificar_conclusao_dia();

CREATE OR REPLACE FUNCTION liberar_proximo_dia()
RETURNS trigger AS $$
DECLARE _colaborador_id uuid; _dia_numero int; _tipo_onboarding text; _total_dias int; _proximo_dia_id uuid;
BEGIN
  IF NEW.concluido = true AND (OLD.concluido IS NULL OR OLD.concluido = false) THEN
    _colaborador_id := NEW.colaborador_id;
    SELECT d.numero, d.tipo_onboarding INTO _dia_numero, _tipo_onboarding
    FROM onboarding_dias d WHERE d.id = NEW.dia_id;
    SELECT COUNT(*) INTO _total_dias FROM onboarding_dias WHERE tipo_onboarding = _tipo_onboarding;
    IF _dia_numero >= _total_dias THEN
      UPDATE colaboradores SET status = 'ativo', onboarding_concluido_em = now() WHERE id = _colaborador_id;
    ELSE
      SELECT d.id INTO _proximo_dia_id FROM onboarding_dias d
      WHERE d.tipo_onboarding = _tipo_onboarding AND d.numero = _dia_numero + 1 LIMIT 1;
      IF _proximo_dia_id IS NOT NULL THEN
        INSERT INTO onboarding_dias_liberados (colaborador_id, dia_id)
        VALUES (_colaborador_id, _proximo_dia_id) ON CONFLICT (colaborador_id, dia_id) DO NOTHING;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_liberar_proximo_dia ON onboarding_dias_liberados;
CREATE TRIGGER trg_liberar_proximo_dia
  AFTER UPDATE OF concluido ON onboarding_dias_liberados
  FOR EACH ROW EXECUTE FUNCTION liberar_proximo_dia();

CREATE OR REPLACE FUNCTION log_mudanca_status()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO colaboradores_status_log (colaborador_id, status_anterior, status_novo)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_mudanca_status ON colaboradores;
CREATE TRIGGER trg_log_mudanca_status
  AFTER UPDATE OF status ON colaboradores
  FOR EACH ROW EXECUTE FUNCTION log_mudanca_status();

-- ── Onboarding Views ────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW vw_progresso_onboarding AS
SELECT
  c.id AS colaborador_id, c.nome, c.email, c.cargo, c.status,
  c.tipo_onboarding, c.data_inicio, c.buddy_id, b.nome AS buddy_nome,
  (SELECT COUNT(*) FROM onboarding_atividades a JOIN onboarding_dias d ON d.id = a.dia_id
   WHERE d.tipo_onboarding = c.tipo_onboarding AND a.obrigatorio = true) AS total_atividades,
  (SELECT COUNT(*) FROM onboarding_progresso p JOIN onboarding_atividades a ON a.id = p.atividade_id
   JOIN onboarding_dias d ON d.id = a.dia_id
   WHERE p.colaborador_id = c.id AND d.tipo_onboarding = c.tipo_onboarding AND a.obrigatorio = true AND p.concluido = true) AS atividades_concluidas,
  (SELECT COUNT(*) FROM onboarding_dias_liberados dl WHERE dl.colaborador_id = c.id AND dl.concluido = true) AS dias_concluidos,
  (SELECT COUNT(*) FROM onboarding_dias d WHERE d.tipo_onboarding = c.tipo_onboarding) AS total_dias
FROM colaboradores c
LEFT JOIN colaboradores b ON b.id = c.buddy_id
WHERE c.status IN ('onboarding', 'aguardando_inicio', 'pre-onboarding');

CREATE OR REPLACE VIEW vw_colaboradores_inativos AS
SELECT
  c.id AS colaborador_id, c.nome, c.email, c.cargo, c.buddy_id,
  b.nome AS buddy_nome, b.email AS buddy_email, c.tipo_onboarding,
  (SELECT MAX(p.concluido_em) FROM onboarding_progresso p WHERE p.colaborador_id = c.id AND p.concluido = true) AS ultima_atividade_em,
  EXTRACT(EPOCH FROM (now() - COALESCE(
    (SELECT MAX(p.concluido_em) FROM onboarding_progresso p WHERE p.colaborador_id = c.id AND p.concluido = true),
    (SELECT MIN(dl.liberado_em) FROM onboarding_dias_liberados dl WHERE dl.colaborador_id = c.id),
    c.data_inicio::timestamptz
  ))) / 86400.0 AS dias_sem_atividade
FROM colaboradores c
LEFT JOIN colaboradores b ON b.id = c.buddy_id
WHERE c.status = 'onboarding'
  AND (
    (SELECT MAX(p.concluido_em) FROM onboarding_progresso p WHERE p.colaborador_id = c.id AND p.concluido = true) < now() - interval '1 day'
    OR (
      NOT EXISTS (SELECT 1 FROM onboarding_progresso p WHERE p.colaborador_id = c.id AND p.concluido = true)
      AND EXISTS (SELECT 1 FROM onboarding_dias_liberados dl WHERE dl.colaborador_id = c.id AND dl.liberado_em < now() - interval '1 day')
    )
  );

-- ── Weekly Summary Views ────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_weekly_financial_summary AS
SELECT
  COUNT(*) FILTER (WHERE stage = 'fechado_ganho' AND updated_at >= now() - INTERVAL '7 days') AS deals_ganhos_semana,
  COALESCE(SUM(value) FILTER (WHERE stage = 'fechado_ganho' AND updated_at >= now() - INTERVAL '7 days'), 0) AS valor_ganho_semana,
  COUNT(*) FILTER (WHERE stage = 'fechado_perdido' AND updated_at >= now() - INTERVAL '7 days') AS deals_perdidos_semana,
  COUNT(*) FILTER (WHERE stage NOT IN ('fechado_ganho', 'fechado_perdido')) AS deals_em_pipeline,
  COALESCE(SUM(value) FILTER (WHERE stage NOT IN ('fechado_ganho', 'fechado_perdido')), 0) AS valor_pipeline,
  COALESCE(SUM(value * probability / 100.0) FILTER (WHERE stage NOT IN ('fechado_ganho', 'fechado_perdido')), 0) AS valor_ponderado_pipeline
FROM crm_deals;

CREATE OR REPLACE VIEW v_weekly_project_summary AS
SELECT
  COUNT(*) FILTER (WHERE status IN ('producao', 'briefing', 'planejamento', 'revisao')) AS projetos_ativos,
  COUNT(*) FILTER (WHERE status = 'finalizado' AND updated_at >= now() - INTERVAL '7 days') AS projetos_finalizados_semana,
  COUNT(*) FILTER (WHERE status = 'entrega') AS projetos_em_entrega,
  COALESCE(SUM(value) FILTER (WHERE status IN ('producao', 'briefing', 'planejamento', 'revisao', 'entrega')), 0) AS valor_projetos_ativos
FROM projects;


-- ============================================================================
-- S6: FINANCIAL SYSTEM (12 tabelas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fin_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, slug TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'transferencia')),
    parent_id UUID REFERENCES fin_categories(id),
    color TEXT, icon TEXT, is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS fin_cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, slug TEXT NOT NULL, description TEXT,
    is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS fin_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, cnpj TEXT, email TEXT, phone TEXT,
    category TEXT, notes TEXT, is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, cnpj TEXT, email TEXT, phone TEXT,
    contact_name TEXT, notes TEXT, is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    number TEXT NOT NULL, series TEXT,
    type TEXT CHECK (type IN ('nfse', 'nfe', 'nfce', 'outros')),
    client_id UUID REFERENCES fin_clients(id),
    vendor_id UUID REFERENCES fin_vendors(id),
    amount NUMERIC(15,2) NOT NULL, tax_amount NUMERIC(15,2) DEFAULT 0,
    issue_date DATE NOT NULL,
    status TEXT DEFAULT 'emitida' CHECK (status IN ('rascunho', 'emitida', 'cancelada', 'substituida')),
    pdf_url TEXT, xml_url TEXT, omie_id TEXT, notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'transferencia')),
    description TEXT NOT NULL, amount NUMERIC(15,2) NOT NULL,
    date DATE NOT NULL, due_date DATE, paid_date DATE,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado', 'parcial')),
    category_id UUID REFERENCES fin_categories(id),
    cost_center_id UUID REFERENCES fin_cost_centers(id),
    vendor_id UUID REFERENCES fin_vendors(id),
    client_id UUID REFERENCES fin_clients(id),
    project_id UUID REFERENCES projects(id),
    invoice_id UUID REFERENCES fin_invoices(id),
    recurrence TEXT CHECK (recurrence IN ('none', 'monthly', 'quarterly', 'semiannual', 'annual')),
    recurrence_end DATE, payment_method TEXT, bank_account TEXT,
    document_number TEXT, notes TEXT, tags TEXT[], omie_id TEXT,
    is_realized BOOLEAN DEFAULT false, created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_receivables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES fin_clients(id),
    project_id UUID REFERENCES projects(id),
    invoice_id UUID REFERENCES fin_invoices(id),
    description TEXT NOT NULL, amount NUMERIC(15,2) NOT NULL,
    amount_paid NUMERIC(15,2) DEFAULT 0, due_date DATE NOT NULL, paid_date DATE,
    status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'parcial', 'pago', 'atrasado', 'cancelado')),
    installment_number INT, installment_total INT, payment_method TEXT,
    notes TEXT, omie_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_payables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES fin_vendors(id),
    project_id UUID REFERENCES projects(id),
    invoice_id UUID REFERENCES fin_invoices(id),
    description TEXT NOT NULL, amount NUMERIC(15,2) NOT NULL,
    amount_paid NUMERIC(15,2) DEFAULT 0, due_date DATE NOT NULL, paid_date DATE,
    status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'parcial', 'pago', 'atrasado', 'cancelado')),
    category_id UUID REFERENCES fin_categories(id),
    cost_center_id UUID REFERENCES fin_cost_centers(id),
    payment_method TEXT, notes TEXT, omie_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('ofx', 'csv')),
    bank_name TEXT, account_number TEXT, period_start DATE, period_end DATE,
    transaction_count INT DEFAULT 0, matched_count INT DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    imported_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_id UUID NOT NULL REFERENCES bank_imports(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL, amount NUMERIC(15,2) NOT NULL,
    description TEXT, memo TEXT, fitid TEXT, type TEXT,
    balance NUMERIC(15,2),
    match_status TEXT DEFAULT 'unmatched' CHECK (match_status IN ('unmatched', 'matched', 'ignored', 'manual')),
    matched_transaction_id UUID REFERENCES fin_transactions(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reconciliation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    match_field TEXT NOT NULL CHECK (match_field IN ('description', 'amount', 'both')),
    pattern TEXT NOT NULL,
    category_id UUID REFERENCES fin_categories(id),
    vendor_id UUID REFERENCES fin_vendors(id),
    client_id UUID REFERENCES fin_clients(id),
    auto_match BOOLEAN DEFAULT false, priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reconciliation_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    bank_transaction_id UUID REFERENCES bank_transactions(id),
    fin_transaction_id UUID REFERENCES fin_transactions(id),
    action TEXT NOT NULL CHECK (action IN ('auto_match', 'manual_match', 'unmatch', 'ignore', 'create')),
    matched_by UUID REFERENCES auth.users(id),
    rule_id UUID REFERENCES reconciliation_rules(id),
    confidence NUMERIC(3,2), notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ============================================================================
-- S7: ACADEMY SYSTEM (8 tabelas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS academy_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL, slug TEXT NOT NULL, description TEXT, thumbnail_url TEXT,
    instructor_id UUID REFERENCES auth.users(id),
    category TEXT CHECK (category IN ('3d', 'branding', 'marketing', 'audiovisual', 'interiores', 'gamificacao', 'gestao', 'ferramentas', 'geral')),
    level TEXT CHECK (level IN ('iniciante', 'intermediario', 'avancado')),
    duration_hours NUMERIC(5,1), is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false, order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS academy_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL, description TEXT, content TEXT, video_url TEXT,
    duration_minutes INT, order_index INT DEFAULT 0, is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academy_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
    course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL, file_url TEXT NOT NULL, file_type TEXT, file_size INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academy_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
    enrolled_at TIMESTAMPTZ DEFAULT now(), completed_at TIMESTAMPTZ,
    UNIQUE(course_id, user_id)
);

CREATE TABLE IF NOT EXISTS academy_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_pct NUMERIC(5,2) DEFAULT 0, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
    UNIQUE(enrollment_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS academy_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
    certificate_number TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ DEFAULT now(), pdf_url TEXT, metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS market_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL, description TEXT,
    status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_andamento', 'publicado', 'arquivado')),
    category TEXT, tags TEXT[], author_id UUID REFERENCES auth.users(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_id UUID REFERENCES market_research(id) ON DELETE CASCADE,
    title TEXT NOT NULL, url TEXT,
    source_type TEXT CHECK (source_type IN ('artigo', 'relatorio', 'dado', 'noticia', 'video', 'outro')),
    notes TEXT, created_at TIMESTAMPTZ DEFAULT now()
);


-- ============================================================================
-- S8: CHAT SYSTEM (9 tabelas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS chat_channel_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, name TEXT NOT NULL, sort_order INT DEFAULT 0,
    is_collapsed BOOLEAN DEFAULT false, created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, name TEXT NOT NULL,
    type TEXT DEFAULT 'channel' CHECK (type IN ('channel','direct','group')),
    description TEXT, created_by UUID REFERENCES auth.users(id),
    section_id UUID REFERENCES chat_channel_sections(id),
    is_archived BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL, reply_to UUID REFERENCES chat_messages(id),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text','image','file','poll','system')),
    metadata JSONB DEFAULT '{}',
    edited_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_channel_members (
    channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role TEXT DEFAULT 'member', last_read_at TIMESTAMPTZ DEFAULT now(),
    joined_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    emoji TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS chat_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL, file_type TEXT NOT NULL, file_size BIGINT DEFAULT 0,
    file_url TEXT NOT NULL, thumbnail_url TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    question TEXT NOT NULL, allows_multiple BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false, closes_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES chat_polls(id) ON DELETE CASCADE,
    text TEXT NOT NULL, sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chat_poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES chat_polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES chat_poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(poll_id, option_id, user_id)
);


-- ============================================================================
-- S9: ENABLE RLS + ALL POLICIES
-- ============================================================================

-- ── Enable RLS em TODAS as tabelas ──────────────────────────────────────────
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborator_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE culture_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_dias ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_dias_liberados ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_poll_votes ENABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────────────────────────────────
-- POLICIES: Multi-tenant Core
-- ────────────────────────────────────────────────────────────────────────────

-- tenants
DROP POLICY IF EXISTS "rls_tenants_select" ON tenants;
CREATE POLICY "rls_tenants_select" ON tenants FOR SELECT TO authenticated
  USING (id IN (SELECT get_user_tenant_ids()));

-- roles (leitura por tenant + escrita admin)
DROP POLICY IF EXISTS "rls_roles_select" ON roles;
CREATE POLICY "rls_roles_select" ON roles FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "roles_write_admin" ON roles;
CREATE POLICY "roles_write_admin" ON roles FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());
DROP POLICY IF EXISTS "roles_update_admin" ON roles;
CREATE POLICY "roles_update_admin" ON roles FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin())
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());
DROP POLICY IF EXISTS "roles_delete_admin" ON roles;
CREATE POLICY "roles_delete_admin" ON roles FOR DELETE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());

-- permissions
DROP POLICY IF EXISTS "perms_read_all" ON permissions;
CREATE POLICY "perms_read_all" ON permissions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "perms_write_admin" ON permissions;
CREATE POLICY "perms_write_admin" ON permissions FOR INSERT TO authenticated WITH CHECK (is_founder_or_admin());
DROP POLICY IF EXISTS "perms_update_admin" ON permissions;
CREATE POLICY "perms_update_admin" ON permissions FOR UPDATE TO authenticated
  USING (is_founder_or_admin()) WITH CHECK (is_founder_or_admin());
DROP POLICY IF EXISTS "perms_delete_admin" ON permissions;
CREATE POLICY "perms_delete_admin" ON permissions FOR DELETE TO authenticated USING (is_founder_or_admin());

-- role_permissions (leitura por tenant + escrita admin)
DROP POLICY IF EXISTS "rls_role_permissions_select" ON role_permissions;
CREATE POLICY "rls_role_permissions_select" ON role_permissions FOR SELECT TO authenticated
  USING (role_id IN (SELECT id FROM roles WHERE tenant_id IN (SELECT get_user_tenant_ids())));
DROP POLICY IF EXISTS "role_perms_write_admin" ON role_permissions;
CREATE POLICY "role_perms_write_admin" ON role_permissions FOR INSERT TO authenticated
  WITH CHECK (role_id IN (SELECT id FROM roles WHERE tenant_id IN (SELECT get_user_tenant_ids())) AND is_founder_or_admin());
DROP POLICY IF EXISTS "role_perms_update_admin" ON role_permissions;
CREATE POLICY "role_perms_update_admin" ON role_permissions FOR UPDATE TO authenticated
  USING (role_id IN (SELECT id FROM roles WHERE tenant_id IN (SELECT get_user_tenant_ids())) AND is_founder_or_admin())
  WITH CHECK (role_id IN (SELECT id FROM roles WHERE tenant_id IN (SELECT get_user_tenant_ids())) AND is_founder_or_admin());
DROP POLICY IF EXISTS "role_perms_delete_admin" ON role_permissions;
CREATE POLICY "role_perms_delete_admin" ON role_permissions FOR DELETE TO authenticated
  USING (role_id IN (SELECT id FROM roles WHERE tenant_id IN (SELECT get_user_tenant_ids())) AND is_founder_or_admin());

-- tenant_members
DROP POLICY IF EXISTS "rls_tenant_members_select" ON tenant_members;
CREATE POLICY "rls_tenant_members_select" ON tenant_members FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_tenant_members_insert" ON tenant_members;
CREATE POLICY "rls_tenant_members_insert" ON tenant_members FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());
DROP POLICY IF EXISTS "rls_tenant_members_update" ON tenant_members;
CREATE POLICY "rls_tenant_members_update" ON tenant_members FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());
DROP POLICY IF EXISTS "rls_tenant_members_delete" ON tenant_members;
CREATE POLICY "rls_tenant_members_delete" ON tenant_members FOR DELETE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());

-- project_memberships
DROP POLICY IF EXISTS "pm_select_tenant" ON project_memberships;
CREATE POLICY "pm_select_tenant" ON project_memberships FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "pm_insert_admin" ON project_memberships;
CREATE POLICY "pm_insert_admin" ON project_memberships FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());
DROP POLICY IF EXISTS "pm_update_admin" ON project_memberships;
CREATE POLICY "pm_update_admin" ON project_memberships FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin())
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());
DROP POLICY IF EXISTS "pm_delete_admin" ON project_memberships;
CREATE POLICY "pm_delete_admin" ON project_memberships FOR DELETE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());


-- ────────────────────────────────────────────────────────────────────────────
-- POLICIES: Tabelas pre-existentes (profiles, projects, tasks, etc.)
-- ────────────────────────────────────────────────────────────────────────────

-- profiles
DROP POLICY IF EXISTS "rls_profiles_select" ON profiles;
CREATE POLICY "rls_profiles_select" ON profiles FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()) OR id = auth.uid());
DROP POLICY IF EXISTS "rls_profiles_update" ON profiles;
CREATE POLICY "rls_profiles_update" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin()));

-- projects
DROP POLICY IF EXISTS "rls_projects_select" ON projects;
CREATE POLICY "rls_projects_select" ON projects FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_projects_insert" ON projects;
CREATE POLICY "rls_projects_insert" ON projects FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_projects_update" ON projects;
CREATE POLICY "rls_projects_update" ON projects FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- tasks
DROP POLICY IF EXISTS "rls_tasks_select" ON tasks;
CREATE POLICY "rls_tasks_select" ON tasks FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_tasks_insert" ON tasks;
CREATE POLICY "rls_tasks_insert" ON tasks FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_tasks_update" ON tasks;
CREATE POLICY "rls_tasks_update" ON tasks FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- crm_deals
DROP POLICY IF EXISTS "rls_crm_deals_select" ON crm_deals;
CREATE POLICY "rls_crm_deals_select" ON crm_deals FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_crm_deals_insert" ON crm_deals;
CREATE POLICY "rls_crm_deals_insert" ON crm_deals FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_crm_deals_update" ON crm_deals;
CREATE POLICY "rls_crm_deals_update" ON crm_deals FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- deliverables
DROP POLICY IF EXISTS "rls_deliverables_select" ON deliverables;
CREATE POLICY "rls_deliverables_select" ON deliverables FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_deliverables_insert" ON deliverables;
CREATE POLICY "rls_deliverables_insert" ON deliverables FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_deliverables_update" ON deliverables;
CREATE POLICY "rls_deliverables_update" ON deliverables FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- proposals
DROP POLICY IF EXISTS "rls_proposals_select" ON proposals;
CREATE POLICY "rls_proposals_select" ON proposals FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_proposals_insert" ON proposals;
CREATE POLICY "rls_proposals_insert" ON proposals FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_proposals_update" ON proposals;
CREATE POLICY "rls_proposals_update" ON proposals FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- notifications
DROP POLICY IF EXISTS "rls_notifications_select" ON notifications;
CREATE POLICY "rls_notifications_select" ON notifications FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()) OR user_id = auth.uid());
DROP POLICY IF EXISTS "rls_notifications_insert" ON notifications;
CREATE POLICY "rls_notifications_insert" ON notifications FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_notifications_update" ON notifications;
CREATE POLICY "rls_notifications_update" ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- document_versions
DROP POLICY IF EXISTS "rls_document_versions_select" ON document_versions;
CREATE POLICY "rls_document_versions_select" ON document_versions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_document_versions_insert" ON document_versions;
CREATE POLICY "rls_document_versions_insert" ON document_versions FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

-- contract_attachments
DROP POLICY IF EXISTS "rls_contract_attachments_select" ON contract_attachments;
CREATE POLICY "rls_contract_attachments_select" ON contract_attachments FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- audit_log (tabela antiga)
DROP POLICY IF EXISTS "rls_audit_log_select" ON audit_log;
CREATE POLICY "rls_audit_log_select" ON audit_log FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- audit_logs (tabela nova)
DROP POLICY IF EXISTS "rls_audit_logs_select_tenant" ON audit_logs;
CREATE POLICY "rls_audit_logs_select_tenant" ON audit_logs FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_audit_logs_insert_authenticated" ON audit_logs;
CREATE POLICY "rls_audit_logs_insert_authenticated" ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

-- decisions, meetings, time_entries, knowledge_items, business_config, financial_data, company_context, monthly_closings
DROP POLICY IF EXISTS "rls_decisions_select" ON decisions;
CREATE POLICY "rls_decisions_select" ON decisions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_meetings_select" ON meetings;
CREATE POLICY "rls_meetings_select" ON meetings FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_time_entries_select" ON time_entries;
CREATE POLICY "rls_time_entries_select" ON time_entries FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_knowledge_items_select" ON knowledge_items;
CREATE POLICY "rls_knowledge_items_select" ON knowledge_items FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_business_config_select" ON business_config;
CREATE POLICY "rls_business_config_select" ON business_config FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_financial_data_select" ON financial_data;
CREATE POLICY "rls_financial_data_select" ON financial_data FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_company_context_select" ON company_context;
CREATE POLICY "rls_company_context_select" ON company_context FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_monthly_closings_select" ON monthly_closings;
CREATE POLICY "rls_monthly_closings_select" ON monthly_closings FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- integration_configs
DROP POLICY IF EXISTS "rls_integration_configs_select" ON integration_configs;
CREATE POLICY "rls_integration_configs_select" ON integration_configs FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_integration_configs_insert" ON integration_configs;
CREATE POLICY "rls_integration_configs_insert" ON integration_configs FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());
DROP POLICY IF EXISTS "rls_integration_configs_update" ON integration_configs;
CREATE POLICY "rls_integration_configs_update" ON integration_configs FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());

-- changelog_entries, dynamic_templates, digest_logs (leitura geral)
DROP POLICY IF EXISTS "rls_changelog_select" ON changelog_entries;
CREATE POLICY "rls_changelog_select" ON changelog_entries FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "rls_dynamic_templates_select" ON dynamic_templates;
CREATE POLICY "rls_dynamic_templates_select" ON dynamic_templates FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "rls_digest_logs_select" ON digest_logs;
CREATE POLICY "rls_digest_logs_select" ON digest_logs FOR SELECT TO authenticated USING (is_founder_or_admin());

-- collaborator_history / culture_pages / sync_logs
DROP POLICY IF EXISTS "rls_collaborator_history_select" ON collaborator_history;
CREATE POLICY "rls_collaborator_history_select" ON collaborator_history FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_culture_pages_select" ON culture_pages;
CREATE POLICY "rls_culture_pages_select" ON culture_pages FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "rls_sync_logs_select" ON sync_logs;
CREATE POLICY "rls_sync_logs_select" ON sync_logs FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));


-- ────────────────────────────────────────────────────────────────────────────
-- POLICIES: Onboarding (multi-tenant via v8)
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS colaboradores_select ON colaboradores;
CREATE POLICY colaboradores_select ON colaboradores FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS colaboradores_insert ON colaboradores;
CREATE POLICY colaboradores_insert ON colaboradores FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());
DROP POLICY IF EXISTS colaboradores_update ON colaboradores;
CREATE POLICY colaboradores_update ON colaboradores FOR UPDATE
  USING (tenant_id IN (SELECT get_user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS colaboradores_delete ON colaboradores;
CREATE POLICY colaboradores_delete ON colaboradores FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());

DROP POLICY IF EXISTS onboarding_dias_select ON onboarding_dias;
CREATE POLICY onboarding_dias_select ON onboarding_dias FOR SELECT USING (true);
DROP POLICY IF EXISTS onboarding_dias_modify ON onboarding_dias;
CREATE POLICY onboarding_dias_modify ON onboarding_dias FOR ALL USING (is_founder_or_admin());

DROP POLICY IF EXISTS onboarding_atividades_select ON onboarding_atividades;
CREATE POLICY onboarding_atividades_select ON onboarding_atividades FOR SELECT USING (true);
DROP POLICY IF EXISTS onboarding_atividades_modify ON onboarding_atividades;
CREATE POLICY onboarding_atividades_modify ON onboarding_atividades FOR ALL USING (is_founder_or_admin());

DROP POLICY IF EXISTS onboarding_progresso_tenant ON onboarding_progresso;
CREATE POLICY onboarding_progresso_tenant ON onboarding_progresso FOR ALL
  USING (colaborador_id IN (SELECT id FROM colaboradores WHERE tenant_id IN (SELECT get_user_tenant_ids())));

DROP POLICY IF EXISTS onboarding_dias_liberados_tenant ON onboarding_dias_liberados;
CREATE POLICY onboarding_dias_liberados_tenant ON onboarding_dias_liberados FOR ALL
  USING (colaborador_id IN (SELECT id FROM colaboradores WHERE tenant_id IN (SELECT get_user_tenant_ids())));

DROP POLICY IF EXISTS onboarding_checkins_tenant ON onboarding_checkins;
CREATE POLICY onboarding_checkins_tenant ON onboarding_checkins FOR ALL
  USING (colaborador_id IN (SELECT id FROM colaboradores WHERE tenant_id IN (SELECT get_user_tenant_ids())));

DROP POLICY IF EXISTS onboarding_notificacoes_tenant ON onboarding_notificacoes;
CREATE POLICY onboarding_notificacoes_tenant ON onboarding_notificacoes FOR ALL
  USING (
    colaborador_id IN (SELECT id FROM colaboradores WHERE tenant_id IN (SELECT get_user_tenant_ids()))
    OR destinatario = auth.uid()::text
  );

-- person_tasks
DROP POLICY IF EXISTS "person_tasks_select" ON person_tasks;
CREATE POLICY "person_tasks_select" ON person_tasks FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "person_tasks_insert" ON person_tasks;
CREATE POLICY "person_tasks_insert" ON person_tasks FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "person_tasks_update" ON person_tasks;
CREATE POLICY "person_tasks_update" ON person_tasks FOR UPDATE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "person_tasks_delete" ON person_tasks;
CREATE POLICY "person_tasks_delete" ON person_tasks FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));


-- ────────────────────────────────────────────────────────────────────────────
-- POLICIES: Financial
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "fin_categories_read" ON fin_categories;
CREATE POLICY "fin_categories_read" ON fin_categories FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "fin_cost_centers_read" ON fin_cost_centers;
CREATE POLICY "fin_cost_centers_read" ON fin_cost_centers FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "fin_vendors_read" ON fin_vendors;
CREATE POLICY "fin_vendors_read" ON fin_vendors FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "fin_clients_read" ON fin_clients;
CREATE POLICY "fin_clients_read" ON fin_clients FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "fin_transactions_read" ON fin_transactions;
CREATE POLICY "fin_transactions_read" ON fin_transactions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "fin_invoices_read" ON fin_invoices;
CREATE POLICY "fin_invoices_read" ON fin_invoices FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "fin_receivables_read" ON fin_receivables;
CREATE POLICY "fin_receivables_read" ON fin_receivables FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "fin_payables_read" ON fin_payables;
CREATE POLICY "fin_payables_read" ON fin_payables FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "bank_imports_read" ON bank_imports;
CREATE POLICY "bank_imports_read" ON bank_imports FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "bank_transactions_read" ON bank_transactions;
CREATE POLICY "bank_transactions_read" ON bank_transactions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "reconciliation_rules_read" ON reconciliation_rules;
CREATE POLICY "reconciliation_rules_read" ON reconciliation_rules FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "reconciliation_audit_read" ON reconciliation_audit;
CREATE POLICY "reconciliation_audit_read" ON reconciliation_audit FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Write policies financeiras
DROP POLICY IF EXISTS "fin_transactions_insert" ON fin_transactions;
CREATE POLICY "fin_transactions_insert" ON fin_transactions FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "fin_transactions_update" ON fin_transactions;
CREATE POLICY "fin_transactions_update" ON fin_transactions FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "fin_receivables_insert" ON fin_receivables;
CREATE POLICY "fin_receivables_insert" ON fin_receivables FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "fin_receivables_update" ON fin_receivables;
CREATE POLICY "fin_receivables_update" ON fin_receivables FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "fin_payables_insert" ON fin_payables;
CREATE POLICY "fin_payables_insert" ON fin_payables FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "fin_payables_update" ON fin_payables;
CREATE POLICY "fin_payables_update" ON fin_payables FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "bank_imports_insert" ON bank_imports;
CREATE POLICY "bank_imports_insert" ON bank_imports FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "bank_transactions_insert" ON bank_transactions;
CREATE POLICY "bank_transactions_insert" ON bank_transactions FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "reconciliation_rules_insert" ON reconciliation_rules;
CREATE POLICY "reconciliation_rules_insert" ON reconciliation_rules FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "reconciliation_rules_update" ON reconciliation_rules;
CREATE POLICY "reconciliation_rules_update" ON reconciliation_rules FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "reconciliation_audit_insert" ON reconciliation_audit;
CREATE POLICY "reconciliation_audit_insert" ON reconciliation_audit FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));


-- ────────────────────────────────────────────────────────────────────────────
-- POLICIES: Academy
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "academy_courses_read" ON academy_courses;
CREATE POLICY "academy_courses_read" ON academy_courses FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "academy_lessons_read" ON academy_lessons;
CREATE POLICY "academy_lessons_read" ON academy_lessons FOR SELECT TO authenticated
  USING (course_id IN (SELECT id FROM academy_courses WHERE tenant_id IN (SELECT get_user_tenant_ids())));
DROP POLICY IF EXISTS "academy_assets_read" ON academy_assets;
CREATE POLICY "academy_assets_read" ON academy_assets FOR SELECT TO authenticated
  USING (course_id IN (SELECT id FROM academy_courses WHERE tenant_id IN (SELECT get_user_tenant_ids())));
DROP POLICY IF EXISTS "academy_enrollments_read" ON academy_enrollments;
CREATE POLICY "academy_enrollments_read" ON academy_enrollments FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "academy_enrollments_insert" ON academy_enrollments;
CREATE POLICY "academy_enrollments_insert" ON academy_enrollments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "academy_progress_read" ON academy_progress;
CREATE POLICY "academy_progress_read" ON academy_progress FOR SELECT TO authenticated
  USING (enrollment_id IN (SELECT id FROM academy_enrollments WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "academy_progress_upsert" ON academy_progress;
CREATE POLICY "academy_progress_upsert" ON academy_progress FOR INSERT TO authenticated
  WITH CHECK (enrollment_id IN (SELECT id FROM academy_enrollments WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "academy_progress_update" ON academy_progress;
CREATE POLICY "academy_progress_update" ON academy_progress FOR UPDATE TO authenticated
  USING (enrollment_id IN (SELECT id FROM academy_enrollments WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "academy_certificates_read" ON academy_certificates;
CREATE POLICY "academy_certificates_read" ON academy_certificates FOR SELECT TO authenticated
  USING (enrollment_id IN (SELECT id FROM academy_enrollments WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "market_research_read" ON market_research;
CREATE POLICY "market_research_read" ON market_research FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "market_research_insert" ON market_research;
CREATE POLICY "market_research_insert" ON market_research FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "market_research_update" ON market_research;
CREATE POLICY "market_research_update" ON market_research FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
DROP POLICY IF EXISTS "market_sources_read" ON market_sources;
CREATE POLICY "market_sources_read" ON market_sources FOR SELECT TO authenticated
  USING (research_id IN (SELECT id FROM market_research WHERE tenant_id IN (SELECT get_user_tenant_ids())));


-- ────────────────────────────────────────────────────────────────────────────
-- POLICIES: Chat
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "ch_select" ON chat_channels;
CREATE POLICY "ch_select" ON chat_channels FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE channel_id = chat_channels.id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "ch_insert" ON chat_channels;
CREATE POLICY "ch_insert" ON chat_channels FOR INSERT WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS "ch_update" ON chat_channels;
CREATE POLICY "ch_update" ON chat_channels FOR UPDATE
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE channel_id = chat_channels.id AND user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "msg_select" ON chat_messages;
CREATE POLICY "msg_select" ON chat_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid()) AND deleted_at IS NULL);
DROP POLICY IF EXISTS "msg_insert" ON chat_messages;
CREATE POLICY "msg_insert" ON chat_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM chat_channel_members WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "msg_update" ON chat_messages;
CREATE POLICY "msg_update" ON chat_messages FOR UPDATE USING (sender_id = auth.uid());
DROP POLICY IF EXISTS "msg_delete" ON chat_messages;
CREATE POLICY "msg_delete" ON chat_messages FOR DELETE USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "mem_select" ON chat_channel_members;
CREATE POLICY "mem_select" ON chat_channel_members FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "mem_insert" ON chat_channel_members;
CREATE POLICY "mem_insert" ON chat_channel_members FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "mem_delete" ON chat_channel_members;
CREATE POLICY "mem_delete" ON chat_channel_members FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "react_select" ON chat_reactions;
CREATE POLICY "react_select" ON chat_reactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "react_insert" ON chat_reactions;
CREATE POLICY "react_insert" ON chat_reactions FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "react_delete" ON chat_reactions;
CREATE POLICY "react_delete" ON chat_reactions FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "sections_select" ON chat_channel_sections;
CREATE POLICY "sections_select" ON chat_channel_sections FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "sections_insert" ON chat_channel_sections;
CREATE POLICY "sections_insert" ON chat_channel_sections FOR INSERT WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS "sections_update" ON chat_channel_sections;
CREATE POLICY "sections_update" ON chat_channel_sections FOR UPDATE USING (created_by = auth.uid());

DROP POLICY IF EXISTS "attach_select" ON chat_attachments;
CREATE POLICY "attach_select" ON chat_attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_messages m JOIN chat_channel_members ccm ON ccm.channel_id = m.channel_id
    WHERE m.id = chat_attachments.message_id AND ccm.user_id = auth.uid()));
DROP POLICY IF EXISTS "attach_insert" ON chat_attachments;
CREATE POLICY "attach_insert" ON chat_attachments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "polls_select" ON chat_polls;
CREATE POLICY "polls_select" ON chat_polls FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "polls_insert" ON chat_polls;
CREATE POLICY "polls_insert" ON chat_polls FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "poll_options_select" ON chat_poll_options;
CREATE POLICY "poll_options_select" ON chat_poll_options FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "poll_options_insert" ON chat_poll_options;
CREATE POLICY "poll_options_insert" ON chat_poll_options FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "poll_votes_select" ON chat_poll_votes;
CREATE POLICY "poll_votes_select" ON chat_poll_votes FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "poll_votes_insert" ON chat_poll_votes;
CREATE POLICY "poll_votes_insert" ON chat_poll_votes FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "poll_votes_delete" ON chat_poll_votes;
CREATE POLICY "poll_votes_delete" ON chat_poll_votes FOR DELETE USING (user_id = auth.uid());


-- ============================================================================
-- S10: AUTOMATION FUNCTIONS + TRIGGERS
-- ============================================================================

-- ── fn_deal_stage_automation() ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_deal_stage_automation()
RETURNS TRIGGER AS $$
DECLARE
  _project_id UUID; _proposal_id UUID;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.stage IS DISTINCT FROM NEW.stage THEN
    IF NEW.stage = 'fechado_ganho' THEN
      INSERT INTO projects (name, client, status, value, created_by, tenant_id)
      VALUES (NEW.title, NEW.company, 'briefing', NEW.value, NEW.owner_id, NEW.tenant_id)
      RETURNING id INTO _project_id;
      IF _project_id IS NOT NULL THEN
        NEW.project_id := _project_id;
      END IF;
      INSERT INTO proposals (title, client_name, value, status, created_by, tenant_id)
      VALUES (NEW.title || ' - Proposta', NEW.company, NEW.value, 'rascunho', NEW.owner_id, NEW.tenant_id)
      RETURNING id INTO _proposal_id;
    END IF;
    INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, tenant_id)
    VALUES (auth.uid(), 'deal_stage_change', 'crm_deal', NEW.id,
      json_build_object('from', OLD.stage, 'to', NEW.stage, 'deal_title', NEW.title), NEW.tenant_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_deal_stage_automation ON crm_deals;
CREATE TRIGGER trg_deal_stage_automation
  BEFORE UPDATE ON crm_deals FOR EACH ROW EXECUTE FUNCTION fn_deal_stage_automation();

-- ── fn_audit_trigger() ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_action TEXT; v_entity_id UUID; v_entity_type TEXT;
    v_tenant_id UUID; v_user_id UUID; v_metadata JSONB;
    v_old_data JSONB; v_new_data JSONB;
BEGIN
    CASE TG_OP
        WHEN 'INSERT' THEN v_action := 'create';
        WHEN 'UPDATE' THEN v_action := 'update';
        WHEN 'DELETE' THEN v_action := 'delete';
        ELSE v_action := lower(TG_OP);
    END CASE;
    v_entity_type := TG_TABLE_NAME;
    v_user_id := auth.uid();
    IF TG_OP = 'DELETE' THEN
        v_entity_id := OLD.id;
        IF TG_TABLE_NAME = 'profiles' THEN v_tenant_id := OLD.tenant_id;
        ELSE BEGIN EXECUTE format('SELECT ($1).%I', 'tenant_id') INTO v_tenant_id USING OLD;
        EXCEPTION WHEN OTHERS THEN v_tenant_id := NULL; END; END IF;
        v_old_data := to_jsonb(OLD);
        v_metadata := jsonb_build_object('old_data', v_old_data);
    ELSIF TG_OP = 'UPDATE' THEN
        v_entity_id := NEW.id;
        IF TG_TABLE_NAME = 'profiles' THEN v_tenant_id := NEW.tenant_id;
        ELSE BEGIN EXECUTE format('SELECT ($1).%I', 'tenant_id') INTO v_tenant_id USING NEW;
        EXCEPTION WHEN OTHERS THEN v_tenant_id := NULL; END; END IF;
        v_old_data := to_jsonb(OLD); v_new_data := to_jsonb(NEW);
        v_metadata := jsonb_build_object('changed_fields', (
            SELECT COALESCE(jsonb_object_agg(key, jsonb_build_object('old', v_old_data->key, 'new', value)), '{}'::jsonb)
            FROM jsonb_each(v_new_data)
            WHERE v_old_data->key IS DISTINCT FROM v_new_data->key
              AND key NOT IN ('updated_at', 'created_at')
        ));
    ELSE
        v_entity_id := NEW.id;
        IF TG_TABLE_NAME = 'profiles' THEN v_tenant_id := NEW.tenant_id;
        ELSE BEGIN EXECUTE format('SELECT ($1).%I', 'tenant_id') INTO v_tenant_id USING NEW;
        EXCEPTION WHEN OTHERS THEN v_tenant_id := NULL; END; END IF;
        v_metadata := jsonb_build_object('new_data', to_jsonb(NEW));
    END IF;
    IF v_tenant_id IS NULL AND v_user_id IS NOT NULL THEN
        SELECT tm.tenant_id INTO v_tenant_id FROM tenant_members tm
        WHERE tm.user_id = v_user_id AND tm.is_active = true LIMIT 1;
    END IF;
    INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, metadata)
    VALUES (v_tenant_id, v_user_id, v_action, v_entity_type, v_entity_id, v_metadata);
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

-- ── Audit Triggers ──────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_audit_profiles ON profiles;
CREATE TRIGGER trg_audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
DROP TRIGGER IF EXISTS trg_audit_projects ON projects;
CREATE TRIGGER trg_audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
DROP TRIGGER IF EXISTS trg_audit_tasks ON tasks;
CREATE TRIGGER trg_audit_tasks AFTER INSERT OR UPDATE OR DELETE ON tasks FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
DROP TRIGGER IF EXISTS trg_audit_crm_deals ON crm_deals;
CREATE TRIGGER trg_audit_crm_deals AFTER INSERT OR UPDATE OR DELETE ON crm_deals FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
DROP TRIGGER IF EXISTS trg_audit_roles ON roles;
CREATE TRIGGER trg_audit_roles AFTER INSERT OR UPDATE OR DELETE ON roles FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
DROP TRIGGER IF EXISTS trg_audit_role_permissions ON role_permissions;
CREATE TRIGGER trg_audit_role_permissions AFTER INSERT OR UPDATE OR DELETE ON role_permissions FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
DROP TRIGGER IF EXISTS trg_audit_project_memberships ON project_memberships;
CREATE TRIGGER trg_audit_project_memberships AFTER INSERT OR UPDATE OR DELETE ON project_memberships FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- ── Updated_at Triggers ─────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_roles') THEN
        CREATE TRIGGER set_updated_at_roles BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_fin_categories') THEN
        CREATE TRIGGER set_updated_at_fin_categories BEFORE UPDATE ON fin_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_fin_vendors') THEN
        CREATE TRIGGER set_updated_at_fin_vendors BEFORE UPDATE ON fin_vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_fin_clients') THEN
        CREATE TRIGGER set_updated_at_fin_clients BEFORE UPDATE ON fin_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_fin_transactions') THEN
        CREATE TRIGGER set_updated_at_fin_transactions BEFORE UPDATE ON fin_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_fin_invoices') THEN
        CREATE TRIGGER set_updated_at_fin_invoices BEFORE UPDATE ON fin_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_fin_receivables') THEN
        CREATE TRIGGER set_updated_at_fin_receivables BEFORE UPDATE ON fin_receivables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_fin_payables') THEN
        CREATE TRIGGER set_updated_at_fin_payables BEFORE UPDATE ON fin_payables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_academy_courses') THEN
        CREATE TRIGGER set_updated_at_academy_courses BEFORE UPDATE ON academy_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_academy_lessons') THEN
        CREATE TRIGGER set_updated_at_academy_lessons BEFORE UPDATE ON academy_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_market_research') THEN
        CREATE TRIGGER set_updated_at_market_research BEFORE UPDATE ON market_research FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- person_tasks updated_at trigger
DROP TRIGGER IF EXISTS trigger_person_tasks_updated_at ON person_tasks;
CREATE TRIGGER trigger_person_tasks_updated_at BEFORE UPDATE ON person_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- S11: INDEXES
-- ============================================================================

-- Multi-tenant core
CREATE INDEX IF NOT EXISTS idx_tenant_members_user ON tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant ON tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_roles_tenant ON roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_roles_tenant_sort ON roles(tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_module_action ON permissions(module, action);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_granted ON role_permissions(role_id, granted);
CREATE INDEX IF NOT EXISTS idx_project_memberships_project ON project_memberships(project_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_user ON project_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_tenant ON project_memberships(tenant_id);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON profiles(tenant_id);

-- Core tables
CREATE INDEX IF NOT EXISTS idx_integration_configs_tenant ON integration_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_tenant ON sync_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_culture_pages_tenant ON culture_pages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_history_tenant ON collaborator_history(tenant_id);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Document versions
CREATE INDEX IF NOT EXISTS idx_document_versions_doc ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_current ON document_versions(document_id, is_current);

-- Onboarding
CREATE INDEX IF NOT EXISTS idx_colaboradores_auth ON colaboradores(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_email ON colaboradores(email);
CREATE INDEX IF NOT EXISTS idx_colaboradores_status ON colaboradores(status);
CREATE INDEX IF NOT EXISTS idx_colaboradores_tenant ON colaboradores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_convites_token ON convites(token);
CREATE INDEX IF NOT EXISTS idx_progresso_colaborador ON onboarding_progresso(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_dias_liberados_colaborador ON onboarding_dias_liberados(colaborador_id);

-- Person tasks
CREATE INDEX IF NOT EXISTS idx_person_tasks_tenant ON person_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_person_tasks_person ON person_tasks(person_id);
CREATE INDEX IF NOT EXISTS idx_person_tasks_status ON person_tasks(status);

-- Financial
CREATE INDEX IF NOT EXISTS idx_fin_transactions_tenant ON fin_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fin_transactions_date ON fin_transactions(date);
CREATE INDEX IF NOT EXISTS idx_fin_transactions_status ON fin_transactions(status);
CREATE INDEX IF NOT EXISTS idx_fin_transactions_type ON fin_transactions(type);
CREATE INDEX IF NOT EXISTS idx_fin_receivables_tenant ON fin_receivables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fin_receivables_due ON fin_receivables(due_date);
CREATE INDEX IF NOT EXISTS idx_fin_receivables_status ON fin_receivables(status);
CREATE INDEX IF NOT EXISTS idx_fin_payables_tenant ON fin_payables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fin_payables_due ON fin_payables(due_date);
CREATE INDEX IF NOT EXISTS idx_fin_payables_status ON fin_payables(status);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_import ON bank_transactions(import_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON bank_transactions(date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_match ON bank_transactions(match_status);

-- Academy
CREATE INDEX IF NOT EXISTS idx_academy_courses_tenant ON academy_courses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_course ON academy_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_academy_enrollments_user ON academy_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_enrollments_course ON academy_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_academy_progress_enrollment ON academy_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_market_research_tenant ON market_research(tenant_id);

-- Chat
CREATE INDEX IF NOT EXISTS idx_chat_channels_tenant ON chat_channels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_sections_tenant ON chat_channel_sections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_message ON chat_attachments(message_id);


-- ============================================================================
-- S12: GRANTS
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_user_tenant_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role_in_tenant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_founder_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_session_context(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_module_access(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_permission(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_roles_with_permissions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role_in_tenant(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_audit_event(TEXT, TEXT, UUID, JSONB) TO authenticated;


-- ============================================================================
-- S13: REALTIME CONFIGURATION
-- ============================================================================

-- NOTA: Executar apenas se as tabelas ainda nao estiverem na publication.
-- O Supabase pode dar erro se ja estiverem adicionadas.
-- ALTER PUBLICATION supabase_realtime ADD TABLE crm_deals;
-- ALTER PUBLICATION supabase_realtime ADD TABLE projects;
-- ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
-- ALTER PUBLICATION supabase_realtime ADD TABLE deliverables;
-- ALTER PUBLICATION supabase_realtime ADD TABLE proposals;
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_channel_members;
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_reactions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_poll_votes;


-- ============================================================================
-- S14: SEED DATA
-- ============================================================================

-- ── Tenants ─────────────────────────────────────────────────────────────────
INSERT INTO tenants (name, slug, is_active) VALUES
    ('TBO', 'tbo', true),
    ('TBO Academy', 'tbo-academy', true)
ON CONFLICT (slug) DO NOTHING;

-- ── 18 System Roles ─────────────────────────────────────────────────────────
DO $$
DECLARE v_tid UUID;
BEGIN
    SELECT id INTO v_tid FROM tenants WHERE slug = 'tbo';
    IF v_tid IS NULL THEN RETURN; END IF;
    INSERT INTO roles (tenant_id, name, slug, label, color, is_system, is_default, sort_order, description) VALUES
        (v_tid, 'Owner',              'owner',        'Proprietario',       '#E85102', true,  false, 1,  'Proprietario com acesso total irrestrito'),
        (v_tid, 'Admin',              'admin',        'Administrador',      '#dc2626', true,  false, 2,  'Administrador do sistema com acesso completo'),
        (v_tid, 'Head / Diretor',     'diretor',      'Diretor',            '#7c3aed', true,  false, 3,  'Diretor de area / Head de departamento'),
        (v_tid, 'Project Owner',      'po',           'Project Owner',      '#8b5cf6', true,  false, 4,  'Responsavel por projetos e entregas'),
        (v_tid, 'Project Manager',    'pm',           'Project Manager',    '#6366f1', true,  false, 5,  'Gestor operacional de projetos'),
        (v_tid, 'Creative Director',  'creative-dir', 'Diretor Criativo',   '#ec4899', true,  false, 6,  'Diretor criativo e lider de arte'),
        (v_tid, '3D Lead',            '3d-lead',      'Lead 3D',            '#0ea5e9', true,  false, 7,  'Lider do time de 3D'),
        (v_tid, '3D Artist',          '3d-artist',    'Artista 3D',         '#3a7bd5', true,  false, 8,  'Artista 3D / Modelador / Texturizador'),
        (v_tid, 'Design / Branding',  'design',       'Design',             '#f97316', true,  false, 9,  'Designer grafico / Branding'),
        (v_tid, 'Motion / AV',        'motion',       'Motion / AV',        '#14b8a6', true,  false, 10, 'Motion designer / Audiovisual'),
        (v_tid, 'Copy / Conteudo',    'copy',         'Copywriter',         '#a855f7', true,  false, 11, 'Copywriter e produtor de conteudo'),
        (v_tid, 'QA / Revisao',       'qa',           'QA / Revisao',       '#eab308', true,  false, 12, 'Quality assurance e revisao'),
        (v_tid, 'Sales / Comercial',  'comercial',    'Comercial',          '#f59e0b', true,  false, 13, 'Vendas e relacionamento comercial'),
        (v_tid, 'CS / Atendimento',   'cs',           'Atendimento',        '#06b6d4', true,  false, 14, 'Customer success e atendimento'),
        (v_tid, 'Finance',            'financeiro',   'Financeiro',         '#2ecc71', true,  false, 15, 'Financeiro e controle de custos'),
        (v_tid, 'Legal / Contracts',  'legal',        'Legal / Contratos',  '#64748b', true,  false, 16, 'Juridico e gestao de contratos'),
        (v_tid, 'Viewer',             'viewer',       'Visualizador',       '#94a3b8', true,  true,  17, 'Acesso somente leitura a modulos permitidos'),
        (v_tid, 'Guest',              'guest',        'Convidado',          '#cbd5e1', true,  false, 18, 'Acesso restrito temporario a projetos especificos')
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name, label = EXCLUDED.label, color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order, description = EXCLUDED.description,
        is_system = EXCLUDED.is_system, updated_at = now();
END$$;

-- ── 55 Permissions ──────────────────────────────────────────────────────────
INSERT INTO permissions (module, action, label, description, sort_order) VALUES
    ('users','view','Visualizar usuarios','Ver lista de membros da equipe',100),
    ('users','create','Convidar usuarios','Criar e convidar novos membros',101),
    ('users','edit','Editar usuarios','Alterar dados, role e status de membros',102),
    ('users','delete','Remover usuarios','Desativar ou remover membros do workspace',103),
    ('users','export','Exportar usuarios','Exportar lista de membros em CSV/Excel',104),
    ('roles','view','Visualizar roles','Ver lista de roles e permissoes',110),
    ('roles','create','Criar roles','Criar novos roles customizados',111),
    ('roles','edit','Editar roles','Alterar permissoes e configuracoes de roles',112),
    ('roles','delete','Excluir roles','Remover roles customizados (nao-sistema)',113),
    ('security','view_audit','Ver auditoria','Visualizar logs de auditoria do sistema',120),
    ('security','manage_settings','Gerenciar configuracoes','Alterar configuracoes do sistema e integracoes',121),
    ('projects','view','Visualizar projetos','Ver lista e detalhes de projetos',200),
    ('projects','create','Criar projetos','Criar novos projetos',201),
    ('projects','edit','Editar projetos','Alterar dados e configuracoes de projetos',202),
    ('projects','delete','Excluir projetos','Remover projetos permanentemente',203),
    ('projects','export','Exportar projetos','Exportar dados de projetos',204),
    ('tasks','view','Visualizar tarefas','Ver tarefas e subtarefas',210),
    ('tasks','create','Criar tarefas','Criar novas tarefas em projetos',211),
    ('tasks','edit','Editar tarefas','Alterar dados, status e atribuicao de tarefas',212),
    ('tasks','delete','Excluir tarefas','Remover tarefas permanentemente',213),
    ('tasks','export','Exportar tarefas','Exportar lista de tarefas',214),
    ('comments','view','Visualizar comentarios','Ver comentarios em tarefas e projetos',220),
    ('comments','create','Criar comentarios','Adicionar comentarios',221),
    ('comments','delete','Excluir comentarios','Remover comentarios proprios ou de outros',222),
    ('files','view','Visualizar arquivos','Ver e baixar arquivos do projeto',230),
    ('files','upload','Upload de arquivos','Enviar novos arquivos',231),
    ('files','edit','Editar arquivos','Renomear e mover arquivos',232),
    ('files','delete','Excluir arquivos','Remover arquivos do projeto',233),
    ('crm','view','Visualizar CRM','Ver pipeline, deals e contatos',300),
    ('crm','create','Criar deals/contatos','Adicionar novos deals e contatos ao CRM',301),
    ('crm','edit','Editar CRM','Alterar dados de deals e contatos',302),
    ('crm','delete','Excluir do CRM','Remover deals e contatos',303),
    ('crm','export','Exportar CRM','Exportar dados do CRM',304),
    ('vendors','view','Visualizar fornecedores','Ver lista de fornecedores e parceiros',310),
    ('vendors','create','Criar fornecedores','Adicionar novos fornecedores',311),
    ('vendors','edit','Editar fornecedores','Alterar dados de fornecedores',312),
    ('vendors','delete','Excluir fornecedores','Remover fornecedores',313),
    ('contracts','view','Visualizar contratos','Ver contratos e documentos legais',320),
    ('contracts','create','Criar contratos','Criar novos contratos',321),
    ('contracts','edit','Editar contratos','Alterar termos e dados de contratos',322),
    ('contracts','delete','Excluir contratos','Remover contratos',323),
    ('contracts','export','Exportar contratos','Exportar contratos em PDF/Excel',324),
    ('finance','view','Visualizar financeiro','Ver dados financeiros, receitas e despesas',400),
    ('finance','create','Criar lancamentos','Adicionar receitas, despesas e fechamentos',401),
    ('finance','edit','Editar financeiro','Alterar lancamentos e dados financeiros',402),
    ('finance','delete','Excluir financeiro','Remover lancamentos financeiros',403),
    ('finance','export','Exportar financeiro','Exportar relatorios financeiros',404),
    ('insights','view','Visualizar insights','Ver dashboards de inteligencia e mercado',500),
    ('insights','export','Exportar insights','Exportar relatorios de inteligencia',501),
    ('automations','view','Visualizar automacoes','Ver fluxos e regras de automacao',510),
    ('automations','create','Criar automacoes','Criar novos fluxos de automacao',511),
    ('automations','manage','Gerenciar automacoes','Ativar, desativar e configurar automacoes',512),
    ('messages','view','Visualizar mensagens','Ver mensagens e canais de chat',600),
    ('messages','send','Enviar mensagens','Enviar mensagens nos canais',601),
    ('messages','delete','Excluir mensagens','Remover mensagens de canais',602)
ON CONFLICT (module, action) DO UPDATE SET
    label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- ── Role-Permission Associations ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION _temp_seed_role_perms(p_role_slug TEXT, p_perms TEXT[])
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_role_id UUID; v_tid UUID; v_perm TEXT;
    v_module TEXT; v_action TEXT; v_perm_id UUID;
BEGIN
    SELECT id INTO v_tid FROM tenants WHERE slug = 'tbo';
    IF v_tid IS NULL THEN RETURN; END IF;
    SELECT id INTO v_role_id FROM roles WHERE slug = p_role_slug AND tenant_id = v_tid;
    IF v_role_id IS NULL THEN RETURN; END IF;
    FOREACH v_perm IN ARRAY p_perms LOOP
        v_module := split_part(v_perm, '.', 1);
        v_action := split_part(v_perm, '.', 2);
        SELECT id INTO v_perm_id FROM permissions WHERE module = v_module AND action = v_action;
        IF v_perm_id IS NULL THEN CONTINUE; END IF;
        INSERT INTO role_permissions (role_id, module, permission_id, granted, can_view, can_create, can_edit, can_delete, can_export)
        VALUES (v_role_id, v_module, v_perm_id, true,
                v_action = 'view' OR v_action = 'view_audit',
                v_action = 'create' OR v_action = 'upload' OR v_action = 'send',
                v_action = 'edit' OR v_action = 'manage' OR v_action = 'manage_settings',
                v_action = 'delete', v_action = 'export')
        ON CONFLICT (role_id, module) DO UPDATE SET
            permission_id = EXCLUDED.permission_id, granted = true,
            can_view = role_permissions.can_view OR EXCLUDED.can_view,
            can_create = role_permissions.can_create OR EXCLUDED.can_create,
            can_edit = role_permissions.can_edit OR EXCLUDED.can_edit,
            can_delete = role_permissions.can_delete OR EXCLUDED.can_delete,
            can_export = role_permissions.can_export OR EXCLUDED.can_export;
    END LOOP;
END;
$$;

DO $$
DECLARE v_all_perms TEXT[];
BEGIN
    SELECT array_agg(module || '.' || action ORDER BY sort_order) INTO v_all_perms FROM permissions;
    PERFORM _temp_seed_role_perms('owner', v_all_perms);
    PERFORM _temp_seed_role_perms('admin', v_all_perms);
    PERFORM _temp_seed_role_perms('diretor', array_remove(array_remove(v_all_perms, 'security.manage_settings'), 'users.delete'));
    PERFORM _temp_seed_role_perms('po', ARRAY['projects.view','projects.create','projects.edit','projects.delete','projects.export','tasks.view','tasks.create','tasks.edit','tasks.delete','tasks.export','comments.view','comments.create','comments.delete','files.view','files.upload','files.edit','files.delete','users.view','contracts.view','contracts.create','contracts.edit','contracts.export','crm.view','insights.view','insights.export','messages.view','messages.send','finance.view','roles.view','security.view_audit']);
    PERFORM _temp_seed_role_perms('pm', ARRAY['projects.view','projects.create','projects.edit','projects.export','tasks.view','tasks.create','tasks.edit','tasks.delete','tasks.export','comments.view','comments.create','comments.delete','files.view','files.upload','files.edit','files.delete','users.view','contracts.view','insights.view','messages.view','messages.send']);
    PERFORM _temp_seed_role_perms('creative-dir', ARRAY['projects.view','projects.edit','tasks.view','tasks.create','tasks.edit','tasks.export','comments.view','comments.create','files.view','files.upload','files.edit','users.view','insights.view','messages.view','messages.send']);
    PERFORM _temp_seed_role_perms('3d-lead', ARRAY['projects.view','projects.edit','tasks.view','tasks.create','tasks.edit','tasks.export','comments.view','comments.create','files.view','files.upload','files.edit','users.view','messages.view','messages.send']);
    PERFORM _temp_seed_role_perms('3d-artist', ARRAY['projects.view','tasks.view','tasks.create','tasks.edit','comments.view','comments.create','files.view','files.upload','messages.view','messages.send']);
    PERFORM _temp_seed_role_perms('design', ARRAY['projects.view','tasks.view','tasks.create','tasks.edit','comments.view','comments.create','files.view','files.upload','files.edit','messages.view','messages.send']);
    PERFORM _temp_seed_role_perms('motion', ARRAY['projects.view','tasks.view','tasks.create','tasks.edit','comments.view','comments.create','files.view','files.upload','files.edit','messages.view','messages.send']);
    PERFORM _temp_seed_role_perms('copy', ARRAY['projects.view','tasks.view','tasks.create','tasks.edit','comments.view','comments.create','files.view','files.upload','insights.view','messages.view','messages.send']);
    PERFORM _temp_seed_role_perms('qa', ARRAY['projects.view','tasks.view','tasks.edit','comments.view','comments.create','files.view','files.upload','messages.view','messages.send']);
    PERFORM _temp_seed_role_perms('comercial', ARRAY['crm.view','crm.create','crm.edit','crm.delete','crm.export','contracts.view','contracts.create','contracts.edit','contracts.export','vendors.view','vendors.create','vendors.edit','projects.view','tasks.view','comments.view','comments.create','files.view','files.upload','insights.view','insights.export','messages.view','messages.send','users.view']);
    PERFORM _temp_seed_role_perms('cs', ARRAY['crm.view','crm.edit','contracts.view','projects.view','tasks.view','comments.view','comments.create','files.view','messages.view','messages.send','users.view']);
    PERFORM _temp_seed_role_perms('financeiro', ARRAY['finance.view','finance.create','finance.edit','finance.delete','finance.export','contracts.view','contracts.create','contracts.edit','contracts.export','vendors.view','vendors.create','vendors.edit','vendors.delete','projects.view','tasks.view','insights.view','insights.export','users.view','messages.view','messages.send']);
    PERFORM _temp_seed_role_perms('legal', ARRAY['contracts.view','contracts.create','contracts.edit','contracts.delete','contracts.export','vendors.view','vendors.create','vendors.edit','projects.view','files.view','files.upload','users.view','messages.view','messages.send']);
    PERFORM _temp_seed_role_perms('viewer', ARRAY['projects.view','tasks.view','comments.view','files.view','crm.view','vendors.view','contracts.view','finance.view','insights.view','messages.view','users.view','roles.view']);
    PERFORM _temp_seed_role_perms('guest', ARRAY['projects.view','tasks.view','comments.view','files.view','messages.view']);
END$$;

DROP FUNCTION IF EXISTS _temp_seed_role_perms(TEXT, TEXT[]);

-- ── Seed Categorias Financeiras ─────────────────────────────────────────────
INSERT INTO fin_categories (tenant_id, name, slug, type) VALUES
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Receita de Projetos', 'receita-projetos', 'receita'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Receita Recorrente', 'receita-recorrente', 'receita'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Receita Academy', 'receita-academy', 'receita'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Folha de Pagamento', 'folha-pagamento', 'despesa'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Fornecedores', 'fornecedores', 'despesa'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Software & Ferramentas', 'software-ferramentas', 'despesa'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Marketing & Vendas', 'marketing-vendas', 'despesa'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Infraestrutura', 'infraestrutura', 'despesa'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Impostos', 'impostos', 'despesa'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Outros', 'outros', 'despesa')
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- ── Seed Centros de Custo ───────────────────────────────────────────────────
INSERT INTO fin_cost_centers (tenant_id, name, slug) VALUES
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Digital 3D', 'digital-3d'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Branding', 'branding'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Marketing', 'marketing'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Audiovisual', 'audiovisual'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Interiores', 'interiores'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Gamificacao', 'gamificacao'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Academy', 'academy'),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Administrativo', 'administrativo')
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- ── Seed Cursos Academy ─────────────────────────────────────────────────────
INSERT INTO academy_courses (tenant_id, title, slug, description, category, level, duration_hours, is_published, is_featured, order_index) VALUES
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Fundamentos de 3D para Arquitetura', 'fundamentos-3d', 'Aprenda os conceitos basicos de modelagem 3D aplicados a projetos de arquitetura e interiores.', '3d', 'iniciante', 40, true, true, 1),
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Branding Estrategico', 'branding-estrategico', 'Metodologia TBO para criacao de marcas com posicionamento forte.', 'branding', 'intermediario', 24, true, true, 2),
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Marketing Digital para Imobiliario', 'marketing-digital-imob', 'Estrategias de marketing digital aplicadas ao mercado imobiliario e construcao.', 'marketing', 'iniciante', 16, true, false, 3),
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Gestao de Projetos Criativos', 'gestao-projetos', 'Metodologias ageis aplicadas a projetos criativos em agencias.', 'gestao', 'intermediario', 20, true, false, 4),
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Producao Audiovisual', 'producao-audiovisual', 'Do briefing a entrega: producao de videos profissionais para marcas.', 'audiovisual', 'avancado', 32, false, false, 5)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- ── Seed Changelog ──────────────────────────────────────────────────────────
INSERT INTO changelog_entries (version, title, description, author, tag, published_at) VALUES
    ('2.0.0', 'TBO OS v2 — Migracao Supabase', 'Sistema completamente migrado para Supabase com autenticacao nativa e RLS.', 'Marco', 'feature', '2026-02-15'),
    ('2.1.0', 'Schema Financeiro Nativo', '12 tabelas financeiras, categorias, centros de custo, conciliacao bancaria.', 'Marco', 'feature', '2026-02-17'),
    ('2.2.0', 'TBO Academy', 'Sistema de cursos, aulas, progresso e certificados.', 'Marco', 'feature', '2026-02-17'),
    ('2.3.0', 'RLS Multi-tenant', 'Row Level Security em todas as tabelas com isolamento por tenant.', 'Marco', 'security', '2026-02-18'),
    ('2.4.0', 'RBAC Avancado + Auditoria', 'Funcoes check_module_access, log_audit_event, fn_audit_trigger e triggers automaticos.', 'Marco', 'security', '2026-02-19'),
    ('2.5.0', 'RBAC Completo — 18 Roles + 55 Permissoes', 'Sistema RBAC completo com 18 roles, 55 permissoes granulares, RPC functions e admin UI.', 'Marco', 'security', '2026-02-19'),
    ('3.0.0', 'Schema Consolidado', 'Todas as 15 migrations consolidadas em schema-full.sql — source of truth unico e idempotente.', 'Marco', 'improvement', '2026-02-20')
ON CONFLICT DO NOTHING;

-- ── Seed Dynamic Templates ──────────────────────────────────────────────────
INSERT INTO dynamic_templates (type, name, description, content, variables, category, is_default) VALUES
    ('proposta', 'Proposta Padrao TBO', 'Template base para propostas comerciais', '', '["client_name","project_name","value","deadline"]'::jsonb, 'comercial', true),
    ('contrato', 'Contrato de Prestacao de Servicos', 'Modelo base de contrato PJ', '', '["client_name","cnpj","value","scope","deadline"]'::jsonb, 'juridico', true),
    ('email', 'Follow-up Comercial', 'Email de acompanhamento pos-reuniao', '', '["contact_name","meeting_date","next_steps"]'::jsonb, 'comercial', false),
    ('briefing', 'Briefing de Projeto', 'Template para coleta de briefing', '', '["client_name","project_type","deadline","budget"]'::jsonb, 'producao', true)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- FOOTER: VERIFICACAO
-- ============================================================================

-- Executar as queries abaixo para verificar o estado do banco:
--
-- 1. Listar TODAS as tabelas publicas:
-- SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;
--
-- 2. Contar policies por tabela:
-- SELECT tablename, COUNT(*) FROM pg_policies WHERE schemaname='public' GROUP BY tablename ORDER BY tablename;
--
-- 3. Listar funcoes publicas:
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema='public' ORDER BY routine_name;
--
-- 4. Verificar roles:
-- SELECT slug, label, color, sort_order FROM roles WHERE tenant_id = (SELECT id FROM tenants WHERE slug='tbo') ORDER BY sort_order;
--
-- 5. Verificar permissions:
-- SELECT module, action, label FROM permissions ORDER BY sort_order;

-- ============================================================================
-- FIM DO SCHEMA CONSOLIDADO v3.0.0
-- ============================================================================
