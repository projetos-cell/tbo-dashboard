-- ============================================================================
-- TBO OS — Migration 041: Super Admins como Owners em todos os Spaces
--
-- Garante que marco@agenciatbo.com.br e ruy@agenciatbo.com.br tenham
-- role 'owner' em TODOS os workspaces (sidebar_items type='workspace')
-- e seus children, com permissões completas de edição, mover, copiar e duplicar.
--
-- Também cria trigger para auto-adicionar super admins como owners
-- quando novos workspaces forem criados.
--
-- IDEMPOTENTE: seguro executar múltiplas vezes.
-- ============================================================================


-- ============================================================================
-- SEÇÃO 1: Inserir super admins como owners em todos os spaces existentes
-- ============================================================================

DO $$
DECLARE
    v_tid UUID;
    v_marco_id UUID;
    v_ruy_id UUID;
    v_space RECORD;
BEGIN
    -- Buscar tenant TBO
    SELECT id INTO v_tid FROM tenants WHERE slug = 'tbo';
    IF v_tid IS NULL THEN
        RAISE NOTICE 'Tenant TBO não encontrado, pulando migration 041';
        RETURN;
    END IF;

    -- Buscar user IDs pelo email
    SELECT id INTO v_marco_id FROM auth.users WHERE email = 'marco@agenciatbo.com.br';
    SELECT id INTO v_ruy_id FROM auth.users WHERE email = 'ruy@agenciatbo.com.br';

    IF v_marco_id IS NULL AND v_ruy_id IS NULL THEN
        RAISE NOTICE 'Nenhum super admin encontrado, pulando migration 041';
        RETURN;
    END IF;

    -- Iterar sobre todos os workspaces do tenant
    FOR v_space IN
        SELECT id FROM sidebar_items
        WHERE tenant_id = v_tid
          AND type = 'workspace'
          AND deleted_at IS NULL
    LOOP
        -- Adicionar Marco como owner (se existe e não é membro ainda)
        IF v_marco_id IS NOT NULL THEN
            INSERT INTO space_members (tenant_id, space_id, user_id, role)
            VALUES (v_tid, v_space.id, v_marco_id, 'owner')
            ON CONFLICT (tenant_id, space_id, user_id) DO UPDATE SET role = 'owner';
        END IF;

        -- Adicionar Ruy como owner (se existe e não é membro ainda)
        IF v_ruy_id IS NOT NULL THEN
            INSERT INTO space_members (tenant_id, space_id, user_id, role)
            VALUES (v_tid, v_space.id, v_ruy_id, 'owner')
            ON CONFLICT (tenant_id, space_id, user_id) DO UPDATE SET role = 'owner';
        END IF;
    END LOOP;

    RAISE NOTICE 'Super admins adicionados como owners em todos os workspaces';
END$$;


-- ============================================================================
-- SEÇÃO 2: Trigger para auto-adicionar super admins em novos workspaces
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_auto_add_super_admins_to_space()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_super RECORD;
BEGIN
    -- Só executar para workspaces novos (não children, separators, etc.)
    IF NEW.type <> 'workspace' THEN
        RETURN NEW;
    END IF;

    -- Adicionar todos os super admins como owners
    FOR v_super IN
        SELECT u.id AS user_id
        FROM auth.users u
        WHERE u.email IN ('marco@agenciatbo.com.br', 'ruy@agenciatbo.com.br')
    LOOP
        INSERT INTO space_members (tenant_id, space_id, user_id, role)
        VALUES (NEW.tenant_id, NEW.id, v_super.user_id, 'owner')
        ON CONFLICT (tenant_id, space_id, user_id) DO UPDATE SET role = 'owner';
    END LOOP;

    RETURN NEW;
END;
$$;

-- Criar trigger (idempotente)
DROP TRIGGER IF EXISTS trg_auto_super_admin_space ON sidebar_items;
CREATE TRIGGER trg_auto_super_admin_space
    AFTER INSERT ON sidebar_items
    FOR EACH ROW
    EXECUTE FUNCTION fn_auto_add_super_admins_to_space();


-- ============================================================================
-- SEÇÃO 3: Garantir que super admins tenham role 'owner' no tenant_members
-- ============================================================================

DO $$
DECLARE
    v_tid UUID;
    v_owner_role_id UUID;
    v_marco_id UUID;
    v_ruy_id UUID;
BEGIN
    SELECT id INTO v_tid FROM tenants WHERE slug = 'tbo';
    IF v_tid IS NULL THEN RETURN; END IF;

    -- Buscar role 'owner' do tenant
    SELECT id INTO v_owner_role_id FROM roles WHERE slug = 'owner' AND tenant_id = v_tid;
    IF v_owner_role_id IS NULL THEN RETURN; END IF;

    SELECT id INTO v_marco_id FROM auth.users WHERE email = 'marco@agenciatbo.com.br';
    SELECT id INTO v_ruy_id FROM auth.users WHERE email = 'ruy@agenciatbo.com.br';

    -- Atualizar Marco para owner no tenant
    IF v_marco_id IS NOT NULL THEN
        UPDATE tenant_members
        SET role_id = v_owner_role_id
        WHERE tenant_id = v_tid AND user_id = v_marco_id;
    END IF;

    -- Atualizar Ruy para owner no tenant
    IF v_ruy_id IS NOT NULL THEN
        UPDATE tenant_members
        SET role_id = v_owner_role_id
        WHERE tenant_id = v_tid AND user_id = v_ruy_id;
    END IF;

    RAISE NOTICE 'Super admins atualizados para role owner no tenant';
END$$;


-- ============================================================================
-- CHANGELOG
-- ============================================================================

INSERT INTO changelog_entries (version, title, description, author, tag, published_at) VALUES
(
    '2.6.0',
    'Super Admins — Acesso completo a todos os workspaces',
    'Marco e Ruy agora têm acesso de owner (proprietário) em todos os workspaces '
    || 'e children, com permissões completas: editar, mover, copiar, duplicar, '
    || 'arquivar e excluir. Trigger automático garante acesso em novos workspaces.',
    'Marco',
    'security',
    '2026-02-22'
)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- FIM DA MIGRATION 041
-- ============================================================================
