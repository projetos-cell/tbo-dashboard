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
    { id: 'calendar', label: 'Calendario', icon: 'calendar' },
    { id: 'messages', label: 'Mensagens', icon: 'message-square' },
    { id: 'files', label: 'Arquivos', icon: 'paperclip' },
    { id: 'gantt', label: 'Gantt', icon: 'gantt-chart' }
  ],

  // ── Ordem customizada das tabs (persistida por projeto) ─────────────
  _getTabOrder() {
    try {
      const key = `tbo_pw_tab_order_${this._projectId || 'default'}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch { return []; }
  },
  _setTabOrder(order) {
    const key = `tbo_pw_tab_order_${this._projectId || 'default'}`;
    localStorage.setItem(key, JSON.stringify(order));
  },
  _getOrderedTabs() {
    const order = this._getTabOrder();
    if (!order.length) return [...this._tabs];
    const ordered = [];
    order.forEach(id => {
      const t = this._tabs.find(tab => tab.id === id);
      if (t) ordered.push(t);
    });
    // Tabs novas que nao estao na ordem salva
    this._tabs.forEach(t => {
      if (!order.includes(t.id)) ordered.push(t);
    });
    return ordered;
  },

  _esc(str) {
    if (typeof _escapeHtml === 'function') return _escapeHtml(str);
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  setParams(params) {
    this._projectId = params.id;
    this._activeTab = params.tab || 'list';
    this._pendingQuery = params.query || {}; // query params para deep link (task, subtask)
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

    // Bind tab drag & drop (reordenar)
    this._bindTabDragDrop();

    // Bind section toggle
    this._bindSectionToggles();

    // Bind action buttons
    this._bindActions();

    // Re-init icons
    if (window.lucide) lucide.createIcons();

    // Deep link: auto-abrir task detail se ?task=xxx na URL
    if (this._pendingQuery?.task) {
      const taskId = this._pendingQuery.task;
      this._pendingQuery = {};
      setTimeout(() => this._openTaskDetail(taskId), 200);
    }
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
          <div class="pw-owner-btn-wrapper" id="pwOwnerWrapper">
            <button class="pw-owner-btn" id="pwHeaderOwnerBtn" role="button" aria-expanded="false" aria-haspopup="menu" title="Alterar responsavel">
              <div class="pw-owner-btn-avatar">${p.owner ? this._esc(p.owner.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()) : '?'}</div>
              <div class="pw-owner-btn-info">
                <span class="pw-owner-btn-name">${this._esc(p.owner || 'Sem responsavel')}</span>
                <span class="pw-owner-btn-role">Responsavel do projeto</span>
              </div>
              <svg class="pw-owner-btn-chevron" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="m18.185 7.851-6.186 5.191-6.186-5.191a1.499 1.499 0 1 0-1.928 2.298l7.15 6a1.498 1.498 0 0 0 1.928 0l7.15-6a1.5 1.5 0 0 0-1.928-2.298Z"/></svg>
            </button>
            <div class="pw-owner-dropdown" id="pwOwnerDropdown"></div>
          </div>
          <button class="btn btn-ghost pw-action-btn" onclick="TBO_PROJECT_WORKSPACE._copyProjectLink()" title="Copiar link do projeto">
            <i data-lucide="link" style="width:16px;height:16px;"></i>
          </button>
          <button class="btn btn-secondary pw-action-btn" onclick="TBO_PROJETOS._showProjectModal('${this._esc(p.id)}')" title="Editar projeto">
            <i data-lucide="settings" style="width:16px;height:16px;"></i>
          </button>
        </div>
      </div>
    `;
  },

  // ── Render: Tabs ──────────────────────────────────────────────────────────

  _renderTabs() {
    const tabs = this._getOrderedTabs();
    return `
      <div class="pw-tabs-bar">
        ${tabs.map(t => `
          <button class="pw-tab${t.id === this._activeTab ? ' pw-tab--active' : ''}" data-tab="${t.id}" draggable="true">
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
      case 'calendar': return this._renderCalendarView();
      case 'messages': return this._renderMessagesView();
      case 'files': return this._renderFilesView();
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
              <div class="pw-list-col pw-list-col--owner pw-cell-clickable" data-task-id="${this._esc(task.id)}" data-cell="owner">
                ${task.owner ? `
                  <div class="pw-cell-assignee">
                    <div class="pw-cell-avatar">${this._esc(task.owner.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}</div>
                    <span class="pw-owner-chip">${this._esc(task.owner)}</span>
                  </div>
                ` : '<span class="pw-unassigned"><i data-lucide="user-plus" style="width:14px;height:14px;"></i></span>'}
              </div>`;
            case 'due_date': return `<div class="pw-list-col pw-list-col--due_date">${formatDate(task.due_date)}</div>`;
            case 'priority': return `
              <div class="pw-list-col pw-list-col--priority pw-cell-clickable" data-task-id="${this._esc(task.id)}" data-cell="priority">
                <span class="pw-priority-chip" style="background:${priorityColor}15;color:${priorityColor};">${priorityLabel}</span>
                <svg class="pw-cell-chevron" viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="m18.185 7.851-6.186 5.191-6.186-5.191a1.499 1.499 0 1 0-1.928 2.298l7.15 6a1.498 1.498 0 0 0 1.928 0l7.15-6a1.5 1.5 0 0 0-1.928-2.298Z"/></svg>
              </div>`;
            case 'status': return `
              <div class="pw-list-col pw-list-col--status pw-cell-clickable" data-task-id="${this._esc(task.id)}" data-cell="status">
                <span class="pw-status-chip" style="background:${statusColor}20;color:${statusColor};">${statusLabel}</span>
                <svg class="pw-cell-chevron" viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="m18.185 7.851-6.186 5.191-6.186-5.191a1.499 1.499 0 1 0-1.928 2.298l7.15 6a1.498 1.498 0 0 0 1.928 0l7.15-6a1.5 1.5 0 0 0-1.928-2.298Z"/></svg>
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

  // ── Overview Tab (Asana-style melhorado) ─────────────────────────────────

  _renderOverview() {
    const p = this._project;
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.project : null;
    const tasks = this._tasks;
    const deliverables = this._deliverables;

    // Stats
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'concluida').length;
    const inProgress = tasks.filter(t => t.status === 'em_andamento').length;
    const overdue = tasks.filter(t => {
      if (!t.due_date || t.status === 'concluida') return false;
      return new Date(t.due_date) < new Date();
    }).length;
    const pctDone = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Health
    let healthScore = 0;
    let hColor = '#6b7280';
    let healthReasons = [];
    if (typeof TBO_ERP !== 'undefined') {
      const health = TBO_ERP.calculateHealthScore(p);
      healthScore = health.score;
      hColor = TBO_ERP.getHealthColor(health.score);
      healthReasons = health.reasons || [];
    }

    // Status do projeto
    const statusOptions = [
      { value: 'em_dia', label: 'Em dia', color: '#22c55e', icon: 'check-circle' },
      { value: 'em_risco', label: 'Em risco', color: '#f59e0b', icon: 'alert-triangle' },
      { value: 'atrasado', label: 'Atrasado', color: '#ef4444', icon: 'alert-circle' },
      { value: 'pausado', label: 'Pausado', color: '#6b7280', icon: 'pause-circle' }
    ];
    const projStatus = p.project_status || 'em_dia';
    const statusInfo = statusOptions.find(s => s.value === projStatus) || statusOptions[0];

    // Deadline info
    let dlDays = null;
    let dlUrgency = 'ok';
    if (typeof TBO_ERP !== 'undefined') {
      const dl = TBO_ERP.getDeadlineInfo(p);
      if (dl) { dlDays = dl.daysRemaining; dlUrgency = dl.urgency; }
    }
    const urgencyColors = { ok: '#22c55e', warning: '#f59e0b', critical: '#ef4444', overdue: '#ef4444' };

    // Membros/Funcoes (coletar owners unicos das tarefas)
    const membersMap = {};
    tasks.forEach(t => {
      if (t.owner && t.owner !== 'Sem responsavel') {
        if (!membersMap[t.owner]) membersMap[t.owner] = { name: t.owner, tasks: 0, done: 0, role: t.owner_role || '' };
        membersMap[t.owner].tasks++;
        if (t.status === 'concluida') membersMap[t.owner].done++;
      }
    });
    const members = Object.values(membersMap).sort((a, b) => b.tasks - a.tasks);

    // Resumo gerado (baseado nos dados)
    const summaryParts = [];
    if (totalTasks > 0) summaryParts.push(`${totalTasks} tarefas no total, ${doneTasks} concluida${doneTasks !== 1 ? 's' : ''} (${pctDone}%)`);
    if (inProgress > 0) summaryParts.push(`${inProgress} em andamento`);
    if (overdue > 0) summaryParts.push(`${overdue} atrasada${overdue !== 1 ? 's' : ''}`);
    if (dlDays !== null && dlDays >= 0) summaryParts.push(`${dlDays} dias ate a entrega`);
    if (dlDays !== null && dlDays < 0) summaryParts.push(`${Math.abs(dlDays)} dias de atraso`);
    if (members.length > 0) summaryParts.push(`${members.length} membro${members.length !== 1 ? 's' : ''} alocado${members.length !== 1 ? 's' : ''}`);
    const summaryText = summaryParts.join(' · ');

    // Ultima atualizacao de status
    const lastUpdate = (p.status_updates || []).slice(-1)[0];

    return `
      <div class="pw-overview">
        <!-- Resumo do projeto (Asana-style hero) -->
        <div class="pw-ov-hero">
          <div class="pw-ov-hero-left">
            <div class="pw-ov-status-row">
              <span class="pw-ov-status-badge" style="background:${statusInfo.color}20;color:${statusInfo.color};">
                <i data-lucide="${statusInfo.icon}" style="width:14px;height:14px;"></i> ${statusInfo.label}
              </span>
              ${dlDays !== null ? `<span class="pw-ov-deadline" style="color:${urgencyColors[dlUrgency]};">
                <i data-lucide="clock" style="width:14px;height:14px;"></i>
                ${dlDays >= 0 ? `${dlDays} dias restantes` : `${Math.abs(dlDays)} dias atrasado`}
              </span>` : ''}
            </div>

            <div class="pw-ov-description pw-ov-editable" id="pwOvDescription" title="Clique para editar a descricao">
              <p contenteditable="true" class="pw-ov-editable-field" data-field="description" data-placeholder="Clique aqui para adicionar uma descricao do projeto...">${this._esc(p.description || p.notes || '')}</p>
            </div>

            <div class="pw-ov-summary pw-ov-editable" id="pwOvSummary">
              <i data-lucide="sparkles" style="width:14px;height:14px;color:var(--accent-gold);flex-shrink:0;"></i>
              <span contenteditable="true" class="pw-ov-editable-field" data-field="summary_note" data-placeholder="Escreva um resumo ou nota sobre o projeto...">${this._esc(p.summary_note || summaryText)}</span>
            </div>
          </div>
        </div>

        <div class="pw-overview-grid">
          <!-- Progresso + Saude lado a lado -->
          <div class="pw-overview-card">
            <h3>Progresso</h3>
            <div style="display:flex;align-items:center;gap:16px;">
              <div style="font-size:2.5rem;font-weight:800;color:var(--accent-gold);">${pctDone}%</div>
              <div style="flex:1;">
                <div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
                  <div style="width:${pctDone}%;height:100%;background:var(--accent-gold);border-radius:4px;transition:width 0.5s;"></div>
                </div>
                <div style="display:flex;gap:12px;margin-top:8px;font-size:0.75rem;">
                  <span style="color:#22c55e;">${doneTasks} concluidas</span>
                  <span style="color:#3b82f6;">${inProgress} em andamento</span>
                  ${overdue > 0 ? `<span style="color:#ef4444;">${overdue} atrasadas</span>` : ''}
                </div>
              </div>
            </div>
          </div>

          ${typeof TBO_ERP !== 'undefined' ? `
            <div class="pw-overview-card">
              <h3>Saude do Projeto</h3>
              <div style="display:flex;align-items:center;gap:16px;">
                <div style="font-size:2.5rem;font-weight:800;color:${hColor};">${healthScore}</div>
                <div style="flex:1;">
                  <div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
                    <div style="width:${healthScore}%;height:100%;background:${hColor};border-radius:4px;transition:width 0.5s;"></div>
                  </div>
                  ${healthReasons.length > 0 ? `<div style="margin-top:8px;font-size:0.72rem;color:var(--text-muted);display:flex;flex-wrap:wrap;gap:4px;">${healthReasons.map(r => `<span style="padding:2px 8px;background:${hColor}10;border-radius:4px;">${this._esc(r)}</span>`).join('')}</div>` : ''}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Detalhes (editaveis) -->
          <div class="pw-overview-card">
            <h3>Detalhes</h3>
            <div class="pw-details-grid">
              <div class="pw-detail-item">
                <span class="pw-detail-label">Cliente</span>
                <div class="pw-interactive-btn-wrapper" data-field="client" data-type="text-select">
                  <button class="pw-interactive-btn" data-target="client" role="button" aria-expanded="false" aria-haspopup="menu">
                    ${p.client ? `
                      <span class="pw-interactive-btn-text">${this._esc(p.client)}</span>
                    ` : `
                      <span class="pw-interactive-btn-text pw-interactive-btn-text--placeholder">Adicionar cliente...</span>
                    `}
                    <svg class="pw-interactive-btn-chevron" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="m18.185 7.851-6.186 5.191-6.186-5.191a1.499 1.499 0 1 0-1.928 2.298l7.15 6a1.498 1.498 0 0 0 1.928 0l7.15-6a1.5 1.5 0 0 0-1.928-2.298Z"/></svg>
                  </button>
                  <div class="pw-interactive-dropdown" data-for="client"></div>
                </div>
              </div>
              <div class="pw-detail-item">
                <span class="pw-detail-label">Responsavel</span>
                <div class="pw-interactive-btn-wrapper" data-field="owner" data-type="member">
                  <button class="pw-interactive-btn" data-target="owner" role="button" aria-expanded="false" aria-haspopup="menu">
                    ${p.owner ? `
                      <div class="pw-interactive-btn-avatar">${this._esc(p.owner.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}</div>
                      <span class="pw-interactive-btn-text">${this._esc(p.owner)}</span>
                    ` : `
                      <div class="pw-interactive-btn-avatar pw-interactive-btn-avatar--empty">?</div>
                      <span class="pw-interactive-btn-text pw-interactive-btn-text--placeholder">Adicionar responsavel...</span>
                    `}
                    <svg class="pw-interactive-btn-chevron" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="m18.185 7.851-6.186 5.191-6.186-5.191a1.499 1.499 0 1 0-1.928 2.298l7.15 6a1.498 1.498 0 0 0 1.928 0l7.15-6a1.5 1.5 0 0 0-1.928-2.298Z"/></svg>
                  </button>
                  <div class="pw-interactive-dropdown" data-for="owner"></div>
                </div>
              </div>
              <div class="pw-detail-item">
                <span class="pw-detail-label">Codigo</span>
                <span class="pw-detail-value pw-detail-editable" contenteditable="true" data-field="code" data-placeholder="Adicionar codigo...">${this._esc(p.code || '')}</span>
              </div>
              <div class="pw-detail-item">
                <span class="pw-detail-label">Valor</span>
                <span class="pw-detail-value pw-detail-editable" contenteditable="true" data-field="value" data-type="currency" data-placeholder="R$ 0,00">${p.value ? 'R$ ' + Number(p.value).toLocaleString('pt-BR') : ''}</span>
              </div>
              <div class="pw-detail-item">
                <span class="pw-detail-label">BUs</span>
                <div class="pw-interactive-btn-wrapper" data-field="services" data-type="tags">
                  <button class="pw-interactive-btn pw-interactive-btn--tags" data-target="services" role="button" aria-expanded="false" aria-haspopup="menu">
                    ${p.services?.length ? p.services.map(s => `<span class="pw-tag-chip">${this._esc(s)}</span>`).join('') : `<span class="pw-interactive-btn-text pw-interactive-btn-text--placeholder">Adicionar BUs...</span>`}
                    <svg class="pw-interactive-btn-chevron" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="m18.185 7.851-6.186 5.191-6.186-5.191a1.499 1.499 0 1 0-1.928 2.298l7.15 6a1.498 1.498 0 0 0 1.928 0l7.15-6a1.5 1.5 0 0 0-1.928-2.298Z"/></svg>
                  </button>
                  <div class="pw-interactive-dropdown" data-for="services"></div>
                </div>
              </div>
              <div class="pw-detail-item">
                <span class="pw-detail-label">Inicio</span>
                <input type="date" class="pw-detail-date-input" data-field="start_date" value="${p.start_date || ''}" />
              </div>
              <div class="pw-detail-item">
                <span class="pw-detail-label">Entrega</span>
                <input type="date" class="pw-detail-date-input" data-field="end_date" value="${p.end_date || ''}" />
              </div>
            </div>
          </div>

          <!-- Equipe / Funcoes no projeto (estilo Asana) -->
          <div class="pw-overview-card">
            <h3>Funcoes no projeto</h3>
            <div class="pw-team-grid">
              <div class="pw-team-add-btn" role="button" tabindex="0" id="pwAddTeamMember">
                <div class="pw-team-add-icon">
                  <svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor"><path d="M26,14h-8V6c0-1.1-0.9-2-2-2l0,0c-1.1,0-2,0.9-2,2v8H6c-1.1,0-2,0.9-2,2l0,0c0,1.1,0.9,2,2,2h8v8c0,1.1,0.9,2,2,2l0,0c1.1,0,2-0.9,2-2v-8h8c1.1,0,2-0.9,2-2l0,0C28,14.9,27.1,14,26,14z"></path></svg>
                </div>
                <span class="pw-team-add-text">Adicionar membro</span>
              </div>
              ${members.map(m => {
                const initials = m.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                const pct = m.tasks > 0 ? Math.round((m.done / m.tasks) * 100) : 0;
                const roleLabel = m.name === p.owner ? 'Responsavel do projeto' : `${m.done}/${m.tasks} tarefas · ${pct}%`;
                return `
                  <div class="pw-team-member-card" role="button" tabindex="0" data-member-name="${this._esc(m.name)}" aria-expanded="false" aria-haspopup="menu">
                    <div class="pw-team-member-avatar">${this._esc(initials)}</div>
                    <div class="pw-team-member-info">
                      <span class="pw-team-member-name">${this._esc(m.name)}</span>
                      <span class="pw-team-member-role">${roleLabel}</span>
                    </div>
                    <svg class="pw-team-member-chevron" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="m18.185 7.851-6.186 5.191-6.186-5.191a1.499 1.499 0 1 0-1.928 2.298l7.15 6a1.498 1.498 0 0 0 1.928 0l7.15-6a1.5 1.5 0 0 0-1.928-2.298Z"/></svg>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="pw-interactive-dropdown pw-team-dropdown" id="pwTeamDropdown"></div>
          </div>

          <!-- Entregaveis -->
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

          <!-- Ultima atualizacao de status -->
          ${lastUpdate ? `
            <div class="pw-overview-card">
              <h3>Ultima atualizacao</h3>
              <div class="pw-ov-last-update">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                  <span style="font-size:0.78rem;font-weight:600;color:var(--text-primary);">${this._esc(lastUpdate.author || 'Membro')}</span>
                  <span style="font-size:0.72rem;color:var(--text-muted);">${lastUpdate.created_at ? new Date(lastUpdate.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : ''}</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.82rem;line-height:1.5;margin:0;">${this._esc(lastUpdate.text || '')}</p>
              </div>
              <button class="btn btn-ghost btn-sm" style="margin-top:8px;" onclick="TBO_PROJECT_WORKSPACE.switchTab('messages')">
                <i data-lucide="message-square" style="width:14px;height:14px;"></i> Ver todas as atualizacoes
              </button>
            </div>
          ` : ''}

          ${p.notes && p.description ? `
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
    const priColors = { urgente: '#ef4444', alta: '#f59e0b', media: '#3b82f6', baixa: '#6b7280' };
    const priLabels = { urgente: 'Urgente', alta: 'Alta', media: 'Media', baixa: 'Baixa' };

    const _fmtDate = (d) => {
      if (!d) return '';
      const dt = new Date(d);
      const now = new Date();
      const diff = Math.floor((dt - now) / 86400000);
      const str = dt.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
      if (diff < 0) return `<span style="color:#ef4444;">${str}</span>`;
      if (diff === 0) return `<span style="color:#f59e0b;">Hoje</span>`;
      if (diff === 1) return `<span style="color:#f59e0b;">Amanha</span>`;
      return str;
    };

    const _avatar = (name) => {
      if (!name) return '';
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      return `<div class="pw-card-avatar" title="${this._esc(name)}">${initials}</div>`;
    };

    const columns = statuses.map(status => {
      const tasks = this._tasks.filter(t => t.status === status);
      const isDoneCol = status === 'concluida';
      return `
        <div class="pw-board-col" data-status="${status}">
          <div class="pw-board-col-header" style="border-top:3px solid ${colors[status]};">
            <span>${labels[status] || status}</span>
            <span class="pw-board-count">${tasks.length}</span>
          </div>
          <div class="pw-board-cards" data-status="${status}">
            ${tasks.map(t => {
              const isDone = t.status === 'concluida';
              const pc = priColors[t.priority] || '#6b7280';
              return `
              <div class="pw-board-card${isDone ? ' pw-board-card--done' : ''}" data-task-id="${this._esc(t.id)}" draggable="true">
                <div class="pw-card-top">
                  <button class="pw-card-check${isDone ? ' pw-card-check--done' : ''}" data-task-id="${this._esc(t.id)}" onclick="event.stopPropagation();TBO_PROJECT_WORKSPACE._toggleTask('${this._esc(t.id)}')">
                    <i data-lucide="${isDone ? 'check-circle-2' : 'circle'}" style="width:16px;height:16px;"></i>
                  </button>
                  <div class="pw-board-card-name">${this._esc(t.title || t.name || 'Sem titulo')}</div>
                </div>
                <div class="pw-card-meta">
                  ${t.priority ? `<span class="pw-card-badge" style="background:${pc}20;color:${pc};border:1px solid ${pc}40;">${priLabels[t.priority] || t.priority}</span>` : ''}
                  ${!isDoneCol && t.due_date ? `<span class="pw-card-date"><i data-lucide="calendar" style="width:11px;height:11px;"></i> ${_fmtDate(t.due_date)}</span>` : ''}
                </div>
                ${t.owner ? `<div class="pw-card-footer">${_avatar(t.owner)}<span class="pw-card-owner-name">${this._esc(t.owner)}</span></div>` : ''}
              </div>`;
            }).join('')}
            ${tasks.length === 0 ? '<div class="pw-board-empty">Sem tarefas</div>' : ''}
            <button class="pw-board-add-btn" onclick="TBO_PROJECT_WORKSPACE._addTaskToStatus('${status}')">
              <i data-lucide="plus" style="width:14px;height:14px;"></i> Adicionar tarefa
            </button>
          </div>
        </div>
      `;
    }).join('');

    return `<div class="pw-board">${columns}</div>`;
  },

  // Adicionar tarefa diretamente em uma coluna do board
  _addTaskToStatus(status) {
    const firstSection = this._sections[0]?.name || 'Planejamento';
    const newTask = {
      title: 'Nova tarefa',
      status: status,
      priority: 'media',
      phase: firstSection,
      project_id: this._projectId
    };
    if (typeof TBO_STORAGE !== 'undefined') {
      TBO_STORAGE.addErpEntity('task', newTask);
    }
    this._loadProject();
    this._refreshListView();
    // Abrir detalhe da tarefa recem criada
    setTimeout(() => {
      const latest = this._tasks.find(t => t.title === 'Nova tarefa' && t.status === status);
      if (latest) this._openTaskDetail(latest.id);
    }, 100);
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

  // ── Calendar View (week view com barras de tarefas — Asana-style) ─────────

  _calendarWeekOffset: 0, // 0 = semana atual, -1 = semana anterior, etc.

  _renderCalendarView() {
    const tasks = this._tasks.filter(t => t.status !== 'cancelada' && (t.start_date || t.due_date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calcular inicio da semana (segunda-feira) com offset
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday + (this._calendarWeekOffset * 7));

    // 7 dias da semana
    const days = [];
    const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
    const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push({
        date: d,
        label: dayNames[i],
        dayNum: d.getDate(),
        month: monthNames[d.getMonth()],
        isToday: d.toDateString() === today.toDateString(),
        isWeekend: i >= 5
      });
    }

    // Titulo do periodo
    const weekStart = days[0].date;
    const weekEnd = days[6].date;
    const periodLabel = weekStart.getMonth() === weekEnd.getMonth()
      ? `${weekStart.getDate()} - ${weekEnd.getDate()} de ${monthNames[weekStart.getMonth()]} ${weekStart.getFullYear()}`
      : `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} - ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]} ${weekStart.getFullYear()}`;

    // Agrupar tarefas que caem nesta semana
    const weekStartMs = startOfWeek.getTime();
    const weekEndMs = days[6].date.getTime() + 86400000; // fim do domingo
    const weekTasks = tasks.filter(t => {
      const tStart = new Date(t.start_date || t.due_date).getTime();
      const tEnd = new Date(t.due_date || t.start_date).getTime() + 86400000;
      return tStart < weekEndMs && tEnd > weekStartMs;
    });

    // Posicionar cada tarefa como barra
    const taskBars = weekTasks.map(t => {
      const tStart = new Date(t.start_date || t.due_date);
      tStart.setHours(0, 0, 0, 0);
      const tEnd = new Date(t.due_date || t.start_date);
      tEnd.setHours(0, 0, 0, 0);

      const barStart = Math.max(0, Math.floor((tStart.getTime() - weekStartMs) / 86400000));
      const barEnd = Math.min(6, Math.floor((tEnd.getTime() - weekStartMs) / 86400000));
      const colStart = barStart; // 0-6
      const colSpan = Math.max(1, barEnd - barStart + 1);

      const isDone = t.status === 'concluida';
      const priorityColors = { urgente: '#ef4444', alta: '#f59e0b', media: '#3b82f6', baixa: '#6b7280' };
      const color = isDone ? '#22c55e' : (priorityColors[t.priority] || '#3b82f6');

      return { task: t, colStart, colSpan, color, isDone };
    });

    // Organizar em linhas (rows) para evitar sobreposicao
    const rows = [];
    taskBars.forEach(bar => {
      let placed = false;
      for (const row of rows) {
        const hasConflict = row.some(b => !(bar.colStart >= b.colStart + b.colSpan || bar.colStart + bar.colSpan <= b.colStart));
        if (!hasConflict) { row.push(bar); placed = true; break; }
      }
      if (!placed) rows.push([bar]);
    });

    return `
      <div class="pw-calendar">
        <div class="pw-cal-nav">
          <button class="btn btn-ghost btn-sm" onclick="TBO_PROJECT_WORKSPACE._calendarWeekOffset--; TBO_PROJECT_WORKSPACE._refreshCalendar();" title="Semana anterior">
            <i data-lucide="chevron-left" style="width:16px;height:16px;"></i>
          </button>
          <button class="btn btn-ghost btn-sm" onclick="TBO_PROJECT_WORKSPACE._calendarWeekOffset=0; TBO_PROJECT_WORKSPACE._refreshCalendar();">Hoje</button>
          <button class="btn btn-ghost btn-sm" onclick="TBO_PROJECT_WORKSPACE._calendarWeekOffset++; TBO_PROJECT_WORKSPACE._refreshCalendar();" title="Proxima semana">
            <i data-lucide="chevron-right" style="width:16px;height:16px;"></i>
          </button>
          <span class="pw-cal-period">${periodLabel}</span>
        </div>

        <div class="pw-cal-grid">
          <div class="pw-cal-header">
            ${days.map(d => `
              <div class="pw-cal-day-header ${d.isToday ? 'pw-cal-today' : ''} ${d.isWeekend ? 'pw-cal-weekend' : ''}">
                <span class="pw-cal-day-name">${d.label}</span>
                <span class="pw-cal-day-num ${d.isToday ? 'pw-cal-today-num' : ''}">${d.dayNum}</span>
              </div>
            `).join('')}
          </div>

          <div class="pw-cal-body" style="min-height:${Math.max(200, rows.length * 34 + 60)}px;">
            ${days.map((d, i) => `<div class="pw-cal-column ${d.isToday ? 'pw-cal-col-today' : ''} ${d.isWeekend ? 'pw-cal-col-weekend' : ''}" style="grid-column:${i + 1};"></div>`).join('')}

            ${rows.map((row, rowIdx) => row.map(bar => {
              const t = bar.task;
              const title = this._esc((t.title || t.name || '').slice(0, 40));
              return `
                <div class="pw-cal-bar ${bar.isDone ? 'pw-cal-bar--done' : ''}"
                     style="grid-column: ${bar.colStart + 1} / span ${bar.colSpan}; grid-row: ${rowIdx + 2}; background: ${bar.color}20; border-left: 3px solid ${bar.color};"
                     onclick="TBO_PROJECT_WORKSPACE._openTaskDetail('${t.id}')"
                     title="${title}">
                  <span class="pw-cal-bar-text">${title}</span>
                </div>
              `;
            }).join('')).join('')}
          </div>
        </div>

        ${weekTasks.length === 0 ? `
          <div style="text-align:center;padding:40px;color:var(--text-muted);font-size:0.85rem;">
            <i data-lucide="calendar-x" style="width:32px;height:32px;opacity:0.4;margin-bottom:8px;display:block;margin:0 auto 8px;"></i>
            Nenhuma tarefa com datas nesta semana
          </div>
        ` : ''}
      </div>
    `;
  },

  _refreshCalendar() {
    const content = document.getElementById('pwTabContent');
    if (content) {
      content.innerHTML = this._renderCalendarView();
      if (window.lucide) lucide.createIcons();
    }
  },

  // ── Messages View (status updates + comunicacao — Asana-style) ───────────

  _renderMessagesView() {
    // Carregar mensagens do projeto (status updates armazenados)
    const messages = this._project?.status_updates || [];
    const currentUser = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const userName = currentUser?.name || currentUser?.email || 'Voce';
    const userInitials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    // Status do projeto
    const statusOptions = [
      { value: 'em_dia', label: 'Em dia', color: '#22c55e', icon: 'check-circle' },
      { value: 'em_risco', label: 'Em risco', color: '#f59e0b', icon: 'alert-triangle' },
      { value: 'atrasado', label: 'Atrasado', color: '#ef4444', icon: 'alert-circle' },
      { value: 'pausado', label: 'Pausado', color: '#6b7280', icon: 'pause-circle' }
    ];

    const currentStatus = this._project?.project_status || 'em_dia';
    const statusInfo = statusOptions.find(s => s.value === currentStatus) || statusOptions[0];

    return `
      <div class="pw-messages">
        <div class="pw-msg-compose">
          <div class="pw-msg-compose-header">
            <div class="pw-msg-avatar" style="background:var(--accent-gold);color:#000;">${this._esc(userInitials)}</div>
            <div style="flex:1;">
              <div style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">Atualizar status do projeto</div>
              <div style="font-size:0.72rem;color:var(--text-muted);">Compartilhe o progresso com a equipe</div>
            </div>
            <div class="pw-msg-status-selector">
              ${statusOptions.map(s => `
                <button class="pw-msg-status-opt ${s.value === currentStatus ? 'pw-msg-status-opt--active' : ''}"
                        style="--s-color:${s.color};"
                        onclick="TBO_PROJECT_WORKSPACE._setProjectStatus('${s.value}')"
                        title="${s.label}">
                  <i data-lucide="${s.icon}" style="width:14px;height:14px;"></i>
                  <span>${s.label}</span>
                </button>
              `).join('')}
            </div>
          </div>
          <textarea class="pw-msg-input" id="pwMsgInput" placeholder="O que esta acontecendo no projeto? Resumo, conquistas, bloqueios..." rows="3"></textarea>
          <div class="pw-msg-compose-footer">
            <div style="display:flex;gap:8px;">
              <button class="btn btn-ghost btn-sm" title="Anexar arquivo" disabled>
                <i data-lucide="paperclip" style="width:14px;height:14px;"></i>
              </button>
              <button class="btn btn-ghost btn-sm" title="Mencionar" disabled>
                <i data-lucide="at-sign" style="width:14px;height:14px;"></i>
              </button>
            </div>
            <button class="btn btn-primary btn-sm" onclick="TBO_PROJECT_WORKSPACE._postStatusUpdate()">
              <i data-lucide="send" style="width:14px;height:14px;"></i> Publicar
            </button>
          </div>
        </div>

        <div class="pw-msg-list" id="pwMsgList">
          ${messages.length > 0 ? messages.slice().reverse().map(msg => {
            const msgDate = msg.created_at ? new Date(msg.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
            const msgStatus = statusOptions.find(s => s.value === msg.status) || statusOptions[0];
            const authorInitials = (msg.author || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

            return `
              <div class="pw-msg-item">
                <div class="pw-msg-item-header">
                  <div class="pw-msg-avatar">${this._esc(authorInitials)}</div>
                  <div style="flex:1;">
                    <span class="pw-msg-author">${this._esc(msg.author || 'Membro')}</span>
                    <span class="pw-msg-time">${msgDate}</span>
                  </div>
                  <span class="pw-msg-status-badge" style="background:${msgStatus.color}20;color:${msgStatus.color};">
                    <i data-lucide="${msgStatus.icon}" style="width:12px;height:12px;"></i> ${msgStatus.label}
                  </span>
                </div>
                <div class="pw-msg-body">${this._esc(msg.text || '')}</div>
              </div>
            `;
          }).join('') : `
            <div class="pw-msg-empty">
              <i data-lucide="message-square-plus" style="width:40px;height:40px;color:var(--text-muted);opacity:0.4;"></i>
              <h4 style="color:var(--text-primary);margin:12px 0 4px;">Nenhuma atualizacao ainda</h4>
              <p style="color:var(--text-muted);font-size:0.82rem;">Publique a primeira atualizacao de status para manter a equipe informada.</p>
            </div>
          `}
        </div>
      </div>
    `;
  },

  // ── Salvar campo do projeto (descricao, summary_note) ────────────────
  _saveProjectField(fieldName, value) {
    if (!this._project || !this._projectId) return;
    // Atualizar estado local
    this._project[fieldName] = value;
    // Persistir no storage
    if (typeof TBO_STORAGE !== 'undefined') {
      TBO_STORAGE.updateErpEntity('project', this._projectId, { [fieldName]: value });
    }
  },

  // ── Botoes interativos (Responsavel, Cliente, BUs, Equipe) ──────────

  _teamMembersCache: null,

  async _loadTeamMembers() {
    if (this._teamMembersCache) return this._teamMembersCache;
    try {
      const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
      if (client) {
        const tenantId = TBO_SUPABASE.getCurrentTenantId();
        const { data } = await client
          .from('profiles')
          .select('id, full_name, email, avatar_url, role, bu')
          .eq('tenant_id', tenantId)
          .order('full_name');
        this._teamMembersCache = (data || []).map(p => ({
          id: p.id,
          name: p.full_name || p.email || 'Sem nome',
          email: p.email || '',
          avatar_url: p.avatar_url,
          role: p.role || '',
          bu: p.bu || ''
        }));
      }
    } catch (e) {
      console.warn('[PW] Erro ao carregar membros:', e);
    }
    // Fallback: membros extraidos das tarefas
    if (!this._teamMembersCache?.length) {
      const owners = [...new Set(this._tasks.map(t => t.owner).filter(Boolean))];
      this._teamMembersCache = owners.map(name => ({ id: null, name, email: '', role: '' }));
    }
    return this._teamMembersCache;
  },

  _getUniqueClients() {
    // Pegar clientes de todos os projetos
    if (typeof TBO_STORAGE !== 'undefined') {
      const projects = TBO_STORAGE.getErpEntities('project') || [];
      return [...new Set(projects.map(p => p.client).filter(Boolean))].sort();
    }
    return [];
  },

  _buOptions: ['Branding', 'Digital 3D', 'Marketing', 'Motion', 'Vendas', 'Tecnologia', 'Estrategia'],

  async _openInteractiveDropdown(target, btnEl) {
    const wrapper = btnEl.closest('.pw-interactive-btn-wrapper');
    if (!wrapper) return;
    const dropdown = wrapper.querySelector('.pw-interactive-dropdown');
    if (!dropdown) return;

    // Fechar outros dropdowns
    document.querySelectorAll('.pw-interactive-dropdown.pw-dropdown--open, .pw-team-dropdown.pw-dropdown--open').forEach(d => {
      if (d !== dropdown) { d.classList.remove('pw-dropdown--open'); d.innerHTML = ''; }
    });

    // Toggle
    if (dropdown.classList.contains('pw-dropdown--open')) {
      dropdown.classList.remove('pw-dropdown--open');
      dropdown.innerHTML = '';
      btnEl.setAttribute('aria-expanded', 'false');
      return;
    }

    const fieldType = wrapper.dataset.type;
    let items = [];
    let searchPlaceholder = 'Buscar...';
    let multiSelect = false;
    let currentValues = [];

    if (fieldType === 'member') {
      items = await this._loadTeamMembers();
      searchPlaceholder = 'Buscar membro...';
    } else if (fieldType === 'text-select') {
      // Clientes
      const clients = this._getUniqueClients();
      items = clients.map(c => ({ name: c }));
      searchPlaceholder = 'Buscar ou digitar cliente...';
    } else if (fieldType === 'tags') {
      // BUs — multi-select
      items = this._buOptions.map(bu => ({ name: bu }));
      searchPlaceholder = 'Buscar BU...';
      multiSelect = true;
      currentValues = this._project?.services || [];
    }

    const renderItems = (filter = '') => {
      const f = filter.toLowerCase();
      const filtered = items.filter(i => i.name.toLowerCase().includes(f));
      return filtered.map(item => {
        const initials = item.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const isSelected = multiSelect ? currentValues.includes(item.name) : (this._project?.[wrapper.dataset.field] === item.name);
        return `
          <div class="pw-dropdown-item ${isSelected ? 'pw-dropdown-item--selected' : ''}" data-value="${this._esc(item.name)}" data-id="${item.id || ''}">
            ${fieldType === 'member' ? `<div class="pw-dropdown-item-avatar">${this._esc(initials)}</div>` : ''}
            ${multiSelect ? `<input type="checkbox" class="pw-dropdown-checkbox" ${isSelected ? 'checked' : ''}>` : ''}
            <div class="pw-dropdown-item-info">
              <span class="pw-dropdown-item-name">${this._esc(item.name)}</span>
              ${item.email ? `<span class="pw-dropdown-item-sub">${this._esc(item.email)}</span>` : ''}
            </div>
            ${!multiSelect && isSelected ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="var(--accent-gold)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
          </div>
        `;
      }).join('') || '<div class="pw-dropdown-empty">Nenhum resultado</div>';
    };

    dropdown.innerHTML = `
      <div class="pw-dropdown-search-wrap">
        <input type="text" class="pw-dropdown-search" placeholder="${searchPlaceholder}" autofocus>
      </div>
      <div class="pw-dropdown-list">${renderItems()}</div>
      ${fieldType === 'text-select' ? '<div class="pw-dropdown-footer"><button class="pw-dropdown-add-btn">+ Adicionar novo</button></div>' : ''}
    `;
    dropdown.classList.add('pw-dropdown--open');
    btnEl.setAttribute('aria-expanded', 'true');

    // Search handler
    const searchInput = dropdown.querySelector('.pw-dropdown-search');
    searchInput?.focus();
    searchInput?.addEventListener('input', () => {
      const list = dropdown.querySelector('.pw-dropdown-list');
      if (list) list.innerHTML = renderItems(searchInput.value);
      this._bindDropdownItemClicks(dropdown, wrapper, multiSelect);
    });

    // Enter no search para text-select → usa valor digitado
    if (fieldType === 'text-select') {
      searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
          this._selectDropdownValue(wrapper.dataset.field, searchInput.value.trim(), wrapper);
          dropdown.classList.remove('pw-dropdown--open');
          dropdown.innerHTML = '';
        }
      });
      // Botao adicionar novo
      dropdown.querySelector('.pw-dropdown-add-btn')?.addEventListener('click', () => {
        const val = searchInput?.value?.trim();
        if (val) {
          this._selectDropdownValue(wrapper.dataset.field, val, wrapper);
          dropdown.classList.remove('pw-dropdown--open');
          dropdown.innerHTML = '';
        }
      });
    }

    this._bindDropdownItemClicks(dropdown, wrapper, multiSelect);

    // Fechar ao clicar fora
    const closeHandler = (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.classList.remove('pw-dropdown--open');
        dropdown.innerHTML = '';
        btnEl.setAttribute('aria-expanded', 'false');
        document.removeEventListener('mousedown', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', closeHandler), 10);
  },

  _bindDropdownItemClicks(dropdown, wrapper, multiSelect) {
    dropdown.querySelectorAll('.pw-dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const value = item.dataset.value;
        const field = wrapper.dataset.field;

        if (multiSelect) {
          // Toggle na lista de valores
          let current = this._project?.[field] || [];
          if (!Array.isArray(current)) current = [];
          if (current.includes(value)) {
            current = current.filter(v => v !== value);
          } else {
            current.push(value);
          }
          this._saveProjectField(field, current);
          // Atualizar checkbox visual
          const cb = item.querySelector('.pw-dropdown-checkbox');
          if (cb) cb.checked = current.includes(value);
          item.classList.toggle('pw-dropdown-item--selected', current.includes(value));
          // Atualizar botao
          this._updateInteractiveBtn(wrapper, field);
        } else {
          this._selectDropdownValue(field, value, wrapper);
          dropdown.classList.remove('pw-dropdown--open');
          dropdown.innerHTML = '';
        }
      });
    });
  },

  _selectDropdownValue(field, value, wrapper) {
    this._saveProjectField(field, value);
    this._updateInteractiveBtn(wrapper, field);
    // Atualizar header se for owner
    if (field === 'owner') this._updateHeaderOwner(value);
  },

  _updateInteractiveBtn(wrapper, field) {
    const btn = wrapper.querySelector('.pw-interactive-btn');
    if (!btn) return;
    const type = wrapper.dataset.type;
    const value = this._project?.[field];

    if (type === 'member') {
      if (value) {
        const initials = value.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        btn.innerHTML = `
          <div class="pw-interactive-btn-avatar">${this._esc(initials)}</div>
          <span class="pw-interactive-btn-text">${this._esc(value)}</span>
          <svg class="pw-interactive-btn-chevron" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="m18.185 7.851-6.186 5.191-6.186-5.191a1.499 1.499 0 1 0-1.928 2.298l7.15 6a1.498 1.498 0 0 0 1.928 0l7.15-6a1.5 1.5 0 0 0-1.928-2.298Z"/></svg>
        `;
      } else {
        btn.innerHTML = `
          <div class="pw-interactive-btn-avatar pw-interactive-btn-avatar--empty">?</div>
          <span class="pw-interactive-btn-text pw-interactive-btn-text--placeholder">Adicionar responsavel...</span>
          <svg class="pw-interactive-btn-chevron" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="m18.185 7.851-6.186 5.191-6.186-5.191a1.499 1.499 0 1 0-1.928 2.298l7.15 6a1.498 1.498 0 0 0 1.928 0l7.15-6a1.5 1.5 0 0 0-1.928-2.298Z"/></svg>
        `;
      }
    } else if (type === 'text-select') {
      btn.innerHTML = `
        ${value ? `<span class="pw-interactive-btn-text">${this._esc(value)}</span>` : `<span class="pw-interactive-btn-text pw-interactive-btn-text--placeholder">Adicionar cliente...</span>`}
        <svg class="pw-interactive-btn-chevron" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="m18.185 7.851-6.186 5.191-6.186-5.191a1.499 1.499 0 1 0-1.928 2.298l7.15 6a1.498 1.498 0 0 0 1.928 0l7.15-6a1.5 1.5 0 0 0-1.928-2.298Z"/></svg>
      `;
    } else if (type === 'tags') {
      const arr = Array.isArray(value) ? value : [];
      btn.innerHTML = `
        ${arr.length ? arr.map(s => `<span class="pw-tag-chip">${this._esc(s)}</span>`).join('') : `<span class="pw-interactive-btn-text pw-interactive-btn-text--placeholder">Adicionar BUs...</span>`}
        <svg class="pw-interactive-btn-chevron" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="m18.185 7.851-6.186 5.191-6.186-5.191a1.499 1.499 0 1 0-1.928 2.298l7.15 6a1.498 1.498 0 0 0 1.928 0l7.15-6a1.5 1.5 0 0 0-1.928-2.298Z"/></svg>
      `;
    }
  },

  _updateHeaderOwner(name) {
    const btn = document.getElementById('pwHeaderOwnerBtn');
    if (!btn) return;
    const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
    btn.querySelector('.pw-owner-btn-avatar').textContent = initials;
    btn.querySelector('.pw-owner-btn-name').textContent = name || 'Sem responsavel';
  },

  async _openHeaderOwnerDropdown() {
    const dropdown = document.getElementById('pwOwnerDropdown');
    const btn = document.getElementById('pwHeaderOwnerBtn');
    if (!dropdown || !btn) return;

    if (dropdown.classList.contains('pw-dropdown--open')) {
      dropdown.classList.remove('pw-dropdown--open');
      dropdown.innerHTML = '';
      btn.setAttribute('aria-expanded', 'false');
      return;
    }

    const members = await this._loadTeamMembers();
    const currentOwner = this._project?.owner || '';

    const renderItems = (filter = '') => {
      const f = filter.toLowerCase();
      return members.filter(m => m.name.toLowerCase().includes(f)).map(m => {
        const initials = m.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const selected = m.name === currentOwner;
        return `
          <div class="pw-dropdown-item ${selected ? 'pw-dropdown-item--selected' : ''}" data-value="${this._esc(m.name)}">
            <div class="pw-dropdown-item-avatar">${this._esc(initials)}</div>
            <div class="pw-dropdown-item-info">
              <span class="pw-dropdown-item-name">${this._esc(m.name)}</span>
              ${m.email ? `<span class="pw-dropdown-item-sub">${this._esc(m.email)}</span>` : ''}
            </div>
            ${selected ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="var(--accent-gold)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
          </div>
        `;
      }).join('') || '<div class="pw-dropdown-empty">Nenhum membro encontrado</div>';
    };

    dropdown.innerHTML = `
      <div class="pw-dropdown-search-wrap"><input type="text" class="pw-dropdown-search" placeholder="Buscar membro..." autofocus></div>
      <div class="pw-dropdown-list">${renderItems()}</div>
    `;
    dropdown.classList.add('pw-dropdown--open');
    btn.setAttribute('aria-expanded', 'true');

    const search = dropdown.querySelector('.pw-dropdown-search');
    search?.focus();
    search?.addEventListener('input', () => {
      const list = dropdown.querySelector('.pw-dropdown-list');
      if (list) list.innerHTML = renderItems(search.value);
      this._bindHeaderOwnerItemClicks(dropdown);
    });

    this._bindHeaderOwnerItemClicks(dropdown);

    const closeHandler = (e) => {
      if (!document.getElementById('pwOwnerWrapper')?.contains(e.target)) {
        dropdown.classList.remove('pw-dropdown--open');
        dropdown.innerHTML = '';
        btn.setAttribute('aria-expanded', 'false');
        document.removeEventListener('mousedown', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', closeHandler), 10);
  },

  _bindHeaderOwnerItemClicks(dropdown) {
    dropdown.querySelectorAll('.pw-dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const value = item.dataset.value;
        this._saveProjectField('owner', value);
        this._updateHeaderOwner(value);
        // Atualizar botao de responsavel no detalhe
        const detailWrapper = document.querySelector('.pw-interactive-btn-wrapper[data-field="owner"]');
        if (detailWrapper) this._updateInteractiveBtn(detailWrapper, 'owner');
        dropdown.classList.remove('pw-dropdown--open');
        dropdown.innerHTML = '';
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Responsavel', `"${value}" definido como responsavel.`);
      });
    });
  },

  async _openTeamMemberDropdown(context) {
    const dropdown = document.getElementById('pwTeamDropdown');
    if (!dropdown) return;

    if (dropdown.classList.contains('pw-dropdown--open')) {
      dropdown.classList.remove('pw-dropdown--open');
      dropdown.innerHTML = '';
      return;
    }

    const members = await this._loadTeamMembers();
    // Membros ja no projeto (quem tem tarefas)
    const projectMembers = [...new Set(this._tasks.map(t => t.owner).filter(Boolean))];

    const renderItems = (filter = '') => {
      const f = filter.toLowerCase();
      return members.filter(m => m.name.toLowerCase().includes(f) && !projectMembers.includes(m.name)).map(m => {
        const initials = m.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        return `
          <div class="pw-dropdown-item" data-value="${this._esc(m.name)}">
            <div class="pw-dropdown-item-avatar">${this._esc(initials)}</div>
            <div class="pw-dropdown-item-info">
              <span class="pw-dropdown-item-name">${this._esc(m.name)}</span>
              ${m.email ? `<span class="pw-dropdown-item-sub">${this._esc(m.email)}</span>` : ''}
            </div>
          </div>
        `;
      }).join('') || '<div class="pw-dropdown-empty">Todos os membros ja estao no projeto</div>';
    };

    dropdown.innerHTML = `
      <div class="pw-dropdown-search-wrap"><input type="text" class="pw-dropdown-search" placeholder="Buscar membro para adicionar..." autofocus></div>
      <div class="pw-dropdown-list">${renderItems()}</div>
    `;
    dropdown.classList.add('pw-dropdown--open');

    const search = dropdown.querySelector('.pw-dropdown-search');
    search?.focus();
    search?.addEventListener('input', () => {
      const list = dropdown.querySelector('.pw-dropdown-list');
      if (list) list.innerHTML = renderItems(search.value);
      this._bindTeamDropdownClicks(dropdown);
    });

    this._bindTeamDropdownClicks(dropdown);

    const closeHandler = (e) => {
      if (!dropdown.contains(e.target) && !e.target.closest('#pwAddTeamMember')) {
        dropdown.classList.remove('pw-dropdown--open');
        dropdown.innerHTML = '';
        document.removeEventListener('mousedown', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', closeHandler), 10);
  },

  async _openCellDropdown(taskId, cellType, cellEl) {
    // Fechar dropdowns anteriores
    document.querySelectorAll('.pw-cell-dropdown').forEach(d => d.remove());

    const task = this._tasks.find(t => t.id === taskId);
    if (!task) return;

    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
    let options = [];

    if (cellType === 'owner') {
      const members = await this._loadTeamMembers();
      options = members.map(m => ({ value: m.name, label: m.name, avatar: true }));
      options.unshift({ value: '', label: 'Sem responsavel', avatar: false });
    } else if (cellType === 'priority') {
      options = [
        { value: 'urgente', label: 'Urgente', color: '#ef4444' },
        { value: 'alta', label: 'Alta', color: '#f59e0b' },
        { value: 'media', label: 'Media', color: '#3b82f6' },
        { value: 'baixa', label: 'Baixa', color: '#6b7280' }
      ];
    } else if (cellType === 'status') {
      const labels = sm?.labels || {};
      const colors = sm?.colors || {};
      options = Object.entries(labels).map(([key, label]) => ({
        value: key, label, color: colors[key] || '#6b7280'
      }));
    }

    const rect = cellEl.getBoundingClientRect();
    const dropdown = document.createElement('div');
    dropdown.className = 'pw-cell-dropdown';
    dropdown.style.cssText = `position:fixed;top:${rect.bottom + 2}px;left:${rect.left}px;z-index:1100;min-width:${Math.max(rect.width, 160)}px;`;

    dropdown.innerHTML = `
      <div class="pw-dropdown-list" style="max-height:200px;">
        ${options.map(opt => {
          const isSelected = task[cellType] === opt.value;
          const initials = opt.avatar && opt.value ? opt.value.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '';
          return `
            <div class="pw-dropdown-item ${isSelected ? 'pw-dropdown-item--selected' : ''}" data-value="${this._esc(opt.value)}">
              ${opt.avatar && opt.value ? `<div class="pw-dropdown-item-avatar" style="width:20px;height:20px;font-size:0.55rem;">${this._esc(initials)}</div>` : ''}
              ${opt.color ? `<span style="width:8px;height:8px;border-radius:50%;background:${opt.color};flex-shrink:0;"></span>` : ''}
              <span class="pw-dropdown-item-name" style="font-size:0.78rem;">${this._esc(opt.label)}</span>
              ${isSelected ? '<svg viewBox="0 0 24 24" width="12" height="12" fill="var(--accent-gold)" style="margin-left:auto;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.body.appendChild(dropdown);

    // Bind item clicks
    dropdown.querySelectorAll('.pw-dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const value = item.dataset.value;
        this._updateTaskField(taskId, cellType, value);
        dropdown.remove();
      });
    });

    // Fechar ao clicar fora
    const closeHandler = (e) => {
      if (!dropdown.contains(e.target) && !cellEl.contains(e.target)) {
        dropdown.remove();
        document.removeEventListener('mousedown', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', closeHandler), 10);
  },

  _updateTaskField(taskId, field, value) {
    const task = this._tasks.find(t => t.id === taskId);
    if (!task) return;
    task[field] = value;
    if (typeof TBO_STORAGE !== 'undefined') {
      TBO_STORAGE.updateErpEntity('task', taskId, { [field]: value });
    }
    // Re-render a view
    const content = document.getElementById('pwTabContent');
    if (content) {
      if (this._activeTab === 'list') {
        content.innerHTML = this._renderListView();
        this._bindSectionToggles();
      } else if (this._activeTab === 'board') {
        content.innerHTML = this._renderBoardView();
      }
      this._bindActions();
      if (window.lucide) lucide.createIcons();
    }
  },

  _bindTeamDropdownClicks(dropdown) {
    dropdown.querySelectorAll('.pw-dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const name = item.dataset.value;
        // Criar tarefa placeholder para o membro aparecer na equipe
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Membro adicionado', `"${name}" adicionado ao projeto. Atribua tarefas para ele.`);
        dropdown.classList.remove('pw-dropdown--open');
        dropdown.innerHTML = '';
        // Adicionar o membro a equipe via project_members (se existir)
        const currentMembers = this._project?.team_members || [];
        currentMembers.push(name);
        this._saveProjectField('team_members', [...new Set(currentMembers)]);
      });
    });
  },

  _setProjectStatus(status) {
    if (!this._project) return;
    this._project.project_status = status;
    if (typeof TBO_STORAGE !== 'undefined') {
      TBO_STORAGE.updateErpEntity('project', this._projectId, { project_status: status });
    }
    // Re-render messages
    const content = document.getElementById('pwTabContent');
    if (content) {
      content.innerHTML = this._renderMessagesView();
      if (window.lucide) lucide.createIcons();
    }
  },

  _postStatusUpdate() {
    const input = document.getElementById('pwMsgInput');
    if (!input || !input.value.trim()) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Mensagem vazia', 'Escreva algo antes de publicar.');
      return;
    }

    const currentUser = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const update = {
      id: 'msg_' + Date.now(),
      text: input.value.trim(),
      author: currentUser?.name || currentUser?.email || 'Usuario',
      status: this._project?.project_status || 'em_dia',
      created_at: new Date().toISOString()
    };

    if (!this._project.status_updates) this._project.status_updates = [];
    this._project.status_updates.push(update);

    if (typeof TBO_STORAGE !== 'undefined') {
      TBO_STORAGE.updateErpEntity('project', this._projectId, { status_updates: this._project.status_updates });
    }

    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Publicado!', 'Atualizacao de status enviada.');

    // Re-render
    const content = document.getElementById('pwTabContent');
    if (content) {
      content.innerHTML = this._renderMessagesView();
      if (window.lucide) lucide.createIcons();
    }
  },

  // ── Files View (galeria de anexos — Asana-style) ─────────────────────────

  _renderFilesView() {
    // Coletar anexos de tarefas + projeto
    const allFiles = [];

    // Arquivos do projeto
    if (this._project?.attachments?.length) {
      this._project.attachments.forEach(f => {
        allFiles.push({ ...f, source: 'Projeto', sourceId: this._projectId });
      });
    }

    // Arquivos das tarefas
    this._tasks.forEach(t => {
      if (t.attachments?.length) {
        t.attachments.forEach(f => {
          allFiles.push({ ...f, source: t.title || t.name || 'Tarefa', sourceId: t.id });
        });
      }
    });

    // Agrupar por tipo
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'];

    const getExt = (name) => (name || '').split('.').pop().toLowerCase();
    const isImage = (name) => imageExts.includes(getExt(name));

    const getFileIcon = (name) => {
      const ext = getExt(name);
      if (imageExts.includes(ext)) return 'image';
      if (['pdf'].includes(ext)) return 'file-text';
      if (['doc', 'docx'].includes(ext)) return 'file-text';
      if (['xls', 'xlsx', 'csv'].includes(ext)) return 'table';
      if (['ppt', 'pptx'].includes(ext)) return 'presentation';
      if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
      return 'file';
    };

    const getFileColor = (name) => {
      const ext = getExt(name);
      if (imageExts.includes(ext)) return '#8b5cf6';
      if (['pdf'].includes(ext)) return '#ef4444';
      if (['doc', 'docx'].includes(ext)) return '#3b82f6';
      if (['xls', 'xlsx', 'csv'].includes(ext)) return '#22c55e';
      if (['ppt', 'pptx'].includes(ext)) return '#f59e0b';
      return '#6b7280';
    };

    if (allFiles.length === 0) {
      return `
        <div class="pw-files-empty">
          <i data-lucide="folder-open" style="width:48px;height:48px;color:var(--text-muted);opacity:0.4;"></i>
          <h3 style="color:var(--text-primary);margin:16px 0 4px;">Nenhum arquivo</h3>
          <p style="color:var(--text-muted);font-size:0.82rem;">Arquivos anexados as tarefas aparecerao aqui automaticamente.</p>
          <p style="color:var(--text-muted);font-size:0.75rem;margin-top:8px;">Adicione arquivos pelo detalhe da tarefa.</p>
        </div>
      `;
    }

    return `
      <div class="pw-files">
        <div class="pw-files-header">
          <span style="font-size:0.85rem;font-weight:600;color:var(--text-primary);">${allFiles.length} arquivo${allFiles.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="pw-files-grid">
          ${allFiles.map(f => {
            const fname = f.name || f.filename || 'arquivo';
            const fIcon = getFileIcon(fname);
            const fColor = getFileColor(fname);
            const fSize = f.size ? this._formatFileSize(f.size) : '';
            const fDate = f.uploaded_at ? new Date(f.uploaded_at).toLocaleDateString('pt-BR') : '';
            const isImg = isImage(fname);

            return `
              <div class="pw-file-card" ${f.url ? `onclick="window.open('${f.url}', '_blank')"` : ''}>
                <div class="pw-file-preview" style="background:${fColor}10;">
                  ${isImg && f.url ? `<img src="${f.url}" alt="${this._esc(fname)}" class="pw-file-thumb" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
                    <div class="pw-file-icon-wrap" style="display:none;">` :
                    `<div class="pw-file-icon-wrap">`}
                    <i data-lucide="${fIcon}" style="width:28px;height:28px;color:${fColor};"></i>
                  </div>
                </div>
                <div class="pw-file-info">
                  <div class="pw-file-name" title="${this._esc(fname)}">${this._esc(fname)}</div>
                  <div class="pw-file-meta">
                    ${fSize ? `<span>${fSize}</span>` : ''}
                    ${fDate ? `<span>${fDate}</span>` : ''}
                  </div>
                  <div class="pw-file-source" title="${this._esc(f.source)}">${this._esc(f.source)}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  _formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
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
    // Overview: campos editaveis (descricao e summary)
    document.querySelectorAll('.pw-ov-editable-field').forEach(field => {
      // Placeholder visual quando vazio
      const updatePlaceholder = () => {
        const text = field.textContent.trim();
        field.classList.toggle('pw-ov-editable--empty', !text);
      };
      updatePlaceholder();

      field.addEventListener('focus', () => {
        field.classList.add('pw-ov-editable--focused');
      });

      field.addEventListener('blur', () => {
        field.classList.remove('pw-ov-editable--focused');
        updatePlaceholder();
        const fieldName = field.dataset.field;
        const value = field.textContent.trim();
        this._saveProjectField(fieldName, value);
      });

      field.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          field.blur();
        }
        if (e.key === 'Escape') {
          field.blur();
        }
      });
    });

    // Overview: campos de detalhes editaveis (Cliente, Responsavel, Codigo, etc)
    document.querySelectorAll('.pw-detail-editable').forEach(field => {
      const updatePlaceholder = () => {
        const text = field.textContent.trim();
        field.classList.toggle('pw-detail-editable--empty', !text);
      };
      updatePlaceholder();

      field.addEventListener('focus', () => {
        field.classList.add('pw-detail-editable--focused');
      });

      field.addEventListener('blur', () => {
        field.classList.remove('pw-detail-editable--focused');
        updatePlaceholder();
        const fieldName = field.dataset.field;
        const dataType = field.dataset.type;
        let value = field.textContent.trim();

        // Tratar tipos especiais
        if (dataType === 'currency') {
          // Extrair numero de "R$ 1.234,56"
          value = value.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
          value = parseFloat(value) || 0;
        } else if (dataType === 'list') {
          // Converter "Digital 3D, Motion" → ["Digital 3D", "Motion"]
          value = value.split(',').map(s => s.trim()).filter(Boolean);
        }

        this._saveProjectField(fieldName, value);
      });

      field.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); field.blur(); }
        if (e.key === 'Escape') field.blur();
      });
    });

    // Overview: campos de data editaveis
    document.querySelectorAll('.pw-detail-date-input').forEach(input => {
      input.addEventListener('change', () => {
        const fieldName = input.dataset.field;
        this._saveProjectField(fieldName, input.value || null);
      });
    });

    // Overview: botoes interativos (Responsavel, Cliente, BUs)
    document.querySelectorAll('.pw-interactive-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openInteractiveDropdown(btn.dataset.target, btn);
      });
    });

    // Header: botao owner
    document.getElementById('pwHeaderOwnerBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._openHeaderOwnerDropdown();
    });

    // Equipe: adicionar membro
    document.getElementById('pwAddTeamMember')?.addEventListener('click', () => {
      this._openTeamMemberDropdown('add');
    });

    // Equipe: cards de membros (dropdown de opcoes)
    document.querySelectorAll('.pw-team-member-card').forEach(card => {
      card.addEventListener('click', () => {
        const name = card.dataset.memberName;
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info(name, 'Clique para ver tarefas atribuidas (em breve).');
      });
    });

    // Lista: celulas clicaveis (owner, priority, status)
    document.querySelectorAll('.pw-cell-clickable').forEach(cell => {
      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = cell.dataset.taskId;
        const cellType = cell.dataset.cell;
        this._openCellDropdown(taskId, cellType, cell);
      });
    });

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

    // Board card clicks (abrir detalhe) + context menu + drag & drop
    document.querySelectorAll('.pw-board-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.pw-card-check')) return; // Nao abrir se clicou no check
        const taskId = card.dataset.taskId;
        if (taskId) this._openTaskDetail(taskId);
      });

      // Context menu (right-click) nos board cards
      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const taskId = card.dataset.taskId;
        if (taskId) this._showTaskContextMenu(taskId, e.clientX, e.clientY);
      });
    });

    // Board drag & drop (mover entre colunas = mudar status)
    this._initBoardDragDrop();

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
        <button class="btn btn-ghost btn-sm" id="pwDetailCopyLink" style="flex-shrink:0;" title="Copiar link da tarefa">
          <i data-lucide="link" style="width:16px;height:16px;"></i>
        </button>
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

        <!-- Subtarefas (funcional — criar, toggle, excluir) -->
        <div class="pw-detail-field">
          <div class="pw-detail-label" style="display:flex;align-items:center;justify-content:space-between;">
            <span>Subtarefas</span>
            <span class="pw-subtask-count">${(task.subtasks || []).length}</span>
          </div>
          <div class="pw-subtasks-list" id="pwSubtasksList">
            ${this._renderSubtasks(taskId, task.subtasks || [])}
          </div>
          <div class="pw-subtask-add">
            <button class="pw-card-check" style="opacity:0.3;pointer-events:none;">
              <i data-lucide="circle" style="width:14px;height:14px;"></i>
            </button>
            <input type="text" class="pw-subtask-input" id="pwSubtaskInput" placeholder="Adicionar subtarefa..."
              onkeydown="if(event.key==='Enter'&&this.value.trim()){TBO_PROJECT_WORKSPACE._addSubtask('${this._esc(taskId)}',this.value);this.value='';}" />
          </div>
        </div>

        <!-- Dependencias -->
        <div class="pw-detail-field">
          <div class="pw-detail-label">Dependencias</div>
          <div class="pw-detail-deps" style="padding:4px 0;">
            ${task.dependencies && task.dependencies.length ? task.dependencies.map(dep => {
              const depTask = this._tasks.find(dt => dt.id === dep);
              return depTask ? `<span class="pw-dep-chip" onclick="TBO_PROJECT_WORKSPACE._openTaskDetail('${this._esc(dep)}')">${this._esc(depTask.title || depTask.name)}</span>` : '';
            }).join('') : '<span style="font-size:0.78rem;color:var(--text-muted);cursor:pointer;" onclick="TBO_PROJECT_WORKSPACE._addDependency(\''+this._esc(taskId)+'\')"><i data-lucide="plus" style="width:12px;height:12px;vertical-align:middle;"></i> Adicionar dependencia</span>'}
          </div>
        </div>

        <!-- Comentarios / Atividade (Asana-style) -->
        <div class="pw-detail-field pw-detail-comments-section">
          <div class="pw-detail-label" style="display:flex;align-items:center;gap:8px;">
            <span>Comentarios</span>
            <span class="pw-comment-count" id="pwCommentCount">${(task.comments || []).length}</span>
          </div>
          <div class="pw-comment-input-wrap">
            <div class="pw-comment-avatar">${this._getMyInitials()}</div>
            <input type="text" class="pw-comment-input" id="pwCommentInput" placeholder="Escreva um comentario..."
              onkeydown="if(event.key==='Enter'&&this.value.trim()){TBO_PROJECT_WORKSPACE._addComment('${this._esc(taskId)}',this.value);this.value='';}" />
            <button class="pw-comment-send" onclick="const inp=document.getElementById('pwCommentInput');if(inp.value.trim()){TBO_PROJECT_WORKSPACE._addComment('${this._esc(taskId)}',inp.value);inp.value='';}">
              <i data-lucide="send" style="width:14px;height:14px;"></i>
            </button>
          </div>
          <div class="pw-comments-list" id="pwCommentsList">
            ${this._renderComments(task.comments || [])}
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
    // Copiar link da tarefa
    const copyLinkBtn = document.getElementById('pwDetailCopyLink');
    if (copyLinkBtn) copyLinkBtn.addEventListener('click', () => this._copyTaskLink(taskId));

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

  // ── Subtarefas (criar, toggle, excluir) ──────────────────────────────

  _renderSubtasks(taskId, subtasks) {
    if (!subtasks || subtasks.length === 0) return '';
    return subtasks.map((st, idx) => {
      const isDone = st.done || st.status === 'concluida';
      return `
        <div class="pw-subtask-item${isDone ? ' pw-subtask-item--done' : ''}">
          <button class="pw-card-check${isDone ? ' pw-card-check--done' : ''}" onclick="TBO_PROJECT_WORKSPACE._toggleSubtask('${this._esc(taskId)}',${idx})">
            <i data-lucide="${isDone ? 'check-circle-2' : 'circle'}" style="width:15px;height:15px;"></i>
          </button>
          <span class="pw-subtask-title${isDone ? ' pw-subtask-title--done' : ''}">${this._esc(st.title || st.name || '')}</span>
          <button class="pw-subtask-delete" onclick="TBO_PROJECT_WORKSPACE._deleteSubtask('${this._esc(taskId)}',${idx})" title="Excluir subtarefa">
            <i data-lucide="x" style="width:12px;height:12px;"></i>
          </button>
        </div>`;
    }).join('');
  },

  _addSubtask(taskId, title) {
    if (!title || !title.trim()) return;
    const task = this._tasks.find(t => t.id === taskId);
    if (!task) return;
    if (!task.subtasks) task.subtasks = [];
    task.subtasks.push({ title: title.trim(), done: false, id: Date.now().toString(36) });
    // Persistir
    if (typeof TBO_STORAGE !== 'undefined') {
      TBO_STORAGE.updateErpEntity('task', taskId, { subtasks: task.subtasks });
    }
    // Atualizar UI
    const list = document.getElementById('pwSubtasksList');
    if (list) { list.innerHTML = this._renderSubtasks(taskId, task.subtasks); if (window.lucide) lucide.createIcons(); }
    // Atualizar contador
    const countEl = document.querySelector('.pw-subtask-count');
    if (countEl) countEl.textContent = task.subtasks.length;
  },

  _toggleSubtask(taskId, idx) {
    const task = this._tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[idx]) return;
    task.subtasks[idx].done = !task.subtasks[idx].done;
    if (typeof TBO_STORAGE !== 'undefined') {
      TBO_STORAGE.updateErpEntity('task', taskId, { subtasks: task.subtasks });
    }
    const list = document.getElementById('pwSubtasksList');
    if (list) { list.innerHTML = this._renderSubtasks(taskId, task.subtasks); if (window.lucide) lucide.createIcons(); }
  },

  _deleteSubtask(taskId, idx) {
    const task = this._tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;
    task.subtasks.splice(idx, 1);
    if (typeof TBO_STORAGE !== 'undefined') {
      TBO_STORAGE.updateErpEntity('task', taskId, { subtasks: task.subtasks });
    }
    const list = document.getElementById('pwSubtasksList');
    if (list) { list.innerHTML = this._renderSubtasks(taskId, task.subtasks); if (window.lucide) lucide.createIcons(); }
    const countEl = document.querySelector('.pw-subtask-count');
    if (countEl) countEl.textContent = task.subtasks.length;
  },

  // ── Comentarios (Asana-style activity feed) ──────────────────────────

  _getMyInitials() {
    try {
      const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      if (user?.name) return user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      return 'EU';
    } catch (e) { return 'EU'; }
  },

  _renderComments(comments) {
    if (!comments || comments.length === 0) {
      return '<div class="pw-no-comments">Nenhum comentario ainda. Seja o primeiro!</div>';
    }
    return comments.slice().reverse().map(c => {
      const initials = (c.author || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';
      const timeStr = c.created_at ? this._timeAgo(c.created_at) : '';
      return `
        <div class="pw-comment-item">
          <div class="pw-comment-avatar">${initials}</div>
          <div class="pw-comment-content">
            <div class="pw-comment-header">
              <span class="pw-comment-author">${this._esc(c.author || 'Anonimo')}</span>
              <span class="pw-comment-time">${timeStr}</span>
            </div>
            <div class="pw-comment-text">${this._esc(c.text || '')}</div>
          </div>
        </div>`;
    }).join('');
  },

  _timeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now - then;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min atras`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atras`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d atras`;
    return then.toLocaleDateString('pt-BR');
  },

  _addComment(taskId, text) {
    if (!text || !text.trim()) return;
    const task = this._tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!task.comments) task.comments = [];
    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const comment = {
      id: Date.now().toString(36),
      author: user?.name || 'Voce',
      text: text.trim(),
      created_at: new Date().toISOString()
    };
    task.comments.push(comment);

    // Persistir
    if (typeof TBO_STORAGE !== 'undefined') {
      TBO_STORAGE.updateErpEntity('task', taskId, { comments: task.comments });
    }

    // Atualizar UI
    const list = document.getElementById('pwCommentsList');
    if (list) {
      list.innerHTML = this._renderComments(task.comments);
      if (window.lucide) lucide.createIcons();
    }
    const countEl = document.getElementById('pwCommentCount');
    if (countEl) countEl.textContent = task.comments.length;
  },

  _addDependency(taskId) {
    // Placeholder — abrir seletor de dependencias futuramente
    if (typeof TBO_TOAST !== 'undefined') {
      TBO_TOAST.info('Em breve', 'Selecionar dependencias sera disponibilizado em breve.');
    }
  },

  // ── Deep Links (copiar link compartilhavel) ─────────────────────────

  _getBaseUrl() {
    return `${window.location.origin}${window.location.pathname}`;
  },

  _copyProjectLink() {
    const url = `${this._getBaseUrl()}#projeto/${this._projectId}/${this._activeTab}`;
    navigator.clipboard.writeText(url).then(() => {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Link copiado!', 'Link do projeto copiado para a area de transferencia.');
    }).catch(() => {
      // Fallback para navegadores que nao suportam clipboard API
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('URL do projeto', url);
    });
  },

  _copyTaskLink(taskId) {
    const url = `${this._getBaseUrl()}#projeto/${this._projectId}/${this._activeTab}?task=${taskId}`;
    navigator.clipboard.writeText(url).then(() => {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Link copiado!', 'Link da tarefa copiado para a area de transferencia.');
    }).catch(() => {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('URL da tarefa', url);
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
        // Abrir detail e focar no input de subtarefa
        this._openTaskDetail(taskId);
        setTimeout(() => {
          const input = document.getElementById('pwSubtaskInput');
          if (input) input.focus();
        }, 400);
        break;
      case 'copy_link':
        this._copyTaskLink(taskId);
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

  // Board drag & drop: mover cards entre colunas (mudar status)
  _initBoardDragDrop() {
    let draggedCardId = null;

    document.querySelectorAll('.pw-board-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedCardId = card.dataset.taskId;
        card.classList.add('pw-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedCardId);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('pw-dragging');
        document.querySelectorAll('.pw-board-cards--dragover').forEach(el => el.classList.remove('pw-board-cards--dragover'));
        draggedCardId = null;
      });
    });

    // Drop targets: colunas do board
    document.querySelectorAll('.pw-board-cards').forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        col.classList.add('pw-board-cards--dragover');
      });

      col.addEventListener('dragleave', (e) => {
        // So remover se saiu da coluna mesmo (nao de filho)
        if (!col.contains(e.relatedTarget)) {
          col.classList.remove('pw-board-cards--dragover');
        }
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('pw-board-cards--dragover');
        const newStatus = col.dataset.status;
        if (!draggedCardId || !newStatus) return;

        const task = this._tasks.find(t => t.id === draggedCardId);
        if (!task || task.status === newStatus) return;

        const oldStatus = task.status;
        task.status = newStatus;

        // Persistir
        if (typeof TBO_STORAGE !== 'undefined') {
          TBO_STORAGE.updateErpEntity('task', draggedCardId, { status: newStatus });
        }

        // Atualizar secao (se agrupado por status)
        this._refreshListView();

        const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
        const lbl = sm?.labels?.[newStatus] || newStatus;
        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.success('Status atualizado', `Tarefa movida para "${lbl}"`);
        }

        draggedCardId = null;
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

  // ── Tab Drag & Drop (reordenar) ──────────────────────────────────────

  _bindTabDragDrop() {
    const tabsBar = document.querySelector('.pw-tabs-bar');
    if (!tabsBar) return;

    let draggedTab = null;
    let dragIndicator = null;

    tabsBar.addEventListener('dragstart', (e) => {
      const tab = e.target.closest('.pw-tab[draggable]');
      if (!tab) return;
      draggedTab = tab;
      tab.classList.add('pw-tab--dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', tab.dataset.tab);

      // Indicador de posicao (linha vertical)
      dragIndicator = document.createElement('div');
      dragIndicator.className = 'pw-tab-drop-indicator';
    });

    tabsBar.addEventListener('dragover', (e) => {
      if (!draggedTab) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const target = e.target.closest('.pw-tab[draggable]');
      if (!target || target === draggedTab) {
        if (dragIndicator?.parentNode) dragIndicator.remove();
        return;
      }

      // Posicionar indicador antes ou depois do target
      const rect = target.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      const insertBefore = e.clientX < midX;

      if (dragIndicator.parentNode) dragIndicator.remove();
      if (insertBefore) {
        target.before(dragIndicator);
      } else {
        target.after(dragIndicator);
      }
    });

    tabsBar.addEventListener('dragend', () => {
      if (draggedTab) {
        draggedTab.classList.remove('pw-tab--dragging');
        draggedTab = null;
      }
      if (dragIndicator?.parentNode) dragIndicator.remove();
      dragIndicator = null;
    });

    tabsBar.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!draggedTab || !dragIndicator?.parentNode) return;

      // Inserir tab na posicao do indicador
      dragIndicator.replaceWith(draggedTab);
      draggedTab.classList.remove('pw-tab--dragging');

      // Salvar nova ordem
      const newOrder = [...tabsBar.querySelectorAll('.pw-tab[data-tab]')]
        .map(t => t.dataset.tab);
      this._setTabOrder(newOrder);

      draggedTab = null;
      dragIndicator = null;

      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Tabs', 'Ordem das tabs atualizada');
      }
    });
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
        // Re-bind tab clicks + DnD
        document.querySelectorAll('.pw-tab').forEach(t => {
          t.addEventListener('click', (e) => {
            const tabId = e.currentTarget.dataset.tab;
            if (tabId !== this._activeTab) {
              TBO_ROUTER.navigate(`projeto/${this._projectId}/${tabId}`);
            }
          });
        });
        this._bindTabDragDrop();
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
.pw-tab[draggable] { cursor: grab; }
.pw-tab[draggable]:active { cursor: grabbing; }
.pw-tab--dragging { opacity: 0.3; background: var(--bg-tertiary); }
.pw-tab-drop-indicator { width: 2px; background: var(--accent-gold); border-radius: 1px; align-self: stretch; margin: 4px 0; flex-shrink: 0; animation: pw-indicator-pulse 0.8s ease infinite alternate; }
@keyframes pw-indicator-pulse { from { opacity: 0.5; } to { opacity: 1; } }

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

/* Task detail panel (side drawer — solid bg, Asana-style) */
.pw-task-detail { position: fixed; top: 0; right: 0; width: 540px; max-width: 95vw; height: 100vh; background: var(--bg-secondary, #1e1e1e); border-left: 2px solid var(--border-subtle); box-shadow: -8px 0 32px rgba(0,0,0,0.4); z-index: 1000; transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); overflow-y: auto; display: flex; flex-direction: column; }
.pw-task-detail.pw-detail-open { transform: translateX(0); }
.pw-detail-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; background: var(--bg-tertiary, #252525); border-bottom: 1px solid var(--border-subtle); position: sticky; top: 0; z-index: 2; }
.pw-detail-body { flex: 1; padding: 20px; overflow-y: auto; }
.pw-detail-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; opacity: 0; transition: opacity 0.2s; }
.pw-detail-backdrop.pw-detail-open { opacity: 1; }
.pw-detail-header { display: flex; align-items: flex-start; gap: 12px; padding: 20px 24px; border-bottom: 1px solid var(--border-subtle); }
.pw-detail-body { padding: 20px 24px; }
.pw-detail-field { margin-bottom: 12px; }
.pw-detail-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 4px; font-weight: 600; }
.pw-detail-value { font-size: 0.88rem; color: var(--text-primary); }
.pw-detail-textarea { width: 100%; min-height: 80px; padding: 10px 12px; font-size: 0.82rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--bg-primary, #181818); color: var(--text-primary); resize: vertical; outline: none; font-family: inherit; }
.pw-detail-textarea:focus { border-color: var(--accent-gold); box-shadow: 0 0 0 2px rgba(212,175,55,0.15); }
.pw-detail-input { width: 100%; padding: 8px 12px; font-size: 0.85rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--bg-primary, #181818); color: var(--text-primary); outline: none; font-family: inherit; }
.pw-detail-input:focus { border-color: var(--accent-gold); box-shadow: 0 0 0 2px rgba(212,175,55,0.1); }
.pw-detail-select { padding: 8px 12px; font-size: 0.85rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--bg-primary, #181818); color: var(--text-primary); outline: none; cursor: pointer; }

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
.pw-detail-editable { outline: none; border-radius: 4px; padding: 2px 6px; margin: -2px -6px; transition: background 0.15s, box-shadow 0.15s; cursor: text; min-height: 1.3em; }
.pw-detail-editable:hover { background: rgba(232, 81, 2, 0.05); }
.pw-detail-editable.pw-detail-editable--focused { background: var(--bg-primary); box-shadow: 0 0 0 2px var(--accent-gold); }
.pw-detail-editable.pw-detail-editable--empty::before { content: attr(data-placeholder); color: var(--text-muted); font-style: italic; font-weight: 400; pointer-events: none; }
.pw-detail-date-input { font-size: 0.85rem; font-weight: 500; color: var(--text-primary); background: transparent; border: none; border-radius: 4px; padding: 2px 6px; margin: -2px -6px; outline: none; font-family: inherit; cursor: pointer; transition: background 0.15s, box-shadow 0.15s; }
.pw-detail-date-input:hover { background: rgba(232, 81, 2, 0.05); }
.pw-detail-date-input:focus { background: var(--bg-primary); box-shadow: 0 0 0 2px var(--accent-gold); }
.pw-detail-date-input::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
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
.pw-board-cards--dragover { background: rgba(212,175,55,0.08); outline: 2px dashed var(--accent-gold); outline-offset: -2px; border-radius: 0 0 8px 8px; }
.pw-board-card.pw-dragging { opacity: 0.4; transform: scale(0.95); }

/* ── Board Cards Asana-style ── */
.pw-card-top { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
.pw-card-check { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0; flex-shrink: 0; transition: color 0.15s; }
.pw-card-check:hover { color: var(--color-success); }
.pw-card-check--done { color: var(--color-success, #22c55e); }
.pw-board-card--done { opacity: 0.6; }
.pw-board-card--done .pw-board-card-name { text-decoration: line-through; color: var(--text-muted); }
.pw-card-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
.pw-card-badge { font-size: 0.65rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; white-space: nowrap; }
.pw-card-date { display: flex; align-items: center; gap: 3px; font-size: 0.68rem; color: var(--text-muted); }
.pw-card-footer { display: flex; align-items: center; gap: 6px; margin-top: 4px; padding-top: 6px; border-top: 1px solid var(--border-subtle); }
.pw-card-avatar { width: 22px; height: 22px; border-radius: 50%; background: var(--accent-gold); color: #000; font-size: 0.6rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pw-card-owner-name { font-size: 0.7rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pw-board-add-btn { background: none; border: 1px dashed var(--border-subtle); border-radius: 8px; padding: 8px; color: var(--text-muted); font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: all 0.15s; margin-top: 4px; }
.pw-board-add-btn:hover { border-color: var(--accent-gold); color: var(--accent-gold); background: rgba(212,175,55,0.05); }

/* ── Task Detail Comments ── */
.pw-detail-comments-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-subtle); }
.pw-comment-count { font-size: 0.65rem; background: var(--bg-tertiary); color: var(--text-muted); padding: 1px 7px; border-radius: 10px; font-weight: 500; }
.pw-comment-input-wrap { display: flex; align-items: center; gap: 8px; margin-top: 8px; margin-bottom: 12px; }
.pw-comment-input { flex: 1; padding: 8px 12px; font-size: 0.82rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); outline: none; transition: border-color 0.15s; }
.pw-comment-input:focus { border-color: var(--accent-gold); box-shadow: 0 0 0 2px rgba(212,175,55,0.1); }
.pw-comment-input::placeholder { color: var(--text-muted); }
.pw-comment-send { background: var(--accent-gold); border: none; color: #000; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity 0.15s; flex-shrink: 0; }
.pw-comment-send:hover { opacity: 0.85; }
.pw-comment-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--accent-gold); color: #000; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pw-comments-list { display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; }
.pw-comment-item { display: flex; gap: 8px; padding: 8px 0; }
.pw-comment-content { flex: 1; min-width: 0; }
.pw-comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.pw-comment-author { font-size: 0.78rem; font-weight: 600; color: var(--text-primary); }
.pw-comment-time { font-size: 0.68rem; color: var(--text-muted); }
.pw-comment-text { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
.pw-no-comments { font-size: 0.78rem; color: var(--text-muted); padding: 12px 0; text-align: center; }
.pw-dep-chip { display: inline-flex; align-items: center; gap: 4px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 3px 10px; font-size: 0.72rem; color: var(--text-primary); cursor: pointer; transition: border-color 0.15s; }
.pw-dep-chip:hover { border-color: var(--accent-gold); }

/* ── Subtarefas (Asana-style) ── */
.pw-subtasks-list { display: flex; flex-direction: column; gap: 2px; margin: 4px 0; }
.pw-subtask-item { display: flex; align-items: center; gap: 8px; padding: 5px 4px; border-radius: 6px; transition: background 0.1s; }
.pw-subtask-item:hover { background: var(--bg-tertiary); }
.pw-subtask-item:hover .pw-subtask-delete { opacity: 1; }
.pw-subtask-item--done { opacity: 0.6; }
.pw-subtask-title { flex: 1; font-size: 0.82rem; color: var(--text-primary); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pw-subtask-title--done { text-decoration: line-through; color: var(--text-muted); }
.pw-subtask-delete { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; border-radius: 4px; opacity: 0; transition: all 0.15s; flex-shrink: 0; }
.pw-subtask-delete:hover { color: var(--color-danger, #ef4444); background: rgba(239,68,68,0.1); }
.pw-subtask-count { font-size: 0.65rem; background: var(--bg-tertiary); color: var(--text-muted); padding: 1px 7px; border-radius: 10px; }
.pw-subtask-add { display: flex; align-items: center; gap: 8px; padding: 4px; margin-top: 4px; }
.pw-subtask-input { flex: 1; padding: 6px 10px; font-size: 0.82rem; border: 1px solid transparent; border-radius: 6px; background: transparent; color: var(--text-primary); outline: none; transition: all 0.15s; }
.pw-subtask-input:focus { border-color: var(--accent-gold); background: var(--bg-primary); box-shadow: 0 0 0 2px rgba(212,175,55,0.1); }
.pw-subtask-input::placeholder { color: var(--text-muted); }

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

/* ── Overview Enhanced (Asana-style) ── */
.pw-ov-hero { padding: 20px 28px; border-bottom: 1px solid var(--border-subtle); }
.pw-ov-status-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.pw-ov-status-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 600; padding: 4px 12px; border-radius: 16px; }
.pw-ov-deadline { display: inline-flex; align-items: center; gap: 4px; font-size: 0.78rem; font-weight: 600; }
.pw-ov-description { margin-bottom: 12px; }
.pw-ov-description p { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin: 0; white-space: pre-wrap; outline: none; }
.pw-ov-summary { display: flex; align-items: flex-start; gap: 8px; font-size: 0.78rem; color: var(--text-muted); padding: 8px 12px; background: var(--bg-tertiary); border-radius: 8px; }
.pw-ov-summary .pw-ov-editable-field { flex: 1; }
.pw-ov-editable-field { outline: none; border-radius: 4px; padding: 2px 4px; transition: background 0.15s, box-shadow 0.15s; cursor: text; min-height: 1.2em; }
.pw-ov-editable-field:hover { background: rgba(232, 81, 2, 0.04); }
.pw-ov-editable-field.pw-ov-editable--focused { background: var(--bg-primary); box-shadow: 0 0 0 2px var(--accent-gold); }
.pw-ov-editable-field.pw-ov-editable--empty::before { content: attr(data-placeholder); color: var(--text-muted); font-style: italic; pointer-events: none; }
.pw-ov-description .pw-ov-editable-field { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; white-space: pre-wrap; }
.pw-ov-members { display: flex; flex-direction: column; gap: 8px; }
.pw-ov-member { display: flex; align-items: center; gap: 10px; padding: 6px 8px; border-radius: 8px; transition: background 0.15s; }
.pw-ov-member:hover { background: var(--bg-tertiary); }
.pw-ov-member-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--accent-gold); color: #000; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pw-ov-member-info { flex: 1; min-width: 0; }
.pw-ov-member-name { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); }
.pw-ov-member-stat { font-size: 0.72rem; color: var(--text-muted); }
.pw-ov-last-update { padding: 10px 12px; background: var(--bg-tertiary); border-radius: 8px; border-left: 3px solid var(--accent-gold); }

/* ── Owner Button (Header) ── */
.pw-owner-btn-wrapper { position: relative; }
.pw-owner-btn { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 8px; cursor: pointer; transition: all 0.15s; color: var(--text-primary); font-family: inherit; }
.pw-owner-btn:hover { border-color: var(--accent-gold); background: color-mix(in srgb, var(--accent-gold) 6%, var(--bg-tertiary)); }
.pw-owner-btn-avatar { width: 26px; height: 26px; border-radius: 50%; background: var(--accent-gold); color: #000; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pw-owner-btn-info { display: flex; flex-direction: column; text-align: left; min-width: 0; }
.pw-owner-btn-name { font-size: 0.78rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
.pw-owner-btn-role { font-size: 0.62rem; color: var(--text-muted); }
.pw-owner-btn-chevron { color: var(--text-muted); flex-shrink: 0; transition: transform 0.2s; }
.pw-owner-btn[aria-expanded="true"] .pw-owner-btn-chevron { transform: rotate(180deg); }
.pw-owner-dropdown { position: absolute; top: calc(100% + 4px); right: 0; z-index: 300; min-width: 260px; }

/* ── Interactive Buttons (Detalhes) ── */
.pw-interactive-btn-wrapper { position: relative; }
.pw-interactive-btn { display: flex; align-items: center; gap: 6px; padding: 4px 8px; background: none; border: 1px solid transparent; border-radius: 6px; cursor: pointer; transition: all 0.15s; font-family: inherit; color: var(--text-primary); width: 100%; text-align: left; min-height: 30px; }
.pw-interactive-btn:hover { background: rgba(232, 81, 2, 0.05); border-color: var(--border-subtle); }
.pw-interactive-btn[aria-expanded="true"] { background: var(--bg-primary); border-color: var(--accent-gold); box-shadow: 0 0 0 2px rgba(212,175,55,0.15); }
.pw-interactive-btn-avatar { width: 22px; height: 22px; border-radius: 50%; background: var(--accent-gold); color: #000; font-size: 0.6rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pw-interactive-btn-avatar--empty { background: var(--bg-tertiary); color: var(--text-muted); }
.pw-interactive-btn-text { font-size: 0.82rem; font-weight: 500; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pw-interactive-btn-text--placeholder { color: var(--text-muted); font-style: italic; font-weight: 400; }
.pw-interactive-btn-chevron { color: var(--text-muted); flex-shrink: 0; opacity: 0; transition: opacity 0.15s, transform 0.2s; }
.pw-interactive-btn:hover .pw-interactive-btn-chevron { opacity: 1; }
.pw-interactive-btn[aria-expanded="true"] .pw-interactive-btn-chevron { opacity: 1; transform: rotate(180deg); }
.pw-interactive-btn--tags { flex-wrap: wrap; gap: 4px; }
.pw-tag-chip { display: inline-flex; align-items: center; font-size: 0.72rem; font-weight: 500; padding: 2px 8px; border-radius: 4px; background: var(--accent-gold)15; color: var(--accent-gold); border: 1px solid var(--accent-gold)30; white-space: nowrap; }
.pw-interactive-dropdown { position: absolute; top: calc(100% + 4px); left: 0; z-index: 300; min-width: 240px; max-width: 320px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.25); display: none; overflow: hidden; }
.pw-interactive-dropdown.pw-dropdown--open { display: block; }
.pw-dropdown-search-wrap { padding: 8px; border-bottom: 1px solid var(--border-subtle); }
.pw-dropdown-search { width: 100%; padding: 7px 10px; font-size: 0.82rem; border: 1px solid var(--border-subtle); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); outline: none; font-family: inherit; }
.pw-dropdown-search:focus { border-color: var(--accent-gold); box-shadow: 0 0 0 2px rgba(212,175,55,0.1); }
.pw-dropdown-search::placeholder { color: var(--text-muted); }
.pw-dropdown-list { max-height: 240px; overflow-y: auto; padding: 4px 0; }
.pw-dropdown-item { display: flex; align-items: center; gap: 8px; padding: 7px 12px; cursor: pointer; transition: background 0.1s; }
.pw-dropdown-item:hover { background: var(--bg-tertiary); }
.pw-dropdown-item--selected { background: rgba(212,175,55,0.06); }
.pw-dropdown-item-avatar { width: 26px; height: 26px; border-radius: 50%; background: var(--accent-gold); color: #000; font-size: 0.6rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pw-dropdown-item-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.pw-dropdown-item-name { font-size: 0.82rem; font-weight: 500; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pw-dropdown-item-sub { font-size: 0.68rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pw-dropdown-checkbox { width: 14px; height: 14px; accent-color: var(--accent-gold); flex-shrink: 0; }
.pw-dropdown-empty { padding: 16px 12px; text-align: center; font-size: 0.78rem; color: var(--text-muted); }
.pw-dropdown-footer { padding: 6px 8px; border-top: 1px solid var(--border-subtle); }
.pw-dropdown-add-btn { width: 100%; padding: 6px 10px; font-size: 0.78rem; color: var(--accent-gold); background: none; border: none; cursor: pointer; text-align: left; border-radius: 4px; font-family: inherit; }
.pw-dropdown-add-btn:hover { background: rgba(212,175,55,0.08); }

/* ── Team Grid (Equipe estilo Asana) ── */
.pw-team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.pw-team-add-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: none; border: 2px dashed var(--border-subtle); border-radius: 10px; cursor: pointer; transition: all 0.15s; }
.pw-team-add-btn:hover { border-color: var(--accent-gold); background: rgba(212,175,55,0.04); }
.pw-team-add-icon { width: 32px; height: 32px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-muted); flex-shrink: 0; }
.pw-team-add-btn:hover .pw-team-add-icon { color: var(--accent-gold); }
.pw-team-add-text { font-size: 0.78rem; font-weight: 500; color: var(--text-muted); }
.pw-team-member-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 10px; cursor: pointer; transition: all 0.15s; }
.pw-team-member-card:hover { border-color: var(--accent-gold); background: color-mix(in srgb, var(--accent-gold) 4%, var(--bg-tertiary)); }
.pw-team-member-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--accent-gold); color: #000; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pw-team-member-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.pw-team-member-name { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pw-team-member-role { font-size: 0.68rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pw-team-member-chevron { color: var(--text-muted); flex-shrink: 0; opacity: 0; transition: opacity 0.15s; }
.pw-team-member-card:hover .pw-team-member-chevron { opacity: 1; }
.pw-team-dropdown { position: relative; margin-top: 8px; min-width: 100%; }
.pw-team-dropdown.pw-dropdown--open { display: block; position: relative; top: 0; }

/* ── Cell Clickable (Lista interativa) ── */
.pw-cell-clickable { cursor: pointer; position: relative; border-radius: 4px; transition: background 0.1s; }
.pw-cell-clickable:hover { background: rgba(212,175,55,0.06); }
.pw-cell-chevron { color: var(--text-muted); opacity: 0; transition: opacity 0.15s; margin-left: 2px; flex-shrink: 0; }
.pw-cell-clickable:hover .pw-cell-chevron { opacity: 1; }
.pw-cell-assignee { display: flex; align-items: center; gap: 6px; }
.pw-cell-avatar { width: 20px; height: 20px; border-radius: 50%; background: var(--accent-gold); color: #000; font-size: 0.55rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pw-cell-dropdown { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); overflow: hidden; }

/* ── Calendar View ── */
.pw-calendar { padding: 16px 28px; }
.pw-cal-nav { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.pw-cal-period { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-left: 8px; }
.pw-cal-grid { border: 1px solid var(--border-subtle); border-radius: 10px; overflow: hidden; }
.pw-cal-header { display: grid; grid-template-columns: repeat(7, 1fr); border-bottom: 1px solid var(--border-subtle); }
.pw-cal-day-header { display: flex; flex-direction: column; align-items: center; padding: 10px 4px; gap: 4px; }
.pw-cal-day-name { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
.pw-cal-day-num { font-size: 1rem; font-weight: 700; color: var(--text-primary); width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.pw-cal-today .pw-cal-day-num, .pw-cal-today-num { background: var(--accent-gold); color: #000; }
.pw-cal-weekend { background: color-mix(in srgb, var(--bg-tertiary) 50%, transparent); }
.pw-cal-body { display: grid; grid-template-columns: repeat(7, 1fr); position: relative; min-height: 200px; gap: 2px 0; padding: 8px 4px; align-content: start; }
.pw-cal-column { grid-row: 1 / -1; border-right: 1px solid color-mix(in srgb, var(--border-subtle) 50%, transparent); min-height: 100%; }
.pw-cal-column:last-child { border-right: none; }
.pw-cal-col-today { background: rgba(212,175,55,0.04); }
.pw-cal-col-weekend { background: color-mix(in srgb, var(--bg-tertiary) 30%, transparent); }
.pw-cal-bar { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; cursor: pointer; transition: all 0.15s; overflow: hidden; min-height: 24px; display: flex; align-items: center; z-index: 2; }
.pw-cal-bar:hover { filter: brightness(1.1); box-shadow: 0 2px 8px rgba(0,0,0,0.15); transform: translateY(-1px); }
.pw-cal-bar--done { opacity: 0.6; }
.pw-cal-bar-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; color: var(--text-primary); }

/* ── Messages View ── */
.pw-messages { padding: 20px 28px; max-width: 800px; }
.pw-msg-compose { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px; margin-bottom: 20px; }
.pw-msg-compose-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.pw-msg-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--bg-tertiary); color: var(--text-primary); font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pw-msg-status-selector { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
.pw-msg-status-opt { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 16px; font-size: 0.72rem; font-weight: 500; border: 1px solid var(--border-subtle); background: none; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
.pw-msg-status-opt:hover { border-color: var(--s-color); color: var(--s-color); }
.pw-msg-status-opt--active { background: var(--s-color, #22c55e); color: #fff; border-color: var(--s-color, #22c55e); }
.pw-msg-input { width: 100%; padding: 10px 12px; font-size: 0.85rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); resize: vertical; min-height: 60px; outline: none; font-family: inherit; transition: border-color 0.15s; }
.pw-msg-input:focus { border-color: var(--accent-gold); box-shadow: 0 0 0 2px rgba(212,175,55,0.1); }
.pw-msg-compose-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.pw-msg-list { display: flex; flex-direction: column; gap: 12px; }
.pw-msg-item { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px; transition: border-color 0.15s; }
.pw-msg-item:hover { border-color: color-mix(in srgb, var(--accent-gold) 40%, var(--border-subtle)); }
.pw-msg-item-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.pw-msg-author { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); }
.pw-msg-time { font-size: 0.72rem; color: var(--text-muted); }
.pw-msg-status-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.68rem; font-weight: 600; padding: 3px 10px; border-radius: 12px; margin-left: auto; }
.pw-msg-body { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; white-space: pre-wrap; }
.pw-msg-empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 48px 20px; }

/* ── Files View ── */
.pw-files { padding: 20px 28px; }
.pw-files-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.pw-files-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.pw-file-card { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 10px; overflow: hidden; cursor: pointer; transition: all 0.15s; }
.pw-file-card:hover { border-color: var(--accent-gold); box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
.pw-file-preview { height: 120px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.pw-file-thumb { width: 100%; height: 100%; object-fit: cover; }
.pw-file-icon-wrap { display: flex; align-items: center; justify-content: center; }
.pw-file-info { padding: 10px 12px; }
.pw-file-name { font-size: 0.78rem; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 4px; }
.pw-file-meta { display: flex; gap: 8px; font-size: 0.68rem; color: var(--text-muted); }
.pw-file-source { font-size: 0.68rem; color: var(--text-muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pw-files-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; text-align: center; padding: 40px; }

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
  .pw-calendar, .pw-messages, .pw-files { padding: 16px; }
  .pw-cal-grid { font-size: 0.75rem; }
  .pw-cal-bar-text { font-size: 0.68rem; }
  .pw-files-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
  .pw-file-preview { height: 80px; }
  .pw-ov-hero { padding: 16px; }
  .pw-msg-compose-header { flex-direction: column; }
  .pw-msg-status-selector { width: 100%; }
}

/* Skeleton */
.pw-skel { background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-elevated) 50%, var(--bg-tertiary) 75%); background-size: 200% 100%; animation: pw-shimmer 1.5s ease-in-out infinite; }
@keyframes pw-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>`;
  }
};
