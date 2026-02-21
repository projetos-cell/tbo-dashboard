/**
 * TBO OS — Repository: Feedbacks (Feedback bidirecional)
 *
 * CRUD para feedbacks positivos e construtivos entre membros.
 * UI NUNCA chama supabase.from('feedbacks') diretamente.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const FeedbacksRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }
  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u?.supabaseId || u?.id || null;
    }
    return null;
  }

  const _SELECT = 'id, from_user, to_user, type, visibility, message, created_at';

  return {

    /**
     * Lista feedbacks com filtros opcionais
     */
    async list({ type, limit = 50, offset = 0 } = {}) {
      const tid = _tid();
      let query = _db().from('feedbacks')
        .select(_SELECT, { count: 'exact' })
        .eq('tenant_id', tid)
        .order('created_at', { ascending: false });

      if (type) query = query.eq('type', type);

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },

    /**
     * Feedbacks recebidos por uma pessoa
     */
    async getForUser(userId) {
      const { data, error } = await _db().from('feedbacks')
        .select(_SELECT)
        .eq('tenant_id', _tid())
        .eq('to_user', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    /**
     * Feedbacks enviados por uma pessoa
     */
    async getFromUser(userId) {
      const { data, error } = await _db().from('feedbacks')
        .select(_SELECT)
        .eq('tenant_id', _tid())
        .eq('from_user', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    /**
     * Cria novo feedback
     */
    async create(feedback) {
      const uid = _uid();
      const { data, error } = await _db().from('feedbacks')
        .insert({
          ...feedback,
          tenant_id: _tid(),
          from_user: uid,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Remove feedback (proprio ou admin — RLS)
     */
    async remove(id) {
      const { error } = await _db().from('feedbacks')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid());

      if (error) throw error;
      return true;
    },

    /**
     * KPIs: total, positivos, construtivos, este mes
     */
    async getKPIs() {
      const tid = _tid();
      const { data, error } = await _db().from('feedbacks')
        .select('id, type, created_at')
        .eq('tenant_id', tid);

      if (error) throw error;
      const all = data || [];

      const positivos = all.filter(f => f.type === 'positivo').length;
      const construtivos = all.filter(f => f.type === 'construtivo').length;

      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMo = all.filter(f => new Date(f.created_at) >= firstOfMonth).length;

      return {
        total: all.length,
        positivos,
        construtivos,
        thisMonth: thisMo
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.FeedbacksRepo = FeedbacksRepo;
}
