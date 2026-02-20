// TBO OS — Module: Project Workspace (Asana-style)
// Pagina dedicada do projeto com abas: Lista, Visao Geral, Quadro, Cronograma, Painel, Gantt
// Rota: #projeto/{id}/{tab}
const TBO_PROJECT_WORKSPACE = {

  // ── Estado ────────────────────────────────────────────────────────────────
  _projectId: null,
  _project: null,
  _projectName: '',
  _activeTab: 'list',
  _tasks: [],
  _deliverables: [],
  _loading: true,
  _sections: [], // Secoes agrupadas com tarefas
  _expandedSections: {}, // Track secoes expandidas/colapsadas
  _openPopup: null, // Popup ativo (filtros, colunas, opcoes, etc)
  _showSubtasks: 'collapsed', // 'expanded' | 'collapsed' | 'hidden'
  _sortBy: null, // { field, asc }
  _groupBy: null, // 'status' | 'priority' | 'owner' | null

  // Colunas configuráveis (exibir/ocultar)
  _columns: [
    { id: 'name', label: 'Nome', visible: true, locked: true },
    { id: 'owner', label: 'Responsavel', visible: true, locked: false },
    { id: 'due_date', label: 'Data de conclusao', visible: true, locked: false },
    { id: 'priority', label: 'Prioridade', visible: true, locked: false },
    { id: 'status', label: 'Status', visible: true, locked: false },
    { id: 'phase', label: 'Secao', visible: false, locked: false },
    { id: 'start_date', label: 'Data de inicio', visible: false, locked: false },
    { id: 'estimate', label: 'Estimativa', visible: false, locked: false },
    { id: 'source', label: 'Origem', visible: false, locked: false }
  ],

  // Filtros ativos e salvos
  _activeFilters: [], // [{ field, operator, value, id }]
  _savedFilters: [], // [{ id, name, icon, filters: [...] }]

  // Tabs disponiveis (ordem igual Asana) — com icone editavel
  _tabs: [
    { id: 'overview', label: 'Visao geral', icon: 'layout-dashboard' },
    { id: 'list', label: 'Lista', icon: 'list' },
    { id: 'board', label: 'Quadro', icon: 'columns-3' },
    { id: 'timeline', label: 'Cronograma', icon: 'calendar-range' },
    { id: 'dashboard', label: 'Painel', icon: 'bar-chart-3' },
    { id: 'gantt', label: 'Gantt', icon: 'gantt-chart' }
  ],

  _esc(str) {
    if (typeof _escapeHtml === 'function') return _escapeHtml(str);
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  setParams(params) {
    this._projectId = params.id;
    this._activeTab = params.tab || 'list';
  },

  async render() {
    this._loading = true;
    this._loadProject();

    if (!this._project) {
      return `
        <div class="pw-container">
          <div class="pw-access-denied">
            <i data-lucide="shield-x" style="width:48px;height:48px;color:var(--danger);margin-bottom:16px;"></i>
            <h2 style="color:var(--text-primary);margin-bottom:8px;">Projeto nao encontrado</h2>
            <p style="color:var(--text-muted);margin-bottom:24px;">O projeto solicitado nao existe ou voce nao tem permissao para acessa-lo.</p>
            <button class="btn btn-primary" onclick="TBO_ROUTER.navigate('projetos')">
              <i data-lucide="arrow-left" style="width:16px;height:16px;"></i> Voltar para Projetos
            </button>
          </div>
        </div>
        ${this._getStyles()}
      `;
    }

    this._loading = false;
    this._projectName = this._project.name || 'Projeto';

    return `
      <div class="pw-container">
        <!-- Header do Projeto -->
        ${this._renderHeader()}

        <!-- Tabs do Projeto -->
        ${this._renderTabs()}

        <!-- Toolbar (contexto da aba) -->
        <div id="pwToolbar">${this._renderToolbar()}</div>

        <!-- Conteudo da aba ativa -->
        <div id="pwTabContent" class="pw-tab-content">
          ${this._renderActiveTab()}
        </div>
      </div>
      ${this._getStyles()}
    `;
  },

  async init() {
    if (!this._project) return;

    // Bind tab clicks
    document.querySelectorAll('.pw-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabId = e.currentTarget.dataset.tab;
        if (tabId !== this._activeTab) {
          TBO_ROUTER.navigate(`projeto/${this._projectId}/${tabId}`);
        }
      });
    });

    // Bind section toggle
    this._bindSectionToggles();

    // Bind action buttons
    this._bindActions();

    // Re-init icons
    if (window.lucide) lucide.createIcons();
  },

  destroy() {
    // Cleanup quando sai do workspace
    this._project = null;
    this._tasks = [];
    this._deliverables = [];
    this._sections = [];
  },

  // Troca de tab sem re-render completo (chamado pelo router)
  switchTab(tabId) {
    this._activeTab = tabId;

    // Atualiza visual das tabs
    document.querySelectorAll('.pw-tab').forEach(t => {
      t.classList.toggle('pw-tab--active', t.dataset.tab === tabId);
    });

    // Atualiza toolbar
    const toolbar = document.getElementById('pwToolbar');
    if (toolbar) toolbar.innerHTML = this._renderToolbar();

    // Atualiza conteudo
    const content = document.getElementById('pwTabContent');
    if (content) {
      content.innerHTML = this._renderActiveTab();
      this._bindSectionToggles();
      this._bindActions();
      if (window.lucide) lucide.createIcons();
    }
  },

  // ── Data Loading ──────────────────────────────────────────────────────────

  _loadProject() {
    if (!this._projectId || typeof TBO_STORAGE === 'undefined') {
      this._project = null;
      return;
    }

    this._project = TBO_STORAGE.getErpEntity('project', this._projectId);
    if (!this._project) return;

    // Carregar tarefas e entregaveis (dados essenciais)
    this._tasks = TBO_STORAGE.getErpEntitiesByParent('task', this._projectId) || [];
    this._deliverables = TBO_STORAGE.getErpEntitiesByParent('deliverable', this._projectId) || [];

    // Carregar preferencias salvas
    this._loadColumnPrefs();
    this._loadSavedFilters();

    // Organizar tarefas em secoes
    this._buildSections();
  },

  _buildSections() {
    // Agrupa tarefas por fase/secao (campo 'phase' da task)
    const sectionMap = {};
    const defaultSections = ['Planejamento', 'Execucao', 'Revisao', 'Finalizacao'];

    // Usa tasks filtradas/ordenadas
    const tasks = this._getFilteredSortedTasks ? this._getFilteredSortedTasks() : this._tasks;

    tasks.forEach(t => {
      const phase = t.phase || 'Sem secao';
      if (!sectionMap[phase]) {
        sectionMap[phase] = { name: phase, tasks: [], collapsed: false };
      }
      sectionMap[phase].tasks.push(t);
    });

    // Garantir secoes padrao mesmo sem tarefas
    defaultSections.forEach(s => {
      if (!sectionMap[s]) {
        sectionMap[s] = { name: s, tasks: [], collapsed: false };
      }
    });

    // Aplicar estado de collapse salvo
    Object.keys(sectionMap).forEach(key => {
      if (this._expandedSections[key] === false) {
        sectionMap[key].collapsed = true;
      }
    });

    // Ordenar: secoes padrao primeiro, depois custom
    const ordered = [];
    defaultSections.forEach(s => { if (sectionMap[s]) ordered.push(sectionMap[s]); });
    Object.keys(sectionMap).forEach(key => {
      if (!defaultSections.includes(key)) ordered.push(sectionMap[key]);
    });

    this._sections = ordered;
  },

  // ── Render: Header ────────────────────────────────────────────────────────

  _renderHeader() {
    const p = this._project;
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.project : null;
    const statusLabel = sm?.labels?.[p.status] || p.status || '';
    const statusColor = sm?.colors?.[p.status] || 'var(--text-muted)';

    // Health score
    let healthBadge = '';
    if (typeof TBO_ERP !== 'undefined') {
      const health = TBO_ERP.calculateHealthScore(p);
      const hColor = TBO_ERP.getHealthColor(health.score);
      healthBadge = `<span class="pw-health-badge" style="background:${hColor}15;color:${hColor};border:1px solid ${hColor}30;" title="${health.reasons.join(' | ') || 'Projeto saudavel'}">${health.score}/100</span>`;
    }

    return `
      <div class="pw-header">
        <div class="pw-header-left">
          <button class="pw-back-btn" onclick="TBO_ROUTER.navigate('projetos')" title="Voltar para Projetos">
            <i data-lucide="arrow-left" style="width:18px;height:18px;"></i>
          </button>
          <div class="pw-header-info">
            <div class="pw-header-breadcrumb">
              <span class="pw-breadcrumb-link" onclick="TBO_ROUTER.navigate('projetos')">Projetos</span>
              <i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--text-muted);"></i>
              ${p.client ? `<span class="pw-breadcrumb-text">${this._esc(p.client)}</span><i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--text-muted);"></i>` : ''}
            </div>
            <div class="pw-header-title-row">
              <i data-lucide="folder-kanban" style="width:22px;height:22px;color:var(--accent-gold);flex-shrink:0;"></i>
              <h1 class="pw-project-name">${this._esc(p.name)}</h1>
              <span class="pw-status-badge" style="background:${statusColor}20;color:${statusColor};border:1px solid ${statusColor}40;">${statusLabel}</span>
              ${healthBadge}
            </div>
          </div>
        </div>
        <div class="pw-header-right">
          ${p.owner ? `<span class="pw-owner-tag"><i data-lucide="user" style="width:14px;height:14px;"></i> ${this._esc(p.owner)}</span>` : ''}
          <button class="btn btn-secondary pw-action-btn" onclick="TBO_PROJETOS._showProjectModal('${this._esc(p.id)}')" title="Editar projeto">
            <i data-lucide="settings" style="width:16px;height:16px;"></i>
          </button>
        </div>
      </div>
    `;
  },

  // ── Render: Tabs ──────────────────────────────────────────────────────────

  _renderTabs() {
    return `
      <div class="pw-tabs-bar">
        ${this._tabs.map(t => `
          <button class="pw-tab${t.id === this._activeTab ? ' pw-tab--active' : ''}" data-tab="${t.id}">
            <i data-lucide="${t.icon}" style="width:15px;height:15px;"></i>
            <span>${t.label}</span>
          </button>
        `).join('')}
      </div>
    `;
  },

  // ── Render: Toolbar (estilo Asana — Filtrar, Ordenar, Agrupar, Opcoes) ───

  _renderToolbar() {
    if (this._activeTab !== 'list' && this._activeTab !== 'board') return '';

    const hiddenCols = this._columns.filter(c => !c.visible && !c.locked).length;
    const activeFilterCount = this._activeFilters.length;
    const subtaskLabel = { expanded: 'Expandido', collapsed: 'Recolhido', hidden: 'Oculto' }[this._showSubtasks] || 'Recolhido';

    return `
      <div class="pw-toolbar">
        <button class="btn btn-primary pw-add-task-btn" id="pwAddTask">
          <i data-lucide="plus" style="width:15px;height:15px;"></i> Adicionar tarefa
        </button>
        <div class="pw-toolbar-right">
          <button class="btn btn-ghost pw-toolbar-btn${activeFilterCount ? ' pw-toolbar-btn--active' : ''}" id="pwBtnFilter" title="Filtrar">
            <i data-lucide="filter" style="width:15px;height:15px;"></i> Filtrar${activeFilterCount ? ` (${activeFilterCount})` : ''}
          </button>
          <button class="btn btn-ghost pw-toolbar-btn" id="pwBtnSort" title="Ordenar">
            <i data-lucide="arrow-up-down" style="width:15px;height:15px;"></i> Ordenar
          </button>
          <button class="btn btn-ghost pw-toolbar-btn" id="pwBtnGroup" title="Agrupar">
            <i data-lucide="layers" style="width:15px;height:15px;"></i> Agrupar
          </button>
          <span class="pw-toolbar-divider"></span>
          <button class="btn btn-ghost pw-toolbar-btn" id="pwBtnOptions" title="Opcoes">
            <i data-lucide="sliders-horizontal" style="width:15px;height:15px;"></i> Opcoes
          </button>
          <button class="btn btn-ghost pw-toolbar-btn" id="pwBtnSearch" title="Buscar">
            <i data-lucide="search" style="width:15px;height:15px;"></i>
          </button>
        </div>
      </div>
      <!-- Popup container (posicionado logo abaixo da toolbar) -->
      <div id="pwPopupAnchor" class="pw-popup-anchor"></div>
    `;
  },

  // ── Popup: Opcoes (estilo Asana — Exibir/ocultar colunas, Filtros, Subtarefas) ──

  _renderOptionsPopup() {
    const hiddenCols = this._columns.filter(c => !c.visible && !c.locked).length;
    const subtaskLabel = { expanded: 'Expandido', collapsed: 'Recolhido', hidden: 'Oculto' }[this._showSubtasks] || 'Recolhido';
    const currentTab = this._tabs.find(t => t.id === this._activeTab);

    return `
      <div class="pw-popup pw-popup--options" id="pwPopup">
        <div class="pw-popup-header">
          <span class="pw-popup-title">${this._esc(currentTab?.label || 'Lista')}</span>
          <button class="pw-popup-close" onclick="TBO_PROJECT_WORKSPACE._closePopup()">&times;</button>
        </div>

        <div class="pw-popup-row pw-popup-row--edit">
          <span class="pw-popup-row-label">Icone</span>
          <span class="pw-popup-row-label">Nome da visualizacao</span>
        </div>
        <div class="pw-popup-row" style="gap:12px;margin-bottom:12px;">
          <button class="pw-icon-picker-btn" id="pwTabIconPicker" title="Escolher icone">
            <i data-lucide="${currentTab?.icon || 'list'}" style="width:18px;height:18px;"></i>
          </button>
          <input type="text" class="pw-popup-input" id="pwTabNameInput" value="${this._esc(currentTab?.label || '')}" placeholder="Nome da aba"
            onchange="TBO_PROJECT_WORKSPACE._renameTab(this.value)">
        </div>

        <div class="pw-popup-divider"></div>

        <div class="pw-popup-menu-item" onclick="TBO_PROJECT_WORKSPACE._showColumnsPopup()">
          <i data-lucide="columns-3" style="width:16px;height:16px;"></i>
          <span>Exibir/ocultar colunas</span>
          <span class="pw-popup-badge">${hiddenCols} ocultos</span>
          <i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--text-muted);"></i>
        </div>

        <div class="pw-popup-menu-item" onclick="TBO_PROJECT_WORKSPACE._showFilterPopup()">
          <i data-lucide="filter" style="width:16px;height:16px;"></i>
          <span>Filtros</span>
          <i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--text-muted);"></i>
        </div>

        <div class="pw-popup-menu-item" onclick="TBO_PROJECT_WORKSPACE._showSortPopup()">
          <i data-lucide="arrow-up-down" style="width:16px;height:16px;"></i>
          <span>Ordenacoes</span>
          <i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--text-muted);"></i>
        </div>

        <div class="pw-popup-menu-item" onclick="TBO_PROJECT_WORKSPACE._showGroupPopup()">
          <i data-lucide="layers" style="width:16px;height:16px;"></i>
          <span>Grupos</span>
          <i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--text-muted);"></i>
        </div>

        <div class="pw-popup-menu-item" onclick="TBO_PROJECT_WORKSPACE._cycleSubtasks()">
          <i data-lucide="git-branch" style="width:16px;height:16px;"></i>
          <span>Subtarefas</span>
          <span class="pw-popup-badge pw-popup-badge--clickable">${subtaskLabel} <i data-lucide="chevron-down" style="width:12px;height:12px;"></i></span>
        </div>
      </div>
    `;
  },

  // ── Popup: Exibir/Ocultar Colunas ────────────────────────────────────────

  _renderColumnsPopup() {
    return `
      <div class="pw-popup pw-popup--columns" id="pwPopup">
        <div class="pw-popup-header">
          <button class="pw-popup-back" onclick="TBO_PROJECT_WORKSPACE._showOptionsPopup()">
            <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
          </button>
          <span class="pw-popup-title">Exibir/ocultar colunas</span>
          <button class="pw-popup-close" onclick="TBO_PROJECT_WORKSPACE._closePopup()">&times;</button>
        </div>
        <div class="pw-popup-body">
          ${this._columns.map(col => `
            <label class="pw-col-toggle${col.locked ? ' pw-col-toggle--locked' : ''}">
              <input type="checkbox" ${col.visible ? 'checked' : ''} ${col.locked ? 'disabled' : ''}
                onchange="TBO_PROJECT_WORKSPACE._toggleColumn('${col.id}', this.checked)">
              <span>${this._esc(col.label)}</span>
              ${col.locked ? '<span class="pw-col-lock"><i data-lucide="lock" style="width:12px;height:12px;"></i></span>' : ''}
            </label>
          `).join('')}
        </div>
      </div>
    `;
  },

  // ── Popup: Filtros (criar, editar, salvar) ────────────────────────────────

  // Mapa de metadados dos campos para filtro — tipo, label, opcoes
  _filterFieldMeta: {
    name: { label: 'Nome', type: 'text' },
    owner: { label: 'Responsavel', type: 'select', optionsFrom: 'owner' },
    due_date: { label: 'Data de conclusao', type: 'date' },
    priority: { label: 'Prioridade', type: 'select', options: ['urgente', 'alta', 'media', 'baixa'] },
    status: { label: 'Status', type: 'select', options: ['pendente', 'em_andamento', 'concluida', 'cancelada'] },
    phase: { label: 'Secao', type: 'select', optionsFrom: 'phase' },
    start_date: { label: 'Data de inicio', type: 'date' },
    estimate: { label: 'Estimativa', type: 'number' },
    source: { label: 'Origem', type: 'text' },
    is_milestone: { label: 'Milestone', type: 'boolean' },
    description: { label: 'Descricao', type: 'text' }
  },

  // Operadores possiveis por tipo de campo
  _filterOperatorsByType: {
    text: [
      { value: 'contains', label: 'contem' },
      { value: 'not_contains', label: 'nao contem' },
      { value: 'eq', label: 'e igual a' },
      { value: 'neq', label: 'nao e' },
      { value: 'starts_with', label: 'comeca com' },
      { value: 'ends_with', label: 'termina com' },
      { value: 'empty', label: 'esta vazio' },
      { value: 'not_empty', label: 'nao esta vazio' }
    ],
    select: [
      { value: 'eq', label: 'e' },
      { value: 'neq', label: 'nao e' },
      { value: 'in', label: 'e um de' },
      { value: 'not_in', label: 'nao e nenhum de' },
      { value: 'empty', label: 'esta vazio' },
      { value: 'not_empty', label: 'nao esta vazio' }
    ],
    date: [
      { value: 'eq', label: 'e igual a' },
      { value: 'before', label: 'antes de' },
      { value: 'after', label: 'depois de' },
      { value: 'between', label: 'entre' },
      { value: 'this_week', label: 'esta semana' },
      { value: 'next_week', label: 'proxima semana' },
      { value: 'this_month', label: 'este mes' },
      { value: 'overdue', label: 'atrasado' },
      { value: 'empty', label: 'sem data' },
      { value: 'not_empty', label: 'com data' }
    ],
    number: [
      { value: 'eq', label: 'igual a' },
      { value: 'neq', label: 'diferente de' },
      { value: 'gt', label: 'maior que' },
      { value: 'lt', label: 'menor que' },
      { value: 'gte', label: 'maior ou igual' },
      { value: 'lte', label: 'menor ou igual' },
      { value: 'empty', label: 'esta vazio' },
      { value: 'not_empty', label: 'nao esta vazio' }
    ],
    boolean: [
      { value: 'eq', label: 'e' },
      { value: 'neq', label: 'nao e' }
    ]
  },

  // Retorna as opcoes dinamicas extraidas das tarefas existentes
  _getFieldDynamicOptions(fieldId) {
    const meta = this._filterFieldMeta[fieldId];
    if (!meta) return [];
    // Opcoes estaticas definidas no meta
    if (meta.options) return meta.options;
    // Opcoes dinamicas extraidas das tarefas
    if (meta.optionsFrom) {
      const vals = new Set();
      this._tasks.forEach(t => {
        const v = t[meta.optionsFrom] || t[fieldId];
        if (v && String(v).trim()) vals.add(String(v).trim());
      });
      return [...vals].sort();
    }
    // Para booleano
    if (meta.type === 'boolean') return ['sim', 'nao'];
    return [];
  },

  // Retorna o tipo do campo para filtro
  _getFieldType(fieldId) {
    return (this._filterFieldMeta[fieldId] || {}).type || 'text';
  },

  // Renderiza o input de valor do filtro baseado no tipo do campo e operador
  _renderFilterValueInput(filter, idx) {
    const fieldType = this._getFieldType(filter.field);
    const op = filter.operator;

    // Operadores que nao precisam de valor
    if (['empty', 'not_empty', 'this_week', 'next_week', 'this_month', 'overdue'].includes(op)) {
      return '<span class="pw-filter-no-value" style="font-size:0.75rem;color:var(--text-muted);padding:4px 8px;">—</span>';
    }

    // Select (dropdown de opcoes)
    if (fieldType === 'select') {
      const options = this._getFieldDynamicOptions(filter.field);
      if (op === 'in' || op === 'not_in') {
        // Multi-select com checkboxes inline
        const selected = (filter.value || '').split(',').filter(Boolean);
        return `
          <div class="pw-filter-multi-select">
            ${options.map(o => `
              <label class="pw-filter-multi-opt">
                <input type="checkbox" ${selected.includes(o) ? 'checked' : ''}
                  onchange="TBO_PROJECT_WORKSPACE._toggleMultiFilterValue(${idx}, '${this._esc(o)}')" />
                <span>${this._esc(o)}</span>
              </label>
            `).join('')}
          </div>`;
      }
      return `
        <select class="pw-filter-select pw-filter-value-select" onchange="TBO_PROJECT_WORKSPACE._updateFilter(${idx},'value',this.value)">
          <option value="">Selecionar...</option>
          ${options.map(o => `<option value="${o}" ${filter.value === o ? 'selected' : ''}>${this._esc(o)}</option>`).join('')}
        </select>`;
    }

    // Date
    if (fieldType === 'date') {
      if (op === 'between') {
        const parts = (filter.value || '|').split('|');
        return `
          <div class="pw-filter-date-range">
            <input type="date" class="pw-filter-date-input" value="${this._esc(parts[0] || '')}"
              onchange="TBO_PROJECT_WORKSPACE._updateFilterDateRange(${idx}, 0, this.value)">
            <span style="font-size:0.7rem;color:var(--text-muted);">ate</span>
            <input type="date" class="pw-filter-date-input" value="${this._esc(parts[1] || '')}"
              onchange="TBO_PROJECT_WORKSPACE._updateFilterDateRange(${idx}, 1, this.value)">
          </div>`;
      }
      return `<input type="date" class="pw-filter-date-input" value="${this._esc(filter.value || '')}"
        onchange="TBO_PROJECT_WORKSPACE._updateFilter(${idx},'value',this.value)">`;
    }

    // Number
    if (fieldType === 'number') {
      return `<input type="number" class="pw-filter-value pw-filter-num-input" value="${this._esc(filter.value || '')}" placeholder="Valor..."
        onchange="TBO_PROJECT_WORKSPACE._updateFilter(${idx},'value',this.value)" step="any">`;
    }

    // Boolean
    if (fieldType === 'boolean') {
      return `
        <select class="pw-filter-select pw-filter-value-select" onchange="TBO_PROJECT_WORKSPACE._updateFilter(${idx},'value',this.value)">
          <option value="true" ${filter.value === 'true' ? 'selected' : ''}>Sim</option>
          <option value="false" ${filter.value === 'false' ? 'selected' : ''}>Nao</option>
        </select>`;
    }

    // Text (default) — autocomplete com valores existentes
    const suggestions = this._getTextFieldSuggestions(filter.field);
    const listId = `pw-flist-${idx}`;
    return `
      <input type="text" class="pw-filter-value" value="${this._esc(filter.value || '')}" placeholder="Valor..."
        list="${listId}"
        onchange="TBO_PROJECT_WORKSPACE._updateFilter(${idx},'value',this.value)"
        oninput="TBO_PROJECT_WORKSPACE._updateFilter(${idx},'value',this.value)">
      ${suggestions.length > 0 ? `<datalist id="${listId}">${suggestions.map(s => `<option value="${this._esc(s)}">`).join('')}</datalist>` : ''}`;
  },

  // Retorna sugestoes de valores para campos texto (extraidas das tarefas)
  _getTextFieldSuggestions(fieldId) {
    const vals = new Set();
    this._tasks.forEach(t => {
      const v = t[fieldId];
      if (v && String(v).trim()) vals.add(String(v).trim());
    });
    return [...vals].sort().slice(0, 50);
  },

  _renderFilterPopup() {
    // Campos filtráveis: todos os da _columns + extras
    const fieldOptions = [];
    // Primeiro adiciona os campos da _columns
    this._columns.forEach(c => {
      if (this._filterFieldMeta[c.id]) {
        fieldOptions.push({ value: c.id, label: this._filterFieldMeta[c.id].label });
      }
    });
    // Adiciona campos extras nao presentes em _columns
    Object.keys(this._filterFieldMeta).forEach(key => {
      if (!fieldOptions.find(f => f.value === key)) {
        fieldOptions.push({ value: key, label: this._filterFieldMeta[key].label });
      }
    });

    return `
      <div class="pw-popup pw-popup--filters" id="pwPopup">
        <div class="pw-popup-header">
          <button class="pw-popup-back" onclick="TBO_PROJECT_WORKSPACE._showOptionsPopup()">
            <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
          </button>
          <span class="pw-popup-title">Filtros</span>
          <button class="pw-popup-close" onclick="TBO_PROJECT_WORKSPACE._closePopup()">&times;</button>
        </div>
        <div class="pw-popup-body">
          ${this._activeFilters.length === 0 ? `
            <div class="pw-filter-empty" style="text-align:center;padding:16px 0;color:var(--text-muted);font-size:0.8rem;">
              <i data-lucide="filter" style="width:24px;height:24px;display:block;margin:0 auto 8px;opacity:0.4;"></i>
              Nenhum filtro ativo.<br>Clique abaixo para adicionar.
            </div>
          ` : ''}

          ${this._activeFilters.map((f, i) => {
            const fieldType = this._getFieldType(f.field);
            const operatorOptions = this._filterOperatorsByType[fieldType] || this._filterOperatorsByType.text;
            return `
              <div class="pw-filter-row" data-filter-idx="${i}">
                <div class="pw-filter-row-top">
                  ${i > 0 ? '<span class="pw-filter-conjunction">E</span>' : ''}
                  <select class="pw-filter-select pw-filter-field-select" onchange="TBO_PROJECT_WORKSPACE._updateFilterField(${i}, this.value)">
                    ${fieldOptions.map(o => `<option value="${o.value}" ${f.field === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
                  </select>
                  <select class="pw-filter-select pw-filter-op-select" onchange="TBO_PROJECT_WORKSPACE._updateFilter(${i},'operator',this.value)">
                    ${operatorOptions.map(o => `<option value="${o.value}" ${f.operator === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
                  </select>
                  <button class="pw-filter-remove" onclick="TBO_PROJECT_WORKSPACE._removeFilter(${i})" title="Remover">
                    <i data-lucide="x" style="width:14px;height:14px;"></i>
                  </button>
                </div>
                <div class="pw-filter-row-value">
                  ${this._renderFilterValueInput(f, i)}
                </div>
              </div>
            `;
          }).join('')}

          <button class="pw-filter-add" onclick="TBO_PROJECT_WORKSPACE._addFilter()">
            <i data-lucide="plus" style="width:14px;height:14px;"></i> Adicionar filtro
          </button>

          ${this._activeFilters.length > 0 ? `
            <div class="pw-popup-divider"></div>
            <div class="pw-filter-actions">
              <button class="btn btn-secondary" style="font-size:0.75rem;padding:4px 10px;" onclick="TBO_PROJECT_WORKSPACE._saveFilterSet()">
                <i data-lucide="save" style="width:13px;height:13px;"></i> Salvar filtro
              </button>
              <button class="btn btn-ghost" style="font-size:0.75rem;padding:4px 10px;color:#ef4444;" onclick="TBO_PROJECT_WORKSPACE._clearFilters()">
                Limpar tudo
              </button>
            </div>
          ` : ''}

          ${this._savedFilters.length > 0 ? `
            <div class="pw-popup-divider"></div>
            <div class="pw-saved-filters-label">Filtros salvos</div>
            ${this._savedFilters.map((sf, i) => `
              <div class="pw-saved-filter-item">
                <span class="pw-saved-filter-icon">${sf.icon || '🔍'}</span>
                <input type="text" class="pw-saved-filter-name" value="${this._esc(sf.name)}"
                  onchange="TBO_PROJECT_WORKSPACE._renameSavedFilter(${i}, this.value)">
                <button class="pw-saved-filter-apply" onclick="TBO_PROJECT_WORKSPACE._applySavedFilter(${i})">Aplicar</button>
                <button class="pw-saved-filter-del" onclick="TBO_PROJECT_WORKSPACE._deleteSavedFilter(${i})" title="Excluir">
                  <i data-lucide="trash-2" style="width:13px;height:13px;"></i>
                </button>
              </div>
            `).join('')}
          ` : ''}
        </div>
      </div>
    `;
  },

  // ── Popup: Ordenar ────────────────────────────────────────────────────────

  _renderSortPopup() {
    const sortFields = [
      { value: 'title', label: 'Nome' },
      { value: 'due_date', label: 'Data de conclusao' },
      { value: 'priority', label: 'Prioridade' },
      { value: 'status', label: 'Status' },
      { value: 'owner', label: 'Responsavel' },
      { value: 'createdAt', label: 'Data de criacao' }
    ];

    return `
      <div class="pw-popup pw-popup--sort" id="pwPopup">
        <div class="pw-popup-header">
          <button class="pw-popup-back" onclick="TBO_PROJECT_WORKSPACE._showOptionsPopup()">
            <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
          </button>
          <span class="pw-popup-title">Ordenar por</span>
          <button class="pw-popup-close" onclick="TBO_PROJECT_WORKSPACE._closePopup()">&times;</button>
        </div>
        <div class="pw-popup-body">
          ${sortFields.map(f => {
            const isActive = this._sortBy?.field === f.value;
            const icon = isActive ? (this._sortBy.asc ? 'arrow-up' : 'arrow-down') : '';
            return `
              <div class="pw-popup-menu-item${isActive ? ' pw-popup-menu-item--active' : ''}" onclick="TBO_PROJECT_WORKSPACE._setSort('${f.value}')">
                <span>${f.label}</span>
                ${isActive ? `<i data-lucide="${icon}" style="width:14px;height:14px;color:var(--accent-gold);"></i>` : ''}
              </div>
            `;
          }).join('')}
          ${this._sortBy ? `
            <div class="pw-popup-divider"></div>
            <div class="pw-popup-menu-item" style="color:#ef4444;" onclick="TBO_PROJECT_WORKSPACE._clearSort()">
              <i data-lucide="x" style="width:14px;height:14px;"></i> Remover ordenacao
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // ── Popup: Agrupar ────────────────────────────────────────────────────────

  _renderGroupPopup() {
    const groupFields = [
      { value: null, label: 'Sem agrupamento' },
      { value: 'status', label: 'Status' },
      { value: 'priority', label: 'Prioridade' },
      { value: 'owner', label: 'Responsavel' },
      { value: 'phase', label: 'Secao' }
    ];

    return `
      <div class="pw-popup pw-popup--group" id="pwPopup">
        <div class="pw-popup-header">
          <button class="pw-popup-back" onclick="TBO_PROJECT_WORKSPACE._showOptionsPopup()">
            <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
          </button>
          <span class="pw-popup-title">Agrupar por</span>
          <button class="pw-popup-close" onclick="TBO_PROJECT_WORKSPACE._closePopup()">&times;</button>
        </div>
        <div class="pw-popup-body">
          ${groupFields.map(f => {
            const isActive = this._groupBy === f.value;
            return `
              <div class="pw-popup-menu-item${isActive ? ' pw-popup-menu-item--active' : ''}" onclick="TBO_PROJECT_WORKSPACE._setGroup(${f.value === null ? 'null' : "'" + f.value + "'"})">
                <span>${f.label}</span>
                ${isActive ? '<i data-lucide="check" style="width:14px;height:14px;color:var(--accent-gold);"></i>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // ── Render: Active Tab Content ────────────────────────────────────────────

  _renderActiveTab() {
    switch (this._activeTab) {
      case 'list': return this._renderListView();
      case 'overview': return this._renderOverview();
      case 'board': return this._renderBoardView();
      case 'timeline': return this._renderTimelineView();
      case 'dashboard': return this._renderDashboardView();
      case 'gantt': return this._renderGanttView();
      default: return this._renderListView();
    }
  },

  // ── List View (MVP principal — estilo Asana) ──────────────────────────────

  _renderListView() {
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
    const visibleCols = this._columns.filter(c => c.visible);

    // Column headers dinamicos (respeita colunas visíveis)
    const colHeaders = `
      <div class="pw-list-header">
        ${visibleCols.map(c => `<div class="pw-list-col pw-list-col--${c.id}">${c.label}</div>`).join('')}
        <div class="pw-list-col pw-list-col--add" title="Adicionar coluna" onclick="TBO_PROJECT_WORKSPACE._showColumnsPopup()" style="cursor:pointer;width:32px;text-align:center;">+</div>
      </div>
    `;

    // Secoes com tarefas
    const sectionsHtml = this._sections.map(section => {
      const isCollapsed = section.collapsed;
      const taskCount = section.tasks.length;
      const doneCount = section.tasks.filter(t => t.status === 'concluida').length;

      const tasksHtml = isCollapsed ? '' : section.tasks.map(task => {
        const isDone = task.status === 'concluida';
        const priorityColor = { 'urgente': '#ef4444', 'alta': '#f59e0b', 'media': '#3b82f6', 'baixa': '#6b7280' }[task.priority] || '#6b7280';
        const priorityLabel = { 'urgente': 'Urgente', 'alta': 'Alta', 'media': 'Media', 'baixa': 'Baixa' }[task.priority] || '-';
        const statusLabel = sm?.labels?.[task.status] || task.status || '-';
        const statusColor = sm?.colors?.[task.status] || '#6b7280';

        // Formatar data
        const formatDate = (dateStr) => {
          if (!dateStr) return '-';
          const d = new Date(dateStr);
          const str = `${d.getDate().toString().padStart(2, '0')} ${['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][d.getMonth()]}`;
          if (d < new Date() && !isDone) return `<span style="color:#ef4444;">${str}</span>`;
          return str;
        };

        // Renderiza celula por coluna
        const renderCell = (colId) => {
          switch (colId) {
            case 'name': return `
              <div class="pw-list-col pw-list-col--name">
                <button class="pw-check-btn${isDone ? ' pw-check-btn--done' : ''}" data-task-id="${this._esc(task.id)}" title="${isDone ? 'Reabrir' : 'Concluir'}">
                  <i data-lucide="${isDone ? 'check-circle-2' : 'circle'}" style="width:18px;height:18px;"></i>
                </button>
                <span class="pw-task-name">${this._esc(task.title || task.name || 'Sem titulo')}</span>
                ${task.is_milestone ? '<span class="pw-milestone-badge" title="Milestone"><i data-lucide="diamond" style="width:12px;height:12px;"></i></span>' : ''}
              </div>`;
            case 'owner': return `
              <div class="pw-list-col pw-list-col--owner">
                ${task.owner ? `<span class="pw-owner-chip">${this._esc(task.owner)}</span>` : '<span class="pw-unassigned"><i data-lucide="user-plus" style="width:14px;height:14px;"></i></span>'}
              </div>`;
            case 'due_date': return `<div class="pw-list-col pw-list-col--due_date">${formatDate(task.due_date)}</div>`;
            case 'priority': return `
              <div class="pw-list-col pw-list-col--priority">
                <span class="pw-priority-chip" style="background:${priorityColor}15;color:${priorityColor};">${priorityLabel}</span>
              </div>`;
            case 'status': return `
              <div class="pw-list-col pw-list-col--status">
                <span class="pw-status-chip" style="background:${statusColor}20;color:${statusColor};">${statusLabel}</span>
              </div>`;
            case 'phase': return `<div class="pw-list-col pw-list-col--phase">${this._esc(task.phase || '-')}</div>`;
            case 'start_date': return `<div class="pw-list-col pw-list-col--start_date">${formatDate(task.start_date)}</div>`;
            case 'estimate': return `<div class="pw-list-col pw-list-col--estimate">${task.estimate_minutes ? Math.round(task.estimate_minutes / 60) + 'h' : '-'}</div>`;
            case 'source': return `<div class="pw-list-col pw-list-col--source">${this._esc(task.source || '-')}</div>`;
            default: return '';
          }
        };

        return `
          <div class="pw-list-row${isDone ? ' pw-list-row--done' : ''}" data-task-id="${this._esc(task.id)}" data-section="${this._esc(section.name)}" draggable="false">
            <div class="pw-drag-handle" title="Arrastar para reordenar" data-task-id="${this._esc(task.id)}">
              <i data-lucide="grip-vertical" style="width:14px;height:14px;color:var(--text-muted);opacity:0.3;"></i>
            </div>
            ${visibleCols.map(c => renderCell(c.id)).join('')}
            <div class="pw-list-col pw-list-col--actions" style="width:32px;flex-shrink:0;">
              <button class="pw-row-menu-btn btn btn-ghost btn-sm" data-task-id="${this._esc(task.id)}" title="Acoes" style="padding:2px 4px;" onclick="event.stopPropagation();">
                <i data-lucide="more-horizontal" style="width:14px;height:14px;"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Input inline para adicionar tarefa na secao
      const addTaskRow = isCollapsed ? '' : `
        <div class="pw-add-task-row" data-section="${this._esc(section.name)}">
          <span class="pw-add-task-placeholder" onclick="TBO_PROJECT_WORKSPACE._showInlineTaskInput(this, '${this._esc(section.name)}')">
            <i data-lucide="plus" style="width:14px;height:14px;opacity:0.5;"></i> Adicionar tarefa...
          </span>
        </div>
      `;

      return `
        <div class="pw-section" data-section="${this._esc(section.name)}">
          <div class="pw-section-header" data-section-toggle="${this._esc(section.name)}">
            <i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" style="width:16px;height:16px;flex-shrink:0;color:var(--text-muted);"></i>
            <span class="pw-section-name">${this._esc(section.name)}</span>
            <span class="pw-section-count">${doneCount}/${taskCount}</span>
          </div>
          ${tasksHtml}
          ${addTaskRow}
        </div>
      `;
    }).join('');

    // Botao adicionar secao
    const addSectionBtn = `
      <div class="pw-add-section" id="pwAddSection">
        <i data-lucide="plus" style="width:15px;height:15px;"></i> Adicionar secao
      </div>
    `;

    return colHeaders + sectionsHtml + addSectionBtn;
  },

  // ── Overview Tab ──────────────────────────────────────────────────────────

  _renderOverview() {
    const p = this._project;
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.project : null;
    const tasks = this._tasks;
    const deliverables = this._deliverables;

    // Stats
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'concluida').length;
    const pctDone = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Health
    let healthHtml = '';
    if (typeof TBO_ERP !== 'undefined') {
      const health = TBO_ERP.calculateHealthScore(p);
      const hColor = TBO_ERP.getHealthColor(health.score);
      healthHtml = `
        <div class="pw-overview-card">
          <h3>Saude do Projeto</h3>
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="font-size:2.5rem;font-weight:800;color:${hColor};">${health.score}</div>
            <div style="flex:1;">
              <div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
                <div style="width:${health.score}%;height:100%;background:${hColor};border-radius:4px;transition:width 0.5s;"></div>
              </div>
              ${health.reasons.length > 0 ? `<div style="margin-top:8px;font-size:0.75rem;color:var(--text-muted);">${health.reasons.map(r => `<span style="display:inline-block;margin:2px 4px 2px 0;padding:2px 8px;background:${hColor}10;border-radius:4px;">${this._esc(r)}</span>`).join('')}</div>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    // Deadline info
    let deadlineHtml = '';
    if (typeof TBO_ERP !== 'undefined') {
      const dl = TBO_ERP.getDeadlineInfo(p);
      if (dl) {
        const urgencyColors = { ok: '#22c55e', warning: '#f59e0b', critical: '#ef4444', overdue: '#ef4444' };
        deadlineHtml = `
          <div class="pw-overview-card">
            <h3>Prazo</h3>
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="font-size:1.5rem;font-weight:700;color:${urgencyColors[dl.urgency] || 'var(--text-primary)'};">${dl.daysRemaining ?? '-'}</span>
              <span style="color:var(--text-muted);">dias restantes</span>
            </div>
            ${p.end_date ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Entrega: ${new Date(p.end_date).toLocaleDateString('pt-BR')}</div>` : ''}
          </div>
        `;
      }
    }

    return `
      <div class="pw-overview">
        <div class="pw-overview-grid">
          ${healthHtml}

          <div class="pw-overview-card">
            <h3>Progresso</h3>
            <div style="display:flex;align-items:center;gap:16px;">
              <div style="font-size:2.5rem;font-weight:800;color:var(--accent-gold);">${pctDone}%</div>
              <div style="flex:1;">
                <div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
                  <div style="width:${pctDone}%;height:100%;background:var(--accent-gold);border-radius:4px;transition:width 0.5s;"></div>
                </div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">${doneTasks} de ${totalTasks} tarefas concluidas</div>
              </div>
            </div>
          </div>

          ${deadlineHtml}

          <div class="pw-overview-card">
            <h3>Detalhes</h3>
            <div class="pw-details-grid">
              ${p.client ? `<div class="pw-detail-item"><span class="pw-detail-label">Cliente</span><span class="pw-detail-value">${this._esc(p.client)}</span></div>` : ''}
              ${p.owner ? `<div class="pw-detail-item"><span class="pw-detail-label">Responsavel</span><span class="pw-detail-value">${this._esc(p.owner)}</span></div>` : ''}
              ${p.code ? `<div class="pw-detail-item"><span class="pw-detail-label">Codigo</span><span class="pw-detail-value">${this._esc(p.code)}</span></div>` : ''}
              ${p.value ? `<div class="pw-detail-item"><span class="pw-detail-label">Valor</span><span class="pw-detail-value">R$ ${Number(p.value).toLocaleString('pt-BR')}</span></div>` : ''}
              ${p.services?.length ? `<div class="pw-detail-item"><span class="pw-detail-label">BUs</span><span class="pw-detail-value">${p.services.map(s => this._esc(s)).join(', ')}</span></div>` : ''}
              ${p.start_date ? `<div class="pw-detail-item"><span class="pw-detail-label">Inicio</span><span class="pw-detail-value">${new Date(p.start_date).toLocaleDateString('pt-BR')}</span></div>` : ''}
              ${p.end_date ? `<div class="pw-detail-item"><span class="pw-detail-label">Entrega</span><span class="pw-detail-value">${new Date(p.end_date).toLocaleDateString('pt-BR')}</span></div>` : ''}
            </div>
          </div>

          <div class="pw-overview-card">
            <h3>Entregaveis (${deliverables.length})</h3>
            ${deliverables.length > 0 ? `
              <div class="pw-deliverables-list">
                ${deliverables.map(d => {
                  const dSm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.deliverable : null;
                  const dColor = dSm?.colors?.[d.status] || '#6b7280';
                  const dLabel = dSm?.labels?.[d.status] || d.status;
                  return `<div class="pw-deliverable-item">
                    <span>${this._esc(d.name)}</span>
                    <span class="pw-status-chip" style="background:${dColor}20;color:${dColor};">${dLabel}</span>
                  </div>`;
                }).join('')}
              </div>
            ` : '<p style="color:var(--text-muted);font-size:0.82rem;">Nenhum entregavel cadastrado.</p>'}
          </div>

          ${p.notes ? `
            <div class="pw-overview-card">
              <h3>Observacoes</h3>
              <p style="color:var(--text-secondary);font-size:0.85rem;line-height:1.6;white-space:pre-wrap;">${this._esc(p.notes)}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // ── Board View (Kanban simplificado) ──────────────────────────────────────

  _renderBoardView() {
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
    const statuses = sm ? sm.states : ['pendente', 'em_andamento', 'concluida', 'cancelada'];
    const labels = sm?.labels || { pendente: 'Pendente', em_andamento: 'Em andamento', concluida: 'Concluida', cancelada: 'Cancelada' };
    const colors = sm?.colors || { pendente: '#6b7280', em_andamento: '#3b82f6', concluida: '#22c55e', cancelada: '#ef4444' };

    const columns = statuses.map(status => {
      const tasks = this._tasks.filter(t => t.status === status);
      return `
        <div class="pw-board-col">
          <div class="pw-board-col-header" style="border-top:3px solid ${colors[status]};">
            <span>${labels[status] || status}</span>
            <span class="pw-board-count">${tasks.length}</span>
          </div>
          <div class="pw-board-cards">
            ${tasks.map(t => `
              <div class="pw-board-card" data-task-id="${this._esc(t.id)}" draggable="true">
                <div class="pw-board-card-name">${this._esc(t.title || t.name || 'Sem titulo')}</div>
                ${t.owner ? `<div class="pw-board-card-owner"><i data-lucide="user" style="width:12px;height:12px;"></i> ${this._esc(t.owner)}</div>` : ''}
                ${t.due_date ? `<div class="pw-board-card-date"><i data-lucide="calendar" style="width:12px;height:12px;"></i> ${new Date(t.due_date).toLocaleDateString('pt-BR')}</div>` : ''}
                <div style="display:flex;gap:4px;margin-top:6px;">
                  ${t.priority ? `<span class="pw-priority-chip" style="font-size:0.62rem;background:${{urgente:'#ef4444',alta:'#f59e0b',media:'#3b82f6',baixa:'#6b7280'}[t.priority] || '#6b7280'}15;color:${{urgente:'#ef4444',alta:'#f59e0b',media:'#3b82f6',baixa:'#6b7280'}[t.priority] || '#6b7280'};">${t.priority}</span>` : ''}
                </div>
              </div>
            `).join('')}
            ${tasks.length === 0 ? '<div class="pw-board-empty">Sem tarefas</div>' : ''}
          </div>
        </div>
      `;
    }).join('');

    return `<div class="pw-board">${columns}</div>`;
  },

  // ── Timeline View (placeholder MVP) ───────────────────────────────────────

  _renderTimelineView() {
    return `
      <div class="pw-placeholder-view">
        <i data-lucide="calendar-range" style="width:48px;height:48px;color:var(--text-muted);opacity:0.5;"></i>
        <h3 style="color:var(--text-primary);margin-top:16px;">Cronograma</h3>
        <p style="color:var(--text-muted);font-size:0.85rem;">Visualizacao de cronograma sera disponibilizada em breve.</p>
        <p style="color:var(--text-muted);font-size:0.75rem;margin-top:8px;">Dica: Use a aba Gantt para uma visualizacao temporal.</p>
      </div>
    `;
  },

  // ── Dashboard View ────────────────────────────────────────────────────────

  _renderDashboardView() {
    const tasks = this._tasks;
    const totalTasks = tasks.length;
    const done = tasks.filter(t => t.status === 'concluida').length;
    const inProgress = tasks.filter(t => t.status === 'em_andamento').length;
    const pending = tasks.filter(t => t.status === 'pendente').length;
    const overdue = tasks.filter(t => {
      if (!t.due_date || t.status === 'concluida') return false;
      return new Date(t.due_date) < new Date();
    }).length;

    // Tarefas por responsavel
    const byOwner = {};
    tasks.forEach(t => {
      const owner = t.owner || 'Sem responsavel';
      if (!byOwner[owner]) byOwner[owner] = { total: 0, done: 0 };
      byOwner[owner].total++;
      if (t.status === 'concluida') byOwner[owner].done++;
    });

    return `
      <div class="pw-dashboard">
        <div class="pw-dash-kpis">
          <div class="pw-dash-kpi">
            <div class="pw-dash-kpi-value">${totalTasks}</div>
            <div class="pw-dash-kpi-label">Total</div>
          </div>
          <div class="pw-dash-kpi">
            <div class="pw-dash-kpi-value" style="color:#22c55e;">${done}</div>
            <div class="pw-dash-kpi-label">Concluidas</div>
          </div>
          <div class="pw-dash-kpi">
            <div class="pw-dash-kpi-value" style="color:#3b82f6;">${inProgress}</div>
            <div class="pw-dash-kpi-label">Em andamento</div>
          </div>
          <div class="pw-dash-kpi">
            <div class="pw-dash-kpi-value" style="color:#6b7280;">${pending}</div>
            <div class="pw-dash-kpi-label">Pendentes</div>
          </div>
          <div class="pw-dash-kpi">
            <div class="pw-dash-kpi-value" style="color:#ef4444;">${overdue}</div>
            <div class="pw-dash-kpi-label">Atrasadas</div>
          </div>
        </div>

        <div class="pw-dash-section">
          <h3>Progresso por responsavel</h3>
          ${Object.entries(byOwner).sort((a, b) => b[1].total - a[1].total).map(([owner, data]) => {
            const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;
            return `
              <div class="pw-dash-owner-row">
                <span class="pw-dash-owner-name">${this._esc(owner)}</span>
                <div class="pw-dash-bar-track">
                  <div class="pw-dash-bar-fill" style="width:${pct}%;"></div>
                </div>
                <span class="pw-dash-owner-stat">${data.done}/${data.total}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // ── Gantt View (delega para project-enhancements se disponivel) ───────────

  _renderGanttView() {
    // Tenta usar o Gantt do modulo principal de projetos se existir
    if (typeof TBO_PROJETOS !== 'undefined' && TBO_PROJETOS._renderGanttTab) {
      // Precisa garantir que o contexto correto esteja disponivel
      const tasks = this._tasks.filter(t => t.status !== 'cancelada');
      if (tasks.length === 0) {
        return `
          <div class="pw-placeholder-view">
            <i data-lucide="gantt-chart" style="width:48px;height:48px;color:var(--text-muted);opacity:0.5;"></i>
            <h3 style="color:var(--text-primary);margin-top:16px;">Gantt</h3>
            <p style="color:var(--text-muted);font-size:0.85rem;">Adicione tarefas com datas para visualizar o Gantt.</p>
          </div>
        `;
      }

      // Gantt inline simplificado
      const today = new Date();
      const allDates = tasks.filter(t => t.start_date || t.due_date).map(t => [t.start_date, t.due_date]).flat().filter(Boolean).map(d => new Date(d).getTime());
      if (allDates.length === 0) {
        return `<div class="pw-placeholder-view"><p style="color:var(--text-muted);">Nenhuma tarefa com datas definidas.</p></div>`;
      }

      const minDate = new Date(Math.min(...allDates, today.getTime()));
      const maxDate = new Date(Math.max(...allDates, today.getTime()));
      const totalDays = Math.max(1, Math.ceil((maxDate - minDate) / 86400000) + 7);

      return `
        <div class="pw-gantt">
          <div class="pw-gantt-header">
            <div class="pw-gantt-task-col">Tarefa</div>
            <div class="pw-gantt-timeline" style="min-width:${totalDays * 3}px;">
              <div class="pw-gantt-today-line" style="left:${Math.ceil((today - minDate) / 86400000) * 3}px;"></div>
            </div>
          </div>
          ${tasks.filter(t => t.start_date || t.due_date).map(t => {
            const start = new Date(t.start_date || t.due_date);
            const end = new Date(t.due_date || t.start_date);
            const leftPx = Math.ceil((start - minDate) / 86400000) * 3;
            const widthPx = Math.max(6, Math.ceil((end - start) / 86400000 + 1) * 3);
            const isDone = t.status === 'concluida';
            const barColor = isDone ? '#22c55e' : (t.priority === 'urgente' ? '#ef4444' : t.priority === 'alta' ? '#f59e0b' : '#3b82f6');

            return `
              <div class="pw-gantt-row">
                <div class="pw-gantt-task-col">${this._esc((t.title || t.name || '').slice(0, 30))}</div>
                <div class="pw-gantt-timeline" style="min-width:${totalDays * 3}px;">
                  <div class="pw-gantt-bar" style="left:${leftPx}px;width:${widthPx}px;background:${barColor};${isDone ? 'opacity:0.6;' : ''}"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    return `
      <div class="pw-placeholder-view">
        <i data-lucide="gantt-chart" style="width:48px;height:48px;color:var(--text-muted);opacity:0.5;"></i>
        <h3 style="color:var(--text-primary);margin-top:16px;">Gantt</h3>
        <p style="color:var(--text-muted);font-size:0.85rem;">Visualizacao Gantt sera disponibilizada em breve.</p>
      </div>
    `;
  },

  // ── Skeleton (loading state) ──────────────────────────────────────────────

  _renderSkeleton() {
    return `
      <div class="pw-container" style="padding:24px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <div class="pw-skel" style="width:32px;height:32px;border-radius:8px;"></div>
          <div>
            <div class="pw-skel" style="width:220px;height:14px;border-radius:4px;margin-bottom:6px;"></div>
            <div class="pw-skel" style="width:320px;height:22px;border-radius:4px;"></div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:20px;">
          ${[1,2,3,4,5,6].map(() => `<div class="pw-skel" style="width:80px;height:32px;border-radius:6px;"></div>`).join('')}
        </div>
        <div class="pw-skel" style="width:100%;height:36px;border-radius:6px;margin-bottom:16px;"></div>
        ${[1,2,3,4,5].map(() => `<div class="pw-skel" style="width:100%;height:42px;border-radius:6px;margin-bottom:4px;"></div>`).join('')}
      </div>
      <style>
        .pw-skel { background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-elevated) 50%, var(--bg-tertiary) 75%); background-size: 200% 100%; animation: pw-shimmer 1.5s ease-in-out infinite; }
        @keyframes pw-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      </style>
    `;
  },

  // ── Event Bindings ────────────────────────────────────────────────────────

  _bindSectionToggles() {
    document.querySelectorAll('[data-section-toggle]').forEach(el => {
      el.addEventListener('click', () => {
        const sectionName = el.dataset.sectionToggle;
        const section = this._sections.find(s => s.name === sectionName);
        if (section) {
          section.collapsed = !section.collapsed;
          this._expandedSections[sectionName] = !section.collapsed;
          // Re-render list content
          const content = document.getElementById('pwTabContent');
          if (content && this._activeTab === 'list') {
            content.innerHTML = this._renderListView();
            this._bindSectionToggles();
            this._bindActions();
            if (window.lucide) lucide.createIcons();
          }
        }
      });
    });
  },

  _bindActions() {
    // Adicionar tarefa (botao toolbar)
    const addTaskBtn = document.getElementById('pwAddTask');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => {
        const firstSection = this._sections[0]?.name || 'Planejamento';
        this._showInlineTaskInput(null, firstSection);
      });
    }

    // Adicionar secao
    const addSectionBtn = document.getElementById('pwAddSection');
    if (addSectionBtn) {
      addSectionBtn.addEventListener('click', () => this._addSectionInline());
    }

    // Toggle tarefa (check/uncheck)
    document.querySelectorAll('.pw-check-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.taskId;
        this._toggleTask(taskId);
      });
    });

    // Click na row abre task detail panel
    document.querySelectorAll('.pw-list-row').forEach(row => {
      row.addEventListener('click', (e) => {
        // Nao abrir se clicou no check, menu, drag handle, ou input
        if (e.target.closest('.pw-check-btn') || e.target.closest('.pw-row-menu-btn') ||
            e.target.closest('.pw-drag-handle') || e.target.closest('input')) return;
        const taskId = row.dataset.taskId;
        if (taskId) this._openTaskDetail(taskId);
      });
    });

    // Botao (⋯) context menu por tarefa
    document.querySelectorAll('.pw-row-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = btn.getBoundingClientRect();
        this._showTaskContextMenu(btn.dataset.taskId, rect.right - 210, rect.bottom + 4);
      });
    });

    // Right-click context menu em rows
    document.querySelectorAll('.pw-list-row').forEach(row => {
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const taskId = row.dataset.taskId;
        if (taskId) this._showTaskContextMenu(taskId, e.clientX, e.clientY);
      });
    });

    // Drag and drop para reordenacao
    this._initListDragDrop();

    // Board card clicks (abrir detalhe)
    document.querySelectorAll('.pw-board-card').forEach(card => {
      card.addEventListener('click', () => {
        const taskId = card.dataset.taskId;
        if (taskId) this._openTaskDetail(taskId);
      });
    });

    // Toolbar buttons (filtros, ordenar, agrupar, opcoes)
    this._bindToolbarButtons();
  },

  // ── Actions ───────────────────────────────────────────────────────────────

  _showInlineTaskInput(placeholder, sectionName) {
    // Se clicou no placeholder, substituir por input inline
    const section = document.querySelector(`.pw-add-task-row[data-section="${sectionName}"]`);
    if (!section) {
      // Fallback: usar primeira secao visivel
      const firstRow = document.querySelector('.pw-add-task-row');
      if (firstRow) {
        sectionName = firstRow.dataset.section;
      }
    }

    const target = section || document.querySelector('.pw-add-task-row');
    if (!target) return;

    target.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
        <i data-lucide="circle" style="width:18px;height:18px;color:var(--text-muted);opacity:0.4;flex-shrink:0;margin-left:28px;"></i>
        <input type="text" class="pw-inline-input" placeholder="Nome da tarefa..." autofocus
          onkeydown="if(event.key==='Enter'){TBO_PROJECT_WORKSPACE._createTaskInline(this.value,'${this._esc(sectionName)}');}"
          onblur="setTimeout(()=>TBO_PROJECT_WORKSPACE._restorePlaceholder('${this._esc(sectionName)}'),200);">
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    const input = target.querySelector('input');
    if (input) input.focus();
  },

  _restorePlaceholder(sectionName) {
    const target = document.querySelector(`.pw-add-task-row[data-section="${sectionName}"]`);
    if (!target) return;
    target.innerHTML = `
      <span class="pw-add-task-placeholder" onclick="TBO_PROJECT_WORKSPACE._showInlineTaskInput(this, '${this._esc(sectionName)}')">
        <i data-lucide="plus" style="width:14px;height:14px;opacity:0.5;"></i> Adicionar tarefa...
      </span>
    `;
    if (window.lucide) lucide.createIcons();
  },

  _createTaskInline(title, sectionName) {
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      project_id: this._projectId,
      project_name: this._project?.name || '',
      owner: '',
      status: 'pendente',
      priority: 'media',
      phase: sectionName,
      due_date: '',
      source: 'manual'
    };

    if (typeof TBO_STORAGE !== 'undefined') {
      TBO_STORAGE.addErpEntity('task', taskData);
      if (typeof TBO_ERP !== 'undefined') {
        TBO_ERP.addAuditLog(this._projectId, 'task_added', `Tarefa "${title.trim()}" criada na secao ${sectionName}`);
      }
    }

    // Recarregar dados e re-render lista
    this._loadProject();
    const content = document.getElementById('pwTabContent');
    if (content && this._activeTab === 'list') {
      content.innerHTML = this._renderListView();
      this._bindSectionToggles();
      this._bindActions();
      if (window.lucide) lucide.createIcons();
    }

    if (typeof TBO_TOAST !== 'undefined') {
      TBO_TOAST.success('Tarefa criada', `"${title.trim()}" adicionada a ${sectionName}`);
    }
  },

  _addSectionInline() {
    const el = document.getElementById('pwAddSection');
    if (!el) return;

    el.innerHTML = `
      <input type="text" class="pw-inline-input" placeholder="Nome da secao..." autofocus
        style="font-weight:600;"
        onkeydown="if(event.key==='Enter'){TBO_PROJECT_WORKSPACE._createSection(this.value);}"
        onblur="setTimeout(()=>{const el=document.getElementById('pwAddSection');if(el)el.innerHTML='<i data-lucide=\\'plus\\' style=\\'width:15px;height:15px;\\'></i> Adicionar secao';if(window.lucide)lucide.createIcons();},200);">
    `;
    el.querySelector('input')?.focus();
  },

  _createSection(name) {
    if (!name.trim()) return;
    const exists = this._sections.find(s => s.name === name.trim());
    if (exists) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Secao existente', 'Ja existe uma secao com esse nome.');
      return;
    }

    this._sections.push({ name: name.trim(), tasks: [], collapsed: false });
    this._expandedSections[name.trim()] = true;

    // Re-render
    const content = document.getElementById('pwTabContent');
    if (content && this._activeTab === 'list') {
      content.innerHTML = this._renderListView();
      this._bindSectionToggles();
      this._bindActions();
      if (window.lucide) lucide.createIcons();
    }

    if (typeof TBO_TOAST !== 'undefined') {
      TBO_TOAST.success('Secao criada', `"${name.trim()}" adicionada ao projeto`);
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // TASK DETAIL PANEL (slide-in drawer, Asana-style)
  // ══════════════════════════════════════════════════════════════════════

  _openTaskDetail(taskId) {
    const task = this._tasks.find(t => t.id === taskId);
    if (!task) return;

    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
    const isDone = task.status === 'concluida';
    const priorityColor = { 'urgente': '#ef4444', 'alta': '#f59e0b', 'media': '#3b82f6', 'baixa': '#6b7280' }[task.priority] || '#6b7280';
    const statusLabel = sm?.labels?.[task.status] || task.status || '-';
    const statusColor = sm?.colors?.[task.status] || '#6b7280';

    // Criar/atualizar elementos
    let detail = document.getElementById('pwTaskDetail');
    let backdrop = document.getElementById('pwDetailBackdrop');

    if (!detail) {
      detail = document.createElement('div');
      detail.id = 'pwTaskDetail';
      detail.className = 'pw-task-detail';
      document.body.appendChild(detail);
    }
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'pwDetailBackdrop';
      backdrop.className = 'pw-detail-backdrop';
      document.body.appendChild(backdrop);
    }

    const statusOptions = ['pendente', 'em_andamento', 'revisao', 'concluida', 'bloqueada'].map(s => {
      const lbl = sm?.labels?.[s] || s;
      return `<option value="${s}" ${task.status === s ? 'selected' : ''}>${this._esc(lbl)}</option>`;
    }).join('');

    const priorityOptions = ['urgente', 'alta', 'media', 'baixa'].map(p =>
      `<option value="${p}" ${task.priority === p ? 'selected' : ''}>${p.charAt(0).toUpperCase() + p.slice(1)}</option>`
    ).join('');

    detail.innerHTML = `
      <div class="pw-detail-header">
        <button class="pw-check-btn${isDone ? ' pw-check-btn--done' : ''}" id="pwDetailCheck" data-task-id="${this._esc(taskId)}" style="margin-top:2px;">
          <i data-lucide="${isDone ? 'check-circle-2' : 'circle'}" style="width:22px;height:22px;"></i>
        </button>
        <div style="flex:1;">
          <input type="text" class="pw-detail-input" id="pwDetailTitle" value="${this._esc(task.title || task.name || '')}" style="font-size:1.1rem;font-weight:700;border:none;padding:0;background:transparent;" />
        </div>
        <button class="btn btn-ghost btn-sm" id="pwDetailClose" style="flex-shrink:0;">
          <i data-lucide="x" style="width:18px;height:18px;"></i>
        </button>
      </div>

      <div class="pw-detail-body">
        <!-- Status & Priority -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
          <div class="pw-detail-field">
            <div class="pw-detail-label">Status</div>
            <select class="pw-detail-select" id="pwDetailStatus" style="width:100%;">
              ${statusOptions}
            </select>
          </div>
          <div class="pw-detail-field">
            <div class="pw-detail-label">Prioridade</div>
            <select class="pw-detail-select" id="pwDetailPriority" style="width:100%;">
              ${priorityOptions}
            </select>
          </div>
        </div>

        <!-- Responsavel & Datas -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
          <div class="pw-detail-field">
            <div class="pw-detail-label">Responsavel</div>
            <input type="text" class="pw-detail-input" id="pwDetailOwner" value="${this._esc(task.owner || '')}" placeholder="Sem responsavel" />
          </div>
          <div class="pw-detail-field">
            <div class="pw-detail-label">Data de conclusao</div>
            <input type="date" class="pw-detail-input" id="pwDetailDueDate" value="${task.due_date || ''}" />
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
          <div class="pw-detail-field">
            <div class="pw-detail-label">Secao</div>
            <div class="pw-detail-value">${this._esc(task.phase || '-')}</div>
          </div>
          <div class="pw-detail-field">
            <div class="pw-detail-label">Projeto</div>
            <div class="pw-detail-value">${this._esc(this._project?.name || '-')}</div>
          </div>
        </div>

        <!-- Descricao -->
        <div class="pw-detail-field">
          <div class="pw-detail-label">Descricao</div>
          <textarea class="pw-detail-textarea" id="pwDetailDesc" placeholder="Adicionar descricao...">${this._esc(task.description || task.notes || '')}</textarea>
        </div>

        <!-- Subtarefas -->
        <div class="pw-detail-field">
          <div class="pw-detail-label">Subtarefas</div>
          <div style="padding:8px 0;font-size:0.78rem;color:var(--text-muted);">
            ${task.subtasks && task.subtasks.length ? task.subtasks.map(st => `
              <div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
                <i data-lucide="${st.done ? 'check-circle-2' : 'circle'}" style="width:14px;height:14px;color:${st.done ? 'var(--color-success)' : 'var(--text-muted)'};"></i>
                <span style="${st.done ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${this._esc(st.title || st.name || '')}</span>
              </div>`).join('') : '<span>Nenhuma subtarefa</span>'}
          </div>
        </div>

        <!-- Acoes -->
        <div style="display:flex;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border-subtle);">
          <button class="btn btn-primary btn-sm" id="pwDetailSave">
            <i data-lucide="save" style="width:14px;height:14px;"></i> Salvar
          </button>
          <button class="btn btn-secondary btn-sm" id="pwDetailDuplicate">
            <i data-lucide="copy" style="width:14px;height:14px;"></i> Duplicar
          </button>
          <button class="btn btn-ghost btn-sm" id="pwDetailDelete" style="color:var(--color-danger);margin-left:auto;">
            <i data-lucide="trash-2" style="width:14px;height:14px;"></i> Excluir
          </button>
        </div>
      </div>
    `;

    // Mostrar com animacao
    detail.style.display = 'block';
    backdrop.style.display = 'block';
    requestAnimationFrame(() => {
      backdrop.classList.add('pw-detail-open');
      detail.classList.add('pw-detail-open');
    });
    if (window.lucide) lucide.createIcons();

    // Bindings do painel
    this._bindTaskDetailActions(taskId);
  },

  _closeTaskDetail() {
    const detail = document.getElementById('pwTaskDetail');
    const backdrop = document.getElementById('pwDetailBackdrop');
    if (detail) {
      detail.classList.remove('pw-detail-open');
      setTimeout(() => { detail.style.display = 'none'; }, 250);
    }
    if (backdrop) {
      backdrop.classList.remove('pw-detail-open');
      setTimeout(() => { backdrop.style.display = 'none'; }, 200);
    }
    if (this._detailEscHandler) {
      document.removeEventListener('keydown', this._detailEscHandler);
      this._detailEscHandler = null;
    }
  },

  _bindTaskDetailActions(taskId) {
    // Fechar
    const closeBtn = document.getElementById('pwDetailClose');
    if (closeBtn) closeBtn.addEventListener('click', () => this._closeTaskDetail());

    const backdrop = document.getElementById('pwDetailBackdrop');
    if (backdrop) backdrop.addEventListener('click', () => this._closeTaskDetail());

    this._detailEscHandler = (e) => { if (e.key === 'Escape') this._closeTaskDetail(); };
    document.addEventListener('keydown', this._detailEscHandler);

    // Check/uncheck no painel
    const checkBtn = document.getElementById('pwDetailCheck');
    if (checkBtn) checkBtn.addEventListener('click', () => {
      this._toggleTask(taskId);
      this._closeTaskDetail();
      setTimeout(() => this._openTaskDetail(taskId), 300);
    });

    // Salvar alteracoes
    const saveBtn = document.getElementById('pwDetailSave');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      const task = this._tasks.find(t => t.id === taskId);
      if (!task) return;

      const newTitle = document.getElementById('pwDetailTitle')?.value?.trim();
      const newStatus = document.getElementById('pwDetailStatus')?.value;
      const newPriority = document.getElementById('pwDetailPriority')?.value;
      const newOwner = document.getElementById('pwDetailOwner')?.value?.trim();
      const newDueDate = document.getElementById('pwDetailDueDate')?.value;
      const newDesc = document.getElementById('pwDetailDesc')?.value?.trim();

      if (newTitle) task.title = newTitle;
      if (newTitle) task.name = newTitle;
      if (newStatus) task.status = newStatus;
      if (newPriority) task.priority = newPriority;
      task.owner = newOwner || '';
      task.due_date = newDueDate || '';
      task.description = newDesc || '';

      // Persistir
      if (typeof TBO_STORAGE !== 'undefined') {
        TBO_STORAGE.updateErpEntity('task', taskId, task);
      }

      this._closeTaskDetail();
      this._refreshListView();
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Tarefa atualizada!');
    });

    // Duplicar
    const dupBtn = document.getElementById('pwDetailDuplicate');
    if (dupBtn) dupBtn.addEventListener('click', () => {
      const task = this._tasks.find(t => t.id === taskId);
      if (!task) return;
      const newTask = { ...task, id: undefined, title: (task.title || task.name) + ' (copia)', status: 'pendente' };
      if (typeof TBO_STORAGE !== 'undefined') {
        TBO_STORAGE.addErpEntity('task', newTask);
      }
      this._closeTaskDetail();
      this._loadProject();
      this._refreshListView();
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Tarefa duplicada!');
    });

    // Excluir
    const delBtn = document.getElementById('pwDetailDelete');
    if (delBtn) delBtn.addEventListener('click', () => {
      if (!confirm('Excluir esta tarefa permanentemente?')) return;
      if (typeof TBO_STORAGE !== 'undefined') {
        TBO_STORAGE.deleteErpEntity('task', taskId);
      }
      this._closeTaskDetail();
      this._loadProject();
      this._refreshListView();
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Tarefa excluida');
    });
  },

  _refreshListView() {
    this._loadProject();
    const content = document.getElementById('pwTabContent');
    if (content && (this._activeTab === 'list' || this._activeTab === 'board')) {
      content.innerHTML = this._activeTab === 'list' ? this._renderListView() : this._renderBoardView();
      this._bindSectionToggles();
      this._bindActions();
      if (window.lucide) lucide.createIcons();
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // CONTEXT MENU (tarefas, secoes)
  // ══════════════════════════════════════════════════════════════════════

  _showTaskContextMenu(taskId, x, y) {
    const task = this._tasks.find(t => t.id === taskId);
    if (!task) return;
    const isDone = task.status === 'concluida';
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;

    let menu = document.getElementById('pwContextMenu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'pwContextMenu';
      menu.className = 'pw-context-menu';
      document.body.appendChild(menu);
    }

    const items = [
      { icon: 'external-link', label: 'Abrir detalhes', action: 'open_detail' },
      { icon: isDone ? 'rotate-ccw' : 'check-circle', label: isDone ? 'Reabrir tarefa' : 'Marcar como concluida', action: 'toggle_done' },
      { divider: true },
      { icon: 'copy', label: 'Duplicar', action: 'duplicate' },
      { icon: 'list-plus', label: 'Adicionar subtarefa', action: 'add_subtask' },
      { icon: 'link', label: 'Copiar link', action: 'copy_link' },
      { divider: true },
      { icon: 'trash-2', label: 'Excluir', action: 'delete', danger: true }
    ];

    menu.innerHTML = items.map(item => {
      if (item.divider) return '<div class="pw-ctx-divider"></div>';
      return `<button class="pw-ctx-item ${item.danger ? 'pw-ctx-item--danger' : ''}" data-action="${item.action}" data-task-id="${taskId}">
        <i data-lucide="${item.icon}" style="width:14px;height:14px;"></i>
        <span>${item.label}</span>
      </button>`;
    }).join('');

    // Posicionar (viewport-aware)
    const menuW = 210, menuH = items.length * 36;
    const vw = window.innerWidth, vh = window.innerHeight;
    const posX = x + menuW > vw ? x - menuW : x;
    const posY = y + menuH > vh ? Math.max(8, y - menuH) : y;

    menu.style.cssText = `display:block;position:fixed;top:${posY}px;left:${posX}px;z-index:1100;`;
    if (window.lucide) lucide.createIcons();

    // Bind acoes
    menu.querySelectorAll('.pw-ctx-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.style.display = 'none';
        this._handleTaskContextAction(btn.dataset.action, btn.dataset.taskId);
      });
    });

    // Fechar ao clicar fora
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        menu.style.display = 'none';
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 10);
  },

  _handleTaskContextAction(action, taskId) {
    switch (action) {
      case 'open_detail':
        this._openTaskDetail(taskId);
        break;
      case 'toggle_done':
        this._toggleTask(taskId);
        break;
      case 'duplicate': {
        const task = this._tasks.find(t => t.id === taskId);
        if (task && typeof TBO_STORAGE !== 'undefined') {
          TBO_STORAGE.addErpEntity('task', { ...task, id: undefined, title: (task.title || task.name) + ' (copia)', status: 'pendente' });
          this._refreshListView();
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Tarefa duplicada!');
        }
        break;
      }
      case 'add_subtask':
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Em desenvolvimento', 'Adicionar subtarefa inline sera implementado em breve.');
        break;
      case 'copy_link':
        navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#projeto/${this._projectId}/list?task=${taskId}`).then(() => {
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Link copiado!');
        });
        break;
      case 'delete':
        if (confirm('Excluir esta tarefa?')) {
          if (typeof TBO_STORAGE !== 'undefined') TBO_STORAGE.deleteErpEntity('task', taskId);
          this._refreshListView();
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Tarefa excluida');
        }
        break;
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // DRAG AND DROP (reordenacao de tarefas)
  // ══════════════════════════════════════════════════════════════════════

  _initListDragDrop() {
    let draggedId = null;

    document.querySelectorAll('.pw-drag-handle').forEach(handle => {
      const row = handle.closest('.pw-list-row');
      if (!row) return;

      handle.addEventListener('mousedown', (e) => {
        row.draggable = true;
      });

      row.addEventListener('dragstart', (e) => {
        draggedId = row.dataset.taskId;
        row.classList.add('pw-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedId);
      });

      row.addEventListener('dragend', () => {
        row.classList.remove('pw-dragging');
        row.draggable = false;
        document.querySelectorAll('.pw-drag-over').forEach(el => el.classList.remove('pw-drag-over'));
      });
    });

    // Drop targets (todas as rows)
    document.querySelectorAll('.pw-list-row').forEach(row => {
      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (row.dataset.taskId !== draggedId) {
          row.classList.add('pw-drag-over');
        }
      });

      row.addEventListener('dragleave', () => {
        row.classList.remove('pw-drag-over');
      });

      row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('pw-drag-over');
        const targetId = row.dataset.taskId;
        if (!draggedId || draggedId === targetId) return;

        // Reordenar tarefas na mesma secao
        const section = this._sections.find(s => s.tasks.some(t => t.id === draggedId));
        if (section) {
          const fromIdx = section.tasks.findIndex(t => t.id === draggedId);
          const toIdx = section.tasks.findIndex(t => t.id === targetId);
          if (fromIdx !== -1 && toIdx !== -1) {
            const [moved] = section.tasks.splice(fromIdx, 1);
            section.tasks.splice(toIdx, 0, moved);
            // Atualizar position nos dados
            section.tasks.forEach((t, i) => { t.position = i; });
            this._refreshListView();
            if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Tarefa reordenada');
          }
        }
        draggedId = null;
      });
    });
  },

  // ── Popup Management ───────────────────────────────────────────────────

  _showPopup(html) {
    this._closePopup();
    const anchor = document.getElementById('pwPopupAnchor');
    if (!anchor) return;
    anchor.innerHTML = html;
    this._openPopup = true;
    if (window.lucide) lucide.createIcons();

    // Fechar ao clicar fora
    setTimeout(() => {
      document.addEventListener('click', this._handleOutsideClick);
    }, 50);
  },

  _handleOutsideClick(e) {
    const popup = document.getElementById('pwPopup');
    if (popup && !popup.contains(e.target) && !e.target.closest('.pw-toolbar-btn') && !e.target.closest('#pwBtnOptions')) {
      TBO_PROJECT_WORKSPACE._closePopup();
    }
  },

  _closePopup() {
    const anchor = document.getElementById('pwPopupAnchor');
    if (anchor) anchor.innerHTML = '';
    this._openPopup = null;
    document.removeEventListener('click', this._handleOutsideClick);
  },

  _showOptionsPopup() { this._showPopup(this._renderOptionsPopup()); },
  _showColumnsPopup() { this._showPopup(this._renderColumnsPopup()); },
  _showFilterPopup() { this._showPopup(this._renderFilterPopup()); },
  _showSortPopup() { this._showPopup(this._renderSortPopup()); },
  _showGroupPopup() { this._showPopup(this._renderGroupPopup()); },

  // ── Column Toggle ─────────────────────────────────────────────────────

  _toggleColumn(colId, visible) {
    const col = this._columns.find(c => c.id === colId);
    if (col && !col.locked) {
      col.visible = visible;
      // Salvar preferencia
      this._saveColumnPrefs();
      // Re-render list + popup
      this._refreshListContent();
      this._showColumnsPopup();
    }
  },

  _saveColumnPrefs() {
    try {
      const prefs = this._columns.reduce((acc, c) => { acc[c.id] = c.visible; return acc; }, {});
      localStorage.setItem(`pw_cols_${this._projectId}`, JSON.stringify(prefs));
    } catch (e) { /* ignore */ }
  },

  _loadColumnPrefs() {
    try {
      const raw = localStorage.getItem(`pw_cols_${this._projectId}`);
      if (raw) {
        const prefs = JSON.parse(raw);
        this._columns.forEach(c => { if (prefs[c.id] !== undefined && !c.locked) c.visible = prefs[c.id]; });
      }
    } catch (e) { /* ignore */ }
  },

  // ── Filter Actions ────────────────────────────────────────────────────

  _addFilter() {
    this._activeFilters.push({ field: 'status', operator: 'eq', value: '', id: Date.now() });
    this._showFilterPopup();
  },

  // Quando troca o campo, reseta operador e valor para o primeiro operador do novo tipo
  _updateFilterField(idx, newField) {
    if (!this._activeFilters[idx]) return;
    const oldField = this._activeFilters[idx].field;
    const oldType = this._getFieldType(oldField);
    const newType = this._getFieldType(newField);
    this._activeFilters[idx].field = newField;
    // Se mudou de tipo, reseta operador e valor
    if (oldType !== newType) {
      const ops = this._filterOperatorsByType[newType] || this._filterOperatorsByType.text;
      this._activeFilters[idx].operator = ops[0]?.value || 'eq';
      this._activeFilters[idx].value = '';
    }
    this._showFilterPopup(); // re-render para atualizar UI
    this._refreshListContent();
  },

  _updateFilter(idx, prop, value) {
    if (this._activeFilters[idx]) {
      this._activeFilters[idx][prop] = value;
      this._refreshListContent();
    }
  },

  // Atualiza uma parte do range de data (para operador 'between')
  _updateFilterDateRange(idx, partIdx, value) {
    if (!this._activeFilters[idx]) return;
    const parts = (this._activeFilters[idx].value || '|').split('|');
    parts[partIdx] = value;
    this._activeFilters[idx].value = parts.join('|');
    this._refreshListContent();
  },

  // Toggle valor em multi-select (operadores 'in'/'not_in')
  _toggleMultiFilterValue(idx, option) {
    if (!this._activeFilters[idx]) return;
    const current = (this._activeFilters[idx].value || '').split(',').filter(Boolean);
    const i = current.indexOf(option);
    if (i >= 0) current.splice(i, 1);
    else current.push(option);
    this._activeFilters[idx].value = current.join(',');
    this._refreshListContent();
  },

  _removeFilter(idx) {
    this._activeFilters.splice(idx, 1);
    this._refreshListContent();
    this._showFilterPopup();
  },

  _clearFilters() {
    this._activeFilters = [];
    this._refreshListContent();
    this._showFilterPopup();
  },

  _saveFilterSet() {
    if (this._activeFilters.length === 0) return;
    const name = prompt('Nome do filtro:');
    if (!name) return;
    this._savedFilters.push({
      id: Date.now(),
      name: name.trim(),
      icon: '🔍',
      filters: JSON.parse(JSON.stringify(this._activeFilters))
    });
    this._saveSavedFilters();
    this._showFilterPopup();
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Filtro salvo', `"${name.trim()}" salvo com sucesso`);
  },

  _applySavedFilter(idx) {
    if (this._savedFilters[idx]) {
      this._activeFilters = JSON.parse(JSON.stringify(this._savedFilters[idx].filters));
      this._refreshListContent();
      this._closePopup();
    }
  },

  _renameSavedFilter(idx, newName) {
    if (this._savedFilters[idx]) {
      this._savedFilters[idx].name = newName.trim();
      this._saveSavedFilters();
    }
  },

  _deleteSavedFilter(idx) {
    this._savedFilters.splice(idx, 1);
    this._saveSavedFilters();
    this._showFilterPopup();
  },

  _saveSavedFilters() {
    try {
      localStorage.setItem(`pw_filters_${this._projectId}`, JSON.stringify(this._savedFilters));
    } catch (e) { /* ignore */ }
  },

  _loadSavedFilters() {
    try {
      const raw = localStorage.getItem(`pw_filters_${this._projectId}`);
      if (raw) this._savedFilters = JSON.parse(raw);
    } catch (e) { /* ignore */ }
  },

  // ── Sort Actions ──────────────────────────────────────────────────────

  _setSort(field) {
    if (this._sortBy?.field === field) {
      this._sortBy.asc = !this._sortBy.asc;
    } else {
      this._sortBy = { field, asc: true };
    }
    this._refreshListContent();
    this._showSortPopup();
  },

  _clearSort() {
    this._sortBy = null;
    this._refreshListContent();
    this._closePopup();
  },

  // ── Group Actions ─────────────────────────────────────────────────────

  _setGroup(field) {
    this._groupBy = field;
    this._refreshListContent();
    this._closePopup();
  },

  // ── Subtask Toggle ────────────────────────────────────────────────────

  _cycleSubtasks() {
    const cycle = { expanded: 'collapsed', collapsed: 'hidden', hidden: 'expanded' };
    this._showSubtasks = cycle[this._showSubtasks] || 'collapsed';
    this._refreshListContent();
    this._showOptionsPopup(); // Refresh popup
  },

  // ── Rename Tab ────────────────────────────────────────────────────────

  _renameTab(newName) {
    const tab = this._tabs.find(t => t.id === this._activeTab);
    if (tab && newName.trim()) {
      tab.label = newName.trim();
      // Re-render tabs
      const tabsBar = document.querySelector('.pw-tabs-bar');
      if (tabsBar) {
        tabsBar.outerHTML = this._renderTabs();
        // Re-bind tab clicks
        document.querySelectorAll('.pw-tab').forEach(t => {
          t.addEventListener('click', (e) => {
            const tabId = e.currentTarget.dataset.tab;
            if (tabId !== this._activeTab) {
              TBO_ROUTER.navigate(`projeto/${this._projectId}/${tabId}`);
            }
          });
        });
        if (window.lucide) lucide.createIcons();
      }
    }
  },

  // ── Apply filters & sort to tasks ─────────────────────────────────────

  _getFilteredSortedTasks() {
    let tasks = [...this._tasks];

    // Helper: inicio e fim da semana corrente (seg a dom)
    const _weekRange = (offsetWeeks = 0) => {
      const now = new Date();
      const day = now.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday + (offsetWeeks * 7));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return [monday, sunday];
    };

    // Helper: inicio e fim do mes corrente
    const _monthRange = () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return [start, end];
    };

    // Aplicar filtros
    this._activeFilters.forEach(f => {
      const fieldType = this._getFieldType(f.field);
      const op = f.operator;
      // Operadores sem valor — nao pular por falta de value
      const noValueOps = ['empty', 'not_empty', 'this_week', 'next_week', 'this_month', 'overdue'];
      if (!f.value && !noValueOps.includes(op)) return;

      tasks = tasks.filter(t => {
        const raw = t[f.field];
        const val = String(raw ?? '').toLowerCase().trim();
        const filterVal = (f.value || '').toLowerCase().trim();

        // ── Operadores universais ──
        if (op === 'empty') return !val || val === '' || val === '-';
        if (op === 'not_empty') return val && val !== '' && val !== '-';

        // ── Texto ──
        if (fieldType === 'text') {
          switch (op) {
            case 'eq': return val === filterVal;
            case 'neq': return val !== filterVal;
            case 'contains': return val.includes(filterVal);
            case 'not_contains': return !val.includes(filterVal);
            case 'starts_with': return val.startsWith(filterVal);
            case 'ends_with': return val.endsWith(filterVal);
            default: return true;
          }
        }

        // ── Select ──
        if (fieldType === 'select') {
          switch (op) {
            case 'eq': return val === filterVal;
            case 'neq': return val !== filterVal;
            case 'in': {
              const arr = filterVal.split(',').map(s => s.trim()).filter(Boolean);
              return arr.length === 0 || arr.includes(val);
            }
            case 'not_in': {
              const arr = filterVal.split(',').map(s => s.trim()).filter(Boolean);
              return arr.length === 0 || !arr.includes(val);
            }
            default: return true;
          }
        }

        // ── Date ──
        if (fieldType === 'date') {
          const dateVal = raw ? new Date(raw) : null;
          const now = new Date();
          switch (op) {
            case 'eq': return val === filterVal;
            case 'before': return dateVal && dateVal < new Date(f.value);
            case 'after': return dateVal && dateVal > new Date(f.value);
            case 'between': {
              if (!dateVal) return false;
              const parts = (f.value || '').split('|');
              const from = parts[0] ? new Date(parts[0]) : null;
              const to = parts[1] ? new Date(parts[1]) : null;
              if (from && dateVal < from) return false;
              if (to && dateVal > to) return false;
              return true;
            }
            case 'this_week': {
              if (!dateVal) return false;
              const [ws, we] = _weekRange(0);
              return dateVal >= ws && dateVal <= we;
            }
            case 'next_week': {
              if (!dateVal) return false;
              const [ws, we] = _weekRange(1);
              return dateVal >= ws && dateVal <= we;
            }
            case 'this_month': {
              if (!dateVal) return false;
              const [ms, me] = _monthRange();
              return dateVal >= ms && dateVal <= me;
            }
            case 'overdue': {
              if (!dateVal) return false;
              const taskStatus = String(t.status || '').toLowerCase();
              return dateVal < now && taskStatus !== 'concluida' && taskStatus !== 'cancelada';
            }
            default: return true;
          }
        }

        // ── Number ──
        if (fieldType === 'number') {
          const numVal = raw != null ? parseFloat(raw) : NaN;
          const numFilter = parseFloat(f.value);
          if (isNaN(numFilter)) return true;
          switch (op) {
            case 'eq': return numVal === numFilter;
            case 'neq': return numVal !== numFilter;
            case 'gt': return numVal > numFilter;
            case 'lt': return numVal < numFilter;
            case 'gte': return numVal >= numFilter;
            case 'lte': return numVal <= numFilter;
            default: return true;
          }
        }

        // ── Boolean ──
        if (fieldType === 'boolean') {
          const boolVal = !!raw;
          const boolFilter = filterVal === 'true';
          return op === 'eq' ? boolVal === boolFilter : boolVal !== boolFilter;
        }

        // Fallback texto simples
        switch (op) {
          case 'eq': return val === filterVal;
          case 'neq': return val !== filterVal;
          case 'contains': return val.includes(filterVal);
          default: return true;
        }
      });
    });

    // Aplicar ordenacao
    if (this._sortBy) {
      const { field, asc } = this._sortBy;
      tasks.sort((a, b) => {
        let va = a[field] || '';
        let vb = b[field] || '';
        if (field === 'priority') {
          const order = { urgente: 0, alta: 1, media: 2, baixa: 3 };
          va = order[va] ?? 4;
          vb = order[vb] ?? 4;
        }
        if (va < vb) return asc ? -1 : 1;
        if (va > vb) return asc ? 1 : -1;
        return 0;
      });
    }

    return tasks;
  },

  // ── Refresh list sem re-render completo ───────────────────────────────

  _refreshListContent() {
    // Rebuild sections com tasks filtradas
    this._buildSections();
    const content = document.getElementById('pwTabContent');
    if (content) {
      content.innerHTML = this._renderActiveTab();
      this._bindSectionToggles();
      this._bindActions();
      if (window.lucide) lucide.createIcons();
    }
    // Atualizar toolbar (contagem de filtros)
    const toolbar = document.getElementById('pwToolbar');
    if (toolbar) {
      toolbar.innerHTML = this._renderToolbar();
      this._bindToolbarButtons();
      if (window.lucide) lucide.createIcons();
    }
  },

  // ── Bind toolbar buttons (separado para re-bind) ──────────────────────

  _bindToolbarButtons() {
    const btnFilter = document.getElementById('pwBtnFilter');
    if (btnFilter) btnFilter.addEventListener('click', (e) => { e.stopPropagation(); this._showFilterPopup(); });

    const btnSort = document.getElementById('pwBtnSort');
    if (btnSort) btnSort.addEventListener('click', (e) => { e.stopPropagation(); this._showSortPopup(); });

    const btnGroup = document.getElementById('pwBtnGroup');
    if (btnGroup) btnGroup.addEventListener('click', (e) => { e.stopPropagation(); this._showGroupPopup(); });

    const btnOptions = document.getElementById('pwBtnOptions');
    if (btnOptions) btnOptions.addEventListener('click', (e) => { e.stopPropagation(); this._showOptionsPopup(); });
  },

  _toggleTask(taskId) {
    if (typeof TBO_STORAGE === 'undefined') return;
    const task = TBO_STORAGE.getErpEntity('task', taskId);
    if (!task) return;

    const newStatus = task.status === 'concluida' ? 'pendente' : 'concluida';
    TBO_STORAGE.updateErpEntity('task', taskId, { status: newStatus });

    if (typeof TBO_ERP !== 'undefined') {
      TBO_ERP.addAuditLog(this._projectId, 'task_status', `Tarefa "${task.title || task.name}" → ${newStatus}`);
    }

    // Recarregar e re-render
    this._loadProject();
    const content = document.getElementById('pwTabContent');
    if (content) {
      content.innerHTML = this._renderActiveTab();
      this._bindSectionToggles();
      this._bindActions();
      if (window.lucide) lucide.createIcons();
    }
  },

  // ── CSS Styles ────────────────────────────────────────────────────────────

  _getStyles() {
    return `<style>
/* ═══ Project Workspace — Asana-style Layout ═══ */

.pw-container { padding: 0; min-height: 100%; display: flex; flex-direction: column; }

/* ── Access Denied ── */
.pw-access-denied { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; padding: 40px; }

/* ── Header ── */
.pw-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 28px 12px; border-bottom: 1px solid var(--border-subtle); }
.pw-header-left { display: flex; align-items: flex-start; gap: 12px; flex: 1; min-width: 0; }
.pw-back-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.15s; flex-shrink: 0; margin-top: 2px; }
.pw-back-btn:hover { background: var(--bg-tertiary); color: var(--text-primary); }
.pw-header-info { flex: 1; min-width: 0; }
.pw-header-breadcrumb { display: flex; align-items: center; gap: 4px; margin-bottom: 4px; font-size: 0.75rem; }
.pw-breadcrumb-link { color: var(--text-muted); cursor: pointer; transition: color 0.15s; }
.pw-breadcrumb-link:hover { color: var(--accent-gold); }
.pw-breadcrumb-text { color: var(--text-muted); }
.pw-header-title-row { display: flex; align-items: center; gap: 10px; }
.pw-project-name { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pw-status-badge { font-size: 0.72rem; font-weight: 600; padding: 2px 10px; border-radius: 12px; white-space: nowrap; }
.pw-health-badge { font-size: 0.72rem; font-weight: 700; padding: 2px 10px; border-radius: 12px; white-space: nowrap; }
.pw-header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-top: 14px; }
.pw-owner-tag { display: flex; align-items: center; gap: 4px; font-size: 0.78rem; color: var(--text-muted); padding: 4px 10px; background: var(--bg-tertiary); border-radius: 6px; }
.pw-action-btn { padding: 6px 10px !important; }

/* ── Tabs Bar ── */
.pw-tabs-bar { display: flex; gap: 0; padding: 0 28px; border-bottom: 1px solid var(--border-subtle); background: var(--bg-primary); overflow-x: auto; }
.pw-tab { display: flex; align-items: center; gap: 6px; padding: 10px 16px; font-size: 0.82rem; font-weight: 500; color: var(--text-muted); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.pw-tab:hover { color: var(--text-primary); background: var(--bg-tertiary); }
.pw-tab--active { color: var(--text-primary); border-bottom-color: var(--accent-gold); font-weight: 600; }

/* ── Toolbar ── */
.pw-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 28px; border-bottom: 1px solid var(--border-subtle); }
.pw-add-task-btn { font-size: 0.82rem !important; padding: 6px 14px !important; border-radius: 6px !important; }
.pw-toolbar-right { display: flex; gap: 4px; }
.pw-toolbar-btn { font-size: 0.78rem !important; padding: 5px 10px !important; color: var(--text-muted) !important; }
.pw-toolbar-btn:hover { color: var(--text-primary) !important; background: var(--bg-tertiary) !important; }

/* ── Tab Content Area ── */
.pw-tab-content { flex: 1; overflow-y: auto; padding-bottom: 40px; }

/* ── List View ── */
.pw-list-header { display: flex; align-items: center; padding: 8px 28px; border-bottom: 2px solid var(--border-subtle, #ddd); font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; position: sticky; top: 0; background: var(--bg-tertiary, #f5f5f5); z-index: 5; }
.pw-list-header .pw-list-col { border-right: 1px solid color-mix(in srgb, var(--border-subtle) 60%, transparent); }
.pw-list-header .pw-list-col:last-child { border-right: none; }
.pw-list-col { padding: 0 8px; }
.pw-list-col--name { flex: 1; min-width: 0; padding-left: 28px; }
.pw-list-col--owner { width: 140px; flex-shrink: 0; }
.pw-list-col--date { width: 90px; flex-shrink: 0; }
.pw-list-col--priority { width: 100px; flex-shrink: 0; }
.pw-list-col--status { width: 120px; flex-shrink: 0; }

/* Section */
.pw-section { border-bottom: 1px solid var(--border-subtle); }
.pw-section-header { display: flex; align-items: center; gap: 8px; padding: 10px 28px; cursor: pointer; user-select: none; transition: background 0.15s; }
.pw-section-header:hover { background: var(--bg-tertiary); }
.pw-section-name { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
.pw-section-count { font-size: 0.72rem; color: var(--text-muted); margin-left: 4px; }

/* Drag handle */
.pw-drag-handle { width: 20px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; cursor: grab; opacity: 0; transition: opacity 0.15s; margin-left: -4px; }
.pw-list-row:hover .pw-drag-handle { opacity: 1; }
.pw-drag-handle:active { cursor: grabbing; }
.pw-list-row.pw-dragging { opacity: 0.5; background: var(--accent-gold)10; }
.pw-list-row.pw-drag-over { border-top: 2px solid var(--accent-gold); }

/* Row action menu button */
.pw-row-menu-btn { opacity: 0; transition: opacity 0.15s; }
.pw-list-row:hover .pw-row-menu-btn { opacity: 1; }

/* Task detail panel (side drawer) */
.pw-task-detail { position: fixed; top: 0; right: 0; width: 520px; max-width: 95vw; height: 100vh; background: var(--bg-primary); border-left: 1px solid var(--border-subtle); box-shadow: -6px 0 24px rgba(0,0,0,0.2); z-index: 1000; transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); overflow-y: auto; }
.pw-task-detail.pw-detail-open { transform: translateX(0); }
.pw-detail-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.35); z-index: 999; opacity: 0; transition: opacity 0.2s; }
.pw-detail-backdrop.pw-detail-open { opacity: 1; }
.pw-detail-header { display: flex; align-items: flex-start; gap: 12px; padding: 20px 24px; border-bottom: 1px solid var(--border-subtle); }
.pw-detail-body { padding: 20px 24px; }
.pw-detail-field { margin-bottom: 16px; }
.pw-detail-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 4px; font-weight: 600; }
.pw-detail-value { font-size: 0.88rem; color: var(--text-primary); }
.pw-detail-textarea { width: 100%; min-height: 80px; padding: 10px 12px; font-size: 0.82rem; border: 1px solid var(--border-subtle); border-radius: 6px; background: var(--bg-elevated); color: var(--text-primary); resize: vertical; outline: none; }
.pw-detail-textarea:focus { border-color: var(--accent-gold); box-shadow: 0 0 0 2px rgba(212,175,55,0.15); }
.pw-detail-input { width: 100%; padding: 6px 10px; font-size: 0.82rem; border: 1px solid var(--border-subtle); border-radius: 6px; background: var(--bg-elevated); color: var(--text-primary); outline: none; }
.pw-detail-input:focus { border-color: var(--accent-gold); }
.pw-detail-select { padding: 6px 10px; font-size: 0.82rem; border: 1px solid var(--border-subtle); border-radius: 6px; background: var(--bg-elevated); color: var(--text-primary); outline: none; }

/* Context menu (universal) */
.pw-context-menu { position: fixed; z-index: 1100; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); min-width: 200px; overflow: hidden; }
.pw-ctx-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 14px; border: none; background: none; cursor: pointer; font-size: 0.78rem; color: var(--text-primary); transition: background 0.1s; text-align: left; }
.pw-ctx-item:hover { background: var(--bg-elevated); }
.pw-ctx-item--danger { color: var(--color-danger); }
.pw-ctx-item--danger:hover { background: rgba(239,68,68,0.06); }
.pw-ctx-divider { height: 1px; background: var(--border-subtle); margin: 4px 0; }

/* Task Row */
.pw-list-row { display: flex; align-items: center; padding: 6px 28px; border-bottom: 1px solid var(--border-subtle); font-size: 0.82rem; transition: background 0.1s; cursor: pointer; }
.pw-list-row:nth-child(even of .pw-list-row) { background: color-mix(in srgb, var(--bg-tertiary, #f0f0f0) 35%, transparent); }
.pw-list-row:hover { background: color-mix(in srgb, var(--accent-gold, #d4af37) 6%, var(--bg-tertiary, #eaeaea)); }
.pw-list-row .pw-list-col { border-right: 1px solid color-mix(in srgb, var(--border-subtle) 50%, transparent); }
.pw-list-row .pw-list-col:last-child { border-right: none; }
.pw-list-row--done { opacity: 0.55; }
.pw-list-row--done .pw-task-name { text-decoration: line-through; }

.pw-check-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; margin-right: 8px; flex-shrink: 0; transition: color 0.15s; border-radius: 50%; }
.pw-check-btn:hover { color: #22c55e; }
.pw-check-btn--done { color: #22c55e; }

.pw-task-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-primary); }
.pw-milestone-badge { color: var(--accent-gold); margin-left: 6px; flex-shrink: 0; }
.pw-owner-chip { font-size: 0.75rem; color: var(--text-secondary); background: var(--bg-tertiary); padding: 2px 8px; border-radius: 10px; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; }
.pw-unassigned { color: var(--text-muted); opacity: 0.4; }
.pw-priority-chip { font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; white-space: nowrap; }
.pw-status-chip { font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; white-space: nowrap; }

/* Add task row */
.pw-add-task-row { padding: 4px 28px 4px 56px; border-bottom: 1px solid color-mix(in srgb, var(--border-subtle) 30%, transparent); }
.pw-add-task-placeholder { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--text-muted); cursor: pointer; padding: 6px 0; transition: color 0.15s; }
.pw-add-task-placeholder:hover { color: var(--text-primary); }

.pw-inline-input { width: 100%; padding: 6px 10px; font-size: 0.82rem; border: 1px solid var(--accent-gold); border-radius: 6px; background: var(--bg-secondary); color: var(--text-primary); outline: none; }
.pw-inline-input:focus { box-shadow: 0 0 0 2px rgba(212,175,55,0.2); }

/* Add section */
.pw-add-section { display: flex; align-items: center; gap: 6px; padding: 12px 28px; font-size: 0.82rem; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
.pw-add-section:hover { color: var(--accent-gold); background: var(--bg-tertiary); }

/* ── Overview ── */
.pw-overview { padding: 24px 28px; }
.pw-overview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
.pw-overview-card { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 20px; }
.pw-overview-card h3 { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 12px; }
.pw-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.pw-detail-item { display: flex; flex-direction: column; gap: 2px; }
.pw-detail-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; }
.pw-detail-value { font-size: 0.85rem; color: var(--text-primary); font-weight: 500; }
.pw-deliverables-list { display: flex; flex-direction: column; gap: 6px; }
.pw-deliverable-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--bg-tertiary); border-radius: 6px; font-size: 0.82rem; color: var(--text-primary); }

/* ── Board View ── */
.pw-board { display: flex; gap: 12px; padding: 20px 28px; overflow-x: auto; min-height: 300px; }
.pw-board-col { flex: 1; min-width: 220px; max-width: 300px; }
.pw-board-col-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; font-size: 0.82rem; font-weight: 600; color: var(--text-primary); background: var(--bg-secondary); border-radius: 8px 8px 0 0; }
.pw-board-count { font-size: 0.72rem; color: var(--text-muted); background: var(--bg-tertiary); padding: 1px 8px; border-radius: 10px; }
.pw-board-cards { display: flex; flex-direction: column; gap: 6px; padding: 8px; background: var(--bg-tertiary); border-radius: 0 0 8px 8px; min-height: 100px; }
.pw-board-card { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 12px; cursor: pointer; transition: all 0.15s; }
.pw-board-card:hover { border-color: var(--accent-gold); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.pw-board-card-name { font-size: 0.82rem; font-weight: 500; color: var(--text-primary); margin-bottom: 6px; }
.pw-board-card-owner, .pw-board-card-date { display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-muted); }
.pw-board-empty { text-align: center; padding: 20px; font-size: 0.75rem; color: var(--text-muted); }

/* ── Dashboard ── */
.pw-dashboard { padding: 24px 28px; }
.pw-dash-kpis { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.pw-dash-kpi { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 16px 20px; flex: 1; min-width: 120px; text-align: center; }
.pw-dash-kpi-value { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); }
.pw-dash-kpi-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; }
.pw-dash-section { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 20px; }
.pw-dash-section h3 { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; }
.pw-dash-owner-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.pw-dash-owner-name { font-size: 0.78rem; color: var(--text-primary); width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 0; }
.pw-dash-bar-track { flex: 1; height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
.pw-dash-bar-fill { height: 100%; background: var(--accent-gold); border-radius: 4px; transition: width 0.5s; }
.pw-dash-owner-stat { font-size: 0.72rem; color: var(--text-muted); width: 40px; text-align: right; flex-shrink: 0; }

/* ── Gantt ── */
.pw-gantt { padding: 20px 28px; overflow-x: auto; }
.pw-gantt-header, .pw-gantt-row { display: flex; align-items: center; border-bottom: 1px solid var(--border-subtle); min-height: 32px; }
.pw-gantt-header { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); position: sticky; top: 0; background: var(--bg-primary); z-index: 3; }
.pw-gantt-task-col { width: 200px; flex-shrink: 0; padding: 4px 8px; font-size: 0.78rem; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pw-gantt-timeline { flex: 1; position: relative; min-height: 24px; }
.pw-gantt-bar { position: absolute; top: 4px; height: 16px; border-radius: 3px; min-width: 6px; }
.pw-gantt-today-line { position: absolute; top: 0; bottom: 0; width: 2px; background: #ef4444; opacity: 0.5; z-index: 2; }

/* ── Placeholder Views ── */
.pw-placeholder-view { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; text-align: center; padding: 40px; }

/* ── Toolbar Enhanced ── */
.pw-toolbar-divider { width: 1px; height: 20px; background: var(--border-subtle); margin: 0 4px; }
.pw-toolbar-btn--active { color: var(--accent-gold) !important; background: rgba(212,175,55,0.1) !important; }

/* ── Popup System (Asana-style side panel) ── */
.pw-popup-anchor { position: relative; z-index: 100; }
.pw-popup { position: absolute; top: 0; right: 28px; width: 340px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.25); z-index: 200; max-height: 70vh; overflow-y: auto; }
.pw-popup-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border-subtle); gap: 8px; }
.pw-popup-title { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); flex: 1; }
.pw-popup-close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem; padding: 4px 8px; border-radius: 4px; }
.pw-popup-close:hover { background: var(--bg-tertiary); color: var(--text-primary); }
.pw-popup-back { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px; }
.pw-popup-back:hover { background: var(--bg-tertiary); color: var(--text-primary); }
.pw-popup-body { padding: 8px 0; }
.pw-popup-divider { height: 1px; background: var(--border-subtle); margin: 8px 16px; }

.pw-popup-row { display: flex; align-items: center; padding: 0 16px; gap: 8px; }
.pw-popup-row--edit { padding: 10px 16px 4px; }
.pw-popup-row-label { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; }
.pw-popup-input { flex: 1; padding: 6px 10px; font-size: 0.82rem; border: 1px solid var(--border-subtle); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); outline: none; }
.pw-popup-input:focus { border-color: var(--accent-gold); box-shadow: 0 0 0 2px rgba(212,175,55,0.15); }

.pw-icon-picker-btn { width: 36px; height: 36px; border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--bg-primary); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.pw-icon-picker-btn:hover { border-color: var(--accent-gold); }

.pw-popup-menu-item { display: flex; align-items: center; gap: 10px; padding: 8px 16px; font-size: 0.82rem; color: var(--text-primary); cursor: pointer; transition: background 0.1s; }
.pw-popup-menu-item:hover { background: var(--bg-tertiary); }
.pw-popup-menu-item--active { color: var(--accent-gold); }
.pw-popup-badge { margin-left: auto; font-size: 0.72rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
.pw-popup-badge--clickable { cursor: pointer; padding: 2px 6px; border-radius: 4px; }
.pw-popup-badge--clickable:hover { background: var(--bg-tertiary); }

/* Column toggle */
.pw-col-toggle { display: flex; align-items: center; gap: 10px; padding: 8px 16px; font-size: 0.82rem; color: var(--text-primary); cursor: pointer; }
.pw-col-toggle:hover { background: var(--bg-tertiary); }
.pw-col-toggle--locked { opacity: 0.5; cursor: default; }
.pw-col-toggle input[type="checkbox"] { accent-color: var(--accent-gold); width: 16px; height: 16px; }
.pw-col-lock { margin-left: auto; color: var(--text-muted); }

/* Filters — layout aprimorado */
.pw-filter-row { display: flex; flex-direction: column; gap: 4px; padding: 8px 16px; border-bottom: 1px solid var(--border-subtle); }
.pw-filter-row:last-of-type { border-bottom: none; }
.pw-filter-row-top { display: flex; align-items: center; gap: 6px; }
.pw-filter-row-value { display: flex; align-items: center; gap: 6px; padding-left: 2px; }
.pw-filter-conjunction { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; min-width: 18px; }
.pw-filter-select { padding: 5px 8px; font-size: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 5px; background: var(--bg-primary); color: var(--text-primary); outline: none; }
.pw-filter-field-select { flex: 1; max-width: 130px; }
.pw-filter-op-select { flex: 1; }
.pw-filter-select:focus { border-color: var(--accent-gold); }
.pw-filter-value { flex: 1; padding: 5px 8px; font-size: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 5px; background: var(--bg-primary); color: var(--text-primary); outline: none; }
.pw-filter-value:focus { border-color: var(--accent-gold); }
.pw-filter-value-select { flex: 1; max-width: 200px; }
.pw-filter-date-input { padding: 5px 8px; font-size: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 5px; background: var(--bg-primary); color: var(--text-primary); outline: none; }
.pw-filter-date-input:focus { border-color: var(--accent-gold); }
.pw-filter-date-range { display: flex; align-items: center; gap: 6px; }
.pw-filter-num-input { max-width: 120px; }
.pw-filter-multi-select { display: flex; flex-wrap: wrap; gap: 4px; padding: 2px 0; }
.pw-filter-multi-opt { display: flex; align-items: center; gap: 4px; font-size: 0.73rem; padding: 3px 8px; border-radius: 4px; cursor: pointer; background: var(--bg-tertiary); color: var(--text-primary); white-space: nowrap; }
.pw-filter-multi-opt:hover { background: var(--bg-secondary); }
.pw-filter-multi-opt input[type="checkbox"] { width: 14px; height: 14px; accent-color: var(--accent-gold); }
.pw-filter-no-value { font-style: italic; }
.pw-filter-empty { padding: 12px 16px; }
.pw-filter-remove { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px; flex-shrink: 0; }
.pw-filter-remove:hover { color: #ef4444; background: var(--bg-tertiary); }
.pw-filter-add { display: flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 0.78rem; color: var(--accent-gold); cursor: pointer; border: none; background: none; width: 100%; text-align: left; }
.pw-filter-add:hover { background: var(--bg-tertiary); }
.pw-filter-actions { display: flex; justify-content: space-between; padding: 4px 16px 8px; }
.pw-saved-filters-label { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; padding: 4px 16px; }
.pw-saved-filter-item { display: flex; align-items: center; gap: 6px; padding: 6px 16px; }
.pw-saved-filter-icon { font-size: 1rem; cursor: pointer; }
.pw-saved-filter-name { flex: 1; padding: 4px 8px; font-size: 0.78rem; border: 1px solid transparent; border-radius: 4px; background: transparent; color: var(--text-primary); outline: none; }
.pw-saved-filter-name:focus { border-color: var(--accent-gold); background: var(--bg-primary); }
.pw-saved-filter-apply { font-size: 0.7rem; padding: 2px 8px; border: 1px solid var(--accent-gold); border-radius: 4px; background: transparent; color: var(--accent-gold); cursor: pointer; }
.pw-saved-filter-apply:hover { background: rgba(212,175,55,0.1); }
.pw-saved-filter-del { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px; }
.pw-saved-filter-del:hover { color: #ef4444; }

/* Dynamic column widths */
.pw-list-col--due_date { width: 90px; flex-shrink: 0; }
.pw-list-col--start_date { width: 90px; flex-shrink: 0; }
.pw-list-col--phase { width: 110px; flex-shrink: 0; }
.pw-list-col--estimate { width: 80px; flex-shrink: 0; }
.pw-list-col--source { width: 80px; flex-shrink: 0; }
.pw-list-col--add { width: 32px; flex-shrink: 0; color: var(--text-muted); font-size: 0.82rem; }
.pw-list-col--add:hover { color: var(--accent-gold); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .pw-header { flex-direction: column; gap: 12px; padding: 16px; }
  .pw-header-right { justify-content: flex-start; margin-top: 0; }
  .pw-tabs-bar { padding: 0 16px; }
  .pw-toolbar { padding: 8px 16px; flex-wrap: wrap; gap: 8px; }
  .pw-list-header, .pw-list-row { padding-left: 16px; padding-right: 16px; }
  .pw-list-col--owner, .pw-list-col--priority { display: none; }
  .pw-overview-grid { grid-template-columns: 1fr; }
  .pw-board { flex-direction: column; padding: 16px; }
  .pw-board-col { min-width: 100%; max-width: 100%; }
}

/* Skeleton */
.pw-skel { background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-elevated) 50%, var(--bg-tertiary) 75%); background-size: 200% 100%; animation: pw-shimmer 1.5s ease-in-out infinite; }
@keyframes pw-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>`;
  }
};
