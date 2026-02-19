-- Migration v10: Chat em Tempo Real (Slack-style)
-- Canais, mensagens, membros, reacoes + realtime
-- Executar no Supabase SQL Editor

-- ══════════════════════════════════════════════════════════════════════════
-- 1. CANAIS
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'channel' CHECK (type IN ('channel','direct','group')),
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_channels_tenant ON chat_channels(tenant_id);

-- ══════════════════════════════════════════════════════════════════════════
-- 2. MENSAGENS
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  reply_to UUID REFERENCES chat_messages(id),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);

-- ══════════════════════════════════════════════════════════════════════════
-- 3. MEMBROS DO CANAL
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_channel_members (
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT DEFAULT 'member',
  last_read_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

-- ══════════════════════════════════════════════════════════════════════════
-- 4. REACOES
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- ══════════════════════════════════════════════════════════════════════════
-- 5. RLS (Row Level Security)
-- ══════════════════════════════════════════════════════════════════════════
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_reactions ENABLE ROW LEVEL SECURITY;

-- Canais: so membros veem
CREATE POLICY "ch_select" ON chat_channels FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE channel_id = chat_channels.id AND user_id = auth.uid()));
CREATE POLICY "ch_insert" ON chat_channels FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "ch_update" ON chat_channels FOR UPDATE
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE channel_id = chat_channels.id AND user_id = auth.uid() AND role = 'admin'));

-- Mensagens: so membros do canal veem, nao deletadas
CREATE POLICY "msg_select" ON chat_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid()) AND deleted_at IS NULL);
CREATE POLICY "msg_insert" ON chat_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM chat_channel_members WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid()));
CREATE POLICY "msg_update" ON chat_messages FOR UPDATE USING (sender_id = auth.uid());
CREATE POLICY "msg_delete" ON chat_messages FOR DELETE USING (sender_id = auth.uid());

-- Membros: veem apenas membros dos seus canais
CREATE POLICY "mem_select" ON chat_channel_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_channel_members AS m WHERE m.channel_id = chat_channel_members.channel_id AND m.user_id = auth.uid()));
CREATE POLICY "mem_insert" ON chat_channel_members FOR INSERT WITH CHECK (true);
CREATE POLICY "mem_delete" ON chat_channel_members FOR DELETE
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM chat_channel_members AS m WHERE m.channel_id = chat_channel_members.channel_id AND m.user_id = auth.uid() AND m.role = 'admin'));

-- Reacoes
CREATE POLICY "react_select" ON chat_reactions FOR SELECT USING (true);
CREATE POLICY "react_insert" ON chat_reactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "react_delete" ON chat_reactions FOR DELETE USING (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════════
-- 6. HABILITAR REALTIME
-- ══════════════════════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_channel_members;

-- ══════════════════════════════════════════════════════════════════════════
-- 7. SEED: Canal #geral (trocar tenant_id e user_id pelo real)
-- ══════════════════════════════════════════════════════════════════════════
-- Executar separadamente apos saber os IDs reais:
--
-- INSERT INTO chat_channels (tenant_id, name, type, description, created_by)
-- VALUES ('SEU_TENANT_ID', 'geral', 'channel', 'Canal geral do time', 'SEU_USER_ID');
--
-- INSERT INTO chat_channel_members (channel_id, user_id, role)
-- VALUES
--   ('CHANNEL_ID', 'MARCO_USER_ID', 'admin'),
--   ('CHANNEL_ID', 'RUY_USER_ID', 'member');
