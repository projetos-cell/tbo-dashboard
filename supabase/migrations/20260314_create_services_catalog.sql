-- ============================================================================
-- Migration: Catalogo de Servicos + Proposal Items + Historico de Precos
-- Date: 2026-03-14
-- ============================================================================

-- 1. Catalogo de Servicos
CREATE TABLE IF NOT EXISTS services (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          text NOT NULL,
  description   text,
  bu            text,                       -- Digital 3D, Branding, Marketing, Audiovisual, Interiores
  type          text NOT NULL DEFAULT 'projeto'
                CHECK (type IN ('fee_mensal', 'projeto', 'hora', 'pacote')),
  base_price    numeric(12,2) NOT NULL DEFAULT 0,
  unit          text NOT NULL DEFAULT 'unidade'
                CHECK (unit IN ('unidade', 'hora', 'mes', 'pacote', 'projeto')),
  margin_pct    numeric(5,2) DEFAULT 0,
  status        text NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'draft', 'archived')),
  sort_order    int DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid REFERENCES auth.users(id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_services_tenant ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_bu ON services(bu);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);

-- RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY services_tenant_read ON services
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY services_tenant_insert ON services
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY services_tenant_update ON services
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY services_tenant_delete ON services
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- 2. Proposal Items (itens de orcamento vinculados a proposals)
CREATE TABLE IF NOT EXISTS proposal_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id   uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  service_id    uuid REFERENCES services(id) ON DELETE SET NULL,
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  quantity      numeric(10,2) NOT NULL DEFAULT 1,
  unit_price    numeric(12,2) NOT NULL DEFAULT 0,
  discount_pct  numeric(5,2) DEFAULT 0,
  subtotal      numeric(12,2) GENERATED ALWAYS AS (
    quantity * unit_price * (1 - COALESCE(discount_pct, 0) / 100)
  ) STORED,
  sort_order    int DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposal_items_proposal ON proposal_items(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_items_service ON proposal_items(service_id);

ALTER TABLE proposal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY proposal_items_tenant_read ON proposal_items
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY proposal_items_tenant_insert ON proposal_items
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY proposal_items_tenant_update ON proposal_items
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY proposal_items_tenant_delete ON proposal_items
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- 3. Historico de precos
CREATE TABLE IF NOT EXISTS service_price_history (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id    uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  price         numeric(12,2) NOT NULL,
  margin_pct    numeric(5,2),
  effective_from timestamptz NOT NULL DEFAULT now(),
  changed_by    uuid REFERENCES auth.users(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sph_service ON service_price_history(service_id);
CREATE INDEX IF NOT EXISTS idx_sph_effective ON service_price_history(effective_from DESC);

ALTER TABLE service_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY sph_tenant_read ON service_price_history
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY sph_tenant_insert ON service_price_history
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

-- 4. Trigger: log price changes automatically
CREATE OR REPLACE FUNCTION log_service_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.base_price IS DISTINCT FROM NEW.base_price
     OR OLD.margin_pct IS DISTINCT FROM NEW.margin_pct THEN
    INSERT INTO service_price_history (service_id, tenant_id, price, margin_pct, changed_by)
    VALUES (NEW.id, NEW.tenant_id, NEW.base_price, NEW.margin_pct, auth.uid());
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_service_price_change
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION log_service_price_change();

-- 5. Trigger: updated_at on proposal_items
CREATE OR REPLACE FUNCTION update_proposal_items_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_proposal_items_updated
  BEFORE UPDATE ON proposal_items
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_items_timestamp();
