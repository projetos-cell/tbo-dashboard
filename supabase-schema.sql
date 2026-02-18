-- ============================================================================
-- TBO OS — Supabase Database Schema
-- Full migration: all entities, RLS, triggers, indexes
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================================

-- 0. Helper: updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'artist' CHECK (role IN ('founder','project_owner','artist','finance')),
  bu TEXT,
  is_coordinator BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_founder" ON public.profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder'));

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'artist'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. PROJECTS
-- ============================================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  name TEXT NOT NULL,
  client TEXT,
  client_company TEXT,
  status TEXT NOT NULL DEFAULT 'briefing'
    CHECK (status IN ('briefing','planejamento','producao','revisao','entrega','finalizado','pausado','cancelado')),
  owner_id UUID REFERENCES public.profiles(id),
  owner_name TEXT,
  value NUMERIC(12,2) DEFAULT 0,
  planned_cost NUMERIC(12,2) DEFAULT 0,
  services TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'media' CHECK (priority IN ('baixa','media','alta','urgente')),
  next_action TEXT,
  next_action_date DATE,
  start_date DATE,
  end_date DATE,
  proposal_id UUID,
  playbook TEXT,
  playbook_name TEXT,
  notes TEXT,
  source TEXT DEFAULT 'manual',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select" ON public.projects FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "projects_insert" ON public.projects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "projects_update" ON public.projects FOR UPDATE
  USING (
    owner_id = auth.uid() OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'founder' OR is_coordinator = TRUE))
  );
CREATE POLICY "projects_delete" ON public.projects FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder'));

CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_owner ON public.projects(owner_id);
CREATE INDEX idx_projects_client ON public.projects(client);
CREATE INDEX idx_projects_legacy ON public.projects(legacy_id);

-- ============================================================================
-- 3. TASKS
-- ============================================================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente','em_andamento','concluida','cancelada')),
  priority TEXT DEFAULT 'media' CHECK (priority IN ('baixa','media','alta','urgente')),
  owner_id UUID REFERENCES public.profiles(id),
  owner_name TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name TEXT,
  decision_id UUID,
  due_date DATE,
  estimate_minutes INTEGER,
  phase TEXT,
  sort_order INTEGER DEFAULT 0,
  source TEXT DEFAULT 'manual',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select" ON public.tasks FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE
  USING (
    owner_id = auth.uid() OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('founder','project_owner') OR is_coordinator = TRUE))
  );
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder'));

CREATE INDEX idx_tasks_project ON public.tasks(project_id);
CREATE INDEX idx_tasks_owner ON public.tasks(owner_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due ON public.tasks(due_date);
CREATE INDEX idx_tasks_legacy ON public.tasks(legacy_id);

-- ============================================================================
-- 4. DELIVERABLES
-- ============================================================================
CREATE TABLE public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  name TEXT NOT NULL,
  title TEXT,
  type TEXT,
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente','em_producao','em_revisao','aprovado','entregue')),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name TEXT,
  owner_id UUID REFERENCES public.profiles(id),
  owner_name TEXT,
  reviewer_id UUID REFERENCES public.profiles(id),
  current_version TEXT,
  versions JSONB DEFAULT '[]',
  source TEXT DEFAULT 'manual',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.deliverables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deliverables_select" ON public.deliverables FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "deliverables_insert" ON public.deliverables FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "deliverables_update" ON public.deliverables FOR UPDATE
  USING (
    owner_id = auth.uid() OR reviewer_id = auth.uid() OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('founder','project_owner') OR is_coordinator = TRUE))
  );

CREATE INDEX idx_deliverables_project ON public.deliverables(project_id);
CREATE INDEX idx_deliverables_status ON public.deliverables(status);
CREATE INDEX idx_deliverables_legacy ON public.deliverables(legacy_id);

-- ============================================================================
-- 5. PROPOSALS
-- ============================================================================
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  name TEXT NOT NULL,
  client TEXT,
  company TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho','enviada','em_negociacao','aprovada','recusada','convertida')),
  value NUMERIC(12,2) DEFAULT 0,
  services TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES public.profiles(id),
  owner_name TEXT,
  priority TEXT DEFAULT 'media',
  deal_id UUID,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposals_select" ON public.proposals FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "proposals_insert" ON public.proposals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "proposals_update" ON public.proposals FOR UPDATE
  USING (
    owner_id = auth.uid() OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder','project_owner'))
  );

CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_proposals_legacy ON public.proposals(legacy_id);

-- ============================================================================
-- 6. DECISIONS
-- ============================================================================
CREATE TABLE public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  meeting_id UUID,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  decided_by TEXT,
  tasks_created TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.decisions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "decisions_select" ON public.decisions FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "decisions_insert" ON public.decisions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "decisions_update" ON public.decisions FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder','project_owner'))
  );

CREATE INDEX idx_decisions_project ON public.decisions(project_id);
CREATE INDEX idx_decisions_meeting ON public.decisions(meeting_id);
CREATE INDEX idx_decisions_legacy ON public.decisions(legacy_id);

-- ============================================================================
-- 7. MEETINGS (ERP meetings)
-- ============================================================================
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  title TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'agendada'
    CHECK (status IN ('agendada','em_andamento','concluida','cancelada')),
  date DATE,
  time TEXT,
  duration_minutes INTEGER,
  participants TEXT[] DEFAULT '{}',
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  project_name TEXT,
  agenda TEXT,
  notes TEXT,
  summary TEXT,
  action_items JSONB DEFAULT '[]',
  category TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meetings_select" ON public.meetings FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "meetings_insert" ON public.meetings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "meetings_update" ON public.meetings FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE INDEX idx_meetings_date ON public.meetings(date);
CREATE INDEX idx_meetings_project ON public.meetings(project_id);
CREATE INDEX idx_meetings_legacy ON public.meetings(legacy_id);

-- ============================================================================
-- 8. TIME ENTRIES
-- ============================================================================
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  user_name TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  project_name TEXT,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  task_name TEXT,
  date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  billable BOOLEAN DEFAULT TRUE,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_entries_select" ON public.time_entries FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'founder' OR is_coordinator = TRUE))
  );
CREATE POLICY "time_entries_insert" ON public.time_entries FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "time_entries_update" ON public.time_entries FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder')
  );
CREATE POLICY "time_entries_delete" ON public.time_entries FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder')
  );

CREATE INDEX idx_time_entries_user ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_project ON public.time_entries(project_id);
CREATE INDEX idx_time_entries_date ON public.time_entries(date);
CREATE INDEX idx_time_entries_legacy ON public.time_entries(legacy_id);

-- ============================================================================
-- 9. CRM STAGES + DEALS
-- ============================================================================
CREATE TABLE public.crm_stages (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  color TEXT DEFAULT '#94a3b8'
);

INSERT INTO public.crm_stages (id, label, sort_order, color) VALUES
  ('lead', 'Lead', 0, '#6366f1'),
  ('qualificacao', 'Qualificacao', 1, '#f59e0b'),
  ('proposta', 'Proposta Enviada', 2, '#3b82f6'),
  ('negociacao', 'Negociacao', 3, '#8b5cf6'),
  ('fechado_ganho', 'Fechado Ganho', 4, '#22c55e'),
  ('fechado_perdido', 'Fechado Perdido', 5, '#ef4444');

ALTER TABLE public.crm_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_stages_select" ON public.crm_stages FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE TABLE public.crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  name TEXT NOT NULL,
  company TEXT,
  contact TEXT,
  contact_email TEXT,
  stage TEXT NOT NULL REFERENCES public.crm_stages(id) DEFAULT 'lead',
  value NUMERIC(12,2) DEFAULT 0,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  services TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES public.profiles(id),
  owner_name TEXT,
  notes TEXT,
  source TEXT DEFAULT 'manual',
  rd_deal_id TEXT,
  margin NUMERIC(12,2),
  cost NUMERIC(12,2),
  risk_flag BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'media',
  expected_close DATE,
  activities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.crm_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_deals_select" ON public.crm_deals FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "crm_deals_insert" ON public.crm_deals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "crm_deals_update" ON public.crm_deals FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder','project_owner'))
  );

CREATE INDEX idx_crm_deals_stage ON public.crm_deals(stage);
CREATE INDEX idx_crm_deals_owner ON public.crm_deals(owner_id);
CREATE INDEX idx_crm_deals_legacy ON public.crm_deals(legacy_id);

-- ============================================================================
-- 10. AUDIT LOG (immutable)
-- ============================================================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_name TEXT,
  action TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT,
  user_id UUID REFERENCES public.profiles(id),
  user_name TEXT,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select" ON public.audit_log FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "audit_log_insert" ON public.audit_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
-- No UPDATE or DELETE policies: audit logs are immutable

CREATE INDEX idx_audit_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_created ON public.audit_log(created_at DESC);

-- ============================================================================
-- 11. NOTIFICATIONS
-- ============================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info','warning','critical','success')),
  entity_type TEXT,
  entity_id TEXT,
  action_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON public.notifications FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "notifications_delete" ON public.notifications FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_notifications_user ON public.notifications(user_id, read, created_at DESC);

-- ============================================================================
-- 12. MONTHLY CLOSINGS
-- ============================================================================
CREATE TABLE public.monthly_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  locked BOOLEAN DEFAULT FALSE,
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(year, month)
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.monthly_closings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.monthly_closings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "monthly_closings_select" ON public.monthly_closings FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "monthly_closings_all_founder" ON public.monthly_closings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder'));

-- Monthly lock check function
CREATE OR REPLACE FUNCTION public.is_month_locked(check_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.monthly_closings
    WHERE year = EXTRACT(YEAR FROM check_date)::INTEGER
    AND month = EXTRACT(MONTH FROM check_date)::INTEGER
    AND locked = TRUE
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger to prevent edits in locked months (applied to time_entries)
CREATE OR REPLACE FUNCTION public.check_monthly_lock()
RETURNS TRIGGER AS $$
DECLARE
  check_date DATE;
BEGIN
  check_date := COALESCE(NEW.date, NEW.created_at::date, CURRENT_DATE);
  IF public.is_month_locked(check_date) THEN
    RAISE EXCEPTION 'Mes %/% esta fechado. Nao e possivel alterar registros.',
      EXTRACT(MONTH FROM check_date)::INTEGER, EXTRACT(YEAR FROM check_date)::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_lock_time_entries
  BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.check_monthly_lock();

-- ============================================================================
-- 13. COMPANY CONTEXT (key-value store for static data)
-- ============================================================================
CREATE TABLE public.company_context (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.company_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_context_select" ON public.company_context FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "company_context_all_founder" ON public.company_context FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder'));

-- ============================================================================
-- 14. KNOWLEDGE BASE (for biblioteca module)
-- ============================================================================
CREATE TABLE public.knowledge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'geral'
    CHECK (category IN ('processos','referencias','tutoriais','templates','politicas','geral')),
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES public.profiles(id),
  author_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.knowledge_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "knowledge_items_select" ON public.knowledge_items FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "knowledge_items_insert" ON public.knowledge_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "knowledge_items_update" ON public.knowledge_items FOR UPDATE
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder','project_owner'))
  );
CREATE POLICY "knowledge_items_delete" ON public.knowledge_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder'));

CREATE INDEX idx_knowledge_category ON public.knowledge_items(category);

-- ============================================================================
-- 15. Enable Realtime for notifications
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================================
-- 16. CONTRACT ATTACHMENTS (Supabase Storage metadata)
-- ============================================================================
CREATE TABLE public.contract_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  mime_type TEXT DEFAULT '',
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.contract_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contract_attachments_select" ON public.contract_attachments FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "contract_attachments_insert" ON public.contract_attachments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "contract_attachments_delete" ON public.contract_attachments FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder','project_owner'))
  );

CREATE INDEX idx_contract_attachments_contract ON public.contract_attachments(contract_id);

-- ============================================================================
-- DONE! Schema created successfully.
-- Next: Seed user profiles and company context data.
-- Also: Create Storage bucket 'contract-files' (public) in Supabase Dashboard.
-- ============================================================================
