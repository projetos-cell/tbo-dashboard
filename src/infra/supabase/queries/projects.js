/**
 * TBO OS — Repository: Projects
 *
 * Todas as queries de projetos passam por aqui.
 * UI NUNCA chama supabase.from('projects') diretamente.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const ProjectsRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    async list({ status, limit = 50, offset = 0 } = {}) {
      let query = _db().from('projects')
        .select('*, client:clients(name)', { count: 'exact' })
        .eq('tenant_id', _tid())
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) query = query.eq('status', status);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data, count };
    },

    /**
     * Lista projetos importados do Notion (com campos extras)
     */
    async listNotion({ status, limit = 100, offset = 0 } = {}) {
      let query = _db().from('projects')
        .select('id, name, status, construtora, bus, due_date_start, due_date_end, notion_url, notion_synced_at, updated_at', { count: 'exact' })
        .eq('tenant_id', _tid())
        .not('notion_page_id', 'is', null)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (status) query = query.eq('status', status);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data, count };
    },

    async getById(id) {
      const { data, error } = await _db().from('projects')
        .select('*, client:clients(name, email), tasks(id, title, status, assignee_id, due_date)')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    async create(project) {
      const tid = _tid();
      const { data, error } = await _db().from('projects')
        .insert({ ...project, tenant_id: tid })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await _db().from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async archive(id) {
      return this.update(id, { status: 'archived' });
    },

    async search(query, limit = 20) {
      const { data, error } = await _db().from('projects')
        .select('id, name, status, client:clients(name)')
        .eq('tenant_id', _tid())
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.ProjectsRepo = ProjectsRepo;
}
