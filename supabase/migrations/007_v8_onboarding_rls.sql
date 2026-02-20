-- ============================================================================
-- TBO OS v2.2.1 — Migration v8: RLS para Tabelas de Onboarding
-- Adiciona Row Level Security multi-tenant as tabelas de onboarding
-- que estavam sem isolamento de dados.
--
-- IMPORTANTE: Esta migration e IDEMPOTENTE — seguro executar multiplas vezes.
-- Depende da migration v6 (funcoes get_user_tenant_ids, is_founder_or_admin).
--
-- Versao: 8.0.0
-- Data: 2026-02-19
-- ============================================================================

-- ============================================================================
-- SECAO 1: ADICIONAR tenant_id NAS TABELAS QUE NAO TEM
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'colaboradores' AND column_name = 'tenant_id') THEN
    ALTER TABLE colaboradores ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  END IF;
END $$;

-- ============================================================================
-- SECAO 2: HABILITAR RLS EM TODAS AS TABELAS DE ONBOARDING
-- ============================================================================

ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_dias ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_dias_liberados ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_notificacoes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECAO 3: POLICIES — COLABORADORES
-- ============================================================================

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

-- ============================================================================
-- SECAO 4: POLICIES — ONBOARDING_DIAS (template global, todos leem)
-- ============================================================================

DROP POLICY IF EXISTS onboarding_dias_select ON onboarding_dias;
CREATE POLICY onboarding_dias_select ON onboarding_dias FOR SELECT USING (true);

DROP POLICY IF EXISTS onboarding_dias_modify ON onboarding_dias;
CREATE POLICY onboarding_dias_modify ON onboarding_dias FOR ALL USING (is_founder_or_admin());

-- ============================================================================
-- SECAO 5: POLICIES — ONBOARDING_ATIVIDADES (template global)
-- ============================================================================

DROP POLICY IF EXISTS onboarding_atividades_select ON onboarding_atividades;
CREATE POLICY onboarding_atividades_select ON onboarding_atividades FOR SELECT USING (true);

DROP POLICY IF EXISTS onboarding_atividades_modify ON onboarding_atividades;
CREATE POLICY onboarding_atividades_modify ON onboarding_atividades FOR ALL USING (is_founder_or_admin());

-- ============================================================================
-- SECAO 6: POLICIES — ONBOARDING_PROGRESSO (isolamento via colaborador)
-- ============================================================================

DROP POLICY IF EXISTS onboarding_progresso_tenant ON onboarding_progresso;
CREATE POLICY onboarding_progresso_tenant ON onboarding_progresso FOR ALL
  USING (colaborador_id IN (SELECT id FROM colaboradores WHERE tenant_id IN (SELECT get_user_tenant_ids())));

-- ============================================================================
-- SECAO 7: POLICIES — ONBOARDING_DIAS_LIBERADOS
-- ============================================================================

DROP POLICY IF EXISTS onboarding_dias_liberados_tenant ON onboarding_dias_liberados;
CREATE POLICY onboarding_dias_liberados_tenant ON onboarding_dias_liberados FOR ALL
  USING (colaborador_id IN (SELECT id FROM colaboradores WHERE tenant_id IN (SELECT get_user_tenant_ids())));

-- ============================================================================
-- SECAO 8: POLICIES — ONBOARDING_CHECKINS
-- ============================================================================

DROP POLICY IF EXISTS onboarding_checkins_tenant ON onboarding_checkins;
CREATE POLICY onboarding_checkins_tenant ON onboarding_checkins FOR ALL
  USING (colaborador_id IN (SELECT id FROM colaboradores WHERE tenant_id IN (SELECT get_user_tenant_ids())));

-- ============================================================================
-- SECAO 9: POLICIES — ONBOARDING_NOTIFICACOES
-- ============================================================================

DROP POLICY IF EXISTS onboarding_notificacoes_tenant ON onboarding_notificacoes;
CREATE POLICY onboarding_notificacoes_tenant ON onboarding_notificacoes FOR ALL
  USING (
    colaborador_id IN (SELECT id FROM colaboradores WHERE tenant_id IN (SELECT get_user_tenant_ids()))
    OR destinatario = auth.uid()::text
  );

-- ============================================================================
-- SECAO 10: INDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_colaboradores_tenant ON colaboradores(tenant_id);

-- ============================================================================
-- FIM DA MIGRATION v8
-- ============================================================================
