// TBO OS — Module: Decisoes
// Tracks decisions from meetings, linked tasks, and action items
const TBO_DECISOES = {

  render() {
    if (typeof TBO_ERP !== 'undefined') TBO_ERP.init();

    const decisions = TBO_STORAGE.getAllErpEntities('decision');
    const meetings = TBO_STORAGE.getAllErpEntities('meeting_erp');
    const tasks = TBO_STORAGE.getAllErpEntities('task');
    const projects = TBO_STORAGE.getAllErpEntities('project');

    const projectMap = {};
    projects.forEach(p => { projectMap[p.id] = p; });
    const meetingMap = {};
    meetings.forEach(m => { meetingMap[m.id] = m; });

    // KPIs
    const total = decisions.length;
    const withTasks = decisions.filter(d => d.tasks_created && d.tasks_created.length > 0).length;
    const recent30d = decisions.filter(d => {
      const date = new Date(d.createdAt);
      return (new Date() - date) / (1000 * 60 * 60 * 24) <= 30;
    }).length;

    // Count pending action items (decisions without tasks)
    const pendingAction = decisions.filter(d => !d.tasks_created || d.tasks_created.length === 0).length;

    return `
      <div class="decisoes-module">
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Total Decisoes</div>
            <div class="kpi-value">${total}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Com Tarefas</div>
            <div class="kpi-value" style="color:#22c55e;">${withTasks}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Sem Acao Definida</div>
            <div class="kpi-value" style="color:${pendingAction > 0 ? '#f59e0b' : '#22c55e'};">${pendingAction}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Ultimos 30 dias</div>
            <div class="kpi-value">${recent30d}</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="dec-todas">Todas</button>
          <button class="tab" data-tab="dec-pendentes">Sem Tarefas (${pendingAction})</button>
          <button class="tab" data-tab="dec-por-reuniao">Por Reuniao</button>
        </div>

        <!-- Tab: Todas -->
        <div class="tab-content active" id="tab-dec-todas">
          ${this._renderDecisionList(decisions, projectMap, meetingMap, tasks)}
        </div>

        <!-- Tab: Pendentes -->
        <div class="tab-content" id="tab-dec-pendentes" style="display:none;">
          ${this._renderDecisionList(decisions.filter(d => !d.tasks_created || d.tasks_created.length === 0), projectMap, meetingMap, tasks)}
        </div>

        <!-- Tab: Por Reuniao -->
        <div class="tab-content" id="tab-dec-por-reuniao" style="display:none;">
          ${this._renderByMeeting(decisions, meetingMap, projectMap, tasks)}
        </div>
      </div>
    `;
  },

  _renderDecisionList(decisions, projectMap, meetingMap, allTasks) {
    if (decisions.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Nenhuma decisao registrada.</div>';
    }

    return `<div style="display:flex;flex-direction:column;gap:12px;">
      ${decisions.map(d => {
        const proj = projectMap[d.project_id];
        const meeting = meetingMap[d.meeting_id];
        const linkedTasks = (d.tasks_created || []).map(tid => allTasks.find(t => t.id === tid)).filter(Boolean);
        const dateStr = d.createdAt ? new Date(d.createdAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' }) : '-';
        const hasTasks = linkedTasks.length > 0;

        return `<div class="card" style="padding:16px;border-left:4px solid ${hasTasks ? '#22c55e' : '#f59e0b'};">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <div style="flex:1;">
              <div style="font-weight:600;font-size:0.9rem;">${d.title || '-'}</div>
              ${d.description ? `<div style="font-size:0.78rem;color:var(--text-secondary);margin-top:4px;">${d.description}</div>` : ''}
              <div style="font-size:0.72rem;color:var(--text-muted);margin-top:6px;display:flex;gap:12px;flex-wrap:wrap;">
                ${proj ? `<span>Projeto: <strong>${proj.name}</strong></span>` : ''}
                ${meeting ? `<span>Reuniao: ${meeting.title || meeting.name || '-'}</span>` : ''}
                ${d.decided_by ? `<span>Decidido por: ${d.decided_by}</span>` : ''}
                <span>${dateStr}</span>
              </div>
            </div>
            <div style="display:flex;gap:4px;">
              ${!hasTasks ? `<button class="btn btn-sm btn-primary decCreateTask" data-id="${d.id}" style="font-size:0.72rem;">+ Criar Tarefa</button>` : ''}
            </div>
          </div>

          ${linkedTasks.length > 0 ? `
            <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border-subtle);">
              <div style="font-size:0.72rem;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">Tarefas vinculadas:</div>
              ${linkedTasks.map(t => {
                const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
                const stateLabel = sm ? (sm.labels[t.status] || t.status) : t.status;
                const stateColor = sm ? (sm.colors[t.status] || '#888') : '#888';
                return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:0.78rem;">
                  <span class="tag" style="background:${stateColor}20;color:${stateColor};font-size:0.65rem;">${stateLabel}</span>
                  <span>${t.title || t.name || '-'}</span>
                  <span style="color:var(--text-muted);margin-left:auto;">${t.owner || '-'}</span>
                </div>`;
              }).join('')}
            </div>
          ` : ''}
        </div>`;
      }).join('')}
    </div>`;
  },

  _renderByMeeting(decisions, meetingMap, projectMap, allTasks) {
    // Group decisions by meeting
    const groups = {};
    decisions.forEach(d => {
      const key = d.meeting_id || '_no_meeting';
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const ma = meetingMap[a];
      const mb = meetingMap[b];
      return new Date(mb?.date || 0) - new Date(ma?.date || 0);
    });

    if (sortedKeys.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Nenhuma decisao agrupada por reuniao.</div>';
    }

    return `<div style="display:flex;flex-direction:column;gap:20px;">
      ${sortedKeys.map(key => {
        const meeting = meetingMap[key];
        const decs = groups[key];
        const meetingTitle = meeting ? (meeting.title || meeting.name || 'Reuniao sem titulo') : 'Sem reuniao vinculada';
        const meetingDate = meeting?.date ? new Date(meeting.date).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' }) : '';

        return `<div class="card" style="padding:16px;">
          <div style="font-weight:600;font-size:0.88rem;margin-bottom:4px;">${meetingTitle}</div>
          ${meetingDate ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:12px;">${meetingDate}</div>` : ''}
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${decs.map(d => {
              const hasTasks = d.tasks_created && d.tasks_created.length > 0;
              return `<div style="padding:8px;background:var(--bg-secondary);border-radius:6px;border-left:3px solid ${hasTasks ? '#22c55e' : '#f59e0b'};">
                <div style="font-size:0.82rem;font-weight:600;">${d.title || '-'}</div>
                ${d.description ? `<div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">${d.description}</div>` : ''}
                <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">
                  ${hasTasks ? `${d.tasks_created.length} tarefa(s) vinculada(s)` : 'Sem tarefa vinculada'}
                  ${d.decided_by ? ` — ${d.decided_by}` : ''}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },

  init() {
    // Tab switching
    document.querySelectorAll('.decisoes-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.decisoes-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.decisoes-module .tab-content').forEach(tc => { tc.style.display = 'none'; tc.classList.remove('active'); });
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) { target.style.display = ''; target.classList.add('active'); }
      });
    });

    // Create task from decision
    document.querySelectorAll('.decCreateTask').forEach(btn => {
      btn.addEventListener('click', () => {
        const decisionId = btn.dataset.id;
        this._showCreateTaskModal(decisionId);
      });
    });
  },

  _showCreateTaskModal(decisionId) {
    const decision = TBO_STORAGE.getErpEntity('decision', decisionId);
    if (!decision) return;

    const projects = TBO_STORAGE.getAllErpEntities('project').filter(p => !['finalizado','cancelado'].includes(p.status));
    const team = this._getTeamMembers();

    const html = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="padding:8px;background:var(--bg-tertiary);border-radius:6px;font-size:0.78rem;">
          <strong>Decisao:</strong> ${decision.title}
          ${decision.description ? `<div style="margin-top:4px;color:var(--text-secondary);">${decision.description}</div>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label">Titulo da Tarefa *</label>
          <input type="text" class="form-input" id="decTaskTitle" value="${decision.title}" placeholder="Titulo da tarefa">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label class="form-label">Projeto</label>
            <select class="form-input" id="decTaskProject">
              <option value="">Selecione...</option>
              ${projects.map(p => `<option value="${p.id}" ${p.id === decision.project_id ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Responsavel</label>
            <select class="form-input" id="decTaskOwner">
              <option value="">Selecione...</option>
              ${team.map(t => `<option value="${t}">${t}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label class="form-label">Prazo</label>
            <input type="date" class="form-input" id="decTaskDue">
          </div>
          <div class="form-group">
            <label class="form-label">Prioridade</label>
            <select class="form-input" id="decTaskPriority">
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" id="decSaveTask" style="width:100%;">Criar Tarefa</button>
      </div>
    `;

    if (typeof TBO_MODAL !== 'undefined') {
      TBO_MODAL.show('Criar Tarefa da Decisao', html);
      setTimeout(() => {
        const saveBtn = document.getElementById('decSaveTask');
        if (saveBtn) saveBtn.addEventListener('click', () => this._saveTaskFromDecision(decisionId));
      }, 100);
    }
  },

  _saveTaskFromDecision(decisionId) {
    const title = document.getElementById('decTaskTitle')?.value?.trim();
    if (!title) { TBO_TOAST.error('Erro', 'Titulo obrigatorio.'); return; }

    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;

    if (typeof TBO_ERP !== 'undefined') {
      const result = TBO_ERP.createTaskFromDecision(decisionId, {
        title: title,
        owner: document.getElementById('decTaskOwner')?.value || '',
        due_date: document.getElementById('decTaskDue')?.value || null,
        priority: document.getElementById('decTaskPriority')?.value || 'media',
        project_id: document.getElementById('decTaskProject')?.value || ''
      });

      if (result.ok) {
        TBO_TOAST.success('Tarefa criada', title);
        if (typeof TBO_MODAL !== 'undefined') TBO_MODAL.close();
        this._refresh();
      } else {
        TBO_TOAST.error('Erro', result.error);
      }
    }
  },

  _getTeamMembers() {
    if (typeof TBO_RH !== 'undefined' && TBO_RH._team) return TBO_RH._team;
    const ctx = TBO_STORAGE.get('context');
    return ctx.dados_comerciais?.['2026']?.fluxo_caixa?.despesas_detalhadas?.pessoas?.equipe?.map(e => e.nome) || [];
  },

  _refresh() {
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
  },

  destroy() {}
};
