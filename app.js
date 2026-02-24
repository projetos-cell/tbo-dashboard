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
    if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.info('Initializing...');
    else console.log('[TBO OS] Initializing...');

    // 0-pre. Limpar chaves legadas do localStorage (v2.6.1 — evitar bugs de sidebar)
    localStorage.removeItem('tbo_sidebar_width');
    localStorage.removeItem('tbo_sidebar_mode');

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
      if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.info('Critical data loaded');
    } catch (e) {
      console.warn('[TBO OS] Data load error:', e);
    }

    // 2b. Load monthly lock cache
    if (typeof TBO_ERP !== 'undefined') {
      TBO_ERP.checkMonthlyLocks();
    }

    // 3. Register real modules with router
    const modules = {
      'dashboard': typeof TBO_COMMAND_CENTER !== 'undefined' ? TBO_COMMAND_CENTER : null,
      'conteudo': typeof TBO_CONTEUDO !== 'undefined' ? TBO_CONTEUDO : null,
      'comercial': typeof TBO_COMERCIAL !== 'undefined' ? TBO_COMERCIAL : null,
      'mercado': typeof TBO_MERCADO !== 'undefined' ? TBO_MERCADO : null,
      'reunioes': typeof TBO_REUNIOES !== 'undefined' ? TBO_REUNIOES : null,
      'agenda': typeof TBO_AGENDA !== 'undefined' ? TBO_AGENDA : null,
      'financeiro': typeof TBO_FINANCEIRO !== 'undefined' ? TBO_FINANCEIRO : null,
      'rh': typeof TBO_RH !== 'undefined' ? TBO_RH : null,
      'configuracoes': typeof TBO_CONFIGURACOES !== 'undefined' ? TBO_CONFIGURACOES : null,
      'changelog': typeof TBO_CHANGELOG !== 'undefined' ? TBO_CHANGELOG : null,
      // timeline removido em v2.1
      'alerts': typeof TBO_ALERTS !== 'undefined' ? TBO_ALERTS : null,
      'inbox': typeof TBO_INBOX !== 'undefined' ? TBO_INBOX : null,
      'database-notion': typeof TBO_DATABASE_NOTION !== 'undefined' ? TBO_DATABASE_NOTION : null,
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
      // 'academy': desativado — removido do boot para performance (v2.6)
      'chat': typeof TBO_CHAT !== 'undefined' ? TBO_CHAT : null,
      'inteligencia-imobiliaria': typeof TBO_INTELIGENCIA_IMOBILIARIA !== 'undefined' ? TBO_INTELIGENCIA_IMOBILIARIA : null,
      'people-profile': typeof TBO_PEOPLE_PROFILE !== 'undefined' ? TBO_PEOPLE_PROFILE : null,
      'relatorios': typeof TBO_RELATORIOS !== 'undefined' ? TBO_RELATORIOS : null,
      'rsm': typeof TBO_RSM !== 'undefined' ? TBO_RSM : null,
      'page-editor': typeof TBO_PAGE_EDITOR !== 'undefined' ? TBO_PAGE_EDITOR : null,
      'notion-embed': typeof TBO_NOTION_EMBED !== 'undefined' ? TBO_NOTION_EMBED : null,
      'system-health': typeof TBO_SYSTEM_HEALTH !== 'undefined' ? TBO_SYSTEM_HEALTH : null,
      'quadro-projetos': typeof TBO_QUADRO_PROJETOS !== 'undefined' ? TBO_QUADRO_PROJETOS : null,
      'project-detail': typeof TBO_PROJECT_DETAIL !== 'undefined' ? TBO_PROJECT_DETAIL : null
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

    // 4b. Sidebar Notion v2 (Supabase-driven) — substitui v1 se ativado
    if (typeof TBO_SIDEBAR_BRIDGE !== 'undefined') {
      try { TBO_SIDEBAR_BRIDGE.init(); } catch (e) {
        console.warn('[TBO OS] SidebarBridge v2 init falhou:', e);
      }
    } else if (typeof TBO_NAV_BRIDGE !== 'undefined') {
      // Fallback para v1 (navigation-tree hardcoded)
      try { TBO_NAV_BRIDGE.init(); } catch (e) {
        console.warn('[TBO OS] NavBridge init falhou:', e);
      }
    }

    // 5. Bind header actions
    this._bindHeader();

    // 6. Bind search
    this._bindSearch();

    // 7. Setup keyboard shortcuts
    this._setupShortcuts();

    // 8. Update status indicators
    this._updateStatus();

    // 9. Sidebar resize handle
    // Sidebar resize removido — largura fixa

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
        // Re-aplicar sidebar Notion v2 após re-render com roles corretos
        if (typeof TBO_SIDEBAR_BRIDGE !== 'undefined') {
          try { TBO_SIDEBAR_BRIDGE.init(); } catch (_e) { /* noop */ }
        } else if (typeof TBO_NAV_BRIDGE !== 'undefined') {
          try { TBO_NAV_BRIDGE.init(); } catch (_e) { /* noop */ }
        }
      }

      // Salvar hash original antes de qualquer redirect (para F5 preservar rota)
      const originalHash = window.location.hash.replace('#', '').replace(/^\//, '');

      // Verificar se precisa selecionar workspace (multi-tenant v2)
      // Auto-seleciona primeiro tenant (TBO) — sem tela intermediária
      if (typeof TBO_WORKSPACE !== 'undefined' && TBO_WORKSPACE.shouldShowSelector()) {
        await TBO_WORKSPACE.loadTenants();
        // Auto-selecionar primeiro tenant disponível (TBO como padrão)
        if (TBO_WORKSPACE._tenants && TBO_WORKSPACE._tenants.length > 0) {
          const tenant = TBO_WORKSPACE._tenants[0];
          TBO_WORKSPACE._currentTenant = tenant;
          try { sessionStorage.setItem('tbo_active_tenant', JSON.stringify(tenant)); } catch(_e) {}
          // Restaurar hash original se tinha rota antes do F5
          if (originalHash && originalHash !== 'workspace') {
            window.location.hash = originalHash;
          }
        }
        TBO_ROUTER.initFromHash('dashboard');
      } else {
        // Respeitar hash da URL (F5/deep link) ou ir para command-center
        const defaultMod = 'dashboard';
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
      ['Dynamic Templates', typeof TBO_DYNAMIC_TEMPLATES !== 'undefined' ? TBO_DYNAMIC_TEMPLATES : null],
      ['UX Improvements', typeof TBO_UX_IMPROVEMENTS !== 'undefined' ? TBO_UX_IMPROVEMENTS : null]
    ];

    enhancementModules.forEach(([name, mod]) => {
      if (mod && mod.init) this._safeInit(name, () => mod.init());
    });

    // 16. FAB removido em v2.5.1 (solicitacao do Marco)

    // 17. Initialize Lucide icons
    if (window.lucide) lucide.createIcons();

    if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.info('Ready — all modules loaded');
  },

  // ── Theme ──────────────────────────────────────────────────────────
  _initTheme() {
    const saved = localStorage.getItem('tbo_theme');
    // Light is default — only apply dark if explicitly saved
    if (saved === 'dark') {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    } else if (saved === 'system') {
      // Respeitar preferencia do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('dark-mode', prefersDark);
      document.body.classList.toggle('light-mode', !prefersDark);
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
  },

  /**
   * Aplica tema dinamicamente (chamado pelo configuracoes.js)
   * @param {'light'|'dark'|'system'} theme
   */
  setTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('dark-mode', prefersDark);
      document.body.classList.toggle('light-mode', !prefersDark);
    } else {
      // light (default)
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
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
        this._trackUsage(mod);
        sidebar.classList.remove('mobile-open');
      });
    }

    // 3. Brand logo
    const brandLink = document.getElementById('brandLink');
    if (brandLink) {
      brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        TBO_ROUTER.navigate('dashboard');
        document.getElementById('sidebar')?.classList.remove('mobile-open');
      });
    }

    // 4. Collapse toggle — restaurar estado salvo
    if (sidebar && localStorage.getItem('tbo_sidebar_collapsed') === '1') {
      sidebar.classList.add('collapsed');
    }
    // Bind do botao collapse movido para _renderSidebarFooter()

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

    // 7. Busca rapida inline
    this._bindSidebarSearch();

    // 7b. Icone de busca no modo colapsado
    this._addCollapsedSearchBtn();

    // 7c. Footer com avatar do usuario + collapse
    this._renderSidebarFooter();

    // 8. Render favoritos
    this._renderFavorites();

    // 8b. Botao Criar (Asana-style)
    this._bindCreateButton();

    // 9. Scroll fade gradients (B12)
    this._bindScrollFade();

    // 10. Virtual tooltip para collapsed (C17)
    this._bindVirtualTooltip();

    // 11. Context menu (F28)
    this._bindContextMenu();

    // 12. Keyboard navigation (acessibilidade)
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
      if (action === 'tarefa') {
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


  // ── Dynamic Sidebar Renderer (C14 XSS safe, C18 preload states) ───────
  _renderSidebar() {
    // v3.0: Guard — não sobrescrever se Notion v2 está ativo
    if (typeof TBO_SIDEBAR_BRIDGE !== 'undefined' && TBO_SIDEBAR_BRIDGE.currentStyle === 'notion-v2') {
      return;
    }
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
        <span class="nav-section-drag-handle" title="Arrastar para reordenar">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="19" r="2"/><circle cx="15" cy="19" r="2"/></svg>
        </span>
        <button class="nav-section-toggle" data-section-toggle="${this._escHtml(section.id)}" aria-expanded="${!isCollapsed}">
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

  // ── Icone de busca no modo colapsado ──────────────────────────────────
  _addCollapsedSearchBtn() {
    const searchContainer = document.getElementById('sidebarSearch');
    if (!searchContainer) return;
    const btn = document.createElement('button');
    btn.className = 'sidebar-search-collapsed-btn';
    btn.title = 'Buscar (/)';
    btn.setAttribute('aria-label', 'Abrir busca rapida');
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    btn.addEventListener('click', () => {
      const sb = document.getElementById('sidebar');
      if (sb?.classList.contains('collapsed')) {
        sb.classList.remove('collapsed');
        sb.style.width = '';
        localStorage.setItem('tbo_sidebar_collapsed', '0');
      }
      setTimeout(() => document.getElementById('sidebarSearchInput')?.focus(), 100);
    });
    searchContainer.appendChild(btn);
  },

  // ── Footer com avatar do usuario + collapse ─────────────────────────
  _renderSidebarFooter() {
    const footer = document.querySelector('.sidebar-footer');
    if (!footer) return;

    const user = TBO_AUTH?.getCurrentUser?.();
    const fullName = user?.name || user?.full_name || 'Usuario';
    const initials = fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const name = this._escHtml(fullName);
    const role = this._escHtml(user?.roleLabel || user?.role || '');

    // v2.6.1: Avatar do Google com fallback para initials
    const safeAvatarUrl = (user?.avatarUrl && /^https:\/\//i.test(user.avatarUrl)) ? user.avatarUrl : null;
    const avatarHtml = safeAvatarUrl
      ? `<img src="${safeAvatarUrl}" class="sidebar-user-avatar sidebar-user-avatar--img" alt="${name}" onerror="this.outerHTML='<div class=\\'sidebar-user-avatar\\'>${initials}</div>'">`
      : `<div class="sidebar-user-avatar">${initials}</div>`;

    footer.innerHTML = `
      <div class="sidebar-footer-user" title="${name} — ${role}">
        ${avatarHtml}
        <div class="sidebar-footer-user-info">
          <span class="sidebar-user-name">${name}</span>
          <span class="sidebar-user-role">${role}</span>
        </div>
      </div>
      <div class="sidebar-footer-actions">
        <button class="sidebar-footer-btn" id="sidebarLogout" title="Sair" aria-label="Fazer logout" style="color:var(--color-danger);">
          <i data-lucide="log-out" aria-hidden="true"></i>
        </button>
        <button class="sidebar-footer-btn" id="sidebarSettingsBtn" title="Configuracoes" aria-label="Abrir configuracoes">
          <i data-lucide="settings" aria-hidden="true"></i>
        </button>
        <button class="sidebar-collapse-btn" id="sidebarToggle" title="Recolher menu" aria-label="Recolher barra lateral">
          <i data-lucide="chevron-left" aria-hidden="true"></i>
        </button>
      </div>
    `;

    if (window.lucide) lucide.createIcons({ root: footer });

    // Bind collapse button
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const sb = document.getElementById('sidebar');
        if (sb) {
          sb.classList.toggle('collapsed');
          sb.style.width = '';
          localStorage.setItem('tbo_sidebar_collapsed', sb.classList.contains('collapsed') ? '1' : '0');
        }
      });
    }

    // Bind settings button
    const settingsBtn = document.getElementById('sidebarSettingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        if (typeof TBO_ROUTER !== 'undefined') TBO_ROUTER.navigate('configuracoes');
      });
    }

    // Bind logout button — v3.0: confirmação antes de sair
    const logoutBtn = document.getElementById('sidebarLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        if (!confirm('Deseja realmente sair do TBO OS?')) return;
        if (typeof TBO_AUTH !== 'undefined') {
          await TBO_AUTH.logout();
          TBO_AUTH._setOverlayState('login');
          // Limpar sidebar e UI
          footer.innerHTML = '';
          const sidebarNav = document.getElementById('sidebarNav');
          if (sidebarNav) sidebarNav.innerHTML = '';
          // Resetar URL para home
          window.location.hash = '';
        }
      });
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
        // v2.6.1: Nao toggle se estiver arrastando (drag and drop)
        if (this._isDragging) return;
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
  _isDragging: false,

  _bindSectionDragDrop() {
    const navEl = document.getElementById('sidebarNav');
    if (!navEl) return;

    let draggedSection = null;
    let dragPlaceholder = null;

    navEl.addEventListener('dragstart', (e) => {
      const section = e.target.closest('.nav-section[draggable]');
      if (!section) return;
      // v2.6.1: Permitir drag APENAS pelo handle (fora do button agora)
      const handle = e.target.closest('.nav-section-drag-handle');
      if (!handle) { e.preventDefault(); return; }

      this._isDragging = true;
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
      // v2.6.1: Delay para nao disparar click do toggle apos drag
      setTimeout(() => { this._isDragging = false; }, 150);
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
      if (!hash) return;

      // Guard: users without role can only see dashboard (Aguardando Ativacao screen)
      const currentUser = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      if (currentUser && !currentUser.role) {
        const target = hash.split('/')[0];
        if (target !== 'dashboard' && target !== 'configuracoes') {
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.warning('Aguardando ativacao', 'Seu perfil ainda nao foi configurado. Aguarde o administrador atribuir seu cargo.');
          }
          window.location.hash = '#dashboard';
          return;
        }
      }

      // Parametric routes (notion-embed/xxx, projeto/xxx, people/xxx, page/xxx)
      // — permission is handled inside _navigateParam, skip redundant check here
      const paramRoute = TBO_ROUTER._parseParamRoute?.(hash);
      if (paramRoute && TBO_ROUTER._modules[paramRoute.moduleName]) {
        return; // Let the router's own hashchange handler deal with it
      }

      const rawName = hash.split('/')[0];
      const resolved = TBO_ROUTER._resolveAlias(rawName);
      if (resolved && TBO_ROUTER._modules[resolved]) {
        if (!TBO_AUTH.canAccess(resolved)) {
          const user = TBO_AUTH.getCurrentUser();
          const roleLabel = user?.roleLabel || 'seu perfil';
          TBO_TOAST.warning('Acesso restrito', `O perfil "${roleLabel}" não tem acesso a este módulo.`);
          const defaultMod = user?.defaultModule || 'dashboard';
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

    // Inbox button — navigate to inbox + load badge
    const inboxBtn = document.getElementById('inboxBtn');
    if (inboxBtn) {
      inboxBtn.addEventListener('click', () => {
        if (typeof TBO_ROUTER !== 'undefined') TBO_ROUTER.navigate('inbox');
      });
    }
    // Load inbox unread count for badge
    this._loadInboxBadge();
  },

  /**
   * Carrega contagem de nao lidas e atualiza badge no header
   */
  async _loadInboxBadge() {
    try {
      if (typeof InboxRepo === 'undefined') return;
      const count = await InboxRepo.unreadCount();
      const badge = document.getElementById('inboxBadge');
      if (badge) {
        badge.textContent = count > 0 ? (count > 99 ? '99+' : count) : '';
        badge.style.display = count > 0 ? 'flex' : 'none';
      }
    } catch (e) {
      console.warn('[TBO OS] Inbox badge load error:', e);
    }
  },

  // ── Placeholder module keys (none remaining — all modules implemented) ──
  _placeholderKeys: [],

  // ── Module labels (v3 — reorganizado) ──────────────────────────────
  _moduleLabels: {
    // Inicio
    'dashboard': 'Dashboard',
    'alerts': 'Alertas',
    'inbox': 'Caixa de Entrada',
    'chat': 'Chat',
    // Execucao
    'tarefas': 'Tarefas',
    'reunioes': 'Calendário',
    'agenda': 'Agenda',
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
    'relatorios': 'Relatórios',
    'entregas-pendentes': 'Entregas Pendentes',
    'revisoes-pendentes': 'Revisões Pendentes',
    'system-health': 'System Health',
    // Módulos parametrizados / embeds
    'people-profile': 'Perfil do Colaborador',
    'page-editor': 'Página',
    'notion-embed': 'Notion',
    'database-notion': 'Database',
    'conciliacao-bancaria': 'Conciliação Bancária',
    'rsm': 'Social Media',
    'onboarding-wizard': 'Onboarding',
    'quadro-projetos': 'Quadro de Projetos',
    'project-detail': 'Projeto'
  },

  // ── Module icons (Lucide icon names — v3) ──────────────────────────
  _moduleIcons: {
    // Inicio
    'dashboard': 'layout-dashboard',
    'alerts': 'alert-triangle',
    'inbox': 'inbox',
    'chat': 'message-circle',
    // Execucao
    'tarefas': 'list-checks',
    'reunioes': 'calendar',
    'agenda': 'calendar-days',
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
    'relatorios': 'file-bar-chart',
    'entregas-pendentes': 'package',
    'revisoes-pendentes': 'message-circle',
    'system-health': 'heart-pulse',
    // Módulos parametrizados / embeds
    'people-profile': 'user',
    'page-editor': 'file-text',
    'notion-embed': 'layout-dashboard',
    'database-notion': 'database',
    'conciliacao-bancaria': 'scale',
    'rsm': 'share-2',
    'onboarding-wizard': 'user-plus',
    'quadro-projetos': 'layout-dashboard',
    'project-detail': 'folder-open'
  },

  _updateHeaderTitle(moduleName) {
    // Titulo removido do header por design — apenas breadcrumb permanece
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
            cliente: 'comercial', reuniao: 'reunioes', mercado: 'mercado'
          };
          TBO_ROUTER.navigate(typeModuleMap[item.dataset.type] || 'dashboard');
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
        sb.style.width = '';
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
