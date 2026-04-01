-- Hub Posts: feed social do /servicos
-- Tabelas: hub_posts, hub_post_comments, hub_post_likes

-- Enum de canais
DO $$ BEGIN
  CREATE TYPE hub_post_channel AS ENUM (
    'projetos', 'comercial', 'financeiro', 'pessoas', 'cultura', 'marketing'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Posts
CREATE TABLE IF NOT EXISTS hub_posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  author_id    uuid NOT NULL REFERENCES auth.users(id),
  title        text,
  body         text NOT NULL,
  channel      hub_post_channel NOT NULL DEFAULT 'cultura',
  cover_url    text,
  is_pinned    boolean NOT NULL DEFAULT false,
  likes_count  int NOT NULL DEFAULT 0,
  comments_count int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Comments (threaded via parent_id)
CREATE TABLE IF NOT EXISTS hub_post_comments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      uuid NOT NULL REFERENCES hub_posts(id) ON DELETE CASCADE,
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  author_id    uuid NOT NULL REFERENCES auth.users(id),
  content      text NOT NULL,
  parent_id    uuid REFERENCES hub_post_comments(id) ON DELETE CASCADE,
  mentions     uuid[] DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Likes (composite PK = one like per user per post)
CREATE TABLE IF NOT EXISTS hub_post_likes (
  post_id      uuid NOT NULL REFERENCES hub_posts(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hub_posts_tenant ON hub_posts(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hub_posts_channel ON hub_posts(tenant_id, channel, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hub_posts_fts ON hub_posts USING gin(
  to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(body, ''))
);
CREATE INDEX IF NOT EXISTS idx_hub_comments_post ON hub_post_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_hub_likes_post ON hub_post_likes(post_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION hub_posts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hub_posts_updated_at ON hub_posts;
CREATE TRIGGER trg_hub_posts_updated_at
  BEFORE UPDATE ON hub_posts
  FOR EACH ROW EXECUTE FUNCTION hub_posts_updated_at();

-- likes_count increment/decrement
CREATE OR REPLACE FUNCTION hub_post_likes_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE hub_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE hub_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hub_post_likes_count ON hub_post_likes;
CREATE TRIGGER trg_hub_post_likes_count
  AFTER INSERT OR DELETE ON hub_post_likes
  FOR EACH ROW EXECUTE FUNCTION hub_post_likes_count();

-- comments_count increment/decrement
CREATE OR REPLACE FUNCTION hub_post_comments_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE hub_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE hub_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hub_post_comments_count ON hub_post_comments;
CREATE TRIGGER trg_hub_post_comments_count
  AFTER INSERT OR DELETE ON hub_post_comments
  FOR EACH ROW EXECUTE FUNCTION hub_post_comments_count();

-- RLS
ALTER TABLE hub_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hub_posts_select" ON hub_posts FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "hub_posts_insert" ON hub_posts FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) AND author_id = auth.uid());

CREATE POLICY "hub_posts_update" ON hub_posts FOR UPDATE
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND author_id = auth.uid());

CREATE POLICY "hub_posts_delete" ON hub_posts FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND author_id = auth.uid());

CREATE POLICY "hub_comments_select" ON hub_post_comments FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "hub_comments_insert" ON hub_post_comments FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) AND author_id = auth.uid());

CREATE POLICY "hub_comments_delete" ON hub_post_comments FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND author_id = auth.uid());

CREATE POLICY "hub_likes_select" ON hub_post_likes FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "hub_likes_insert" ON hub_post_likes FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()) AND user_id = auth.uid());

CREATE POLICY "hub_likes_delete" ON hub_post_likes FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND user_id = auth.uid());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE hub_posts;
