// TBO OS — Module: Clientes (Client Database, Editable)
const TBO_CLIENTES = {
  _search: '',
  _showModal: false,
  _editing: null,

  render() {
    const context = TBO_STORAGE.get('context');
    const projects = context.projetos_ativos || [];
    const finalizados = context.projetos_finalizados || {};
    const rawClients = context.clientes_construtoras || [];
    const customClients = JSON.parse(localStorage.getItem('tbo_clients_custom') || '[]');

    // Build rich client list
    const clients = this._buildClientList(rawClients, customClients, projects, finalizados);
    const filtered = this._search
      ? clients.filter(c => c.name.toLowerCase().includes(this._search.toLowerCase()) || (c.contact||'').toLowerCase().includes(this._search.toLowerCase()))
      : clients;

    // Stats
    const totalProjects = clients.reduce((s,c) => s + c.activeProjects, 0);
    const totalHistoric = clients.reduce((s,c) => s + c.completedProjects, 0);
    const busSet = new Set();
    clients.forEach(c => (c.bus||[]).forEach(b => busSet.add(b)));

    return `
      <div class="clientes-module">
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Base de Clientes</h2>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="tag">${clients.length} clientes</span>
              <button class="btn btn-sm btn-primary clientes-add-btn">+ Novo Cliente</button>
            </div>
          </div>

          <!-- Stats -->
          <div class="clientes-stats">
            <div class="clientes-stat">
              <div class="clientes-stat-value">${clients.length}</div>
              <div class="clientes-stat-label">Clientes</div>
            </div>
            <div class="clientes-stat">
              <div class="clientes-stat-value">${totalProjects}</div>
              <div class="clientes-stat-label">Projetos Ativos</div>
            </div>
            <div class="clientes-stat">
              <div class="clientes-stat-value">${totalHistoric}</div>
              <div class="clientes-stat-label">Projetos Entregues</div>
            </div>
            <div class="clientes-stat">
              <div class="clientes-stat-value">${busSet.size}</div>
              <div class="clientes-stat-label">BUs Ativas</div>
            </div>
          </div>

          <!-- Search -->
          <div style="margin-bottom:16px;">
            <input class="form-input clientes-search" placeholder="Buscar cliente..." value="${this._search}" style="max-width:400px;">
          </div>

          <!-- Client Grid -->
          <div class="clientes-grid">
            ${filtered.length === 0 ? '<div class="empty-state"><div class="empty-state-text">Nenhum cliente encontrado.</div></div>' : ''}
            ${filtered.map(c => `
              <div class="clientes-card" data-client="${c.name}">
                <div class="clientes-card-header">
                  <div class="clientes-card-avatar" style="background:${this._avatarColor(c.name)};">${this._initials(c.name)}</div>
                  <div class="clientes-card-info">
                    <div class="clientes-card-name">${c.name}</div>
                    ${c.contact ? `<div class="clientes-card-contact">${c.contact}</div>` : ''}
                    ${c.email ? `<div class="clientes-card-email">${c.email}</div>` : ''}
                  </div>
                  <div class="clientes-card-actions">
                    <button class="clientes-edit-btn" data-edit-client="${c.name}" title="Editar">&#9998;</button>
                  </div>
                </div>
                <div class="clientes-card-body">
                  <div class="clientes-card-row">
                    <span class="clientes-card-label">Projetos ativos:</span>
                    <span class="clientes-card-val">${c.activeProjects}</span>
                  </div>
                  <div class="clientes-card-row">
                    <span class="clientes-card-label">Entregues:</span>
                    <span class="clientes-card-val">${c.completedProjects}</span>
                  </div>
                  ${c.bus.length > 0 ? `
                    <div class="clientes-card-bus">
                      ${c.bus.map(b => `<span class="clientes-bus-tag">${b}</span>`).join('')}
                    </div>
                  ` : ''}
                  ${c.activeProjectNames.length > 0 ? `
                    <div class="clientes-card-projects">
                      ${c.activeProjectNames.slice(0, 3).map(p => `<span class="clientes-project-tag">${p}</span>`).join('')}
                      ${c.activeProjectNames.length > 3 ? `<span class="clientes-project-more">+${c.activeProjectNames.length - 3}</span>` : ''}
                    </div>
                  ` : ''}
                  ${c.notes ? `<div class="clientes-card-notes">${c.notes}</div>` : ''}
                  ${c.phone ? `<div class="clientes-card-phone">${c.phone}</div>` : ''}
                </div>
                <div class="clientes-card-footer">
                  <span class="clientes-card-status ${c.activeProjects > 0 ? 'clientes-card-status--active' : 'clientes-card-status--inactive'}">
                    ${c.activeProjects > 0 ? 'Ativo' : 'Sem projetos'}
                  </span>
                  ${c.since ? `<span class="clientes-card-since">Desde ${c.since}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
      ${this._showModal ? this._renderModal() : ''}
    `;
  },

  _buildClientList(rawClients, customClients, projects, finalizados) {
    const clientMap = {};

    // From raw client names
    rawClients.forEach(name => {
      clientMap[name] = { name, contact: '', email: '', phone: '', notes: '', bus: [], activeProjects: 0, completedProjects: 0, activeProjectNames: [], since: '' };
    });

    // From custom clients
    customClients.forEach(c => {
      if (clientMap[c.name]) {
        Object.assign(clientMap[c.name], c);
      } else {
        clientMap[c.name] = { activeProjects: 0, completedProjects: 0, activeProjectNames: [], bus: [], ...c };
      }
    });

    // Count active projects
    projects.forEach(p => {
      const construtora = p.construtora;
      if (clientMap[construtora]) {
        clientMap[construtora].activeProjects++;
        clientMap[construtora].activeProjectNames.push(p.nome);
        (p.bus || []).forEach(b => {
          if (!clientMap[construtora].bus.includes(b)) clientMap[construtora].bus.push(b);
        });
      }
    });

    // Count completed projects
    Object.entries(finalizados).forEach(([year, list]) => {
      list.forEach(pName => {
        Object.keys(clientMap).forEach(cName => {
          if (pName.toLowerCase().includes(cName.toLowerCase())) {
            clientMap[cName].completedProjects++;
            if (!clientMap[cName].since || parseInt(year) < parseInt(clientMap[cName].since)) {
              clientMap[cName].since = year;
            }
          }
        });
      });
    });

    return Object.values(clientMap).sort((a, b) => b.activeProjects - a.activeProjects);
  },

  _renderModal() {
    const c = this._editing || {};
    const isEdit = !!c.name && !c._isNew;
    return `
      <div class="modal-overlay active clientes-modal-overlay">
        <div class="modal-card" style="max-width:480px;">
          <div class="modal-header">
            <h3>${isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <button class="modal-close clientes-modal-close">&#10005;</button>
          </div>
          <div class="modal-body" style="display:grid;gap:12px;">
            <div class="form-group">
              <label class="form-label">Nome do Cliente / Construtora</label>
              <input class="form-input" id="clientName" value="${c.name || ''}" placeholder="Construtora XYZ" ${isEdit ? 'readonly' : ''}>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Contato Principal</label>
                <input class="form-input" id="clientContact" value="${c.contact || ''}" placeholder="Nome do contato">
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input class="form-input" id="clientEmail" type="email" value="${c.email || ''}" placeholder="email@exemplo.com">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Telefone</label>
              <input class="form-input" id="clientPhone" value="${c.phone || ''}" placeholder="(41) 99999-9999">
            </div>
            <div class="form-group">
              <label class="form-label">Observacoes</label>
              <textarea class="form-input" id="clientNotes" rows="3" placeholder="Notas sobre o cliente...">${c.notes || ''}</textarea>
            </div>
          </div>
          <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;padding:16px 20px;">
            <button class="btn btn-secondary clientes-modal-close">Cancelar</button>
            <button class="btn btn-primary clientes-save-btn">${isEdit ? 'Salvar' : 'Adicionar'}</button>
          </div>
        </div>
      </div>
    `;
  },

  _avatarColor(name) {
    const colors = ['#3b82f6','#8b5cf6','#f59e0b','#22c55e','#ef4444','#14b8a6','#E85102','#6366f1','#ec4899'];
    let hash = 0;
    for (let i = 0; i < (name||'').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  },

  _initials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  },

  init() {
    // Search
    const search = document.querySelector('.clientes-search');
    if (search) {
      search.addEventListener('input', (e) => {
        this._search = e.target.value;
        this._refresh();
      });
    }

    // Add client
    const addBtn = document.querySelector('.clientes-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this._editing = { _isNew: true };
        this._showModal = true;
        this._refresh();
      });
    }

    // Edit client
    document.querySelectorAll('.clientes-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const clientName = btn.dataset.editClient;
        const customClients = JSON.parse(localStorage.getItem('tbo_clients_custom') || '[]');
        const existing = customClients.find(c => c.name === clientName);
        this._editing = existing ? { ...existing } : { name: clientName };
        this._showModal = true;
        this._refresh();
      });
    });

    // Modal close
    document.querySelectorAll('.clientes-modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        this._showModal = false;
        this._editing = null;
        this._refresh();
      });
    });

    // Modal overlay close
    const overlay = document.querySelector('.clientes-modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) { this._showModal = false; this._editing = null; this._refresh(); }
      });
    }

    // Save
    const saveBtn = document.querySelector('.clientes-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this._saveClient());
    }
  },

  _saveClient() {
    const name = document.getElementById('clientName')?.value?.trim();
    if (!name) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Atencao', 'Nome do cliente e obrigatorio.');
      return;
    }

    const data = {
      name,
      contact: document.getElementById('clientContact')?.value || '',
      email: document.getElementById('clientEmail')?.value || '',
      phone: document.getElementById('clientPhone')?.value || '',
      notes: document.getElementById('clientNotes')?.value || ''
    };

    const customClients = JSON.parse(localStorage.getItem('tbo_clients_custom') || '[]');
    const idx = customClients.findIndex(c => c.name === name);
    if (idx >= 0) {
      customClients[idx] = { ...customClients[idx], ...data };
    } else {
      customClients.push(data);
    }
    localStorage.setItem('tbo_clients_custom', JSON.stringify(customClients));

    // If new client, also add to context if not there
    if (this._editing?._isNew) {
      const context = TBO_STORAGE.get('context');
      const clients = context.clientes_construtoras || [];
      if (!clients.includes(name)) {
        clients.push(name);
        context.clientes_construtoras = clients;
        TBO_STORAGE.set('context', context);
      }
    }

    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Cliente salvo', name);
    this._showModal = false;
    this._editing = null;
    this._refresh();
  },

  _refresh() {
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
  }
};
