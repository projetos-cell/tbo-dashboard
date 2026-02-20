/**
 * TBO OS — RBAC Permission Engine (v3.0)
 *
 * Camada fina sobre TBO_PERMISSIONS existente.
 * Adiciona: cache, can() unificado, auditoria de checks.
 *
 * Uso:
 *   TBO_RBAC.can(user, 'projects.create')
 *   TBO_RBAC.canAccess(user, 'financeiro')
 *   TBO_RBAC.require('projects.delete') // throws se não pode
 */

const TBO_RBAC = (() => {
  let _matrix = null; // Cache da permission matrix
  let _userPermissions = null; // Cache das permissões do usuário atual
  let _lastLoadTime = 0;
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  // H4: Roles com bypass total (acesso a todos os módulos/permissões)
  const BYPASS_ROLES = ['founder', 'admin', 'coordinator'];

  /**
   * Carrega matrix de permissões (usa TBO_PERMISSIONS se disponível)
   */
  async function _ensureMatrix() {
    const now = Date.now();
    if (_matrix && (now - _lastLoadTime) < CACHE_TTL) return _matrix;

    if (typeof TBO_PERMISSIONS !== 'undefined' && TBO_PERMISSIONS.loadPermissionsMatrix) {
      _matrix = await TBO_PERMISSIONS.loadPermissionsMatrix();
      _lastLoadTime = now;
    }
    return _matrix;
  }

  /**
   * Resolve permissões do usuário (via cache ou Supabase RPC)
   */
  async function _getUserPermissions(userId) {
    if (_userPermissions && _userPermissions._userId === userId) {
      return _userPermissions;
    }

    if (typeof TBO_PERMISSIONS !== 'undefined' && TBO_PERMISSIONS.getUserPermissions) {
      const perms = await TBO_PERMISSIONS.getUserPermissions(userId);
      _userPermissions = { ...perms, _userId: userId };
      return _userPermissions;
    }

    return null;
  }

  return {
    /**
     * Verifica se o usuário pode executar uma ação
     * @param {object|null} user - Objeto do usuário (ou null para usar TBO_AUTH)
     * @param {string} permission - Ex: 'projects.create', 'finance.view'
     * @returns {boolean}
     */
    can(user, permission) {
      // Se não recebeu user, usa TBO_AUTH
      if (!user && typeof TBO_AUTH !== 'undefined') {
        user = TBO_AUTH.getCurrentUser();
      }
      if (!user) return false;

      // H4: Roles com bypass total (founder, admin, coordinator)
      if (BYPASS_ROLES.includes(user.role)) return true;

      // Delega para TBO_PERMISSIONS (sistema existente)
      if (typeof TBO_PERMISSIONS !== 'undefined' && TBO_PERMISSIONS.canDo) {
        return TBO_PERMISSIONS.canDo(user.role, permission);
      }

      // Fallback: verifica TBO_AUTH
      if (typeof TBO_AUTH !== 'undefined' && TBO_AUTH.canDo) {
        return TBO_AUTH.canDo(permission);
      }

      return false;
    },

    /**
     * Verifica acesso a um módulo
     * @param {object|null} user
     * @param {string} moduleName
     * @returns {boolean}
     */
    canAccess(user, moduleName) {
      if (!user && typeof TBO_AUTH !== 'undefined') {
        user = TBO_AUTH.getCurrentUser();
      }
      if (!user) return false;

      // H4: Roles com bypass total
      if (BYPASS_ROLES.includes(user.role)) return true;

      if (typeof TBO_AUTH !== 'undefined' && TBO_AUTH.canAccess) {
        return TBO_AUTH.canAccess(moduleName);
      }

      return false;
    },

    /**
     * Exige permissão (lança erro se não tem)
     * @param {string} permission
     * @param {string} message - Mensagem customizada
     * @throws {Error}
     */
    require(permission, message = null) {
      if (!this.can(null, permission)) {
        const msg = message || `Permissão negada: ${permission}`;
        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.error('Acesso negado', msg);
        }
        throw new Error(msg);
      }
    },

    /**
     * Retorna role do usuário atual
     */
    getCurrentRole() {
      if (typeof TBO_AUTH !== 'undefined') {
        const user = TBO_AUTH.getCurrentUser();
        return user?.role || null;
      }
      return null;
    },

    /**
     * Invalida caches (chamar após mudança de role)
     */
    invalidateCache() {
      _matrix = null;
      _userPermissions = null;
      _lastLoadTime = 0;
    },

    /**
     * Helper: filtra lista com base em permissão
     * @param {Array} items - Lista de itens
     * @param {function} permFn - Função que retorna permission string para cada item
     * @returns {Array} Itens permitidos
     */
    filter(items, permFn) {
      return items.filter(item => this.can(null, permFn(item)));
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_RBAC = TBO_RBAC;

  // M4: Auto-invalidar cache quando sessão muda (login/logout/role change)
  try {
    if (typeof TBO_DB !== 'undefined' && TBO_DB.isReady()) {
      TBO_DB.getClient().auth.onAuthStateChange((event) => {
        if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
          TBO_RBAC.invalidateCache();
          console.log('[TBO_RBAC] Cache invalidado por evento auth:', event);
        }
      });
    }
  } catch { /* noop — TBO_DB pode não estar pronto ainda */ }
}
