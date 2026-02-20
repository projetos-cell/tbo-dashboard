/**
 * TBO OS — Activity Repository
 *
 * Busca dados de atividade recente via AuditRepo ou diretamente.
 * Camada de domínio sobre o repo de auditoria.
 */

const ActivityRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    /**
     * Lista atividades recentes com perfil do ator
     * @param {object} opts - { limit, offset, entity, action }
     * @returns {Promise<Array>}
     */
    async listRecent({ limit = 20, offset = 0, entity, action } = {}) {
      let query = _db().from('audit_log')
        .select('id, action, entity, entity_id, payload, created_at, actor:profiles(id, full_name, avatar_url)')
        .eq('tenant_id', _tid())
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (entity) query = query.eq('entity', entity);
      if (action) query = query.eq('action', action);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  };
})();

if (typeof window !== 'undefined') {
  window.ActivityRepo = ActivityRepo;
}
