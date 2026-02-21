-- ============================================================================
-- Migration 026: Tabelas para Cultura, 1:1s e Performance
-- TBO OS — People Module (Supabase)
-- Executada em: 2026-02-21
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════
-- 1. RECOGNITIONS (Elogios / Reconhecimentos)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS recognitions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  from_user   UUID NOT NULL REFERENCES auth.users(id),
  to_user     UUID NOT NULL REFERENCES auth.users(id),
  value_id    TEXT NOT NULL,                     -- id do valor TBO (ex: 'qualidade', 'colaboracao')
  value_name  TEXT,                              -- nome do valor (cache)
  value_emoji TEXT,                              -- emoji do valor (cache)
  message     TEXT NOT NULL,
  likes       INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_recognitions_tenant ON recognitions(tenant_id);
CREATE INDEX idx_recognitions_to     ON recognitions(to_user);
CREATE INDEX idx_recognitions_from   ON recognitions(from_user);
CREATE INDEX idx_recognitions_date   ON recognitions(created_at DESC);

-- RLS
ALTER TABLE recognitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recognitions_select_tenant" ON recognitions
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "recognitions_insert_tenant" ON recognitions
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    AND from_user = auth.uid()
  );

CREATE POLICY "recognitions_update_own" ON recognitions
  FOR UPDATE USING (from_user = auth.uid());

CREATE POLICY "recognitions_delete_admin" ON recognitions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = recognitions.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- 2. FEEDBACKS (Feedback bidirecional)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS feedbacks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  from_user   UUID NOT NULL REFERENCES auth.users(id),
  to_user     UUID NOT NULL REFERENCES auth.users(id),
  type        TEXT NOT NULL CHECK (type IN ('positivo', 'construtivo')),
  visibility  TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'manager_only')),
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_feedbacks_tenant ON feedbacks(tenant_id);
CREATE INDEX idx_feedbacks_to     ON feedbacks(to_user);
CREATE INDEX idx_feedbacks_from   ON feedbacks(from_user);
CREATE INDEX idx_feedbacks_date   ON feedbacks(created_at DESC);

-- RLS
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Todos do tenant podem ver feedbacks publicos; privados so remetente/destinatario/admin
CREATE POLICY "feedbacks_select_tenant" ON feedbacks
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    AND (
      visibility = 'public'
      OR from_user = auth.uid()
      OR to_user = auth.uid()
      OR EXISTS (
        SELECT 1 FROM tenant_members tm
        JOIN roles r ON r.id = tm.role_id
        WHERE tm.user_id = auth.uid()
          AND tm.tenant_id = feedbacks.tenant_id
          AND r.name IN ('owner', 'admin', 'project_owner')
      )
    )
  );

CREATE POLICY "feedbacks_insert_tenant" ON feedbacks
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    AND from_user = auth.uid()
  );

CREATE POLICY "feedbacks_update_own" ON feedbacks
  FOR UPDATE USING (from_user = auth.uid());

CREATE POLICY "feedbacks_delete_admin" ON feedbacks
  FOR DELETE USING (
    from_user = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = feedbacks.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- 3. ONE_ON_ONES (Reunioes 1:1)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS one_on_ones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  leader_id       UUID NOT NULL REFERENCES auth.users(id),
  collaborator_id UUID NOT NULL REFERENCES auth.users(id),
  scheduled_at    TIMESTAMPTZ NOT NULL,
  status          TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes           TEXT,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_1on1_tenant       ON one_on_ones(tenant_id);
CREATE INDEX idx_1on1_leader       ON one_on_ones(leader_id);
CREATE INDEX idx_1on1_collaborator ON one_on_ones(collaborator_id);
CREATE INDEX idx_1on1_status       ON one_on_ones(status);
CREATE INDEX idx_1on1_scheduled    ON one_on_ones(scheduled_at);

-- RLS
ALTER TABLE one_on_ones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "1on1_select_tenant" ON one_on_ones
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    AND (
      leader_id = auth.uid()
      OR collaborator_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM tenant_members tm
        JOIN roles r ON r.id = tm.role_id
        WHERE tm.user_id = auth.uid()
          AND tm.tenant_id = one_on_ones.tenant_id
          AND r.name IN ('owner', 'admin', 'project_owner')
      )
    )
  );

CREATE POLICY "1on1_insert_tenant" ON one_on_ones
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "1on1_update_participant" ON one_on_ones
  FOR UPDATE USING (
    leader_id = auth.uid()
    OR collaborator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = one_on_ones.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

CREATE POLICY "1on1_delete_admin" ON one_on_ones
  FOR DELETE USING (
    leader_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = one_on_ones.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- 4. ONE_ON_ONE_ACTIONS (Acoes de 1:1)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS one_on_one_actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  one_on_one_id UUID NOT NULL REFERENCES one_on_ones(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  assignee_id UUID REFERENCES auth.users(id),
  due_date    DATE,
  completed   BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_1on1_actions_parent ON one_on_one_actions(one_on_one_id);
CREATE INDEX idx_1on1_actions_tenant ON one_on_one_actions(tenant_id);
CREATE INDEX idx_1on1_actions_assignee ON one_on_one_actions(assignee_id);

-- RLS (herda da one_on_ones — participantes ou admin)
ALTER TABLE one_on_one_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "1on1_actions_select" ON one_on_one_actions
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "1on1_actions_insert" ON one_on_one_actions
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "1on1_actions_update" ON one_on_one_actions
  FOR UPDATE USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "1on1_actions_delete" ON one_on_one_actions
  FOR DELETE USING (
    assignee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = one_on_one_actions.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- 5. PERFORMANCE_CYCLES (Ciclos de avaliacao)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS performance_cycles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,                     -- 'Q1 2026', 'Anual 2026'
  period      TEXT,                              -- 'trimestral', 'semestral', 'anual'
  start_date  DATE,
  end_date    DATE,
  status      TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_perf_cycles_tenant ON performance_cycles(tenant_id);
CREATE INDEX idx_perf_cycles_status ON performance_cycles(status);

-- RLS
ALTER TABLE performance_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perf_cycles_select" ON performance_cycles
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "perf_cycles_insert" ON performance_cycles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = performance_cycles.tenant_id
        AND r.name IN ('owner', 'admin', 'project_owner')
    )
  );

CREATE POLICY "perf_cycles_update" ON performance_cycles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = performance_cycles.tenant_id
        AND r.name IN ('owner', 'admin', 'project_owner')
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- 6. PERFORMANCE_REVIEWS (Avaliacoes individuais)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS performance_reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cycle_id     UUID NOT NULL REFERENCES performance_cycles(id) ON DELETE CASCADE,
  target_user  UUID NOT NULL REFERENCES auth.users(id),  -- avaliado
  reviewer     UUID NOT NULL REFERENCES auth.users(id),  -- avaliador
  review_type  TEXT NOT NULL CHECK (review_type IN ('self', 'manager', 'peer')),
  scores       JSONB NOT NULL DEFAULT '[]',               -- [{comp:'lideranca', nota:4}, ...]
  average      NUMERIC(3,2),                              -- media calculada
  highlights   TEXT[],                                    -- destaques
  gaps         TEXT[],                                    -- gaps
  comment      TEXT,                                      -- parecer textual
  status       TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged')),
  submitted_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cycle_id, target_user, reviewer, review_type)
);

CREATE INDEX idx_perf_reviews_tenant   ON performance_reviews(tenant_id);
CREATE INDEX idx_perf_reviews_cycle    ON performance_reviews(cycle_id);
CREATE INDEX idx_perf_reviews_target   ON performance_reviews(target_user);
CREATE INDEX idx_perf_reviews_reviewer ON performance_reviews(reviewer);

-- RLS
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;

-- Pode ver: o avaliador, o avaliado (so submitted), ou admin
CREATE POLICY "perf_reviews_select" ON performance_reviews
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    AND (
      reviewer = auth.uid()
      OR (target_user = auth.uid() AND status = 'submitted')
      OR EXISTS (
        SELECT 1 FROM tenant_members tm
        JOIN roles r ON r.id = tm.role_id
        WHERE tm.user_id = auth.uid()
          AND tm.tenant_id = performance_reviews.tenant_id
          AND r.name IN ('owner', 'admin', 'project_owner')
      )
    )
  );

CREATE POLICY "perf_reviews_insert" ON performance_reviews
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    AND reviewer = auth.uid()
  );

CREATE POLICY "perf_reviews_update" ON performance_reviews
  FOR UPDATE USING (
    reviewer = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = performance_reviews.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- 7. AUDIT TRIGGERS (reusar fn_audit_trigger existente da migration 006)
-- ════════════════════════════════════════════════════════════════════

-- Verificar se fn_audit_trigger existe antes de criar triggers
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_audit_trigger') THEN
    EXECUTE 'CREATE TRIGGER trg_audit_recognitions AFTER INSERT OR UPDATE OR DELETE ON recognitions FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()';
    EXECUTE 'CREATE TRIGGER trg_audit_feedbacks AFTER INSERT OR UPDATE OR DELETE ON feedbacks FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()';
    EXECUTE 'CREATE TRIGGER trg_audit_one_on_ones AFTER INSERT OR UPDATE OR DELETE ON one_on_ones FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()';
    EXECUTE 'CREATE TRIGGER trg_audit_perf_cycles AFTER INSERT OR UPDATE OR DELETE ON performance_cycles FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()';
    EXECUTE 'CREATE TRIGGER trg_audit_perf_reviews AFTER INSERT OR UPDATE OR DELETE ON performance_reviews FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()';
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════
-- 8. SEED: Ciclo de performance inicial
-- ════════════════════════════════════════════════════════════════════

-- Criar ciclo ativo para o tenant TBO (se existir)
INSERT INTO performance_cycles (tenant_id, name, period, start_date, end_date, status, created_by)
SELECT
  t.id,
  'Q1 2026',
  'trimestral',
  '2026-01-01',
  '2026-03-31',
  'active',
  (SELECT id FROM auth.users LIMIT 1)
FROM tenants t
WHERE t.slug = 'tbo'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FIM da Migration 026
-- ============================================================================
