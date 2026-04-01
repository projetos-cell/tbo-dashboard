-- ============================================================
-- Comunicados Oficiais — announcements + read confirmations
-- ============================================================

-- Priority enum
CREATE TYPE announcement_priority AS ENUM ('normal', 'important', 'urgent');

-- ── Main table ──────────────────────────────────────────────
CREATE TABLE announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  author_id   UUID NOT NULL REFERENCES auth.users(id),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,                  -- HTML from RichTextEditor
  priority    announcement_priority NOT NULL DEFAULT 'normal',
  requires_read_confirmation BOOLEAN NOT NULL DEFAULT false,
  pinned      BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,                  -- NULL = draft
  expires_at  TIMESTAMPTZ,                   -- optional expiry
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Read confirmations ──────────────────────────────────────
CREATE TABLE announcement_reads (
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  read_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (announcement_id, user_id)
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX idx_announcements_tenant_published
  ON announcements (tenant_id, published_at DESC NULLS LAST)
  WHERE published_at IS NOT NULL;

CREATE INDEX idx_announcements_priority
  ON announcements (tenant_id, priority)
  WHERE published_at IS NOT NULL;

CREATE INDEX idx_announcement_reads_user
  ON announcement_reads (user_id, announcement_id);

-- ── Updated_at trigger ──────────────────────────────────────
CREATE TRIGGER set_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

-- Announcements: anyone in tenant can read published
CREATE POLICY "announcements_select" ON announcements
  FOR SELECT USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (published_at IS NOT NULL OR author_id = auth.uid())
  );

-- Only founder/diretoria can create
CREATE POLICY "announcements_insert" ON announcements
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND author_id = auth.uid()
  );

-- Only author can update
CREATE POLICY "announcements_update" ON announcements
  FOR UPDATE USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND author_id = auth.uid()
  );

-- Only author can delete
CREATE POLICY "announcements_delete" ON announcements
  FOR DELETE USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND author_id = auth.uid()
  );

-- Reads: user can see own reads
CREATE POLICY "announcement_reads_select" ON announcement_reads
  FOR SELECT USING (
    tenant_id IN (SELECT get_user_tenant_ids())
  );

-- User can mark as read
CREATE POLICY "announcement_reads_insert" ON announcement_reads
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND user_id = auth.uid()
  );

-- ── Realtime ────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
