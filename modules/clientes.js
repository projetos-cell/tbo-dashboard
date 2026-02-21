// TBO OS — Module: Clientes (Client Database, Editable + CRM Fields)
const TBO_CLIENTES = {
  _search: '',
  _showModal: false,
  _showInteractionModal: false,
  _showDetailModal: false,
  _editing: null,
  _interactionClient: null,
  _detailClient: null,
  _filterStatus: '',

  // Relationship status config
  _statusConfig: {
    lead:      { label: 'Lead',      color: '#6b7280' },
    prospect:  { label: 'Prospect',  color: '#f59e0b' },
    ativo:     { label: 'Ativo',     color: '#22c55e' },
    vip:       { label: 'VIP',       color: '#8b5cf6' },
    inativo:   { label: 'Inativo',   color: '#ef4444' }
  },

  _interactionTypes: {
    email:       'Email',
    reuniao:     'Reuniao',
    call:        'Ligacao',
    whatsapp:    'WhatsApp',
    presencial:  'Presencial'
  },

  _getTeamMembers() {
    if (typeof TBO_RH !== 'undefined' && TBO_RH._team) return TBO_RH._team;
    const ctx = TBO_STORAGE.get('context');
    const equipe = ctx.dados_comerciais?.[TBO_CONFIG.app.fiscalYear]?.fluxo_caixa?.despesas_detalhadas?.pessoas?.equipe || [];
    return equipe.map(e => e.nome);
  },

  render() {
    const context = TBO_STORAGE.get('context');
    const projects = context.projetos_ativos || [];
    const finalizados = context.projetos_finalizados || {};
    const rawClients = context.clientes_construtoras || [];
    const customClients = JSON.parse(localStorage.getItem('tbo_clients_custom') || '[]');

    // Build rich client list
    const clients = this._buildClientList(rawClients, customClients, projects, finalizados);

    // Filter by status
    const statusFiltered = this._filterStatus
      ? clients.filter(c => (c.relationship_status || '') === this._filterStatus)
      : clients;

    const filtered = this._search
      ? statusFiltered.filter(c => c.name.toLowerCase().includes(this._search.toLowerCase()) || (c.contact||'').toLowerCase().includes(this._search.toLowerCase()) || (c.sales_owner||'').toLowerCase().includes(this._search.toLowerCase()))
      : statusFiltered;

    // Stats
    const totalProjects = clients.reduce((s,c) => s + c.activeProjects, 0);
    const totalHistoric = clients.reduce((s,c) => s + c.completedProjects, 0);
    const busSet = new Set();
    clients.forEach(c => (c.bus||[]).forEach(b => busSet.add(b)));

    // CRM stats
    const statusCounts = {};
    Object.keys(this._statusConfig).forEach(k => { statusCounts[k] = 0; });
    clients.forEach(c => { if (c.relationship_status && statusCounts[c.relationship_status] !== undefined) statusCounts[c.relationship_status]++; });
    const overdueInteractions = clients.filter(c => this._daysSince(c.last_interaction_date) > 30).length;
    const overdueActions = clients.filter(c => c.next_action_date && new Date(c.next_action_date) < new Date()).length;

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

          <!-- CRM Status Overview -->
          <div class="clientes-crm-bar">
            <button class="clientes-crm-pill ${this._filterStatus === '' ? 'clientes-crm-pill--active' : ''}" data-filter-status="">
              Todos <span class="clientes-crm-pill-count">${clients.length}</span>
            </button>
            ${Object.entries(this._statusConfig).map(([key, cfg]) => `
              <button class="clientes-crm-pill ${this._filterStatus === key ? 'clientes-crm-pill--active' : ''}" data-filter-status="${key}" style="--pill-color:${cfg.color};">
                ${cfg.label} <span class="clientes-crm-pill-count">${statusCounts[key]}</span>
              </button>
            `).join('')}
            ${overdueInteractions > 0 ? `<span class="clientes-crm-alert" title="Clientes sem interacao ha mais de 30 dias">&#9888; ${overdueInteractions} sem contato</span>` : ''}
            ${overdueActions > 0 ? `<span class="clientes-crm-alert clientes-crm-alert--action" title="Acoes de follow-up atrasadas">&#9200; ${overdueActions} follow-ups atrasados</span>` : ''}
          </div>

          <!-- Search -->
          <div style="margin-bottom:16px;">
            <input class="form-input clientes-search" placeholder="Buscar cliente, contato ou responsavel..." value="${this._search}" style="max-width:400px;">
          </div>

          <!-- Client Grid -->
          <div class="clientes-grid">
            ${filtered.length === 0 ? '<div class="empty-state"><div class="empty-state-text">Nenhum cliente encontrado.</div></div>' : ''}
            ${filtered.map(c => this._renderCard(c)).join('')}
          </div>
        </section>
      </div>
      ${this._showModal ? this._renderModal() : ''}
      ${this._showInteractionModal ? this._renderInteractionModal() : ''}
      ${this._showDetailModal ? this._renderDetailModal() : ''}
    `;
  },

  _renderCard(c) {
    const daysSince = this._daysSince(c.last_interaction_date);
    const interactionOverdue = daysSince > 30;
    const statusCfg = this._statusConfig[c.relationship_status] || null;
    const nextActionOverdue = c.next_action_date && new Date(c.next_action_date) < new Date();
    const nextActionDays = c.next_action_date ? this._daysUntil(c.next_action_date) : null;

    return `
      <div class="clientes-card" data-client="${_escapeHtml(c.name)}">
        <div class="clientes-card-header">
          <div class="clientes-card-avatar" style="background:${this._avatarColor(c.name)};">${this._initials(c.name)}</div>
          <div class="clientes-card-info">
            <div class="clientes-card-name">${_escapeHtml(c.name)}</div>
            ${c.contact ? `<div class="clientes-card-contact">${_escapeHtml(c.contact)}</div>` : ''}
            ${c.email ? `<div class="clientes-card-email">${_escapeHtml(c.email)}</div>` : ''}
          </div>
          <div class="clientes-card-actions">
            <button class="clientes-detail-btn" data-detail-client="${_escapeHtml(c.name)}" title="Ver detalhes">&#128269;</button>
            <button class="clientes-edit-btn" data-edit-client="${_escapeHtml(c.name)}" title="Editar">&#9998;</button>
          </div>
        </div>

        <!-- CRM Status Badge + Sales Owner -->
        <div class="clientes-crm-row">
          ${statusCfg ? `<span class="clientes-status-badge" style="background:${statusCfg.color}20;color:${statusCfg.color};border:1px solid ${statusCfg.color}40;">${statusCfg.label}</span>` : '<span class="clientes-status-badge clientes-status-badge--none">Sem status</span>'}
          ${c.sales_owner ? `<span class="clientes-sales-owner" title="Responsavel Comercial">&#128100; ${_escapeHtml(c.sales_owner)}</span>` : ''}
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
              ${c.activeProjectNames.slice(0, 3).map(p => `<span class="clientes-project-tag">${_escapeHtml(p)}</span>`).join('')}
              ${c.activeProjectNames.length > 3 ? `<span class="clientes-project-more">+${c.activeProjectNames.length - 3}</span>` : ''}
            </div>
          ` : ''}
          ${c.notes ? `<div class="clientes-card-notes">${_escapeHtml(c.notes)}</div>` : ''}
          ${c.phone ? `<div class="clientes-card-phone">${_escapeHtml(c.phone)}</div>` : ''}

          <!-- Last interaction -->
          ${c.last_interaction_date ? `
            <div class="clientes-card-row">
              <span class="clientes-card-label">Ultima interacao:</span>
              <span class="clientes-card-val ${interactionOverdue ? 'clientes-overdue' : ''}">${daysSince === 0 ? 'Hoje' : daysSince + ' dias atras'}${interactionOverdue ? ' &#9888;' : ''}</span>
            </div>
          ` : ''}

          <!-- Next action -->
          ${c.next_action ? `
            <div class="clientes-next-action ${nextActionOverdue ? 'clientes-next-action--overdue' : ''}">
              <span class="clientes-next-action-label">Proximo passo:</span>
              <span class="clientes-next-action-text">${_escapeHtml(c.next_action)}</span>
              ${c.next_action_date ? `<span class="clientes-next-action-date">${nextActionOverdue ? 'Atrasado' : (nextActionDays === 0 ? 'Hoje' : 'em ' + nextActionDays + 'd')}</span>` : ''}
            </div>
          ` : ''}
        </div>

        <div class="clientes-card-footer">
          <span class="clientes-card-status ${c.activeProjects > 0 ? 'clientes-card-status--active' : 'clientes-card-status--inactive'}">
            ${c.activeProjects > 0 ? 'Ativo' : 'Sem projetos'}
          </span>
          <div style="display:flex;gap:6px;align-items:center;">
            <button class="clientes-interaction-btn" data-interaction-client="${_escapeHtml(c.name)}" title="Registrar interacao">+ Interacao</button>
            ${c.since ? `<span class="clientes-card-since">Desde ${c.since}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  _buildClientList(rawClients, customClients, projects, finalizados) {
    const clientMap = {};

    // Default CRM fields
    const crmDefaults = {
      sales_owner: '',
      relationship_status: '',
      last_interaction_date: '',
      next_action: '',
      next_action_date: '',
      interaction_log: []
    };

    // From raw client names
    rawClients.forEach(name => {
      clientMap[name] = { name, contact: '', email: '', phone: '', notes: '', bus: [], activeProjects: 0, completedProjects: 0, activeProjectNames: [], since: '', ...crmDefaults };
    });

    // From custom clients
    customClients.forEach(c => {
      if (clientMap[c.name]) {
        Object.assign(clientMap[c.name], c);
        // Ensure CRM defaults exist
        Object.keys(crmDefaults).forEach(k => {
          if (clientMap[c.name][k] === undefined) clientMap[c.name][k] = crmDefaults[k];
        });
      } else {
        clientMap[c.name] = { activeProjects: 0, completedProjects: 0, activeProjectNames: [], bus: [], ...crmDefaults, ...c };
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

    // Auto-inferir relationship_status quando nao definido
    Object.values(clientMap).forEach(c => {
      if (!c.relationship_status) {
        if (c.activeProjects > 0) {
          c.relationship_status = 'ativo';
        } else if (c.completedProjects > 0) {
          c.relationship_status = 'ativo'; // ja teve projetos, considerar ativo
        }
        // Se nao tem projetos, permanece sem status (potencial lead)
      }
    });

    return Object.values(clientMap).sort((a, b) => b.activeProjects - a.activeProjects);
  },

  _renderModal() {
    const c = this._editing || {};
    const isEdit = !!c.name && !c._isNew;
    const teamMembers = this._getTeamMembers();

    return `
      <div class="modal-overlay active clientes-modal-overlay">
        <div class="modal-card" style="max-width:540px;">
          <div class="modal-header">
            <h3>${isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <button class="modal-close clientes-modal-close">&#10005;</button>
          </div>
          <div class="modal-body" style="display:grid;gap:12px;max-height:70vh;overflow-y:auto;">
            <div class="form-group">
              <label class="form-label">Nome do Cliente / Construtora</label>
              <input class="form-input" id="clientName" value="${_escapeHtml(c.name)}" placeholder="Construtora XYZ" ${isEdit ? 'readonly' : ''}>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Contato Principal</label>
                <input class="form-input" id="clientContact" value="${_escapeHtml(c.contact)}" placeholder="Nome do contato">
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input class="form-input" id="clientEmail" type="email" value="${_escapeHtml(c.email)}" placeholder="email@exemplo.com">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Telefone</label>
              <input class="form-input" id="clientPhone" value="${_escapeHtml(c.phone)}" placeholder="(41) 99999-9999">
            </div>

            <!-- CRM Fields Section -->
            <div class="clientes-modal-divider">Campos CRM</div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Responsavel Comercial</label>
                <select class="form-input" id="clientSalesOwner">
                  <option value="">-- Selecionar --</option>
                  ${teamMembers.map(m => `<option value="${_escapeHtml(m)}" ${c.sales_owner === m ? 'selected' : ''}>${_escapeHtml(m)}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Status do Relacionamento</label>
                <select class="form-input" id="clientRelStatus">
                  <option value="">-- Selecionar --</option>
                  ${Object.entries(this._statusConfig).map(([key, cfg]) => `<option value="${key}" ${c.relationship_status === key ? 'selected' : ''}>${cfg.label}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Ultima Interacao</label>
                <input class="form-input" id="clientLastInteraction" type="date" value="${c.last_interaction_date || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Data Prox. Acao</label>
                <input class="form-input" id="clientNextActionDate" type="date" value="${c.next_action_date || ''}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Proximo Passo / Follow-up</label>
              <input class="form-input" id="clientNextAction" value="${_escapeHtml(c.next_action)}" placeholder="Ex: Enviar proposta atualizada">
            </div>

            <div class="form-group">
              <label class="form-label">Observacoes</label>
              <textarea class="form-input" id="clientNotes" rows="3" placeholder="Notas sobre o cliente...">${_escapeHtml(c.notes)}</textarea>
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

  _renderInteractionModal() {
    const clientName = this._interactionClient || '';
    const today = new Date().toISOString().split('T')[0];
    return `
      <div class="modal-overlay active clientes-interaction-overlay">
        <div class="modal-card" style="max-width:440px;">
          <div class="modal-header">
            <h3>Registrar Interacao</h3>
            <button class="modal-close clientes-interaction-close">&#10005;</button>
          </div>
          <div class="modal-body" style="display:grid;gap:12px;">
            <div class="form-group">
              <label class="form-label">Cliente</label>
              <input class="form-input" value="${_escapeHtml(clientName)}" readonly>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Tipo</label>
                <select class="form-input" id="interactionType">
                  ${Object.entries(this._interactionTypes).map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Data</label>
                <input class="form-input" id="interactionDate" type="date" value="${today}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Notas</label>
              <textarea class="form-input" id="interactionNotes" rows="4" placeholder="Descreva a interacao..."></textarea>
            </div>
          </div>
          <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;padding:16px 20px;">
            <button class="btn btn-secondary clientes-interaction-close">Cancelar</button>
            <button class="btn btn-primary clientes-interaction-save">Registrar</button>
          </div>
        </div>
      </div>
    `;
  },

  _renderDetailModal() {
    const clientName = this._detailClient;
    if (!clientName) return '';

    const customClients = JSON.parse(localStorage.getItem('tbo_clients_custom') || '[]');
    const clientData = customClients.find(c => c.name === clientName) || {};
    const interactions = (clientData.interaction_log || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    const last5 = interactions.slice(0, 5);
    const statusCfg = this._statusConfig[clientData.relationship_status] || null;

    return `
      <div class="modal-overlay active clientes-detail-overlay">
        <div class="modal-card" style="max-width:560px;">
          <div class="modal-header">
            <h3>Detalhes: ${_escapeHtml(clientName)}</h3>
            <button class="modal-close clientes-detail-close">&#10005;</button>
          </div>
          <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
            <!-- Client summary -->
            <div class="clientes-detail-summary">
              <div class="clientes-detail-row">
                <span class="clientes-detail-label">Status:</span>
                ${statusCfg ? `<span class="clientes-status-badge" style="background:${statusCfg.color}20;color:${statusCfg.color};border:1px solid ${statusCfg.color}40;">${statusCfg.label}</span>` : '<span style="color:var(--text-muted);font-size:0.75rem;">Nao definido</span>'}
              </div>
              ${clientData.sales_owner ? `
                <div class="clientes-detail-row">
                  <span class="clientes-detail-label">Responsavel:</span>
                  <span class="clientes-detail-value">${_escapeHtml(clientData.sales_owner)}</span>
                </div>
              ` : ''}
              ${clientData.contact ? `
                <div class="clientes-detail-row">
                  <span class="clientes-detail-label">Contato:</span>
                  <span class="clientes-detail-value">${_escapeHtml(clientData.contact)}</span>
                </div>
              ` : ''}
              ${clientData.email ? `
                <div class="clientes-detail-row">
                  <span class="clientes-detail-label">Email:</span>
                  <span class="clientes-detail-value">${_escapeHtml(clientData.email)}</span>
                </div>
              ` : ''}
              ${clientData.phone ? `
                <div class="clientes-detail-row">
                  <span class="clientes-detail-label">Telefone:</span>
                  <span class="clientes-detail-value">${_escapeHtml(clientData.phone)}</span>
                </div>
              ` : ''}
              ${clientData.next_action ? `
                <div class="clientes-detail-row">
                  <span class="clientes-detail-label">Proximo passo:</span>
                  <span class="clientes-detail-value">${_escapeHtml(clientData.next_action)}${clientData.next_action_date ? ` (${this._formatDate(clientData.next_action_date)})` : ''}</span>
                </div>
              ` : ''}
              ${clientData.notes ? `
                <div class="clientes-detail-row">
                  <span class="clientes-detail-label">Notas:</span>
                  <span class="clientes-detail-value" style="font-style:italic;">${_escapeHtml(clientData.notes)}</span>
                </div>
              ` : ''}
            </div>

            <!-- Interaction log -->
            <div class="clientes-detail-section-title">
              Historico de Interacoes ${interactions.length > 0 ? `(${interactions.length} total)` : ''}
            </div>

            ${last5.length === 0 ? `
              <div style="font-size:0.75rem;color:var(--text-muted);padding:12px 0;text-align:center;">Nenhuma interacao registrada.</div>
            ` : `
              <div class="clientes-interactions-list">
                ${last5.map(i => `
                  <div class="clientes-interaction-item">
                    <div class="clientes-interaction-icon" style="background:${this._interactionColor(i.type)}20;color:${this._interactionColor(i.type)};">
                      ${this._interactionIcon(i.type)}
                    </div>
                    <div class="clientes-interaction-body">
                      <div class="clientes-interaction-header-row">
                        <span class="clientes-interaction-type">${this._interactionTypes[i.type] || i.type}</span>
                        <span class="clientes-interaction-date">${this._formatDate(i.date)}</span>
                      </div>
                      ${i.notes ? `<div class="clientes-interaction-notes">${_escapeHtml(i.notes)}</div>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
            ${interactions.length > 5 ? `<div style="font-size:0.68rem;color:var(--text-muted);text-align:center;padding-top:4px;">Mostrando 5 de ${interactions.length} interacoes</div>` : ''}
          </div>
          <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;padding:16px 20px;">
            <button class="btn btn-primary clientes-detail-add-interaction" data-interaction-client="${clientName}">+ Registrar Interacao</button>
            <button class="btn btn-secondary clientes-detail-close">Fechar</button>
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

  _daysSince(dateStr) {
    if (!dateStr) return -1;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return -1;
    const now = new Date();
    now.setHours(0,0,0,0);
    d.setHours(0,0,0,0);
    return Math.floor((now - d) / 86400000);
  },

  _daysUntil(dateStr) {
    if (!dateStr) return -1;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return -1;
    const now = new Date();
    now.setHours(0,0,0,0);
    d.setHours(0,0,0,0);
    return Math.max(0, Math.floor((d - now) / 86400000));
  },

  _formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  _interactionColor(type) {
    const map = { email: '#3b82f6', reuniao: '#8b5cf6', call: '#22c55e', whatsapp: '#25d366', presencial: '#f59e0b' };
    return map[type] || '#6b7280';
  },

  _interactionIcon(type) {
    const map = { email: '&#9993;', reuniao: '&#128197;', call: '&#128222;', whatsapp: '&#128172;', presencial: '&#129309;' };
    return map[type] || '&#128172;';
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

    // Status filter pills
    document.querySelectorAll('.clientes-crm-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this._filterStatus = btn.dataset.filterStatus || '';
        this._refresh();
      });
    });

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

    // Detail client
    document.querySelectorAll('.clientes-detail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._detailClient = btn.dataset.detailClient;
        this._showDetailModal = true;
        this._refresh();
      });
    });

    // Interaction button on card
    document.querySelectorAll('.clientes-interaction-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._interactionClient = btn.dataset.interactionClient;
        this._showInteractionModal = true;
        this._refresh();
      });
    });

    // Modal close (edit modal)
    document.querySelectorAll('.clientes-modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        this._showModal = false;
        this._editing = null;
        this._refresh();
      });
    });

    // Modal overlay close (edit modal)
    const overlay = document.querySelector('.clientes-modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) { this._showModal = false; this._editing = null; this._refresh(); }
      });
    }

    // Save (edit modal)
    const saveBtn = document.querySelector('.clientes-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this._saveClient());
    }

    // Interaction modal close
    document.querySelectorAll('.clientes-interaction-close').forEach(btn => {
      btn.addEventListener('click', () => {
        this._showInteractionModal = false;
        this._interactionClient = null;
        this._refresh();
      });
    });
    const intOverlay = document.querySelector('.clientes-interaction-overlay');
    if (intOverlay) {
      intOverlay.addEventListener('click', (e) => {
        if (e.target === intOverlay) { this._showInteractionModal = false; this._interactionClient = null; this._refresh(); }
      });
    }

    // Save interaction
    const intSaveBtn = document.querySelector('.clientes-interaction-save');
    if (intSaveBtn) {
      intSaveBtn.addEventListener('click', () => this._saveInteraction());
    }

    // Detail modal close
    document.querySelectorAll('.clientes-detail-close').forEach(btn => {
      btn.addEventListener('click', () => {
        this._showDetailModal = false;
        this._detailClient = null;
        this._refresh();
      });
    });
    const detOverlay = document.querySelector('.clientes-detail-overlay');
    if (detOverlay) {
      detOverlay.addEventListener('click', (e) => {
        if (e.target === detOverlay) { this._showDetailModal = false; this._detailClient = null; this._refresh(); }
      });
    }

    // Add interaction from detail modal
    const detAddInt = document.querySelector('.clientes-detail-add-interaction');
    if (detAddInt) {
      detAddInt.addEventListener('click', () => {
        this._interactionClient = detAddInt.dataset.interactionClient;
        this._showDetailModal = false;
        this._detailClient = null;
        this._showInteractionModal = true;
        this._refresh();
      });
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
      notes: document.getElementById('clientNotes')?.value || '',
      sales_owner: document.getElementById('clientSalesOwner')?.value || '',
      relationship_status: document.getElementById('clientRelStatus')?.value || '',
      last_interaction_date: document.getElementById('clientLastInteraction')?.value || '',
      next_action: document.getElementById('clientNextAction')?.value || '',
      next_action_date: document.getElementById('clientNextActionDate')?.value || ''
    };

    const customClients = JSON.parse(localStorage.getItem('tbo_clients_custom') || '[]');
    const idx = customClients.findIndex(c => c.name === name);
    if (idx >= 0) {
      // Preserve existing interaction_log
      data.interaction_log = customClients[idx].interaction_log || [];
      customClients[idx] = { ...customClients[idx], ...data };
    } else {
      data.interaction_log = [];
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

  _saveInteraction() {
    const clientName = this._interactionClient;
    if (!clientName) return;

    const type = document.getElementById('interactionType')?.value || 'email';
    const date = document.getElementById('interactionDate')?.value || new Date().toISOString().split('T')[0];
    const notes = document.getElementById('interactionNotes')?.value || '';

    if (!notes.trim()) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Atencao', 'Adicione uma nota sobre a interacao.');
      return;
    }

    const interaction = { type, date, notes, created_at: new Date().toISOString() };

    const customClients = JSON.parse(localStorage.getItem('tbo_clients_custom') || '[]');
    let idx = customClients.findIndex(c => c.name === clientName);
    if (idx < 0) {
      // Client exists in raw list but not in custom storage yet
      customClients.push({ name: clientName, interaction_log: [], last_interaction_date: '' });
      idx = customClients.length - 1;
    }

    if (!Array.isArray(customClients[idx].interaction_log)) {
      customClients[idx].interaction_log = [];
    }
    customClients[idx].interaction_log.push(interaction);

    // Auto-update last_interaction_date to the most recent
    const allDates = customClients[idx].interaction_log.map(i => i.date).filter(Boolean).sort();
    if (allDates.length > 0) {
      customClients[idx].last_interaction_date = allDates[allDates.length - 1];
    }

    localStorage.setItem('tbo_clients_custom', JSON.stringify(customClients));

    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Interacao registrada', clientName);
    this._showInteractionModal = false;
    this._interactionClient = null;
    this._refresh();
  },

  _refresh() {
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
  }
};
