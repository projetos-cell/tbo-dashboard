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
  const ORDER_KEY = 'tbo_sidebar_custom_order';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  // ── Estrutura padrão (fallback quando Supabase indisponível) ────────────
  const DEFAULT_ITEMS = [
    // Seção raiz (nível superior) — itens fixos
    { id: 'sys-home',       name: 'Home',             type: 'system',    order_index: 1,  icon: 'home',             route: 'dashboard',  allowed_roles: [] },
    { id: 'sys-search',     name: 'Buscar',           type: 'system',    order_index: 2,  icon: 'search',           route: null,         allowed_roles: [], metadata: { action: 'search' } },
    { id: 'sys-reunioes',   name: 'Reuniões',         type: 'system',    order_index: 3,  icon: 'calendar',         route: 'agenda',     allowed_roles: [] },
    { id: 'sys-ia',         name: 'IA TBO',           type: 'system',    order_index: 5,  icon: 'sparkles',         route: null,         allowed_roles: [], metadata: { action: 'ai-assistant' } },
    { id: 'sys-inbox',      name: 'Caixa de entrada', type: 'system',    order_index: 6,  icon: 'inbox',            route: null,         allowed_roles: [], metadata: { action: 'toggle-inbox', badge_key: 'alerts' } },

    // Separador
    { id: 'sep-equipe',     name: 'Espaços de equipe', type: 'separator', order_index: 8,  icon: 'users',           route: null,         allowed_roles: [] },

    // Workspaces
    { id: 'ws-geral',       name: 'Geral',            type: 'workspace', order_index: 9,  icon: 'globe',    route: null, parent_id: 'sep-equipe', allowed_roles: [] },
    { id: 'ws-branding',    name: 'Branding',         type: 'workspace', order_index: 10, icon: 'palette',  route: null, parent_id: 'sep-equipe', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'creative-dir', 'design', 'copy', 'qa'] },
    { id: 'ws-3d',          name: 'Digital 3D',       type: 'workspace', order_index: 11, icon: 'box',      route: null, parent_id: 'sep-equipe', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'creative-dir', '3d-lead', '3d-artist', 'qa'] },
    { id: 'ws-av',          name: 'Audiovisual',      type: 'workspace', order_index: 12, icon: 'video',    route: null, parent_id: 'sep-equipe', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'creative-dir', 'motion', 'qa', '3d-lead', '3d-artist'] },
    { id: 'ws-marketing',   name: 'Marketing',        type: 'workspace', order_index: 13, icon: 'megaphone',route: null, parent_id: 'sep-equipe', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'copy', 'design', 'qa'] },
    { id: 'ws-comercial',   name: 'Comercial',        type: 'workspace', order_index: 14, icon: 'briefcase',route: null, parent_id: 'sep-equipe', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'comercial', 'cs', 'financeiro'] },
    { id: 'ws-pessoas',     name: 'Pessoas',          type: 'workspace', order_index: 14.5, icon: 'heart-handshake', route: null, parent_id: 'sep-equipe', allowed_roles: [] },
    { id: 'ws-diretoria',   name: 'Diretoria TBO',    type: 'workspace', order_index: 15, icon: 'shield',   route: null, parent_id: 'sep-equipe', allowed_roles: ['owner', 'admin', 'diretor'] },

    // ── Sub-items: Geral ──────────────────────────────────────────────────
    { id: 'geral-quadro-projetos', name: 'Quadro de Projetos', type: 'child', order_index: 9.025, icon: 'layout-dashboard', route: 'quadro-projetos', parent_id: 'ws-geral', allowed_roles: [] },
    { id: 'geral-cultura',     name: 'Manual de Cultura',     type: 'child', order_index: 9.03, icon: 'book-open',        route: 'cultura',                      parent_id: 'ws-geral', allowed_roles: [] },
    { id: 'geral-docs',        name: 'Documentos & Padrões',  type: 'child', order_index: 9.04, icon: 'file-text',        route: 'notion-embed/geral-docs',      parent_id: 'ws-geral', allowed_roles: [] },
    { id: 'geral-okrs',        name: 'OKRs TBO — 2026',      type: 'child', order_index: 14.56, icon: 'target',           route: 'okrs',                         parent_id: 'ws-pessoas', allowed_roles: [] },

    // ── Sub-items: Branding ─────────────────────────────────────────────
    { id: 'brand-projetos',    name: 'Quadro de Projetos',    type: 'child', order_index: 10.01, icon: 'kanban',          route: 'projetos', parent_id: 'ws-branding', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'creative-dir', 'design', 'copy', 'qa'] },
    { id: 'brand-linhas',      name: 'Linhas Editoriais',     type: 'child', order_index: 10.02, icon: 'pen-tool',        route: 'notion-embed/brand-linhas',      parent_id: 'ws-branding', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'creative-dir', 'design', 'copy', 'qa'] },
    { id: 'brand-links',       name: 'Links Educacionais',    type: 'child', order_index: 10.03, icon: 'link',            route: 'notion-embed/brand-links',       parent_id: 'ws-branding', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'creative-dir', 'design', 'copy', 'qa'] },
    { id: 'brand-atendimento', name: 'Atendimento & Gestão',  type: 'child', order_index: 10.04, icon: 'headphones',      route: 'notion-embed/brand-atendimento', parent_id: 'ws-branding', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'creative-dir', 'design', 'copy', 'qa'] },

    // ── Sub-items: Digital 3D ───────────────────────────────────────────
    { id: '3d-projetos',       name: 'Quadro de Projetos',    type: 'child', order_index: 11.01, icon: 'kanban',          route: 'projetos', parent_id: 'ws-3d', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'creative-dir', '3d-lead', '3d-artist', 'qa'] },
    { id: '3d-cronograma',     name: 'Cronograma',            type: 'child', order_index: 11.02, icon: 'calendar-range',  route: 'notion-embed/3d-cronograma', parent_id: 'ws-3d', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'creative-dir', '3d-lead', '3d-artist', 'qa'] },

    // ── Sub-items: Audiovisual ──────────────────────────────────────────
    { id: 'av-projetos',       name: 'Quadro de Projetos',    type: 'child', order_index: 12.01, icon: 'kanban',          route: 'projetos', parent_id: 'ws-av', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'creative-dir', 'motion', 'qa', '3d-lead', '3d-artist'] },
    { id: 'av-cronograma',     name: 'Cronograma',            type: 'child', order_index: 12.02, icon: 'calendar-range',  route: 'notion-embed/av-cronograma', parent_id: 'ws-av', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'creative-dir', 'motion', 'qa', '3d-lead', '3d-artist'] },

    // ── Sub-items: Marketing ────────────────────────────────────────────
    { id: 'mkt-guia',          name: 'Guia da Marca',         type: 'child', order_index: 13.01, icon: 'book-marked',     route: 'notion-embed/mkt-guia',       parent_id: 'ws-marketing', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'copy', 'design', 'qa'] },
    { id: 'mkt-calendario',    name: 'Calendário Redes Sociais', type: 'child', order_index: 13.02, icon: 'calendar',    route: 'notion-embed/mkt-calendario', parent_id: 'ws-marketing', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'copy', 'design', 'qa'] },
    { id: 'mkt-demandas',      name: 'Gestão de Demandas',    type: 'child', order_index: 13.03, icon: 'list-checks',     route: 'notion-embed/mkt-demandas',   parent_id: 'ws-marketing', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'copy', 'design', 'qa'] },
    { id: 'mkt-rsm',           name: 'Social Media (RSM)',    type: 'child', order_index: 13.05, icon: 'share-2',         route: 'rsm', parent_id: 'ws-marketing', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'copy', 'design', 'qa'] },

    // ── Sub-items: Comercial ────────────────────────────────────────────
    { id: 'com-pipeline',      name: 'Pipeline',              type: 'child', order_index: 14.01, icon: 'filter',          route: 'pipeline', parent_id: 'ws-comercial', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'comercial', 'cs', 'financeiro'] },
    { id: 'com-clientes',      name: 'Clientes',              type: 'child', order_index: 14.02, icon: 'building-2',      route: 'clientes', parent_id: 'ws-comercial', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'comercial', 'cs', 'financeiro'] },
    { id: 'com-propostas',     name: 'Propostas',             type: 'child', order_index: 14.03, icon: 'file-text',       route: 'comercial', parent_id: 'ws-comercial', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'comercial', 'cs', 'financeiro'] },
    { id: 'com-gestao',        name: 'Gestão Comercial',      type: 'child', order_index: 14.05, icon: 'chart-bar',       route: 'notion-embed/com-gestao', parent_id: 'ws-comercial', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm', 'comercial', 'cs', 'financeiro'] },

    // ── Sub-items: Diretoria ────────────────────────────────────────────
    { id: 'dir-painel',     name: 'Painel Diretoria',  type: 'child',     order_index: 15.05, icon: 'layout-dashboard', route: 'diretoria', parent_id: 'ws-diretoria', allowed_roles: ['owner', 'admin', 'diretor'] },
    { id: 'dir-financeiro', name: 'Financeiro',       type: 'child',     order_index: 15.1, icon: 'coins',  route: 'financeiro', parent_id: 'ws-diretoria', allowed_roles: ['owner', 'admin', 'diretor', 'financeiro'] },
    { id: 'dir-people',     name: 'People Analytics',  type: 'child',     order_index: 15.15, icon: 'bar-chart-3', route: 'diretoria/people', parent_id: 'ws-diretoria', allowed_roles: ['owner', 'admin', 'diretor'] },
    { id: 'dir-relatorios', name: 'Relatórios',      type: 'child',     order_index: 15.2, icon: 'file-bar-chart', route: 'relatorios', parent_id: 'ws-diretoria', allowed_roles: ['owner', 'admin', 'diretor'] },
    { id: 'dir-audit',      name: 'Auditoria',         type: 'child',     order_index: 15.25, icon: 'scroll-text', route: 'diretoria/auditoria', parent_id: 'ws-diretoria', allowed_roles: ['owner', 'admin', 'diretor'] },
    { id: 'dir-portal',     name: 'Portal do Cliente', type: 'child',     order_index: 15.3, icon: 'monitor-smartphone', route: 'portal-cliente', parent_id: 'ws-diretoria', allowed_roles: ['owner', 'admin', 'diretor'] },

    // Sub-items do workspace Pessoas (RH) — deep link: rh/{tab}
    { id: 'rh-equipe',      name: 'Equipe',            type: 'child', order_index: 14.51,  icon: 'users',           route: 'rh',                parent_id: 'ws-pessoas', allowed_roles: [] },
    { id: 'rh-talentos',    name: 'Banco de Talentos', type: 'child', order_index: 14.515, icon: 'user-plus',       route: 'rh/banco-talentos', parent_id: 'ws-pessoas', allowed_roles: [] },
    { id: 'rh-vagas',       name: 'Vagas',             type: 'child', order_index: 14.52,  icon: 'briefcase',       route: 'rh/vagas',          parent_id: 'ws-pessoas', allowed_roles: [] },
    { id: 'rh-contratos',   name: 'Contratos',         type: 'child', order_index: 14.525, icon: 'file-text',       route: 'rh/contratos',      parent_id: 'ws-pessoas', allowed_roles: ['owner', 'admin', 'diretor', 'financeiro'] },
    { id: 'rh-performance', name: 'Performance & PDI', type: 'child', order_index: 14.53,  icon: 'target',          route: 'rh/performance',    parent_id: 'ws-pessoas', allowed_roles: [] },
    { id: 'rh-1on1s',       name: '1:1s & Rituais',   type: 'child', order_index: 14.54,  icon: 'message-circle',  route: 'rh/one-on-ones',    parent_id: 'ws-pessoas', allowed_roles: ['owner', 'admin', 'diretor', 'po', 'pm'] },
    { id: 'rh-analytics',   name: 'Analytics',         type: 'child', order_index: 14.55,  icon: 'bar-chart-3',     route: 'rh/analytics',      parent_id: 'ws-pessoas', allowed_roles: ['owner', 'admin', 'diretor'] },

    // Workspace Cultura — visivel para todos
    { id: 'ws-cultura',     name: 'Cultura',           type: 'workspace', order_index: 14.6, icon: 'flame', route: null, parent_id: 'sep-equipe', allowed_roles: [] },

    // Sub-items do workspace Cultura — deep link: rh/cultura/{subtab}
    { id: 'cult-valores',       name: 'Valores TBO',          type: 'child', order_index: 14.61, icon: 'gem',             route: 'rh/cultura/valores',          parent_id: 'ws-cultura', allowed_roles: [] },
    { id: 'cult-reconhecimentos', name: 'Reconhecimentos',    type: 'child', order_index: 14.62, icon: 'award',           route: 'reconhecimentos',  parent_id: 'ws-cultura', allowed_roles: [] },
    { id: 'cult-rituais',       name: 'Rituais',              type: 'child', order_index: 14.63, icon: 'repeat',          route: 'rh/cultura/rituais',          parent_id: 'ws-cultura', allowed_roles: [] },
    { id: 'cult-feedbacks',     name: 'Feedbacks',            type: 'child', order_index: 14.64, icon: 'message-square',  route: 'rh/cultura/feedbacks',        parent_id: 'ws-cultura', allowed_roles: [] },
    { id: 'cult-historico',     name: 'Historico cultural',   type: 'child', order_index: 14.65, icon: 'clock',           route: 'rh/cultura/historico',         parent_id: 'ws-cultura', allowed_roles: [] },
    { id: 'cult-onboarding',    name: 'Onboarding cultural',  type: 'child', order_index: 14.66, icon: 'book-open',       route: 'rh/cultura/onboarding',       parent_id: 'ws-cultura', allowed_roles: [] },

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
        // Mapear roles legadas para roles da sidebar
        const roleMap = {
          'socio': 'owner', 'founder': 'owner', 'fundador': 'owner',
          'artista': '3d-artist', 'artist': '3d-artist',
          'project_owner': 'po', 'coordinator': 'pm',
          'finance': 'financeiro', 'comercial': 'comercial'
        };
        const role = user.role || user.role_slug || 'viewer';
        // Super admins always get owner role
        if (typeof TBO_PERMISSIONS !== 'undefined' && TBO_PERMISSIONS.isSuperAdmin(user.email)) return 'owner';
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
      // Mesclar child items do DEFAULT que não existem no Supabase
      // (garante que novos items hardcoded apareçam mesmo com dados no DB)
      const supabaseIds = new Set(supabaseItems.map(i => i.id));
      const missingDefaults = DEFAULT_ITEMS.filter(d => d.type === 'child' && !supabaseIds.has(d.id));
      _items = [...supabaseItems, ...missingDefaults];
      _saveCache(_items);
    } else if (_items.length === 0) {
      // Fallback para estrutura padrão
      _items = DEFAULT_ITEMS;
      _saveCache(DEFAULT_ITEMS);
    }

    // 4. Aplicar ordem customizada do drag & drop (localStorage)
    _applyCustomOrder();

    // 5. Fetch estado do usuário do Supabase
    await _fetchUserState();

    _loading = false;
    _initialized = true;
  }

  /**
   * Retorna itens filtrados por RBAC, ordenados por order_index
   * @returns {Array}
   */
  function getItems() {
    // v3.0: Sempre re-checar role — auth pode ter ficado pronto depois do init()
    const role = _getUserRole();
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
    // Default: recolhido (collapsed)
    return false;
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
   * Atualiza a role cacheada do usuario (chamar apos login)
   */
  function refreshRole() {
    _userRole = _getUserRole();
    _tenantId = _getTenantId();
    _userId = _getUserId();
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

  // ── Custom Order (drag & drop persistence) ──────────────────────────────

  function _loadCustomOrder() {
    try {
      const raw = localStorage.getItem(ORDER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_e) {
      return null;
    }
  }

  function _saveCustomOrder(orderMap) {
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(orderMap));
    } catch (_e) {
      // noop
    }
  }

  // ── Parent Override (cross-workspace move persistence) ──────────────

  const PARENT_OVERRIDE_KEY = 'tbo_sidebar_parent_overrides';

  function _loadParentOverrides() {
    try {
      const raw = localStorage.getItem(PARENT_OVERRIDE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_e) {
      return {};
    }
  }

  function _saveParentOverride(childId, newParentId) {
    try {
      const overrides = _loadParentOverrides();
      overrides[childId] = newParentId;
      localStorage.setItem(PARENT_OVERRIDE_KEY, JSON.stringify(overrides));
    } catch (_e) {
      // noop
    }
  }

  /**
   * Aplica ordem customizada (do localStorage) sobre os items carregados.
   * orderMap: { itemId: newOrderIndex, ... }
   */
  function _applyCustomOrder() {
    const orderMap = _loadCustomOrder();
    if (orderMap) {
      _items.forEach(item => {
        if (orderMap[item.id] !== undefined) {
          item.order_index = orderMap[item.id];
        }
      });
    }

    // Aplicar parent_id overrides de moves cross-workspace
    const parentOverrides = _loadParentOverrides();
    if (parentOverrides) {
      _items.forEach(item => {
        if (parentOverrides[item.id] !== undefined) {
          item.parent_id = parentOverrides[item.id];
        }
      });
    }
  }

  /**
   * Reordena workspaces: recebe lista ordenada de workspace IDs na nova posição.
   * Recalcula order_index para cada workspace mantendo a sequência.
   * @param {string[]} orderedIds - IDs dos workspaces na ordem desejada
   */
  function reorderWorkspaces(orderedIds) {
    const orderMap = _loadCustomOrder() || {};

    // Pegar workspaces atuais com seus order_index para referência
    const workspaces = _items.filter(i => i.type === 'workspace').sort((a, b) => a.order_index - b.order_index);
    if (workspaces.length === 0) return;

    // Usar o menor order_index dos workspaces como base
    const baseIndex = workspaces[0].order_index;

    // Atribuir novos order_index sequenciais
    orderedIds.forEach((id, idx) => {
      const item = _items.find(i => i.id === id);
      if (item) {
        const newIndex = baseIndex + idx;
        item.order_index = newIndex;
        orderMap[id] = newIndex;
      }
    });

    _saveCustomOrder(orderMap);
    _saveCache(_items);

    // Background Supabase sync
    _persistOrderToSupabase(orderMap);
  }

  /**
   * Reordena children dentro de um workspace: recebe lista ordenada de child IDs.
   * @param {string} parentId - ID do workspace pai
   * @param {string[]} orderedIds - IDs dos children na ordem desejada
   */
  function reorderChildren(parentId, orderedIds) {
    const orderMap = _loadCustomOrder() || {};

    // Pegar children atuais do workspace
    const children = _items
      .filter(i => i.type === 'child' && i.parent_id === parentId)
      .sort((a, b) => a.order_index - b.order_index);
    if (children.length === 0) return;

    // Usar o menor order_index dos children como base
    const baseIndex = children[0].order_index;
    const step = 0.01; // step entre children

    orderedIds.forEach((id, idx) => {
      const item = _items.find(i => i.id === id);
      if (item) {
        const newIndex = baseIndex + (idx * step);
        item.order_index = newIndex;
        orderMap[id] = newIndex;
      }
    });

    _saveCustomOrder(orderMap);
    _saveCache(_items);

    // Background Supabase sync
    _persistOrderToSupabase(orderMap);
  }

  /**
   * Move um child para outro workspace e reordena os children do destino.
   * @param {string} childId - ID do child sendo movido
   * @param {string} newParentId - ID do workspace destino
   * @param {string[]} orderedIds - IDs dos children na nova ordem (no destino)
   */
  function moveChild(childId, newParentId, orderedIds) {
    const item = _items.find(i => i.id === childId);
    if (!item) return;

    // 1. Atualizar parent_id em memória
    item.parent_id = newParentId;

    // 2. Reordenar children no destino (também persiste order no localStorage)
    reorderChildren(newParentId, orderedIds);

    // 3. Persistir parent_id override no localStorage (otimista)
    _saveParentOverride(childId, newParentId);

    // 4. Atualizar cache
    _saveCache(_items);

    // 5. Background Supabase: atualizar parent_id
    _persistMoveToSupabase(childId, newParentId);
  }

  // ── Supabase Background Persistence ──────────────────────────────────

  /**
   * Persiste mudanças de order_index no Supabase em background.
   * @param {Object} orderMap - { itemId: newOrderIndex, ... }
   */
  async function _persistOrderToSupabase(orderMap) {
    const client = _getClient();
    if (!client || !_tenantId) return;

    try {
      const updates = Object.entries(orderMap).map(([id, orderIndex]) =>
        client
          .from('sidebar_items')
          .update({ order_index: orderIndex })
          .eq('id', id)
          .eq('tenant_id', _tenantId)
      );
      await Promise.allSettled(updates);
    } catch (e) {
      console.warn('[TBO Sidebar] Falha ao persistir order no Supabase:', e.message);
    }
  }

  /**
   * Persiste um move cross-workspace no Supabase em background.
   */
  async function _persistMoveToSupabase(childId, newParentId) {
    const client = _getClient();
    if (!client || !_tenantId) return;

    try {
      await client
        .from('sidebar_items')
        .update({ parent_id: newParentId })
        .eq('id', childId)
        .eq('tenant_id', _tenantId);
    } catch (e) {
      console.warn('[TBO Sidebar] Falha ao persistir move no Supabase:', e.message);
    }
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
    refreshRole,
    getBadge,
    reorderWorkspaces,
    reorderChildren,
    moveChild,
    get loading() { return _loading; },
    get initialized() { return _initialized; },
    get userRole() { return _userRole; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_SIDEBAR_SERVICE = TBO_SIDEBAR_SERVICE;
}
