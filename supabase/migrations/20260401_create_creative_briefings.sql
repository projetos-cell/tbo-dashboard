-- Creative Briefings: formulários públicos preenchidos por clientes
-- URL pattern: /briefing/{slug}

CREATE TABLE IF NOT EXISTS creative_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),

  -- Identificação do cliente / projeto
  slug text NOT NULL,                    -- ex: "bacoccini"
  client_name text NOT NULL,             -- ex: "Bacoccini"
  project_slug text,                     -- ex: "empreendimento-bacoccini"
  project_name text,                     -- ex: "Empreendimento Bacoccini"

  -- Link para projeto interno (opcional)
  project_id uuid REFERENCES os_projects(id),

  -- Status do briefing
  status text NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho', 'enviado', 'em_analise', 'aprovado')),

  -- Dados do formulário (JSONB flexível)
  form_data jsonb NOT NULL DEFAULT '{}',

  -- Controle de acesso
  is_active boolean NOT NULL DEFAULT true,

  -- Timestamps
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para busca por slug (único por tenant + slug + project_slug)
CREATE UNIQUE INDEX IF NOT EXISTS creative_briefings_slug_idx
  ON creative_briefings (tenant_id, slug, COALESCE(project_slug, ''));

-- Índice para listagem por status
CREATE INDEX IF NOT EXISTS creative_briefings_status_idx
  ON creative_briefings (tenant_id, status);

-- RLS
ALTER TABLE creative_briefings ENABLE ROW LEVEL SECURITY;

-- Leitura: membros do tenant
CREATE POLICY "creative_briefings_select" ON creative_briefings
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Insert/Update: sem auth (público via service role) + membros do tenant
CREATE POLICY "creative_briefings_insert" ON creative_briefings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "creative_briefings_update" ON creative_briefings
  FOR UPDATE USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );
