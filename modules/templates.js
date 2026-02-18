// TBO OS — Module: Templates & Playbooks
// Browse, preview and apply project playbooks; manage reusable templates
const TBO_TEMPLATES = {

  render() {
    if (typeof TBO_ERP !== 'undefined') TBO_ERP.init();

    const playbooks = typeof TBO_ERP !== 'undefined' ? TBO_ERP.playbooks : {};
    const playbookList = Object.entries(playbooks).map(([key, pb]) => ({ key, ...pb }));

    // Projects that used playbooks
    const projects = TBO_STORAGE.getAllErpEntities('project');
    const withPlaybook = projects.filter(p => p.playbook);
    const playbookUsage = {};
    withPlaybook.forEach(p => {
      if (!playbookUsage[p.playbook]) playbookUsage[p.playbook] = 0;
      playbookUsage[p.playbook]++;
    });

    // Active projects without playbook
    const activeNoPlaybook = projects.filter(p => !p.playbook && !['finalizado','cancelado'].includes(p.status));

    return `
      <div class="templates-module">
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Playbooks Disponiveis</div>
            <div class="kpi-value">${playbookList.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Projetos com Playbook</div>
            <div class="kpi-value" style="color:#22c55e;">${withPlaybook.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Sem Playbook (Ativos)</div>
            <div class="kpi-value" style="color:${activeNoPlaybook.length > 0 ? '#f59e0b' : '#22c55e'};">${activeNoPlaybook.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Projetos</div>
            <div class="kpi-value">${projects.length}</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="tpl-playbooks">Playbooks</button>
          <button class="tab" data-tab="tpl-aplicar">Aplicar a Projeto</button>
          <button class="tab" data-tab="tpl-historico">Historico de Uso</button>
        </div>

        <!-- Tab: Playbooks -->
        <div class="tab-content active" id="tab-tpl-playbooks">
          ${this._renderPlaybooks(playbookList, playbookUsage)}
        </div>

        <!-- Tab: Aplicar -->
        <div class="tab-content" id="tab-tpl-aplicar" style="display:none;">
          ${this._renderApplySection(playbookList, activeNoPlaybook)}
        </div>

        <!-- Tab: Historico -->
        <div class="tab-content" id="tab-tpl-historico" style="display:none;">
          ${this._renderUsageHistory(withPlaybook, playbooks)}
        </div>
      </div>
    `;
  },

  _renderPlaybooks(playbookList, usage) {
    if (playbookList.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);">Nenhum playbook cadastrado.</div>';
    }

    const phaseColors = { briefing: '#6366f1', planejamento: '#f59e0b', producao: '#3b82f6', revisao: '#8b5cf6', entrega: '#14b8a6' };

    return `<div style="display:flex;flex-direction:column;gap:16px;">
      ${playbookList.map(pb => {
        const phases = pb.phases || [];
        const deliverables = pb.deliverables || [];
        const totalTasks = phases.reduce((s, p) => s + (p.tasks ? p.tasks.length : 0), 0);
        const usageCount = usage[pb.key] || 0;

        return `<div class="card" style="padding:20px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
            <div>
              <div style="font-weight:700;font-size:1rem;">${pb.name}</div>
              <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:4px;">
                ${phases.length} fases &middot; ${totalTasks} tarefas &middot; ${deliverables.length} entregaveis
                ${usageCount > 0 ? ` &middot; <span style="color:#22c55e;">Usado ${usageCount}x</span>` : ''}
              </div>
            </div>
            <span class="tag" style="font-size:0.7rem;">${pb.key}</span>
          </div>

          <!-- Phase timeline -->
          <div style="display:flex;gap:4px;margin-bottom:16px;">
            ${phases.map(p => {
              const color = phaseColors[p.status] || '#888';
              const width = Math.max(15, 100 / phases.length);
              return `<div style="flex:1;text-align:center;">
                <div style="height:6px;background:${color};border-radius:3px;margin-bottom:4px;"></div>
                <div style="font-size:0.65rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
              </div>`;
            }).join('')}
          </div>

          <!-- Phases detail -->
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${phases.map(p => {
              const color = phaseColors[p.status] || '#888';
              return `<div style="padding:10px;background:var(--bg-secondary);border-radius:6px;border-left:3px solid ${color};">
                <div style="font-size:0.82rem;font-weight:600;margin-bottom:4px;">${p.name}
                  <span class="tag" style="font-size:0.6rem;background:${color}20;color:${color};margin-left:6px;">${p.status}</span>
                </div>
                <div style="font-size:0.75rem;color:var(--text-secondary);">
                  ${(p.tasks || []).map(t => `<div style="padding:2px 0;">&#8226; ${t}</div>`).join('')}
                </div>
              </div>`;
            }).join('')}
          </div>

          <!-- Deliverables -->
          ${deliverables.length > 0 ? `
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-subtle);">
            <div style="font-size:0.72rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px;">Entregaveis:</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${deliverables.map(d => `<span class="tag" style="font-size:0.7rem;">${d}</span>`).join('')}
            </div>
          </div>` : ''}
        </div>`;
      }).join('')}
    </div>`;
  },

  _renderApplySection(playbookList, projects) {
    if (projects.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);">Todos os projetos ativos ja possuem playbook aplicado.</div>';
    }

    return `<div class="card" style="padding:20px;">
      <div style="font-weight:600;font-size:0.88rem;margin-bottom:16px;">Aplicar Playbook a Projeto</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div class="form-group">
          <label class="form-label">Projeto</label>
          <select class="form-input" id="tplProject">
            <option value="">Selecione um projeto...</option>
            ${projects.map(p => `<option value="${p.id}">${p.name} (${p.client || '-'})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Playbook</label>
          <select class="form-input" id="tplPlaybook">
            <option value="">Selecione um playbook...</option>
            ${playbookList.map(pb => `<option value="${pb.key}">${pb.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <button class="btn btn-primary" id="tplApplyBtn" style="width:100%;">Aplicar Playbook</button>
      <div style="font-size:0.72rem;color:var(--text-muted);margin-top:8px;">
        Ao aplicar, tarefas e entregaveis serao criados automaticamente no projeto selecionado.
      </div>
    </div>`;
  },

  _renderUsageHistory(projects, playbooks) {
    if (projects.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);">Nenhum projeto utilizou playbook ainda.</div>';
    }

    return `<div class="card" style="padding:16px;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-default);text-align:left;">
            <th style="padding:10px 8px;">Projeto</th>
            <th style="padding:10px 8px;">Cliente</th>
            <th style="padding:10px 8px;">Playbook</th>
            <th style="padding:10px 8px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${projects.map(p => {
            const pb = playbooks[p.playbook];
            const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.project : null;
            const stateLabel = sm ? (sm.labels[p.status] || p.status) : p.status;
            const stateColor = sm ? (sm.colors[p.status] || '#888') : '#888';
            return `<tr style="border-bottom:1px solid var(--border-subtle);">
              <td style="padding:10px 8px;font-weight:600;">${p.name}</td>
              <td style="padding:10px 8px;color:var(--text-secondary);">${p.client || '-'}</td>
              <td style="padding:10px 8px;"><span class="tag" style="font-size:0.7rem;">${pb ? pb.name : p.playbook_name || p.playbook}</span></td>
              <td style="padding:10px 8px;"><span class="tag" style="background:${stateColor}20;color:${stateColor};font-size:0.7rem;">${stateLabel}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  },

  init() {
    // Tab switching
    document.querySelectorAll('.templates-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.templates-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.templates-module .tab-content').forEach(tc => { tc.style.display = 'none'; tc.classList.remove('active'); });
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) { target.style.display = ''; target.classList.add('active'); }
      });
    });

    // Apply playbook
    const applyBtn = document.getElementById('tplApplyBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const projectId = document.getElementById('tplProject')?.value;
        const playbookKey = document.getElementById('tplPlaybook')?.value;
        if (!projectId || !playbookKey) {
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Selecione projeto e playbook.');
          return;
        }
        if (typeof TBO_ERP !== 'undefined') {
          const result = TBO_ERP.applyPlaybook(projectId, playbookKey);
          if (result.ok) {
            TBO_TOAST.success('Playbook aplicado', `${result.taskCount} tarefas e ${result.delivCount} entregaveis criados.`);
            this._refresh();
          } else {
            TBO_TOAST.error('Erro', result.error || 'Falha ao aplicar playbook.');
          }
        }
      });
    }
  },

  _refresh() {
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
  },

  destroy() {}
};
