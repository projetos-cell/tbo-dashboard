-- ============================================================================
-- 034: Contracts — Clicksign integration + scope items + signers
-- ============================================================================

-- ─── 1. Extend contracts table with Clicksign & scope fields ─────────────────

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS contract_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS clicksign_envelope_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS clicksign_status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS clicksign_metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS total_value NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contract_status TEXT DEFAULT 'draft';

-- Add CHECK constraint for contract_status
ALTER TABLE contracts
  DROP CONSTRAINT IF EXISTS contracts_contract_status_check;
ALTER TABLE contracts
  ADD CONSTRAINT contracts_contract_status_check
  CHECK (contract_status IN ('draft', 'pending_sign', 'active', 'completed', 'canceled'));

-- ─── 2. Auto-generate contract_number (TBO-YYYY-NNN) ────────────────────────

CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
DECLARE
  next_seq INT;
  year_str TEXT;
BEGIN
  IF NEW.contract_number IS NULL THEN
    year_str := to_char(now(), 'YYYY');
    SELECT COALESCE(MAX(
      CAST(SPLIT_PART(contract_number, '-', 3) AS INT)
    ), 0) + 1
    INTO next_seq
    FROM contracts
    WHERE contract_number LIKE 'TBO-' || year_str || '-%'
      AND tenant_id = NEW.tenant_id;

    NEW.contract_number := 'TBO-' || year_str || '-' || LPAD(next_seq::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contracts_auto_number ON contracts;
CREATE TRIGGER trg_contracts_auto_number
  BEFORE INSERT ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION generate_contract_number();

-- ─── 3. contract_scope_items ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contract_scope_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),

  title TEXT NOT NULL,
  description TEXT,
  category TEXT,

  value NUMERIC(12,2) DEFAULT 0,

  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'delivered', 'approved'
  )),
  progress_pct SMALLINT DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),

  estimated_start DATE,
  estimated_end DATE,
  actual_start DATE,
  actual_end DATE,
  delivered_at TIMESTAMPTZ,

  project_deliverable_id UUID,

  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contract_scope_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_scope_items_contract ON contract_scope_items(contract_id);
CREATE INDEX IF NOT EXISTS idx_scope_items_tenant ON contract_scope_items(tenant_id);

-- ─── 4. contract_signers ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contract_signers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),

  name TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf TEXT,
  role TEXT DEFAULT 'signer',

  clicksign_signer_id TEXT,
  sign_status TEXT DEFAULT 'pending' CHECK (sign_status IN (
    'pending', 'signed', 'declined'
  )),
  signed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contract_signers ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_signers_contract ON contract_signers(contract_id);
CREATE INDEX IF NOT EXISTS idx_signers_tenant ON contract_signers(tenant_id);

-- ─── 5. contract_events (timeline) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contract_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),

  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  source TEXT DEFAULT 'internal' CHECK (source IN ('internal', 'clicksign')),
  user_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contract_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_events_contract ON contract_events(contract_id);

-- ─── 6. RLS Policies ────────────────────────────────────────────────────────

-- contract_scope_items
CREATE POLICY "scope_items_tenant_read" ON contract_scope_items
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "scope_items_tenant_write" ON contract_scope_items
  FOR ALL USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- contract_signers
CREATE POLICY "signers_tenant_read" ON contract_signers
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "signers_tenant_write" ON contract_signers
  FOR ALL USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- contract_events
CREATE POLICY "events_tenant_read" ON contract_events
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "events_tenant_write" ON contract_events
  FOR ALL USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ─── 7. Computed view: contracts_with_progress ───────────────────────────────

CREATE OR REPLACE VIEW contracts_with_progress AS
SELECT
  c.*,
  COALESCE(
    CASE
      WHEN SUM(csi.value) > 0
      THEN ROUND(SUM(csi.progress_pct * csi.value) / SUM(csi.value))
      ELSE ROUND(AVG(csi.progress_pct))
    END,
    0
  )::INT AS overall_progress,
  COUNT(csi.id)::INT AS total_scope_items,
  COUNT(csi.id) FILTER (
    WHERE csi.status = 'delivered' OR csi.status = 'approved'
  )::INT AS completed_scope_items,
  p.name AS project_name,
  cl.name AS client_name
FROM contracts c
LEFT JOIN contract_scope_items csi ON csi.contract_id = c.id
LEFT JOIN projects p ON p.id = c.project_id
LEFT JOIN clients cl ON cl.id = c.client_id
GROUP BY c.id, p.name, cl.name;
