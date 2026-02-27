// ============================================================================
// TBO OS — Modulo: Diretoria (v1.0 — Modular Tabs)
// Orquestrador: delega para sub-modulos em modules/diretoria/*.js
// Acesso restrito a roles Owner, Admin, Diretor
//
// Sub-modulos:
//   - modules/diretoria/tab-dashboard.js → TBO_DIRETORIA_DASHBOARD
//   - modules/diretoria/tab-people.js   → TBO_DIRETORIA_PEOPLE
//   - modules/diretoria/tab-audit.js    → TBO_DIRETORIA_AUDIT
// ============================================================================

const TBO_DIRETORIA = {
  _tab: 'dashboard',
  _loading: false,

  // ── Tab config ──────────────────────────────────────────────────────────
  _tabConfig: [
    { id: 'dashboard',  icon: 'layout-dashboard', label: 'Dashboard' },
    { id: 'people',     icon: 'bar-chart-3',      label: 'People Analytics' },
    { id: 'auditoria',  icon: 'scroll-text',      label: 'Auditoria' }
  ],

  // ── Render principal ───────────────────────────────────────────────────

  render() {
    // Role guard — apenas founder, admin, owner, diretor
    if (typeof TBO_AUTH !== 'undefined') {
      const user = TBO_AUTH.getCurrentUser();
      if (!user || !['founder', 'owner', 'admin', 'diretor', 'project_owner'].includes(user.role)) {
        return `<div class="card" style="padding:40px;text-align:center;">
          <i data-lucide="shield-alert" style="width:48px;height:48px;color:var(--color-danger);margin-bottom:12px;"></i>
          <h3 style="margin:0 0 8px;">Acesso Negado</h3>
          <p style="color:var(--text-muted);font-size:0.85rem;">Voce nao tem permissao para acessar a Diretoria.</p>
        </div>`;
      }
    }

    // Deep link: #/diretoria/people → ativa tab people
    if (typeof TBO_ROUTER !== 'undefined' && TBO_ROUTER._currentRoute) {
      const parts = TBO_ROUTER._currentRoute.split('/');
      if (parts.length > 1) {
        const tabHint = parts[1];
        const validTab = this._tabConfig.find(t => t.id === tabHint);
        if (validTab) this._tab = validTab.id;
      }
    }

    return `
      <style>${this._getStyles()}</style>
      <div class="ap-module">
        <div class="module-header" style="margin-bottom:24px;">
          <div>
            <h2 class="module-title" style="margin:0;">Diretoria</h2>
            <p style="color:var(--text-tertiary);font-size:0.82rem;margin-top:4px;">Painel executivo — pessoas, custos, auditoria e indicadores</p>
          </div>
          <div style="display:flex;gap:8px;">
            <span class="tag gold">Executivo</span>
          </div>
        </div>

        <!-- Tabs -->
        <div class="ap-tabs">
          ${this._tabConfig.map(t => `
            <button class="ap-tab-btn ${this._tab === t.id ? 'active' : ''}" data-tab="${t.id}">
              <i data-lucide="${t.icon}" style="width:14px;height:14px;"></i>
              ${t.label}
            </button>
          `).join('')}
        </div>

        <div id="dirTabContent">
          ${this._loading ? '<div style="text-align:center;padding:40px;"><div class="spinner"></div><p style="color:var(--text-muted);margin-top:12px;">Carregando...</p></div>' : this._renderTab()}
        </div>
      </div>
    `;
  },

  // ── Delegacao de render para sub-modulos ─────────────────────────────

  _renderTab() {
    this._setupSubModule();

    switch (this._tab) {
      case 'dashboard':
        return typeof TBO_DIRETORIA_DASHBOARD !== 'undefined' ? TBO_DIRETORIA_DASHBOARD.render() : this._renderFallback('Dashboard');
      case 'people':
        return typeof TBO_DIRETORIA_PEOPLE !== 'undefined' ? TBO_DIRETORIA_PEOPLE.render() : this._renderFallback('People Analytics');
      case 'auditoria':
        return typeof TBO_DIRETORIA_AUDIT !== 'undefined' ? TBO_DIRETORIA_AUDIT.render() : this._renderFallback('Auditoria');
      default: return '';
    }
  },

  _setupSubModule() {
    if (typeof TBO_DIRETORIA_DASHBOARD !== 'undefined') TBO_DIRETORIA_DASHBOARD.setup(this);
    if (typeof TBO_DIRETORIA_PEOPLE !== 'undefined') TBO_DIRETORIA_PEOPLE.setup(this);
    if (typeof TBO_DIRETORIA_AUDIT !== 'undefined') TBO_DIRETORIA_AUDIT.setup(this);
  },

  _renderFallback(tabName) {
    return `<div class="card" style="padding:40px;text-align:center;">
      <p style="color:var(--text-muted);font-size:0.85rem;">Modulo "${tabName}" nao carregado. Verifique se o script esta incluido no index.html.</p>
    </div>`;
  },

  // ── Init & Event Binding ───────────────────────────────────────────────

  async init() {
    // Tab navigation
    document.querySelectorAll('.ap-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._tab = btn.dataset.tab;
        this._rerender();
      });
    });

    // Bind tab-specific events
    this._bindTabEvents();

    // Carregar dados da tab ativa
    await this._loadTabData();
  },

  _bindTabEvents() {
    switch (this._tab) {
      case 'dashboard':
        if (typeof TBO_DIRETORIA_DASHBOARD !== 'undefined') TBO_DIRETORIA_DASHBOARD.bind();
        break;
      case 'people':
        if (typeof TBO_DIRETORIA_PEOPLE !== 'undefined') TBO_DIRETORIA_PEOPLE.bind();
        break;
      case 'auditoria':
        if (typeof TBO_DIRETORIA_AUDIT !== 'undefined') TBO_DIRETORIA_AUDIT.bind();
        break;
    }
  },

  async _loadTabData() {
    // People: garantir que TBO_PEOPLE_SHARED carregou dados
    if (this._tab === 'people' && typeof TBO_PEOPLE_SHARED !== 'undefined') {
      const team = TBO_PEOPLE_SHARED._getInternalTeam ? TBO_PEOPLE_SHARED._getInternalTeam() : [];
      if (!team.length && typeof TBO_PEOPLE_SHARED._loadTeamFromSupabase === 'function') {
        await TBO_PEOPLE_SHARED._loadTeamFromSupabase();
        this._rerender();
        return;
      }
    }

    // Auditoria: carregar logs automaticamente
    if (this._tab === 'auditoria' && typeof TBO_DIRETORIA_AUDIT !== 'undefined') {
      if (!TBO_DIRETORIA_AUDIT._logs.length) {
        await TBO_DIRETORIA_AUDIT.loadLogs();
      }
    }
  },

  // ── Rerender ──────────────────────────────────────────────────────────

  _rerender() {
    const container = document.getElementById('moduleContainer');
    if (container) {
      container.innerHTML = this.render();
      this.init();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  // ── CSS — reutiliza classes ap-* do admin portal ──────────────────────

  _getStyles() {
    return `
      .ap-module { max-width: 1200px; }

      .ap-tabs {
        display: flex; gap: 2px; margin-bottom: 20px;
        border-bottom: 2px solid var(--border-default);
        overflow-x: auto;
      }
      .ap-tab-btn {
        display: flex; align-items: center; gap: 6px;
        padding: 10px 16px; border: none; background: none;
        font-size: 0.82rem; font-weight: 500;
        color: var(--text-secondary);
        border-bottom: 2px solid transparent;
        margin-bottom: -2px; cursor: pointer;
        transition: all 0.15s; white-space: nowrap;
      }
      .ap-tab-btn:hover { color: var(--text-primary); background: var(--bg-secondary); }
      .ap-tab-btn.active { color: var(--brand-primary); border-bottom-color: var(--brand-primary); font-weight: 600; }

      .ap-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
      .ap-table thead tr { border-bottom: 2px solid var(--border-default); }
      .ap-table th { text-align: left; padding: 8px; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-muted); font-weight: 600; }
      .ap-table tbody tr { border-bottom: 1px solid var(--border-subtle); transition: background 0.1s; }
      .ap-table tbody tr:hover { background: var(--bg-secondary); }
      .ap-table td { padding: 8px; }

      .ap-filter-bar {
        display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;
      }
      .ap-filter-input {
        font-size: 0.75rem; padding: 6px 8px;
        border: 1px solid var(--border-default); border-radius: var(--radius-sm);
        background: var(--bg-primary); color: var(--text-primary);
      }
      .ap-pagination {
        display: flex; justify-content: center; align-items: center; gap: 16px;
        padding: 16px 0; margin-top: 8px;
      }

      @media (max-width: 768px) {
        .ap-filter-bar { flex-direction: column; }
      }
    `;
  }
};
