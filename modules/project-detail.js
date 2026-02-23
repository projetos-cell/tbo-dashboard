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
  _dragEl: null,        // element being dragged
  _dragType: null,      // 'task', 'section', or 'column'
  _dragColKey: null,    // column key being dragged
  _globalsBound: false, // track global listeners to avoid duplicates

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

  _renderPage() {
    const p = this._project;
    if (!p) return '';
    const info = this._statusInfo(p.status);
    const bus = this._parseBus(p.bus);
    const totalDemands = this._demands.length;
    const doneDemands = this._demands.filter(d => this._isDone(d)).length;
    const progressPct = totalDemands > 0 ? Math.round((doneDemands / totalDemands) * 100) : 0;

    return `
      <div class="pd-topbar">
        <button class="pd-back-btn" onclick="TBO_ROUTER.navigate('quadro-projetos')">
          <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
          <span>Quadro de Projetos</span>
        </button>
      </div>

      <div class="pd-header">
        <div class="pd-header-main">
          <div class="pd-header-top">
            <span class="pd-status-pill" style="background:${info.bg};color:${info.color};">
              <i data-lucide="${info.icon}" style="width:13px;height:13px;"></i>
              ${info.label}
            </span>
            ${p.code ? `<span class="pd-code">${this._esc(p.code)}</span>` : ''}
          </div>
          <h1 class="pd-title">${this._esc(p.name)}</h1>
          <div class="pd-header-meta">
            ${p.construtora ? `<div class="pd-meta-item"><i data-lucide="building-2" style="width:13px;height:13px;"></i><span>${this._esc(p.construtora)}</span></div>` : ''}
            ${p.owner_name ? `<div class="pd-meta-item"><i data-lucide="user" style="width:13px;height:13px;"></i><span>${this._esc(p.owner_name)}</span></div>` : ''}
            ${(p.due_date_start || p.due_date_end) ? `<div class="pd-meta-item"><i data-lucide="calendar" style="width:13px;height:13px;"></i><span>${p.due_date_start ? this._fmtDate(p.due_date_start) : '?'} &rarr; ${p.due_date_end ? this._fmtDate(p.due_date_end) : '?'}</span></div>` : ''}
            ${bus.length > 0 ? `<div class="pd-meta-item pd-meta-bus">${bus.map(b => { const bc = this._BU_COLORS[b] || { bg: '#f3f4f6', color: '#374151' }; return `<span class="pd-bu-tag" style="background:${bc.bg};color:${bc.color};">${b}</span>`; }).join('')}</div>` : ''}
            ${p.notion_url ? `<a href="${p.notion_url}" target="_blank" class="pd-meta-item pd-notion-link" onclick="event.stopPropagation()"><i data-lucide="external-link" style="width:13px;height:13px;"></i><span>Notion</span></a>` : ''}
          </div>
        </div>
        <div class="pd-header-stats">
          <div class="pd-progress-ring">
            <svg viewBox="0 0 36 36" class="pd-ring-svg">
              <path class="pd-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path class="pd-ring-fill" stroke="${info.color}" stroke-dasharray="${progressPct}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
            <div class="pd-ring-text">${progressPct}%</div>
          </div>
          <div class="pd-stats-text">
            <span class="pd-stats-done">${doneDemands}/${totalDemands}</span>
            <span class="pd-stats-label">concluidas</span>
          </div>
        </div>
      </div>

      ${p.notes ? `<div class="pd-description"><div class="pd-description-label"><i data-lucide="file-text" style="width:14px;height:14px;"></i> Descricao</div><div class="pd-description-text">${this._esc(p.notes)}</div></div>` : ''}

      <div class="pd-tasks">
        <div class="pd-tasks-header">
          <div class="pd-tasks-title">
            <i data-lucide="list-checks" style="width:16px;height:16px;"></i>
            Tarefas
            <span class="pd-tasks-count">${totalDemands}</span>
          </div>
        </div>
        ${this._renderTableHeader()}
        ${this._renderSections()}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════
  // TABLE HEADER (Notion-style)
  // ═══════════════════════════════════════════════════

  _renderTableHeader() {
    let html = '<div class="pd-table-header">';

    // Fixed columns: drag (no label)
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

    for (const section of this._SECTIONS) {
      const sectionDemands = demands.filter(d => {
        if (assigned.has(d.id)) return false;
        const match = section.statuses.some(s => (d.status || '').toLowerCase() === s.toLowerCase());
        if (match) assigned.add(d.id);
        return match;
      });
      html += this._renderSection(section, sectionDemands);
    }

    const remaining = demands.filter(d => !assigned.has(d.id));
    if (remaining.length > 0) {
      html += this._renderSection({ key: 'outros', label: 'Outros', icon: 'circle', statuses: [] }, remaining);
    }

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
        <div class="pd-td pd-td-drag" data-col="drag">
          <div class="pd-drag-handle pd-task-drag" title="Arrastar tarefa"><i data-lucide="grip-vertical"></i></div>
        </div>
        <div class="pd-td pd-td-check" data-col="check">
          <span class="pd-check ${isDone ? 'pd-checked' : ''}" style="border-color:${statusColors.color};${isDone ? `background:${statusColors.color};` : ''}">
            ${isDone ? '<i data-lucide="check" style="width:10px;height:10px;color:#fff;"></i>' : ''}
          </span>
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
    this._bindLocalEvents();
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

    // Close context menus on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
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
  _bindLocalEvents() {
    const self = this;

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
            demand.status = newStatus;
            demand.feito = newFeito;
            self._reRenderTasks();
          }
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
          } else {
            // Fallback: add locally with temp ID
            newDemand.id = 'temp_' + Date.now();
            self._demands.unshift(newDemand);
          }
        } else {
          newDemand.id = 'temp_' + Date.now();
          self._demands.unshift(newDemand);
        }
      } catch (e) {
        console.error('[PD] inline add-task error:', e);
        newDemand.id = 'temp_' + Date.now();
        self._demands.unshift(newDemand);
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
  //
  // Strategy: Elements are NOT draggable by default.
  // We set draggable="true" on mousedown of the drag handle,
  // and remove it on mouseup/dragend.

  _bindDragHandles() {
    const self = this;

    // ── Task row drag handles ────────────────────────
    document.querySelectorAll('.pd-task-drag').forEach(handle => {
      const row = handle.closest('.pd-task-row');
      if (!row) return;

      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        row.setAttribute('draggable', 'true');
        self._dragType = 'task';
      });

      row.addEventListener('dragstart', (e) => {
        if (self._dragType !== 'task') { e.preventDefault(); return; }
        self._dragEl = row;
        row.classList.add('pd-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', row.dataset.demandId || '');
        if (e.dataTransfer.setDragImage) {
          e.dataTransfer.setDragImage(row, 20, 20);
        }
      });

      row.addEventListener('dragend', () => {
        row.classList.remove('pd-dragging');
        row.removeAttribute('draggable');
        self._clearDropIndicators();
        self._dragEl = null;
        self._dragType = null;
      });

      row.addEventListener('dragover', (e) => {
        if (self._dragType !== 'task' || self._dragEl === row) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        self._clearDropIndicators();
        const rect = row.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        row.classList.add(e.clientY < midY ? 'pd-drop-above' : 'pd-drop-below');
      });

      row.addEventListener('dragleave', () => {
        row.classList.remove('pd-drop-above', 'pd-drop-below');
      });

      row.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (self._dragType !== 'task' || !self._dragEl || self._dragEl === row) {
          self._clearDropIndicators();
          return;
        }
        const rect = row.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const parent = row.parentNode;
        if (e.clientY < midY) {
          parent.insertBefore(self._dragEl, row);
        } else {
          parent.insertBefore(self._dragEl, row.nextSibling);
        }
        self._clearDropIndicators();
        self._syncDemandOrderFromDOM();
      });
    });

    // Cleanup draggable on mouseup
    document.addEventListener('mouseup', () => {
      document.querySelectorAll('.pd-task-row[draggable]').forEach(r => r.removeAttribute('draggable'));
      document.querySelectorAll('.pd-section[draggable]').forEach(s => s.removeAttribute('draggable'));
    });

    // ── Section drag handles ─────────────────────────
    document.querySelectorAll('.pd-section-drag').forEach(handle => {
      const section = handle.closest('.pd-section');
      if (!section) return;

      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        section.setAttribute('draggable', 'true');
        self._dragType = 'section';
      });

      section.addEventListener('dragstart', (e) => {
        if (self._dragType !== 'section') { e.preventDefault(); return; }
        self._dragEl = section;
        section.classList.add('pd-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', section.dataset.section || '');
      });

      section.addEventListener('dragend', () => {
        section.classList.remove('pd-dragging');
        section.removeAttribute('draggable');
        self._clearDropIndicators();
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

    // ── Drop on section body ──
    document.querySelectorAll('.pd-section-body').forEach(body => {
      body.addEventListener('dragover', (e) => {
        if (self._dragType !== 'task') return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      body.addEventListener('drop', (e) => {
        if (self._dragType !== 'task' || !self._dragEl) return;
        e.preventDefault();
        if (!e.target.closest('.pd-task-row')) {
          body.appendChild(self._dragEl);
          self._clearDropIndicators();
          self._syncDemandOrderFromDOM();
        }
      });
    });
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

  _syncDemandOrderFromDOM() {
    const rows = document.querySelectorAll('.pd-task-row[data-demand-id]');
    const newOrder = [];
    rows.forEach(row => {
      const d = this._demands.find(dd => dd.id === row.dataset.demandId);
      if (d) newOrder.push(d);
    });
    this._demands.forEach(d => {
      if (!newOrder.find(nd => nd.id === d.id)) newOrder.push(d);
    });
    this._demands = newOrder;
  },

  // ═══════════════════════════════════════════════════
  // RE-RENDER TASKS (partial)
  // ═══════════════════════════════════════════════════

  _reRenderTasks() {
    const tasksContainer = document.querySelector('.pd-tasks');
    if (!tasksContainer) return;

    const totalDemands = this._demands.length;
    const doneDemands = this._demands.filter(d => this._isDone(d)).length;

    tasksContainer.innerHTML = `
      <div class="pd-tasks-header">
        <div class="pd-tasks-title">
          <i data-lucide="list-checks" style="width:16px;height:16px;"></i>
          Tarefas
          <span class="pd-tasks-count">${totalDemands}</span>
        </div>
      </div>
      ${this._renderTableHeader()}
      ${this._renderSections()}
    `;

    this._bindLocalEvents();
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Update progress ring
    const progressPct = totalDemands > 0 ? Math.round((doneDemands / totalDemands) * 100) : 0;
    const ringFill = document.querySelector('.pd-ring-fill');
    if (ringFill) ringFill.setAttribute('stroke-dasharray', `${progressPct}, 100`);
    const ringText = document.querySelector('.pd-ring-text');
    if (ringText) ringText.textContent = progressPct + '%';
    const statsDone = document.querySelector('.pd-stats-done');
    if (statsDone) statsDone.textContent = `${doneDemands}/${totalDemands}`;
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
    this._columnOrder = null;
    // Reset hidden state to defaults
    this._COLUMNS.forEach(c => c.hidden = false);
  },

  init() {}
};
