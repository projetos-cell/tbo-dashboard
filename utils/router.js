// TBO OS — Client-Side Router com suporte a rotas parametrizadas
const TBO_ROUTER = {
  _currentModule: null,
  _currentRoute: null, // Guarda rota completa (ex: "projeto/p_abc123/list")
  _modules: {},
  _onChangeCallbacks: [],

  // Route aliases: new route names → existing module keys
  _aliases: {
    'propostas': 'comercial',
    'conteudo-redacao': 'conteudo',
    'inteligencia-mercado': 'mercado',
    'reunioes-contexto': 'reunioes',
    'equipe': 'rh',
    'command-center': 'dashboard',  // Compat: rota antiga redireciona para dashboard
    'home': 'workspace'
  },

  // Rotas parametrizadas: prefixo → modulo handler
  // Formato: #people/{userId}/{tab} → modulo 'people-profile' recebe params
  _paramRoutes: {
    'people': 'people-profile',
    'page': 'page-editor',
    'projeto': 'project-detail'
  },

  _resolveAlias(name) {
    return this._aliases[name] || name;
  },

  // Register a module
  register(name, module) {
    this._modules[name] = module;
  },

  // Parseia rota parametrizada: "projeto/p_abc/list?task=xxx" → { module, params }
  _parseParamRoute(fullHash) {
    // Separar query string do hash (ex: "projeto/id/list?task=abc")
    const [pathPart, queryPart] = fullHash.split('?');
    const parts = pathPart.split('/');
    const prefix = parts[0];
    if (this._paramRoutes[prefix] && parts.length >= 2) {
      // Parse query params
      const query = {};
      if (queryPart) {
        queryPart.split('&').forEach(pair => {
          const [k, v] = pair.split('=');
          if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || '');
        });
      }
      return {
        moduleName: this._paramRoutes[prefix],
        params: {
          id: parts[1],
          tab: parts[2] || 'list', // default tab = list
          query // query params (task, subtask, etc)
        },
        fullRoute: fullHash
      };
    }
    return null;
  },

  // Navigate to a module (supports deep linking: moduleName/tabId e rotas parametrizadas)
  async navigate(fullRoute) {
    // 1. Checar se eh rota parametrizada (ex: "projeto/p_abc123/list")
    const paramRoute = this._parseParamRoute(fullRoute);
    if (paramRoute) {
      return this._navigateParam(paramRoute);
    }

    // 2. Parse deep link normal (e.g., "projetos/ativos")
    let moduleName = fullRoute;
    let tabHint = null;
    if (moduleName.includes('/')) {
      const parts = moduleName.split('/');
      moduleName = parts[0];
      tabHint = parts[1];
    }

    // Resolve aliases (e.g., "propostas" → "comercial")
    moduleName = this._resolveAlias(moduleName);

    if (moduleName === this._currentModule && !tabHint && !this._currentRoute) return;

    // Permission guard — redirect if user lacks access
    if (typeof TBO_AUTH !== 'undefined' && !TBO_AUTH.canAccess(moduleName)) {
      const user = TBO_AUTH.getCurrentUser();
      const defaultMod = user?.defaultModule || 'dashboard';
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.warning('Acesso restrito', `Voce nao tem permissao para este modulo. Redirecionando...`);
      }
      if (defaultMod !== moduleName) this.navigate(defaultMod);
      return;
    }

    const module = this._modules[moduleName];
    if (!module) {
      console.warn(`Module "${moduleName}" not registered`);
      return;
    }

    // Cleanup previous module
    if (this._currentModule && this._modules[this._currentModule]?.destroy) {
      try { this._modules[this._currentModule].destroy(); } catch (e) { console.warn(e); }
    }

    const prev = this._currentModule;
    this._currentModule = moduleName;
    this._currentRoute = null; // Limpa rota parametrizada

    // Update URL hash
    window.location.hash = tabHint ? `${moduleName}/${tabHint}` : moduleName;

    // Notify listeners
    this._onChangeCallbacks.forEach(cb => {
      try { cb(moduleName, prev); } catch (e) { console.warn(e); }
    });

    // Render module
    const container = document.getElementById('moduleContainer');
    const loading = document.getElementById('moduleLoading');
    const empty = document.getElementById('moduleEmpty');

    if (empty) empty.style.display = 'none';

    // Show skeleton instead of spinner (better perceived performance)
    if (typeof TBO_UI !== 'undefined' && container) {
      TBO_UI.showSkeleton(container, moduleName);
    } else if (typeof TBO_UX !== 'undefined' && container) {
      TBO_UX.showSkeleton(container);
    } else if (loading) {
      loading.classList.add('visible');
    }

    try {
      // Transicao de pagina: fade-out → swap → fade-in
      if (container && prev) {
        container.classList.add('page-exit');
        await new Promise(r => setTimeout(r, 180));
      }

      if (module.render) {
        const html = await module.render();
        if (container) {
          container.innerHTML = html;
          container.classList.remove('page-exit');
          container.classList.add('page-enter');
          // Force reflow para a transicao funcionar
          void container.offsetHeight;
          container.classList.remove('page-enter');
          container.classList.add('page-enter-active');
          setTimeout(() => container.classList.remove('page-enter-active'), 220);
        }
      }
      if (module.init) {
        await module.init();
      }
      // If deep link has a tab hint, try to click that tab
      if (tabHint) {
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabHint}"]`);
        if (tabBtn) tabBtn.click();
      }
      // Clear breadcrumb tab on module load (modules set their own)
      if (typeof TBO_UX !== 'undefined') TBO_UX.updateBreadcrumb(moduleName);
      // Re-initialize Lucide icons for newly rendered content
      if (window.lucide) lucide.createIcons();
    } catch (error) {
      console.error(`Error rendering module "${moduleName}":`, error);
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">\u26A0\uFE0F</div>
            <div class="empty-state-text">Erro ao carregar modulo: ${error.message}</div>
            <button class="btn btn-primary" style="margin-top:16px;" onclick="TBO_ROUTER.navigate('${moduleName}')">Tentar novamente</button>
          </div>
        `;
      }
    } finally {
      if (loading) loading.classList.remove('visible');
    }
  },

  // Navegacao parametrizada (projeto workspace)
  async _navigateParam(route) {
    const { moduleName, params, fullRoute } = route;

    // Permissao: usa modulo-pai para checar acesso (se definido)
    const prefix = fullRoute.split('/')[0];
    const permModule = this._paramPermissions?.[prefix] || null;
    if (permModule && typeof TBO_AUTH !== 'undefined' && !TBO_AUTH.canAccess(permModule)) {
      const user = TBO_AUTH.getCurrentUser();
      const defaultMod = user?.defaultModule || 'dashboard';
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.warning('Acesso restrito', 'Voce nao tem permissao para acessar este conteudo.');
      }
      this.navigate(defaultMod);
      return;
    }

    const module = this._modules[moduleName];
    if (!module) {
      console.warn(`Param module "${moduleName}" not registered`);
      return;
    }

    // Se ja estamos no mesmo projeto mas em tab diferente, troca apenas a tab
    if (this._currentModule === moduleName && this._currentRoute) {
      const prevParams = this._parseParamRoute(this._currentRoute)?.params;
      if (prevParams && prevParams.id === params.id && prevParams.tab !== params.tab) {
        this._currentRoute = fullRoute;
        window.location.hash = fullRoute;
        if (module.switchTab) {
          module.switchTab(params.tab);
        }
        return;
      }
    }

    // Cleanup previous module
    if (this._currentModule && this._modules[this._currentModule]?.destroy) {
      try { this._modules[this._currentModule].destroy(); } catch (e) { console.warn(e); }
    }

    const prev = this._currentModule;
    this._currentModule = moduleName;
    this._currentRoute = fullRoute;

    // Update URL hash
    window.location.hash = fullRoute;

    // Notify listeners (passa modulo-pai como moduleName para sidebar highlight)
    const sidebarModule = this._paramPermissions?.[prefix] || moduleName;
    this._onChangeCallbacks.forEach(cb => {
      try { cb(sidebarModule, prev); } catch (e) { console.warn(e); }
    });

    const container = document.getElementById('moduleContainer');
    const loading = document.getElementById('moduleLoading');
    const empty = document.getElementById('moduleEmpty');

    if (empty) empty.style.display = 'none';

    // Skeleton enquanto carrega
    if (container) {
      container.innerHTML = module._renderSkeleton ? module._renderSkeleton() : '<div style="padding:40px;text-align:center;"><div class="spinner"></div></div>';
    }

    try {
      if (container && prev) {
        container.classList.add('page-exit');
        await new Promise(r => setTimeout(r, 120));
      }

      // Passa params para o modulo
      if (module.setParams) module.setParams(params);

      if (module.render) {
        const html = await module.render();
        if (container) {
          container.innerHTML = html;
          container.classList.remove('page-exit');
          container.classList.add('page-enter');
          void container.offsetHeight;
          container.classList.remove('page-enter');
          container.classList.add('page-enter-active');
          setTimeout(() => container.classList.remove('page-enter-active'), 220);
        }
      }
      if (module.init) {
        await module.init();
      }
      const breadcrumbParent = this._paramPermissions?.[prefix] || moduleName;
      const breadcrumbLabel = module._breadcrumbLabel || module._personName || module._projectName || 'Página';
      if (typeof TBO_UX !== 'undefined') TBO_UX.updateBreadcrumb(breadcrumbParent, breadcrumbLabel);
      if (window.lucide) lucide.createIcons();
    } catch (error) {
      console.error(`Error rendering param module "${moduleName}":`, error);
      const fallbackRoute = this._paramPermissions?.[prefix] || 'dashboard';
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">\u26A0\uFE0F</div>
            <div class="empty-state-text">Erro ao carregar: ${error.message}</div>
            <button class="btn btn-primary" style="margin-top:16px;" onclick="TBO_ROUTER.navigate('${fallbackRoute}')">Voltar</button>
          </div>
        `;
      }
    } finally {
      if (loading) loading.classList.remove('visible');
    }
  },

  // Listen for module changes
  onChange(callback) {
    this._onChangeCallbacks.push(callback);
  },

  // Get current module name
  getCurrent() {
    return this._currentModule;
  },

  // Retorna rota completa atual (para param routes)
  getCurrentRoute() {
    return this._currentRoute;
  },

  // Initialize from URL hash (supports deep links like #projetos/ativos e #projeto/id/tab)
  initFromHash(defaultModule = 'dashboard') {
    const hash = window.location.hash.replace('#', '');
    if (!hash) {
      this.navigate(defaultModule);
      return;
    }

    // Checar rota parametrizada primeiro
    const paramRoute = this._parseParamRoute(hash);
    if (paramRoute && this._modules[paramRoute.moduleName]) {
      this.navigate(hash);
      return;
    }

    // Rota normal: resolver alias e verificar se modulo existe
    const rawName = hash.split('/')[0];
    const resolved = this._resolveAlias(rawName);

    // Verificar se o modulo esta registrado E nao e null
    if (resolved && this._modules[resolved] && this._modules[resolved] !== null) {
      this.navigate(hash);
    } else {
      console.warn(`[TBO Router] Modulo "${rawName}" (resolved: "${resolved}") nao encontrado, redirecionando para ${defaultModule}`);
      this.navigate(defaultModule);
    }
  },

  // Listen for hash changes (suporta rotas parametrizadas)
  listenHashChanges() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      // Rota parametrizada?
      const paramRoute = this._parseParamRoute(hash);
      if (paramRoute && this._modules[paramRoute.moduleName]) {
        this.navigate(hash);
        return;
      }

      // Rota normal
      const moduleName = hash.split('/')[0];
      const resolved = this._resolveAlias(moduleName);
      if (resolved && this._modules[resolved]) {
        this.navigate(hash);
      }
    });
  }
};
