// ============================================================================
// TBO OS -- Navigation Enhancements Module
// Breadcrumbs, FAB Quick Actions, Mobile Tab Bar, Deep Links, Recentes &
// Favoritos, Sidebar Smart Collapse, Onboarding Tour, Natural Language Filter
// Singleton: window.TBO_NAVIGATION
// ============================================================================

const TBO_NAVIGATION = {

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL STATE
  // ═══════════════════════════════════════════════════════════════════════════
  _initialized: false,
  _stylesInjected: false,
  _currentPath: [],
  _fabOpen: false,
  _sidebarCollapsed: false,
  _mobileQuery: null,
  _tourActive: false,

  // Storage keys
  _keys: {
    recents:          'tbo_nav_recents',
    favorites:        'tbo_nav_favorites',
    sidebarCollapsed: 'tbo_nav_sidebar_collapsed',
    tourDone:         'tbo_nav_tour_done',
    filterHistory:    'tbo_nav_filter_history'
  },

  // Module display names (mirrors TBO_APP._moduleLabels)
  _moduleNames: {
    'dashboard': 'Dashboard',
    'projetos': 'Projetos',
    'clientes': 'Clientes',
    'financeiro': 'Financeiro',
    'comercial': 'Propostas',
    'reunioes': 'Reunioes',
    'rh': 'Equipe',
    'configuracoes': 'Configuracoes',
    'conteudo': 'Conteudo',
    'mercado': 'Mercado',
    'pipeline': 'Pipeline',
    'contratos': 'Contratos',
    'tarefas': 'Tarefas',
    'entregas': 'Entregas',
    'revisoes': 'Revisoes',
    'decisoes': 'Decisoes',
    // timesheets, carga-trabalho removidos em v2.2
    'pagar': 'Contas a Pagar',
    'receber': 'Contas a Receber',
    'margens': 'Margens',
    'conciliacao': 'Conciliacao',
    'inteligencia': 'Inteligencia BI',
    'cultura': 'Manual de Cultura',
    'templates': 'Templates',
    // capacidade removido em v2.2
    'changelog': 'Changelog',
    'integracoes': 'Integracoes',
    'trilha-aprendizagem': 'Trilha de Aprendizagem',
    'pessoas-avancado': 'Pessoas Avancado',
    'portal-cliente': 'Portal do Cliente',
    'permissoes-config': 'Permissoes',
    'alerts': 'Alertas',
    'timeline': 'Timeline',
    'chat': 'Chat'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INIT -- Master initializer
  // ═══════════════════════════════════════════════════════════════════════════
  init() {
    if (this._initialized) return;
    this._initialized = true;

    console.log('[TBO Navigation] Initializing navigation enhancements...');

    this._injectStyles();
    this._initBreadcrumbs();
    this.initFAB();
    this.initMobileTabBar();
    this.initDeepLinks();
    this.initRecentsAndFavorites();
    this.initSidebarCollapse();
    this.initNaturalFilter();

    // Show onboarding for first-time users (delayed, somente se autenticado)
    if (!localStorage.getItem(this._keys.tourDone)) {
      setTimeout(() => {
        const isLoggedIn = typeof TBO_AUTH !== 'undefined' && TBO_AUTH.checkSession && TBO_AUTH.checkSession();
        if (isLoggedIn) this.startOnboardingTour();
      }, 2000);
    }

    console.log('[TBO Navigation] Ready.');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. BREADCRUMBS SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  _initBreadcrumbs() {
    // Create breadcrumb bar container
    this._ensureBreadcrumbBar();

    // Listen for route changes
    if (typeof TBO_ROUTER !== 'undefined') {
      TBO_ROUTER.onChange((moduleName) => {
        const label = this._moduleNames[moduleName] || moduleName;
        this.updateBreadcrumbs(label);
      });
    }

    // Listen for custom breadcrumb events from modules
    document.addEventListener('tbo:breadcrumb-update', (e) => {
      if (e.detail && e.detail.path) {
        this.updateBreadcrumbs(e.detail.path);
      }
    });
  },

  _ensureBreadcrumbBar() {
    // Breadcrumbs are now integrated into the header via #headerBreadcrumb
    // Remove legacy standalone breadcrumb bar if it exists
    const legacyBar = document.querySelector('.tbo-breadcrumb-bar');
    if (legacyBar) legacyBar.remove();
  },

  updateBreadcrumbs(path) {
    this._ensureBreadcrumbBar();

    // Use header-integrated breadcrumb
    const headerBreadcrumb = document.getElementById('headerBreadcrumb');
    const headerTitle = document.getElementById('headerTitle');
    if (!headerBreadcrumb) return;

    // Accept string or array
    let segments;
    if (typeof path === 'string') {
      segments = path.split('>').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(path)) {
      segments = path;
    } else {
      segments = ['Dashboard'];
    }

    // Always start with "TBO OS" root
    if (segments[0] !== 'TBO OS') {
      segments.unshift('TBO OS');
    }

    this._currentPath = segments;

    // The last segment becomes the header title
    const currentPage = segments[segments.length - 1];
    if (headerTitle) {
      headerTitle.textContent = currentPage;
    }

    // Build breadcrumb trail (without the last segment, which is the title)
    const trail = segments.slice(0, -1);
    let html = '';
    trail.forEach((segment, i) => {
      if (i > 0) {
        html += '<span class="separator" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5;vertical-align:middle;"><polyline points="9 18 15 12 9 6"></polyline></svg></span>';
      }

      if (i === 0) {
        // Root "TBO OS" — not clickable
        html += `<span class="breadcrumb-root" style="color:var(--text-muted);font-weight:500;">${segment}</span>`;
      } else {
        const moduleKey = this._resolveModuleKey(segment);
        html += `<a href="#" class="breadcrumb-link" data-nav-module="${moduleKey || ''}" style="color:var(--text-secondary);text-decoration:none;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-secondary)'">${segment}</a>`;
      }
    });

    // Add final separator before the title
    if (trail.length > 0) {
      html += '<span class="separator" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5;vertical-align:middle;"><polyline points="9 18 15 12 9 6"></polyline></svg></span>';
    }

    headerBreadcrumb.innerHTML = html;

    // Bind click events
    headerBreadcrumb.querySelectorAll('.breadcrumb-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const mod = link.dataset.navModule;
        if (mod && typeof TBO_ROUTER !== 'undefined') {
          TBO_ROUTER.navigate(mod);
        }
      });
    });
  },

  _resolveModuleKey(label) {
    for (const [key, name] of Object.entries(this._moduleNames)) {
      if (name === label) return key;
    }
    return null;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. QUICK ACTIONS FAB — removido em v2.5.1
  // ═══════════════════════════════════════════════════════════════════════════
  initFAB() { /* removido */ },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. MOBILE TAB BAR
  // ═══════════════════════════════════════════════════════════════════════════
  _mobileTabItems: [
    { id: 'dashboard', label: 'Home',       icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
    { id: 'projetos',       label: 'Projetos',   icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h4"/></svg>' },
    { id: 'clientes',       label: 'Clientes',   icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>' },
    { id: 'financeiro',     label: 'Financeiro', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="M16.71 13.88l.7.71-2.82 2.82"/></svg>' },
    { id: 'mais',           label: 'Mais',       icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' }
  ],

  initMobileTabBar() {
    this._mobileQuery = window.matchMedia('(max-width: 768px)');

    // Create tab bar element
    this._createMobileTabBar();

    // Show/hide based on viewport
    this._handleMobileChange(this._mobileQuery);
    this._mobileQuery.addEventListener('change', (e) => this._handleMobileChange(e));

    // Listen for route changes to update active tab
    if (typeof TBO_ROUTER !== 'undefined') {
      TBO_ROUTER.onChange((moduleName) => {
        this._updateMobileTabActive(moduleName);
      });
    }
  },

  _createMobileTabBar() {
    if (document.getElementById('tboMobileTabBar')) return;

    const tabBar = document.createElement('nav');
    tabBar.id = 'tboMobileTabBar';
    tabBar.className = 'tbo-mobile-tab-bar';
    tabBar.setAttribute('role', 'tablist');
    tabBar.setAttribute('aria-label', 'Navegacao principal mobile');

    let html = '';
    this._mobileTabItems.forEach(item => {
      html += `
        <button class="tbo-mobile-tab" data-tab-module="${item.id}" role="tab" aria-label="${item.label}">
          <span class="tbo-mobile-tab-icon">${item.icon}</span>
          <span class="tbo-mobile-tab-label">${item.label}</span>
        </button>`;
    });

    tabBar.innerHTML = html;
    document.body.appendChild(tabBar);

    // Bind tab clicks
    tabBar.querySelectorAll('.tbo-mobile-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const mod = tab.dataset.tabModule;
        if (mod === 'mais') {
          this._openMobileSidebarOverlay();
        } else if (typeof TBO_ROUTER !== 'undefined') {
          TBO_ROUTER.navigate(mod);
        }
        this._updateMobileTabActive(mod);
      });
    });
  },

  _handleMobileChange(query) {
    const matches = query.matches !== undefined ? query.matches : query;
    const tabBar = document.getElementById('tboMobileTabBar');
    const fab = document.getElementById('tboFAB');

    if (tabBar) {
      tabBar.style.display = matches ? 'flex' : 'none';
    }

    // FAB removido em v2.5.1

    // Auto-collapse sidebar on mobile
    if (matches) {
      this._collapseSidebar(true);
    }
  },

  _updateMobileTabActive(moduleName) {
    const tabBar = document.getElementById('tboMobileTabBar');
    if (!tabBar) return;

    tabBar.querySelectorAll('.tbo-mobile-tab').forEach(tab => {
      const isActive = tab.dataset.tabModule === moduleName;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  },

  _openMobileSidebarOverlay() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.classList.add('mobile-open');

    // Create backdrop
    let backdrop = document.getElementById('tboMobileSidebarBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'tboMobileSidebarBackdrop';
      backdrop.className = 'tbo-mobile-sidebar-backdrop';
      document.body.appendChild(backdrop);
    }
    backdrop.style.display = 'block';
    requestAnimationFrame(() => backdrop.classList.add('visible'));

    backdrop.addEventListener('click', () => {
      this._closeMobileSidebarOverlay();
    }, { once: true });
  },

  _closeMobileSidebarOverlay() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('tboMobileSidebarBackdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) {
      backdrop.classList.remove('visible');
      setTimeout(() => { backdrop.style.display = 'none'; }, 300);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. DEEP LINKS / URL ROUTING
  // ═══════════════════════════════════════════════════════════════════════════
  initDeepLinks() {
    // Parse the current hash on load
    this._parseAndNavigateHash();

    // Listen for popstate (back/forward)
    window.addEventListener('popstate', () => {
      this._parseAndNavigateHash();
    });

    // Listen for route changes to update hash
    if (typeof TBO_ROUTER !== 'undefined') {
      TBO_ROUTER.onChange((moduleName) => {
        // Rotas parametrizadas (ex: #page/{uuid}, #projeto/{id}) já definem
        // o hash corretamente em _navigateParam — não sobrescrever aqui
        if (TBO_ROUTER.getCurrentRoute()) return;

        const current = this._parseHash();
        if (current.module !== moduleName) {
          const newHash = '#/' + moduleName;
          if (window.location.hash !== newHash) {
            history.pushState({ module: moduleName }, '', newHash);
          }
        }
      });
    }
  },

  _parseHash() {
    const raw = window.location.hash.replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean);
    return {
      module:  parts[0] || null,
      subview: parts[1] || null,
      id:      parts[2] || null
    };
  },

  _parseAndNavigateHash() {
    const route = this._parseHash();
    if (!route.module) return;

    if (typeof TBO_ROUTER !== 'undefined') {
      // Build navigation string compatible with TBO_ROUTER
      let navPath = route.module;
      if (route.subview) {
        navPath += '/' + route.subview;
        if (route.id) {
          navPath += '/' + route.id;
        }
      }

      // Dispatch deep link event with full route info
      document.dispatchEvent(new CustomEvent('tbo:deep-link', {
        detail: { module: route.module, subview: route.subview, id: route.id }
      }));

      TBO_ROUTER.navigate(navPath);
    }
  },

  navigateTo(module, subview, id) {
    let hash = '#/' + module;
    if (subview) {
      hash += '/' + subview;
      if (id) {
        hash += '/' + id;
      }
    }

    history.pushState({ module, subview, id }, '', hash);

    // Dispatch deep link event
    document.dispatchEvent(new CustomEvent('tbo:deep-link', {
      detail: { module, subview, id }
    }));

    if (typeof TBO_ROUTER !== 'undefined') {
      let navPath = module;
      if (subview) navPath += '/' + subview;
      TBO_ROUTER.navigate(navPath);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. RECENTES & FAVORITOS
  // ═══════════════════════════════════════════════════════════════════════════
  initRecentsAndFavorites() {
    // Track module visits
    if (typeof TBO_ROUTER !== 'undefined') {
      TBO_ROUTER.onChange((moduleName) => {
        const label = this._moduleNames[moduleName] || moduleName;
        this.addRecent({
          type: 'module',
          id: moduleName,
          label: label,
          path: '#/' + moduleName
        });
      });
    }

    // Create the header dropdown trigger
    this._createRecentsDropdown();
  },

  _createRecentsDropdown() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight || document.getElementById('tboRecentsFavBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'tboRecentsFavBtn';
    btn.className = 'header-action-btn';
    btn.title = 'Recentes e Favoritos';
    btn.setAttribute('aria-label', 'Abrir recentes e favoritos');
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';

    // Insert before user menu
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
      headerRight.insertBefore(btn, userMenu);
    } else {
      headerRight.appendChild(btn);
    }

    // Dropdown panel
    const panel = document.createElement('div');
    panel.id = 'tboRecentsFavPanel';
    panel.className = 'tbo-recents-panel';
    panel.style.display = 'none';
    document.body.appendChild(panel);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = panel.style.display !== 'none';
      if (isVisible) {
        panel.style.display = 'none';
      } else {
        this._renderRecentsFavPanel(panel, btn);
        panel.style.display = 'block';
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== btn) {
        panel.style.display = 'none';
      }
    });
  },

  _renderRecentsFavPanel(panel, triggerBtn) {
    const recents = this.getRecents();
    const favorites = this.getFavorites();
    const rect = triggerBtn.getBoundingClientRect();

    panel.style.top = (rect.bottom + 8) + 'px';
    panel.style.right = (window.innerWidth - rect.right) + 'px';

    let html = '<div class="tbo-recents-panel-inner">';

    // Favorites section
    html += '<div class="tbo-recents-section">';
    html += '<div class="tbo-recents-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Favoritos</div>';
    if (favorites.length === 0) {
      html += '<div class="tbo-recents-empty">Nenhum favorito ainda</div>';
    } else {
      favorites.forEach(fav => {
        html += `<div class="tbo-recents-item" data-nav-path="${fav.path || '#/' + fav.id}">
          <span class="tbo-recents-item-star active" data-fav-id="${fav.id}" title="Remover dos favoritos">&#x2605;</span>
          <span class="tbo-recents-item-label">${fav.label}</span>
        </div>`;
      });
    }
    html += '</div>';

    // Recents section
    html += '<div class="tbo-recents-section">';
    html += '<div class="tbo-recents-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Recentes</div>';
    if (recents.length === 0) {
      html += '<div class="tbo-recents-empty">Nenhum item recente</div>';
    } else {
      recents.forEach(item => {
        const timeAgo = this._timeAgo(item.timestamp);
        const isFav = this._isFavorite(item.id);
        html += `<div class="tbo-recents-item" data-nav-path="${item.path || '#/' + item.id}">
          <span class="tbo-recents-item-star ${isFav ? 'active' : ''}" data-fav-id="${item.id}" data-fav-label="${item.label}" data-fav-path="${item.path || '#/' + item.id}" title="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">&#x2605;</span>
          <span class="tbo-recents-item-label">${item.label}</span>
          <span class="tbo-recents-item-time">${timeAgo}</span>
        </div>`;
      });
    }
    html += '</div>';

    html += '</div>';
    panel.innerHTML = html;

    // Bind navigation
    panel.querySelectorAll('.tbo-recents-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('tbo-recents-item-star')) return;
        const path = item.dataset.navPath;
        if (path && typeof TBO_ROUTER !== 'undefined') {
          const mod = path.replace('#/', '').split('/')[0];
          TBO_ROUTER.navigate(mod);
        }
        panel.style.display = 'none';
      });
    });

    // Bind star toggles
    panel.querySelectorAll('.tbo-recents-item-star').forEach(star => {
      star.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = star.dataset.favId;
        const label = star.dataset.favLabel || star.closest('.tbo-recents-item')?.querySelector('.tbo-recents-item-label')?.textContent || '';
        const path = star.dataset.favPath || '#/' + id;
        this.toggleFavorite({ id, label, path });
        // Re-render panel
        this._renderRecentsFavPanel(panel, document.getElementById('tboRecentsFavBtn'));
      });
    });
  },

  _timeAgo(timestamp) {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return 'ha ' + minutes + ' min';
    if (hours < 24) return 'ha ' + hours + 'h';
    if (days === 1) return 'ontem';
    if (days < 7) return 'ha ' + days + ' dias';
    return new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  },

  addRecent(item) {
    if (!item || !item.id) return;
    let recents = this.getRecents();

    // Remove duplicate
    recents = recents.filter(r => r.id !== item.id);

    // Add to front
    recents.unshift({
      type: item.type || 'module',
      id: item.id,
      label: item.label || item.id,
      path: item.path || '#/' + item.id,
      timestamp: Date.now()
    });

    // Limit to 10
    if (recents.length > 10) {
      recents = recents.slice(0, 10);
    }

    localStorage.setItem(this._keys.recents, JSON.stringify(recents));
  },

  getRecents() {
    try {
      return JSON.parse(localStorage.getItem(this._keys.recents) || '[]');
    } catch {
      return [];
    }
  },

  toggleFavorite(item) {
    if (!item || !item.id) return false;
    let favorites = this.getFavorites();
    const idx = favorites.findIndex(f => f.id === item.id);

    if (idx >= 0) {
      favorites.splice(idx, 1);
      localStorage.setItem(this._keys.favorites, JSON.stringify(favorites));
      return false; // removed
    } else {
      favorites.unshift({
        id: item.id,
        label: item.label || item.id,
        path: item.path || '#/' + item.id,
        added: Date.now()
      });
      localStorage.setItem(this._keys.favorites, JSON.stringify(favorites));
      return true; // added
    }
  },

  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(this._keys.favorites) || '[]');
    } catch {
      return [];
    }
  },

  _isFavorite(id) {
    return this.getFavorites().some(f => f.id === id);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. SIDEBAR SMART COLLAPSE
  // ═══════════════════════════════════════════════════════════════════════════
  initSidebarCollapse() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Restore saved preference
    const savedState = localStorage.getItem(this._keys.sidebarCollapsed);
    if (savedState === '1') {
      this._collapseSidebar(false); // false = do not animate
    }

    // Create custom collapse button if not present
    this._ensureCollapseButton(sidebar);

    // Hover-to-expand when collapsed
    sidebar.addEventListener('mouseenter', () => {
      if (sidebar.classList.contains('tbo-sidebar-collapsed')) {
        sidebar.classList.add('tbo-sidebar-peek');
      }
    });

    sidebar.addEventListener('mouseleave', () => {
      sidebar.classList.remove('tbo-sidebar-peek');
    });

    // Auto-collapse on mobile
    if (this._mobileQuery && this._mobileQuery.matches) {
      this._collapseSidebar(false);
    }
  },

  _ensureCollapseButton(sidebar) {
    if (document.getElementById('tboSidebarCollapseBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'tboSidebarCollapseBtn';
    btn.className = 'tbo-sidebar-collapse-btn';
    btn.title = 'Recolher / Expandir menu';
    btn.setAttribute('aria-label', 'Recolher ou expandir barra lateral');
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>';

    // Insert at top of sidebar, after brand
    const brand = sidebar.querySelector('.sidebar-brand');
    if (brand && brand.nextSibling) {
      sidebar.insertBefore(btn, brand.nextSibling);
    } else {
      sidebar.appendChild(btn);
    }

    btn.addEventListener('click', () => {
      this._toggleSidebarCollapse();
    });
  },

  _toggleSidebarCollapse() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    if (sidebar.classList.contains('tbo-sidebar-collapsed')) {
      this._expandSidebar();
    } else {
      this._collapseSidebar(true);
    }
  },

  _collapseSidebar(savePreference) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.classList.add('tbo-sidebar-collapsed');
    this._sidebarCollapsed = true;

    // Update button icon direction
    const btn = document.getElementById('tboSidebarCollapseBtn');
    if (btn) {
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>';
    }

    if (savePreference) {
      localStorage.setItem(this._keys.sidebarCollapsed, '1');
    }
  },

  _expandSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.classList.remove('tbo-sidebar-collapsed');
    sidebar.classList.remove('tbo-sidebar-peek');
    this._sidebarCollapsed = false;

    // Update button icon direction
    const btn = document.getElementById('tboSidebarCollapseBtn');
    if (btn) {
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>';
    }

    localStorage.setItem(this._keys.sidebarCollapsed, '0');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. ONBOARDING TOUR
  // ═══════════════════════════════════════════════════════════════════════════
  _defaultTourSteps: [
    {
      target: '#sidebar',
      title: 'Barra Lateral',
      description: 'Aqui voce encontra todos os modulos do TBO OS. Navegue entre projetos, clientes, financeiro e muito mais.',
      position: 'right'
    },
    {
      target: '.nav-item[data-module="dashboard"]',
      title: 'Central de Comando',
      description: 'Sua visao geral com KPIs, alertas e resumo de tudo que esta acontecendo no estudio.',
      position: 'right'
    },
    {
      target: '#userMenu',
      title: 'Seu Perfil',
      description: 'Acesse configuracoes, altere o tema e gerencie sua conta por aqui.',
      position: 'bottom'
    },
    {
      target: '#searchBtn',
      title: 'Busca Rapida',
      description: 'Use Alt+K para buscar modulos, projetos e clientes instantaneamente.',
      position: 'bottom'
    },
    {
      target: '#tboFabMain',
      title: 'Acoes Rapidas',
      description: 'Crie novos projetos, tarefas, contratos e reunioes com um clique.',
      position: 'left'
    }
  ],

  startOnboardingTour(steps) {
    const tourSteps = steps || this._defaultTourSteps;
    if (!tourSteps || tourSteps.length === 0) return;

    // Prevent multiple tours
    if (this._tourActive) return;
    this._tourActive = true;

    let currentStepIndex = 0;

    const cleanup = () => {
      this._tourActive = false;
      document.querySelector('.tbo-tour-overlay')?.remove();
      document.querySelector('.tbo-tour-spotlight')?.remove();
      document.querySelector('.tbo-tour-tooltip')?.remove();
      document.querySelectorAll('.tbo-tour-highlighted').forEach(el => {
        el.classList.remove('tbo-tour-highlighted');
        el.style.removeProperty('z-index');
        el.style.removeProperty('position');
      });
    };

    const showStep = (index) => {
      cleanup();
      this._tourActive = true;

      if (index >= tourSteps.length) {
        // Tour complete
        this._tourActive = false;
        localStorage.setItem(this._keys.tourDone, '1');
        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.success('Tour concluido!', 'Voce ja conhece os recursos principais do TBO OS.');
        }
        return;
      }

      const step = tourSteps[index];
      const targetEl = document.querySelector(step.target);

      if (!targetEl) {
        // Skip missing targets
        showStep(index + 1);
        return;
      }

      const targetRect = targetEl.getBoundingClientRect();

      // Create dark overlay with spotlight cutout
      const overlay = document.createElement('div');
      overlay.className = 'tbo-tour-overlay';
      document.body.appendChild(overlay);

      // Create spotlight highlight
      const spotlight = document.createElement('div');
      spotlight.className = 'tbo-tour-spotlight';
      spotlight.style.top = (targetRect.top - 8) + 'px';
      spotlight.style.left = (targetRect.left - 8) + 'px';
      spotlight.style.width = (targetRect.width + 16) + 'px';
      spotlight.style.height = (targetRect.height + 16) + 'px';
      document.body.appendChild(spotlight);

      // Highlight target element
      targetEl.classList.add('tbo-tour-highlighted');
      targetEl.style.position = targetEl.style.position || 'relative';
      targetEl.style.zIndex = '10002';

      // Create tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'tbo-tour-tooltip';
      tooltip.innerHTML = `
        <div class="tbo-tour-tooltip-title">${step.title}</div>
        <div class="tbo-tour-tooltip-desc">${step.description}</div>
        <div class="tbo-tour-tooltip-footer">
          <span class="tbo-tour-tooltip-counter">${index + 1} de ${tourSteps.length}</span>
          <div class="tbo-tour-tooltip-actions">
            <button class="tbo-tour-btn-skip">Pular</button>
            <button class="tbo-tour-btn-next">${index === tourSteps.length - 1 ? 'Concluir' : 'Proximo'}</button>
          </div>
        </div>
      `;

      // Position tooltip based on step.position
      const padding = 16;
      let tooltipTop, tooltipLeft;

      switch (step.position) {
        case 'right':
          tooltipTop = targetRect.top;
          tooltipLeft = targetRect.right + padding;
          break;
        case 'left':
          tooltipTop = targetRect.top;
          tooltipLeft = targetRect.left - 320 - padding;
          break;
        case 'bottom':
          tooltipTop = targetRect.bottom + padding;
          tooltipLeft = targetRect.left - 50;
          break;
        case 'top':
          tooltipTop = targetRect.top - 180 - padding;
          tooltipLeft = targetRect.left - 50;
          break;
        default:
          tooltipTop = targetRect.bottom + padding;
          tooltipLeft = targetRect.left;
      }

      // Keep tooltip within viewport
      tooltipLeft = Math.max(16, Math.min(tooltipLeft, window.innerWidth - 340));
      tooltipTop = Math.max(16, Math.min(tooltipTop, window.innerHeight - 200));

      tooltip.style.top = tooltipTop + 'px';
      tooltip.style.left = tooltipLeft + 'px';
      document.body.appendChild(tooltip);

      // Animate in
      requestAnimationFrame(() => {
        overlay.classList.add('visible');
        tooltip.classList.add('visible');
      });

      // Bind buttons
      tooltip.querySelector('.tbo-tour-btn-next').addEventListener('click', () => {
        currentStepIndex = index + 1;
        showStep(currentStepIndex);
      });

      tooltip.querySelector('.tbo-tour-btn-skip').addEventListener('click', () => {
        cleanup();
        localStorage.setItem(this._keys.tourDone, '1');
      });

      // Click overlay to skip
      overlay.addEventListener('click', () => {
        cleanup();
        localStorage.setItem(this._keys.tourDone, '1');
      });
    };

    showStep(0);
  },

  resetTour() {
    localStorage.removeItem(this._keys.tourDone);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. NATURAL LANGUAGE FILTER
  // ═══════════════════════════════════════════════════════════════════════════
  _filterPatterns: [
    // "projetos atrasados"
    { regex: /projetos?\s+(atrasad[oa]s?|em\s+atraso)/i, intent: 'filter', entity: 'projeto', filter: { status: 'atrasado' } },
    // "projetos do Nelson" / "projetos da Carol"
    { regex: /projetos?\s+d[oae]\s+(\w+)/i, intent: 'filter', entity: 'projeto', extractField: 'responsavel', extractGroup: 1 },
    // "projetos ativos"
    { regex: /projetos?\s+(ativ[oa]s?|em\s+andamento)/i, intent: 'filter', entity: 'projeto', filter: { status: 'ativo' } },
    // "projetos finalizados" / "projetos concluidos"
    { regex: /projetos?\s+(finalizad[oa]s?|conclu[ií]d[oa]s?)/i, intent: 'filter', entity: 'projeto', filter: { status: 'finalizado' } },
    // "contratos acima de 50k" / "contratos acima de 100000"
    { regex: /contratos?\s+acima\s+de\s+([\d,.]+)\s*(k|mil)?/i, intent: 'filter', entity: 'contrato', extractField: 'valor_min', extractGroup: 1, multiplier: true },
    // "contratos abaixo de 50k"
    { regex: /contratos?\s+abaixo\s+de\s+([\d,.]+)\s*(k|mil)?/i, intent: 'filter', entity: 'contrato', extractField: 'valor_max', extractGroup: 1, multiplier: true },
    // "tarefas da semana"
    { regex: /tarefas?\s+d[oae]\s+semana/i, intent: 'filter', entity: 'tarefa', filter: { periodo: 'semana' } },
    // "tarefas de hoje" / "tarefas para hoje"
    { regex: /tarefas?\s+(de|para)\s+hoje/i, intent: 'filter', entity: 'tarefa', filter: { periodo: 'hoje' } },
    // "tarefas pendentes"
    { regex: /tarefas?\s+(pendente?s?|abertas?)/i, intent: 'filter', entity: 'tarefa', filter: { status: 'pendente' } },
    // "tarefas do Nelson"
    { regex: /tarefas?\s+d[oae]\s+(\w+)/i, intent: 'filter', entity: 'tarefa', extractField: 'responsavel', extractGroup: 1 },
    // "clientes sem projeto ativo" / "clientes sem projetos"
    { regex: /clientes?\s+sem\s+projeto(s?\s+ativ[oa]s?)?/i, intent: 'filter', entity: 'cliente', filter: { sem_projeto_ativo: true } },
    // "clientes de Curitiba"
    { regex: /clientes?\s+de\s+(\w[\w\s]*)/i, intent: 'filter', entity: 'cliente', extractField: 'cidade', extractGroup: 1 },
    // "reunioes desta semana" / "reunioes da semana"
    { regex: /reuni[oõ]es?\s+(desta|da)\s+semana/i, intent: 'filter', entity: 'reuniao', filter: { periodo: 'semana' } },
    // "reunioes de hoje"
    { regex: /reuni[oõ]es?\s+de\s+hoje/i, intent: 'filter', entity: 'reuniao', filter: { periodo: 'hoje' } },
    // "financeiro do mes"
    { regex: /financeir[oa]?\s+(do|deste)\s+m[eê]s/i, intent: 'filter', entity: 'financeiro', filter: { periodo: 'mes' } },
    // "entregas pendentes"
    { regex: /entregas?\s+(pendente?s?|atrasad[oa]s?)/i, intent: 'filter', entity: 'entrega', filter: { status: 'pendente' } },
    // Generic person search: "Nelson", "Carol"
    { regex: /^(\w{3,})$/i, intent: 'search', entity: 'geral', extractField: 'query', extractGroup: 1 }
  ],

  _filterSuggestions: [
    'projetos atrasados',
    'projetos ativos',
    'projetos do Nelson',
    'contratos acima de 50k',
    'tarefas da semana',
    'tarefas pendentes',
    'clientes sem projeto ativo',
    'reunioes desta semana',
    'entregas pendentes',
    'financeiro do mes'
  ],

  initNaturalFilter() {
    // Removed: filter bar disabled per user request
    return;
  },

  _createFilterBar() {
    if (document.getElementById('tboNaturalFilter')) return;

    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'tboNaturalFilter';
    wrapper.className = 'tbo-natural-filter';

    wrapper.innerHTML = `
      <div class="tbo-filter-input-wrap">
        <svg class="tbo-filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          class="tbo-filter-input"
          id="tboFilterInput"
          placeholder="Filtro inteligente: ex. 'projetos atrasados do Nelson'"
          autocomplete="off"
          spellcheck="false"
        />
        <span class="tbo-filter-hint">Linguagem natural</span>
      </div>
      <div class="tbo-filter-suggestions" id="tboFilterSuggestions" style="display: none;"></div>
    `;

    // Insert after breadcrumbs (or at top of main-content)
    const breadcrumbs = mainContent.querySelector('.tbo-breadcrumb-bar');
    if (breadcrumbs && breadcrumbs.nextSibling) {
      mainContent.insertBefore(wrapper, breadcrumbs.nextSibling);
    } else if (breadcrumbs) {
      mainContent.appendChild(wrapper);
    } else {
      mainContent.insertBefore(wrapper, mainContent.firstChild);
    }

    const input = document.getElementById('tboFilterInput');
    const suggestionsEl = document.getElementById('tboFilterSuggestions');
    if (!input || !suggestionsEl) return;

    let debounceTimer = null;

    // Input handler with debounce
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = input.value.trim();
        if (query.length < 2) {
          suggestionsEl.style.display = 'none';
          return;
        }
        this._showFilterSuggestions(query, suggestionsEl, input);
      }, 200);
    });

    // Focus: show suggestions
    input.addEventListener('focus', () => {
      if (input.value.trim().length < 2) {
        this._showDefaultSuggestions(suggestionsEl, input);
      }
    });

    // Enter: parse and dispatch
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = input.value.trim();
        if (query.length >= 2) {
          const parsed = this.parseNaturalFilter(query);
          document.dispatchEvent(new CustomEvent('tbo:natural-filter', { detail: parsed }));
          suggestionsEl.style.display = 'none';

          // Save to filter history
          this._addFilterHistory(query);
        }
      }
      if (e.key === 'Escape') {
        suggestionsEl.style.display = 'none';
        input.blur();
      }
    });

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        suggestionsEl.style.display = 'none';
      }
    });
  },

  _showDefaultSuggestions(suggestionsEl, input) {
    const history = this._getFilterHistory();
    let html = '';

    if (history.length > 0) {
      html += '<div class="tbo-filter-suggest-group"><span class="tbo-filter-suggest-label">Recentes</span>';
      history.slice(0, 4).forEach(q => {
        html += `<div class="tbo-filter-suggest-item" data-query="${q}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${q}
        </div>`;
      });
      html += '</div>';
    }

    html += '<div class="tbo-filter-suggest-group"><span class="tbo-filter-suggest-label">Sugestoes</span>';
    this._filterSuggestions.slice(0, 5).forEach(s => {
      html += `<div class="tbo-filter-suggest-item" data-query="${s}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        ${s}
      </div>`;
    });
    html += '</div>';

    suggestionsEl.innerHTML = html;
    suggestionsEl.style.display = 'block';

    this._bindSuggestionClicks(suggestionsEl, input);
  },

  _showFilterSuggestions(query, suggestionsEl, input) {
    const lowerQuery = query.toLowerCase();
    const matches = this._filterSuggestions.filter(s => s.toLowerCase().includes(lowerQuery));

    if (matches.length === 0) {
      // Try to parse and show preview
      const parsed = this.parseNaturalFilter(query);
      if (parsed.intent !== 'unknown') {
        suggestionsEl.innerHTML = `
          <div class="tbo-filter-suggest-preview">
            <span class="tbo-filter-suggest-label">Filtro detectado</span>
            <div class="tbo-filter-parsed">
              <span class="tbo-filter-tag">${parsed.entity}</span>
              ${Object.entries(parsed.filters).map(([k, v]) => `<span class="tbo-filter-tag-value">${k}: ${v}</span>`).join('')}
            </div>
            <div class="tbo-filter-suggest-hint">Pressione Enter para aplicar</div>
          </div>`;
        suggestionsEl.style.display = 'block';
      } else {
        suggestionsEl.style.display = 'none';
      }
      return;
    }

    let html = '<div class="tbo-filter-suggest-group">';
    matches.forEach(m => {
      // Highlight matching text
      const highlighted = m.replace(new RegExp(`(${this._escapeRegex(query)})`, 'gi'), '<strong>$1</strong>');
      html += `<div class="tbo-filter-suggest-item" data-query="${m}">${highlighted}</div>`;
    });
    html += '</div>';

    suggestionsEl.innerHTML = html;
    suggestionsEl.style.display = 'block';

    this._bindSuggestionClicks(suggestionsEl, input);
  },

  _bindSuggestionClicks(suggestionsEl, input) {
    suggestionsEl.querySelectorAll('.tbo-filter-suggest-item').forEach(item => {
      item.addEventListener('click', () => {
        input.value = item.dataset.query;
        input.dispatchEvent(new Event('input'));
        suggestionsEl.style.display = 'none';

        // Auto-apply
        const parsed = this.parseNaturalFilter(item.dataset.query);
        document.dispatchEvent(new CustomEvent('tbo:natural-filter', { detail: parsed }));
        this._addFilterHistory(item.dataset.query);
      });
    });
  },

  parseNaturalFilter(query) {
    if (!query || typeof query !== 'string') {
      return { intent: 'unknown', entity: null, filters: {}, raw: query };
    }

    const trimmed = query.trim();

    for (const pattern of this._filterPatterns) {
      const match = trimmed.match(pattern.regex);
      if (match) {
        const result = {
          intent: pattern.intent,
          entity: pattern.entity,
          filters: { ...(pattern.filter || {}) },
          raw: trimmed
        };

        // Extract dynamic field
        if (pattern.extractField && pattern.extractGroup !== undefined) {
          let value = match[pattern.extractGroup];
          if (value) {
            value = value.trim();
            // Handle multiplier (k, mil)
            if (pattern.multiplier) {
              const numVal = parseFloat(value.replace(',', '.'));
              const suffix = match[pattern.extractGroup + 1];
              if (suffix && (suffix.toLowerCase() === 'k' || suffix.toLowerCase() === 'mil')) {
                result.filters[pattern.extractField] = numVal * 1000;
              } else {
                result.filters[pattern.extractField] = numVal;
              }
            } else {
              result.filters[pattern.extractField] = value;
            }
          }
        }

        return result;
      }
    }

    // No match found - return generic search
    return {
      intent: 'search',
      entity: 'geral',
      filters: { query: trimmed },
      raw: trimmed
    };
  },

  _addFilterHistory(query) {
    if (!query) return;
    let history = this._getFilterHistory();
    history = history.filter(h => h !== query);
    history.unshift(query);
    if (history.length > 10) history = history.slice(0, 10);
    localStorage.setItem(this._keys.filterHistory, JSON.stringify(history));
  },

  _getFilterHistory() {
    try {
      return JSON.parse(localStorage.getItem(this._keys.filterHistory) || '[]');
    } catch {
      return [];
    }
  },

  _escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CSS STYLES INJECTION
  // ═══════════════════════════════════════════════════════════════════════════
  _injectStyles() {
    if (this._stylesInjected) return;
    this._stylesInjected = true;

    const style = document.createElement('style');
    style.id = 'tbo-navigation-styles';
    style.textContent = `

    /* =====================================================================
       BREADCRUMBS
       ===================================================================== */
    .tbo-breadcrumb-bar {
      display: none;
    }

    .tbo-breadcrumb-list {
      display: flex;
      align-items: center;
      list-style: none;
      gap: 4px;
      margin: 0;
      padding: 0;
      flex-wrap: wrap;
    }

    .tbo-breadcrumb-item {
      display: flex;
      align-items: center;
      color: var(--text-muted, #999);
    }

    .tbo-breadcrumb-root {
      color: var(--text-muted, #999);
      font-weight: 500;
    }

    .tbo-breadcrumb-current {
      color: var(--text-primary, #0f0f0f);
      font-weight: 600;
    }

    .tbo-breadcrumb-link {
      color: var(--text-secondary, #606060);
      text-decoration: none;
      transition: color var(--transition-fast, 150ms ease);
      cursor: pointer;
    }

    .tbo-breadcrumb-link:hover {
      color: var(--accent, #E85102);
      text-decoration: underline;
    }

    .tbo-breadcrumb-sep {
      display: flex;
      align-items: center;
      color: var(--text-muted, #999);
      margin: 0 2px;
    }

    .tbo-breadcrumb-sep svg {
      opacity: 0.5;
    }

    /* FAB removido em v2.5.1 */

    /* =====================================================================
       MOBILE TAB BAR
       ===================================================================== */
    .tbo-mobile-tab-bar {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: var(--bg-card, #fff);
      border-top: 1px solid var(--border-default, #eee);
      z-index: var(--z-header, 300);
      justify-content: space-around;
      align-items: center;
      padding: 0 4px;
      padding-bottom: env(safe-area-inset-bottom, 0px);
    }

    .tbo-mobile-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 6px 8px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted, #999);
      transition: color 0.2s ease;
      flex: 1;
      max-width: 80px;
      border-radius: var(--radius-sm, 6px);
    }

    .tbo-mobile-tab.active {
      color: var(--accent, #E85102);
    }

    .tbo-mobile-tab:hover {
      color: var(--accent, #E85102);
      background: var(--accent-alpha-08, rgba(232,81,2,0.08));
    }

    .tbo-mobile-tab-icon {
      display: flex;
      align-items: center;
    }

    .tbo-mobile-tab-label {
      font-size: 0.65rem;
      font-weight: 500;
      font-family: var(--font-body);
    }

    .tbo-mobile-sidebar-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: calc(var(--z-sidebar, 400) - 1);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .tbo-mobile-sidebar-backdrop.visible {
      opacity: 1;
    }

    /* =====================================================================
       RECENTS & FAVORITES PANEL
       ===================================================================== */
    .tbo-recents-panel {
      position: fixed;
      z-index: var(--z-dropdown, 100);
      width: 320px;
      max-height: 420px;
      overflow-y: auto;
      background: var(--bg-card, #fff);
      border: 1px solid var(--border-default, #eee);
      border-radius: var(--radius-lg, 12px);
      box-shadow: var(--shadow-lg, 0 8px 30px rgba(0,0,0,0.12));
      padding: 0;
    }

    .tbo-recents-panel-inner {
      padding: 8px 0;
    }

    .tbo-recents-section {
      padding: 4px 0;
    }

    .tbo-recents-section + .tbo-recents-section {
      border-top: 1px solid var(--border-default, #eee);
    }

    .tbo-recents-section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px 4px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted, #999);
    }

    .tbo-recents-empty {
      padding: 8px 16px;
      font-size: 0.8rem;
      color: var(--text-muted, #999);
      font-style: italic;
    }

    .tbo-recents-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      cursor: pointer;
      transition: background 0.15s ease;
      font-size: 0.85rem;
    }

    .tbo-recents-item:hover {
      background: var(--accent-alpha-08, rgba(232,81,2,0.08));
    }

    .tbo-recents-item-star {
      cursor: pointer;
      font-size: 1rem;
      color: var(--text-muted, #999);
      transition: color 0.15s ease, transform 0.2s ease;
      flex-shrink: 0;
      line-height: 1;
    }

    .tbo-recents-item-star.active {
      color: #f59e0b;
    }

    .tbo-recents-item-star:hover {
      transform: scale(1.2);
      color: #f59e0b;
    }

    .tbo-recents-item-label {
      flex: 1;
      color: var(--text-primary, #0f0f0f);
      font-weight: 500;
    }

    .tbo-recents-item-time {
      font-size: 0.7rem;
      color: var(--text-muted, #999);
      white-space: nowrap;
    }

    /* =====================================================================
       SIDEBAR SMART COLLAPSE
       ===================================================================== */
    .tbo-sidebar-collapse-btn {
      position: absolute;
      top: 12px;
      right: -12px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--bg-card, #fff);
      border: 1px solid var(--border-default, #eee);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      color: var(--text-muted, #999);
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06));
      transition: color 0.2s ease,
                  background 0.2s ease,
                  transform 0.2s ease;
      opacity: 0;
    }

    #sidebar:hover .tbo-sidebar-collapse-btn,
    #sidebar:focus-within .tbo-sidebar-collapse-btn {
      opacity: 1;
    }

    .tbo-sidebar-collapse-btn:hover {
      background: var(--accent, #E85102);
      color: #fff;
      border-color: var(--accent, #E85102);
      transform: scale(1.1);
    }

    /* Sidebar collapsed state */
    #sidebar.tbo-sidebar-collapsed {
      width: var(--sidebar-collapsed, 64px) !important;
      overflow: hidden;
    }

    #sidebar.tbo-sidebar-collapsed .nav-label,
    #sidebar.tbo-sidebar-collapsed .nav-section-label,
    #sidebar.tbo-sidebar-collapsed .nav-section-chevron,
    #sidebar.tbo-sidebar-collapsed .brand-label,
    #sidebar.tbo-sidebar-collapsed .sidebar-social,
    #sidebar.tbo-sidebar-collapsed .sidebar-user,
    #sidebar.tbo-sidebar-collapsed .sidebar-version,
    #sidebar.tbo-sidebar-collapsed .nav-badge-dev {
      opacity: 0;
      width: 0;
      overflow: hidden;
      white-space: nowrap;
      transition: opacity 0.2s ease, width 0.2s ease;
    }

    #sidebar.tbo-sidebar-collapsed .nav-item {
      justify-content: center;
      padding: 10px;
    }

    #sidebar.tbo-sidebar-collapsed .nav-section-toggle {
      justify-content: center;
      padding: 8px;
    }

    #sidebar.tbo-sidebar-collapsed .sidebar-brand {
      justify-content: center;
      padding: 12px 8px;
    }

    #sidebar.tbo-sidebar-collapsed .brand-logo-svg {
      max-width: 32px;
    }

    /* Peek-on-hover when collapsed */
    #sidebar.tbo-sidebar-collapsed.tbo-sidebar-peek {
      width: var(--sidebar-width, 260px) !important;
      position: fixed;
      z-index: calc(var(--z-sidebar, 400) + 1);
      box-shadow: var(--shadow-xl, 0 12px 48px rgba(0,0,0,0.18));
    }

    #sidebar.tbo-sidebar-collapsed.tbo-sidebar-peek .nav-label,
    #sidebar.tbo-sidebar-collapsed.tbo-sidebar-peek .nav-section-label,
    #sidebar.tbo-sidebar-collapsed.tbo-sidebar-peek .nav-section-chevron,
    #sidebar.tbo-sidebar-collapsed.tbo-sidebar-peek .brand-label,
    #sidebar.tbo-sidebar-collapsed.tbo-sidebar-peek .sidebar-social,
    #sidebar.tbo-sidebar-collapsed.tbo-sidebar-peek .sidebar-user,
    #sidebar.tbo-sidebar-collapsed.tbo-sidebar-peek .sidebar-version,
    #sidebar.tbo-sidebar-collapsed.tbo-sidebar-peek .nav-badge-dev {
      opacity: 1;
      width: auto;
    }

    #sidebar.tbo-sidebar-collapsed.tbo-sidebar-peek .nav-item {
      justify-content: flex-start;
      padding: 8px 12px;
    }

    #sidebar.tbo-sidebar-collapsed.tbo-sidebar-peek .nav-section-toggle {
      justify-content: flex-start;
      padding: 10px 14px;
    }

    #sidebar.tbo-sidebar-collapsed.tbo-sidebar-peek .sidebar-brand {
      justify-content: flex-start;
      padding: 16px 20px;
    }

    #sidebar.tbo-sidebar-collapsed.tbo-sidebar-peek .brand-logo-svg {
      max-width: 100px;
    }

    /* Smooth transition for sidebar width */
    #sidebar {
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* =====================================================================
       ONBOARDING TOUR
       ===================================================================== */
    .tbo-tour-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .tbo-tour-overlay.visible {
      opacity: 1;
    }

    .tbo-tour-spotlight {
      position: fixed;
      border-radius: var(--radius-md, 8px);
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
      z-index: 10001;
      pointer-events: none;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .tbo-tour-highlighted {
      z-index: 10002 !important;
      position: relative;
    }

    .tbo-tour-tooltip {
      position: fixed;
      width: 320px;
      background: var(--bg-card, #fff);
      border-radius: var(--radius-lg, 12px);
      box-shadow: var(--shadow-xl, 0 12px 48px rgba(0,0,0,0.2));
      z-index: 10003;
      padding: 20px;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .tbo-tour-tooltip.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .tbo-tour-tooltip-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary, #0f0f0f);
      margin-bottom: 8px;
      font-family: var(--font-display);
    }

    .tbo-tour-tooltip-desc {
      font-size: 0.85rem;
      color: var(--text-secondary, #606060);
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .tbo-tour-tooltip-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tbo-tour-tooltip-counter {
      font-size: 0.75rem;
      color: var(--text-muted, #999);
      font-weight: 500;
    }

    .tbo-tour-tooltip-actions {
      display: flex;
      gap: 8px;
    }

    .tbo-tour-btn-skip {
      padding: 6px 14px;
      border-radius: var(--radius-sm, 6px);
      border: 1px solid var(--border-default, #eee);
      background: transparent;
      color: var(--text-secondary, #606060);
      font-size: 0.8rem;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .tbo-tour-btn-skip:hover {
      background: var(--bg-elevated, #dfdfdf);
    }

    .tbo-tour-btn-next {
      padding: 6px 16px;
      border-radius: var(--radius-sm, 6px);
      border: none;
      background: var(--accent, #E85102);
      color: #fff;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.15s ease;
    }

    .tbo-tour-btn-next:hover {
      background: var(--brand-orange-dark, #BE4202);
      transform: translateY(-1px);
    }

    /* =====================================================================
       NATURAL LANGUAGE FILTER
       ===================================================================== */
    .tbo-natural-filter {
      padding: 8px 24px 0;
      position: relative;
    }

    .tbo-filter-input-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-input, #dfdfdf);
      border: 1px solid var(--border-default, #eee);
      border-radius: var(--radius-md, 8px);
      padding: 8px 14px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .tbo-filter-input-wrap:focus-within {
      border-color: var(--accent, #E85102);
      box-shadow: 0 0 0 3px var(--accent-alpha-15, rgba(232,81,2,0.15));
    }

    .tbo-filter-icon {
      color: var(--text-muted, #999);
      flex-shrink: 0;
    }

    .tbo-filter-input {
      flex: 1;
      border: none;
      background: transparent;
      color: var(--text-primary, #0f0f0f);
      font-size: 0.85rem;
      font-family: var(--font-body);
      outline: none;
    }

    .tbo-filter-input::placeholder {
      color: var(--text-muted, #999);
    }

    .tbo-filter-hint {
      font-size: 0.65rem;
      color: var(--text-muted, #999);
      background: var(--bg-elevated, #dfdfdf);
      padding: 2px 8px;
      border-radius: var(--radius-xs, 3px);
      white-space: nowrap;
      font-weight: 500;
    }

    .tbo-filter-suggestions {
      position: absolute;
      top: 100%;
      left: 24px;
      right: 24px;
      background: var(--bg-card, #fff);
      border: 1px solid var(--border-default, #eee);
      border-radius: var(--radius-md, 8px);
      box-shadow: var(--shadow-lg, 0 8px 30px rgba(0,0,0,0.12));
      max-height: 280px;
      overflow-y: auto;
      z-index: var(--z-dropdown, 100);
      margin-top: 4px;
    }

    .tbo-filter-suggest-group {
      padding: 4px 0;
    }

    .tbo-filter-suggest-label {
      display: block;
      padding: 6px 14px 4px;
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted, #999);
    }

    .tbo-filter-suggest-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      font-size: 0.8rem;
      color: var(--text-primary, #0f0f0f);
      cursor: pointer;
      transition: background 0.12s ease;
    }

    .tbo-filter-suggest-item:hover {
      background: var(--accent-alpha-08, rgba(232,81,2,0.08));
    }

    .tbo-filter-suggest-item strong {
      color: var(--accent, #E85102);
      font-weight: 600;
    }

    .tbo-filter-suggest-preview {
      padding: 12px 14px;
    }

    .tbo-filter-parsed {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }

    .tbo-filter-tag {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      background: var(--accent-alpha-12, rgba(232,81,2,0.12));
      color: var(--accent, #E85102);
      border-radius: var(--radius-full, 9999px);
      font-size: 0.75rem;
      font-weight: 600;
    }

    .tbo-filter-tag-value {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      background: var(--bg-elevated, #dfdfdf);
      color: var(--text-secondary, #606060);
      border-radius: var(--radius-full, 9999px);
      font-size: 0.75rem;
    }

    .tbo-filter-suggest-hint {
      margin-top: 8px;
      font-size: 0.7rem;
      color: var(--text-muted, #999);
    }

    /* =====================================================================
       RESPONSIVE & DARK MODE ADJUSTMENTS
       ===================================================================== */
    @media (max-width: 768px) {
      .tbo-breadcrumb-bar {
        padding: 6px 16px;
        font-size: 0.75rem;
      }

      .tbo-natural-filter {
        padding: 6px 16px 0;
      }

      .tbo-filter-hint {
        display: none;
      }

      .tbo-recents-panel {
        width: calc(100vw - 32px);
        right: 16px !important;
        left: 16px;
      }

      .tbo-tour-tooltip {
        width: calc(100vw - 40px);
        max-width: 320px;
      }

      /* Ensure main content has bottom padding for tab bar */
      #main-content {
        padding-bottom: 70px;
      }
    }

    /* Dark mode overrides */
    body.dark-mode .tbo-breadcrumb-bar {
      background: var(--bg-card);
      border-color: var(--border-default);
    }

    body.dark-mode .tbo-mobile-tab-bar {
      background: var(--bg-card);
      border-color: var(--border-default);
    }

    body.dark-mode .tbo-recents-panel {
      background: var(--bg-card);
      border-color: var(--border-default);
    }

    body.dark-mode .tbo-filter-suggestions {
      background: var(--bg-card);
      border-color: var(--border-default);
    }

    body.dark-mode .tbo-tour-tooltip {
      background: var(--bg-card);
    }

    body.dark-mode .tbo-sidebar-collapse-btn {
      background: var(--bg-card);
      border-color: var(--border-default);
    }

    /* =====================================================================
       ANIMATION KEYFRAMES
       ===================================================================== */
    @keyframes tbo-tour-spotlight-pulse {
      0%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(232, 81, 2, 0.4); }
      50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 8px rgba(232, 81, 2, 0.2); }
    }

    .tbo-tour-spotlight {
      animation: tbo-tour-spotlight-pulse 2s ease-in-out infinite;
    }

    /* =====================================================================
       PRINT MEDIA -- HIDE NAVIGATION ENHANCEMENTS
       ===================================================================== */
    @media print {
      .tbo-mobile-tab-bar,
      .tbo-breadcrumb-bar,
      .tbo-natural-filter,
      .tbo-recents-panel,
      .tbo-tour-overlay,
      .tbo-tour-spotlight,
      .tbo-tour-tooltip,
      .tbo-sidebar-collapse-btn,
      .tbo-mobile-sidebar-backdrop {
        display: none !important;
      }
    }

    `;

    document.head.appendChild(style);
  }
};
