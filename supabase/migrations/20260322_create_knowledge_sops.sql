-- ─── Knowledge SOPs ────────────────────────────────────────────────
-- Standard Operating Procedures organizados por BU

CREATE TABLE IF NOT EXISTS knowledge_sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  bu TEXT NOT NULL CHECK (bu IN ('digital-3d','branding','marketing','audiovisual','gamificacao','operacoes','atendimento','comercial','financeiro','recursos-humanos','relacionamentos','politicas','geral')),
  category TEXT NOT NULL DEFAULT 'processo' CHECK (category IN ('processo','checklist','referencia','troubleshooting')),
  description TEXT,
  content TEXT,
  content_html TEXT,
  author_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived','review')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  tags TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  last_reviewed_at TIMESTAMPTZ,
  last_reviewed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- Versionamento de SOPs
CREATE TABLE IF NOT EXISTS knowledge_sop_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID NOT NULL REFERENCES knowledge_sops(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  edited_by TEXT,
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Steps/Seções de cada SOP
CREATE TABLE IF NOT EXISTS knowledge_sop_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID NOT NULL REFERENCES knowledge_sops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  content_html TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  step_type TEXT NOT NULL DEFAULT 'step' CHECK (step_type IN ('step','warning','tip','note','checkpoint')),
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_sops_tenant ON knowledge_sops(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_sops_bu ON knowledge_sops(bu);
CREATE INDEX IF NOT EXISTS idx_knowledge_sops_status ON knowledge_sops(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_sops_slug ON knowledge_sops(slug);
CREATE INDEX IF NOT EXISTS idx_knowledge_sop_steps_sop ON knowledge_sop_steps(sop_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_sop_versions_sop ON knowledge_sop_versions(sop_id);

-- RLS
ALTER TABLE knowledge_sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sop_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sop_steps ENABLE ROW LEVEL SECURITY;

-- Policies: todos autenticados podem ler, diretoria+ pode escrever
CREATE POLICY "knowledge_sops_select" ON knowledge_sops
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "knowledge_sops_insert" ON knowledge_sops
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "knowledge_sops_update" ON knowledge_sops
  FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "knowledge_sops_delete" ON knowledge_sops
  FOR DELETE TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Versions & Steps inherit from parent SOP via FK cascade
CREATE POLICY "knowledge_sop_versions_select" ON knowledge_sop_versions
  FOR SELECT TO authenticated
  USING (sop_id IN (SELECT id FROM knowledge_sops WHERE tenant_id IN (SELECT get_user_tenant_ids())));

CREATE POLICY "knowledge_sop_versions_insert" ON knowledge_sop_versions
  FOR INSERT TO authenticated
  WITH CHECK (sop_id IN (SELECT id FROM knowledge_sops WHERE tenant_id IN (SELECT get_user_tenant_ids())));

CREATE POLICY "knowledge_sop_steps_select" ON knowledge_sop_steps
  FOR SELECT TO authenticated
  USING (sop_id IN (SELECT id FROM knowledge_sops WHERE tenant_id IN (SELECT get_user_tenant_ids())));

CREATE POLICY "knowledge_sop_steps_insert" ON knowledge_sop_steps
  FOR INSERT TO authenticated
  WITH CHECK (sop_id IN (SELECT id FROM knowledge_sops WHERE tenant_id IN (SELECT get_user_tenant_ids())));

CREATE POLICY "knowledge_sop_steps_update" ON knowledge_sop_steps
  FOR UPDATE TO authenticated
  USING (sop_id IN (SELECT id FROM knowledge_sops WHERE tenant_id IN (SELECT get_user_tenant_ids())));

CREATE POLICY "knowledge_sop_steps_delete" ON knowledge_sop_steps
  FOR DELETE TO authenticated
  USING (sop_id IN (SELECT id FROM knowledge_sops WHERE tenant_id IN (SELECT get_user_tenant_ids())));
