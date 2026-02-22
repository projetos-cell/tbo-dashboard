-- ============================================================
-- Migration 035: Notion-style Flexible Database System
-- Task #23 — TBO-OS Fase 4
-- ============================================================

-- 1. Database definitions (schema metadata)
CREATE TABLE IF NOT EXISTS custom_databases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'database',
  color TEXT DEFAULT '#3B82F6',
  -- Column schema: [{ id, name, type, options?, width?, order }]
  -- Types: text, number, select, multi_select, date, person, checkbox, url, email, phone, relation, rollup, formula
  columns JSONB NOT NULL DEFAULT '[]',
  -- Default view config
  default_view TEXT DEFAULT 'table', -- table, kanban, calendar, gallery, list
  -- Views: [{ id, name, type, filters?, sorts?, groupBy?, hiddenColumns? }]
  views JSONB NOT NULL DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_databases_tenant ON custom_databases(tenant_id);

ALTER TABLE custom_databases ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'custom_databases_select' AND tablename = 'custom_databases') THEN
    CREATE POLICY "custom_databases_select" ON custom_databases FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'custom_databases_insert' AND tablename = 'custom_databases') THEN
    CREATE POLICY "custom_databases_insert" ON custom_databases FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'custom_databases_update' AND tablename = 'custom_databases') THEN
    CREATE POLICY "custom_databases_update" ON custom_databases FOR UPDATE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'custom_databases_delete' AND tablename = 'custom_databases') THEN
    CREATE POLICY "custom_databases_delete" ON custom_databases FOR DELETE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- 2. Database rows (records with flexible JSONB properties)
CREATE TABLE IF NOT EXISTS custom_database_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  database_id UUID NOT NULL REFERENCES custom_databases(id) ON DELETE CASCADE,
  -- Flexible properties stored as JSONB: { "col_id": value, ... }
  properties JSONB NOT NULL DEFAULT '{}',
  -- Order within database
  order_index DOUBLE PRECISION DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_db_rows_tenant ON custom_database_rows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_db_rows_database ON custom_database_rows(database_id);
CREATE INDEX IF NOT EXISTS idx_custom_db_rows_props ON custom_database_rows USING gin(properties);

ALTER TABLE custom_database_rows ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'custom_db_rows_select' AND tablename = 'custom_database_rows') THEN
    CREATE POLICY "custom_db_rows_select" ON custom_database_rows FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'custom_db_rows_insert' AND tablename = 'custom_database_rows') THEN
    CREATE POLICY "custom_db_rows_insert" ON custom_database_rows FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'custom_db_rows_update' AND tablename = 'custom_database_rows') THEN
    CREATE POLICY "custom_db_rows_update" ON custom_database_rows FOR UPDATE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'custom_db_rows_delete' AND tablename = 'custom_database_rows') THEN
    CREATE POLICY "custom_db_rows_delete" ON custom_database_rows FOR DELETE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- 3. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_custom_db_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_custom_databases_updated') THEN
    CREATE TRIGGER trg_custom_databases_updated
      BEFORE UPDATE ON custom_databases
      FOR EACH ROW EXECUTE FUNCTION update_custom_db_timestamp();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_custom_db_rows_updated') THEN
    CREATE TRIGGER trg_custom_db_rows_updated
      BEFORE UPDATE ON custom_database_rows
      FOR EACH ROW EXECUTE FUNCTION update_custom_db_timestamp();
  END IF;
END $$;
