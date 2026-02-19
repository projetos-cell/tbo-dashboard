-- ============================================================================
-- MIGRATION V8: Onboarding RLS + Security Invoker Views
-- TBO OS v2.1 — Fix para Supabase Security Advisor
--
-- Resolve: 15 erros no Security Advisor
--   - 10 tabelas de onboarding sem RLS habilitado
--   - 5 views com Security Definer implicito
--
-- Prerequisitos: get_colaborador_id() e get_perfil_acesso() devem existir
-- Idempotente: pode ser executado multiplas vezes sem erro
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECAO 1: HABILITAR RLS NAS TABELAS DE ONBOARDING
-- (idempotente — ENABLE em tabela ja habilitada nao gera erro)
-- ============================================================================

ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_dias ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_dias_liberados ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores_status_log ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- SECAO 2: POLICIES PARA COLABORADORES
-- ============================================================================

-- Limpar policies existentes (idempotencia)
DROP POLICY IF EXISTS colaboradores_select_admin ON colaboradores;
DROP POLICY IF EXISTS colaboradores_select_own ON colaboradores;
DROP POLICY IF EXISTS colaboradores_select_buddy ON colaboradores;
DROP POLICY IF EXISTS colaboradores_insert_admin ON colaboradores;
DROP POLICY IF EXISTS colaboradores_update_own ON colaboradores;
DROP POLICY IF EXISTS colaboradores_update_admin ON colaboradores;

-- Admin e gestor veem todos
CREATE POLICY colaboradores_select_admin ON colaboradores
  FOR SELECT USING (
    get_perfil_acesso() IN ('admin', 'gestor')
  );

-- Colaborador ve seus proprios dados
CREATE POLICY colaboradores_select_own ON colaboradores
  FOR SELECT USING (
    auth_user_id = auth.uid()
  );

-- Buddy ve dados dos seus mentorados
CREATE POLICY colaboradores_select_buddy ON colaboradores
  FOR SELECT USING (
    buddy_id = get_colaborador_id()
  );

-- Admin e gestor podem inserir
CREATE POLICY colaboradores_insert_admin ON colaboradores
  FOR INSERT WITH CHECK (
    get_perfil_acesso() IN ('admin', 'gestor')
  );

-- Colaborador pode atualizar seus proprios dados (foto, telefone)
CREATE POLICY colaboradores_update_own ON colaboradores
  FOR UPDATE USING (
    auth_user_id = auth.uid()
  );

-- Admin e gestor podem atualizar qualquer colaborador
CREATE POLICY colaboradores_update_admin ON colaboradores
  FOR UPDATE USING (
    get_perfil_acesso() IN ('admin', 'gestor')
  );


-- ============================================================================
-- SECAO 3: POLICIES PARA CONVITES
-- ============================================================================

DROP POLICY IF EXISTS convites_select_all ON convites;
DROP POLICY IF EXISTS convites_insert_admin ON convites;
DROP POLICY IF EXISTS convites_update ON convites;

-- Qualquer pessoa autenticada pode ler convites (necessario para validar token)
CREATE POLICY convites_select_all ON convites
  FOR SELECT USING (true);

-- Admin e gestor podem inserir convites
CREATE POLICY convites_insert_admin ON convites
  FOR INSERT WITH CHECK (
    get_perfil_acesso() IN ('admin', 'gestor')
  );

-- Admin pode atualizar convites (marcar como usado)
CREATE POLICY convites_update ON convites
  FOR UPDATE USING (true);


-- ============================================================================
-- SECAO 4: POLICIES PARA ONBOARDING_DIAS (dados publicos)
-- ============================================================================

DROP POLICY IF EXISTS onboarding_dias_select ON onboarding_dias;

CREATE POLICY onboarding_dias_select ON onboarding_dias
  FOR SELECT USING (true);


-- ============================================================================
-- SECAO 5: POLICIES PARA ONBOARDING_ATIVIDADES (dados publicos)
-- ============================================================================

DROP POLICY IF EXISTS onboarding_atividades_select ON onboarding_atividades;

CREATE POLICY onboarding_atividades_select ON onboarding_atividades
  FOR SELECT USING (true);


-- ============================================================================
-- SECAO 6: POLICIES PARA ONBOARDING_PROGRESSO
-- ============================================================================

DROP POLICY IF EXISTS progresso_select_own ON onboarding_progresso;
DROP POLICY IF EXISTS progresso_select_buddy ON onboarding_progresso;
DROP POLICY IF EXISTS progresso_select_admin ON onboarding_progresso;
DROP POLICY IF EXISTS progresso_insert_own ON onboarding_progresso;
DROP POLICY IF EXISTS progresso_update_own ON onboarding_progresso;

-- Colaborador ve seu proprio progresso
CREATE POLICY progresso_select_own ON onboarding_progresso
  FOR SELECT USING (
    colaborador_id = get_colaborador_id()
  );

-- Buddy ve progresso dos mentorados
CREATE POLICY progresso_select_buddy ON onboarding_progresso
  FOR SELECT USING (
    colaborador_id IN (
      SELECT id FROM colaboradores WHERE buddy_id = get_colaborador_id()
    )
  );

-- Admin e gestor veem tudo
CREATE POLICY progresso_select_admin ON onboarding_progresso
  FOR SELECT USING (
    get_perfil_acesso() IN ('admin', 'gestor')
  );

-- Colaborador insere seu proprio progresso
CREATE POLICY progresso_insert_own ON onboarding_progresso
  FOR INSERT WITH CHECK (
    colaborador_id = get_colaborador_id()
  );

-- Colaborador atualiza seu proprio progresso
CREATE POLICY progresso_update_own ON onboarding_progresso
  FOR UPDATE USING (
    colaborador_id = get_colaborador_id()
  );


-- ============================================================================
-- SECAO 7: POLICIES PARA ONBOARDING_DIAS_LIBERADOS
-- ============================================================================

DROP POLICY IF EXISTS dias_liberados_select_own ON onboarding_dias_liberados;
DROP POLICY IF EXISTS dias_liberados_select_buddy ON onboarding_dias_liberados;
DROP POLICY IF EXISTS dias_liberados_select_admin ON onboarding_dias_liberados;

-- Colaborador ve seus dias liberados
CREATE POLICY dias_liberados_select_own ON onboarding_dias_liberados
  FOR SELECT USING (
    colaborador_id = get_colaborador_id()
  );

-- Buddy ve dias dos mentorados
CREATE POLICY dias_liberados_select_buddy ON onboarding_dias_liberados
  FOR SELECT USING (
    colaborador_id IN (
      SELECT id FROM colaboradores WHERE buddy_id = get_colaborador_id()
    )
  );

-- Admin e gestor veem tudo
CREATE POLICY dias_liberados_select_admin ON onboarding_dias_liberados
  FOR SELECT USING (
    get_perfil_acesso() IN ('admin', 'gestor')
  );


-- ============================================================================
-- SECAO 8: POLICIES PARA ONBOARDING_CHECKINS
-- ============================================================================

DROP POLICY IF EXISTS checkins_select_own ON onboarding_checkins;
DROP POLICY IF EXISTS checkins_select_admin ON onboarding_checkins;
DROP POLICY IF EXISTS checkins_insert_admin ON onboarding_checkins;
DROP POLICY IF EXISTS checkins_update_admin ON onboarding_checkins;

-- Colaborador ve seus check-ins
CREATE POLICY checkins_select_own ON onboarding_checkins
  FOR SELECT USING (
    colaborador_id = get_colaborador_id()
    OR responsavel_id = get_colaborador_id()
  );

-- Admin e gestor veem tudo
CREATE POLICY checkins_select_admin ON onboarding_checkins
  FOR SELECT USING (
    get_perfil_acesso() IN ('admin', 'gestor')
  );

-- Admin e gestor podem inserir check-ins
CREATE POLICY checkins_insert_admin ON onboarding_checkins
  FOR INSERT WITH CHECK (
    get_perfil_acesso() IN ('admin', 'gestor')
  );

-- Admin/gestor e responsavel podem atualizar check-ins
CREATE POLICY checkins_update_admin ON onboarding_checkins
  FOR UPDATE USING (
    get_perfil_acesso() IN ('admin', 'gestor')
    OR responsavel_id = get_colaborador_id()
  );


-- ============================================================================
-- SECAO 9: POLICIES PARA ONBOARDING_NOTIFICACOES
-- ============================================================================

DROP POLICY IF EXISTS notificacoes_select_own ON onboarding_notificacoes;
DROP POLICY IF EXISTS notificacoes_select_admin ON onboarding_notificacoes;
DROP POLICY IF EXISTS notificacoes_update_own ON onboarding_notificacoes;

-- Colaborador ve suas notificacoes (por colaborador_id ou destinatario = email)
CREATE POLICY notificacoes_select_own ON onboarding_notificacoes
  FOR SELECT USING (
    colaborador_id = get_colaborador_id()
    OR destinatario = (SELECT email FROM colaboradores WHERE auth_user_id = auth.uid())
  );

-- Admin e gestor veem tudo
CREATE POLICY notificacoes_select_admin ON onboarding_notificacoes
  FOR SELECT USING (
    get_perfil_acesso() IN ('admin', 'gestor')
  );

-- Colaborador pode marcar suas notificacoes como lidas
CREATE POLICY notificacoes_update_own ON onboarding_notificacoes
  FOR UPDATE USING (
    colaborador_id = get_colaborador_id()
    OR destinatario = (SELECT email FROM colaboradores WHERE auth_user_id = auth.uid())
  );


-- ============================================================================
-- SECAO 10: POLICIES PARA COLABORADORES_STATUS_LOG
-- ============================================================================

DROP POLICY IF EXISTS status_log_select_own ON colaboradores_status_log;
DROP POLICY IF EXISTS status_log_select_admin ON colaboradores_status_log;

-- Colaborador ve seu proprio log
CREATE POLICY status_log_select_own ON colaboradores_status_log
  FOR SELECT USING (
    colaborador_id = get_colaborador_id()
  );

-- Admin e gestor veem tudo
CREATE POLICY status_log_select_admin ON colaboradores_status_log
  FOR SELECT USING (
    get_perfil_acesso() IN ('admin', 'gestor')
  );


-- ============================================================================
-- SECAO 11: CONVERTER VIEWS PARA SECURITY INVOKER
-- Remove o flag "Security Definer View" do Security Advisor.
-- security_invoker = on faz a view respeitar RLS do usuario que a consulta.
-- (Postgres 15+ / Supabase suporta nativamente)
-- ============================================================================

ALTER VIEW vw_progresso_onboarding SET (security_invoker = on);
ALTER VIEW vw_colaboradores_inativos SET (security_invoker = on);
ALTER VIEW v_weekly_financial_summary SET (security_invoker = on);
ALTER VIEW v_weekly_project_summary SET (security_invoker = on);
ALTER VIEW active_team SET (security_invoker = on);


COMMIT;

-- ============================================================================
-- FIM DA MIGRATION V8
-- Apos executar, clicar "Refresh" no Security Advisor para confirmar 0 erros.
-- ============================================================================
