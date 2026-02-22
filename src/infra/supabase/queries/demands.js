/**
 * TBO OS — Repository: Demands
 *
 * Todas as queries de demandas passam por aqui.
 * UI NUNCA chama supabase.from('demands') diretamente.
 * tenant_id e OBRIGATORIO — lanca erro se ausente.
 */

const DemandsRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    /**
     * Lista demandas com filtros opcionais
     */
    async list({ projectId, status, parentOnly, limit = 100, offset = 0 } = {}) {
      let query = _db().from('demands')
        .select('*, project:projects(id, name, status)', { count: 'exact' })
        .eq('tenant_id', _tid())
        .order('due_date', { ascending: true, nullsFirst: false })
        .range(offset, offset + limit - 1);

      if (projectId) query = query.eq('project_id', projectId);
      if (status) query = query.eq('status', status);
      if (parentOnly) query = query.is('parent_demand_id', null);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data, count };
    },

    /**
     * Busca demanda por ID com subitens
     */
    async getById(id) {
      const { data, error } = await _db().from('demands')
        .select('*, project:projects(id, name, status), subitems:demands!parent_demand_id(id, title, status, due_date, responsible)')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Lista demandas de um projeto especifico
     */
    async listByProject(projectId, { status, limit = 200 } = {}) {
      let query = _db().from('demands')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('project_id', projectId)
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(limit);

      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    /**
     * Conta demandas por status para um projeto
     */
    async countByStatus(projectId) {
      const { data, error } = await _db().from('demands')
        .select('status')
        .eq('tenant_id', _tid())
        .eq('project_id', projectId);

      if (error) throw error;

      const counts = {};
      (data || []).forEach(d => {
        counts[d.status] = (counts[d.status] || 0) + 1;
      });
      return counts;
    },

    /**
     * Busca demandas por texto
     */
    async search(query, limit = 20) {
      const { data, error } = await _db().from('demands')
        .select('id, title, status, due_date, project:projects(id, name)')
        .eq('tenant_id', _tid())
        .ilike('title', `%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data;
    },
  };
})();

if (typeof window !== 'undefined') {
  window.DemandsRepo = DemandsRepo;
}
