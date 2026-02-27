/**
 * TBO OS — Repository: Recognitions (Elogios / Reconhecimentos)
 *
 * CRUD para elogios vinculados aos valores da empresa.
 * UI NUNCA chama supabase.from('recognitions') diretamente.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const RecognitionsRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }
  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u?.supabaseId || u?.id || null;
    }
    return null;
  }

  const _SELECT = 'id, from_user, to_user, value_id, value_name, value_emoji, message, likes, points, source, reviewed, meeting_id, detection_context, created_at';

  return {

    /**
     * Lista elogios com filtros opcionais
     */
    async list({ limit = 50, offset = 0 } = {}) {
      const tid = _tid();
      const { data, error, count } = await _db().from('recognitions')
        .select(_SELECT, { count: 'exact' })
        .eq('tenant_id', tid)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },

    /**
     * Elogios recebidos por uma pessoa
     */
    async getForUser(userId) {
      const { data, error } = await _db().from('recognitions')
        .select(_SELECT)
        .eq('tenant_id', _tid())
        .eq('to_user', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    /**
     * Cria novo elogio
     */
    async create(recognition) {
      const uid = _uid();
      const { data, error } = await _db().from('recognitions')
        .insert({
          ...recognition,
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
     * Incrementa likes de um elogio
     */
    async like(id) {
      // Buscar valor atual
      const { data: current, error: getErr } = await _db().from('recognitions')
        .select('likes')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (getErr) throw getErr;

      const { data, error } = await _db().from('recognitions')
        .update({ likes: (current.likes || 0) + 1 })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Remove elogio (admin only — RLS)
     */
    async remove(id) {
      const { error } = await _db().from('recognitions')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid());

      if (error) throw error;
      return true;
    },

    /**
     * KPIs: top reconhecidos, total, por valor
     */
    async getKPIs() {
      const tid = _tid();
      const { data, error } = await _db().from('recognitions')
        .select('id, to_user, value_id, value_name, created_at')
        .eq('tenant_id', tid);

      if (error) throw error;
      const all = data || [];

      // Contagem por pessoa (top reconhecidos)
      const byPerson = {};
      all.forEach(r => {
        byPerson[r.to_user] = (byPerson[r.to_user] || 0) + 1;
      });
      const topPeople = Object.entries(byPerson).sort((a, b) => b[1] - a[1]).slice(0, 5);

      // Contagem por valor
      const byValue = {};
      all.forEach(r => {
        const key = r.value_name || r.value_id;
        byValue[key] = (byValue[key] || 0) + 1;
      });

      // Este mes
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMo = all.filter(r => new Date(r.created_at) >= firstOfMonth).length;

      return {
        total: all.length,
        thisMonth: thisMo,
        topPeople,
        byValue
      };
    },

    // ── Fireflies auto-detect: reconhecimentos nao revisados ──

    /**
     * Lista reconhecimentos pendentes de revisao (auto-detectados)
     */
    async listUnreviewed({ limit = 50 } = {}) {
      const { data, error } = await _db().from('recognitions')
        .select(_SELECT)
        .eq('tenant_id', _tid())
        .eq('reviewed', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },

    /**
     * Aprovar reconhecimento auto-detectado
     */
    async approve(id) {
      const { data, error } = await _db().from('recognitions')
        .update({ reviewed: true })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Rejeitar (deletar) reconhecimento auto-detectado
     */
    async reject(id) {
      const { error } = await _db().from('recognitions')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid())
        .eq('reviewed', false);

      if (error) throw error;
      return true;
    },

    /**
     * Cria reconhecimento a partir de deteccao automatica (Fireflies)
     * reviewed=false ate admin aprovar
     */
    async createFromDetection({ to_user, message, meeting_id, detection_context, value_id, value_name, value_emoji }) {
      const { data, error } = await _db().from('recognitions')
        .insert({
          tenant_id: _tid(),
          from_user: null,
          to_user,
          value_id: value_id || 'colaboracao',
          value_name: value_name || 'Colaboracao',
          value_emoji: value_emoji || '🤝',
          message,
          points: 1,
          source: 'fireflies',
          reviewed: false,
          meeting_id,
          detection_context,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.RecognitionsRepo = RecognitionsRepo;
}
