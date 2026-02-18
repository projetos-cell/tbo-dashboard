// TBO OS — Main Application Entry Point
// Initializes all systems, registers modules, binds events

const TBO_APP = {
  async init() {
    console.log('[TBO OS] Initializing...');

    // 0. Apply saved theme (light = default) + system detection
    this._initTheme();
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.initThemeDetection();
      TBO_UX.initErrorHandling();
    }

    // 0b. Init Supabase online listeners
    if (typeof TBO_SUPABASE !== 'undefined') {
      TBO_SUPABASE.initOnlineListeners();
    }

    // 1. Init auth & login UI
    TBO_AUTH.initLoginUI();
    TBO_AUTH.initAuthListener();
    const loggedIn = TBO_AUTH.checkSession();

    // 2. Load data
    try {
      await TBO_STORAGE.loadAll();
      console.log('[TBO OS] Data loaded');
    } catch (e) {
      console.warn('[TBO OS] Data load error:', e);
    }

    // 2b. Load monthly lock cache
    if (typeof TBO_ERP !== 'undefined') {
      TBO_ERP.checkMonthlyLocks();
    }

    // 3. Register real modules with router
    const modules = {
      'command-center': typeof TBO_COMMAND_CENTER !== 'undefined' ? TBO_COMMAND_CENTER : null,
      'conteudo': typeof TBO_CONTEUDO !== 'undefined' ? TBO_CONTEUDO : null,
      'comercial': typeof TBO_COMERCIAL !== 'undefined' ? TBO_COMERCIAL : null,
      'projetos': typeof TBO_PROJETOS !== 'undefined' ? TBO_PROJETOS : null,
      'mercado': typeof TBO_MERCADO !== 'undefined' ? TBO_MERCADO : null,
      'reunioes': typeof TBO_REUNIOES !== 'undefined' ? TBO_REUNIOES : null,
      'financeiro': typeof TBO_FINANCEIRO !== 'undefined' ? TBO_FINANCEIRO : null,
      'rh': typeof TBO_RH !== 'undefined' ? TBO_RH : null,
      'configuracoes': typeof TBO_CONFIGURACOES !== 'undefined' ? TBO_CONFIGURACOES : null,
      'changelog': typeof TBO_CHANGELOG !== 'undefined' ? TBO_CHANGELOG : null,
      'timeline': typeof TBO_TIMELINE !== 'undefined' ? TBO_TIMELINE : null,
      'alerts': typeof TBO_ALERTS !== 'undefined' ? TBO_ALERTS : null,
      'pipeline': typeof TBO_PIPELINE !== 'undefined' ? TBO_PIPELINE : null,
      'clientes': typeof TBO_CLIENTES !== 'undefined' ? TBO_CLIENTES : null,
      'portal-cliente': typeof TBO_PORTAL_CLIENTE !== 'undefined' ? TBO_PORTAL_CLIENTE : null,
      'contratos': typeof TBO_CONTRATOS !== 'undefined' ? TBO_CONTRATOS : null,
      'inteligencia': typeof TBO_INTELIGENCIA !== 'undefined' ? TBO_INTELIGENCIA : null,
      'cultura': typeof TBO_CULTURA !== 'undefined' ? TBO_CULTURA : null,
      'tarefas': typeof TBO_TAREFAS !== 'undefined' ? TBO_TAREFAS : null,
      'entregas': typeof TBO_ENTREGAS !== 'undefined' ? TBO_ENTREGAS : null,
      'revisoes': typeof TBO_REVISOES !== 'undefined' ? TBO_REVISOES : null,
      'decisoes': typeof TBO_DECISOES !== 'undefined' ? TBO_DECISOES : null,
      'timesheets': typeof TBO_TIMESHEETS !== 'undefined' ? TBO_TIMESHEETS : null,
      'carga-trabalho': typeof TBO_CARGA_TRABALHO !== 'undefined' ? TBO_CARGA_TRABALHO : null,
      'pagar': typeof TBO_PAGAR !== 'undefined' ? TBO_PAGAR : null,
      'receber': typeof TBO_RECEBER !== 'undefined' ? TBO_RECEBER : null,
      'margens': typeof TBO_MARGENS !== 'undefined' ? TBO_MARGENS : null,
      'conciliacao': typeof TBO_CONCILIACAO !== 'undefined' ? TBO_CONCILIACAO : null,
      'templates': typeof TBO_TEMPLATES !== 'undefined' ? TBO_TEMPLATES : null,
      'biblioteca': typeof TBO_BIBLIOTECA !== 'undefined' ? TBO_BIBLIOTECA : null,
      'capacidade': typeof TBO_CAPACIDADE !== 'undefined' ? TBO_CAPACIDADE : null,
      'permissoes-config': typeof TBO_PERMISSOES_CONFIG !== 'undefined' ? TBO_PERMISSOES_CONFIG : null,
      'integracoes': typeof TBO_INTEGRACOES !== 'undefined' ? TBO_INTEGRACOES : null,
      'trilha-aprendizagem': typeof TBO_TRILHA_APRENDIZAGEM !== 'undefined' ? TBO_TRILHA_APRENDIZAGEM : null,
      'pessoas-avancado': typeof TBO_PESSOAS_AVANCADO !== 'undefined' ? TBO_PESSOAS_AVANCADO : null
    };

    Object.entries(modules).forEach(([name, mod]) => {
      if (mod) TBO_ROUTER.register(name, mod);
    });

    // 3b. Register all placeholder modules
    this._placeholderKeys.forEach(key => {
      TBO_ROUTER.register(key, {
        render() { TBO_PLACEHOLDER._currentRoute = key; return TBO_PLACEHOLDER.render(); },
        init() { TBO_PLACEHOLDER.init(); }
      });
    });

    // 4. Bind sidebar navigation
    this._bindSidebar();

    // 5. Bind header actions
    this._bindHeader();

    // 6. Bind search
    this._bindSearch();

    // 7. Setup keyboard shortcuts
    this._setupShortcuts();

    // 8. Update status indicators
    this._updateStatus();

    // 9. Sidebar resize handle
    this._bindSidebarResize();

    // 10. Listen for route changes to update sidebar
    TBO_ROUTER.onChange((current) => {
      this._setActiveNav(current);
      this._updateHeaderTitle(current);
    });

    // 11. Listen for hash changes (with access control)
    this._listenHashWithAuth();

    // 11b. Auto-backup (once per day, silent)
    if (typeof TBO_BACKUP !== 'undefined') {
      TBO_BACKUP.autoBackup();
    }

    // 12. Navigate to initial module (only if logged in)
    if (loggedIn) {
      const user = TBO_AUTH.getCurrentUser();
      const defaultMod = user?.defaultModule || 'command-center';
      TBO_ROUTER.initFromHash(defaultMod);
    }

    // 13. Update freshness timestamp
    this._updateFreshness();

    // 14. Init UX enhancements
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.initKeyboardNav();
      TBO_UX.initOfflineDetection();
      // Show tour for first-time users (after a short delay)
      if (loggedIn) TBO_UX.showTour();
    }

    // 14b. Init notifications
    if (typeof TBO_NOTIFICATIONS !== 'undefined' && loggedIn) {
      TBO_NOTIFICATIONS.init();
    }

    // ── 15. Init Enhancement Modules (100 improvements) ──────────────
    // Design System tokens & skeleton loading
    if (typeof TBO_DESIGN !== 'undefined' && TBO_DESIGN.init) {
      try { TBO_DESIGN.init(); } catch(e) { console.warn('[TBO OS] Design system init error:', e); }
    }

    // UX Enhancements (Command Palette, Focus Mode, Inline Editing, etc.)
    if (typeof TBO_UX_ENHANCEMENTS !== 'undefined' && TBO_UX_ENHANCEMENTS.init) {
      try { TBO_UX_ENHANCEMENTS.init(); } catch(e) { console.warn('[TBO OS] UX enhancements init error:', e); }
    }

    // Business Intelligence (Deal Scoring, Revenue Forecast, Client Health)
    if (typeof TBO_BUSINESS_INTELLIGENCE !== 'undefined' && TBO_BUSINESS_INTELLIGENCE.init) {
      try { TBO_BUSINESS_INTELLIGENCE.init(); } catch(e) { console.warn('[TBO OS] BI init error:', e); }
    }

    // Project Enhancements (Playbook, Dependency Graph, Sprint Planning)
    if (typeof TBO_PROJECT_ENHANCEMENTS !== 'undefined' && TBO_PROJECT_ENHANCEMENTS.init) {
      try { TBO_PROJECT_ENHANCEMENTS.init(); } catch(e) { console.warn('[TBO OS] Project enhancements init error:', e); }
    }

    // Financial Enhancements (Cashflow, Pricing Calculator, CLV)
    if (typeof TBO_FINANCIAL_ENHANCEMENTS !== 'undefined' && TBO_FINANCIAL_ENHANCEMENTS.init) {
      try { TBO_FINANCIAL_ENHANCEMENTS.init(); } catch(e) { console.warn('[TBO OS] Financial enhancements init error:', e); }
    }

    // People & Culture (1:1 Assistant, Peer Recognition, Burnout Risk)
    if (typeof TBO_PEOPLE_ENHANCEMENTS !== 'undefined' && TBO_PEOPLE_ENHANCEMENTS.init) {
      try { TBO_PEOPLE_ENHANCEMENTS.init(); } catch(e) { console.warn('[TBO OS] People enhancements init error:', e); }
    }

    // Analytics & Reporting (Cohort Analysis, Report Builder, SLA Tracker)
    if (typeof TBO_ANALYTICS !== 'undefined' && TBO_ANALYTICS.init) {
      try { TBO_ANALYTICS.init(); } catch(e) { console.warn('[TBO OS] Analytics init error:', e); }
    }

    // Navigation Enhancements (Breadcrumbs, FAB, Deep Links, Onboarding Tour)
    if (typeof TBO_NAVIGATION !== 'undefined' && TBO_NAVIGATION.init) {
      try { TBO_NAVIGATION.init(); } catch(e) { console.warn('[TBO OS] Navigation init error:', e); }
    }

    // Integrations (Google Drive, WhatsApp, Notion, Calendar, Slack)
    if (typeof TBO_INTEGRATIONS !== 'undefined' && TBO_INTEGRATIONS.init) {
      try { TBO_INTEGRATIONS.init(); } catch(e) { console.warn('[TBO OS] Integrations init error:', e); }
    }

    // Performance (Virtual Scroll, PWA, Service Worker, Optimistic UI)
    if (typeof TBO_PERFORMANCE !== 'undefined' && TBO_PERFORMANCE.init) {
      try { TBO_PERFORMANCE.init(); } catch(e) { console.warn('[TBO OS] Performance init error:', e); }
    }

    // 16. Initialize Lucide icons
    if (window.lucide) lucide.createIcons();

    console.log('[TBO OS] Ready — 100 enhancements loaded');
  },

  // ── Theme ──────────────────────────────────────────────────────────
  _initTheme() {
    const saved = localStorage.getItem('tbo_theme');
    // Light is default — only apply dark if explicitly saved
    if (saved === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.add('light-mode');
    }
    // Theme toggle is now in the user dropdown (rendered by auth.js)
  },

  // ── Sidebar ──────────────────────────────────────────────────────────
  _bindSidebar() {
    // 1. Dynamically render sidebar from permissions
    this._renderSidebar();

    // 2. Bind nav item clicks (event delegation on container)
    const navEl = document.getElementById('sidebarNav');
    if (navEl) {
      navEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.nav-item[data-module]');
        if (!btn) return;
        const mod = btn.dataset.module;
        // Access control check
        if (!TBO_AUTH.canAccess(mod)) {
          const user = TBO_AUTH.getCurrentUser();
          const roleLabel = user?.roleLabel || 'seu perfil';
          TBO_TOAST.warning('Acesso restrito', `O perfil "${roleLabel}" nao tem acesso a este modulo.`);
          return;
        }
        TBO_ROUTER.navigate(mod);
        // Close mobile menu
        document.getElementById('sidebar')?.classList.remove('mobile-open');
      });
    }

    // 3. Brand logo — navigate to Dashboard
    const brandLink = document.getElementById('brandLink');
    if (brandLink) {
      brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        TBO_ROUTER.navigate('command-center');
        document.getElementById('sidebar')?.classList.remove('mobile-open');
      });
    }

    // 4. Sidebar collapse toggle (with persistence)
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');

    // Restore collapsed state from localStorage
    if (sidebar && localStorage.getItem('tbo_sidebar_collapsed') === '1') {
      sidebar.classList.add('collapsed');
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const sb = document.getElementById('sidebar');
        if (sb) {
          sb.classList.toggle('collapsed');
          localStorage.setItem('tbo_sidebar_collapsed', sb.classList.contains('collapsed') ? '1' : '0');
        }
      });
    }

    // 5. Mobile menu
    const mobileBtn = document.getElementById('mobileMenuBtn');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('mobile-open');
      });
    }

    // 6. Section toggles (collapsible groups)
    this._bindSectionToggles();
  },

  // ── Dynamic Sidebar Renderer ─────────────────────────────────────────
  _renderSidebar() {
    const navEl = document.getElementById('sidebarNav');
    if (!navEl) return;

    const user = TBO_AUTH.getCurrentUser();
    const sections = TBO_PERMISSIONS.getSectionsForUser(user?.id);

    let html = '';
    sections.forEach(section => {
      // Filter to only modules that are actually registered in the router
      const visibleModules = section.modules.filter(m => {
        const real = TBO_ROUTER._resolveAlias(m);
        return !!TBO_ROUTER._modules[real];
      });
      if (visibleModules.length === 0) return;

      const isPlaceholder = (modKey) => this._placeholderKeys.includes(modKey);

      html += `<div class="nav-section" data-section="${section.id}">
        <button class="nav-section-toggle" data-section-toggle="${section.id}" aria-expanded="true">
          <i data-lucide="${section.icon}" class="nav-section-icon"></i>
          <span class="nav-section-label">${section.label}</span>
          <i data-lucide="chevron-down" class="nav-section-chevron"></i>
        </button>
        <ul class="nav-list" role="menubar">
          ${visibleModules.map(modKey => {
            const label = this._moduleLabels[modKey] || modKey;
            const icon = this._moduleIcons[modKey] || 'file';
            const isPlc = isPlaceholder(modKey);
            return `<li>
              <button class="nav-item${isPlc ? ' nav-item--placeholder' : ''}" data-module="${modKey}" role="menuitem" title="${label}">
                <i data-lucide="${icon}" class="nav-icon"></i>
                <span class="nav-label">${label}</span>
                ${isPlc ? '<span class="nav-badge-dev">Em dev</span>' : ''}
              </button>
            </li>`;
          }).join('')}
        </ul>
      </div>`;
    });

    navEl.innerHTML = html;

    // Re-init Lucide icons for new sidebar content
    if (window.lucide) lucide.createIcons();
  },

  // ── Collapsible sidebar sections ──────────────────────────────────────────
  _bindSectionToggles() {
    document.querySelectorAll('.nav-section-toggle').forEach(toggle => {
      const sectionId = toggle.dataset.sectionToggle;
      const section = toggle.closest('.nav-section');
      if (!section || !sectionId) return;

      // Restore collapsed state from localStorage
      const saved = localStorage.getItem(`tbo_section_${sectionId}`);
      if (saved === '0') {
        section.classList.add('collapsed');
        toggle.setAttribute('aria-expanded', 'false');
      }

      toggle.addEventListener('click', () => {
        const isCollapsed = section.classList.toggle('collapsed');
        toggle.setAttribute('aria-expanded', !isCollapsed);
        localStorage.setItem(`tbo_section_${sectionId}`, isCollapsed ? '0' : '1');
      });
    });
  },

  _bindSidebarResize() {
    const handle = document.getElementById('sidebarResizeHandle');
    const sidebar = document.getElementById('sidebar');
    if (!handle || !sidebar) return;

    let isResizing = false;

    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, 180), 400);
      sidebar.style.width = newWidth + 'px';
      sidebar.classList.remove('collapsed');
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  },

  _setActiveNav(moduleName) {
    // Resolve aliases so sidebar highlights the correct item
    const resolved = TBO_ROUTER._resolveAlias(moduleName);
    document.querySelectorAll('.nav-item').forEach(btn => {
      const btnMod = btn.dataset.module;
      const isActive = btnMod === resolved || btnMod === moduleName;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
      // Auto-expand parent section if active
      if (isActive) {
        const parentSection = btn.closest('.nav-section');
        if (parentSection && parentSection.classList.contains('collapsed')) {
          parentSection.classList.remove('collapsed');
          const toggle = parentSection.querySelector('.nav-section-toggle');
          if (toggle) toggle.setAttribute('aria-expanded', 'true');
        }
      }
    });
  },

  // ── Hash with Auth ─────────────────────────────────────────────────
  _listenHashWithAuth() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      const rawName = hash.split('/')[0];
      const resolved = TBO_ROUTER._resolveAlias(rawName);
      if (resolved && TBO_ROUTER._modules[resolved]) {
        if (!TBO_AUTH.canAccess(resolved)) {
          const user = TBO_AUTH.getCurrentUser();
          const roleLabel = user?.roleLabel || 'seu perfil';
          TBO_TOAST.warning('Acesso restrito', `O perfil "${roleLabel}" nao tem acesso a este modulo.`);
          const defaultMod = user?.defaultModule || 'command-center';
          if (defaultMod !== resolved) TBO_ROUTER.navigate(defaultMod);
          return;
        }
        TBO_ROUTER.navigate(hash);
      }
    });
  },

  // ── Header ───────────────────────────────────────────────────────────
  _bindHeader() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshData());
    }

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.toggleSearch(true));
    }
  },

  // ── Placeholder module keys (none remaining — all modules implemented) ──
  _placeholderKeys: [],

  // ── Module labels (all 26 = 9 real + 17 placeholders) ──────────────
  _moduleLabels: {
    // Real modules
    'command-center': 'Dashboard',
    'conteudo': 'Conteudo & Redacao',
    'comercial': 'Propostas',
    'projetos': 'Projetos',
    'mercado': 'Inteligencia de Mercado',
    'reunioes': 'Reunioes & Contexto',
    'financeiro': 'Financeiro',
    'rh': 'Equipe',
    'configuracoes': 'Configuracoes',
    // BI
    'inteligencia': 'Inteligencia BI',
    'cultura': 'Manual de Cultura',
    // Placeholders
    'timeline': 'Timeline',
    'alerts': 'Alertas',
    'pipeline': 'Pipeline',
    'clientes': 'Clientes',
    'portal-cliente': 'Portal do Cliente',
    'contratos': 'Contratos',
    'entregas': 'Entregas',
    'tarefas': 'Tarefas',
    'revisoes': 'Revisoes',
    'entregas-pendentes': 'Entregas Pendentes',
    'revisoes-pendentes': 'Revisoes Pendentes',
    'decisoes': 'Decisoes',
    'biblioteca': 'Biblioteca',
    'carga-trabalho': 'Carga de Trabalho',
    'timesheets': 'Timesheets',
    'capacidade': 'Capacidade',
    'pagar': 'Contas a Pagar',
    'receber': 'Contas a Receber',
    'margens': 'Margens',
    'conciliacao': 'Conciliacao',
    'templates': 'Templates',
    'permissoes-config': 'Permissoes',
    'integracoes': 'Integracoes',
    'trilha-aprendizagem': 'Trilha de Aprendizagem',
    'pessoas-avancado': 'Pessoas Avancado',
    'changelog': 'Changelog'
  },

  // ── Module icons (Lucide icon names) ────────────────────────────────
  _moduleIcons: {
    'command-center': 'layout-dashboard',
    'inteligencia': 'brain',
    'timeline': 'calendar-range',
    'alerts': 'bell-ring',
    'pipeline': 'filter',
    'comercial': 'file-text',
    'clientes': 'building-2',
    'portal-cliente': 'monitor-smartphone',
    'contratos': 'file-signature',
    'projetos': 'clipboard-list',
    'entregas': 'package-check',
    'tarefas': 'list-checks',
    'revisoes': 'git-pull-request',
    'conteudo': 'pen-tool',
    'entregas-pendentes': 'package',
    'revisoes-pendentes': 'message-circle',
    'mercado': 'bar-chart-3',
    'reunioes': 'mic',
    'decisoes': 'gavel',
    'biblioteca': 'book-open',
    'rh': 'users',
    'carga-trabalho': 'gauge',
    'timesheets': 'clock',
    'capacidade': 'activity',
    'financeiro': 'coins',
    'pagar': 'credit-card',
    'receber': 'receipt',
    'margens': 'trending-up',
    'conciliacao': 'scale',
    'configuracoes': 'settings',
    'templates': 'layout-template',
    'permissoes-config': 'shield-check',
    'integracoes': 'plug-zap',
    'cultura': 'book-open-text',
    'trilha-aprendizagem': 'graduation-cap',
    'pessoas-avancado': 'heart-pulse',
    'changelog': 'file-clock'
  },

  _updateHeaderTitle(moduleName) {
    const title = document.getElementById('headerTitle');
    if (title) {
      title.textContent = this._moduleLabels[moduleName] || moduleName;
    }
  },

  // ── Status ───────────────────────────────────────────────────────────
  _updateStatus() {
    // API Key status
    const apiDot = document.querySelector('#statusAPI .status-dot');
    const apiLabel = document.querySelector('#statusAPI .status-label');
    if (apiDot) {
      apiDot.dataset.status = TBO_API.isConfigured() ? 'connected' : 'disconnected';
    }
    if (apiLabel) {
      const provider = TBO_API.getProvider();
      apiLabel.textContent = TBO_API.isConfigured()
        ? (provider === 'openai' ? 'GPT' : 'Claude')
        : 'IA';
    }

    // Data status
    const context = TBO_STORAGE.get('context');
    const driveDot = document.querySelector('#statusDrive .status-dot');
    if (driveDot) {
      driveDot.dataset.status = (context.projetos_ativos && context.projetos_ativos.length > 0) ? 'connected' : 'stale';
    }

    const meetings = TBO_STORAGE.get('meetings');
    const ffDot = document.querySelector('#statusFireflies .status-dot');
    const ffLabel = document.querySelector('#statusFireflies .status-label');
    const meetingsArr = meetings.meetings || meetings.reunioes_recentes || [];
    const hasMeetings = meetingsArr.length > 0;

    // Check if Fireflies real-time API is active
    const ffRealtime = typeof TBO_FIREFLIES !== 'undefined' && TBO_FIREFLIES.isEnabled();
    if (ffDot) {
      if (ffRealtime) {
        const ffStatus = TBO_FIREFLIES.getStatus();
        if (ffStatus.syncing) {
          ffDot.dataset.status = 'stale';
        } else if (ffStatus.error) {
          ffDot.dataset.status = 'disconnected';
        } else if (ffStatus.lastSync) {
          ffDot.dataset.status = 'connected';
        } else {
          ffDot.dataset.status = hasMeetings ? 'connected' : 'stale';
        }
      } else {
        ffDot.dataset.status = hasMeetings ? 'connected' : 'stale';
      }
    }
    if (ffLabel) {
      if (ffRealtime && TBO_FIREFLIES.getStatus().lastSync) {
        const ffStatus = TBO_FIREFLIES.getStatus();
        const dateStr = new Date(ffStatus.lastSync).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        ffLabel.textContent = `Sincronizado \u2713 ${dateStr} | ${ffStatus.meetingCount} reunioes`;
        const badge = document.getElementById('statusFireflies');
        if (badge) badge.title = `Fireflies API — ${ffStatus.cacheAge || 'sincronizado'}`;
      } else if (ffRealtime && TBO_FIREFLIES.getStatus().syncing) {
        ffLabel.textContent = 'Sync...';
      } else if (ffRealtime && TBO_FIREFLIES.getStatus().error) {
        ffLabel.textContent = 'Erro API';
      } else if (hasMeetings) {
        const meta = meetings.metadata || meetings._metadata;
        const dateStr = meta ? new Date(meta.collected_at || meta.generated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
        ffLabel.textContent = `Sincronizado \u2713 ${dateStr} | ${meetingsArr.length} reunioes`;
      }
    }

    const market = TBO_STORAGE.get('market');
    const mktDot = document.querySelector('#statusMarket .status-dot');
    if (mktDot) {
      mktDot.dataset.status = market.indicadores_curitiba ? 'connected' : 'stale';
    }

    // Google Sheets status
    const sheetsDot = document.querySelector('#statusSheets .status-dot');
    const sheetsLabel = document.querySelector('#statusSheets .status-label');
    if (sheetsDot && typeof TBO_SHEETS !== 'undefined') {
      const status = TBO_SHEETS.getStatus();
      if (status.syncing) {
        sheetsDot.dataset.status = 'stale';
        if (sheetsLabel) sheetsLabel.textContent = 'Sync...';
      } else if (status.error) {
        sheetsDot.dataset.status = 'disconnected';
        if (sheetsLabel) sheetsLabel.textContent = 'Sheets';
      } else if (status.lastSync) {
        sheetsDot.dataset.status = 'connected';
        if (sheetsLabel) sheetsLabel.textContent = 'Sheets';
        // Update title with cache age
        const badge = document.getElementById('statusSheets');
        if (badge) badge.title = `Google Sheets — ${status.cacheAge || 'sincronizado'}`;
      } else if (!status.enabled) {
        sheetsDot.dataset.status = 'disconnected';
        if (sheetsLabel) sheetsLabel.textContent = 'Sheets';
      }
    }
  },

  _updateFreshness() {
    const el = document.querySelector('#dataFreshness .freshness-text');
    if (el) {
      const now = new Date();
      el.textContent = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    // Update sidebar version from config
    const verEl = document.getElementById('sidebarVersion');
    if (verEl && typeof TBO_CONFIG !== 'undefined') {
      verEl.textContent = `v${TBO_CONFIG.app.version}`;
    }
  },

  // ── Search ───────────────────────────────────────────────────────────
  _searchFilter: 'all',

  _bindSearch() {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');

    if (!overlay || !input) return;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.toggleSearch(false);
    });

    let debounce = null;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        this._performSearch(input.value, results);
      }, 200);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleSearch(false);
      } else if (e.key === 'Enter') {
        const focused = results.querySelector('.search-result-item.focused');
        const first = focused || results.querySelector('.search-result-item');
        if (first) first.click();
      }
    });

    // Search filter chips
    document.querySelectorAll('.search-filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.search-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this._searchFilter = chip.dataset.filter || 'all';
        // Re-run search with current input
        if (input.value.trim().length >= 2) {
          this._performSearch(input.value, results);
        }
      });
    });
  },

  toggleSearch(show) {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    if (!overlay) return;

    if (show) {
      overlay.hidden = false;
      if (input) { input.value = ''; input.focus(); }
      const results = document.getElementById('searchResults');
      if (results) {
        // Show search history if available
        const historyHtml = (typeof TBO_UX !== 'undefined') ? TBO_UX.renderSearchHistory() : '';
        results.innerHTML = historyHtml || `<div class="search-hint">
          Digite para buscar modulos, projetos, clientes...
        </div>`;
        // Bind history item clicks
        results.querySelectorAll('.ux-search-history-item').forEach(item => {
          item.addEventListener('click', () => {
            if (input) { input.value = item.dataset.query; input.dispatchEvent(new Event('input')); }
          });
        });
      }
    } else {
      overlay.hidden = true;
    }
  },

  _performSearch(query, resultsEl) {
    if (!resultsEl) return;
    if (!query || query.trim().length < 2) {
      resultsEl.innerHTML = `<div class="search-hint">Digite ao menos 2 caracteres...</div>`;
      return;
    }

    const filter = this._searchFilter || 'all';

    const moduleResults = [];
    if (filter === 'all' || filter === 'modulo') {
      Object.entries(this._moduleLabels).forEach(([key, label]) => {
        if (label.toLowerCase().includes(query.toLowerCase()) && TBO_AUTH.canAccess(key)) {
          moduleResults.push({ type: 'modulo', key, label });
        }
      });
    }

    let dataResults = (typeof TBO_SEARCH !== 'undefined')
      ? TBO_SEARCH.search(query, { limit: 10 })
      : [];

    // Apply filter to data results
    if (filter !== 'all' && filter !== 'modulo') {
      dataResults = dataResults.filter(r => r.type === filter || r.type?.startsWith(filter));
    }

    if (moduleResults.length === 0 && dataResults.length === 0) {
      resultsEl.innerHTML = `<div class="search-hint">Nenhum resultado para "${query}"${filter !== 'all' ? ' neste filtro' : ''}</div>`;
      return;
    }

    let html = '';
    moduleResults.forEach(m => {
      html += `<div class="search-result-item" data-action="navigate" data-module="${m.key}">
        <span class="search-result-icon">\u{1F4E6}</span>
        <div class="search-result-info">
          <div class="search-result-title">${m.label}</div>
        </div>
        <span class="search-result-type">modulo</span>
      </div>`;
    });

    const typeIcons = {
      projeto_ativo: '\u{1F4CB}', projeto_finalizado: '\u2705',
      cliente: '\u{1F3E2}', reuniao: '\u{1F3AF}', mercado: '\u{1F4C8}'
    };
    const typeLabels = {
      projeto_ativo: 'Projeto', projeto_finalizado: 'Finalizado',
      cliente: 'Cliente', reuniao: 'Reuniao', mercado: 'Mercado'
    };

    dataResults.forEach(r => {
      html += `<div class="search-result-item" data-action="data" data-type="${r.type}" data-title="${r.title}">
        <span class="search-result-icon">${typeIcons[r.type] || '\u{1F50D}'}</span>
        <div class="search-result-info">
          <div class="search-result-title">${r.title}</div>
          <div class="search-result-subtitle">${r.subtitle || ''}</div>
        </div>
        <span class="search-result-type">${typeLabels[r.type] || r.type}</span>
      </div>`;
    });

    resultsEl.innerHTML = html;

    resultsEl.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        if (action === 'navigate') {
          TBO_ROUTER.navigate(item.dataset.module);
        } else if (action === 'data') {
          const typeModuleMap = {
            projeto_ativo: 'projetos', projeto_finalizado: 'projetos',
            cliente: 'comercial', reuniao: 'reunioes', mercado: 'mercado'
          };
          TBO_ROUTER.navigate(typeModuleMap[item.dataset.type] || 'command-center');
        }
        // Save to search history
        if (typeof TBO_UX !== 'undefined') {
          const searchInput = document.getElementById('searchInput');
          if (searchInput?.value) TBO_UX.addSearchHistory(searchInput.value.trim());
        }
        this.toggleSearch(false);
      });
    });
  },

  // ── Shortcuts ────────────────────────────────────────────────────────
  _setupShortcuts() {
    TBO_SHORTCUTS.init();

    // Search
    TBO_SHORTCUTS.bind('Alt+k', () => this.toggleSearch(true), 'Abrir busca rapida');

    // Refresh
    TBO_SHORTCUTS.bind('Alt+r', () => this.refreshData(), 'Atualizar dados');

    // Toggle sidebar (with persistence)
    TBO_SHORTCUTS.bind('Alt+b', () => {
      const sb = document.getElementById('sidebar');
      if (sb) {
        sb.classList.toggle('collapsed');
        localStorage.setItem('tbo_sidebar_collapsed', sb.classList.contains('collapsed') ? '1' : '0');
      }
    }, 'Recolher/expandir barra lateral');

    // Escape to close overlays
    TBO_SHORTCUTS.bind('Escape', () => {
      this.toggleSearch(false);
    }, 'Fechar dialogo');
  },

  // ── Refresh Data ─────────────────────────────────────────────────────
  async refreshData() {
    TBO_TOAST.info('Atualizando', 'Carregando dados atualizados...');

    try {
      // Clear caches to force fresh fetch
      if (typeof TBO_SHEETS !== 'undefined') { TBO_SHEETS._cache = {}; }
      if (typeof TBO_FIREFLIES !== 'undefined') { TBO_FIREFLIES._cache = null; TBO_FIREFLIES._cacheTime = null; }
      await TBO_STORAGE.loadAll();
      this._updateStatus();
      this._updateFreshness();

      const current = TBO_ROUTER.getCurrent();
      if (current) {
        TBO_ROUTER._currentModule = null;
        await TBO_ROUTER.navigate(current);
      }

      TBO_TOAST.success('Atualizado', 'Dados carregados com sucesso.');
    } catch (e) {
      TBO_TOAST.error('Erro', 'Falha ao atualizar dados: ' + e.message);
    }
  }
};

// ── Boot ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  TBO_APP.init().catch(err => {
    console.error('[TBO OS] Boot error:', err);
  });
});
