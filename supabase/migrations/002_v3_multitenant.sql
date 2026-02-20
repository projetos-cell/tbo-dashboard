-- ============================================
-- TBO OS v2 — Migration v3: Multi-tenant + RBAC
-- Executar no Supabase SQL Editor
-- ============================================

-- 1. TENANTS (empresas/workspaces)
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

-- 2. ROLES (cargos por tenant)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

-- 3. ROLE PERMISSIONS (permissoes por modulo e acao)
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module TEXT NOT NULL,
    can_view BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_export BOOLEAN DEFAULT false,
    UNIQUE(role_id, module)
);

-- 4. TENANT MEMBERS (usuario <-> tenant com role)
CREATE TABLE IF NOT EXISTS tenant_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);

-- 5. CHANGELOG ENTRIES
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

-- 6. ADICIONAR tenant_id EM TABELAS EXISTENTES
-- (usar IF NOT EXISTS para idempotencia)
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
    -- audit_log
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='tenant_id') THEN
        ALTER TABLE audit_log ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    -- colaboradores
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='colaboradores' AND column_name='tenant_id') THEN
        ALTER TABLE colaboradores ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
END$$;

-- 7. COLLABORATOR HISTORY (audit de alteracoes na ficha PJ)
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

-- 8. INTEGRATION CONFIGS (para RD Station, Omie, Fireflies, Google Calendar)
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

-- 9. SYNC LOGS
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

-- 10. CULTURE PAGES (manual de cultura digital)
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

-- ============================================
-- SEED DATA
-- ============================================

-- Seed tenants
INSERT INTO tenants (name, slug) VALUES ('TBO', 'tbo')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tenants (name, slug) VALUES ('TBO Academy', 'tbo-academy')
ON CONFLICT (slug) DO NOTHING;

-- Seed roles para TBO
INSERT INTO roles (tenant_id, name, slug, is_system) VALUES
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Admin', 'admin', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Socio', 'socio', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Diretor', 'diretor', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Project Owner', 'po', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Artista', 'artista', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Comercial', 'comercial', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Financeiro', 'financeiro', true)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Seed roles para TBO Academy
INSERT INTO roles (tenant_id, name, slug, is_system) VALUES
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Admin Academy', 'admin_academy', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Instrutor', 'instrutor', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Aluno', 'aluno', true)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Seed role_permissions para Admin TBO (acesso total)
DO $$
DECLARE
    admin_role_id UUID;
    modules TEXT[] := ARRAY[
        'command-center', 'projetos', 'tarefas', 'entregas', 'revisoes',
        'timeline', 'timesheets', 'carga-trabalho', 'capacidade',
        'comercial', 'pipeline', 'clientes', 'inteligencia', 'mercado', 'conteudo',
        'financeiro', 'receber', 'pagar', 'margens', 'conciliacao', 'contratos',
        'rh', 'pessoas-avancado', 'cultura', 'reunioes', 'decisoes', 'biblioteca',
        'alerts', 'changelog', 'configuracoes', 'integracoes', 'admin-portal',
        'permissoes-config', 'portal-cliente', 'trilha-aprendizagem', 'admin-onboarding',
        'templates'
    ];
    m TEXT;
BEGIN
    SELECT id INTO admin_role_id FROM roles WHERE slug = 'admin' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'tbo');
    IF admin_role_id IS NOT NULL THEN
        FOREACH m IN ARRAY modules
        LOOP
            INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_export)
            VALUES (admin_role_id, m, true, true, true, true, true)
            ON CONFLICT (role_id, module) DO NOTHING;
        END LOOP;
    END IF;
END$$;

-- Seed role_permissions para Socio TBO (acesso total, igual admin)
DO $$
DECLARE
    socio_role_id UUID;
    modules TEXT[] := ARRAY[
        'command-center', 'projetos', 'tarefas', 'entregas', 'revisoes',
        'timeline', 'timesheets', 'carga-trabalho', 'capacidade',
        'comercial', 'pipeline', 'clientes', 'inteligencia', 'mercado', 'conteudo',
        'financeiro', 'receber', 'pagar', 'margens', 'conciliacao', 'contratos',
        'rh', 'pessoas-avancado', 'cultura', 'reunioes', 'decisoes', 'biblioteca',
        'alerts', 'changelog', 'configuracoes', 'integracoes', 'admin-portal',
        'permissoes-config', 'portal-cliente', 'trilha-aprendizagem', 'admin-onboarding',
        'templates'
    ];
    m TEXT;
BEGIN
    SELECT id INTO socio_role_id FROM roles WHERE slug = 'socio' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'tbo');
    IF socio_role_id IS NOT NULL THEN
        FOREACH m IN ARRAY modules
        LOOP
            INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_export)
            VALUES (socio_role_id, m, true, true, true, true, true)
            ON CONFLICT (role_id, module) DO NOTHING;
        END LOOP;
    END IF;
END$$;

-- Seed role_permissions para Artista
DO $$
DECLARE
    artista_role_id UUID;
    modules TEXT[] := ARRAY[
        'command-center', 'projetos', 'tarefas', 'entregas', 'revisoes',
        'timesheets', 'cultura', 'biblioteca', 'reunioes', 'alerts', 'changelog'
    ];
    m TEXT;
BEGIN
    SELECT id INTO artista_role_id FROM roles WHERE slug = 'artista' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'tbo');
    IF artista_role_id IS NOT NULL THEN
        FOREACH m IN ARRAY modules
        LOOP
            INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_export)
            VALUES (artista_role_id, m, true, true, true, false, false)
            ON CONFLICT (role_id, module) DO NOTHING;
        END LOOP;
    END IF;
END$$;

-- Seed role_permissions para PO
DO $$
DECLARE
    po_role_id UUID;
    modules TEXT[] := ARRAY[
        'command-center', 'projetos', 'tarefas', 'entregas', 'revisoes',
        'timeline', 'timesheets', 'carga-trabalho', 'contratos',
        'pessoas-avancado', 'decisoes', 'reunioes', 'cultura', 'biblioteca',
        'alerts', 'changelog', 'admin-onboarding'
    ];
    m TEXT;
BEGIN
    SELECT id INTO po_role_id FROM roles WHERE slug = 'po' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'tbo');
    IF po_role_id IS NOT NULL THEN
        FOREACH m IN ARRAY modules
        LOOP
            INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_export)
            VALUES (po_role_id, m, true, true, true, false, true)
            ON CONFLICT (role_id, module) DO NOTHING;
        END LOOP;
    END IF;
END$$;

-- Seed role_permissions para Comercial
DO $$
DECLARE
    comercial_role_id UUID;
    modules TEXT[] := ARRAY[
        'command-center', 'comercial', 'pipeline', 'clientes', 'mercado', 'conteudo',
        'contratos', 'portal-cliente', 'reunioes', 'tarefas', 'alerts', 'changelog'
    ];
    m TEXT;
BEGIN
    SELECT id INTO comercial_role_id FROM roles WHERE slug = 'comercial' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'tbo');
    IF comercial_role_id IS NOT NULL THEN
        FOREACH m IN ARRAY modules
        LOOP
            INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_export)
            VALUES (comercial_role_id, m, true, true, true, false, true)
            ON CONFLICT (role_id, module) DO NOTHING;
        END LOOP;
    END IF;
END$$;

-- Seed role_permissions para Financeiro
DO $$
DECLARE
    fin_role_id UUID;
    modules TEXT[] := ARRAY[
        'command-center', 'financeiro', 'receber', 'pagar', 'margens',
        'conciliacao', 'contratos', 'tarefas', 'alerts', 'changelog'
    ];
    m TEXT;
BEGIN
    SELECT id INTO fin_role_id FROM roles WHERE slug = 'financeiro' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'tbo');
    IF fin_role_id IS NOT NULL THEN
        FOREACH m IN ARRAY modules
        LOOP
            INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_export)
            VALUES (fin_role_id, m, true, true, true, false, true)
            ON CONFLICT (role_id, module) DO NOTHING;
        END LOOP;
    END IF;
END$$;

-- Seed changelog retroativo
INSERT INTO changelog_entries (version, title, description, author, tag, published_at) VALUES
('1.0.0', 'Lancamento TBO OS', 'Primeira versao da plataforma com dashboard, projetos, financeiro e RH.', 'Marco', 'feature', '2025-06-01'),
('1.5.0', 'Integracoes live', 'Google Sheets (financeiro), Fireflies (reunioes) e RD Station (CRM) integrados.', 'Marco', 'feature', '2025-09-15'),
('1.8.0', 'Sistema de Onboarding', 'Onboarding completo (10 dias) e reduzido (3 dias) com atividades, progresso e notificacoes.', 'Marco', 'feature', '2026-01-20'),
('1.9.0', 'Melhorias UX', 'Sidebar redesenhada, favoritos, recentes, busca rapida, tour guiado, design system.', 'Marco', 'improvement', '2026-02-17'),
('2.0.0', 'TBO OS v2 — Multi-tenant', 'Arquitetura multi-empresa (TBO + TBO Academy), RBAC por cargo no Supabase, workspace selector, fix auth flash, Magic Link.', 'Marco', 'feature', '2026-02-19')
ON CONFLICT DO NOTHING;

-- RLS basico para tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE culture_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborator_history ENABLE ROW LEVEL SECURITY;

-- Policy: qualquer usuario autenticado pode ler tenants
CREATE POLICY "tenants_read" ON tenants FOR SELECT TO authenticated USING (true);

-- Policy: tenant_members so veem seus proprios tenants
CREATE POLICY "tenant_members_read" ON tenant_members FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "tenant_members_insert" ON tenant_members FOR INSERT TO authenticated WITH CHECK (true);

-- Policy: roles visiveis para membros do tenant
CREATE POLICY "roles_read" ON roles FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- Policy: role_permissions visiveis para membros do tenant
CREATE POLICY "role_perms_read" ON role_permissions FOR SELECT TO authenticated
  USING (role_id IN (SELECT id FROM roles WHERE tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())));

-- Policy: changelog visivel para todos autenticados
CREATE POLICY "changelog_read" ON changelog_entries FOR SELECT TO authenticated USING (true);

-- Policy: integration_configs por tenant
CREATE POLICY "integrations_read" ON integration_configs FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- Policy: sync_logs por tenant
CREATE POLICY "sync_logs_read" ON sync_logs FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- Policy: culture_pages por tenant
CREATE POLICY "culture_pages_read" ON culture_pages FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_tenants') THEN
        CREATE TRIGGER set_updated_at_tenants BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_integration_configs') THEN
        CREATE TRIGGER set_updated_at_integration_configs BEFORE UPDATE ON integration_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_culture_pages') THEN
        CREATE TRIGGER set_updated_at_culture_pages BEFORE UPDATE ON culture_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;
