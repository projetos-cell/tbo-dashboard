-- 017: Create unified clients + client_interactions tables
-- Sources: Omie (finance_clients), RD Station (CRM API), manual

-- ── clients ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clients (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name                TEXT NOT NULL,             -- razao_social or display name
  trading_name        TEXT,                      -- nome fantasia
  cnpj                TEXT,

  -- Contact
  contact_name        TEXT,
  email               TEXT,
  phone               TEXT,

  -- Address
  address             TEXT,
  city                TEXT,
  state               TEXT,

  -- Classification
  status              TEXT NOT NULL DEFAULT 'lead'
                      CHECK (status IN ('lead','prospect','ativo','vip','inativo')),
  segment             TEXT,

  -- CRM
  sales_owner         TEXT,
  relationship_status TEXT,
  next_action         TEXT,
  next_action_date    DATE,

  -- Source tracking (dedup keys)
  source              TEXT DEFAULT 'manual'
                      CHECK (source IN ('omie','rdstation','manual','merged')),
  omie_id             TEXT,
  rd_id               TEXT,

  -- Meta
  logo_url            TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partial unique indexes for source dedup
CREATE UNIQUE INDEX IF NOT EXISTS clients_tenant_omie_id_uniq
  ON clients (tenant_id, omie_id) WHERE omie_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS clients_tenant_rd_id_uniq
  ON clients (tenant_id, rd_id) WHERE rd_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS clients_tenant_status_idx
  ON clients (tenant_id, status);

CREATE INDEX IF NOT EXISTS clients_tenant_name_idx
  ON clients (tenant_id, name);

-- ── client_interactions ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS client_interactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('email','reuniao','call','whatsapp','presencial')),
  date        TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_interactions_client_idx
  ON client_interactions (client_id, date DESC);

-- ── Add client_id FK to projects ────────────────────────────────────────────────

ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);

CREATE INDEX IF NOT EXISTS projects_client_id_idx ON projects (client_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────────

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_interactions ENABLE ROW LEVEL SECURITY;

-- clients policies
CREATE POLICY clients_select ON clients FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
);

CREATE POLICY clients_insert ON clients FOR INSERT WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
);

CREATE POLICY clients_update ON clients FOR UPDATE USING (
  tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
);

CREATE POLICY clients_delete ON clients FOR DELETE USING (
  tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
);

-- client_interactions policies
CREATE POLICY ci_select ON client_interactions FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
);

CREATE POLICY ci_insert ON client_interactions FOR INSERT WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
);

CREATE POLICY ci_update ON client_interactions FOR UPDATE USING (
  tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
);

CREATE POLICY ci_delete ON client_interactions FOR DELETE USING (
  tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
);
