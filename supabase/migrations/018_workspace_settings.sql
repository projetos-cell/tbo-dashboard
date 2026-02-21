-- ============================================================================
-- TBO OS — Migration 018: Workspace Settings & Members
--
-- Estende sidebar_items para workspaces com icon/description/archive/delete.
-- Cria tabelas: space_members, space_invitations, user_recent_icons.
-- RLS completo para isolamento multi-tenant e RBAC por espaço.
-- ============================================================================

-- ── 1. Ampliar CHECK de sidebar_items para incluir 'child' ─────────────
ALTER TABLE sidebar_items DROP CONSTRAINT IF EXISTS sidebar_items_type_check;
ALTER TABLE sidebar_items ADD CONSTRAINT sidebar_items_type_check
  CHECK (type IN ('system', 'workspace', 'separator', 'child'));

-- ── 2. Colunas de workspace em sidebar_items ───────────────────────────
ALTER TABLE sidebar_items
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS icon_type TEXT DEFAULT 'lucide',
  ADD COLUMN IF NOT EXISTS icon_value TEXT,
  ADD COLUMN IF NOT EXISTS icon_url TEXT,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by UUID,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID;

-- ── 3. space_members — membership por workspace com roles ──────────────
CREATE TABLE IF NOT EXISTS space_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  space_id    UUID NOT NULL REFERENCES sidebar_items(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member'
              CHECK (role IN ('owner', 'admin', 'member')),
  invited_by  UUID,
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, space_id, user_id)
);

-- ── 4. space_invitations — convites pendentes ──────────────────────────
CREATE TABLE IF NOT EXISTS space_invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  space_id    UUID NOT NULL REFERENCES sidebar_items(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member'
              CHECK (role IN ('admin', 'member')),
  invited_by  UUID NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  token       UUID DEFAULT gen_random_uuid(),
  expires_at  TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, space_id, email, status)
);

-- ── 5. user_recent_icons — ícones recentes por usuário ─────────────────
CREATE TABLE IF NOT EXISTS user_recent_icons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL,
  icon_type   TEXT NOT NULL CHECK (icon_type IN ('lucide', 'emoji')),
  icon_value  TEXT NOT NULL,
  used_at     TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, user_id, icon_type, icon_value)
);

-- ── 6. Índices ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_space_members_space
  ON space_members(tenant_id, space_id);

CREATE INDEX IF NOT EXISTS idx_space_members_user
  ON space_members(tenant_id, user_id);

CREATE INDEX IF NOT EXISTS idx_space_invitations_space
  ON space_invitations(tenant_id, space_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_user_recent_icons_user
  ON user_recent_icons(tenant_id, user_id);

-- ── 7. RLS ─────────────────────────────────────────────────────────────
ALTER TABLE space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recent_icons ENABLE ROW LEVEL SECURITY;

-- space_members: leitura para membros do tenant
CREATE POLICY space_members_select ON space_members
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- space_members: insert para membros do tenant (app valida permissão de espaço)
CREATE POLICY space_members_insert ON space_members
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- space_members: update para owner/admin do tenant OU owner/admin do espaço
CREATE POLICY space_members_update ON space_members
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
        AND r.slug IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM space_members sm
      WHERE sm.space_id = space_members.space_id
        AND sm.user_id = auth.uid()
        AND sm.role IN ('owner', 'admin')
    )
  );

-- space_members: delete para o próprio usuário OU owner/admin
CREATE POLICY space_members_delete ON space_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR tenant_id IN (
      SELECT tm.tenant_id FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
        AND r.slug IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM space_members sm
      WHERE sm.space_id = space_members.space_id
        AND sm.user_id = auth.uid()
        AND sm.role IN ('owner', 'admin')
    )
  );

-- space_invitations: leitura para membros do tenant
CREATE POLICY space_invitations_select ON space_invitations
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- space_invitations: insert para membros do tenant
CREATE POLICY space_invitations_insert ON space_invitations
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- space_invitations: update para owner/admin do tenant OU do espaço
CREATE POLICY space_invitations_update ON space_invitations
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid() AND tm.is_active = TRUE
        AND r.slug IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM space_members sm
      WHERE sm.space_id = space_invitations.space_id
        AND sm.user_id = auth.uid()
        AND sm.role IN ('owner', 'admin')
    )
  );

-- user_recent_icons: cada usuário gerencia o próprio
CREATE POLICY user_recent_icons_select ON user_recent_icons
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY user_recent_icons_insert ON user_recent_icons
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY user_recent_icons_delete ON user_recent_icons
  FOR DELETE USING (user_id = auth.uid());

-- ── 8. Storage bucket para ícones de workspace ─────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-icons', 'workspace-icons', true)
ON CONFLICT (id) DO NOTHING;
