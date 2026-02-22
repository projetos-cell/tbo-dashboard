-- ============================================================
-- Migration 034: Inbox Notifications (Caixa de Entrada)
-- Task #14 — TBO-OS
-- ============================================================

-- 1. Create inbox_notifications table
CREATE TABLE IF NOT EXISTS inbox_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'general', -- 'recognition', 'mention', 'update', 'report', 'system'
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- 2. Index for fast user inbox queries
CREATE INDEX IF NOT EXISTS idx_inbox_user ON inbox_notifications(user_id, is_read, created_at DESC);

-- 3. Enable RLS
ALTER TABLE inbox_notifications ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Users can read their own notifications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users see own notifications' AND tablename = 'inbox_notifications') THEN
    CREATE POLICY "Users see own notifications" ON inbox_notifications
      FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

-- Users can update (mark read) their own notifications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update own notifications' AND tablename = 'inbox_notifications') THEN
    CREATE POLICY "Users update own notifications" ON inbox_notifications
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

-- Service role (edge functions, triggers) can insert notifications for any user
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role inserts notifications' AND tablename = 'inbox_notifications') THEN
    CREATE POLICY "Service role inserts notifications" ON inbox_notifications
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;
