-- ============================================================================
-- Migration: Premissas de Precificacao + Custo por BU + campos em services
-- Date: 2026-03-27
-- ============================================================================

-- 1. Premissas Gerais de Precificacao (singleton por tenant)
CREATE TABLE IF NOT EXISTS pricing_premises (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tax_pct              numeric(6,4) NOT NULL DEFAULT 0.10,      -- % impostos
  commission_pct       numeric(6,4) NOT NULL DEFAULT 0.10,      -- % comissao de vendas
  target_margin_pct    numeric(6,4) NOT NULL DEFAULT 0.30,      -- margem liquida alvo
  urgency_multiplier   numeric(6,4) NOT NULL DEFAULT 1.40,      -- multiplicador urgencia
  package_discount_pct numeric(6,4) NOT NULL DEFAULT 0.08,      -- desconto pacote integrado
  updated_at           timestamptz   NOT NULL DEFAULT now(),
  updated_by           uuid REFERENCES auth.users(id),
  UNIQUE (tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_pricing_premises_tenant ON pricing_premises(tenant_id);

ALTER TABLE pricing_premises ENABLE ROW LEVEL SECURITY;

CREATE POLICY pricing_premises_read ON pricing_premises
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY pricing_premises_insert ON pricing_premises
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY pricing_premises_update ON pricing_premises
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- 2. Custo por BU (upsert por tenant + bu)
CREATE TABLE IF NOT EXISTS bu_costs (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bu                     text NOT NULL,
  total_cost_monthly     numeric(14,2) NOT NULL DEFAULT 0,  -- custo total BU/mes (R$)
  capacity_hours_monthly numeric(8,2)  NOT NULL DEFAULT 176, -- capacidade h/mes
  note                   text,
  updated_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, bu)
);

CREATE INDEX IF NOT EXISTS idx_bu_costs_tenant ON bu_costs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bu_costs_bu    ON bu_costs(bu);

ALTER TABLE bu_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY bu_costs_read ON bu_costs
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY bu_costs_insert ON bu_costs
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY bu_costs_update ON bu_costs
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY bu_costs_delete ON bu_costs
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Trigger: updated_at em bu_costs
CREATE OR REPLACE FUNCTION update_bu_costs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bu_costs_updated
  BEFORE UPDATE ON bu_costs
  FOR EACH ROW EXECUTE FUNCTION update_bu_costs_timestamp();

-- 3. Campos de calculo de precificacao em services
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS hours_estimated       numeric(8,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS third_party_cost      numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS complexity_multiplier numeric(6,4)  DEFAULT 1,
  ADD COLUMN IF NOT EXISTS revisions_included    int           DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_price             numeric(12,2) DEFAULT 0;
