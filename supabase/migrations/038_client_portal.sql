-- ============================================================
-- Migration 038: Client Portal (Portal do Cliente)
-- Task #21 — TBO-OS
-- Idempotent: safe to re-run
-- ============================================================

-- 1. Client Portal Access — manages client login tokens and access
CREATE TABLE IF NOT EXISTS client_portal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  client_id UUID,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  access_token UUID UNIQUE DEFAULT gen_random_uuid(),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_portal_access_tenant ON client_portal_access(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_access_token ON client_portal_access(access_token);
CREATE INDEX IF NOT EXISTS idx_client_portal_access_email ON client_portal_access(client_email);

ALTER TABLE client_portal_access ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_portal_access_select' AND tablename = 'client_portal_access') THEN
    CREATE POLICY "client_portal_access_select" ON client_portal_access FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_portal_access_insert' AND tablename = 'client_portal_access') THEN
    CREATE POLICY "client_portal_access_insert" ON client_portal_access FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_portal_access_update' AND tablename = 'client_portal_access') THEN
    CREATE POLICY "client_portal_access_update" ON client_portal_access FOR UPDATE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_portal_access_delete' AND tablename = 'client_portal_access') THEN
    CREATE POLICY "client_portal_access_delete" ON client_portal_access FOR DELETE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;


-- 2. Client Deliveries — tracks deliverables sent to clients
CREATE TABLE IF NOT EXISTS client_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  client_id UUID NOT NULL REFERENCES client_portal_access(id) ON DELETE CASCADE,
  project_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revision')),
  files JSONB DEFAULT '[]',
  review_notes TEXT,
  delivered_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_deliveries_tenant ON client_deliveries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_deliveries_client ON client_deliveries(client_id);
CREATE INDEX IF NOT EXISTS idx_client_deliveries_project ON client_deliveries(project_id);
CREATE INDEX IF NOT EXISTS idx_client_deliveries_status ON client_deliveries(status);

ALTER TABLE client_deliveries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_deliveries_select' AND tablename = 'client_deliveries') THEN
    CREATE POLICY "client_deliveries_select" ON client_deliveries FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_deliveries_insert' AND tablename = 'client_deliveries') THEN
    CREATE POLICY "client_deliveries_insert" ON client_deliveries FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_deliveries_update' AND tablename = 'client_deliveries') THEN
    CREATE POLICY "client_deliveries_update" ON client_deliveries FOR UPDATE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_deliveries_delete' AND tablename = 'client_deliveries') THEN
    CREATE POLICY "client_deliveries_delete" ON client_deliveries FOR DELETE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;


-- 3. Client Messages — communication between client and TBO team
CREATE TABLE IF NOT EXISTS client_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  client_id UUID NOT NULL REFERENCES client_portal_access(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'team')),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_messages_tenant ON client_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_client ON client_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_created ON client_messages(created_at DESC);

ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_messages_select' AND tablename = 'client_messages') THEN
    CREATE POLICY "client_messages_select" ON client_messages FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_messages_insert' AND tablename = 'client_messages') THEN
    CREATE POLICY "client_messages_insert" ON client_messages FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_messages_update' AND tablename = 'client_messages') THEN
    CREATE POLICY "client_messages_update" ON client_messages FOR UPDATE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_messages_delete' AND tablename = 'client_messages') THEN
    CREATE POLICY "client_messages_delete" ON client_messages FOR DELETE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;


-- 4. Client Activity Log — full audit trail for client actions
CREATE TABLE IF NOT EXISTS client_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  client_id UUID NOT NULL REFERENCES client_portal_access(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_activity_log_tenant ON client_activity_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_activity_log_client ON client_activity_log(client_id);
CREATE INDEX IF NOT EXISTS idx_client_activity_log_created ON client_activity_log(created_at DESC);

ALTER TABLE client_activity_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_activity_log_select' AND tablename = 'client_activity_log') THEN
    CREATE POLICY "client_activity_log_select" ON client_activity_log FOR SELECT
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_activity_log_insert' AND tablename = 'client_activity_log') THEN
    CREATE POLICY "client_activity_log_insert" ON client_activity_log FOR INSERT
      WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_activity_log_update' AND tablename = 'client_activity_log') THEN
    CREATE POLICY "client_activity_log_update" ON client_activity_log FOR UPDATE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_activity_log_delete' AND tablename = 'client_activity_log') THEN
    CREATE POLICY "client_activity_log_delete" ON client_activity_log FOR DELETE
      USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;
