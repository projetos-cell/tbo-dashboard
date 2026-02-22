-- ============================================================================
-- TBO OS — Migration 033: Page Blocks (Notion-style block editor)
--
-- Tabelas para editor de blocos:
--   page_blocks: blocos individuais de conteudo por pagina
--   block_links: slugs estaveis para "Link para o bloco"
-- Adiciona has_blocks na tabela pages existente.
-- ============================================================================

-- ── 1. Adicionar has_blocks na tabela pages ─────────────────────────────────
ALTER TABLE pages ADD COLUMN IF NOT EXISTS has_blocks BOOLEAN DEFAULT FALSE;

-- ── 2. Tabela page_blocks ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_blocks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  page_id         UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  parent_block_id UUID REFERENCES page_blocks(id) ON DELETE CASCADE,
  type            TEXT NOT NULL DEFAULT 'text',
  content         JSONB DEFAULT '{"text":"","marks":[]}',
  props           JSONB DEFAULT '{}',
  position        NUMERIC NOT NULL DEFAULT 0,
  created_by      UUID NOT NULL,
  updated_by      UUID NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_page_blocks_page
  ON page_blocks (page_id, position ASC);

CREATE INDEX IF NOT EXISTS idx_page_blocks_tenant
  ON page_blocks (tenant_id, page_id);

CREATE INDEX IF NOT EXISTS idx_page_blocks_parent
  ON page_blocks (parent_block_id)
  WHERE parent_block_id IS NOT NULL;

-- ── 3. RLS para page_blocks ─────────────────────────────────────────────────
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;

-- SELECT: usuarios do mesmo tenant podem ler blocos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'page_blocks_select' AND tablename = 'page_blocks') THEN
    CREATE POLICY page_blocks_select ON page_blocks
      FOR SELECT USING (
        tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
      );
  END IF;
END $$;

-- INSERT: usuarios do tenant podem criar blocos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'page_blocks_insert' AND tablename = 'page_blocks') THEN
    CREATE POLICY page_blocks_insert ON page_blocks
      FOR INSERT WITH CHECK (
        tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
        AND created_by = auth.uid()
      );
  END IF;
END $$;

-- UPDATE: usuarios do tenant podem editar blocos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'page_blocks_update' AND tablename = 'page_blocks') THEN
    CREATE POLICY page_blocks_update ON page_blocks
      FOR UPDATE USING (
        tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
      );
  END IF;
END $$;

-- DELETE: usuarios do tenant podem deletar blocos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'page_blocks_delete' AND tablename = 'page_blocks') THEN
    CREATE POLICY page_blocks_delete ON page_blocks
      FOR DELETE USING (
        tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
      );
  END IF;
END $$;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_page_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_page_blocks_updated_at') THEN
    CREATE TRIGGER trg_page_blocks_updated_at
      BEFORE UPDATE ON page_blocks
      FOR EACH ROW
      EXECUTE FUNCTION update_page_blocks_updated_at();
  END IF;
END $$;

-- ── 4. Tabela block_links ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS block_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL,
  block_id    UUID NOT NULL REFERENCES page_blocks(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indice unico para slug por tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_block_links_tenant_slug
  ON block_links (tenant_id, slug);

CREATE INDEX IF NOT EXISTS idx_block_links_block
  ON block_links (block_id);

-- ── 5. RLS para block_links ─────────────────────────────────────────────────
ALTER TABLE block_links ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'block_links_select' AND tablename = 'block_links') THEN
    CREATE POLICY block_links_select ON block_links
      FOR SELECT USING (
        tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'block_links_insert' AND tablename = 'block_links') THEN
    CREATE POLICY block_links_insert ON block_links
      FOR INSERT WITH CHECK (
        tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'block_links_delete' AND tablename = 'block_links') THEN
    CREATE POLICY block_links_delete ON block_links
      FOR DELETE USING (
        tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
      );
  END IF;
END $$;
