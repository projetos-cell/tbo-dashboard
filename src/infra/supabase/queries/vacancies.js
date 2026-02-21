/**
 * TBO OS — Repository: Vacancies (Vagas)
 *
 * CRUD e queries para gestão de vagas abertas.
 * UI NUNCA chama supabase.from('vacancies') diretamente.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const VacanciesRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }
  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u?.supabaseId || u?.id || null;
    }
    return null;
  }

  const _SELECT = 'id, title, area, description, requirements, responsible_id, status, priority, notes, opened_at, closed_at, created_by, created_at, updated_at';

  return {

    /**
     * Lista vagas com filtros opcionais
     */
    async list({ status, area, priority, search, limit = 50, offset = 0 } = {}) {
      const tid = _tid();
      let query = _db().from('vacancies')
        .select(_SELECT, { count: 'exact' })
        .eq('tenant_id', tid)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (area) query = query.eq('area', area);
      if (priority) query = query.eq('priority', priority);

      if (search) {
        const safe = search.replace(/[%(),.]/g, '');
        query = query.or(`title.ilike.%${safe}%,area.ilike.%${safe}%,description.ilike.%${safe}%`);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },

    /**
     * Busca vaga por ID (inclui candidatos vinculados)
     */
    async getById(id) {
      const { data, error } = await _db().from('vacancies')
        .select('*, vacancy_candidates(id, stage, notes, linked_at, talent_id, talents(id, full_name, email, specialty, seniority, status))')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Cria nova vaga
     */
    async create(vacancy) {
      const { data, error } = await _db().from('vacancies')
        .insert({
          ...vacancy,
          tenant_id: _tid(),
          created_by: _uid(),
          opened_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Atualiza vaga
     */
    async update(id, updates) {
      const { data, error } = await _db().from('vacancies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Fecha vaga (status = closed + closed_at)
     */
    async close(id) {
      return this.update(id, {
        status: 'closed',
        closed_at: new Date().toISOString()
      });
    },

    /**
     * Conta candidatos por vaga
     */
    async getCandidateCounts(vacancyIds = []) {
      const tid = _tid();
      const { data, error } = await _db().from('vacancy_candidates')
        .select('vacancy_id')
        .eq('tenant_id', tid)
        .in('vacancy_id', vacancyIds);

      if (error) throw error;

      const counts = {};
      (data || []).forEach(vc => {
        counts[vc.vacancy_id] = (counts[vc.vacancy_id] || 0) + 1;
      });
      return counts;
    },

    /**
     * KPIs agregados de vagas
     */
    async getKPIs() {
      const tid = _tid();
      const { data, error } = await _db().from('vacancies')
        .select('id, status, area, opened_at, closed_at')
        .eq('tenant_id', tid);

      if (error) throw error;
      const all = data || [];

      const byStatus = { draft: 0, open: 0, in_progress: 0, paused: 0, closed: 0, filled: 0 };
      const byArea = {};
      let closedThisMonth = 0;
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      all.forEach(v => {
        byStatus[v.status || 'open']++;
        if (v.area) byArea[v.area] = (byArea[v.area] || 0) + 1;
        if (v.closed_at && new Date(v.closed_at) >= firstOfMonth) closedThisMonth++;
      });

      return {
        total: all.length,
        byStatus,
        byArea,
        closedThisMonth
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.VacanciesRepo = VacanciesRepo;
}
