-- ============================================================================
-- Migration: CRM Deal Activities (histórico de interações e comentários)
-- Armazena activities, notes e tasks importadas do RD Station antes da remoção
-- ============================================================================

-- ── crm_deal_activities ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.crm_deal_activities (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  deal_id        uuid        REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  rd_deal_id     text,
  type           text        NOT NULL DEFAULT 'note',
    -- types: note, call, email, meeting, task, stage_change, creation, won, lost, comment
  title          text,
  content        text,
  author_name    text,
  author_email   text,
  metadata       jsonb       DEFAULT '{}'::jsonb,
    -- Campos flexíveis: duration, phone, email_subject, old_stage, new_stage, etc.
  occurred_at    timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_crm_deal_activities_tenant ON public.crm_deal_activities(tenant_id);
CREATE INDEX idx_crm_deal_activities_deal   ON public.crm_deal_activities(deal_id);
CREATE INDEX idx_crm_deal_activities_rd     ON public.crm_deal_activities(rd_deal_id);
CREATE INDEX idx_crm_deal_activities_type   ON public.crm_deal_activities(tenant_id, type);
CREATE INDEX idx_crm_deal_activities_date   ON public.crm_deal_activities(occurred_at DESC);

-- RLS
ALTER TABLE public.crm_deal_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_deal_activities_select" ON public.crm_deal_activities
  FOR SELECT USING (tenant_id IN (SELECT public.get_user_tenant_ids()));

CREATE POLICY "crm_deal_activities_insert" ON public.crm_deal_activities
  FOR INSERT WITH CHECK (tenant_id IN (SELECT public.get_user_tenant_ids()));

CREATE POLICY "crm_deal_activities_update" ON public.crm_deal_activities
  FOR UPDATE USING (tenant_id IN (SELECT public.get_user_tenant_ids()));

CREATE POLICY "crm_deal_activities_delete" ON public.crm_deal_activities
  FOR DELETE USING (tenant_id IN (SELECT public.get_user_tenant_ids()));

-- ── Adicionar campo notes/activities_count em crm_deals para referência rápida ──

ALTER TABLE public.crm_deals ADD COLUMN IF NOT EXISTS activities_count integer DEFAULT 0;
ALTER TABLE public.crm_deals ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;
