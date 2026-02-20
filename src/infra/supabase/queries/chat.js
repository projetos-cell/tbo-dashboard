/**
 * TBO OS — Repository: Chat
 *
 * Queries centralizadas para mensagens, canais, reações.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 * SEGURANÇA: listMessages valida que canal pertence ao tenant.
 * SEGURANÇA: removeReaction filtra por tenant_id.
 */

const ChatRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    /**
     * Lista canais do tenant
     */
    async listChannels() {
      const { data, error } = await _db().from('chat_channels')
        .select('*')
        .eq('tenant_id', _tid())
        .order('name');

      if (error) throw error;
      return data;
    },

    /**
     * Busca mensagens de um canal (paginado)
     * SEGURANÇA (C2): valida que canal pertence ao tenant antes de listar
     */
    async listMessages(channelId, { limit = 50, before = null } = {}) {
      const tid = _tid();

      // Valida que o canal pertence ao tenant atual
      const { data: channel, error: chError } = await _db().from('chat_channels')
        .select('id')
        .eq('id', channelId)
        .eq('tenant_id', tid)
        .single();

      if (chError || !channel) {
        throw new Error(`[ChatRepo] Canal ${channelId} não pertence ao tenant ou não existe`);
      }

      let query = _db().from('chat_messages')
        .select('*, sender:profiles(id, full_name, avatar_url)')
        .eq('channel_id', channelId)
        .eq('tenant_id', tid)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (before) query = query.lt('created_at', before);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).reverse();
    },

    /**
     * Envia mensagem
     */
    async sendMessage({ channel_id, content, metadata = null, reply_to = null }) {
      const tid = _tid();
      const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      if (!user) throw new Error('[ChatRepo] Usuário não autenticado para enviar mensagem');

      const { data, error } = await _db().from('chat_messages')
        .insert({
          channel_id,
          content,
          sender_id: user.id,
          tenant_id: tid,
          metadata,
          reply_to,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Adiciona reação
     */
    async addReaction(messageId, emoji) {
      const tid = _tid();
      const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      if (!user) throw new Error('[ChatRepo] Usuário não autenticado para reagir');

      const { error } = await _db().from('chat_reactions')
        .upsert({
          message_id: messageId,
          user_id: user.id,
          emoji,
          tenant_id: tid
        }, { onConflict: 'message_id,user_id,emoji' });

      if (error) throw error;
    },

    /**
     * Remove reação
     * SEGURANÇA (C3): filtra por tenant_id no DELETE
     */
    async removeReaction(messageId, emoji) {
      const tid = _tid();
      const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      if (!user) throw new Error('[ChatRepo] Usuário não autenticado para remover reação');

      const { error } = await _db().from('chat_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .eq('tenant_id', tid);

      if (error) throw error;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.ChatRepo = ChatRepo;
}
