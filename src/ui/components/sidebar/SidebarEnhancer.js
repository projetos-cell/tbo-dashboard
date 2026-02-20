/**
 * TBO OS — Sidebar Enhancer
 *
 * Melhora a sidebar existente com:
 * - Contadores de notificação (badges)
 * - Estado ativo persistente
 * - Tooltips no modo recolhido
 * - Favoritos com persistência local
 * - Atalho de teclado para toggle (Alt+B)
 */

const TBO_SIDEBAR_ENHANCER = (() => {
  let _initialized = false;
  const _badges = {};
  let _favorites = [];

  const STORAGE_KEY = 'tbo_sidebar_favorites';
  const COLLAPSED_KEY = 'tbo_sidebar_collapsed';

  function _escHtml(str) {
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.escapeHtml) {
      return TBO_FORMATTER.escapeHtml(str);
    }
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /**
   * Carrega favoritos do localStorage
   */
  function _loadFavorites() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      _favorites = raw ? JSON.parse(raw) : [];
    } catch {
      _favorites = [];
    }
  }

  /**
   * Salva favoritos no localStorage
   */
  function _saveFavorites() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_favorites));
    } catch { /* quota exceeded */ }
  }

  /**
   * Restaura estado collapsed da sidebar
   */
  function _restoreCollapsedState() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    try {
      const isCollapsed = localStorage.getItem(COLLAPSED_KEY) === 'true';
      if (isCollapsed) {
        sidebar.classList.add('collapsed');
      }
    } catch { /* ignore */ }
  }

  /**
   * Persiste estado collapsed
   */
  function _onToggle() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    try {
      localStorage.setItem(COLLAPSED_KEY, sidebar.classList.contains('collapsed'));
    } catch { /* ignore */ }
  }

  /**
   * Renderiza badges de contagem nos itens da sidebar
   */
  function _renderBadges() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;

    // Remove badges antigos
    nav.querySelectorAll('.sidebar-badge').forEach(b => b.remove());

    for (const [moduleKey, count] of Object.entries(_badges)) {
      if (count <= 0) continue;
      const link = nav.querySelector(`a[href="#${moduleKey}"], a[data-module="${moduleKey}"]`);
      if (!link) continue;

      const badge = document.createElement('span');
      badge.className = 'sidebar-badge';
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.setAttribute('aria-label', `${count} itens pendentes`);
      link.style.position = 'relative';
      link.appendChild(badge);
    }
  }

  /**
   * Renderiza seção de favoritos
   */
  function _renderFavorites() {
    const list = document.getElementById('sidebarFavoritesList');
    const container = document.getElementById('sidebarFavorites');
    if (!list || !container) return;

    if (_favorites.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = '';
    container.dataset.count = _favorites.length;

    list.innerHTML = _favorites.map(fav =>
      `<li class="sidebar-fav-item">
        <a href="#${_escHtml(fav.route)}" class="sidebar-fav-link" title="${_escHtml(fav.label)}">
          <i data-lucide="${_escHtml(fav.icon || 'star')}" class="sidebar-fav-icon"></i>
          <span class="sidebar-fav-label">${_escHtml(fav.label)}</span>
        </a>
        <button class="sidebar-fav-remove" data-route="${_escHtml(fav.route)}" title="Remover favorito" aria-label="Remover ${_escHtml(fav.label)} dos favoritos">&times;</button>
      </li>`
    ).join('');

    // Botão remover
    list.querySelectorAll('.sidebar-fav-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const route = btn.dataset.route;
        _favorites = _favorites.filter(f => f.route !== route);
        _saveFavorites();
        _renderFavorites();
      });
    });

    if (window.lucide) lucide.createIcons({ root: list });
  }

  /**
   * Marca item ativo na sidebar baseado no hash
   */
  function _highlightActive() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;

    const hash = window.location.hash.replace('#', '').split('/')[0] || 'dashboard';
    nav.querySelectorAll('.sidebar-nav-link').forEach(link => {
      const href = (link.getAttribute('href') || '').replace('#', '');
      link.classList.toggle('active', href === hash);
    });
  }

  /**
   * Inicializa o enhancer
   */
  function init() {
    if (_initialized) return;
    _initialized = true;

    _loadFavorites();
    _restoreCollapsedState();
    _renderFavorites();
    _highlightActive();

    // Observar toggle da sidebar
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        setTimeout(_onToggle, 50);
      });
    }

    // Highlight ao mudar rota
    window.addEventListener('hashchange', _highlightActive);

    // Atalho Alt+B para toggle
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'b') {
        e.preventDefault();
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
          sidebar.classList.toggle('collapsed');
          _onToggle();
        }
      }
    });

    // Registrar comando no Command Palette
    if (typeof TBO_COMMAND_REGISTRY !== 'undefined') {
      TBO_COMMAND_REGISTRY.register({
        id: 'action:activity-feed',
        label: 'Abrir atividade recente',
        icon: 'activity',
        category: 'Ações',
        keywords: ['atividade', 'feed', 'recente', 'audit', 'log'],
        action() {
          if (typeof TBO_ACTIVITY_FEED !== 'undefined') {
            TBO_ACTIVITY_FEED.toggle();
          }
        }
      });
    }

    console.log('[SidebarEnhancer] Inicializado');
  }

  return {
    init,

    /**
     * Define badge de contagem para um módulo
     * @param {string} moduleKey - Ex: 'alerts', 'tarefas'
     * @param {number} count
     */
    setBadge(moduleKey, count) {
      _badges[moduleKey] = count;
      _renderBadges();
    },

    /**
     * Define múltiplos badges de uma vez
     * @param {object} badgeMap - { alerts: 3, tarefas: 12 }
     */
    setBadges(badgeMap) {
      Object.assign(_badges, badgeMap);
      _renderBadges();
    },

    /**
     * Adiciona rota aos favoritos
     * @param {string} route - Hash da rota
     * @param {string} label - Nome exibido
     * @param {string} icon - Lucide icon name
     */
    addFavorite(route, label, icon) {
      if (_favorites.some(f => f.route === route)) return;
      _favorites.push({ route, label, icon: icon || 'star' });
      _saveFavorites();
      _renderFavorites();
    },

    /**
     * Remove rota dos favoritos
     * @param {string} route
     */
    removeFavorite(route) {
      _favorites = _favorites.filter(f => f.route !== route);
      _saveFavorites();
      _renderFavorites();
    },

    /**
     * Retorna lista de favoritos
     */
    getFavorites() {
      return [..._favorites];
    },

    /**
     * Força re-render dos badges
     */
    refreshBadges() {
      _renderBadges();
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_SIDEBAR_ENHANCER = TBO_SIDEBAR_ENHANCER;
}
