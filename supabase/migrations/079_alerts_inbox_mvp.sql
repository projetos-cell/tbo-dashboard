-- ============================================================================
-- TBO OS — Migration 079: Alerts Inbox MVP
--
-- Enhances notifications table for Inbox Global:
--   - Adds actor_id, comment_id, meta columns
-- Creates thread_subscriptions for auto-follow on comments
-- Adds updated_by to os_tasks for change attribution
--
-- IDEMPOTENT: safe to run multiple times.
-- ============================================================================

-- ═══ 1. Enhance notifications table ═══

-- actor_id: who caused this notification
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'actor_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN actor_id UUID;
  END IF;
END $$;

-- comment_id: reference to the comment (if notification is about a comment)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'comment_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN comment_id UUID;
  END IF;
END $$;

-- meta: JSONB for extra data (changed_fields, old/new values, etc.)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'meta'
  ) THEN
    ALTER TABLE notifications ADD COLUMN meta JSONB DEFAULT '{}';
  END IF;
END $$;

-- Ensure trigger_type column exists (stores: mention, thread_reply, task_assigned, task_updated)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'trigger_type'
  ) THEN
    ALTER TABLE notifications ADD COLUMN trigger_type TEXT;
  END IF;
END $$;

-- Index for fast inbox queries with trigger_type filter
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_trigger
  ON notifications(user_id, trigger_type, created_at DESC);

-- Index for actor lookups
CREATE INDEX IF NOT EXISTS idx_notifications_actor
  ON notifications(actor_id);

-- Ensure RLS policies allow insert from authenticated users (for app-level notification creation)
-- The existing policies may only allow service_role. Add a policy for authenticated users.
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'notifications_select_own' AND tablename = 'notifications'
  ) THEN
    CREATE POLICY "notifications_select_own" ON notifications
      FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'notifications_update_own' AND tablename = 'notifications'
  ) THEN
    CREATE POLICY "notifications_update_own" ON notifications
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'notifications_insert_authenticated' AND tablename = 'notifications'
  ) THEN
    CREATE POLICY "notifications_insert_authenticated" ON notifications
      FOR INSERT WITH CHECK (
        tenant_id IN (SELECT get_user_tenant_ids())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'notifications_delete_own' AND tablename = 'notifications'
  ) THEN
    CREATE POLICY "notifications_delete_own" ON notifications
      FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- ═══ 2. Thread subscriptions (auto-follow) ═══

CREATE TABLE IF NOT EXISTS thread_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL DEFAULT 'task',
  entity_id   UUID NOT NULL,
  user_id     UUID NOT NULL,
  is_muted    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint: one subscription per user per entity
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'thread_subscriptions_unique_user_entity'
  ) THEN
    ALTER TABLE thread_subscriptions
      ADD CONSTRAINT thread_subscriptions_unique_user_entity
      UNIQUE (entity_type, entity_id, user_id);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_thread_sub_entity
  ON thread_subscriptions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_thread_sub_user
  ON thread_subscriptions(user_id);

-- RLS
ALTER TABLE thread_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'thread_sub_select' AND tablename = 'thread_subscriptions'
  ) THEN
    CREATE POLICY "thread_sub_select" ON thread_subscriptions
      FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'thread_sub_insert' AND tablename = 'thread_subscriptions'
  ) THEN
    CREATE POLICY "thread_sub_insert" ON thread_subscriptions
      FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'thread_sub_update' AND tablename = 'thread_subscriptions'
  ) THEN
    CREATE POLICY "thread_sub_update" ON thread_subscriptions
      FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()) AND user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'thread_sub_delete' AND tablename = 'thread_subscriptions'
  ) THEN
    CREATE POLICY "thread_sub_delete" ON thread_subscriptions
      FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()) AND user_id = auth.uid());
  END IF;
END $$;

-- ═══ 3. Add updated_by to os_tasks ═══

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'os_tasks' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE os_tasks ADD COLUMN updated_by UUID;
  END IF;
END $$;
