-- ============================================================================
-- TBO OS — RLS Policies para Onboarding
-- Executar no Supabase SQL Editor apos criar as tabelas
-- ============================================================================

-- 1. Colaboradores: usuario so pode atualizar SEUS proprios dados
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;

-- Leitura: admins veem todos, colaboradores veem apenas seu registro
CREATE POLICY "colaboradores_select_own" ON colaboradores
  FOR SELECT USING (
    auth.uid() = auth_user_id
    OR EXISTS (
      SELECT 1 FROM colaboradores c
      WHERE c.auth_user_id = auth.uid()
      AND c.perfil_acesso IN ('admin', 'gestor', 'founder')
    )
  );

-- Atualizacao: usuario so pode atualizar seu proprio auth_user_id, telefone, foto_url
CREATE POLICY "colaboradores_update_own" ON colaboradores
  FOR UPDATE USING (
    auth.uid() = auth_user_id
  ) WITH CHECK (
    auth.uid() = auth_user_id
  );

-- Atualizacao por admins: podem atualizar qualquer colaborador
CREATE POLICY "colaboradores_update_admin" ON colaboradores
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM colaboradores c
      WHERE c.auth_user_id = auth.uid()
      AND c.perfil_acesso IN ('admin', 'gestor', 'founder')
    )
  );

-- Insercao: apenas admins/gestores podem cadastrar novos colaboradores
CREATE POLICY "colaboradores_insert_admin" ON colaboradores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM colaboradores c
      WHERE c.auth_user_id = auth.uid()
      AND c.perfil_acesso IN ('admin', 'gestor', 'founder')
    )
  );

-- 2. Convites: leitura publica por token (para pagina de aceite)
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "convites_select_by_token" ON convites
  FOR SELECT USING (true);

-- Insercao de convites: apenas admins
CREATE POLICY "convites_insert_admin" ON convites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM colaboradores c
      WHERE c.auth_user_id = auth.uid()
      AND c.perfil_acesso IN ('admin', 'gestor', 'founder')
    )
  );

-- Atualizacao de convites: marcar como usado (qualquer usuario autenticado)
CREATE POLICY "convites_update_usado" ON convites
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 3. Progresso: usuario so pode ver/atualizar seu proprio progresso
ALTER TABLE onboarding_progresso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progresso_select_own" ON onboarding_progresso
  FOR SELECT USING (
    colaborador_id IN (
      SELECT id FROM colaboradores WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM colaboradores c
      WHERE c.auth_user_id = auth.uid()
      AND c.perfil_acesso IN ('admin', 'gestor', 'founder')
    )
  );

CREATE POLICY "progresso_insert_own" ON onboarding_progresso
  FOR INSERT WITH CHECK (
    colaborador_id IN (
      SELECT id FROM colaboradores WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "progresso_update_own" ON onboarding_progresso
  FOR UPDATE USING (
    colaborador_id IN (
      SELECT id FROM colaboradores WHERE auth_user_id = auth.uid()
    )
  );

-- 4. Dias liberados: usuario so pode ver seus dias; admins veem todos
ALTER TABLE onboarding_dias_liberados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dias_liberados_select" ON onboarding_dias_liberados
  FOR SELECT USING (
    colaborador_id IN (
      SELECT id FROM colaboradores WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM colaboradores c
      WHERE c.auth_user_id = auth.uid()
      AND c.perfil_acesso IN ('admin', 'gestor', 'founder')
    )
  );

-- 5. Notificacoes: usuario so pode ver/atualizar suas notificacoes
ALTER TABLE onboarding_notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notificacoes_select_own" ON onboarding_notificacoes
  FOR SELECT USING (
    colaborador_id IN (
      SELECT id FROM colaboradores WHERE auth_user_id = auth.uid()
    )
    OR destinatario IN (
      SELECT email FROM colaboradores WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM colaboradores c
      WHERE c.auth_user_id = auth.uid()
      AND c.perfil_acesso IN ('admin', 'gestor', 'founder')
    )
  );

CREATE POLICY "notificacoes_update_own" ON onboarding_notificacoes
  FOR UPDATE USING (
    colaborador_id IN (
      SELECT id FROM colaboradores WHERE auth_user_id = auth.uid()
    )
    OR destinatario IN (
      SELECT email FROM colaboradores WHERE auth_user_id = auth.uid()
    )
  );

-- 6. Dias e atividades: leitura publica (conteudo nao sensivel)
ALTER TABLE onboarding_dias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dias_select_all" ON onboarding_dias FOR SELECT USING (true);

ALTER TABLE onboarding_atividades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "atividades_select_all" ON onboarding_atividades FOR SELECT USING (true);

-- 7. Check-ins: leitura e update por admins e pelo proprio colaborador
ALTER TABLE onboarding_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checkins_select" ON onboarding_checkins
  FOR SELECT USING (
    colaborador_id IN (
      SELECT id FROM colaboradores WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM colaboradores c
      WHERE c.auth_user_id = auth.uid()
      AND c.perfil_acesso IN ('admin', 'gestor', 'founder')
    )
  );

CREATE POLICY "checkins_update_admin" ON onboarding_checkins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM colaboradores c
      WHERE c.auth_user_id = auth.uid()
      AND c.perfil_acesso IN ('admin', 'gestor', 'founder')
    )
  );
