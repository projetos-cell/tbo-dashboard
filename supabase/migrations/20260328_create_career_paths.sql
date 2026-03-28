-- ============================================================================
-- TBO OS — Migration: Career Paths Module
-- Cria estrutura completa de trilhas de carreira com seed data
-- 6 núcleos × dual-track (gestão + técnica) × 9 competências por nível
-- ============================================================================

-- ============================================================================
-- 1. TABELAS
-- ============================================================================

-- career_paths: 1 por núcleo (Marketing, Branding, Digital 3D, etc.)
CREATE TABLE IF NOT EXISTS public.career_paths (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name        text NOT NULL,
  nucleo      text NOT NULL, -- slug: marketing, branding, digital_3d, etc.
  icon        text,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, nucleo)
);

-- career_tracks: 3 por path (base, gestao, tecnica)
CREATE TABLE IF NOT EXISTS public.career_tracks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id     uuid NOT NULL REFERENCES public.career_paths(id) ON DELETE CASCADE,
  name        text NOT NULL,
  track_type  text NOT NULL CHECK (track_type IN ('base', 'gestao', 'tecnica')),
  order_index integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (path_id, track_type)
);

-- career_levels: níveis dentro de cada track
CREATE TABLE IF NOT EXISTS public.career_levels (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id            uuid NOT NULL REFERENCES public.career_tracks(id) ON DELETE CASCADE,
  name                text NOT NULL,
  slug                text NOT NULL,
  description         text,
  order_index         integer NOT NULL DEFAULT 0,
  is_transition_point boolean NOT NULL DEFAULT false, -- true para PO (ponto de bifurcação)
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (track_id, slug)
);

-- career_level_competencies: 9 competências por nível com score esperado
CREATE TABLE IF NOT EXISTS public.career_level_competencies (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id         uuid NOT NULL REFERENCES public.career_levels(id) ON DELETE CASCADE,
  competency_key   text NOT NULL, -- gestao_projetos, habilidades_tecnicas, prazo, comunicacao, lideranca, criatividade, qualidade, produtividade, aprendizado
  competency_name  text NOT NULL,
  competency_type  text NOT NULL CHECK (competency_type IN ('hard', 'soft')),
  expected_score   integer NOT NULL CHECK (expected_score BETWEEN 0 AND 100),
  description      text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (level_id, competency_key)
);

-- career_progressions: histórico de promoções (audit trail)
CREATE TABLE IF NOT EXISTS public.career_progressions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_level_id  uuid REFERENCES public.career_levels(id),
  to_level_id    uuid NOT NULL REFERENCES public.career_levels(id),
  promoted_by    uuid REFERENCES public.profiles(id),
  notes          text,
  promoted_at    timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_career_paths_tenant ON public.career_paths(tenant_id);
CREATE INDEX IF NOT EXISTS idx_career_tracks_path ON public.career_tracks(path_id);
CREATE INDEX IF NOT EXISTS idx_career_levels_track ON public.career_levels(track_id);
CREATE INDEX IF NOT EXISTS idx_career_level_comps_level ON public.career_level_competencies(level_id);
CREATE INDEX IF NOT EXISTS idx_career_progressions_profile ON public.career_progressions(profile_id);
CREATE INDEX IF NOT EXISTS idx_career_progressions_tenant ON public.career_progressions(tenant_id);

-- ============================================================================
-- 2. ALTER TABLE profiles — adiciona FKs de carreira
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS career_level_id uuid REFERENCES public.career_levels(id),
  ADD COLUMN IF NOT EXISTS career_path_id  uuid REFERENCES public.career_paths(id);

CREATE INDEX IF NOT EXISTS idx_profiles_career_level ON public.profiles(career_level_id);
CREATE INDEX IF NOT EXISTS idx_profiles_career_path  ON public.profiles(career_path_id);

-- ============================================================================
-- 3. RLS — Row Level Security
-- ============================================================================

ALTER TABLE public.career_paths             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_tracks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_levels            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_level_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_progressions      ENABLE ROW LEVEL SECURITY;

-- career_paths
DROP POLICY IF EXISTS "career_paths_select"  ON public.career_paths;
DROP POLICY IF EXISTS "career_paths_insert"  ON public.career_paths;
DROP POLICY IF EXISTS "career_paths_update"  ON public.career_paths;
DROP POLICY IF EXISTS "career_paths_delete"  ON public.career_paths;

CREATE POLICY "career_paths_select" ON public.career_paths
  FOR SELECT USING (tenant_id = ANY(public.get_user_tenant_ids()));

CREATE POLICY "career_paths_insert" ON public.career_paths
  FOR INSERT WITH CHECK (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() IN ('founder', 'diretoria')
  );

CREATE POLICY "career_paths_update" ON public.career_paths
  FOR UPDATE USING (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() IN ('founder', 'diretoria')
  );

CREATE POLICY "career_paths_delete" ON public.career_paths
  FOR DELETE USING (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() = 'founder'
  );

-- career_tracks
DROP POLICY IF EXISTS "career_tracks_select" ON public.career_tracks;
DROP POLICY IF EXISTS "career_tracks_write"  ON public.career_tracks;

CREATE POLICY "career_tracks_select" ON public.career_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.career_paths cp
      WHERE cp.id = path_id
        AND cp.tenant_id = ANY(public.get_user_tenant_ids())
    )
  );

CREATE POLICY "career_tracks_write" ON public.career_tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.career_paths cp
      WHERE cp.id = path_id
        AND cp.tenant_id = ANY(public.get_user_tenant_ids())
        AND public.get_current_user_role() IN ('founder', 'diretoria')
    )
  );

-- career_levels
DROP POLICY IF EXISTS "career_levels_select" ON public.career_levels;
DROP POLICY IF EXISTS "career_levels_write"  ON public.career_levels;

CREATE POLICY "career_levels_select" ON public.career_levels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.career_tracks ct
        JOIN public.career_paths cp ON cp.id = ct.path_id
      WHERE ct.id = track_id
        AND cp.tenant_id = ANY(public.get_user_tenant_ids())
    )
  );

CREATE POLICY "career_levels_write" ON public.career_levels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.career_tracks ct
        JOIN public.career_paths cp ON cp.id = ct.path_id
      WHERE ct.id = track_id
        AND cp.tenant_id = ANY(public.get_user_tenant_ids())
        AND public.get_current_user_role() IN ('founder', 'diretoria')
    )
  );

-- career_level_competencies
DROP POLICY IF EXISTS "career_comps_select" ON public.career_level_competencies;
DROP POLICY IF EXISTS "career_comps_write"  ON public.career_level_competencies;

CREATE POLICY "career_comps_select" ON public.career_level_competencies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.career_levels cl
        JOIN public.career_tracks ct ON ct.id = cl.track_id
        JOIN public.career_paths cp ON cp.id = ct.path_id
      WHERE cl.id = level_id
        AND cp.tenant_id = ANY(public.get_user_tenant_ids())
    )
  );

CREATE POLICY "career_comps_write" ON public.career_level_competencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.career_levels cl
        JOIN public.career_tracks ct ON ct.id = cl.track_id
        JOIN public.career_paths cp ON cp.id = ct.path_id
      WHERE cl.id = level_id
        AND cp.tenant_id = ANY(public.get_user_tenant_ids())
        AND public.get_current_user_role() IN ('founder', 'diretoria')
    )
  );

-- career_progressions
DROP POLICY IF EXISTS "career_prog_select" ON public.career_progressions;
DROP POLICY IF EXISTS "career_prog_insert" ON public.career_progressions;

CREATE POLICY "career_prog_select" ON public.career_progressions
  FOR SELECT USING (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND (
      profile_id = auth.uid()
      OR public.get_current_user_role() IN ('founder', 'diretoria', 'lider')
    )
  );

CREATE POLICY "career_prog_insert" ON public.career_progressions
  FOR INSERT WITH CHECK (
    tenant_id = ANY(public.get_user_tenant_ids())
    AND public.get_current_user_role() IN ('founder', 'diretoria', 'lider')
  );

-- ============================================================================
-- 4. SEED DATA — 6 núcleos × dual-track × 9 competências/nível
-- ============================================================================

DO $$
DECLARE
  tid uuid := '89080d1a-bc79-4c3f-8fce-20aabc561c0d';
  pid uuid;
  base_tid uuid;
  gestao_tid uuid;
  tecnica_tid uuid;
  lid uuid;

  -- Núcleos
  nucleo_names  text[] := ARRAY['Marketing','Branding','Digital 3D','Audiovisual','Operações','Comercial'];
  nucleo_slugs  text[] := ARRAY['marketing','branding','digital_3d','audiovisual','operacoes','comercial'];
  nucleo_icons  text[] := ARRAY['📣','✏️','🎨','🎬','⚙️','💼'];
  nucleo_descs  text[] := ARRAY[
    'Núcleo de Marketing, Conteúdo e Growth',
    'Núcleo de Identidade Visual e Branding',
    'Núcleo de Arte 3D e Visualização Digital',
    'Núcleo de Produção Audiovisual e Vídeo',
    'Núcleo de Operações, Projetos e Processos',
    'Núcleo Comercial e Novos Negócios'
  ];

  -- Trilha Base (igual para todos os núcleos)
  base_names text[] := ARRAY[
    'Estagiário','Junior I','Junior II','Junior III',
    'Pleno I','Pleno II','Pleno III',
    'Sênior I','Sênior II','PO'
  ];
  base_slugs text[] := ARRAY[
    'estagiario','jr_i','jr_ii','jr_iii',
    'pleno_i','pleno_ii','pleno_iii',
    'senior_i','senior_ii','po'
  ];

  -- Trilha Gestão (igual para todos)
  gestao_names text[] := ARRAY['Coordenador','Head','Diretor','Partner / Sócio'];
  gestao_slugs text[] := ARRAY['coordenador','head','diretor','partner'];

  -- Trilha Técnica (específica por núcleo)
  tech_names text[][] := ARRAY[
    ARRAY['Especialista em Marketing','Dir. de Marketing','Diretor Criativo','Partner / Sócio']::text[],
    ARRAY['Especialista em Branding','DA / Dir. de Arte','Diretor Criativo','Partner / Sócio']::text[],
    ARRAY['Especialista 3D','Artista 3D Master','Dir. de Arte 3D','Partner / Sócio']::text[],
    ARRAY['Especialista Audiovisual','Dir. de Fotografia','Diretor Criativo','Partner / Sócio']::text[],
    ARRAY['Especialista em Ops','Gerente de Operações','Dir. de Operações','Partner / Sócio']::text[],
    ARRAY['Especialista Comercial','Gerente Comercial','Diretor Comercial','Partner / Sócio']::text[]
  ];

  tech_slugs text[][] := ARRAY[
    ARRAY['esp_marketing','dir_marketing','dir_criativo_mkt','partner']::text[],
    ARRAY['esp_branding','da_dir_arte','dir_criativo_brd','partner']::text[],
    ARRAY['esp_3d','artista_master_3d','dir_arte_3d','partner']::text[],
    ARRAY['esp_audiovisual','dir_fotografia','dir_criativo_av','partner']::text[],
    ARRAY['esp_operacoes','ger_operacoes','dir_operacoes','partner']::text[],
    ARRAY['esp_comercial','ger_comercial','dir_comercial','partner']::text[]
  ];

  -- Competências
  comp_keys  text[] := ARRAY['gestao_projetos','habilidades_tecnicas','prazo','comunicacao','lideranca','criatividade','qualidade','produtividade','aprendizado'];
  comp_names text[] := ARRAY['Gestão de Projetos','Habilidades Técnicas','Prazo','Comunicação','Liderança','Criatividade','Qualidade','Produtividade','Aprendizado'];
  comp_types text[] := ARRAY['hard','hard','hard','soft','soft','soft','soft','soft','soft'];

  -- Scores por slug de nível (ordem: gestao_proj, hab_tec, prazo, comunicacao, lideranca, criatividade, qualidade, produtividade, aprendizado)
  score_map jsonb := '{
    "estagiario":       [15,15,15,15,10,20,15,15,30],
    "jr_i":             [25,30,25,25,20,30,25,25,40],
    "jr_ii":            [40,40,40,40,30,40,40,40,50],
    "jr_iii":           [50,50,50,50,40,50,50,50,60],
    "pleno_i":          [60,60,60,60,50,60,60,60,65],
    "pleno_ii":         [65,65,65,65,60,65,65,65,70],
    "pleno_iii":        [70,75,70,70,65,75,70,70,75],
    "senior_i":         [80,80,80,80,70,80,80,80,80],
    "senior_ii":        [80,85,80,80,80,85,80,80,90],
    "po":               [85,80,85,85,85,80,85,90,90],
    "coordenador":      [85,80,90,90,85,80,90,85,80],
    "head":             [90,85,90,90,90,80,90,90,80],
    "diretor":          [95,90,95,95,95,90,95,95,85],
    "partner":          [95,95,95,95,95,95,95,95,95],
    "esp_marketing":    [70,90,80,80,65,90,85,80,85],
    "dir_marketing":    [80,95,85,85,75,95,90,85,90],
    "dir_criativo_mkt": [90,95,90,90,85,98,95,90,90],
    "esp_branding":     [70,95,80,80,65,95,90,80,85],
    "da_dir_arte":      [80,97,85,85,75,97,95,85,90],
    "dir_criativo_brd": [90,95,90,90,85,98,95,90,90],
    "esp_3d":           [70,95,80,75,60,90,90,80,90],
    "artista_master_3d":[80,98,85,80,70,95,95,85,90],
    "dir_arte_3d":      [90,98,90,85,80,97,95,90,90],
    "esp_audiovisual":  [70,95,80,80,65,90,90,80,85],
    "dir_fotografia":   [80,97,85,85,75,95,95,85,90],
    "dir_criativo_av":  [90,95,90,90,85,98,95,90,90],
    "esp_operacoes":    [90,70,95,85,80,60,95,95,80],
    "ger_operacoes":    [92,75,95,88,87,65,95,95,80],
    "dir_operacoes":    [95,80,97,92,92,70,97,97,85],
    "esp_comercial":    [75,80,85,90,80,70,85,90,80],
    "ger_comercial":    [85,85,90,93,87,75,90,92,80],
    "dir_comercial":    [90,90,92,95,92,80,92,95,85]
  }';

  scores_arr int[];
  n int; i int; j int;

BEGIN
  FOR n IN 1..6 LOOP
    -- Inserir path
    INSERT INTO public.career_paths (tenant_id, name, nucleo, icon, description, order_index)
    VALUES (tid, nucleo_names[n], nucleo_slugs[n], nucleo_icons[n], nucleo_descs[n], n)
    ON CONFLICT (tenant_id, nucleo) DO NOTHING
    RETURNING id INTO pid;

    -- Se já existia (DO NOTHING), pegar o id existente
    IF pid IS NULL THEN
      SELECT id INTO pid FROM public.career_paths WHERE tenant_id = tid AND nucleo = nucleo_slugs[n];
    END IF;

    -- =========================================================
    -- TRILHA BASE
    -- =========================================================
    INSERT INTO public.career_tracks (path_id, name, track_type, order_index)
    VALUES (pid, 'Trilha Base', 'base', 1)
    ON CONFLICT (path_id, track_type) DO NOTHING
    RETURNING id INTO base_tid;

    IF base_tid IS NULL THEN
      SELECT id INTO base_tid FROM public.career_tracks WHERE path_id = pid AND track_type = 'base';
    END IF;

    FOR i IN 1..array_length(base_names, 1) LOOP
      INSERT INTO public.career_levels (track_id, name, slug, order_index, is_transition_point)
      VALUES (base_tid, base_names[i], base_slugs[i], i, base_slugs[i] = 'po')
      ON CONFLICT (track_id, slug) DO NOTHING
      RETURNING id INTO lid;

      IF lid IS NULL THEN
        SELECT id INTO lid FROM public.career_levels WHERE track_id = base_tid AND slug = base_slugs[i];
      END IF;

      scores_arr := ARRAY(
        SELECT (val::text)::int
        FROM jsonb_array_elements(score_map->base_slugs[i]) AS val
      );

      FOR j IN 1..9 LOOP
        INSERT INTO public.career_level_competencies (level_id, competency_key, competency_name, competency_type, expected_score)
        VALUES (lid, comp_keys[j], comp_names[j], comp_types[j], scores_arr[j])
        ON CONFLICT (level_id, competency_key) DO NOTHING;
      END LOOP;
    END LOOP;

    -- =========================================================
    -- TRILHA GESTÃO
    -- =========================================================
    INSERT INTO public.career_tracks (path_id, name, track_type, order_index)
    VALUES (pid, 'Trilha Gestão', 'gestao', 2)
    ON CONFLICT (path_id, track_type) DO NOTHING
    RETURNING id INTO gestao_tid;

    IF gestao_tid IS NULL THEN
      SELECT id INTO gestao_tid FROM public.career_tracks WHERE path_id = pid AND track_type = 'gestao';
    END IF;

    FOR i IN 1..4 LOOP
      INSERT INTO public.career_levels (track_id, name, slug, order_index, is_transition_point)
      VALUES (gestao_tid, gestao_names[i], gestao_slugs[i], i, false)
      ON CONFLICT (track_id, slug) DO NOTHING
      RETURNING id INTO lid;

      IF lid IS NULL THEN
        SELECT id INTO lid FROM public.career_levels WHERE track_id = gestao_tid AND slug = gestao_slugs[i];
      END IF;

      scores_arr := ARRAY(
        SELECT (val::text)::int
        FROM jsonb_array_elements(score_map->gestao_slugs[i]) AS val
      );

      FOR j IN 1..9 LOOP
        INSERT INTO public.career_level_competencies (level_id, competency_key, competency_name, competency_type, expected_score)
        VALUES (lid, comp_keys[j], comp_names[j], comp_types[j], scores_arr[j])
        ON CONFLICT (level_id, competency_key) DO NOTHING;
      END LOOP;
    END LOOP;

    -- =========================================================
    -- TRILHA TÉCNICA
    -- =========================================================
    INSERT INTO public.career_tracks (path_id, name, track_type, order_index)
    VALUES (pid, 'Trilha Técnica', 'tecnica', 3)
    ON CONFLICT (path_id, track_type) DO NOTHING
    RETURNING id INTO tecnica_tid;

    IF tecnica_tid IS NULL THEN
      SELECT id INTO tecnica_tid FROM public.career_tracks WHERE path_id = pid AND track_type = 'tecnica';
    END IF;

    FOR i IN 1..4 LOOP
      INSERT INTO public.career_levels (track_id, name, slug, order_index, is_transition_point)
      VALUES (tecnica_tid, tech_names[n][i], tech_slugs[n][i], i, false)
      ON CONFLICT (track_id, slug) DO NOTHING
      RETURNING id INTO lid;

      IF lid IS NULL THEN
        SELECT id INTO lid FROM public.career_levels WHERE track_id = tecnica_tid AND slug = tech_slugs[n][i];
      END IF;

      scores_arr := ARRAY(
        SELECT (val::text)::int
        FROM jsonb_array_elements(
          COALESCE(score_map->tech_slugs[n][i], score_map->'diretor')
        ) AS val
      );

      FOR j IN 1..9 LOOP
        INSERT INTO public.career_level_competencies (level_id, competency_key, competency_name, competency_type, expected_score)
        VALUES (lid, comp_keys[j], comp_names[j], comp_types[j], scores_arr[j])
        ON CONFLICT (level_id, competency_key) DO NOTHING;
      END LOOP;
    END LOOP;

  END LOOP; -- fim loop núcleos
END $$;

-- ============================================================================
-- 5. UPDATED_AT trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS set_career_paths_updated_at    ON public.career_paths;
DROP TRIGGER IF EXISTS set_career_levels_updated_at   ON public.career_levels;

CREATE TRIGGER set_career_paths_updated_at
  BEFORE UPDATE ON public.career_paths
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_career_levels_updated_at
  BEFORE UPDATE ON public.career_levels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
