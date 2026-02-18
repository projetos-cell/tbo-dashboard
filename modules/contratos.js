// TBO OS — Module: Contratos (Contract Management)
// Upgraded v1.5.0 — seeds from TBO_CONTRATOS_DATA (82 real contracts)
const TBO_CONTRATOS = {
  _filter: 'all',
  _search: '',
  _clientFilter: 'all',
  _sortBy: 'valor', // 'valor','cliente','projeto'
  _sortDir: 'desc',
  _showModal: false,
  _editing: null,
  _detailId: null,
  _pendingFiles: [],
  _attachmentsCache: {},
  _uploading: false,

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
    let contracts = this._getContracts();

    // Seed from real data if empty
    if (contracts.length === 0 && typeof TBO_CONTRATOS_DATA !== 'undefined') {
      this._seedFromData();
      contracts = this._getContracts();
    }
    // Legacy fallback: seed from projects
    if (contracts.length === 0) {
      const context = TBO_STORAGE.get('context');
      const projects = context?.projetos_ativos || [];
      if (projects.length > 0) {
        this._seedFromProjects(projects);
        contracts = this._getContracts();
      }
    }

    // If showing detail view
    if (this._detailId) {
      const c = contracts.find(x => x.id === this._detailId);
      if (c) return this._renderDetail(c, contracts);
    }

    // Filter
    let filtered = this._filter === 'all' ? [...contracts] : contracts.filter(c => c.status === this._filter);

    // Client filter
    if (this._clientFilter !== 'all') {
      filtered = filtered.filter(c => c.client === this._clientFilter);
    }

    // Search
    if (this._search) {
      const q = this._search.toLowerCase();
      filtered = filtered.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.client || '').toLowerCase().includes(q) ||
        (c.services || []).some(s => s.toLowerCase().includes(q))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dir = this._sortDir === 'asc' ? 1 : -1;
      if (this._sortBy === 'valor') return ((b.value || 0) - (a.value || 0)) * dir;
      if (this._sortBy === 'cliente') return (a.client || '').localeCompare(b.client || '') * dir;
      if (this._sortBy === 'projeto') return (a.name || '').localeCompare(b.name || '') * dir;
      return 0;
    });

    // Stats
    const ativos = contracts.filter(c => c.status === 'ativo');
    const finalizados = contracts.filter(c => c.status === 'finalizado');
    const totalValue = contracts.reduce((s, c) => s + (c.value || 0), 0);
    const totalAtivosValue = ativos.reduce((s, c) => s + (c.value || 0), 0);
    const uniqueClients = [...new Set(contracts.map(c => c.client))].sort();
    const ticketMedio = contracts.length > 0 ? totalValue / contracts.filter(c => c.value > 0).length : 0;
    const expiringSoon = contracts.filter(c => {
      if (c.status !== 'ativo' || !c.endDate) return false;
      const days = (new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 30;
    });

    // Service breakdown
    const svcMap = {};
    contracts.forEach(c => (c.services || []).forEach(s => {
      if (!svcMap[s]) svcMap[s] = { count: 0, valor: 0 };
      svcMap[s].count++;
      svcMap[s].valor += (c.value || 0);
    }));
    const svcList = Object.entries(svcMap).sort((a, b) => b[1].valor - a[1].valor);

    // Top clients
    const clientMap = {};
    contracts.forEach(c => {
      if (!clientMap[c.client]) clientMap[c.client] = { count: 0, valor: 0 };
      clientMap[c.client].count++;
      clientMap[c.client].valor += (c.value || 0);
    });
    const topClients = Object.entries(clientMap).sort((a, b) => b[1].valor - a[1].valor).slice(0, 8);

    const filterBtns = [
      { key: 'all', label: 'Todos', count: contracts.length },
      { key: 'ativo', label: 'Ativos', count: ativos.length },
      { key: 'pendente', label: 'Pendentes', count: contracts.filter(c => c.status === 'pendente').length },
      { key: 'finalizado', label: 'Finalizados', count: finalizados.length },
      { key: 'cancelado', label: 'Cancelados', count: contracts.filter(c => c.status === 'cancelado').length }
    ];

    return `
      <div class="contratos-module">
        <!-- Summary Cards -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Gestao de Contratos</h2>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="tag">${contracts.length} contratos</span>
              <span class="tag" style="background:var(--accent)20;color:var(--accent);">${uniqueClients.length} clientes</span>
              ${expiringSoon.length > 0 ? `<span class="tag tag-danger">${expiringSoon.length} vencendo</span>` : ''}
              <button class="btn btn-sm btn-primary contratos-add-btn">+ Novo Contrato</button>
            </div>
          </div>

          <div class="contratos-stats">
            <div class="contratos-stat">
              <div class="contratos-stat-value">${ativos.length}</div>
              <div class="contratos-stat-label">Ativos</div>
            </div>
            <div class="contratos-stat">
              <div class="contratos-stat-value">R$ ${this._fmt(totalAtivosValue)}</div>
              <div class="contratos-stat-label">Valor Ativos</div>
            </div>
            <div class="contratos-stat">
              <div class="contratos-stat-value">R$ ${this._fmt(totalValue)}</div>
              <div class="contratos-stat-label">Valor Total Historico</div>
            </div>
            <div class="contratos-stat">
              <div class="contratos-stat-value">R$ ${this._fmt(ticketMedio)}</div>
              <div class="contratos-stat-label">Ticket Medio</div>
            </div>
            <div class="contratos-stat">
              <div class="contratos-stat-value">${finalizados.length}</div>
              <div class="contratos-stat-label">Finalizados</div>
            </div>
            <div class="contratos-stat">
              <div class="contratos-stat-value">${expiringSoon.length}</div>
              <div class="contratos-stat-label">Vencendo 30d</div>
            </div>
          </div>
        </section>

        <!-- Breakdown: Services + Top Clients -->
        <section class="section">
          <div class="contratos-breakdown-grid">
            <div class="contratos-breakdown-card">
              <h3 class="contratos-breakdown-title"><i data-lucide="layers" style="width:16px;height:16px;"></i> Receita por Servico</h3>
              <div class="contratos-breakdown-list">
                ${svcList.map(([svc, d]) => {
                  const pct = totalValue > 0 ? (d.valor / totalValue * 100) : 0;
                  return `<div class="contratos-breakdown-row">
                    <span class="contratos-breakdown-label">${svc}</span>
                    <div class="contratos-breakdown-bar-wrap">
                      <div class="contratos-breakdown-bar" style="width:${pct}%"></div>
                    </div>
                    <span class="contratos-breakdown-value">R$ ${this._fmt(d.valor)} <small>(${d.count})</small></span>
                  </div>`;
                }).join('')}
              </div>
            </div>
            <div class="contratos-breakdown-card">
              <h3 class="contratos-breakdown-title"><i data-lucide="building-2" style="width:16px;height:16px;"></i> Top Clientes</h3>
              <div class="contratos-breakdown-list">
                ${topClients.map(([client, d]) => {
                  const pct = totalValue > 0 ? (d.valor / totalValue * 100) : 0;
                  return `<div class="contratos-breakdown-row contratos-client-row" data-client="${client}">
                    <span class="contratos-breakdown-label">${client}</span>
                    <div class="contratos-breakdown-bar-wrap">
                      <div class="contratos-breakdown-bar" style="width:${pct}%;background:var(--accent-gold);"></div>
                    </div>
                    <span class="contratos-breakdown-value">R$ ${this._fmt(d.valor)} <small>(${d.count})</small></span>
                  </div>`;
                }).join('')}
              </div>
            </div>
          </div>
        </section>

        <!-- Filters + Search + Table -->
        <section class="section">
          <div class="contratos-toolbar">
            <div class="contratos-filters">
              ${filterBtns.map(f => `<button class="btn ${this._filter === f.key ? 'btn-primary' : 'btn-secondary'} contratos-filter-btn" data-filter="${f.key}" style="font-size:0.72rem;padding:5px 12px;">${f.label} (${f.count})</button>`).join('')}
            </div>
            <div class="contratos-search-row">
              <select class="form-input contratos-client-select" style="max-width:180px;font-size:0.75rem;padding:5px 8px;">
                <option value="all">Todos clientes</option>
                ${uniqueClients.map(cl => `<option value="${cl}" ${this._clientFilter === cl ? 'selected' : ''}>${cl}</option>`).join('')}
              </select>
              <div class="contratos-search-wrap">
                <i data-lucide="search" style="width:14px;height:14px;color:var(--text-muted);"></i>
                <input type="text" class="form-input contratos-search-input" placeholder="Buscar contrato..." value="${this._search}" style="font-size:0.75rem;padding:5px 8px;">
              </div>
            </div>
          </div>

          <div class="contratos-table-wrap">
            <table class="contratos-table">
              <thead>
                <tr>
                  <th class="contratos-sortable" data-sort="projeto">Contrato <i data-lucide="arrow-up-down" style="width:12px;height:12px;"></i></th>
                  <th class="contratos-sortable" data-sort="cliente">Cliente <i data-lucide="arrow-up-down" style="width:12px;height:12px;"></i></th>
                  <th>Servicos</th>
                  <th class="contratos-sortable" data-sort="valor">Valor <i data-lucide="arrow-up-down" style="width:12px;height:12px;"></i></th>
                  <th>Qtd.</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-muted);">Nenhum contrato encontrado</td></tr>' : ''}
                ${filtered.map(c => {
                  const statusColors = { ativo: '#22c55e', pendente: '#f59e0b', finalizado: '#94a3b8', cancelado: '#ef4444' };
                  const statusLabels = { ativo: 'Ativo', pendente: 'Pendente', finalizado: 'Finalizado', cancelado: 'Cancelado' };
                  const color = statusColors[c.status] || '#94a3b8';
                  const isExpiring = c.status === 'ativo' && c.endDate && (new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24) <= 30;
                  const imgs = c.qtdImagens || 0;
                  const plantas = c.qtdPlantas || 0;
                  const qtdStr = [];
                  if (imgs > 0) qtdStr.push(`${imgs} img`);
                  if (plantas > 0) qtdStr.push(`${plantas} plt`);
                  return `<tr class="${isExpiring ? 'contratos-row-warning' : ''} contratos-row-clickable" data-detail="${c.id}">
                    <td>
                      <strong>${c.name || 'Sem nome'}</strong>
                      ${c.notes ? `<div class="contratos-note-preview">${c.notes.substring(0, 50)}${c.notes.length > 50 ? '...' : ''}</div>` : ''}
                    </td>
                    <td>${c.client || '-'}</td>
                    <td>${(c.services || []).map(s => `<span class="contratos-service-tag">${s}</span>`).join('') || '-'}</td>
                    <td style="font-weight:600;white-space:nowrap;">R$ ${this._fmt(c.value)}</td>
                    <td style="white-space:nowrap;font-size:0.72rem;color:var(--text-muted);">${qtdStr.join(' / ') || '-'}</td>
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
          <div class="contratos-table-footer">
            <span>${filtered.length} de ${contracts.length} contratos</span>
            <span>Valor filtrado: R$ ${this._fmt(filtered.reduce((s, c) => s + (c.value || 0), 0))}</span>
          </div>
        </section>

        <!-- Expiring Soon -->
        ${expiringSoon.length > 0 ? `
          <section class="section">
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
          </section>
        ` : ''}
      </div>
      ${this._showModal ? this._renderModal() : ''}
    `;
  },

  // ── Detail View ─────────────────────────────────────────────────────────
  _renderDetail(c, allContracts) {
    // Related contracts (same client)
    const related = allContracts.filter(x => x.client === c.client && x.id !== c.id);
    const clientTotal = allContracts.filter(x => x.client === c.client).reduce((s, x) => s + (x.value || 0), 0);
    const statusColors = { ativo: '#22c55e', pendente: '#f59e0b', finalizado: '#94a3b8', cancelado: '#ef4444' };
    const statusLabels = { ativo: 'Ativo', pendente: 'Pendente', finalizado: 'Finalizado', cancelado: 'Cancelado' };
    const color = statusColors[c.status] || '#94a3b8';

    return `
      <div class="contratos-module">
        <section class="section">
          <button class="btn btn-secondary contratos-back-btn" style="margin-bottom:16px;">
            <i data-lucide="arrow-left" style="width:14px;height:14px;"></i> Voltar
          </button>
          <div class="contratos-detail-header">
            <div>
              <h2 class="contratos-detail-title">${c.name}</h2>
              <p class="contratos-detail-client">${c.client}</p>
            </div>
            <div style="text-align:right;">
              <div class="contratos-detail-valor">R$ ${this._fmt(c.value)}</div>
              <span class="contratos-status-badge" style="background:${color}20;color:${color};border:1px solid ${color}40;">${statusLabels[c.status] || c.status}</span>
            </div>
          </div>

          <div class="contratos-detail-grid">
            <div class="contratos-detail-card">
              <h4>Servicos</h4>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
                ${(c.services || []).map(s => `<span class="contratos-service-tag">${s}</span>`).join('') || '<span style="color:var(--text-muted);">Nenhum</span>'}
              </div>
            </div>
            <div class="contratos-detail-card">
              <h4>Quantidades</h4>
              <div class="contratos-detail-qty">
                <div><strong>${c.qtdImagens || 0}</strong><small>Imagens</small></div>
                <div><strong>${c.qtdPlantas || 0}</strong><small>Plantas</small></div>
              </div>
            </div>
            <div class="contratos-detail-card">
              <h4>Periodo</h4>
              <p>${c.startDate ? this._formatDate(c.startDate) : 'Sem data'} — ${c.endDate ? this._formatDate(c.endDate) : 'Sem data'}</p>
            </div>
            <div class="contratos-detail-card">
              <h4>Arquivo Origem</h4>
              <p style="font-size:0.75rem;color:var(--text-muted);">${c.arquivo || 'N/A'}</p>
            </div>
          </div>

          ${c.notes ? `<div class="contratos-detail-notes"><h4>Observacoes</h4><p>${c.notes}</p></div>` : ''}

          <!-- Attachments -->
          <div class="contratos-attachments" id="contratosAttachmentSection" data-contract="${c.id}">
            <div class="contratos-attachments-header">
              <div class="contratos-attachments-title">
                <i data-lucide="paperclip" style="width:16px;height:16px;"></i>
                Anexos
                <span id="attachmentCount" style="font-size:0.72rem;font-weight:400;color:var(--text-muted);"></span>
              </div>
              ${this._isOnline() ? `<button class="btn btn-sm btn-secondary contratos-attach-btn" data-contract="${c.id}">
                <i data-lucide="plus" style="width:12px;height:12px;"></i> Anexar Arquivo
              </button>` : ''}
              <input type="file" id="contratoDetailFileInput" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" style="display:none;">
            </div>
            <div class="contratos-attachment-list" id="contratosAttachmentList">
              <div class="contratos-attachments-empty" id="attachmentsLoading">Carregando anexos...</div>
            </div>
          </div>

          <!-- Related contracts (same client) -->
          ${related.length > 0 ? `
            <div class="contratos-related">
              <h3 style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;">
                <i data-lucide="link" style="width:14px;height:14px;"></i>
                Outros contratos — ${c.client} (R$ ${this._fmt(clientTotal)} total)
              </h3>
              <div class="contratos-related-list">
                ${related.map(r => `
                  <div class="contratos-related-item contratos-related-click" data-detail="${r.id}">
                    <span><strong>${r.name}</strong></span>
                    <span class="contratos-status-badge" style="background:${(statusColors[r.status] || '#94a3b8')}20;color:${statusColors[r.status] || '#94a3b8'};border:1px solid ${(statusColors[r.status] || '#94a3b8')}40;font-size:0.65rem;">${statusLabels[r.status] || r.status}</span>
                    <span style="font-weight:600;">R$ ${this._fmt(r.value)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div style="margin-top:20px;display:flex;gap:8px;">
            <button class="btn btn-primary contratos-edit-btn" data-edit="${c.id}">&#9998; Editar</button>
            <button class="btn btn-secondary contratos-delete-btn" data-delete="${c.id}">&#10005; Remover</button>
          </div>
        </section>
      </div>
      ${this._showModal ? this._renderModal() : ''}
    `;
  },

  // ── Seed from TBO_CONTRATOS_DATA ────────────────────────────────────────
  _seedFromData() {
    if (typeof TBO_CONTRATOS_DATA === 'undefined') return;
    const contracts = TBO_CONTRATOS_DATA.contratos.map(c => ({
      id: c.id,
      name: c.projeto,
      client: c.cliente,
      services: c.servicos || [],
      value: c.valorTotal || 0,
      startDate: '',
      endDate: '',
      status: c.status || 'finalizado',
      notes: '',
      qtdImagens: c.qtdImagens || 0,
      qtdPlantas: c.qtdPlantas || 0,
      arquivo: c.arquivo || '',
      createdAt: new Date().toISOString()
    }));
    this._saveContracts(contracts);
  },

  // ── Legacy seed from projects ──────────────────────────────────────────
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
        qtdImagens: 0,
        qtdPlantas: 0,
        arquivo: '',
        createdAt: now.toISOString()
      });
    });
    this._saveContracts(contracts);
  },

  _renderModal() {
    const c = this._editing || {};
    const isEdit = !!c.id;
    const allContracts = this._getContracts();
    const clients = [...new Set(allContracts.map(x => x.client))].filter(Boolean).sort();

    return `
      <div class="modal-overlay active contratos-modal-overlay">
        <div class="modal-card" style="max-width:560px;">
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
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
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
                <label class="form-label">Qtd. Imagens</label>
                <input class="form-input" id="contratoImgs" type="number" value="${c.qtdImagens || 0}" min="0">
              </div>
              <div class="form-group">
                <label class="form-label">Qtd. Plantas</label>
                <input class="form-input" id="contratoPlantas" type="number" value="${c.qtdPlantas || 0}" min="0">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Servicos (separados por virgula)</label>
              <input class="form-input" id="contratoServices" value="${(c.services || []).join(', ')}" placeholder="Render 3D, Branding, Marketing...">
            </div>
            <div class="form-group">
              <label class="form-label">Observacoes</label>
              <textarea class="form-input" id="contratoNotes" rows="3" placeholder="Notas sobre o contrato...">${c.notes || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Anexar Arquivos</label>
              ${this._isOnline() ? `
                <div class="contratos-dropzone" id="contratoDropzone">
                  <i data-lucide="upload-cloud" class="contratos-dropzone-icon"></i>
                  <div class="contratos-dropzone-text">Arraste arquivos aqui ou clique para selecionar</div>
                  <div class="contratos-dropzone-hint">PDF, DOC, XLS, PNG, JPG (max 10MB cada)</div>
                  <input type="file" id="contratoFileInput" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" style="display:none;">
                </div>
              ` : `
                <div style="padding:12px;background:var(--bg-elevated);border-radius:var(--radius-md,8px);font-size:0.78rem;color:var(--text-muted);">
                  Upload disponivel apenas quando online.
                </div>
              `}
              <div class="contratos-file-preview-list" id="contratoFilePreviewList">
                ${this._pendingFiles.map((f, i) => this._renderFilePreview(f, i)).join('')}
              </div>
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
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  init() {
    // Back button (detail view)
    const backBtn = document.querySelector('.contratos-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => { this._detailId = null; this._refresh(); });
    }

    // Related contracts click
    document.querySelectorAll('.contratos-related-click').forEach(el => {
      el.addEventListener('click', () => {
        this._detailId = el.dataset.detail;
        this._refresh();
      });
    });

    // Row click → detail
    document.querySelectorAll('.contratos-row-clickable').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.contratos-edit-btn') || e.target.closest('.contratos-delete-btn')) return;
        this._detailId = row.dataset.detail;
        this._refresh();
      });
    });

    // Client row click → filter by client
    document.querySelectorAll('.contratos-client-row').forEach(el => {
      el.addEventListener('click', () => {
        this._clientFilter = el.dataset.client;
        this._filter = 'all';
        this._refresh();
      });
    });

    // Filters
    document.querySelectorAll('.contratos-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._filter = btn.dataset.filter;
        this._refresh();
      });
    });

    // Client select
    const clientSelect = document.querySelector('.contratos-client-select');
    if (clientSelect) {
      clientSelect.addEventListener('change', () => {
        this._clientFilter = clientSelect.value;
        this._refresh();
      });
    }

    // Search
    const searchInput = document.querySelector('.contratos-search-input');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this._search = searchInput.value;
          this._refresh();
        }, 250);
      });
    }

    // Sort
    document.querySelectorAll('.contratos-sortable').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (this._sortBy === col) {
          this._sortDir = this._sortDir === 'desc' ? 'asc' : 'desc';
        } else {
          this._sortBy = col;
          this._sortDir = 'desc';
        }
        this._refresh();
      });
    });

    // Add
    const addBtn = document.querySelector('.contratos-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this._editing = null;
        this._pendingFiles = [];
        this._showModal = true;
        this._refresh();
      });
    }

    // Edit
    document.querySelectorAll('.contratos-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.edit;
        const contracts = this._getContracts();
        this._editing = contracts.find(c => c.id === id) || null;
        this._pendingFiles = [];
        this._showModal = true;
        this._refresh();
      });
    });

    // Delete
    document.querySelectorAll('.contratos-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.delete;
        if (confirm('Remover este contrato?')) {
          const contracts = this._getContracts().filter(c => c.id !== id);
          this._saveContracts(contracts);
          this._detailId = null;
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

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // ── Attachment: Dropzone in modal ─────────────────────────────────
    const dropzone = document.getElementById('contratoDropzone');
    const fileInput = document.getElementById('contratoFileInput');
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        this._addPendingFiles(e.dataTransfer.files);
      });
      fileInput.addEventListener('change', () => {
        this._addPendingFiles(fileInput.files);
        fileInput.value = '';
      });
    }

    // Remove pending file
    document.querySelectorAll('.contratos-file-preview-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        this._pendingFiles.splice(idx, 1);
        this._renderPendingFiles();
      });
    });

    // ── Attachment: Detail view ───────────────────────────────────────
    const attachSection = document.getElementById('contratosAttachmentSection');
    if (attachSection) {
      const contractId = attachSection.dataset.contract;
      this._loadAttachments(contractId);

      const attachBtn = document.querySelector('.contratos-attach-btn');
      const detailFileInput = document.getElementById('contratoDetailFileInput');
      if (attachBtn && detailFileInput) {
        attachBtn.addEventListener('click', () => detailFileInput.click());
        detailFileInput.addEventListener('change', () => {
          this._uploadDirectAttachments(contractId, detailFileInput.files);
          detailFileInput.value = '';
        });
      }
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
      notes: document.getElementById('contratoNotes')?.value || '',
      qtdImagens: parseInt(document.getElementById('contratoImgs')?.value) || 0,
      qtdPlantas: parseInt(document.getElementById('contratoPlantas')?.value) || 0
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

    // Upload pending files if any
    const contractId = this._editing?.id || contracts[contracts.length - 1]?.id;
    if (this._pendingFiles.length > 0 && contractId && this._isOnline()) {
      this._uploadPendingFiles(contractId);
    } else {
      this._pendingFiles = [];
    }

    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Contrato salvo', name);
    this._showModal = false;
    this._editing = null;
    this._refresh();
  },

  // ── Attachment helpers ──────────────────────────────────────────────

  _isOnline() {
    return typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.getClient() && TBO_SUPABASE.isOnline();
  },

  _renderFilePreview(file, index) {
    return `<div class="contratos-file-preview">
      <i data-lucide="${this._getFileIcon(file.name)}" class="contratos-file-preview-icon"></i>
      <span class="contratos-file-preview-name">${file.name}</span>
      <span class="contratos-file-preview-size">${this._formatFileSize(file.size)}</span>
      <button class="contratos-file-preview-remove" data-index="${index}" title="Remover">&times;</button>
    </div>`;
  },

  _addPendingFiles(fileList) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    for (const file of fileList) {
      if (file.size > maxSize) {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Arquivo grande', `${file.name} excede 10MB.`);
        continue;
      }
      this._pendingFiles.push(file);
    }
    this._renderPendingFiles();
  },

  _renderPendingFiles() {
    const list = document.getElementById('contratoFilePreviewList');
    if (!list) return;
    list.innerHTML = this._pendingFiles.map((f, i) => this._renderFilePreview(f, i)).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
    // Re-bind remove buttons
    list.querySelectorAll('.contratos-file-preview-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        this._pendingFiles.splice(parseInt(btn.dataset.index), 1);
        this._renderPendingFiles();
      });
    });
  },

  async _uploadPendingFiles(contractId) {
    if (!this._isOnline() || this._pendingFiles.length === 0) return;
    const bucket = TBO_SUPABASE._storageBucket;
    const client = TBO_SUPABASE.getClient();
    const userId = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser()?.id : 'unknown';
    const toUpload = [...this._pendingFiles];
    this._pendingFiles = [];

    for (const file of toUpload) {
      try {
        const ext = file.name.split('.').pop();
        const path = `${contractId}/${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
        await TBO_SUPABASE.uploadFile(bucket, path, file);

        // Save metadata
        await client.from('contract_attachments').insert({
          contract_id: contractId,
          file_name: file.name,
          file_path: path,
          file_size: file.size,
          mime_type: file.type || '',
          uploaded_by: userId
        });
      } catch (e) {
        console.warn('[Contratos] Upload failed:', file.name, e);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Upload falhou', file.name);
      }
    }
  },

  async _uploadDirectAttachments(contractId, fileList) {
    if (!this._isOnline() || fileList.length === 0) return;
    const bucket = TBO_SUPABASE._storageBucket;
    const client = TBO_SUPABASE.getClient();
    const userId = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser()?.id : 'unknown';
    const maxSize = 10 * 1024 * 1024;

    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Upload', `Enviando ${fileList.length} arquivo(s)...`);

    for (const file of fileList) {
      if (file.size > maxSize) {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Arquivo grande', `${file.name} excede 10MB.`);
        continue;
      }
      try {
        const ext = file.name.split('.').pop();
        const path = `${contractId}/${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
        await TBO_SUPABASE.uploadFile(bucket, path, file);
        await client.from('contract_attachments').insert({
          contract_id: contractId,
          file_name: file.name,
          file_path: path,
          file_size: file.size,
          mime_type: file.type || '',
          uploaded_by: userId
        });
      } catch (e) {
        console.warn('[Contratos] Direct upload failed:', file.name, e);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Upload falhou', file.name);
      }
    }

    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Upload concluido', 'Arquivos anexados.');
    this._loadAttachments(contractId);
  },

  async _loadAttachments(contractId) {
    const listEl = document.getElementById('contratosAttachmentList');
    const countEl = document.getElementById('attachmentCount');
    if (!listEl) return;

    if (!this._isOnline()) {
      listEl.innerHTML = '<div class="contratos-attachments-empty">Anexos disponiveis apenas online.</div>';
      return;
    }

    try {
      const client = TBO_SUPABASE.getClient();
      const { data, error } = await client
        .from('contract_attachments')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      this._attachmentsCache[contractId] = data || [];
      if (countEl) countEl.textContent = data?.length ? `(${data.length})` : '';
      this._renderAttachmentList(contractId);
    } catch (e) {
      console.warn('[Contratos] Load attachments error:', e);
      listEl.innerHTML = '<div class="contratos-attachments-empty">Erro ao carregar anexos.</div>';
    }
  },

  _renderAttachmentList(contractId) {
    const listEl = document.getElementById('contratosAttachmentList');
    if (!listEl) return;
    const attachments = this._attachmentsCache[contractId] || [];
    const bucket = TBO_SUPABASE._storageBucket;
    const currentUser = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const canDelete = currentUser?.role === 'founder' || currentUser?.role === 'project_owner';

    if (attachments.length === 0) {
      listEl.innerHTML = '<div class="contratos-attachments-empty">Nenhum anexo. Clique em "Anexar Arquivo" para adicionar.</div>';
      return;
    }

    listEl.innerHTML = attachments.map(att => {
      const url = TBO_SUPABASE.getPublicUrl(bucket, att.file_path);
      const icon = this._getFileIcon(att.file_name);
      const size = this._formatFileSize(att.file_size);
      const date = new Date(att.created_at).toLocaleDateString('pt-BR');
      return `<div class="contratos-attachment-item">
        <div class="contratos-attachment-icon"><i data-lucide="${icon}"></i></div>
        <div class="contratos-attachment-info">
          <div class="contratos-attachment-name">${TBO_FORMATTER.escapeHtml(att.file_name)}</div>
          <div class="contratos-attachment-meta">${size} &middot; ${date}${att.uploaded_by ? ` &middot; ${TBO_FORMATTER.escapeHtml(att.uploaded_by)}` : ''}</div>
        </div>
        <div class="contratos-attachment-actions">
          <a href="${url}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary">Baixar</a>
          ${canDelete ? `<button class="btn btn-sm btn-ghost contratos-delete-attachment" data-att-id="${att.id}" data-att-path="${att.file_path}" style="color:var(--color-danger,#ef4444);">Remover</button>` : ''}
        </div>
      </div>`;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Bind delete attachment buttons
    listEl.querySelectorAll('.contratos-delete-attachment').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Remover este anexo?')) {
          this._deleteAttachment(contractId, btn.dataset.attId, btn.dataset.attPath);
        }
      });
    });
  },

  async _deleteAttachment(contractId, attachmentId, filePath) {
    if (!this._isOnline()) return;
    try {
      const bucket = TBO_SUPABASE._storageBucket;
      await TBO_SUPABASE.deleteFile(bucket, filePath);
      await TBO_SUPABASE.getClient().from('contract_attachments').delete().eq('id', attachmentId);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Removido', 'Anexo removido.');
      this._loadAttachments(contractId);
    } catch (e) {
      console.warn('[Contratos] Delete attachment error:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Erro', 'Nao foi possivel remover o anexo.');
    }
  },

  _getFileIcon(fileName) {
    if (!fileName) return 'file';
    const ext = fileName.split('.').pop().toLowerCase();
    const map = {
      pdf: 'file-text', doc: 'file-text', docx: 'file-text',
      xls: 'file-spreadsheet', xlsx: 'file-spreadsheet',
      png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image',
      zip: 'file-archive', rar: 'file-archive'
    };
    return map[ext] || 'file';
  },

  _formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
  },

  _refresh() {
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
  }
};
