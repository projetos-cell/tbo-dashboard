-- ============================================
-- TBO OS v2 — Migration v5: TBO Academy
-- Executar no Supabase SQL Editor
-- ============================================

-- 1. CURSOS
CREATE TABLE IF NOT EXISTS academy_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    instructor_id UUID REFERENCES auth.users(id),
    category TEXT CHECK (category IN ('3d', 'branding', 'marketing', 'audiovisual', 'interiores', 'gamificacao', 'gestao', 'ferramentas', 'geral')),
    level TEXT CHECK (level IN ('iniciante', 'intermediario', 'avancado')),
    duration_hours NUMERIC(5,1),
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

-- 2. AULAS
CREATE TABLE IF NOT EXISTS academy_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    duration_minutes INT,
    order_index INT DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MATERIAIS
CREATE TABLE IF NOT EXISTS academy_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
    course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. MATRICULAS
CREATE TABLE IF NOT EXISTS academy_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    UNIQUE(course_id, user_id)
);

-- 5. PROGRESSO
CREATE TABLE IF NOT EXISTS academy_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_pct NUMERIC(5,2) DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE(enrollment_id, lesson_id)
);

-- 6. CERTIFICADOS (placeholder)
CREATE TABLE IF NOT EXISTS academy_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
    certificate_number TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ DEFAULT now(),
    pdf_url TEXT,
    metadata JSONB DEFAULT '{}'
);

-- 7. PESQUISAS DE MERCADO
CREATE TABLE IF NOT EXISTS market_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_andamento', 'publicado', 'arquivado')),
    category TEXT,
    tags TEXT[],
    author_id UUID REFERENCES auth.users(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. FONTES DE PESQUISA
CREATE TABLE IF NOT EXISTS market_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_id UUID REFERENCES market_research(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT,
    source_type TEXT CHECK (source_type IN ('artigo', 'relatorio', 'dado', 'noticia', 'video', 'outro')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_academy_courses_tenant ON academy_courses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_course ON academy_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_academy_enrollments_user ON academy_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_enrollments_course ON academy_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_academy_progress_enrollment ON academy_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_market_research_tenant ON market_research(tenant_id);

-- RLS
ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_sources ENABLE ROW LEVEL SECURITY;

-- Policies: cursos e aulas visiveis para membros do tenant
CREATE POLICY "academy_courses_read" ON academy_courses FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "academy_lessons_read" ON academy_lessons FOR SELECT TO authenticated
  USING (course_id IN (SELECT id FROM academy_courses WHERE tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())));
CREATE POLICY "academy_assets_read" ON academy_assets FOR SELECT TO authenticated
  USING (course_id IN (SELECT id FROM academy_courses WHERE tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())));
CREATE POLICY "academy_enrollments_read" ON academy_enrollments FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "academy_enrollments_insert" ON academy_enrollments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "academy_progress_read" ON academy_progress FOR SELECT TO authenticated
  USING (enrollment_id IN (SELECT id FROM academy_enrollments WHERE user_id = auth.uid()));
CREATE POLICY "academy_progress_upsert" ON academy_progress FOR INSERT TO authenticated
  WITH CHECK (enrollment_id IN (SELECT id FROM academy_enrollments WHERE user_id = auth.uid()));
CREATE POLICY "academy_progress_update" ON academy_progress FOR UPDATE TO authenticated
  USING (enrollment_id IN (SELECT id FROM academy_enrollments WHERE user_id = auth.uid()));
CREATE POLICY "academy_certificates_read" ON academy_certificates FOR SELECT TO authenticated
  USING (enrollment_id IN (SELECT id FROM academy_enrollments WHERE user_id = auth.uid()));
CREATE POLICY "market_research_read" ON market_research FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "market_research_insert" ON market_research FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "market_research_update" ON market_research FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
CREATE POLICY "market_sources_read" ON market_sources FOR SELECT TO authenticated
  USING (research_id IN (SELECT id FROM market_research WHERE tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())));

-- Triggers updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_academy_courses') THEN
        CREATE TRIGGER set_updated_at_academy_courses BEFORE UPDATE ON academy_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_academy_lessons') THEN
        CREATE TRIGGER set_updated_at_academy_lessons BEFORE UPDATE ON academy_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_market_research') THEN
        CREATE TRIGGER set_updated_at_market_research BEFORE UPDATE ON market_research FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- SEED: Cursos de demonstracao para TBO Academy
INSERT INTO academy_courses (tenant_id, title, slug, description, category, level, duration_hours, is_published, is_featured, order_index) VALUES
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Fundamentos de 3D para Arquitetura', 'fundamentos-3d', 'Aprenda os conceitos basicos de modelagem 3D aplicados a projetos de arquitetura e interiores.', '3d', 'iniciante', 40, true, true, 1),
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Branding Estrategico', 'branding-estrategico', 'Metodologia TBO para criacao de marcas com posicionamento forte.', 'branding', 'intermediario', 24, true, true, 2),
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Marketing Digital para Imobiliario', 'marketing-digital-imob', 'Estrategias de marketing digital aplicadas ao mercado imobiliario e construcao.', 'marketing', 'iniciante', 16, true, false, 3),
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Gestao de Projetos Criativos', 'gestao-projetos', 'Metodologias ageis aplicadas a projetos criativos em agencias.', 'gestao', 'intermediario', 20, true, false, 4),
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Producao Audiovisual', 'producao-audiovisual', 'Do briefing a entrega: producao de videos profissionais para marcas.', 'audiovisual', 'avancado', 32, false, false, 5)
ON CONFLICT (tenant_id, slug) DO NOTHING;
