-- ============================================================================
-- TBO OS v2 — Migration v11: RBAC Completo + Permissions Granulares
-- Executar no Supabase SQL Editor
--
-- PRE-REQUISITO: migration-v7-rbac-audit.sql deve estar executada.
--
-- IMPORTANTE: Esta migration e IDEMPOTENTE — seguro executar multiplas vezes.
--
-- Conteudo:
--   1. Evolucao da tabela roles (label, color, sort_order, etc.)
--   2. Tabela permissions (catalogo de permissoes granulares)
--   3. Evolucao da tabela role_permissions (permission_id, granted)
--   4. Tabela project_memberships (roles por projeto)
--   5. Seed: 18 roles do sistema
--   6. Seed: ~55 permissions granulares
--   7. Seed: Associacoes role↔permission padrao
--   8. RPC: check_permission(), get_user_permissions()
--   9. RLS nas tabelas novas
--  10. Audit triggers
--  11. Mapeamento de perfis existentes
--  12. Indexes
--
-- Versao: 11.0.0
-- Data: 2026-02-19
-- Autor: Marco (founder)
-- ============================================================================


-- ============================================================================
-- SECAO 0: PRE-REQUISITO — v7 deve estar executada
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_audit_trigger') THEN
        RAISE EXCEPTION 'Migration v7 nao executada. Execute migration-v7-rbac-audit.sql primeiro.';
    END IF;
END$$;


-- ============================================================================
-- SECAO 1: EVOLUCAO DA TABELA roles
-- Adicionar colunas faltantes para suportar RBAC completo
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='roles' AND column_name='label') THEN
        ALTER TABLE roles ADD COLUMN label TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='roles' AND column_name='color') THEN
        ALTER TABLE roles ADD COLUMN color TEXT DEFAULT '#94a3b8';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='roles' AND column_name='is_default') THEN
        ALTER TABLE roles ADD COLUMN is_default BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='roles' AND column_name='sort_order') THEN
        ALTER TABLE roles ADD COLUMN sort_order INT DEFAULT 100;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='roles' AND column_name='updated_at') THEN
        ALTER TABLE roles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END$$;

-- Trigger updated_at para roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_roles') THEN
        CREATE TRIGGER set_updated_at_roles BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;


-- ============================================================================
-- SECAO 2: TABELA permissions (catalogo de permissoes)
-- Cada permissao e uma combinacao unica de modulo + acao
-- ============================================================================
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


-- ============================================================================
-- SECAO 3: EVOLUCAO DA TABELA role_permissions
-- Adicionar suporte a permissoes normalizadas (permission_id) mantendo VCEDX
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='role_permissions' AND column_name='permission_id') THEN
        ALTER TABLE role_permissions ADD COLUMN permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='role_permissions' AND column_name='granted') THEN
        ALTER TABLE role_permissions ADD COLUMN granted BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='role_permissions' AND column_name='created_at') THEN
        ALTER TABLE role_permissions ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;
END$$;


-- ============================================================================
-- SECAO 4: TABELA project_memberships (roles por projeto)
-- Override de role global para acesso granular por projeto
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    granted_at TIMESTAMPTZ DEFAULT now(),
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE(project_id, user_id)
);


-- ============================================================================
-- SECAO 5: SEED — 18 Roles do Sistema
-- Upsert: cria se nao existe, atualiza se ja existe
-- ============================================================================
DO $$
DECLARE
    v_tid UUID;
BEGIN
    SELECT id INTO v_tid FROM tenants WHERE slug = 'tbo';
    IF v_tid IS NULL THEN
        RAISE NOTICE 'Tenant TBO nao encontrado, pulando seed de roles';
        RETURN;
    END IF;

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
        name = EXCLUDED.name,
        label = EXCLUDED.label,
        color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order,
        description = EXCLUDED.description,
        is_system = EXCLUDED.is_system,
        updated_at = now();
END$$;


-- ============================================================================
-- SECAO 6: SEED — ~55 Permissions Granulares
-- Formato: module.action (ex: projects.create)
-- ============================================================================
INSERT INTO permissions (module, action, label, description, sort_order) VALUES
    -- Usuarios & Seguranca
    ('users',      'view',            'Visualizar usuarios',          'Ver lista de membros da equipe',                     100),
    ('users',      'create',          'Convidar usuarios',            'Criar e convidar novos membros',                     101),
    ('users',      'edit',            'Editar usuarios',              'Alterar dados, role e status de membros',            102),
    ('users',      'delete',          'Remover usuarios',             'Desativar ou remover membros do workspace',          103),
    ('users',      'export',          'Exportar usuarios',            'Exportar lista de membros em CSV/Excel',             104),

    ('roles',      'view',            'Visualizar roles',             'Ver lista de roles e permissoes',                    110),
    ('roles',      'create',          'Criar roles',                  'Criar novos roles customizados',                     111),
    ('roles',      'edit',            'Editar roles',                 'Alterar permissoes e configuracoes de roles',        112),
    ('roles',      'delete',          'Excluir roles',                'Remover roles customizados (nao-sistema)',           113),

    ('security',   'view_audit',      'Ver auditoria',                'Visualizar logs de auditoria do sistema',            120),
    ('security',   'manage_settings', 'Gerenciar configuracoes',      'Alterar configuracoes do sistema e integracoes',     121),

    -- Projetos & Tarefas
    ('projects',   'view',            'Visualizar projetos',          'Ver lista e detalhes de projetos',                   200),
    ('projects',   'create',          'Criar projetos',               'Criar novos projetos',                               201),
    ('projects',   'edit',            'Editar projetos',              'Alterar dados e configuracoes de projetos',          202),
    ('projects',   'delete',          'Excluir projetos',             'Remover projetos permanentemente',                   203),
    ('projects',   'export',          'Exportar projetos',            'Exportar dados de projetos',                         204),

    ('tasks',      'view',            'Visualizar tarefas',           'Ver tarefas e subtarefas',                           210),
    ('tasks',      'create',          'Criar tarefas',                'Criar novas tarefas em projetos',                    211),
    ('tasks',      'edit',            'Editar tarefas',               'Alterar dados, status e atribuicao de tarefas',     212),
    ('tasks',      'delete',          'Excluir tarefas',              'Remover tarefas permanentemente',                    213),
    ('tasks',      'export',          'Exportar tarefas',             'Exportar lista de tarefas',                          214),

    ('comments',   'view',            'Visualizar comentarios',       'Ver comentarios em tarefas e projetos',              220),
    ('comments',   'create',          'Criar comentarios',            'Adicionar comentarios',                              221),
    ('comments',   'delete',          'Excluir comentarios',          'Remover comentarios proprios ou de outros',          222),

    ('files',      'view',            'Visualizar arquivos',          'Ver e baixar arquivos do projeto',                   230),
    ('files',      'upload',          'Upload de arquivos',           'Enviar novos arquivos',                              231),
    ('files',      'edit',            'Editar arquivos',              'Renomear e mover arquivos',                          232),
    ('files',      'delete',          'Excluir arquivos',             'Remover arquivos do projeto',                        233),

    -- Comercial & CRM
    ('crm',        'view',            'Visualizar CRM',               'Ver pipeline, deals e contatos',                     300),
    ('crm',        'create',          'Criar deals/contatos',         'Adicionar novos deals e contatos ao CRM',           301),
    ('crm',        'edit',            'Editar CRM',                   'Alterar dados de deals e contatos',                  302),
    ('crm',        'delete',          'Excluir do CRM',               'Remover deals e contatos',                           303),
    ('crm',        'export',          'Exportar CRM',                 'Exportar dados do CRM',                              304),

    ('vendors',    'view',            'Visualizar fornecedores',      'Ver lista de fornecedores e parceiros',              310),
    ('vendors',    'create',          'Criar fornecedores',           'Adicionar novos fornecedores',                       311),
    ('vendors',    'edit',            'Editar fornecedores',          'Alterar dados de fornecedores',                      312),
    ('vendors',    'delete',          'Excluir fornecedores',         'Remover fornecedores',                               313),

    ('contracts',  'view',            'Visualizar contratos',         'Ver contratos e documentos legais',                  320),
    ('contracts',  'create',          'Criar contratos',              'Criar novos contratos',                              321),
    ('contracts',  'edit',            'Editar contratos',             'Alterar termos e dados de contratos',                322),
    ('contracts',  'delete',          'Excluir contratos',            'Remover contratos',                                  323),
    ('contracts',  'export',          'Exportar contratos',           'Exportar contratos em PDF/Excel',                    324),

    -- Financeiro
    ('finance',    'view',            'Visualizar financeiro',        'Ver dados financeiros, receitas e despesas',         400),
    ('finance',    'create',          'Criar lancamentos',            'Adicionar receitas, despesas e fechamentos',         401),
    ('finance',    'edit',            'Editar financeiro',            'Alterar lancamentos e dados financeiros',            402),
    ('finance',    'delete',          'Excluir financeiro',           'Remover lancamentos financeiros',                    403),
    ('finance',    'export',          'Exportar financeiro',          'Exportar relatorios financeiros',                    404),

    -- Inteligencia & Conteudo
    ('insights',   'view',            'Visualizar insights',          'Ver dashboards de inteligencia e mercado',           500),
    ('insights',   'export',          'Exportar insights',            'Exportar relatorios de inteligencia',                501),

    ('automations','view',            'Visualizar automacoes',        'Ver fluxos e regras de automacao',                   510),
    ('automations','create',          'Criar automacoes',             'Criar novos fluxos de automacao',                    511),
    ('automations','manage',          'Gerenciar automacoes',         'Ativar, desativar e configurar automacoes',          512),

    -- Comunicacao
    ('messages',   'view',            'Visualizar mensagens',         'Ver mensagens e canais de chat',                     600),
    ('messages',   'send',            'Enviar mensagens',             'Enviar mensagens nos canais',                        601),
    ('messages',   'delete',          'Excluir mensagens',            'Remover mensagens de canais',                        602)

ON CONFLICT (module, action) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;


-- ============================================================================
-- SECAO 7: SEED — Associacoes Role → Permission
-- Helper function + chamadas por role
-- ============================================================================

-- Funcao temporaria para seed de permissoes
CREATE OR REPLACE FUNCTION _temp_seed_role_perms(p_role_slug TEXT, p_perms TEXT[])
RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
    v_role_id UUID;
    v_tid UUID;
    v_perm TEXT;
    v_module TEXT;
    v_action TEXT;
    v_perm_id UUID;
BEGIN
    SELECT id INTO v_tid FROM tenants WHERE slug = 'tbo';
    IF v_tid IS NULL THEN RETURN; END IF;

    SELECT id INTO v_role_id FROM roles WHERE slug = p_role_slug AND tenant_id = v_tid;
    IF v_role_id IS NULL THEN
        RAISE NOTICE 'Role "%" nao encontrado, pulando', p_role_slug;
        RETURN;
    END IF;

    FOREACH v_perm IN ARRAY p_perms
    LOOP
        v_module := split_part(v_perm, '.', 1);
        v_action := split_part(v_perm, '.', 2);

        SELECT id INTO v_perm_id FROM permissions WHERE module = v_module AND action = v_action;
        IF v_perm_id IS NULL THEN
            RAISE NOTICE 'Permissao "%" nao encontrada, pulando', v_perm;
            CONTINUE;
        END IF;

        -- Inserir na role_permissions com permission_id (novo modelo)
        -- Usa module como chave de compatibilidade com VCEDX
        INSERT INTO role_permissions (role_id, module, permission_id, granted, can_view, can_create, can_edit, can_delete, can_export)
        VALUES (v_role_id, v_module, v_perm_id, true,
                v_action = 'view' OR v_action = 'view_audit',
                v_action = 'create' OR v_action = 'upload' OR v_action = 'send',
                v_action = 'edit' OR v_action = 'manage' OR v_action = 'manage_settings',
                v_action = 'delete',
                v_action = 'export')
        ON CONFLICT (role_id, module) DO UPDATE SET
            permission_id = EXCLUDED.permission_id,
            granted = true,
            can_view = role_permissions.can_view OR EXCLUDED.can_view,
            can_create = role_permissions.can_create OR EXCLUDED.can_create,
            can_edit = role_permissions.can_edit OR EXCLUDED.can_edit,
            can_delete = role_permissions.can_delete OR EXCLUDED.can_delete,
            can_export = role_permissions.can_export OR EXCLUDED.can_export;
    END LOOP;
END;
$$;

-- Gerar todas as permissoes como array para roles com acesso total
DO $$
DECLARE
    v_all_perms TEXT[];
BEGIN
    SELECT array_agg(module || '.' || action ORDER BY sort_order) INTO v_all_perms FROM permissions;

    -- Owner: acesso total irrestrito
    PERFORM _temp_seed_role_perms('owner', v_all_perms);
    -- Admin: acesso total
    PERFORM _temp_seed_role_perms('admin', v_all_perms);

    -- Diretor: quase tudo, sem manage_settings e delete em areas criticas
    PERFORM _temp_seed_role_perms('diretor', array_remove(array_remove(v_all_perms, 'security.manage_settings'), 'users.delete'));

    -- Project Owner: projetos completo + visualizacao ampla
    PERFORM _temp_seed_role_perms('po', ARRAY[
        'projects.view','projects.create','projects.edit','projects.delete','projects.export',
        'tasks.view','tasks.create','tasks.edit','tasks.delete','tasks.export',
        'comments.view','comments.create','comments.delete',
        'files.view','files.upload','files.edit','files.delete',
        'users.view',
        'contracts.view','contracts.create','contracts.edit','contracts.export',
        'crm.view',
        'insights.view','insights.export',
        'messages.view','messages.send',
        'finance.view',
        'roles.view','security.view_audit'
    ]);

    -- Project Manager: projetos + tarefas completo, sem delete em projetos
    PERFORM _temp_seed_role_perms('pm', ARRAY[
        'projects.view','projects.create','projects.edit','projects.export',
        'tasks.view','tasks.create','tasks.edit','tasks.delete','tasks.export',
        'comments.view','comments.create','comments.delete',
        'files.view','files.upload','files.edit','files.delete',
        'users.view',
        'contracts.view',
        'insights.view',
        'messages.view','messages.send'
    ]);

    -- Creative Director: projetos + tarefas + comentarios + arquivos
    PERFORM _temp_seed_role_perms('creative-dir', ARRAY[
        'projects.view','projects.edit',
        'tasks.view','tasks.create','tasks.edit','tasks.export',
        'comments.view','comments.create',
        'files.view','files.upload','files.edit',
        'users.view',
        'insights.view',
        'messages.view','messages.send'
    ]);

    -- 3D Lead: similar ao creative-dir
    PERFORM _temp_seed_role_perms('3d-lead', ARRAY[
        'projects.view','projects.edit',
        'tasks.view','tasks.create','tasks.edit','tasks.export',
        'comments.view','comments.create',
        'files.view','files.upload','files.edit',
        'users.view',
        'messages.view','messages.send'
    ]);

    -- 3D Artist: visualizacao + edicao de tarefas proprias
    PERFORM _temp_seed_role_perms('3d-artist', ARRAY[
        'projects.view',
        'tasks.view','tasks.create','tasks.edit',
        'comments.view','comments.create',
        'files.view','files.upload',
        'messages.view','messages.send'
    ]);

    -- Design: similar ao 3d-artist
    PERFORM _temp_seed_role_perms('design', ARRAY[
        'projects.view',
        'tasks.view','tasks.create','tasks.edit',
        'comments.view','comments.create',
        'files.view','files.upload','files.edit',
        'messages.view','messages.send'
    ]);

    -- Motion / AV: similar
    PERFORM _temp_seed_role_perms('motion', ARRAY[
        'projects.view',
        'tasks.view','tasks.create','tasks.edit',
        'comments.view','comments.create',
        'files.view','files.upload','files.edit',
        'messages.view','messages.send'
    ]);

    -- Copy / Conteudo: similar com foco em conteudo
    PERFORM _temp_seed_role_perms('copy', ARRAY[
        'projects.view',
        'tasks.view','tasks.create','tasks.edit',
        'comments.view','comments.create',
        'files.view','files.upload',
        'insights.view',
        'messages.view','messages.send'
    ]);

    -- QA / Revisao: visualizacao + edicao de tarefas + comentarios
    PERFORM _temp_seed_role_perms('qa', ARRAY[
        'projects.view',
        'tasks.view','tasks.edit',
        'comments.view','comments.create',
        'files.view','files.upload',
        'messages.view','messages.send'
    ]);

    -- Comercial: CRM completo + contratos + insights
    PERFORM _temp_seed_role_perms('comercial', ARRAY[
        'crm.view','crm.create','crm.edit','crm.delete','crm.export',
        'contracts.view','contracts.create','contracts.edit','contracts.export',
        'vendors.view','vendors.create','vendors.edit',
        'projects.view',
        'tasks.view',
        'comments.view','comments.create',
        'files.view','files.upload',
        'insights.view','insights.export',
        'messages.view','messages.send',
        'users.view'
    ]);

    -- CS / Atendimento: CRM view + projetos view + mensagens
    PERFORM _temp_seed_role_perms('cs', ARRAY[
        'crm.view','crm.edit',
        'contracts.view',
        'projects.view',
        'tasks.view',
        'comments.view','comments.create',
        'files.view',
        'messages.view','messages.send',
        'users.view'
    ]);

    -- Financeiro: financas completo + contratos + view geral
    PERFORM _temp_seed_role_perms('financeiro', ARRAY[
        'finance.view','finance.create','finance.edit','finance.delete','finance.export',
        'contracts.view','contracts.create','contracts.edit','contracts.export',
        'vendors.view','vendors.create','vendors.edit','vendors.delete',
        'projects.view',
        'tasks.view',
        'insights.view','insights.export',
        'users.view',
        'messages.view','messages.send'
    ]);

    -- Legal / Contratos: contratos completo + vendors + view geral
    PERFORM _temp_seed_role_perms('legal', ARRAY[
        'contracts.view','contracts.create','contracts.edit','contracts.delete','contracts.export',
        'vendors.view','vendors.create','vendors.edit',
        'projects.view',
        'files.view','files.upload',
        'users.view',
        'messages.view','messages.send'
    ]);

    -- Viewer: somente leitura em tudo
    PERFORM _temp_seed_role_perms('viewer', ARRAY[
        'projects.view','tasks.view','comments.view','files.view',
        'crm.view','vendors.view','contracts.view',
        'finance.view','insights.view',
        'messages.view','users.view','roles.view'
    ]);

    -- Guest: acesso minimo — apenas projetos e tarefas
    PERFORM _temp_seed_role_perms('guest', ARRAY[
        'projects.view','tasks.view','comments.view','files.view',
        'messages.view'
    ]);
END$$;

-- Remover funcao temporaria
DROP FUNCTION IF EXISTS _temp_seed_role_perms(TEXT, TEXT[]);


-- ============================================================================
-- SECAO 8: RPC FUNCTIONS — Permissoes granulares
-- ============================================================================

-- Funcao: check_permission(user_id, module, action) — verifica permissao granular
CREATE OR REPLACE FUNCTION check_permission(p_user_id UUID, p_module TEXT, p_action TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
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

GRANT EXECUTE ON FUNCTION check_permission(UUID, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION check_permission(UUID, TEXT, TEXT) IS
    'Verifica se o usuario tem uma permissao granular especifica (module.action). '
    'Consulta tenant_members → role_permissions → permissions. Retorna boolean.';


-- Funcao: get_user_permissions(user_id) — retorna todas as permissoes do usuario
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE(module TEXT, action TEXT, granted BOOLEAN)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
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

GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO authenticated;

COMMENT ON FUNCTION get_user_permissions(UUID) IS
    'Retorna todas as permissoes granulares do usuario como TABLE(module, action, granted). '
    'Junta tenant_members → role_permissions → permissions. Somente permissoes granted=true.';


-- Funcao: get_all_roles_with_permissions(tenant_id) — para admin UI
CREATE OR REPLACE FUNCTION get_all_roles_with_permissions(p_tenant_id UUID)
RETURNS TABLE(
    role_id UUID,
    role_slug TEXT,
    role_name TEXT,
    role_label TEXT,
    role_color TEXT,
    role_sort_order INT,
    is_system BOOLEAN,
    permissions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id AS role_id,
        r.slug AS role_slug,
        r.name AS role_name,
        r.label AS role_label,
        r.color AS role_color,
        r.sort_order AS role_sort_order,
        r.is_system,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'permission_id', p.id,
                        'module', p.module,
                        'action', p.action,
                        'granted', rp.granted
                    )
                    ORDER BY p.sort_order
                )
                FROM role_permissions rp
                JOIN permissions p ON p.id = rp.permission_id
                WHERE rp.role_id = r.id AND rp.granted = true
            ),
            '[]'::jsonb
        ) AS permissions
    FROM roles r
    WHERE r.tenant_id = p_tenant_id
    ORDER BY r.sort_order;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_roles_with_permissions(UUID) TO authenticated;

COMMENT ON FUNCTION get_all_roles_with_permissions(UUID) IS
    'Retorna todos os roles de um tenant com suas permissoes em formato JSON. '
    'Usado pela admin UI para renderizar a matrix de permissoes.';


-- ============================================================================
-- SECAO 9: RLS NAS TABELAS NOVAS
-- ============================================================================

-- permissions: todos autenticados podem ler, apenas admin pode escrever
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "perms_read_all" ON permissions;
CREATE POLICY "perms_read_all" ON permissions
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "perms_write_admin" ON permissions;
CREATE POLICY "perms_write_admin" ON permissions
    FOR INSERT TO authenticated
    WITH CHECK (is_founder_or_admin());

DROP POLICY IF EXISTS "perms_update_admin" ON permissions;
CREATE POLICY "perms_update_admin" ON permissions
    FOR UPDATE TO authenticated
    USING (is_founder_or_admin())
    WITH CHECK (is_founder_or_admin());

DROP POLICY IF EXISTS "perms_delete_admin" ON permissions;
CREATE POLICY "perms_delete_admin" ON permissions
    FOR DELETE TO authenticated
    USING (is_founder_or_admin());


-- project_memberships: tenant-scoped, escrita por admin
ALTER TABLE project_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pm_select_tenant" ON project_memberships;
CREATE POLICY "pm_select_tenant" ON project_memberships
    FOR SELECT TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "pm_insert_admin" ON project_memberships;
CREATE POLICY "pm_insert_admin" ON project_memberships
    FOR INSERT TO authenticated
    WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());

DROP POLICY IF EXISTS "pm_update_admin" ON project_memberships;
CREATE POLICY "pm_update_admin" ON project_memberships
    FOR UPDATE TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin())
    WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());

DROP POLICY IF EXISTS "pm_delete_admin" ON project_memberships;
CREATE POLICY "pm_delete_admin" ON project_memberships
    FOR DELETE TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());


-- roles: adicionar policies de escrita (leitura ja existe da v3)
DROP POLICY IF EXISTS "roles_write_admin" ON roles;
CREATE POLICY "roles_write_admin" ON roles
    FOR INSERT TO authenticated
    WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());

DROP POLICY IF EXISTS "roles_update_admin" ON roles;
CREATE POLICY "roles_update_admin" ON roles
    FOR UPDATE TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin())
    WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());

DROP POLICY IF EXISTS "roles_delete_admin" ON roles;
CREATE POLICY "roles_delete_admin" ON roles
    FOR DELETE TO authenticated
    USING (tenant_id IN (SELECT get_user_tenant_ids()) AND is_founder_or_admin());


-- role_permissions: adicionar policies de escrita (leitura ja existe da v3)
DROP POLICY IF EXISTS "role_perms_write_admin" ON role_permissions;
CREATE POLICY "role_perms_write_admin" ON role_permissions
    FOR INSERT TO authenticated
    WITH CHECK (
        role_id IN (SELECT id FROM roles WHERE tenant_id IN (SELECT get_user_tenant_ids()))
        AND is_founder_or_admin()
    );

DROP POLICY IF EXISTS "role_perms_update_admin" ON role_permissions;
CREATE POLICY "role_perms_update_admin" ON role_permissions
    FOR UPDATE TO authenticated
    USING (
        role_id IN (SELECT id FROM roles WHERE tenant_id IN (SELECT get_user_tenant_ids()))
        AND is_founder_or_admin()
    )
    WITH CHECK (
        role_id IN (SELECT id FROM roles WHERE tenant_id IN (SELECT get_user_tenant_ids()))
        AND is_founder_or_admin()
    );

DROP POLICY IF EXISTS "role_perms_delete_admin" ON role_permissions;
CREATE POLICY "role_perms_delete_admin" ON role_permissions
    FOR DELETE TO authenticated
    USING (
        role_id IN (SELECT id FROM roles WHERE tenant_id IN (SELECT get_user_tenant_ids()))
        AND is_founder_or_admin()
    );


-- ============================================================================
-- SECAO 10: AUDIT TRIGGERS NAS TABELAS NOVAS
-- ============================================================================

DROP TRIGGER IF EXISTS trg_audit_roles ON roles;
CREATE TRIGGER trg_audit_roles
    AFTER INSERT OR UPDATE OR DELETE ON roles
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_role_permissions ON role_permissions;
CREATE TRIGGER trg_audit_role_permissions
    AFTER INSERT OR UPDATE OR DELETE ON role_permissions
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_project_memberships ON project_memberships;
CREATE TRIGGER trg_audit_project_memberships
    AFTER INSERT OR UPDATE OR DELETE ON project_memberships
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();


-- ============================================================================
-- SECAO 11: INDEXES DE PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_module_action ON permissions(module, action);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_granted ON role_permissions(role_id, granted);
CREATE INDEX IF NOT EXISTS idx_roles_tenant_sort ON roles(tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_project_memberships_project ON project_memberships(project_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_user ON project_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_tenant ON project_memberships(tenant_id);


-- ============================================================================
-- SECAO 12: MAPEAMENTO DE PERFIS EXISTENTES
-- Atualizar tenant_members para usar os novos role UUIDs
-- (apenas se os roles antigos existem como v3 seeds)
-- ============================================================================

DO $$
DECLARE
    v_tid UUID;
BEGIN
    SELECT id INTO v_tid FROM tenants WHERE slug = 'tbo';
    IF v_tid IS NULL THEN RETURN; END IF;

    -- Mapear role antigo 'socio' para novo 'owner'
    UPDATE tenant_members tm SET role_id = (
        SELECT r.id FROM roles r WHERE r.slug = 'owner' AND r.tenant_id = v_tid
    )
    WHERE tm.tenant_id = v_tid
      AND tm.role_id = (SELECT r.id FROM roles r WHERE r.slug = 'socio' AND r.tenant_id = v_tid)
      AND EXISTS (SELECT 1 FROM roles WHERE slug = 'owner' AND tenant_id = v_tid);

    -- Mapear role antigo 'artista' para novo '3d-artist'
    UPDATE tenant_members tm SET role_id = (
        SELECT r.id FROM roles r WHERE r.slug = '3d-artist' AND r.tenant_id = v_tid
    )
    WHERE tm.tenant_id = v_tid
      AND tm.role_id = (SELECT r.id FROM roles r WHERE r.slug = 'artista' AND r.tenant_id = v_tid)
      AND EXISTS (SELECT 1 FROM roles WHERE slug = '3d-artist' AND tenant_id = v_tid);

    -- Nota: admin, po, comercial, financeiro mantêm mesmos slugs — sem alteração necessária

    RAISE NOTICE 'Mapeamento de perfis existentes concluido';
END$$;


-- ============================================================================
-- SECAO 13: CHANGELOG
-- ============================================================================

INSERT INTO changelog_entries (version, title, description, author, tag, published_at) VALUES
(
    '2.5.0',
    'RBAC Completo — 18 Roles + 55 Permissoes Granulares',
    'Sistema RBAC completo com 18 roles de sistema, 55 permissoes granulares em formato module.action, '
    || 'tabela permissions normalizada, project_memberships para overrides por projeto, '
    || 'RPC functions check_permission() e get_user_permissions(), '
    || 'RLS em todas as tabelas novas, audit triggers automaticos. '
    || 'Admin UI para gerenciamento de roles, permissoes e usuarios.',
    'Marco',
    'security',
    '2026-02-19'
)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- RESUMO DA MIGRATION v11
-- ============================================================================
--
-- Tabelas evoluidas:
--   1. roles — +label, +color, +is_default, +sort_order, +updated_at
--   2. role_permissions — +permission_id FK, +granted, +created_at
--
-- Tabelas criadas:
--   1. permissions — catalogo de permissoes granulares (55 registros)
--   2. project_memberships — override de role por projeto
--
-- Roles criados: 18 (owner, admin, diretor, po, pm, creative-dir, 3d-lead,
--   3d-artist, design, motion, copy, qa, comercial, cs, financeiro, legal,
--   viewer, guest)
--
-- Permissions criadas: 55 (users.*, roles.*, security.*, projects.*, tasks.*,
--   comments.*, files.*, crm.*, vendors.*, contracts.*, finance.*,
--   insights.*, automations.*, messages.*)
--
-- RPC Functions:
--   1. check_permission(user_id, module, action) → BOOLEAN
--   2. get_user_permissions(user_id) → TABLE(module, action, granted)
--   3. get_all_roles_with_permissions(tenant_id) → TABLE(role_id, ..., permissions JSONB)
--
-- RLS Policies: permissions(4), project_memberships(4), roles(+3), role_permissions(+3)
--
-- Audit Triggers: roles, role_permissions, project_memberships
--
-- Indexes: 9 novos indexes para performance
--
-- ============================================================================
-- FIM DA MIGRATION v11
-- ============================================================================
