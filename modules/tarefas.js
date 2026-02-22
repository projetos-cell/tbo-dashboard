// TBO OS — Module: Tarefas Globais
// Cross-project task management with filters, status transitions, subtasks, and creation
const TBO_TAREFAS = {
  _filters: { status: '', owner: '', project: '', priority: '', search: '' },

  _getTeamMembers() {
    if (typeof TBO_RH !== 'undefined' && TBO_RH._team) return TBO_RH._team;
    const ctx = TBO_STORAGE.get('context');
    return ctx.dados_comerciais?.[TBO_CONFIG.app.fiscalYear]?.fluxo_caixa?.despesas_detalhadas?.pessoas?.equipe?.map(e => e.nome) || [];
  },

  // --- Dependency helpers ---
  _hasUnresolvedDeps(task, allTasks) {
    if (!task.depends_on || !Array.isArray(task.depends_on) || task.depends_on.length === 0) return false;
    const taskMap = {};
    allTasks.forEach(t => { taskMap[t.id] = t; });
    return task.depends_on.some(depId => {
      const dep = taskMap[depId];
      return dep && dep.status !== 'concluida';
    });
  },

  _getDependencyNames(task, allTasks) {
    if (!task.depends_on || !Array.isArray(task.depends_on) || task.depends_on.length === 0) return [];
    const taskMap = {};
    allTasks.forEach(t => { taskMap[t.id] = t; });
    return task.depends_on.map(depId => {
      const dep = taskMap[depId];
      return dep ? (dep.title || dep.name || depId) : depId;
    });
  },

  // --- Subtask helpers ---
  /** Reorder a flat filtered list so subtasks appear directly after their parent */
  _orderWithSubtasks(filtered) {
    const filteredIds = new Set(filtered.map(t => t.id));
    // Parent tasks = tasks with no parent_id, OR whose parent is not in the current filtered set
    const parentTasks = filtered.filter(t => !t.parent_id || !filteredIds.has(t.parent_id));
    const childMap = {};
    filtered.forEach(t => {
      if (t.parent_id && filteredIds.has(t.parent_id)) {
        if (!childMap[t.parent_id]) childMap[t.parent_id] = [];
        childMap[t.parent_id].push(t);
      }
    });
    const ordered = [];
    parentTasks.forEach(p => {
      ordered.push(p);
      if (childMap[p.id]) {
        childMap[p.id].forEach(c => ordered.push(c));
      }
    });
    return ordered;
  },

  render() {
    if (typeof TBO_ERP !== 'undefined') TBO_ERP.init();

    const tasks = TBO_STORAGE.getAllErpEntities('task');
    const projects = TBO_STORAGE.getAllErpEntities('project');
    const projectMap = {};
    projects.forEach(p => { projectMap[p.id] = p; });

    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const userName = user?.name || '';

    // KPIs
    const total = tasks.length;
    const pendentes = tasks.filter(t => t.status === 'pendente').length;
    const emAndamento = tasks.filter(t => t.status === 'em_andamento').length;
    const concluidas = tasks.filter(t => t.status === 'concluida').length;
    const overdue = tasks.filter(t => {
      if (!t.due_date || t.status === 'concluida' || t.status === 'cancelada') return false;
      return new Date(t.due_date) < new Date();
    }).length;
    const myTasks = tasks.filter(t => t.owner === userName && !TBO_CONFIG.business.getCompletedTaskStatuses().includes(t.status)).length;

    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
    const team = this._getTeamMembers();
    const activeProjects = projects.filter(p => !TBO_CONFIG.business.projectFinalStatuses.includes(p.status));

    return `
      <div class="tarefas-module">
        <!-- KPIs -->
        <div class="grid-5" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Total Tarefas</div>
            <div class="kpi-value">${total}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Pendentes</div>
            <div class="kpi-value" style="color:#f59e0b;">${pendentes}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Em Andamento</div>
            <div class="kpi-value" style="color:#3b82f6;">${emAndamento}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Atrasadas</div>
            <div class="kpi-value" style="color:${overdue > 0 ? '#ef4444' : '#22c55e'};">${overdue}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Minhas Tarefas</div>
            <div class="kpi-value">${myTasks}</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="tf-todas">Todas</button>
          <button class="tab" data-tab="tf-minhas">Minhas</button>
          <button class="tab" data-tab="tf-board">Board</button>
          <button class="tab" data-tab="tf-concluidas">Concluidas</button>
        </div>

        <!-- Filters -->
        <div class="card" style="padding:12px;margin-bottom:16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
          <select class="form-input" id="tfFilterStatus" style="max-width:170px;">
            <option value="">Todos status</option>
            ${sm ? sm.states.map(s => `<option value="${s}">${sm.labels[s]}</option>`).join('') : ''}
          </select>
          <select class="form-input" id="tfFilterOwner" style="max-width:200px;">
            <option value="">Todos responsáveis</option>
            ${team.map(t => `<option value="${_escapeHtml(t)}">${_escapeHtml(t)}</option>`).join('')}
          </select>
          <select class="form-input" id="tfFilterProject" style="max-width:200px;">
            <option value="">Todos projetos</option>
            ${activeProjects.map(p => `<option value="${p.id}">${_escapeHtml(p.name)}</option>`).join('')}
          </select>
          <select class="form-input" id="tfFilterPriority" style="max-width:150px;">
            <option value="">Prioridade</option>
            ${TBO_CONFIG.business.priorities.map(p => `<option value="${p.id}">${p.label}</option>`).join('')}
          </select>
          <input type="text" class="form-input" id="tfFilterSearch" placeholder="Buscar..." style="max-width:180px;">
          <!-- Botao "Nova Tarefa" removido (v2): usar FAB global no canto inferior direito -->
        </div>

        <!-- Tab: Todas -->
        <div class="tab-content active" id="tab-tf-todas">
          ${this._renderTaskList(tasks, projectMap, 'all', tasks)}
        </div>

        <!-- Tab: Minhas -->
        <div class="tab-content" id="tab-tf-minhas" style="display:none;">
          ${this._renderTaskList(tasks.filter(t => t.owner === userName), projectMap, 'mine', tasks)}
        </div>

        <!-- Tab: Board -->
        <div class="tab-content" id="tab-tf-board" style="display:none;">
          ${this._renderBoard(tasks, projectMap, sm)}
        </div>

        <!-- Tab: Concluidas -->
        <div class="tab-content" id="tab-tf-concluidas" style="display:none;">
          ${this._renderTaskList(tasks.filter(t => t.status === 'concluida'), projectMap, 'done', tasks)}
        </div>
      </div>
    `;
  },

  _renderTaskList(tasks, projectMap, mode, allTasks) {
    const filtered = this._applyFilters(tasks, mode);
    if (filtered.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Nenhuma tarefa encontrada.</div>';
    }

    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
    const allTasksRef = allTasks || tasks;
    const ordered = this._orderWithSubtasks(filtered);

    return `<div class="card tf-task-list" style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-default);text-align:left;">
            <th style="padding:10px 4px;width:28px;"></th>
            <th style="padding:10px 8px;font-weight:600;">Tarefa</th>
            <th style="padding:10px 8px;font-weight:600;">Projeto</th>
            <th style="padding:10px 8px;font-weight:600;">Responsavel</th>
            <th style="padding:10px 8px;font-weight:600;">Prioridade</th>
            <th style="padding:10px 8px;font-weight:600;">Status</th>
            <th style="padding:10px 8px;font-weight:600;">Prazo</th>
            <th style="padding:10px 4px;width:36px;"></th>
          </tr>
        </thead>
        <tbody>
          ${ordered.map(t => {
            const proj = projectMap[t.project_id];
            const projName = proj ? proj.name : '-';
            const isOverdue = t.due_date && t.status !== 'concluida' && t.status !== 'cancelada' && new Date(t.due_date) < new Date();
            const dueStr = t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '-';
            const pColor = TBO_CONFIG.business.getPriorityColor(t.priority);
            const stateLabel = sm ? (sm.labels[t.status] || t.status) : t.status;
            const stateColor = sm ? (sm.colors[t.status] || '#888') : '#888';
            const blocked = this._hasUnresolvedDeps(t, allTasksRef);
            const depNames = this._getDependencyNames(t, allTasksRef);
            const isSubtask = !!t.parent_id;
            const subtaskPrefix = isSubtask
              ? '<span style="color:var(--text-muted);font-size:0.78rem;margin-right:6px;font-family:monospace;">\u2514\u2500</span>'
              : '';
            const rowIndent = isSubtask ? 'padding-left:28px;' : '';
            const rowBg = isSubtask ? 'background:var(--bg-card-hover);' : '';

            return `<tr class="tf-task-row" style="border-bottom:1px solid var(--border-subtle);${rowBg}cursor:pointer;" data-task-id="${t.id}">
              <td style="padding:6px 4px;vertical-align:middle;">
                <div class="tf-drag-handle" title="Arrastar para reordenar" data-task-id="${t.id}">
                  <i data-lucide="grip-vertical"></i>
                </div>
              </td>
              <td style="padding:10px 8px;${rowIndent}">
                <div style="font-weight:600;display:flex;align-items:center;">${subtaskPrefix}${blocked ? '<span title="Bloqueada por dependencias">\u{1F512}</span> ' : ''}${_escapeHtml(t.title || t.name) || '-'}</div>
                ${t.description ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;${isSubtask ? 'margin-left:24px;' : ''}">${_escapeHtml(t.description)}</div>` : ''}
                ${depNames.length > 0 ? `<div style="font-size:0.68rem;color:var(--text-muted);margin-top:2px;${isSubtask ? 'margin-left:24px;' : ''}">Depende de: ${depNames.map(n => _escapeHtml(n)).join(', ')}</div>` : ''}
              </td>
              <td style="padding:10px 8px;"><span class="tag" style="font-size:0.7rem;">${_escapeHtml(projName)}</span></td>
              <td style="padding:10px 8px;">${_escapeHtml(t.owner) || '-'}</td>
              <td style="padding:10px 8px;"><span style="color:${pColor};font-weight:600;font-size:0.75rem;text-transform:uppercase;">${t.priority || '-'}</span></td>
              <td style="padding:10px 8px;">
                <span class="tag" style="background:${stateColor}20;color:${stateColor};font-size:0.7rem;">${stateLabel}</span>
                ${blocked ? ' <span class="tag" style="background:#ef444420;color:#ef4444;font-size:0.65rem;margin-left:4px;">Bloqueada</span>' : ''}
              </td>
              <td style="padding:10px 8px;${isOverdue ? 'color:#ef4444;font-weight:600;' : ''}">${dueStr}${isOverdue ? ' !' : ''}</td>
              <td style="padding:6px 4px;vertical-align:middle;">
                <button class="tf-row-menu-btn btn btn-ghost btn-sm" data-task-id="${t.id}" onclick="event.stopPropagation();">
                  <i data-lucide="more-horizontal"></i>
                </button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  },

  _renderBoard(tasks, projectMap, sm) {
    if (!sm) return '<div class="card" style="padding:20px;text-align:center;color:var(--text-muted);">State machine nao disponivel.</div>';

    const activeTasks = tasks.filter(t => t.status !== 'cancelada');
    const columns = sm.states.filter(s => s !== 'cancelada');

    return `<div class="tf-board" style="display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;">
      ${columns.map(state => {
        const stateTasks = this._applyFilters(activeTasks.filter(t => t.status === state), 'all');
        return `<div class="tf-board-col" data-status="${state}" style="min-width:260px;flex:1;background:var(--bg-card-hover);border-radius:8px;padding:12px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <div style="width:10px;height:10px;border-radius:50%;background:${sm.colors[state]};"></div>
            <span style="font-weight:600;font-size:0.82rem;">${sm.labels[state]}</span>
            <span class="tag" style="font-size:0.65rem;margin-left:auto;">${stateTasks.length}</span>
          </div>
          <div class="tf-board-cards" data-status="${state}" style="min-height:40px;">
          ${stateTasks.length === 0 ? '<div style="font-size:0.75rem;color:var(--text-muted);text-align:center;padding:16px;">Nenhuma</div>' :
            stateTasks.map(t => {
              const proj = projectMap[t.project_id];
              const projName = proj ? proj.name : '';
              const isOverdue = t.due_date && new Date(t.due_date) < new Date();
              const blocked = this._hasUnresolvedDeps(t, tasks);
              const depNames = this._getDependencyNames(t, tasks);
              const isSubtask = !!t.parent_id;
              const parentTask = isSubtask ? tasks.find(p => p.id === t.parent_id) : null;
              const parentLabel = parentTask ? (parentTask.title || parentTask.name || '') : '';
              const pColor = TBO_CONFIG.business.getPriorityColor(t.priority);
              return `<div class="tf-board-card card" draggable="true" data-task-id="${t.id}" style="padding:10px;margin-bottom:8px;cursor:pointer;border-left:3px solid ${sm.colors[state]};${isSubtask ? 'margin-left:12px;' : ''}">
                ${isSubtask ? `<div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:3px;font-family:monospace;">\u2514\u2500 subtarefa${parentLabel ? ' de: ' + _escapeHtml(parentLabel) : ''}</div>` : ''}
                <div style="font-weight:600;font-size:0.8rem;margin-bottom:4px;">${blocked ? '<span title="Bloqueada por dependencias">\u{1F512}</span> ' : ''}${_escapeHtml(t.title || t.name) || '-'}</div>
                ${blocked ? '<div style="margin-bottom:4px;"><span class="tag" style="background:#ef444420;color:#ef4444;font-size:0.62rem;">Bloqueada</span></div>' : ''}
                ${projName ? `<div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:4px;">${_escapeHtml(projName)}</div>` : ''}
                ${t.priority ? `<span class="tf-priority-chip" style="background:${pColor}18;color:${pColor};font-size:0.65rem;padding:1px 6px;border-radius:4px;font-weight:600;text-transform:uppercase;">${t.priority}</span>` : ''}
                ${depNames.length > 0 ? `<div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:4px;">Depende de: ${depNames.map(n => _escapeHtml(n)).join(', ')}</div>` : ''}
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.7rem;margin-top:6px;">
                  <span style="color:var(--text-secondary);">${_escapeHtml(t.owner) || '-'}</span>
                  ${t.due_date ? `<span style="color:${isOverdue ? '#ef4444' : 'var(--text-muted)'};">${new Date(t.due_date).toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit'})}</span>` : ''}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },

  _getTransitions(currentState, sm) {
    if (typeof TBO_ERP !== 'undefined') {
      return TBO_ERP.getValidTransitions('task', currentState);
    }
    return [];
  },

  _applyFilters(tasks, mode) {
    let filtered = [...tasks];
    const f = this._filters;
    const hasActiveFilter = f.status || f.owner || f.project || f.priority || f.search;

    if (f.status) filtered = filtered.filter(t => t.status === f.status);
    if (f.owner) filtered = filtered.filter(t => t.owner === f.owner);
    if (f.project) filtered = filtered.filter(t => t.project_id === f.project);
    if (f.priority) filtered = filtered.filter(t => t.priority === f.priority);
    if (f.search) {
      const q = f.search.toLowerCase();
      filtered = filtered.filter(t => (t.title || t.name || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
    }

    // If a parent task matches the filter, include its subtasks too
    if (hasActiveFilter) {
      const filteredIds = new Set(filtered.map(t => t.id));
      const allTasks = [...tasks];
      allTasks.forEach(t => {
        if (t.parent_id && filteredIds.has(t.parent_id) && !filteredIds.has(t.id)) {
          filtered.push(t);
          filteredIds.add(t.id);
        }
      });
    }

    // Sort: overdue first, then by priority, then by date
    const priorityOrder = TBO_CONFIG.business.getPrioritySortMap();
    filtered.sort((a, b) => {
      const aOverdue = a.due_date && a.status !== 'concluida' && new Date(a.due_date) < new Date() ? 0 : 1;
      const bOverdue = b.due_date && b.status !== 'concluida' && new Date(b.due_date) < new Date() ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      const defaultSort = priorityOrder[TBO_CONFIG.business.defaultPriority] ?? 1;
      const aPri = priorityOrder[a.priority] ?? defaultSort;
      const bPri = priorityOrder[b.priority] ?? defaultSort;
      if (aPri !== bPri) return aPri - bPri;
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
    return filtered;
  },

  init() {
    // Tab switching
    document.querySelectorAll('.tarefas-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tarefas-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tarefas-module .tab-content').forEach(tc => { tc.style.display = 'none'; tc.classList.remove('active'); });
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) { target.style.display = ''; target.classList.add('active'); }
      });
    });

    // Filters
    const bindFilter = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', () => {
        this._filters[key] = el.value;
        this._refreshLists();
      });
    };
    bindFilter('tfFilterStatus', 'status');
    bindFilter('tfFilterOwner', 'owner');
    bindFilter('tfFilterProject', 'project');
    bindFilter('tfFilterPriority', 'priority');
    bindFilter('tfFilterSearch', 'search');

    // Click em row abre painel de detalhe
    document.querySelectorAll('.tf-task-row').forEach(row => {
      row.addEventListener('click', (e) => {
        // Ignorar cliques em selects, botoes e drag handle
        if (e.target.closest('.tf-row-menu-btn') || e.target.closest('.tf-drag-handle') || e.target.closest('select') || e.target.closest('button')) return;
        const taskId = row.dataset.taskId;
        if (taskId) this._openTaskDetail(taskId);
      });
    });

    // Botao ⋯ abre context menu
    document.querySelectorAll('.tf-row-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = btn.getBoundingClientRect();
        this._showTaskContextMenu(btn.dataset.taskId, rect.right - 210, rect.bottom + 4);
      });
    });

    // Right-click em row abre context menu
    document.querySelectorAll('.tf-task-row').forEach(row => {
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const taskId = row.dataset.taskId;
        if (taskId) this._showTaskContextMenu(taskId, e.clientX, e.clientY);
      });
    });

    // Board card clicks + drag
    document.querySelectorAll('.tf-board-card').forEach(card => {
      card.addEventListener('click', () => {
        const taskId = card.dataset.taskId;
        if (taskId) this._openTaskDetail(taskId);
      });
      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const taskId = card.dataset.taskId;
        if (taskId) this._showTaskContextMenu(taskId, e.clientX, e.clientY);
      });
    });

    // Init drag-and-drop
    this._initListDragDrop();
    this._initBoardDragDrop();

    // New task button
    const btnNew = document.getElementById('tfBtnNewTask');
    if (btnNew) btnNew.addEventListener('click', () => this._showNewTaskModal());

    // Inject scoped CSS
    this._injectStyles();
  },

  _refreshLists() {
    const container = document.getElementById('moduleContainer');
    if (container) {
      container.innerHTML = this.render();
      this.init();
      if (window.lucide) lucide.createIcons();
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // TASK DETAIL PANEL (slide-in drawer, Asana-style)
  // ══════════════════════════════════════════════════════════════════════

  _openTaskDetail(taskId) {
    const allTasks = TBO_STORAGE.getAllErpEntities('task');
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
    const projects = TBO_STORAGE.getAllErpEntities('project');
    const projectMap = {};
    projects.forEach(p => { projectMap[p.id] = p; });
    const proj = projectMap[task.project_id];
    const isDone = task.status === 'concluida';
    const team = this._getTeamMembers();

    // Criar/atualizar drawer
    let detail = document.getElementById('tfTaskDetail');
    let backdrop = document.getElementById('tfDetailBackdrop');
    if (!detail) {
      detail = document.createElement('div');
      detail.id = 'tfTaskDetail';
      detail.className = 'tf-task-detail';
      document.body.appendChild(detail);
    }
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'tfDetailBackdrop';
      backdrop.className = 'tf-detail-backdrop';
      document.body.appendChild(backdrop);
    }

    const statusOptions = ['pendente', 'em_andamento', 'revisao', 'concluida', 'bloqueada'].map(s => {
      const lbl = sm?.labels?.[s] || s;
      return `<option value="${s}" ${task.status === s ? 'selected' : ''}>${_escapeHtml(lbl)}</option>`;
    }).join('');

    const priorityOptions = ['urgente', 'alta', 'media', 'baixa'].map(p =>
      `<option value="${p}" ${task.priority === p ? 'selected' : ''}>${p.charAt(0).toUpperCase() + p.slice(1)}</option>`
    ).join('');

    const ownerOptions = [`<option value="">Sem responsavel</option>`].concat(
      team.map(t => `<option value="${_escapeHtml(typeof t === 'string' ? t : t.name || t)}" ${task.owner === (typeof t === 'string' ? t : t.name || t) ? 'selected' : ''}>${_escapeHtml(typeof t === 'string' ? t : t.name || t)}</option>`)
    ).join('');

    detail.innerHTML = `
      <div class="tf-detail-header">
        <button class="tf-check-btn${isDone ? ' tf-check-btn--done' : ''}" id="tfDetailCheck" data-task-id="${taskId}" style="margin-top:2px;">
          <i data-lucide="${isDone ? 'check-circle-2' : 'circle'}" style="width:22px;height:22px;"></i>
        </button>
        <div style="flex:1;">
          <input type="text" class="tf-detail-input" id="tfDetailTitle" value="${_escapeHtml(task.title || task.name || '')}" style="font-size:1.1rem;font-weight:700;border:none;padding:0;background:transparent;width:100%;" />
        </div>
        <button class="btn btn-ghost btn-sm" id="tfDetailClose" style="flex-shrink:0;">
          <i data-lucide="x" style="width:18px;height:18px;"></i>
        </button>
      </div>

      <div class="tf-detail-body">
        <!-- Status & Priority -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
          <div class="tf-detail-field">
            <div class="tf-detail-label">Status</div>
            <select class="tf-detail-select" id="tfDetailStatus" style="width:100%;">${statusOptions}</select>
          </div>
          <div class="tf-detail-field">
            <div class="tf-detail-label">Prioridade</div>
            <select class="tf-detail-select" id="tfDetailPriority" style="width:100%;">${priorityOptions}</select>
          </div>
        </div>

        <!-- Responsavel & Datas -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
          <div class="tf-detail-field">
            <div class="tf-detail-label">Responsavel</div>
            <select class="tf-detail-select" id="tfDetailOwner" style="width:100%;">${ownerOptions}</select>
          </div>
          <div class="tf-detail-field">
            <div class="tf-detail-label">Data de conclusao</div>
            <input type="date" class="tf-detail-input" id="tfDetailDueDate" value="${task.due_date || ''}" />
          </div>
        </div>

        <!-- Projeto & Secao -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
          <div class="tf-detail-field">
            <div class="tf-detail-label">Projeto</div>
            <div class="tf-detail-value">${_escapeHtml(proj?.name || '-')}</div>
          </div>
          <div class="tf-detail-field">
            <div class="tf-detail-label">Secao</div>
            <div class="tf-detail-value">${_escapeHtml(task.phase || task.section || '-')}</div>
          </div>
        </div>

        <!-- Descricao -->
        <div class="tf-detail-field">
          <div class="tf-detail-label">Descricao</div>
          <textarea class="tf-detail-textarea" id="tfDetailDesc" placeholder="Adicionar descricao...">${_escapeHtml(task.description || task.notes || '')}</textarea>
        </div>

        <!-- Subtarefas -->
        <div class="tf-detail-field">
          <div class="tf-detail-label">Subtarefas</div>
          <div style="padding:8px 0;font-size:0.78rem;color:var(--text-muted);">
            ${task.subtasks && task.subtasks.length ? task.subtasks.map(st => `
              <div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
                <i data-lucide="${st.done ? 'check-circle-2' : 'circle'}" style="width:14px;height:14px;color:${st.done ? 'var(--color-success)' : 'var(--text-muted)'};"></i>
                <span style="${st.done ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${_escapeHtml(st.title || st.name || '')}</span>
              </div>`).join('') : '<span>Nenhuma subtarefa</span>'}
          </div>
        </div>

        <!-- Dependencias -->
        ${task.depends_on && task.depends_on.length ? `
        <div class="tf-detail-field">
          <div class="tf-detail-label">Dependencias</div>
          <div style="padding:4px 0;font-size:0.78rem;">
            ${this._getDependencyNames(task, allTasks).map(n => `<span class="tag" style="margin-right:4px;font-size:0.7rem;">${_escapeHtml(n)}</span>`).join('')}
          </div>
        </div>` : ''}

        <!-- Acoes -->
        <div style="display:flex;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border-subtle);">
          <button class="btn btn-primary btn-sm" id="tfDetailSave">
            <i data-lucide="save" style="width:14px;height:14px;"></i> Salvar
          </button>
          <button class="btn btn-secondary btn-sm" id="tfDetailDuplicate">
            <i data-lucide="copy" style="width:14px;height:14px;"></i> Duplicar
          </button>
          <button class="btn btn-ghost btn-sm" id="tfDetailDelete" style="color:var(--color-danger);margin-left:auto;">
            <i data-lucide="trash-2" style="width:14px;height:14px;"></i> Excluir
          </button>
        </div>
      </div>
    `;

    // Mostrar com animacao
    detail.style.display = 'block';
    backdrop.style.display = 'block';
    requestAnimationFrame(() => {
      backdrop.classList.add('tf-detail-open');
      detail.classList.add('tf-detail-open');
    });
    if (window.lucide) lucide.createIcons();

    this._bindTaskDetailActions(taskId);
  },

  _closeTaskDetail() {
    const detail = document.getElementById('tfTaskDetail');
    const backdrop = document.getElementById('tfDetailBackdrop');
    if (detail) {
      detail.classList.remove('tf-detail-open');
      setTimeout(() => { detail.style.display = 'none'; }, 250);
    }
    if (backdrop) {
      backdrop.classList.remove('tf-detail-open');
      setTimeout(() => { backdrop.style.display = 'none'; }, 200);
    }
    if (this._detailEscHandler) {
      document.removeEventListener('keydown', this._detailEscHandler);
      this._detailEscHandler = null;
    }
  },

  _bindTaskDetailActions(taskId) {
    const closeBtn = document.getElementById('tfDetailClose');
    if (closeBtn) closeBtn.addEventListener('click', () => this._closeTaskDetail());

    const backdrop = document.getElementById('tfDetailBackdrop');
    if (backdrop) backdrop.addEventListener('click', () => this._closeTaskDetail());

    this._detailEscHandler = (e) => { if (e.key === 'Escape') this._closeTaskDetail(); };
    document.addEventListener('keydown', this._detailEscHandler);

    // Check/uncheck
    const checkBtn = document.getElementById('tfDetailCheck');
    if (checkBtn) checkBtn.addEventListener('click', () => {
      const allTasks = TBO_STORAGE.getAllErpEntities('task');
      const task = allTasks.find(t => t.id === taskId);
      if (!task) return;
      const newStatus = task.status === 'concluida' ? 'pendente' : 'concluida';
      TBO_STORAGE.updateErpEntity('task', taskId, { status: newStatus });
      this._closeTaskDetail();
      setTimeout(() => { this._refreshLists(); this._openTaskDetail(taskId); }, 300);
    });

    // Salvar
    const saveBtn = document.getElementById('tfDetailSave');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      const updates = {};
      const newTitle = document.getElementById('tfDetailTitle')?.value?.trim();
      const newStatus = document.getElementById('tfDetailStatus')?.value;
      const newPriority = document.getElementById('tfDetailPriority')?.value;
      const newOwner = document.getElementById('tfDetailOwner')?.value;
      const newDueDate = document.getElementById('tfDetailDueDate')?.value;
      const newDesc = document.getElementById('tfDetailDesc')?.value?.trim();

      if (newTitle) { updates.title = newTitle; updates.name = newTitle; }
      if (newStatus) updates.status = newStatus;
      if (newPriority) updates.priority = newPriority;
      updates.owner = newOwner || '';
      updates.due_date = newDueDate || '';
      updates.description = newDesc || '';

      TBO_STORAGE.updateErpEntity('task', taskId, updates);
      this._closeTaskDetail();
      this._refreshLists();
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Tarefa atualizada!');
    });

    // Duplicar
    const dupBtn = document.getElementById('tfDetailDuplicate');
    if (dupBtn) dupBtn.addEventListener('click', () => {
      const allTasks = TBO_STORAGE.getAllErpEntities('task');
      const task = allTasks.find(t => t.id === taskId);
      if (!task) return;
      TBO_STORAGE.addErpEntity('task', { ...task, id: undefined, title: (task.title || task.name) + ' (copia)', status: 'pendente' });
      this._closeTaskDetail();
      this._refreshLists();
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Tarefa duplicada!');
    });

    // Excluir
    const delBtn = document.getElementById('tfDetailDelete');
    if (delBtn) delBtn.addEventListener('click', () => {
      if (!confirm('Excluir esta tarefa permanentemente?')) return;
      TBO_STORAGE.deleteErpEntity('task', taskId);
      this._closeTaskDetail();
      this._refreshLists();
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Tarefa excluida');
    });
  },

  // ══════════════════════════════════════════════════════════════════════
  // CONTEXT MENU
  // ══════════════════════════════════════════════════════════════════════

  _showTaskContextMenu(taskId, x, y) {
    const allTasks = TBO_STORAGE.getAllErpEntities('task');
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    const isDone = task.status === 'concluida';

    let menu = document.getElementById('tfContextMenu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'tfContextMenu';
      menu.className = 'tf-context-menu';
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
      if (item.divider) return '<div class="tf-ctx-divider"></div>';
      return `<button class="tf-ctx-item ${item.danger ? 'tf-ctx-item--danger' : ''}" data-action="${item.action}" data-task-id="${taskId}">
        <i data-lucide="${item.icon}" style="width:14px;height:14px;"></i>
        <span>${item.label}</span>
      </button>`;
    }).join('');

    // Viewport-aware positioning
    const menuW = 210, menuH = items.length * 36;
    const vw = window.innerWidth, vh = window.innerHeight;
    const posX = x + menuW > vw ? x - menuW : x;
    const posY = y + menuH > vh ? Math.max(8, y - menuH) : y;

    menu.style.cssText = `display:block;position:fixed;top:${posY}px;left:${posX}px;z-index:1100;`;
    if (window.lucide) lucide.createIcons();

    menu.querySelectorAll('.tf-ctx-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.style.display = 'none';
        this._handleTaskContextAction(btn.dataset.action, btn.dataset.taskId);
      });
    });

    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        menu.style.display = 'none';
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 10);
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        menu.style.display = 'none';
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  },

  _handleTaskContextAction(action, taskId) {
    switch (action) {
      case 'open_detail':
        this._openTaskDetail(taskId);
        break;
      case 'toggle_done': {
        const allTasks = TBO_STORAGE.getAllErpEntities('task');
        const task = allTasks.find(t => t.id === taskId);
        if (!task) return;
        const newStatus = task.status === 'concluida' ? 'pendente' : 'concluida';
        TBO_STORAGE.updateErpEntity('task', taskId, { status: newStatus });
        this._refreshLists();
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success(newStatus === 'concluida' ? 'Tarefa concluida!' : 'Tarefa reaberta');
        break;
      }
      case 'duplicate': {
        const allTasks = TBO_STORAGE.getAllErpEntities('task');
        const task = allTasks.find(t => t.id === taskId);
        if (task) {
          TBO_STORAGE.addErpEntity('task', { ...task, id: undefined, title: (task.title || task.name) + ' (copia)', status: 'pendente' });
          this._refreshLists();
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Tarefa duplicada!');
        }
        break;
      }
      case 'add_subtask':
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Em desenvolvimento', 'Adicionar subtarefa inline sera implementado em breve.');
        break;
      case 'copy_link':
        navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#tarefas?task=${taskId}`).then(() => {
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Link copiado!');
        });
        break;
      case 'delete':
        if (confirm('Excluir esta tarefa?')) {
          TBO_STORAGE.deleteErpEntity('task', taskId);
          this._refreshLists();
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Tarefa excluida');
        }
        break;
    }
  },

  // ══════════════════════════════════════════════════════════════════════
  // DRAG AND DROP (lista e board)
  // ══════════════════════════════════════════════════════════════════════

  _initListDragDrop() {
    let draggedId = null;

    document.querySelectorAll('.tf-drag-handle').forEach(handle => {
      const row = handle.closest('.tf-task-row');
      if (!row) return;

      handle.addEventListener('mousedown', () => { row.draggable = true; });

      row.addEventListener('dragstart', (e) => {
        draggedId = row.dataset.taskId;
        row.classList.add('tf-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedId);
      });

      row.addEventListener('dragend', () => {
        row.classList.remove('tf-dragging');
        row.draggable = false;
        document.querySelectorAll('.tf-drag-over').forEach(el => el.classList.remove('tf-drag-over'));
      });
    });

    document.querySelectorAll('.tf-task-row').forEach(row => {
      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (row.dataset.taskId !== draggedId) {
          row.classList.add('tf-drag-over');
        }
      });
      row.addEventListener('dragleave', () => { row.classList.remove('tf-drag-over'); });
      row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('tf-drag-over');
        const targetId = row.dataset.taskId;
        if (!draggedId || draggedId === targetId) return;

        // Reordenar no storage
        const allTasks = TBO_STORAGE.getAllErpEntities('task');
        const fromIdx = allTasks.findIndex(t => t.id === draggedId);
        const toIdx = allTasks.findIndex(t => t.id === targetId);
        if (fromIdx !== -1 && toIdx !== -1) {
          allTasks[fromIdx].position = toIdx;
          allTasks[toIdx].position = fromIdx;
          TBO_STORAGE.updateErpEntity('task', draggedId, { position: toIdx });
          TBO_STORAGE.updateErpEntity('task', targetId, { position: fromIdx });
          this._refreshLists();
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Tarefa reordenada');
        }
        draggedId = null;
      });
    });
  },

  _initBoardDragDrop() {
    let draggedId = null;

    document.querySelectorAll('.tf-board-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedId = card.dataset.taskId;
        card.classList.add('tf-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedId);
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('tf-dragging');
        document.querySelectorAll('.tf-board-col-hover').forEach(el => el.classList.remove('tf-board-col-hover'));
      });
    });

    // Colunas como drop targets para mover status
    document.querySelectorAll('.tf-board-cards').forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        col.closest('.tf-board-col')?.classList.add('tf-board-col-hover');
      });
      col.addEventListener('dragleave', (e) => {
        if (!col.contains(e.relatedTarget)) {
          col.closest('.tf-board-col')?.classList.remove('tf-board-col-hover');
        }
      });
      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.closest('.tf-board-col')?.classList.remove('tf-board-col-hover');
        const newStatus = col.dataset.status;
        if (!draggedId || !newStatus) return;

        const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
        TBO_STORAGE.updateErpEntity('task', draggedId, { status: newStatus });
        const label = sm?.labels?.[newStatus] || newStatus;
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Status atualizado', label);
        this._refreshLists();
        draggedId = null;
      });
    });
  },

  // ══════════════════════════════════════════════════════════════════════
  // CSS INJETADO
  // ══════════════════════════════════════════════════════════════════════

  _injectStyles() {
    if (document.getElementById('tf-scoped-css')) return;
    const style = document.createElement('style');
    style.id = 'tf-scoped-css';
    style.textContent = `
      /* Drag handle */
      .tf-drag-handle {
        opacity: 0; cursor: grab; color: var(--text-muted); display:flex; align-items:center; justify-content:center;
        width:20px; height:20px; transition: opacity 0.15s;
      }
      .tf-drag-handle svg { width:14px; height:14px; }
      .tf-task-row:hover .tf-drag-handle { opacity:0.6; }
      .tf-drag-handle:hover { opacity:1 !important; }
      .tf-drag-handle:active { cursor:grabbing; }
      .tf-task-row.tf-dragging { opacity:0.4; background:var(--bg-tertiary); }
      .tf-task-row.tf-drag-over { border-top:2px solid var(--brand-primary) !important; }

      /* Row menu btn */
      .tf-row-menu-btn { opacity:0; transition:opacity 0.15s; padding:2px; }
      .tf-row-menu-btn svg { width:16px; height:16px; }
      .tf-task-row:hover .tf-row-menu-btn { opacity:0.6; }
      .tf-row-menu-btn:hover { opacity:1 !important; }

      /* Task detail panel */
      .tf-task-detail {
        display:none; position:fixed; top:0; right:-520px; width:520px; max-width:100vw;
        height:100vh; background:var(--bg-card); border-left:1px solid var(--border-default);
        box-shadow:-8px 0 32px rgba(0,0,0,0.12); z-index:1050; overflow-y:auto;
        transition:right 0.25s cubic-bezier(0.4,0,0.2,1);
      }
      .tf-task-detail.tf-detail-open { right:0; }
      .tf-detail-backdrop {
        display:none; position:fixed; top:0; left:0; width:100%; height:100%;
        background:rgba(0,0,0,0.25); z-index:1040; opacity:0; transition:opacity 0.2s;
      }
      .tf-detail-backdrop.tf-detail-open { opacity:1; }
      .tf-detail-header {
        display:flex; align-items:center; gap:12px; padding:20px 24px 12px;
        border-bottom:1px solid var(--border-subtle); position:sticky; top:0; background:var(--bg-card); z-index:2;
      }
      .tf-detail-body { padding:20px 24px; }
      .tf-detail-field { margin-bottom:16px; }
      .tf-detail-label { font-size:0.72rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
      .tf-detail-value { font-size:0.85rem; color:var(--text-primary); padding:6px 0; }
      .tf-detail-input {
        width:100%; padding:6px 8px; border:1px solid var(--border-default); border-radius:6px;
        font-size:0.85rem; color:var(--text-primary); background:var(--bg-card);
      }
      .tf-detail-input:focus { border-color:var(--brand-primary); outline:none; box-shadow:0 0 0 2px var(--brand-primary)20; }
      .tf-detail-select {
        width:100%; padding:6px 8px; border:1px solid var(--border-default); border-radius:6px;
        font-size:0.85rem; color:var(--text-primary); background:var(--bg-card);
      }
      .tf-detail-textarea {
        width:100%; min-height:100px; padding:8px; border:1px solid var(--border-default); border-radius:6px;
        font-size:0.82rem; color:var(--text-primary); background:var(--bg-card); resize:vertical;
      }
      .tf-check-btn { background:none; border:none; cursor:pointer; color:var(--text-muted); padding:0; }
      .tf-check-btn--done { color:var(--color-success); }

      /* Context menu */
      .tf-context-menu {
        display:none; background:var(--bg-card); border:1px solid var(--border-default);
        border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.15); padding:4px 0;
        min-width:200px; z-index:1100;
      }
      .tf-ctx-item {
        display:flex; align-items:center; gap:10px; width:100%; padding:8px 14px;
        font-size:0.8rem; color:var(--text-primary); border:none; background:none;
        cursor:pointer; text-align:left;
      }
      .tf-ctx-item:hover { background:var(--bg-card-hover); }
      .tf-ctx-item--danger { color:var(--color-danger); }
      .tf-ctx-item--danger:hover { background:#ef444412; }
      .tf-ctx-divider { height:1px; background:var(--border-subtle); margin:4px 8px; }

      /* Board drag */
      .tf-board-card.tf-dragging { opacity:0.4; transform:rotate(2deg); }
      .tf-board-col.tf-board-col-hover { outline:2px dashed var(--brand-primary); outline-offset:-2px; background:var(--bg-tertiary); }
    `;
    document.head.appendChild(style);
  },

  _showNewTaskModal() {
    const projects = TBO_STORAGE.getAllErpEntities('project').filter(p => !TBO_CONFIG.business.projectFinalStatuses.includes(p.status));
    const team = this._getTeamMembers();
    const activeTasks = TBO_STORAGE.getAllErpEntities('task').filter(t => t.status !== 'concluida' && t.status !== 'cancelada');
    // For parent task select, only show top-level tasks (no deep nesting)
    const parentCandidates = activeTasks.filter(t => !t.parent_id);

    const html = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group">
          <label class="form-label">Titulo *</label>
          <input type="text" class="form-input" id="tfNewTitle" placeholder="Nome da tarefa">
        </div>
        <div class="form-group">
          <label class="form-label">Projeto *</label>
          <select class="form-input" id="tfNewProject">
            <option value="">Selecione...</option>
            ${projects.map(p => `<option value="${p.id}">${_escapeHtml(p.name)}</option>`).join('')}
          </select>
        </div>
        ${parentCandidates.length > 0 ? `
        <div class="form-group">
          <label class="form-label">Tarefa pai</label>
          <select class="form-input" id="tfNewParent" autocomplete="off">
            <option value="" selected>Nenhuma (tarefa independente)</option>
            ${parentCandidates.map(t => `<option value="${t.id}">${_escapeHtml(t.title || t.name) || t.id}</option>`).join('')}
          </select>
          <div style="font-size:0.68rem;color:var(--text-muted);margin-top:4px;">Selecione para criar como subtarefa de outra tarefa.</div>
        </div>
        ` : ''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label class="form-label">Responsavel</label>
            <select class="form-input" id="tfNewOwner">
              <option value="">Selecione...</option>
              ${team.map(t => `<option value="${_escapeHtml(t)}">${_escapeHtml(t)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Prioridade</label>
            <select class="form-input" id="tfNewPriority">
              ${TBO_CONFIG.business.priorities.map(p => `<option value="${p.id}"${p.id === TBO_CONFIG.business.defaultPriority ? ' selected' : ''}>${p.label}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label class="form-label">Prazo</label>
            <input type="date" class="form-input" id="tfNewDue">
          </div>
          <div class="form-group">
            <label class="form-label">Estimativa (h)</label>
            <input type="number" class="form-input" id="tfNewEstimate" min="0" step="0.5" placeholder="0">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Descricao</label>
          <textarea class="form-input" id="tfNewDesc" rows="3" placeholder="Detalhes da tarefa..."></textarea>
        </div>
        ${activeTasks.length > 0 ? `
        <div class="form-group">
          <label class="form-label">Depende de</label>
          <div id="tfNewDepsContainer" style="max-height:140px;overflow-y:auto;border:1px solid var(--border-default);border-radius:6px;padding:8px;">
            ${activeTasks.map(at => `
              <label style="display:flex;align-items:center;gap:6px;font-size:0.78rem;padding:3px 0;cursor:pointer;">
                <input type="checkbox" class="tfDepCheckbox" value="${at.id}">
                <span>${_escapeHtml(at.title || at.name) || at.id}</span>
              </label>
            `).join('')}
          </div>
          <div style="font-size:0.68rem;color:var(--text-muted);margin-top:4px;">Selecione tarefas que precisam ser concluidas antes desta.</div>
        </div>
        ` : ''}
        <button class="btn btn-primary" id="tfSaveNewTask" style="width:100%;">Criar Tarefa</button>
      </div>
    `;

    if (typeof TBO_MODAL !== 'undefined') {
      TBO_MODAL.show('Nova Tarefa', html);
      setTimeout(() => {
        const saveBtn = document.getElementById('tfSaveNewTask');
        if (saveBtn) saveBtn.addEventListener('click', () => this._saveNewTask());
      }, 100);
    }
  },

  _saveNewTask() {
    const title = document.getElementById('tfNewTitle')?.value?.trim();
    const projectId = document.getElementById('tfNewProject')?.value;
    if (!title || !projectId) {
      TBO_TOAST.error('Campos obrigatorios', 'Titulo e projeto sao obrigatorios.');
      return;
    }

    // Gather selected dependency IDs
    const depCheckboxes = document.querySelectorAll('.tfDepCheckbox:checked');
    const dependsOn = Array.from(depCheckboxes).map(cb => cb.value);

    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    // Tarefa pai: so atribuir se usuario selecionou explicitamente (valor nao vazio)
    const parentSelect = document.getElementById('tfNewParent');
    const parentId = (parentSelect && parentSelect.value && parentSelect.value.trim() !== '') ? parentSelect.value : null;
    const task = {
      title: title,
      name: title,
      project_id: projectId,
      parent_id: parentId,
      owner: document.getElementById('tfNewOwner')?.value || '',
      priority: document.getElementById('tfNewPriority')?.value || TBO_CONFIG.business.defaultPriority,
      due_date: document.getElementById('tfNewDue')?.value || null,
      estimate_minutes: parseFloat(document.getElementById('tfNewEstimate')?.value || 0) * 60 || 0,
      description: document.getElementById('tfNewDesc')?.value?.trim() || '',
      depends_on: dependsOn.length > 0 ? dependsOn : [],
      status: 'pendente',
      created_by: user?.id || 'system'
    };

    TBO_STORAGE.addErpEntity('task', task);
    if (typeof TBO_ERP !== 'undefined') {
      TBO_ERP.addAuditLog({ entityType: 'task', entityId: task.id, action: 'create', userId: user?.id || 'system', entityName: title });
    }
    TBO_TOAST.success('Tarefa criada', title);
    if (typeof TBO_MODAL !== 'undefined') TBO_MODAL.close();
    this._refreshLists();
  },

  destroy() {}
};
