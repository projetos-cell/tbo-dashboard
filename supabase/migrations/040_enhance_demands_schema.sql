-- ============================================================================
-- TBO OS — Migration 040: Enhance demands schema for full Notion field coverage
--
-- Adds missing columns to the demands table to support all Notion BD Demandas fields:
--   - milestones (text) — rich text field from Notion
--   - feito (boolean) — checkbox "Feito"
--   - subitem_ids (text[]) — Notion relation refs for "Subitem"
--   - item_principal_id (text) — Notion relation ref for "item principal"
--   - responsavel_json (jsonb) — full person data (name, email, avatar)
--
-- Also adds indexes for common filter patterns (bus, feito, priority).
--
-- IDEMPOTENTE: seguro executar multiplas vezes.
-- ============================================================================

DO $$ BEGIN
  -- milestones: rich text from Notion "Milestones" property
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demands' AND column_name='milestones') THEN
    ALTER TABLE demands ADD COLUMN milestones TEXT;
  END IF;

  -- feito: checkbox from Notion "Feito" property
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demands' AND column_name='feito') THEN
    ALTER TABLE demands ADD COLUMN feito BOOLEAN DEFAULT false;
  END IF;

  -- subitem_ids: Notion page IDs from "Subitem" relation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demands' AND column_name='subitem_ids') THEN
    ALTER TABLE demands ADD COLUMN subitem_ids TEXT[] DEFAULT '{}';
  END IF;

  -- item_principal_id: Notion page ID from "item principal" relation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demands' AND column_name='item_principal_id') THEN
    ALTER TABLE demands ADD COLUMN item_principal_id TEXT;
  END IF;

  -- responsavel_json: full person object {name, email, avatar_url}
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demands' AND column_name='responsavel_json') THEN
    ALTER TABLE demands ADD COLUMN responsavel_json JSONB;
  END IF;
END $$;

-- ── Indexes for filter performance ───────────────────────────────────────────

-- GIN index on bus array for "BU Envolvida" filter (supports @> operator)
CREATE INDEX IF NOT EXISTS idx_demands_bus_gin ON demands USING GIN (bus);

-- Index on feito for "Feito" checkbox filter
CREATE INDEX IF NOT EXISTS idx_demands_feito ON demands (feito) WHERE feito IS NOT NULL;

-- Index on priority for "Prioridade" filter
CREATE INDEX IF NOT EXISTS idx_demands_priority ON demands (priority) WHERE priority IS NOT NULL;

-- Index on responsible for "Responsavel" filter
CREATE INDEX IF NOT EXISTS idx_demands_responsible ON demands (responsible) WHERE responsible IS NOT NULL;

-- ============================================================================
-- FIM da migration 040
-- ============================================================================
