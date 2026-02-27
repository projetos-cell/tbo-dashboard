-- ============================================================================
-- TBO OS — Migration 059: Vincular 1:1s ao Fireflies
-- Sprint 2.2.3: Campos para linking de transcrição + ações extraídas por IA
-- Idempotente: seguro re-executar.
-- ============================================================================

-- 1. Campos Fireflies na tabela one_on_ones
ALTER TABLE one_on_ones ADD COLUMN IF NOT EXISTS fireflies_meeting_id UUID REFERENCES meetings(id);
ALTER TABLE one_on_ones ADD COLUMN IF NOT EXISTS transcript_summary TEXT;
ALTER TABLE one_on_ones ADD COLUMN IF NOT EXISTS transcript_processed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_1on1_fireflies_meeting ON one_on_ones(fireflies_meeting_id) WHERE fireflies_meeting_id IS NOT NULL;

-- 2. Campo source nas ações de 1:1 (manual vs ai_extracted)
ALTER TABLE one_on_one_actions ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE one_on_one_actions ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC(3,2);
ALTER TABLE one_on_one_actions ADD COLUMN IF NOT EXISTS category TEXT;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_action_source'
  ) THEN
    ALTER TABLE one_on_one_actions ADD CONSTRAINT chk_action_source
      CHECK (source IN ('manual', 'ai_extracted', 'fireflies'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_action_category'
  ) THEN
    ALTER TABLE one_on_one_actions ADD CONSTRAINT chk_action_category
      CHECK (category IS NULL OR category IN ('feedback', 'desenvolvimento', 'operacional', 'pdi', 'follow_up'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_1on1_actions_source ON one_on_one_actions(source);

-- 3. Tabela de processamento de transcrições (log + cache)
CREATE TABLE IF NOT EXISTS one_on_one_transcript_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  one_on_one_id   UUID NOT NULL REFERENCES one_on_ones(id) ON DELETE CASCADE,
  meeting_id      UUID REFERENCES meetings(id),
  raw_transcript  TEXT,
  ai_summary      TEXT,
  ai_actions      JSONB DEFAULT '[]',
  ai_model        TEXT,
  tokens_used     INT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_transcript_logs_1on1 ON one_on_one_transcript_logs(one_on_one_id);
CREATE INDEX IF NOT EXISTS idx_transcript_logs_tenant ON one_on_one_transcript_logs(tenant_id);

-- RLS
ALTER TABLE one_on_one_transcript_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'transcript_logs_select' AND tablename = 'one_on_one_transcript_logs') THEN
    CREATE POLICY transcript_logs_select ON one_on_one_transcript_logs
      FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'transcript_logs_insert' AND tablename = 'one_on_one_transcript_logs') THEN
    CREATE POLICY transcript_logs_insert ON one_on_one_transcript_logs
      FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'transcript_logs_update' AND tablename = 'one_on_one_transcript_logs') THEN
    CREATE POLICY transcript_logs_update ON one_on_one_transcript_logs
      FOR UPDATE USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

-- 4. Audit trigger
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_audit_trigger') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_transcript_logs') THEN
      EXECUTE 'CREATE TRIGGER trg_audit_transcript_logs AFTER INSERT OR UPDATE OR DELETE ON one_on_one_transcript_logs FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- FIM da Migration 059
-- ============================================================================
