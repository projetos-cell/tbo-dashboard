-- ============================================================
-- Website CMS — Projects, Sections & Settings
-- ============================================================

-- ── Enums ───────────────────────────────────────────────────
CREATE TYPE public.website_project_status AS ENUM (
  'rascunho', 'publicado', 'arquivado'
);

-- ── website_projects (portfólio / cases) ────────────────────
CREATE TABLE IF NOT EXISTS public.website_projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  client_name     TEXT,
  location        TEXT,
  year            INTEGER,
  category        TEXT NOT NULL DEFAULT 'branding',
  cover_url       TEXT,
  gallery         TEXT[] NOT NULL DEFAULT '{}',
  description     TEXT NOT NULL DEFAULT '',
  highlights      TEXT[] NOT NULL DEFAULT '{}',
  services        TEXT[] NOT NULL DEFAULT '{}',
  testimonial_text   TEXT,
  testimonial_author TEXT,
  status          public.website_project_status NOT NULL DEFAULT 'rascunho',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  seo_title       TEXT,
  seo_description TEXT,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_website_projects_tenant   ON public.website_projects(tenant_id);
CREATE INDEX idx_website_projects_status   ON public.website_projects(status);
CREATE INDEX idx_website_projects_category ON public.website_projects(category);
CREATE INDEX idx_website_projects_sort     ON public.website_projects(sort_order);

-- ── website_sections (blocos editáveis de cada página) ──────
CREATE TABLE IF NOT EXISTS public.website_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  page          TEXT NOT NULL,
  section_key   TEXT NOT NULL,
  title         TEXT,
  subtitle      TEXT,
  content       JSONB NOT NULL DEFAULT '{}',
  media_url     TEXT,
  cta_label     TEXT,
  cta_url       TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_visible    BOOLEAN NOT NULL DEFAULT true,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(tenant_id, page, section_key)
);

CREATE INDEX idx_website_sections_tenant ON public.website_sections(tenant_id);
CREATE INDEX idx_website_sections_page   ON public.website_sections(page);

-- ── website_settings (config geral do site) ─────────────────
CREATE TABLE IF NOT EXISTS public.website_settings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  site_title        TEXT NOT NULL DEFAULT 'TBO',
  site_description  TEXT,
  logo_url          TEXT,
  favicon_url       TEXT,
  social_links      JSONB NOT NULL DEFAULT '{}',
  contact_email     TEXT,
  contact_phone     TEXT,
  contact_address   TEXT,
  analytics_id      TEXT,
  custom_scripts    TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Auto-update triggers ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_website_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER website_projects_updated_at
  BEFORE UPDATE ON public.website_projects
  FOR EACH ROW EXECUTE FUNCTION public.set_website_projects_updated_at();

CREATE OR REPLACE FUNCTION public.set_website_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER website_sections_updated_at
  BEFORE UPDATE ON public.website_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_website_sections_updated_at();

CREATE OR REPLACE FUNCTION public.set_website_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER website_settings_updated_at
  BEFORE UPDATE ON public.website_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_website_settings_updated_at();

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.website_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Tenant-scoped (authenticated)
CREATE POLICY "website_projects_select" ON public.website_projects
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "website_projects_insert" ON public.website_projects
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "website_projects_update" ON public.website_projects
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "website_projects_delete" ON public.website_projects
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "website_sections_select" ON public.website_sections
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "website_sections_insert" ON public.website_sections
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "website_sections_update" ON public.website_sections
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "website_sections_delete" ON public.website_sections
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "website_settings_select" ON public.website_settings
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "website_settings_insert" ON public.website_settings
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
CREATE POLICY "website_settings_update" ON public.website_settings
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Public read (site externo consome projetos publicados)
CREATE POLICY "website_projects_public_select" ON public.website_projects
  FOR SELECT USING (status = 'publicado');

CREATE POLICY "website_sections_public_select" ON public.website_sections
  FOR SELECT USING (is_visible = true);

CREATE POLICY "website_settings_public_select" ON public.website_settings
  FOR SELECT USING (true);

-- ── Seed: default sections for home page ────────────────────
-- (executed once, tenant_id to be filled by the app on first load)
