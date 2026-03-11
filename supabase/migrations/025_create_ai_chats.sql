-- ============================================================================
-- TBO OS — Migration 025: AI Chat Conversations
-- Tabela para persistir conversas com a IA (Aura)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT, -- auto-generated from first message
  context TEXT NOT NULL DEFAULT 'general' CHECK (context IN ('academy', 'pdi', 'okr', 'general')),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_chats_user_id ON public.ai_chats(user_id);
CREATE INDEX idx_ai_chats_tenant_id ON public.ai_chats(tenant_id);
CREATE INDEX idx_ai_chats_created_at ON public.ai_chats(created_at DESC);

-- RLS
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;

-- Users can only see their own chats
CREATE POLICY "ai_chats_select_own" ON public.ai_chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_chats_insert_own" ON public.ai_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_chats_update_own" ON public.ai_chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ai_chats_delete_own" ON public.ai_chats
  FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_ai_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ai_chats_updated_at
  BEFORE UPDATE ON public.ai_chats
  FOR EACH ROW EXECUTE FUNCTION public.update_ai_chats_updated_at();
