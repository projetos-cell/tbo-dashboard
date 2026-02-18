// TBO OS — Module: Fila de Revisoes
// Review queue for deliverables pending client/internal approval
const TBO_REVISOES = {

  render() {
    if (typeof TBO_ERP !== 'undefined') TBO_ERP.init();

    const deliverables = TBO_STORAGE.getAllErpEntities('deliverable');
    const projects = TBO_STORAGE.getAllErpEntities('project');
    const projectMap = {};
    projects.forEach(p => { projectMap[p.id] = p; });

    // Split by review status
    const emRevisao = deliverables.filter(d => d.status === 'em_revisao');
    const aprovados = deliverables.filter(d => d.status === 'aprovado');
    const pendentes = deliverables.filter(d => d.status === 'pendente' || d.status === 'em_producao');

    // Overdue reviews (in review > 3 days)
    const now = new Date();
    const overdueReviews = emRevisao.filter(d => {
      const updated = new Date(d.updatedAt || d.createdAt);
      return (now - updated) / (1000 * 60 * 60 * 24) > 3;
    });

    // Revision counts from versions
    let totalRevisions = 0;
    deliverables.forEach(d => {
      if (d.versions) totalRevisions += d.versions.filter(v => v.status === 'revisao_solicitada').length;
    });

    return `
      <div class="revisoes-module">
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Em Revisao</div>
            <div class="kpi-value" style="color:#f59e0b;">${emRevisao.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Revisoes Atrasadas</div>
            <div class="kpi-value" style="color:${overdueReviews.length > 0 ? '#ef4444' : '#22c55e'};">${overdueReviews.length}</div>
            <div class="kpi-sublabel">Aguardando >3 dias</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Aprovados (pendente entrega)</div>
            <div class="kpi-value" style="color:#22c55e;">${aprovados.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Ciclos de Revisao</div>
            <div class="kpi-value">${totalRevisions}</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="rev-fila">Fila de Revisao (${emRevisao.length})</button>
          <button class="tab" data-tab="rev-atrasadas">Atrasadas (${overdueReviews.length})</button>
          <button class="tab" data-tab="rev-aprovadas">Aprovados (${aprovados.length})</button>
          <button class="tab" data-tab="rev-historico">Historico</button>
        </div>

        <!-- Tab: Fila -->
        <div class="tab-content active" id="tab-rev-fila">
          ${this._renderReviewQueue(emRevisao, projectMap)}
        </div>

        <!-- Tab: Atrasadas -->
        <div class="tab-content" id="tab-rev-atrasadas" style="display:none;">
          ${this._renderReviewQueue(overdueReviews, projectMap)}
        </div>

        <!-- Tab: Aprovadas -->
        <div class="tab-content" id="tab-rev-aprovadas" style="display:none;">
          ${this._renderApprovedList(aprovados, projectMap)}
        </div>

        <!-- Tab: Historico -->
        <div class="tab-content" id="tab-rev-historico" style="display:none;">
          ${this._renderHistory(deliverables, projectMap)}
        </div>
      </div>
    `;
  },

  _renderReviewQueue(items, projectMap) {
    if (items.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Nenhum entregavel aguardando revisao.</div>';
    }

    const now = new Date();
    return `<div style="display:flex;flex-direction:column;gap:12px;">
      ${items.map(d => {
        const proj = projectMap[d.project_id];
        const projName = proj ? proj.name : '-';
        const versions = d.versions || [];
        const lastVersion = versions[versions.length - 1];
        const daysWaiting = Math.floor((now - new Date(d.updatedAt || d.createdAt)) / (1000 * 60 * 60 * 24));
        const isOverdue = daysWaiting > 3;

        return `<div class="card" style="padding:16px;border-left:4px solid ${isOverdue ? '#ef4444' : '#f59e0b'};">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <div>
              <div style="font-weight:600;font-size:0.9rem;">${d.title || d.name || '-'}</div>
              <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">
                <span class="tag" style="font-size:0.7rem;">${projName}</span>
                <span style="margin-left:8px;">Responsavel: ${d.owner || '-'}</span>
                ${d.type ? `<span style="margin-left:8px;color:var(--text-muted);">${d.type}</span>` : ''}
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.75rem;color:${isOverdue ? '#ef4444' : 'var(--text-muted)'};">
                ${daysWaiting}d aguardando
              </div>
              ${versions.length > 0 ? `<div style="font-size:0.7rem;color:var(--text-muted);">Versao ${lastVersion?.code || 'R' + (versions.length - 1).toString().padStart(2, '0')}</div>` : ''}
            </div>
          </div>

          ${lastVersion?.description ? `<div style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:12px;padding:8px;background:var(--bg-tertiary);border-radius:4px;">${lastVersion.description}</div>` : ''}

          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn btn-primary btn-sm revApprove" data-id="${d.id}" style="font-size:0.78rem;">Aprovar</button>
            <button class="btn btn-secondary btn-sm revRequestChange" data-id="${d.id}" style="font-size:0.78rem;">Solicitar Alteracao</button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },

  _renderApprovedList(items, projectMap) {
    if (items.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Nenhum entregavel aprovado pendente de entrega.</div>';
    }

    return `<div class="card" style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-default);text-align:left;">
            <th style="padding:10px 8px;">Entregavel</th>
            <th style="padding:10px 8px;">Projeto</th>
            <th style="padding:10px 8px;">Responsavel</th>
            <th style="padding:10px 8px;">Aprovado em</th>
            <th style="padding:10px 8px;">Acoes</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(d => {
            const proj = projectMap[d.project_id];
            const dateStr = d.updatedAt ? new Date(d.updatedAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' }) : '-';
            return `<tr style="border-bottom:1px solid var(--border-subtle);">
              <td style="padding:10px 8px;font-weight:600;">${d.title || d.name || '-'}</td>
              <td style="padding:10px 8px;"><span class="tag" style="font-size:0.7rem;">${proj ? proj.name : '-'}</span></td>
              <td style="padding:10px 8px;">${d.owner || '-'}</td>
              <td style="padding:10px 8px;">${dateStr}</td>
              <td style="padding:10px 8px;">
                <button class="btn btn-sm btn-primary revDeliver" data-id="${d.id}" style="font-size:0.7rem;">Marcar Entregue</button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  },

  _renderHistory(deliverables, projectMap) {
    const withVersions = deliverables.filter(d => d.versions && d.versions.length > 0);
    if (withVersions.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Nenhum historico de revisoes.</div>';
    }

    return `<div class="card" style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-default);text-align:left;">
            <th style="padding:10px 8px;">Entregavel</th>
            <th style="padding:10px 8px;">Projeto</th>
            <th style="padding:10px 8px;">Versoes</th>
            <th style="padding:10px 8px;">Status Final</th>
          </tr>
        </thead>
        <tbody>
          ${withVersions.map(d => {
            const proj = projectMap[d.project_id];
            const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.deliverable : null;
            const stateLabel = sm ? (sm.labels[d.status] || d.status) : d.status;
            const stateColor = sm ? (sm.colors[d.status] || '#888') : '#888';
            return `<tr style="border-bottom:1px solid var(--border-subtle);">
              <td style="padding:10px 8px;font-weight:600;">${d.title || d.name || '-'}</td>
              <td style="padding:10px 8px;"><span class="tag" style="font-size:0.7rem;">${proj ? proj.name : '-'}</span></td>
              <td style="padding:10px 8px;">
                ${d.versions.map(v => {
                  const statusIcon = v.status === 'aprovada' ? '&#10003;' : v.status === 'revisao_solicitada' ? '&#8635;' : '&#8230;';
                  return `<span class="tag" style="font-size:0.65rem;margin-right:4px;">${v.code || '-'} ${statusIcon}</span>`;
                }).join('')}
              </td>
              <td style="padding:10px 8px;"><span class="tag" style="background:${stateColor}20;color:${stateColor};font-size:0.7rem;">${stateLabel}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  },

  init() {
    // Tab switching
    document.querySelectorAll('.revisoes-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.revisoes-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.revisoes-module .tab-content').forEach(tc => { tc.style.display = 'none'; tc.classList.remove('active'); });
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) { target.style.display = ''; target.classList.add('active'); }
      });
    });

    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const userId = user?.id || 'system';

    // Approve buttons
    document.querySelectorAll('.revApprove').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (typeof TBO_ERP === 'undefined') return;
        const d = TBO_STORAGE.getErpEntity('deliverable', id);
        const versions = d?.versions || [];
        const lastVersion = versions[versions.length - 1];
        if (lastVersion) {
          const result = TBO_ERP.approveVersion(id, lastVersion.code);
          if (result.ok) { TBO_TOAST.success('Aprovado', d.title || d.name || ''); this._refresh(); }
          else TBO_TOAST.error('Erro', result.error);
        } else {
          const result = TBO_ERP.transition('deliverable', id, 'aprovado', userId);
          if (result.ok) { TBO_TOAST.success('Aprovado', ''); this._refresh(); }
          else TBO_TOAST.error('Erro', result.error);
        }
      });
    });

    // Request change
    document.querySelectorAll('.revRequestChange').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (typeof TBO_ERP === 'undefined') return;
        const d = TBO_STORAGE.getErpEntity('deliverable', id);
        const versions = d?.versions || [];
        const lastVersion = versions[versions.length - 1];
        if (lastVersion) {
          const result = TBO_ERP.requestRevision(id, lastVersion.code, 'Alteracao solicitada');
          if (result.ok) { TBO_TOAST.success('Revisao solicitada', ''); this._refresh(); }
          else TBO_TOAST.error('Erro', result.error);
        }
      });
    });

    // Mark delivered
    document.querySelectorAll('.revDeliver').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (typeof TBO_ERP === 'undefined') return;
        const result = TBO_ERP.transition('deliverable', id, 'entregue', userId);
        if (result.ok) { TBO_TOAST.success('Entregue', ''); this._refresh(); }
        else TBO_TOAST.error('Erro', result.error);
      });
    });
  },

  _refresh() {
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
  },

  destroy() {}
};
