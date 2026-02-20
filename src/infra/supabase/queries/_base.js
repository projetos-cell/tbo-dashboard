/**
 * TBO OS — Base Repository Helpers
 *
 * Funções compartilhadas por todos os repos.
 * Garante: tenant obrigatório, client disponível, logging.
 */

const RepoBase = (() => {
  /**
   * Retorna Supabase client (TBO_DB prioritário, fallback TBO_SUPABASE)
   * @throws {Error} se nenhum client disponível
   */
  function getDb() {
    if (typeof TBO_DB !== 'undefined' && TBO_DB.isReady()) return TBO_DB;
    if (typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.getClient()) {
      return {
        from: (t) => TBO_SUPABASE.getClient().from(t),
        rpc: (f, p) => TBO_SUPABASE.getClient().rpc(f, p)
      };
    }
    const err = new Error('[RepoBase] Nenhum client Supabase disponível');
    if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.error(err.message);
    throw err;
  }

  /**
   * Retorna tenant_id do usuário atual.
   * LANÇA ERRO se tenant_id não existir — impede writes sem tenant.
   * @returns {string} UUID do tenant
   * @throws {Error}
   */
  function requireTenantId() {
    if (typeof TBO_AUTH === 'undefined') {
      const err = new Error('[RepoBase] TBO_AUTH não disponível — impossível determinar tenant');
      if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.error(err.message);
      throw err;
    }

    const user = TBO_AUTH.getCurrentUser();
    if (!user) {
      const err = new Error('[RepoBase] Usuário não autenticado — tenant_id obrigatório');
      if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.error(err.message);
      throw err;
    }

    const tenant = user.tenant_id || user.org_id;
    if (!tenant) {
      const err = new Error(`[RepoBase] Usuário ${user.id} sem tenant_id/org_id — operação bloqueada`);
      if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.error(err.message, { userId: user.id });
      throw err;
    }

    return tenant;
  }

  return { getDb, requireTenantId };
})();

if (typeof window !== 'undefined') {
  window.RepoBase = RepoBase;
}
