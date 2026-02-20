-- ============================================================================
-- TBO OS — Migration 016: Pages (documentos Notion-style)
--
-- Tabela de paginas criadas via overlay "Adicionar a...".
-- Cada pagina pertence a um space (workspace sidebar_item).
-- Conteudo armazenado como JSONB para blocos futuros.
-- ============================================================================

-- Tabela pages
CREATE TABLE IF NOT EXISTS pages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  space_id      TEXT NOT NULL,
  title         TEXT NOT NULL DEFAULT 'Nova página',
  content       JSONB DEFAULT '{}',
  icon          TEXT,
  cover_url     TEXT,
  is_deleted    BOOLEAN DEFAULT FALSE,
  created_by    UUID NOT NULL,
  updated_by    UUID NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_pages_tenant_space
  ON pages (tenant_id, space_id)
  WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_pages_tenant_created
  ON pages (tenant_id, created_at DESC)
  WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_pages_created_by
  ON pages (created_by);

-- RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- SELECT: membros do mesmo tenant podem ler paginas
CREATE POLICY pages_select ON pages
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- INSERT: membros do tenant podem criar paginas
CREATE POLICY pages_insert ON pages
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
    AND created_by = auth.uid()
  );

-- UPDATE: membros do tenant podem editar paginas
CREATE POLICY pages_update ON pages
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- DELETE: apenas criador ou admin/owner
CREATE POLICY pages_delete ON pages
  FOR DELETE USING (
    created_by = auth.uid()
    OR tenant_id IN (
      SELECT tm.tenant_id FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.is_active = TRUE
        AND r.slug IN ('owner', 'admin')
    )
  );

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_pages_updated_at();
