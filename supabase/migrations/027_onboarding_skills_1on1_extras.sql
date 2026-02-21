-- ============================================================================
-- TBO OS — Migration 027: Extras para 1:1s, Onboarding/Offboarding, Skills
-- Módulo Pessoas — Fases C, F, G do roadmap
-- Idempotente: seguro re-executar.
-- ============================================================================

-- ============================================================================
-- 1. Campos extras em one_on_ones (Fase C: Google Calendar + Recorrência)
-- ============================================================================

ALTER TABLE one_on_ones ADD COLUMN IF NOT EXISTS google_event_id TEXT;
ALTER TABLE one_on_ones ADD COLUMN IF NOT EXISTS recurrence TEXT;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_1on1_recurrence'
  ) THEN
    ALTER TABLE one_on_ones ADD CONSTRAINT chk_1on1_recurrence
      CHECK (recurrence IS NULL OR recurrence IN ('weekly', 'biweekly', 'monthly'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_1on1_google_event ON one_on_ones(google_event_id) WHERE google_event_id IS NOT NULL;

-- ============================================================================
-- 2. Campos extras em profiles (Fase F: Offboarding)
-- ============================================================================

-- Nota: profiles pode ser 'colaboradores' dependendo do schema
-- Tentamos em ambos para compatibilidade
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS exit_date DATE;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS exit_reason TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS exit_interview JSONB;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'colaboradores' AND table_schema = 'public') THEN
    ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS exit_date DATE;
    ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS exit_reason TEXT;
    ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS exit_interview JSONB;
  END IF;
END $$;

-- ============================================================================
-- 3. Tabela onboarding_templates (Fase F)
-- ============================================================================

CREATE TABLE IF NOT EXISTS onboarding_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  name        TEXT NOT NULL,
  steps       JSONB NOT NULL DEFAULT '[]',
  is_default  BOOLEAN DEFAULT false,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_onb_template_type'
  ) THEN
    ALTER TABLE onboarding_templates ADD CONSTRAINT chk_onb_template_type
      CHECK (type IN ('onboarding', 'offboarding'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_onb_templates_tenant ON onboarding_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_onb_templates_type   ON onboarding_templates(type);

-- RLS
ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'onb_templates_select' AND tablename = 'onboarding_templates') THEN
    CREATE POLICY onb_templates_select ON onboarding_templates
      FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'onb_templates_insert' AND tablename = 'onboarding_templates') THEN
    CREATE POLICY onb_templates_insert ON onboarding_templates
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid()
            AND tm.tenant_id = onboarding_templates.tenant_id
            AND r.name IN ('owner', 'admin', 'project_owner')
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'onb_templates_update' AND tablename = 'onboarding_templates') THEN
    CREATE POLICY onb_templates_update ON onboarding_templates
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid()
            AND tm.tenant_id = onboarding_templates.tenant_id
            AND r.name IN ('owner', 'admin')
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 4. Tabela person_skills (Fase G)
-- ============================================================================

CREATE TABLE IF NOT EXISTS person_skills (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  person_id         UUID NOT NULL,
  skill_name        TEXT NOT NULL,
  category          TEXT,
  proficiency_level INT DEFAULT 1,
  verified_by       UUID REFERENCES auth.users(id),
  verified_at       TIMESTAMPTZ,
  certification_name  TEXT,
  certification_expiry DATE,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_skill_level'
  ) THEN
    ALTER TABLE person_skills ADD CONSTRAINT chk_skill_level
      CHECK (proficiency_level BETWEEN 1 AND 5);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_skills_tenant  ON person_skills(tenant_id);
CREATE INDEX IF NOT EXISTS idx_skills_person  ON person_skills(person_id);
CREATE INDEX IF NOT EXISTS idx_skills_name    ON person_skills(skill_name);

-- RLS
ALTER TABLE person_skills ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'skills_select' AND tablename = 'person_skills') THEN
    CREATE POLICY skills_select ON person_skills
      FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'skills_insert' AND tablename = 'person_skills') THEN
    CREATE POLICY skills_insert ON person_skills
      FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'skills_update' AND tablename = 'person_skills') THEN
    CREATE POLICY skills_update ON person_skills
      FOR UPDATE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'skills_delete' AND tablename = 'person_skills') THEN
    CREATE POLICY skills_delete ON person_skills
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid()
            AND tm.tenant_id = person_skills.tenant_id
            AND r.name IN ('owner', 'admin')
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 5. Seed: Templates default de Onboarding e Offboarding
-- ============================================================================

INSERT INTO onboarding_templates (tenant_id, type, name, is_default, steps)
SELECT
  t.id,
  'onboarding',
  'Template Padrão de Onboarding',
  true,
  '[
    {"order": 1, "title": "Assinatura de Contrato", "description": "Enviar e coletar contrato PJ/CLT assinado", "default_role": "rh", "category": "documentacao"},
    {"order": 2, "title": "Setup de Equipamento", "description": "Notebook, monitor, perifericos configurados", "default_role": "ti", "category": "infraestrutura"},
    {"order": 3, "title": "Acesso aos Sistemas", "description": "Email, Slack, TBO OS, Google Drive, ferramentas da area", "default_role": "ti", "category": "infraestrutura"},
    {"order": 4, "title": "Apresentacao ao Time", "description": "Reuniao de boas-vindas com a equipe da BU", "default_role": "lider", "category": "integracao"},
    {"order": 5, "title": "Treinamento Inicial", "description": "Processos internos, cultura TBO, ferramentas", "default_role": "lider", "category": "treinamento"},
    {"order": 6, "title": "Primeira 1:1 com Gestor", "description": "Alinhar expectativas, PDI inicial e metas", "default_role": "lider", "category": "gestao"},
    {"order": 7, "title": "Quiz de Cultura", "description": "Completar quiz sobre valores e cultura TBO", "default_role": "colaborador", "category": "cultura"},
    {"order": 8, "title": "Primeiro Feedback", "description": "Dar ou receber primeiro feedback na plataforma", "default_role": "colaborador", "category": "cultura"}
  ]'::jsonb
FROM tenants t
WHERE t.slug = 'tbo'
ON CONFLICT DO NOTHING;

INSERT INTO onboarding_templates (tenant_id, type, name, is_default, steps)
SELECT
  t.id,
  'offboarding',
  'Template Padrão de Offboarding',
  true,
  '[
    {"order": 1, "title": "Comunicacao de Desligamento", "description": "Conversa formal sobre encerramento do contrato", "default_role": "lider", "category": "comunicacao"},
    {"order": 2, "title": "Entrevista de Saida", "description": "Formulario com motivo, feedback e recomendacoes", "default_role": "rh", "category": "documentacao"},
    {"order": 3, "title": "Transferencia de Conhecimento", "description": "Documentar processos, senhas e acessos criticos", "default_role": "colaborador", "category": "transicao"},
    {"order": 4, "title": "Reatribuicao de Projetos", "description": "Transferir projetos e tarefas para outros membros", "default_role": "lider", "category": "transicao"},
    {"order": 5, "title": "Revogacao de Acessos", "description": "Remover acesso a email, Slack, sistemas, repositorios", "default_role": "ti", "category": "infraestrutura"},
    {"order": 6, "title": "Devolucao de Equipamento", "description": "Recolher notebook, monitor e perifericos", "default_role": "ti", "category": "infraestrutura"},
    {"order": 7, "title": "Encerramento de Contrato", "description": "Distrato assinado, ultimo pagamento processado", "default_role": "rh", "category": "documentacao"},
    {"order": 8, "title": "Registro Final", "description": "Atualizar status para desligado, registrar data de saida", "default_role": "rh", "category": "finalizacao"}
  ]'::jsonb
FROM tenants t
WHERE t.slug = 'tbo'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. Audit triggers
-- ============================================================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_audit_trigger') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_onb_templates') THEN
      EXECUTE 'CREATE TRIGGER trg_audit_onb_templates AFTER INSERT OR UPDATE OR DELETE ON onboarding_templates FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_person_skills') THEN
      EXECUTE 'CREATE TRIGGER trg_audit_person_skills AFTER INSERT OR UPDATE OR DELETE ON person_skills FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- FIM da Migration 027
-- ============================================================================
