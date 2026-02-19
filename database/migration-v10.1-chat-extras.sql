-- Migration v10.1: Chat Extras — Secoes, Attachments, Polls
-- Executar no Supabase SQL Editor APOS migration v10

-- ══════════════════════════════════════════════════════════════════════════
-- 1. SECOES DE CANAIS (categorias colapsaveis na sidebar)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_channel_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_collapsed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_sections_tenant ON chat_channel_sections(tenant_id);

-- Adicionar coluna section_id nos canais
ALTER TABLE chat_channels ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES chat_channel_sections(id);

-- ══════════════════════════════════════════════════════════════════════════
-- 2. ATTACHMENTS (arquivos e imagens)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_attachments_message ON chat_attachments(message_id);

-- ══════════════════════════════════════════════════════════════════════════
-- 3. ENQUETES (polls)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  allows_multiple BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES chat_polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chat_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES chat_polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES chat_poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(poll_id, option_id, user_id)
);

-- ══════════════════════════════════════════════════════════════════════════
-- 4. ADICIONAR metadata na mensagem (para tipo especial: poll, attachment, etc)
-- ══════════════════════════════════════════════════════════════════════════
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'
  CHECK (message_type IN ('text','image','file','poll','system'));
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ══════════════════════════════════════════════════════════════════════════
-- 5. RLS para novas tabelas
-- ══════════════════════════════════════════════════════════════════════════
ALTER TABLE chat_channel_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_poll_votes ENABLE ROW LEVEL SECURITY;

-- Secoes: qualquer user autenticado pode ver
CREATE POLICY "sections_select" ON chat_channel_sections FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "sections_insert" ON chat_channel_sections FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "sections_update" ON chat_channel_sections FOR UPDATE USING (created_by = auth.uid());

-- Attachments: seguir policy da mensagem (quem ve a msg ve o attachment)
CREATE POLICY "attach_select" ON chat_attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_messages m
    JOIN chat_channel_members ccm ON ccm.channel_id = m.channel_id
    WHERE m.id = chat_attachments.message_id AND ccm.user_id = auth.uid())
);
CREATE POLICY "attach_insert" ON chat_attachments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Polls: quem ve a mensagem ve a enquete
CREATE POLICY "polls_select" ON chat_polls FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "polls_insert" ON chat_polls FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "poll_options_select" ON chat_poll_options FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "poll_options_insert" ON chat_poll_options FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "poll_votes_select" ON chat_poll_votes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "poll_votes_insert" ON chat_poll_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "poll_votes_delete" ON chat_poll_votes FOR DELETE USING (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════════
-- 6. REALTIME para novas tabelas
-- ══════════════════════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE chat_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_poll_votes;

-- ══════════════════════════════════════════════════════════════════════════
-- 7. SEED: Secao padrao "Canais"
-- ══════════════════════════════════════════════════════════════════════════
-- Executar apos saber tenant_id:
-- INSERT INTO chat_channel_sections (tenant_id, name, sort_order, created_by)
-- VALUES ('TENANT_ID', 'Canais', 0, 'USER_ID');
-- UPDATE chat_channels SET section_id = 'SECTION_ID' WHERE tenant_id = 'TENANT_ID';
