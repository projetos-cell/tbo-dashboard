// TBO OS — Module: Gestao de Projetos (ERP MVP)
// State machine, phases, deliverables, ownership, next_action, health score
const TBO_PROJETOS = {
  _filters: { status: '', owner: '', search: '' },

  _getTeamMembers() {
    if (typeof TBO_RH !== 'undefined' && TBO_RH._team) return TBO_RH._team;
    const ctx = TBO_STORAGE.get('context');
    const equipe = ctx.dados_comerciais?.['2026']?.fluxo_caixa?.despesas_detalhadas?.pessoas?.equipe || [];
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

    return `
      <div class="projetos-module">
        <!-- KPIs -->
        <div class="grid-5" style="margin-bottom:24px;">
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
                ${active.map(p => `<option value="${p.name}">${p.name} (${p.client})</option>`).join('')}
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

    return `<div class="pipeline-card erp-project-card" draggable="true" data-id="${p.id}" onclick="TBO_PROJETOS._showProjectModal('${p.id}')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:0.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">${p.client || ''}</div>
        </div>
        <div class="deal-owner-badge" title="${p.owner || 'Sem responsavel'}" style="background:${p.owner ? 'var(--accent)' : '#ef4444'};">${ownerInitials}</div>
      </div>
      ${p.next_action ? `<div style="font-size:0.68rem;color:var(--accent-gold);margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${p.next_action}">
        \u25B6 ${p.next_action}
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
    </div>`;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ═══════════════════════════════════════════════════════════════════════════

  _renderList(projects) {
    const filtered = this._applyProjectFilters(projects);
    if (filtered.length === 0) return '<div class="empty-state"><div class="empty-state-text">Nenhum projeto encontrado</div></div>';
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.project : null;

    return filtered.map(p => {
      const health = typeof TBO_ERP !== 'undefined' ? TBO_ERP.calculateHealthScore(p) : { score: 100 };
      const healthColor = typeof TBO_ERP !== 'undefined' ? TBO_ERP.getHealthColor(health.score) : '#22c55e';
      const stateColor = sm ? sm.colors[p.status] || '#94a3b8' : '#94a3b8';
      const stateLabel = sm ? sm.labels[p.status] || p.status : p.status;
      const tasks = TBO_STORAGE.getErpEntitiesByParent('task', p.id);
      const doneTasks = tasks.filter(t => t.status === 'concluida').length;

      return `<div class="card" style="margin-bottom:8px;padding:14px;cursor:pointer;" onclick="TBO_PROJETOS._showProjectModal('${p.id}')">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:10px;height:10px;border-radius:50%;background:${healthColor};flex-shrink:0;" title="Saude: ${health.score}"></div>
              <span style="font-weight:600;font-size:0.9rem;">${p.name}</span>
              <span class="tag" style="font-size:0.68rem;background:${stateColor}20;color:${stateColor};border:1px solid ${stateColor}40;">${stateLabel}</span>
            </div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;">
              ${p.client || ''} ${p.owner ? '| ' + p.owner : '| <span style="color:#ef4444;">Sem responsavel</span>'}
              ${tasks.length > 0 ? ` | ${doneTasks}/${tasks.length} tarefas` : ''}
            </div>
            ${p.next_action ? `<div style="font-size:0.72rem;color:var(--accent-gold);margin-top:4px;">\u25B6 ${p.next_action}${p.next_action_date ? ' (' + p.next_action_date + ')' : ''}</div>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${p.value ? `<span style="font-size:0.82rem;font-weight:600;color:var(--accent-gold);">${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.currency(p.value) : 'R$' + p.value}</span>` : ''}
          </div>
        </div>
      </div>`;
    }).join('');
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
                  <span style="font-weight:600;font-size:0.82rem;">${t.title || t.name}</span>
                  <span class="tag" style="font-size:0.62rem;background:${stateColor}20;color:${stateColor};">${sm ? sm.labels[t.status] : t.status}</span>
                  ${t.estimate_minutes ? `<span style="font-size:0.62rem;color:var(--text-muted);">${TBO_WORKLOAD ? TBO_WORKLOAD.formatHoursMinutes(t.estimate_minutes) : t.estimate_minutes + 'min'}</span>` : ''}
                </div>
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">
                  ${t.project_name ? t.project_name + ' | ' : ''}${t.owner || '<span style="color:#ef4444;">Sem responsavel</span>'}
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
                  <span style="font-weight:600;font-size:0.82rem;">${d.name}</span>
                  <span class="tag" style="font-size:0.62rem;background:${stateColor}20;color:${stateColor};">${stateLabel}</span>
                  ${d.current_version ? `<span class="tag" style="font-size:0.62rem;">${d.current_version}</span>` : ''}
                </div>
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">
                  ${d.project_name || ''} | ${d.owner || 'Sem responsavel'} | ${versions.length} versao(es)
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
              <div style="font-weight:600;font-size:0.82rem;">${(() => { const p = TBO_STORAGE.getErpEntity('project', runningTimer.project_id); return p ? p.name : ''; })()}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);">${runningTimer.description || ''}</div>
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
                ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
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
            <div class="timesheet-cell timesheet-cell--project">${pr.project_name}</div>
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
                <span style="font-weight:600;color:var(--accent-gold);min-width:100px;">${project ? project.name : ''}</span>
                <span style="flex:1;color:var(--text-secondary);">${e.description || ''}</span>
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
    const isFounder = user && user.role === 'founder';
    const isFinance = user && user.role === 'finance';
    const canSeeCost = isFounder || isFinance;

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
                  <span style="font-weight:600;">${p.name}</span>
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
                <span style="min-width:100px;font-size:0.78rem;font-weight:600;">${u.userName}</span>
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
  // TAB: GANTT (CSS Grid Timeline)
  // ═══════════════════════════════════════════════════════════════════════════

  _ganttMonthOffset: 0,
  _ganttExpandedProjects: {},

  _renderGanttTab() {
    if (typeof TBO_WORKLOAD === 'undefined') {
      return '<div class="empty-state"><div class="empty-state-text">Modulo de workload nao carregado</div></div>';
    }

    // View range: current month +/- offset, show 35 days
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() + this._ganttMonthOffset);
    baseDate.setDate(1);
    const viewStart = baseDate.toISOString().split('T')[0];
    const viewEndDate = new Date(baseDate);
    viewEndDate.setDate(viewEndDate.getDate() + 34);
    const viewEnd = viewEndDate.toISOString().split('T')[0];

    const monthLabel = baseDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    // Build day columns
    const dayCols = [];
    const d = new Date(viewStart);
    for (let i = 0; i < 35; i++) {
      const ds = new Date(d).toISOString().split('T')[0];
      const dayNum = d.getDate();
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const isToday = ds === TBO_WORKLOAD._today();
      dayCols.push({ date: ds, dayNum, isWeekend, isToday });
      d.setDate(d.getDate() + 1);
    }

    const ganttData = TBO_WORKLOAD.getGanttData(viewStart, viewEnd);

    // Separate projects and tasks
    const projectRows = ganttData.filter(r => r.type === 'project');
    const taskRows = ganttData.filter(r => r.type === 'task');

    // Init expanded state
    projectRows.forEach(p => {
      if (this._ganttExpandedProjects[p.id] === undefined) this._ganttExpandedProjects[p.id] = false;
    });

    // Build visible rows
    const visibleRows = [];
    projectRows.forEach(p => {
      visibleRows.push(p);
      if (this._ganttExpandedProjects[p.id]) {
        const children = taskRows.filter(t => t.parentId === p.id);
        children.forEach(c => visibleRows.push(c));
      }
    });

    // Helper: date to column index
    const dateToCol = (dateStr) => {
      const colIdx = dayCols.findIndex(c => c.date === dateStr);
      if (colIdx >= 0) return colIdx + 1; // 1-based for grid
      // If before viewStart
      if (dateStr < viewStart) return 1;
      // If after viewEnd
      return dayCols.length;
    };

    return `
      <!-- Controls -->
      <div class="gantt-controls" style="margin-bottom:12px;">
        <button class="btn btn-secondary gantt-nav-btn" id="ganttPrev">&lt;</button>
        <span style="font-weight:700;font-size:0.85rem;min-width:150px;text-align:center;text-transform:capitalize;">${monthLabel}</span>
        <button class="btn btn-secondary gantt-nav-btn" id="ganttNext">&gt;</button>
        <button class="btn btn-secondary" id="ganttToday" style="font-size:0.68rem;padding:3px 8px;margin-left:12px;">Hoje</button>
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
              return `<div class="gantt-label-row gantt-label-row--project" onclick="TBO_PROJETOS._toggleGanttProject('${r.id}')" style="cursor:pointer;" title="${r.name}">
                <span style="font-size:0.7rem;margin-right:4px;">${expanded ? '&#9660;' : '&#9654;'}</span>
                <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.name}</span>
                <span style="font-size:0.6rem;color:var(--text-muted);margin-left:auto;">${childCount}</span>
              </div>`;
            } else {
              return `<div class="gantt-label-row gantt-label-row--task" title="${r.name}">
                <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.name}</span>
                ${r.owner ? `<span style="font-size:0.58rem;color:var(--text-muted);margin-left:auto;">${r.owner}</span>` : ''}
              </div>`;
            }
          }).join('')}
        </div>

        <!-- Timeline -->
        <div class="gantt-timeline" id="ganttTimeline">
          <!-- Day headers -->
          <div class="gantt-header" style="display:grid;grid-template-columns:repeat(${dayCols.length}, 28px);">
            ${dayCols.map(c => `<div class="gantt-header-cell${c.isWeekend ? ' gantt-header-cell--weekend' : ''}${c.isToday ? ' gantt-header-cell--today' : ''}">${c.dayNum}</div>`).join('')}
          </div>

          <!-- Row bars -->
          <div class="gantt-body" style="position:relative;">
            ${visibleRows.map((r, idx) => {
              const startCol = dateToCol(r.startDate);
              const endCol = dateToCol(r.endDate) + 1;
              const clampedStart = Math.max(1, startCol);
              const clampedEnd = Math.min(dayCols.length + 1, endCol);
              const barClass = r.type === 'project' ? 'gantt-bar gantt-bar--project' : 'gantt-bar gantt-bar--task';

              return `<div class="gantt-row" style="position:relative;height:36px;">
                <!-- Background grid -->
                <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(${dayCols.length}, 28px);">
                  ${dayCols.map(c => `<div style="border-right:1px solid var(--border-subtle);${c.isWeekend ? 'background:var(--bg-elevated);' : ''}"></div>`).join('')}
                </div>
                <!-- Bar -->
                ${clampedStart < clampedEnd ? `
                  <div class="${barClass}" style="position:absolute;top:8px;height:20px;left:${(clampedStart - 1) * 28}px;width:${(clampedEnd - clampedStart) * 28}px;background:${r.color};border-radius:4px;opacity:${r.type === 'task' ? '0.8' : '1'};" title="${r.name} (${r.startDate} - ${r.endDate})"></div>
                ` : ''}
              </div>`;
            }).join('')}

            <!-- Today line -->
            ${(() => {
              const todayIdx = dayCols.findIndex(c => c.isToday);
              if (todayIdx < 0) return '';
              return `<div class="gantt-today-line" style="position:absolute;top:0;bottom:0;left:${todayIdx * 28 + 14}px;width:2px;background:var(--accent-gold);z-index:10;pointer-events:none;"></div>`;
            })()}
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div style="display:flex;gap:12px;margin-top:10px;font-size:0.68rem;color:var(--text-muted);flex-wrap:wrap;">
        <span>&#9632; Projeto</span>
        <span>&#9632; Tarefa</span>
        <span style="color:var(--accent-gold);">&#9475; Hoje</span>
        <span>&#9654; Clique para expandir/colapsar</span>
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

    // New tab bindings: Timesheet, Workload, Gantt
    this._bindTimesheetEvents();
    this._bindGanttEvents();
    this._bindWorkloadEvents();

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
              <span style="flex:1;">${t.title}</span>
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
              <span style="flex:1;font-weight:500;">${d.name}</span>
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal modal--lg active" style="max-width:700px;">
        <div class="modal-header">
          <h3 class="modal-title">${isNew ? 'Novo Projeto' : p.name}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body" style="max-height:75vh;overflow-y:auto;">
          ${healthHtml}
          ${transitionHtml}
          <div class="grid-2" style="gap:12px;">
            <div class="form-group">
              <label class="form-label">Nome do Projeto*</label>
              <input type="text" class="form-input" id="pjModalName" value="${p.name || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Cliente/Construtora*</label>
              <input type="text" class="form-input" id="pjModalClient" value="${p.client || ''}" list="pjClientList">
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
                ${team.map(t => `<option value="${t}" ${p.owner === t ? 'selected' : ''}>${t}</option>`).join('')}
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
          <div class="grid-2" style="gap:12px;">
            <div class="form-group">
              <label class="form-label">Proxima Acao</label>
              <input type="text" class="form-input" id="pjModalNextAction" value="${p.next_action || ''}" placeholder="O que precisa ser feito a seguir?">
            </div>
            <div class="form-group">
              <label class="form-label">Prazo Proxima Acao</label>
              <input type="date" class="form-input" id="pjModalNextDate" value="${p.next_action_date || ''}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Notas</label>
            <textarea class="form-input" id="pjModalNotes" rows="3">${p.notes || ''}</textarea>
          </div>
          ${tasksDelivsHtml}
          ${historyHtml}
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
    const title = prompt('Nome da tarefa:');
    if (!title) return;
    const dueDate = prompt('Prazo (YYYY-MM-DD) ou deixe vazio:', '');
    TBO_STORAGE.addErpEntity('task', {
      title,
      project_id: projectId,
      project_name: project?.name || '',
      owner: project?.owner || '',
      status: 'pendente',
      due_date: dueDate || null,
      priority: 'media',
      source: 'manual'
    });
    TBO_ERP.addAuditLog({
      entityType: 'task', entityId: 'new',
      action: 'created', userId: TBO_ERP._getCurrentUserId(),
      reason: `Tarefa adicionada ao projeto ${project?.name}`, entityName: title
    });
    TBO_TOAST.success('Tarefa adicionada');
    document.querySelector('.modal-overlay')?.remove();
    this._refreshModule();
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
              ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
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
            <input type="text" class="form-input" id="eeDesc" value="${entry.description || ''}">
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
      taskSelect.innerHTML += `<option value="${t.id}">${t.title || t.name}</option>`;
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
              <span style="min-width:100px;font-size:0.78rem;">${m.nome}</span>
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

  _bindGanttEvents() {
    this._bind('ganttPrev', () => { this._ganttMonthOffset--; this._refreshGanttTab(); });
    this._bind('ganttNext', () => { this._ganttMonthOffset++; this._refreshGanttTab(); });
    this._bind('ganttToday', () => { this._ganttMonthOffset = 0; this._refreshGanttTab(); });
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
