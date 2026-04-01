-- Project Deliveries: portal publico curado para entrega de arquivos ao cliente
CREATE TABLE IF NOT EXISTS project_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,

  token text NOT NULL UNIQUE,

  title text NOT NULL,
  description text,
  client_name text,
  client_company text,
  project_name text,
  delivered_by text,
  delivery_date date DEFAULT CURRENT_DATE,

  deliverables jsonb NOT NULL DEFAULT '[]'::jsonb,

  hero_subtitle text,
  hero_gradient_from text DEFAULT '#0a0a0a',
  hero_gradient_to text DEFAULT '#1a1a2e',
  accent_color text DEFAULT '#ff6200',

  cover_image_url text,

  access_count integer NOT NULL DEFAULT 0,
  first_accessed_at timestamptz,
  last_accessed_at timestamptz,

  is_active boolean NOT NULL DEFAULT true,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS project_deliveries_token_idx
  ON project_deliveries (token);

CREATE INDEX IF NOT EXISTS project_deliveries_tenant_idx
  ON project_deliveries (tenant_id, created_at DESC);

ALTER TABLE project_deliveries ENABLE ROW LEVEL SECURITY;

-- Leitura publica por token (sem auth)
CREATE POLICY "project_deliveries_public_read" ON project_deliveries
  FOR SELECT USING (is_active = true);

-- Gerenciamento por tenant (auth)
CREATE POLICY "project_deliveries_tenant_manage" ON project_deliveries
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );
