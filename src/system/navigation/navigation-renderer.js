/**
 * TBO OS — Notion-style Sidebar Renderer
 *
 * Renderiza a árvore de navegação (TBO_NAV_TREE) no formato
 * Espaço → Páginas colapsáveis, estilo Notion.
 *
 * Integra com:
 * - TBO_ROUTE_REGISTRY (validação de rotas)
 * - TBO_RBAC (filtro de permissões)
 * - TBO_ROUTER (navegação)
 * - TBO_ACTIVITY_FEED (ação de abrir feed)
 * - TBO_SIDEBAR_ENHANCER (badges)
 * - localStorage (persistência de estado)
 */

const TBO_NOTION_SIDEBAR = (() => {
  'use strict';

  const STORAGE_KEY = 'tbo_navigation_state';
  let _container = null;
  let _state = {};   // { spaceId: boolean (expanded) }
  let _activeRoute = null;
  let _initialized = false;

  // ── Helpers ──

  function _escHtml(str) {
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.escapeHtml) {
      return TBO_FORMATTER.escapeHtml(str);
    }
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /**
   * Carrega estado de espaços expandidos/colapsados do localStorage
   */
  function _loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      _state = raw ? JSON.parse(raw) : {};
    } catch {
      _state = {};
    }
  }

  /**
   * Salva estado no localStorage
   */
  function _saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    } catch { /* quota exceeded */ }
  }

  /**
   * Verifica se o usuário tem acesso a uma rota
   * @param {string} route
   * @returns {boolean}
   */
  function _canAccess(route) {
    if (!route) return true; // itens sem rota (ex: action items) são sempre visíveis

    // Verificar via RBAC engine
    if (typeof TBO_RBAC !== 'undefined') {
      return TBO_RBAC.canAccess(null, route);
    }

    // Fallback: verificar via TBO_AUTH
    if (typeof TBO_AUTH !== 'undefined' && TBO_AUTH.canAccess) {
      return TBO_AUTH.canAccess(route);
    }

    // Sem RBAC disponível = mostrar tudo
    return true;
  }

  /**
   * Verifica se a rota existe no router
   * @param {string} route
   * @returns {boolean}
   */
  function _routeExists(route) {
    if (!route) return true; // action items

    if (typeof TBO_ROUTE_REGISTRY !== 'undefined') {
      return TBO_ROUTE_REGISTRY.resolve(route) !== null;
    }

    // Fallback: verificar no TBO_ROUTER
    if (typeof TBO_ROUTER !== 'undefined') {
      const resolved = TBO_ROUTER._resolveAlias ? TBO_ROUTER._resolveAlias(route) : route;
      return !!(TBO_ROUTER._modules && TBO_ROUTER._modules[resolved]);
    }

    return true;
  }

  /**
   * Navega para uma rota
   * @param {string} route
   */
  function _navigate(route) {
    window.location.hash = route;
  }

  /**
   * Executa ação especial (ex: abrir activity feed)
   * @param {string} actionId
   */
  function _executeAction(actionId) {
    if (actionId === 'activity-feed' && typeof TBO_ACTIVITY_FEED !== 'undefined') {
      TBO_ACTIVITY_FEED.toggle();
    }
  }

  /**
   * Retorna rota ativa atual do hash
   * @returns {string}
   */
  function _getCurrentRoute() {
    return (window.location.hash || '#dashboard').replace('#', '').split('/')[0];
  }

  /**
   * Obtém badge count para uma chave
   * @param {string} badgeKey
   * @returns {number}
   */
  function _getBadge(badgeKey) {
    if (!badgeKey) return 0;
    if (typeof TBO_SIDEBAR_ENHANCER !== 'undefined') {
      // Acessar badges internos (sem método público direto, então checamos DOM)
      return 0; // badges são renderizados pelo enhancer separadamente
    }
    return 0;
  }

  // ── Renderização ──

  /**
   * Renderiza um item de página
   * @param {object} page - Item da árvore
   * @param {string} currentRoute - Rota ativa
   * @returns {string} HTML
   */
  function _renderPage(page, currentRoute) {
    const isActive = page.route && page.route === currentRoute;
    const isAction = !page.route && page.action;

    let classes = 'nsb-page';
    if (isActive) classes += ' nsb-page--active';
    if (isAction) classes += ' nsb-page--action';

    const attrs = page.route
      ? `data-route="${_escHtml(page.route)}"`
      : `data-action="${_escHtml(page.action || '')}"`;

    return `<button class="${classes}" ${attrs} title="${_escHtml(page.label)}" role="treeitem">
      <i data-lucide="${_escHtml(page.icon)}" class="nsb-page-icon"></i>
      <span class="nsb-page-label">${_escHtml(page.label)}</span>
    </button>`;
  }

  /**
   * Renderiza um espaço (seção colapsável) e seus filhos
   * @param {object} space
   * @param {string} currentRoute
   * @returns {string} HTML
   */
  function _renderSpace(space, currentRoute) {
    // Filtrar páginas por permissão + existência de rota
    const visiblePages = space.children.filter(page => {
      if (page.route && !_canAccess(page.route)) return false;
      if (page.route && !_routeExists(page.route)) return false;
      return true;
    });

    if (visiblePages.length === 0) return '';

    // Estado expandido/colapsado
    const isExpanded = _state[space.id] !== false; // default: expandido

    // Verificar se alguma página ativa está neste espaço
    const hasActiveChild = visiblePages.some(p => p.route === currentRoute);

    const pagesHtml = visiblePages.map(p => _renderPage(p, currentRoute)).join('');

    return `<div class="nsb-space${hasActiveChild ? ' nsb-space--has-active' : ''}" data-space="${_escHtml(space.id)}">
      <button class="nsb-space-header${isExpanded ? '' : ' nsb-space-header--collapsed'}" data-toggle-space="${_escHtml(space.id)}" aria-expanded="${isExpanded}" role="treeitem">
        <i data-lucide="chevron-right" class="nsb-space-chevron"></i>
        <i data-lucide="${_escHtml(space.icon)}" class="nsb-space-icon"></i>
        <span class="nsb-space-label">${_escHtml(space.label)}</span>
      </button>
      <div class="nsb-space-pages${isExpanded ? ' nsb-space-pages--open' : ''}" role="group">
        ${pagesHtml}
      </div>
    </div>`;
  }

  /**
   * Renderiza sidebar completa
   */
  function _render() {
    if (!_container) return;
    if (typeof TBO_NAV_TREE === 'undefined') {
      console.warn('[NotionSidebar] TBO_NAV_TREE não disponível');
      return;
    }

    const tree = TBO_NAV_TREE.getTree();
    const currentRoute = _getCurrentRoute();
    _activeRoute = currentRoute;

    const spacesHtml = tree.map(space => _renderSpace(space, currentRoute)).join('');

    _container.innerHTML = spacesHtml;

    if (window.lucide) lucide.createIcons({ root: _container });
  }

  // ── Eventos ──

  /**
   * Bind de eventos na sidebar
   */
  function _bindEvents() {
    if (!_container) return;

    // Click em páginas (navigate ou action)
    _container.addEventListener('click', (e) => {
      // Toggle de espaço
      const toggleBtn = e.target.closest('[data-toggle-space]');
      if (toggleBtn) {
        const spaceId = toggleBtn.dataset.toggleSpace;
        const isExpanded = _state[spaceId] !== false;
        _state[spaceId] = !isExpanded;
        _saveState();

        // Animar toggle
        toggleBtn.classList.toggle('nsb-space-header--collapsed', isExpanded);
        toggleBtn.setAttribute('aria-expanded', !isExpanded);

        const pages = toggleBtn.nextElementSibling;
        if (pages) {
          pages.classList.toggle('nsb-space-pages--open', !isExpanded);
        }
        return;
      }

      // Click em página
      const pageBtn = e.target.closest('.nsb-page');
      if (!pageBtn) return;

      const route = pageBtn.dataset.route;
      const action = pageBtn.dataset.action;

      if (route) {
        _navigate(route);
      } else if (action) {
        _executeAction(action);
      }
    });

    // Hashchange: atualizar highlight
    window.addEventListener('hashchange', () => {
      _updateActiveState();
    });
  }

  /**
   * Atualiza highlight da página ativa sem re-render completo
   */
  function _updateActiveState() {
    if (!_container) return;
    const currentRoute = _getCurrentRoute();
    if (currentRoute === _activeRoute) return;
    _activeRoute = currentRoute;

    // Remover active de todos
    _container.querySelectorAll('.nsb-page--active').forEach(el => {
      el.classList.remove('nsb-page--active');
    });

    // Remover has-active de espaços
    _container.querySelectorAll('.nsb-space--has-active').forEach(el => {
      el.classList.remove('nsb-space--has-active');
    });

    // Adicionar active na página certa
    const activeBtn = _container.querySelector(`.nsb-page[data-route="${currentRoute}"]`);
    if (activeBtn) {
      activeBtn.classList.add('nsb-page--active');

      // Marcar espaço como tendo filho ativo
      const space = activeBtn.closest('.nsb-space');
      if (space) {
        space.classList.add('nsb-space--has-active');

        // Auto-expandir espaço se colapsado e contém item ativo
        const spaceId = space.dataset.space;
        if (_state[spaceId] === false) {
          _state[spaceId] = true;
          _saveState();
          const header = space.querySelector('.nsb-space-header');
          const pages = space.querySelector('.nsb-space-pages');
          if (header) {
            header.classList.remove('nsb-space-header--collapsed');
            header.setAttribute('aria-expanded', 'true');
          }
          if (pages) pages.classList.add('nsb-space-pages--open');
        }
      }
    }
  }

  // ── API Pública ──

  return {
    /**
     * Inicializa a Notion sidebar
     * @param {HTMLElement|string} container - Elemento ou seletor para renderizar
     */
    init(container) {
      if (_initialized) return;

      _container = typeof container === 'string'
        ? document.querySelector(container)
        : container;

      if (!_container) {
        console.warn('[NotionSidebar] Container não encontrado');
        return;
      }

      _loadState();
      _render();
      _bindEvents();
      _initialized = true;

      console.log('[NotionSidebar] Inicializado');
    },

    /**
     * Re-renderiza a sidebar (ex: após mudança de permissões)
     */
    refresh() {
      _render();
    },

    /**
     * Expande/colapsa um espaço
     * @param {string} spaceId
     * @param {boolean} expanded
     */
    setExpanded(spaceId, expanded) {
      _state[spaceId] = expanded;
      _saveState();
      _render();
    },

    /**
     * Expande todos os espaços
     */
    expandAll() {
      if (typeof TBO_NAV_TREE !== 'undefined') {
        TBO_NAV_TREE.getSpaceIds().forEach(id => { _state[id] = true; });
        _saveState();
        _render();
      }
    },

    /**
     * Colapsa todos os espaços
     */
    collapseAll() {
      if (typeof TBO_NAV_TREE !== 'undefined') {
        TBO_NAV_TREE.getSpaceIds().forEach(id => { _state[id] = false; });
        _saveState();
        _render();
      }
    },

    /**
     * Retorna o estado de inicialização
     */
    get isInitialized() { return _initialized; },

    /**
     * Destrói a sidebar (para switch de estilo)
     */
    destroy() {
      if (_container) {
        _container.innerHTML = '';
      }
      _initialized = false;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_NOTION_SIDEBAR = TBO_NOTION_SIDEBAR;
}
