-- Dados Comerciais mensais — preenchimento manual + cruzamento RD Station
CREATE TABLE IF NOT EXISTS commercial_monthly_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Período
  year_month text NOT NULL, -- formato "2026-03"

  -- 7 métricas manuais
  reunioes_agendadas int DEFAULT 0,
  reunioes_realizadas int DEFAULT 0,
  vendas_quantidade int DEFAULT 0,
  vendas_valor numeric(14,2) DEFAULT 0,
  prospeccoes_outbound int DEFAULT 0,
  leads_inbound int DEFAULT 0,
  produtos_vendidos text DEFAULT '',

  -- Métricas derivadas do RD (snapshot no momento do save)
  rd_leads_total int DEFAULT 0,
  rd_deals_won int DEFAULT 0,
  rd_deals_won_value numeric(14,2) DEFAULT 0,
  rd_pipeline_value numeric(14,2) DEFAULT 0,
  rd_conversion_rate numeric(5,2) DEFAULT 0,

  -- Metadata
  updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(tenant_id, year_month)
);

-- Indexes
CREATE INDEX idx_cmd_tenant ON commercial_monthly_data(tenant_id);
CREATE INDEX idx_cmd_year_month ON commercial_monthly_data(year_month);

-- RLS
ALTER TABLE commercial_monthly_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON commercial_monthly_data
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "tenant_insert" ON commercial_monthly_data
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "tenant_update" ON commercial_monthly_data
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Auto-update updated_at
CREATE TRIGGER set_updated_at_commercial_monthly_data
  BEFORE UPDATE ON commercial_monthly_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
