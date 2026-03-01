-- ============================================================================
-- TBO People OS — Migration 072: PDIs Table + People KPIs RPC
--
-- Creates:
--   1. pdis table (Plano de Desenvolvimento Individual)
--   2. get_people_kpis() RPC — returns 8 KPI counts in a single call
--
-- IDEMPOTENT: safe to run multiple times.
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- pdis — Planos de Desenvolvimento Individual
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pdis (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  person_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'Em andamento'
                  CHECK (status IN ('Em andamento', 'Concluido', 'Atrasado', 'Cancelado')),
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pdis_tenant   ON pdis(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pdis_person   ON pdis(person_id);
CREATE INDEX IF NOT EXISTS idx_pdis_status   ON pdis(status);

ALTER TABLE pdis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pdis_select" ON pdis;
DROP POLICY IF EXISTS "pdis_insert" ON pdis;
DROP POLICY IF EXISTS "pdis_update" ON pdis;
DROP POLICY IF EXISTS "pdis_delete" ON pdis;

CREATE POLICY "pdis_select" ON pdis
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "pdis_insert" ON pdis
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "pdis_update" ON pdis
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "pdis_delete" ON pdis
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ═══════════════════════════════════════════════════════════════════════════
-- get_people_kpis(p_tenant_id) — 8 KPIs in 1 round-trip
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_people_kpis(p_tenant_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result JSON;
BEGIN
  WITH
  -- Base sets
  all_people AS (
    SELECT id, status, media_avaliacao
    FROM profiles
    WHERE tenant_id = p_tenant_id
  ),
  active_people AS (
    SELECT id, media_avaliacao
    FROM all_people
    WHERE status = 'active'
  ),

  -- KPI 4: Em risco = ativos com avaliação < 60 OU PDI atrasado
  at_risk AS (
    SELECT COUNT(DISTINCT ap.id) AS cnt
    FROM active_people ap
    LEFT JOIN pdis pd ON pd.person_id = ap.id AND pd.tenant_id = p_tenant_id
    WHERE (ap.media_avaliacao IS NOT NULL AND ap.media_avaliacao < 60)
       OR pd.status = 'Atrasado'
  ),

  -- KPI 5: 1:1 pendentes = ativos sem 1:1 concluído nos últimos 30 dias
  last_1on1 AS (
    SELECT o.collaborator_id AS person_id, MAX(o.scheduled_at) AS last_at
    FROM one_on_ones o
    WHERE o.tenant_id = p_tenant_id
      AND o.status = 'completed'
    GROUP BY o.collaborator_id
  ),
  pending_1on1 AS (
    SELECT COUNT(*) AS cnt
    FROM active_people ap
    LEFT JOIN last_1on1 l ON l.person_id = ap.id
    WHERE l.last_at IS NULL OR l.last_at < (now() - INTERVAL '30 days')
  ),

  -- KPI 6: PDIs desatualizados = ativos sem PDI atualizado nos últimos 90 dias
  latest_pdi AS (
    SELECT pd.person_id, MAX(pd.last_updated_at) AS last_upd
    FROM pdis pd
    WHERE pd.tenant_id = p_tenant_id
    GROUP BY pd.person_id
  ),
  stale_pdi AS (
    SELECT COUNT(*) AS cnt
    FROM active_people ap
    LEFT JOIN latest_pdi lp ON lp.person_id = ap.id
    WHERE lp.last_upd IS NULL OR lp.last_upd < (now() - INTERVAL '90 days')
  ),

  -- KPI 7: Reconhecimentos do mês
  month_recognitions AS (
    SELECT COUNT(*) AS cnt
    FROM recognitions r
    WHERE r.tenant_id = p_tenant_id
      AND r.created_at >= date_trunc('month', now())
  ),

  -- KPI 8: Overload = ativos com >= 8 tarefas abertas (os_tasks + person_tasks)
  task_counts AS (
    SELECT person_id AS pid, SUM(cnt) AS total_tasks
    FROM (
      -- os_tasks: assignee_id is UUID, cast to text for union
      SELECT assignee_id::text AS person_id, COUNT(*) AS cnt
      FROM os_tasks
      WHERE tenant_id = p_tenant_id
        AND (is_completed = false OR is_completed IS NULL)
        AND assignee_id IS NOT NULL
      GROUP BY assignee_id

      UNION ALL

      -- person_tasks: person_id is already text
      SELECT person_id, COUNT(*) AS cnt
      FROM person_tasks
      WHERE tenant_id = p_tenant_id
        AND (status IS NULL OR status NOT IN ('concluida', 'cancelada'))
      GROUP BY person_id
    ) combined
    GROUP BY person_id
  ),
  overloaded AS (
    SELECT COUNT(*) AS cnt
    FROM active_people ap
    JOIN task_counts tc ON tc.pid = ap.id::text
    WHERE tc.total_tasks >= 8
  )

  SELECT json_build_object(
    'total',              (SELECT COUNT(*) FROM all_people),
    'active',             (SELECT COUNT(*) FROM active_people),
    'onboarding',         (SELECT COUNT(*) FROM all_people WHERE status = 'onboarding'),
    'at_risk',            (SELECT cnt FROM at_risk),
    'pending_1on1',       (SELECT cnt FROM pending_1on1),
    'stale_pdi',          (SELECT cnt FROM stale_pdi),
    'month_recognitions', (SELECT cnt FROM month_recognitions),
    'overloaded',         (SELECT cnt FROM overloaded)
  ) INTO result;

  RETURN result;
END;
$$;
