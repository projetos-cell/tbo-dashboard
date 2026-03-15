-- Gantt baseline: one snapshot per project (max 1 active)
CREATE TABLE IF NOT EXISTS gantt_baselines (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        TEXT NOT NULL DEFAULT 'Baseline',
    snapshot    JSONB NOT NULL,  -- array of { task_id, start_date, due_date }
    created_by  UUID REFERENCES auth.users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id)  -- only one baseline per project
);

ALTER TABLE gantt_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_gantt_baselines"
    ON gantt_baselines
    FOR ALL
    USING (tenant_id IN (SELECT get_user_tenant_ids()));
