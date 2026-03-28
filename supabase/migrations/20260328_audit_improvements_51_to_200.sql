-- ============================================================
-- TBO OS — Audit Improvements #51-67, #78-86, #151-160, #195-200
-- Consolidated migration for 50 features
-- ============================================================

-- ============================================================
-- PROJECTS: Task Dependencies (#52, #59)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id         UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  depends_on_id   UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'finish_to_start'
                  CHECK (dependency_type IN ('finish_to_start','start_to_start','finish_to_finish','start_to_finish')),
  lag_days        INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, depends_on_id)
);

CREATE INDEX IF NOT EXISTS idx_task_deps_task ON public.task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_deps_depends ON public.task_dependencies(depends_on_id);
CREATE INDEX IF NOT EXISTS idx_task_deps_tenant ON public.task_dependencies(tenant_id);

ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_deps_select" ON public.task_dependencies FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "task_deps_insert" ON public.task_dependencies FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "task_deps_update" ON public.task_dependencies FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "task_deps_delete" ON public.task_dependencies FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ============================================================
-- PROJECTS: Time Tracking (#60)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_time_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id         UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ NOT NULL,
  ended_at        TIMESTAMPTZ,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE WHEN ended_at IS NOT NULL
      THEN EXTRACT(EPOCH FROM (ended_at - started_at))::integer / 60
      ELSE NULL
    END
  ) STORED,
  description     TEXT,
  is_running      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_time_entries_task ON public.task_time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON public.task_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_running ON public.task_time_entries(is_running) WHERE is_running = true;
CREATE INDEX IF NOT EXISTS idx_time_entries_tenant ON public.task_time_entries(tenant_id);

ALTER TABLE public.task_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "time_entries_select" ON public.task_time_entries FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "time_entries_insert" ON public.task_time_entries FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "time_entries_update" ON public.task_time_entries FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "time_entries_delete" ON public.task_time_entries FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ============================================================
-- PROJECTS: Task Checklists (#62)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_checklist_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id         UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  is_completed    BOOLEAN NOT NULL DEFAULT false,
  completed_at    TIMESTAMPTZ,
  completed_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checklist_task ON public.task_checklist_items(task_id);
CREATE INDEX IF NOT EXISTS idx_checklist_tenant ON public.task_checklist_items(tenant_id);

ALTER TABLE public.task_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_select" ON public.task_checklist_items FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "checklist_insert" ON public.task_checklist_items FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "checklist_update" ON public.task_checklist_items FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "checklist_delete" ON public.task_checklist_items FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ============================================================
-- PROJECTS: Task Comments with @mentions (#65)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id         UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  mentions        UUID[] NOT NULL DEFAULT '{}',
  parent_id       UUID REFERENCES task_comments(id) ON DELETE CASCADE,
  is_edited       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_author ON public.task_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_tenant ON public.task_comments(tenant_id);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_comments_select" ON public.task_comments FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "task_comments_insert" ON public.task_comments FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "task_comments_update" ON public.task_comments FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "task_comments_delete" ON public.task_comments FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ============================================================
-- PROJECTS: Task Attachments (#66)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id         UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  uploaded_by     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name       TEXT NOT NULL,
  file_url        TEXT NOT NULL,
  file_size       INTEGER,
  file_type       TEXT,
  storage_path    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_attach_task ON public.task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attach_tenant ON public.task_attachments(tenant_id);

ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_attach_select" ON public.task_attachments FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "task_attach_insert" ON public.task_attachments FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "task_attach_delete" ON public.task_attachments FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ============================================================
-- PROJECTS: Multi-step Approval Workflow (#67)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_approval_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id         UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  step_order      INTEGER NOT NULL DEFAULT 0,
  role_label      TEXT NOT NULL DEFAULT 'revisor'
                  CHECK (role_label IN ('revisor','aprovador','cliente')),
  assignee_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected','skipped')),
  decided_at      TIMESTAMPTZ,
  feedback        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_steps_task ON public.task_approval_steps(task_id);
CREATE INDEX IF NOT EXISTS idx_approval_steps_tenant ON public.task_approval_steps(tenant_id);

ALTER TABLE public.task_approval_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approval_steps_select" ON public.task_approval_steps FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "approval_steps_insert" ON public.task_approval_steps FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "approval_steps_update" ON public.task_approval_steps FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "approval_steps_delete" ON public.task_approval_steps FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ============================================================
-- CLIENT PORTAL: Comments & Approvals (#78-81)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portal_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id         UUID REFERENCES os_tasks(id) ON DELETE CASCADE,
  update_id       UUID REFERENCES project_status_updates(id) ON DELETE CASCADE,
  author_name     TEXT NOT NULL,
  author_email    TEXT,
  content         TEXT NOT NULL,
  is_internal     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_comments_project ON public.portal_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_comments_tenant ON public.portal_comments(tenant_id);

ALTER TABLE public.portal_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portal_comments_select" ON public.portal_comments FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "portal_comments_insert" ON public.portal_comments FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "portal_comments_delete" ON public.portal_comments FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Portal: public insert policy (client can comment via token)
CREATE POLICY "portal_comments_public_insert" ON public.portal_comments
  FOR INSERT WITH CHECK (true);

-- Client file uploads (#80)
CREATE TABLE IF NOT EXISTS public.portal_files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id         UUID REFERENCES os_tasks(id) ON DELETE SET NULL,
  uploaded_by_name TEXT NOT NULL,
  uploaded_by_email TEXT,
  file_name       TEXT NOT NULL,
  file_url        TEXT NOT NULL,
  file_size       INTEGER,
  file_type       TEXT,
  storage_path    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_files_project ON public.portal_files(project_id);
ALTER TABLE public.portal_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portal_files_select" ON public.portal_files FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "portal_files_insert" ON public.portal_files FOR INSERT WITH CHECK (true);
CREATE POLICY "portal_files_delete" ON public.portal_files FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Approval SLA tracking (#81)
CREATE TABLE IF NOT EXISTS public.portal_approval_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id         UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at    TIMESTAMPTZ,
  decision        TEXT CHECK (decision IN ('approved','rejected','revision_requested')),
  sla_hours       INTEGER NOT NULL DEFAULT 48,
  is_overdue      BOOLEAN GENERATED ALWAYS AS (
    CASE WHEN responded_at IS NULL AND now() > requested_at + (sla_hours || ' hours')::interval
      THEN true ELSE false END
  ) STORED,
  client_name     TEXT,
  feedback        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_approval_project ON public.portal_approval_log(project_id);
ALTER TABLE public.portal_approval_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portal_approval_select" ON public.portal_approval_log FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "portal_approval_insert" ON public.portal_approval_log FOR INSERT WITH CHECK (true);
CREATE POLICY "portal_approval_update" ON public.portal_approval_log FOR UPDATE USING (true);

-- ============================================================
-- D3D PIPELINE: Enhancements (#83-86)
-- ============================================================

-- D3D gate multi-approver (#84)
CREATE TABLE IF NOT EXISTS public.d3d_gate_approvals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  flow_id         UUID NOT NULL REFERENCES project_d3d_flows(id) ON DELETE CASCADE,
  stage_id        UUID NOT NULL REFERENCES project_d3d_stages(id) ON DELETE CASCADE,
  approver_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approver_name   TEXT,
  approver_email  TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected','revision_requested')),
  feedback        TEXT,
  deadline        TIMESTAMPTZ,
  decided_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_d3d_gate_flow ON public.d3d_gate_approvals(flow_id);
CREATE INDEX IF NOT EXISTS idx_d3d_gate_stage ON public.d3d_gate_approvals(stage_id);
ALTER TABLE public.d3d_gate_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "d3d_gate_select" ON public.d3d_gate_approvals FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "d3d_gate_insert" ON public.d3d_gate_approvals FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "d3d_gate_update" ON public.d3d_gate_approvals FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- D3D revision history (#86)
CREATE TABLE IF NOT EXISTS public.d3d_stage_revisions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  flow_id         UUID NOT NULL REFERENCES project_d3d_flows(id) ON DELETE CASCADE,
  stage_id        UUID NOT NULL REFERENCES project_d3d_stages(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL DEFAULT 1,
  image_url       TEXT,
  notes           TEXT,
  submitted_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  feedback        TEXT,
  status          TEXT NOT NULL DEFAULT 'submitted'
                  CHECK (status IN ('submitted','approved','rejected','superseded')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_d3d_revisions_stage ON public.d3d_stage_revisions(stage_id);
ALTER TABLE public.d3d_stage_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "d3d_revisions_select" ON public.d3d_stage_revisions FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "d3d_revisions_insert" ON public.d3d_stage_revisions FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "d3d_revisions_update" ON public.d3d_stage_revisions FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Add time tracking columns to d3d stages (#83)
ALTER TABLE public.project_d3d_stages ADD COLUMN IF NOT EXISTS time_spent_hours NUMERIC(8,2) DEFAULT 0;
ALTER TABLE public.project_d3d_stages ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;

-- ============================================================
-- PROPOSALS: Versioning & Client Links (#152, #154)
-- ============================================================
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS parent_proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS client_token TEXT;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS client_viewed_at TIMESTAMPTZ;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS client_decided_at TIMESTAMPTZ;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS client_feedback TEXT;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_proposals_client_token ON public.proposals(client_token) WHERE client_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_proposals_parent ON public.proposals(parent_proposal_id) WHERE parent_proposal_id IS NOT NULL;

-- Pricing: complexity multipliers (#157)
CREATE TABLE IF NOT EXISTS public.pricing_complexity_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  delivery_type   TEXT NOT NULL,
  multiplier      NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  conditions      JSONB NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_complexity_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pricing_rules_select" ON public.pricing_complexity_rules FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "pricing_rules_insert" ON public.pricing_complexity_rules FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "pricing_rules_update" ON public.pricing_complexity_rules FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "pricing_rules_delete" ON public.pricing_complexity_rules FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ============================================================
-- BI & REPORTS (#195-200)
-- ============================================================

-- Custom BI dashboards (#195)
CREATE TABLE IF NOT EXISTS public.bi_dashboards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  layout          JSONB NOT NULL DEFAULT '[]',
  filters         JSONB NOT NULL DEFAULT '{}',
  is_shared       BOOLEAN NOT NULL DEFAULT false,
  is_default      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bi_dashboards_tenant ON public.bi_dashboards(tenant_id);
ALTER TABLE public.bi_dashboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_dash_select" ON public.bi_dashboards FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "bi_dash_insert" ON public.bi_dashboards FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "bi_dash_update" ON public.bi_dashboards FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "bi_dash_delete" ON public.bi_dashboards FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- BI widget definitions
CREATE TABLE IF NOT EXISTS public.bi_widgets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dashboard_id    UUID NOT NULL REFERENCES bi_dashboards(id) ON DELETE CASCADE,
  widget_type     TEXT NOT NULL
                  CHECK (widget_type IN ('kpi_card','bar_chart','line_chart','pie_chart','donut_chart',
                    'area_chart','table','metric','gauge','heatmap','funnel','number')),
  title           TEXT NOT NULL,
  data_source     TEXT NOT NULL,
  query_config    JSONB NOT NULL DEFAULT '{}',
  display_config  JSONB NOT NULL DEFAULT '{}',
  position_x      INTEGER NOT NULL DEFAULT 0,
  position_y      INTEGER NOT NULL DEFAULT 0,
  width           INTEGER NOT NULL DEFAULT 4,
  height          INTEGER NOT NULL DEFAULT 3,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bi_widgets_dashboard ON public.bi_widgets(dashboard_id);
ALTER TABLE public.bi_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_widgets_select" ON public.bi_widgets FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "bi_widgets_insert" ON public.bi_widgets FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "bi_widgets_update" ON public.bi_widgets FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "bi_widgets_delete" ON public.bi_widgets FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Scheduled reports (#197)
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  report_type     TEXT NOT NULL
                  CHECK (report_type IN ('projects','finance','commercial','people','custom')),
  frequency       TEXT NOT NULL DEFAULT 'weekly'
                  CHECK (frequency IN ('daily','weekly','biweekly','monthly','quarterly')),
  day_of_week     INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  day_of_month    INTEGER CHECK (day_of_month BETWEEN 1 AND 28),
  recipients      TEXT[] NOT NULL DEFAULT '{}',
  filters         JSONB NOT NULL DEFAULT '{}',
  template        TEXT NOT NULL DEFAULT 'default',
  format          TEXT NOT NULL DEFAULT 'pdf'
                  CHECK (format IN ('pdf','csv','xlsx')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_sent_at    TIMESTAMPTZ,
  next_send_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sched_reports_tenant ON public.scheduled_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sched_reports_next ON public.scheduled_reports(next_send_at) WHERE is_active = true;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sched_reports_select" ON public.scheduled_reports FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "sched_reports_insert" ON public.scheduled_reports FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "sched_reports_update" ON public.scheduled_reports FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "sched_reports_delete" ON public.scheduled_reports FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Data quality scores (#200)
CREATE TABLE IF NOT EXISTS public.data_quality_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module          TEXT NOT NULL
                  CHECK (module IN ('projects','people','finance','commercial','okrs','culture','contracts')),
  total_records   INTEGER NOT NULL DEFAULT 0,
  filled_fields   INTEGER NOT NULL DEFAULT 0,
  total_fields    INTEGER NOT NULL DEFAULT 0,
  completeness_pct NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_fields > 0 THEN (filled_fields::numeric / total_fields * 100) ELSE 0 END
  ) STORED,
  missing_critical JSONB NOT NULL DEFAULT '[]',
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dq_scores_tenant ON public.data_quality_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dq_scores_module ON public.data_quality_scores(module);
ALTER TABLE public.data_quality_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dq_scores_select" ON public.data_quality_scores FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "dq_scores_insert" ON public.data_quality_scores FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

-- ============================================================
-- Add project branding for client portal (#82)
-- ============================================================
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS portal_logo_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS portal_primary_color TEXT DEFAULT '#18181B';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS portal_company_name TEXT;

-- ============================================================
-- Add saved view filters to Supabase (#54)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_view_filters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  view_key        TEXT NOT NULL,
  filters         JSONB NOT NULL DEFAULT '{}',
  sort_config     JSONB NOT NULL DEFAULT '{}',
  group_config    JSONB NOT NULL DEFAULT '{}',
  is_default      BOOLEAN NOT NULL DEFAULT false,
  name            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, view_key, name)
);

CREATE INDEX IF NOT EXISTS idx_saved_filters_user ON public.saved_view_filters(user_id);
ALTER TABLE public.saved_view_filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_filters_select" ON public.saved_view_filters FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "saved_filters_insert" ON public.saved_view_filters FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "saved_filters_update" ON public.saved_view_filters FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "saved_filters_delete" ON public.saved_view_filters FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ============================================================
-- Triggers for updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at_generic()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'task_comments', 'bi_dashboards', 'bi_widgets', 'scheduled_reports',
    'pricing_complexity_rules', 'saved_view_filters'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', tbl || '_updated_at', tbl);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_generic()', tbl || '_updated_at', tbl);
  END LOOP;
END $$;
