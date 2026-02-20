// TBO OS — Main Application Entry Point
// Initializes all systems, registers modules, binds events

const TBO_APP = {
  // ── Error boundary global — captura falhas em modulos sem quebrar o sistema ──
  _safeInit(moduleName, initFn) {
    try {
      const result = initFn();
      // Se retornar Promise, capturar rejeicao
      if (result && typeof result.catch === 'function') {
        result.catch(e => {
          console.error(`[TBO OS] Modulo "${moduleName}" falhou na inicializacao:`, e);
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.error('Erro no modulo', `O modulo "${moduleName}" encontrou um erro. Tente recarregar.`);
          }
        });
      }
      return result;
    } catch (e) {
      console.error(`[TBO OS] Modulo "${moduleName}" falhou na inicializacao:`, e);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro no modulo', `O modulo "${moduleName}" encontrou um erro. Tente recarregar.`);
      }
    }
  },

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

    // 0b2. Init error monitor (v2.1 observabilidade)
    if (typeof TBO_ERROR_MONITOR !== 'undefined') {
      TBO_ERROR_MONITOR.init();
    }

    // 0c. Credenciais de integracoes carregadas do Supabase (integration_configs)
    // REMOVIDO: seed hardcoded de API keys (seguranca — nunca commitar credenciais)
    // As integracoes buscam keys via integration_configs table apos login
    // Configuracao pelo admin em: Configuracoes > Integracoes

    // 1. Init auth & login UI
    TBO_AUTH.initLoginUI();
    TBO_AUTH.initAuthListener();
    const loggedIn = TBO_AUTH.checkSession();

    // 2. Load critical data (JSON + ERP cache) com timeout global de 10s
    // v2.1: Se Supabase/APIs estiverem lentas, continua com cache do localStorage
    // APIs externas (Sheets, Fireflies, RD, Calendar) carregam apos dashboard visivel
    try {
      await Promise.race([
        TBO_STORAGE.loadCritical(),
        new Promise(resolve => setTimeout(() => {
          console.warn('[TBO OS] loadCritical() timeout 10s — continuando com cache');
          resolve();
        }, 10000))
      ]);
      console.log('[TBO OS] Critical data loaded');
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
      // timeline removido em v2.1
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
      // timesheets e carga-trabalho removidos em v2.2
      'pagar': typeof TBO_PAGAR !== 'undefined' ? TBO_PAGAR : null,
      'receber': typeof TBO_RECEBER !== 'undefined' ? TBO_RECEBER : null,
      'margens': typeof TBO_MARGENS !== 'undefined' ? TBO_MARGENS : null,
      'conciliacao': typeof TBO_CONCILIACAO !== 'undefined' ? TBO_CONCILIACAO : null,
      'templates': typeof TBO_TEMPLATES !== 'undefined' ? TBO_TEMPLATES : null,
      'biblioteca': typeof TBO_BIBLIOTECA !== 'undefined' ? TBO_BIBLIOTECA : null,
      // capacidade removido em v2.2
      'permissoes-config': typeof TBO_PERMISSOES_CONFIG !== 'undefined' ? TBO_PERMISSOES_CONFIG : null,
      'integracoes': typeof TBO_INTEGRACOES !== 'undefined' ? TBO_INTEGRACOES : null,
      'trilha-aprendizagem': typeof TBO_TRILHA_APRENDIZAGEM !== 'undefined' ? TBO_TRILHA_APRENDIZAGEM : null,
      'pessoas-avancado': typeof TBO_PESSOAS_AVANCADO !== 'undefined' ? TBO_PESSOAS_AVANCADO : null,
      'admin-onboarding': typeof TBO_ADMIN_ONBOARDING !== 'undefined' ? TBO_ADMIN_ONBOARDING : null,
      'workspace': typeof TBO_WORKSPACE !== 'undefined' ? TBO_WORKSPACE : null,
      'admin-portal': typeof TBO_ADMIN_PORTAL !== 'undefined' ? TBO_ADMIN_PORTAL : null,
      'conciliacao-bancaria': typeof TBO_CONCILIACAO_BANCARIA !== 'undefined' ? TBO_CONCILIACAO_BANCARIA : null,
      'onboarding-wizard': typeof TBO_ONBOARDING_WIZARD !== 'undefined' ? TBO_ONBOARDING_WIZARD : null,
      'academy': typeof TBO_ACADEMY_CATALOGO !== 'undefined' ? TBO_ACADEMY_CATALOGO : null,
      'chat': typeof TBO_CHAT !== 'undefined' ? TBO_CHAT : null,
      'project-workspace': typeof TBO_PROJECT_WORKSPACE !== 'undefined' ? TBO_PROJECT_WORKSPACE : null,
      'inteligencia-imobiliaria': typeof TBO_INTELIGENCIA_IMOBILIARIA !== 'undefined' ? TBO_INTELIGENCIA_IMOBILIARIA : null,
      'people-profile': typeof TBO_PEOPLE_PROFILE !== 'undefined' ? TBO_PEOPLE_PROFILE : null
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

    // 12. Onboarding guard — verifica ANTES do router para bloquear navegacao
    if (typeof TBO_ONBOARDING_GUARD !== 'undefined' && loggedIn) {
      try { await TBO_ONBOARDING_GUARD.verificar(); } catch(e) { console.warn('[TBO OS] Onboarding guard error:', e); }
    }

    // 12b. Onboarding notifications — badge no header
    if (typeof TBO_ONBOARDING_NOTIFICACOES !== 'undefined' && loggedIn) {
      try { TBO_ONBOARDING_NOTIFICACOES.init(); } catch(e) { console.warn('[TBO OS] Onboarding notificacoes error:', e); }
    }

    // 13. Navigate to initial module (only if logged in)
    if (loggedIn) {
      // 13a. Carregar credenciais de integracoes do Supabase (nao hardcoded)
      if (typeof TBO_SUPABASE !== 'undefined') {
        const tenantId = TBO_SUPABASE.getCurrentTenantId();
        if (tenantId) {
          TBO_SUPABASE.loadIntegrationKeys(tenantId).catch(e =>
            console.warn('[TBO OS] Integration keys load error:', e)
          );
        }
      }

      // 13b. Carregar roles de usuario do Supabase (RBAC dinamico — v2.1)
      // v2.2.1: AWAIT obrigatorio — corrige race condition onde sidebar renderizava
      // com roles defaults antes do Supabase retornar os roles reais
      if (typeof TBO_PERMISSIONS !== 'undefined' && TBO_PERMISSIONS.loadUserRolesFromSupabase) {
        try {
          await Promise.race([
            TBO_PERMISSIONS.loadUserRolesFromSupabase(),
            new Promise(resolve => setTimeout(() => {
              console.warn('[TBO OS] User roles load timeout 5s — usando defaults');
              resolve();
            }, 5000))
          ]);
        } catch (e) {
          console.warn('[TBO OS] User roles load error:', e);
        }
        // Re-render sidebar com roles corretos apos carregamento
        this._renderSidebar();
        this._bindSectionToggles();
        TBO_AUTH._applyAccess();
      }

      // Salvar hash original antes de qualquer redirect (para F5 preservar rota)
      const originalHash = window.location.hash.replace('#', '').replace(/^\//, '');

      // Verificar se precisa selecionar workspace (multi-tenant v2)
      if (typeof TBO_WORKSPACE !== 'undefined' && TBO_WORKSPACE.shouldShowSelector()) {
        await TBO_WORKSPACE.loadTenants();
        // Auto-selecionar se so tem 1 tenant (evita redirect desnecessario no F5)
        if (TBO_WORKSPACE._tenants && TBO_WORKSPACE._tenants.length === 1) {
          const tenant = TBO_WORKSPACE._tenants[0];
          TBO_WORKSPACE._currentTenant = tenant;
          try { sessionStorage.setItem('tbo_active_tenant', JSON.stringify(tenant)); } catch(e) {}
          // Restaurar hash original se tinha rota antes do F5
          if (originalHash && originalHash !== 'workspace') {
            window.location.hash = originalHash;
          }
          TBO_ROUTER.initFromHash('command-center');
        } else {
          // Multi-tenant: mostrar selector, mas guardar hash para restaurar depois
          if (originalHash) {
            try { sessionStorage.setItem('tbo_pending_hash', originalHash); } catch(e) {}
          }
          TBO_ROUTER.navigate('workspace');
        }
      } else {
        // Respeitar hash da URL (F5/deep link) ou ir para command-center
        const defaultMod = 'command-center';
        TBO_ROUTER.initFromHash(defaultMod);
      }

      // Registrar listener para mudancas de hash (navegacao por URL)
      TBO_ROUTER.listenHashChanges();

      // v2.1 Performance: APIs externas carregam APOS dashboard visivel
      // Nao bloqueia render — widgets atualizam via evento 'tbo:external-data-loaded'
      TBO_STORAGE.loadExternalAPIs();
    }

    // 14. Update freshness timestamp
    this._updateFreshness();

    // 14b. Init UX enhancements
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.initKeyboardNav();
      TBO_UX.initOfflineDetection();
      // Show tour for first-time users (after a short delay)
      if (loggedIn) TBO_UX.showTour();
    }

    // 14c. Init notifications
    if (typeof TBO_NOTIFICATIONS !== 'undefined' && loggedIn) {
      TBO_NOTIFICATIONS.init();
    }

    // ── 15. Init Enhancement Modules (com error boundary global) ─────
    const enhancementModules = [
      ['Design System', typeof TBO_DESIGN !== 'undefined' ? TBO_DESIGN : null],
      ['UX Enhancements', typeof TBO_UX_ENHANCEMENTS !== 'undefined' ? TBO_UX_ENHANCEMENTS : null],
      ['Business Intelligence', typeof TBO_BUSINESS_INTELLIGENCE !== 'undefined' ? TBO_BUSINESS_INTELLIGENCE : null],
      ['Project Enhancements', typeof TBO_PROJECT_ENHANCEMENTS !== 'undefined' ? TBO_PROJECT_ENHANCEMENTS : null],
      ['Financial Enhancements', typeof TBO_FINANCIAL_ENHANCEMENTS !== 'undefined' ? TBO_FINANCIAL_ENHANCEMENTS : null],
      ['People Enhancements', typeof TBO_PEOPLE_ENHANCEMENTS !== 'undefined' ? TBO_PEOPLE_ENHANCEMENTS : null],
      ['Analytics', typeof TBO_ANALYTICS !== 'undefined' ? TBO_ANALYTICS : null],
      ['Navigation', typeof TBO_NAVIGATION !== 'undefined' ? TBO_NAVIGATION : null],
      ['Integrations', typeof TBO_INTEGRATIONS !== 'undefined' ? TBO_INTEGRATIONS : null],
      ['Performance', typeof TBO_PERFORMANCE !== 'undefined' ? TBO_PERFORMANCE : null],
      ['UI Components', typeof TBO_UI !== 'undefined' ? TBO_UI : null],
      ['Workflow Engine', typeof TBO_WORKFLOW !== 'undefined' ? TBO_WORKFLOW : null],
      ['Realtime Engine', typeof TBO_REALTIME !== 'undefined' ? TBO_REALTIME : null],
      ['Digest Engine', typeof TBO_DIGEST !== 'undefined' ? TBO_DIGEST : null],
      ['Document Versions', typeof TBO_DOC_VERSIONS !== 'undefined' ? TBO_DOC_VERSIONS : null],
      ['Dynamic Templates', typeof TBO_DYNAMIC_TEMPLATES !== 'undefined' ? TBO_DYNAMIC_TEMPLATES : null]
    ];

    enhancementModules.forEach(([name, mod]) => {
      if (mod && mod.init) this._safeInit(name, () => mod.init());
    });

    // 16. FAB removido em v2.5.1 (solicitacao do Marco)

    // 17. Initialize Lucide icons
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

  // ══════════════════════════════════════════════════════════════════════════
  // SIDEBAR MEGA UPGRADE — busca, favoritos, recentes, visual polish,
  // performance, badges, context menu, drag&drop, mini-preview
  // ══════════════════════════════════════════════════════════════════════════

  // ── Helper XSS (C14 — seguranca) ──────────────────────────────────────
  _escHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  // ── Favoritos storage ─────────────────────────────────────────────────
  _getFavorites() {
    try { return JSON.parse(localStorage.getItem('tbo_sidebar_favorites') || '[]'); } catch { return []; }
  },
  _setFavorites(arr) {
    localStorage.setItem('tbo_sidebar_favorites', JSON.stringify(arr.slice(0, 5)));
  },
  _toggleFavorite(modKey) {
    let favs = this._getFavorites();
    if (favs.includes(modKey)) {
      favs = favs.filter(f => f !== modKey);
    } else {
      if (favs.length >= 5) { TBO_TOAST.warning('Limite', 'Máximo de 5 favoritos.'); return; }
      favs.push(modKey);
    }
    this._setFavorites(favs);
    this._renderFavorites();
    this._updatePinButtons();
  },

  // ── Recentes storage ──────────────────────────────────────────────────
  // v2.2.1: prefixado com userId para isolar recentes entre usuarios
  _getRecentsKey() {
    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    return user?.id ? `tbo_sidebar_recents_${user.id}` : 'tbo_sidebar_recents';
  },
  _getRecents() {
    try { return JSON.parse(localStorage.getItem(this._getRecentsKey()) || '[]'); } catch { return []; }
  },
  _addRecent(modKey) {
    let rec = this._getRecents().filter(r => r !== modKey);
    rec.unshift(modKey);
    localStorage.setItem(this._getRecentsKey(), JSON.stringify(rec.slice(0, 3)));
    this._renderRecents();
  },

  // ── Module usage analytics (C6 — ordenacao inteligente) ───────────────
  _trackUsage(modKey) {
    try {
      const usage = JSON.parse(localStorage.getItem('tbo_sidebar_usage') || '{}');
      usage[modKey] = (usage[modKey] || 0) + 1;
      localStorage.setItem('tbo_sidebar_usage', JSON.stringify(usage));
    } catch {}
  },

  // ── Ordem customizada das secoes (DnD) ──────────────────────────────
  _getSectionOrder() {
    try { return JSON.parse(localStorage.getItem('tbo_sidebar_section_order') || '[]'); } catch { return []; }
  },
  _setSectionOrder(order) {
    localStorage.setItem('tbo_sidebar_section_order', JSON.stringify(order));
  },
  _applySectionOrder(sections) {
    const order = this._getSectionOrder();
    if (!order.length) return sections;
    // Ordenar secoes pela posicao salva, mantendo novas no final
    const ordered = [];
    order.forEach(id => {
      const s = sections.find(sec => sec.id === id);
      if (s) ordered.push(s);
    });
    // Adicionar secoes que nao estao na ordem salva (novas)
    sections.forEach(s => {
      if (!order.includes(s.id)) ordered.push(s);
    });
    return ordered;
  },

  // ── Sidebar pin/unpin (auto-hide) ───────────────────────────────────
  _isSidebarPinned() {
    return localStorage.getItem('tbo_sidebar_pinned') !== '0';
  },
  _setSidebarPinned(pinned) {
    localStorage.setItem('tbo_sidebar_pinned', pinned ? '1' : '0');
  },

  // ── Notification badges data (F27) ────────────────────────────────────
  _badgeCounts: {},
  _badgeInterval: null,

  async _fetchBadgeCounts() {
    try {
      if (typeof TBO_SUPABASE === 'undefined') return;
      const client = TBO_SUPABASE.getClient ? TBO_SUPABASE.getClient() : null;
      if (!client) return;

      const user = TBO_AUTH.getCurrentUser();
      if (!user) return;

      // Buscar contagens relevantes em paralelo (com tenant_id — v2.1 multi-tenant)
      const tenantId = TBO_SUPABASE.getCurrentTenantId();
      const tenantFilter = (q) => tenantId ? q.eq('tenant_id', tenantId) : q;
      const [tasksRes, alertsRes, notifRes] = await Promise.allSettled([
        tenantFilter(client.from('tasks').select('id', { count: 'exact', head: true }).eq('assigned_to', user.id).eq('status', 'pendente')),
        client.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false),
        tenantFilter(client.from('crm_deals').select('id', { count: 'exact', head: true }).eq('stage', 'negociacao'))
      ]);

      const newCounts = {};
      if (tasksRes.status === 'fulfilled' && tasksRes.value.count > 0) newCounts['tarefas'] = tasksRes.value.count;
      if (alertsRes.status === 'fulfilled' && alertsRes.value.count > 0) newCounts['alerts'] = alertsRes.value.count;
      if (notifRes.status === 'fulfilled' && notifRes.value.count > 0) newCounts['pipeline'] = notifRes.value.count;

      this._badgeCounts = newCounts;
      this._renderBadges();
    } catch (e) {
      console.warn('[Sidebar] Badge fetch error:', e);
    }
  },

  _renderBadges() {
    Object.entries(this._badgeCounts).forEach(([modKey, count]) => {
      // Buscar em todas as areas (nav, favoritos, recentes)
      document.querySelectorAll(`.nav-item[data-module="${modKey}"]`).forEach(btn => {
        let badge = btn.querySelector('.nav-notification-badge');
        if (count > 0) {
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'nav-notification-badge';
            btn.appendChild(badge);
          }
          badge.textContent = count > 99 ? '99+' : count;
          if (count > 10) badge.classList.add('badge-urgent');
          else badge.classList.remove('badge-urgent');
        } else if (badge) {
          badge.remove();
        }
      });
    });
  },

  // ── Sidebar principal ─────────────────────────────────────────────────
  _bindSidebar() {
    // 1. Render sidebar dinamico
    this._renderSidebar();

    // 2. Event delegation para clicks em nav items (nav + favoritos + recentes)
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.addEventListener('click', (e) => {
        // Pin button
        const pinBtn = e.target.closest('.nav-pin-btn');
        if (pinBtn) {
          e.stopPropagation();
          const modKey = pinBtn.closest('.nav-item')?.dataset.module;
          if (modKey) this._toggleFavorite(modKey);
          return;
        }

        const btn = e.target.closest('.nav-item[data-module]');
        if (!btn) return;
        const mod = btn.dataset.module;
        if (!TBO_AUTH.canAccess(mod)) {
          const user = TBO_AUTH.getCurrentUser();
          const roleLabel = user?.roleLabel || 'seu perfil';
          TBO_TOAST.warning('Acesso restrito', `O perfil "${roleLabel}" não tem acesso a este módulo.`);
          return;
        }
        TBO_ROUTER.navigate(mod);
        this._addRecent(mod);
        this._trackUsage(mod);
        sidebar.classList.remove('mobile-open');
      });
    }

    // 3. Brand logo
    const brandLink = document.getElementById('brandLink');
    if (brandLink) {
      brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        TBO_ROUTER.navigate('command-center');
        document.getElementById('sidebar')?.classList.remove('mobile-open');
      });
    }

    // 4. Collapse toggle
    if (sidebar && localStorage.getItem('tbo_sidebar_collapsed') === '1') {
      sidebar.classList.add('collapsed');
    }
    const toggleBtn = document.getElementById('sidebarToggle');
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

    // 6. Section toggles
    this._bindSectionToggles();

    // 6b. Drag & drop para reordenar secoes
    this._bindSectionDragDrop();

    // 6c. Pin/unpin sidebar (fixo vs auto-hide)
    this._bindSidebarPin();

    // 7. Busca rapida inline
    this._bindSidebarSearch();

    // 8. Render favoritos e recentes
    this._renderFavorites();
    this._renderRecents();

    // 8b. Botao Criar (Asana-style)
    this._bindCreateButton();

    // 8c. Secao de projetos
    this._renderSidebarProjects();
    this._bindSidebarProjects();

    // 9. Scroll fade gradients (B12)
    this._bindScrollFade();

    // 10. Virtual tooltip para collapsed (C17)
    this._bindVirtualTooltip();

    // 11. Context menu (F28)
    this._bindContextMenu();

    // 12. Mini-preview (F30)
    this._bindMiniPreview();

    // 13. Keyboard navigation (acessibilidade)
    this._bindSidebarKeyboard();

    // 14. Badge counts (F27) — atualizar a cada 2min
    this._fetchBadgeCounts();
    this._badgeInterval = setInterval(() => this._fetchBadgeCounts(), 120000);
  },

  // ── Botao Criar — dropdown com acoes rapidas (Asana-style) ────────────
  _bindCreateButton() {
    const btn = document.getElementById('sidebarCreateBtn');
    const dropdown = document.getElementById('sidebarCreateDropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('visible');
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', () => dropdown.classList.remove('visible'));

    // Acoes do dropdown
    dropdown.addEventListener('click', (e) => {
      const opt = e.target.closest('.sidebar-create-option');
      if (!opt) return;
      e.stopPropagation();
      dropdown.classList.remove('visible');

      const action = opt.dataset.create;
      if (action === 'projeto') {
        TBO_ROUTER.navigate('projetos');
        // Abrir modal de criacao apos carregar modulo
        setTimeout(() => {
          const createBtn = document.querySelector('[onclick*="criarProjeto"], .btn-criar-projeto, [data-action="novo-projeto"]');
          if (createBtn) createBtn.click();
        }, 500);
      } else if (action === 'tarefa') {
        TBO_ROUTER.navigate('tarefas');
      } else if (action === 'contato') {
        TBO_ROUTER.navigate('clientes');
      } else if (action === 'deal') {
        TBO_ROUTER.navigate('pipeline');
      }
    });

    // Lucide icons no dropdown
    if (window.lucide) lucide.createIcons({ root: dropdown });
  },

  // ── Secao "Meus Projetos" na sidebar ────────────────────────────────────
  _sidebarProjectsLoaded: false,

  async _renderSidebarProjects() {
    const list = document.getElementById('sidebarProjectsList');
    if (!list) return;

    try {
      if (typeof TBO_SUPABASE === 'undefined') return;
      const client = TBO_SUPABASE.getClient ? TBO_SUPABASE.getClient() : null;
      if (!client) return;

      const user = TBO_AUTH.getCurrentUser();
      if (!user) return;

      const tenantId = typeof TBO_SUPABASE.getCurrentTenantId === 'function'
        ? TBO_SUPABASE.getCurrentTenantId() : null;

      // Buscar projetos ativos do usuario (producao = ativo no schema atual)
      let query = client
        .from('projects')
        .select('id, name, status')
        .not('status', 'eq', 'concluido')
        .order('updated_at', { ascending: false })
        .limit(8);

      if (tenantId) query = query.eq('tenant_id', tenantId);

      const { data: projects, error } = await query;

      if (error) {
        console.warn('[Sidebar Projects] Query error:', error.message);
        // Tentar fallback com ERP data
        this._renderSidebarProjectsFallback(list);
        return;
      }

      if (!projects || projects.length === 0) {
        this._renderSidebarProjectsFallback(list);
        return;
      }

      const statusColors = {
        producao: '#22c55e',
        em_andamento: '#3b82f6',
        planejamento: '#a855f7',
        pausado: '#eab308',
        concluido: '#6b7280',
        ativo: '#22c55e'
      };

      list.innerHTML = projects.map(p => {
        const color = statusColors[p.status] || '#3b82f6';
        const name = this._escHtml(p.name || 'Sem nome');
        return `<li>
          <button class="sidebar-project-item" data-project-id="${this._escHtml(p.id)}" title="${name}">
            <span class="sidebar-project-dot" style="background:${color}"></span>
            <span class="sidebar-project-name">${name}</span>
          </button>
        </li>`;
      }).join('');

      this._sidebarProjectsLoaded = true;
    } catch (e) {
      console.warn('[Sidebar Projects] Error:', e);
      this._renderSidebarProjectsFallback(list);
    }
  },

  _renderSidebarProjectsFallback(list) {
    // Tentar usar dados do ERP/Storage
    if (typeof TBO_STORAGE === 'undefined') {
      list.innerHTML = '<li class="sidebar-projects-empty">Nenhum projeto</li>';
      return;
    }

    const context = TBO_STORAGE.get('context') || {};
    const projetos = context.projetos_ativos || [];

    if (projetos.length === 0) {
      list.innerHTML = '<li class="sidebar-projects-empty">Nenhum projeto</li>';
      return;
    }

    list.innerHTML = projetos.slice(0, 8).map(p => {
      const name = this._escHtml(p.nome || p.name || 'Projeto');
      const id = p.id || '';
      return `<li>
        <button class="sidebar-project-item" data-project-id="${this._escHtml(id)}" title="${name}">
          <span class="sidebar-project-dot" style="background:#3b82f6"></span>
          <span class="sidebar-project-name">${name}</span>
        </button>
      </li>`;
    }).join('');
  },

  _bindSidebarProjects() {
    const container = document.getElementById('sidebarProjects');
    const toggleBtn = document.getElementById('sidebarProjectsToggle');
    const list = document.getElementById('sidebarProjectsList');
    if (!container || !list) return;

    // Toggle expand/collapse
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        container.classList.toggle('collapsed');
        localStorage.setItem('tbo_sidebar_projects_collapsed', container.classList.contains('collapsed') ? '1' : '0');
      });
      // Restaurar estado
      if (localStorage.getItem('tbo_sidebar_projects_collapsed') === '1') {
        container.classList.add('collapsed');
      }
    }

    // Click em projeto → navegar para project-workspace
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.sidebar-project-item');
      if (!btn) return;
      const projectId = btn.dataset.projectId;
      if (projectId) {
        TBO_ROUTER.navigate(`projeto/${projectId}/overview`);
        document.getElementById('sidebar')?.classList.remove('mobile-open');
      }
    });
  },

  // ── Dynamic Sidebar Renderer (C14 XSS safe, C18 preload states) ───────
  _renderSidebar() {
    const navEl = document.getElementById('sidebarNav');
    if (!navEl) return;

    const user = TBO_AUTH.getCurrentUser();
    // v2.2.1: passar email para garantir que super admins vejam todos os modulos
    let sections = TBO_PERMISSIONS.getSectionsForUser(user?.id, user?.email);

    // v2.6: Aplicar ordem customizada do usuario
    sections = this._applySectionOrder(sections);

    let html = '';
    sections.forEach(section => {
      const visibleModules = section.modules.filter(m => {
        const real = TBO_ROUTER._resolveAlias(m);
        return !!TBO_ROUTER._modules[real];
      });
      if (visibleModules.length === 0) return;

      const isPlaceholder = (modKey) => this._placeholderKeys.includes(modKey);

      // C18 — Preload collapsed state from localStorage (evita flash)
      const savedState = localStorage.getItem(`tbo_section_${section.id}`);
      const isCollapsed = savedState === '0';

      // C14 — XSS safe: escapar labels
      const safeLabel = this._escHtml(section.label);
      const safeIcon = this._escHtml(section.icon);

      html += `<div class="nav-section${isCollapsed ? ' collapsed' : ''}" data-section="${this._escHtml(section.id)}" draggable="true">
        <button class="nav-section-toggle" data-section-toggle="${this._escHtml(section.id)}" aria-expanded="${!isCollapsed}">
          <span class="nav-section-drag-handle" title="Arrastar para reordenar">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="19" r="2"/><circle cx="15" cy="19" r="2"/></svg>
          </span>
          <i data-lucide="${safeIcon}" class="nav-section-icon"></i>
          <span class="nav-section-label">${safeLabel}</span>
          <i data-lucide="chevron-down" class="nav-section-chevron"></i>
        </button>
        <ul class="nav-list" role="menubar"${isCollapsed ? ' style="max-height:0;opacity:0"' : ''}>
          ${visibleModules.map(modKey => {
            const label = this._escHtml(this._moduleLabels[modKey] || modKey);
            const icon = this._escHtml(this._moduleIcons[modKey] || 'file');
            const isPlc = isPlaceholder(modKey);
            return `<li>
              <button class="nav-item${isPlc ? ' nav-item--placeholder' : ''}" data-module="${this._escHtml(modKey)}" role="menuitem" title="${label}" tabindex="0">
                <i data-lucide="${icon}" class="nav-icon"></i>
                <span class="nav-label">${label}</span>
                ${isPlc ? '<span class="nav-badge-dev">Em dev</span>' : ''}
                <button class="nav-pin-btn" title="Fixar como favorito" aria-label="Fixar ${label}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </button>
              </button>
            </li>`;
          }).join('')}
        </ul>
      </div>`;
    });

    navEl.innerHTML = html;

    // C15 — Lazy Lucide: renderizar apenas no elemento sidebar (nao DOM inteiro)
    if (window.lucide) lucide.createIcons({ root: navEl });

    // Atualizar pin buttons
    this._updatePinButtons();
  },

  _updatePinButtons() {
    const favs = this._getFavorites();
    document.querySelectorAll('.nav-pin-btn').forEach(btn => {
      const modKey = btn.closest('.nav-item')?.dataset.module;
      if (modKey && favs.includes(modKey)) {
        btn.classList.add('pinned');
        btn.querySelector('svg').setAttribute('fill', 'currentColor');
      } else {
        btn.classList.remove('pinned');
        btn.querySelector('svg').setAttribute('fill', 'none');
      }
    });
  },

  // ── Favoritos render ──────────────────────────────────────────────────
  _renderFavorites() {
    const container = document.getElementById('sidebarFavorites');
    const list = document.getElementById('sidebarFavoritesList');
    if (!container || !list) return;

    const favs = this._getFavorites();
    container.setAttribute('data-count', favs.length);

    if (favs.length === 0) {
      list.innerHTML = '';
      return;
    }

    list.innerHTML = favs.map(modKey => {
      const label = this._escHtml(this._moduleLabels[modKey] || modKey);
      const icon = this._escHtml(this._moduleIcons[modKey] || 'file');
      return `<li>
        <button class="nav-item" data-module="${this._escHtml(modKey)}" role="menuitem" title="${label}">
          <i data-lucide="${icon}" class="nav-icon"></i>
          <span class="nav-label">${label}</span>
        </button>
      </li>`;
    }).join('');

    if (window.lucide) lucide.createIcons({ root: list });
  },

  // ── Recentes render ───────────────────────────────────────────────────
  _renderRecents() {
    const container = document.getElementById('sidebarRecents');
    const list = document.getElementById('sidebarRecentsList');
    if (!container || !list) return;

    const recents = this._getRecents();
    if (recents.length === 0) {
      container.style.display = 'none';
      return;
    }
    container.style.display = '';

    list.innerHTML = recents.map(modKey => {
      const label = this._escHtml(this._moduleLabels[modKey] || modKey);
      const icon = this._escHtml(this._moduleIcons[modKey] || 'file');
      return `<li>
        <button class="nav-item" data-module="${this._escHtml(modKey)}" role="menuitem" title="${label}">
          <i data-lucide="${icon}" class="nav-icon"></i>
          <span class="nav-label">${label}</span>
        </button>
      </li>`;
    }).join('');

    if (window.lucide) lucide.createIcons({ root: list });
  },

  // ── Busca rapida inline (A1) ──────────────────────────────────────────
  _bindSidebarSearch() {
    const input = document.getElementById('sidebarSearchInput');
    const clearBtn = document.getElementById('sidebarSearchClear');
    if (!input) return;

    let debounce = null;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => this._filterSidebar(input.value), 100);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        input.value = '';
        this._filterSidebar('');
        input.blur();
      } else if (e.key === 'Enter') {
        // Navegar para o primeiro item visivel
        const firstVisible = document.querySelector('#sidebarNav .nav-item:not(.search-hidden)');
        if (firstVisible) {
          firstVisible.click();
          input.value = '';
          this._filterSidebar('');
        }
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        this._filterSidebar('');
        input.focus();
      });
    }

    // Atalho "/" para focar na busca
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
        e.preventDefault();
        input.focus();
      }
    });
  },

  _filterSidebar(query) {
    const navEl = document.getElementById('sidebarNav');
    if (!navEl) return;

    const q = query.trim().toLowerCase();
    const emptyMsg = navEl.querySelector('.sidebar-search-empty');
    if (emptyMsg) emptyMsg.remove();

    if (!q) {
      // Restaurar tudo
      navEl.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('search-hidden', 'search-match');
      });
      navEl.querySelectorAll('.nav-section').forEach(sec => {
        sec.classList.remove('search-hidden');
      });
      return;
    }

    let matchCount = 0;
    navEl.querySelectorAll('.nav-section').forEach(section => {
      let sectionHasMatch = false;
      section.querySelectorAll('.nav-item').forEach(btn => {
        const label = (btn.getAttribute('title') || '').toLowerCase();
        const modKey = (btn.dataset.module || '').toLowerCase();
        const matches = label.includes(q) || modKey.includes(q);
        btn.classList.toggle('search-hidden', !matches);
        btn.classList.toggle('search-match', matches);
        if (matches) { sectionHasMatch = true; matchCount++; }
      });
      section.classList.toggle('search-hidden', !sectionHasMatch);
      // Auto-expand section que tem match
      if (sectionHasMatch && section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
      }
    });

    if (matchCount === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'sidebar-search-empty';
      emptyDiv.textContent = `Nenhum módulo para "${query}"`;
      navEl.appendChild(emptyDiv);
    }
  },

  // ── Collapsible sidebar sections (B8 — transicao suave) ──────────────
  _bindSectionToggles() {
    document.querySelectorAll('.nav-section-toggle').forEach(toggle => {
      const sectionId = toggle.dataset.sectionToggle;
      const section = toggle.closest('.nav-section');
      if (!section || !sectionId) return;

      // Estado ja aplicado no render (C18 preload)
      toggle.addEventListener('click', () => {
        const isCollapsed = section.classList.toggle('collapsed');
        toggle.setAttribute('aria-expanded', !isCollapsed);
        localStorage.setItem(`tbo_section_${sectionId}`, isCollapsed ? '0' : '1');

        // Animar max-height para transicao suave (B8)
        const list = section.querySelector('.nav-list');
        if (list) {
          if (isCollapsed) {
            list.style.maxHeight = list.scrollHeight + 'px';
            // Force reflow
            list.offsetHeight;
            list.style.maxHeight = '0';
            list.style.opacity = '0';
          } else {
            list.style.maxHeight = list.scrollHeight + 'px';
            list.style.opacity = '1';
            // Remover max-height fixo apos transicao
            setTimeout(() => { list.style.maxHeight = ''; }, 300);
          }
        }
      });

      // Keyboard: Enter/Space para toggle
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle.click();
        }
      });
    });
  },

  // ── Drag & Drop para reordenar secoes da sidebar ────────────────────
  _bindSectionDragDrop() {
    const navEl = document.getElementById('sidebarNav');
    if (!navEl) return;

    let draggedSection = null;
    let dragPlaceholder = null;

    navEl.addEventListener('dragstart', (e) => {
      const section = e.target.closest('.nav-section[draggable]');
      if (!section) return;
      // Permitir drag apenas pelo handle ou header
      const handle = e.target.closest('.nav-section-drag-handle, .nav-section-toggle');
      if (!handle) { e.preventDefault(); return; }

      draggedSection = section;
      section.classList.add('nav-section--dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', section.dataset.section);

      // Placeholder visual
      dragPlaceholder = document.createElement('div');
      dragPlaceholder.className = 'nav-section-drop-placeholder';
      dragPlaceholder.style.height = section.offsetHeight + 'px';
    });

    navEl.addEventListener('dragover', (e) => {
      if (!draggedSection) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const target = e.target.closest('.nav-section[draggable]');
      if (!target || target === draggedSection) return;

      // Determinar se soltar antes ou depois baseado na posicao Y do mouse
      const rect = target.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const insertBefore = e.clientY < midY;

      // Remover placeholder anterior
      if (dragPlaceholder.parentNode) dragPlaceholder.remove();

      if (insertBefore) {
        target.before(dragPlaceholder);
      } else {
        target.after(dragPlaceholder);
      }
    });

    navEl.addEventListener('dragend', () => {
      if (draggedSection) {
        draggedSection.classList.remove('nav-section--dragging');
        draggedSection = null;
      }
      if (dragPlaceholder?.parentNode) dragPlaceholder.remove();
      dragPlaceholder = null;
    });

    navEl.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!draggedSection || !dragPlaceholder?.parentNode) return;

      // Inserir secao na posicao do placeholder
      dragPlaceholder.replaceWith(draggedSection);
      draggedSection.classList.remove('nav-section--dragging');

      // Salvar nova ordem
      const newOrder = [...navEl.querySelectorAll('.nav-section[data-section]')]
        .map(s => s.dataset.section);
      this._setSectionOrder(newOrder);

      draggedSection = null;
      dragPlaceholder = null;

      TBO_TOAST.success('Sidebar', 'Ordem das seções atualizada');
    });
  },

  // ── Sidebar pin/unpin — auto-hide mode ──────────────────────────────
  _bindSidebarPin() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Renderizar botao de pin no footer
    const footer = sidebar.querySelector('.sidebar-footer');
    if (!footer) return;

    const pinBtn = document.createElement('button');
    pinBtn.className = 'sidebar-pin-btn';
    pinBtn.id = 'sidebarPinBtn';
    pinBtn.title = 'Fixar/soltar sidebar';
    pinBtn.setAttribute('aria-label', 'Fixar ou soltar sidebar');
    footer.insertBefore(pinBtn, footer.firstChild);

    const updatePinIcon = () => {
      const pinned = this._isSidebarPinned();
      pinBtn.innerHTML = pinned
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 2C7.58 2 4 5.58 4 10c0 3.03 1.64 5.8 4.28 7.28L12 22l3.72-4.72C18.36 15.8 20 13.03 20 10c0-4.42-3.58-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C7.58 2 4 5.58 4 10c0 3.03 1.64 5.8 4.28 7.28L12 22l3.72-4.72C18.36 15.8 20 13.03 20 10c0-4.42-3.58-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>';
      pinBtn.classList.toggle('pinned', pinned);
      sidebar.classList.toggle('sidebar-auto-hide', !pinned);
    };

    updatePinIcon();

    pinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newState = !this._isSidebarPinned();
      this._setSidebarPinned(newState);
      updatePinIcon();
      // Se fixar, garantir que a sidebar esteja aberta
      if (newState) {
        sidebar.classList.remove('collapsed');
        localStorage.setItem('tbo_sidebar_collapsed', '0');
      }
      TBO_TOAST.info('Sidebar', newState ? 'Sidebar fixada' : 'Sidebar em modo auto-hide');
    });

    // Auto-hide: esconder quando mouse sai, mostrar quando entra
    let hideTimeout = null;
    sidebar.addEventListener('mouseenter', () => {
      if (sidebar.classList.contains('sidebar-auto-hide')) {
        clearTimeout(hideTimeout);
        sidebar.classList.remove('auto-hidden');
      }
    });
    sidebar.addEventListener('mouseleave', () => {
      if (sidebar.classList.contains('sidebar-auto-hide')) {
        hideTimeout = setTimeout(() => {
          sidebar.classList.add('auto-hidden');
        }, 400);
      }
    });

    // Se ja esta em auto-hide, iniciar escondido
    if (!this._isSidebarPinned()) {
      setTimeout(() => sidebar.classList.add('auto-hidden'), 1000);
    }
  },

  // ── Scroll fade gradients (B12) ───────────────────────────────────────
  _bindScrollFade() {
    const wrapper = document.getElementById('sidebarNavWrapper');
    const nav = document.getElementById('sidebarNav');
    if (!wrapper || !nav) return;

    const update = () => {
      const st = nav.scrollTop;
      const sh = nav.scrollHeight;
      const ch = nav.clientHeight;
      wrapper.classList.toggle('can-scroll-up', st > 5);
      wrapper.classList.toggle('can-scroll-down', st + ch < sh - 5);
    };

    nav.addEventListener('scroll', update, { passive: true });
    // Check inicial apos render
    setTimeout(update, 100);
    // Re-check quando secoes expandem/colapsam
    new MutationObserver(update).observe(nav, { childList: true, subtree: true, attributes: true });
  },

  // ── Virtual tooltip (C17 — 1 DOM element reusado) ─────────────────────
  // v2.2.1: corrigido para evitar tooltip fantasma — usa mouseenter/mouseleave
  // e verifica estado collapsed antes de exibir
  _bindVirtualTooltip() {
    const tooltip = document.getElementById('sidebarTooltip');
    const sidebar = document.getElementById('sidebar');
    if (!tooltip || !sidebar) return;

    let showTimer = null;

    // Usar event delegation com mouseenter nao borbulha — usar mouseover com guard
    sidebar.addEventListener('mouseover', (e) => {
      if (!sidebar.classList.contains('collapsed')) {
        // Garantir que tooltip esta escondido quando sidebar nao esta collapsed
        clearTimeout(showTimer);
        tooltip.classList.remove('visible');
        return;
      }
      const btn = e.target.closest('.nav-item[data-module]');
      if (!btn) return;

      clearTimeout(showTimer);
      showTimer = setTimeout(() => {
        // Double-check collapsed state (pode mudar durante timeout)
        if (!sidebar.classList.contains('collapsed')) return;
        const label = btn.getAttribute('title') || '';
        if (!label) return;
        const rect = btn.getBoundingClientRect();
        tooltip.textContent = label;
        tooltip.style.left = (rect.right + 8) + 'px';
        tooltip.style.top = (rect.top + rect.height / 2) + 'px';
        tooltip.style.transform = 'translateY(-50%)';
        tooltip.classList.add('visible');
      }, 120);
    });

    sidebar.addEventListener('mouseout', (e) => {
      clearTimeout(showTimer);
      tooltip.classList.remove('visible');
    });

    // Esconder tooltip ao expandir sidebar
    const observer = new MutationObserver(() => {
      if (!sidebar.classList.contains('collapsed')) {
        clearTimeout(showTimer);
        tooltip.classList.remove('visible');
      }
    });
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
  },

  // ── Context menu (F28) ────────────────────────────────────────────────
  _bindContextMenu() {
    const menu = document.getElementById('sidebarContextMenu');
    const sidebar = document.getElementById('sidebar');
    if (!menu || !sidebar) return;

    let currentMod = null;

    sidebar.addEventListener('contextmenu', (e) => {
      const btn = e.target.closest('.nav-item[data-module]');
      if (!btn) return;
      e.preventDefault();
      currentMod = btn.dataset.module;
      const label = this._escHtml(this._moduleLabels[currentMod] || currentMod);
      const isFav = this._getFavorites().includes(currentMod);

      menu.innerHTML = `
        <button class="sidebar-context-item" data-action="open">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Abrir ${label}
        </button>
        <button class="sidebar-context-item" data-action="fav">
          <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          ${isFav ? 'Remover dos favoritos' : 'Fixar como favorito'}
        </button>
        <div class="sidebar-context-separator"></div>
        <button class="sidebar-context-item" data-action="copy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copiar link
        </button>
      `;

      const rect = btn.getBoundingClientRect();
      menu.style.left = Math.min(e.clientX, window.innerWidth - 200) + 'px';
      menu.style.top = Math.min(e.clientY, window.innerHeight - 150) + 'px';
      menu.classList.add('visible');
    });

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.sidebar-context-item');
      if (!item || !currentMod) return;
      const action = item.dataset.action;

      if (action === 'open') {
        TBO_ROUTER.navigate(currentMod);
      } else if (action === 'fav') {
        this._toggleFavorite(currentMod);
      } else if (action === 'copy') {
        const url = `${window.location.origin}${window.location.pathname}#${currentMod}`;
        navigator.clipboard.writeText(url).then(() => {
          TBO_TOAST.success('Link copiado', url);
        });
      }
      menu.classList.remove('visible');
    });

    // Fechar ao clicar fora
    document.addEventListener('click', () => menu.classList.remove('visible'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') menu.classList.remove('visible'); });
  },

  // ── Mini-preview on hover (F30) ───────────────────────────────────────
  _bindMiniPreview() {
    const preview = document.getElementById('sidebarMiniPreview');
    const sidebar = document.getElementById('sidebar');
    if (!preview || !sidebar) return;

    let hoverTimer = null;
    let currentHoverMod = null;

    // Dados de preview por modulo (KPIs mockados — em produção viria do Supabase)
    const previewData = {
      'command-center': { kpis: [{ v: '—', l: 'Projetos' }, { v: '—', l: 'Tarefas' }, { v: '—', l: 'Deals' }, { v: '—', l: 'Entregas' }] },
      'projetos': { kpis: [{ v: '—', l: 'Ativos' }, { v: '—', l: 'Atrasados' }, { v: '—', l: 'Finalizados' }, { v: '—', l: 'Este mês' }] },
      'tarefas': { kpis: [{ v: '—', l: 'Pendentes' }, { v: '—', l: 'Em andamento' }, { v: '—', l: 'Concluídas' }, { v: '—', l: 'Atrasadas' }] },
      'pipeline': { kpis: [{ v: '—', l: 'Leads' }, { v: '—', l: 'Negociação' }, { v: '—', l: 'Proposta' }, { v: '—', l: 'Fechados' }] },
      'financeiro': { kpis: [{ v: '—', l: 'Receita' }, { v: '—', l: 'Despesa' }, { v: '—', l: 'Lucro' }, { v: '—', l: 'A receber' }] },
      'rh': { kpis: [{ v: '—', l: 'Equipe' }, { v: '—', l: 'Ativos' }, { v: '—', l: 'Onboarding' }, { v: '—', l: 'BUs' }] },
    };

    sidebar.addEventListener('mouseover', (e) => {
      const btn = e.target.closest('.nav-item[data-module]');
      if (!btn || sidebar.classList.contains('collapsed')) { clearTimeout(hoverTimer); return; }

      const modKey = btn.dataset.module;
      if (modKey === currentHoverMod) return;
      currentHoverMod = modKey;

      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        const data = previewData[modKey];
        if (!data) return;

        const label = this._escHtml(this._moduleLabels[modKey] || modKey);
        const icon = this._escHtml(this._moduleIcons[modKey] || 'file');

        preview.innerHTML = `
          <div class="sidebar-mini-preview-title">
            <i data-lucide="${icon}"></i> ${label}
          </div>
          <div class="sidebar-mini-preview-kpis">
            ${data.kpis.map(k => `
              <div class="sidebar-mini-kpi">
                <div class="sidebar-mini-kpi-value">${k.v}</div>
                <div class="sidebar-mini-kpi-label">${k.l}</div>
              </div>
            `).join('')}
          </div>
        `;

        if (window.lucide) lucide.createIcons({ root: preview });

        const rect = btn.getBoundingClientRect();
        const sidebarRect = sidebar.getBoundingClientRect();
        preview.style.left = (sidebarRect.right + 8) + 'px';
        preview.style.top = Math.min(rect.top, window.innerHeight - 180) + 'px';
        preview.classList.add('visible');
      }, 600); // 600ms delay
    });

    sidebar.addEventListener('mouseout', (e) => {
      const btn = e.target.closest('.nav-item[data-module]');
      if (!btn) return;
      clearTimeout(hoverTimer);
      currentHoverMod = null;
      preview.classList.remove('visible');
    });
  },

  // ── Keyboard navigation sidebar (acessibilidade) ──────────────────────
  _bindSidebarKeyboard() {
    const navEl = document.getElementById('sidebarNav');
    if (!navEl) return;

    navEl.addEventListener('keydown', (e) => {
      const items = [...navEl.querySelectorAll('.nav-item:not(.search-hidden)')];
      const current = document.activeElement;
      const idx = items.indexOf(current);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = items[idx + 1] || items[0];
        if (next) next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = items[idx - 1] || items[items.length - 1];
        if (prev) prev.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (current && current.classList.contains('nav-item')) current.click();
      }
    });
  },

  // ── Sidebar resize com snap points (C16 — rAF throttle) ──────────────
  _SIDEBAR_SNAP_POINTS: [64, 180, 260, 340],
  _SIDEBAR_SNAP_THRESHOLD: 25,

  _bindSidebarResize() {
    const handle = document.getElementById('sidebarResizeHandle');
    const sidebar = document.getElementById('sidebar');
    if (!handle || !sidebar) return;

    let isResizing = false;
    let rafPending = false;

    // Restaurar largura salva
    const savedWidth = localStorage.getItem('tbo_sidebar_width');
    if (savedWidth) {
      const w = parseInt(savedWidth);
      if (w <= 64) {
        sidebar.classList.add('collapsed');
        sidebar.style.width = '';
      } else {
        sidebar.classList.remove('collapsed');
        sidebar.style.width = w + 'px';
        sidebar.classList.toggle('sidebar-compact', w > 64 && w < 220);
      }
    }

    // Ghost line + snap indicator
    const ghost = document.createElement('div');
    ghost.style.cssText = 'position:fixed;top:0;bottom:0;width:2px;background:var(--brand-orange);z-index:9999;pointer-events:none;display:none;opacity:0.7;';
    const snapIndicator = document.createElement('div');
    snapIndicator.style.cssText = 'position:fixed;top:50%;transform:translateY(-50%);background:var(--brand-orange);color:#fff;font-size:11px;font-weight:600;padding:4px 8px;border-radius:4px;z-index:9999;pointer-events:none;display:none;white-space:nowrap;';
    document.body.appendChild(ghost);
    document.body.appendChild(snapIndicator);

    const getSnapPoint = (x) => {
      for (const sp of this._SIDEBAR_SNAP_POINTS) {
        if (Math.abs(x - sp) < this._SIDEBAR_SNAP_THRESHOLD) return sp;
      }
      return null;
    };

    const getSnapLabel = (w) => {
      if (w <= 64) return 'Colapsado';
      if (w <= 180) return 'Compacto';
      if (w <= 260) return 'Normal';
      return 'Expandido';
    };

    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      sidebar.style.transition = 'none';
      ghost.style.display = 'block';
      e.preventDefault();
    });

    // C16 — rAF throttled mousemove
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        const rawWidth = Math.min(Math.max(e.clientX, 50), 400);
        const snapped = getSnapPoint(rawWidth);
        const finalWidth = snapped || rawWidth;

        ghost.style.left = finalWidth + 'px';
        ghost.style.background = snapped ? 'var(--brand-orange)' : 'var(--text-muted)';
        ghost.style.width = snapped ? '3px' : '2px';

        if (snapped) {
          snapIndicator.style.display = 'block';
          snapIndicator.style.left = (finalWidth + 8) + 'px';
          snapIndicator.textContent = getSnapLabel(snapped) + ' (' + snapped + 'px)';
        } else {
          snapIndicator.style.display = 'none';
        }

        if (finalWidth <= 64) {
          sidebar.classList.add('collapsed');
          sidebar.style.width = '';
          sidebar.classList.remove('sidebar-compact');
        } else {
          sidebar.classList.remove('collapsed');
          sidebar.style.width = finalWidth + 'px';
          sidebar.classList.toggle('sidebar-compact', finalWidth > 64 && finalWidth < 220);
        }
      });
    });

    document.addEventListener('mouseup', () => {
      if (!isResizing) return;
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      sidebar.style.transition = '';
      ghost.style.display = 'none';
      snapIndicator.style.display = 'none';

      const currentWidth = sidebar.offsetWidth;
      const snapped = getSnapPoint(currentWidth);
      if (snapped) {
        if (snapped <= 64) {
          sidebar.classList.add('collapsed');
          sidebar.style.width = '';
        } else {
          sidebar.style.width = snapped + 'px';
        }
      }

      const w = sidebar.classList.contains('collapsed') ? 64 : sidebar.offsetWidth;
      localStorage.setItem('tbo_sidebar_width', w);
      localStorage.setItem('tbo_sidebar_collapsed', w <= 64 ? '1' : '0');
    });

    handle.addEventListener('dblclick', () => {
      sidebar.classList.remove('collapsed', 'sidebar-compact');
      sidebar.style.width = '';
      localStorage.setItem('tbo_sidebar_width', '260');
      localStorage.setItem('tbo_sidebar_collapsed', '0');
    });
  },

  // ── Set active nav + indicador de secao ativa (B7) ────────────────────
  _setActiveNav(moduleName) {
    const resolved = TBO_ROUTER._resolveAlias(moduleName);

    // Remover section-active anterior
    document.querySelectorAll('.nav-section.section-active').forEach(s => s.classList.remove('section-active'));

    document.querySelectorAll('.nav-item').forEach(btn => {
      const btnMod = btn.dataset.module;
      const isActive = btnMod === resolved || btnMod === moduleName;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
      // Auto-expand parent section if active
      if (isActive) {
        const parentSection = btn.closest('.nav-section');
        if (parentSection) {
          // B7 — Marcar secao como ativa
          parentSection.classList.add('section-active');
          if (parentSection.classList.contains('collapsed')) {
            parentSection.classList.remove('collapsed');
            const toggle = parentSection.querySelector('.nav-section-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', 'true');
          }
        }
      }
    });

    // Atualizar badges apos nav
    this._renderBadges();

    // Atualizar projeto ativo na sidebar projects
    this._updateActiveProject();
  },

  _updateActiveProject() {
    const route = TBO_ROUTER.getCurrentRoute();
    const projectId = route ? TBO_ROUTER._parseParamRoute(route)?.params?.id : null;
    document.querySelectorAll('.sidebar-project-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.projectId === projectId);
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
          TBO_TOAST.warning('Acesso restrito', `O perfil "${roleLabel}" não tem acesso a este módulo.`);
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

    // v2.1: Handler do Sheets status badge (removido onclick inline do HTML para CSP)
    const sheetsBtn = document.getElementById('statusSheets');
    if (sheetsBtn) {
      sheetsBtn.addEventListener('click', () => {
        if (typeof TBO_SHEETS !== 'undefined' && TBO_SHEETS.forceRefresh) {
          TBO_SHEETS.forceRefresh().then(() => location.reload());
        }
      });
    }
  },

  // ── Placeholder module keys (none remaining — all modules implemented) ──
  _placeholderKeys: [],

  // ── Module labels (v3 — reorganizado) ──────────────────────────────
  _moduleLabels: {
    // Inicio
    'command-center': 'Página Inicial',
    'alerts': 'Caixa de Entrada',
    'chat': 'Chat',
    // Execucao
    'projetos': 'Projetos',
    'tarefas': 'Tarefas',
    'reunioes': 'Calendário',
    'biblioteca': 'Arquivos',
    // Producao
    'entregas': 'QA / Aprovações',
    'revisoes': 'Revisões',
    'portal-cliente': 'Portal do Cliente',
    // Pessoas
    'rh': 'Equipe',
    'admin-onboarding': 'Gestão de Onboarding',
    'trilha-aprendizagem': 'Trilha de Aprendizagem',
    'cultura': 'Manual de Cultura',
    'pessoas-avancado': 'Pessoas Avançado',
    // Financeiro
    'financeiro': 'Dashboard Financeiro',
    'pagar': 'Contas a Pagar',
    'receber': 'Contas a Receber',
    'margens': 'DRE / Margem',
    'conciliacao': 'Conciliação',
    // Fornecedores
    'contratos': 'Contratos',
    // Comercial
    'pipeline': 'Pipeline',
    'comercial': 'Propostas',
    'clientes': 'Clientes / Contas',
    'inteligencia': 'Inteligência BI',
    'inteligencia-imobiliaria': 'Intel. Imobiliária',
    'mercado': 'Inteligência de Mercado',
    // Admin
    'admin-portal': 'Admin Portal',
    'permissoes-config': 'Segurança',
    'integracoes': 'Integrações',
    'configuracoes': 'Configurações',
    'changelog': 'Changelog',
    // Outros (legacy / internos)
    'conteudo': 'Conteúdo & Redação',
    'decisoes': 'Decisões',
    'templates': 'Templates',
    'workspace': 'Workspace',
    'entregas-pendentes': 'Entregas Pendentes',
    'revisoes-pendentes': 'Revisões Pendentes'
  },

  // ── Module icons (Lucide icon names — v3) ──────────────────────────
  _moduleIcons: {
    // Inicio
    'command-center': 'layout-dashboard',
    'alerts': 'inbox',
    'chat': 'message-circle',
    // Execucao
    'projetos': 'folder-kanban',
    'tarefas': 'list-checks',
    'reunioes': 'calendar',
    'biblioteca': 'files',
    // Producao
    'entregas': 'check-circle-2',
    'revisoes': 'git-pull-request',
    'portal-cliente': 'monitor-smartphone',
    // Pessoas
    'rh': 'users',
    'admin-onboarding': 'user-plus',
    'trilha-aprendizagem': 'graduation-cap',
    'cultura': 'book-open-text',
    'pessoas-avancado': 'heart-pulse',
    // Financeiro
    'financeiro': 'coins',
    'pagar': 'credit-card',
    'receber': 'receipt',
    'margens': 'trending-up',
    'conciliacao': 'scale',
    // Fornecedores
    'contratos': 'file-signature',
    // Comercial
    'pipeline': 'filter',
    'comercial': 'file-text',
    'clientes': 'building-2',
    'inteligencia': 'brain',
    'inteligencia-imobiliaria': 'building',
    'mercado': 'bar-chart-3',
    // Admin
    'admin-portal': 'shield',
    'permissoes-config': 'lock',
    'integracoes': 'plug-zap',
    'configuracoes': 'settings',
    'changelog': 'file-clock',
    // Outros
    'conteudo': 'pen-tool',
    'decisoes': 'gavel',
    'templates': 'layout-template',
    'entregas-pendentes': 'package',
    'revisoes-pendentes': 'message-circle'
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
    // v2.5.2: sidebar user widget + version + social removidos do HTML
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
          Digite para buscar módulos, projetos, clientes...
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
        <span class="search-result-type">módulo</span>
      </div>`;
    });

    const typeIcons = {
      projeto_ativo: '\u{1F4CB}', projeto_finalizado: '\u2705',
      cliente: '\u{1F3E2}', reuniao: '\u{1F3AF}', mercado: '\u{1F4C8}'
    };
    const typeLabels = {
      projeto_ativo: 'Projeto', projeto_finalizado: 'Finalizado',
      cliente: 'Cliente', reuniao: 'Reunião', mercado: 'Mercado'
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
    TBO_SHORTCUTS.bind('Alt+k', () => this.toggleSearch(true), 'Abrir busca rápida');

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
    }, 'Fechar diálogo');
  },

  // ── FAB removido em v2.5.1 ──────────────────────────────────────────

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
