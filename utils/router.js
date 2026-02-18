// TBO OS — Simple Client-Side Router
const TBO_ROUTER = {
  _currentModule: null,
  _modules: {},
  _onChangeCallbacks: [],

  // Route aliases: new route names → existing module keys
  _aliases: {
    'propostas': 'comercial',
    'conteudo-redacao': 'conteudo',
    'inteligencia-mercado': 'mercado',
    'reunioes-contexto': 'reunioes',
    'equipe': 'rh',
    'dashboard': 'command-center'
  },

  _resolveAlias(name) {
    return this._aliases[name] || name;
  },

  // Register a module
  register(name, module) {
    this._modules[name] = module;
  },

  // Navigate to a module (supports deep linking: moduleName/tabId)
  async navigate(moduleName) {
    // Parse deep link (e.g., "projetos/ativos")
    let tabHint = null;
    if (moduleName.includes('/')) {
      const parts = moduleName.split('/');
      moduleName = parts[0];
      tabHint = parts[1];
    }

    // Resolve aliases (e.g., "propostas" → "comercial")
    moduleName = this._resolveAlias(moduleName);

    if (moduleName === this._currentModule && !tabHint) return;

    // Permission guard — redirect if user lacks access
    if (typeof TBO_AUTH !== 'undefined' && !TBO_AUTH.canAccess(moduleName)) {
      const user = TBO_AUTH.getCurrentUser();
      const defaultMod = user?.defaultModule || 'command-center';
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
    if (typeof TBO_UX !== 'undefined' && container) {
      TBO_UX.showSkeleton(container);
    } else if (loading) {
      loading.classList.add('visible');
    }

    try {
      if (module.render) {
        const html = await module.render();
        if (container) container.innerHTML = html;
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

  // Listen for module changes
  onChange(callback) {
    this._onChangeCallbacks.push(callback);
  },

  // Get current module name
  getCurrent() {
    return this._currentModule;
  },

  // Initialize from URL hash (supports deep links like #projetos/ativos)
  initFromHash(defaultModule = 'command-center') {
    const hash = window.location.hash.replace('#', '');
    const rawName = hash.split('/')[0];
    const resolved = this._resolveAlias(rawName);
    const target = resolved && this._modules[resolved] ? hash : defaultModule;
    this.navigate(target);
  },

  // Listen for hash changes
  listenHashChanges() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && this._modules[hash]) {
        this.navigate(hash);
      }
    });
  }
};
