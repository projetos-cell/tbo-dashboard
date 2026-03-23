-- ============================================================
-- Pesquisa de Clima - TBO OS
-- Tabelas para pesquisa anônima com link único por e-mail
-- ============================================================

-- 1. Edições de pesquisa (4ª Pesquisa de Clima, etc.)
CREATE TABLE IF NOT EXISTS climate_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  title TEXT NOT NULL,
  description TEXT,
  edition INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closes_at TIMESTAMPTZ,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 2. Tokens únicos por pessoa/pesquisa
CREATE TABLE IF NOT EXISTS climate_survey_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES climate_surveys(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(survey_id, email)
);

-- 3. Respostas anônimas (SEM vínculo com token/email)
CREATE TABLE IF NOT EXISTS climate_survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES climate_surveys(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_climate_tokens_token ON climate_survey_tokens(token);
CREATE INDEX IF NOT EXISTS idx_climate_tokens_survey ON climate_survey_tokens(survey_id);
CREATE INDEX IF NOT EXISTS idx_climate_responses_survey ON climate_survey_responses(survey_id);

-- RLS
ALTER TABLE climate_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE climate_survey_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE climate_survey_responses ENABLE ROW LEVEL SECURITY;

-- Policies: service role pode tudo (formulário público usa service client)
-- Admin (founder/diretoria) pode ver surveys e resultados
CREATE POLICY "service_all_climate_surveys" ON climate_surveys FOR ALL USING (true);
CREATE POLICY "service_all_climate_tokens" ON climate_survey_tokens FOR ALL USING (true);
CREATE POLICY "service_all_climate_responses" ON climate_survey_responses FOR ALL USING (true);
