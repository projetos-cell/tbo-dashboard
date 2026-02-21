-- ============================================================================
-- TBO OS — Migration 020: Fireflies Meeting Sync
-- Estende meetings com colunas Fireflies + cria tabelas de transcrições,
-- participantes e log de sincronização.
-- PRD v1.2 — Integração Fireflies obrigatória
-- ============================================================================

-- 1. Estender meetings com colunas Fireflies
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS fireflies_id TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS fireflies_url TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS organizer_email TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS overview TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS short_summary TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS sync_source TEXT DEFAULT 'manual';
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS host_email TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS meeting_link TEXT;

-- 2. Unique index para upsert por fireflies_id (tenant-scoped, parcial — ignora NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_meetings_fireflies
  ON meetings(tenant_id, fireflies_id) WHERE fireflies_id IS NOT NULL;

-- 3. Transcrições (sentences do Fireflies)
CREATE TABLE IF NOT EXISTS meeting_transcriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  meeting_id      UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  speaker_name    TEXT,
  speaker_email   TEXT,
  text            TEXT NOT NULL,
  start_time      NUMERIC,
  end_time        NUMERIC,
  raw_index       INT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meeting_transcriptions_meeting
  ON meeting_transcriptions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_transcriptions_tenant
  ON meeting_transcriptions(tenant_id);

-- 4. Participantes (normalizada — um registro por email por reunião)
CREATE TABLE IF NOT EXISTS meeting_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  meeting_id      UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  email           TEXT,
  display_name    TEXT,
  is_tbo          BOOLEAN DEFAULT false,
  profile_id      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(meeting_id, email)
);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting
  ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_tenant
  ON meeting_participants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_email
  ON meeting_participants(email);

-- 5. Sync log Fireflies
CREATE TABLE IF NOT EXISTS fireflies_sync_log (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  started_at            TIMESTAMPTZ DEFAULT now(),
  finished_at           TIMESTAMPTZ,
  status                TEXT DEFAULT 'running'
                        CHECK (status IN ('running','success','partial','error')),
  meetings_fetched      INT DEFAULT 0,
  meetings_created      INT DEFAULT 0,
  meetings_updated      INT DEFAULT 0,
  transcriptions_synced INT DEFAULT 0,
  errors                JSONB DEFAULT '[]',
  triggered_by          UUID,
  trigger_source        TEXT DEFAULT 'manual'
                        CHECK (trigger_source IN ('manual','auto','zapier','webhook'))
);

CREATE INDEX IF NOT EXISTS idx_fireflies_sync_log_tenant
  ON fireflies_sync_log(tenant_id);

-- 6. RLS — meeting_transcriptions
ALTER TABLE meeting_transcriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY meeting_transcriptions_select ON meeting_transcriptions
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY meeting_transcriptions_insert ON meeting_transcriptions
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY meeting_transcriptions_update ON meeting_transcriptions
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- 7. RLS — meeting_participants
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY meeting_participants_select ON meeting_participants
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY meeting_participants_insert ON meeting_participants
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY meeting_participants_update ON meeting_participants
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- 8. RLS — fireflies_sync_log
ALTER TABLE fireflies_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY fireflies_sync_log_select ON fireflies_sync_log
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY fireflies_sync_log_insert ON fireflies_sync_log
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY fireflies_sync_log_update ON fireflies_sync_log
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- 8b. DELETE policy para meeting_transcriptions (necessária para re-sync)
CREATE POLICY meeting_transcriptions_delete ON meeting_transcriptions
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- 9. Audit trigger para meetings (reutiliza fn_audit_trigger existente)
-- A função fn_audit_trigger já existe da migration 006_v7_rbac_audit.sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_meetings') THEN
    CREATE TRIGGER trg_audit_meetings
      AFTER INSERT OR UPDATE OR DELETE ON meetings
      FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
  END IF;
EXCEPTION
  WHEN undefined_function THEN
    RAISE NOTICE 'fn_audit_trigger não existe — pulando trigger de audit para meetings';
END $$;

-- ============================================================================
-- FIM da Migration 020
-- ============================================================================
