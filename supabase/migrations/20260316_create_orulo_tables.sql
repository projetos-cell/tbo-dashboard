-- ---------------------------------------------------------------------------
-- Migration: Órulo API Integration Tables
-- ---------------------------------------------------------------------------
-- Armazena empreendimentos, tipologias e log de sincronização da API Órulo.
-- Usado pelo módulo Inteligência de Mercado.
-- ---------------------------------------------------------------------------

-- ── orulo_buildings ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orulo_buildings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  orulo_id      text NOT NULL,

  -- Dados básicos
  name          text,
  status        text,
  stage         text,
  finality      text,
  type          text,
  description   text,

  -- Endereço
  street_type   text,
  street        text,
  address_number integer,
  area          text,        -- bairro
  city          text,
  state         text,
  zip_code      text,
  latitude      double precision,
  longitude     double precision,

  -- Preços
  min_price     numeric(14,2),
  price_per_m2  numeric(14,2),

  -- Specs
  min_area      numeric(10,2),
  max_area      numeric(10,2),
  min_bedrooms  smallint,
  max_bedrooms  smallint,
  min_suites    smallint,
  max_suites    smallint,
  min_parking   smallint,
  max_parking   smallint,
  min_bathrooms smallint,
  max_bathrooms smallint,
  total_units   integer,
  stock         integer,
  number_of_floors  smallint,
  number_of_towers  smallint,
  apts_per_floor    smallint,
  total_area    numeric(12,2),
  floor_area    numeric(12,2),

  -- Developer / Publisher
  developer_id    text,
  developer_name  text,
  publisher_id    text,
  publisher_name  text,

  -- URLs & media
  orulo_url         text,
  default_image_url text,
  webpage           text,
  virtual_tour      text,

  -- JSONB fields
  building_features   jsonb DEFAULT '[]'::jsonb,
  unit_features       jsonb DEFAULT '[]'::jsonb,
  opportunity         jsonb DEFAULT '{}'::jsonb,
  portfolio           jsonb DEFAULT '[]'::jsonb,
  payment_conditions  jsonb DEFAULT '[]'::jsonb,

  -- Dates
  launch_date       timestamptz,
  opening_date      timestamptz,
  building_permit   text,
  orulo_updated_at  timestamptz,
  orulo_created_at  timestamptz,

  -- Control
  available         boolean DEFAULT true,
  synced_at         timestamptz DEFAULT now(),
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),

  -- Unique per tenant
  UNIQUE(orulo_id, tenant_id)
);

-- Indexes para queries frequentes
CREATE INDEX IF NOT EXISTS idx_orulo_buildings_tenant ON orulo_buildings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orulo_buildings_state_city ON orulo_buildings(state, city);
CREATE INDEX IF NOT EXISTS idx_orulo_buildings_finality ON orulo_buildings(finality);
CREATE INDEX IF NOT EXISTS idx_orulo_buildings_available ON orulo_buildings(available);
CREATE INDEX IF NOT EXISTS idx_orulo_buildings_min_price ON orulo_buildings(min_price);
CREATE INDEX IF NOT EXISTS idx_orulo_buildings_orulo_updated ON orulo_buildings(orulo_updated_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER trg_orulo_buildings_updated_at
  BEFORE UPDATE ON orulo_buildings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── orulo_typologies ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orulo_typologies (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  orulo_id            text NOT NULL,
  building_orulo_id   text NOT NULL,

  type              text,
  original_price    numeric(14,2),
  discount_price    numeric(14,2),
  private_area      numeric(10,2),
  total_area        numeric(10,2),
  bedrooms          smallint,
  bathrooms         smallint,
  suites            smallint,
  parking           smallint,
  solar_position    text,
  total_units       integer,
  stock             integer,
  condominium_value numeric(10,2),
  urban_land_tax    numeric(10,2),
  rental_price      numeric(10,2),
  reference         text,
  orulo_updated_at  timestamptz,

  synced_at         timestamptz DEFAULT now(),
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),

  UNIQUE(orulo_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_orulo_typologies_tenant ON orulo_typologies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orulo_typologies_building ON orulo_typologies(building_orulo_id);

CREATE OR REPLACE TRIGGER trg_orulo_typologies_updated_at
  BEFORE UPDATE ON orulo_typologies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── orulo_sync_log ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orulo_sync_log (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  status              text NOT NULL DEFAULT 'running', -- running | success | partial | error
  started_at          timestamptz NOT NULL DEFAULT now(),
  completed_at        timestamptz,
  duration_ms         integer,
  triggered_by        uuid REFERENCES auth.users(id),
  buildings_synced    integer DEFAULT 0,
  typologies_synced   integer DEFAULT 0,
  buildings_removed   integer DEFAULT 0,
  errors              jsonb,
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orulo_sync_log_tenant ON orulo_sync_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orulo_sync_log_status ON orulo_sync_log(status);

-- ── RLS Policies ─────────────────────────────────────────────────────────────

ALTER TABLE orulo_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orulo_typologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE orulo_sync_log ENABLE ROW LEVEL SECURITY;

-- orulo_buildings: leitura por tenant, escrita apenas via service role
CREATE POLICY "orulo_buildings_select_tenant" ON orulo_buildings
  FOR SELECT USING (
    tenant_id IN (SELECT get_user_tenant_ids())
  );

CREATE POLICY "orulo_buildings_insert_tenant" ON orulo_buildings
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
  );

CREATE POLICY "orulo_buildings_update_tenant" ON orulo_buildings
  FOR UPDATE USING (
    tenant_id IN (SELECT get_user_tenant_ids())
  );

-- orulo_typologies: mesma lógica
CREATE POLICY "orulo_typologies_select_tenant" ON orulo_typologies
  FOR SELECT USING (
    tenant_id IN (SELECT get_user_tenant_ids())
  );

CREATE POLICY "orulo_typologies_insert_tenant" ON orulo_typologies
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
  );

CREATE POLICY "orulo_typologies_update_tenant" ON orulo_typologies
  FOR UPDATE USING (
    tenant_id IN (SELECT get_user_tenant_ids())
  );

-- orulo_sync_log: leitura por tenant (founder/diretoria), escrita via service
CREATE POLICY "orulo_sync_log_select_tenant" ON orulo_sync_log
  FOR SELECT USING (
    tenant_id IN (SELECT get_user_tenant_ids())
  );

CREATE POLICY "orulo_sync_log_insert_tenant" ON orulo_sync_log
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
  );

CREATE POLICY "orulo_sync_log_update_tenant" ON orulo_sync_log
  FOR UPDATE USING (
    tenant_id IN (SELECT get_user_tenant_ids())
  );
