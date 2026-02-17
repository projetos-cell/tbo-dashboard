// TBO OS — Module: Contratos (Contract Management)
const TBO_CONTRATOS = {
  _filter: 'all', // 'all','ativo','finalizado','cancelado','pendente'
  _showModal: false,
  _editing: null,

  _storageKey: 'tbo_contracts',

  _getContracts() {
    try {
      return JSON.parse(localStorage.getItem(this._storageKey) || '[]');
    } catch (e) { return []; }
  },

  _saveContracts(contracts) {
    localStorage.setItem(this._storageKey, JSON.stringify(contracts));
  },

  render() {
    const contracts = this._getContracts();
    const context = TBO_STORAGE.get('context');
    const projects = context.projetos_ativos || [];

    // If no contracts yet, seed from active projects
    if (contracts.length === 0 && projects.length > 0) {
      this._seedFromProjects(projects);
      return this.render();
    }

    const filtered = this._filter === 'all' ? contracts : contracts.filter(c => c.status === this._filter);

    // Stats
    const ativos = contracts.filter(c => c.status === 'ativo');
    const totalValue = ativos.reduce((s,c) => s + (c.value || 0), 0);
    const expiringSoon = contracts.filter(c => {
      if (c.status !== 'ativo' || !c.endDate) return false;
      const days = (new Date(c.endDate) - new Date()) / (1000*60*60*24);
      return days >= 0 && days <= 30;
    });

    const filterBtns = [
      { key: 'all', label: 'Todos', count: contracts.length },
      { key: 'ativo', label: 'Ativos', count: ativos.length },
      { key: 'pendente', label: 'Pendentes', count: contracts.filter(c => c.status === 'pendente').length },
      { key: 'finalizado', label: 'Finalizados', count: contracts.filter(c => c.status === 'finalizado').length },
      { key: 'cancelado', label: 'Cancelados', count: contracts.filter(c => c.status === 'cancelado').length }
    ];

    return `
      <div class="contratos-module">
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Gestao de Contratos</h2>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="tag">${contracts.length} contratos</span>
              ${expiringSoon.length > 0 ? `<span class="tag tag-danger">${expiringSoon.length} vencendo</span>` : ''}
              <button class="btn btn-sm btn-primary contratos-add-btn">+ Novo Contrato</button>
            </div>
          </div>

          <!-- Stats -->
          <div class="contratos-stats">
            <div class="contratos-stat">
              <div class="contratos-stat-value">${ativos.length}</div>
              <div class="contratos-stat-label">Ativos</div>
            </div>
            <div class="contratos-stat">
              <div class="contratos-stat-value">R$ ${this._fmt(totalValue)}</div>
              <div class="contratos-stat-label">Valor Total</div>
            </div>
            <div class="contratos-stat">
              <div class="contratos-stat-value">${expiringSoon.length}</div>
              <div class="contratos-stat-label">Vencendo em 30d</div>
            </div>
            <div class="contratos-stat">
              <div class="contratos-stat-value">${contracts.filter(c => c.status === 'pendente').length}</div>
              <div class="contratos-stat-label">Pendentes</div>
            </div>
          </div>

          <!-- Filters -->
          <div style="display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap;">
            ${filterBtns.map(f => `<button class="btn ${this._filter === f.key ? 'btn-primary' : 'btn-secondary'} contratos-filter-btn" data-filter="${f.key}" style="font-size:0.72rem;padding:5px 12px;">${f.label} (${f.count})</button>`).join('')}
          </div>

          <!-- Contracts Table -->
          <div class="contratos-table-wrap">
            <table class="contratos-table">
              <thead>
                <tr>
                  <th>Contrato</th>
                  <th>Cliente</th>
                  <th>Servicos</th>
                  <th>Valor</th>
                  <th>Inicio</th>
                  <th>Fim</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? '<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-muted);">Nenhum contrato nesta categoria</td></tr>' : ''}
                ${filtered.map(c => {
                  const statusColors = { ativo: '#22c55e', pendente: '#f59e0b', finalizado: '#94a3b8', cancelado: '#ef4444' };
                  const statusLabels = { ativo: 'Ativo', pendente: 'Pendente', finalizado: 'Finalizado', cancelado: 'Cancelado' };
                  const color = statusColors[c.status] || '#94a3b8';
                  const isExpiring = c.status === 'ativo' && c.endDate && (new Date(c.endDate) - new Date()) / (1000*60*60*24) <= 30;
                  return `<tr class="${isExpiring ? 'contratos-row-warning' : ''}">
                    <td>
                      <strong>${c.name || 'Sem nome'}</strong>
                      ${c.notes ? `<div class="contratos-note-preview">${c.notes.substring(0, 50)}${c.notes.length > 50 ? '...' : ''}</div>` : ''}
                    </td>
                    <td>${c.client || '-'}</td>
                    <td>${(c.services || []).map(s => `<span class="contratos-service-tag">${s}</span>`).join('') || '-'}</td>
                    <td>R$ ${this._fmt(c.value)}</td>
                    <td>${c.startDate ? this._formatDate(c.startDate) : '-'}</td>
                    <td>
                      ${c.endDate ? this._formatDate(c.endDate) : '-'}
                      ${isExpiring ? '<span class="contratos-expiring-badge">Vencendo!</span>' : ''}
                    </td>
                    <td><span class="contratos-status-badge" style="background:${color}20;color:${color};border:1px solid ${color}40;">${statusLabels[c.status] || c.status}</span></td>
                    <td>
                      <button class="contratos-edit-btn" data-edit="${c.id}" title="Editar">&#9998;</button>
                      <button class="contratos-delete-btn" data-delete="${c.id}" title="Remover">&#10005;</button>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Expiring Soon Section -->
          ${expiringSoon.length > 0 ? `
            <div class="contratos-expiring-section">
              <h3 style="font-size:0.85rem;color:var(--accent-warning);margin-bottom:12px;">&#9888; Contratos Vencendo em 30 dias</h3>
              <div class="contratos-expiring-list">
                ${expiringSoon.map(c => `
                  <div class="contratos-expiring-item">
                    <span class="contratos-expiring-name">${c.name}</span>
                    <span class="contratos-expiring-client">${c.client}</span>
                    <span class="contratos-expiring-date">${this._formatDate(c.endDate)}</span>
                    <span class="contratos-expiring-value">R$ ${this._fmt(c.value)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </section>
      </div>
      ${this._showModal ? this._renderModal() : ''}
    `;
  },

  _seedFromProjects(projects) {
    const contracts = [];
    const now = new Date();
    projects.forEach((p, i) => {
      contracts.push({
        id: 'c_seed_' + i,
        name: p.nome,
        client: p.construtora,
        services: p.bus || [],
        value: 0,
        startDate: '',
        endDate: '',
        status: 'ativo',
        notes: '',
        createdAt: now.toISOString()
      });
    });
    this._saveContracts(contracts);
  },

  _renderModal() {
    const c = this._editing || {};
    const isEdit = !!c.id;
    const context = TBO_STORAGE.get('context');
    const clients = context.clientes_construtoras || [];

    return `
      <div class="modal-overlay contratos-modal-overlay">
        <div class="modal-card" style="max-width:520px;">
          <div class="modal-header">
            <h3>${isEdit ? 'Editar Contrato' : 'Novo Contrato'}</h3>
            <button class="modal-close contratos-modal-close">&#10005;</button>
          </div>
          <div class="modal-body" style="display:grid;gap:12px;">
            <div class="form-group">
              <label class="form-label">Nome do Contrato / Projeto</label>
              <input class="form-input" id="contratoName" value="${c.name || ''}" placeholder="Ex: Projeto XYZ">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Cliente</label>
                <input class="form-input" id="contratoClient" value="${c.client || ''}" list="contratoClientList" placeholder="Construtora">
                <datalist id="contratoClientList">${clients.map(cl => `<option value="${cl}">`).join('')}</datalist>
              </div>
              <div class="form-group">
                <label class="form-label">Valor (R$)</label>
                <input class="form-input" id="contratoValue" type="number" value="${c.value || ''}" placeholder="0">
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Data Inicio</label>
                <input class="form-input" id="contratoStart" type="date" value="${c.startDate || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Data Fim</label>
                <input class="form-input" id="contratoEnd" type="date" value="${c.endDate || ''}">
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-input" id="contratoStatus">
                  <option value="pendente" ${c.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                  <option value="ativo" ${c.status === 'ativo' || !c.status ? 'selected' : ''}>Ativo</option>
                  <option value="finalizado" ${c.status === 'finalizado' ? 'selected' : ''}>Finalizado</option>
                  <option value="cancelado" ${c.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Servicos (BUs)</label>
                <input class="form-input" id="contratoServices" value="${(c.services || []).join(', ')}" placeholder="Digital 3D, Branding...">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Observacoes</label>
              <textarea class="form-input" id="contratoNotes" rows="3" placeholder="Notas sobre o contrato...">${c.notes || ''}</textarea>
            </div>
          </div>
          <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;padding:16px 20px;">
            <button class="btn btn-secondary contratos-modal-close">Cancelar</button>
            <button class="btn btn-primary contratos-save-btn">${isEdit ? 'Salvar' : 'Criar'}</button>
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
    // Filters
    document.querySelectorAll('.contratos-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._filter = btn.dataset.filter;
        this._refresh();
      });
    });

    // Add
    const addBtn = document.querySelector('.contratos-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this._editing = null;
        this._showModal = true;
        this._refresh();
      });
    }

    // Edit
    document.querySelectorAll('.contratos-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.edit;
        const contracts = this._getContracts();
        this._editing = contracts.find(c => c.id === id) || null;
        this._showModal = true;
        this._refresh();
      });
    });

    // Delete
    document.querySelectorAll('.contratos-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.delete;
        if (confirm('Remover este contrato?')) {
          const contracts = this._getContracts().filter(c => c.id !== id);
          this._saveContracts(contracts);
          this._refresh();
        }
      });
    });

    // Modal close
    document.querySelectorAll('.contratos-modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        this._showModal = false;
        this._editing = null;
        this._refresh();
      });
    });

    // Overlay close
    const overlay = document.querySelector('.contratos-modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) { this._showModal = false; this._editing = null; this._refresh(); }
      });
    }

    // Save
    const saveBtn = document.querySelector('.contratos-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this._saveContract());
    }
  },

  _saveContract() {
    const name = document.getElementById('contratoName')?.value?.trim();
    if (!name) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Atencao', 'Nome do contrato e obrigatorio.');
      return;
    }

    const data = {
      name,
      client: document.getElementById('contratoClient')?.value || '',
      value: parseFloat(document.getElementById('contratoValue')?.value) || 0,
      startDate: document.getElementById('contratoStart')?.value || '',
      endDate: document.getElementById('contratoEnd')?.value || '',
      status: document.getElementById('contratoStatus')?.value || 'ativo',
      services: (document.getElementById('contratoServices')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
      notes: document.getElementById('contratoNotes')?.value || ''
    };

    const contracts = this._getContracts();

    if (this._editing && this._editing.id) {
      const idx = contracts.findIndex(c => c.id === this._editing.id);
      if (idx >= 0) {
        contracts[idx] = { ...contracts[idx], ...data, updatedAt: new Date().toISOString() };
      }
    } else {
      contracts.push({
        ...data,
        id: 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        createdAt: new Date().toISOString()
      });
    }

    this._saveContracts(contracts);
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Contrato salvo', name);
    this._showModal = false;
    this._editing = null;
    this._refresh();
  },

  _refresh() {
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
  }
};
