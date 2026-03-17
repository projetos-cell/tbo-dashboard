-- ============================================================
-- TBO OS — campaign_pieces table + RLS
-- Feature #83 — Migration: campaign pieces (creative assets)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.campaign_pieces (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id     UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente','em_producao','revisao','aprovado','publicado')),
  file_url        TEXT,
  assigned_to     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date        DATE,
  -- Feature #67: relação bidirecional com content_items
  content_item_id UUID,  -- FK adicionada após criação de content_items
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_campaign_pieces_tenant   ON public.campaign_pieces(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_pieces_campaign ON public.campaign_pieces(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_pieces_status   ON public.campaign_pieces(status);
CREATE INDEX IF NOT EXISTS idx_campaign_pieces_assigned ON public.campaign_pieces(assigned_to);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_campaign_pieces_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS campaign_pieces_updated_at ON public.campaign_pieces;
CREATE TRIGGER campaign_pieces_updated_at
  BEFORE UPDATE ON public.campaign_pieces
  FOR EACH ROW EXECUTE FUNCTION public.set_campaign_pieces_updated_at();

-- RLS
ALTER TABLE public.campaign_pieces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaign_pieces_select" ON public.campaign_pieces;
CREATE POLICY "campaign_pieces_select" ON public.campaign_pieces
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "campaign_pieces_insert" ON public.campaign_pieces;
CREATE POLICY "campaign_pieces_insert" ON public.campaign_pieces
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "campaign_pieces_update" ON public.campaign_pieces;
CREATE POLICY "campaign_pieces_update" ON public.campaign_pieces
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "campaign_pieces_delete" ON public.campaign_pieces;
CREATE POLICY "campaign_pieces_delete" ON public.campaign_pieces
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
