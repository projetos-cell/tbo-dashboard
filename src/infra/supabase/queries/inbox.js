/**
 * TBO OS — Inbox Notifications Repository
 *
 * CRUD para inbox_notifications (Caixa de Entrada).
 * Segue o padrao RepoBase: _db() + _uid() helpers, tenant isolation via RLS.
 */
const InboxRepo = (() => {
  /**
   * Retorna Supabase client (TBO_DB prioritario, fallback TBO_SUPABASE)
   */
  function _db() {
    if (typeof TBO_DB !== 'undefined' && TBO_DB.isReady && TBO_DB.isReady()) return TBO_DB;
    if (typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.getClient()) {
      const client = TBO_SUPABASE.getClient();
      return {
        from: (t) => client.from(t),
        rpc: (f, p) => client.rpc(f, p),
        auth: client.auth
      };
    }
    throw new Error('[InboxRepo] Nenhum client Supabase disponivel');
  }

  /**
   * Retorna user_id (UUID) do usuario autenticado
   * Prioridade: supabaseId (UUID real) > Supabase session > null
   */
  function _uid() {
    // Via TBO_AUTH (preferencial) — supabaseId e o UUID real; id pode ser slug (ex: "marco")
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u?.supabaseId || u?.id || null;
    }
    // Via Supabase session
    try {
      const db = _db();
      const session = db.auth?._currentSession;
      if (session?.user?.id) return session.user.id;
    } catch { /* fallthrough */ }
    return null;
  }

  return {
    /**
     * Lista notificacoes do usuario
     * @param {Object} opts - { limit, unreadOnly }
     * @returns {Promise<Array>}
     */
    async list({ limit = 50, unreadOnly = false } = {}) {
      const uid = _uid();
      if (!uid) return [];

      let q = _db()
        .from('inbox_notifications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) q = q.eq('is_read', false);

      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },

    /**
     * Conta notificacoes nao lidas
     * @returns {Promise<number>}
     */
    async unreadCount() {
      const uid = _uid();
      if (!uid) return 0;

      const { count, error } = await _db()
        .from('inbox_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },

    /**
     * Marca uma notificacao como lida
     * @param {string} id - UUID da notificacao
     */
    async markRead(id) {
      const uid = _uid();
      if (!uid) return;

      const { error } = await _db()
        .from('inbox_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', uid);

      if (error) throw error;
    },

    /**
     * Marca todas as notificacoes como lidas
     */
    async markAllRead() {
      const uid = _uid();
      if (!uid) return;

      const { error } = await _db()
        .from('inbox_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', uid)
        .eq('is_read', false);

      if (error) throw error;
    },

    /**
     * Cria uma notificacao (usado por edge functions / triggers)
     * @param {Object} notification - { tenant_id, user_id, type, title, body, metadata }
     * @returns {Promise<Object>}
     */
    async create(notification) {
      const { data, error } = await _db()
        .from('inbox_notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  };
})();

if (typeof window !== 'undefined') window.InboxRepo = InboxRepo;
