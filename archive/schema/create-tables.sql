-- ============================================================================
-- TBO OS — Supabase Tables for Business Configuration & Financial Data
-- Idempotent: safe to re-run (uses IF NOT EXISTS + DROP POLICY)
-- ============================================================================

-- 1. Business Config (key-value store for TBO_CONFIG.business overrides)
CREATE TABLE IF NOT EXISTS business_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon can read business_config" ON business_config;
DROP POLICY IF EXISTS "Anon can manage business_config" ON business_config;
CREATE POLICY "Anon can read business_config"
  ON business_config FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anon can manage business_config"
  ON business_config FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 2. Financial Data (monthly fluxo de caixa — mirrors Google Sheets structure)
CREATE TABLE IF NOT EXISTS financial_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  year integer NOT NULL,
  month text NOT NULL,
  category text NOT NULL,
  subcategory text,
  value numeric(15,2) NOT NULL DEFAULT 0,
  is_realized boolean DEFAULT false,
  notes text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  UNIQUE(year, month, category, subcategory)
);
ALTER TABLE financial_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon can read financial_data" ON financial_data;
DROP POLICY IF EXISTS "Anon can manage financial_data" ON financial_data;
CREATE POLICY "Anon can read financial_data"
  ON financial_data FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anon can manage financial_data"
  ON financial_data FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 3. Financial Targets (annual/monthly targets)
CREATE TABLE IF NOT EXISTS financial_targets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  year integer NOT NULL,
  target_type text NOT NULL,
  value numeric(15,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  UNIQUE(year, target_type)
);
ALTER TABLE financial_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon can read financial_targets" ON financial_targets;
DROP POLICY IF EXISTS "Anon can manage financial_targets" ON financial_targets;
CREATE POLICY "Anon can read financial_targets"
  ON financial_targets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anon can manage financial_targets"
  ON financial_targets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Operating Criteria (tax rate, commission rate, etc.)
CREATE TABLE IF NOT EXISTS operating_criteria (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value numeric(10,4) NOT NULL DEFAULT 0,
  label text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);
ALTER TABLE operating_criteria ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon can read operating_criteria" ON operating_criteria;
DROP POLICY IF EXISTS "Anon can manage operating_criteria" ON operating_criteria;
CREATE POLICY "Anon can read operating_criteria"
  ON operating_criteria FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anon can manage operating_criteria"
  ON operating_criteria FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- SEED: Operating Criteria (from spreadsheet)
INSERT INTO operating_criteria (key, value, label) VALUES
  ('tax_rate', 0.10, 'Aliquota de Impostos'),
  ('contract_to_cash', 0.30, 'Contrato para Caixa (%)'),
  ('sales_commission', 0.10, 'Comissao de Vendas'),
  ('profit_sharing', 0.10, 'Participacao nos Lucros')
ON CONFLICT (key) DO NOTHING;

-- SEED: Financial Targets 2026 (from spreadsheet)
INSERT INTO financial_targets (year, target_type, value) VALUES
  (2026, 'meta_vendas_mensal', 180000),
  (2026, 'meta_vendas_anual', 2160000),
  (2026, 'margem_objetivo', 10)
ON CONFLICT (year, target_type) DO NOTHING;

-- SEED: Business Config defaults
INSERT INTO business_config (key, value) VALUES
  ('financial', '{"monthlyTarget": 180000, "quarterlyTarget": 150000, "premiumThreshold": 30000, "currency": "BRL", "averageTicket2025": 32455, "totalRevenue2024": 701586}'::jsonb),
  ('biScoring', '{"baseWinRate": 40, "probabilityBase": 50, "probabilityDivisor": 5}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_financial_data_year ON financial_data(year);
CREATE INDEX IF NOT EXISTS idx_financial_data_category ON financial_data(year, category);
CREATE INDEX IF NOT EXISTS idx_financial_targets_year ON financial_targets(year);
