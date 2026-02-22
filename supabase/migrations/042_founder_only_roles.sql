-- ============================================================================
-- TBO OS — Migration 042: Founder Only — Role Único com Acesso Total
--
-- Simplifica o sistema de permissões para um único role: founder.
-- Todos os outros roles são deletados.
-- Todos os membros do tenant passam a ter o role founder.
-- Todas as permissões do founder são marcadas como granted = true.
--
-- IDEMPOTENTE: seguro executar múltiplas vezes.
-- ============================================================================


-- ============================================================================
-- SEÇÃO 1: Garantir que o role 'founder' existe
-- ============================================================================

DO $$
DECLARE
    v_tid UUID;
    v_founder_id UUID;
BEGIN
    SELECT id INTO v_tid FROM tenants WHERE slug = 'tbo';
    IF v_tid IS NULL THEN
        RAISE NOTICE 'Tenant TBO não encontrado, pulando migration 042';
        RETURN;
    END IF;

    -- Garantir que role founder existe
    INSERT INTO roles (tenant_id, name, slug, label, color, is_system, sort_order, description)
    VALUES (v_tid, 'Founder', 'founder', 'Fundador', '#E85102', true, 1, 'Fundador — acesso total irrestrito a todos os módulos')
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        label       = 'Fundador',
        color       = '#E85102',
        is_system   = true,
        sort_order  = 1,
        description = 'Fundador — acesso total irrestrito a todos os módulos';

    SELECT id INTO v_founder_id FROM roles WHERE tenant_id = v_tid AND slug = 'founder';
    RAISE NOTICE 'Role founder ID: %', v_founder_id;
END$$;


-- ============================================================================
-- SEÇÃO 2: Migrar todos os tenant_members para o role founder
-- ============================================================================

DO $$
DECLARE
    v_tid UUID;
    v_founder_id UUID;
BEGIN
    SELECT id INTO v_tid FROM tenants WHERE slug = 'tbo';
    IF v_tid IS NULL THEN RETURN; END IF;

    SELECT id INTO v_founder_id FROM roles WHERE tenant_id = v_tid AND slug = 'founder';
    IF v_founder_id IS NULL THEN RETURN; END IF;

    -- Atualizar todos os membros do tenant para founder
    UPDATE tenant_members
    SET role_id = v_founder_id
    WHERE tenant_id = v_tid;

    RAISE NOTICE 'Todos os tenant_members atualizados para founder';
END$$;


-- ============================================================================
-- SEÇÃO 3: Migrar todos os profiles para role founder
-- ============================================================================

DO $$
DECLARE
    v_tid UUID;
BEGIN
    SELECT id INTO v_tid FROM tenants WHERE slug = 'tbo';
    IF v_tid IS NULL THEN RETURN; END IF;

    UPDATE profiles
    SET role = 'founder'
    WHERE tenant_id = v_tid;

    RAISE NOTICE 'Todos os profiles atualizados para role founder';
END$$;


-- ============================================================================
-- SEÇÃO 4: Deletar todos os outros roles (exceto founder e owner do sistema)
-- ============================================================================

DO $$
DECLARE
    v_tid UUID;
BEGIN
    SELECT id INTO v_tid FROM tenants WHERE slug = 'tbo';
    IF v_tid IS NULL THEN RETURN; END IF;

    -- Deletar roles que não são founder nem owner (preservar owner por segurança do sistema)
    DELETE FROM roles
    WHERE tenant_id = v_tid
      AND slug NOT IN ('founder', 'owner');

    RAISE NOTICE 'Roles deletados — apenas founder e owner preservados';
END$$;


-- ============================================================================
-- SEÇÃO 5: Garantir que founder tem TODAS as permissões (granted = true)
-- ============================================================================

DO $$
DECLARE
    v_tid UUID;
    v_founder_id UUID;
BEGIN
    SELECT id INTO v_tid FROM tenants WHERE slug = 'tbo';
    IF v_tid IS NULL THEN RETURN; END IF;

    SELECT id INTO v_founder_id FROM roles WHERE tenant_id = v_tid AND slug = 'founder';
    IF v_founder_id IS NULL THEN RETURN; END IF;

    -- Atualizar TODAS as entradas existentes do founder para granted = true
    UPDATE role_permissions SET
        granted    = true,
        can_view   = true,
        can_create = true,
        can_edit   = true,
        can_delete = true,
        can_export = true
    WHERE role_id = v_founder_id;

    RAISE NOTICE 'Todas as permissões do founder atualizadas para granted = true';
END$$;


-- ============================================================================
-- SEÇÃO 6: Atualizar trigger para novos membros também receberem founder
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_new_member_gets_founder_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_founder_id UUID;
BEGIN
    -- Buscar role founder do mesmo tenant
    SELECT id INTO v_founder_id
    FROM roles
    WHERE tenant_id = NEW.tenant_id AND slug = 'founder'
    LIMIT 1;

    IF v_founder_id IS NOT NULL AND NEW.role_id IS NULL THEN
        NEW.role_id = v_founder_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_member_founder ON tenant_members;
CREATE TRIGGER trg_new_member_founder
    BEFORE INSERT ON tenant_members
    FOR EACH ROW
    EXECUTE FUNCTION fn_new_member_gets_founder_role();


-- ============================================================================
-- SEÇÃO 7: Atualizar RPC get_user_permissions para retornar tudo para founder
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE(module TEXT, action TEXT, granted BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Retornar permissoes da role do usuario no tenant
    RETURN QUERY
    SELECT DISTINCT
        p.module,
        p.action,
        rp.granted
    FROM tenant_members tm
    JOIN role_permissions rp ON rp.role_id = tm.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE tm.user_id = p_user_id
      AND rp.granted = true;

    -- Se nenhuma permissao encontrada via permission_id, tentar via module direto
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT DISTINCT
            rp.module,
            'view'::TEXT AS action,
            true AS granted
        FROM tenant_members tm
        JOIN role_permissions rp ON rp.role_id = tm.role_id
        WHERE tm.user_id = p_user_id
          AND rp.can_view = true
          AND rp.permission_id IS NULL;
    END IF;
END;
$$;


-- ============================================================================
-- CHANGELOG
-- ============================================================================

INSERT INTO changelog_entries (version, title, description, author, tag, published_at) VALUES
(
    '3.0.0',
    'Founder Only — Role único com acesso total',
    'Sistema simplificado para role único: Fundador com acesso total a todos os módulos. '
    || 'Todos os outros roles foram removidos. '
    || 'Todos os membros do tenant agora têm acesso completo ao sistema.',
    'Marco',
    'security',
    '2026-02-22'
)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- FIM DA MIGRATION 042
-- ============================================================================
