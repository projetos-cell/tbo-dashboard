/**
 * TBO OS — Repository: Audit Logs
 *
 * Queries centralizadas para logs de auditoria.
 * INSERT via RPC/trigger (server-side) + consulta aqui.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const AuditRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    /**
     * Lista logs de auditoria com filtros
     */
    async list({ action, entity, actor_id, from_date, to_date, limit = 100, offset = 0 } = {}) {
      let query = _db().from('audit_log')
        .select('*, actor:profiles(full_name, email, avatar_url)')
        .eq('tenant_id', _tid())
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (action) query = query.eq('action', action);
      if (entity) query = query.eq('entity', entity);
      if (actor_id) query = query.eq('actor_user_id', actor_id);
      if (from_date) query = query.gte('created_at', from_date);
      if (to_date) query = query.lte('created_at', to_date);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data, count };
    },

    /**
     * Registra ação de auditoria (client-side, para ações não cobertas por triggers)
     */
    async log({ action, entity, entity_id = null, payload = {} }) {
      const tid = _tid();
      const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      if (!user) {
        console.warn('[AuditRepo] Ignorando log de auditoria — usuário não autenticado');
        return;
      }

      const { error } = await _db().from('audit_log')
        .insert({
          tenant_id: tid,
          actor_user_id: user.id,
          action,
          entity,
          entity_id,
          payload,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.warn('[AuditRepo] Falha ao registrar auditoria:', error);
      }
    },

    /**
     * Exporta logs como array (para CSV)
     */
    async exportAll({ from_date, to_date } = {}) {
      let query = _db().from('audit_log')
        .select('created_at, action, entity, entity_id, actor_user_id, payload')
        .eq('tenant_id', _tid())
        .order('created_at', { ascending: false })
        .limit(5000);

      if (from_date) query = query.gte('created_at', from_date);
      if (to_date) query = query.lte('created_at', to_date);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.AuditRepo = AuditRepo;
}
