// TBO OS — Module: Quadro de Projetos
// Board view com dados do Supabase (projects + demands/Notion sync)
const TBO_QUADRO_PROJETOS = {

  _data: { projects: [], demands: [] },
  _filters: { status: 'all', construtora: '', bus: '', search: '' },
  _view: 'board',   // 'board' | 'list' | 'gantt'
  _listSort: { col: 'name', dir: 'asc' },
  _loaded: false,

  // ── Board column config (dynamic, persisted in localStorage) ──────────────
  _boardColumns: null,
  _sortableCards: [],
  _sortableBoard: null,
  _BOARD_STORAGE_KEY: 'tbo_qp_board_columns',

  // ── Status config ──────────────────────────────────────────────────────────
  _STATUS: {
    em_andamento: { label: 'Em Andamento', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: 'play-circle' },
    producao:     { label: 'Em Produção',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: 'zap' },
    em_revisao:   { label: 'Em Revisão',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: 'eye' },
    finalizado:   { label: 'Finalizado',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: 'check-circle-2' },
    parado:       { label: 'Parado',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: 'pause-circle' },
    pausado:      { label: 'Pausado',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: 'clock' },
  },

  // ── BU badge colors ────────────────────────────────────────────────────────
  _BU_COLORS: {
    'Branding':    { bg: '#fef3c7', color: '#92400e' },
    'Digital 3D':  { bg: '#ede9fe', color: '#5b21b6' },
    'Marketing':   { bg: '#d1fae5', color: '#065f46' },
    'Audiovisual': { bg: '#fce7f3', color: '#9d174d' },
    'Interiores':  { bg: '#e0f2fe', color: '#0c4a6e' },
  },

  // ── Entry point ────────────────────────────────────────────────────────────
  render() {
    this._loaded = false;
    setTimeout(() => this._load(), 0);
    return `
      <div class="quadro-projetos-module" id="quadroProjetos">
        <div id="qpKpis" class="qp-kpis">
          ${this._renderKpiSkeleton()}
        </div>
        <div id="qpContent" class="qp-content">
          ${this._renderLoadingSkeleton()}
        </div>
      </div>
    `;
  },

  /** Called by router when navigating away — cleans up the context toolbar */
  destroy() {
    this._destroySortables();
    if (typeof TBO_CONTEXT_TOOLBAR !== 'undefined') TBO_CONTEXT_TOOLBAR.clear();
  },

  async _load() {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) {
      document.getElementById('qpContent').innerHTML = this._renderError('Supabase não disponível');
      return;
    }

    // Obter tenant_id via async para garantir resolução (mesmo padrão de outros módulos)
    let tid = null;
    try {
      if (typeof RepoBase !== 'undefined' && RepoBase.resolveTenantId) {
        tid = await RepoBase.resolveTenantId();
      } else if (typeof RepoBase !== 'undefined' && RepoBase.requireTenantId) {
        tid = RepoBase.requireTenantId();
      } else if (typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.getCurrentTenantId) {
        tid = TBO_SUPABASE.getCurrentTenantId();
      }
    } catch (_e) { /* sem tenant_id — RLS vai filtrar pelo auth */ }

    try {
      const FULL_COLS  = 'id,name,status,construtora,bus,owner_name,due_date_start,due_date_end,notion_url,code,notion_page_id,tenant_id';
      const BASIC_COLS = 'id,name,status,owner_name,tenant_id';

      let projRes = null;
      let q1 = client.from('projects').select(FULL_COLS).order('name');
      if (tid) q1 = q1.eq('tenant_id', tid);
      projRes = await q1;

      if (projRes.error && (
        projRes.error.code === 'PGRST204' ||
        projRes.error.message?.includes('schema cache') ||
        projRes.error.message?.includes('column') ||
        projRes.error.message?.includes('does not exist')
      )) {
        console.warn('[TBO QP] Colunas completas indisponíveis, usando básicas:', projRes.error.message);
        let q2 = client.from('projects').select(BASIC_COLS).order('name');
        if (tid) q2 = q2.eq('tenant_id', tid);
        projRes = await q2;
      }

      if (projRes.error) throw projRes.error;
      this._data.projects = projRes.data || [];

      try {
        let demQuery = client.from('demands')
          .select('id,title,status,due_date,responsible,bus,project_id,notion_url')
          .order('due_date', { ascending: true });
        if (tid) demQuery = demQuery.eq('tenant_id', tid);
        const demRes = await demQuery;
        this._data.demands = demRes.error ? [] : (demRes.data || []);
        if (demRes.error) console.warn('[TBO QP] demands não disponível:', demRes.error.message);
      } catch (_e) {
        this._data.demands = [];
      }

      this._loaded = true;
      this._renderToolbar();
      this._renderKpis();
      this._renderContent();
      this._bindContentEvents();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
      console.error('[TBO QP] Load error:', err);
      document.getElementById('qpContent').innerHTML = this._renderError(err.message || 'Erro ao carregar dados');
    }
  },

  // ── Filters & helpers ──────────────────────────────────────────────────────
  _filtered() {
    const { status, construtora, bus, search } = this._filters;
    return this._data.projects.filter(p => {
      if (status !== 'all' && p.status !== status) return false;
      if (construtora && p.construtora !== construtora) return false;
      if (bus) {
        const pBus = this._parseBus(p.bus);
        if (!pBus.includes(bus)) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (!(p.name||'').toLowerCase().includes(q) && !(p.construtora||'').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  },

  _demandsForProject(projectId) {
    return this._data.demands.filter(d => d.project_id === projectId);
  },

  _parseBus(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
  },

  _statusInfo(status) {
    if (this._STATUS[status]) return this._STATUS[status];
    // Check dynamic board columns for custom statuses
    if (this._boardColumns) {
      const col = this._boardColumns.find(c => c.key === status);
      if (col) return { label: col.label, color: col.color, bg: this._hexToRgba(col.color, 0.12), icon: col.icon || 'circle' };
    }
    return { label: status, color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: 'circle' };
  },

  _hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  },

  // ── Board column persistence (localStorage) ──────────────────────────────
  _getStorageKey() {
    let tid = '';
    try {
      if (typeof RepoBase !== 'undefined' && RepoBase.requireTenantId) tid = RepoBase.requireTenantId();
    } catch (_e) { /* ignore */ }
    return this._BOARD_STORAGE_KEY + (tid ? '_' + tid : '');
  },

  _loadBoardColumns() {
    const defaults = [
      { key: 'parado',       label: 'Parado',        color: '#ef4444', icon: 'pause-circle' },
      { key: 'em_andamento', label: 'Em Andamento',   color: '#3b82f6', icon: 'play-circle' },
      { key: 'producao',     label: 'Em Produção',    color: '#8b5cf6', icon: 'zap' },
      { key: 'em_revisao',   label: 'Em Revisão',     color: '#f59e0b', icon: 'eye' },
      { key: 'finalizado',   label: 'Finalizado',     color: '#22c55e', icon: 'check-circle-2' },
      { key: 'pausado',      label: 'Pausado',        color: '#f59e0b', icon: 'clock' },
    ];
    try {
      const saved = localStorage.getItem(this._getStorageKey());
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(c => c.key && c.label)) {
          this._boardColumns = parsed;
          return;
        }
      }
    } catch (_e) { /* ignore */ }
    this._boardColumns = defaults;
  },

  _saveBoardColumns() {
    try { localStorage.setItem(this._getStorageKey(), JSON.stringify(this._boardColumns)); } catch (_e) { /* ignore */ }
  },

  // ── Context Toolbar (via TBO_CONTEXT_TOOLBAR) ─────────────────────────────
  _renderToolbar() {
    if (typeof TBO_CONTEXT_TOOLBAR === 'undefined') return;

    // Dynamic construtora options from loaded data
    const construtoras = [...new Set(this._data.projects.map(p => p.construtora).filter(Boolean))].sort();
    const construtoraOpts = [{ value: '', label: 'Todas as construtoras' }]
      .concat(construtoras.map(c => ({ value: c, label: c })));

    TBO_CONTEXT_TOOLBAR.render({
      moduleId: 'quadro-projetos',
      title: 'Quadro de Projetos',
      icon: 'layout-dashboard',
      filters: [
        { id: 'search', type: 'text', label: 'Buscar projeto...', value: this._filters.search, debounceMs: 300 },
        { id: 'status', type: 'select', label: 'Status', value: this._filters.status, options: [
          { value: 'all', label: 'Todos os status' },
          { value: 'em_andamento', label: 'Em Andamento' },
          { value: 'producao', label: 'Em Produção' },
          { value: 'em_revisao', label: 'Em Revisão' },
          { value: 'parado', label: 'Parado' },
          { value: 'pausado', label: 'Pausado' },
          { value: 'finalizado', label: 'Finalizado' },
        ]},
        { id: 'bus', type: 'select', label: 'BU', value: this._filters.bus, options: [
          { value: '', label: 'Todas as BUs' },
          { value: 'Branding', label: 'Branding' },
          { value: 'Digital 3D', label: 'Digital 3D' },
          { value: 'Marketing', label: 'Marketing' },
          { value: 'Audiovisual', label: 'Audiovisual' },
          { value: 'Interiores', label: 'Interiores' },
        ]},
        { id: 'construtora', type: 'select', label: 'Construtora', value: this._filters.construtora, options: construtoraOpts },
      ],
      viewModes: [
        { id: 'board', label: 'Quadro Kanban', icon: 'layout-grid' },
        { id: 'list',  label: 'Lista',         icon: 'list' },
        { id: 'gantt', label: 'Gantt / Timeline', icon: 'gantt-chart' },
      ],
      activeView: this._view,
      actions: [
        { id: 'new-project', label: 'Novo Projeto', icon: 'plus', variant: 'primary', onClick: () => this._openNewProjectDialog() },
      ],
      extraActions: [
        { id: 'density', icon: 'rows-3', variant: 'ghost', tooltip: 'Alternar densidade',
          onClick: () => { if (typeof TBO_UX_IMPROVEMENTS !== 'undefined') TBO_UX_IMPROVEMENTS.toggleDensity(); }
        },
      ],
      onFilterChange: (filterId, value) => {
        this._filters[filterId] = value;
        this._renderContent();
        if (typeof lucide !== 'undefined') lucide.createIcons();
      },
      onViewChange: (viewId) => {
        this._view = viewId;
        this._renderContent();
        if (typeof lucide !== 'undefined') lucide.createIcons();
      },
    });
  },

  /** Stub — will open a new-project dialog in a future iteration */
  _openNewProjectDialog() {
    if (typeof TBO_TOAST !== 'undefined') {
      TBO_TOAST.show('Em breve: criação de projetos pelo Quadro', 'info');
    } else {
      alert('Em breve: criação de projetos pelo Quadro');
    }
  },

  // ── KPIs ────────────────────────────────────────────────────────────────────
  _renderKpis() {
    const p = this._data.projects;
    const d = this._data.demands;
    const counts = {
      total: p.length,
      em_andamento: p.filter(x => x.status === 'em_andamento').length,
      producao: p.filter(x => x.status === 'producao').length,
      finalizado: p.filter(x => x.status === 'finalizado').length,
      parado: p.filter(x => x.status === 'parado' || x.status === 'pausado').length,
    };
    const demandas_total = d.length;
    const demandas_abertas = d.filter(x => x.status !== 'Concluído' && x.status !== 'Cancelado').length;

    const kpis = [
      { label: 'Total Projetos',   value: counts.total,        icon: 'folder',         color: '#6b7280' },
      { label: 'Em Andamento',     value: counts.em_andamento, icon: 'play-circle',     color: '#3b82f6' },
      { label: 'Em Produção',      value: counts.producao,     icon: 'zap',             color: '#8b5cf6' },
      { label: 'Finalizados',      value: counts.finalizado,   icon: 'check-circle-2',  color: '#22c55e' },
      { label: 'Parados/Pausados', value: counts.parado,       icon: 'pause-circle',    color: '#f59e0b' },
      { label: 'Demandas Abertas', value: demandas_abertas,    icon: 'clipboard-list',  color: '#ec4899', sub: `de ${demandas_total}` },
    ];

    const el = document.getElementById('qpKpis');
    if (!el) return;
    el.innerHTML = kpis.map(k => `
      <div class="qp-kpi-card" title="Clique para filtrar por ${k.label}">
        <div class="qp-kpi-icon" style="color:${k.color};">
          <i data-lucide="${k.icon}" style="width:18px;height:18px;"></i>
        </div>
        <div class="qp-kpi-body">
          <div class="qp-kpi-value" style="color:${k.color};">${k.value}</div>
          <div class="qp-kpi-label">${k.label}</div>
          ${k.sub ? `<div class="qp-kpi-sub">${k.sub}</div>` : ''}
        </div>
      </div>
    `).join('');
  },

  // ── Main content ───────────────────────────────────────────────────────────
  _renderContent() {
    const el = document.getElementById('qpContent');
    if (!el) return;
    this._destroySortables();
    if (this._view === 'board') {
      el.innerHTML = this._renderBoard();
      this._initSortableCards();
      this._initSortableColumns();
    } else if (this._view === 'list') {
      el.innerHTML = this._renderList();
    } else if (this._view === 'gantt') {
      el.innerHTML = this._renderGantt();
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (this._view === 'gantt') this._bindGanttScroll();
  },

  // ── BOARD VIEW ─────────────────────────────────────────────────────────────
  _renderBoard() {
    if (!this._boardColumns) this._loadBoardColumns();
    const filtered = this._filtered();
    const configuredKeys = new Set(this._boardColumns.map(c => c.key));

    // Build columns from dynamic config
    const columns = this._boardColumns.map(col => {
      const info = this._statusInfo(col.key);
      const cards = filtered.filter(p => p.status === col.key);
      return { status: col.key, info, cards, config: col };
    });

    // Detect orphan projects (status not in any configured column)
    const orphanStatuses = [...new Set(filtered.map(p => p.status).filter(s => s && !configuredKeys.has(s)))];
    const orphanCards = filtered.filter(p => p.status && !configuredKeys.has(p.status));

    const renderCol = (col, isOrphan) => `
      <div class="qp-column${isOrphan ? ' qp-column-orphan' : ''}" data-status="${col.status}">
        <div class="qp-column-header" style="border-top:3px solid ${col.info.color};">
          ${!isOrphan ? `<div class="qp-column-drag-handle" title="Arrastar para reordenar">
            <i data-lucide="grip-vertical" style="width:12px;height:12px;"></i>
          </div>` : ''}
          <span class="qp-column-title">
            <i data-lucide="${col.info.icon}" style="width:14px;height:14px;color:${col.info.color};"></i>
            <span class="qp-column-title-text">${col.info.label}</span>
          </span>
          <span class="qp-column-count" style="background:${col.info.bg};color:${col.info.color};">${col.cards.length}</span>
          ${!isOrphan ? `<div class="qp-column-header-actions">
            <button class="qp-column-delete-btn" data-status="${col.status}" title="Remover coluna">
              <i data-lucide="trash-2" style="width:12px;height:12px;"></i>
            </button>
          </div>` : ''}
        </div>
        <div class="qp-column-body" id="qpColBody_${col.status}">
          ${col.cards.length === 0
            ? '<div class="qp-empty-col">Nenhum projeto</div>'
            : col.cards.map(p => this._renderProjectCard(p)).join('')}
        </div>
        <div class="qp-column-footer">
          <button class="qp-column-add-card-btn" data-status="${col.status}" title="Novo projeto nesta coluna">
            <i data-lucide="plus" style="width:12px;height:12px;"></i>
            <span style="font-size:0.72rem;">Novo</span>
          </button>
        </div>
      </div>
    `;

    // Orphan column (if any)
    let orphanHtml = '';
    if (orphanCards.length > 0) {
      orphanHtml = renderCol({
        status: '__orphan__',
        info: { label: `Outros (${orphanCards.length})`, color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: 'circle' },
        cards: orphanCards,
      }, true);
    }

    return `
      <div class="qp-board">
        ${columns.map(col => renderCol(col, false)).join('')}
        ${orphanHtml}
        <div class="qp-column qp-column-add">
          <button class="qp-add-column-btn">
            <i data-lucide="plus" style="width:16px;height:16px;"></i>
            Adicionar coluna
          </button>
        </div>
      </div>
    `;
  },

  _renderProjectCard(p) {
    const bus = this._parseBus(p.bus);
    const demands = this._demandsForProject(p.id);
    const openDemands = demands.filter(d => d.status !== 'Concluído' && d.status !== 'Cancelado');
    const due = p.due_date_start ? this._fmtDate(p.due_date_start) : (p.due_date_end ? this._fmtDate(p.due_date_end) : null);
    return `
      <div class="qp-card" data-id="${p.id}" onclick="TBO_QUADRO_PROJETOS._openDetail('${p.id}')">
        <div class="qp-card-header">
          <div class="qp-card-name">${this._esc(p.name)}</div>
          ${p.notion_url ? `<a href="${p.notion_url}" target="_blank" class="qp-notion-link" onclick="event.stopPropagation()" title="Abrir no Notion">
            <i data-lucide="external-link" style="width:12px;height:12px;"></i>
          </a>` : ''}
        </div>
        ${p.construtora ? `<div class="qp-card-construtora">${this._esc(p.construtora)}</div>` : ''}
        <div class="qp-card-meta">
          ${bus.map(b => {
            const bc = this._BU_COLORS[b] || { bg: '#f3f4f6', color: '#374151' };
            return `<span class="qp-bu-tag" style="background:${bc.bg};color:${bc.color};">${b}</span>`;
          }).join('')}
        </div>
        <div class="qp-card-footer">
          <div class="qp-card-info">
            ${p.owner_name ? `<span class="qp-owner"><i data-lucide="user" style="width:11px;height:11px;"></i>${this._esc(p.owner_name)}</span>` : ''}
            ${due ? `<span class="qp-due"><i data-lucide="calendar" style="width:11px;height:11px;"></i>${due}</span>` : ''}
          </div>
          ${demands.length > 0 ? `
            <div class="qp-demands-badge" title="${openDemands.length} demandas abertas / ${demands.length} total">
              <i data-lucide="clipboard-list" style="width:11px;height:11px;"></i>
              <span>${openDemands.length}/${demands.length}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  _renderList() {
    const filtered = this._sortedList(this._filtered());
    if (filtered.length === 0) {
      return typeof TBO_UX_IMPROVEMENTS !== 'undefined'
        ? TBO_UX_IMPROVEMENTS.renderEmptyState('folder-open', 'Nenhum projeto encontrado', 'Tente alterar os filtros ou criar um novo projeto.', 'Limpar filtros', "document.getElementById('qpFilterStatus').value='all';document.getElementById('qpFilterStatus').dispatchEvent(new Event('change'))")
        : `<div class="qp-empty">Nenhum projeto encontrado.</div>`;
    }

    const groups = this._groupProjectsByStatus(filtered);

    return `
      <div class="qp-list">
        ${this._renderProjectSectionList(groups)}
      </div>
    `;
  },

  _sortList(col) {
    if (this._listSort.col === col) {
      this._listSort.dir = this._listSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      this._listSort.col = col;
      this._listSort.dir = 'asc';
    }
    this._renderContent();
  },

  _sortedList(projects) {
    const { col, dir } = this._listSort;
    return [...projects].sort((a, b) => {
      let va = a[col] ?? '';
      let vb = b[col] ?? '';
      if (col === 'bus') {
        va = this._parseBus(va).join(',');
        vb = this._parseBus(vb).join(',');
      }
      if (col === 'status') {
        const order = ['em_andamento','producao','pausado','parado','finalizado'];
        va = order.indexOf(va); vb = order.indexOf(vb);
      }
      const cmp = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'pt-BR', { sensitivity: 'base' });
      return dir === 'asc' ? cmp : -cmp;
    });
  },

  // ── Section grouping for list view ──────────────────────────────────────────
  _SECTION_ORDER: ['em_andamento', 'producao', 'finalizado', 'parado'],

  _SECTION_LABELS: {
    em_andamento: 'Em Andamento',
    producao:     'Em Produção',
    finalizado:   'Finalizados',
    parado:       'Parados/Pausados',
  },

  _groupProjectsByStatus(projects) {
    const groups = {};
    this._SECTION_ORDER.forEach(key => { groups[key] = []; });

    projects.forEach(p => {
      const s = p.status || '';
      if (s === 'pausado' || s === 'parado') {
        groups['parado'].push(p);
      } else if (groups[s]) {
        groups[s].push(p);
      } else {
        // Unknown status — put in first group
        groups[this._SECTION_ORDER[0]].push(p);
      }
    });

    return groups;
  },

  _renderProjectSectionList(groups) {
    return this._SECTION_ORDER
      .filter(key => groups[key] && groups[key].length > 0)
      .map(key => this._renderProjectSection(key, groups[key]))
      .join('');
  },

  _renderProjectSection(sectionKey, projects) {
    const label = this._SECTION_LABELS[sectionKey] || sectionKey;
    const info = this._statusInfo(sectionKey);

    const th = (col, colLabel) => {
      const active = this._listSort.col === col;
      const dir = active ? this._listSort.dir : 'none';
      const arrow = dir === 'asc' ? '↑' : dir === 'desc' ? '↓' : '';
      return `<th class="qp-th-sortable ${active ? 'qp-th-active' : ''}"
                  onclick="TBO_QUADRO_PROJETOS._sortList('${col}')">
                ${colLabel} <span class="qp-sort-arrow">${arrow}</span>
              </th>`;
    };

    return `
      <section class="project-section">
        <div class="project-section-header">
          <span class="project-section-dot" style="background:${info.color};"></span>
          <span class="project-section-title">${label}</span>
          <span class="project-section-count" style="background:${info.bg};color:${info.color};">${projects.length}</span>
        </div>
        <div class="project-section-list">
          <table class="qp-table">
            <thead>
              <tr>
                <th style="width:32px;"></th>
                ${th('name',        'Projeto')}
                ${th('construtora', 'Construtora')}
                ${th('status',      'Status')}
                ${th('bus',         'BUs')}
                ${th('owner_name',  'Responsável')}
                ${th('due_date_end','Prazo')}
                <th>Demandas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${projects.map(p => this._renderListRow(p)).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  _renderListRow(p) {
    const bus = this._parseBus(p.bus);
    const demands = this._demandsForProject(p.id);
    const openDemands = demands.filter(d => d.status !== 'Concluído' && d.status !== 'Cancelado');
    const info = this._statusInfo(p.status);
    const dueEnd = p.due_date_end ? this._fmtDate(p.due_date_end) : '—';
    const isLate = p.due_date_end && new Date(p.due_date_end) < new Date() && p.status !== 'finalizado';
    const dueRaw = p.due_date_end || '';

    const statusOptions = Object.entries(this._STATUS).map(([k, v]) =>
      `<option value="${k}" ${p.status === k ? 'selected' : ''}>${v.label}</option>`
    ).join('');

    const buOptions = Object.keys(this._BU_COLORS).map(b => {
      const selected = bus.includes(b) ? 'selected' : '';
      return `<option value="${b}" ${selected}>${b}</option>`;
    }).join('');

    return `
      <tr class="qp-row" data-project-id="${p.id}">
        <td class="qp-row-check"><input type="checkbox" class="uxi-bulk-checkbox" data-id="${p.id}"></td>
        <td class="qp-row-name">
          <span class="qp-editable-text" data-field="name" data-id="${p.id}" title="Clique para editar">${this._esc(p.name)}</span>
          ${p.code ? `<span class="qp-row-code">${p.code}</span>` : ''}
        </td>
        <td>
          <span class="qp-editable-text" data-field="construtora" data-id="${p.id}" title="Clique para editar">${this._esc(p.construtora || '—')}</span>
        </td>
        <td>
          <select class="qp-inline-select qp-inline-status" data-field="status" data-id="${p.id}">
            ${statusOptions}
          </select>
        </td>
        <td>
          <select class="qp-inline-select qp-inline-bus" data-field="bus" data-id="${p.id}" multiple>
            ${buOptions}
          </select>
        </td>
        <td>
          <span class="qp-editable-text" data-field="owner_name" data-id="${p.id}" title="Clique para editar">${this._esc(p.owner_name || '—')}</span>
        </td>
        <td class="${isLate ? 'qp-late' : ''}">
          <input type="date" class="qp-inline-date" data-field="due_date_end" data-id="${p.id}" value="${dueRaw}">
        </td>
        <td>
          ${demands.length > 0
            ? `<span class="qp-demands-pill qp-demands-link" data-id="${p.id}" title="Ver demandas">${openDemands.length}/${demands.length}</span>`
            : '<span style="color:var(--text-muted);">—</span>'}
        </td>
        <td>
          ${p.notion_url ? `<a href="${p.notion_url}" target="_blank" class="qp-notion-link" onclick="event.stopPropagation()" title="Abrir no Notion">
            <i data-lucide="external-link" style="width:13px;height:13px;"></i>
          </a>` : ''}
          <button class="qp-row-open-btn" data-id="${p.id}" title="Abrir projeto">
            <i data-lucide="arrow-right" style="width:13px;height:13px;"></i>
          </button>
        </td>
      </tr>
    `;
  },

  // ── GANTT VIEW ─────────────────────────────────────────────────────────────
  _renderGantt() {
    const filtered = this._filtered();

    // Separate projects with and without dates
    const withDates = filtered.filter(p => p.due_date_start || p.due_date_end);
    const noDates   = filtered.filter(p => !p.due_date_start && !p.due_date_end);

    if (withDates.length === 0) {
      return `<div class="qp-empty">
        <i data-lucide="gantt-chart" style="width:32px;height:32px;opacity:.3;"></i>
        <p>Nenhum projeto com datas definidas para exibir no Gantt.</p>
        <p style="font-size:0.78rem;margin-top:4px;">Preencha <code>due_date_start</code> e <code>due_date_end</code> nos projetos.</p>
      </div>`;
    }

    // Calculate timeline range
    const allDates = withDates.flatMap(p => [p.due_date_start, p.due_date_end].filter(Boolean));
    const minDate = new Date(allDates.reduce((a, b) => a < b ? a : b));
    const maxDate = new Date(allDates.reduce((a, b) => a > b ? a : b));

    // Pad range by 2 weeks on each side
    minDate.setDate(minDate.getDate() - 14);
    maxDate.setDate(maxDate.getDate() + 14);

    const totalDays = Math.ceil((maxDate - minDate) / 86400000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate month headers
    const months = this._ganttMonths(minDate, maxDate);

    // Today marker position
    const todayOffset = Math.max(0, Math.ceil((today - minDate) / 86400000));
    const todayPct = (todayOffset / totalDays * 100).toFixed(2);

    // Sort projects by start date
    const sorted = [...withDates].sort((a, b) => {
      const da = a.due_date_start || a.due_date_end;
      const db = b.due_date_start || b.due_date_end;
      return da < db ? -1 : da > db ? 1 : 0;
    });

    const ROW_H = 36;
    const LABEL_W = 200;

    const rows = sorted.map((p, i) => {
      const start = p.due_date_start ? new Date(p.due_date_start + 'T00:00:00') : new Date(p.due_date_end + 'T00:00:00');
      const end   = p.due_date_end   ? new Date(p.due_date_end   + 'T23:59:59') : new Date(p.due_date_start + 'T23:59:59');
      const info  = this._statusInfo(p.status);
      const bus   = this._parseBus(p.bus);

      const left  = ((start - minDate) / 86400000 / totalDays * 100).toFixed(2);
      const width = Math.max(0.4, ((end - start) / 86400000 / totalDays * 100)).toFixed(2);

      const isLate = end < today && p.status !== 'finalizado';
      const barColor = isLate ? '#ef4444' : info.color;
      const barBg    = isLate ? 'rgba(239,68,68,0.15)' : info.bg;

      const buBadges = bus.slice(0, 2).map(b => {
        const bc = this._BU_COLORS[b] || { bg: '#f3f4f6', color: '#374151' };
        return `<span class="qp-bu-tag" style="background:${bc.bg};color:${bc.color};font-size:0.6rem;">${b}</span>`;
      }).join('');

      return `
        <div class="qp-gantt-row ${i % 2 === 1 ? 'qp-gantt-row-alt' : ''}"
             style="height:${ROW_H}px;" onclick="TBO_QUADRO_PROJETOS._openDetail('${p.id}')">
          <div class="qp-gantt-label" style="width:${LABEL_W}px;min-width:${LABEL_W}px;">
            <div class="qp-gantt-label-name" title="${this._esc(p.name)}">${this._esc(p.name)}</div>
            <div class="qp-gantt-label-meta">
              <span class="qp-status-dot" style="background:${info.color};"></span>
              ${buBadges}
            </div>
          </div>
          <div class="qp-gantt-track">
            <div class="qp-gantt-bar"
                 style="left:${left}%;width:${width}%;background:${barColor};opacity:0.85;"
                 title="${this._esc(p.name)} · ${this._fmtDate(p.due_date_start)} → ${this._fmtDate(p.due_date_end)}">
              <span class="qp-gantt-bar-label">${this._esc(p.name)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const monthHeaders = months.map(m => `
      <div class="qp-gantt-month" style="left:${m.left.toFixed(2)}%;width:${m.width.toFixed(2)}%;">
        ${m.label}
      </div>
    `).join('');

    // Day tick lines (every 7 days)
    const ticks = [];
    for (let d = 7; d < totalDays; d += 7) {
      ticks.push(`<div class="qp-gantt-tick" style="left:${(d / totalDays * 100).toFixed(2)}%;"></div>`);
    }

    return `
      <div class="qp-gantt-wrap">
        <div class="qp-gantt-header-row">
          <div class="qp-gantt-header-label" style="width:${LABEL_W}px;min-width:${LABEL_W}px;">
            Projeto
          </div>
          <div class="qp-gantt-header-track">
            ${monthHeaders}
            ${ticks.join('')}
            ${todayOffset > 0 && todayOffset < totalDays
              ? `<div class="qp-gantt-today" style="left:${todayPct}%;" title="Hoje"></div>` : ''}
          </div>
        </div>
        <div class="qp-gantt-body" id="qpGanttBody">
          ${rows}
          ${noDates.length > 0 ? `
            <div class="qp-gantt-no-dates">
              <i data-lucide="info" style="width:13px;height:13px;"></i>
              ${noDates.length} projeto(s) sem datas não exibidos
            </div>
          ` : ''}
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
      const mEnd   = new Date(Math.min(new Date(cur.getFullYear(), cur.getMonth() + 1, 0), maxDate));
      const left  = (mStart - minDate) / 86400000 / totalDays * 100;
      const width = (mEnd - mStart + 86400000) / 86400000 / totalDays * 100;
      months.push({
        label: cur.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        left, width
      });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
    return months;
  },

  _bindGanttScroll() {
    // Sync horizontal scroll between header track and body tracks
    const header = document.querySelector('.qp-gantt-header-track');
    const body   = document.getElementById('qpGanttBody');
    if (!header || !body) return;

    // Scroll today into view
    const todayEl = document.querySelector('.qp-gantt-today');
    if (todayEl) {
      setTimeout(() => {
        const track = todayEl.closest('.qp-gantt-header-track') || todayEl.parentElement;
        if (track) {
          const pct = parseFloat(todayEl.style.left) / 100;
          const wrap = document.querySelector('.qp-gantt-wrap');
          if (wrap) {
            const scrollTo = pct * wrap.scrollWidth - wrap.clientWidth / 2;
            wrap.scrollLeft = Math.max(0, scrollTo);
          }
        }
      }, 50);
    }
  },

  // ── SortableJS — drag-and-drop ──────────────────────────────────────────────
  _initSortableCards() {
    if (typeof Sortable === 'undefined') return;
    const bodies = document.querySelectorAll('.qp-column-body');
    bodies.forEach(body => {
      const instance = Sortable.create(body, {
        group: 'kanban-cards',
        animation: 150,
        draggable: '.qp-card',
        ghostClass: 'qp-card-ghost',
        chosenClass: 'qp-card-chosen',
        dragClass: 'qp-card-drag',
        fallbackOnBody: true,
        swapThreshold: 0.65,
        onEnd: (evt) => this._onCardDrop(evt),
      });
      this._sortableCards.push(instance);
    });
  },

  _initSortableColumns() {
    const board = document.querySelector('.qp-board');
    if (!board || typeof Sortable === 'undefined') return;
    this._sortableBoard = Sortable.create(board, {
      animation: 200,
      draggable: '.qp-column:not(.qp-column-add):not(.qp-column-orphan)',
      handle: '.qp-column-drag-handle',
      ghostClass: 'qp-column-ghost',
      chosenClass: 'qp-column-chosen',
      onEnd: (evt) => this._onColumnReorder(evt),
    });
  },

  _destroySortables() {
    this._sortableCards.forEach(s => { try { s.destroy(); } catch (_e) { /* */ } });
    this._sortableCards = [];
    if (this._sortableBoard) { try { this._sortableBoard.destroy(); } catch (_e) { /* */ } this._sortableBoard = null; }
  },

  // ── moveCard — drag card between columns ──────────────────────────────────
  async _onCardDrop(evt) {
    const cardEl = evt.item;
    const projectId = cardEl.dataset.id;
    const newColBody = evt.to;
    const newColEl = newColBody.closest('.qp-column');
    const newStatus = newColEl ? newColEl.dataset.status : null;
    if (!projectId || !newStatus || newStatus === '__orphan__') return;

    const proj = this._data.projects.find(p => p.id === projectId);
    const oldStatus = proj ? proj.status : null;
    if (proj) proj.status = newStatus;

    this._updateColumnCounts();
    this._renderKpis();

    try {
      await this._saveField(projectId, 'status', newStatus);
    } catch (err) {
      if (proj && oldStatus) proj.status = oldStatus;
      this._renderContent();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  _updateColumnCounts() {
    const filtered = this._filtered();
    document.querySelectorAll('.qp-column[data-status]').forEach(colEl => {
      const key = colEl.dataset.status;
      const countEl = colEl.querySelector('.qp-column-count');
      if (countEl) {
        const count = filtered.filter(p => p.status === key).length;
        countEl.textContent = count;
      }
    });
  },

  // ── moveColumn — reorder columns via drag ─────────────────────────────────
  _onColumnReorder(evt) {
    const cols = document.querySelectorAll('.qp-column:not(.qp-column-add):not(.qp-column-orphan)');
    const newOrder = [...cols].map(el => el.dataset.status).filter(Boolean);
    const ordered = newOrder.map(key => this._boardColumns.find(c => c.key === key)).filter(Boolean);
    this._boardColumns = ordered;
    this._saveBoardColumns();
  },

  // ── createCard — inline form at bottom of column ──────────────────────────
  _createCard(statusKey) {
    const body = document.getElementById('qpColBody_' + statusKey);
    if (!body) return;
    if (body.querySelector('.qp-card-create-form')) return;

    // Remove "Nenhum projeto" empty state if present
    const emptyEl = body.querySelector('.qp-empty-col');
    if (emptyEl) emptyEl.remove();

    const form = document.createElement('div');
    form.className = 'qp-card-create-form';
    form.innerHTML = `
      <input type="text" class="qp-card-create-input" placeholder="Nome do projeto..." autofocus>
      <div class="qp-card-create-actions">
        <button class="qp-card-create-save" title="Salvar (Enter)">
          <i data-lucide="check" style="width:14px;height:14px;"></i>
        </button>
        <button class="qp-card-create-cancel" title="Cancelar (Esc)">
          <i data-lucide="x" style="width:14px;height:14px;"></i>
        </button>
      </div>
    `;
    body.appendChild(form);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const input = form.querySelector('.qp-card-create-input');
    input.focus();

    const save = async () => {
      const name = input.value.trim();
      if (!name) { form.remove(); return; }

      const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
      if (!client) { if (form.parentNode) form.remove(); return; }

      let tid = null;
      try { tid = typeof RepoBase !== 'undefined' ? await RepoBase.resolveTenantId() : null; } catch (_e) { /* */ }

      const newProject = { name, status: statusKey };
      if (tid) newProject.tenant_id = tid;

      try {
        const { data, error } = await client.from('projects').insert(newProject).select().single();
        if (error) throw error;

        this._data.projects.push(data);
        form.remove();
        this._renderContent();
        this._renderKpis();
        if (typeof lucide !== 'undefined') lucide.createIcons();
        this._showSaveToast('Projeto criado');
      } catch (err) {
        console.error('[TBO QP] Create card error:', err);
        this._showSaveToast('Erro ao criar projeto', true);
      }
    };

    const cancel = () => form.remove();

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); save(); }
      if (e.key === 'Escape') cancel();
    });
    form.querySelector('.qp-card-create-save').addEventListener('click', save);
    form.querySelector('.qp-card-create-cancel').addEventListener('click', cancel);
  },

  // ── renameColumn — double-click inline edit ───────────────────────────────
  _renameColumn(statusKey) {
    const colEl = document.querySelector(`.qp-column[data-status="${statusKey}"]`);
    if (!colEl) return;
    const titleEl = colEl.querySelector('.qp-column-title-text');
    if (!titleEl || titleEl.querySelector('input')) return;

    const col = this._boardColumns.find(c => c.key === statusKey);
    if (!col) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'qp-column-rename-input';
    input.value = col.label;

    const originalText = titleEl.textContent;
    titleEl.textContent = '';
    titleEl.appendChild(input);
    input.focus();
    input.select();

    const save = () => {
      const newLabel = input.value.trim();
      if (newLabel && newLabel !== col.label) {
        col.label = newLabel;
        if (this._STATUS[statusKey]) this._STATUS[statusKey].label = newLabel;
        this._saveBoardColumns();
      }
      titleEl.textContent = col.label;
    };

    input.addEventListener('blur', save);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { titleEl.textContent = originalText; }
    });
  },

  // ── addColumn — modal dialog ──────────────────────────────────────────────
  _COLOR_PRESETS: [
    '#ef4444', '#f59e0b', '#22c55e', '#3b82f6',
    '#8b5cf6', '#ec4899', '#14b8a6', '#6b7280',
  ],

  _addColumn() {
    if (document.querySelector('.qp-add-col-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'qp-add-col-overlay';
    overlay.innerHTML = `
      <div class="qp-add-col-modal">
        <div class="qp-add-col-title">Adicionar coluna</div>
        <div class="qp-add-col-field">
          <label class="qp-add-col-label">Nome</label>
          <input type="text" class="qp-add-col-input" placeholder="Ex: Em Revisão..." autofocus>
        </div>
        <div class="qp-add-col-field">
          <label class="qp-add-col-label">Cor</label>
          <div class="qp-color-swatches">
            ${this._COLOR_PRESETS.map((c, i) =>
              `<div class="qp-color-swatch${i === 0 ? ' selected' : ''}" data-color="${c}" style="background:${c};"></div>`
            ).join('')}
          </div>
        </div>
        <div class="qp-add-col-actions">
          <button class="qp-add-col-btn qp-add-col-btn-cancel">Cancelar</button>
          <button class="qp-add-col-btn qp-add-col-btn-save">Criar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('qp-add-col-overlay--visible'));

    const input = overlay.querySelector('.qp-add-col-input');
    let selectedColor = this._COLOR_PRESETS[0];
    input.focus();

    // Color swatch selection
    overlay.querySelector('.qp-color-swatches').addEventListener('click', e => {
      const swatch = e.target.closest('.qp-color-swatch');
      if (!swatch) return;
      overlay.querySelectorAll('.qp-color-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      selectedColor = swatch.dataset.color;
    });

    const close = () => {
      overlay.classList.remove('qp-add-col-overlay--visible');
      setTimeout(() => overlay.remove(), 150);
    };

    const save = () => {
      const label = input.value.trim();
      if (!label) { input.focus(); return; }

      let key = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      if (!key) key = 'col_' + Date.now();

      // Avoid duplicate keys
      const existing = new Set(this._boardColumns.map(c => c.key));
      let finalKey = key;
      let suffix = 2;
      while (existing.has(finalKey)) { finalKey = key + '_' + suffix++; }

      this._boardColumns.push({ key: finalKey, label, color: selectedColor, icon: 'circle' });
      this._saveBoardColumns();
      close();
      this._renderContent();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    overlay.querySelector('.qp-add-col-btn-cancel').addEventListener('click', close);
    overlay.querySelector('.qp-add-col-btn-save').addEventListener('click', save);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); save(); }
      if (e.key === 'Escape') close();
    });
  },

  // ── deleteColumn — confirm + move cards ───────────────────────────────────
  async _deleteColumn(statusKey) {
    const col = this._boardColumns.find(c => c.key === statusKey);
    if (!col) return;
    const cardsInCol = this._data.projects.filter(p => p.status === statusKey);
    const otherCols = this._boardColumns.filter(c => c.key !== statusKey);

    if (cardsInCol.length > 0 && otherCols.length > 0) {
      // Show move-cards dialog
      const targetKey = await this._showMoveCardsDialog(col.label, cardsInCol.length, otherCols);
      if (!targetKey) return;

      // Batch update in Supabase
      for (const p of cardsInCol) {
        try {
          await this._saveField(p.id, 'status', targetKey);
          p.status = targetKey;
        } catch (err) {
          console.error('[TBO QP] Move card error:', err);
        }
      }
    } else if (cardsInCol.length > 0 && otherCols.length === 0) {
      // Cannot delete last column when it has cards
      const alertFn = typeof TBO_FEEDBACK !== 'undefined' && TBO_FEEDBACK.toast
        ? (msg) => TBO_FEEDBACK.toast(msg, 'warning')
        : (msg) => alert(msg);
      alertFn(`Não é possível remover "${col.label}" — ela contém ${cardsInCol.length} projeto(s) e não há outra coluna para movê-los.`);
      return;
    } else {
      // Simple confirmation for empty column
      const confirmFn = typeof TBO_FEEDBACK !== 'undefined' && TBO_FEEDBACK.confirm
        ? TBO_FEEDBACK.confirm.bind(TBO_FEEDBACK)
        : (msg) => Promise.resolve(confirm(msg));

      const confirmed = await confirmFn(`Remover a coluna "${col.label}"?`, { title: 'Remover coluna', confirmLabel: 'Remover', danger: true });
      if (!confirmed) return;
    }

    this._boardColumns = this._boardColumns.filter(c => c.key !== statusKey);
    this._saveBoardColumns();
    this._renderContent();
    this._renderKpis();
    if (typeof lucide !== 'undefined') lucide.createIcons();
    this._showSaveToast('Coluna removida');
  },

  _showMoveCardsDialog(fromLabel, cardCount, targetCols) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'qp-add-col-overlay';
      overlay.innerHTML = `
        <div class="qp-add-col-modal">
          <div class="qp-add-col-title">Mover ${cardCount} projeto(s)</div>
          <p style="font-size:0.85rem;color:var(--text-muted);margin:0 0 12px;">
            A coluna "${fromLabel}" tem projetos. Mova-os antes de remover.
          </p>
          <div class="qp-add-col-field">
            <label class="qp-add-col-label">Mover para</label>
            <select class="qp-move-cards-select">
              ${targetCols.map(c => `<option value="${c.key}">${c.label}</option>`).join('')}
            </select>
          </div>
          <div class="qp-add-col-actions">
            <button class="qp-add-col-btn qp-add-col-btn-cancel">Cancelar</button>
            <button class="qp-add-col-btn qp-add-col-btn-save">Mover e remover</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('qp-add-col-overlay--visible'));

      const close = (result) => {
        overlay.classList.remove('qp-add-col-overlay--visible');
        setTimeout(() => overlay.remove(), 150);
        resolve(result);
      };

      overlay.querySelector('.qp-add-col-btn-cancel').addEventListener('click', () => close(null));
      overlay.querySelector('.qp-add-col-btn-save').addEventListener('click', () => {
        const sel = overlay.querySelector('.qp-move-cards-select');
        close(sel.value);
      });
      overlay.addEventListener('click', e => { if (e.target === overlay) close(null); });
    });
  },

  // ── Card context menu (right-click) ────────────────────────────────────────
  _showCardContextMenu(projectId, x, y) {
    // Remove any existing context menu
    this._dismissCardContextMenu();

    const proj = this._data.projects.find(p => p.id === projectId);
    if (!proj) return;

    const cols = this._boardColumns || [];
    const statusInfo = this._statusInfo(proj.status);

    const menu = document.createElement('div');
    menu.className = 'qp-ctx-menu';
    menu.innerHTML = `
      <button class="qp-ctx-item" data-action="open" data-id="${projectId}">
        <i data-lucide="external-link" style="width:14px;height:14px;"></i>
        <span>Abrir projeto</span>
      </button>
      <div class="qp-ctx-separator"></div>
      <div class="qp-ctx-label">Mover para</div>
      ${cols.filter(c => c.key !== proj.status).map(c => {
        const info = this._statusInfo(c.key);
        return `<button class="qp-ctx-item" data-action="move" data-id="${projectId}" data-status="${c.key}">
          <span class="qp-ctx-dot" style="background:${info.color};"></span>
          <span>${this._esc(info.label)}</span>
        </button>`;
      }).join('')}
      <div class="qp-ctx-separator"></div>
      <button class="qp-ctx-item qp-ctx-danger" data-action="delete" data-id="${projectId}">
        <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
        <span>Excluir projeto</span>
      </button>
    `;

    // Position within viewport
    document.body.appendChild(menu);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const rect = menu.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 8;
    const maxY = window.innerHeight - rect.height - 8;
    menu.style.left = Math.min(x, maxX) + 'px';
    menu.style.top = Math.min(y, maxY) + 'px';

    // Handle clicks
    menu.addEventListener('click', async (e) => {
      const item = e.target.closest('.qp-ctx-item');
      if (!item) return;

      const action = item.dataset.action;
      const id = item.dataset.id;

      this._dismissCardContextMenu();

      if (action === 'open') {
        this._openDetail(id);
      } else if (action === 'move') {
        const newStatus = item.dataset.status;
        const p = this._data.projects.find(pr => pr.id === id);
        if (p) {
          const oldStatus = p.status;
          p.status = newStatus;
          this._renderContent();
          this._renderKpis();
          if (typeof lucide !== 'undefined') lucide.createIcons();
          try {
            await this._saveField(id, 'status', newStatus);
          } catch (err) {
            p.status = oldStatus;
            this._renderContent();
            this._renderKpis();
            if (typeof lucide !== 'undefined') lucide.createIcons();
          }
        }
      } else if (action === 'delete') {
        const confirmFn = typeof TBO_FEEDBACK !== 'undefined' && TBO_FEEDBACK.confirm
          ? TBO_FEEDBACK.confirm.bind(TBO_FEEDBACK)
          : (msg) => Promise.resolve(confirm(msg));

        const confirmed = await confirmFn(
          `Excluir o projeto "${proj.name}"? Esta ação não pode ser desfeita.`,
          { title: 'Excluir projeto', confirmLabel: 'Excluir', danger: true }
        );
        if (!confirmed) return;

        const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
        if (!client) return;
        try {
          const { error } = await client.from('projects').delete().eq('id', id);
          if (error) throw error;
          this._data.projects = this._data.projects.filter(pr => pr.id !== id);
          this._renderContent();
          this._renderKpis();
          if (typeof lucide !== 'undefined') lucide.createIcons();
          this._showSaveToast('Projeto excluído');
        } catch (err) {
          console.error('[TBO QP] Delete project error:', err);
          this._showSaveToast('Erro ao excluir projeto', true);
        }
      }
    });

    // Dismiss on click outside or Escape
    this._ctxDismissHandler = (e) => {
      if (!menu.contains(e.target)) this._dismissCardContextMenu();
    };
    this._ctxEscHandler = (e) => {
      if (e.key === 'Escape') this._dismissCardContextMenu();
    };
    setTimeout(() => {
      document.addEventListener('click', this._ctxDismissHandler, true);
      document.addEventListener('contextmenu', this._ctxDismissHandler, true);
      document.addEventListener('keydown', this._ctxEscHandler, true);
    }, 0);
  },

  _dismissCardContextMenu() {
    const existing = document.querySelector('.qp-ctx-menu');
    if (existing) existing.remove();
    if (this._ctxDismissHandler) {
      document.removeEventListener('click', this._ctxDismissHandler, true);
      document.removeEventListener('contextmenu', this._ctxDismissHandler, true);
      this._ctxDismissHandler = null;
    }
    if (this._ctxEscHandler) {
      document.removeEventListener('keydown', this._ctxEscHandler, true);
      this._ctxEscHandler = null;
    }
  },

  // ── Navigate to project detail page ────────────────────────────────────────
  _openDetail(projectId) {
    if (typeof TBO_ROUTER !== 'undefined') {
      TBO_ROUTER.navigate('projeto/' + projectId);
    }
  },

  // ── Inline editing: save field to Supabase ─────────────────────────────────
  async _saveField(projectId, field, value) {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) return;

    const update = {};
    if (field === 'bus') {
      update.bus = JSON.stringify(value);
    } else {
      update[field] = value || null;
    }

    // Show saving state
    if (typeof TBO_UX_IMPROVEMENTS !== 'undefined') TBO_UX_IMPROVEMENTS.setSaveState('saving');

    try {
      const { error } = await client.from('projects').update(update).eq('id', projectId);
      if (error) throw error;

      // Capture old value for undo
      const proj = this._data.projects.find(p => p.id === projectId);
      const oldValue = proj ? (field === 'bus' ? [...(this._parseBus(proj.bus))] : proj[field]) : null;

      // Update local data
      if (proj) {
        if (field === 'bus') {
          proj.bus = value;
        } else {
          proj[field] = value || null;
        }
      }

      // Show feedback
      this._showSaveToast('Salvo');
      if (typeof TBO_UX_IMPROVEMENTS !== 'undefined') {
        TBO_UX_IMPROVEMENTS.setSaveState('saved');
        // Push undo action
        TBO_UX_IMPROVEMENTS.pushUndo(`Campo "${field}" alterado`, () => {
          this._saveField(projectId, field, oldValue);
          this._renderContent();
          if (typeof lucide !== 'undefined') lucide.createIcons();
        });
      }
    } catch (err) {
      console.error('[TBO QP] Save error:', err);
      this._showSaveToast('Erro ao salvar', true);
      if (typeof TBO_UX_IMPROVEMENTS !== 'undefined') TBO_UX_IMPROVEMENTS.setSaveState('error');
    }
  },

  _showSaveToast(msg, isError) {
    let toast = document.getElementById('qpSaveToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'qpSaveToast';
      toast.className = 'qp-save-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.toggle('qp-save-toast-error', !!isError);
    toast.classList.add('qp-save-toast-show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('qp-save-toast-show'), 1800);
  },

  // ── Inline text editing (click-to-edit) ───────────────────────────────────
  _startInlineEdit(span) {
    if (span.querySelector('input')) return; // already editing
    const field = span.dataset.field;
    const id = span.dataset.id;
    const currentValue = span.textContent.trim();
    const displayValue = currentValue === '—' ? '' : currentValue;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'qp-inline-input';
    input.value = displayValue;
    input.dataset.field = field;
    input.dataset.id = id;

    span.textContent = '';
    span.appendChild(input);
    input.focus();
    input.select();

    const save = () => {
      const newVal = input.value.trim();
      span.textContent = newVal || '—';
      if (newVal !== displayValue) {
        this._saveField(id, field, newVal);
      }
    };

    input.addEventListener('blur', save);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { span.textContent = currentValue; }
    });
  },

  // ── Content event bindings (inline editing in #qpContent) ─────────────────
  _bindContentEvents() {
    const content = document.getElementById('qpContent');
    if (!content) return;

    // Click delegation — board CRUD + inline editing
    content.addEventListener('click', e => {
      // Board: add column button
      const addColBtn = e.target.closest('.qp-add-column-btn');
      if (addColBtn) { e.stopPropagation(); this._addColumn(); return; }

      // Board: delete column button
      const delColBtn = e.target.closest('.qp-column-delete-btn');
      if (delColBtn) { e.stopPropagation(); this._deleteColumn(delColBtn.dataset.status); return; }

      // Board: add card button (per column)
      const addCardBtn = e.target.closest('.qp-column-add-card-btn');
      if (addCardBtn) { e.stopPropagation(); this._createCard(addCardBtn.dataset.status); return; }

      // List: click-to-edit text fields
      const editable = e.target.closest('.qp-editable-text');
      if (editable) { e.stopPropagation(); this._startInlineEdit(editable); return; }

      const openBtn = e.target.closest('.qp-row-open-btn');
      if (openBtn) { e.stopPropagation(); this._openDetail(openBtn.dataset.id); return; }

      const demandsLink = e.target.closest('.qp-demands-link');
      if (demandsLink) { e.stopPropagation(); this._openDetail(demandsLink.dataset.id); return; }
    });

    // Right-click: card context menu
    content.addEventListener('contextmenu', e => {
      const card = e.target.closest('.qp-card');
      if (card && card.dataset.id) {
        e.preventDefault();
        e.stopPropagation();
        this._showCardContextMenu(card.dataset.id, e.clientX, e.clientY);
      }
    });

    // Double-click: rename column
    content.addEventListener('dblclick', e => {
      const titleEl = e.target.closest('.qp-column-title-text');
      if (titleEl) {
        e.stopPropagation();
        const colEl = titleEl.closest('.qp-column');
        if (colEl && colEl.dataset.status) this._renameColumn(colEl.dataset.status);
      }
    });

    // Select changes (status, BUs)
    content.addEventListener('change', e => {
      const sel = e.target.closest('.qp-inline-select');
      if (sel) {
        e.stopPropagation();
        const field = sel.dataset.field;
        const id = sel.dataset.id;
        if (field === 'bus') {
          const selected = Array.from(sel.selectedOptions).map(o => o.value);
          this._saveField(id, field, selected);
        } else {
          this._saveField(id, field, sel.value);
          // Re-render to update status pill colors across the board
          setTimeout(() => { this._renderKpis(); this._renderContent(); if (typeof lucide !== 'undefined') lucide.createIcons(); }, 200);
        }
      }

      const dateInput = e.target.closest('.qp-inline-date');
      if (dateInput) {
        e.stopPropagation();
        this._saveField(dateInput.dataset.id, dateInput.dataset.field, dateInput.value);
      }
    });
  },

  // ── Skeletons / error ──────────────────────────────────────────────────────
  _renderKpiSkeleton() {
    return Array(6).fill(0).map(() => `
      <div class="qp-kpi-card" style="opacity:.4;">
        <div class="skeleton" style="width:36px;height:36px;border-radius:8px;"></div>
        <div class="qp-kpi-body">
          <div class="skeleton" style="width:32px;height:24px;border-radius:4px;margin-bottom:4px;"></div>
          <div class="skeleton" style="width:80px;height:12px;border-radius:3px;"></div>
        </div>
      </div>
    `).join('');
  },

  _renderLoadingSkeleton() {
    return `<div style="display:flex;gap:12px;padding:8px 0;">
      ${Array(5).fill(0).map(() => `
        <div style="flex:1;min-width:160px;background:var(--bg-secondary);border-radius:10px;padding:12px;">
          <div class="skeleton" style="height:14px;width:70%;border-radius:4px;margin-bottom:16px;"></div>
          ${Array(3).fill(0).map(() => `
            <div class="skeleton" style="height:72px;border-radius:8px;margin-bottom:8px;"></div>
          `).join('')}
        </div>
      `).join('')}
    </div>`;
  },

  _renderError(msg) {
    return `<div class="qp-error">
      <i data-lucide="alert-circle" style="width:20px;height:20px;color:#ef4444;"></i>
      <span>Erro ao carregar: ${this._esc(msg)}</span>
    </div>`;
  },

  // ── Utils ──────────────────────────────────────────────────────────────────
  _esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  _fmtDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso.slice(0, 10) + 'T12:00:00');
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return iso.slice(0, 10); }
  },

  init() { /* router calls render() */ }
};
