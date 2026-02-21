/**
 * TBO OS — Sidebar Service (Notion-style)
 *
 * Fonte única de verdade: Supabase (sidebar_items + sidebar_user_state).
 * Controle de visibilidade via RBAC (allowed_roles).
 * Cache local com TTL para performance (<300ms).
 * Fallback para estrutura hardcoded se Supabase indisponível.
 *
 * API:
 *   TBO_SIDEBAR_SERVICE.init()
 *   TBO_SIDEBAR_SERVICE.getItems()        → itens filtrados por RBAC
 *   TBO_SIDEBAR_SERVICE.getUserState()     → estado expand/collapse do usuário
 *   TBO_SIDEBAR_SERVICE.toggleExpanded(itemId)
 *   TBO_SIDEBAR_SERVICE.refresh()
 */

const TBO_SIDEBAR_SERVICE = (() => {
  'use strict';

  // ── Estado ──────────────────────────────────────────────────────────────
  let _items = [];
  let _userState = {};
  let _userRole = null;
  let _tenantId = null;
  let _userId = null;
  let _initialized = false;
  let _loading = false;

  const CACHE_KEY = 'tbo_sidebar_items_cache';
  const STATE_KEY = 'tbo_sidebar_user_state';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  // ── Estrutura padrão (fallback quando Supabase indisponível) ────────────
  const DEFAULT_ITEMS = [
    // Seção raiz (nível superior) — itens fixos
    { id: 'sys-home',       name: 'Home',             type: 'system',    order_index: 1,  icon: 'home',             route: 'dashboard',  allowed_roles: [] },
    { id: 'sys-search',     name: 'Buscar',           type: 'system',    order_index: 2,  icon: 'search',           route: null,         allowed_roles: [], metadata: { action: 'search' } },
    { id: 'sys-reunioes',   name: 'Reuniões',         type: 'system',    order_index: 3,  icon: 'calendar',         route: 'agenda',     allowed_roles: [] },
    { id: 'sys-ia',         name: 'IA TBO',           type: 'system',    order_index: 5,  icon: 'sparkles',         route: null,         allowed_roles: [], metadata: { action: 'ai-assistant' } },
    { id: 'sys-inbox',      name: 'Caixa de entrada', type: 'system',    order_index: 6,  icon: 'inbox',            route: null,         allowed_roles: [], metadata: { action: 'toggle-inbox', badge_key: 'alerts' } },
    { id: 'sys-biblioteca', name: 'Biblioteca',       type: 'system',    order_index: 7,  icon: 'library',          route: 'biblioteca', allowed_roles: [] },

    // Separador
    { id: 'sep-equipe',     name: 'Espaços de equipe', type: 'separator', order_index: 8,  icon: 'users',           route: null,         allowed_roles: [] },

    // Workspaces
    { id: 'ws-geral',       name: 'Geral',            type: 'workspace', order_index: 9,  icon: 'globe',    route: null, parent_id: 'sep-equipe', allowed_roles: [] },
    { id: 'ws-branding',    name: 'Branding',         type: 'workspace', order_index: 10, icon: 'palette',  route: null, parent_id: 'sep-equipe', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'creative-dir', 'design', 'copy', 'qa'] },
    { id: 'ws-3d',          name: 'Digital 3D',       type: 'workspace', order_index: 11, icon: 'box',      route: null, parent_id: 'sep-equipe', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'creative-dir', '3d-lead', '3d-artist', 'qa'] },
    { id: 'ws-av',          name: 'Audiovisual',      type: 'workspace', order_index: 12, icon: 'video',    route: null, parent_id: 'sep-equipe', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'creative-dir', 'motion', 'qa', '3d-lead', '3d-artist'] },
    { id: 'ws-marketing',   name: 'Marketing',        type: 'workspace', order_index: 13, icon: 'megaphone',route: null, parent_id: 'sep-equipe', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'copy', 'design', 'qa'] },
    { id: 'ws-comercial',   name: 'Comercial',        type: 'workspace', order_index: 14, icon: 'briefcase',route: null, parent_id: 'sep-equipe', allowed_roles: ['owner', 'admin', 'diretor', 'comercial', 'cs', 'financeiro'] },
    { id: 'ws-diretoria',   name: 'Diretoria TBO',    type: 'workspace', order_index: 15, icon: 'shield',   route: null, parent_id: 'sep-equipe', allowed_roles: ['owner', 'admin', 'diretor'] },

    // Sub-items de workspaces (módulos fixos dentro de workspaces)
    { id: 'dir-financeiro', name: 'Financeiro',       type: 'child',     order_index: 15.1, icon: 'coins',  route: 'financeiro', parent_id: 'ws-diretoria', allowed_roles: ['owner', 'admin', 'diretor', 'financeiro'] },

    // Mais
    { id: 'sys-mais',       name: 'Mais',             type: 'system',    order_index: 16, icon: 'plus',     route: null, allowed_roles: [], metadata: { action: 'show-more-workspaces' } }
  ];

  // ── Helpers ─────────────────────────────────────────────────────────────

  function _getClient() {
    if (typeof TBO_DB !== 'undefined') return TBO_DB.getClient();
    if (typeof TBO_SUPABASE !== 'undefined') return TBO_SUPABASE.getClient();
    return null;
  }

  function _getUserRole() {
    // Tentar obter role do usuário atual
    if (typeof TBO_AUTH !== 'undefined') {
      const user = TBO_AUTH.getCurrentUser();
      if (user) {
        // Mapear roles legadas
        const roleMap = { 'socio': 'owner', 'founder': 'owner', 'artista': '3d-artist' };
        const role = user.role || user.role_slug || 'viewer';
        return roleMap[role] || role;
      }
    }
    return 'viewer';
  }

  function _getTenantId() {
    if (typeof TBO_AUTH !== 'undefined') {
      const user = TBO_AUTH.getCurrentUser();
      return user?.tenant_id || null;
    }
    return null;
  }

  function _getUserId() {
    if (typeof TBO_AUTH !== 'undefined') {
      const user = TBO_AUTH.getCurrentUser();
      return user?.id || null;
    }
    return null;
  }

  // ── RBAC Filter ─────────────────────────────────────────────────────────

  /**
   * Filtra itens baseado na role do usuário
   * Se allowed_roles está vazio → visível para todos
   * Se allowed_roles contém roles → visível apenas para essas roles
   */
  function _filterByRole(items, role) {
    // owner e admin veem tudo
    const bypassRoles = ['owner', 'admin'];
    if (bypassRoles.includes(role)) return items;

    return items.filter(item => {
      const roles = item.allowed_roles || [];
      // Vazio = todos podem ver
      if (roles.length === 0) return true;
      // Verificar se a role do usuário está na lista
      return roles.includes(role);
    });
  }

  // ── Cache ───────────────────────────────────────────────────────────────

  function _loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const cached = JSON.parse(raw);
      if (Date.now() - cached.timestamp > CACHE_TTL) return null;
      return cached.items;
    } catch (_e) {
      return null;
    }
  }

  function _saveCache(items) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        items,
        timestamp: Date.now()
      }));
    } catch (_e) {
      // localStorage cheio ou indisponível
    }
  }

  function _loadUserState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_e) {
      return {};
    }
  }

  function _saveUserState() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(_userState));
    } catch (_e) {
      // noop
    }
  }

  // ── Fetch do Supabase ───────────────────────────────────────────────────

  async function _fetchFromSupabase() {
    const client = _getClient();
    if (!client || !_tenantId) return null;

    try {
      const { data, error } = await client
        .from('sidebar_items')
        .select('*')
        .eq('tenant_id', _tenantId)
        .eq('is_visible', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.warn('[TBO Sidebar] Erro ao carregar do Supabase:', error.message);
        return null;
      }

      return data;
    } catch (e) {
      console.warn('[TBO Sidebar] Supabase indisponível:', e.message);
      return null;
    }
  }

  async function _fetchUserState() {
    const client = _getClient();
    if (!client || !_userId || !_tenantId) return;

    try {
      const { data, error } = await client
        .from('sidebar_user_state')
        .select('item_id, is_expanded, is_pinned')
        .eq('tenant_id', _tenantId)
        .eq('user_id', _userId);

      if (error || !data) return;

      const state = {};
      data.forEach(row => {
        state[row.item_id] = {
          is_expanded: row.is_expanded,
          is_pinned: row.is_pinned
        };
      });

      _userState = state;
      _saveUserState();
    } catch (_e) {
      // Usar estado local como fallback
    }
  }

  async function _saveExpandedState(itemId, expanded) {
    // Salvar localmente primeiro (resposta imediata)
    if (!_userState[itemId]) _userState[itemId] = {};
    _userState[itemId].is_expanded = expanded;
    _saveUserState();

    // Persistir no Supabase em background
    const client = _getClient();
    if (!client || !_userId || !_tenantId) return;

    try {
      await client
        .from('sidebar_user_state')
        .upsert({
          tenant_id: _tenantId,
          user_id: _userId,
          item_id: itemId,
          is_expanded: expanded
        }, {
          onConflict: 'tenant_id,user_id,item_id'
        });
    } catch (_e) {
      // Falha silenciosa — estado local já atualizado
    }
  }

  // ── API Pública ─────────────────────────────────────────────────────────

  async function init() {
    if (_initialized) return;
    _loading = true;

    _userRole = _getUserRole();
    _tenantId = _getTenantId();
    _userId = _getUserId();

    // 1. Tentar cache local para resposta instantânea
    const cached = _loadCache();
    if (cached) {
      _items = cached;
    }

    // 2. Carregar estado do usuário (local primeiro)
    _userState = _loadUserState();

    // 3. Fetch do Supabase em background
    const supabaseItems = await _fetchFromSupabase();
    if (supabaseItems && supabaseItems.length > 0) {
      _items = supabaseItems;
      _saveCache(supabaseItems);
    } else if (_items.length === 0) {
      // Fallback para estrutura padrão
      _items = DEFAULT_ITEMS;
      _saveCache(DEFAULT_ITEMS);
    }

    // 4. Fetch estado do usuário do Supabase
    await _fetchUserState();

    _loading = false;
    _initialized = true;
  }

  /**
   * Retorna itens filtrados por RBAC, ordenados por order_index
   * @returns {Array}
   */
  function getItems() {
    const role = _userRole || _getUserRole();
    const filtered = _filterByRole(_items, role);
    return filtered.sort((a, b) => a.order_index - b.order_index);
  }

  /**
   * Retorna itens do tipo system (seção raiz)
   */
  function getSystemItems() {
    return getItems().filter(i => i.type === 'system');
  }

  /**
   * Retorna separadores
   */
  function getSeparators() {
    return getItems().filter(i => i.type === 'separator');
  }

  /**
   * Retorna workspaces (espaços de equipe)
   */
  function getWorkspaces() {
    return getItems().filter(i => i.type === 'workspace');
  }

  /**
   * Retorna sub-items (children) de um workspace específico
   * Usados para módulos fixos dentro de workspaces (ex: Financeiro dentro de Diretoria)
   */
  function getChildItems(parentId) {
    return getItems().filter(i => i.type === 'child' && i.parent_id === parentId);
  }

  /**
   * Retorna estado de expansão de um item
   */
  function isExpanded(itemId) {
    const state = _userState[itemId];
    if (state && typeof state.is_expanded === 'boolean') {
      return state.is_expanded;
    }
    // Default: expandido
    return true;
  }

  /**
   * Toggle expand/collapse de um workspace
   */
  function toggleExpanded(itemId) {
    const current = isExpanded(itemId);
    _saveExpandedState(itemId, !current);
    return !current;
  }

  /**
   * Força re-fetch do Supabase
   */
  async function refresh() {
    _initialized = false;
    _items = [];
    localStorage.removeItem(CACHE_KEY);
    await init();
  }

  /**
   * Retorna badge count para um item
   */
  function getBadge(itemId) {
    const item = _items.find(i => i.id === itemId);
    if (!item?.metadata?.badge_key) return 0;

    // Integração com SidebarEnhancer ou sistema de badges
    if (typeof TBO_SIDEBAR_ENHANCER !== 'undefined') {
      return TBO_SIDEBAR_ENHANCER.getBadge?.(item.metadata.badge_key) || 0;
    }
    return 0;
  }

  return {
    init,
    getItems,
    getSystemItems,
    getSeparators,
    getWorkspaces,
    getChildItems,
    isExpanded,
    toggleExpanded,
    refresh,
    getBadge,
    get loading() { return _loading; },
    get initialized() { return _initialized; },
    get userRole() { return _userRole; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_SIDEBAR_SERVICE = TBO_SIDEBAR_SERVICE;
}
