// TBO OS — Module: Project Detail (Asana-style project page)
// Route: #projeto/{id}
const TBO_PROJECT_DETAIL = {

  _project: null,
  _demands: [],
  _params: null,
  _loaded: false,
  _ctxMenu: null,       // task context menu DOM element
  _ctxDemandId: null,   // demand id for active context menu
  _colCtxMenu: null,    // column context menu DOM element
  _colCtxKey: null,     // column key for active column menu
  _secCtxMenu: null,    // section context menu DOM element
  _secCtxKey: null,     // section key for active section menu
  _hideEmptyGroups: false, // persistent toggle for hiding empty groups
  _sectionOverrides: {}, // manual section assignments { demandId: sectionKey }
  _dragEl: null,        // element being dragged (section/column drag)
  _dragType: null,      // 'task', 'section', or 'column'
  _dragColKey: null,    // column key being dragged
  _globalsBound: false, // track global listeners to avoid duplicates
  _dragActive: false,       // true while a drag operation is in progress
  _taskDragState: null,     // pointer-event task drag state object
  _taskDragBound: false,    // flag: task drag delegation bound once
  _chartInstances: [],      // Chart.js instances for Dashboard tab
  _notesSaveTimer: null,    // autosave debounce for Overview rich text
  _kanbanDragState: null,   // Kanban card drag state

  // ═══════════════════════════════════════════════════
  // COLUMN CONFIGURATION
  // ═══════════════════════════════════════════════════

  _COLUMNS: [
    { key: 'drag',        label: '',               width: '20px',  fixed: true,  hidden: false, icon: null },
    { key: 'check',       label: '',               width: '32px',  fixed: true,  hidden: false, icon: null },
    { key: 'name',        label: 'Nome da tarefa',  width: null,    fixed: true,  hidden: false, icon: 'type' },
    { key: 'responsible', label: 'Responsavel',      width: '160px', fixed: false, hidden: false, icon: 'user' },
    { key: 'date',        label: 'Data',             width: '100px', fixed: false, hidden: false, icon: 'calendar' },
    { key: 'priority',    label: 'Prioridade',       width: '100px', fixed: false, hidden: false, icon: 'signal' },
    { key: 'status',      label: 'Status',           width: '120px', fixed: false, hidden: false, icon: 'circle-dot' },
  ],

  _columnOrder: null,  // array of movable column keys
  _STORAGE_KEY: 'tbo_pd_column_order',

  // Section grouping for demands (by status category)
  _SECTIONS: [
    { key: 'planejamento', label: 'Planejamento', icon: 'clipboard-list', statuses: ['A fazer', 'Backlog', 'Planejamento'] },
    { key: 'execucao',     label: 'Execucao',     icon: 'play-circle',    statuses: ['Em andamento', 'Em Andamento', 'In Progress'] },
    { key: 'revisao',      label: 'Revisao',       icon: 'eye',           statuses: ['Em revisao', 'Em Revisao', 'Revisao', 'Review'] },
    { key: 'finalizado',   label: 'Finalizacao',   icon: 'check-circle-2', statuses: ['Concluido', 'Concluido', 'Finalizado', 'Done', 'Cancelado'] },
  ],

  _STATUS: {
    em_andamento: { label: 'Em Andamento', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: 'play-circle' },
    producao:     { label: 'Em Producao',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: 'zap' },
    finalizado:   { label: 'Finalizado',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: 'check-circle-2' },
    parado:       { label: 'Parado',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: 'pause-circle' },
    pausado:      { label: 'Pausado',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: 'clock' },
  },

  _BU_COLORS: {
    'Branding':    { bg: '#fef3c7', color: '#92400e' },
    'Digital 3D':  { bg: '#ede9fe', color: '#5b21b6' },
    'Marketing':   { bg: '#d1fae5', color: '#065f46' },
    'Audiovisual': { bg: '#fce7f3', color: '#9d174d' },
    'Interiores':  { bg: '#e0f2fe', color: '#0c4a6e' },
  },

  _DEMAND_STATUS_COLORS: {
    'A fazer':        { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
    'Backlog':        { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
    'Planejamento':   { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
    'Em andamento':   { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
    'Em Andamento':   { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
    'In Progress':    { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
    'Em revisao':     { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    'Em Revisao':     { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    'Revisao':        { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    'Review':         { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    'Concluido':      { color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
    'Finalizado':     { color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
    'Done':           { color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
    'Cancelado':      { color: '#9ca3af', bg: 'rgba(156,163,175,0.10)' },
  },

  // ═══════════════════════════════════════════════════
  // COLUMN ORDER PERSISTENCE
  // ═══════════════════════════════════════════════════

  _loadColumnOrder() {
    const defaults = this._COLUMNS.filter(c => !c.fixed).map(c => c.key);
    try {
      const saved = localStorage.getItem(this._STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.order) && parsed.order.length > 0) {
          // Validate all keys exist
          const validKeys = new Set(defaults);
          const allValid = parsed.order.every(k => validKeys.has(k));
          if (allValid && parsed.order.length === defaults.length) {
            this._columnOrder = parsed.order;
          }
        }
        if (Array.isArray(parsed.hidden)) {
          parsed.hidden.forEach(key => {
            const col = this._COLUMNS.find(c => c.key === key);
            if (col && !col.fixed) col.hidden = true;
          });
        }
      }
    } catch (_e) {}
    if (!this._columnOrder) {
      this._columnOrder = defaults;
    }
  },

  _saveColumnOrder() {
    const hidden = this._COLUMNS.filter(c => c.hidden).map(c => c.key);
    try {
      localStorage.setItem(this._STORAGE_KEY, JSON.stringify({
        order: this._columnOrder,
        hidden: hidden,
      }));
    } catch (_e) {}
  },

  _getColOrder(key) {
    const idx = this._columnOrder.indexOf(key);
    return idx >= 0 ? idx : 999;
  },

  // ═══════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════

  setParams(params) {
    this._params = params;
  },

  render() {
    this._loaded = false;
    setTimeout(() => this._load(), 0);
    return `
      <div class="pd-module" id="projectDetail">
        ${this._renderSkeleton()}
      </div>
    `;
  },

  _renderSkeleton() {
    return `
      <div class="pd-skeleton">
        <div class="pd-skeleton-header">
          <div class="skeleton" style="width:120px;height:14px;border-radius:4px;"></div>
          <div class="skeleton" style="width:260px;height:28px;border-radius:6px;margin-top:8px;"></div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <div class="skeleton" style="width:80px;height:24px;border-radius:12px;"></div>
            <div class="skeleton" style="width:100px;height:24px;border-radius:12px;"></div>
          </div>
        </div>
        <div class="pd-skeleton-body">
          <div class="skeleton" style="width:100%;height:48px;border-radius:8px;"></div>
          <div class="skeleton" style="width:100%;height:48px;border-radius:8px;"></div>
          <div class="skeleton" style="width:100%;height:48px;border-radius:8px;"></div>
        </div>
      </div>
    `;
  },

  async _load() {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) {
      this._renderError('Supabase nao disponivel');
      return;
    }

    const projectId = this._params?.id;
    if (!projectId) {
      this._renderError('ID do projeto nao informado');
      return;
    }

    // Load column order from localStorage before rendering
    this._loadColumnOrder();

    // Load hide-empty-groups preference
    try {
      const heg = localStorage.getItem('tbo_pd_hide_empty_groups');
      if (heg !== null) this._hideEmptyGroups = JSON.parse(heg);
    } catch (_) {}

    let tid = null;
    try {
      if (typeof RepoBase !== 'undefined' && RepoBase.resolveTenantId) {
        tid = await RepoBase.resolveTenantId();
      } else if (typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.getCurrentTenantId) {
        tid = TBO_SUPABASE.getCurrentTenantId();
      }
    } catch (_e) {}

    try {
      let pq = client.from('projects')
        .select('id,name,status,construtora,bus,owner_name,due_date_start,due_date_end,notion_url,code,notion_page_id,tenant_id,notes,client,client_company')
        .eq('id', projectId)
        .single();
      const projRes = await pq;
      if (projRes.error) throw projRes.error;
      this._project = projRes.data;

      let dq = client.from('demands')
        .select('id,title,status,due_date,due_date_end,responsible,bus,project_id,notion_url,prioridade,info,formalizacao,tipo_midia,subitem,item_principal,feito,milestones,tenant_id')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true, nullsFirst: false });
      if (tid) dq = dq.eq('tenant_id', tid);
      const demRes = await dq;
      this._demands = demRes.error ? [] : (demRes.data || []);

      this._loaded = true;
      this._breadcrumbLabel = this._project.name;
      this._projectName = this._project.name;

      const el = document.getElementById('projectDetail');
      if (!el) return;
      el.innerHTML = this._renderPage();
      this._bindEvents();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
      console.error('[TBO PD] Load error:', err);
      this._renderError(err.message || 'Erro ao carregar projeto');
    }
  },

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════

  // Active view tab key
  _activeTab: 'lista',

  _TABS: [
    { key: 'visao-geral', label: 'Visao geral', icon: 'layout-dashboard' },
    { key: 'lista',       label: 'Lista',        icon: 'list' },
    { key: 'quadro',      label: 'Quadro',       icon: 'columns-3' },
    { key: 'painel',      label: 'Painel',       icon: 'bar-chart-3' },
    { key: 'gantt',       label: 'Gantt',        icon: 'gantt-chart' },
  ],

  _KANBAN_COLUMNS: [
    { status: 'A fazer',       label: 'A fazer',       color: '#6b7280' },
    { status: 'Planejamento',  label: 'Planejamento',  color: '#8b5cf6' },
    { status: 'Em andamento',  label: 'Em andamento',  color: '#3b82f6' },
    { status: 'Em revisao',    label: 'Em revisao',    color: '#f59e0b' },
    { status: 'Concluido',     label: 'Concluido',     color: '#22c55e' },
  ],

  _renderPage() {
    const p = this._project;
    if (!p) return '';
    const info = this._statusInfo(p.status);
    const bus = this._parseBus(p.bus);
    const totalDemands = this._demands.length;
    const doneDemands = this._demands.filter(d => this._isDone(d)).length;
    const progressPct = totalDemands > 0 ? Math.round((doneDemands / totalDemands) * 100) : 0;

    // Build member avatars (unique responsibles)
    const members = [...new Set(this._demands.map(d => d.responsible).filter(Boolean))].slice(0, 5);
    const extraMembers = [...new Set(this._demands.map(d => d.responsible).filter(Boolean))].length - 5;

    return `
      <!-- ═══ ASANA-STYLE STICKY TOP BAR ═══ -->
      <div class="pd-topbar-sticky">

        <!-- LINE 1: Project header -->
        <div class="pd-topbar-line1">
          <div class="pd-topbar-left">
            <button class="pd-back-arrow" onclick="TBO_ROUTER.navigate('quadro-projetos')" title="Voltar ao Quadro">
              <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
            </button>
            <h1 class="pd-project-name">${this._esc(p.name)}</h1>
            <button class="pd-star-btn" title="Favoritar" data-action="star">
              <i data-lucide="star" style="width:16px;height:16px;"></i>
            </button>
            ${p.code ? `<span class="pd-code">${this._esc(p.code)}</span>` : ''}
            <button class="pd-status-dropdown" data-action="status-dropdown" style="background:${info.bg};color:${info.color};">
              <i data-lucide="${info.icon}" style="width:13px;height:13px;"></i>
              <span>${info.label}</span>
              <i data-lucide="chevron-down" style="width:12px;height:12px;opacity:0.6;"></i>
            </button>
          </div>
          <div class="pd-topbar-right">
            <div class="pd-topbar-progress" title="${doneDemands}/${totalDemands} concluidas (${progressPct}%)">
              <div class="pd-progress-bar-track">
                <div class="pd-progress-bar-fill" style="width:${progressPct}%;background:${info.color};"></div>
              </div>
              <span class="pd-progress-label">${progressPct}%</span>
            </div>
            <div class="pd-topbar-members">
              ${members.map(m => `<div class="pd-member-avatar" title="${this._esc(m)}">${this._initials(m)}</div>`).join('')}
              ${extraMembers > 0 ? `<div class="pd-member-avatar pd-member-extra">+${extraMembers}</div>` : ''}
            </div>
            ${p.notion_url ? `<a href="${p.notion_url}" target="_blank" class="pd-topbar-icon-btn" title="Abrir no Notion" onclick="event.stopPropagation()"><i data-lucide="external-link" style="width:15px;height:15px;"></i></a>` : ''}
            <button class="pd-topbar-btn pd-btn-share" title="Compartilhar">
              <i data-lucide="share-2" style="width:14px;height:14px;"></i>
              <span>Compartilhar</span>
            </button>
            <button class="pd-topbar-icon-btn" title="Personalizar" data-action="customize">
              <i data-lucide="sliders-horizontal" style="width:15px;height:15px;"></i>
            </button>
          </div>
        </div>

        <!-- LINE 2: View tabs -->
        <div class="pd-topbar-line2">
          <div class="pd-tabs-scroll">
            ${this._TABS.map(t => `
              <button class="pd-tab ${t.key === this._activeTab ? 'pd-tab-active' : ''}" data-tab="${t.key}">
                <i data-lucide="${t.icon}" style="width:14px;height:14px;"></i>
                <span>${t.label}</span>
              </button>
            `).join('')}
            <button class="pd-tab pd-tab-add" data-action="add-tab" title="Adicionar aba">
              <i data-lucide="plus" style="width:14px;height:14px;"></i>
            </button>
          </div>
        </div>

        <!-- LINE 3: Action bar (only shown on list tab, rendered inside tab content) -->
      </div>

      <!-- ═══ TAB CONTENT ═══ -->
      <div class="pd-tab-content" id="pdTabContent">
        ${this._renderTabContent()}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════
  // TAB CONTENT DISPATCHER
  // ═══════════════════════════════════════════════════

  _renderTabContent() {
    switch (this._activeTab) {
      case 'visao-geral': return this._renderOverviewTab();
      case 'lista':       return this._renderListTab();
      case 'quadro':      return this._renderKanbanTab();
      case 'painel':      return this._renderDashboardTab();
      case 'gantt':       return this._renderGanttTab();
      default:            return this._renderListTab();
    }
  },

  _renderActionBar() {
    return `
      <div class="pd-action-bar">
        <div class="pd-action-left">
          <button class="pd-action-btn pd-action-add-task" data-action="add-task-top">
            <i data-lucide="plus" style="width:14px;height:14px;"></i>
            <span>Adicionar tarefa</span>
          </button>
        </div>
        <div class="pd-action-right">
          <button class="pd-action-btn" data-action="filter">
            <i data-lucide="filter" style="width:14px;height:14px;"></i>
            <span>Filtrar</span>
          </button>
          <button class="pd-action-btn" data-action="sort">
            <i data-lucide="arrow-up-down" style="width:14px;height:14px;"></i>
            <span>Ordenar</span>
          </button>
          <button class="pd-action-btn" data-action="group">
            <i data-lucide="layers" style="width:14px;height:14px;"></i>
            <span>Agrupar</span>
          </button>
          <div class="pd-action-separator"></div>
          <button class="pd-action-btn pd-action-icon-only" data-action="search-toggle" title="Buscar">
            <i data-lucide="search" style="width:14px;height:14px;"></i>
          </button>
          <button class="pd-action-btn pd-action-icon-only" data-action="more-options" title="Mais opcoes">
            <i data-lucide="more-horizontal" style="width:14px;height:14px;"></i>
          </button>
        </div>
      </div>
    `;
  },

  _renderListTab() {
    const p = this._project;
    const info = this._statusInfo(p.status);
    const bus = this._parseBus(p.bus);
    return `
      ${this._renderActionBar()}
      ${this._renderMetaBar(p, info, bus)}
      <div class="pd-tasks">
        ${this._renderTableHeader()}
        ${this._renderSections()}
      </div>
    `;
  },

  _renderMetaBar(p, info, bus) {
    const hasAnyMeta = p.construtora || p.owner_name || p.due_date_start || p.due_date_end || bus.length || p.notes;
    if (!hasAnyMeta) return '';
    return `
      <div class="pd-meta-bar">
        <div class="pd-meta-items">
          ${p.construtora ? `<div class="pd-meta-chip"><i data-lucide="building-2" style="width:13px;height:13px;"></i><span>${this._esc(p.construtora)}</span></div>` : ''}
          ${p.owner_name ? `<div class="pd-meta-chip"><i data-lucide="user" style="width:13px;height:13px;"></i><span>${this._esc(p.owner_name)}</span></div>` : ''}
          ${(p.due_date_start || p.due_date_end) ? `<div class="pd-meta-chip"><i data-lucide="calendar" style="width:13px;height:13px;"></i><span>${p.due_date_start ? this._fmtDate(p.due_date_start) : '?'} &rarr; ${p.due_date_end ? this._fmtDate(p.due_date_end) : '?'}</span></div>` : ''}
          ${bus.length > 0 ? bus.map(b => { const bc = this._BU_COLORS[b] || { bg: '#f3f4f6', color: '#374151' }; return `<span class="pd-bu-tag" style="background:${bc.bg};color:${bc.color};">${b}</span>`; }).join('') : ''}
        </div>
        ${p.notes ? `<div class="pd-meta-notes"><i data-lucide="file-text" style="width:13px;height:13px;flex-shrink:0;"></i><span>${this._esc(p.notes).substring(0, 150)}${p.notes.length > 150 ? '...' : ''}</span></div>` : ''}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════
  // TABLE HEADER (Notion-style)
  // ═══════════════════════════════════════════════════

  _renderTableHeader() {
    let html = '<div class="pd-table-header">';

    // Fixed columns: check (no label) then drag (no label)
    html += '<div class="pd-th pd-th-check" data-col="check"></div>';
    html += '<div class="pd-th pd-th-drag" data-col="drag"></div>';

    // Fixed column: name (with label + chevron, NO drag handle)
    html += `
      <div class="pd-th pd-th-name" data-col="name" style="order:-1;">
        <div class="pd-th-inner">
          <span class="pd-th-label">Nome da tarefa</span>
          <button class="pd-th-chevron" data-col-menu="name" title="Opcoes da coluna"><i data-lucide="chevron-down"></i></button>
        </div>
      </div>`;

    // Movable columns
    const movable = this._COLUMNS.filter(c => !c.fixed);
    for (const col of movable) {
      const orderIdx = this._getColOrder(col.key);
      const hiddenStyle = col.hidden ? 'display:none;' : '';
      html += `
        <div class="pd-th pd-th-${col.key}" data-col="${col.key}" data-draggable-col="true" style="order:${orderIdx};${hiddenStyle}">
          <div class="pd-th-inner">
            <div class="pd-col-drag-handle" title="Arrastar coluna"><i data-lucide="grip-vertical"></i></div>
            <span class="pd-th-label">${this._esc(col.label)}</span>
            <button class="pd-th-chevron" data-col-menu="${col.key}" title="Opcoes da coluna"><i data-lucide="chevron-down"></i></button>
          </div>
        </div>`;
    }

    // "+" button to add/restore columns
    html += `
      <div class="pd-th pd-th-add" style="order:999;">
        <button class="pd-add-col-btn" title="Adicionar propriedade">
          <i data-lucide="plus"></i>
        </button>
      </div>`;

    html += '</div>';
    return html;
  },

  // ═══════════════════════════════════════════════════
  // SECTIONS & TASK ROWS
  // ═══════════════════════════════════════════════════

  _renderSections() {
    const demands = this._demands;
    const assigned = new Set();
    let html = '';

    // First pass: assign demands with _sectionOverrides to their overridden section
    const overriddenToSection = {}; // sectionKey -> [demand, ...]
    for (const d of demands) {
      const overrideKey = this._sectionOverrides[d.id];
      if (overrideKey) {
        if (!overriddenToSection[overrideKey]) overriddenToSection[overrideKey] = [];
        overriddenToSection[overrideKey].push(d);
        assigned.add(d.id);
      }
    }

    for (const section of this._SECTIONS) {
      const sectionDemands = demands.filter(d => {
        if (assigned.has(d.id)) return false;
        const match = section.statuses.some(s => (d.status || '').toLowerCase() === s.toLowerCase());
        if (match) assigned.add(d.id);
        return match;
      });
      // Merge with overridden demands for this section
      const overrides = overriddenToSection[section.key] || [];
      const allDemands = [...overrides, ...sectionDemands];
      html += this._renderSection(section, allDemands);
    }

    // "Outros" always renders as a valid drop target
    const remaining = demands.filter(d => !assigned.has(d.id));
    const outrosOverrides = overriddenToSection['outros'] || [];
    const outrosDemands = [...outrosOverrides, ...remaining];
    html += this._renderSection({ key: 'outros', label: 'Outros', icon: 'circle', statuses: [] }, outrosDemands);

    if (demands.length === 0) {
      html += `<div class="pd-empty-tasks"><i data-lucide="clipboard" style="width:24px;height:24px;opacity:0.3;"></i><p>Nenhuma tarefa registrada para este projeto.</p></div>`;
    }

    return html;
  },

  _renderSection(section, demands) {
    if (this._hideEmptyGroups && demands.length === 0) return '';
    return `
      <div class="pd-section" data-section="${section.key}">
        <div class="pd-section-header">
          <div class="pd-drag-handle pd-section-drag" title="Arrastar secao"><i data-lucide="grip-vertical"></i></div>
          <button class="pd-section-toggle" data-toggle="${section.key}">
            <i data-lucide="chevron-down" class="pd-section-chevron" style="width:14px;height:14px;"></i>
          </button>
          <span class="pd-section-label" data-section-label="${section.key}" title="Clique duplo para renomear">${section.label}</span>
          <span class="pd-section-count">${demands.length}</span>
          <div class="pd-section-actions">
            <button class="pd-section-add-task-btn" data-section-add="${section.key}" title="Adicionar tarefa">
              <i data-lucide="plus" style="width:14px;height:14px;"></i>
            </button>
            <button class="pd-section-menu-btn" data-section-menu="${section.key}" title="Opcoes da secao">
              <i data-lucide="more-horizontal" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </div>
        <div class="pd-section-body">
          ${demands.map(d => this._renderTaskRow(d)).join('')}
        </div>
      </div>
    `;
  },

  _renderTaskRow(d) {
    const statusColors = this._DEMAND_STATUS_COLORS[d.status] || { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' };
    const isDone = this._isDone(d);
    const priorityHtml = this._renderPriority(d.prioridade);

    // Build movable cells with CSS order
    const cells = {
      responsible: `<div class="pd-td pd-td-responsible" data-col="responsible" style="order:${this._getColOrder('responsible')};${this._isColHidden('responsible') ? 'display:none;' : ''}">
        ${d.responsible ? `<div class="pd-avatar-small" title="${this._esc(d.responsible)}">${this._initials(d.responsible)}</div><span class="pd-responsible-name">${this._esc(d.responsible)}</span>` : '<span class="pd-empty-cell">&mdash;</span>'}
      </div>`,
      date: `<div class="pd-td pd-td-date" data-col="date" style="order:${this._getColOrder('date')};${this._isColHidden('date') ? 'display:none;' : ''}">
        ${d.due_date ? `<span class="pd-date-text ${this._isLate(d) ? 'pd-date-late' : ''}">${this._fmtDate(d.due_date)}</span>` : '<span class="pd-empty-cell">&mdash;</span>'}
      </div>`,
      priority: `<div class="pd-td pd-td-priority" data-col="priority" style="order:${this._getColOrder('priority')};${this._isColHidden('priority') ? 'display:none;' : ''}">${priorityHtml}</div>`,
      status: `<div class="pd-td pd-td-status" data-col="status" style="order:${this._getColOrder('status')};${this._isColHidden('status') ? 'display:none;' : ''}">
        <span class="pd-demand-status" style="background:${statusColors.bg};color:${statusColors.color};">${this._esc(d.status || '\u2014')}</span>
      </div>`,
    };

    const movableHtml = this._columnOrder.map(key => cells[key] || '').join('');

    return `
      <div class="pd-task-row ${isDone ? 'pd-task-done' : ''}" data-demand-id="${d.id}">
        <div class="pd-td pd-td-check" data-col="check">
          <span class="pd-check ${isDone ? 'pd-checked' : ''}" data-demand-check="${d.id}" style="border-color:${statusColors.color};${isDone ? `background:${statusColors.color};` : ''}">
            ${isDone ? '<i data-lucide="check" style="width:10px;height:10px;color:#fff;"></i>' : ''}
          </span>
        </div>
        <div class="pd-td pd-td-drag" data-col="drag">
          <div class="pd-drag-handle pd-task-drag" title="Arrastar tarefa"><i data-lucide="grip-vertical"></i></div>
        </div>
        <div class="pd-td pd-td-name" data-col="name" style="order:-1;">
          <span class="pd-task-title ${isDone ? 'pd-task-strikethrough' : ''}">${this._esc(d.title)}</span>
          ${d.notion_url ? `<a href="${d.notion_url}" target="_blank" class="pd-task-notion" onclick="event.stopPropagation()" title="Abrir no Notion"><i data-lucide="external-link" style="width:11px;height:11px;"></i></a>` : ''}
        </div>
        ${movableHtml}
      </div>
    `;
  },

  _isColHidden(key) {
    const col = this._COLUMNS.find(c => c.key === key);
    return col ? col.hidden : false;
  },

  _renderPriority(prioridade) {
    if (!prioridade) return '<span class="pd-empty-cell">&mdash;</span>';
    const p = prioridade.toLowerCase();
    let color = '#6b7280', bg = 'rgba(107,114,128,0.10)';
    if (p.includes('alta') || p.includes('high') || p.includes('urgente')) { color = '#ef4444'; bg = 'rgba(239,68,68,0.10)'; }
    else if (p.includes('media') || p.includes('medium')) { color = '#f59e0b'; bg = 'rgba(245,158,11,0.10)'; }
    else if (p.includes('baixa') || p.includes('low')) { color = '#22c55e'; bg = 'rgba(34,197,94,0.10)'; }
    return `<span class="pd-priority-pill" style="background:${bg};color:${color};">${this._esc(prioridade)}</span>`;
  },

  // ═══════════════════════════════════════════════════
  // APPLY COLUMN ORDER (cheap CSS-only update)
  // ═══════════════════════════════════════════════════

  _applyColumnOrder() {
    this._columnOrder.forEach((key, idx) => {
      document.querySelectorAll(`[data-col="${key}"]`).forEach(el => {
        el.style.order = idx;
      });
    });
    // Handle hidden columns
    this._COLUMNS.forEach(col => {
      if (col.fixed) return;
      document.querySelectorAll(`[data-col="${col.key}"]`).forEach(el => {
        el.style.display = col.hidden ? 'none' : '';
      });
    });
  },

  // ═══════════════════════════════════════════════════
  // EVENT BINDING
  // ═══════════════════════════════════════════════════

  _bindEvents() {
    this._bindGlobalListeners();
    this._bindTopBarEvents();
    this._bindTabContent();
  },

  _bindTabContent() {
    switch (this._activeTab) {
      case 'visao-geral': this._bindOverviewEvents(); break;
      case 'lista':       this._bindListEvents(); break;
      case 'quadro':      this._bindKanbanEvents(); break;
      case 'painel':      this._bindDashboardEvents(); break;
      case 'gantt':       this._bindGanttEvents(); break;
      default:            this._bindListEvents(); break;
    }
  },

  _switchTab() {
    this._destroyTabState();
    const container = document.getElementById('pdTabContent');
    if (!container) return;
    container.innerHTML = this._renderTabContent();
    this._bindTabContent();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  _destroyTabState() {
    if (this._chartInstances) {
      this._chartInstances.forEach(c => { try { c.destroy(); } catch(_){} });
      this._chartInstances = [];
    }
    if (this._notesSaveTimer) {
      clearTimeout(this._notesSaveTimer);
      this._notesSaveTimer = null;
    }
    this._kanbanDragState = null;
    if (this._taskDragState && this._taskDragState.started) {
      this._taskDragCleanup(this._taskDragState);
      this._taskDragState = null;
    }
    this._taskDragBound = false;
  },

  /** Global listeners (only bound ONCE, never duplicated) */
  _bindGlobalListeners() {
    if (this._globalsBound) return;
    this._globalsBound = true;
    const self = this;

    // Close context menus on mousedown anywhere outside
    document.addEventListener('mousedown', (e) => {
      if (self._ctxMenu && !self._ctxMenu.contains(e.target)) {
        self._closeContextMenu();
      }
      if (self._colCtxMenu && !self._colCtxMenu.contains(e.target)) {
        self._closeColContextMenu();
      }
      if (self._secCtxMenu && !self._secCtxMenu.contains(e.target)) {
        self._closeSectionContextMenu();
      }
    });

    // Close context menus on Escape + cancel task drag
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (self._taskDragState && self._taskDragState.started) {
          self._taskDragCleanup(self._taskDragState);
          self._taskDragState = null;
        }
        self._closeContextMenu();
        self._closeColContextMenu();
        self._closeSectionContextMenu();
      }
    });

    // Close context menus on scroll
    document.addEventListener('scroll', () => {
      self._closeContextMenu();
      self._closeColContextMenu();
      self._closeSectionContextMenu();
    }, true);
  },

  /** Local per-render listeners on task/section elements */
  /** Top bar events: tabs, star — always bound regardless of active tab */
  _bindTopBarEvents() {
    const self = this;

    // ── Top bar: Tab clicks (with content switching) ──
    document.querySelectorAll('.pd-tab[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.tab;
        if (key === self._activeTab) return;
        self._activeTab = key;
        document.querySelectorAll('.pd-tab[data-tab]').forEach(t => t.classList.remove('pd-tab-active'));
        tab.classList.add('pd-tab-active');
        self._switchTab();
      });
    });

    // ── Top bar: Star button toggle ──
    const starBtn = document.querySelector('.pd-star-btn');
    if (starBtn) {
      starBtn.addEventListener('click', () => {
        starBtn.classList.toggle('pd-starred');
        const icon = starBtn.querySelector('i');
        if (icon) {
          if (starBtn.classList.contains('pd-starred')) {
            icon.style.fill = '#f59e0b';
          } else {
            icon.style.fill = 'none';
          }
        }
      });
    }
  },

  /** List tab events: sections, tasks, checkboxes, columns, drag */
  _bindListEvents() {
    const self = this;

    // ── Action bar: Add task ──
    const addTaskTop = document.querySelector('[data-action="add-task-top"]');
    if (addTaskTop) {
      addTaskTop.addEventListener('click', (e) => {
        e.stopPropagation();
        const firstSection = self._SECTIONS[0];
        if (firstSection) self._showInlineTaskInput(firstSection.key);
      });
    }

    // Section chevron toggles (expand / collapse)
    document.querySelectorAll('.pd-section-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const section = btn.closest('.pd-section');
        if (!section) return;
        section.classList.toggle('pd-section-collapsed');
        const chevron = btn.querySelector('.pd-section-chevron');
        if (chevron) chevron.style.transform = section.classList.contains('pd-section-collapsed') ? 'rotate(-90deg)' : '';
      });
    });

    // Section label double-click → inline rename
    document.querySelectorAll('.pd-section-label[data-section-label]').forEach(label => {
      label.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const sectionKey = label.dataset.sectionLabel;
        if (sectionKey) self._renameSectionInline(sectionKey);
      });
    });

    // Section "+" add-task buttons
    document.querySelectorAll('.pd-section-add-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const sectionKey = btn.dataset.sectionAdd;
        if (sectionKey) self._showInlineTaskInput(sectionKey);
      });
    });

    // Section "..." menu buttons
    document.querySelectorAll('.pd-section-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const sectionKey = btn.dataset.sectionMenu;
        if (sectionKey) self._showSectionContextMenu(sectionKey, btn);
      });
    });

    // Checkbox click → toggle task completion
    document.querySelectorAll('.pd-check[data-demand-check]').forEach(check => {
      check.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const demandId = check.dataset.demandCheck;
        const demand = self._demands.find(d => d.id === demandId);
        if (!demand) return;
        const isDone = self._isDone(demand);
        const newStatus = isDone ? 'A fazer' : 'Concluido';
        const newFeito = !isDone;
        try {
          const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
          if (client && !String(demandId).startsWith('temp_')) {
            await client.from('demands').update({ status: newStatus, feito: newFeito }).eq('id', demandId);
          }
          demand.status = newStatus;
          demand.feito = newFeito;
          self._reRenderTasks();
        } catch (err) { console.error('[PD] checkbox toggle error:', err); }
      });
    });

    // Task row click → open demand drawer
    document.querySelectorAll('.pd-task-row[data-demand-id]').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('.pd-check') || e.target.closest('.pd-drag-handle') || e.target.closest('.pd-inline-task-input')) return;
        const demandId = row.dataset.demandId;
        const demand = self._demands.find(d => d.id === demandId);
        if (demand && typeof TBO_DEMAND_DRAWER !== 'undefined') {
          TBO_DEMAND_DRAWER.open(demand, self._project);
        }
      });
    });

    // Context menu (right-click on task rows)
    document.querySelectorAll('.pd-task-row[data-demand-id]').forEach(row => {
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const demandId = row.dataset.demandId;
        self._showContextMenu(e.clientX, e.clientY, demandId);
      });
    });

    // Column header chevron click → column context menu
    document.querySelectorAll('.pd-th-chevron').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const colKey = btn.dataset.colMenu;
        if (colKey) self._showColContextMenu(colKey, btn);
      });
    });

    // "+" add column button
    const addColBtn = document.querySelector('.pd-add-col-btn');
    if (addColBtn) {
      addColBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        self._showAddColumnMenu(addColBtn);
      });
    }

    // Drag & Drop (tasks + sections)
    this._bindDragHandles();

    // Column drag & drop
    this._bindColumnDrag();
  },

  // ═══════════════════════════════════════════════════
  // TASK CONTEXT MENU
  // ═══════════════════════════════════════════════════

  _showContextMenu(x, y, demandId) {
    this._closeContextMenu();
    this._ctxDemandId = demandId;
    const self = this;

    const demand = this._demands.find(d => d.id === demandId);
    const isDone = demand ? this._isDone(demand) : false;

    const menu = document.createElement('div');
    menu.className = 'pd-context-menu';
    menu.innerHTML = `
      <div class="pd-ctx-item" data-action="duplicate">
        <i data-lucide="copy"></i> Duplicar
      </div>
      <div class="pd-ctx-item" data-action="follow-up">
        <i data-lucide="corner-up-right"></i> Criar tarefa de acompanhamento
      </div>
      <div class="pd-ctx-item" data-action="mark-done">
        <i data-lucide="check-circle-2"></i> ${isDone ? 'Desmarcar conclusao' : 'Marcar como concluida'}
      </div>
      <div class="pd-ctx-separator"></div>
      <div class="pd-ctx-item" data-action="add-subtask">
        <i data-lucide="list-plus"></i> Adicionar subtarefa
      </div>
      <div class="pd-ctx-item" data-action="convert">
        <i data-lucide="arrow-right-circle"></i> Converter em &gt;
      </div>
      <div class="pd-ctx-separator"></div>
      <div class="pd-ctx-item" data-action="open-details">
        <i data-lucide="panel-right-open"></i> Abrir detalhes
      </div>
      <div class="pd-ctx-item" data-action="open-new-tab">
        <i data-lucide="external-link"></i> Abrir em nova aba
      </div>
      <div class="pd-ctx-item" data-action="copy-link">
        <i data-lucide="link"></i> Copiar link
      </div>
      <div class="pd-ctx-separator"></div>
      <div class="pd-ctx-item pd-ctx-item--danger" data-action="delete">
        <i data-lucide="trash-2"></i> Excluir
      </div>
    `;

    document.body.appendChild(menu);
    if (typeof lucide !== 'undefined') lucide.createIcons({ root: menu });

    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    menu.style.left = (x + mw > vw ? Math.max(0, x - mw) : x) + 'px';
    menu.style.top  = (y + mh > vh ? Math.max(0, y - mh) : y) + 'px';

    this._ctxMenu = menu;

    menu.querySelectorAll('.pd-ctx-item').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        self._closeContextMenu();
        self._handleContextAction(action, demandId);
      });
    });

    menu.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
  },

  _closeContextMenu() {
    if (this._ctxMenu) {
      this._ctxMenu.remove();
      this._ctxMenu = null;
    }
    this._ctxDemandId = null;
  },

  async _handleContextAction(action, demandId) {
    const demand = this._demands.find(d => d.id === demandId);
    if (!demand) return;
    const self = this;

    switch (action) {
      case 'open-details': {
        if (typeof TBO_DEMAND_DRAWER !== 'undefined') {
          TBO_DEMAND_DRAWER.open(demand, this._project);
        }
        break;
      }

      case 'open-new-tab': {
        if (demand.notion_url) {
          window.open(demand.notion_url, '_blank');
        } else {
          const url = window.location.origin + window.location.pathname + '#/projeto/' + (this._project?.id || '');
          window.open(url, '_blank');
        }
        break;
      }

      case 'copy-link': {
        const link = demand.notion_url || (window.location.origin + window.location.pathname + '#/projeto/' + (this._project?.id || ''));
        try {
          await navigator.clipboard.writeText(link);
        } catch (_e) {
          const ta = document.createElement('textarea');
          ta.value = link;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        break;
      }

      case 'mark-done': {
        const isDone = this._isDone(demand);
        const newStatus = isDone ? 'A fazer' : 'Concluido';
        const newFeito = !isDone;
        try {
          const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
          if (client) {
            await client.from('demands').update({ status: newStatus, feito: newFeito }).eq('id', demandId);
          }
          demand.status = newStatus;
          demand.feito = newFeito;
          self._reRenderTasks();
        } catch (e) { console.error('[PD] mark-done error:', e); }
        break;
      }

      case 'duplicate': {
        try {
          const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
          if (client) {
            const dup = { ...demand };
            delete dup.id;
            dup.title = (demand.title || '') + ' (copia)';
            dup.feito = false;
            const { data, error } = await client.from('demands').insert(dup).select().single();
            if (!error && data) {
              self._demands.push(data);
              self._reRenderTasks();
            }
          }
        } catch (e) { console.error('[PD] duplicate error:', e); }
        break;
      }

      case 'follow-up': {
        try {
          const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
          if (client) {
            const followUp = {
              project_id: demand.project_id,
              tenant_id: demand.tenant_id,
              title: 'Acompanhamento: ' + (demand.title || ''),
              status: 'A fazer',
              responsible: demand.responsible,
              bus: demand.bus,
              prioridade: demand.prioridade,
              feito: false,
            };
            const { data, error } = await client.from('demands').insert(followUp).select().single();
            if (!error && data) {
              self._demands.push(data);
              self._reRenderTasks();
            }
          }
        } catch (e) { console.error('[PD] follow-up error:', e); }
        break;
      }

      case 'add-subtask': {
        if (typeof TBO_DEMAND_DRAWER !== 'undefined') {
          TBO_DEMAND_DRAWER.open(demand, this._project);
        }
        break;
      }

      case 'convert': {
        console.log('[PD] Convert demand to project:', demandId);
        break;
      }

      case 'delete': {
        if (!confirm('Excluir esta tarefa permanentemente?')) return;
        try {
          const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
          if (client) {
            await client.from('demands').delete().eq('id', demandId);
            self._demands = self._demands.filter(d => d.id !== demandId);
            self._reRenderTasks();
          }
        } catch (e) { console.error('[PD] delete error:', e); }
        break;
      }
    }
  },

  // ═══════════════════════════════════════════════════
  // SECTION CONTEXT MENU ("..." button)
  // ═══════════════════════════════════════════════════

  _showSectionContextMenu(sectionKey, anchorEl) {
    this._closeSectionContextMenu();
    this._closeContextMenu();
    this._closeColContextMenu();
    this._secCtxKey = sectionKey;
    const self = this;
    const section = this._SECTIONS.find(s => s.key === sectionKey);
    if (!section && sectionKey !== 'outros') return;

    const sectionEl = document.querySelector(`.pd-section[data-section="${sectionKey}"]`);
    const isCollapsed = sectionEl ? sectionEl.classList.contains('pd-section-collapsed') : false;

    // Check if any section has subtasks (for enabling/disabling subtask toggle)
    const hasSubtasks = false; // demands don't have subtask hierarchy yet

    const menu = document.createElement('div');
    menu.className = 'pd-sec-context-menu';
    menu.innerHTML = `
      <div class="pd-sec-ctx-item" data-action="add-rule">
        <i data-lucide="sparkles"></i> <span>Adicionar regra a secao</span>
      </div>
      <div class="pd-sec-ctx-separator"></div>
      <div class="pd-sec-ctx-item" data-action="rename">
        <i data-lucide="pencil"></i> <span>Renomear secao</span>
      </div>
      <div class="pd-sec-ctx-item pd-sec-ctx-has-sub" data-action="add-section">
        <i data-lucide="plus"></i> <span>Adicionar secao</span>
        <i data-lucide="chevron-right" class="pd-sec-ctx-arrow"></i>
      </div>
      <div class="pd-sec-ctx-item" data-action="duplicate">
        <i data-lucide="copy"></i> <span>Duplicar secao</span>
      </div>
      <div class="pd-sec-ctx-separator"></div>
      <div class="pd-sec-ctx-item ${hasSubtasks ? '' : 'pd-sec-ctx-item--disabled'}" data-action="toggle-subtasks">
        <i data-lucide="list-tree"></i> <span>${isCollapsed ? 'Expandir' : 'Recolher'} subtarefas</span>
      </div>
      <div class="pd-sec-ctx-item" data-action="toggle-all-groups">
        <i data-lucide="rows-3"></i> <span>Expandir ou recolher grupos</span>
      </div>
      <div class="pd-sec-ctx-item" data-action="hide-empty">
        <i data-lucide="${this._hideEmptyGroups ? 'eye' : 'eye-off'}"></i>
        <span>Ocultar grupos vazios</span>
        ${this._hideEmptyGroups ? '<span class="pd-sec-ctx-check"><i data-lucide="check" style="width:13px;height:13px;"></i></span>' : ''}
      </div>
      <div class="pd-sec-ctx-separator"></div>
      <div class="pd-sec-ctx-item pd-sec-ctx-item--danger" data-action="delete">
        <i data-lucide="trash-2"></i> <span>Excluir secao</span>
      </div>
    `;

    // Build the "add section" submenu
    const subMenu = document.createElement('div');
    subMenu.className = 'pd-sec-submenu';
    subMenu.innerHTML = `
      <div class="pd-sec-ctx-item" data-action="add-section-above">
        <i data-lucide="arrow-up"></i> <span>Acima</span>
      </div>
      <div class="pd-sec-ctx-item" data-action="add-section-below">
        <i data-lucide="arrow-down"></i> <span>Abaixo</span>
      </div>
    `;
    subMenu.style.display = 'none';
    menu.appendChild(subMenu);

    document.body.appendChild(menu);
    if (typeof lucide !== 'undefined') lucide.createIcons({ root: menu });

    // Position relative to anchor
    const rect = anchorEl.getBoundingClientRect();
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = rect.right - mw;
    if (left < 8) left = rect.left;
    if (left + mw > vw) left = Math.max(8, vw - mw - 8);
    let top = rect.bottom + 4;
    if (top + mh > vh) top = Math.max(8, rect.top - mh - 4);
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';

    this._secCtxMenu = menu;

    // Submenu hover for "Adicionar secao"
    const addSectionItem = menu.querySelector('[data-action="add-section"]');
    if (addSectionItem) {
      addSectionItem.addEventListener('mouseenter', () => {
        const itemRect = addSectionItem.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        // Position submenu to the right or left
        let subLeft = menuRect.right + 2;
        if (subLeft + 180 > vw) subLeft = menuRect.left - 182;
        subMenu.style.left = (subLeft - menuRect.left) + 'px';
        subMenu.style.top = (itemRect.top - menuRect.top) + 'px';
        subMenu.style.display = 'block';
      });
      addSectionItem.addEventListener('mouseleave', (e) => {
        // Don't hide if hovering submenu
        setTimeout(() => {
          if (!subMenu.matches(':hover') && !addSectionItem.matches(':hover')) {
            subMenu.style.display = 'none';
          }
        }, 80);
      });
      subMenu.addEventListener('mouseleave', () => {
        setTimeout(() => {
          if (!subMenu.matches(':hover') && !addSectionItem.matches(':hover')) {
            subMenu.style.display = 'none';
          }
        }, 80);
      });
    }

    // Bind actions
    menu.querySelectorAll('.pd-sec-ctx-item:not(.pd-sec-ctx-item--disabled)').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        if (action && action !== 'add-section') {
          self._closeSectionContextMenu();
          self._handleSectionAction(action, sectionKey);
        }
      });
    });

    menu.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
  },

  _closeSectionContextMenu() {
    if (this._secCtxMenu) {
      this._secCtxMenu.remove();
      this._secCtxMenu = null;
    }
    this._secCtxKey = null;
  },

  _handleSectionAction(action, sectionKey) {
    const self = this;
    const section = this._SECTIONS.find(s => s.key === sectionKey) ||
      (sectionKey === 'outros' ? { key: 'outros', label: 'Outros', icon: 'circle', statuses: [] } : null);
    if (!section) return;

    switch (action) {
      case 'add-rule': {
        // Placeholder — rules engine not yet implemented
        console.log('[PD] Add rule to section:', sectionKey);
        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.show('Funcionalidade de regras em breve.', 'info');
        }
        break;
      }

      case 'rename': {
        this._renameSectionInline(sectionKey);
        break;
      }

      case 'add-section-above': {
        this._addSection(sectionKey, 'above');
        break;
      }

      case 'add-section-below': {
        this._addSection(sectionKey, 'below');
        break;
      }

      case 'duplicate': {
        this._duplicateSection(sectionKey);
        break;
      }

      case 'toggle-subtasks': {
        // Subtask hierarchy not yet present — toggle section collapse as fallback
        const sectionEl = document.querySelector(`.pd-section[data-section="${sectionKey}"]`);
        if (sectionEl) {
          sectionEl.classList.toggle('pd-section-collapsed');
          const chevron = sectionEl.querySelector('.pd-section-chevron');
          if (chevron) chevron.style.transform = sectionEl.classList.contains('pd-section-collapsed') ? 'rotate(-90deg)' : '';
        }
        break;
      }

      case 'toggle-all-groups': {
        const sections = document.querySelectorAll('.pd-section');
        const allCollapsed = Array.from(sections).every(s => s.classList.contains('pd-section-collapsed'));
        sections.forEach(s => {
          if (allCollapsed) {
            s.classList.remove('pd-section-collapsed');
          } else {
            s.classList.add('pd-section-collapsed');
          }
          const chevron = s.querySelector('.pd-section-chevron');
          if (chevron) chevron.style.transform = allCollapsed ? '' : 'rotate(-90deg)';
        });
        break;
      }

      case 'hide-empty': {
        this._hideEmptyGroups = !this._hideEmptyGroups;
        try { localStorage.setItem('tbo_pd_hide_empty_groups', JSON.stringify(this._hideEmptyGroups)); } catch (_) {}
        this._reRenderTasks();
        break;
      }

      case 'delete': {
        this._deleteSectionWithDialog(sectionKey);
        break;
      }
    }
  },

  // ── Section: Inline task creation (+ button) ─────────
  _showInlineTaskInput(sectionKey) {
    const sectionEl = document.querySelector(`.pd-section[data-section="${sectionKey}"]`);
    if (!sectionEl) return;

    // Auto-expand if collapsed
    if (sectionEl.classList.contains('pd-section-collapsed')) {
      sectionEl.classList.remove('pd-section-collapsed');
      const chevron = sectionEl.querySelector('.pd-section-chevron');
      if (chevron) chevron.style.transform = '';
    }

    const body = sectionEl.querySelector('.pd-section-body');
    if (!body) return;

    // Don't duplicate — if there's already an inline input, focus it
    const existing = body.querySelector('.pd-inline-task-row');
    if (existing) {
      const inp = existing.querySelector('.pd-inline-task-input');
      if (inp) inp.focus();
      return;
    }

    const self = this;
    const section = this._SECTIONS.find(s => s.key === sectionKey);

    // Build the inline row
    const row = document.createElement('div');
    row.className = 'pd-inline-task-row';
    row.innerHTML = `
      <div class="pd-inline-task-icon">
        <i data-lucide="plus-circle" style="width:16px;height:16px;"></i>
      </div>
      <input type="text" class="pd-inline-task-input" placeholder="Adicionar tarefa..." autocomplete="off" />
    `;

    // Insert at TOP of section body
    body.insertBefore(row, body.firstChild);
    if (typeof lucide !== 'undefined') lucide.createIcons({ root: row });

    const input = row.querySelector('.pd-inline-task-input');
    input.focus();

    let isCommitting = false;

    const commit = async () => {
      if (isCommitting) return;
      const title = input.value.trim();
      if (!title) {
        cleanup();
        return;
      }
      isCommitting = true;
      input.disabled = true;
      input.style.opacity = '0.5';

      // Determine status for the new task
      const defaultStatus = (section && section.statuses.length > 0) ? section.statuses[0] : 'A fazer';
      const needsSectionOverride = !section || section.statuses.length === 0;

      const newDemand = {
        project_id: self._project?.id || null,
        tenant_id: self._project?.tenant_id || null,
        title: title,
        status: defaultStatus,
        feito: false,
      };

      try {
        const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
        if (client) {
          const { data, error } = await client.from('demands').insert(newDemand).select().single();
          if (!error && data) {
            self._demands.unshift(data);
            // For sections with no status mapping, store override to keep task in this section
            if (needsSectionOverride) {
              self._sectionOverrides[data.id] = sectionKey;
            }
          } else {
            // Fallback: add locally with temp ID
            newDemand.id = 'temp_' + Date.now();
            self._demands.unshift(newDemand);
            if (needsSectionOverride) {
              self._sectionOverrides[newDemand.id] = sectionKey;
            }
          }
        } else {
          newDemand.id = 'temp_' + Date.now();
          self._demands.unshift(newDemand);
          if (needsSectionOverride) {
            self._sectionOverrides[newDemand.id] = sectionKey;
          }
        }
      } catch (e) {
        console.error('[PD] inline add-task error:', e);
        newDemand.id = 'temp_' + Date.now();
        self._demands.unshift(newDemand);
        if (needsSectionOverride) {
          self._sectionOverrides[newDemand.id] = sectionKey;
        }
      }

      self._reRenderTasks();
      // Re-open the input so user can add more tasks quickly
      setTimeout(() => self._showInlineTaskInput(sectionKey), 60);
    };

    const cleanup = () => {
      input.removeEventListener('blur', onBlur);
      input.removeEventListener('keydown', onKey);
      row.remove();
    };

    const onKey = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commit();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        cleanup();
      }
    };

    const onBlur = () => {
      // Small delay to allow commit via Enter to fire first
      setTimeout(() => {
        if (!isCommitting) cleanup();
      }, 120);
    };

    input.addEventListener('keydown', onKey);
    input.addEventListener('blur', onBlur);
  },

  // ── Section: Rename inline ──────────────────────────
  _renameSectionInline(sectionKey) {
    const sectionEl = document.querySelector(`.pd-section[data-section="${sectionKey}"]`);
    if (!sectionEl) return;
    const labelEl = sectionEl.querySelector('.pd-section-label');
    if (!labelEl) return;

    const section = this._SECTIONS.find(s => s.key === sectionKey);
    const currentLabel = section ? section.label : sectionKey;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'pd-section-rename-input';
    input.value = currentLabel;

    const originalHTML = labelEl.innerHTML;
    labelEl.innerHTML = '';
    labelEl.appendChild(input);
    input.focus();
    input.select();

    const commit = () => {
      const newLabel = input.value.trim();
      if (newLabel && section) {
        section.label = newLabel;
      }
      labelEl.textContent = (section ? section.label : currentLabel);
      input.removeEventListener('blur', commit);
      input.removeEventListener('keydown', onKey);
    };

    const onKey = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = currentLabel; input.blur(); }
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', onKey);
  },

  // ── Section: Add new ────────────────────────────────
  _addSection(refKey, position) {
    const idx = this._SECTIONS.findIndex(s => s.key === refKey);
    const newKey = 'custom_' + Date.now();
    const newSection = {
      key: newKey,
      label: 'Nova secao',
      icon: 'folder',
      statuses: [],
    };

    if (idx === -1) {
      this._SECTIONS.push(newSection);
    } else if (position === 'above') {
      this._SECTIONS.splice(idx, 0, newSection);
    } else {
      this._SECTIONS.splice(idx + 1, 0, newSection);
    }

    this._reRenderTasks();
    // Auto-trigger rename on the new section
    setTimeout(() => this._renameSectionInline(newKey), 100);
  },

  // ── Section: Duplicate ──────────────────────────────
  _duplicateSection(sectionKey) {
    const idx = this._SECTIONS.findIndex(s => s.key === sectionKey);
    const original = this._SECTIONS[idx];
    if (!original) return;

    const newKey = original.key + '_copy_' + Date.now();
    const duplicate = {
      key: newKey,
      label: original.label + ' (copia)',
      icon: original.icon,
      statuses: [...original.statuses],
    };

    this._SECTIONS.splice(idx + 1, 0, duplicate);

    // Duplicate tasks in this section
    const sectionDemands = this._demands.filter(d =>
      original.statuses.some(s => (d.status || '').toLowerCase() === s.toLowerCase())
    );

    const duplicatedDemands = sectionDemands.map(d => {
      const dup = { ...d };
      dup.id = 'temp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      dup.title = (d.title || '') + ' (copia)';
      return dup;
    });

    this._demands.push(...duplicatedDemands);
    this._reRenderTasks();
  },

  // ── Section: Delete with dialog ─────────────────────
  _deleteSectionWithDialog(sectionKey) {
    const section = this._SECTIONS.find(s => s.key === sectionKey);
    if (!section) return;

    const sectionDemands = this._demands.filter(d =>
      section.statuses.some(s => (d.status || '').toLowerCase() === s.toLowerCase())
    );

    const otherSections = this._SECTIONS.filter(s => s.key !== sectionKey);
    const self = this;

    // Build modal
    const overlay = document.createElement('div');
    overlay.className = 'pd-sec-delete-overlay';

    let optionsHtml = '';
    if (sectionDemands.length > 0) {
      optionsHtml = `
        <p class="pd-sec-del-desc">Esta secao contem <strong>${sectionDemands.length}</strong> tarefa(s). O que deseja fazer com elas?</p>
        <div class="pd-sec-del-options">
          <label class="pd-sec-del-option">
            <input type="radio" name="pd-sec-del-dest" value="move" checked>
            <span>Mover para outra secao</span>
          </label>
          <select class="pd-sec-del-select" id="pdSecDelTarget">
            ${otherSections.map(s => `<option value="${s.key}">${this._esc(s.label)}</option>`).join('')}
            <option value="__none__">Sem secao</option>
          </select>
          <label class="pd-sec-del-option">
            <input type="radio" name="pd-sec-del-dest" value="delete">
            <span class="pd-sec-del-danger-label">Excluir as tarefas tambem</span>
          </label>
        </div>
      `;
    } else {
      optionsHtml = `<p class="pd-sec-del-desc">Esta secao esta vazia. Deseja exclui-la?</p>`;
    }

    overlay.innerHTML = `
      <div class="pd-sec-delete-dialog">
        <div class="pd-sec-del-header">
          <i data-lucide="alert-triangle" style="width:20px;height:20px;color:#ef4444;"></i>
          <span>Excluir secao "${this._esc(section.label)}"</span>
        </div>
        ${optionsHtml}
        <div class="pd-sec-del-actions">
          <button class="pd-sec-del-btn pd-sec-del-cancel">Cancelar</button>
          <button class="pd-sec-del-btn pd-sec-del-confirm">Excluir</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    if (typeof lucide !== 'undefined') lucide.createIcons({ root: overlay });

    // Toggle select visibility based on radio
    const selectEl = overlay.querySelector('#pdSecDelTarget');
    if (selectEl) {
      overlay.querySelectorAll('input[name="pd-sec-del-dest"]').forEach(radio => {
        radio.addEventListener('change', () => {
          selectEl.style.display = radio.value === 'move' && radio.checked ? '' : 'none';
        });
      });
    }

    // Cancel
    overlay.querySelector('.pd-sec-del-cancel').addEventListener('click', () => {
      overlay.remove();
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // Confirm
    overlay.querySelector('.pd-sec-del-confirm').addEventListener('click', async () => {
      if (sectionDemands.length > 0) {
        const destRadio = overlay.querySelector('input[name="pd-sec-del-dest"]:checked');
        const dest = destRadio ? destRadio.value : 'move';

        if (dest === 'move') {
          const targetKey = selectEl ? selectEl.value : '__none__';
          const targetSection = self._SECTIONS.find(s => s.key === targetKey);
          // Move demands: change their status to first status of target section
          const newStatus = targetSection && targetSection.statuses.length > 0
            ? targetSection.statuses[0]
            : 'A fazer';
          sectionDemands.forEach(d => { d.status = newStatus; });

          // Persist to DB
          try {
            const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
            if (client) {
              const ids = sectionDemands.map(d => d.id).filter(id => !String(id).startsWith('temp_'));
              if (ids.length > 0) {
                await client.from('demands').update({ status: newStatus }).in('id', ids);
              }
            }
          } catch (e) { console.error('[PD] move demands error:', e); }
        } else {
          // Delete the demands
          try {
            const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
            if (client) {
              const ids = sectionDemands.map(d => d.id).filter(id => !String(id).startsWith('temp_'));
              if (ids.length > 0) {
                await client.from('demands').delete().in('id', ids);
              }
            }
          } catch (e) { console.error('[PD] delete demands error:', e); }
          self._demands = self._demands.filter(d => !sectionDemands.includes(d));
        }
      }

      // Remove section from _SECTIONS
      const idx = self._SECTIONS.findIndex(s => s.key === sectionKey);
      if (idx !== -1) self._SECTIONS.splice(idx, 1);

      overlay.remove();
      self._reRenderTasks();
    });
  },

  // ═══════════════════════════════════════════════════
  // COLUMN CONTEXT MENU
  // ═══════════════════════════════════════════════════

  _showColContextMenu(colKey, anchorEl) {
    this._closeColContextMenu();
    this._closeContextMenu();
    this._colCtxKey = colKey;
    const self = this;
    const col = this._COLUMNS.find(c => c.key === colKey);
    if (!col) return;

    const menu = document.createElement('div');
    menu.className = 'pd-col-context-menu';

    const isFixed = col.fixed;
    const typeLabel = this._getColTypeLabel(colKey);

    menu.innerHTML = `
      <div class="pd-col-ctx-item" data-action="sort-asc">
        <i data-lucide="arrow-up-narrow-wide"></i> <span>Ordenar A &rarr; Z</span>
      </div>
      <div class="pd-col-ctx-item" data-action="sort-desc">
        <i data-lucide="arrow-down-wide-narrow"></i> <span>Ordenar Z &rarr; A</span>
      </div>
      ${!isFixed ? `
        <div class="pd-col-ctx-separator"></div>
        <div class="pd-col-ctx-item" data-action="hide">
          <i data-lucide="eye-off"></i> <span>Ocultar coluna</span>
        </div>
      ` : ''}
      <div class="pd-col-ctx-separator"></div>
      <div class="pd-col-ctx-item pd-col-ctx-item--info">
        <i data-lucide="info"></i> <span>Tipo: ${typeLabel}</span>
      </div>
    `;

    document.body.appendChild(menu);
    if (typeof lucide !== 'undefined') lucide.createIcons({ root: menu });

    // Position below the anchor
    const rect = anchorEl.getBoundingClientRect();
    const mw = menu.offsetWidth;
    const vw = window.innerWidth;
    let left = rect.left;
    if (left + mw > vw) left = Math.max(0, vw - mw - 8);
    menu.style.left = left + 'px';
    menu.style.top = (rect.bottom + 4) + 'px';

    this._colCtxMenu = menu;

    // Bind actions
    menu.querySelectorAll('.pd-col-ctx-item:not(.pd-col-ctx-item--info)').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        if (action) {
          self._closeColContextMenu();
          self._handleColContextAction(action, colKey);
        }
      });
    });

    menu.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
  },

  _closeColContextMenu() {
    if (this._colCtxMenu) {
      this._colCtxMenu.remove();
      this._colCtxMenu = null;
    }
    this._colCtxKey = null;
  },

  _handleColContextAction(action, colKey) {
    switch (action) {
      case 'sort-asc':
        this._sortDemands(colKey, 'asc');
        break;
      case 'sort-desc':
        this._sortDemands(colKey, 'desc');
        break;
      case 'hide':
        this._hideColumn(colKey);
        break;
    }
  },

  _getColTypeLabel(colKey) {
    const types = {
      name: 'Titulo',
      responsible: 'Pessoa',
      date: 'Data',
      priority: 'Selecao',
      status: 'Selecao',
    };
    return types[colKey] || 'Texto';
  },

  // ═══════════════════════════════════════════════════
  // SORT
  // ═══════════════════════════════════════════════════

  _sortDemands(colKey, direction) {
    const fieldMap = {
      name: 'title',
      responsible: 'responsible',
      date: 'due_date',
      priority: 'prioridade',
      status: 'status',
    };
    const field = fieldMap[colKey];
    if (!field) return;

    const priorityOrder = { 'alta': 0, 'high': 0, 'urgente': 0, 'media': 1, 'média': 1, 'medium': 1, 'baixa': 2, 'low': 2 };

    this._demands.sort((a, b) => {
      let va = a[field] || '';
      let vb = b[field] || '';

      if (colKey === 'priority') {
        va = priorityOrder[(va || '').toLowerCase()] ?? 99;
        vb = priorityOrder[(vb || '').toLowerCase()] ?? 99;
      } else if (colKey === 'date') {
        va = va ? new Date(va).getTime() : Infinity;
        vb = vb ? new Date(vb).getTime() : Infinity;
      } else {
        va = (va || '').toLowerCase();
        vb = (vb || '').toLowerCase();
      }

      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return direction === 'asc' ? cmp : -cmp;
    });

    this._reRenderTasks();
  },

  // ═══════════════════════════════════════════════════
  // HIDE / SHOW COLUMNS
  // ═══════════════════════════════════════════════════

  _hideColumn(colKey) {
    const col = this._COLUMNS.find(c => c.key === colKey);
    if (!col || col.fixed) return;
    col.hidden = true;
    this._applyColumnOrder();
    this._saveColumnOrder();
  },

  _showColumn(colKey) {
    const col = this._COLUMNS.find(c => c.key === colKey);
    if (!col) return;
    col.hidden = false;
    if (!this._columnOrder.includes(colKey)) {
      this._columnOrder.push(colKey);
    }
    this._applyColumnOrder();
    this._saveColumnOrder();
  },

  _showAddColumnMenu(anchorEl) {
    this._closeColContextMenu();
    const self = this;
    const hiddenCols = this._COLUMNS.filter(c => c.hidden && !c.fixed);

    const menu = document.createElement('div');
    menu.className = 'pd-col-context-menu';

    if (hiddenCols.length > 0) {
      let html = '<div class="pd-col-ctx-label">Colunas ocultas</div>';
      hiddenCols.forEach(col => {
        html += `<div class="pd-col-ctx-item" data-action="show" data-col-key="${col.key}">
          <i data-lucide="eye"></i> <span>${this._esc(col.label)}</span>
        </div>`;
      });
      menu.innerHTML = html;
    } else {
      menu.innerHTML = '<div class="pd-col-ctx-label">Todas as colunas estao visiveis</div>';
    }

    document.body.appendChild(menu);
    if (typeof lucide !== 'undefined') lucide.createIcons({ root: menu });

    // Position
    const rect = anchorEl.getBoundingClientRect();
    const mw = menu.offsetWidth;
    const vw = window.innerWidth;
    let left = rect.left;
    if (left + mw > vw) left = Math.max(0, vw - mw - 8);
    menu.style.left = left + 'px';
    menu.style.top = (rect.bottom + 4) + 'px';

    // Store as colCtxMenu so global handler closes it
    this._colCtxMenu = menu;

    menu.querySelectorAll('[data-action="show"]').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = item.dataset.colKey;
        self._closeColContextMenu();
        if (key) self._showColumn(key);
      });
    });

    menu.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
  },

  // ═══════════════════════════════════════════════════
  // DRAG & DROP (Tasks + Sections) — vertical
  // ═══════════════════════════════════════════════════

  _bindDragHandles() {
    this._bindTaskDragDelegation();   // tasks: Pointer Events, bound ONCE
    this._bindSectionDragHandles();   // sections: HTML5 Drag, re-bound each render
  },

  // ── Task drag via Pointer Events (event delegation) ──

  _bindTaskDragDelegation() {
    if (this._taskDragBound) return;
    this._taskDragBound = true;
    const self = this;
    const container = document.querySelector('.pd-tasks');
    if (!container) return;

    container.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const handle = e.target.closest('.pd-task-drag');
      if (!handle) return;
      const row = handle.closest('.pd-task-row');
      if (!row) return;

      e.preventDefault();
      container.setPointerCapture(e.pointerId);

      const sectionEl = row.closest('.pd-section');
      self._taskDragState = {
        demandId: row.dataset.demandId,
        originSection: sectionEl ? sectionEl.dataset.section : null,
        rowEl: row,
        ghostEl: null,
        indicatorEl: null,
        startX: e.clientX,
        startY: e.clientY,
        pointerId: e.pointerId,
        started: false,
        dropTargetBody: null,
        dropInsertBefore: null,
        dropTargetSection: null,
      };
    });

    container.addEventListener('pointermove', (e) => {
      const state = self._taskDragState;
      if (!state) return;

      if (!state.started) {
        const dx = e.clientX - state.startX;
        const dy = e.clientY - state.startY;
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
        state.started = true;
        self._taskDragStart(state);
      }

      self._taskDragMoveGhost(state, e.clientX, e.clientY);
      self._taskDragUpdateIndicator(state, e.clientX, e.clientY);
    });

    container.addEventListener('pointerup', (e) => {
      const state = self._taskDragState;
      if (!state) return;
      try { container.releasePointerCapture(e.pointerId); } catch (_) {}
      if (state.started) self._taskDragDrop(state);
      self._taskDragCleanup(state);
      self._taskDragState = null;
    });

    container.addEventListener('pointercancel', () => {
      const state = self._taskDragState;
      if (!state) return;
      self._taskDragCleanup(state);
      self._taskDragState = null;
    });
  },

  _taskDragStart(state) {
    const row = state.rowEl;
    row.classList.add('pd-dragging');
    this._dragActive = true;
    this._dragType = 'task';

    // Ghost element — lightweight label following the pointer
    const ghost = document.createElement('div');
    ghost.className = 'pd-drag-ghost';
    const nameEl = row.querySelector('.pd-task-title');
    ghost.textContent = nameEl ? nameEl.textContent : 'Tarefa';
    document.body.appendChild(ghost);
    state.ghostEl = ghost;

    // Drop indicator line
    const indicator = document.createElement('div');
    indicator.className = 'pd-drop-indicator-line';
    indicator.style.display = 'none';
    const container = document.querySelector('.pd-tasks');
    if (container) container.appendChild(indicator);
    state.indicatorEl = indicator;
  },

  _taskDragMoveGhost(state, clientX, clientY) {
    if (!state.ghostEl) return;
    state.ghostEl.style.left = clientX + 'px';
    state.ghostEl.style.top = (clientY - 32) + 'px';
  },

  _taskDragUpdateIndicator(state, clientX, clientY) {
    const indicator = state.indicatorEl;
    if (!indicator) return;

    // Clear previous section highlights
    document.querySelectorAll('.pd-section.pd-drop-target').forEach(s =>
      s.classList.remove('pd-drop-target')
    );

    // Find which section body the pointer is over
    let targetBody = null;
    let targetSection = null;

    for (const body of document.querySelectorAll('.pd-section-body')) {
      const rect = body.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom &&
          clientX >= rect.left && clientX <= rect.right) {
        targetBody = body;
        targetSection = body.closest('.pd-section');
        break;
      }
    }

    // Also check section headers (for dropping at the top of a section)
    if (!targetBody) {
      for (const header of document.querySelectorAll('.pd-section-header')) {
        const rect = header.getBoundingClientRect();
        if (clientY >= rect.top && clientY <= rect.bottom &&
            clientX >= rect.left && clientX <= rect.right) {
          targetSection = header.closest('.pd-section');
          targetBody = targetSection ? targetSection.querySelector('.pd-section-body') : null;
          break;
        }
      }
    }

    if (!targetBody) {
      indicator.style.display = 'none';
      state.dropTargetBody = null;
      state.dropInsertBefore = null;
      state.dropTargetSection = null;
      return;
    }

    // Highlight target section if different from origin
    if (targetSection && targetSection.dataset.section !== state.originSection) {
      targetSection.classList.add('pd-drop-target');
    }

    // Find the closest row within this section body
    const rows = targetBody.querySelectorAll('.pd-task-row');
    let insertBefore = null;

    for (const row of rows) {
      if (row === state.rowEl) continue;
      const rect = row.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (clientY < midY) {
        insertBefore = row;
        break;
      }
    }

    // Position the indicator
    const container = document.querySelector('.pd-tasks');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const scrollTop = container.scrollTop || 0;

    if (insertBefore) {
      const rowRect = insertBefore.getBoundingClientRect();
      indicator.style.top = (rowRect.top - containerRect.top + scrollTop) + 'px';
    } else {
      // After the last visible row, or top of empty section
      let lastVisibleRow = null;
      for (const row of rows) {
        if (row !== state.rowEl) lastVisibleRow = row;
      }
      if (lastVisibleRow) {
        const rowRect = lastVisibleRow.getBoundingClientRect();
        indicator.style.top = (rowRect.bottom - containerRect.top + scrollTop) + 'px';
      } else {
        const bodyRect = targetBody.getBoundingClientRect();
        indicator.style.top = (bodyRect.top - containerRect.top + scrollTop) + 'px';
      }
    }
    indicator.style.display = 'block';

    state.dropTargetBody = targetBody;
    state.dropInsertBefore = insertBefore;
    state.dropTargetSection = targetSection;
  },

  _taskDragDrop(state) {
    const { rowEl, dropTargetBody, dropInsertBefore, dropTargetSection, demandId, originSection } = state;
    if (!dropTargetBody) return;

    // 1. Move the row in the DOM
    if (dropInsertBefore) {
      dropTargetBody.insertBefore(rowEl, dropInsertBefore);
    } else {
      dropTargetBody.appendChild(rowEl);
    }

    // 2. Handle cross-section status change
    const newSectionKey = dropTargetSection ? dropTargetSection.dataset.section : null;
    if (newSectionKey && newSectionKey !== originSection) {
      const demand = this._demands.find(d => d.id === demandId);
      if (demand) {
        const section = this._SECTIONS.find(s => s.key === newSectionKey);
        if (section && section.statuses.length > 0) {
          const newStatus = section.statuses[0];
          demand.status = newStatus;
          delete this._sectionOverrides[demand.id];

          // Update status badge in the moved row (no full re-render)
          const statusCell = rowEl.querySelector('.pd-demand-status');
          if (statusCell) {
            const colors = this._DEMAND_STATUS_COLORS[newStatus] || { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' };
            statusCell.textContent = newStatus;
            statusCell.style.background = colors.bg;
            statusCell.style.color = colors.color;
          }

          // Persist to Supabase
          if (!String(demandId).startsWith('temp_')) {
            this._persistStatusChange(demandId, newStatus);
          }
        } else if (newSectionKey === 'outros') {
          this._sectionOverrides[demandId] = 'outros';
        }
      }
    }

    // 3. Sync in-memory _demands array with new DOM order
    this._syncDemandsArrayFromDOM();

    // 4. Update section counts
    this._updateSectionCounts();
  },

  _taskDragCleanup(state) {
    if (state.ghostEl && state.ghostEl.parentNode) {
      state.ghostEl.parentNode.removeChild(state.ghostEl);
    }
    if (state.indicatorEl && state.indicatorEl.parentNode) {
      state.indicatorEl.parentNode.removeChild(state.indicatorEl);
    }
    if (state.rowEl) {
      state.rowEl.classList.remove('pd-dragging');
    }
    document.querySelectorAll('.pd-section.pd-drop-target').forEach(s =>
      s.classList.remove('pd-drop-target')
    );
    this._dragActive = false;
    this._dragType = null;
  },

  _syncDemandsArrayFromDOM() {
    const rows = document.querySelectorAll('.pd-task-row[data-demand-id]');
    const ordered = [];
    const seen = new Set();

    rows.forEach(row => {
      const d = this._demands.find(dd => dd.id === row.dataset.demandId);
      if (d && !seen.has(d.id)) {
        ordered.push(d);
        seen.add(d.id);
      }
    });

    // Append any demands not found in DOM (edge case safety)
    this._demands.forEach(d => {
      if (!seen.has(d.id)) ordered.push(d);
    });

    this._demands = ordered;
  },

  async _persistStatusChange(demandId, newStatus) {
    try {
      const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
      if (!client) return;
      await client.from('demands').update({ status: newStatus }).eq('id', demandId);
    } catch (e) {
      console.error('[PD] drag status update error:', e);
    }
  },

  _updateSectionCounts() {
    document.querySelectorAll('.pd-section').forEach(sectionEl => {
      const body = sectionEl.querySelector('.pd-section-body');
      const countEl = sectionEl.querySelector('.pd-section-count');
      if (body && countEl) {
        const rowCount = body.querySelectorAll('.pd-task-row').length;
        countEl.textContent = rowCount;
      }
    });
  },

  // ── Section drag handles (HTML5 Drag, re-bound each render) ──

  _bindSectionDragHandles() {
    const self = this;

    document.querySelectorAll('.pd-section-drag').forEach(handle => {
      const section = handle.closest('.pd-section');
      if (!section) return;

      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        self._dragType = 'section';
        section.setAttribute('draggable', 'true');
      });

      section.addEventListener('dragstart', (e) => {
        if (self._dragType !== 'section') { e.preventDefault(); return; }
        self._dragActive = true;
        self._dragEl = section;
        section.classList.add('pd-dragging');
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', section.dataset.section || ''); } catch (_) {}
      });

      section.addEventListener('dragend', () => {
        section.classList.remove('pd-dragging');
        section.removeAttribute('draggable');
        self._clearDropIndicators();
        self._dragActive = false;
        self._dragEl = null;
        self._dragType = null;
      });

      section.addEventListener('dragover', (e) => {
        if (self._dragType !== 'section' || self._dragEl === section) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        self._clearDropIndicators();
        const rect = section.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        section.classList.add(e.clientY < midY ? 'pd-drop-above' : 'pd-drop-below');
      });

      section.addEventListener('dragleave', () => {
        section.classList.remove('pd-drop-above', 'pd-drop-below');
      });

      section.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (self._dragType !== 'section' || !self._dragEl || self._dragEl === section) {
          self._clearDropIndicators();
          return;
        }
        const rect = section.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const parent = section.parentNode;
        if (e.clientY < midY) {
          parent.insertBefore(self._dragEl, section);
        } else {
          parent.insertBefore(self._dragEl, section.nextSibling);
        }
        self._clearDropIndicators();
      });
    });

    // Cleanup draggable on sections after mouseup
    document.addEventListener('mouseup', () => {
      if (self._dragActive) return;
      document.querySelectorAll('.pd-section[draggable]').forEach(s => s.removeAttribute('draggable'));
      if (self._dragType === 'section') self._dragType = null;
    }, { once: true });
  },

  // ═══════════════════════════════════════════════════
  // DRAG & DROP (Columns) — horizontal
  // ═══════════════════════════════════════════════════

  _bindColumnDrag() {
    const self = this;
    const header = document.querySelector('.pd-table-header');
    if (!header) return;

    // Create drop indicator line (reusable)
    let dropIndicator = document.createElement('div');
    dropIndicator.className = 'pd-col-drop-indicator';
    dropIndicator.style.display = 'none';
    header.style.position = 'sticky'; // ensure positioning context
    header.appendChild(dropIndicator);

    let dropColTarget = null;
    let dropColBefore = false;

    document.querySelectorAll('.pd-col-drag-handle').forEach(handle => {
      const th = handle.closest('.pd-th');
      if (!th) return;
      const colKey = th.dataset.col;

      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        th.setAttribute('draggable', 'true');
        self._dragType = 'column';
        self._dragColKey = colKey;
      });

      th.addEventListener('dragstart', (e) => {
        if (self._dragType !== 'column') { e.preventDefault(); return; }
        self._dragEl = th;
        th.classList.add('pd-col-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', colKey);
      });

      th.addEventListener('dragend', () => {
        th.classList.remove('pd-col-dragging');
        th.removeAttribute('draggable');
        dropIndicator.style.display = 'none';
        self._dragEl = null;
        self._dragColKey = null;
        self._dragType = null;
      });
    });

    // Dragover on ALL movable header columns
    document.querySelectorAll('.pd-th[data-draggable-col]').forEach(th => {
      th.addEventListener('dragover', (e) => {
        if (self._dragType !== 'column') return;
        if (th === self._dragEl) {
          dropIndicator.style.display = 'none';
          return;
        }
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const headerRect = header.getBoundingClientRect();
        const rect = th.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const insertBefore = e.clientX < midX;

        dropIndicator.style.display = 'block';
        dropIndicator.style.left = ((insertBefore ? rect.left : rect.right) - headerRect.left) + 'px';
        dropIndicator.style.height = headerRect.height + 'px';
        dropIndicator.style.top = '0';

        dropColTarget = th.dataset.col;
        dropColBefore = insertBefore;
      });

      th.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropIndicator.style.display = 'none';

        if (self._dragType !== 'column' || !self._dragColKey) return;

        const fromKey = self._dragColKey;
        const toKey = dropColTarget;
        const before = dropColBefore;

        if (fromKey === toKey) return;

        // Reorder _columnOrder
        const newOrder = self._columnOrder.filter(k => k !== fromKey);
        const targetIdx = newOrder.indexOf(toKey);
        const insertIdx = before ? targetIdx : targetIdx + 1;
        newOrder.splice(insertIdx, 0, fromKey);

        self._columnOrder = newOrder;
        self._applyColumnOrder();
        self._saveColumnOrder();
      });
    });

    // Also handle dragover on the "name" column (fixed, for left-edge drop)
    const nameCol = document.querySelector('.pd-th[data-col="name"]');
    if (nameCol) {
      nameCol.addEventListener('dragover', (e) => {
        if (self._dragType !== 'column') return;
        e.preventDefault();
        // Show indicator at right edge of name column
        const headerRect = header.getBoundingClientRect();
        const rect = nameCol.getBoundingClientRect();
        dropIndicator.style.display = 'block';
        dropIndicator.style.left = (rect.right - headerRect.left) + 'px';
        dropIndicator.style.height = headerRect.height + 'px';
        dropIndicator.style.top = '0';
        dropColTarget = '__name_right__';
        dropColBefore = true;
      });

      nameCol.addEventListener('drop', (e) => {
        if (self._dragType !== 'column' || !self._dragColKey) return;
        e.preventDefault();
        e.stopPropagation();
        dropIndicator.style.display = 'none';

        // Move column to first position
        const fromKey = self._dragColKey;
        const newOrder = self._columnOrder.filter(k => k !== fromKey);
        newOrder.unshift(fromKey);
        self._columnOrder = newOrder;
        self._applyColumnOrder();
        self._saveColumnOrder();
      });
    }

    // Cleanup draggable on mouseup
    const cleanupCols = () => {
      document.querySelectorAll('.pd-th[draggable]').forEach(th => th.removeAttribute('draggable'));
    };
    document.addEventListener('mouseup', cleanupCols);
  },

  _clearDropIndicators() {
    document.querySelectorAll('.pd-drop-above, .pd-drop-below').forEach(el => {
      el.classList.remove('pd-drop-above', 'pd-drop-below');
    });
  },

  // _syncDemandOrderFromDOM — replaced by _syncDemandsArrayFromDOM + _persistStatusChange

  // ═══════════════════════════════════════════════════
  // TAB 1: VISAO GERAL (OVERVIEW)
  // ═══════════════════════════════════════════════════

  _renderOverviewTab() {
    const p = this._project;
    const total = this._demands.length;
    const done = this._demands.filter(d => this._isDone(d)).length;
    const inProgress = this._demands.filter(d => {
      const s = (d.status || '').toLowerCase();
      return s === 'em andamento' || s === 'in progress';
    }).length;
    const overdue = this._demands.filter(d => this._isLate(d)).length;
    const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
    const info = this._statusInfo(p.status);

    return `
      <div class="pd-overview">
        <div class="pd-overview-header">
          <div class="pd-overview-title-row">
            <h2 class="pd-overview-name">${this._esc(p.name)}</h2>
            <span class="pd-overview-status" style="background:${info.bg};color:${info.color};">
              <i data-lucide="${info.icon}" style="width:13px;height:13px;"></i>
              ${info.label}
            </span>
          </div>
          <div class="pd-overview-info-row">
            ${p.construtora ? `<span class="pd-overview-info-chip"><i data-lucide="building-2" style="width:13px;height:13px;"></i>${this._esc(p.construtora)}</span>` : ''}
            ${p.owner_name ? `<span class="pd-overview-info-chip"><i data-lucide="user" style="width:13px;height:13px;"></i>${this._esc(p.owner_name)}</span>` : ''}
            <span class="pd-overview-info-chip">
              <i data-lucide="calendar" style="width:13px;height:13px;"></i>
              ${p.due_date_start ? this._fmtDate(p.due_date_start) : 'Sem inicio'} &rarr; ${p.due_date_end ? this._fmtDate(p.due_date_end) : 'Sem fim'}
            </span>
          </div>
          <div class="pd-overview-progress">
            <div class="pd-overview-progress-track">
              <div class="pd-overview-progress-fill" style="width:${progressPct}%;background:${info.color};"></div>
            </div>
            <span class="pd-overview-progress-label">${progressPct}% concluido (${done}/${total})</span>
          </div>
        </div>

        <div class="pd-overview-kpis">
          <div class="pd-overview-kpi">
            <div class="pd-overview-kpi-icon"><i data-lucide="list-checks" style="width:18px;height:18px;"></i></div>
            <div class="pd-overview-kpi-value">${total}</div>
            <div class="pd-overview-kpi-label">Total de tarefas</div>
          </div>
          <div class="pd-overview-kpi pd-overview-kpi--done">
            <div class="pd-overview-kpi-icon"><i data-lucide="check-circle-2" style="width:18px;height:18px;"></i></div>
            <div class="pd-overview-kpi-value">${done}</div>
            <div class="pd-overview-kpi-label">Concluidas</div>
          </div>
          <div class="pd-overview-kpi pd-overview-kpi--progress">
            <div class="pd-overview-kpi-icon"><i data-lucide="play-circle" style="width:18px;height:18px;"></i></div>
            <div class="pd-overview-kpi-value">${inProgress}</div>
            <div class="pd-overview-kpi-label">Em andamento</div>
          </div>
          <div class="pd-overview-kpi pd-overview-kpi--overdue">
            <div class="pd-overview-kpi-icon"><i data-lucide="alert-triangle" style="width:18px;height:18px;"></i></div>
            <div class="pd-overview-kpi-value">${overdue}</div>
            <div class="pd-overview-kpi-label">Atrasadas</div>
          </div>
        </div>

        <div class="pd-overview-description">
          <div class="pd-overview-desc-header">
            <span class="pd-overview-desc-title"><i data-lucide="file-text" style="width:14px;height:14px;"></i> Descricao do Projeto</span>
            <span class="pd-overview-save-status" id="pdOverviewSaveStatus"></span>
          </div>
          <div class="pd-overview-toolbar" id="pdOverviewToolbar">
            <button class="pd-overview-tb-btn" data-cmd="bold" title="Negrito (Ctrl+B)"><i data-lucide="bold" style="width:14px;height:14px;"></i></button>
            <button class="pd-overview-tb-btn" data-cmd="italic" title="Italico (Ctrl+I)"><i data-lucide="italic" style="width:14px;height:14px;"></i></button>
            <div class="pd-overview-tb-sep"></div>
            <button class="pd-overview-tb-btn" data-cmd="insertUnorderedList" title="Lista"><i data-lucide="list" style="width:14px;height:14px;"></i></button>
            <button class="pd-overview-tb-btn" data-cmd="insertOrderedList" title="Lista numerada"><i data-lucide="list-ordered" style="width:14px;height:14px;"></i></button>
            <div class="pd-overview-tb-sep"></div>
            <button class="pd-overview-tb-btn" data-cmd="formatBlock-h3" title="Subtitulo"><i data-lucide="heading-3" style="width:14px;height:14px;"></i></button>
            <button class="pd-overview-tb-btn" data-cmd="createLink" title="Link"><i data-lucide="link" style="width:14px;height:14px;"></i></button>
            <button class="pd-overview-tb-btn" data-cmd="formatBlock-blockquote" title="Citacao"><i data-lucide="quote" style="width:14px;height:14px;"></i></button>
          </div>
          <div class="pd-overview-editor" id="pdOverviewEditor" contenteditable="true"
               data-placeholder="Adicione uma descricao para o projeto...">${p.notes || ''}</div>
        </div>

        <div class="pd-overview-activity">
          <div class="pd-overview-activity-header">
            <i data-lucide="activity" style="width:14px;height:14px;"></i>
            <span>Atividade recente</span>
          </div>
          <div class="pd-overview-activity-list">
            ${this._renderRecentActivity()}
          </div>
        </div>
      </div>
    `;
  },

  _renderRecentActivity() {
    const recent = [...this._demands]
      .filter(d => d.updated_at || d.created_at)
      .sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''))
      .slice(0, 8);

    if (recent.length === 0) {
      return `<div class="pd-overview-activity-empty">
        <i data-lucide="clock" style="width:20px;height:20px;opacity:0.3;"></i>
        <p>Nenhuma atividade recente.</p>
      </div>`;
    }

    return recent.map(d => {
      const statusColors = this._DEMAND_STATUS_COLORS[d.status] || { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' };
      const date = d.updated_at || d.created_at;
      return `<div class="pd-overview-activity-item">
        <span class="pd-overview-activity-dot" style="background:${statusColors.color};"></span>
        <span class="pd-overview-activity-title">${this._esc(d.title)}</span>
        <span class="pd-overview-activity-status" style="color:${statusColors.color};">${this._esc(d.status || '')}</span>
        ${date ? `<span class="pd-overview-activity-date">${this._fmtDate(date)}</span>` : ''}
      </div>`;
    }).join('');
  },

  _bindOverviewEvents() {
    const self = this;
    const editor = document.getElementById('pdOverviewEditor');
    const toolbar = document.getElementById('pdOverviewToolbar');
    if (!editor || !toolbar) return;

    toolbar.querySelectorAll('.pd-overview-tb-btn').forEach(btn => {
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        if (cmd === 'createLink') {
          const url = prompt('URL do link:');
          if (url) document.execCommand('createLink', false, url);
        } else if (cmd.startsWith('formatBlock-')) {
          const tag = cmd.replace('formatBlock-', '');
          document.execCommand('formatBlock', false, tag);
        } else {
          document.execCommand(cmd, false, null);
        }
        editor.focus();
      });
    });

    editor.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); document.execCommand('bold'); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); document.execCommand('italic'); }
    });

    editor.addEventListener('input', () => {
      self._scheduleNotesSave();
    });
  },

  _scheduleNotesSave() {
    if (this._notesSaveTimer) clearTimeout(this._notesSaveTimer);
    const statusEl = document.getElementById('pdOverviewSaveStatus');
    if (statusEl) { statusEl.textContent = 'Editando...'; statusEl.className = 'pd-overview-save-status pd-overview-save-editing'; }
    this._notesSaveTimer = setTimeout(() => this._saveNotes(), 1200);
  },

  async _saveNotes() {
    const editor = document.getElementById('pdOverviewEditor');
    const statusEl = document.getElementById('pdOverviewSaveStatus');
    if (!editor) return;

    const content = editor.innerHTML;
    if (statusEl) { statusEl.textContent = 'Salvando...'; statusEl.className = 'pd-overview-save-status pd-overview-save-saving'; }

    try {
      const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
      if (client && this._project?.id) {
        await client.from('projects').update({ notes: content }).eq('id', this._project.id);
        this._project.notes = content;
        if (statusEl) { statusEl.textContent = 'Salvo'; statusEl.className = 'pd-overview-save-status pd-overview-save-saved'; }
        setTimeout(() => { if (statusEl && statusEl.textContent === 'Salvo') statusEl.textContent = ''; }, 3000);
      }
    } catch (err) {
      console.error('[PD] save notes error:', err);
      if (statusEl) { statusEl.textContent = 'Erro ao salvar'; statusEl.className = 'pd-overview-save-status pd-overview-save-error'; }
    }
  },

  // ═══════════════════════════════════════════════════
  // TAB 4: PAINEL (DASHBOARD)
  // ═══════════════════════════════════════════════════

  _renderDashboardTab() {
    const total = this._demands.length;
    const done = this._demands.filter(d => this._isDone(d)).length;
    const inProgress = this._demands.filter(d => {
      const s = (d.status || '').toLowerCase();
      return s === 'em andamento' || s === 'in progress';
    }).length;
    const overdue = this._demands.filter(d => this._isLate(d)).length;
    const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

    if (total === 0) {
      return `<div class="pd-dashboard-empty">
        <i data-lucide="bar-chart-3" style="width:32px;height:32px;opacity:0.3;"></i>
        <p>Nenhuma tarefa para exibir metricas.</p>
        <p style="font-size:0.78rem;color:var(--text-muted);">Adicione tarefas na aba Lista para ver o painel.</p>
      </div>`;
    }

    return `
      <div class="pd-dashboard">
        <div class="pd-dashboard-kpis">
          <div class="pd-dashboard-kpi">
            <span class="pd-dashboard-kpi-val">${total}</span>
            <span class="pd-dashboard-kpi-lbl">Total</span>
          </div>
          <div class="pd-dashboard-kpi pd-dashboard-kpi--done">
            <span class="pd-dashboard-kpi-val">${done}</span>
            <span class="pd-dashboard-kpi-lbl">Concluidas</span>
          </div>
          <div class="pd-dashboard-kpi pd-dashboard-kpi--progress">
            <span class="pd-dashboard-kpi-val">${inProgress}</span>
            <span class="pd-dashboard-kpi-lbl">Em andamento</span>
          </div>
          <div class="pd-dashboard-kpi pd-dashboard-kpi--overdue">
            <span class="pd-dashboard-kpi-val">${overdue}</span>
            <span class="pd-dashboard-kpi-lbl">Atrasadas</span>
          </div>
          <div class="pd-dashboard-kpi">
            <span class="pd-dashboard-kpi-val">${progressPct}%</span>
            <span class="pd-dashboard-kpi-lbl">Progresso</span>
          </div>
        </div>
        <div class="pd-dashboard-charts">
          <div class="pd-dashboard-chart-card">
            <div class="pd-dashboard-chart-title">Tarefas por Status</div>
            <div class="pd-dashboard-chart-wrap"><canvas id="pdChartStatus"></canvas></div>
          </div>
          <div class="pd-dashboard-chart-card">
            <div class="pd-dashboard-chart-title">Tarefas por Secao</div>
            <div class="pd-dashboard-chart-wrap"><canvas id="pdChartSection"></canvas></div>
          </div>
          <div class="pd-dashboard-chart-card pd-dashboard-chart-wide">
            <div class="pd-dashboard-chart-title">Conclusao ao longo do tempo</div>
            <div class="pd-dashboard-chart-wrap pd-dashboard-chart-wrap--wide"><canvas id="pdChartTimeline"></canvas></div>
          </div>
        </div>
      </div>
    `;
  },

  _bindDashboardEvents() {
    this._chartInstances = [];
    this._renderStatusChart();
    this._renderSectionChart();
    this._renderTimelineChart();
  },

  _renderStatusChart() {
    const canvas = document.getElementById('pdChartStatus');
    if (!canvas || typeof Chart === 'undefined') return;

    const statusCounts = {};
    this._demands.forEach(d => {
      const s = d.status || 'Sem status';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    const colors = labels.map(s => (this._DEMAND_STATUS_COLORS[s] || {}).color || '#6b7280');

    const chart = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12, usePointStyle: true } } },
        cutout: '60%',
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const status = labels[idx];
            this._activeTab = 'lista';
            this._switchTab();
            document.querySelectorAll('.pd-tab[data-tab]').forEach(t => {
              t.classList.toggle('pd-tab-active', t.dataset.tab === 'lista');
            });
          }
        }
      }
    });
    this._chartInstances.push(chart);
  },

  _renderSectionChart() {
    const canvas = document.getElementById('pdChartSection');
    if (!canvas || typeof Chart === 'undefined') return;

    const sectionData = this._SECTIONS.map(sec => {
      const count = this._demands.filter(d =>
        sec.statuses.some(s => (d.status || '').toLowerCase() === s.toLowerCase())
      ).length;
      return { label: sec.label, count };
    });

    const chart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: sectionData.map(s => s.label),
        datasets: [{ data: sectionData.map(s => s.count), backgroundColor: '#E85102', borderRadius: 4, maxBarThickness: 40 }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
    this._chartInstances.push(chart);
  },

  _renderTimelineChart() {
    const canvas = document.getElementById('pdChartTimeline');
    if (!canvas || typeof Chart === 'undefined') return;

    const doneDemands = this._demands.filter(d => this._isDone(d) && d.due_date);
    if (doneDemands.length === 0) {
      const wrap = canvas.parentElement;
      if (wrap) wrap.innerHTML = '<p class="pd-dashboard-chart-empty">Sem dados de conclusao com datas.</p>';
      return;
    }

    const sorted = [...doneDemands].sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));
    const dateLabels = [];
    const cumulative = [];
    let count = 0;
    sorted.forEach(d => {
      count++;
      dateLabels.push(this._fmtDate(d.due_date));
      cumulative.push(count);
    });

    const chart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: dateLabels,
        datasets: [{
          label: 'Tarefas concluidas',
          data: cumulative,
          borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)',
          fill: true, tension: 0.3, pointRadius: 3,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
    this._chartInstances.push(chart);
  },

  // ═══════════════════════════════════════════════════
  // TAB 3: QUADRO (KANBAN)
  // ═══════════════════════════════════════════════════

  _kanbanMatch(demandStatus, colStatus) {
    const s = (demandStatus || '').toLowerCase();
    const c = colStatus.toLowerCase();
    if (s === c) return true;
    const aliases = {
      'em andamento': ['in progress', 'em andamento'],
      'em revisao': ['em revisão', 'revisao', 'revisão', 'review'],
      'concluido': ['concluído', 'finalizado', 'done'],
      'a fazer': ['backlog', 'a fazer'],
      'planejamento': ['planejamento'],
    };
    return (aliases[c] || []).includes(s);
  },

  _renderKanbanTab() {
    const columns = this._KANBAN_COLUMNS;
    const customSections = this._SECTIONS.filter(s => s.key.startsWith('custom_'));
    return `
      <div class="pd-kanban">
        <div class="pd-kanban-board">
          ${columns.map(col => {
            const cards = this._demands.filter(d => this._kanbanMatch(d.status, col.status));
            return `
              <div class="pd-kanban-column" data-kanban-status="${this._esc(col.status)}">
                <div class="pd-kanban-col-header" style="border-top:3px solid ${col.color};">
                  <span class="pd-kanban-col-title">${this._esc(col.label)}</span>
                  <span class="pd-kanban-col-count" style="background:${col.color}20;color:${col.color};">${cards.length}</span>
                </div>
                <div class="pd-kanban-col-body" data-kanban-drop="${this._esc(col.status)}">
                  ${cards.map(d => this._renderKanbanCard(d)).join('')}
                  ${cards.length === 0 ? '<div class="pd-kanban-placeholder">Arraste tarefas aqui</div>' : ''}
                </div>
              </div>
            `;
          }).join('')}

          ${customSections.map(sec => {
            const cards = this._demands.filter(d => (this._sectionOverrides[d.id] || '') === sec.key);
            return `
              <div class="pd-kanban-column" data-kanban-section="${this._esc(sec.key)}">
                <div class="pd-kanban-col-header" style="border-top:3px solid #6b7280;">
                  <span class="pd-kanban-col-title">${this._esc(sec.label)}</span>
                  <span class="pd-kanban-col-count" style="background:#6b728020;color:#6b7280;">${cards.length}</span>
                </div>
                <div class="pd-kanban-col-body" data-kanban-drop-section="${this._esc(sec.key)}">
                  ${cards.map(d => this._renderKanbanCard(d)).join('')}
                  ${cards.length === 0 ? '<div class="pd-kanban-placeholder">Arraste tarefas aqui</div>' : ''}
                </div>
              </div>
            `;
          }).join('')}

          <div class="pd-kanban-add-section">
            <button class="pd-kanban-add-section-btn">
              <i data-lucide="plus"></i>
              <span>Adicionar uma seção</span>
            </button>
            <div class="pd-kanban-add-section-inline hidden">
              <input type="text" class="pd-kanban-add-section-input" placeholder="Nome da seção">
              <button class="pd-kanban-add-section-confirm">Criar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _createSectionAtEnd(title) {
    const newKey = 'custom_' + Date.now();
    this._SECTIONS.push({
      key: newKey,
      label: title,
      icon: 'folder',
      statuses: []
    });
    this._switchTab();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._openKanbanInlineTask(newKey);
      });
    });
  },

  _openKanbanInlineTask(sectionKey) {
    const col =
      document.querySelector(`.pd-kanban-column[data-section="${sectionKey}"]`) ||
      document.querySelector(`.pd-kanban-column[data-kanban-section="${sectionKey}"]`);

    if (!col) return;

    col.scrollIntoView({
      behavior: 'smooth',
      inline: 'end',
      block: 'nearest'
    });

    const existing = col.querySelector('.pd-kanban-inline-task-input');
    if (existing) {
      existing.focus();
      return;
    }

    const btn =
      col.querySelector('[data-kanban-add-task]') ||
      col.querySelector('.pd-kanban-add-task-btn');
    if (btn) {
      btn.click();
      return;
    }

    const body = col.querySelector('.pd-kanban-col-body');
    if (!body) return;

    const row = document.createElement('div');
    row.className = 'pd-kanban-inline-task-row';
    row.innerHTML = `
      <input
        class="pd-kanban-inline-task-input"
        placeholder="Adicionar tarefa..."
      />
    `;
    body.appendChild(row);
    row.querySelector('input').focus();
  },

  _renderKanbanCard(d) {
    const isDone = this._isDone(d);
    const isLate = this._isLate(d);
    return `
      <div class="pd-kanban-card ${isDone ? 'pd-kanban-card--done' : ''}" data-kanban-id="${d.id}">
        <div class="pd-kanban-card-title">${this._esc(d.title)}</div>
        <div class="pd-kanban-card-meta">
          ${d.responsible ? `<span class="pd-kanban-card-responsible"><span class="pd-avatar-small" title="${this._esc(d.responsible)}">${this._initials(d.responsible)}</span><span class="pd-kanban-card-resp-name">${this._esc(d.responsible)}</span></span>` : ''}
          ${d.due_date ? `<span class="pd-kanban-card-date ${isLate ? 'pd-kanban-card-date--late' : ''}"><i data-lucide="calendar" style="width:11px;height:11px;"></i>${this._fmtDate(d.due_date)}</span>` : ''}
        </div>
        ${d.prioridade ? `<div class="pd-kanban-card-footer">${this._renderPriority(d.prioridade)}</div>` : ''}
      </div>
    `;
  },

  _bindKanbanEvents() {
    const self = this;

    // Card click -> open drawer
    document.querySelectorAll('.pd-kanban-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (self._kanbanDragState) return;
        const demandId = card.dataset.kanbanId;
        const demand = self._demands.find(d => d.id === demandId);
        if (demand && typeof TBO_DEMAND_DRAWER !== 'undefined') {
          TBO_DEMAND_DRAWER.open(demand, self._project);
        }
      });
    });

    // Add section button
    const addSectionBtn = document.querySelector('.pd-kanban-add-section-btn');
    const addSectionInline = document.querySelector('.pd-kanban-add-section-inline');
    const addSectionInput = document.querySelector('.pd-kanban-add-section-input');

    if (addSectionBtn && addSectionInline && addSectionInput) {
      addSectionBtn.addEventListener('click', () => {
        addSectionBtn.classList.add('hidden');
        addSectionInline.classList.remove('hidden');
        addSectionInput.focus();
      });

      const confirmCreate = () => {
        const val = addSectionInput.value.trim();
        if (val) {
          self._createSectionAtEnd(val);
        } else {
          addSectionInline.classList.add('hidden');
          addSectionBtn.classList.remove('hidden');
        }
      };

      addSectionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); confirmCreate(); }
        if (e.key === 'Escape') { addSectionInput.value = ''; addSectionInline.classList.add('hidden'); addSectionBtn.classList.remove('hidden'); }
      });

      addSectionInput.addEventListener('blur', () => {
        setTimeout(confirmCreate, 120);
      });

      const confirmBtn = document.querySelector('.pd-kanban-add-section-confirm');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', (e) => { e.preventDefault(); confirmCreate(); });
      }
    }

    // Kanban drag using pointer events
    this._bindKanbanDrag();
  },

  _bindKanbanDrag() {
    const self = this;
    const board = document.querySelector('.pd-kanban-board');
    if (!board) return;

    let dragState = null;

    board.addEventListener('pointerdown', (e) => {
      const card = e.target.closest('.pd-kanban-card');
      if (!card) return;

      dragState = {
        el: card,
        id: card.dataset.kanbanId,
        startX: e.clientX,
        startY: e.clientY,
        started: false,
        ghost: null,
      };
    });

    document.addEventListener('pointermove', (e) => {
      if (!dragState) return;
      const dx = Math.abs(e.clientX - dragState.startX);
      const dy = Math.abs(e.clientY - dragState.startY);

      if (!dragState.started && (dx > 5 || dy > 5)) {
        dragState.started = true;
        self._kanbanDragState = dragState;
        const rect = dragState.el.getBoundingClientRect();
        const ghost = dragState.el.cloneNode(true);
        ghost.className = 'pd-kanban-card pd-kanban-ghost';
        ghost.style.cssText = `position:fixed;z-index:9999;width:${rect.width}px;pointer-events:none;opacity:0.9;transform:rotate(2deg);box-shadow:0 8px 24px rgba(0,0,0,0.15);`;
        document.body.appendChild(ghost);
        dragState.ghost = ghost;
        dragState.el.style.opacity = '0.3';
        dragState.offsetX = e.clientX - rect.left;
        dragState.offsetY = e.clientY - rect.top;
      }

      if (dragState.started && dragState.ghost) {
        dragState.ghost.style.left = (e.clientX - dragState.offsetX) + 'px';
        dragState.ghost.style.top = (e.clientY - dragState.offsetY) + 'px';

        // Highlight drop target column
        document.querySelectorAll('.pd-kanban-col-body').forEach(col => col.classList.remove('pd-kanban-col-drop'));
        const colBody = self._findKanbanDropTarget(e.clientX, e.clientY);
        if (colBody) colBody.classList.add('pd-kanban-col-drop');
      }
    });

    document.addEventListener('pointerup', async (e) => {
      if (!dragState) return;
      const state = dragState;
      dragState = null;

      if (!state.started) {
        self._kanbanDragState = null;
        return;
      }

      // Clean up ghost
      if (state.ghost) state.ghost.remove();
      state.el.style.opacity = '';
      document.querySelectorAll('.pd-kanban-col-body').forEach(col => col.classList.remove('pd-kanban-col-drop'));

      // Find target column
      const colBody = self._findKanbanDropTarget(e.clientX, e.clientY);
      if (colBody) {
        const newStatus = colBody.dataset.kanbanDrop;
        const demand = self._demands.find(d => d.id === state.id);
        if (demand && newStatus && !self._kanbanMatch(demand.status, newStatus)) {
          demand.status = newStatus;
          demand.feito = self._isDone(demand);
          try {
            const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
            if (client) {
              await client.from('demands').update({ status: newStatus, feito: demand.feito }).eq('id', demand.id);
            }
          } catch (err) { console.error('[PD] kanban drag error:', err); }
          // Re-render kanban
          const container = document.getElementById('pdTabContent');
          if (container) {
            container.innerHTML = self._renderKanbanTab();
            self._bindKanbanEvents();
            if (typeof lucide !== 'undefined') lucide.createIcons();
          }
          self._updateTopBarProgress();
        }
      }
      setTimeout(() => { self._kanbanDragState = null; }, 50);
    });
  },

  _findKanbanDropTarget(x, y) {
    const cols = document.querySelectorAll('.pd-kanban-col-body');
    for (const col of cols) {
      const rect = col.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return col;
      }
    }
    return null;
  },

  // ═══════════════════════════════════════════════════
  // TAB 5: GANTT (TIMELINE)
  // ═══════════════════════════════════════════════════

  _renderGanttTab() {
    const withDates = this._demands.filter(d => d.due_date || d.due_date_end);
    const noDates = this._demands.filter(d => !d.due_date && !d.due_date_end);

    if (withDates.length === 0) {
      return `<div class="pd-gantt-empty">
        <i data-lucide="gantt-chart" style="width:32px;height:32px;opacity:0.3;"></i>
        <p>Nenhuma tarefa com datas definidas.</p>
        <p style="font-size:0.78rem;color:var(--text-muted);">Defina datas nas tarefas para visualizar o cronograma.</p>
      </div>`;
    }

    const allDates = withDates.flatMap(d => [d.due_date, d.due_date_end].filter(Boolean));
    const minDate = new Date(allDates.reduce((a, b) => a < b ? a : b));
    const maxDate = new Date(allDates.reduce((a, b) => a > b ? a : b));
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 14);

    const totalDays = Math.ceil((maxDate - minDate) / 86400000);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayOffset = Math.max(0, Math.ceil((today - minDate) / 86400000));
    const todayPct = (todayOffset / totalDays * 100).toFixed(2);

    const months = this._ganttMonths(minDate, maxDate);

    const ROW_H = 36;
    const LABEL_W = 220;

    // Rows grouped by section
    let rowsHtml = '';
    let rowIdx = 0;
    const assigned = new Set();

    for (const section of this._SECTIONS) {
      const sectionDemands = withDates.filter(d => {
        if (assigned.has(d.id)) return false;
        const match = section.statuses.some(s => (d.status || '').toLowerCase() === s.toLowerCase());
        if (match) assigned.add(d.id);
        return match;
      });
      if (sectionDemands.length === 0) continue;

      rowsHtml += `<div class="pd-gantt-group-header">${this._esc(section.label)} <span class="pd-gantt-group-count">${sectionDemands.length}</span></div>`;
      sectionDemands.forEach(d => {
        rowsHtml += this._renderGanttRow(d, minDate, totalDays, ROW_H, LABEL_W, rowIdx++);
      });
    }

    const remaining = withDates.filter(d => !assigned.has(d.id));
    if (remaining.length > 0) {
      rowsHtml += `<div class="pd-gantt-group-header">Outros <span class="pd-gantt-group-count">${remaining.length}</span></div>`;
      remaining.forEach(d => {
        rowsHtml += this._renderGanttRow(d, minDate, totalDays, ROW_H, LABEL_W, rowIdx++);
      });
    }

    const monthHeaders = months.map(m => `
      <div class="pd-gantt-month" style="left:${m.left.toFixed(2)}%;width:${m.width.toFixed(2)}%;">${m.label}</div>
    `).join('');

    const ticks = [];
    for (let d = 7; d < totalDays; d += 7) {
      ticks.push(`<div class="pd-gantt-tick" style="left:${(d / totalDays * 100).toFixed(2)}%;"></div>`);
    }

    return `
      <div class="pd-gantt-wrap">
        <div class="pd-gantt-header-row">
          <div class="pd-gantt-header-label" style="width:${LABEL_W}px;min-width:${LABEL_W}px;">Tarefa</div>
          <div class="pd-gantt-header-track">
            ${monthHeaders}
            ${ticks.join('')}
            ${todayOffset > 0 && todayOffset < totalDays
              ? `<div class="pd-gantt-today" style="left:${todayPct}%;" title="Hoje"></div>` : ''}
          </div>
        </div>
        <div class="pd-gantt-body" id="pdGanttBody">
          ${rowsHtml}
          ${noDates.length > 0 ? `<div class="pd-gantt-no-dates">
            <i data-lucide="info" style="width:13px;height:13px;"></i>
            ${noDates.length} tarefa(s) sem datas nao exibidas
          </div>` : ''}
        </div>
      </div>
    `;
  },

  _renderGanttRow(d, minDate, totalDays, ROW_H, LABEL_W, rowIdx) {
    const start = d.due_date ? new Date(d.due_date + 'T00:00:00') : new Date(d.due_date_end + 'T00:00:00');
    const end = d.due_date_end ? new Date(d.due_date_end + 'T23:59:59') : new Date((d.due_date || d.due_date_end) + 'T23:59:59');
    const statusColors = this._DEMAND_STATUS_COLORS[d.status] || { color: '#6b7280' };
    const isLate = this._isLate(d);
    const barColor = isLate ? '#ef4444' : statusColors.color;

    const left = ((start - minDate) / 86400000 / totalDays * 100).toFixed(2);
    const width = Math.max(0.5, ((end - start) / 86400000 / totalDays * 100)).toFixed(2);

    return `
      <div class="pd-gantt-row ${rowIdx % 2 === 1 ? 'pd-gantt-row-alt' : ''}" style="height:${ROW_H}px;" data-gantt-id="${d.id}">
        <div class="pd-gantt-label" style="width:${LABEL_W}px;min-width:${LABEL_W}px;">
          <span class="pd-gantt-label-name" title="${this._esc(d.title)}">${this._esc(d.title)}</span>
          ${d.responsible ? `<span class="pd-gantt-label-resp">${this._esc(d.responsible)}</span>` : ''}
        </div>
        <div class="pd-gantt-track">
          <div class="pd-gantt-bar" style="left:${left}%;width:${width}%;background:${barColor};opacity:0.85;"
               title="${this._esc(d.title)} - ${this._fmtDate(d.due_date)} → ${this._fmtDate(d.due_date_end || d.due_date)}">
            <span class="pd-gantt-bar-label">${this._esc(d.title)}</span>
          </div>
        </div>
      </div>
    `;
  },

  _ganttMonths(minDate, maxDate) {
    const months = [];
    const totalDays = (maxDate - minDate) / 86400000;
    let cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (cur <= maxDate) {
      const mStart = new Date(Math.max(cur, minDate));
      const mEnd = new Date(Math.min(new Date(cur.getFullYear(), cur.getMonth() + 1, 0), maxDate));
      const left = (mStart - minDate) / 86400000 / totalDays * 100;
      const width = (mEnd - mStart + 86400000) / 86400000 / totalDays * 100;
      months.push({
        label: cur.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        left, width
      });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
    return months;
  },

  _bindGanttEvents() {
    const self = this;

    // Scroll today into view
    const todayEl = document.querySelector('.pd-gantt-today');
    if (todayEl) {
      setTimeout(() => {
        const wrap = document.querySelector('.pd-gantt-wrap');
        if (wrap && todayEl) {
          const pct = parseFloat(todayEl.style.left) / 100;
          const scrollTo = pct * wrap.scrollWidth - wrap.clientWidth / 2;
          wrap.scrollLeft = Math.max(0, scrollTo);
        }
      }, 100);
    }

    // Row click -> open drawer
    document.querySelectorAll('.pd-gantt-row[data-gantt-id]').forEach(row => {
      row.addEventListener('click', () => {
        const demand = self._demands.find(d => d.id === row.dataset.ganttId);
        if (demand && typeof TBO_DEMAND_DRAWER !== 'undefined') {
          TBO_DEMAND_DRAWER.open(demand, self._project);
        }
      });
    });
  },

  // ═══════════════════════════════════════════════════
  // RE-RENDER TASKS (partial)
  // ═══════════════════════════════════════════════════

  _reRenderTasks() {
    if (this._activeTab !== 'lista') return;
    // Abort any active task drag before re-rendering
    if (this._taskDragState && this._taskDragState.started) {
      this._taskDragCleanup(this._taskDragState);
      this._taskDragState = null;
    }
    this._taskDragBound = false;
    const tasksContainer = document.querySelector('.pd-tasks');
    if (!tasksContainer) return;

    const totalDemands = this._demands.length;
    const doneDemands = this._demands.filter(d => this._isDone(d)).length;

    tasksContainer.innerHTML = `
      ${this._renderTableHeader()}
      ${this._renderSections()}
    `;

    this._bindListEvents();
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Update progress bar in top bar
    this._updateTopBarProgress();
  },

  _updateTopBarProgress() {
    const totalDemands = this._demands.length;
    const doneDemands = this._demands.filter(d => this._isDone(d)).length;
    const progressPct = totalDemands > 0 ? Math.round((doneDemands / totalDemands) * 100) : 0;
    const info = this._statusInfo(this._project?.status);
    const barFill = document.querySelector('.pd-progress-bar-fill');
    if (barFill) { barFill.style.width = progressPct + '%'; barFill.style.background = info.color; }
    const progressLabel = document.querySelector('.pd-progress-label');
    if (progressLabel) progressLabel.textContent = progressPct + '%';
    const progressWrapper = document.querySelector('.pd-topbar-progress');
    if (progressWrapper) progressWrapper.title = `${doneDemands}/${totalDemands} concluidas (${progressPct}%)`;
  },

  // ═══════════════════════════════════════════════════
  // ERROR
  // ═══════════════════════════════════════════════════

  _renderError(msg) {
    const el = document.getElementById('projectDetail');
    if (el) {
      el.innerHTML = `
        <div class="pd-error">
          <i data-lucide="alert-circle" style="width:24px;height:24px;color:#ef4444;"></i>
          <span>Erro: ${this._esc(msg)}</span>
          <button class="pd-back-btn" onclick="TBO_ROUTER.navigate('quadro-projetos')" style="margin-top:12px;">
            <i data-lucide="arrow-left" style="width:14px;height:14px;"></i>
            Voltar ao Quadro
          </button>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  // ═══════════════════════════════════════════════════
  // UTILS
  // ═══════════════════════════════════════════════════

  _isDone(d) {
    if (!d) return false;
    const s = (d.status || '').toLowerCase();
    return s === 'concluido' || s === 'concluído' || s === 'finalizado' || s === 'done' || !!d.feito;
  },

  _statusInfo(status) {
    return this._STATUS[status] || { label: status, color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: 'circle' };
  },

  _parseBus(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
  },

  _esc(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  _fmtDate(iso) {
    if (!iso) return '\u2014';
    try {
      const d = new Date(iso.slice(0, 10) + 'T12:00:00');
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch { return iso.slice(0, 10); }
  },

  _initials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  },

  _isLate(d) {
    if (!d.due_date) return false;
    if (this._isDone(d)) return false;
    return new Date(d.due_date) < new Date();
  },

  destroy() {
    this._destroyTabState();
    this._closeContextMenu();
    this._closeColContextMenu();
    this._closeSectionContextMenu();
    this._project = null;
    this._demands = [];
    this._params = null;
    this._loaded = false;
    this._dragEl = null;
    this._dragType = null;
    this._dragColKey = null;
    this._dragActive = false;
    this._columnOrder = null;
    this._sectionOverrides = {};
    this._taskDragState = null;
    this._taskDragBound = false;
    this._activeTab = 'lista';
    // Reset hidden state to defaults
    this._COLUMNS.forEach(c => c.hidden = false);
  },

  init() {}
};
