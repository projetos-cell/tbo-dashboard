// TBO OS — Module: Pipeline (Visual CRM Funnel)
const TBO_PIPELINE = {
  _view: 'kanban', // 'kanban' | 'table'
  _showAddModal: false,
  _editingDeal: null,

  render() {
    const crmData = TBO_STORAGE.getCrmData();
    const deals = TBO_STORAGE.getCrmDeals();
    const stages = crmData.stages || [];

    // Stats
    const activeDeals = deals.filter(d => !['fechado_ganho','fechado_perdido'].includes(d.stage));
    const totalValue = activeDeals.reduce((s,d) => s + (d.value || 0), 0);
    const wonDeals = deals.filter(d => d.stage === 'fechado_ganho');
    const wonValue = wonDeals.reduce((s,d) => s + (d.value || 0), 0);
    const lostDeals = deals.filter(d => d.stage === 'fechado_perdido');
    const conversionRate = (wonDeals.length + lostDeals.length) > 0
      ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100) : 0;

    return `
      <div class="pipeline-module">
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Pipeline Comercial</h2>
            <div style="display:flex;gap:8px;align-items:center;">
              <button class="btn btn-sm ${this._view === 'kanban' ? 'btn-primary' : 'btn-secondary'} pipeline-view-btn" data-view="kanban">Kanban</button>
              <button class="btn btn-sm ${this._view === 'table' ? 'btn-primary' : 'btn-secondary'} pipeline-view-btn" data-view="table">Tabela</button>
              <button class="btn btn-sm btn-primary pipeline-add-btn">+ Novo Deal</button>
            </div>
          </div>

          <!-- Summary -->
          <div class="pipeline-summary">
            <div class="pipeline-stat">
              <div class="pipeline-stat-value">${activeDeals.length}</div>
              <div class="pipeline-stat-label">Deals Ativos</div>
            </div>
            <div class="pipeline-stat">
              <div class="pipeline-stat-value">R$ ${this._fmt(totalValue)}</div>
              <div class="pipeline-stat-label">Valor Pipeline</div>
            </div>
            <div class="pipeline-stat">
              <div class="pipeline-stat-value">R$ ${this._fmt(wonValue)}</div>
              <div class="pipeline-stat-label">Ganho</div>
            </div>
            <div class="pipeline-stat">
              <div class="pipeline-stat-value">${conversionRate}%</div>
              <div class="pipeline-stat-label">Conversao</div>
            </div>
          </div>

          <!-- Funnel Visual -->
          <div class="pipeline-funnel">
            ${stages.filter(s => !['fechado_ganho','fechado_perdido'].includes(s.id)).map(s => {
              const count = deals.filter(d => d.stage === s.id).length;
              const val = deals.filter(d => d.stage === s.id).reduce((sum,d) => sum + (d.value||0), 0);
              const maxCount = Math.max(1, ...stages.map(st => deals.filter(d => d.stage === st.id).length));
              const pct = Math.max(20, Math.round((count / maxCount) * 100));
              return `<div class="pipeline-funnel-step" style="--funnel-color:${s.color};">
                <div class="pipeline-funnel-bar" style="width:${pct}%;background:${s.color}20;border-left:3px solid ${s.color};">
                  <span class="pipeline-funnel-label">${s.label}</span>
                  <span class="pipeline-funnel-count">${count} deal${count !== 1 ? 's' : ''} &middot; R$ ${this._fmt(val)}</span>
                </div>
              </div>`;
            }).join('')}
          </div>

          ${this._view === 'kanban' ? this._renderKanban(stages, deals) : this._renderTable(stages, deals)}
        </section>
      </div>
      ${this._showAddModal ? this._renderModal() : ''}
    `;
  },

  _renderKanban(stages, deals) {
    const activeStages = stages.filter(s => !['fechado_ganho','fechado_perdido'].includes(s.id));
    return `
      <div class="pipeline-kanban">
        ${activeStages.map(s => {
          const stageDeals = deals.filter(d => d.stage === s.id);
          return `
            <div class="pipeline-column" data-stage="${s.id}">
              <div class="pipeline-column-header" style="border-top:3px solid ${s.color};">
                <span class="pipeline-column-title">${s.label}</span>
                <span class="pipeline-column-count">${stageDeals.length}</span>
              </div>
              <div class="pipeline-column-body" data-stage-drop="${s.id}">
                ${stageDeals.length === 0 ? '<div class="pipeline-empty-col">Arraste deals aqui</div>' : ''}
                ${stageDeals.map(d => `
                  <div class="pipeline-card" draggable="true" data-deal-id="${d.id}">
                    <div class="pipeline-card-name">${d.name || 'Sem nome'}</div>
                    <div class="pipeline-card-company">${d.company || ''}</div>
                    <div class="pipeline-card-footer">
                      <span class="pipeline-card-value">R$ ${this._fmt(d.value)}</span>
                      ${d.probability ? `<span class="pipeline-card-prob">${d.probability}%</span>` : ''}
                    </div>
                    ${d.expectedClose ? `<div class="pipeline-card-date">${this._formatDate(d.expectedClose)}</div>` : ''}
                    <div class="pipeline-card-actions">
                      <button class="pipeline-card-edit" data-edit-deal="${d.id}" title="Editar">&#9998;</button>
                      <button class="pipeline-card-delete" data-delete-deal="${d.id}" title="Remover">&#10005;</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
        <!-- Won/Lost columns -->
        ${['fechado_ganho','fechado_perdido'].map(sid => {
          const s = stages.find(st => st.id === sid);
          if (!s) return '';
          const stageDeals = deals.filter(d => d.stage === sid).slice(0, 5);
          const total = deals.filter(d => d.stage === sid).length;
          return `
            <div class="pipeline-column pipeline-column--closed" data-stage="${sid}">
              <div class="pipeline-column-header" style="border-top:3px solid ${s.color};">
                <span class="pipeline-column-title">${s.label}</span>
                <span class="pipeline-column-count">${total}</span>
              </div>
              <div class="pipeline-column-body" data-stage-drop="${sid}">
                ${stageDeals.map(d => `
                  <div class="pipeline-card pipeline-card--closed" data-deal-id="${d.id}">
                    <div class="pipeline-card-name">${d.name || 'Sem nome'}</div>
                    <div class="pipeline-card-value">R$ ${this._fmt(d.value)}</div>
                  </div>
                `).join('')}
                ${total > 5 ? `<div class="pipeline-card-more">+${total - 5} mais</div>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  _renderTable(stages, deals) {
    return `
      <div class="pipeline-table-wrap">
        <table class="pipeline-table">
          <thead>
            <tr>
              <th>Deal</th>
              <th>Empresa</th>
              <th>Etapa</th>
              <th>Valor</th>
              <th>Prob.</th>
              <th>Responsavel</th>
              <th>Previsao</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            ${deals.length === 0 ? '<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-muted);">Nenhum deal cadastrado</td></tr>' : ''}
            ${deals.map(d => {
              const stage = (stages || []).find(s => s.id === d.stage);
              const color = stage ? stage.color : '#94a3b8';
              const label = stage ? stage.label : d.stage;
              return `<tr>
                <td><strong>${d.name || 'Sem nome'}</strong></td>
                <td>${d.company || '-'}</td>
                <td><span class="pipeline-table-badge" style="background:${color}20;color:${color};border:1px solid ${color}40;">${label}</span></td>
                <td>R$ ${this._fmt(d.value)}</td>
                <td>${d.probability || 0}%</td>
                <td>${d.owner || '-'}</td>
                <td>${d.expectedClose ? this._formatDate(d.expectedClose) : '-'}</td>
                <td>
                  <button class="pipeline-card-edit" data-edit-deal="${d.id}" title="Editar">&#9998;</button>
                  <button class="pipeline-card-delete" data-delete-deal="${d.id}" title="Remover">&#10005;</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderModal() {
    const d = this._editingDeal || {};
    const isEdit = !!d.id;
    const crmData = TBO_STORAGE.getCrmData();
    const stages = crmData.stages || [];
    const context = TBO_STORAGE.get('context');
    const clients = context.clientes_construtoras || [];

    return `
      <div class="modal-overlay active pipeline-modal-overlay">
        <div class="modal-card" style="max-width:520px;">
          <div class="modal-header">
            <h3>${isEdit ? 'Editar Deal' : 'Novo Deal'}</h3>
            <button class="modal-close pipeline-modal-close">&#10005;</button>
          </div>
          <div class="modal-body" style="display:grid;gap:12px;">
            <div class="form-group">
              <label class="form-label">Nome do Deal</label>
              <input class="form-input" id="dealName" value="${d.name || ''}" placeholder="Ex: Projeto Residencial XYZ">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Empresa / Cliente</label>
                <input class="form-input" id="dealCompany" value="${d.company || ''}" list="clientList" placeholder="Construtora">
                <datalist id="clientList">${clients.map(c => `<option value="${c}">`).join('')}</datalist>
              </div>
              <div class="form-group">
                <label class="form-label">Contato</label>
                <input class="form-input" id="dealContact" value="${d.contact || ''}" placeholder="Nome do contato">
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Valor (R$)</label>
                <input class="form-input" id="dealValue" type="number" value="${d.value || ''}" placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label">Probabilidade (%)</label>
                <input class="form-input" id="dealProb" type="number" min="0" max="100" value="${d.probability || ''}" placeholder="50">
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Etapa</label>
                <select class="form-input" id="dealStage">
                  ${stages.map(s => `<option value="${s.id}" ${d.stage === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Previsao Fechamento</label>
                <input class="form-input" id="dealClose" type="date" value="${d.expectedClose || ''}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Responsavel</label>
              <input class="form-input" id="dealOwner" value="${d.owner || ''}" placeholder="Nome">
            </div>
            <div class="form-group">
              <label class="form-label">Servicos</label>
              <input class="form-input" id="dealServices" value="${(d.services || []).join(', ')}" placeholder="Digital 3D, Branding, Marketing...">
            </div>
            <div class="form-group">
              <label class="form-label">Notas</label>
              <textarea class="form-input" id="dealNotes" rows="3" placeholder="Observacoes...">${d.notes || ''}</textarea>
            </div>
          </div>
          <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;padding:16px 20px;">
            <button class="btn btn-secondary pipeline-modal-close">Cancelar</button>
            <button class="btn btn-primary pipeline-save-btn">${isEdit ? 'Salvar' : 'Criar Deal'}</button>
          </div>
        </div>
      </div>
    `;
  },

  _fmt(val) {
    return (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  },

  _formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  init() {
    // View toggle
    document.querySelectorAll('.pipeline-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._view = btn.dataset.view;
        this._showAddModal = false;
        this._editingDeal = null;
        this._refresh();
      });
    });

    // Add deal
    const addBtn = document.querySelector('.pipeline-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this._editingDeal = null;
        this._showAddModal = true;
        this._refresh();
      });
    }

    // Edit deal
    document.querySelectorAll('.pipeline-card-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dealId = btn.dataset.editDeal;
        const crmData = TBO_STORAGE.getCrmData();
        this._editingDeal = crmData.deals[dealId] || null;
        this._showAddModal = true;
        this._refresh();
      });
    });

    // Delete deal
    document.querySelectorAll('.pipeline-card-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dealId = btn.dataset.deleteDeal;
        if (confirm('Remover este deal?')) {
          TBO_STORAGE.deleteCrmDeal(dealId);
          this._refresh();
        }
      });
    });

    // Modal close
    document.querySelectorAll('.pipeline-modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        this._showAddModal = false;
        this._editingDeal = null;
        this._refresh();
      });
    });

    // Modal overlay close
    const overlay = document.querySelector('.pipeline-modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this._showAddModal = false;
          this._editingDeal = null;
          this._refresh();
        }
      });
    }

    // Save deal
    const saveBtn = document.querySelector('.pipeline-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this._saveDeal());
    }

    // Drag & drop
    this._initDragDrop();
  },

  _saveDeal() {
    const data = {
      name: document.getElementById('dealName')?.value || '',
      company: document.getElementById('dealCompany')?.value || '',
      contact: document.getElementById('dealContact')?.value || '',
      value: parseFloat(document.getElementById('dealValue')?.value) || 0,
      probability: parseInt(document.getElementById('dealProb')?.value) || 0,
      stage: document.getElementById('dealStage')?.value || 'lead',
      expectedClose: document.getElementById('dealClose')?.value || '',
      owner: document.getElementById('dealOwner')?.value || '',
      services: (document.getElementById('dealServices')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
      notes: document.getElementById('dealNotes')?.value || ''
    };

    if (!data.name) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Atencao', 'Nome do deal e obrigatorio.');
      return;
    }

    if (this._editingDeal && this._editingDeal.id) {
      TBO_STORAGE.updateCrmDeal(this._editingDeal.id, data);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Deal atualizado', data.name);
    } else {
      TBO_STORAGE.addCrmDeal(data);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Deal criado', data.name);
    }

    this._showAddModal = false;
    this._editingDeal = null;
    this._refresh();
  },

  _initDragDrop() {
    const cards = document.querySelectorAll('.pipeline-card[draggable]');
    const dropZones = document.querySelectorAll('[data-stage-drop]');

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.dataset.dealId);
        card.classList.add('pipeline-card--dragging');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('pipeline-card--dragging');
        dropZones.forEach(z => z.classList.remove('pipeline-drop-active'));
      });
    });

    dropZones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('pipeline-drop-active');
      });
      zone.addEventListener('dragleave', () => {
        zone.classList.remove('pipeline-drop-active');
      });
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('pipeline-drop-active');
        const dealId = e.dataTransfer.getData('text/plain');
        const newStage = zone.dataset.stageDrop;
        if (dealId && newStage) {
          TBO_STORAGE.updateCrmDeal(dealId, { stage: newStage });
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Deal movido', `Movido para ${newStage}`);
          this._refresh();
        }
      });
    });
  },

  _refresh() {
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
  }
};
