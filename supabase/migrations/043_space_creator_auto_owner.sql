-- ============================================================================
-- TBO OS — Migration 043: Auto-add workspace creator as owner
--
-- Atualiza o trigger fn_auto_add_super_admins_to_space() para também
-- adicionar o usuário autenticado (criador do workspace) como owner.
--
-- Também adiciona todos os tenant_members ativos como membros nos
-- workspaces existentes que ainda não possuem membros além dos super admins.
--
-- IDEMPOTENTE: seguro executar múltiplas vezes.
-- ============================================================================

-- ── 1. Atualizar trigger para incluir o criador ──────────────────────────

CREATE OR REPLACE FUNCTION fn_auto_add_super_admins_to_space()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_super RECORD;
    v_auth_uid UUID;
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

    -- Adicionar o usuário autenticado (criador) como owner também
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NOT NULL THEN
        INSERT INTO space_members (tenant_id, space_id, user_id, role)
        VALUES (NEW.tenant_id, NEW.id, v_auth_uid, 'owner')
        ON CONFLICT (tenant_id, space_id, user_id) DO UPDATE SET role = 'owner';
    END IF;

    RETURN NEW;
END;
$$;


-- ── 2. Garantir que todos os tenant_members ativos sejam membros ─────────
-- Para workspaces existentes que possuem 0 membros regulares (apenas super admins)

DO $$
DECLARE
    v_tid UUID;
    v_space RECORD;
    v_tm RECORD;
BEGIN
    SELECT id INTO v_tid FROM tenants WHERE slug = 'tbo';
    IF v_tid IS NULL THEN
        RAISE NOTICE 'Tenant TBO não encontrado, pulando migration 043';
        RETURN;
    END IF;

    -- Para cada workspace do tenant
    FOR v_space IN
        SELECT id FROM sidebar_items
        WHERE tenant_id = v_tid
          AND type = 'workspace'
          AND deleted_at IS NULL
    LOOP
        -- Adicionar todos os tenant_members ativos como membros (se não existirem)
        FOR v_tm IN
            SELECT tm.user_id
            FROM tenant_members tm
            WHERE tm.tenant_id = v_tid
              AND tm.is_active = TRUE
        LOOP
            INSERT INTO space_members (tenant_id, space_id, user_id, role)
            VALUES (v_tid, v_space.id, v_tm.user_id, 'member')
            ON CONFLICT (tenant_id, space_id, user_id) DO NOTHING;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Todos os tenant_members foram adicionados nos workspaces existentes';
END$$;


-- ============================================================================
-- FIM DA MIGRATION 043
-- ============================================================================
