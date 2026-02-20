-- ══════════════════════════════════════════════════════════════════════════
-- VERIFICACAO E FIX — Chat RLS Policies
-- Executar no Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════════════

-- 1. Verificar se RLS esta ativo nas tabelas de chat
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename LIKE 'chat_%' AND schemaname = 'public';

-- 2. Listar TODAS as policies existentes nas tabelas de chat
SELECT policyname, tablename, cmd, permissive, qual, with_check
FROM pg_policies
WHERE tablename LIKE 'chat_%'
ORDER BY tablename, policyname;

-- ══════════════════════════════════════════════════════════════════════════
-- 3. FIX: Recriar policies de chat_channels (caso faltem)
-- ══════════════════════════════════════════════════════════════════════════

-- ch_select: membros do canal podem ver o canal
DROP POLICY IF EXISTS "ch_select" ON chat_channels;
CREATE POLICY "ch_select" ON chat_channels FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE channel_id = chat_channels.id AND user_id = auth.uid()));

-- ch_insert: qualquer usuario autenticado pode criar canal (created_by = auth.uid())
DROP POLICY IF EXISTS "ch_insert" ON chat_channels;
CREATE POLICY "ch_insert" ON chat_channels FOR INSERT WITH CHECK (created_by = auth.uid());

-- ch_update: so admin do canal pode editar
DROP POLICY IF EXISTS "ch_update" ON chat_channels;
CREATE POLICY "ch_update" ON chat_channels FOR UPDATE
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE channel_id = chat_channels.id AND user_id = auth.uid() AND role = 'admin'));

-- ══════════════════════════════════════════════════════════════════════════
-- 4. FIX: Recriar policies de chat_channel_members
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "mem_select" ON chat_channel_members;
CREATE POLICY "mem_select" ON chat_channel_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "mem_insert" ON chat_channel_members;
CREATE POLICY "mem_insert" ON chat_channel_members FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "mem_delete" ON chat_channel_members;
CREATE POLICY "mem_delete" ON chat_channel_members FOR DELETE
  USING (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════════
-- 5. FIX: Recriar policies de chat_messages
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "msg_select" ON chat_messages;
CREATE POLICY "msg_select" ON chat_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid()) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "msg_insert" ON chat_messages;
CREATE POLICY "msg_insert" ON chat_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM chat_channel_members WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "msg_update" ON chat_messages;
CREATE POLICY "msg_update" ON chat_messages FOR UPDATE USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "msg_delete" ON chat_messages;
CREATE POLICY "msg_delete" ON chat_messages FOR DELETE USING (sender_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════════
-- 6. FIX: Recriar policies de chat_reactions
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "react_select" ON chat_reactions;
CREATE POLICY "react_select" ON chat_reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "react_insert" ON chat_reactions;
CREATE POLICY "react_insert" ON chat_reactions FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "react_delete" ON chat_reactions;
CREATE POLICY "react_delete" ON chat_reactions FOR DELETE USING (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════════
-- 7. Verificacao final — confirmar que todas as policies existem
-- ══════════════════════════════════════════════════════════════════════════
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE tablename LIKE 'chat_%'
ORDER BY tablename, policyname;
