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
     * Lista demandas com filtros avancados (para modulo projetos-notion)
     * @param {Object} filters
     * @param {string}   filters.status        - Filtrar por status exato
     * @param {string}   filters.responsible    - Filtrar por responsavel (nome parcial)
     * @param {string}   filters.priority       - Filtrar por prioridade
     * @param {string}   filters.bu             - Filtrar por BU (nome exato, usa @> no array)
     * @param {string}   filters.prazoFrom      - Data inicio (ISO string)
     * @param {string}   filters.prazoTo        - Data fim (ISO string)
     * @param {boolean}  filters.feito          - Filtrar por checkbox feito
     * @param {string}   filters.projectId      - Filtrar por projeto
     * @param {string}   filters.search         - Busca por texto no titulo
     * @param {boolean}  filters.parentOnly     - Apenas demandas pai (sem subitens)
     * @param {string[]} filters.busArray       - Filtrar por multiplas BUs (OR)
     * @param {number}   filters.limit
     * @param {number}   filters.offset
     */
    async listFiltered(filters = {}) {
      const { status, responsible, priority, bu, busArray, prazoFrom, prazoTo,
              feito, projectId, search, parentOnly, limit = 500, offset = 0 } = filters;

      let query = _db().from('demands')
        .select('*, project:projects(id, name, status, bus, construtora)', { count: 'exact' })
        .eq('tenant_id', _tid())
        .order('due_date', { ascending: true, nullsFirst: false })
        .range(offset, offset + limit - 1);

      // Status filter
      if (status) query = query.eq('status', status);

      // Responsible filter (partial match)
      if (responsible) query = query.ilike('responsible', `%${responsible}%`);

      // Priority filter
      if (priority) query = query.eq('priority', priority);

      // BU filter — single BU uses contains operator on text array
      if (bu) query = query.contains('bus', [bu]);

      // BU filter — multiple BUs (OR logic): fetch all then filter client-side
      // Supabase does not support OR on array contains natively, so we handle this client-side

      // Date range filter
      if (prazoFrom) query = query.gte('due_date', prazoFrom);
      if (prazoTo) query = query.lte('due_date', prazoTo);

      // Feito checkbox filter
      if (feito === true) query = query.eq('feito', true);
      if (feito === false) query = query.eq('feito', false);

      // Project filter
      if (projectId) query = query.eq('project_id', projectId);

      // Text search
      if (search) query = query.ilike('title', `%${search}%`);

      // Parent only (no subitems)
      if (parentOnly) query = query.is('parent_demand_id', null);

      const { data, error, count } = await query;
      if (error) throw error;

      // Client-side OR filter for multiple BUs (if busArray provided)
      let filtered = data || [];
      if (busArray && busArray.length > 0) {
        filtered = filtered.filter(d =>
          (d.bus || []).some(b => busArray.includes(b))
        );
      }

      return { data: filtered, count: busArray ? filtered.length : count };
    },

    /**
     * Lista todas as demandas com projeto join (para agrupar por projeto)
     */
    async listAllWithProjects({ limit = 1000 } = {}) {
      const { data, error } = await _db().from('demands')
        .select('*, project:projects(id, name, status, bus, construtora)')
        .eq('tenant_id', _tid())
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },

    /**
     * Retorna valores unicos de campos para popular dropdowns de filtro
     */
    async getFilterOptions() {
      const { data, error } = await _db().from('demands')
        .select('status, responsible, priority, bus, feito')
        .eq('tenant_id', _tid());

      if (error) throw error;

      const statuses = new Set();
      const responsaveis = new Set();
      const priorities = new Set();
      const busSet = new Set();

      (data || []).forEach(d => {
        if (d.status) statuses.add(d.status);
        if (d.responsible) responsaveis.add(d.responsible);
        if (d.priority) priorities.add(d.priority);
        (d.bus || []).forEach(b => busSet.add(b));
      });

      return {
        statuses: [...statuses].sort(),
        responsaveis: [...responsaveis].sort(),
        priorities: [...priorities].sort(),
        bus: [...busSet].sort(),
      };
    },

    /**
     * Busca demanda por ID com subitens
     */
    async getById(id) {
      const { data, error } = await _db().from('demands')
        .select('*, project:projects(id, name, status), subitems:demands!parent_demand_id(id, title, status, due_date, responsible, bus, feito)')
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
