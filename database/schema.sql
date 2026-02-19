-- ============================================================================
-- TBO OS — Schema de Onboarding
-- Executar diretamente no SQL Editor do Supabase
-- Versao: 1.0.0
-- ============================================================================

-- ============================================================================
-- SECAO 1: TABELAS PRINCIPAIS
-- ============================================================================

-- ── Colaboradores ─────────────────────────────────────────────────────────────
-- Tabela central de colaboradores. Cada pessoa da equipe TBO tem um registro aqui.
-- O campo auth_user_id vincula ao Supabase Auth quando o usuario aceita o convite.
-- O campo perfil_acesso controla o nivel de permissao no sistema de onboarding.
CREATE TABLE IF NOT EXISTS colaboradores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  telefone text,
  foto_url text,
  cargo text NOT NULL,
  tipo_contrato text, -- 'CLT' | 'PJ'
  perfil_acesso text DEFAULT 'colaborador', -- 'admin' | 'gestor' | 'colaborador'
  data_inicio date NOT NULL,
  buddy_id uuid REFERENCES colaboradores(id),
  cadastrado_por uuid REFERENCES colaboradores(id),
  status text DEFAULT 'pre-onboarding',
  -- 'pre-onboarding' | 'aguardando_inicio' | 'onboarding' | 'ativo' | 'inativo'
  tipo_onboarding text DEFAULT 'completo', -- 'completo' (10 dias) | 'reduzido' (3 dias)
  onboarding_concluido_em timestamptz,
  quiz_score_final int,
  created_at timestamptz DEFAULT now()
);

-- Indice para busca por email (usado no login e vinculacao auth)
CREATE INDEX IF NOT EXISTS idx_colaboradores_email ON colaboradores(email);
-- Indice para busca por status (usado em queries de onboarding)
CREATE INDEX IF NOT EXISTS idx_colaboradores_status ON colaboradores(status);
-- Indice para busca por auth_user_id (usado no RLS)
CREATE INDEX IF NOT EXISTS idx_colaboradores_auth_user ON colaboradores(auth_user_id);


-- ── Convites ──────────────────────────────────────────────────────────────────
-- Tokens de convite enviados para novos colaboradores. Cada convite tem validade
-- e so pode ser usado uma vez. O token e gerado automaticamente por trigger.
CREATE TABLE IF NOT EXISTS convites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid REFERENCES colaboradores(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expira_em timestamptz NOT NULL,
  usado_em timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_convites_token ON convites(token);
CREATE INDEX IF NOT EXISTS idx_convites_colaborador ON convites(colaborador_id);


-- ── Onboarding Dias ───────────────────────────────────────────────────────────
-- Define a estrutura dos dias de onboarding (completo = 10 dias, reduzido = 3 dias).
-- Cada dia tem um tema, carga e pode ter check-in humano obrigatorio.
CREATE TABLE IF NOT EXISTS onboarding_dias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero int NOT NULL,
  titulo text NOT NULL,
  tema text,
  carga text, -- 'leve' | 'media' | 'alta'
  tipo_onboarding text NOT NULL, -- 'completo' | 'reduzido'
  tem_checkin_humano boolean DEFAULT false,
  duracao_checkin_min int
);

CREATE INDEX IF NOT EXISTS idx_onboarding_dias_tipo ON onboarding_dias(tipo_onboarding, numero);


-- ── Onboarding Atividades ─────────────────────────────────────────────────────
-- Atividades dentro de cada dia. Cada atividade tem um tipo (video, quiz, etc.)
-- e pode ser obrigatoria ou opcional. A ordem define a sequencia de exibicao.
CREATE TABLE IF NOT EXISTS onboarding_atividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_id uuid REFERENCES onboarding_dias(id) ON DELETE CASCADE,
  ordem int NOT NULL,
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL, -- 'video' | 'documento' | 'sop' | 'quiz' | 'tarefa' | 'formulario' | 'aceite'
  url_conteudo text,
  tempo_estimado_min int,
  acao_conclusao text,
  score_minimo int,
  obrigatorio boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_atividades_dia ON onboarding_atividades(dia_id, ordem);


-- ── Onboarding Progresso ──────────────────────────────────────────────────────
-- Registra o progresso de cada colaborador em cada atividade.
-- A constraint UNIQUE garante que nao haja duplicatas.
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

CREATE INDEX IF NOT EXISTS idx_progresso_colaborador ON onboarding_progresso(colaborador_id);


-- ── Onboarding Dias Liberados ─────────────────────────────────────────────────
-- Controla quais dias foram liberados para cada colaborador.
-- Um dia so e liberado quando o anterior foi concluido (exceto o dia 1).
CREATE TABLE IF NOT EXISTS onboarding_dias_liberados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid REFERENCES colaboradores(id) ON DELETE CASCADE,
  dia_id uuid REFERENCES onboarding_dias(id) ON DELETE CASCADE,
  liberado_em timestamptz DEFAULT now(),
  concluido boolean DEFAULT false,
  concluido_em timestamptz,
  UNIQUE(colaborador_id, dia_id)
);

CREATE INDEX IF NOT EXISTS idx_dias_liberados_colaborador ON onboarding_dias_liberados(colaborador_id);


-- ── Onboarding Check-ins ──────────────────────────────────────────────────────
-- Registra check-ins humanos (1:1 com buddy ou gestor) durante o onboarding.
-- Tambem usado para agendar check-ins de Dia 30 e Dia 90 pos-onboarding.
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

CREATE INDEX IF NOT EXISTS idx_checkins_colaborador ON onboarding_checkins(colaborador_id);


-- ── Onboarding Notificacoes ───────────────────────────────────────────────────
-- Registra todas as notificacoes enviadas durante o onboarding.
-- Tipos: email, push, inapp. Campo lida controla se o usuario ja viu.
CREATE TABLE IF NOT EXISTS onboarding_notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid REFERENCES colaboradores(id) ON DELETE CASCADE,
  tipo text, -- 'email' | 'push' | 'inapp'
  gatilho text,
  destinatario text,
  mensagem text,
  enviado_em timestamptz DEFAULT now(),
  status text DEFAULT 'enviado', -- 'enviado' | 'falha' | 'pendente'
  lida boolean DEFAULT false,
  lida_em timestamptz
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_colaborador ON onboarding_notificacoes(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_destinatario ON onboarding_notificacoes(destinatario);


-- ── Colaboradores Status Log ──────────────────────────────────────────────────
-- Auditoria de mudancas de status dos colaboradores. Util para rastrear
-- a evolucao de cada pessoa no processo de onboarding.
CREATE TABLE IF NOT EXISTS colaboradores_status_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid REFERENCES colaboradores(id) ON DELETE CASCADE,
  status_anterior text,
  status_novo text,
  alterado_em timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_status_log_colaborador ON colaboradores_status_log(colaborador_id);


-- ============================================================================
-- SECAO 2: FUNCOES E TRIGGERS
-- ============================================================================

-- ── Funcao auxiliar: obter colaborador_id a partir do auth.uid() ──────────────
CREATE OR REPLACE FUNCTION get_colaborador_id()
RETURNS uuid AS $$
  SELECT id FROM colaboradores WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ── Funcao auxiliar: obter perfil_acesso do usuario autenticado ───────────────
CREATE OR REPLACE FUNCTION get_perfil_acesso()
RETURNS text AS $$
  SELECT perfil_acesso FROM colaboradores WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ── 1. handle_new_user ────────────────────────────────────────────────────────
-- Ao criar usuario no Supabase Auth, vincula ao perfil em colaboradores via email.
-- Isso permite que o convite aceito conecte o auth.users ao colaborador ja cadastrado.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  UPDATE colaboradores
  SET auth_user_id = NEW.id
  WHERE email = NEW.email
    AND auth_user_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: dispara quando um novo usuario e criado no auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── 2. gerar_convite ──────────────────────────────────────────────────────────
-- Ao inserir novo colaborador, gera token de convite automaticamente.
-- O token tem validade de 7 dias e e usado na pagina de aceite.
CREATE OR REPLACE FUNCTION gerar_convite()
RETURNS trigger AS $$
DECLARE
  _token text;
BEGIN
  -- Gera token unico baseado em UUID + timestamp
  _token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO convites (colaborador_id, token, expira_em)
  VALUES (NEW.id, _token, now() + interval '7 days');

  -- Muda status para aguardando_inicio se estiver em pre-onboarding
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


-- ── 3. verificar_conclusao_dia ────────────────────────────────────────────────
-- Ao atualizar onboarding_progresso (marcar atividade como concluida),
-- verifica se TODAS as atividades obrigatorias do dia foram concluidas.
-- Se sim, marca o dia como concluido em onboarding_dias_liberados.
CREATE OR REPLACE FUNCTION verificar_conclusao_dia()
RETURNS trigger AS $$
DECLARE
  _dia_id uuid;
  _total_obrigatorias int;
  _total_concluidas int;
  _colaborador_id uuid;
BEGIN
  _colaborador_id := NEW.colaborador_id;

  -- Descobre o dia_id da atividade concluida
  SELECT a.dia_id INTO _dia_id
  FROM onboarding_atividades a
  WHERE a.id = NEW.atividade_id;

  IF _dia_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Conta total de atividades obrigatorias do dia
  SELECT COUNT(*) INTO _total_obrigatorias
  FROM onboarding_atividades
  WHERE dia_id = _dia_id AND obrigatorio = true;

  -- Conta quantas o colaborador ja concluiu
  SELECT COUNT(*) INTO _total_concluidas
  FROM onboarding_progresso p
  JOIN onboarding_atividades a ON a.id = p.atividade_id
  WHERE p.colaborador_id = _colaborador_id
    AND a.dia_id = _dia_id
    AND a.obrigatorio = true
    AND p.concluido = true;

  -- Se todas concluidas, marca o dia como concluido
  IF _total_concluidas >= _total_obrigatorias THEN
    UPDATE onboarding_dias_liberados
    SET concluido = true, concluido_em = now()
    WHERE colaborador_id = _colaborador_id AND dia_id = _dia_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_verificar_conclusao_dia ON onboarding_progresso;
CREATE TRIGGER trg_verificar_conclusao_dia
  AFTER UPDATE OF concluido ON onboarding_progresso
  FOR EACH ROW
  WHEN (NEW.concluido = true)
  EXECUTE FUNCTION verificar_conclusao_dia();

-- Tambem dispara ao inserir com concluido = true
DROP TRIGGER IF EXISTS trg_verificar_conclusao_dia_insert ON onboarding_progresso;
CREATE TRIGGER trg_verificar_conclusao_dia_insert
  AFTER INSERT ON onboarding_progresso
  FOR EACH ROW
  WHEN (NEW.concluido = true)
  EXECUTE FUNCTION verificar_conclusao_dia();


-- ── 4. liberar_proximo_dia ────────────────────────────────────────────────────
-- Ao marcar um dia como concluido, libera o proximo dia automaticamente.
-- Se o dia concluido e o ultimo (10 para completo, 3 para reduzido),
-- muda o status do colaborador para 'ativo'.
CREATE OR REPLACE FUNCTION liberar_proximo_dia()
RETURNS trigger AS $$
DECLARE
  _colaborador_id uuid;
  _dia_numero int;
  _tipo_onboarding text;
  _total_dias int;
  _proximo_dia_id uuid;
BEGIN
  IF NEW.concluido = true AND (OLD.concluido IS NULL OR OLD.concluido = false) THEN
    _colaborador_id := NEW.colaborador_id;

    -- Descobre o numero do dia concluido e o tipo de onboarding
    SELECT d.numero, d.tipo_onboarding INTO _dia_numero, _tipo_onboarding
    FROM onboarding_dias d
    WHERE d.id = NEW.dia_id;

    -- Total de dias para este tipo de onboarding
    SELECT COUNT(*) INTO _total_dias
    FROM onboarding_dias
    WHERE tipo_onboarding = _tipo_onboarding;

    IF _dia_numero >= _total_dias THEN
      -- Ultimo dia: muda status para ativo
      UPDATE colaboradores
      SET status = 'ativo',
          onboarding_concluido_em = now()
      WHERE id = _colaborador_id;
    ELSE
      -- Libera o proximo dia
      SELECT d.id INTO _proximo_dia_id
      FROM onboarding_dias d
      WHERE d.tipo_onboarding = _tipo_onboarding
        AND d.numero = _dia_numero + 1
      LIMIT 1;

      IF _proximo_dia_id IS NOT NULL THEN
        INSERT INTO onboarding_dias_liberados (colaborador_id, dia_id)
        VALUES (_colaborador_id, _proximo_dia_id)
        ON CONFLICT (colaborador_id, dia_id) DO NOTHING;
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


-- ── 5. log_mudanca_status ─────────────────────────────────────────────────────
-- Ao mudar o status de um colaborador, registra a mudanca no log de auditoria.
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


-- ============================================================================
-- SECAO 3: VIEWS
-- ============================================================================

-- ── vw_progresso_onboarding ───────────────────────────────────────────────────
-- Progresso de todos os colaboradores em onboarding com % de conclusao,
-- dias concluidos e ultima atividade concluida.
CREATE OR REPLACE VIEW vw_progresso_onboarding AS
SELECT
  c.id AS colaborador_id,
  c.nome,
  c.email,
  c.cargo,
  c.status,
  c.tipo_onboarding,
  c.data_inicio,
  c.buddy_id,
  b.nome AS buddy_nome,
  -- Total de atividades obrigatorias para o tipo de onboarding
  (
    SELECT COUNT(*)
    FROM onboarding_atividades a
    JOIN onboarding_dias d ON d.id = a.dia_id
    WHERE d.tipo_onboarding = c.tipo_onboarding AND a.obrigatorio = true
  ) AS total_atividades,
  -- Total de atividades concluidas pelo colaborador
  (
    SELECT COUNT(*)
    FROM onboarding_progresso p
    JOIN onboarding_atividades a ON a.id = p.atividade_id
    JOIN onboarding_dias d ON d.id = a.dia_id
    WHERE p.colaborador_id = c.id
      AND d.tipo_onboarding = c.tipo_onboarding
      AND a.obrigatorio = true
      AND p.concluido = true
  ) AS atividades_concluidas,
  -- Percentual de conclusao
  CASE WHEN (
    SELECT COUNT(*)
    FROM onboarding_atividades a
    JOIN onboarding_dias d ON d.id = a.dia_id
    WHERE d.tipo_onboarding = c.tipo_onboarding AND a.obrigatorio = true
  ) > 0 THEN
    ROUND(
      (
        SELECT COUNT(*)::numeric
        FROM onboarding_progresso p
        JOIN onboarding_atividades a ON a.id = p.atividade_id
        JOIN onboarding_dias d ON d.id = a.dia_id
        WHERE p.colaborador_id = c.id
          AND d.tipo_onboarding = c.tipo_onboarding
          AND a.obrigatorio = true
          AND p.concluido = true
      ) * 100.0 / (
        SELECT COUNT(*)
        FROM onboarding_atividades a
        JOIN onboarding_dias d ON d.id = a.dia_id
        WHERE d.tipo_onboarding = c.tipo_onboarding AND a.obrigatorio = true
      )
    , 1)
  ELSE 0 END AS percentual_conclusao,
  -- Dias concluidos
  (
    SELECT COUNT(*)
    FROM onboarding_dias_liberados dl
    WHERE dl.colaborador_id = c.id AND dl.concluido = true
  ) AS dias_concluidos,
  -- Total de dias no onboarding
  (
    SELECT COUNT(*)
    FROM onboarding_dias d
    WHERE d.tipo_onboarding = c.tipo_onboarding
  ) AS total_dias,
  -- Ultima atividade concluida
  (
    SELECT a.titulo
    FROM onboarding_progresso p
    JOIN onboarding_atividades a ON a.id = p.atividade_id
    WHERE p.colaborador_id = c.id AND p.concluido = true
    ORDER BY p.concluido_em DESC
    LIMIT 1
  ) AS ultima_atividade,
  -- Data da ultima atividade concluida
  (
    SELECT p.concluido_em
    FROM onboarding_progresso p
    WHERE p.colaborador_id = c.id AND p.concluido = true
    ORDER BY p.concluido_em DESC
    LIMIT 1
  ) AS ultima_atividade_em
FROM colaboradores c
LEFT JOIN colaboradores b ON b.id = c.buddy_id
WHERE c.status IN ('onboarding', 'aguardando_inicio', 'pre-onboarding');


-- ── vw_colaboradores_inativos ─────────────────────────────────────────────────
-- Colaboradores em onboarding sem atividade ha mais de 1 dia util.
-- Inclui dados do buddy para notificacao.
CREATE OR REPLACE VIEW vw_colaboradores_inativos AS
SELECT
  c.id AS colaborador_id,
  c.nome,
  c.email,
  c.cargo,
  c.buddy_id,
  b.nome AS buddy_nome,
  b.email AS buddy_email,
  c.tipo_onboarding,
  -- Ultima atividade concluida
  (
    SELECT MAX(p.concluido_em)
    FROM onboarding_progresso p
    WHERE p.colaborador_id = c.id AND p.concluido = true
  ) AS ultima_atividade_em,
  -- Dias sem atividade (calcula em dias uteis aproximados)
  EXTRACT(EPOCH FROM (now() - COALESCE(
    (SELECT MAX(p.concluido_em) FROM onboarding_progresso p WHERE p.colaborador_id = c.id AND p.concluido = true),
    -- Se nunca fez atividade, usa a data de liberacao do primeiro dia
    (SELECT MIN(dl.liberado_em) FROM onboarding_dias_liberados dl WHERE dl.colaborador_id = c.id),
    c.data_inicio::timestamptz
  ))) / 86400.0 AS dias_sem_atividade
FROM colaboradores c
LEFT JOIN colaboradores b ON b.id = c.buddy_id
WHERE c.status = 'onboarding'
  AND (
    -- Sem atividade ha mais de 1 dia
    (SELECT MAX(p.concluido_em) FROM onboarding_progresso p WHERE p.colaborador_id = c.id AND p.concluido = true)
      < now() - interval '1 day'
    OR
    -- Nunca fez nenhuma atividade e ja tem dia liberado ha mais de 1 dia
    (
      NOT EXISTS (SELECT 1 FROM onboarding_progresso p WHERE p.colaborador_id = c.id AND p.concluido = true)
      AND EXISTS (SELECT 1 FROM onboarding_dias_liberados dl WHERE dl.colaborador_id = c.id AND dl.liberado_em < now() - interval '1 day')
    )
  );


-- ============================================================================
-- SECAO 4: RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_dias ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_dias_liberados ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores_status_log ENABLE ROW LEVEL SECURITY;

-- ── Politicas para COLABORADORES ──────────────────────────────────────────────

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

-- ── Politicas para CONVITES ───────────────────────────────────────────────────

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

-- ── Politicas para ONBOARDING_DIAS (dados publicos — todos podem ler) ─────────

CREATE POLICY onboarding_dias_select ON onboarding_dias
  FOR SELECT USING (true);

-- ── Politicas para ONBOARDING_ATIVIDADES (dados publicos — todos podem ler) ───

CREATE POLICY onboarding_atividades_select ON onboarding_atividades
  FOR SELECT USING (true);

-- ── Politicas para ONBOARDING_PROGRESSO ───────────────────────────────────────

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

-- ── Politicas para ONBOARDING_DIAS_LIBERADOS ──────────────────────────────────

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

-- ── Politicas para ONBOARDING_CHECKINS ────────────────────────────────────────

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

-- Admin e gestor podem inserir e atualizar check-ins
CREATE POLICY checkins_insert_admin ON onboarding_checkins
  FOR INSERT WITH CHECK (
    get_perfil_acesso() IN ('admin', 'gestor')
  );

CREATE POLICY checkins_update_admin ON onboarding_checkins
  FOR UPDATE USING (
    get_perfil_acesso() IN ('admin', 'gestor')
    OR responsavel_id = get_colaborador_id()
  );

-- ── Politicas para ONBOARDING_NOTIFICACOES ────────────────────────────────────

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

-- ── Politicas para COLABORADORES_STATUS_LOG ───────────────────────────────────

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
-- SECAO 5: PG_CRON JOBS
-- ============================================================================
-- NOTA: pg_cron precisa estar habilitado no Supabase (Extensions > pg_cron)
-- Os jobs chamam Edge Functions via pg_net (HTTP requests)
-- Ajuste a URL do projeto conforme necessario

-- Habilitar extensao pg_cron (se nao estiver habilitada)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Job 1: Liberar dia 1 — todo dia util as 08h (America/Sao_Paulo)
-- Chama Edge Function fn_liberar_dia_1
/*
SELECT cron.schedule(
  'liberar-dia-1',
  '0 8 * * 1-5', -- Segunda a sexta as 08h UTC-3
  $$
  SELECT net.http_post(
    url := 'https://olnndpultyllyhzxuyxh.supabase.co/functions/v1/fn_liberar_dia_1',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Job 2: Verificar inatividade — todo dia util as 10h
SELECT cron.schedule(
  'verificar-inatividade',
  '0 10 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://olnndpultyllyhzxuyxh.supabase.co/functions/v1/fn_verificar_inatividade',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Job 3: Email dia anterior — todo dia util as 18h
SELECT cron.schedule(
  'email-dia-anterior',
  '0 18 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://olnndpultyllyhzxuyxh.supabase.co/functions/v1/fn_email_dia_anterior',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
*/


-- ============================================================================
-- SECAO 6: SEED DATA — DIAS E ATIVIDADES DE ONBOARDING
-- ============================================================================

-- ── ONBOARDING COMPLETO (10 dias uteis — novos colaboradores) ─────────────────

-- Dia 1: Chegada
INSERT INTO onboarding_dias (numero, titulo, tema, carga, tipo_onboarding, tem_checkin_humano, duracao_checkin_min)
VALUES (1, 'Chegada', 'Boas-vindas e primeiros passos', 'leve', 'completo', true, 15);

INSERT INTO onboarding_atividades (dia_id, ordem, titulo, descricao, tipo, url_conteudo, tempo_estimado_min, obrigatorio)
VALUES
  ((SELECT id FROM onboarding_dias WHERE numero = 1 AND tipo_onboarding = 'completo'), 1, 'Video de boas-vindas', 'Assista ao video de boas-vindas dos socios da TBO', 'video', NULL, 5, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 1 AND tipo_onboarding = 'completo'), 2, 'Criar seu perfil', 'Preencha seus dados pessoais e profissionais no sistema', 'formulario', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 1 AND tipo_onboarding = 'completo'), 3, 'Conhecer o organograma', 'Conhea a estrutura organizacional da TBO e as unidades de negocio', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 1 AND tipo_onboarding = 'completo'), 4, 'Conhecer seu buddy', 'Seu buddy e seu ponto de apoio durante o onboarding. Agende um cafe virtual!', 'tarefa', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 1 AND tipo_onboarding = 'completo'), 5, 'Tarefa: apresentacao pessoal', 'Escreva uma breve apresentacao sobre voce para compartilhar com a equipe', 'tarefa', NULL, 15, true);

-- Dia 2: Cultura e Identidade
INSERT INTO onboarding_dias (numero, titulo, tema, carga, tipo_onboarding)
VALUES (2, 'Cultura e Identidade', 'Quem somos e como nos posicionamos', 'leve', 'completo');

INSERT INTO onboarding_atividades (dia_id, ordem, titulo, descricao, tipo, url_conteudo, tempo_estimado_min, obrigatorio)
VALUES
  ((SELECT id FROM onboarding_dias WHERE numero = 2 AND tipo_onboarding = 'completo'), 1, 'Historia da TBO', 'Conhea a trajetoria da TBO desde 2019 ate hoje', 'documento', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 2 AND tipo_onboarding = 'completo'), 2, 'Codigo de conduta', 'Leia e aceite o codigo de conduta da TBO', 'aceite', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 2 AND tipo_onboarding = 'completo'), 3, 'Guia de identidade visual', 'Entenda a marca TBO: cores, tipografia, tom de voz', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 2 AND tipo_onboarding = 'completo'), 4, 'Glossario TBO', 'Termos e jargoes usados no dia a dia do studio', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 2 AND tipo_onboarding = 'completo'), 5, 'Tarefa: analise de portfolio', 'Escolha 3 projetos do portfolio e escreva o que mais chamou sua atencao', 'tarefa', NULL, 20, true);

-- Dia 3: O Mercado
INSERT INTO onboarding_dias (numero, titulo, tema, carga, tipo_onboarding)
VALUES (3, 'O Mercado', 'Entendendo o mercado imobiliario', 'media', 'completo');

INSERT INTO onboarding_atividades (dia_id, ordem, titulo, descricao, tipo, url_conteudo, tempo_estimado_min, obrigatorio)
VALUES
  ((SELECT id FROM onboarding_dias WHERE numero = 3 AND tipo_onboarding = 'completo'), 1, 'Como funciona um lancamento imobiliario', 'Entenda o ciclo completo de um lancamento — do terreno a entrega', 'documento', NULL, 20, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 3 AND tipo_onboarding = 'completo'), 2, 'Video: marketing imobiliario', 'Como o marketing impulsiona vendas no mercado imobiliario', 'video', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 3 AND tipo_onboarding = 'completo'), 3, 'Jornada do comprador de imovel', 'Do desejo a escritura: entenda cada etapa da decisao de compra', 'documento', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 3 AND tipo_onboarding = 'completo'), 4, 'Case Porto Batel', 'Estudo de caso completo: como a TBO atingiu ROAS de 173.9x', 'documento', NULL, 20, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 3 AND tipo_onboarding = 'completo'), 5, 'Tarefa: pesquisa de mercado', 'Pesquise 3 lancamentos imobiliarios recentes em Curitiba e analise os materiais visuais', 'tarefa', NULL, 30, true);

-- Dia 4: Como a TBO Trabalha
INSERT INTO onboarding_dias (numero, titulo, tema, carga, tipo_onboarding, tem_checkin_humano, duracao_checkin_min)
VALUES (4, 'Como a TBO Trabalha', 'Processos e fluxos internos', 'media', 'completo', true, 20);

INSERT INTO onboarding_atividades (dia_id, ordem, titulo, descricao, tipo, url_conteudo, tempo_estimado_min, obrigatorio)
VALUES
  ((SELECT id FROM onboarding_dias WHERE numero = 4 AND tipo_onboarding = 'completo'), 1, 'Fluxo de projetos TBO', 'Do briefing a entrega: entenda cada etapa do nosso fluxo', 'documento', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 4 AND tipo_onboarding = 'completo'), 2, 'SOP: Abertura de projeto', 'Procedimento padrao para abrir um novo projeto no sistema', 'sop', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 4 AND tipo_onboarding = 'completo'), 3, 'SOP: Briefing', 'Como conduzir e documentar um briefing com o cliente', 'sop', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 4 AND tipo_onboarding = 'completo'), 4, 'SOP: Comunicacao com cliente', 'Regras e boas praticas de comunicacao com clientes', 'sop', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 4 AND tipo_onboarding = 'completo'), 5, 'SOP: Reuniao interna', 'Como conduzir e documentar reunioes internas', 'sop', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 4 AND tipo_onboarding = 'completo'), 6, 'Tarefa: observacao de reuniao', 'Participe como observador de uma reuniao interna e registre 3 aprendizados', 'tarefa', NULL, 30, true);

-- Dia 5: Ferramentas e Acessos
INSERT INTO onboarding_dias (numero, titulo, tema, carga, tipo_onboarding)
VALUES (5, 'Ferramentas e Acessos', 'Ferramentas do dia a dia', 'media', 'completo');

INSERT INTO onboarding_atividades (dia_id, ordem, titulo, descricao, tipo, url_conteudo, tempo_estimado_min, obrigatorio)
VALUES
  ((SELECT id FROM onboarding_dias WHERE numero = 5 AND tipo_onboarding = 'completo'), 1, 'Tour pelo TBO OS', 'Video guiado pelo sistema operacional interno da TBO', 'video', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 5 AND tipo_onboarding = 'completo'), 2, 'Ferramentas e acessos', 'Lista de todas as ferramentas que voce usara e como solicitar acesso', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 5 AND tipo_onboarding = 'completo'), 3, 'Politica de comunicacao interna', 'Canais oficiais, horarios, e etiqueta de comunicacao', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 5 AND tipo_onboarding = 'completo'), 4, 'Politica de equipamentos', 'Uso e manutencao de equipamentos fornecidos pela TBO', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 5 AND tipo_onboarding = 'completo'), 5, 'Estrutura de pastas', 'Como os arquivos sao organizados no Google Drive da TBO', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 5 AND tipo_onboarding = 'completo'), 6, 'Como registrar horas', 'Tutorial de registro de horas no TBO OS (timesheet)', 'video', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 5 AND tipo_onboarding = 'completo'), 7, 'Tarefa: pratica no sistema', 'Crie uma tarefa ficticia, registre 1h de trabalho e acompanhe um projeto', 'tarefa', NULL, 20, true);

-- Dia 6: Producao Tecnica pt.1
INSERT INTO onboarding_dias (numero, titulo, tema, carga, tipo_onboarding)
VALUES (6, 'Producao Tecnica pt.1', 'Fundamentos de producao 3D', 'alta', 'completo');

INSERT INTO onboarding_atividades (dia_id, ordem, titulo, descricao, tipo, url_conteudo, tempo_estimado_min, obrigatorio)
VALUES
  ((SELECT id FROM onboarding_dias WHERE numero = 6 AND tipo_onboarding = 'completo'), 1, 'SOP: Render Still', 'Procedimento padrao para producao de imagens 3D estáticas', 'sop', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 6 AND tipo_onboarding = 'completo'), 2, 'Video: Camera padrao TBO', 'Configuracoes de camera padrao para renders arquitetonicos', 'video', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 6 AND tipo_onboarding = 'completo'), 3, 'Video: Iluminacao padrao TBO', 'Setup de iluminacao padrao para cenas externas e internas', 'video', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 6 AND tipo_onboarding = 'completo'), 4, 'Nomenclatura de arquivos', 'Convencao de nomes para arquivos de cena, texturas e renders', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 6 AND tipo_onboarding = 'completo'), 5, 'Checklist de QA', 'Lista de verificacao obrigatoria antes de enviar qualquer render', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 6 AND tipo_onboarding = 'completo'), 6, 'Tarefa: setup de cena', 'Monte uma cena basica seguindo os padroes da TBO e envie para revisao', 'tarefa', NULL, 45, true);

-- Dia 7: Producao Tecnica pt.2
INSERT INTO onboarding_dias (numero, titulo, tema, carga, tipo_onboarding, tem_checkin_humano, duracao_checkin_min)
VALUES (7, 'Producao Tecnica pt.2', 'Producao avancada e pos-producao', 'alta', 'completo', true, 30);

INSERT INTO onboarding_atividades (dia_id, ordem, titulo, descricao, tipo, url_conteudo, tempo_estimado_min, obrigatorio)
VALUES
  ((SELECT id FROM onboarding_dias WHERE numero = 7 AND tipo_onboarding = 'completo'), 1, 'Video: Setup de materiais', 'Como configurar materiais realistas no V-Ray', 'video', NULL, 20, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 7 AND tipo_onboarding = 'completo'), 2, 'Fluxo de render', 'Do setup ao render final: configuracoes de qualidade e otimizacao', 'documento', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 7 AND tipo_onboarding = 'completo'), 3, 'Video: Compositing', 'Pos-producao de renders no Photoshop — padrao TBO', 'video', NULL, 20, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 7 AND tipo_onboarding = 'completo'), 4, 'SOP: Revisao de render', 'Processo de revisao interna antes de enviar ao cliente', 'sop', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 7 AND tipo_onboarding = 'completo'), 5, 'Erros comuns', 'Os 10 erros mais comuns em producao 3D e como evita-los', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 7 AND tipo_onboarding = 'completo'), 6, 'Tarefa: revisao QA', 'Analise uma imagem exemplo usando o checklist de QA e documente os problemas encontrados', 'tarefa', NULL, 30, true);

-- Dia 8: Entrega e Cliente
INSERT INTO onboarding_dias (numero, titulo, tema, carga, tipo_onboarding)
VALUES (8, 'Entrega e Cliente', 'Gestao de entregas e relacionamento', 'alta', 'completo');

INSERT INTO onboarding_atividades (dia_id, ordem, titulo, descricao, tipo, url_conteudo, tempo_estimado_min, obrigatorio)
VALUES
  ((SELECT id FROM onboarding_dias WHERE numero = 8 AND tipo_onboarding = 'completo'), 1, 'SOP: Gestao de revisoes', 'Como gerenciar rodadas de revisao com o cliente', 'sop', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 8 AND tipo_onboarding = 'completo'), 2, 'SOP: Entrega ao cliente', 'Processo de entrega final — formatos, resolucoes, organizacao', 'sop', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 8 AND tipo_onboarding = 'completo'), 3, 'Video: Feedback de cliente', 'Como receber e processar feedback de forma profissional', 'video', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 8 AND tipo_onboarding = 'completo'), 4, 'Video: Cliente insatisfeito', 'Como lidar com situacoes de insatisfacao e transformar em oportunidade', 'video', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 8 AND tipo_onboarding = 'completo'), 5, 'SOP: Atualizacao de status', 'Como manter o status dos projetos atualizado no TBO OS', 'sop', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 8 AND tipo_onboarding = 'completo'), 6, 'Como registrar um erro', 'Processo para reportar e documentar erros em producao', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 8 AND tipo_onboarding = 'completo'), 7, 'Tarefa: simulacao de entrega', 'Simule o processo completo de entrega de um projeto ficticio', 'tarefa', NULL, 30, true);

-- Dia 9: Soft Skills
INSERT INTO onboarding_dias (numero, titulo, tema, carga, tipo_onboarding)
VALUES (9, 'Soft Skills', 'Comunicacao e desenvolvimento pessoal', 'media', 'completo');

INSERT INTO onboarding_atividades (dia_id, ordem, titulo, descricao, tipo, url_conteudo, tempo_estimado_min, obrigatorio)
VALUES
  ((SELECT id FROM onboarding_dias WHERE numero = 9 AND tipo_onboarding = 'completo'), 1, 'Video: Cultura de feedback TBO', 'Como damos e recebemos feedback na TBO', 'video', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 9 AND tipo_onboarding = 'completo'), 2, 'Guia de comunicacao escrita', 'Boas praticas para e-mails, mensagens e documentacao', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 9 AND tipo_onboarding = 'completo'), 3, 'Guia de 1:1', 'Como aproveitar ao maximo suas reunioes 1:1 com o gestor', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 9 AND tipo_onboarding = 'completo'), 4, 'Video: Priorizacao de tarefas', 'Tecnicas para priorizar demandas concorrentes', 'video', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 9 AND tipo_onboarding = 'completo'), 5, 'Como criar uma pauta de reuniao', 'Template e boas praticas para pautas eficientes', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 9 AND tipo_onboarding = 'completo'), 6, 'Case Portofino', 'Estudo de caso: gestao de projeto complexo com multiplas entregas', 'documento', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 9 AND tipo_onboarding = 'completo'), 7, 'Tarefa: relatorio de progresso', 'Escreva um relatorio de progresso do seu onboarding ate aqui — o que aprendeu, duvidas, sugestoes', 'tarefa', NULL, 20, true);

-- Dia 10: Consolidacao
INSERT INTO onboarding_dias (numero, titulo, tema, carga, tipo_onboarding, tem_checkin_humano, duracao_checkin_min)
VALUES (10, 'Consolidacao', 'Revisao final e lancamento', 'leve', 'completo', true, 30);

INSERT INTO onboarding_atividades (dia_id, ordem, titulo, descricao, tipo, url_conteudo, tempo_estimado_min, acao_conclusao, score_minimo, obrigatorio)
VALUES
  ((SELECT id FROM onboarding_dias WHERE numero = 10 AND tipo_onboarding = 'completo'), 1, 'Checklist dos primeiros 30 dias', 'Revise e aceite o plano de acao para seus primeiros 30 dias na TBO', 'aceite', NULL, 15, NULL, NULL, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 10 AND tipo_onboarding = 'completo'), 2, 'Perguntas frequentes', 'Respostas para as duvidas mais comuns de novos colaboradores', 'documento', NULL, 10, NULL, NULL, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 10 AND tipo_onboarding = 'completo'), 3, 'Quiz final', 'Teste seus conhecimentos sobre a TBO — 20 perguntas', 'quiz', NULL, 20, 'salvar_score', 60, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 10 AND tipo_onboarding = 'completo'), 4, 'Avaliacao do onboarding', 'Avalie sua experiencia de onboarding e nos ajude a melhorar', 'formulario', NULL, 10, NULL, NULL, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 10 AND tipo_onboarding = 'completo'), 5, 'Conclusao do onboarding', 'Parabens! Clique para concluir seu onboarding e comecar a trabalhar!', 'aceite', NULL, 2, 'concluir_onboarding', NULL, true);


-- ── ONBOARDING REDUZIDO (3 dias — usuarios existentes) ────────────────────────

-- Dia 1: Tour pela Plataforma
INSERT INTO onboarding_dias (numero, titulo, tema, carga, tipo_onboarding)
VALUES (1, 'Tour pela Plataforma', 'Conhecendo o TBO OS', 'leve', 'reduzido');

INSERT INTO onboarding_atividades (dia_id, ordem, titulo, descricao, tipo, url_conteudo, tempo_estimado_min, obrigatorio)
VALUES
  ((SELECT id FROM onboarding_dias WHERE numero = 1 AND tipo_onboarding = 'reduzido'), 1, 'Video: Tour pelo TBO OS', 'Conheca todas as funcionalidades do novo sistema', 'video', NULL, 15, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 1 AND tipo_onboarding = 'reduzido'), 2, 'Como registrar horas', 'Tutorial de registro de horas no novo sistema', 'video', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 1 AND tipo_onboarding = 'reduzido'), 3, 'Como acompanhar projetos', 'Tutorial de acompanhamento de projetos e entregas', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 1 AND tipo_onboarding = 'reduzido'), 4, 'Tarefa: pratica no sistema', 'Crie uma tarefa ficticia, registre 1h de trabalho e navegue pelos modulos', 'tarefa', NULL, 15, true);

-- Dia 2: Processos Atualizados
INSERT INTO onboarding_dias (numero, titulo, tema, carga, tipo_onboarding)
VALUES (2, 'Processos Atualizados', 'Novos processos e padroes', 'media', 'reduzido');

INSERT INTO onboarding_atividades (dia_id, ordem, titulo, descricao, tipo, url_conteudo, tempo_estimado_min, obrigatorio)
VALUES
  ((SELECT id FROM onboarding_dias WHERE numero = 2 AND tipo_onboarding = 'reduzido'), 1, 'SOP: Abertura de projeto (atualizado)', 'Novo processo de abertura de projetos no TBO OS', 'sop', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 2 AND tipo_onboarding = 'reduzido'), 2, 'SOP: Comunicacao interna', 'Novos canais e politicas de comunicacao', 'sop', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 2 AND tipo_onboarding = 'reduzido'), 3, 'Estrutura de pastas', 'Nova organizacao de arquivos no Google Drive', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 2 AND tipo_onboarding = 'reduzido'), 4, 'Checklist de QA (atualizado)', 'Nova lista de verificacao para entregas', 'documento', NULL, 10, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 2 AND tipo_onboarding = 'reduzido'), 5, 'Tarefa: simulacao de entrega', 'Simule o processo de entrega usando os novos padroes', 'tarefa', NULL, 20, true);

-- Dia 3: Confirmacao
INSERT INTO onboarding_dias (numero, titulo, tema, carga, tipo_onboarding)
VALUES (3, 'Confirmacao', 'Validacao e conclusao', 'leve', 'reduzido');

INSERT INTO onboarding_atividades (dia_id, ordem, titulo, descricao, tipo, url_conteudo, tempo_estimado_min, acao_conclusao, score_minimo, obrigatorio)
VALUES
  ((SELECT id FROM onboarding_dias WHERE numero = 3 AND tipo_onboarding = 'reduzido'), 1, 'Perguntas frequentes', 'Respostas sobre a nova plataforma e processos atualizados', 'documento', NULL, 10, NULL, NULL, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 3 AND tipo_onboarding = 'reduzido'), 2, 'Quiz rapido', 'Teste seus conhecimentos sobre os novos processos — 10 perguntas', 'quiz', NULL, 10, 'salvar_score', 60, true),
  ((SELECT id FROM onboarding_dias WHERE numero = 3 AND tipo_onboarding = 'reduzido'), 3, 'Confirmacao de conclusao', 'Confirme que esta pronto para usar a nova plataforma', 'aceite', NULL, 2, 'concluir_onboarding', NULL, true);


-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
