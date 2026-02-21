/**
 * TBO OS — Base Repository Helpers
 *
 * Funções compartilhadas por todos os repos.
 * Garante: tenant obrigatório, client disponível, logging.
 */

const RepoBase = (() => {
  // Cache do tenant_id resolvido (evita lookups repetidos)
  let _tenantCache = null;

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
   * Retorna tenant_id do usuário atual (sync, com cache).
   * Fontes (em ordem de prioridade):
   *   1. Cache local (já resolvido anteriormente)
   *   2. TBO_AUTH.getCurrentUser().tenant_id / org_id
   *   3. Supabase user_metadata.tenant_id (populado no signup/login)
   * LANÇA ERRO se tenant_id não existir — impede writes sem tenant.
   * @returns {string} UUID do tenant
   * @throws {Error}
   */
  function requireTenantId() {
    // 1. Cache — evita lookups repetidos
    if (_tenantCache) return _tenantCache;

    // 2. TBO_AUTH user object
    if (typeof TBO_AUTH !== 'undefined') {
      const user = TBO_AUTH.getCurrentUser();
      if (user) {
        const tenant = user.tenant_id || user.org_id;
        if (tenant) {
          _tenantCache = tenant;
          return tenant;
        }
      }
    }

    // 3. localStorage — workspace selector (TBO_SUPABASE.getCurrentTenantId compatível)
    try {
      const wsId = localStorage.getItem('tbo_current_tenant');
      if (wsId) {
        _tenantCache = wsId;
        return wsId;
      }
    } catch { /* fallthrough */ }

    // 4. sessionStorage — auth session tenantId
    try {
      const raw = sessionStorage.getItem('tbo_auth');
      if (raw) {
        const session = JSON.parse(raw);
        if (session.tenantId) {
          _tenantCache = session.tenantId;
          return session.tenantId;
        }
      }
    } catch { /* fallthrough */ }

    // 5. Supabase session user_metadata (sync via _currentSession cache interno)
    try {
      const db = getDb();
      // getSession() é sync no @supabase/supabase-js v2 (retorna session cacheada)
      const session = db.auth?._currentSession || db.getClient?.()?.auth?._currentSession;
      const meta = session?.user?.user_metadata;
      if (meta?.tenant_id) {
        _tenantCache = meta.tenant_id;
        return meta.tenant_id;
      }
    } catch { /* fallthrough */ }

    // 6. TBO_SUPABASE.getCurrentTenantId() como último fallback
    try {
      if (typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.getCurrentTenantId) {
        const tid = TBO_SUPABASE.getCurrentTenantId();
        if (tid) {
          _tenantCache = tid;
          return tid;
        }
      }
    } catch { /* fallthrough */ }

    const userName = (typeof TBO_AUTH !== 'undefined' && TBO_AUTH.getCurrentUser()?.id) || 'desconhecido';
    const err = new Error(`[RepoBase] Usuário ${userName} sem tenant_id — operação bloqueada`);
    if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.error(err.message, { userId: userName });
    throw err;
  }

  /**
   * Resolve tenant_id de forma assíncrona (para boot ou primeiro uso).
   * Chama auth.getUser() do Supabase que retorna user_metadata com tenant_id.
   * @returns {Promise<string>} UUID do tenant
   */
  async function resolveTenantId() {
    // Se já tem cache, retorna direto
    if (_tenantCache) return _tenantCache;

    // Tenta sync primeiro (agora cobre localStorage, sessionStorage, TBO_SUPABASE)
    try {
      return requireTenantId();
    } catch { /* precisa do fallback async */ }

    // Fallback async: Supabase getUser()
    try {
      const db = getDb();
      const client = db.getClient ? db.getClient() : null;
      if (client) {
        const { data } = await client.auth.getUser();
        const tid = data?.user?.user_metadata?.tenant_id;
        if (tid) {
          _tenantCache = tid;
          // Persistir para proximas chamadas sync
          try { localStorage.setItem('tbo_current_tenant', tid); } catch { /* ignore */ }
          return tid;
        }
      }
    } catch (e) {
      if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.warn('[RepoBase] resolveTenantId falhou:', e.message);
    }

    throw new Error('[RepoBase] Não foi possível resolver tenant_id');
  }

  /**
   * Limpa cache (para logout)
   */
  function clearCache() {
    _tenantCache = null;
  }

  return { getDb, requireTenantId, resolveTenantId, clearCache };
})();

if (typeof window !== 'undefined') {
  window.RepoBase = RepoBase;
}
