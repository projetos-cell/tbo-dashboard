-- ============================================================================
-- TBO OS — Migration 015: Sidebar Items (Notion-style navigation)
--
-- Tabela central para itens da sidebar.
-- Cada item tem order_index fixo e tipo (system ou workspace).
-- A visibilidade é controlada por RBAC (campo allowed_roles).
-- ============================================================================

-- ── Tabela sidebar_items ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sidebar_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  parent_id     UUID REFERENCES sidebar_items(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('system', 'workspace', 'separator')),
  order_index   INTEGER NOT NULL,
  icon          TEXT DEFAULT 'file',
  route         TEXT,              -- rota hash (ex: 'dashboard', 'agenda')
  is_expanded   BOOLEAN DEFAULT TRUE,
  is_visible    BOOLEAN DEFAULT TRUE,
  allowed_roles TEXT[] DEFAULT '{}',  -- roles que podem ver (vazio = todos)
  metadata      JSONB DEFAULT '{}',   -- dados extras (cor, badge_key, etc.)
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, order_index)
);

-- ── Tabela sidebar_user_state ─────────────────────────────────────────────
-- Estado por usuário (expandido/recolhido, favoritos)
CREATE TABLE IF NOT EXISTS sidebar_user_state (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  user_id       UUID NOT NULL,
  item_id       UUID NOT NULL REFERENCES sidebar_items(id) ON DELETE CASCADE,
  is_expanded   BOOLEAN DEFAULT TRUE,
  is_pinned     BOOLEAN DEFAULT FALSE,
  last_accessed TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, user_id, item_id)
);

-- ── Índices ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sidebar_items_tenant_order
  ON sidebar_items (tenant_id, order_index);

CREATE INDEX IF NOT EXISTS idx_sidebar_items_tenant_parent
  ON sidebar_items (tenant_id, parent_id);

CREATE INDEX IF NOT EXISTS idx_sidebar_items_tenant_type
  ON sidebar_items (tenant_id, type);

CREATE INDEX IF NOT EXISTS idx_sidebar_user_state_user
  ON sidebar_user_state (tenant_id, user_id);

-- ── RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE sidebar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sidebar_user_state ENABLE ROW LEVEL SECURITY;

-- Sidebar items: leitura para membros do tenant
CREATE POLICY sidebar_items_select ON sidebar_items
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- Sidebar items: escrita apenas para admin/owner
CREATE POLICY sidebar_items_insert ON sidebar_items
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tm.tenant_id FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.is_active = TRUE
        AND r.slug IN ('owner', 'admin')
    )
  );

CREATE POLICY sidebar_items_update ON sidebar_items
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.is_active = TRUE
        AND r.slug IN ('owner', 'admin')
    )
  );

CREATE POLICY sidebar_items_delete ON sidebar_items
  FOR DELETE USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.is_active = TRUE
        AND r.slug IN ('owner', 'admin')
    )
  );

-- User state: cada usuário gerencia o próprio estado
CREATE POLICY sidebar_user_state_select ON sidebar_user_state
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY sidebar_user_state_insert ON sidebar_user_state
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY sidebar_user_state_update ON sidebar_user_state
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY sidebar_user_state_delete ON sidebar_user_state
  FOR DELETE USING (user_id = auth.uid());

-- ── Seed: itens padrão ────────────────────────────────────────────────────
-- NOTA: Este INSERT deve ser executado manualmente por tenant.
-- O seeder abaixo é um template — substituir TENANT_ID pelo UUID real.
--
-- Para usar, descomentar e substituir '00000000-0000-0000-0000-000000000000':
/*
DO $$
DECLARE
  _tid UUID := '00000000-0000-0000-0000-000000000000'; -- substituir pelo tenant_id real
  _sep UUID;
BEGIN
  -- 1. Home
  INSERT INTO sidebar_items (tenant_id, name, type, order_index, icon, route, allowed_roles)
  VALUES (_tid, 'Home', 'system', 1, 'home', 'dashboard', '{}');

  -- 2. Buscar
  INSERT INTO sidebar_items (tenant_id, name, type, order_index, icon, route, allowed_roles, metadata)
  VALUES (_tid, 'Buscar', 'system', 2, 'search', NULL, '{}', '{"action": "search"}');

  -- 3. Página inicial
  INSERT INTO sidebar_items (tenant_id, name, type, order_index, icon, route, allowed_roles)
  VALUES (_tid, 'Página inicial', 'system', 3, 'layout-dashboard', 'workspace', '{}');

  -- 4. Reuniões
  INSERT INTO sidebar_items (tenant_id, name, type, order_index, icon, route, allowed_roles)
  VALUES (_tid, 'Reuniões', 'system', 4, 'calendar', 'agenda', '{}');

  -- 5. IA TBO
  INSERT INTO sidebar_items (tenant_id, name, type, order_index, icon, route, allowed_roles, metadata)
  VALUES (_tid, 'IA TBO', 'system', 5, 'sparkles', NULL, '{}', '{"action": "ai-assistant"}');

  -- 6. Caixa de entrada
  INSERT INTO sidebar_items (tenant_id, name, type, order_index, icon, route, allowed_roles, metadata)
  VALUES (_tid, 'Caixa de entrada', 'system', 6, 'inbox', 'alerts', '{}', '{"badge_key": "alerts"}');

  -- 7. Biblioteca
  INSERT INTO sidebar_items (tenant_id, name, type, order_index, icon, route, allowed_roles)
  VALUES (_tid, 'Biblioteca', 'system', 7, 'library', 'biblioteca', '{}');

  -- 8. Separador
  INSERT INTO sidebar_items (tenant_id, name, type, order_index, icon, allowed_roles)
  VALUES (_tid, 'Espaços de equipe', 'separator', 8, 'users', '{}')
  RETURNING id INTO _sep;

  -- 9. Geral
  INSERT INTO sidebar_items (tenant_id, parent_id, name, type, order_index, icon, allowed_roles)
  VALUES (_tid, _sep, 'Geral', 'workspace', 9, 'globe', '{}');

  -- 10. Branding
  INSERT INTO sidebar_items (tenant_id, parent_id, name, type, order_index, icon, allowed_roles)
  VALUES (_tid, _sep, 'Branding', 'workspace', 10, 'palette', '{"owner","admin","diretor","po","pm","creative-dir","design","copy","qa"}');

  -- 11. Digital 3D
  INSERT INTO sidebar_items (tenant_id, parent_id, name, type, order_index, icon, allowed_roles)
  VALUES (_tid, _sep, 'Digital 3D', 'workspace', 11, 'box', '{"owner","admin","diretor","po","pm","creative-dir","3d-lead","3d-artist","qa"}');

  -- 12. Audiovisual
  INSERT INTO sidebar_items (tenant_id, parent_id, name, type, order_index, icon, allowed_roles)
  VALUES (_tid, _sep, 'Audiovisual', 'workspace', 12, 'video', '{"owner","admin","diretor","po","pm","creative-dir","motion","qa","3d-lead","3d-artist"}');

  -- 13. Marketing
  INSERT INTO sidebar_items (tenant_id, parent_id, name, type, order_index, icon, allowed_roles)
  VALUES (_tid, _sep, 'Marketing', 'workspace', 13, 'megaphone', '{"owner","admin","diretor","po","pm","copy","design","qa"}');

  -- 14. Comercial
  INSERT INTO sidebar_items (tenant_id, parent_id, name, type, order_index, icon, allowed_roles)
  VALUES (_tid, _sep, 'Comercial', 'workspace', 14, 'briefcase', '{"owner","admin","diretor","comercial","cs","financeiro"}');

  -- 15. Diretoria TBO
  INSERT INTO sidebar_items (tenant_id, parent_id, name, type, order_index, icon, allowed_roles)
  VALUES (_tid, _sep, 'Diretoria TBO', 'workspace', 15, 'shield', '{"owner","admin","diretor"}');

  -- 16. Mais
  INSERT INTO sidebar_items (tenant_id, name, type, order_index, icon, allowed_roles, metadata)
  VALUES (_tid, 'Mais', 'system', 16, 'plus', '{}', '{"action": "show-more-workspaces"}');

END $$;
*/
