-- ============================================================================
-- TBO OS v2 — Migration v7: RBAC Avancado + Auditoria Automatica
-- Executar no Supabase SQL Editor
--
-- IMPORTANTE: Esta migration e IDEMPOTENTE — seguro executar multiplas vezes.
-- Usa CREATE TABLE IF NOT EXISTS, CREATE OR REPLACE, DROP POLICY/TRIGGER IF EXISTS.
--
-- Conteudo:
--   1. Tabela audit_logs (evolucao com colunas padronizadas)
--   2. Funcao check_module_access() — verifica acesso a modulo por role
--   3. Funcao log_audit_event() — insere evento de auditoria
--   4. Funcao get_user_role_in_tenant(p_user_id, p_tenant_id) — retorna role completo
--   5. Triggers automaticos de auditoria em profiles, projects, tasks, crm_deals
--   6. Changelog
--
-- Versao: 7.0.0
-- Data: 2026-02-19
-- Autor: Marco (founder)
-- ============================================================================


-- ============================================================================
-- SECAO 1: TABELA audit_logs
-- A v6 criou audit_logs com colunas resource_type/resource_id/details.
-- Esta migration adiciona as colunas entity_type/entity_id/metadata como alias,
-- e garante que os indexes otimizados existam.
-- ============================================================================

-- Criar tabela caso nao exista (primeira execucao ou ambiente limpo)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar colunas que podem nao existir (se a tabela veio da v6 com schema diferente)
DO $$
BEGIN
    -- Se a v6 criou com resource_type mas sem entity_type, adicionar entity_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='entity_type') THEN
        ALTER TABLE audit_logs ADD COLUMN entity_type TEXT;
    END IF;

    -- Se a v6 criou com resource_id mas sem entity_id, adicionar entity_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='entity_id') THEN
        ALTER TABLE audit_logs ADD COLUMN entity_id UUID;
    END IF;

    -- Se a v6 criou com details mas sem metadata, adicionar metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='metadata') THEN
        ALTER TABLE audit_logs ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;

    -- Se ip_address existe como TEXT (v6), recriar nao e possivel facilmente,
    -- entao mantemos compatibilidade. Se nao existe, ja foi criado como INET acima.
    -- Nada a fazer aqui — ambos os tipos funcionam para armazenamento.
END$$;

-- Habilitar RLS (idempotente — nao da erro se ja estiver habilitado)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ── Policies para audit_logs ────────────────────────────────────────────────
-- Remover policies anteriores para recriar com logica atualizada
DROP POLICY IF EXISTS "rls_audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "rls_audit_logs_insert" ON audit_logs;
DROP POLICY IF EXISTS "rls_audit_logs_select_tenant" ON audit_logs;
DROP POLICY IF EXISTS "rls_audit_logs_insert_authenticated" ON audit_logs;

-- SELECT: usuarios podem ver logs do seu proprio tenant
-- (qualquer membro do tenant pode visualizar — filtro fino por role no frontend)
CREATE POLICY "rls_audit_logs_select_tenant" ON audit_logs
    FOR SELECT TO authenticated
    USING (
        tenant_id IN (SELECT get_user_tenant_ids())
    );

-- INSERT: usuarios autenticados podem inserir logs (apenas do seu proprio tenant)
-- A funcao log_audit_event() garante que o tenant_id e correto via SECURITY DEFINER
CREATE POLICY "rls_audit_logs_insert_authenticated" ON audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT get_user_tenant_ids())
    );

-- Sem UPDATE/DELETE — logs de auditoria sao imutaveis

-- ── Indexes otimizados ──────────────────────────────────────────────────────
-- Index composto para consultas por tenant ordenadas por data (mais comum)
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created
    ON audit_logs(tenant_id, created_at DESC);

-- Index composto para consultas por usuario ordenadas por data
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
    ON audit_logs(user_id, created_at DESC);

-- Index para busca por tipo de entidade (filtragem no painel de auditoria)
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type
    ON audit_logs(entity_type);

-- Index para busca por acao (filtragem por tipo de evento)
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
    ON audit_logs(action);

-- Index composto para busca por entidade especifica
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
    ON audit_logs(entity_type, entity_id);


-- ============================================================================
-- SECAO 2: FUNCAO check_module_access()
-- Verifica se um usuario tem acesso de visualizacao a um modulo especifico.
-- Consulta tenant_members + role_permissions para determinar permissao.
-- Retorna TRUE se o usuario pode acessar o modulo, FALSE caso contrario.
-- ============================================================================

CREATE OR REPLACE FUNCTION check_module_access(p_user_id UUID, p_module TEXT)
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
        WHERE tm.user_id = p_user_id
          AND tm.is_active = true
          AND rp.module = p_module
          AND rp.can_view = true
    )
$$;

-- Garantir que usuarios autenticados possam chamar a funcao
GRANT EXECUTE ON FUNCTION check_module_access(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION check_module_access(UUID, TEXT) IS
    'Verifica se o usuario tem permissao de visualizacao em um modulo. '
    'Consulta tenant_members + role_permissions. Retorna boolean.';


-- ============================================================================
-- SECAO 3: FUNCAO log_audit_event()
-- Insere um evento de auditoria na tabela audit_logs.
-- Usa auth.uid() para identificar o usuario e busca o tenant_id automaticamente.
-- Retorna o UUID do novo registro de log.
-- ============================================================================

CREATE OR REPLACE FUNCTION log_audit_event(
    p_action TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_log_id UUID;
BEGIN
    -- Obter o user_id do usuario autenticado
    v_user_id := auth.uid();

    -- Se nao ha usuario autenticado, nao registrar (evita erro em contextos sem auth)
    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Obter o tenant_id do usuario (primeiro tenant ativo encontrado)
    SELECT tm.tenant_id INTO v_tenant_id
    FROM tenant_members tm
    WHERE tm.user_id = v_user_id
      AND tm.is_active = true
    LIMIT 1;

    -- Inserir o evento de auditoria
    INSERT INTO audit_logs (
        tenant_id,
        user_id,
        action,
        entity_type,
        entity_id,
        metadata
    ) VALUES (
        v_tenant_id,
        v_user_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_metadata
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;

-- Garantir que usuarios autenticados possam chamar a funcao
GRANT EXECUTE ON FUNCTION log_audit_event(TEXT, TEXT, UUID, JSONB) TO authenticated;

COMMENT ON FUNCTION log_audit_event(TEXT, TEXT, UUID, JSONB) IS
    'Registra evento de auditoria automaticamente. Usa auth.uid() para user_id '
    'e busca tenant_id de tenant_members. Retorna o UUID do log criado.';


-- ============================================================================
-- SECAO 4: FUNCAO get_user_role_in_tenant(p_user_id, p_tenant_id)
-- Retorna informacoes completas do role de um usuario em um tenant especifico.
-- Inclui nome do role, label e todas as permissoes como JSONB.
-- NOTA: A v6 ja criou get_user_role_in_tenant(UUID) com assinatura diferente.
-- Esta versao tem 2 parametros e retorna TABLE, entao nao conflita.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_role_in_tenant(p_user_id UUID, p_tenant_id UUID)
RETURNS TABLE(role_name TEXT, role_label TEXT, permissions JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.slug AS role_name,
        r.name AS role_label,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'module', rp.module,
                        'can_view', rp.can_view,
                        'can_create', rp.can_create,
                        'can_edit', rp.can_edit,
                        'can_delete', rp.can_delete,
                        'can_export', rp.can_export
                    )
                )
                FROM role_permissions rp
                WHERE rp.role_id = r.id
            ),
            '[]'::jsonb
        ) AS permissions
    FROM tenant_members tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = p_user_id
      AND tm.tenant_id = p_tenant_id
      AND tm.is_active = true
    LIMIT 1;
END;
$$;

-- Garantir que usuarios autenticados possam chamar a funcao
GRANT EXECUTE ON FUNCTION get_user_role_in_tenant(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION get_user_role_in_tenant(UUID, UUID) IS
    'Retorna role_name (slug), role_label (nome) e permissions (jsonb array) '
    'do usuario em um tenant especifico. Retorna vazio se usuario nao e membro.';


-- ============================================================================
-- SECAO 5: FUNCAO GENERICA DE TRIGGER PARA AUDITORIA AUTOMATICA
-- Funcao reutilizavel que e chamada por triggers em varias tabelas.
-- Detecta INSERT/UPDATE/DELETE e registra automaticamente no audit_logs.
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_action TEXT;
    v_entity_id UUID;
    v_entity_type TEXT;
    v_tenant_id UUID;
    v_user_id UUID;
    v_metadata JSONB;
    v_old_data JSONB;
    v_new_data JSONB;
BEGIN
    -- Determinar a acao baseada na operacao do trigger
    CASE TG_OP
        WHEN 'INSERT' THEN v_action := 'create';
        WHEN 'UPDATE' THEN v_action := 'update';
        WHEN 'DELETE' THEN v_action := 'delete';
        ELSE v_action := lower(TG_OP);
    END CASE;

    -- Nome da tabela como entity_type
    v_entity_type := TG_TABLE_NAME;

    -- Obter o user_id do contexto de autenticacao
    v_user_id := auth.uid();

    -- Obter entity_id e tenant_id baseado na operacao
    IF TG_OP = 'DELETE' THEN
        -- Para DELETE, usamos OLD
        v_entity_id := OLD.id;
        -- Tentar obter tenant_id do registro
        IF TG_TABLE_NAME = 'profiles' THEN
            v_tenant_id := OLD.tenant_id;
        ELSE
            BEGIN
                EXECUTE format('SELECT ($1).%I', 'tenant_id') INTO v_tenant_id USING OLD;
            EXCEPTION WHEN OTHERS THEN
                v_tenant_id := NULL;
            END;
        END IF;
        v_old_data := to_jsonb(OLD);
        v_metadata := jsonb_build_object('old_data', v_old_data);
    ELSIF TG_OP = 'UPDATE' THEN
        -- Para UPDATE, usamos NEW para id/tenant e registramos diferencas
        v_entity_id := NEW.id;
        IF TG_TABLE_NAME = 'profiles' THEN
            v_tenant_id := NEW.tenant_id;
        ELSE
            BEGIN
                EXECUTE format('SELECT ($1).%I', 'tenant_id') INTO v_tenant_id USING NEW;
            EXCEPTION WHEN OTHERS THEN
                v_tenant_id := NULL;
            END;
        END IF;
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        -- Registrar apenas campos que mudaram (diff)
        v_metadata := jsonb_build_object(
            'changed_fields', (
                SELECT COALESCE(jsonb_object_agg(key, jsonb_build_object('old', v_old_data->key, 'new', value)), '{}'::jsonb)
                FROM jsonb_each(v_new_data)
                WHERE v_old_data->key IS DISTINCT FROM v_new_data->key
                  AND key NOT IN ('updated_at', 'created_at') -- Ignorar timestamps automaticos
            )
        );
    ELSE
        -- Para INSERT, usamos NEW
        v_entity_id := NEW.id;
        IF TG_TABLE_NAME = 'profiles' THEN
            v_tenant_id := NEW.tenant_id;
        ELSE
            BEGIN
                EXECUTE format('SELECT ($1).%I', 'tenant_id') INTO v_tenant_id USING NEW;
            EXCEPTION WHEN OTHERS THEN
                v_tenant_id := NULL;
            END;
        END IF;
        v_metadata := jsonb_build_object('new_data', to_jsonb(NEW));
    END IF;

    -- Se nao conseguiu tenant_id do registro, tentar pegar do usuario
    IF v_tenant_id IS NULL AND v_user_id IS NOT NULL THEN
        SELECT tm.tenant_id INTO v_tenant_id
        FROM tenant_members tm
        WHERE tm.user_id = v_user_id
          AND tm.is_active = true
        LIMIT 1;
    END IF;

    -- Inserir o log de auditoria (sem depender de RLS — SECURITY DEFINER)
    INSERT INTO audit_logs (
        tenant_id,
        user_id,
        action,
        entity_type,
        entity_id,
        metadata
    ) VALUES (
        v_tenant_id,
        v_user_id,
        v_action,
        v_entity_type,
        v_entity_id,
        v_metadata
    );

    -- Retornar o registro adequado para o tipo de operacao
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

COMMENT ON FUNCTION fn_audit_trigger() IS
    'Funcao generica de trigger para auditoria automatica. Detecta INSERT/UPDATE/DELETE, '
    'captura diferencas e registra no audit_logs. Usada em profiles, projects, tasks, crm_deals.';


-- ============================================================================
-- SECAO 6: TRIGGERS DE AUDITORIA EM TABELAS PRINCIPAIS
-- Cada tabela recebe um trigger AFTER INSERT/UPDATE/DELETE que chama
-- fn_audit_trigger() para registrar a acao automaticamente.
-- ============================================================================

-- ── Trigger para PROFILES ───────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_audit_profiles ON profiles;
CREATE TRIGGER trg_audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- ── Trigger para PROJECTS ───────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_audit_projects ON projects;
CREATE TRIGGER trg_audit_projects
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- ── Trigger para TASKS ──────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_audit_tasks ON tasks;
CREATE TRIGGER trg_audit_tasks
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- ── Trigger para CRM_DEALS ──────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_audit_crm_deals ON crm_deals;
CREATE TRIGGER trg_audit_crm_deals
    AFTER INSERT OR UPDATE OR DELETE ON crm_deals
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();


-- ============================================================================
-- SECAO 7: CHANGELOG
-- Registrar esta migration no changelog
-- ============================================================================

INSERT INTO changelog_entries (version, title, description, author, tag, published_at) VALUES
(
    '2.4.0',
    'RBAC Avancado + Auditoria Automatica',
    'Funcao check_module_access() para verificacao de permissao por modulo. '
    || 'Funcao log_audit_event() para registro manual de eventos. '
    || 'Funcao get_user_role_in_tenant(user_id, tenant_id) retorna role completo com permissoes. '
    || 'Funcao fn_audit_trigger() generica para auditoria automatica. '
    || 'Triggers de auditoria em profiles, projects, tasks e crm_deals. '
    || 'Indexes otimizados para consultas por tenant+data e user+data.',
    'Marco',
    'security',
    '2026-02-19'
)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- RESUMO DA MIGRATION v7
-- ============================================================================
--
-- Tabela evoluida:
--   1. audit_logs — colunas entity_type/entity_id/metadata adicionadas
--      (compativel com schema anterior da v6)
--
-- Funcoes criadas:
--   1. check_module_access(p_user_id, p_module)
--      → Verifica se usuario tem can_view em um modulo via role_permissions
--      → SECURITY DEFINER, search_path = public
--
--   2. log_audit_event(p_action, p_entity_type, p_entity_id, p_metadata)
--      → Insere evento de auditoria usando auth.uid()
--      → Busca tenant_id automaticamente de tenant_members
--      → Retorna UUID do log criado
--      → SECURITY DEFINER, search_path = public
--
--   3. get_user_role_in_tenant(p_user_id, p_tenant_id)
--      → Retorna TABLE(role_name, role_label, permissions)
--      → permissions e jsonb array com todos os modulos e permissoes
--      → SECURITY DEFINER, search_path = public
--
--   4. fn_audit_trigger()
--      → Funcao generica de trigger para auditoria automatica
--      → Detecta INSERT/UPDATE/DELETE
--      → Para UPDATE: registra apenas campos que mudaram (diff)
--      → Para DELETE: registra dados antigos
--      → Para INSERT: registra dados novos
--      → SECURITY DEFINER, search_path = public
--
-- Triggers criados:
--   1. trg_audit_profiles    → AFTER INSERT/UPDATE/DELETE ON profiles
--   2. trg_audit_projects    → AFTER INSERT/UPDATE/DELETE ON projects
--   3. trg_audit_tasks       → AFTER INSERT/UPDATE/DELETE ON tasks
--   4. trg_audit_crm_deals   → AFTER INSERT/UPDATE/DELETE ON crm_deals
--
-- Indexes criados:
--   1. idx_audit_logs_tenant_created  → (tenant_id, created_at DESC)
--   2. idx_audit_logs_user_created    → (user_id, created_at DESC)
--   3. idx_audit_logs_entity_type     → (entity_type)
--   4. idx_audit_logs_action          → (action)
--   5. idx_audit_logs_entity          → (entity_type, entity_id)
--
-- RLS Policies:
--   1. rls_audit_logs_select_tenant         → SELECT por tenant
--   2. rls_audit_logs_insert_authenticated  → INSERT por tenant
--   3. Sem UPDATE/DELETE (logs imutaveis)
--
-- ============================================================================
-- FIM DA MIGRATION v7
-- ============================================================================
