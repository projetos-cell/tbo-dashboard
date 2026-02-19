// TBO OS — Module: Entregas Globais
// Global deliverables view with versioning, review status, and approval workflow
const TBO_ENTREGAS = {

  render() {
    if (typeof TBO_ERP !== 'undefined') TBO_ERP.init();

    const deliverables = TBO_STORAGE.getAllErpEntities('deliverable');
    const projects = TBO_STORAGE.getAllErpEntities('project');
    const projectMap = {};
    projects.forEach(p => { projectMap[p.id] = p; });

    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.deliverable : null;

    // KPIs
    const total = deliverables.length;
    const pendentes = deliverables.filter(d => d.status === 'pendente').length;
    const emProducao = deliverables.filter(d => d.status === 'em_producao').length;
    const emRevisao = deliverables.filter(d => d.status === 'em_revisao').length;
    const aprovados = deliverables.filter(d => d.status === 'aprovado').length;
    const entregues = deliverables.filter(d => d.status === 'entregue').length;

    return `
      <div class="entregas-module">
        <!-- KPIs -->
        <div class="grid-5" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Total Entregas</div>
            <div class="kpi-value">${total}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Em Producao</div>
            <div class="kpi-value" style="color:#3b82f6;">${emProducao}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Em Revisao</div>
            <div class="kpi-value" style="color:#f59e0b;">${emRevisao}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Aprovados</div>
            <div class="kpi-value" style="color:#22c55e;">${aprovados}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Entregues</div>
            <div class="kpi-value">${entregues}</div>
          </div>
        </div>

        <!-- Status Pipeline -->
        ${sm ? `
        <div class="card" style="margin-bottom:20px;padding:16px;">
          <div style="display:flex;gap:4px;align-items:flex-end;height:50px;">
            ${sm.states.map(s => {
              const count = deliverables.filter(d => d.status === s).length;
              const maxCount = Math.max(...sm.states.map(st => deliverables.filter(d => d.status === st).length), 1);
              const pct = count > 0 ? Math.max(15, (count / maxCount) * 100) : 8;
              return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
                <span style="font-size:0.65rem;color:var(--text-muted);">${count}</span>
                <div style="width:100%;height:${pct}%;min-height:4px;background:${sm.colors[s]};border-radius:3px;"></div>
                <span style="font-size:0.6rem;color:var(--text-muted);white-space:nowrap;">${sm.labels[s]}</span>
              </div>`;
            }).join('')}
          </div>
        </div>` : ''}

        <!-- Tabs -->
        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="ent-todas">Todas</button>
          <button class="tab" data-tab="ent-producao">Em Producao</button>
          <button class="tab" data-tab="ent-revisao">Em Revisao</button>
          <button class="tab" data-tab="ent-finalizadas">Aprovadas/Entregues</button>
        </div>

        <!-- Tab: Todas -->
        <div class="tab-content active" id="tab-ent-todas">
          ${this._renderTable(deliverables, projectMap, sm)}
        </div>

        <!-- Tab: Em Producao -->
        <div class="tab-content" id="tab-ent-producao" style="display:none;">
          ${this._renderTable(deliverables.filter(d => d.status === 'em_producao'), projectMap, sm)}
        </div>

        <!-- Tab: Em Revisao -->
        <div class="tab-content" id="tab-ent-revisao" style="display:none;">
          ${this._renderTable(deliverables.filter(d => d.status === 'em_revisao'), projectMap, sm)}
        </div>

        <!-- Tab: Finalizadas -->
        <div class="tab-content" id="tab-ent-finalizadas" style="display:none;">
          ${this._renderTable(deliverables.filter(d => ['aprovado','entregue'].includes(d.status)), projectMap, sm)}
        </div>
      </div>
    `;
  },

  _renderTable(deliverables, projectMap, sm) {
    if (deliverables.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Nenhum entregavel encontrado.</div>';
    }

    return `<div class="card" style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-default);text-align:left;">
            <th style="padding:10px 8px;font-weight:600;">Entregavel</th>
            <th style="padding:10px 8px;font-weight:600;">Projeto</th>
            <th style="padding:10px 8px;font-weight:600;">Responsavel</th>
            <th style="padding:10px 8px;font-weight:600;">Status</th>
            <th style="padding:10px 8px;font-weight:600;">Versoes</th>
            <th style="padding:10px 8px;font-weight:600;">Atualizado</th>
            <th style="padding:10px 8px;font-weight:600;">Acoes</th>
          </tr>
        </thead>
        <tbody>
          ${deliverables.map(d => {
            const proj = projectMap[d.project_id];
            const projName = proj ? proj.name : '-';
            const stateLabel = sm ? (sm.labels[d.status] || d.status) : d.status;
            const stateColor = sm ? (sm.colors[d.status] || '#888') : '#888';
            const versions = d.versions || [];
            const lastVersion = versions[versions.length - 1];
            const updatedStr = d.updatedAt ? new Date(d.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-';

            const checklist = d.checklist || [];
            const checkDone = checklist.filter(c => c.done).length;
            const checkTotal = checklist.length;
            const checkPct = checkTotal > 0 ? Math.round((checkDone / checkTotal) * 100) : 0;

            return `<tr style="border-bottom:1px solid var(--border-subtle);">
              <td style="padding:10px 8px;">
                <div style="font-weight:600;">${d.title || d.name || '-'}</div>
                ${d.type ? `<div style="font-size:0.7rem;color:var(--text-muted);">${d.type}</div>` : ''}
                ${checkTotal > 0 ? `<div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
                  <div style="flex:1;max-width:80px;height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;">
                    <div style="width:${checkPct}%;height:100%;background:${checkPct === 100 ? '#22c55e' : '#3b82f6'};border-radius:2px;"></div>
                  </div>
                  <span style="font-size:0.65rem;color:var(--text-muted);">${checkDone}/${checkTotal}</span>
                </div>` : ''}
              </td>
              <td style="padding:10px 8px;"><span class="tag" style="font-size:0.7rem;">${projName}</span></td>
              <td style="padding:10px 8px;">${d.owner || '-'}</td>
              <td style="padding:10px 8px;"><span class="tag" style="background:${stateColor}20;color:${stateColor};font-size:0.7rem;">${stateLabel}</span></td>
              <td style="padding:10px 8px;">
                <span style="font-size:0.78rem;">${versions.length}</span>
                ${lastVersion ? `<span style="font-size:0.68rem;color:var(--text-muted);"> (${lastVersion.code || 'R' + (versions.length - 1).toString().padStart(2,'0')})</span>` : ''}
              </td>
              <td style="padding:10px 8px;font-size:0.78rem;color:var(--text-secondary);">${updatedStr}</td>
              <td style="padding:10px 8px;">
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                  <button class="btn btn-sm btn-secondary entChecklist" data-id="${d.id}" style="font-size:0.7rem;" title="Checklist">\u2611 ${checkTotal > 0 ? checkDone + '/' + checkTotal : 'Checklist'}</button>
                  ${d.status === 'em_producao' ? `<button class="btn btn-sm btn-secondary entSubmitReview" data-id="${d.id}" style="font-size:0.7rem;">Enviar p/ Revisao</button>` : ''}
                  ${d.status === 'em_revisao' ? `
                    <button class="btn btn-sm btn-primary entApprove" data-id="${d.id}" style="font-size:0.7rem;">Aprovar</button>
                    <button class="btn btn-sm btn-secondary entRequestRevision" data-id="${d.id}" style="font-size:0.7rem;">Pedir Revisao</button>
                  ` : ''}
                  ${d.status === 'aprovado' ? `<button class="btn btn-sm btn-primary entDeliver" data-id="${d.id}" style="font-size:0.7rem;">Marcar Entregue</button>` : ''}
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  },

  init() {
    // Tab switching
    document.querySelectorAll('.entregas-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.entregas-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.entregas-module .tab-content').forEach(tc => { tc.style.display = 'none'; tc.classList.remove('active'); });
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) { target.style.display = ''; target.classList.add('active'); }
      });
    });

    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const userId = user?.id || 'system';

    // Submit for review
    document.querySelectorAll('.entSubmitReview').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (typeof TBO_ERP !== 'undefined') {
          const result = TBO_ERP.transition('deliverable', id, 'em_revisao', userId);
          if (result.ok) { TBO_TOAST.success('Enviado para revisao', ''); this._refresh(); }
          else TBO_TOAST.error('Erro', result.error);
        }
      });
    });

    // Approve
    document.querySelectorAll('.entApprove').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (typeof TBO_ERP !== 'undefined') {
          const d = TBO_STORAGE.getErpEntity('deliverable', id);
          const versions = d?.versions || [];
          const lastVersion = versions[versions.length - 1];
          if (lastVersion) {
            const result = TBO_ERP.approveVersion(id, lastVersion.code);
            if (result.ok) { TBO_TOAST.success('Entregavel aprovado', ''); this._refresh(); }
            else TBO_TOAST.error('Erro', result.error);
          } else {
            const result = TBO_ERP.transition('deliverable', id, 'aprovado', userId);
            if (result.ok) { TBO_TOAST.success('Aprovado', ''); this._refresh(); }
            else TBO_TOAST.error('Erro', result.error);
          }
        }
      });
    });

    // Request revision
    document.querySelectorAll('.entRequestRevision').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (typeof TBO_ERP !== 'undefined') {
          const d = TBO_STORAGE.getErpEntity('deliverable', id);
          const versions = d?.versions || [];
          const lastVersion = versions[versions.length - 1];
          if (lastVersion) {
            const result = TBO_ERP.requestRevision(id, lastVersion.code, 'Revisao solicitada');
            if (result.ok) { TBO_TOAST.success('Revisao solicitada', ''); this._refresh(); }
            else TBO_TOAST.error('Erro', result.error);
          }
        }
      });
    });

    // Checklist management
    document.querySelectorAll('.entChecklist').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        this._showChecklistModal(id);
      });
    });

    // Mark as delivered
    document.querySelectorAll('.entDeliver').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (typeof TBO_ERP !== 'undefined') {
          const result = TBO_ERP.transition('deliverable', id, 'entregue', userId);
          if (result.ok) { TBO_TOAST.success('Marcado como entregue', ''); this._refresh(); }
          else TBO_TOAST.error('Erro', result.error);
        }
      });
    });
  },

  _showChecklistModal(deliverableId) {
    const d = TBO_STORAGE.getErpEntity('deliverable', deliverableId);
    if (!d) return;
    const checklist = d.checklist || [];
    const title = d.title || d.name || 'Entregavel';

    const renderItems = (items) => items.map((item, i) => `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border-subtle);">
        <input type="checkbox" class="ent-check-item" data-idx="${i}" ${item.done ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;">
        <span style="flex:1;font-size:0.82rem;${item.done ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${item.text}</span>
        <button class="ent-check-remove" data-idx="${i}" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem;" title="Remover">&times;</button>
      </div>
    `).join('');

    const html = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="font-size:0.78rem;color:var(--text-secondary);">Checklist para: <strong>${title}</strong></div>
        <div id="entChecklistItems">${checklist.length > 0 ? renderItems(checklist) : '<div style="color:var(--text-muted);font-size:0.82rem;padding:12px 0;">Nenhum item no checklist.</div>'}</div>
        <div style="display:flex;gap:8px;">
          <input type="text" id="entChecklistNewItem" class="form-input" placeholder="Novo item do checklist..." style="flex:1;">
          <button id="entChecklistAdd" class="btn btn-sm btn-primary" style="white-space:nowrap;">+ Adicionar</button>
        </div>
      </div>
    `;

    if (typeof TBO_UX !== 'undefined' && TBO_UX.openModal) {
      TBO_UX.openModal('Checklist de Entregaveis', html, { width: '480px' });
    } else {
      const overlay = document.createElement('div');
      overlay.id = 'entChecklistOverlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
      overlay.innerHTML = `<div style="background:var(--bg-primary);border-radius:12px;padding:24px;max-width:480px;width:90%;max-height:80vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;font-size:1rem;">Checklist de Entregaveis</h3>
          <button id="entChecklistClose" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--text-secondary);">&times;</button>
        </div>
        ${html}
      </div>`;
      document.body.appendChild(overlay);
      document.getElementById('entChecklistClose')?.addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    }

    // Bind add new item
    const addBtn = document.getElementById('entChecklistAdd');
    const input = document.getElementById('entChecklistNewItem');
    const addItem = () => {
      const text = input?.value?.trim();
      if (!text) return;
      const current = TBO_STORAGE.getErpEntity('deliverable', deliverableId);
      const cl = current.checklist || [];
      cl.push({ text, done: false, addedAt: new Date().toISOString() });
      TBO_STORAGE.updateErpEntity('deliverable', deliverableId, { checklist: cl });
      input.value = '';
      this._showChecklistModal(deliverableId);
    };
    addBtn?.addEventListener('click', addItem);
    input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') addItem(); });

    // Bind toggle & remove
    document.querySelectorAll('.ent-check-item').forEach(cb => {
      cb.addEventListener('change', () => {
        const idx = parseInt(cb.dataset.idx);
        const current = TBO_STORAGE.getErpEntity('deliverable', deliverableId);
        const cl = current.checklist || [];
        if (cl[idx]) { cl[idx].done = cb.checked; cl[idx].doneAt = cb.checked ? new Date().toISOString() : null; }
        TBO_STORAGE.updateErpEntity('deliverable', deliverableId, { checklist: cl });
        this._showChecklistModal(deliverableId);
      });
    });

    document.querySelectorAll('.ent-check-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const current = TBO_STORAGE.getErpEntity('deliverable', deliverableId);
        const cl = current.checklist || [];
        cl.splice(idx, 1);
        TBO_STORAGE.updateErpEntity('deliverable', deliverableId, { checklist: cl });
        this._showChecklistModal(deliverableId);
      });
    });
  },

  _refresh() {
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
  },

  destroy() {}
};
