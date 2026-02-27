-- ============================================================================
-- Migration 058: Add 'reviewed' flag to recognitions for Fireflies auto-detect
-- Sprint 2.3.2
-- ============================================================================

-- Recognitions auto-detected from Fireflies start as unreviewed.
-- Manual recognitions default to reviewed=true.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recognitions' AND column_name = 'reviewed'
  ) THEN
    ALTER TABLE recognitions ADD COLUMN reviewed BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Meeting reference: which meeting originated this recognition
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recognitions' AND column_name = 'meeting_id'
  ) THEN
    ALTER TABLE recognitions ADD COLUMN meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Detection context: the original text snippet that was detected
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recognitions' AND column_name = 'detection_context'
  ) THEN
    ALTER TABLE recognitions ADD COLUMN detection_context TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_recognitions_reviewed
  ON recognitions(tenant_id, reviewed) WHERE reviewed = false;

CREATE INDEX IF NOT EXISTS idx_recognitions_source
  ON recognitions(tenant_id, source);
