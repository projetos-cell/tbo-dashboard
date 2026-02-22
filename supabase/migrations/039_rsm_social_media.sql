-- ============================================================
-- Migration 039: RSM — Report Social Media
-- Task #24 — TBO-OS
-- Tables: rsm_accounts, rsm_metrics, rsm_posts, rsm_ideas
-- All with RLS + tenant isolation, idempotent
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. rsm_accounts — Social media accounts per client
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rsm_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  client_id UUID,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'linkedin', 'facebook')),
  handle TEXT NOT NULL,
  profile_url TEXT,
  followers_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rsm_accounts_tenant ON rsm_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rsm_accounts_client ON rsm_accounts(tenant_id, client_id);

ALTER TABLE rsm_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_accounts_select' AND tablename = 'rsm_accounts') THEN
    CREATE POLICY "rsm_accounts_select" ON rsm_accounts
      FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_accounts_insert' AND tablename = 'rsm_accounts') THEN
    CREATE POLICY "rsm_accounts_insert" ON rsm_accounts
      FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_accounts_update' AND tablename = 'rsm_accounts') THEN
    CREATE POLICY "rsm_accounts_update" ON rsm_accounts
      FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_accounts_delete' AND tablename = 'rsm_accounts') THEN
    CREATE POLICY "rsm_accounts_delete" ON rsm_accounts
      FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 2. rsm_metrics — Periodic metric snapshots per account
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rsm_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  account_id UUID NOT NULL REFERENCES rsm_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  engagement_rate NUMERIC(8,4) DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rsm_metrics_tenant ON rsm_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rsm_metrics_account_date ON rsm_metrics(account_id, date DESC);

ALTER TABLE rsm_metrics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_metrics_select' AND tablename = 'rsm_metrics') THEN
    CREATE POLICY "rsm_metrics_select" ON rsm_metrics
      FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_metrics_insert' AND tablename = 'rsm_metrics') THEN
    CREATE POLICY "rsm_metrics_insert" ON rsm_metrics
      FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_metrics_update' AND tablename = 'rsm_metrics') THEN
    CREATE POLICY "rsm_metrics_update" ON rsm_metrics
      FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_metrics_delete' AND tablename = 'rsm_metrics') THEN
    CREATE POLICY "rsm_metrics_delete" ON rsm_metrics
      FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 3. rsm_posts — Posts (feed, story, reel, carousel)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rsm_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  account_id UUID NOT NULL REFERENCES rsm_accounts(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  type TEXT NOT NULL DEFAULT 'feed' CHECK (type IN ('feed', 'story', 'reel', 'carousel')),
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'approved', 'production', 'scheduled', 'published')),
  scheduled_date TIMESTAMPTZ,
  published_date TIMESTAMPTZ,
  tags JSONB DEFAULT '[]',
  media_urls JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rsm_posts_tenant ON rsm_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rsm_posts_account ON rsm_posts(account_id, status);
CREATE INDEX IF NOT EXISTS idx_rsm_posts_scheduled ON rsm_posts(tenant_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_rsm_posts_status ON rsm_posts(tenant_id, status);

ALTER TABLE rsm_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_posts_select' AND tablename = 'rsm_posts') THEN
    CREATE POLICY "rsm_posts_select" ON rsm_posts
      FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_posts_insert' AND tablename = 'rsm_posts') THEN
    CREATE POLICY "rsm_posts_insert" ON rsm_posts
      FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_posts_update' AND tablename = 'rsm_posts') THEN
    CREATE POLICY "rsm_posts_update" ON rsm_posts
      FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_posts_delete' AND tablename = 'rsm_posts') THEN
    CREATE POLICY "rsm_posts_delete" ON rsm_posts
      FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 4. rsm_ideas — Content ideas hub
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rsm_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  client_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'educational' CHECK (category IN ('educational', 'institutional', 'product', 'backstage')),
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'approved', 'production', 'published')),
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rsm_ideas_tenant ON rsm_ideas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rsm_ideas_client ON rsm_ideas(tenant_id, client_id);
CREATE INDEX IF NOT EXISTS idx_rsm_ideas_status ON rsm_ideas(tenant_id, status);

ALTER TABLE rsm_ideas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_ideas_select' AND tablename = 'rsm_ideas') THEN
    CREATE POLICY "rsm_ideas_select" ON rsm_ideas
      FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_ideas_insert' AND tablename = 'rsm_ideas') THEN
    CREATE POLICY "rsm_ideas_insert" ON rsm_ideas
      FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_ideas_update' AND tablename = 'rsm_ideas') THEN
    CREATE POLICY "rsm_ideas_update" ON rsm_ideas
      FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rsm_ideas_delete' AND tablename = 'rsm_ideas') THEN
    CREATE POLICY "rsm_ideas_delete" ON rsm_ideas
      FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 5. updated_at triggers
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_rsm_accounts_updated_at') THEN
    CREATE TRIGGER trg_rsm_accounts_updated_at
      BEFORE UPDATE ON rsm_accounts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_rsm_posts_updated_at') THEN
    CREATE TRIGGER trg_rsm_posts_updated_at
      BEFORE UPDATE ON rsm_posts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_rsm_ideas_updated_at') THEN
    CREATE TRIGGER trg_rsm_ideas_updated_at
      BEFORE UPDATE ON rsm_ideas
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
