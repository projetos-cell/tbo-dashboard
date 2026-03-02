-- Migration 070: Cultura Enterprise — cultura_items + cultura_item_versions + audit trail
-- Date: 2026-03-01

-- ─── cultura_items (generic content: pilares, politicas, manual, valores, documentos) ───
CREATE TABLE IF NOT EXISTS cultura_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'pilar'
    CHECK (category IN ('pilar','ritual','politica','reconhecimento','valor','documento','manual')),
  title TEXT NOT NULL,
  content TEXT,
  content_html TEXT,
  author_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),
  order_index INTEGER DEFAULT 0,
  icon TEXT,
  metadata JSONB DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cultura_items_tenant ON cultura_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cultura_items_cat ON cultura_items(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_cultura_items_status ON cultura_items(tenant_id, status);

-- RLS
ALTER TABLE cultura_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cultura_items_select' AND tablename = 'cultura_items') THEN
    CREATE POLICY cultura_items_select ON cultura_items FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cultura_items_insert' AND tablename = 'cultura_items') THEN
    CREATE POLICY cultura_items_insert ON cultura_items FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cultura_items_update' AND tablename = 'cultura_items') THEN
    CREATE POLICY cultura_items_update ON cultura_items FOR UPDATE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cultura_items_delete' AND tablename = 'cultura_items') THEN
    CREATE POLICY cultura_items_delete ON cultura_items FOR DELETE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION trg_cultura_items_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cultura_items_ts ON cultura_items;
CREATE TRIGGER trg_cultura_items_ts BEFORE UPDATE ON cultura_items
  FOR EACH ROW EXECUTE FUNCTION trg_cultura_items_updated_at();

-- ─── cultura_item_versions (version snapshots) ───
CREATE TABLE IF NOT EXISTS cultura_item_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES cultura_items(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  title TEXT,
  content TEXT,
  edited_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cultura_versions_item ON cultura_item_versions(item_id, version DESC);

ALTER TABLE cultura_item_versions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cultura_versions_select' AND tablename = 'cultura_item_versions') THEN
    CREATE POLICY cultura_versions_select ON cultura_item_versions FOR SELECT
      USING (item_id IN (SELECT id FROM cultura_items WHERE tenant_id IN (SELECT get_user_tenant_ids())));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cultura_versions_insert' AND tablename = 'cultura_item_versions') THEN
    CREATE POLICY cultura_versions_insert ON cultura_item_versions FOR INSERT
      WITH CHECK (item_id IN (SELECT id FROM cultura_items WHERE tenant_id IN (SELECT get_user_tenant_ids())));
  END IF;
END $$;

-- ─── cultura_audit_log (audit trail for recognitions, rewards, redemptions) ───
CREATE TABLE IF NOT EXISTS cultura_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('recognition','reward','redemption','points_adjustment')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create','update','delete','approve','reject','fulfill','adjust')),
  actor_id TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cultura_audit_tenant ON cultura_audit_log(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cultura_audit_entity ON cultura_audit_log(entity_type, entity_id);

ALTER TABLE cultura_audit_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cultura_audit_select' AND tablename = 'cultura_audit_log') THEN
    CREATE POLICY cultura_audit_select ON cultura_audit_log FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cultura_audit_insert' AND tablename = 'cultura_audit_log') THEN
    CREATE POLICY cultura_audit_insert ON cultura_audit_log FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- ─── Add missing columns to recognitions if not exist ───
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recognitions' AND column_name='category') THEN
    ALTER TABLE recognitions ADD COLUMN category TEXT DEFAULT 'elogio' CHECK (category IN ('elogio','feedback','destaque','especial'));
  END IF;
END $$;

-- ─── reward_tiers (TBO Rewards levels) ───
CREATE TABLE IF NOT EXISTS reward_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  max_points INTEGER,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'star',
  benefits TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reward_tiers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reward_tiers_select' AND tablename = 'reward_tiers') THEN
    CREATE POLICY reward_tiers_select ON reward_tiers FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reward_tiers_manage' AND tablename = 'reward_tiers') THEN
    CREATE POLICY reward_tiers_manage ON reward_tiers FOR ALL
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- ─── reward_policy (financial policy for TBO Rewards) ───
CREATE TABLE IF NOT EXISTS reward_policy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  monthly_budget_brl NUMERIC(10,2) DEFAULT 5000,
  quarterly_budget_brl NUMERIC(10,2) DEFAULT 15000,
  min_tenure_days INTEGER DEFAULT 90,
  min_points_to_redeem INTEGER DEFAULT 25,
  points_expiry_days INTEGER,
  approval_required BOOLEAN DEFAULT true,
  special_threshold INTEGER DEFAULT 200,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id)
);

ALTER TABLE reward_policy ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reward_policy_select' AND tablename = 'reward_policy') THEN
    CREATE POLICY reward_policy_select ON reward_policy FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reward_policy_manage' AND tablename = 'reward_policy') THEN
    CREATE POLICY reward_policy_manage ON reward_policy FOR ALL
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;
