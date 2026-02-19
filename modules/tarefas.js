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
          <select class="form-input" id="tfFilterStatus" style="max-width:150px;">
            <option value="">Todos status</option>
            ${sm ? sm.states.map(s => `<option value="${s}">${sm.labels[s]}</option>`).join('') : ''}
          </select>
          <select class="form-input" id="tfFilterOwner" style="max-width:150px;">
            <option value="">Todos responsaveis</option>
            ${team.map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
          <select class="form-input" id="tfFilterProject" style="max-width:180px;">
            <option value="">Todos projetos</option>
            ${activeProjects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          <select class="form-input" id="tfFilterPriority" style="max-width:130px;">
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

    // Organize tasks: parent tasks first, then their subtasks grouped underneath
    const ordered = this._orderWithSubtasks(filtered);

    return `<div class="card" style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-default);text-align:left;">
            <th style="padding:10px 8px;font-weight:600;">Tarefa</th>
            <th style="padding:10px 8px;font-weight:600;">Projeto</th>
            <th style="padding:10px 8px;font-weight:600;">Responsavel</th>
            <th style="padding:10px 8px;font-weight:600;">Prioridade</th>
            <th style="padding:10px 8px;font-weight:600;">Status</th>
            <th style="padding:10px 8px;font-weight:600;">Prazo</th>
            <th style="padding:10px 8px;font-weight:600;">Acoes</th>
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
            const rowBg = isSubtask ? 'background:var(--bg-secondary);' : '';

            return `<tr style="border-bottom:1px solid var(--border-subtle);${rowBg}" data-task-id="${t.id}">
              <td style="padding:10px 8px;${rowIndent}">
                <div style="font-weight:600;display:flex;align-items:center;">${subtaskPrefix}${blocked ? '<span title="Bloqueada por dependencias">\u{1F512}</span> ' : ''}${t.title || t.name || '-'}</div>
                ${t.description ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;${isSubtask ? 'margin-left:24px;' : ''}">${t.description}</div>` : ''}
                ${depNames.length > 0 ? `<div style="font-size:0.68rem;color:var(--text-muted);margin-top:2px;${isSubtask ? 'margin-left:24px;' : ''}">Depende de: ${depNames.join(', ')}</div>` : ''}
              </td>
              <td style="padding:10px 8px;"><span class="tag" style="font-size:0.7rem;">${projName}</span></td>
              <td style="padding:10px 8px;">${t.owner || '-'}</td>
              <td style="padding:10px 8px;"><span style="color:${pColor};font-weight:600;font-size:0.75rem;text-transform:uppercase;">${t.priority || '-'}</span></td>
              <td style="padding:10px 8px;">
                <span class="tag" style="background:${stateColor}20;color:${stateColor};font-size:0.7rem;">${stateLabel}</span>
                ${blocked ? ' <span class="tag" style="background:#ef444420;color:#ef4444;font-size:0.65rem;margin-left:4px;">Bloqueada</span>' : ''}
              </td>
              <td style="padding:10px 8px;${isOverdue ? 'color:#ef4444;font-weight:600;' : ''}">${dueStr}${isOverdue ? ' !' : ''}</td>
              <td style="padding:10px 8px;">
                <div style="display:flex;gap:4px;">
                  ${t.status !== 'concluida' && t.status !== 'cancelada' ? `
                    <select class="form-input tfTransition" data-id="${t.id}" style="font-size:0.72rem;padding:2px 6px;max-width:120px;">
                      <option value="">Mudar...</option>
                      ${sm ? this._getTransitions(t.status, sm).map(tr => `<option value="${tr.state}">${tr.label}</option>`).join('') : ''}
                    </select>
                  ` : ''}
                </div>
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

    return `<div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;">
      ${columns.map(state => {
        const stateTasks = this._applyFilters(activeTasks.filter(t => t.status === state), 'all');
        return `<div style="min-width:260px;flex:1;background:var(--bg-secondary);border-radius:8px;padding:12px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <div style="width:10px;height:10px;border-radius:50%;background:${sm.colors[state]};"></div>
            <span style="font-weight:600;font-size:0.82rem;">${sm.labels[state]}</span>
            <span class="tag" style="font-size:0.65rem;margin-left:auto;">${stateTasks.length}</span>
          </div>
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
              return `<div class="card" style="padding:10px;margin-bottom:8px;cursor:pointer;border-left:3px solid ${sm.colors[state]};${isSubtask ? 'margin-left:12px;' : ''}" data-task-id="${t.id}">
                ${isSubtask ? `<div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:3px;font-family:monospace;">\u2514\u2500 subtarefa${parentLabel ? ' de: ' + parentLabel : ''}</div>` : ''}
                <div style="font-weight:600;font-size:0.8rem;margin-bottom:4px;">${blocked ? '<span title="Bloqueada por dependencias">\u{1F512}</span> ' : ''}${t.title || t.name || '-'}</div>
                ${blocked ? '<div style="margin-bottom:4px;"><span class="tag" style="background:#ef444420;color:#ef4444;font-size:0.62rem;">Bloqueada</span></div>' : ''}
                ${projName ? `<div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:4px;">${projName}</div>` : ''}
                ${depNames.length > 0 ? `<div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:4px;">Depende de: ${depNames.join(', ')}</div>` : ''}
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.7rem;">
                  <span style="color:var(--text-secondary);">${t.owner || '-'}</span>
                  ${t.due_date ? `<span style="color:${isOverdue ? '#ef4444' : 'var(--text-muted)'};">${new Date(t.due_date).toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit'})}</span>` : ''}
                </div>
              </div>`;
            }).join('')}
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

    // Transitions
    document.querySelectorAll('.tfTransition').forEach(sel => {
      sel.addEventListener('change', () => {
        const taskId = sel.dataset.id;
        const newState = sel.value;
        if (!newState || typeof TBO_ERP === 'undefined') return;
        const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;

        // Warn if transitioning to em_andamento with unresolved dependencies
        if (newState === 'em_andamento') {
          const allTasks = TBO_STORAGE.getAllErpEntities('task');
          const task = allTasks.find(t => t.id === taskId);
          if (task && this._hasUnresolvedDeps(task, allTasks)) {
            const depNames = this._getDependencyNames(task, allTasks);
            TBO_TOAST.warning('Dependencias pendentes', `Esta tarefa depende de: ${depNames.join(', ')}. Considere resolver as dependencias primeiro.`);
          }
        }

        const result = TBO_ERP.transition('task', taskId, newState, user?.id || 'system');
        if (result.ok) {
          TBO_TOAST.success('Tarefa atualizada', `${result.from} \u2192 ${result.to}`);
          this._refreshLists();
        } else {
          TBO_TOAST.error('Erro', result.error);
        }
      });
    });

    // New task button
    const btnNew = document.getElementById('tfBtnNewTask');
    if (btnNew) btnNew.addEventListener('click', () => this._showNewTaskModal());
  },

  _refreshLists() {
    const container = document.getElementById('moduleContainer');
    if (container) {
      container.innerHTML = this.render();
      this.init();
    }
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
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>
        ${parentCandidates.length > 0 ? `
        <div class="form-group">
          <label class="form-label">Tarefa pai</label>
          <select class="form-input" id="tfNewParent">
            <option value="">Nenhuma (tarefa independente)</option>
            ${parentCandidates.map(t => `<option value="${t.id}">${t.title || t.name || t.id}</option>`).join('')}
          </select>
          <div style="font-size:0.68rem;color:var(--text-muted);margin-top:4px;">Selecione para criar como subtarefa de outra tarefa.</div>
        </div>
        ` : ''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label class="form-label">Responsavel</label>
            <select class="form-input" id="tfNewOwner">
              <option value="">Selecione...</option>
              ${team.map(t => `<option value="${t}">${t}</option>`).join('')}
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
                <span>${at.title || at.name || at.id}</span>
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
    const parentId = document.getElementById('tfNewParent')?.value || null;
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
