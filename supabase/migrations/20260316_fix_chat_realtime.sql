-- Fix: Chat não atualizava em tempo real
-- Causa: REPLICA IDENTITY DEFAULT impedia o Supabase Realtime de avaliar
-- RLS policies com subqueries (EXISTS em msg_select) nos eventos de change.
-- Além disso, chat_channels não estava na publicação Realtime.

-- 1. REPLICA IDENTITY FULL para que o Realtime tenha acesso a todas as colunas
--    ao avaliar RLS policies nos eventos INSERT/UPDATE/DELETE
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_channels REPLICA IDENTITY FULL;
ALTER TABLE public.chat_channel_members REPLICA IDENTITY FULL;
ALTER TABLE public.chat_reactions REPLICA IDENTITY FULL;

-- 2. Adicionar chat_channels à publicação Realtime
--    (chat_messages, chat_channel_members e chat_reactions já estavam)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_channels;
