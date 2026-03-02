-- ============================================================================
-- Migration 074: get_people_ids_by_kpi() — Returns person IDs matching a KPI
--
-- Used by the People OS Phase 2 filter engine to support KPI-click filtering.
-- Returns an array of profile UUIDs matching the given KPI preset.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_people_ids_by_kpi(p_tenant_id UUID, p_kpi TEXT)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  CASE p_kpi

    -- at_risk: active people with evaluation < 60 OR overdue PDI
    WHEN 'at_risk' THEN
      RETURN QUERY
        SELECT DISTINCT ap.id
        FROM profiles ap
        LEFT JOIN pdis pd ON pd.person_id = ap.id AND pd.tenant_id = p_tenant_id
        WHERE ap.tenant_id = p_tenant_id
          AND ap.status = 'active'
          AND (
            (ap.media_avaliacao IS NOT NULL AND ap.media_avaliacao < 60)
            OR pd.status = 'Atrasado'
          );

    -- pending_1on1: active people without a completed 1:1 in the last 30 days
    WHEN 'pending_1on1' THEN
      RETURN QUERY
        SELECT ap.id
        FROM profiles ap
        LEFT JOIN (
          SELECT o.collaborator_id AS person_id, MAX(o.scheduled_at) AS last_at
          FROM one_on_ones o
          WHERE o.tenant_id = p_tenant_id AND o.status = 'completed'
          GROUP BY o.collaborator_id
        ) l ON l.person_id = ap.id
        WHERE ap.tenant_id = p_tenant_id
          AND ap.status = 'active'
          AND (l.last_at IS NULL OR l.last_at < (now() - INTERVAL '30 days'));

    -- stale_pdi: active people without PDI update in the last 90 days
    WHEN 'stale_pdi' THEN
      RETURN QUERY
        SELECT ap.id
        FROM profiles ap
        LEFT JOIN (
          SELECT pd.person_id, MAX(pd.last_updated_at) AS last_upd
          FROM pdis pd
          WHERE pd.tenant_id = p_tenant_id
          GROUP BY pd.person_id
        ) lp ON lp.person_id = ap.id
        WHERE ap.tenant_id = p_tenant_id
          AND ap.status = 'active'
          AND (lp.last_upd IS NULL OR lp.last_upd < (now() - INTERVAL '90 days'));

    -- overloaded: active people with 8+ open tasks
    WHEN 'overloaded' THEN
      RETURN QUERY
        SELECT ap.id
        FROM profiles ap
        JOIN (
          SELECT person_id AS pid, SUM(cnt) AS total_tasks
          FROM (
            SELECT assignee_id::text AS person_id, COUNT(*) AS cnt
            FROM os_tasks
            WHERE tenant_id = p_tenant_id
              AND (is_completed = false OR is_completed IS NULL)
              AND assignee_id IS NOT NULL
            GROUP BY assignee_id

            UNION ALL

            SELECT person_id, COUNT(*) AS cnt
            FROM person_tasks
            WHERE tenant_id = p_tenant_id
              AND (status IS NULL OR status NOT IN ('concluida', 'cancelada'))
            GROUP BY person_id
          ) combined
          GROUP BY person_id
        ) tc ON tc.pid = ap.id::text
        WHERE ap.tenant_id = p_tenant_id
          AND ap.status = 'active'
          AND tc.total_tasks >= 8;

    ELSE
      -- Unknown KPI: return empty set
      RETURN;

  END CASE;
END;
$$;
