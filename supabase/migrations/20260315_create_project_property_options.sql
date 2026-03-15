-- Migration: project_property_options
-- Custom status & priority options for projects (Notion-style customizable properties)

CREATE TABLE IF NOT EXISTS public.project_property_options (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  property    text NOT NULL CHECK (property IN ('status', 'priority')),
  key         text NOT NULL,
  label       text NOT NULL,
  color       text NOT NULL DEFAULT '#6b7280',
  bg          text NOT NULL DEFAULT 'rgba(107,114,128,0.12)',
  category    text CHECK (
    category IS NULL OR category IN ('todo', 'in_progress', 'done')
  ),
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  UNIQUE (tenant_id, property, key)
);

-- Index for fast lookup
CREATE INDEX idx_ppo_tenant_property ON public.project_property_options (tenant_id, property, sort_order);

-- RLS
ALTER TABLE public.project_property_options ENABLE ROW LEVEL SECURITY;

-- Read: any authenticated user in tenant
CREATE POLICY "ppo_select" ON public.project_property_options
  FOR SELECT USING (
    tenant_id IN (SELECT get_user_tenant_ids())
  );

-- Insert/Update/Delete: founder + diretoria only
CREATE POLICY "ppo_insert" ON public.project_property_options
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "ppo_update" ON public.project_property_options
  FOR UPDATE USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('founder', 'diretoria')
    )
  );

CREATE POLICY "ppo_delete" ON public.project_property_options
  FOR DELETE USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('founder', 'diretoria')
    )
  );

-- Auto-update updated_at
CREATE TRIGGER set_ppo_updated_at
  BEFORE UPDATE ON public.project_property_options
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed default status options for existing tenants
INSERT INTO public.project_property_options (tenant_id, property, key, label, color, bg, category, sort_order)
SELECT
  t.id,
  'status',
  v.key,
  v.label,
  v.color,
  v.bg,
  v.category,
  v.sort_order
FROM public.tenants t
CROSS JOIN (VALUES
  ('em_andamento', 'Em Andamento',  '#3b82f6', 'rgba(59,130,246,0.12)',  'in_progress', 0),
  ('em_revisao',   'Em Revisão',    '#f59e0b', 'rgba(245,158,11,0.12)', 'in_progress', 1),
  ('finalizado',   'Finalizado',    '#22c55e', 'rgba(34,197,94,0.12)',  'done',        2),
  ('parado',       'Parado',        '#ef4444', 'rgba(239,68,68,0.12)',  'todo',        3),
  ('pausado',      'Pausado',       '#f59e0b', 'rgba(245,158,11,0.12)', 'todo',        4)
) AS v(key, label, color, bg, category, sort_order)
ON CONFLICT (tenant_id, property, key) DO NOTHING;

-- Seed default priority options
INSERT INTO public.project_property_options (tenant_id, property, key, label, color, bg, category, sort_order)
SELECT
  t.id,
  'priority',
  v.key,
  v.label,
  v.color,
  v.bg,
  NULL,
  v.sort_order
FROM public.tenants t
CROSS JOIN (VALUES
  ('urgente', 'Urgente', '#ef4444', 'rgba(239,68,68,0.12)',  0),
  ('alta',    'Alta',    '#f59e0b', 'rgba(245,158,11,0.12)', 1),
  ('media',   'Média',   '#3b82f6', 'rgba(59,130,246,0.12)', 2),
  ('baixa',   'Baixa',   '#6b7280', 'rgba(107,114,128,0.12)', 3)
) AS v(key, label, color, bg, sort_order)
ON CONFLICT (tenant_id, property, key) DO NOTHING;
