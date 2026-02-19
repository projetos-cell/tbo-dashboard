-- Migration v9: Banco de Tarefas por Pessoa
-- Permite atribuir tarefas individuais a cada colaborador (PDI, onboarding, 1on1, geral)
-- Executar no Supabase SQL Editor

-- ══════════════════════════════════════════════════════════════════════════
-- 1. TABELA person_tasks
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS person_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  person_id TEXT NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','em_andamento','concluida','cancelada')),
  priority TEXT DEFAULT 'media' CHECK (priority IN ('alta','media','baixa')),
  due_date DATE,
  category TEXT DEFAULT 'general' CHECK (category IN ('pdi','onboarding','1on1_action','general')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════
-- 2. INDEXES
-- ══════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_person_tasks_tenant ON person_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_person_tasks_person ON person_tasks(person_id);
CREATE INDEX IF NOT EXISTS idx_person_tasks_status ON person_tasks(status);

-- ══════════════════════════════════════════════════════════════════════════
-- 3. RLS (Row Level Security)
-- ══════════════════════════════════════════════════════════════════════════
ALTER TABLE person_tasks ENABLE ROW LEVEL SECURITY;

-- Politica: usuarios so veem tarefas do seu tenant
CREATE POLICY "person_tasks_select" ON person_tasks FOR SELECT
  USING (
    tenant_id::text = coalesce(
      current_setting('request.jwt.claims', true)::json->>'tenant_id',
      (SELECT raw_user_meta_data->>'tenant_id' FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "person_tasks_insert" ON person_tasks FOR INSERT
  WITH CHECK (
    tenant_id::text = coalesce(
      current_setting('request.jwt.claims', true)::json->>'tenant_id',
      (SELECT raw_user_meta_data->>'tenant_id' FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "person_tasks_update" ON person_tasks FOR UPDATE
  USING (
    tenant_id::text = coalesce(
      current_setting('request.jwt.claims', true)::json->>'tenant_id',
      (SELECT raw_user_meta_data->>'tenant_id' FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "person_tasks_delete" ON person_tasks FOR DELETE
  USING (
    tenant_id::text = coalesce(
      current_setting('request.jwt.claims', true)::json->>'tenant_id',
      (SELECT raw_user_meta_data->>'tenant_id' FROM auth.users WHERE id = auth.uid())
    )
  );

-- ══════════════════════════════════════════════════════════════════════════
-- 4. TRIGGER para updated_at automatico
-- ══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_person_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_person_tasks_updated_at
  BEFORE UPDATE ON person_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_person_tasks_updated_at();
