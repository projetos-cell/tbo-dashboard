// TBO OS — Module: Project Detail (Asana-style project page)
// Route: #projeto/{id}
const TBO_PROJECT_DETAIL = {

  _project: null,
  _demands: [],
  _params: null,
  _loaded: false,
  _ctxMenu: null,       // context menu DOM element
  _ctxDemandId: null,   // demand id for active context menu
  _dragEl: null,        // element being dragged
  _dragType: null,      // 'task' or 'section'
  _globalsBound: false, // track global listeners to avoid duplicates

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
        <div class="pd-table-header">
          <div class="pd-th pd-th-drag"></div>
          <div class="pd-th pd-th-name">Nome da tarefa</div>
          <div class="pd-th pd-th-responsible">Responsavel</div>
          <div class="pd-th pd-th-date">Data</div>
          <div class="pd-th pd-th-priority">Prioridade</div>
          <div class="pd-th pd-th-status">Status</div>
        </div>
        ${this._renderSections()}
      </div>
    `;
  },

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
    // NOTE: draggable is NOT set here in HTML; it's set dynamically via mousedown on the handle
    return `
      <div class="pd-section" data-section="${section.key}">
        <button class="pd-section-toggle" data-toggle="${section.key}">
          <div class="pd-drag-handle pd-section-drag" title="Arrastar secao"><i data-lucide="grip-vertical"></i></div>
          <i data-lucide="chevron-down" class="pd-section-chevron" style="width:14px;height:14px;"></i>
          <i data-lucide="${section.icon}" style="width:14px;height:14px;opacity:0.6;"></i>
          <span class="pd-section-label">${section.label}</span>
          <span class="pd-section-count">${demands.length}</span>
        </button>
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

    // NOTE: draggable is NOT set here in HTML; it's set dynamically via mousedown on the handle
    return `
      <div class="pd-task-row ${isDone ? 'pd-task-done' : ''}" data-demand-id="${d.id}">
        <div class="pd-td pd-td-drag">
          <div class="pd-drag-handle pd-task-drag" title="Arrastar tarefa"><i data-lucide="grip-vertical"></i></div>
        </div>
        <div class="pd-td pd-td-check">
          <span class="pd-check ${isDone ? 'pd-checked' : ''}" style="border-color:${statusColors.color};${isDone ? `background:${statusColors.color};` : ''}">
            ${isDone ? '<i data-lucide="check" style="width:10px;height:10px;color:#fff;"></i>' : ''}
          </span>
        </div>
        <div class="pd-td pd-td-name">
          <span class="pd-task-title ${isDone ? 'pd-task-strikethrough' : ''}">${this._esc(d.title)}</span>
          ${d.notion_url ? `<a href="${d.notion_url}" target="_blank" class="pd-task-notion" onclick="event.stopPropagation()" title="Abrir no Notion"><i data-lucide="external-link" style="width:11px;height:11px;"></i></a>` : ''}
        </div>
        <div class="pd-td pd-td-responsible">
          ${d.responsible ? `<div class="pd-avatar-small" title="${this._esc(d.responsible)}">${this._initials(d.responsible)}</div><span class="pd-responsible-name">${this._esc(d.responsible)}</span>` : '<span class="pd-empty-cell">&mdash;</span>'}
        </div>
        <div class="pd-td pd-td-date">
          ${d.due_date ? `<span class="pd-date-text ${this._isLate(d) ? 'pd-date-late' : ''}">${this._fmtDate(d.due_date)}</span>` : '<span class="pd-empty-cell">&mdash;</span>'}
        </div>
        <div class="pd-td pd-td-priority">${priorityHtml}</div>
        <div class="pd-td pd-td-status">
          <span class="pd-demand-status" style="background:${statusColors.bg};color:${statusColors.color};">${this._esc(d.status || '\u2014')}</span>
        </div>
      </div>
    `;
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

    // Close context menu on mousedown anywhere outside the menu
    document.addEventListener('mousedown', (e) => {
      if (self._ctxMenu && !self._ctxMenu.contains(e.target)) {
        self._closeContextMenu();
      }
    });

    // Close context menu on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') self._closeContextMenu();
    });

    // Close context menu on scroll
    document.addEventListener('scroll', () => self._closeContextMenu(), true);
  },

  /** Local per-render listeners on task/section elements */
  _bindLocalEvents() {
    const self = this;

    // Section toggles
    document.querySelectorAll('.pd-section-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.closest('.pd-drag-handle')) return;
        const section = btn.closest('.pd-section');
        if (!section) return;
        section.classList.toggle('pd-section-collapsed');
        const chevron = btn.querySelector('.pd-section-chevron');
        if (chevron) chevron.style.transform = section.classList.contains('pd-section-collapsed') ? 'rotate(-90deg)' : '';
      });
    });

    // Task row click → open demand drawer
    document.querySelectorAll('.pd-task-row[data-demand-id]').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('.pd-check') || e.target.closest('.pd-drag-handle')) return;
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

    // Drag & Drop
    this._bindDragHandles();
  },

  // ═══════════════════════════════════════════════════
  // CONTEXT MENU
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

    // Position within viewport
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    menu.style.left = (x + mw > vw ? Math.max(0, x - mw) : x) + 'px';
    menu.style.top  = (y + mh > vh ? Math.max(0, y - mh) : y) + 'px';

    this._ctxMenu = menu;

    // Handle action clicks — use mousedown to fire before the global mousedown closes the menu
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

    // Prevent the menu itself from triggering the global close on mousedown
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
  // DRAG & DROP
  // ═══════════════════════════════════════════════════
  //
  // Strategy: Elements are NOT draggable by default.
  // We set draggable="true" on mousedown of the drag handle,
  // and remove it on mouseup/dragend. This prevents the browser
  // from hijacking clicks on the row for drag operations.
  //

  _bindDragHandles() {
    const self = this;

    // ── Task row drag handles ────────────────────────
    document.querySelectorAll('.pd-task-drag').forEach(handle => {
      const row = handle.closest('.pd-task-row');
      if (!row) return;

      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // don't trigger row click
        row.setAttribute('draggable', 'true');
        self._dragType = 'task';
      });

      row.addEventListener('dragstart', (e) => {
        if (self._dragType !== 'task') { e.preventDefault(); return; }
        self._dragEl = row;
        row.classList.add('pd-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', row.dataset.demandId || '');
        // Set a small drag image offset so cursor doesn't jump
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

    // Cleanup draggable on mouseup (in case drag didn't start)
    document.addEventListener('mouseup', () => {
      document.querySelectorAll('.pd-task-row[draggable]').forEach(r => r.removeAttribute('draggable'));
      document.querySelectorAll('.pd-section[draggable]').forEach(s => s.removeAttribute('draggable'));
    });

    // ── Section drag handles ─────────────────────────
    document.querySelectorAll('.pd-section-drag').forEach(handle => {
      const section = handle.closest('.pd-section');
      if (!section) return;

      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // don't trigger section toggle
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

    // ── Drop on section body (allow dropping tasks into different sections) ──
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
      <div class="pd-table-header">
        <div class="pd-th pd-th-drag"></div>
        <div class="pd-th pd-th-name">Nome da tarefa</div>
        <div class="pd-th pd-th-responsible">Responsavel</div>
        <div class="pd-th pd-th-date">Data</div>
        <div class="pd-th pd-th-priority">Prioridade</div>
        <div class="pd-th pd-th-status">Status</div>
      </div>
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
    this._project = null;
    this._demands = [];
    this._params = null;
    this._loaded = false;
    this._dragEl = null;
    this._dragType = null;
  },

  init() {}
};
