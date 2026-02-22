// ============================================================================
// TBO OS — Module: Projetos (Notion -> Supabase)
// Lista projetos e demandas importados do Notion.
// Supabase e a fonte unica da verdade (dados via migration 028).
// ============================================================================

const TBO_PROJETOS_NOTION = {
  _state: {
    projects: [],
    demands: [],
    allDemands: [],
    selectedProjectId: null,
    filters: { status: '', search: '' },
    demandFilters: { status: '', search: '' },
    loading: false,
    syncing: false,
    view: 'list', // 'list' | 'detail'
    kpi: { activeProjects: 0, pendingDemands: 0, completedDemands: 0, hoursMonth: 0 },

    // Advanced filter state
    advancedFilters: {
      status: '',
      responsible: '',
      priority: '',
      bu: '',
      prazoFrom: '',
      prazoTo: '',
      feito: '',
      projectId: '',
      search: '',
      tipoMidia: ''
    },
    filterOptions: { statuses: [], responsaveis: [], priorities: [], bus: [], mediaTypes: [], projectsList: [] },
    showAdvancedFilters: false,
    groupByProject: true,
    userBU: '',
    showAllBUs: false,
    collapsedGroups: {}
  },

  // ── Lifecycle ──────────────────────────────────────────────────────────

  render() {
    this._state.view = 'list';
    this._state.selectedProjectId = null;
    this._restoreFilters();
    this._loadProjects();
    this._loadKpiData();
    this._loadFilterOptions();
    this._loadDemandsGrouped();

    return `
      <div class="projetos-notion-module">
        <div id="projetos-notion-header" class="pn-header">
          <div class="pn-header-left">
            <h2 class="pn-title" id="pn-page-title">Projetos</h2>
            <span class="pn-count" id="pn-count"></span>
          </div>
          <div class="pn-header-right">
            <button id="pn-sync-btn" class="btn btn-sm btn-outline" title="Sincronizar com Notion">
              <i data-lucide="refresh-cw" style="width:14px;height:14px"></i>
              Sync Notion
            </button>
          </div>
        </div>
        <div id="pn-kpi-area" class="pn-kpi-area">
          <div class="grid-4">
            <div class="kpi-card kpi-card--blue">
              <div class="kpi-label">Projetos Ativos</div>
              <div class="kpi-value" id="pn-kpi-active">&mdash;</div>
              <div class="kpi-change neutral" id="pn-kpi-active-sub">carregando...</div>
            </div>
            <div class="kpi-card kpi-card--warning">
              <div class="kpi-label">Demandas Pendentes</div>
              <div class="kpi-value" id="pn-kpi-pending">&mdash;</div>
              <div class="kpi-change neutral" id="pn-kpi-pending-sub">carregando...</div>
            </div>
            <div class="kpi-card kpi-card--success">
              <div class="kpi-label">Demandas Concluidas</div>
              <div class="kpi-value" id="pn-kpi-completed">&mdash;</div>
              <div class="kpi-change neutral" id="pn-kpi-completed-sub">carregando...</div>
            </div>
            <div class="kpi-card kpi-card--gold">
              <div class="kpi-label">Horas Registradas</div>
              <div class="kpi-value" id="pn-kpi-hours">&mdash;</div>
              <div class="kpi-change neutral" id="pn-kpi-hours-sub">carregando...</div>
            </div>
          </div>
        </div>
        ${this._renderFilterBar()}
        <div id="pn-content" class="pn-content">
          <div class="pn-loading">
            <div class="skeleton-block" style="height:40px;margin-bottom:8px"></div>
            <div class="skeleton-block" style="height:40px;margin-bottom:8px"></div>
            <div class="skeleton-block" style="height:40px;margin-bottom:8px"></div>
            <div class="skeleton-block" style="height:40px;margin-bottom:8px"></div>
            <div class="skeleton-block" style="height:40px;margin-bottom:8px"></div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    // Detect user BU and role
    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    this._state.userBU = user?.bu || '';
    const isSuperUser = ['founder', 'admin', 'owner', 'coordinator'].includes(user?.role);

    // Restore or set default BU behavior
    const savedAllBUs = sessionStorage.getItem('pn_showAllBUs');
    if (savedAllBUs !== null) {
      this._state.showAllBUs = savedAllBUs === 'true';
    } else {
      this._state.showAllBUs = isSuperUser;
    }

    // Non-super users always filter by their BU
    if (!isSuperUser && this._state.userBU && !this._state.advancedFilters.bu) {
      this._state.advancedFilters.bu = this._state.userBU;
    }

    // ── Filter bar event bindings ──
    this._bindFilterEvents(isSuperUser);

    // Sync button
    const syncBtn = document.getElementById('pn-sync-btn');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => this._syncNotion());
    }

    // Delegated click handlers for content area
    const content = document.getElementById('pn-content');
    if (content) {
      content.addEventListener('click', (e) => {
        // Project row click
        const row = e.target.closest('[data-project-id]');
        if (row && this._state.view === 'list' && !this._state.groupByProject) {
          this._openProject(row.dataset.projectId);
          return;
        }

        // Back button
        const back = e.target.closest('#pn-back-btn');
        if (back) {
          this._backToList();
          return;
        }

        // Group header toggle
        const groupHeader = e.target.closest('.pn-group-header');
        if (groupHeader) {
          const groupId = groupHeader.dataset.groupId;
          if (groupId) {
            this._toggleGroup(groupId);
          }
          return;
        }
      });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // ── Filter Bar Rendering ────────────────────────────────────────────────

  _renderFilterBar() {
    const af = this._state.advancedFilters;
    const showAdvanced = this._state.showAdvancedFilters;

    return `
      <div id="pn-filter-bar" style="
        background: var(--bg-card, #fff);
        border: 1px solid var(--border-default, #ddd);
        border-radius: var(--radius-md, 8px);
        padding: 12px 16px;
        margin-bottom: 16px;
      ">
        <!-- Top filter row -->
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
          <!-- Search -->
          <div style="position:relative;flex:1;min-width:180px;max-width:320px;">
            <i data-lucide="search" style="width:14px;height:14px;position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted,#999);pointer-events:none;"></i>
            <input type="text" id="pn-filter-search" placeholder="Buscar demanda..."
              value="${this._escHtml(af.search)}"
              style="
                width:100%;
                padding:7px 10px 7px 32px;
                border:1px solid var(--border-default,#ddd);
                border-radius:var(--radius-sm,6px);
                background:var(--bg-input,#f5f5f5);
                color:var(--text-primary,#111);
                font-size:0.82rem;
                outline:none;
                transition:border-color 0.15s;
              " />
          </div>

          <!-- Status dropdown -->
          <select id="pn-filter-status" class="pn-select" style="
            padding:7px 10px;
            border:1px solid var(--border-default,#ddd);
            border-radius:var(--radius-sm,6px);
            background:var(--bg-input,#f5f5f5);
            color:var(--text-primary,#111);
            font-size:0.82rem;
            min-width:140px;
          ">
            <option value="">Todos os status</option>
          </select>

          <!-- BU dropdown -->
          <select id="pn-filter-bu" class="pn-select" style="
            padding:7px 10px;
            border:1px solid var(--border-default,#ddd);
            border-radius:var(--radius-sm,6px);
            background:var(--bg-input,#f5f5f5);
            color:var(--text-primary,#111);
            font-size:0.82rem;
            min-width:130px;
          ">
            <option value="">Todas as BUs</option>
          </select>

          <!-- Responsavel dropdown -->
          <select id="pn-filter-responsible" class="pn-select" style="
            padding:7px 10px;
            border:1px solid var(--border-default,#ddd);
            border-radius:var(--radius-sm,6px);
            background:var(--bg-input,#f5f5f5);
            color:var(--text-primary,#111);
            font-size:0.82rem;
            min-width:150px;
          ">
            <option value="">Todos responsaveis</option>
          </select>

          <!-- Advanced filters toggle -->
          <button id="pn-toggle-advanced" class="btn btn-sm btn-ghost" style="
            display:inline-flex;align-items:center;gap:4px;font-size:0.82rem;white-space:nowrap;
          ">
            <i data-lucide="sliders-horizontal" style="width:14px;height:14px"></i>
            <span>${showAdvanced ? 'Menos filtros' : 'Filtros avancados'}</span>
            <i data-lucide="${showAdvanced ? 'chevron-up' : 'chevron-down'}" style="width:12px;height:12px"></i>
          </button>

          <!-- Ver todas BUs toggle (admin only, rendered but hidden for non-admins) -->
          <label id="pn-all-bus-toggle" style="
            display:none;
            align-items:center;gap:4px;font-size:0.78rem;
            color:var(--text-secondary,#666);cursor:pointer;white-space:nowrap;
          ">
            <input type="checkbox" id="pn-show-all-bus" ${this._state.showAllBUs ? 'checked' : ''} style="accent-color:var(--brand-orange,#E85102);" />
            Ver todas BUs
          </label>
        </div>

        <!-- Advanced filter panel (collapsible) -->
        <div id="pn-advanced-panel" style="
          display:${showAdvanced ? 'flex' : 'none'};
          flex-wrap:wrap;gap:8px;align-items:flex-end;
          margin-top:12px;padding-top:12px;
          border-top:1px solid var(--border-default,#ddd);
        ">
          <!-- Prioridade -->
          <div style="display:flex;flex-direction:column;gap:3px;min-width:130px;">
            <label style="font-size:0.72rem;color:var(--text-muted,#999);font-weight:500;">Prioridade</label>
            <select id="pn-filter-priority" class="pn-select" style="
              padding:6px 8px;border:1px solid var(--border-default,#ddd);
              border-radius:var(--radius-sm,6px);background:var(--bg-input,#f5f5f5);
              color:var(--text-primary,#111);font-size:0.8rem;
            ">
              <option value="">Todas</option>
            </select>
          </div>

          <!-- Tipo Midia -->
          <div style="display:flex;flex-direction:column;gap:3px;min-width:140px;">
            <label style="font-size:0.72rem;color:var(--text-muted,#999);font-weight:500;">Tipo Midia</label>
            <select id="pn-filter-tipomidia" class="pn-select" style="
              padding:6px 8px;border:1px solid var(--border-default,#ddd);
              border-radius:var(--radius-sm,6px);background:var(--bg-input,#f5f5f5);
              color:var(--text-primary,#111);font-size:0.8rem;
            ">
              <option value="">Todos</option>
            </select>
          </div>

          <!-- Prazo De -->
          <div style="display:flex;flex-direction:column;gap:3px;min-width:130px;">
            <label style="font-size:0.72rem;color:var(--text-muted,#999);font-weight:500;">Prazo de</label>
            <input type="date" id="pn-filter-prazo-from" value="${this._escHtml(af.prazoFrom)}" style="
              padding:6px 8px;border:1px solid var(--border-default,#ddd);
              border-radius:var(--radius-sm,6px);background:var(--bg-input,#f5f5f5);
              color:var(--text-primary,#111);font-size:0.8rem;
            " />
          </div>

          <!-- Prazo Ate -->
          <div style="display:flex;flex-direction:column;gap:3px;min-width:130px;">
            <label style="font-size:0.72rem;color:var(--text-muted,#999);font-weight:500;">Prazo ate</label>
            <input type="date" id="pn-filter-prazo-to" value="${this._escHtml(af.prazoTo)}" style="
              padding:6px 8px;border:1px solid var(--border-default,#ddd);
              border-radius:var(--radius-sm,6px);background:var(--bg-input,#f5f5f5);
              color:var(--text-primary,#111);font-size:0.8rem;
            " />
          </div>

          <!-- Feito -->
          <div style="display:flex;flex-direction:column;gap:3px;min-width:100px;">
            <label style="font-size:0.72rem;color:var(--text-muted,#999);font-weight:500;">Feito</label>
            <select id="pn-filter-feito" class="pn-select" style="
              padding:6px 8px;border:1px solid var(--border-default,#ddd);
              border-radius:var(--radius-sm,6px);background:var(--bg-input,#f5f5f5);
              color:var(--text-primary,#111);font-size:0.8rem;
            ">
              <option value="" ${af.feito === '' ? 'selected' : ''}>Todos</option>
              <option value="true" ${af.feito === 'true' ? 'selected' : ''}>Sim</option>
              <option value="false" ${af.feito === 'false' ? 'selected' : ''}>Nao</option>
            </select>
          </div>

          <!-- Projeto vinculado -->
          <div style="display:flex;flex-direction:column;gap:3px;min-width:180px;flex:1;max-width:280px;">
            <label style="font-size:0.72rem;color:var(--text-muted,#999);font-weight:500;">Projeto vinculado</label>
            <select id="pn-filter-project" class="pn-select" style="
              padding:6px 8px;border:1px solid var(--border-default,#ddd);
              border-radius:var(--radius-sm,6px);background:var(--bg-input,#f5f5f5);
              color:var(--text-primary,#111);font-size:0.8rem;
            ">
              <option value="">Todos os projetos</option>
            </select>
          </div>

          <!-- Limpar filtros -->
          <button id="pn-clear-filters" class="btn btn-sm btn-ghost" style="
            display:inline-flex;align-items:center;gap:4px;font-size:0.8rem;
            color:var(--color-danger,#e74c3c);white-space:nowrap;
          ">
            <i data-lucide="x-circle" style="width:14px;height:14px"></i>
            Limpar filtros
          </button>
        </div>

        <!-- Active filter tags -->
        <div id="pn-active-filters" style="display:none;flex-wrap:wrap;gap:6px;margin-top:8px;"></div>
      </div>
    `;
  },

  // ── Filter Event Bindings ───────────────────────────────────────────────

  _bindFilterEvents(isSuperUser) {
    // Show "Ver todas BUs" for super users
    const allBusToggle = document.getElementById('pn-all-bus-toggle');
    if (allBusToggle && isSuperUser) {
      allBusToggle.style.display = 'inline-flex';
    }

    // Search input with debounce
    const searchInput = document.getElementById('pn-filter-search');
    if (searchInput) {
      let debounce = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          this._state.advancedFilters.search = e.target.value;
          this._applyFilters();
        }, 300);
      });
    }

    // Status filter
    const statusFilter = document.getElementById('pn-filter-status');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this._state.advancedFilters.status = e.target.value;
        this._applyFilters();
      });
    }

    // BU filter
    const buFilter = document.getElementById('pn-filter-bu');
    if (buFilter) {
      buFilter.addEventListener('change', (e) => {
        this._state.advancedFilters.bu = e.target.value;
        this._applyFilters();
      });
    }

    // Responsible filter
    const respFilter = document.getElementById('pn-filter-responsible');
    if (respFilter) {
      respFilter.addEventListener('change', (e) => {
        this._state.advancedFilters.responsible = e.target.value;
        this._applyFilters();
      });
    }

    // Toggle advanced panel
    const toggleBtn = document.getElementById('pn-toggle-advanced');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this._state.showAdvancedFilters = !this._state.showAdvancedFilters;
        const panel = document.getElementById('pn-advanced-panel');
        if (panel) {
          panel.style.display = this._state.showAdvancedFilters ? 'flex' : 'none';
        }
        // Update button text and icon
        const spanEl = toggleBtn.querySelector('span');
        if (spanEl) spanEl.textContent = this._state.showAdvancedFilters ? 'Menos filtros' : 'Filtros avancados';
        // Re-render icons for chevron change
        toggleBtn.querySelectorAll('[data-lucide]').forEach((icon, i) => {
          if (i === 1) {
            icon.setAttribute('data-lucide', this._state.showAdvancedFilters ? 'chevron-up' : 'chevron-down');
          }
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
    }

    // Show all BUs checkbox
    const showAllBusCheckbox = document.getElementById('pn-show-all-bus');
    if (showAllBusCheckbox) {
      showAllBusCheckbox.addEventListener('change', (e) => {
        this._state.showAllBUs = e.target.checked;
        this._applyFilters();
      });
    }

    // Advanced filters
    const priorityFilter = document.getElementById('pn-filter-priority');
    if (priorityFilter) {
      priorityFilter.addEventListener('change', (e) => {
        this._state.advancedFilters.priority = e.target.value;
        this._applyFilters();
      });
    }

    const tipoMidiaFilter = document.getElementById('pn-filter-tipomidia');
    if (tipoMidiaFilter) {
      tipoMidiaFilter.addEventListener('change', (e) => {
        this._state.advancedFilters.tipoMidia = e.target.value;
        this._applyFilters();
      });
    }

    const prazoFromInput = document.getElementById('pn-filter-prazo-from');
    if (prazoFromInput) {
      prazoFromInput.addEventListener('change', (e) => {
        this._state.advancedFilters.prazoFrom = e.target.value;
        this._applyFilters();
      });
    }

    const prazoToInput = document.getElementById('pn-filter-prazo-to');
    if (prazoToInput) {
      prazoToInput.addEventListener('change', (e) => {
        this._state.advancedFilters.prazoTo = e.target.value;
        this._applyFilters();
      });
    }

    const feitoFilter = document.getElementById('pn-filter-feito');
    if (feitoFilter) {
      feitoFilter.addEventListener('change', (e) => {
        this._state.advancedFilters.feito = e.target.value;
        this._applyFilters();
      });
    }

    const projectFilter = document.getElementById('pn-filter-project');
    if (projectFilter) {
      projectFilter.addEventListener('change', (e) => {
        this._state.advancedFilters.projectId = e.target.value;
        this._applyFilters();
      });
    }

    // Clear filters button
    const clearBtn = document.getElementById('pn-clear-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this._clearFilters();
      });
    }
  },

  // ── Filter Persistence ──────────────────────────────────────────────────

  _saveFilters() {
    try {
      sessionStorage.setItem('pn_filters', JSON.stringify(this._state.advancedFilters));
      sessionStorage.setItem('pn_showAllBUs', String(this._state.showAllBUs));
    } catch (e) { /* ignore storage errors */ }
  },

  _restoreFilters() {
    try {
      const saved = sessionStorage.getItem('pn_filters');
      if (saved) {
        const parsed = JSON.parse(saved);
        this._state.advancedFilters = { ...this._state.advancedFilters, ...parsed };
      }
      const allBUs = sessionStorage.getItem('pn_showAllBUs');
      if (allBUs !== null) this._state.showAllBUs = allBUs === 'true';
    } catch (e) { /* ignore parse errors */ }
  },

  // ── Load Filter Options ─────────────────────────────────────────────────

  async _loadFilterOptions() {
    try {
      const opts = await DemandsRepo.getFilterOptions();
      this._state.filterOptions.statuses = opts.statuses || [];
      this._state.filterOptions.responsaveis = opts.responsaveis || [];
      this._state.filterOptions.priorities = opts.priorities || [];
      this._state.filterOptions.bus = opts.bus || [];

      // Load media types (not in getFilterOptions, fetch from all demands)
      await this._loadMediaTypes();

      // Load projects list for the project dropdown
      await this._loadProjectsList();

      this._updateFilterDropdowns();
    } catch (e) {
      console.warn('[ProjetosNotion] Erro carregando opcoes de filtro:', e);
    }
  },

  async _loadMediaTypes() {
    try {
      // Use allDemands if already loaded, otherwise do a lightweight query
      let demands = this._state.allDemands;
      if (!demands || demands.length === 0) {
        const result = await DemandsRepo.list({ limit: 1000 });
        demands = (result.data || result) || [];
      }
      const mediaTypes = new Set();
      demands.forEach(d => {
        (d.media_type || []).forEach(mt => { if (mt) mediaTypes.add(mt); });
      });
      this._state.filterOptions.mediaTypes = [...mediaTypes].sort();
    } catch (e) {
      console.warn('[ProjetosNotion] Erro carregando tipos de midia:', e);
    }
  },

  async _loadProjectsList() {
    try {
      const result = await ProjectsRepo.listNotion({ limit: 500 });
      this._state.filterOptions.projectsList = (result.data || []).map(p => ({ id: p.id, name: p.name }));
    } catch (e) {
      console.warn('[ProjetosNotion] Erro carregando lista de projetos:', e);
    }
  },

  _updateFilterDropdowns() {
    const af = this._state.advancedFilters;
    const opts = this._state.filterOptions;

    // Status dropdown
    const statusSelect = document.getElementById('pn-filter-status');
    if (statusSelect) {
      const current = af.status;
      statusSelect.innerHTML = '<option value="">Todos os status</option>' +
        opts.statuses.map(s => `<option value="${this._escHtml(s)}" ${current === s ? 'selected' : ''}>${this._escHtml(s)}</option>`).join('');
    }

    // BU dropdown
    const buSelect = document.getElementById('pn-filter-bu');
    if (buSelect) {
      const current = af.bu;
      buSelect.innerHTML = '<option value="">Todas as BUs</option>' +
        opts.bus.map(b => `<option value="${this._escHtml(b)}" ${current === b ? 'selected' : ''}>${this._escHtml(b)}</option>`).join('');
    }

    // Responsible dropdown
    const respSelect = document.getElementById('pn-filter-responsible');
    if (respSelect) {
      const current = af.responsible;
      respSelect.innerHTML = '<option value="">Todos responsaveis</option>' +
        opts.responsaveis.map(r => `<option value="${this._escHtml(r)}" ${current === r ? 'selected' : ''}>${this._escHtml(r)}</option>`).join('');
    }

    // Priority dropdown
    const prioSelect = document.getElementById('pn-filter-priority');
    if (prioSelect) {
      const current = af.priority;
      prioSelect.innerHTML = '<option value="">Todas</option>' +
        opts.priorities.map(p => `<option value="${this._escHtml(p)}" ${current === p ? 'selected' : ''}>${this._escHtml(p)}</option>`).join('');
    }

    // Tipo Midia dropdown
    const tmSelect = document.getElementById('pn-filter-tipomidia');
    if (tmSelect) {
      const current = af.tipoMidia;
      tmSelect.innerHTML = '<option value="">Todos</option>' +
        opts.mediaTypes.map(m => `<option value="${this._escHtml(m)}" ${current === m ? 'selected' : ''}>${this._escHtml(m)}</option>`).join('');
    }

    // Project dropdown
    const projSelect = document.getElementById('pn-filter-project');
    if (projSelect) {
      const current = af.projectId;
      projSelect.innerHTML = '<option value="">Todos os projetos</option>' +
        opts.projectsList.map(p => `<option value="${p.id}" ${current === p.id ? 'selected' : ''}>${this._escHtml(p.name)}</option>`).join('');
    }

    // Update active filter tags
    this._renderActiveFilterTags();
  },

  _renderActiveFilterTags() {
    const container = document.getElementById('pn-active-filters');
    if (!container) return;

    const af = this._state.advancedFilters;
    const tags = [];

    if (af.status) tags.push({ key: 'status', label: 'Status: ' + af.status });
    if (af.bu) tags.push({ key: 'bu', label: 'BU: ' + af.bu });
    if (af.responsible) tags.push({ key: 'responsible', label: 'Resp: ' + af.responsible });
    if (af.priority) tags.push({ key: 'priority', label: 'Prioridade: ' + af.priority });
    if (af.tipoMidia) tags.push({ key: 'tipoMidia', label: 'Midia: ' + af.tipoMidia });
    if (af.prazoFrom) tags.push({ key: 'prazoFrom', label: 'De: ' + this._formatDate(af.prazoFrom) });
    if (af.prazoTo) tags.push({ key: 'prazoTo', label: 'Ate: ' + this._formatDate(af.prazoTo) });
    if (af.feito === 'true') tags.push({ key: 'feito', label: 'Feito: Sim' });
    if (af.feito === 'false') tags.push({ key: 'feito', label: 'Feito: Nao' });
    if (af.projectId) {
      const proj = this._state.filterOptions.projectsList.find(p => p.id === af.projectId);
      tags.push({ key: 'projectId', label: 'Projeto: ' + (proj ? proj.name : af.projectId) });
    }
    if (af.search) tags.push({ key: 'search', label: 'Busca: ' + af.search });

    if (tags.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    container.innerHTML = tags.map(t => `
      <span class="pn-filter-tag" data-filter-key="${t.key}" style="
        display:inline-flex;align-items:center;gap:4px;
        padding:3px 8px 3px 10px;
        background:var(--accent-gold-dim,rgba(232,81,2,0.1));
        color:var(--brand-orange-dark,#BE4202);
        border-radius:var(--radius-full,9999px);
        font-size:0.72rem;font-weight:500;cursor:pointer;
        transition:background 0.15s;
      ">
        ${this._escHtml(t.label)}
        <i data-lucide="x" style="width:12px;height:12px;"></i>
      </span>
    `).join('');

    // Bind remove tag clicks
    container.querySelectorAll('.pn-filter-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const key = tag.dataset.filterKey;
        if (key) {
          this._state.advancedFilters[key] = '';
          this._syncFilterUI(key, '');
          this._applyFilters();
        }
      });
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  _syncFilterUI(key, value) {
    const inputMap = {
      status: 'pn-filter-status',
      bu: 'pn-filter-bu',
      responsible: 'pn-filter-responsible',
      priority: 'pn-filter-priority',
      tipoMidia: 'pn-filter-tipomidia',
      prazoFrom: 'pn-filter-prazo-from',
      prazoTo: 'pn-filter-prazo-to',
      feito: 'pn-filter-feito',
      projectId: 'pn-filter-project',
      search: 'pn-filter-search'
    };
    const elId = inputMap[key];
    if (elId) {
      const el = document.getElementById(elId);
      if (el) el.value = value;
    }
  },

  _clearFilters() {
    this._state.advancedFilters = {
      status: '', responsible: '', priority: '', bu: '', prazoFrom: '', prazoTo: '',
      feito: '', projectId: '', search: '', tipoMidia: ''
    };

    // Re-apply BU restriction for non-super users
    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const isSuperUser = ['founder', 'admin', 'owner', 'coordinator'].includes(user?.role);
    if (!isSuperUser && this._state.userBU) {
      this._state.advancedFilters.bu = this._state.userBU;
    }

    // Reset all UI elements
    Object.keys(this._state.advancedFilters).forEach(key => {
      this._syncFilterUI(key, this._state.advancedFilters[key]);
    });

    this._applyFilters();
  },

  // ── Data Loading ───────────────────────────────────────────────────────

  async _loadProjects() {
    this._state.loading = true;
    try {
      const result = await ProjectsRepo.listNotion({ limit: 200 });
      this._state.projects = result.data || [];
    } catch (err) {
      console.error('[ProjetosNotion] Erro ao carregar projetos:', err);
    } finally {
      this._state.loading = false;
    }
  },

  async _loadDemandsGrouped() {
    try {
      const result = await DemandsRepo.listFiltered({ ...this._buildFilterPayload(), limit: 1000 });
      this._state.allDemands = result.data || [];
      this._renderGroupedDemands();
    } catch (err) {
      console.error('[ProjetosNotion] Erro ao carregar demandas agrupadas:', err);
      this._renderGroupedDemands();
    }
  },

  async _loadKpiData() {
    try {
      // 1) Projects: count active (em_andamento + producao) vs total
      const projResult = await ProjectsRepo.listNotion({ limit: 500 });
      const allProjects = projResult.data || [];
      const activeStatuses = ['em_andamento', 'producao'];
      const activeProjects = allProjects.filter(p => activeStatuses.includes(p.status));
      const totalProjects = allProjects.length;

      // 2) Demands: count pending vs completed
      const demResult = await DemandsRepo.list({ limit: 1000 });
      const allDemands = (demResult.data || demResult) || [];
      const completedStatuses = ['Concluido', 'Aprovado'];
      const pendingStatuses = ['Briefing', 'Desenvolvimento', 'Revisao Interna', 'Cronograma', 'Apresentacao'];
      const completedDemands = allDemands.filter(d => completedStatuses.includes(d.status));
      const pendingDemands = allDemands.filter(d => pendingStatuses.includes(d.status));
      const totalDemands = allDemands.length;

      // 3) Hours: from TBO_WORKLOAD (current month)
      let hoursMonth = 0;
      let hoursLabel = 'este mes';
      if (typeof TBO_WORKLOAD !== 'undefined') {
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;
        const entries = TBO_WORKLOAD.getTimeEntries({ dateFrom: monthStart, dateTo: monthEnd });
        hoursMonth = entries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
      }

      // Update state
      this._state.kpi = { activeProjects: activeProjects.length, pendingDemands: pendingDemands.length, completedDemands: completedDemands.length, hoursMonth };

      // Update DOM
      const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

      setEl('pn-kpi-active', activeProjects.length);
      setEl('pn-kpi-active-sub', `${totalProjects} projetos no total`);

      setEl('pn-kpi-pending', pendingDemands.length);
      setEl('pn-kpi-pending-sub', `${totalDemands} demandas no total`);

      setEl('pn-kpi-completed', completedDemands.length);
      const pctCompleted = totalDemands > 0 ? Math.round(completedDemands.length / totalDemands * 100) : 0;
      setEl('pn-kpi-completed-sub', `${pctCompleted}% do total`);
      const completedSubEl = document.getElementById('pn-kpi-completed-sub');
      if (completedSubEl) {
        completedSubEl.className = `kpi-change ${pctCompleted >= 50 ? 'positive' : 'neutral'}`;
      }

      if (typeof TBO_WORKLOAD !== 'undefined' && hoursMonth > 0) {
        setEl('pn-kpi-hours', TBO_WORKLOAD.formatHoursMinutes(hoursMonth));
      } else {
        setEl('pn-kpi-hours', `${Math.round(hoursMonth / 60)}h`);
      }
      setEl('pn-kpi-hours-sub', hoursLabel);

    } catch (err) {
      console.error('[ProjetosNotion] Erro ao carregar KPIs:', err);
      // Silently fail — KPIs show "—" if data unavailable
    }
  },

  async _loadDemands(projectId) {
    try {
      const data = await DemandsRepo.listByProject(projectId, { limit: 500 });
      this._state.demands = data || [];
      this._renderDemandsList();
    } catch (err) {
      console.error('[ProjetosNotion] Erro ao carregar demandas:', err);
      this._showError('Erro ao carregar demandas.');
    }
  },

  // ── Apply Filters ───────────────────────────────────────────────────────

  _buildFilterPayload() {
    const af = this._state.advancedFilters;
    const filters = {};

    if (af.status) filters.status = af.status;
    if (af.responsible) filters.responsible = af.responsible;
    if (af.priority) filters.priority = af.priority;
    if (af.prazoFrom) filters.prazoFrom = af.prazoFrom;
    if (af.prazoTo) filters.prazoTo = af.prazoTo;
    if (af.projectId) filters.projectId = af.projectId;
    if (af.search) filters.search = af.search;
    filters.parentOnly = true;

    // BU logic: if not showAllBUs and user has a BU, use it
    if (af.bu) {
      filters.bu = af.bu;
    } else if (!this._state.showAllBUs && this._state.userBU) {
      filters.bu = this._state.userBU;
    }

    // Feito filter
    if (af.feito === 'true') filters.feito = true;
    else if (af.feito === 'false') filters.feito = false;

    return filters;
  },

  async _applyFilters() {
    this._saveFilters();
    this._renderActiveFilterTags();
    this._state.loading = true;
    const content = document.getElementById('pn-content');
    if (content) content.innerHTML = '<div class="module-loading-inline" style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner" style="width:32px;height:32px;border:3px solid var(--border-default,#ddd);border-top-color:var(--brand-orange,#E85102);border-radius:50%;animation:spin 0.8s linear infinite;"></div></div>';

    try {
      const filters = this._buildFilterPayload();
      const result = await DemandsRepo.listFiltered({ ...filters, limit: 1000 });
      let demands = result.data || [];

      // Client-side filter for tipoMidia (media_type column, not in DemandsRepo.listFiltered)
      if (this._state.advancedFilters.tipoMidia) {
        const tm = this._state.advancedFilters.tipoMidia;
        demands = demands.filter(d => (d.media_type || []).includes(tm));
      }

      this._state.allDemands = demands;
      this._renderGroupedDemands();
    } catch (err) {
      console.error('[ProjetosNotion] Filter error:', err);
      this._showError('Erro ao filtrar demandas.');
    } finally {
      this._state.loading = false;
    }
  },

  // ── Sync ───────────────────────────────────────────────────────────────

  async _syncNotion() {
    if (this._state.syncing) return;
    this._state.syncing = true;

    const btn = document.getElementById('pn-sync-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" style="width:14px;height:14px" class="spin"></i> Sincronizando...';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    try {
      const db = typeof TBO_DB !== 'undefined' && TBO_DB.isReady() ? TBO_DB : null;
      const client = db ? db : (typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null);
      if (!client) throw new Error('Supabase nao disponivel');

      const supabaseClient = client.getClient ? client.getClient() : client;
      const { data, error } = await supabaseClient.functions.invoke('notion-sync-projects-demands');

      if (error) throw error;

      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success(`Sync concluido: ${data.projects_synced} projetos, ${data.demands_synced} demandas`);
      }

      // Reload all data
      await this._loadProjects();
      await this._loadFilterOptions();
      await this._applyFilters();
      this._loadKpiData();

      if (this._state.selectedProjectId) {
        await this._loadDemands(this._state.selectedProjectId);
      }
    } catch (err) {
      console.error('[ProjetosNotion] Erro no sync:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro ao sincronizar: ' + err.message);
      }
    } finally {
      this._state.syncing = false;
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="refresh-cw" style="width:14px;height:14px"></i> Sync Notion';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  },

  // ── Navigation ─────────────────────────────────────────────────────────

  _openProject(projectId) {
    this._state.selectedProjectId = projectId;
    this._state.view = 'detail';
    this._state.demandFilters = { status: '', search: '' };

    const project = this._state.projects.find(p => p.id === projectId);
    const title = document.getElementById('pn-page-title');
    if (title && project) {
      title.innerHTML = `
        <button id="pn-back-btn" class="pn-back-btn" title="Voltar">
          <i data-lucide="arrow-left" style="width:18px;height:18px"></i>
        </button>
        ${this._escHtml(project.name)}
      `;
    }

    // Hide filter bar in detail view
    const filterBar = document.getElementById('pn-filter-bar');
    if (filterBar) filterBar.style.display = 'none';

    this._loadDemands(projectId);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  _backToList() {
    this._state.view = 'list';
    this._state.selectedProjectId = null;
    this._state.demandFilters = { status: '', search: '' };

    const title = document.getElementById('pn-page-title');
    if (title) title.textContent = 'Projetos';

    // Show filter bar again
    const filterBar = document.getElementById('pn-filter-bar');
    if (filterBar) filterBar.style.display = '';

    // Re-render grouped demands
    this._applyFilters();
  },

  // ── Toggle Group Collapse ──────────────────────────────────────────────

  _toggleGroup(groupId) {
    this._state.collapsedGroups[groupId] = !this._state.collapsedGroups[groupId];

    const header = document.querySelector(`.pn-group-header[data-group-id="${groupId}"]`);
    const body = document.getElementById('pn-group-body-' + groupId);

    if (header) {
      const icon = header.querySelector('[data-lucide]');
      if (icon) {
        icon.setAttribute('data-lucide', this._state.collapsedGroups[groupId] ? 'chevron-right' : 'chevron-down');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
    if (body) {
      body.style.display = this._state.collapsedGroups[groupId] ? 'none' : '';
    }
  },

  // ── Render: Grouped Demands (main list view) ───────────────────────────

  _renderGroupedDemands() {
    const container = document.getElementById('pn-content');
    if (!container) return;

    const demands = this._state.allDemands;

    // Update count
    const countEl = document.getElementById('pn-count');
    if (countEl) countEl.textContent = `${demands.length} demanda${demands.length !== 1 ? 's' : ''}`;

    if (demands.length === 0) {
      container.innerHTML = `
        <div class="pn-empty" style="
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:48px 24px;color:var(--text-muted,#999);
        ">
          <i data-lucide="list-checks" style="width:48px;height:48px;color:var(--text-muted,#999);margin-bottom:12px;"></i>
          <p style="font-size:0.95rem;margin:0 0 4px;">Nenhuma demanda encontrada</p>
          <p style="font-size:0.8rem;margin:0;">Ajuste os filtros ou clique em "Sync Notion" para importar dados.</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    // Group demands by project
    const groups = {};
    const noProject = [];

    demands.forEach(d => {
      const proj = d.project;
      if (proj && proj.id) {
        if (!groups[proj.id]) {
          groups[proj.id] = {
            projectId: proj.id,
            projectName: proj.name || 'Sem nome',
            projectStatus: proj.status || '',
            projectBus: proj.bus || [],
            construtora: proj.construtora || '',
            demands: []
          };
        }
        groups[proj.id].demands.push(d);
      } else {
        noProject.push(d);
      }
    });

    // Sort groups alphabetically by project name
    const sortedGroups = Object.values(groups).sort((a, b) =>
      (a.projectName || '').localeCompare(b.projectName || '', 'pt-BR')
    );

    let html = '';

    sortedGroups.forEach(group => {
      const collapsed = this._state.collapsedGroups[group.projectId] || false;
      const chevron = collapsed ? 'chevron-right' : 'chevron-down';
      const statusBadge = this._statusBadge(group.projectStatus);
      const busHTML = group.projectBus.map(b => `<span class="pn-bu-tag pn-bu-${this._buColor(b)}" style="
        display:inline-block;padding:1px 6px;border-radius:var(--radius-full,9999px);
        font-size:0.68rem;font-weight:500;
      ">${this._escHtml(b)}</span>`).join(' ');

      html += `
        <div style="margin-bottom:4px;">
          <div class="pn-group-header" data-group-id="${group.projectId}" style="
            display:flex;align-items:center;gap:10px;
            padding:10px 14px;
            background:var(--bg-card,#fff);
            border:1px solid var(--border-default,#ddd);
            border-radius:var(--radius-md,8px);
            cursor:pointer;
            transition:background 0.15s;
          " onmouseover="this.style.background='var(--bg-card-hover,#f8f8f8)'" onmouseout="this.style.background='var(--bg-card,#fff)'">
            <i data-lucide="${chevron}" style="width:16px;height:16px;color:var(--text-muted,#999);flex-shrink:0;"></i>
            <span style="font-weight:600;font-size:0.88rem;color:var(--text-primary,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._escHtml(group.projectName)}</span>
            ${group.construtora ? `<span style="font-size:0.75rem;color:var(--text-secondary,#666);">${this._escHtml(group.construtora)}</span>` : ''}
            <span style="
              display:inline-flex;align-items:center;gap:2px;
              padding:2px 8px;border-radius:var(--radius-full,9999px);
              background:var(--accent-gold-dim,rgba(232,81,2,0.1));
              color:var(--brand-orange-dark,#BE4202);
              font-size:0.72rem;font-weight:600;white-space:nowrap;
            ">${group.demands.length} demanda${group.demands.length !== 1 ? 's' : ''}</span>
            ${statusBadge}
            <div style="margin-left:auto;display:flex;gap:4px;">${busHTML}</div>
          </div>
          <div id="pn-group-body-${group.projectId}" style="display:${collapsed ? 'none' : ''};">
            ${this._renderDemandRows(group.demands)}
          </div>
        </div>
      `;
    });

    // Demands without project
    if (noProject.length > 0) {
      const groupId = '__no_project__';
      const collapsed = this._state.collapsedGroups[groupId] || false;
      const chevron = collapsed ? 'chevron-right' : 'chevron-down';

      html += `
        <div style="margin-bottom:4px;">
          <div class="pn-group-header" data-group-id="${groupId}" style="
            display:flex;align-items:center;gap:10px;
            padding:10px 14px;
            background:var(--bg-card,#fff);
            border:1px solid var(--border-default,#ddd);
            border-radius:var(--radius-md,8px);
            cursor:pointer;
            transition:background 0.15s;
          " onmouseover="this.style.background='var(--bg-card-hover,#f8f8f8)'" onmouseout="this.style.background='var(--bg-card,#fff)'">
            <i data-lucide="${chevron}" style="width:16px;height:16px;color:var(--text-muted,#999);flex-shrink:0;"></i>
            <span style="font-weight:600;font-size:0.88rem;color:var(--text-secondary,#666);font-style:italic;">Sem projeto vinculado</span>
            <span style="
              display:inline-flex;align-items:center;gap:2px;
              padding:2px 8px;border-radius:var(--radius-full,9999px);
              background:var(--bg-tertiary,#eee);
              color:var(--text-secondary,#666);
              font-size:0.72rem;font-weight:600;white-space:nowrap;
            ">${noProject.length} demanda${noProject.length !== 1 ? 's' : ''}</span>
          </div>
          <div id="pn-group-body-${groupId}" style="display:${collapsed ? 'none' : ''};">
            ${this._renderDemandRows(noProject)}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  _renderDemandRows(demands) {
    if (!demands || demands.length === 0) return '';

    const rows = demands.map(d => {
      const statusBadge = this._demandStatusBadge(d.status);
      const prazo = d.due_date ? this._formatDate(d.due_date) : '<span style="color:var(--text-muted,#999);">&mdash;</span>';
      const prazoClass = this._getPrazoClass(d.due_date, d.status);
      const busHTML = (d.bus || []).map(b => `<span class="pn-bu-tag pn-bu-${this._buColor(b)}" style="
        display:inline-block;padding:1px 6px;border-radius:var(--radius-full,9999px);
        font-size:0.68rem;font-weight:500;
      ">${this._escHtml(b)}</span>`).join(' ');
      const priorityHTML = d.priority ? `<span style="
        display:inline-block;padding:1px 6px;border-radius:var(--radius-full,9999px);
        font-size:0.68rem;font-weight:500;
        background:var(--color-purple-dim,rgba(139,92,246,0.15));color:var(--color-purple,#8b5cf6);
      ">${this._escHtml(d.priority)}</span>` : '';

      const feitoIcon = d.feito
        ? '<i data-lucide="check-circle-2" style="width:14px;height:14px;color:var(--color-success,#2ecc71);flex-shrink:0;"></i>'
        : '';

      const prazoStyle = prazoClass === 'pn-prazo-overdue'
        ? 'color:var(--color-danger,#e74c3c);font-weight:600;'
        : prazoClass === 'pn-prazo-soon'
          ? 'color:var(--color-warning,#f39c12);font-weight:500;'
          : 'color:var(--text-secondary,#666);';

      return `
        <div style="
          display:grid;
          grid-template-columns:minmax(200px,2fr) 120px 90px 130px minmax(80px,1fr) auto;
          gap:8px;
          align-items:center;
          padding:8px 14px 8px 40px;
          border-bottom:1px solid var(--border-default,#ddd);
          font-size:0.82rem;
          transition:background 0.1s;
        " onmouseover="this.style.background='var(--bg-card-hover,#f8f8f8)'" onmouseout="this.style.background='transparent'">
          <div style="display:flex;align-items:center;gap:6px;overflow:hidden;">
            ${feitoIcon}
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-primary,#111);">${this._escHtml(d.title)}</span>
          </div>
          <div>${statusBadge}</div>
          <div style="${prazoStyle}font-size:0.78rem;">${prazo}</div>
          <div style="color:var(--text-secondary,#666);font-size:0.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${this._escHtml(d.responsible || '\u2014')}</div>
          <div style="display:flex;gap:3px;flex-wrap:wrap;">${busHTML || '<span style="color:var(--text-muted,#999);">\u2014</span>'}</div>
          <div>${priorityHTML}</div>
        </div>
      `;
    }).join('');

    return `
      <div style="
        margin-left:16px;
        border:1px solid var(--border-default,#ddd);
        border-top:none;
        border-radius:0 0 var(--radius-md,8px) var(--radius-md,8px);
        overflow:hidden;
        background:var(--bg-card,#fff);
      ">
        <!-- Column headers -->
        <div style="
          display:grid;
          grid-template-columns:minmax(200px,2fr) 120px 90px 130px minmax(80px,1fr) auto;
          gap:8px;
          padding:6px 14px 6px 40px;
          font-size:0.72rem;
          font-weight:600;
          color:var(--text-muted,#999);
          text-transform:uppercase;
          letter-spacing:0.03em;
          border-bottom:1px solid var(--border-default,#ddd);
          background:var(--bg-tertiary,#f5f5f5);
        ">
          <div>Demanda</div>
          <div>Status</div>
          <div>Prazo</div>
          <div>Responsavel</div>
          <div>BU</div>
          <div>Prioridade</div>
        </div>
        ${rows}
      </div>
    `;
  },

  // ── Render: Projects List (legacy, used when clicking project from grouped view) ──

  _renderProjectsList() {
    const container = document.getElementById('pn-content');
    if (!container) return;

    let projects = [...this._state.projects];

    // Apply filters
    if (this._state.filters.status) {
      projects = projects.filter(p => p.status === this._state.filters.status);
    }
    if (this._state.filters.search) {
      const q = this._state.filters.search.toLowerCase();
      projects = projects.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.construtora?.toLowerCase().includes(q)
      );
    }

    const countEl = document.getElementById('pn-count');
    if (countEl) countEl.textContent = `${projects.length} projeto${projects.length !== 1 ? 's' : ''}`;

    if (projects.length === 0) {
      container.innerHTML = `
        <div class="pn-empty" style="
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:48px 24px;color:var(--text-muted,#999);
        ">
          <i data-lucide="folder-open" style="width:48px;height:48px;color:var(--text-muted,#999)"></i>
          <p>Nenhum projeto encontrado</p>
          <p style="font-size:0.8rem;">Clique em "Sync Notion" para importar projetos do Notion.</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    const rows = projects.map(p => {
      const statusBadge = this._statusBadge(p.status);
      const prazo = this._formatDateRange(p.due_date_start, p.due_date_end);
      const busHTML = (p.bus || []).map(b => `<span class="pn-bu-tag pn-bu-${this._buColor(b)}">${this._escHtml(b)}</span>`).join('');

      return `
        <tr class="pn-row" data-project-id="${p.id}">
          <td class="pn-cell-name">
            <span class="pn-project-name">${this._escHtml(p.name)}</span>
            ${p.construtora ? `<span class="pn-construtora">${this._escHtml(p.construtora)}</span>` : ''}
          </td>
          <td class="pn-cell-status">${statusBadge}</td>
          <td class="pn-cell-prazo">${prazo}</td>
          <td class="pn-cell-bus">${busHTML || '<span class="pn-empty-cell">\u2014</span>'}</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <table class="pn-table">
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Status</th>
            <th>Prazo</th>
            <th>BUs</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // ── Render: Demands List (detail view for a single project) ────────────

  _renderDemandsList() {
    const container = document.getElementById('pn-content');
    if (!container) return;

    const project = this._state.projects.find(p => p.id === this._state.selectedProjectId);
    let demands = [...this._state.demands];

    // Separate parent demands and subitems
    const parentDemands = demands.filter(d => !d.parent_demand_id);
    const subitems = demands.filter(d => d.parent_demand_id);
    const subitemsByParent = {};
    subitems.forEach(s => {
      if (!subitemsByParent[s.parent_demand_id]) subitemsByParent[s.parent_demand_id] = [];
      subitemsByParent[s.parent_demand_id].push(s);
    });

    // Apply filters to parent demands
    let filtered = parentDemands;
    if (this._state.demandFilters.status) {
      filtered = filtered.filter(d => d.status === this._state.demandFilters.status);
    }
    if (this._state.demandFilters.search) {
      const q = this._state.demandFilters.search.toLowerCase();
      filtered = filtered.filter(d =>
        d.title?.toLowerCase().includes(q) ||
        d.responsible?.toLowerCase().includes(q)
      );
    }

    const countEl = document.getElementById('pn-count');
    if (countEl) countEl.textContent = `${demands.length} demanda${demands.length !== 1 ? 's' : ''}`;

    // Project summary header
    const summaryHTML = project ? `
      <div style="
        display:flex;flex-wrap:wrap;gap:16px;align-items:center;
        padding:14px 16px;margin-bottom:16px;
        background:var(--bg-card,#fff);
        border:1px solid var(--border-default,#ddd);
        border-radius:var(--radius-md,8px);
      ">
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-size:0.72rem;color:var(--text-muted,#999);font-weight:500;">Construtora</span>
          <span style="font-size:0.85rem;color:var(--text-primary,#111);">${this._escHtml(project.construtora || '\u2014')}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-size:0.72rem;color:var(--text-muted,#999);font-weight:500;">Status</span>
          <span>${this._statusBadge(project.status)}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-size:0.72rem;color:var(--text-muted,#999);font-weight:500;">Prazo</span>
          <span style="font-size:0.85rem;color:var(--text-primary,#111);">${this._formatDateRange(project.due_date_start, project.due_date_end)}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-size:0.72rem;color:var(--text-muted,#999);font-weight:500;">BUs</span>
          <span>${(project.bus || []).map(b => `<span class="pn-bu-tag pn-bu-${this._buColor(b)}" style="display:inline-block;padding:1px 6px;border-radius:var(--radius-full,9999px);font-size:0.68rem;font-weight:500;">${this._escHtml(b)}</span>`).join(' ') || '\u2014'}</span>
        </div>
        ${project.notion_url ? `<a href="${this._escHtml(project.notion_url)}" target="_blank" rel="noopener" style="
          display:inline-flex;align-items:center;gap:4px;
          font-size:0.78rem;color:var(--text-link,#BE4202);text-decoration:none;margin-left:auto;
        "><i data-lucide="external-link" style="width:12px;height:12px"></i> Ver no Notion</a>` : ''}
      </div>
    ` : '';

    // Inline search for detail view
    const detailSearchHTML = `
      <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center;">
        <div style="position:relative;flex:1;max-width:300px;">
          <i data-lucide="search" style="width:14px;height:14px;position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted,#999);pointer-events:none;"></i>
          <input type="text" id="pn-detail-search" placeholder="Buscar demanda..."
            value="${this._escHtml(this._state.demandFilters.search)}"
            style="
              width:100%;padding:7px 10px 7px 32px;
              border:1px solid var(--border-default,#ddd);
              border-radius:var(--radius-sm,6px);
              background:var(--bg-input,#f5f5f5);
              color:var(--text-primary,#111);
              font-size:0.82rem;outline:none;
            " />
        </div>
        <select id="pn-detail-status" style="
          padding:7px 10px;border:1px solid var(--border-default,#ddd);
          border-radius:var(--radius-sm,6px);background:var(--bg-input,#f5f5f5);
          color:var(--text-primary,#111);font-size:0.82rem;
        ">
          <option value="">Todos os status</option>
          <option value="Cronograma">Cronograma</option>
          <option value="Briefing">Briefing</option>
          <option value="Pausado">Pausado</option>
          <option value="Desenvolvimento">Desenvolvimento</option>
          <option value="Revisao Interna">Revisao Interna</option>
          <option value="Aprovado">Aprovado</option>
          <option value="Apresentacao">Apresentacao</option>
          <option value="Concluido">Concluido</option>
        </select>
      </div>
    `;

    if (filtered.length === 0 && subitems.length === 0) {
      container.innerHTML = summaryHTML + detailSearchHTML + `
        <div class="pn-empty" style="
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:48px 24px;color:var(--text-muted,#999);margin-top:16px;
        ">
          <i data-lucide="list-checks" style="width:48px;height:48px;color:var(--text-muted,#999)"></i>
          <p>Nenhuma demanda encontrada</p>
        </div>
      `;
      this._bindDetailFilters();
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    const rows = filtered.map(d => {
      const subs = subitemsByParent[d.id] || [];
      const statusBadge = this._demandStatusBadge(d.status);
      const prazo = d.due_date ? this._formatDate(d.due_date) : '<span style="color:var(--text-muted,#999);">\u2014</span>';
      const prazoClass = this._getPrazoClass(d.due_date, d.status);
      const busHTML = (d.bus || []).map(b => `<span class="pn-bu-tag pn-bu-${this._buColor(b)}">${this._escHtml(b)}</span>`).join('');

      let subHTML = '';
      if (subs.length > 0) {
        subHTML = subs.map(s => `
          <tr class="pn-row pn-subitem-row">
            <td class="pn-cell-name pn-subitem-indent">
              <i data-lucide="corner-down-right" style="width:12px;height:12px;color:var(--text-muted,#999);flex-shrink:0"></i>
              <span>${this._escHtml(s.title)}</span>
            </td>
            <td class="pn-cell-status">${this._demandStatusBadge(s.status)}</td>
            <td class="pn-cell-prazo ${this._getPrazoClass(s.due_date, s.status)}">${s.due_date ? this._formatDate(s.due_date) : '<span style="color:var(--text-muted,#999);">\u2014</span>'}</td>
            <td class="pn-cell-resp">${this._escHtml(s.responsible || '\u2014')}</td>
            <td class="pn-cell-bus">${(s.bus || []).map(b => `<span class="pn-bu-tag pn-bu-${this._buColor(b)}">${this._escHtml(b)}</span>`).join('') || '<span style="color:var(--text-muted,#999);">\u2014</span>'}</td>
          </tr>
        `).join('');
      }

      return `
        <tr class="pn-row">
          <td class="pn-cell-name">
            <span>${this._escHtml(d.title)}</span>
            ${subs.length > 0 ? `<span class="pn-subcount">${subs.length} sub</span>` : ''}
          </td>
          <td class="pn-cell-status">${statusBadge}</td>
          <td class="pn-cell-prazo ${prazoClass}">${prazo}</td>
          <td class="pn-cell-resp">${this._escHtml(d.responsible || '\u2014')}</td>
          <td class="pn-cell-bus">${busHTML || '<span style="color:var(--text-muted,#999);">\u2014</span>'}</td>
        </tr>
        ${subHTML}
      `;
    }).join('');

    container.innerHTML = summaryHTML + detailSearchHTML + `
      <table class="pn-table pn-demands-table">
        <thead>
          <tr>
            <th>Demanda</th>
            <th>Status</th>
            <th>Prazo</th>
            <th>Responsavel</th>
            <th>BUs</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    this._bindDetailFilters();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  _bindDetailFilters() {
    const searchInput = document.getElementById('pn-detail-search');
    if (searchInput) {
      let debounce = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          this._state.demandFilters.search = e.target.value;
          this._renderDemandsList();
        }, 300);
      });
    }

    const statusFilter = document.getElementById('pn-detail-status');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this._state.demandFilters.status = e.target.value;
        this._renderDemandsList();
      });
    }
  },

  // ── Helpers ────────────────────────────────────────────────────────────

  _statusBadge(status) {
    const map = {
      'parado': { label: 'Parado', color: 'var(--text-muted, #999)', bg: 'var(--bg-tertiary, #f5f5f5)' },
      'em_andamento': { label: 'Em Andamento', color: '#3b82f6', bg: '#eff6ff' },
      'producao': { label: 'Producao', color: '#8b5cf6', bg: '#f5f3ff' },
      'pausado': { label: 'Pausado', color: '#f59e0b', bg: '#fefce8' },
      'finalizado': { label: 'Concluido', color: '#22c55e', bg: '#f0fdf4' },
    };
    const s = map[status] || { label: status || '\u2014', color: 'var(--text-muted, #999)', bg: 'var(--bg-tertiary, #f5f5f5)' };
    return `<span style="
      display:inline-block;padding:2px 8px;border-radius:var(--radius-full,9999px);
      font-size:0.72rem;font-weight:600;color:${s.color};background:${s.bg};
      white-space:nowrap;
    ">${s.label}</span>`;
  },

  _demandStatusBadge(status) {
    const colors = {
      'Cronograma': { c: '#6b7280', bg: '#f3f4f6' },
      'Pausado': { c: '#f59e0b', bg: '#fefce8' },
      'Briefing': { c: '#8b5cf6', bg: '#f5f3ff' },
      'Desenvolvimento': { c: '#3b82f6', bg: '#eff6ff' },
      'Revisao Interna': { c: '#a855f7', bg: '#faf5ff' },
      'Aprovado': { c: '#22c55e', bg: '#f0fdf4' },
      'Apresentacao': { c: '#f97316', bg: '#fff7ed' },
      'Concluido': { c: '#16a34a', bg: '#dcfce7' },
    };
    const s = colors[status] || { c: '#6b7280', bg: '#f3f4f6' };
    return `<span style="
      display:inline-block;padding:2px 8px;border-radius:var(--radius-full,9999px);
      font-size:0.72rem;font-weight:600;color:${s.c};background:${s.bg};
      white-space:nowrap;
    ">${status || '\u2014'}</span>`;
  },

  _buColor(bu) {
    const map = {
      'Interiores': 'pink', 'Audiovisual': 'purple', 'Digital 3D': 'blue',
      'Marketing': 'green', 'Branding': 'orange',
    };
    return map[bu] || 'gray';
  },

  _formatDate(dateStr) {
    if (!dateStr) return '\u2014';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return dateStr; }
  },

  _formatDateRange(start, end) {
    if (!start) return '<span style="color:var(--text-muted,#999);">\u2014</span>';
    const s = this._formatDate(start);
    if (!end) return s;
    const e = this._formatDate(end);
    return `${s} \u2192 ${e}`;
  },

  _getPrazoClass(dateStr, status) {
    if (!dateStr || status === 'Concluido' || status === 'Aprovado') return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr + 'T00:00:00');
    if (d < today) return 'pn-prazo-overdue';
    const diff = (d - today) / (1000 * 60 * 60 * 24);
    if (diff <= 3) return 'pn-prazo-soon';
    return '';
  },

  _escHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  _showError(msg) {
    const container = document.getElementById('pn-content');
    if (container) {
      container.innerHTML = `
        <div class="pn-empty" style="
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:48px 24px;
        ">
          <i data-lucide="alert-circle" style="width:48px;height:48px;color:var(--color-danger,#e74c3c)"></i>
          <p style="color:var(--color-danger,#e74c3c);margin-top:8px;">${msg}</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },
};
