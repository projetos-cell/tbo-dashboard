// TBO OS — Module: Gestao de Projetos (ERP MVP)
// State machine, phases, deliverables, ownership, next_action, health score
const TBO_PROJETOS = {
  _filters: { status: '', owner: '', search: '' },

  _getTeamMembers() {
    if (typeof TBO_RH !== 'undefined' && TBO_RH._team) return TBO_RH._team;
    const ctx = TBO_STORAGE.get('context');
    const equipe = ctx.dados_comerciais?.[TBO_CONFIG.app.fiscalYear]?.fluxo_caixa?.despesas_detalhadas?.pessoas?.equipe || [];
    return equipe.map(e => e.nome);
  },

  render() {
    // Init ERP on first render
    if (typeof TBO_ERP !== 'undefined') TBO_ERP.init();

    const context = TBO_STORAGE.get('context');
    const finalizados = context.projetos_finalizados || {};
    let totalFinalizados = 0;
    Object.values(finalizados).forEach(arr => { totalFinalizados += arr.length; });

    // ERP projects
    const projects = TBO_STORAGE.getAllErpEntities('project');
    const active = projects.filter(p => !['finalizado','cancelado'].includes(p.status));
    const byStatus = {};
    active.forEach(p => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });

    // Health scores
    let healthSum = 0;
    const atRisk = [];
    active.forEach(p => {
      if (typeof TBO_ERP !== 'undefined') {
        const h = TBO_ERP.calculateHealthScore(p);
        healthSum += h.score;
        if (h.score < 50) atRisk.push({ project: p, health: h });
      }
    });
    const avgHealth = active.length > 0 ? Math.round(healthSum / active.length) : 100;
    const healthColor = typeof TBO_ERP !== 'undefined' ? TBO_ERP.getHealthColor(avgHealth) : '#22c55e';

    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.project : null;
    const team = this._getTeamMembers();

    // Deadline risk count
    let deadlineRiskCount = 0;
    if (typeof TBO_ERP !== 'undefined') {
      active.forEach(p => {
        const dl = TBO_ERP.getDeadlineInfo(p);
        if (dl.urgency === 'overdue' || dl.urgency === 'critical') deadlineRiskCount++;
      });
    }

    return `
      <div class="projetos-module">
        <!-- KPIs -->
        <div class="grid-6" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Projetos Ativos</div>
            <div class="kpi-value">${active.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Saude Media</div>
            <div class="kpi-value" style="color:${healthColor};">${avgHealth}/100</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Em Risco</div>
            <div class="kpi-value" style="color:${atRisk.length > 0 ? '#ef4444' : '#22c55e'};">${atRisk.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Entregues</div>
            <div class="kpi-value">${totalFinalizados}+</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Em Producao</div>
            <div class="kpi-value">${byStatus['producao'] || 0}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Risco de Prazo</div>
            <div class="kpi-value" style="color:${deadlineRiskCount > 0 ? '#ef4444' : '#22c55e'};">${deadlineRiskCount}</div>
            <div class="kpi-detail">${deadlineRiskCount > 0 ? 'atrasados/criticos' : 'tudo em dia'}</div>
          </div>
        </div>

        <!-- Status Pipeline Mini -->
        ${sm ? `
        <div class="card" style="margin-bottom:20px;padding:16px;">
          <div style="display:flex;gap:4px;align-items:flex-end;height:60px;">
            ${sm.states.filter(s => s !== 'cancelado').map(s => {
              const count = byStatus[s] || 0;
              const maxCount = Math.max(...Object.values(byStatus), 1);
              const pct = count > 0 ? Math.max(15, (count / maxCount) * 100) : 8;
              return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
                <span style="font-size:0.65rem;color:var(--text-muted);">${count}</span>
                <div style="width:100%;height:${pct}%;min-height:4px;background:${sm.colors[s]};border-radius:3px;transition:height 0.3s;"></div>
                <span style="font-size:0.6rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:80px;">${sm.labels[s]}</span>
              </div>`;
            }).join('')}
          </div>
        </div>` : ''}

        <!-- Tabs -->
        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="pj-board">Board</button>
          <button class="tab" data-tab="pj-lista">Lista</button>
          <button class="tab" data-tab="pj-mytasks">Minhas Tarefas</button>
          <button class="tab" data-tab="pj-tarefas">Tarefas</button>
          <button class="tab" data-tab="pj-entregaveis">Entregaveis</button>
          <button class="tab" data-tab="pj-tempo">Tempo</button>
          <button class="tab" data-tab="pj-carga">Carga</button>
          <button class="tab" data-tab="pj-gantt">Gantt</button>
          <button class="tab" data-tab="pj-finalizados">Finalizados</button>
          <button class="tab" data-tab="pj-prep">Prep de Reuniao</button>
          <button class="tab" data-tab="pj-auditlog">Historico</button>
        </div>

        <!-- Filters -->
        <div class="card" style="padding:12px;margin-bottom:16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
          <select class="form-input" id="pjFilterStatus" style="max-width:160px;">
            <option value="">Todos status</option>
            ${sm ? sm.states.map(s => `<option value="${s}">${sm.labels[s]}</option>`).join('') : ''}
          </select>
          <select class="form-input" id="pjFilterOwner" style="max-width:160px;">
            <option value="">Todos responsaveis</option>
            ${team.map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
          <input type="text" class="form-input" id="pjFilterSearch" placeholder="Buscar..." style="max-width:200px;">
          <button class="btn btn-primary" id="pjBtnNewProject" style="margin-left:auto;">+ Novo Projeto</button>
        </div>

        <!-- Tab: Board (Kanban by status) -->
        <div class="tab-content active" id="tab-pj-board">
          ${this._renderBoard(projects, sm)}
        </div>

        <!-- Tab: Lista -->
        <div class="tab-content" id="tab-pj-lista" style="display:none;">
          <div id="pjListContainer">${this._renderList(active)}</div>
        </div>

        <!-- Tab: Minhas Tarefas -->
        <div class="tab-content" id="tab-pj-mytasks" style="display:none;">
          ${this._renderMyTasks()}
        </div>

        <!-- Tab: Tarefas -->
        <div class="tab-content" id="tab-pj-tarefas" style="display:none;">
          ${this._renderTasks()}
        </div>

        <!-- Tab: Entregaveis -->
        <div class="tab-content" id="tab-pj-entregaveis" style="display:none;">
          ${this._renderDeliverables()}
        </div>

        <!-- Tab: Tempo (Timesheet) -->
        <div class="tab-content" id="tab-pj-tempo" style="display:none;">
          ${this._renderTimesheetTab()}
        </div>

        <!-- Tab: Carga (Workload/Capacity) -->
        <div class="tab-content" id="tab-pj-carga" style="display:none;">
          ${this._renderWorkloadTab()}
        </div>

        <!-- Tab: Gantt -->
        <div class="tab-content" id="tab-pj-gantt" style="display:none;">
          ${this._renderGanttTab()}
        </div>

        <!-- Finalized Projects -->
        <div class="tab-content" id="tab-pj-finalizados" style="display:none;">
          ${Object.entries(finalizados).sort((a, b) => b[0] - a[0]).map(([year, projs]) => `
            <div style="margin-bottom:20px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <h3 style="font-size:1rem;font-weight:700;color:var(--text-primary);">${year}</h3>
                <span class="tag">${projs.length}</span>
              </div>
              <div class="grid-3">
                ${projs.map(name => `<div class="card" style="padding:12px;"><div style="font-size:0.85rem;">${name}</div></div>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Meeting Prep -->
        <div class="tab-content" id="tab-pj-prep" style="display:none;">
          <div class="card">
            <div class="card-header"><h3 class="card-title">Preparacao para Reuniao</h3></div>
            <div class="form-group">
              <label class="form-label">Projeto</label>
              <select class="form-input" id="pjPrepProjeto">
                <option value="">Selecione</option>
                ${active.map(p => `<option value="${_escapeHtml(p.name)}">${_escapeHtml(p.name)} (${_escapeHtml(p.client)})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Objetivo da reuniao</label>
              <input type="text" class="form-input" id="pjPrepObj" placeholder="Ex: Apresentacao de conceito, revisao de renders...">
            </div>
            <button class="btn btn-primary" id="pjGerarPrep" style="width:100%;">Preparar Briefing</button>
          </div>
          <div id="pjPrepOutput" class="ai-result" style="min-height:200px; margin-top:16px;">
            <div class="empty-state"><div class="empty-state-text">Resultado aparecera aqui</div></div>
          </div>
        </div>

        <!-- Audit Log -->
        <div class="tab-content" id="tab-pj-auditlog" style="display:none;">
          ${this._renderAuditLog()}
        </div>

        <!-- Project Detail Modal placeholder -->
        <div id="pjDetailPanel" class="card" style="display:none; margin-top:24px;"></div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BOARD (Kanban by project status)
  // ═══════════════════════════════════════════════════════════════════════════

  _renderBoard(projects, sm) {
    if (!sm) return '<div class="empty-state"><div class="empty-state-text">ERP nao inicializado</div></div>';
    const visibleStates = sm.states.filter(s => s !== 'cancelado');
    const filtered = this._applyProjectFilters(projects);

    return `<div class="pipeline-board" id="pjKanban">
      ${visibleStates.map(state => {
        const stateProjects = filtered.filter(p => p.status === state);
        return `<div class="pipeline-column" data-state="${state}">
          <div class="pipeline-column-header" style="border-bottom: 2px solid ${sm.colors[state]};">
            <span>${sm.labels[state]}</span>
            <span class="tag" style="font-size:0.68rem;">${stateProjects.length}</span>
          </div>
          <div class="pipeline-column-body" data-state="${state}">
            ${stateProjects.map(p => this._renderProjectCard(p)).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },

  _renderProjectCard(p) {
    const health = typeof TBO_ERP !== 'undefined' ? TBO_ERP.calculateHealthScore(p) : { score: 100, level: 'healthy' };
    const healthColor = typeof TBO_ERP !== 'undefined' ? TBO_ERP.getHealthColor(health.score) : '#22c55e';
    const tasks = TBO_STORAGE.getErpEntitiesByParent('task', p.id);
    const doneTasks = tasks.filter(t => t.status === 'concluida').length;
    const ownerInitials = p.owner ? (typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.initials(p.owner) : p.owner.charAt(0)) : '?';

    return `<div class="pipeline-card erp-project-card" draggable="true" data-id="${p.id}" onclick="TBO_ROUTER.navigate('projeto/${p.id}/list')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="flex:1;min-width:0;">
          ${p.code ? `<div style="font-size:0.6rem;color:var(--text-muted);font-family:monospace;letter-spacing:0.03em;margin-bottom:1px;">${p.code}</div>` : ''}
          <div style="font-weight:600;font-size:0.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_escapeHtml(p.name)}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">${_escapeHtml(p.client) || ''}</div>
        </div>
        <div class="deal-owner-badge" title="${_escapeHtml(p.owner) || 'Sem responsavel'}" style="background:${p.owner ? 'var(--accent)' : '#ef4444'};">${ownerInitials}</div>
      </div>
      ${p.next_action ? `<div style="font-size:0.68rem;color:var(--accent-gold);margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${_escapeHtml(p.next_action)}">
        \u25B6 ${_escapeHtml(p.next_action)}
      </div>` : (p.status !== 'finalizado' && p.status !== 'pausado' ? '<div style="font-size:0.68rem;color:#ef4444;margin-top:6px;">\u26A0 Sem proxima acao</div>' : '')}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
        ${tasks.length > 0 ? `<div style="font-size:0.65rem;color:var(--text-muted);">${doneTasks}/${tasks.length} tarefas</div>` : '<span></span>'}
        <div style="display:flex;align-items:center;gap:4px;">
          <div style="width:8px;height:8px;border-radius:50%;background:${healthColor};" title="Saude: ${health.score}/100"></div>
          <span style="font-size:0.65rem;color:${healthColor};">${health.score}</span>
        </div>
      </div>
      ${(p.services || []).length > 0 ? `<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:6px;">
        ${p.services.slice(0, 3).map(s => `<span class="deal-service-tag">${s}</span>`).join('')}
        ${p.services.length > 3 ? `<span class="deal-service-tag">+${p.services.length - 3}</span>` : ''}
      </div>` : ''}
      ${(() => {
        if (typeof TBO_ERP === 'undefined') return '';
        const dl = TBO_ERP.getDeadlineInfo(p);
        if (!dl.hasDeadline || dl.urgency === 'none') return '';
        return `<div style="display:flex;align-items:center;gap:4px;margin-top:6px;padding-top:6px;border-top:1px solid var(--border-subtle);">
          <span style="font-size:0.62rem;color:${dl.urgencyColor};font-weight:600;">${dl.label}</span>
          ${dl.progressPercent !== null ? `<div style="flex:1;height:3px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;">
            <div style="width:${dl.progressPercent}%;height:100%;background:${dl.urgencyColor};border-radius:2px;"></div>
          </div>` : ''}
        </div>`;
      })()}
    </div>`;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST VIEW (Asana-like table with sortable columns)
  // ═══════════════════════════════════════════════════════════════════════════

  _listSort: 'name', // 'name', 'status', 'owner', 'health', 'value', 'tasks'
  _listSortDir: 'asc',

  _renderList(projects) {
    let filtered = this._applyProjectFilters(projects);
    if (filtered.length === 0) return '<div class="empty-state"><div class="empty-state-text">Nenhum projeto encontrado</div></div>';
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.project : null;

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let cmp = 0;
      const s = this._listSort;
      if (s === 'name') cmp = (a.name || '').localeCompare(b.name || '');
      else if (s === 'status') cmp = (a.status || '').localeCompare(b.status || '');
      else if (s === 'owner') cmp = (a.owner || '').localeCompare(b.owner || '');
      else if (s === 'health') {
        const ha = typeof TBO_ERP !== 'undefined' ? TBO_ERP.calculateHealthScore(a).score : 100;
        const hb = typeof TBO_ERP !== 'undefined' ? TBO_ERP.calculateHealthScore(b).score : 100;
        cmp = ha - hb;
      }
      else if (s === 'value') cmp = (a.value || 0) - (b.value || 0);
      else if (s === 'tasks') {
        const ta = TBO_STORAGE.getErpEntitiesByParent('task', a.id).length;
        const tb = TBO_STORAGE.getErpEntitiesByParent('task', b.id).length;
        cmp = ta - tb;
      }
      return this._listSortDir === 'desc' ? -cmp : cmp;
    });

    const sortIcon = (col) => {
      if (this._listSort !== col) return '<span style="opacity:0.3;">&#8645;</span>';
      return this._listSortDir === 'asc' ? '&#9650;' : '&#9660;';
    };

    return `
      <!-- Sort controls -->
      <div class="asana-table">
        <div class="asana-table-header">
          <div class="asana-col asana-col--code">Codigo</div>
          <div class="asana-col asana-col--name" data-sort-col="name" onclick="TBO_PROJETOS._toggleListSort('name')">Nome ${sortIcon('name')}</div>
          <div class="asana-col asana-col--status" data-sort-col="status" onclick="TBO_PROJETOS._toggleListSort('status')">Status ${sortIcon('status')}</div>
          <div class="asana-col asana-col--owner" data-sort-col="owner" onclick="TBO_PROJETOS._toggleListSort('owner')">Responsavel ${sortIcon('owner')}</div>
          <div class="asana-col asana-col--health" data-sort-col="health" onclick="TBO_PROJETOS._toggleListSort('health')">Saude ${sortIcon('health')}</div>
          <div class="asana-col asana-col--tasks" data-sort-col="tasks" onclick="TBO_PROJETOS._toggleListSort('tasks')">Tarefas ${sortIcon('tasks')}</div>
          <div class="asana-col asana-col--deadline">Prazo</div>
          <div class="asana-col asana-col--value" data-sort-col="value" onclick="TBO_PROJETOS._toggleListSort('value')">Valor ${sortIcon('value')}</div>
        </div>
        ${filtered.map(p => {
          const health = typeof TBO_ERP !== 'undefined' ? TBO_ERP.calculateHealthScore(p) : { score: 100 };
          const healthColor = typeof TBO_ERP !== 'undefined' ? TBO_ERP.getHealthColor(health.score) : '#22c55e';
          const stateColor = sm ? sm.colors[p.status] || '#94a3b8' : '#94a3b8';
          const stateLabel = sm ? sm.labels[p.status] || p.status : p.status;
          const tasks = TBO_STORAGE.getErpEntitiesByParent('task', p.id);
          const doneTasks = tasks.filter(t => t.status === 'concluida').length;
          const pctDone = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
          const ownerInitials = p.owner ? (typeof TBO_PERMISSIONS !== 'undefined' ? TBO_PERMISSIONS.getInitials(p.owner) : p.owner.charAt(0)) : '?';

          return `<div class="asana-table-row" onclick="TBO_ROUTER.navigate('projeto/${p.id}/list')">
            <div class="asana-col asana-col--code" style="font-size:0.72rem;font-family:monospace;color:var(--text-muted);">${p.code || '-'}</div>
            <div class="asana-col asana-col--name">
              <div style="width:8px;height:8px;border-radius:50%;background:${stateColor};flex-shrink:0;"></div>
              <div style="flex:1;min-width:0;">
                <div style="font-weight:600;font-size:0.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_escapeHtml(p.name)}</div>
                <div style="font-size:0.68rem;color:var(--text-muted);">${_escapeHtml(p.client) || ''}</div>
              </div>
            </div>
            <div class="asana-col asana-col--status">
              <span class="tag" style="font-size:0.62rem;background:${stateColor}20;color:${stateColor};border:1px solid ${stateColor}40;">${stateLabel}</span>
            </div>
            <div class="asana-col asana-col--owner">
              <div class="deal-owner-badge" style="width:26px;height:26px;font-size:0.6rem;background:${p.owner ? 'var(--accent)' : '#6b7280'};" title="${_escapeHtml(p.owner) || 'Sem responsavel'}">${ownerInitials}</div>
              <span style="font-size:0.75rem;">${_escapeHtml(p.owner) || '-'}</span>
            </div>
            <div class="asana-col asana-col--health">
              <div style="width:36px;height:4px;background:var(--bg-elevated);border-radius:2px;overflow:hidden;">
                <div style="height:100%;width:${health.score}%;background:${healthColor};border-radius:2px;"></div>
              </div>
              <span style="font-size:0.7rem;color:${healthColor};font-weight:600;">${health.score}</span>
            </div>
            <div class="asana-col asana-col--tasks">
              ${tasks.length > 0 ? `
                <div style="width:36px;height:4px;background:var(--bg-elevated);border-radius:2px;overflow:hidden;">
                  <div style="height:100%;width:${pctDone}%;background:#22c55e;border-radius:2px;"></div>
                </div>
                <span style="font-size:0.7rem;color:var(--text-muted);">${doneTasks}/${tasks.length}</span>
              ` : '<span style="font-size:0.7rem;color:var(--text-muted);">-</span>'}
            </div>
            <div class="asana-col asana-col--deadline">
              ${(() => {
                if (typeof TBO_ERP === 'undefined') return '-';
                const dl = TBO_ERP.getDeadlineInfo(p);
                if (!dl.hasDeadline) return '<span style="font-size:0.72rem;color:var(--text-muted);">-</span>';
                return `<span style="font-size:0.72rem;color:${dl.urgencyColor};font-weight:${dl.urgency === 'overdue' || dl.urgency === 'critical' ? '700' : '400'};">${dl.label}</span>`;
              })()}
            </div>
            <div class="asana-col asana-col--value">
              <span style="font-size:0.78rem;font-weight:600;color:var(--accent-gold);">${p.value ? (typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.currency(p.value) : 'R$' + p.value) : '-'}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  _toggleListSort(col) {
    if (this._listSort === col) {
      this._listSortDir = this._listSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this._listSort = col;
      this._listSortDir = 'asc';
    }
    this._refreshBoard();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TASKS TAB
  // ═══════════════════════════════════════════════════════════════════════════

  _renderTasks() {
    const tasks = TBO_STORAGE.getAllErpEntities('task');
    const pending = tasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada');
    const overdue = pending.filter(t => t.due_date && new Date(t.due_date) < new Date());
    const today = new Date().toISOString().split('T')[0];
    const dueToday = pending.filter(t => t.due_date === today);

    return `
      <div class="grid-3" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Tarefas Pendentes</div><div class="kpi-value">${pending.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Vencem Hoje</div><div class="kpi-value" style="color:${dueToday.length > 0 ? '#f59e0b' : '#22c55e'};">${dueToday.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Atrasadas</div><div class="kpi-value" style="color:${overdue.length > 0 ? '#ef4444' : '#22c55e'};">${overdue.length}</div></div>
      </div>
      <div id="pjTasksList">
        ${pending.length === 0 ? '<div class="empty-state"><div class="empty-state-text">Nenhuma tarefa pendente. Aplique um playbook a um projeto para gerar tarefas automaticas.</div></div>' : ''}
        ${pending.sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return a.due_date.localeCompare(b.due_date);
        }).map(t => {
          const isOverdue = t.due_date && t.due_date < today;
          const isToday = t.due_date === today;
          const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
          const stateColor = sm ? sm.colors[t.status] || '#94a3b8' : '#94a3b8';
          return `<div class="card" style="margin-bottom:6px;padding:12px;${isOverdue ? 'border-left:3px solid #ef4444;' : isToday ? 'border-left:3px solid #f59e0b;' : ''}">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <input type="checkbox" ${t.status === 'concluida' ? 'checked' : ''} onchange="TBO_PROJETOS._toggleTask('${t.id}', this.checked)" style="cursor:pointer;">
                  <span style="font-weight:600;font-size:0.82rem;">${TBO_FORMATTER.escapeHtml(t.title || t.name)}</span>
                  <span class="tag" style="font-size:0.62rem;background:${stateColor}20;color:${stateColor};">${sm ? sm.labels[t.status] : t.status}</span>
                  ${t.estimate_minutes ? `<span style="font-size:0.62rem;color:var(--text-muted);">${TBO_WORKLOAD ? TBO_WORKLOAD.formatHoursMinutes(t.estimate_minutes) : t.estimate_minutes + 'min'}</span>` : ''}
                </div>
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">
                  ${t.project_name ? _escapeHtml(t.project_name) + ' | ' : ''}${t.owner ? _escapeHtml(t.owner) : '<span style="color:#ef4444;">Sem responsavel</span>'}
                  ${t.due_date ? ' | ' + (isOverdue ? '<span style="color:#ef4444;">' : isToday ? '<span style="color:#f59e0b;">' : '<span>') + t.due_date + '</span>' : ''}
                  ${t.phase ? ' | ' + t.phase : ''}
                </div>
              </div>
              ${t.project_id && t.status !== 'concluida' ? `<button class="btn btn-secondary" style="font-size:0.68rem;padding:3px 8px;margin-left:8px;flex-shrink:0;" onclick="event.stopPropagation();TBO_PROJETOS._startTimerForTask('${t.project_id}','${t.id}','${(t.title || t.name || '').replace(/'/g, "\\'")}');" title="Iniciar timer">&#9654;</button>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DELIVERABLES TAB
  // ═══════════════════════════════════════════════════════════════════════════

  _renderDeliverables() {
    const deliverables = TBO_STORAGE.getAllErpEntities('deliverable');
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.deliverable : null;
    const pending = deliverables.filter(d => d.status !== 'entregue');
    const inReview = deliverables.filter(d => d.status === 'em_revisao');

    return `
      <div class="grid-3" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Total Entregaveis</div><div class="kpi-value">${deliverables.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Em Revisao</div><div class="kpi-value" style="color:${inReview.length > 0 ? '#f59e0b' : '#22c55e'};">${inReview.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Pendentes</div><div class="kpi-value">${pending.length}</div></div>
      </div>
      <div id="pjDeliverableslist">
        ${deliverables.length === 0 ? '<div class="empty-state"><div class="empty-state-text">Nenhum entregavel. Aplique um playbook ou crie entregaveis manualmente.</div></div>' : ''}
        ${deliverables.map(d => {
          const stateColor = sm ? sm.colors[d.status] || '#94a3b8' : '#94a3b8';
          const stateLabel = sm ? sm.labels[d.status] || d.status : d.status;
          const versions = d.versions || [];
          return `<div class="card" style="margin-bottom:6px;padding:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="font-weight:600;font-size:0.82rem;">${_escapeHtml(d.name)}</span>
                  <span class="tag" style="font-size:0.62rem;background:${stateColor}20;color:${stateColor};">${stateLabel}</span>
                  ${d.current_version ? `<span class="tag" style="font-size:0.62rem;">${d.current_version}</span>` : ''}
                </div>
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">
                  ${_escapeHtml(d.project_name) || ''} | ${_escapeHtml(d.owner) || 'Sem responsavel'} | ${versions.length} versao(es)
                </div>
              </div>
              <div style="display:flex;gap:4px;">
                ${d.status === 'em_producao' || d.status === 'pendente' ? `<button class="btn btn-secondary" style="font-size:0.68rem;padding:3px 8px;" onclick="TBO_PROJETOS._addVersion('${d.id}')">+ Versao</button>` : ''}
                ${d.status === 'em_revisao' ? `
                  <button class="btn btn-secondary" style="font-size:0.68rem;padding:3px 8px;color:#22c55e;" onclick="TBO_PROJETOS._approveDeliverable('${d.id}')">Aprovar</button>
                  <button class="btn btn-secondary" style="font-size:0.68rem;padding:3px 8px;color:#ef4444;" onclick="TBO_PROJETOS._requestRevision('${d.id}')">Revisao</button>
                ` : ''}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB: TEMPO (Timesheet)
  // ═══════════════════════════════════════════════════════════════════════════

  _timesheetWeekOffset: 0,

  _renderTimesheetTab() {
    const userId = typeof TBO_AUTH !== 'undefined' ? (TBO_AUTH.getCurrentUser()?.id || null) : null;
    if (!userId || typeof TBO_WORKLOAD === 'undefined') {
      return '<div class="empty-state"><div class="empty-state-text">Login necessario para usar Timesheet</div></div>';
    }

    const today = TBO_WORKLOAD._today();
    const baseWeek = new Date();
    baseWeek.setDate(baseWeek.getDate() + this._timesheetWeekOffset * 7);
    const weekStart = TBO_WORKLOAD.getWeekStart(baseWeek);
    const ts = TBO_WORKLOAD.getWeeklyTimesheet(userId, weekStart);

    // KPIs
    const todayEntries = TBO_WORKLOAD.getTimeEntries({ userId, dateFrom: today, dateTo: today });
    const todayMinutes = todayEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
    const weekEntries = ts.entries;
    const billableEntries = weekEntries.filter(e => e.billable);
    const billablePct = weekEntries.length > 0 ? Math.round((billableEntries.length / weekEntries.length) * 100) : 0;

    // Active projects for quick timer
    const projects = TBO_STORAGE.getAllErpEntities('project').filter(p => !['finalizado','cancelado'].includes(p.status));

    // Running timer
    const runningTimer = TBO_WORKLOAD.getRunningTimer(userId);

    return `
      <!-- KPIs -->
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="kpi-card">
          <div class="kpi-label">Horas Hoje</div>
          <div class="kpi-value" style="color:var(--accent-gold);">${TBO_WORKLOAD.formatHoursMinutes(todayMinutes)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Horas Semana</div>
          <div class="kpi-value">${TBO_WORKLOAD.formatHoursMinutes(ts.weekTotal)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Entradas</div>
          <div class="kpi-value">${weekEntries.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">% Billable</div>
          <div class="kpi-value">${billablePct}%</div>
        </div>
      </div>

      <!-- Quick Timer -->
      <div class="card" style="padding:14px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="font-weight:700;font-size:0.82rem;">Quick Timer</span>
          ${runningTimer ? '<span class="tag" style="background:#22c55e30;color:#22c55e;font-size:0.68rem;">Timer ativo</span>' : ''}
        </div>
        ${runningTimer ? `
          <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--accent-gold)10;border:1px solid var(--accent-gold)30;border-radius:8px;">
            <div style="flex:1;">
              <div style="font-weight:600;font-size:0.82rem;">${(() => { const p = TBO_STORAGE.getErpEntity('project', runningTimer.project_id); return p ? _escapeHtml(p.name) : ''; })()}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);">${_escapeHtml(runningTimer.description) || ''}</div>
            </div>
            <div style="font-family:monospace;font-size:1.1rem;font-weight:700;color:var(--accent-gold);" id="tsTimerClock">--:--</div>
            <button class="btn btn-primary" style="font-size:0.78rem;padding:6px 14px;background:#ef4444;" id="tsStopTimer">Parar</button>
          </div>
        ` : `
          <div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;">
            <div style="flex:1;min-width:140px;">
              <label class="form-label" style="font-size:0.7rem;">Projeto</label>
              <select class="form-input" id="tsTimerProject" style="font-size:0.78rem;">
                <option value="">Selecione...</option>
                ${projects.map(p => `<option value="${p.id}">${_escapeHtml(p.name)}</option>`).join('')}
              </select>
            </div>
            <div style="flex:1;min-width:140px;">
              <label class="form-label" style="font-size:0.7rem;">Tarefa (opcional)</label>
              <select class="form-input" id="tsTimerTask" style="font-size:0.78rem;">
                <option value="">Geral</option>
              </select>
            </div>
            <div style="flex:1;min-width:140px;">
              <label class="form-label" style="font-size:0.7rem;">Descricao</label>
              <input type="text" class="form-input" id="tsTimerDesc" placeholder="O que voce esta fazendo?" style="font-size:0.78rem;">
            </div>
            <button class="btn btn-primary" id="tsStartTimer" style="font-size:0.78rem;padding:6px 14px;white-space:nowrap;">&#9654; Iniciar</button>
          </div>
          <div style="margin-top:8px;">
            <button class="btn btn-secondary" id="tsManualEntry" style="font-size:0.72rem;padding:4px 10px;">+ Lancamento Manual</button>
          </div>
        `}
      </div>

      <!-- Weekly Grid -->
      <div class="card" style="padding:14px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <button class="btn btn-secondary" id="tsPrevWeek" style="font-size:0.72rem;padding:4px 10px;">&lt; Anterior</button>
          <span style="font-weight:700;font-size:0.85rem;">
            ${ts.days[0].slice(8)}/${ts.days[0].slice(5,7)} - ${ts.days[4].slice(8)}/${ts.days[4].slice(5,7)}
            ${this._timesheetWeekOffset === 0 ? '<span style="color:var(--accent-gold);font-size:0.72rem;"> (atual)</span>' : ''}
          </span>
          <button class="btn btn-secondary" id="tsNextWeek" style="font-size:0.72rem;padding:4px 10px;">Proxima &gt;</button>
        </div>
        <div class="timesheet-grid">
          <!-- Header -->
          <div class="timesheet-cell timesheet-cell--header">Projeto</div>
          ${ts.days.map(d => `<div class="timesheet-cell timesheet-cell--header">${TBO_WORKLOAD._dayLabel(d)} ${d.slice(8)}</div>`).join('')}
          <div class="timesheet-cell timesheet-cell--header">Total</div>
          <!-- Rows per project -->
          ${ts.projects.length > 0 ? ts.projects.map(pr => `
            <div class="timesheet-cell timesheet-cell--project">${_escapeHtml(pr.project_name)}</div>
            ${ts.days.map(d => {
              const mins = pr.days[d] || 0;
              return `<div class="timesheet-cell${mins === 0 ? ' timesheet-cell--empty' : ''}">${mins > 0 ? TBO_WORKLOAD.formatHoursMinutes(mins) : '-'}</div>`;
            }).join('')}
            <div class="timesheet-cell timesheet-cell--total">${TBO_WORKLOAD.formatHoursMinutes(pr.total)}</div>
          `).join('') : `
            <div class="timesheet-cell" style="grid-column:1/-1;text-align:center;color:var(--text-muted);font-size:0.78rem;padding:20px;">
              Nenhum apontamento nesta semana
            </div>
          `}
          <!-- Totals row -->
          ${ts.projects.length > 0 ? `
            <div class="timesheet-cell timesheet-cell--total" style="border-top:2px solid var(--border-subtle);">TOTAL</div>
            ${ts.days.map(d => {
              const mins = ts.dayTotals[d] || 0;
              const isMissing = d <= today && TBO_WORKLOAD._isWorkday(d) && mins === 0;
              return `<div class="timesheet-cell timesheet-cell--total${isMissing ? ' timesheet-cell--missing' : ''}" style="border-top:2px solid var(--border-subtle);">${mins > 0 ? TBO_WORKLOAD.formatHoursMinutes(mins) : '-'}</div>`;
            }).join('')}
            <div class="timesheet-cell timesheet-cell--total" style="border-top:2px solid var(--border-subtle);color:var(--accent-gold);font-size:0.9rem;">${TBO_WORKLOAD.formatHoursMinutes(ts.weekTotal)}</div>
          ` : ''}
        </div>
        ${ts.missingDays.length > 0 ? `
          <div style="margin-top:8px;font-size:0.72rem;color:#f59e0b;">
            &#9888; Dias sem apontamento: ${ts.missingDays.map(d => TBO_WORKLOAD._dayLabel(d) + ' ' + d.slice(8)).join(', ')}
          </div>
        ` : ''}
      </div>

      <!-- Today's entries -->
      <div class="card" style="padding:14px;">
        <h4 style="font-size:0.85rem;font-weight:700;margin-bottom:10px;">Entradas de Hoje (${todayEntries.length})</h4>
        ${todayEntries.length === 0 ? '<div style="font-size:0.78rem;color:var(--text-muted);">Nenhuma entrada hoje</div>' : `
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${todayEntries.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')).map(e => {
              const project = TBO_STORAGE.getErpEntity('project', e.project_id);
              return `<div style="display:flex;align-items:center;gap:10px;padding:8px;background:var(--bg-elevated);border-radius:6px;font-size:0.78rem;">
                <span style="font-family:monospace;color:var(--text-muted);min-width:90px;">${e.start_time || '--:--'} - ${e.end_time || '--:--'}</span>
                <span style="font-weight:600;color:var(--accent-gold);min-width:100px;">${project ? _escapeHtml(project.name) : ''}</span>
                <span style="flex:1;color:var(--text-secondary);">${_escapeHtml(e.description) || ''}</span>
                <span style="font-weight:700;min-width:50px;text-align:right;">${TBO_WORKLOAD.formatHoursMinutes(e.duration_minutes)}</span>
                <span style="font-size:0.65rem;color:var(--text-muted);">${e.source === 'timer' ? '&#9201;' : '&#9998;'}</span>
                <button class="btn btn-secondary" style="font-size:0.62rem;padding:2px 6px;" onclick="TBO_PROJETOS._editTimeEntry('${e.id}')">&#9998;</button>
              </div>`;
            }).join('')}
          </div>
        `}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB: CARGA (Workload / Capacity / Forecast)
  // ═══════════════════════════════════════════════════════════════════════════

  _renderWorkloadTab() {
    if (typeof TBO_WORKLOAD === 'undefined') {
      return '<div class="empty-state"><div class="empty-state-text">Modulo de workload nao carregado</div></div>';
    }

    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const canSeeCost = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.canDo('finance', 'view') : false;

    // Team utilization
    const weekStart = TBO_WORKLOAD.getWeekStart();
    const teamUtil = TBO_WORKLOAD.getTeamUtilization(weekStart);

    // Forecast
    const forecast = TBO_WORKLOAD.getForecast(8);

    // Cost metrics (only for founder/finance)
    const projects = TBO_STORAGE.getAllErpEntities('project').filter(p => !['finalizado','cancelado'].includes(p.status));
    let costHtml = '';
    if (canSeeCost) {
      const costRows = projects.map(p => TBO_WORKLOAD.getProjectCostMetrics(p.id)).filter(Boolean);
      costHtml = `
        <div class="card" style="padding:14px;">
          <h4 style="font-size:0.85rem;font-weight:700;margin-bottom:10px;">Custo / Margem por Projeto</h4>
          ${costRows.length === 0 ? '<div style="font-size:0.78rem;color:var(--text-muted);">Nenhum projeto com dados de custo</div>' : `
            <div class="cost-table">
              <div class="cost-table-header">
                <span>Projeto</span><span>Receita</span><span>Custo Plan.</span><span>Custo Real</span><span>Margem</span>
              </div>
              ${projects.map(p => {
                const m = TBO_WORKLOAD.getProjectCostMetrics(p.id);
                if (!m) return '';
                const marginColor = m.margin_real >= 40 ? '#22c55e' : m.margin_real >= 20 ? '#f59e0b' : '#ef4444';
                return `<div class="cost-table-row">
                  <span style="font-weight:600;">${_escapeHtml(p.name)}</span>
                  <span>${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.currency(m.revenue) : 'R$' + m.revenue}</span>
                  <span>${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.currency(m.planned_cost) : 'R$' + m.planned_cost}</span>
                  <span style="${m.is_over_budget ? 'color:#ef4444;font-weight:700;' : ''}">${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.currency(m.tracked_cost) : 'R$' + m.tracked_cost}</span>
                  <span style="color:${marginColor};font-weight:700;">${m.margin_real}%${m.is_over_budget ? ' &#9888;' : ''}</span>
                </div>`;
              }).join('')}
            </div>
          `}
        </div>
      `;
    }

    return `
      <!-- Team Capacity -->
      <div class="card" style="padding:14px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h4 style="font-size:0.85rem;font-weight:700;">Capacidade da Equipe (semana atual)</h4>
          ${isFounder ? '<button class="btn btn-secondary" id="wlConfigCapacity" style="font-size:0.68rem;padding:3px 8px;">&#9881; Configurar</button>' : ''}
        </div>
        ${teamUtil.length === 0 ? '<div style="font-size:0.78rem;color:var(--text-muted);">Nenhum membro da equipe encontrado</div>' : `
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${teamUtil.map(u => {
              const fillPct = Math.min(u.utilization_pct, 150);
              const barClass = u.utilization_pct > 100 ? 'capacity-bar-fill--over' : u.utilization_pct > 80 ? 'capacity-bar-fill--warn' : 'capacity-bar-fill--ok';
              return `<div class="capacity-row">
                <span style="min-width:100px;font-size:0.78rem;font-weight:600;">${_escapeHtml(u.userName)}</span>
                <div class="capacity-bar" style="flex:1;">
                  <div class="capacity-bar-fill ${barClass}" style="width:${Math.min(fillPct, 100)}%;"></div>
                  <span class="capacity-bar-label">${TBO_WORKLOAD.formatHoursMinutes(u.tracked_minutes)}/${TBO_WORKLOAD.formatHoursMinutes(u.capacity_minutes)} (${u.utilization_pct}%)</span>
                </div>
                ${u.over_capacity ? '<span style="font-size:0.78rem;" title="Acima da capacidade">&#9888;&#65039;</span>' : ''}
              </div>`;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Forecast 8 weeks -->
      <div class="card" style="padding:14px;margin-bottom:16px;">
        <h4 style="font-size:0.85rem;font-weight:700;margin-bottom:12px;">Forecast 8 Semanas</h4>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${forecast.map(f => {
            const barPct = Math.min(f.utilization_pct, 120);
            const isWarning = f.status === 'warning';
            return `<div class="forecast-row">
              <span style="min-width:80px;font-size:0.72rem;font-weight:600;">${f.week_label}</span>
              <div class="forecast-bar">
                <div class="forecast-bar-fill${isWarning ? ' forecast-bar-fill--warn' : ''}" style="width:${barPct}%;"></div>
              </div>
              <span style="min-width:60px;font-size:0.68rem;text-align:right;color:var(--text-muted);">${TBO_WORKLOAD.formatHoursMinutes(f.total_planned)}/${TBO_WORKLOAD.formatHoursMinutes(f.total_capacity)}</span>
              <span style="min-width:65px;font-size:0.68rem;text-align:right;font-weight:600;color:${isWarning ? '#ef4444' : '#22c55e'};">${f.gap >= 0 ? '+' : ''}${TBO_WORKLOAD.formatHoursMinutes(Math.abs(f.gap))}</span>
              ${f.over_capacity_people.length > 0 ? `<span style="font-size:0.62rem;color:#f59e0b;" title="${f.over_capacity_people.join(', ')}">&#9888; ${f.over_capacity_people.length}</span>` : '<span style="min-width:28px;font-size:0.68rem;color:#22c55e;">OK</span>'}
            </div>`;
          }).join('')}
        </div>
      </div>

      ${costHtml}
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB: GANTT (Draggable Timeline with Scale Views & Dependencies)
  // ═══════════════════════════════════════════════════════════════════════════

  _ganttMonthOffset: 0,
  _ganttExpandedProjects: {},
  _ganttScale: 'month', // 'day', 'week', 'month', 'quarter'
  _ganttDragState: null,

  _getGanttScaleConfig() {
    const base = new Date();
    base.setMonth(base.getMonth() + this._ganttMonthOffset);
    const today = typeof TBO_WORKLOAD !== 'undefined' ? TBO_WORKLOAD._today() : new Date().toISOString().split('T')[0];
    let cols = [];
    let cellW = 28;
    let headerHtml = '';
    const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const dayNames = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];

    // Helper: build dual header (month row + day/week row) Asana-style
    const buildDualHeader = (columns, cw, showDayName) => {
      // Group columns by month for the top row
      const monthGroups = [];
      let curMonth = -1, curYear = -1, curStart = 0, curCount = 0;
      columns.forEach((c, i) => {
        const d = new Date(c.date);
        const m = d.getMonth();
        const y = d.getFullYear();
        if (m !== curMonth || y !== curYear) {
          if (curCount > 0) monthGroups.push({ month: curMonth, year: curYear, count: curCount, start: curStart });
          curMonth = m; curYear = y; curStart = i; curCount = 1;
        } else {
          curCount++;
        }
      });
      if (curCount > 0) monthGroups.push({ month: curMonth, year: curYear, count: curCount, start: curStart });

      const topRow = `<div class="gantt-header-month">${monthGroups.map(g =>
        `<div style="width:${g.count * cw}px;">${monthNames[g.month]} ${g.year}</div>`
      ).join('')}</div>`;

      const bottomRow = `<div class="gantt-header-weeks">${columns.map(c => {
        const d = new Date(c.date);
        const dayNum = d.getDate();
        const label = showDayName ? `<div style="font-size:0.55rem;opacity:0.7;">${dayNames[d.getDay()].charAt(0)}</div>${dayNum}` : `${dayNum}`;
        return `<div class="gantt-header-cell${c.isWeekend ? ' gantt-header-cell--weekend' : ''}${c.isToday ? ' gantt-header-cell--today' : ''}" style="width:${cw}px;">${label}</div>`;
      }).join('')}</div>`;

      return topRow + bottomRow;
    };

    if (this._ganttScale === 'day') {
      // 35 days, 32px each with day names
      base.setDate(1);
      cellW = 34;
      for (let i = 0; i < 35; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        const ds = d.toISOString().split('T')[0];
        cols.push({ date: ds, isWeekend: d.getDay() === 0 || d.getDay() === 6, isToday: ds === today });
      }
      headerHtml = buildDualHeader(cols, cellW, true);
    } else if (this._ganttScale === 'week') {
      // 12 weeks — each cell = 1 day, grouped by weeks for visual clarity
      cellW = 16;
      const weekStart = new Date(base);
      weekStart.setDate(1);
      const dow = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1));
      for (let i = 0; i < 84; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const ds = d.toISOString().split('T')[0];
        cols.push({ date: ds, isWeekend: d.getDay() === 0 || d.getDay() === 6, isToday: ds === today });
      }
      // Build week header: top = months, bottom = week numbers
      const monthGroups2 = [];
      let cm2 = -1, cy2 = -1, cc2 = 0;
      cols.forEach(c => {
        const d = new Date(c.date);
        if (d.getMonth() !== cm2 || d.getFullYear() !== cy2) {
          if (cc2 > 0) monthGroups2.push({ month: cm2, year: cy2, count: cc2 });
          cm2 = d.getMonth(); cy2 = d.getFullYear(); cc2 = 1;
        } else { cc2++; }
      });
      if (cc2 > 0) monthGroups2.push({ month: cm2, year: cy2, count: cc2 });

      const topRow2 = `<div class="gantt-header-month">${monthGroups2.map(g =>
        `<div style="width:${g.count * cellW}px;">${monthNames[g.month]} ${g.year}</div>`
      ).join('')}</div>`;

      // Group by weeks for bottom row
      const weekGroups = [];
      for (let i = 0; i < cols.length; i += 7) {
        const chunk = cols.slice(i, Math.min(i + 7, cols.length));
        const ws = new Date(chunk[0].date);
        const hasToday = chunk.some(c => c.isToday);
        weekGroups.push({ label: `${ws.getDate()}/${ws.getMonth()+1}`, count: chunk.length, isToday: hasToday });
      }
      const bottomRow2 = `<div class="gantt-header-weeks">${weekGroups.map(w =>
        `<div class="${w.isToday ? 'gantt-header-cell--today' : ''}" style="width:${w.count * cellW}px;text-align:center;border-right:1px solid var(--border-subtle);padding:3px 0;">${w.label}</div>`
      ).join('')}</div>`;

      headerHtml = topRow2 + bottomRow2;
    } else if (this._ganttScale === 'month') {
      // 35 days (current default) with dual header
      base.setDate(1);
      cellW = 28;
      for (let i = 0; i < 35; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        const ds = d.toISOString().split('T')[0];
        cols.push({ date: ds, isWeekend: d.getDay() === 0 || d.getDay() === 6, isToday: ds === today });
      }
      headerHtml = buildDualHeader(cols, cellW, false);
    } else if (this._ganttScale === 'quarter') {
      // Quarter: each col = 1 week, spanning 6 months
      cellW = 24;
      const qStart = new Date(base.getFullYear(), base.getMonth(), 1);
      const qEnd = new Date(base.getFullYear(), base.getMonth() + 6, 0);
      // Start from Monday of the first week
      const firstDay = new Date(qStart);
      const fdow = firstDay.getDay();
      firstDay.setDate(firstDay.getDate() - (fdow === 0 ? 6 : fdow - 1));
      const weeks = [];
      let cursor = new Date(firstDay);
      while (cursor <= qEnd) {
        const ws = new Date(cursor);
        const we = new Date(cursor);
        we.setDate(we.getDate() + 6);
        const wsStr = ws.toISOString().split('T')[0];
        const weStr = we.toISOString().split('T')[0];
        weeks.push({ date: wsStr, endDate: weStr, isWeekend: false, isToday: today >= wsStr && today <= weStr });
        cursor.setDate(cursor.getDate() + 7);
      }
      cols = weeks;

      // Group by month for top header
      const mGroups = [];
      let lm = -1, ly = -1, lc = 0;
      cols.forEach(c => {
        const d = new Date(c.date);
        const m = d.getMonth();
        const y = d.getFullYear();
        if (m !== lm || y !== ly) {
          if (lc > 0) mGroups.push({ month: lm, year: ly, count: lc });
          lm = m; ly = y; lc = 1;
        } else { lc++; }
      });
      if (lc > 0) mGroups.push({ month: lm, year: ly, count: lc });

      const topQ = `<div class="gantt-header-month">${mGroups.map(g =>
        `<div style="width:${g.count * cellW}px;text-transform:capitalize;">${monthNames[g.month]}</div>`
      ).join('')}</div>`;
      const bottomQ = `<div class="gantt-header-weeks">${cols.map(c => {
        const d = new Date(c.date);
        return `<div class="${c.isToday ? 'gantt-header-cell--today' : ''}" style="width:${cellW}px;text-align:center;border-right:1px solid var(--border-subtle);padding:3px 0;">${d.getDate()}</div>`;
      }).join('')}</div>`;
      headerHtml = topQ + bottomQ;
    }

    const viewStart = cols[0]?.date || today;
    const viewEnd = cols[cols.length - 1]?.endDate || cols[cols.length - 1]?.date || today;
    const titleLabel = base.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    return { cols, cellW, headerHtml, viewStart, viewEnd, titleLabel, today };
  },

  _ganttDateToPixel(dateStr, cols, cellW) {
    if (this._ganttScale === 'week' || this._ganttScale === 'quarter') {
      // Each col spans a date range
      for (let i = 0; i < cols.length; i++) {
        const cStart = cols[i].date;
        const cEnd = cols[i].endDate || cols[i].date;
        if (dateStr <= cStart) return i * cellW;
        if (dateStr >= cStart && dateStr <= cEnd) {
          const rangeDays = Math.max(1, (new Date(cEnd) - new Date(cStart)) / 86400000);
          const offsetDays = (new Date(dateStr) - new Date(cStart)) / 86400000;
          return i * cellW + (offsetDays / rangeDays) * cellW;
        }
      }
      return cols.length * cellW;
    } else {
      // Day/month scale: each col = 1 day
      const idx = cols.findIndex(c => c.date === dateStr);
      if (idx >= 0) return idx * cellW;
      if (dateStr < cols[0]?.date) return 0;
      return cols.length * cellW;
    }
  },

  _ganttPixelToDate(px, cols, cellW) {
    if (this._ganttScale === 'week' || this._ganttScale === 'quarter') {
      const colIdx = Math.floor(px / cellW);
      const clamped = Math.max(0, Math.min(colIdx, cols.length - 1));
      const col = cols[clamped];
      const cStart = new Date(col.date);
      const cEnd = new Date(col.endDate || col.date);
      const rangeDays = Math.max(1, (cEnd - cStart) / 86400000);
      const frac = (px - clamped * cellW) / cellW;
      const day = new Date(cStart);
      day.setDate(day.getDate() + Math.round(frac * rangeDays));
      return day.toISOString().split('T')[0];
    } else {
      const colIdx = Math.max(0, Math.min(Math.round(px / cellW), cols.length - 1));
      return cols[colIdx]?.date || cols[0]?.date;
    }
  },

  _renderGanttTab() {
    if (typeof TBO_WORKLOAD === 'undefined') {
      return '<div class="empty-state"><div class="empty-state-text">Modulo de workload nao carregado</div></div>';
    }

    const sc = this._getGanttScaleConfig();
    const { cols, cellW, headerHtml, viewStart, viewEnd, titleLabel, today } = sc;
    const totalW = cols.length * cellW;

    const ganttData = TBO_WORKLOAD.getGanttData(viewStart, viewEnd);
    const projectRows = ganttData.filter(r => r.type === 'project');
    const taskRows = ganttData.filter(r => r.type === 'task');

    projectRows.forEach(p => {
      if (this._ganttExpandedProjects[p.id] === undefined) this._ganttExpandedProjects[p.id] = false;
    });

    const visibleRows = [];
    projectRows.forEach(p => {
      visibleRows.push(p);
      if (this._ganttExpandedProjects[p.id]) {
        taskRows.filter(t => t.parentId === p.id).forEach(c => visibleRows.push(c));
      }
    });

    // Dependency arrows SVG
    let depsSvg = '';
    const allTasks = TBO_STORAGE.getAllErpEntities('task');
    const rowMap = {};
    visibleRows.forEach((r, i) => { rowMap[r.id] = i; });
    const depLines = [];
    allTasks.forEach(t => {
      if (!t.depends_on || !Array.isArray(t.depends_on)) return;
      t.depends_on.forEach(depId => {
        const fromIdx = rowMap[depId];
        const toIdx = rowMap[t.id];
        if (fromIdx === undefined || toIdx === undefined) return;
        const fromRow = visibleRows[fromIdx];
        const toRow = visibleRows[toIdx];
        const x1 = this._ganttDateToPixel(fromRow.endDate, cols, cellW) + cellW;
        const y1 = fromIdx * 36 + 18;
        const x2 = this._ganttDateToPixel(toRow.startDate, cols, cellW);
        const y2 = toIdx * 36 + 18;
        depLines.push({ x1, y1, x2, y2 });
      });
    });
    if (depLines.length > 0) {
      depsSvg = `<svg class="gantt-deps-svg" style="position:absolute;top:0;left:0;width:${totalW}px;height:${visibleRows.length * 36}px;pointer-events:none;z-index:5;">
        <defs><marker id="ganttArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="var(--accent-gold)" /></marker></defs>
        ${depLines.map(l => `<path d="M${l.x1},${l.y1} C${l.x1 + 20},${l.y1} ${l.x2 - 20},${l.y2} ${l.x2},${l.y2}" stroke="var(--accent-gold)" stroke-width="1.5" fill="none" marker-end="url(#ganttArrow)" opacity="0.7"/>`).join('')}
      </svg>`;
    }

    const scaleButtons = [
      { key: 'day', label: 'Dias' },
      { key: 'week', label: 'Semanas' },
      { key: 'month', label: 'Mes' },
      { key: 'quarter', label: 'Trimestre' }
    ];

    // Gantt filter state
    const filterStatus = this._ganttFilterStatus || '';
    const filterOwner = this._ganttFilterOwner || '';
    const team = this._getTeamMembers();

    return `
      <!-- Controls -->
      <div class="gantt-controls" style="margin-bottom:12px;">
        <button class="btn btn-secondary gantt-nav-btn" id="ganttPrev">&lt;</button>
        <span style="font-weight:700;font-size:0.85rem;min-width:180px;text-align:center;text-transform:capitalize;">${titleLabel}</span>
        <button class="btn btn-secondary gantt-nav-btn" id="ganttNext">&gt;</button>
        <button class="btn btn-secondary" id="ganttToday" style="font-size:0.68rem;padding:3px 8px;margin-left:12px;">Hoje</button>
        <div style="margin-left:auto;display:flex;gap:3px;">
          ${scaleButtons.map(s => `<button class="btn btn-secondary gantt-scale-btn${this._ganttScale === s.key ? ' gantt-scale-btn--active' : ''}" data-scale="${s.key}" style="font-size:0.65rem;padding:3px 8px;">${s.label}</button>`).join('')}
        </div>
      </div>

      <!-- Gantt Filters -->
      <div style="display:flex;gap:8px;margin-bottom:10px;align-items:center;flex-wrap:wrap;">
        <select class="form-input" id="ganttFilterStatus" style="max-width:140px;font-size:0.75rem;">
          <option value="">Todos status</option>
          <option value="pendente" ${filterStatus === 'pendente' ? 'selected' : ''}>Pendente</option>
          <option value="em_andamento" ${filterStatus === 'em_andamento' ? 'selected' : ''}>Em andamento</option>
          <option value="concluida" ${filterStatus === 'concluida' ? 'selected' : ''}>Concluida</option>
          <option value="atrasada" ${filterStatus === 'atrasada' ? 'selected' : ''}>Atrasada</option>
        </select>
        <select class="form-input" id="ganttFilterOwner" style="max-width:140px;font-size:0.75rem;">
          <option value="">Todos responsaveis</option>
          ${team.map(t => `<option value="${t}" ${filterOwner === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
        <span style="font-size:0.68rem;color:var(--text-muted);margin-left:auto;">${visibleRows.length} itens | Arraste as barras para mudar datas</span>
      </div>

      <!-- Gantt Chart -->
      <div class="gantt-container">
        <!-- Labels column -->
        <div class="gantt-labels">
          <div class="gantt-label-row gantt-label-row--header" style="font-weight:700;font-size:0.7rem;color:var(--text-muted);">Projeto / Tarefa</div>
          ${visibleRows.map(r => {
            if (r.type === 'project') {
              const expanded = this._ganttExpandedProjects[r.id];
              const childCount = taskRows.filter(t => t.parentId === r.id).length;
              return `<div class="gantt-label-row gantt-label-row--project" onclick="TBO_PROJETOS._toggleGanttProject('${r.id}')" style="cursor:pointer;" title="${_escapeHtml(r.name)}">
                <span style="font-size:0.7rem;margin-right:4px;">${expanded ? '&#9660;' : '&#9654;'}</span>
                <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_escapeHtml(r.name)}</span>
                <span style="font-size:0.6rem;color:var(--text-muted);margin-left:auto;">${childCount}</span>
              </div>`;
            } else {
              return `<div class="gantt-label-row gantt-label-row--task" title="${_escapeHtml(r.name)}">
                <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_escapeHtml(r.name)}</span>
                ${r.owner ? `<span style="font-size:0.58rem;color:var(--text-muted);margin-left:auto;">${_escapeHtml(r.owner)}</span>` : ''}
              </div>`;
            }
          }).join('')}
        </div>

        <!-- Timeline -->
        <div class="gantt-timeline" id="ganttTimeline">
          <!-- Day headers -->
          <div class="gantt-header">${headerHtml}</div>

          <!-- Row bars -->
          <div class="gantt-body" id="ganttBody" style="position:relative;width:${totalW}px;">
            ${visibleRows.map((r, idx) => {
              const barLeft = this._ganttDateToPixel(r.startDate, cols, cellW);
              const barRight = this._ganttDateToPixel(r.endDate, cols, cellW) + cellW;
              const barW = Math.max(cellW / 2, barRight - barLeft);
              const barClass = r.type === 'project' ? 'gantt-bar gantt-bar--project' : 'gantt-bar gantt-bar--task';
              const barId = `gantt-bar-${r.id}`;

              return `<div class="gantt-row" style="position:relative;height:36px;width:${totalW}px;">
                <!-- Background grid -->
                <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;">
                  ${cols.map(c => `<div style="width:${cellW}px;height:100%;border-right:1px solid var(--border-subtle);flex-shrink:0;${c.isWeekend ? 'background:var(--bg-elevated);' : ''}"></div>`).join('')}
                </div>
                <!-- Draggable Bar -->
                ${barLeft < totalW && barW > 0 ? (() => {
                  const ownerName = r.owner || '';
                  const initials = ownerName && typeof TBO_PERMISSIONS !== 'undefined' ? TBO_PERMISSIONS.getInitials(ownerName) : ownerName.charAt(0).toUpperCase();
                  const showAvatar = r.type === 'task' && ownerName && barW > 40;
                  const pctDone = r.type === 'project' && r.progress !== undefined ? r.progress : 0;
                  const progressW = r.type === 'project' ? Math.round(pctDone * barW / 100) : 0;
                  return `
                  <div class="${barClass} gantt-bar-drag" id="${barId}" data-entity-type="${r.type}" data-entity-id="${r.id}" style="position:absolute;top:6px;height:24px;left:${barLeft}px;width:${barW}px;background:${r.color};border-radius:6px;cursor:grab;z-index:3;opacity:${r.type === 'task' ? '0.9' : '1'};box-shadow:0 1px 4px rgba(0,0,0,0.2);" title="${_escapeHtml(r.name)}&#10;${ownerName ? _escapeHtml(ownerName) + '  |  ' : ''}${r.startDate} → ${r.endDate}">
                    ${r.type === 'project' && pctDone > 0 ? `<div class="gantt-bar-progress" style="position:absolute;left:0;top:0;height:100%;width:${progressW}px;background:rgba(255,255,255,0.18);border-radius:6px 0 0 6px;pointer-events:none;"></div>` : ''}
                    <div class="gantt-drag-handle gantt-drag-handle--left" data-handle="left" style="position:absolute;left:0;top:0;width:6px;height:100%;cursor:ew-resize;border-radius:6px 0 0 6px;"></div>
                    <div class="gantt-bar-content" style="display:flex;align-items:center;gap:4px;padding:0 8px;height:100%;overflow:hidden;pointer-events:none;">
                      ${showAvatar ? `<span class="gantt-bar-avatar" style="width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:0.5rem;font-weight:700;color:#fff;flex-shrink:0;border:1px solid rgba(255,255,255,0.4);">${initials}</span>` : ''}
                      <span class="gantt-bar-label" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.62rem;color:#fff;line-height:24px;">${_escapeHtml(r.name)}</span>
                    </div>
                    <div class="gantt-drag-handle gantt-drag-handle--right" data-handle="right" style="position:absolute;right:0;top:0;width:6px;height:100%;cursor:ew-resize;border-radius:0 6px 6px 0;"></div>
                  </div>`;
                })() : ''}
              </div>`;
            }).join('')}

            ${depsSvg}

            <!-- Today line -->
            ${(() => {
              const todayPx = this._ganttDateToPixel(today, cols, cellW) + cellW / 2;
              if (todayPx <= 0 || todayPx >= totalW) return '';
              return `<div class="gantt-today-line" style="position:absolute;top:0;bottom:0;left:${todayPx}px;width:2px;background:var(--accent-gold);z-index:10;pointer-events:none;"></div>`;
            })()}
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div style="display:flex;gap:16px;margin-top:10px;font-size:0.68rem;color:var(--text-muted);flex-wrap:wrap;align-items:center;">
        <span>&#9632; Projeto</span>
        <span>&#9632; Tarefa</span>
        <span style="color:var(--accent-gold);">&#9475; Hoje</span>
        <span>&#8594; Dependencia</span>
        <span>&#9654; Clique para expandir/colapsar</span>
        <span>&#8596; Arraste bordas para redimensionar</span>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB: MINHAS TAREFAS (My Tasks — Asana-like personal view)
  // ═══════════════════════════════════════════════════════════════════════════

  _myTasksSort: 'due_date', // 'due_date', 'priority', 'project', 'status'
  _myTasksFilter: 'all', // 'all', 'week', 'completed'

  _renderMyTasks() {
    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const userName = user?.name || user?.id || '';
    if (!userName) return '<div class="empty-state"><div class="empty-state-text">Login necessario para ver suas tarefas</div></div>';

    const allTasks = TBO_STORAGE.getAllErpEntities('task');
    const today = new Date().toISOString().split('T')[0];
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    const nextWeekEnd = new Date();
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 14);
    const nextWeekEndStr = nextWeekEnd.toISOString().split('T')[0];

    // Filter tasks assigned to current user (case insensitive match)
    const uLower = userName.toLowerCase();
    let myTasks = allTasks.filter(t => {
      const tOwner = (t.owner || '').toLowerCase();
      return tOwner === uLower || tOwner.includes(uLower);
    });

    // Apply filter
    if (this._myTasksFilter === 'week') {
      myTasks = myTasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada' && t.due_date && t.due_date <= weekEndStr);
    } else if (this._myTasksFilter === 'completed') {
      myTasks = myTasks.filter(t => t.status === 'concluida');
    }

    // Sort
    if (this._myTasksSort === 'due_date') {
      myTasks.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      });
    } else if (this._myTasksSort === 'priority') {
      const pMap = { urgente: 0, alta: 1, media: 2, baixa: 3 };
      myTasks.sort((a, b) => (pMap[a.priority] || 2) - (pMap[b.priority] || 2));
    } else if (this._myTasksSort === 'project') {
      myTasks.sort((a, b) => (a.project_name || '').localeCompare(b.project_name || ''));
    } else if (this._myTasksSort === 'status') {
      myTasks.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    }

    // Split into Asana-style sections
    const overdue = myTasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada' && t.due_date && t.due_date < today);
    const dueToday = myTasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada' && t.due_date === today);
    const dueThisWeek = myTasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada' && t.due_date && t.due_date > today && t.due_date <= weekEndStr);
    const dueNextWeek = myTasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada' && t.due_date && t.due_date > weekEndStr && t.due_date <= nextWeekEndStr);
    const dueLater = myTasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada' && (!t.due_date || t.due_date > nextWeekEndStr));
    const completed = myTasks.filter(t => t.status === 'concluida');

    // Recently assigned (last 7 days created)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCutoff = sevenDaysAgo.toISOString();
    const recentlyAssigned = myTasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada' && t.createdAt && t.createdAt > recentCutoff);

    const sections = [
      { id: 'overdue', label: 'Atrasadas', tasks: overdue, color: '#ef4444', icon: '&#9888;' },
      { id: 'today', label: 'A fazer hoje', tasks: dueToday, color: '#f59e0b', icon: '&#9678;' },
      { id: 'week', label: 'A fazer esta semana', tasks: dueThisWeek, color: '#3b82f6', icon: '&#9656;' },
      { id: 'nextweek', label: 'Proxima semana', tasks: dueNextWeek, color: '#8b5cf6', icon: '&#10148;' },
      { id: 'later', label: 'Mais tarde', tasks: dueLater, color: '#6b7280', icon: '&#8943;' },
      { id: 'done', label: 'Concluidas recentes', tasks: completed.slice(0, 10), color: '#22c55e', icon: '&#10003;' }
    ];

    const totalPending = overdue.length + dueToday.length + dueThisWeek.length + dueNextWeek.length + dueLater.length;

    return `
      <!-- KPIs -->
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Minhas Tarefas</div><div class="kpi-value">${totalPending}</div></div>
        <div class="kpi-card"><div class="kpi-label">Vencem Hoje</div><div class="kpi-value" style="color:${dueToday.length > 0 ? '#f59e0b' : '#22c55e'};">${dueToday.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Atrasadas</div><div class="kpi-value" style="color:${overdue.length > 0 ? '#ef4444' : '#22c55e'};">${overdue.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Recentes</div><div class="kpi-value">${recentlyAssigned.length}</div></div>
      </div>

      <!-- Controls -->
      <div style="display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap;">
        <select class="form-input" id="myTasksFilter" style="max-width:160px;font-size:0.78rem;">
          <option value="all" ${this._myTasksFilter === 'all' ? 'selected' : ''}>Todas as tarefas</option>
          <option value="week" ${this._myTasksFilter === 'week' ? 'selected' : ''}>Previstas p/ semana</option>
          <option value="completed" ${this._myTasksFilter === 'completed' ? 'selected' : ''}>Concluidas</option>
        </select>
        <select class="form-input" id="myTasksSort" style="max-width:160px;font-size:0.78rem;">
          <option value="due_date" ${this._myTasksSort === 'due_date' ? 'selected' : ''}>Ordenar: Data</option>
          <option value="priority" ${this._myTasksSort === 'priority' ? 'selected' : ''}>Ordenar: Prioridade</option>
          <option value="project" ${this._myTasksSort === 'project' ? 'selected' : ''}>Ordenar: Projeto</option>
          <option value="status" ${this._myTasksSort === 'status' ? 'selected' : ''}>Ordenar: Status</option>
        </select>
      </div>

      <!-- Table header (Asana-style) -->
      <div class="my-tasks-table-header">
        <div class="my-tasks-hcell"></div>
        <div class="my-tasks-hcell">Nome da tarefa</div>
        <div class="my-tasks-hcell">Data</div>
        <div class="my-tasks-hcell">Status</div>
        <div class="my-tasks-hcell">Prioridade</div>
        <div class="my-tasks-hcell"></div>
      </div>

      <!-- Task sections -->
      ${sections.filter(s => s.tasks.length > 0).map(section => `
        <div class="my-tasks-section">
          <div class="my-tasks-section-divider" style="border-left:3px solid ${section.color};">
            <span class="my-tasks-section-icon" style="color:${section.color};">${section.icon}</span>
            <span class="my-tasks-section-label">${section.label}</span>
            <span class="my-tasks-section-count" style="background:${section.color}15;color:${section.color};">${section.tasks.length}</span>
          </div>
          <div class="my-tasks-list">
            ${section.tasks.map(t => this._renderMyTaskRow(t, today)).join('')}
          </div>
        </div>
      `).join('')}
      ${totalPending === 0 && completed.length === 0 ? '<div class="empty-state"><div class="empty-state-text">Nenhuma tarefa atribuida a voce</div></div>' : ''}
    `;
  },

  _renderMyTaskRow(t, today) {
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
    const stateColor = sm ? sm.colors[t.status] || '#94a3b8' : '#94a3b8';
    const stateLabel = sm ? sm.labels[t.status] || t.status : t.status;
    const isOverdue = t.due_date && t.due_date < today && t.status !== 'concluida';
    const isDone = t.status === 'concluida';
    const priorityClass = t.priority ? `priority-badge priority-badge--${t.priority}` : 'priority-badge priority-badge--media';
    const priorityLabel = { urgente: 'Urgente', alta: 'Alta', media: 'Media', baixa: 'Baixa' };
    const ownerInitials = t.owner && typeof TBO_PERMISSIONS !== 'undefined' ? TBO_PERMISSIONS.getInitials(t.owner) : (t.owner || '').charAt(0).toUpperCase();

    // Format due date nicely
    let dueDateHtml = '<span style="color:var(--text-muted);font-size:0.72rem;">—</span>';
    if (t.due_date) {
      const d = new Date(t.due_date + 'T00:00:00');
      const dayNum = d.getDate();
      const monthNames = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
      const monthStr = monthNames[d.getMonth()];
      const dateStr = `${dayNum} ${monthStr}`;
      if (isOverdue) {
        dueDateHtml = `<span class="my-tasks-date my-tasks-date--overdue">${dateStr}</span>`;
      } else if (t.due_date === today) {
        dueDateHtml = `<span class="my-tasks-date my-tasks-date--today">Hoje</span>`;
      } else {
        dueDateHtml = `<span class="my-tasks-date">${dateStr}</span>`;
      }
    }

    return `<div class="my-tasks-row${isDone ? ' my-tasks-row--done' : ''}" onclick="TBO_ROUTER.navigate('projeto/${t.project_id}/list')">
      <div class="my-tasks-cell my-tasks-cell--check">
        <input type="checkbox" class="my-tasks-checkbox" ${isDone ? 'checked' : ''} onchange="event.stopPropagation();TBO_PROJETOS._toggleTask('${t.id}', this.checked)">
      </div>
      <div class="my-tasks-cell my-tasks-cell--name">
        <span class="my-tasks-name${isDone ? ' my-tasks-name--done' : ''}">${TBO_FORMATTER.escapeHtml(t.title || t.name)}</span>
        ${t.project_name ? `<span class="my-tasks-project-tag">${TBO_FORMATTER.escapeHtml(t.project_name)}</span>` : ''}
      </div>
      <div class="my-tasks-cell my-tasks-cell--date">${dueDateHtml}</div>
      <div class="my-tasks-cell my-tasks-cell--status">
        <span class="tag" style="font-size:0.6rem;background:${stateColor}20;color:${stateColor};border:1px solid ${stateColor}30;">${stateLabel}</span>
      </div>
      <div class="my-tasks-cell my-tasks-cell--priority">
        <span class="${priorityClass}">${priorityLabel[t.priority] || 'Media'}</span>
      </div>
      <div class="my-tasks-cell my-tasks-cell--actions">
        ${t.project_id && !isDone ? `<button class="my-tasks-timer-btn" onclick="event.stopPropagation();TBO_PROJETOS._startTimerForTask('${t.project_id}','${t.id}','${(t.title || t.name || '').replace(/'/g, "\\'")}');" title="Iniciar timer">&#9654;</button>` : ''}
      </div>
    </div>`;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECT OVERVIEW (Summary area inside project modal)
  // ═══════════════════════════════════════════════════════════════════════════

  _renderProjectOverview(project) {
    if (!project) return '';

    const tasks = TBO_STORAGE.getErpEntitiesByParent('task', project.id);
    const deliverables = TBO_STORAGE.getErpEntitiesByParent('deliverable', project.id);
    const timeEntries = TBO_STORAGE.getAllErpEntities('time_entry').filter(e => e.project_id === project.id);
    const totalMinutes = timeEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
    const health = typeof TBO_ERP !== 'undefined' ? TBO_ERP.calculateHealthScore(project) : { score: 100, level: 'healthy', reasons: [] };
    const healthColor = typeof TBO_ERP !== 'undefined' ? TBO_ERP.getHealthColor(health.score) : '#22c55e';
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.project : null;

    const doneTasks = tasks.filter(t => t.status === 'concluida').length;
    const totalTasks = tasks.length;
    const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const doneDeliverables = deliverables.filter(d => d.status === 'entregue').length;

    // Activity feed (last 5 audit entries for this project)
    const history = typeof TBO_ERP !== 'undefined' ? TBO_ERP.getEntityHistory('project', project.id).slice(0, 5) : [];

    // Team members on this project
    const teamOnProject = [...new Set(tasks.map(t => t.owner).filter(Boolean))];

    return `
      <div class="project-overview" style="display:grid;grid-template-columns:1fr 280px;gap:20px;">
        <!-- Left: Description & Status -->
        <div>
          <!-- Progress bar -->
          <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:4px;">
              <span style="font-weight:600;">Progresso</span>
              <span style="color:${completionPct >= 80 ? '#22c55e' : completionPct >= 50 ? '#f59e0b' : 'var(--text-muted)'};">${completionPct}%</span>
            </div>
            <div style="height:8px;background:var(--bg-elevated);border-radius:4px;overflow:hidden;">
              <div style="height:100%;width:${completionPct}%;background:${completionPct >= 80 ? '#22c55e' : completionPct >= 50 ? '#f59e0b' : 'var(--accent)'};border-radius:4px;transition:width 0.3s;"></div>
            </div>
          </div>

          <!-- Stats row -->
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px;margin-bottom:16px;">
            <div style="text-align:center;padding:10px;background:var(--bg-elevated);border-radius:8px;">
              <div style="font-size:1.1rem;font-weight:700;color:var(--accent-gold);">${doneTasks}/${totalTasks}</div>
              <div style="font-size:0.65rem;color:var(--text-muted);">Tarefas</div>
            </div>
            <div style="text-align:center;padding:10px;background:var(--bg-elevated);border-radius:8px;">
              <div style="font-size:1.1rem;font-weight:700;">${doneDeliverables}/${deliverables.length}</div>
              <div style="font-size:0.65rem;color:var(--text-muted);">Entregaveis</div>
            </div>
            <div style="text-align:center;padding:10px;background:var(--bg-elevated);border-radius:8px;">
              <div style="font-size:1.1rem;font-weight:700;">${typeof TBO_WORKLOAD !== 'undefined' ? TBO_WORKLOAD.formatHoursMinutes(totalMinutes) : Math.round(totalMinutes / 60) + 'h'}</div>
              <div style="font-size:0.65rem;color:var(--text-muted);">Horas</div>
            </div>
            <div style="text-align:center;padding:10px;background:var(--bg-elevated);border-radius:8px;">
              <div style="font-size:1.1rem;font-weight:700;color:${healthColor};">${health.score}</div>
              <div style="font-size:0.65rem;color:var(--text-muted);">Saude</div>
            </div>
          </div>

          ${project.notes ? `<div style="font-size:0.82rem;color:var(--text-secondary);padding:12px;background:var(--bg-elevated);border-radius:8px;margin-bottom:16px;border-left:3px solid var(--accent);">${_escapeHtml(project.notes)}</div>` : ''}

          <!-- Activity Feed -->
          ${history.length > 0 ? `
            <div style="margin-bottom:16px;">
              <h4 style="font-size:0.82rem;font-weight:700;margin-bottom:8px;">Atividade Recente</h4>
              <div style="display:flex;flex-direction:column;gap:4px;">
                ${history.map(h => `<div style="font-size:0.72rem;color:var(--text-muted);padding:4px 8px;background:var(--bg-elevated);border-radius:4px;">
                  <span style="font-weight:600;color:var(--text-secondary);">${h.userId || 'sistema'}</span> ${h.action}${h.from ? ' (' + h.from + ' → ' + h.to + ')' : ''} — ${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.relativeTime(h.timestamp) : h.timestamp.slice(0, 16)}
                </div>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Right: Sidebar info -->
        <div style="border-left:1px solid var(--border-subtle);padding-left:20px;">
          <div style="margin-bottom:16px;">
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Status</div>
            <span class="tag" style="font-size:0.75rem;background:${sm ? sm.colors[project.status] + '20' : '#94a3b820'};color:${sm ? sm.colors[project.status] : '#94a3b8'};border:1px solid ${sm ? sm.colors[project.status] + '40' : '#94a3b840'};">${sm ? sm.labels[project.status] : project.status}</span>
          </div>
          <div style="margin-bottom:16px;">
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Responsavel</div>
            <div style="font-size:0.82rem;font-weight:600;">${_escapeHtml(project.owner) || 'Nao definido'}</div>
          </div>
          <div style="margin-bottom:16px;">
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Cliente</div>
            <div style="font-size:0.82rem;">${_escapeHtml(project.client) || '-'}</div>
          </div>
          ${project.value ? `<div style="margin-bottom:16px;">
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Valor</div>
            <div style="font-size:0.92rem;font-weight:700;color:var(--accent-gold);">${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.currency(project.value) : 'R$ ' + project.value}</div>
          </div>` : ''}
          <div style="margin-bottom:16px;">
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Prioridade</div>
            <div style="font-size:0.82rem;">${project.priority || 'media'}</div>
          </div>
          ${project.start_date || project.end_date ? `<div style="margin-bottom:16px;">
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Periodo</div>
            <div style="font-size:0.78rem;">${project.start_date || '?'} - ${project.end_date || '?'}</div>
            ${(() => {
              if (typeof TBO_ERP === 'undefined') return '';
              const dl = TBO_ERP.getDeadlineInfo(project);
              if (!dl.hasDeadline) return '';
              return `<div style="margin-top:4px;padding:4px 8px;background:${dl.urgencyColor}15;border-radius:4px;border-left:3px solid ${dl.urgencyColor};">
                <div style="font-size:0.72rem;font-weight:600;color:${dl.urgencyColor};">${dl.label}</div>
                ${dl.progressPercent !== null ? `<div style="height:3px;background:var(--bg-tertiary);border-radius:2px;margin-top:4px;"><div style="width:${dl.progressPercent}%;height:100%;background:${dl.urgencyColor};border-radius:2px;"></div></div>` : ''}
              </div>`;
            })()}
          </div>` : ''}
          ${teamOnProject.length > 0 ? `<div style="margin-bottom:16px;">
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Equipe (${teamOnProject.length})</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              ${teamOnProject.map(m => `<span class="deal-owner-badge" style="font-size:0.6rem;width:28px;height:28px;" title="${_escapeHtml(m)}">${typeof TBO_PERMISSIONS !== 'undefined' ? TBO_PERMISSIONS.getInitials(m) : _escapeHtml(m).charAt(0)}</span>`).join('')}
            </div>
          </div>` : ''}
          ${(project.services || []).length > 0 ? `<div style="margin-bottom:16px;">
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Servicos</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">${project.services.map(s => `<span class="deal-service-tag">${s}</span>`).join('')}</div>
          </div>` : ''}
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIT LOG TAB
  // ═══════════════════════════════════════════════════════════════════════════

  _renderAuditLog() {
    if (typeof TBO_ERP === 'undefined') return '<div class="empty-state"><div class="empty-state-text">ERP nao inicializado</div></div>';
    const logs = TBO_ERP.getAuditLog().slice(0, 50);
    if (logs.length === 0) return '<div class="empty-state"><div class="empty-state-text">Nenhuma atividade registrada ainda</div></div>';

    const actionLabels = {
      state_change: 'Mudou status',
      created: 'Criou',
      updated: 'Atualizou',
      deleted: 'Removeu',
      playbook_applied: 'Playbook aplicado',
      convert_to_project: 'Converteu em projeto',
      new_version: 'Nova versao',
      version_approved: 'Versao aprovada',
      revision_requested: 'Revisao solicitada',
      created_from_decision: 'Criado de decisao',
      erp_seed: 'Inicializacao',
      timer_started: 'Iniciou timer',
      timer_stopped: 'Parou timer',
      manual_entry: 'Lancamento manual',
      entry_updated: 'Atualizou entrada',
      entry_deleted: 'Excluiu entrada',
      capacity_updated: 'Config. capacidade',
      timer_override: 'Timer override'
    };

    return `<div style="max-height:500px;overflow-y:auto;">
      ${logs.map(l => `
        <div style="display:flex;gap:12px;padding:8px 0;border-bottom:1px solid var(--border-subtle);font-size:0.78rem;">
          <div style="flex-shrink:0;width:120px;color:var(--text-muted);">${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.relativeTime(l.timestamp) : l.timestamp.slice(0, 16)}</div>
          <div style="flex:1;">
            <span style="font-weight:600;">${l.userId || 'sistema'}</span>
            <span style="color:var(--text-secondary);"> ${actionLabels[l.action] || l.action}</span>
            ${l.entityName ? ` <span style="color:var(--accent-gold);">${l.entityName}</span>` : ''}
            ${l.from && l.to ? ` <span style="color:var(--text-muted);">(${l.from} \u2192 ${l.to})</span>` : ''}
            ${l.reason && l.action !== 'state_change' ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">${l.reason}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>`;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTER LOGIC
  // ═══════════════════════════════════════════════════════════════════════════

  _applyProjectFilters(projects) {
    let filtered = projects;
    if (this._filters.status) filtered = filtered.filter(p => p.status === this._filters.status);
    if (this._filters.owner) filtered = filtered.filter(p => p.owner === this._filters.owner);
    if (this._filters.search) {
      const q = this._filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.client || '').toLowerCase().includes(q) ||
        (p.owner || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INIT — Event binding
  // ═══════════════════════════════════════════════════════════════════════════

  init() {
    // Tab switching
    document.querySelectorAll('.projetos-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Clean up intervals from previous tab
        if (this._tsClockInterval) { clearInterval(this._tsClockInterval); this._tsClockInterval = null; }

        document.querySelectorAll('.projetos-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.projetos-module .tab-content').forEach(c => { c.classList.remove('active'); c.style.display = 'none'; });
        tab.classList.add('active');
        const target = document.getElementById(`tab-${tab.dataset.tab}`);
        if (target) { target.classList.add('active'); target.style.display = ''; }
        if (typeof TBO_UX !== 'undefined') {
          TBO_UX.updateBreadcrumb('projetos', tab.textContent.trim());
          TBO_UX.setTabHash('projetos', tab.dataset.tab);
        }

        // Re-bind events for active tab
        const tabId = tab.dataset.tab;
        if (tabId === 'pj-tempo') this._bindTimesheetEvents();
        else if (tabId === 'pj-gantt') this._bindGanttEvents();
        else if (tabId === 'pj-carga') this._bindWorkloadEvents();
        else if (tabId === 'pj-mytasks') this._bindMyTasksEvents();
      });
    });

    // Filters
    const fStatus = document.getElementById('pjFilterStatus');
    const fOwner = document.getElementById('pjFilterOwner');
    const fSearch = document.getElementById('pjFilterSearch');
    if (fStatus) fStatus.addEventListener('change', () => { this._filters.status = fStatus.value; this._refreshBoard(); });
    if (fOwner) fOwner.addEventListener('change', () => { this._filters.owner = fOwner.value; this._refreshBoard(); });
    if (fSearch) fSearch.addEventListener('input', () => { this._filters.search = fSearch.value; this._refreshBoard(); });

    // New project
    this._bind('pjBtnNewProject', () => this._showProjectModal(null));

    // AI generators
    this._bind('pjGerarPrep', () => this._generatePrep());

    // Drag & drop for board
    this._initDragDrop();

    // New tab bindings: Timesheet, Workload, Gantt, My Tasks
    this._bindTimesheetEvents();
    this._bindGanttEvents();
    this._bindWorkloadEvents();
    this._bindMyTasksEvents();

    // Init timer widget
    if (typeof TBO_WORKLOAD !== 'undefined') {
      TBO_WORKLOAD.initTimerWidget();
    }
  },

  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  },

  _initDragDrop() {
    const board = document.getElementById('pjKanban');
    if (!board) return;

    board.addEventListener('dragstart', (e) => {
      const card = e.target.closest('.erp-project-card');
      if (!card) return;
      e.dataTransfer.setData('text/plain', card.dataset.id);
      card.classList.add('dragging');
    });

    board.addEventListener('dragend', (e) => {
      const card = e.target.closest('.erp-project-card');
      if (card) card.classList.remove('dragging');
      board.querySelectorAll('.pipeline-column-body').forEach(c => c.classList.remove('drag-over'));
    });

    board.querySelectorAll('.pipeline-column-body').forEach(col => {
      col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drag-over'); });
      col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const projectId = e.dataTransfer.getData('text/plain');
        const newState = col.dataset.state;
        if (projectId && newState) this._onProjectDrop(projectId, newState);
      });
    });
  },

  _onProjectDrop(projectId, newState) {
    if (typeof TBO_ERP === 'undefined') return;
    const result = TBO_ERP.transition('project', projectId, newState);
    if (result.ok) {
      TBO_TOAST.success(`Projeto movido para ${TBO_ERP.getStateLabel('project', newState)}`);
      this._refreshBoard();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECT MODAL (Create / Edit / Detail)
  // ═══════════════════════════════════════════════════════════════════════════

  _showProjectModal(projectId) {
    const existing = projectId ? TBO_STORAGE.getErpEntity('project', projectId) : null;
    const isNew = !existing;
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.project : null;
    const team = this._getTeamMembers();
    const BUS = ['Digital 3D','Audiovisual','Branding','Marketing','Interiores','Gamificacao'];

    // Health score for existing projects
    let healthHtml = '';
    if (existing && typeof TBO_ERP !== 'undefined') {
      const health = TBO_ERP.calculateHealthScore(existing);
      const healthColor = TBO_ERP.getHealthColor(health.score);
      healthHtml = `<div style="display:flex;align-items:center;gap:8px;padding:12px;background:${healthColor}15;border:1px solid ${healthColor}30;border-radius:8px;margin-bottom:16px;">
        <div style="font-size:1.5rem;font-weight:700;color:${healthColor};">${health.score}</div>
        <div>
          <div style="font-size:0.82rem;font-weight:600;color:${healthColor};">Saude do Projeto</div>
          ${health.reasons.length > 0 ? `<div style="font-size:0.72rem;color:var(--text-muted);">${health.reasons.join(' | ')}</div>` : '<div style="font-size:0.72rem;color:#22c55e;">Tudo em ordem</div>'}
        </div>
      </div>`;
    }

    // State transitions
    let transitionHtml = '';
    if (existing && sm) {
      const validTransitions = TBO_ERP.getValidTransitions('project', existing.status);
      if (validTransitions.length > 0) {
        transitionHtml = `<div style="margin-bottom:16px;">
          <label class="form-label">Mudar Status</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span class="tag" style="background:${sm.colors[existing.status]}30;color:${sm.colors[existing.status]};border:1px solid ${sm.colors[existing.status]}50;">${sm.labels[existing.status]} (atual)</span>
            \u2192
            ${validTransitions.map(t => `<button class="btn btn-secondary" style="font-size:0.72rem;padding:3px 10px;color:${t.color};border-color:${t.color}40;" onclick="TBO_PROJETOS._transitionProject('${existing.id}','${t.state}')">${t.label}</button>`).join('')}
          </div>
        </div>`;
      }
    }

    // Tasks & deliverables for existing project
    let tasksDelivsHtml = '';
    if (existing) {
      const tasks = TBO_STORAGE.getErpEntitiesByParent('task', existing.id);
      const deliverables = TBO_STORAGE.getErpEntitiesByParent('deliverable', existing.id);
      const taskSm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
      const delSm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.deliverable : null;

      tasksDelivsHtml = `
        <div style="border-top:1px solid var(--border-subtle);padding-top:16px;margin-top:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h4 style="font-size:0.9rem;font-weight:700;">Tarefas (${tasks.length})</h4>
            <button class="btn btn-secondary" style="font-size:0.68rem;padding:3px 8px;" onclick="TBO_PROJETOS._addTask('${existing.id}')">+ Tarefa</button>
          </div>
          ${tasks.length > 0 ? tasks.slice(0, 10).map(t => {
            const tc = taskSm ? taskSm.colors[t.status] || '#94a3b8' : '#94a3b8';
            return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:0.78rem;">
              <input type="checkbox" ${t.status === 'concluida' ? 'checked' : ''} onchange="TBO_PROJETOS._toggleTask('${t.id}', this.checked)">
              <span style="flex:1;">${TBO_FORMATTER.escapeHtml(t.title)}</span>
              <span style="font-size:0.65rem;color:${tc};">${taskSm ? taskSm.labels[t.status] : t.status}</span>
              ${t.due_date ? `<span style="font-size:0.65rem;color:var(--text-muted);">${t.due_date}</span>` : ''}
            </div>`;
          }).join('') : '<div style="font-size:0.78rem;color:var(--text-muted);">Nenhuma tarefa</div>'}
        </div>
        <div style="border-top:1px solid var(--border-subtle);padding-top:16px;margin-top:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h4 style="font-size:0.9rem;font-weight:700;">Entregaveis (${deliverables.length})</h4>
            <button class="btn btn-secondary" style="font-size:0.68rem;padding:3px 8px;" onclick="TBO_PROJETOS._addDeliverable('${existing.id}')">+ Entregavel</button>
          </div>
          ${deliverables.length > 0 ? deliverables.map(d => {
            const dc = delSm ? delSm.colors[d.status] || '#94a3b8' : '#94a3b8';
            return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:0.78rem;">
              <span style="flex:1;font-weight:500;">${_escapeHtml(d.name)}</span>
              <span class="tag" style="font-size:0.6rem;background:${dc}20;color:${dc};">${delSm ? delSm.labels[d.status] : d.status}</span>
              ${d.current_version ? `<span style="font-size:0.65rem;color:var(--text-muted);">${d.current_version}</span>` : ''}
            </div>`;
          }).join('') : '<div style="font-size:0.78rem;color:var(--text-muted);">Nenhum entregavel</div>'}
        </div>
        ${!existing.playbook ? `<div style="border-top:1px solid var(--border-subtle);padding-top:16px;margin-top:16px;">
          <label class="form-label">Aplicar Playbook</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${Object.entries(typeof TBO_ERP !== 'undefined' ? TBO_ERP.playbooks : {}).map(([key, pb]) =>
              `<button class="btn btn-secondary" style="font-size:0.72rem;" onclick="TBO_PROJETOS._applyPlaybook('${existing.id}','${key}')">${pb.name}</button>`
            ).join('')}
          </div>
        </div>` : `<div style="font-size:0.78rem;color:var(--text-muted);margin-top:12px;">Playbook: ${existing.playbook_name || existing.playbook}</div>`}
      `;
    }

    // Entity history for existing
    let historyHtml = '';
    if (existing && typeof TBO_ERP !== 'undefined') {
      const history = TBO_ERP.getEntityHistory('project', existing.id).slice(0, 10);
      if (history.length > 0) {
        historyHtml = `<div style="border-top:1px solid var(--border-subtle);padding-top:16px;margin-top:16px;">
          <h4 style="font-size:0.9rem;font-weight:700;margin-bottom:8px;">Historico</h4>
          ${history.map(h => `<div style="font-size:0.72rem;color:var(--text-muted);padding:3px 0;">
            ${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.relativeTime(h.timestamp) : h.timestamp.slice(0, 16)} — ${h.userId}: ${h.action}${h.from ? ' (' + h.from + ' \u2192 ' + h.to + ')' : ''} ${h.reason || ''}
          </div>`).join('')}
        </div>`;
      }
    }

    const p = existing || {};
    const overviewHtml = existing ? this._renderProjectOverview(existing) : '';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal modal--lg active" style="max-width:${existing ? '860' : '700'}px;">
        <div class="modal-header">
          <h3 class="modal-title">${isNew ? 'Novo Projeto' : `${p.code ? '<span style="font-family:monospace;font-size:0.72rem;color:var(--text-muted);font-weight:400;margin-right:8px;">' + _escapeHtml(p.code) + '</span>' : ''}${_escapeHtml(p.name)}`}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body" style="max-height:75vh;overflow-y:auto;">
          ${existing ? `
            <!-- Project Overview Tabs -->
            <div class="tab-bar" style="margin-bottom:16px;font-size:0.82rem;">
              <button class="tab active pj-modal-tab" data-mtab="overview">Resumo</button>
              <button class="tab pj-modal-tab" data-mtab="edit">Editar</button>
              <button class="tab pj-modal-tab" data-mtab="tasks">Tarefas</button>
            </div>
            <div class="pj-modal-panel active" id="pjMtab-overview">${overviewHtml}</div>
            <div class="pj-modal-panel" id="pjMtab-edit" style="display:none;">
          ` : ''}
          ${healthHtml}
          ${transitionHtml}
          <div class="grid-2" style="gap:12px;">
            <div class="form-group">
              <label class="form-label">Nome do Projeto*</label>
              <input type="text" class="form-input" id="pjModalName" value="${_escapeHtml(p.name)}">
            </div>
            <div class="form-group">
              <label class="form-label">Cliente/Construtora*</label>
              <input type="text" class="form-input" id="pjModalClient" value="${_escapeHtml(p.client)}" list="pjClientList">
              <datalist id="pjClientList">
                ${(TBO_STORAGE.get('context').clientes_construtoras || []).map(c => `<option value="${c}">`).join('')}
              </datalist>
            </div>
          </div>
          <div class="grid-3" style="gap:12px;">
            <div class="form-group">
              <label class="form-label">Responsavel</label>
              <select class="form-input" id="pjModalOwner">
                <option value="">Selecione</option>
                ${team.map(t => `<option value="${_escapeHtml(t)}" ${p.owner === t ? 'selected' : ''}>${_escapeHtml(t)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Valor (R$)</label>
              <input type="number" class="form-input" id="pjModalValue" value="${p.value || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Prioridade</label>
              <select class="form-input" id="pjModalPriority">
                <option value="baixa" ${p.priority === 'baixa' ? 'selected' : ''}>Baixa</option>
                <option value="media" ${p.priority === 'media' || !p.priority ? 'selected' : ''}>Media</option>
                <option value="alta" ${p.priority === 'alta' ? 'selected' : ''}>Alta</option>
                <option value="urgente" ${p.priority === 'urgente' ? 'selected' : ''}>Urgente</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Servicos (BUs)</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${BUS.map(bu => `<label style="display:flex;align-items:center;gap:4px;font-size:0.82rem;cursor:pointer;">
                <input type="checkbox" value="${bu}" class="pjModalService" ${(p.services || []).includes(bu) ? 'checked' : ''}> ${bu}
              </label>`).join('')}
            </div>
          </div>
          <div class="grid-2" style="gap:12px;margin-top:4px;">
            <div class="form-group">
              <label class="form-label">Data de Inicio</label>
              <input type="date" class="form-input" id="pjModalStartDate" value="${p.start_date || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Prazo Final</label>
              <input type="date" class="form-input" id="pjModalEndDate" value="${p.end_date || ''}">
            </div>
          </div>
          <div class="grid-2" style="gap:12px;">
            <div class="form-group">
              <label class="form-label">Proxima Acao</label>
              <input type="text" class="form-input" id="pjModalNextAction" value="${_escapeHtml(p.next_action)}" placeholder="O que precisa ser feito a seguir?">
            </div>
            <div class="form-group">
              <label class="form-label">Prazo Proxima Acao</label>
              <input type="date" class="form-input" id="pjModalNextDate" value="${p.next_action_date || ''}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Notas</label>
            <textarea class="form-input" id="pjModalNotes" rows="3">${_escapeHtml(p.notes)}</textarea>
          </div>
          ${existing ? `
            </div><!-- close pjMtab-edit -->
            <div class="pj-modal-panel" id="pjMtab-tasks" style="display:none;">
              ${tasksDelivsHtml}
              ${historyHtml}
            </div>
          ` : `
            ${tasksDelivsHtml}
            ${historyHtml}
          `}
        </div>
        <div class="modal-footer" style="display:flex;justify-content:${isNew ? 'flex-end' : 'space-between'};">
          ${!isNew ? `<button class="btn btn-secondary" style="color:#ef4444;" onclick="TBO_PROJETOS._deleteProject('${p.id}')">Excluir</button>` : ''}
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
            <button class="btn btn-primary" onclick="TBO_PROJETOS._saveProject('${p.id || ''}')">${isNew ? 'Criar Projeto' : 'Salvar'}</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    // Modal tab switching
    modal.querySelectorAll('.pj-modal-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        modal.querySelectorAll('.pj-modal-tab').forEach(t => t.classList.remove('active'));
        modal.querySelectorAll('.pj-modal-panel').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
        tab.classList.add('active');
        const panel = modal.querySelector(`#pjMtab-${tab.dataset.mtab}`);
        if (panel) { panel.classList.add('active'); panel.style.display = ''; }
      });
    });
  },

  _saveProject(existingId) {
    const name = document.getElementById('pjModalName')?.value?.trim();
    const client = document.getElementById('pjModalClient')?.value?.trim();
    if (!name) { TBO_TOAST.warning('Nome do projeto e obrigatorio'); return; }
    if (!client) { TBO_TOAST.warning('Cliente e obrigatorio'); return; }

    const services = [];
    document.querySelectorAll('.pjModalService:checked').forEach(cb => services.push(cb.value));

    const data = {
      name,
      client,
      client_company: client,
      owner: document.getElementById('pjModalOwner')?.value || '',
      value: Number(document.getElementById('pjModalValue')?.value) || 0,
      priority: document.getElementById('pjModalPriority')?.value || 'media',
      services,
      start_date: document.getElementById('pjModalStartDate')?.value || null,
      end_date: document.getElementById('pjModalEndDate')?.value || null,
      next_action: document.getElementById('pjModalNextAction')?.value?.trim() || null,
      next_action_date: document.getElementById('pjModalNextDate')?.value || null,
      notes: document.getElementById('pjModalNotes')?.value?.trim() || ''
    };

    if (existingId) {
      TBO_STORAGE.updateErpEntity('project', existingId, data);
      TBO_ERP.addAuditLog({
        entityType: 'project', entityId: existingId,
        action: 'updated', userId: TBO_ERP._getCurrentUserId(),
        reason: 'Dados atualizados', entityName: name
      });
      TBO_TOAST.success('Projeto atualizado');
    } else {
      data.status = 'briefing';
      data.source = 'manual';
      data.code = typeof TBO_ERP !== 'undefined' ? TBO_ERP.generateProjectCode() : null;
      const newProject = TBO_STORAGE.addErpEntity('project', data);
      TBO_ERP.addAuditLog({
        entityType: 'project', entityId: newProject.id,
        action: 'created', userId: TBO_ERP._getCurrentUserId(),
        reason: 'Projeto criado manualmente', entityName: name
      });
      TBO_TOAST.success('Projeto criado');
    }

    document.querySelector('.modal-overlay')?.remove();
    this._refreshModule();
  },

  _deleteProject(projectId) {
    if (!confirm('Tem certeza que deseja excluir este projeto? Esta acao nao pode ser desfeita.')) return;
    const project = TBO_STORAGE.getErpEntity('project', projectId);
    TBO_STORAGE.deleteErpEntity('project', projectId);
    TBO_ERP.addAuditLog({
      entityType: 'project', entityId: projectId,
      action: 'deleted', userId: TBO_ERP._getCurrentUserId(),
      reason: 'Projeto excluido', entityName: project?.name || projectId
    });
    TBO_TOAST.success('Projeto excluido');
    document.querySelector('.modal-overlay')?.remove();
    this._refreshModule();
  },

  _transitionProject(projectId, newState) {
    const result = TBO_ERP.transition('project', projectId, newState);
    if (result.ok) {
      TBO_TOAST.success(`Status alterado para ${TBO_ERP.getStateLabel('project', newState)}`);
      document.querySelector('.modal-overlay')?.remove();
      this._refreshModule();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TASK & DELIVERABLE quick actions
  // ═══════════════════════════════════════════════════════════════════════════

  _toggleTask(taskId, completed) {
    if (typeof TBO_ERP === 'undefined') return;
    const newState = completed ? 'concluida' : 'pendente';
    TBO_ERP.transition('task', taskId, newState);
    // Light refresh
    const taskEl = document.querySelector(`[onchange*="${taskId}"]`);
    if (taskEl) {
      const card = taskEl.closest('.card');
      if (card) card.style.opacity = completed ? '0.5' : '1';
    }
  },

  _addTask(projectId) {
    const project = TBO_STORAGE.getErpEntity('project', projectId);
    const existingTasks = TBO_STORAGE.getErpEntitiesByParent('task', projectId);
    const team = this._getTeamMembers();

    const modal2 = document.createElement('div');
    modal2.className = 'modal-overlay active';
    modal2.style.zIndex = '1001';
    modal2.innerHTML = `
      <div class="modal active" style="max-width:480px;">
        <div class="modal-header">
          <h3 class="modal-title">Nova Tarefa</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Titulo*</label>
            <input type="text" class="form-input" id="ntTitle" placeholder="Nome da tarefa">
          </div>
          <div class="grid-2" style="gap:12px;">
            <div class="form-group">
              <label class="form-label">Responsavel</label>
              <select class="form-input" id="ntOwner">
                <option value="${_escapeHtml(project?.owner) || ''}">${_escapeHtml(project?.owner) || 'Selecione'}</option>
                ${team.filter(t => t !== project?.owner).map(t => `<option value="${_escapeHtml(t)}">${_escapeHtml(t)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Prioridade</label>
              <select class="form-input" id="ntPriority">
                <option value="baixa">Baixa</option>
                <option value="media" selected>Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>
          <div class="grid-2" style="gap:12px;">
            <div class="form-group">
              <label class="form-label">Data inicio</label>
              <input type="date" class="form-input" id="ntStartDate">
            </div>
            <div class="form-group">
              <label class="form-label">Prazo</label>
              <input type="date" class="form-input" id="ntDueDate">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Estimativa (minutos)</label>
            <input type="number" class="form-input" id="ntEstimate" placeholder="60" min="0">
          </div>
          ${existingTasks.length > 0 ? `<div class="form-group">
            <label class="form-label">Depende de (bloqueada ate concluir)</label>
            <select class="form-input" id="ntDependsOn">
              <option value="">Nenhuma dependencia</option>
              ${existingTasks.filter(t => t.status !== 'cancelada').map(t => `<option value="${t.id}">${TBO_FORMATTER.escapeHtml(t.title || t.name)}</option>`).join('')}
            </select>
          </div>` : ''}
        </div>
        <div class="modal-footer" style="display:flex;justify-content:flex-end;gap:8px;">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
          <button class="btn btn-primary" id="ntSaveTask">Criar Tarefa</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal2);
    modal2.addEventListener('click', (e) => { if (e.target === modal2) modal2.remove(); });

    modal2.querySelector('#ntSaveTask').addEventListener('click', () => {
      const title = modal2.querySelector('#ntTitle')?.value?.trim();
      if (!title) { TBO_TOAST.warning('Titulo e obrigatorio'); return; }
      const depId = modal2.querySelector('#ntDependsOn')?.value || null;
      TBO_STORAGE.addErpEntity('task', {
        title,
        project_id: projectId,
        project_name: project?.name || '',
        owner: modal2.querySelector('#ntOwner')?.value || project?.owner || '',
        status: 'pendente',
        start_date: modal2.querySelector('#ntStartDate')?.value || null,
        due_date: modal2.querySelector('#ntDueDate')?.value || null,
        priority: modal2.querySelector('#ntPriority')?.value || 'media',
        estimate_minutes: parseInt(modal2.querySelector('#ntEstimate')?.value) || 0,
        depends_on: depId ? [depId] : [],
        source: 'manual'
      });
      TBO_ERP.addAuditLog({
        entityType: 'task', entityId: 'new',
        action: 'created', userId: TBO_ERP._getCurrentUserId(),
        reason: `Tarefa adicionada ao projeto ${project?.name}`, entityName: title
      });
      TBO_TOAST.success('Tarefa adicionada');
      modal2.remove();
      document.querySelector('.modal-overlay')?.remove();
      this._refreshModule();
    });
  },

  _addDeliverable(projectId) {
    const project = TBO_STORAGE.getErpEntity('project', projectId);
    const name = prompt('Nome do entregavel:');
    if (!name) return;
    TBO_STORAGE.addErpEntity('deliverable', {
      name,
      project_id: projectId,
      project_name: project?.name || '',
      owner: project?.owner || '',
      status: 'pendente',
      versions: [],
      current_version: null,
      source: 'manual'
    });
    TBO_TOAST.success('Entregavel adicionado');
    document.querySelector('.modal-overlay')?.remove();
    this._refreshModule();
  },

  _addVersion(deliverableId) {
    const desc = prompt('Descricao da versao:');
    if (!desc) return;
    const result = TBO_ERP.addDeliverableVersion(deliverableId, { description: desc });
    if (result.ok) {
      TBO_TOAST.success(`Versao ${result.version.code} criada`);
      this._refreshModule();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  _approveDeliverable(deliverableId) {
    const deliverable = TBO_STORAGE.getErpEntity('deliverable', deliverableId);
    if (!deliverable) return;
    const result = TBO_ERP.approveVersion(deliverableId, deliverable.current_version, 'Aprovado');
    if (result.ok) {
      TBO_TOAST.success('Entregavel aprovado');
      this._refreshModule();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  _requestRevision(deliverableId) {
    const feedback = prompt('Feedback para revisao:');
    if (!feedback) return;
    const deliverable = TBO_STORAGE.getErpEntity('deliverable', deliverableId);
    if (!deliverable) return;
    const result = TBO_ERP.requestRevision(deliverableId, deliverable.current_version, feedback);
    if (result.ok) {
      TBO_TOAST.success('Revisao solicitada');
      this._refreshModule();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMESHEET / TIMER ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  _startTimerFromTab() {
    const userId = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser()?.id : null;
    if (!userId) { TBO_TOAST.warning('Login necessario'); return; }
    const projectId = document.getElementById('tsTimerProject')?.value;
    const taskId = document.getElementById('tsTimerTask')?.value || null;
    const desc = document.getElementById('tsTimerDesc')?.value?.trim() || '';
    if (!projectId) { TBO_TOAST.warning('Selecione um projeto'); return; }
    const result = TBO_WORKLOAD.startTimer(userId, projectId, taskId, desc, true);
    if (result.ok) {
      TBO_TOAST.success('Timer iniciado');
      this._refreshTimesheetTab();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  _stopTimerFromTab() {
    const userId = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser()?.id : null;
    if (!userId) return;
    const result = TBO_WORKLOAD.stopTimer(userId);
    if (result.ok) {
      TBO_TOAST.success(`Timer parado: ${TBO_WORKLOAD.formatHoursMinutes(result.duration_minutes)}`);
      this._refreshTimesheetTab();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  _startTimerForTask(projectId, taskId, taskName) {
    const userId = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser()?.id : null;
    if (!userId) { TBO_TOAST.warning('Login necessario'); return; }
    const result = TBO_WORKLOAD.startTimer(userId, projectId, taskId, taskName || '', true);
    if (result.ok) {
      TBO_TOAST.success('Timer iniciado para: ' + (taskName || 'tarefa'));
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  _showManualEntryModal() {
    const userId = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser()?.id : null;
    if (!userId) { TBO_TOAST.warning('Login necessario'); return; }
    const projects = TBO_STORAGE.getAllErpEntities('project').filter(p => !['finalizado','cancelado'].includes(p.status));
    const today = TBO_WORKLOAD._today();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal active" style="max-width:450px;">
        <div class="modal-header">
          <h3 class="modal-title">Lancamento Manual</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Projeto*</label>
            <select class="form-input" id="meProject">
              <option value="">Selecione...</option>
              ${projects.map(p => `<option value="${p.id}">${_escapeHtml(p.name)}</option>`).join('')}
            </select>
          </div>
          <div class="grid-2" style="gap:12px;">
            <div class="form-group">
              <label class="form-label">Data*</label>
              <input type="date" class="form-input" id="meDate" value="${today}" max="${today}">
            </div>
            <div class="form-group">
              <label class="form-label">Duracao (minutos)*</label>
              <input type="number" class="form-input" id="meDuration" min="1" max="720" placeholder="60">
            </div>
          </div>
          <div class="grid-2" style="gap:12px;">
            <div class="form-group">
              <label class="form-label">Inicio</label>
              <input type="time" class="form-input" id="meStart">
            </div>
            <div class="form-group">
              <label class="form-label">Fim</label>
              <input type="time" class="form-input" id="meEnd">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Descricao</label>
            <input type="text" class="form-input" id="meDesc" placeholder="O que foi feito?">
          </div>
          <div class="form-group">
            <label style="display:flex;align-items:center;gap:6px;font-size:0.82rem;cursor:pointer;">
              <input type="checkbox" id="meBillable" checked> Billable
            </label>
          </div>
        </div>
        <div class="modal-footer" style="display:flex;justify-content:flex-end;gap:8px;">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
          <button class="btn btn-primary" onclick="TBO_PROJETOS._saveManualEntry()">Salvar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  },

  _saveManualEntry() {
    const projectId = document.getElementById('meProject')?.value;
    const date = document.getElementById('meDate')?.value;
    const duration = parseInt(document.getElementById('meDuration')?.value);
    const startTime = document.getElementById('meStart')?.value || null;
    const endTime = document.getElementById('meEnd')?.value || null;
    const desc = document.getElementById('meDesc')?.value?.trim() || '';
    const billable = document.getElementById('meBillable')?.checked !== false;

    if (!projectId) { TBO_TOAST.warning('Selecione um projeto'); return; }
    if (!date) { TBO_TOAST.warning('Informe a data'); return; }
    if (!duration || duration <= 0) { TBO_TOAST.warning('Informe a duracao em minutos'); return; }

    const result = TBO_WORKLOAD.addManualEntry({
      project_id: projectId,
      date,
      duration_minutes: duration,
      start_time: startTime,
      end_time: endTime,
      description: desc,
      billable
    });

    if (result.ok) {
      TBO_TOAST.success('Lancamento adicionado');
      document.querySelector('.modal-overlay')?.remove();
      this._refreshTimesheetTab();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  _editTimeEntry(entryId) {
    const entry = TBO_STORAGE.getErpEntity('time_entry', entryId);
    if (!entry) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal active" style="max-width:400px;">
        <div class="modal-header">
          <h3 class="modal-title">Editar Entrada</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="grid-2" style="gap:12px;">
            <div class="form-group">
              <label class="form-label">Duracao (min)</label>
              <input type="number" class="form-input" id="eeMinutes" value="${entry.duration_minutes}" min="1">
            </div>
            <div class="form-group">
              <label class="form-label">Data</label>
              <input type="date" class="form-input" id="eeDate" value="${entry.date}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Descricao</label>
            <input type="text" class="form-input" id="eeDesc" value="${_escapeHtml(entry.description)}">
          </div>
        </div>
        <div class="modal-footer" style="display:flex;justify-content:space-between;">
          <button class="btn btn-secondary" style="color:#ef4444;" onclick="TBO_PROJETOS._deleteTimeEntry('${entryId}')">Excluir</button>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
            <button class="btn btn-primary" onclick="TBO_PROJETOS._updateTimeEntry('${entryId}')">Salvar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  },

  _updateTimeEntry(entryId) {
    const mins = parseInt(document.getElementById('eeMinutes')?.value);
    const date = document.getElementById('eeDate')?.value;
    const desc = document.getElementById('eeDesc')?.value?.trim() || '';
    if (!mins || mins <= 0) { TBO_TOAST.warning('Duracao invalida'); return; }
    const result = TBO_WORKLOAD.updateEntry(entryId, { duration_minutes: mins, date, description: desc });
    if (result.ok) {
      TBO_TOAST.success('Entrada atualizada');
      document.querySelector('.modal-overlay')?.remove();
      this._refreshTimesheetTab();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  _deleteTimeEntry(entryId) {
    if (!confirm('Excluir esta entrada de tempo?')) return;
    const result = TBO_WORKLOAD.deleteEntry(entryId);
    if (result.ok) {
      TBO_TOAST.success('Entrada excluida');
      document.querySelector('.modal-overlay')?.remove();
      this._refreshTimesheetTab();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  _onTimerProjectChange() {
    const projectId = document.getElementById('tsTimerProject')?.value;
    const taskSelect = document.getElementById('tsTimerTask');
    if (!taskSelect) return;
    taskSelect.innerHTML = '<option value="">Geral</option>';
    if (!projectId) return;
    const tasks = TBO_STORAGE.getErpEntitiesByParent('task', projectId)
      .filter(t => t.status !== 'concluida' && t.status !== 'cancelada');
    tasks.forEach(t => {
      taskSelect.innerHTML += `<option value="${t.id}">${TBO_FORMATTER.escapeHtml(t.title || t.name)}</option>`;
    });
  },

  _refreshTimesheetTab() {
    const container = document.getElementById('tab-pj-tempo');
    if (container) container.innerHTML = this._renderTimesheetTab();
    this._bindTimesheetEvents();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GANTT ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  _toggleGanttProject(projectId) {
    this._ganttExpandedProjects[projectId] = !this._ganttExpandedProjects[projectId];
    const container = document.getElementById('tab-pj-gantt');
    if (container) container.innerHTML = this._renderGanttTab();
    this._bindGanttEvents();
  },

  _refreshGanttTab() {
    const container = document.getElementById('tab-pj-gantt');
    if (container) container.innerHTML = this._renderGanttTab();
    this._bindGanttEvents();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKLOAD ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  _showCapacityConfig() {
    const config = TBO_WORKLOAD.getCapacityConfig();
    const team = TBO_WORKLOAD._getTeamList();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal active" style="max-width:500px;">
        <div class="modal-header">
          <h3 class="modal-title">Configurar Capacidade</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body" style="max-height:60vh;overflow-y:auto;">
          <div class="form-group">
            <label class="form-label">Horas semanais padrao</label>
            <input type="number" class="form-input" id="capDefault" value="${config.defaults?.weekly_hours || 40}" min="1" max="60">
          </div>
          <h4 style="font-size:0.82rem;font-weight:700;margin:12px 0 8px;">Overrides por pessoa</h4>
          ${team.map(m => {
            const override = config.overrides?.[m.id]?.weekly_hours || '';
            return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span style="min-width:100px;font-size:0.78rem;">${_escapeHtml(m.nome)}</span>
              <input type="number" class="form-input capOverride" data-user="${m.id}" value="${override}" placeholder="${config.defaults?.weekly_hours || 40}" min="0" max="60" style="max-width:80px;font-size:0.78rem;">
              <span style="font-size:0.68rem;color:var(--text-muted);">h/sem</span>
            </div>`;
          }).join('')}
        </div>
        <div class="modal-footer" style="display:flex;justify-content:flex-end;gap:8px;">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
          <button class="btn btn-primary" onclick="TBO_PROJETOS._saveCapacityConfig()">Salvar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  },

  _saveCapacityConfig() {
    const defaultHours = parseInt(document.getElementById('capDefault')?.value) || 40;
    const overrides = {};
    document.querySelectorAll('.capOverride').forEach(input => {
      const userId = input.dataset.user;
      const val = parseInt(input.value);
      if (val && val !== defaultHours) {
        overrides[userId] = { weekly_hours: val };
      }
    });
    const config = { defaults: { weekly_hours: defaultHours }, overrides };
    TBO_WORKLOAD.saveCapacityConfig(config);
    TBO_TOAST.success('Capacidade atualizada');
    document.querySelector('.modal-overlay')?.remove();
    const container = document.getElementById('tab-pj-carga');
    if (container) container.innerHTML = this._renderWorkloadTab();
    this._bindWorkloadEvents();
  },

  _refreshWorkloadTab() {
    const container = document.getElementById('tab-pj-carga');
    if (container) container.innerHTML = this._renderWorkloadTab();
    this._bindWorkloadEvents();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT BINDING HELPERS for new tabs
  // ═══════════════════════════════════════════════════════════════════════════

  _bindTimesheetEvents() {
    // Timer controls
    this._bind('tsStartTimer', () => this._startTimerFromTab());
    this._bind('tsStopTimer', () => this._stopTimerFromTab());
    this._bind('tsManualEntry', () => this._showManualEntryModal());

    // Week navigation
    this._bind('tsPrevWeek', () => { this._timesheetWeekOffset--; this._refreshTimesheetTab(); });
    this._bind('tsNextWeek', () => { this._timesheetWeekOffset++; this._refreshTimesheetTab(); });

    // Project change populates tasks
    const projSel = document.getElementById('tsTimerProject');
    if (projSel) projSel.addEventListener('change', () => this._onTimerProjectChange());

    // Inline timer clock update
    const userId = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser()?.id : null;
    if (userId) {
      const timer = TBO_WORKLOAD.getRunningTimer(userId);
      if (timer) {
        const clockEl = document.getElementById('tsTimerClock');
        if (clockEl) {
          const update = () => {
            const elapsed = Math.round((Date.now() - new Date(timer.started_at).getTime()) / 1000);
            const hh = String(Math.floor(elapsed / 3600)).padStart(2, '0');
            const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
            const ss = String(elapsed % 60).padStart(2, '0');
            clockEl.textContent = `${hh}:${mm}:${ss}`;
          };
          update();
          this._tsClockInterval = setInterval(update, 1000);
        }
      }
    }
  },

  _tsClockInterval: null,

  _ganttFilterStatus: '',
  _ganttFilterOwner: '',

  _bindGanttEvents() {
    this._bind('ganttPrev', () => { this._ganttMonthOffset--; this._refreshGanttTab(); });
    this._bind('ganttNext', () => { this._ganttMonthOffset++; this._refreshGanttTab(); });
    this._bind('ganttToday', () => { this._ganttMonthOffset = 0; this._refreshGanttTab(); });

    // Scale buttons
    document.querySelectorAll('.gantt-scale-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._ganttScale = btn.dataset.scale;
        this._refreshGanttTab();
      });
    });

    // Gantt filters
    const gfStatus = document.getElementById('ganttFilterStatus');
    if (gfStatus) gfStatus.addEventListener('change', () => { this._ganttFilterStatus = gfStatus.value; this._refreshGanttTab(); });
    const gfOwner = document.getElementById('ganttFilterOwner');
    if (gfOwner) gfOwner.addEventListener('change', () => { this._ganttFilterOwner = gfOwner.value; this._refreshGanttTab(); });

    // Drag to resize/move bars
    this._initGanttDrag();
  },

  _initGanttDrag() {
    const body = document.getElementById('ganttBody');
    if (!body) return;

    const self = this;

    body.addEventListener('mousedown', function(e) {
      const handle = e.target.closest('.gantt-drag-handle');
      const bar = e.target.closest('.gantt-bar-drag');
      if (!bar) return;

      e.preventDefault();
      const entityType = bar.dataset.entityType;
      const entityId = bar.dataset.entityId;
      const sc = self._getGanttScaleConfig();
      const startX = e.clientX;
      const origLeft = parseFloat(bar.style.left);
      const origWidth = parseFloat(bar.style.width);
      const mode = handle ? handle.dataset.handle : 'move'; // 'left', 'right', or 'move'

      bar.style.cursor = mode === 'move' ? 'grabbing' : 'ew-resize';
      bar.style.opacity = '0.6';
      bar.style.zIndex = '20';

      // Snap-to-day helper: round pixel to nearest cell boundary
      function snapPx(px) {
        return Math.round(px / sc.cellW) * sc.cellW;
      }

      // Tooltip element for live date preview
      let tooltip = document.createElement('div');
      tooltip.className = 'gantt-drag-tooltip';
      tooltip.style.cssText = 'position:fixed;padding:4px 8px;background:#1a1a1a;color:#fff;font-size:0.65rem;border-radius:4px;pointer-events:none;z-index:100;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:none;';
      document.body.appendChild(tooltip);

      function onMouseMove(ev) {
        const dx = ev.clientX - startX;
        if (mode === 'move') {
          const snappedLeft = snapPx(origLeft + dx);
          bar.style.left = snappedLeft + 'px';
        } else if (mode === 'left') {
          const rawLeft = origLeft + dx;
          const snappedLeft = snapPx(rawLeft);
          const newWidth = origWidth - (snappedLeft - origLeft);
          if (newWidth > sc.cellW) { bar.style.left = snappedLeft + 'px'; bar.style.width = newWidth + 'px'; }
        } else if (mode === 'right') {
          const rawWidth = origWidth + dx;
          const snappedWidth = Math.max(sc.cellW, snapPx(rawWidth));
          bar.style.width = snappedWidth + 'px';
        }

        // Update live tooltip
        const curLeft = parseFloat(bar.style.left);
        const curWidth = parseFloat(bar.style.width);
        const sd = self._ganttPixelToDate(curLeft, sc.cols, sc.cellW);
        const ed = self._ganttPixelToDate(curLeft + curWidth, sc.cols, sc.cellW);
        tooltip.textContent = `${sd} → ${ed}`;
        tooltip.style.left = (ev.clientX + 12) + 'px';
        tooltip.style.top = (ev.clientY - 28) + 'px';
        tooltip.style.display = 'block';
      }

      function onMouseUp(ev) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        bar.style.cursor = 'grab';
        bar.style.opacity = entityType === 'task' ? '0.9' : '1';
        bar.style.zIndex = '3';
        if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);

        // Calculate new dates from snapped pixel positions
        const newLeft = parseFloat(bar.style.left);
        const newWidth = parseFloat(bar.style.width);
        const newStartDate = self._ganttPixelToDate(newLeft, sc.cols, sc.cellW);
        const newEndDate = self._ganttPixelToDate(newLeft + newWidth, sc.cols, sc.cellW);

        // Save to ERP
        if (entityType === 'project') {
          TBO_STORAGE.updateErpEntity('project', entityId, { start_date: newStartDate, end_date: newEndDate });
        } else {
          TBO_STORAGE.updateErpEntity('task', entityId, { start_date: newStartDate, due_date: newEndDate });
        }

        if (typeof TBO_ERP !== 'undefined') {
          TBO_ERP.addAuditLog({
            entityType, entityId,
            action: 'updated', userId: TBO_ERP._getCurrentUserId(),
            reason: `Datas alteradas via Gantt (${newStartDate} → ${newEndDate})`,
            entityName: bar.title?.split('\n')[0] || ''
          });
        }

        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Datas atualizadas');
        // Soft refresh to update label positions
        setTimeout(() => self._refreshGanttTab(), 150);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  },

  _bindMyTasksEvents() {
    const filterEl = document.getElementById('myTasksFilter');
    if (filterEl) filterEl.addEventListener('change', () => {
      this._myTasksFilter = filterEl.value;
      this._refreshMyTasksTab();
    });
    const sortEl = document.getElementById('myTasksSort');
    if (sortEl) sortEl.addEventListener('change', () => {
      this._myTasksSort = sortEl.value;
      this._refreshMyTasksTab();
    });
  },

  _refreshMyTasksTab() {
    const container = document.getElementById('tab-pj-mytasks');
    if (container) container.innerHTML = this._renderMyTasks();
    this._bindMyTasksEvents();
  },

  _bindWorkloadEvents() {
    this._bind('wlConfigCapacity', () => this._showCapacityConfig());
  },

  _applyPlaybook(projectId, playbookKey) {
    if (!confirm('Aplicar playbook? Isso vai criar tarefas e entregaveis automaticamente.')) return;
    const result = TBO_ERP.applyPlaybook(projectId, playbookKey);
    if (result.ok) {
      TBO_TOAST.success(`Playbook aplicado: ${result.taskCount} tarefas, ${result.delivCount} entregaveis`);
      document.querySelector('.modal-overlay')?.remove();
      this._refreshModule();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REFRESH
  // ═══════════════════════════════════════════════════════════════════════════

  _refreshBoard() {
    const projects = TBO_STORAGE.getAllErpEntities('project');
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.project : null;
    const board = document.getElementById('tab-pj-board');
    if (board) {
      board.innerHTML = this._renderBoard(projects, sm);
      this._initDragDrop();
    }
    const list = document.getElementById('pjListContainer');
    if (list) {
      const active = projects.filter(p => !['finalizado','cancelado'].includes(p.status));
      list.innerHTML = this._renderList(active);
    }
  },

  _refreshModule() {
    if (typeof TBO_ROUTER !== 'undefined') {
      TBO_ROUTER.navigate('projetos');
    } else {
      this._refreshBoard();
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AI GENERATORS (kept from original)
  // ═══════════════════════════════════════════════════════════════════════════

  async _generatePrep() {
    const proj = document.getElementById('pjPrepProjeto')?.value || '';
    const obj = document.getElementById('pjPrepObj')?.value || '';
    if (!proj) { TBO_TOAST.warning('Selecione um projeto'); return; }
    if (!TBO_API.isConfigured()) { TBO_TOAST.warning('API nao configurada'); return; }

    const out = document.getElementById('pjPrepOutput');
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.showLoading(out, 'Preparando briefing...');
      TBO_UX.btnLoading('pjGerarPrep', true, 'Preparando...');
    }

    try {
      let ctx = TBO_STORAGE.getProjectContext(proj) + '\n' + TBO_STORAGE.getClientContext(proj);
      // Add ERP context
      const erpProjects = TBO_STORAGE.getAllErpEntities('project');
      const match = erpProjects.find(p => p.name.toLowerCase().includes(proj.toLowerCase()));
      if (match) ctx += '\n' + TBO_STORAGE.getErpContext(match.id);

      const result = await TBO_API.callWithContext('projetos',
        `Prepare um briefing completo para reuniao do projeto "${proj}". ${obj ? 'Objetivo: ' + obj : ''} Inclua: resumo do projeto, historico, action items pendentes, pontos de atencao, e sugestoes de pauta.`, ctx);
      if (out) out.innerHTML = `<div class="card" style="padding:20px;">${TBO_FORMATTER.markdownToHtml(result.text)}</div>`;
    } catch (e) {
      if (typeof TBO_UX !== 'undefined') TBO_UX.showError(out, e.message, () => this._generatePrep());
      else if (out) out.innerHTML = `<div class="empty-state"><div class="empty-state-text">${e.message}</div></div>`;
    } finally {
      if (typeof TBO_UX !== 'undefined') TBO_UX.btnLoading('pjGerarPrep', false);
    }
  }
};
