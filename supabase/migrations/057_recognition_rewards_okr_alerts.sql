-- ============================================================================
-- Migration 057: Recognition Rewards/Redemptions + OKR Alert Support
-- Fase 2 — Sprint 2.3 (Reconhecimentos) + Sprint 2.1.6 (OKR Alerts)
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════
-- 1. ADD POINTS TO RECOGNITIONS
-- ════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recognitions' AND column_name = 'points'
  ) THEN
    ALTER TABLE recognitions ADD COLUMN points INT DEFAULT 1;
  END IF;
END $$;

-- Source: manual (form), fireflies (auto-detected), chat
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recognitions' AND column_name = 'source'
  ) THEN
    ALTER TABLE recognitions ADD COLUMN source TEXT DEFAULT 'manual'
      CHECK (source IN ('manual', 'fireflies', 'chat'));
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════
-- 2. RECOGNITION_REWARDS (Catalogo de recompensas)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS recognition_rewards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  points_required INT NOT NULL DEFAULT 20,
  type            TEXT DEFAULT 'voucher' CHECK (type IN ('voucher', 'experience', 'gift', 'custom')),
  value_brl       NUMERIC(10,2),                 -- valor em R$ (ex: 200.00)
  active          BOOLEAN DEFAULT true,
  budget_quarter  NUMERIC(10,2),                 -- budget trimestral para este reward
  image_url       TEXT,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rewards_tenant ON recognition_rewards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON recognition_rewards(tenant_id, active);

-- RLS
ALTER TABLE recognition_rewards ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recognition_rewards' AND policyname = 'rewards_select_tenant') THEN
    CREATE POLICY rewards_select_tenant ON recognition_rewards
      FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recognition_rewards' AND policyname = 'rewards_insert_admin') THEN
    CREATE POLICY rewards_insert_admin ON recognition_rewards
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid()
            AND tm.tenant_id = recognition_rewards.tenant_id
            AND r.name IN ('owner', 'admin')
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recognition_rewards' AND policyname = 'rewards_update_admin') THEN
    CREATE POLICY rewards_update_admin ON recognition_rewards
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid()
            AND tm.tenant_id = recognition_rewards.tenant_id
            AND r.name IN ('owner', 'admin')
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recognition_rewards' AND policyname = 'rewards_delete_admin') THEN
    CREATE POLICY rewards_delete_admin ON recognition_rewards
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid()
            AND tm.tenant_id = recognition_rewards.tenant_id
            AND r.name IN ('owner', 'admin')
        )
      );
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════
-- 3. RECOGNITION_REDEMPTIONS (Resgates de recompensas)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS recognition_redemptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  reward_id   UUID NOT NULL REFERENCES recognition_rewards(id) ON DELETE CASCADE,
  points_spent INT NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  notes       TEXT,
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_redemptions_tenant ON recognition_redemptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_user   ON recognition_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON recognition_redemptions(tenant_id, status);

-- RLS
ALTER TABLE recognition_redemptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recognition_redemptions' AND policyname = 'redemptions_select') THEN
    CREATE POLICY redemptions_select ON recognition_redemptions
      FOR SELECT USING (
        tenant_id IN (SELECT get_user_tenant_ids())
        AND (
          user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM tenant_members tm
            JOIN roles r ON r.id = tm.role_id
            WHERE tm.user_id = auth.uid()
              AND tm.tenant_id = recognition_redemptions.tenant_id
              AND r.name IN ('owner', 'admin')
          )
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recognition_redemptions' AND policyname = 'redemptions_insert') THEN
    CREATE POLICY redemptions_insert ON recognition_redemptions
      FOR INSERT WITH CHECK (
        tenant_id IN (SELECT get_user_tenant_ids())
        AND user_id = auth.uid()
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recognition_redemptions' AND policyname = 'redemptions_update_admin') THEN
    CREATE POLICY redemptions_update_admin ON recognition_redemptions
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM tenant_members tm
          JOIN roles r ON r.id = tm.role_id
          WHERE tm.user_id = auth.uid()
            AND tm.tenant_id = recognition_redemptions.tenant_id
            AND r.name IN ('owner', 'admin')
        )
      );
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════
-- 4. ONE_ON_ONES: add fireflies_meeting_id for matching
-- ════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'one_on_ones' AND column_name = 'fireflies_meeting_id'
  ) THEN
    ALTER TABLE one_on_ones ADD COLUMN fireflies_meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'one_on_ones' AND column_name = 'transcript_summary'
  ) THEN
    ALTER TABLE one_on_ones ADD COLUMN transcript_summary TEXT;
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════
-- 5. ONE_ON_ONE_ACTIONS: add pdi_link_id + category
-- ════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'one_on_one_actions' AND column_name = 'pdi_link_id'
  ) THEN
    ALTER TABLE one_on_one_actions ADD COLUMN pdi_link_id UUID;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'one_on_one_actions' AND column_name = 'category'
  ) THEN
    ALTER TABLE one_on_one_actions ADD COLUMN category TEXT DEFAULT 'operacional'
      CHECK (category IN ('feedback', 'desenvolvimento', 'operacional'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'one_on_one_actions' AND column_name = 'source'
  ) THEN
    ALTER TABLE one_on_one_actions ADD COLUMN source TEXT DEFAULT 'manual'
      CHECK (source IN ('manual', 'ai_extracted'));
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════
-- 6. SEED: Default rewards for TBO tenant
-- ════════════════════════════════════════════════════════════════════

INSERT INTO recognition_rewards (tenant_id, name, description, points_required, type, value_brl, active)
SELECT
  t.id,
  unnest(ARRAY['Voucher Restaurante', 'Ingresso Cinemark', 'Day Off', 'Gift Card iFood']),
  unnest(ARRAY[
    'Voucher de R$200 em restaurante à escolha',
    'Ingresso de cinema Cinemark (poltrona + combo)',
    'Um dia de folga remunerado à escolha',
    'Gift Card iFood no valor de R$100'
  ]),
  unnest(ARRAY[20, 15, 25, 10]),
  unnest(ARRAY['voucher', 'experience', 'custom', 'voucher']::text[]),
  unnest(ARRAY[200.00, 50.00, 0.00, 100.00]),
  true
FROM tenants t
WHERE t.slug = 'tbo'
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════
-- 7. AUDIT TRIGGERS
-- ════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_audit_trigger') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_recognition_rewards') THEN
      EXECUTE 'CREATE TRIGGER trg_audit_recognition_rewards AFTER INSERT OR UPDATE OR DELETE ON recognition_rewards FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_recognition_redemptions') THEN
      EXECUTE 'CREATE TRIGGER trg_audit_recognition_redemptions AFTER INSERT OR UPDATE OR DELETE ON recognition_redemptions FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- FIM da Migration 057
-- ============================================================================
