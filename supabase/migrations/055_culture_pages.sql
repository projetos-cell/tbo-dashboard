-- ============================================================================
-- Migration 055: Tabela culture_pages
-- TBO OS — Modulo Cultura (paginas customizadas)
-- Referenciada em modules/cultura.js mas nao existia no banco.
-- ============================================================================

CREATE TABLE IF NOT EXISTS culture_pages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL,
  content       TEXT,
  category      TEXT DEFAULT 'geral' CHECK (category IN ('geral', 'valores', 'praticas', 'rituais', 'padroes')),
  is_published  BOOLEAN DEFAULT false,
  order_index   INTEGER DEFAULT 0,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_culture_pages_tenant ON culture_pages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_culture_pages_slug   ON culture_pages(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_culture_pages_order  ON culture_pages(tenant_id, order_index);

-- RLS
ALTER TABLE culture_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "culture_pages_select_tenant" ON culture_pages
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "culture_pages_insert_tenant" ON culture_pages
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "culture_pages_update_admin" ON culture_pages
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = culture_pages.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

CREATE POLICY "culture_pages_delete_admin" ON culture_pages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = culture_pages.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

-- Trigger: auto-update updated_at
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_culture_pages_updated_at') THEN
    CREATE TRIGGER trg_culture_pages_updated_at
      BEFORE UPDATE ON culture_pages
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
