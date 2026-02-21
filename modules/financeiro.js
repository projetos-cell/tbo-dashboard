/**
 * TBO OS — Módulo Financeiro (v4 — Entrega 3: Caixa + Inbox + Cadastros)
 *
 * Dashboard financeiro integrado ao Supabase via FinanceRepo.
 * Tabs: Dashboard | A Pagar | A Receber | Caixa | Inbox | Cadastros
 *
 * Entrega 1: Dashboard com KPIs reais ✓
 * Entrega 2: CRUD completo A Pagar + A Receber + Drawer + Workflow + Folha PJ ✓
 * Entrega 3: Caixa (fluxo 30d), Inbox (pendências), Cadastros (CRUD) ✓
 *
 * Rota: #financeiro
 * Global: TBO_FINANCEIRO
 */
const TBO_FINANCEIRO = {

  // ── Estado interno ───────────────────────────────────────────────────
  _data: null,
  _activeTab: 'fn-dashboard',
  _refreshTimer: null,

  // Cache de lookups (fornecedores, clientes, centros de custo, projetos)
  _vendors: [],
  _clients: [],
  _costCenters: [],
  _projects: [],
  _categories: [],
  _lookupsLoaded: false,

  // Filtros ativos
  _pagarFilters: { status: '', cost_center_id: '', search: '' },
  _receberFilters: { status: '', client_id: '', search: '' },

  // Drawer state
  _drawerOpen: false,
  _drawerType: null,   // 'pagar' | 'receber'
  _drawerMode: null,   // 'view' | 'create' | 'edit'
  _drawerItem: null,

  // Cadastros state
  _cadastroSubTab: 'fornecedores',  // 'fornecedores' | 'clientes' | 'centros-custo'
  _cadastroSearch: '',

  // ═══════════════════════════════════════════════════════════════════════
  // FORMATTER HELPER
  // ═══════════════════════════════════════════════════════════════════════

  _fmt() {
    return typeof TBO_FORMATTER !== 'undefined'
      ? TBO_FORMATTER
      : { currency: v => `R$ ${(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` };
  },

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  render() {
    return `
      <div class="financeiro-module">
        <!-- Header -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">
              <i data-lucide="coins" style="width:22px;height:22px;margin-right:8px;vertical-align:middle;color:var(--accent);"></i>
              Financeiro
            </h2>
            <div style="display:flex;gap:8px;align-items:center;">
              <button class="btn btn-secondary btn-sm" id="fnRefreshBtn" title="Atualizar dados">
                <i data-lucide="refresh-cw" style="width:14px;height:14px;"></i>
                Atualizar
              </button>
            </div>
          </div>
        </section>

        <!-- Tabs -->
        <div class="tabs fn-tabs">
          <button class="tab active" data-tab="fn-dashboard">Dashboard</button>
          <button class="tab" data-tab="fn-pagar">A Pagar</button>
          <button class="tab" data-tab="fn-receber">A Receber</button>
          <button class="tab" data-tab="fn-caixa">Caixa</button>
          <button class="tab" data-tab="fn-inbox">Inbox</button>
          <button class="tab" data-tab="fn-cadastros">Cadastros</button>
        </div>

        <!-- ══════════ Tab: Dashboard ══════════ -->
        <div class="tab-panel" id="tab-fn-dashboard">
          <div id="fnDashboardContent">
            <div class="fn-loading">
              <div class="loading-spinner"></div>
              <p class="loading-text">Carregando dados financeiros...</p>
            </div>
          </div>
        </div>

        <!-- ══════════ Tab: A Pagar ══════════ -->
        <div class="tab-panel" id="tab-fn-pagar" style="display:none;">
          <div id="fnPagarContent">
            <div class="fn-loading">
              <div class="loading-spinner"></div>
              <p class="loading-text">Carregando contas a pagar...</p>
            </div>
          </div>
        </div>

        <!-- ══════════ Tab: A Receber ══════════ -->
        <div class="tab-panel" id="tab-fn-receber" style="display:none;">
          <div id="fnReceberContent">
            <div class="fn-loading">
              <div class="loading-spinner"></div>
              <p class="loading-text">Carregando contas a receber...</p>
            </div>
          </div>
        </div>

        <!-- ══════════ Tab: Caixa ══════════ -->
        <div class="tab-panel" id="tab-fn-caixa" style="display:none;">
          <div id="fnCaixaContent">
            <div class="fn-loading">
              <div class="loading-spinner"></div>
              <p class="loading-text">Carregando fluxo de caixa...</p>
            </div>
          </div>
        </div>

        <!-- ══════════ Tab: Inbox ══════════ -->
        <div class="tab-panel" id="tab-fn-inbox" style="display:none;">
          <div id="fnInboxContent">
            <div class="fn-loading">
              <div class="loading-spinner"></div>
              <p class="loading-text">Carregando pendências...</p>
            </div>
          </div>
        </div>

        <!-- ══════════ Tab: Cadastros ══════════ -->
        <div class="tab-panel" id="tab-fn-cadastros" style="display:none;">
          <div id="fnCadastrosContent"></div>
        </div>
      </div>

      <!-- Drawer Backdrop -->
      <div class="fn-drawer-backdrop" id="fnDrawerBackdrop"></div>
      <!-- Drawer Panel -->
      <div class="fn-drawer" id="fnDrawer">
        <div class="fn-drawer-header" id="fnDrawerHeader"></div>
        <div class="fn-drawer-body" id="fnDrawerBody"></div>
        <div class="fn-drawer-footer" id="fnDrawerFooter"></div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════════

  init() {
    // Tabs — agora com carregamento de dados ao trocar tab
    document.querySelectorAll('.fn-tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.fn-tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
        const panel = document.getElementById(`tab-${tab.dataset.tab}`);
        if (panel) panel.style.display = 'block';
        this._activeTab = tab.dataset.tab;
        if (typeof TBO_UX !== 'undefined') {
          TBO_UX.updateBreadcrumb('financeiro', tab.textContent.trim());
          TBO_UX.setTabHash('financeiro', tab.dataset.tab);
        }
        // Carregar dados da tab
        this._onTabChange(tab.dataset.tab);
      });
    });

    // Botão refresh
    const refreshBtn = document.getElementById('fnRefreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this._onRefresh());
    }

    // Drawer backdrop click
    const backdrop = document.getElementById('fnDrawerBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this._closeDrawer());
    }

    // Carregar dashboard
    this._loadDashboard();

    // Lucide icons
    if (window.lucide) lucide.createIcons();
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DESTROY
  // ═══════════════════════════════════════════════════════════════════════

  destroy() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
    // Destruir instancias Chart.js
    if (this._chartRecDes) { this._chartRecDes.destroy(); this._chartRecDes = null; }
    if (this._chartResultado) { this._chartResultado.destroy(); this._chartResultado = null; }
    if (this._chartDonut) { this._chartDonut.destroy(); this._chartDonut = null; }
    this._closeDrawer();
    this._data = null;
    this._dashData = null;
    this._lookupsLoaded = false;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TAB CHANGE + REFRESH
  // ═══════════════════════════════════════════════════════════════════════

  _onTabChange(tabId) {
    if (tabId === 'fn-dashboard') this._loadDashboard();
    else if (tabId === 'fn-pagar') this._loadPagar();
    else if (tabId === 'fn-receber') this._loadReceber();
    else if (tabId === 'fn-caixa') this._loadCaixa();
    else if (tabId === 'fn-inbox') this._loadInbox();
    else if (tabId === 'fn-cadastros') this._loadCadastros();
  },

  _onRefresh() {
    this._onTabChange(this._activeTab);
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LOOKUPS (carregamento único de fornecedores, CCs, projetos, etc.)
  // ═══════════════════════════════════════════════════════════════════════

  async _ensureLookups() {
    if (this._lookupsLoaded) return;
    if (typeof FinanceRepo === 'undefined') return;

    try {
      const [vendors, clients, costCenters, categories] = await Promise.all([
        FinanceRepo.listVendors({ limit: 500 }),
        FinanceRepo.listClients({ limit: 500 }),
        FinanceRepo.listCostCenters(),
        FinanceRepo.listCategories()
      ]);
      this._vendors = vendors || [];
      this._clients = clients || [];
      this._costCenters = costCenters || [];
      this._categories = categories || [];

      // Projetos — via ProjectsRepo se disponível
      if (typeof ProjectsRepo !== 'undefined') {
        const projs = await ProjectsRepo.list({ limit: 200 });
        this._projects = projs || [];
      }

      this._lookupsLoaded = true;
    } catch (err) {
      console.warn('[Financeiro] Erro ao carregar lookups:', err);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // STATUS MAPS
  // ═══════════════════════════════════════════════════════════════════════

  _statusPagar: {
    rascunho:              { label: 'Rascunho',     badge: 'badge--default', icon: 'file-edit' },
    aguardando_aprovacao:  { label: 'Aguardando',   badge: 'badge--warning', icon: 'clock' },
    aprovado:              { label: 'Aprovado',     badge: 'badge--blue',    icon: 'check' },
    aberto:                { label: 'Aberto',       badge: 'badge--gold',    icon: 'circle' },
    parcial:               { label: 'Parcial',      badge: 'badge--warning', icon: 'pie-chart' },
    pago:                  { label: 'Pago',         badge: 'badge--success', icon: 'check-circle' },
    atrasado:              { label: 'Atrasado',     badge: 'badge--danger',  icon: 'alert-circle' },
    cancelado:             { label: 'Cancelado',    badge: 'badge--default', icon: 'x-circle' }
  },

  _statusReceber: {
    previsto:   { label: 'Previsto',   badge: 'badge--default', icon: 'calendar' },
    emitido:    { label: 'Emitido',    badge: 'badge--blue',    icon: 'send' },
    aberto:     { label: 'Aberto',     badge: 'badge--gold',    icon: 'circle' },
    parcial:    { label: 'Parcial',    badge: 'badge--warning', icon: 'pie-chart' },
    pago:       { label: 'Pago',       badge: 'badge--success', icon: 'check-circle' },
    atrasado:   { label: 'Atrasado',   badge: 'badge--danger',  icon: 'alert-circle' },
    cancelado:  { label: 'Cancelado',  badge: 'badge--default', icon: 'x-circle' }
  },

  _renderStatusBadge(status, map) {
    const s = map[status] || { label: status, badge: 'badge--default' };
    return `<span class="badge ${s.badge}">${this._esc(s.label)}</span>`;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // A PAGAR — TAB
  // ═══════════════════════════════════════════════════════════════════════

  async _loadPagar() {
    const container = document.getElementById('fnPagarContent');
    if (!container) return;

    container.innerHTML = '<div class="fn-loading"><div class="loading-spinner"></div><p class="loading-text">Carregando contas a pagar...</p></div>';

    try {
      if (typeof FinanceRepo === 'undefined') throw new Error('FinanceRepo não está disponível');
      await this._ensureLookups();

      const filters = this._pagarFilters;
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.cost_center_id) params.cost_center_id = filters.cost_center_id;
      if (filters.search) params.search = filters.search;

      const items = await FinanceRepo.listPayables(params);
      this._renderPagarTab(container, items);
    } catch (err) {
      console.error('[Financeiro] Erro ao carregar A Pagar:', err);
      container.innerHTML = this._renderError(err.message);
    }
  },

  _renderPagarTab(container, items) {
    const fmt = this._fmt();
    let html = '';

    // ── Barra de filtros + ações ──────────────────────────────────────
    html += `<div class="fn-filter-bar">
      <div class="fn-filter-group">
        <select class="form-input fn-filter-select" id="fnPagarStatusFilter">
          <option value="">Todos status</option>
          ${Object.entries(this._statusPagar).filter(([k]) => k !== 'cancelado').map(([k, v]) =>
            `<option value="${k}" ${this._pagarFilters.status === k ? 'selected' : ''}>${v.label}</option>`
          ).join('')}
        </select>
        <select class="form-input fn-filter-select" id="fnPagarCCFilter">
          <option value="">Todos centros de custo</option>
          ${this._costCenters.map(cc =>
            `<option value="${cc.id}" ${this._pagarFilters.cost_center_id === cc.id ? 'selected' : ''}>${this._esc(cc.name)}</option>`
          ).join('')}
        </select>
        <input type="text" class="form-input fn-filter-search" id="fnPagarSearch"
               placeholder="Buscar descrição..." value="${this._esc(this._pagarFilters.search)}">
      </div>
      <div class="fn-filter-actions">
        <button class="btn btn-secondary btn-sm" id="fnPagarGerarPJ" title="Gerar Folha PJ do mês">
          <i data-lucide="users" style="width:14px;height:14px;"></i>
          Gerar Folha PJ
        </button>
        <button class="btn btn-primary btn-sm" id="fnPagarNew">
          <i data-lucide="plus" style="width:14px;height:14px;"></i>
          Nova Conta
        </button>
      </div>
    </div>`;

    // ── Tabela ────────────────────────────────────────────────────────
    if (!items || items.length === 0) {
      html += '<div class="fn-empty-chart" style="min-height:200px;"><span>Nenhuma conta a pagar encontrada</span></div>';
    } else {
      html += `<div class="card" style="overflow:hidden;">
        <div style="overflow-x:auto;">
          <table class="data-table fn-table">
            <thead><tr>
              <th>Descrição</th>
              <th>Fornecedor</th>
              <th>Centro Custo</th>
              <th>Projeto</th>
              <th style="text-align:right;">Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th style="width:40px;"></th>
            </tr></thead>
            <tbody>
              ${items.map(item => this._renderPagarRow(item, fmt)).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

      // Resumo
      const totalAberto = items.filter(i => !['pago', 'cancelado'].includes(i.status))
        .reduce((s, i) => s + ((i.amount || 0) - (i.amount_paid || 0)), 0);
      const totalPago = items.filter(i => i.status === 'pago')
        .reduce((s, i) => s + (i.amount || 0), 0);
      html += `<div class="fn-table-summary">
        <span>Total em aberto: <strong style="color:var(--color-danger);">${fmt.currency(totalAberto)}</strong></span>
        <span>Total pago: <strong style="color:var(--color-success);">${fmt.currency(totalPago)}</strong></span>
        <span class="fn-table-count">${items.length} registro${items.length !== 1 ? 's' : ''}</span>
      </div>`;
    }

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    this._bindPagarEvents(container);
  },

  _renderPagarRow(item, fmt) {
    const vendorName = item.vendor?.name || '—';
    const ccName = item.cost_center?.name || '—';
    const projName = item.project?.name || '—';
    const dueDate = item.due_date ? new Date(item.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
    const remaining = (item.amount || 0) - (item.amount_paid || 0);
    const isOverdue = item.due_date && new Date(item.due_date) < new Date() && !['pago', 'cancelado'].includes(item.status);

    const omieBadge = item.omie_id ? ' <span class="fn-badge fn-badge--omie" title="Importado do Omie"><i data-lucide="cloud" style="width:10px;height:10px;"></i> Omie</span>' : '';

    return `<tr class="fn-row ${isOverdue ? 'fn-row--overdue' : ''}" data-id="${item.id}" data-type="pagar">
      <td style="max-width:240px;">
        <div class="fn-cell-desc">${this._esc(item.description || 'Sem descrição')}${omieBadge}</div>
        ${item.notes ? `<div class="fn-cell-note">${this._esc(item.notes).substring(0, 60)}</div>` : ''}
      </td>
      <td>${this._esc(vendorName)}</td>
      <td><span class="fn-cell-cc">${this._esc(ccName)}</span></td>
      <td>${this._esc(projName)}</td>
      <td style="text-align:right;white-space:nowrap;">
        <div class="fn-cell-amount">${fmt.currency(item.amount || 0)}</div>
        ${item.amount_paid > 0 ? `<div class="fn-cell-paid">Pago: ${fmt.currency(item.amount_paid)}</div>` : ''}
      </td>
      <td style="white-space:nowrap;" class="${isOverdue ? 'fn-cell-overdue' : ''}">${dueDate}</td>
      <td>${this._renderStatusBadge(item.status, this._statusPagar)}</td>
      <td>
        <button class="btn btn-ghost btn-sm fn-row-action" data-id="${item.id}" data-type="pagar" title="Detalhes">
          <i data-lucide="chevron-right" style="width:14px;height:14px;"></i>
        </button>
      </td>
    </tr>`;
  },

  _bindPagarEvents(container) {
    // Filtros
    const statusSel = container.querySelector('#fnPagarStatusFilter');
    const ccSel = container.querySelector('#fnPagarCCFilter');
    const searchInput = container.querySelector('#fnPagarSearch');

    if (statusSel) statusSel.addEventListener('change', () => { this._pagarFilters.status = statusSel.value; this._loadPagar(); });
    if (ccSel) ccSel.addEventListener('change', () => { this._pagarFilters.cost_center_id = ccSel.value; this._loadPagar(); });
    if (searchInput) {
      let _debounce = null;
      searchInput.addEventListener('input', () => {
        clearTimeout(_debounce);
        _debounce = setTimeout(() => { this._pagarFilters.search = searchInput.value; this._loadPagar(); }, 400);
      });
    }

    // Nova conta
    const newBtn = container.querySelector('#fnPagarNew');
    if (newBtn) newBtn.addEventListener('click', () => this._openDrawer('pagar', 'create', null));

    // Gerar Folha PJ
    const pjBtn = container.querySelector('#fnPagarGerarPJ');
    if (pjBtn) pjBtn.addEventListener('click', () => this._gerarFolhaPJ());

    // Click nas linhas
    container.querySelectorAll('.fn-row[data-type="pagar"]').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.fn-row-action')) return;
        this._openDrawer('pagar', 'view', row.dataset.id);
      });
    });
    container.querySelectorAll('.fn-row-action[data-type="pagar"]').forEach(btn => {
      btn.addEventListener('click', () => this._openDrawer('pagar', 'view', btn.dataset.id));
    });
  },

  // ═══════════════════════════════════════════════════════════════════════
  // A RECEBER — TAB
  // ═══════════════════════════════════════════════════════════════════════

  async _loadReceber() {
    const container = document.getElementById('fnReceberContent');
    if (!container) return;

    container.innerHTML = '<div class="fn-loading"><div class="loading-spinner"></div><p class="loading-text">Carregando contas a receber...</p></div>';

    try {
      if (typeof FinanceRepo === 'undefined') throw new Error('FinanceRepo não está disponível');
      await this._ensureLookups();

      const filters = this._receberFilters;
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.client_id) params.client_id = filters.client_id;
      if (filters.search) params.search = filters.search;

      const items = await FinanceRepo.listReceivables(params);
      this._renderReceberTab(container, items);
    } catch (err) {
      console.error('[Financeiro] Erro ao carregar A Receber:', err);
      container.innerHTML = this._renderError(err.message);
    }
  },

  _renderReceberTab(container, items) {
    const fmt = this._fmt();
    let html = '';

    // ── Barra de filtros + ações ──────────────────────────────────────
    html += `<div class="fn-filter-bar">
      <div class="fn-filter-group">
        <select class="form-input fn-filter-select" id="fnReceberStatusFilter">
          <option value="">Todos status</option>
          ${Object.entries(this._statusReceber).filter(([k]) => k !== 'cancelado').map(([k, v]) =>
            `<option value="${k}" ${this._receberFilters.status === k ? 'selected' : ''}>${v.label}</option>`
          ).join('')}
        </select>
        <select class="form-input fn-filter-select" id="fnReceberClientFilter">
          <option value="">Todos clientes</option>
          ${this._clients.map(c =>
            `<option value="${c.id}" ${this._receberFilters.client_id === c.id ? 'selected' : ''}>${this._esc(c.name)}</option>`
          ).join('')}
        </select>
        <input type="text" class="form-input fn-filter-search" id="fnReceberSearch"
               placeholder="Buscar descrição..." value="${this._esc(this._receberFilters.search)}">
      </div>
      <div class="fn-filter-actions">
        <button class="btn btn-primary btn-sm" id="fnReceberNew">
          <i data-lucide="plus" style="width:14px;height:14px;"></i>
          Novo Recebível
        </button>
      </div>
    </div>`;

    // ── Tabela ────────────────────────────────────────────────────────
    if (!items || items.length === 0) {
      html += '<div class="fn-empty-chart" style="min-height:200px;"><span>Nenhuma conta a receber encontrada</span></div>';
    } else {
      html += `<div class="card" style="overflow:hidden;">
        <div style="overflow-x:auto;">
          <table class="data-table fn-table">
            <thead><tr>
              <th>Descrição</th>
              <th>Cliente</th>
              <th>Projeto</th>
              <th style="text-align:right;">Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th style="width:40px;"></th>
            </tr></thead>
            <tbody>
              ${items.map(item => this._renderReceberRow(item, fmt)).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

      const totalAberto = items.filter(i => !['pago', 'cancelado'].includes(i.status))
        .reduce((s, i) => s + ((i.amount || 0) - (i.amount_paid || 0)), 0);
      const totalPago = items.filter(i => i.status === 'pago')
        .reduce((s, i) => s + (i.amount || 0), 0);
      html += `<div class="fn-table-summary">
        <span>Total a receber: <strong style="color:var(--color-success);">${fmt.currency(totalAberto)}</strong></span>
        <span>Total recebido: <strong style="color:var(--accent);">${fmt.currency(totalPago)}</strong></span>
        <span class="fn-table-count">${items.length} registro${items.length !== 1 ? 's' : ''}</span>
      </div>`;
    }

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    this._bindReceberEvents(container);
  },

  _renderReceberRow(item, fmt) {
    const clientName = item.client?.name || '—';
    const projName = item.project?.name || '—';
    const dueDate = item.due_date ? new Date(item.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
    const isOverdue = item.due_date && new Date(item.due_date) < new Date() && !['pago', 'cancelado'].includes(item.status);
    const omieBadge = item.omie_id ? ' <span class="fn-badge fn-badge--omie" title="Importado do Omie"><i data-lucide="cloud" style="width:10px;height:10px;"></i> Omie</span>' : '';

    return `<tr class="fn-row ${isOverdue ? 'fn-row--overdue' : ''}" data-id="${item.id}" data-type="receber">
      <td style="max-width:250px;">
        <div class="fn-cell-desc">${this._esc(item.description || 'Sem descrição')}${omieBadge}</div>
        ${item.notes ? `<div class="fn-cell-note">${this._esc(item.notes).substring(0, 60)}</div>` : ''}
      </td>
      <td>${this._esc(clientName)}</td>
      <td>${this._esc(projName)}</td>
      <td style="text-align:right;white-space:nowrap;">
        <div class="fn-cell-amount">${fmt.currency(item.amount || 0)}</div>
        ${item.amount_paid > 0 ? `<div class="fn-cell-paid">Recebido: ${fmt.currency(item.amount_paid)}</div>` : ''}
      </td>
      <td style="white-space:nowrap;" class="${isOverdue ? 'fn-cell-overdue' : ''}">${dueDate}</td>
      <td>${this._renderStatusBadge(item.status, this._statusReceber)}</td>
      <td>
        <button class="btn btn-ghost btn-sm fn-row-action" data-id="${item.id}" data-type="receber" title="Detalhes">
          <i data-lucide="chevron-right" style="width:14px;height:14px;"></i>
        </button>
      </td>
    </tr>`;
  },

  _bindReceberEvents(container) {
    const statusSel = container.querySelector('#fnReceberStatusFilter');
    const clientSel = container.querySelector('#fnReceberClientFilter');
    const searchInput = container.querySelector('#fnReceberSearch');

    if (statusSel) statusSel.addEventListener('change', () => { this._receberFilters.status = statusSel.value; this._loadReceber(); });
    if (clientSel) clientSel.addEventListener('change', () => { this._receberFilters.client_id = clientSel.value; this._loadReceber(); });
    if (searchInput) {
      let _debounce = null;
      searchInput.addEventListener('input', () => {
        clearTimeout(_debounce);
        _debounce = setTimeout(() => { this._receberFilters.search = searchInput.value; this._loadReceber(); }, 400);
      });
    }

    const newBtn = container.querySelector('#fnReceberNew');
    if (newBtn) newBtn.addEventListener('click', () => this._openDrawer('receber', 'create', null));

    container.querySelectorAll('.fn-row[data-type="receber"]').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.fn-row-action')) return;
        this._openDrawer('receber', 'view', row.dataset.id);
      });
    });
    container.querySelectorAll('.fn-row-action[data-type="receber"]').forEach(btn => {
      btn.addEventListener('click', () => this._openDrawer('receber', 'view', btn.dataset.id));
    });
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DRAWER — Painel lateral (detalhes / criar / editar)
  // ═══════════════════════════════════════════════════════════════════════

  async _openDrawer(type, mode, id) {
    this._drawerType = type;
    this._drawerMode = mode;
    this._drawerItem = null;

    const drawer = document.getElementById('fnDrawer');
    const backdrop = document.getElementById('fnDrawerBackdrop');
    if (!drawer || !backdrop) return;

    // Mostrar drawer com loading
    drawer.classList.add('fn-drawer--open');
    backdrop.classList.add('fn-drawer-backdrop--open');
    this._drawerOpen = true;

    const header = document.getElementById('fnDrawerHeader');
    const body = document.getElementById('fnDrawerBody');
    const footer = document.getElementById('fnDrawerFooter');

    if (mode === 'create') {
      header.innerHTML = `
        <div class="fn-drawer-title">
          <i data-lucide="plus-circle" style="width:18px;height:18px;"></i>
          ${type === 'pagar' ? 'Nova Conta a Pagar' : 'Novo Recebível'}
        </div>
        <button class="btn btn-ghost btn-sm fn-drawer-close" id="fnDrawerClose">
          <i data-lucide="x" style="width:16px;height:16px;"></i>
        </button>`;
      body.innerHTML = this._renderDrawerForm(type, null);
      footer.innerHTML = `
        <button class="btn btn-secondary" id="fnDrawerCancel">Cancelar</button>
        <button class="btn btn-primary" id="fnDrawerSave">
          <i data-lucide="save" style="width:14px;height:14px;"></i> Salvar
        </button>`;
      if (window.lucide) lucide.createIcons();
      this._bindDrawerFormEvents(type, 'create');
    } else {
      // View/Edit — carregar dados
      body.innerHTML = '<div class="fn-loading" style="min-height:200px;"><div class="loading-spinner"></div></div>';
      header.innerHTML = '';
      footer.innerHTML = '';

      try {
        const item = type === 'pagar'
          ? await FinanceRepo.getPayable(id)
          : await FinanceRepo.getReceivable(id);

        this._drawerItem = item;
        this._renderDrawerView(type, item);
      } catch (err) {
        body.innerHTML = `<div class="fn-error"><p>${this._esc(err.message)}</p></div>`;
      }
    }

    // Bind close
    document.getElementById('fnDrawerClose')?.addEventListener('click', () => this._closeDrawer());
    // ESC key
    this._drawerEscHandler = (e) => { if (e.key === 'Escape') this._closeDrawer(); };
    document.addEventListener('keydown', this._drawerEscHandler);
  },

  _closeDrawer() {
    const drawer = document.getElementById('fnDrawer');
    const backdrop = document.getElementById('fnDrawerBackdrop');
    if (drawer) drawer.classList.remove('fn-drawer--open');
    if (backdrop) backdrop.classList.remove('fn-drawer-backdrop--open');
    this._drawerOpen = false;
    this._drawerItem = null;
    if (this._drawerEscHandler) {
      document.removeEventListener('keydown', this._drawerEscHandler);
      this._drawerEscHandler = null;
    }
  },

  // ── Drawer: View Mode ──────────────────────────────────────────────

  _renderDrawerView(type, item) {
    const header = document.getElementById('fnDrawerHeader');
    const body = document.getElementById('fnDrawerBody');
    const footer = document.getElementById('fnDrawerFooter');
    const fmt = this._fmt();
    const statusMap = type === 'pagar' ? this._statusPagar : this._statusReceber;
    const isOverdue = item.due_date && new Date(item.due_date) < new Date() && !['pago', 'cancelado'].includes(item.status);

    header.innerHTML = `
      <div class="fn-drawer-title">
        ${this._renderStatusBadge(item.status, statusMap)}
        <span style="margin-left:8px;">${type === 'pagar' ? 'Conta a Pagar' : 'Recebível'}</span>
      </div>
      <button class="btn btn-ghost btn-sm fn-drawer-close" id="fnDrawerClose">
        <i data-lucide="x" style="width:16px;height:16px;"></i>
      </button>`;

    const remaining = (item.amount || 0) - (item.amount_paid || 0);

    let bodyHtml = `
      <div class="fn-drawer-section">
        <div class="fn-drawer-field">
          <label class="fn-drawer-label">Descrição</label>
          <div class="fn-drawer-value">${this._esc(item.description || '—')}</div>
        </div>
        ${item.notes ? `<div class="fn-drawer-field">
          <label class="fn-drawer-label">Observações</label>
          <div class="fn-drawer-value fn-drawer-note">${this._esc(item.notes)}</div>
        </div>` : ''}
      </div>

      <div class="fn-drawer-section fn-drawer-grid">
        <div class="fn-drawer-field">
          <label class="fn-drawer-label">Valor Total</label>
          <div class="fn-drawer-value fn-drawer-amount">${fmt.currency(item.amount || 0)}</div>
        </div>
        <div class="fn-drawer-field">
          <label class="fn-drawer-label">${type === 'pagar' ? 'Valor Pago' : 'Valor Recebido'}</label>
          <div class="fn-drawer-value">${fmt.currency(item.amount_paid || 0)}</div>
        </div>
        <div class="fn-drawer-field">
          <label class="fn-drawer-label">Restante</label>
          <div class="fn-drawer-value" style="color:${remaining > 0 ? 'var(--color-danger)' : 'var(--color-success)'};">${fmt.currency(remaining)}</div>
        </div>
        <div class="fn-drawer-field">
          <label class="fn-drawer-label">Vencimento</label>
          <div class="fn-drawer-value ${isOverdue ? 'fn-cell-overdue' : ''}">${item.due_date ? new Date(item.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</div>
        </div>
      </div>

      <div class="fn-drawer-section fn-drawer-grid">`;

    if (type === 'pagar') {
      bodyHtml += `
        <div class="fn-drawer-field">
          <label class="fn-drawer-label">Fornecedor</label>
          <div class="fn-drawer-value">${this._esc(item.vendor?.name || '—')}</div>
        </div>
        <div class="fn-drawer-field">
          <label class="fn-drawer-label">Centro de Custo</label>
          <div class="fn-drawer-value">${this._esc(item.cost_center?.name || '—')}</div>
        </div>
        <div class="fn-drawer-field">
          <label class="fn-drawer-label">Projeto</label>
          <div class="fn-drawer-value">${this._esc(item.project?.name || '—')}</div>
        </div>
        <div class="fn-drawer-field">
          <label class="fn-drawer-label">Categoria</label>
          <div class="fn-drawer-value">${this._esc(item.category?.name || '—')}</div>
        </div>`;
    } else {
      bodyHtml += `
        <div class="fn-drawer-field">
          <label class="fn-drawer-label">Cliente</label>
          <div class="fn-drawer-value">${this._esc(item.client?.name || '—')}</div>
        </div>
        <div class="fn-drawer-field">
          <label class="fn-drawer-label">Projeto</label>
          <div class="fn-drawer-value">${this._esc(item.project?.name || '—')}</div>
        </div>`;
    }

    bodyHtml += '</div>';

    // ── Timeline simplificada ────────────────────────────────────────
    bodyHtml += `<div class="fn-drawer-section">
      <label class="fn-drawer-label" style="margin-bottom:8px;">Histórico</label>
      <div class="fn-timeline">`;

    if (item.created_at) {
      bodyHtml += `<div class="fn-timeline-item">
        <div class="fn-timeline-dot"></div>
        <div class="fn-timeline-content">
          <span>Criado</span>
          <span class="fn-timeline-date">${new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>`;
    }
    if (item.approved_at) {
      bodyHtml += `<div class="fn-timeline-item">
        <div class="fn-timeline-dot fn-timeline-dot--success"></div>
        <div class="fn-timeline-content">
          <span>Aprovado</span>
          <span class="fn-timeline-date">${new Date(item.approved_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>`;
    }
    if (item.paid_at) {
      bodyHtml += `<div class="fn-timeline-item">
        <div class="fn-timeline-dot fn-timeline-dot--success"></div>
        <div class="fn-timeline-content">
          <span>Pago</span>
          <span class="fn-timeline-date">${new Date(item.paid_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>`;
    }
    if (item.updated_at && item.updated_at !== item.created_at) {
      bodyHtml += `<div class="fn-timeline-item">
        <div class="fn-timeline-dot fn-timeline-dot--muted"></div>
        <div class="fn-timeline-content">
          <span>Atualizado</span>
          <span class="fn-timeline-date">${new Date(item.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>`;
    }

    bodyHtml += '</div></div>';

    body.innerHTML = bodyHtml;

    // ── Footer: Ações de workflow ────────────────────────────────────
    footer.innerHTML = this._renderDrawerActions(type, item);

    if (window.lucide) lucide.createIcons();
    document.getElementById('fnDrawerClose')?.addEventListener('click', () => this._closeDrawer());
    this._bindDrawerActionEvents(type, item);
  },

  // ── Drawer: Ações de workflow ──────────────────────────────────────

  _renderDrawerActions(type, item) {
    const actions = [];

    if (type === 'pagar') {
      const s = item.status;
      if (s === 'rascunho') {
        actions.push(`<button class="btn btn-primary btn-sm" data-action="enviar_aprovacao"><i data-lucide="send" style="width:13px;height:13px;"></i> Enviar p/ Aprovação</button>`);
        actions.push(`<button class="btn btn-secondary btn-sm" data-action="edit"><i data-lucide="edit-3" style="width:13px;height:13px;"></i> Editar</button>`);
      }
      if (s === 'aguardando_aprovacao') {
        actions.push(`<button class="btn btn-primary btn-sm" data-action="aprovar"><i data-lucide="check" style="width:13px;height:13px;"></i> Aprovar</button>`);
        actions.push(`<button class="btn btn-secondary btn-sm" data-action="devolver"><i data-lucide="undo-2" style="width:13px;height:13px;"></i> Devolver</button>`);
      }
      if (['aprovado', 'aberto', 'parcial'].includes(s)) {
        actions.push(`<button class="btn btn-primary btn-sm" data-action="pagar"><i data-lucide="banknote" style="width:13px;height:13px;"></i> Registrar Pagamento</button>`);
      }
      if (!['pago', 'cancelado'].includes(s)) {
        actions.push(`<button class="btn btn-danger btn-sm" data-action="cancelar" style="margin-left:auto;"><i data-lucide="x-circle" style="width:13px;height:13px;"></i> Cancelar</button>`);
      }
    } else {
      const s = item.status;
      if (s === 'previsto') {
        actions.push(`<button class="btn btn-primary btn-sm" data-action="emitir"><i data-lucide="send" style="width:13px;height:13px;"></i> Marcar como Emitido</button>`);
        actions.push(`<button class="btn btn-secondary btn-sm" data-action="edit"><i data-lucide="edit-3" style="width:13px;height:13px;"></i> Editar</button>`);
      }
      if (['emitido', 'aberto', 'parcial'].includes(s)) {
        actions.push(`<button class="btn btn-primary btn-sm" data-action="receber"><i data-lucide="banknote" style="width:13px;height:13px;"></i> Registrar Recebimento</button>`);
      }
      if (!['pago', 'cancelado'].includes(s)) {
        actions.push(`<button class="btn btn-danger btn-sm" data-action="cancelar" style="margin-left:auto;"><i data-lucide="x-circle" style="width:13px;height:13px;"></i> Cancelar</button>`);
      }
    }

    if (actions.length === 0) return '';
    return `<div class="fn-drawer-actions">${actions.join('')}</div>`;
  },

  _bindDrawerActionEvents(type, item) {
    const footer = document.getElementById('fnDrawerFooter');
    if (!footer) return;

    footer.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.action;
        await this._executeAction(type, item, action);
      });
    });
  },

  async _executeAction(type, item, action) {
    try {
      if (type === 'pagar') {
        switch (action) {
          case 'enviar_aprovacao':
            await FinanceRepo.updatePayable(item.id, { status: 'aguardando_aprovacao' });
            this._toast('success', 'Enviado para aprovação');
            break;
          case 'aprovar':
            await FinanceRepo.updatePayable(item.id, { status: 'aprovado', approved_at: new Date().toISOString() });
            this._toast('success', 'Conta aprovada');
            break;
          case 'devolver':
            await FinanceRepo.updatePayable(item.id, { status: 'rascunho' });
            this._toast('info', 'Devolvido para rascunho');
            break;
          case 'pagar':
            await this._openPaymentPrompt(type, item);
            return; // Não fechar drawer
          case 'cancelar':
            if (item.omie_id) {
              this._toast('warning', 'Este registro vem do Omie. Para remove-lo, exclua no Omie e sincronize novamente.');
              return;
            }
            await FinanceRepo.deletePayable(item.id);
            this._toast('warning', 'Conta cancelada');
            break;
          case 'edit':
            this._switchToEditMode(type, item);
            return;
        }
      } else {
        switch (action) {
          case 'emitir':
            await FinanceRepo.updateReceivable(item.id, { status: 'emitido' });
            this._toast('success', 'Marcado como emitido');
            break;
          case 'receber':
            await this._openPaymentPrompt(type, item);
            return;
          case 'cancelar':
            if (item.omie_id) {
              this._toast('warning', 'Este registro vem do Omie. Para remove-lo, exclua no Omie e sincronize novamente.');
              return;
            }
            await FinanceRepo.deleteReceivable(item.id);
            this._toast('warning', 'Recebível cancelado');
            break;
          case 'edit':
            this._switchToEditMode(type, item);
            return;
        }
      }

      this._closeDrawer();
      if (type === 'pagar') this._loadPagar();
      else this._loadReceber();
    } catch (err) {
      console.error('[Financeiro] Erro na ação:', err);
      this._toast('error', err.message);
    }
  },

  // ── Prompt de pagamento inline no drawer ──────────────────────────

  async _openPaymentPrompt(type, item) {
    const body = document.getElementById('fnDrawerBody');
    if (!body) return;
    const fmt = this._fmt();
    const remaining = (item.amount || 0) - (item.amount_paid || 0);
    const label = type === 'pagar' ? 'Pagamento' : 'Recebimento';

    // Inserir form de pagamento no final do body
    let payForm = body.querySelector('#fnPaymentForm');
    if (payForm) payForm.remove();

    const formHtml = `<div id="fnPaymentForm" class="fn-drawer-section fn-payment-form">
      <label class="fn-drawer-label" style="margin-bottom:8px;color:var(--accent);">Registrar ${label}</label>
      <div class="fn-drawer-grid">
        <div class="form-group" style="margin-bottom:8px;">
          <label class="form-label">Valor (restante: ${fmt.currency(remaining)})</label>
          <input type="number" class="form-input" id="fnPayAmount" value="${remaining.toFixed(2)}" step="0.01" min="0.01">
        </div>
        <div class="form-group" style="margin-bottom:8px;">
          <label class="form-label">Data</label>
          <input type="date" class="form-input" id="fnPayDate" value="${new Date().toISOString().split('T')[0]}">
        </div>
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <label class="form-label">Método</label>
        <select class="form-input" id="fnPayMethod">
          <option value="pix">PIX</option>
          <option value="boleto">Boleto</option>
          <option value="transferencia">Transferência</option>
          <option value="cartao">Cartão</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="outro">Outro</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button class="btn btn-secondary btn-sm" id="fnPayCancel">Cancelar</button>
        <button class="btn btn-primary btn-sm" id="fnPayConfirm">
          <i data-lucide="check" style="width:13px;height:13px;"></i> Confirmar ${label}
        </button>
      </div>
    </div>`;

    body.insertAdjacentHTML('beforeend', formHtml);
    if (window.lucide) lucide.createIcons();

    // Scroll ao form
    body.querySelector('#fnPaymentForm')?.scrollIntoView({ behavior: 'smooth' });

    // Bind
    document.getElementById('fnPayCancel')?.addEventListener('click', () => {
      document.getElementById('fnPaymentForm')?.remove();
    });

    document.getElementById('fnPayConfirm')?.addEventListener('click', async () => {
      const payAmount = parseFloat(document.getElementById('fnPayAmount')?.value);
      if (isNaN(payAmount) || payAmount <= 0) {
        this._toast('warning', 'Informe um valor válido.');
        return;
      }

      const newAmountPaid = (item.amount_paid || 0) + payAmount;
      const newStatus = newAmountPaid >= item.amount ? 'pago' : 'parcial';

      try {
        if (type === 'pagar') {
          await FinanceRepo.updatePayable(item.id, {
            amount_paid: newAmountPaid,
            status: newStatus,
            payment_method: document.getElementById('fnPayMethod')?.value,
            paid_at: document.getElementById('fnPayDate')?.value
          });
        } else {
          await FinanceRepo.updateReceivable(item.id, {
            amount_paid: newAmountPaid,
            status: newStatus,
            paid_at: document.getElementById('fnPayDate')?.value
          });
        }
        this._toast('success', `${label} registrado com sucesso!`);
        this._closeDrawer();
        if (type === 'pagar') this._loadPagar();
        else this._loadReceber();
      } catch (err) {
        this._toast('error', err.message);
      }
    });
  },

  // ── Drawer: Form Mode (criar/editar) ──────────────────────────────

  _renderDrawerForm(type, item) {
    const isEdit = !!item;
    const val = (field) => item ? (item[field] || '') : '';

    if (type === 'pagar') {
      return `<div class="fn-drawer-form">
        <div class="form-group">
          <label class="form-label">Descrição <span class="required">*</span></label>
          <input type="text" class="form-input" id="fnFormDesc" value="${this._esc(val('description'))}" placeholder="Ex: Aluguel escritório jan/2026">
        </div>
        <div class="fn-drawer-grid">
          <div class="form-group">
            <label class="form-label">Valor (R$) <span class="required">*</span></label>
            <input type="number" class="form-input" id="fnFormAmount" value="${val('amount') || ''}" step="0.01" min="0.01" placeholder="0.00">
          </div>
          <div class="form-group">
            <label class="form-label">Vencimento <span class="required">*</span></label>
            <input type="date" class="form-input" id="fnFormDueDate" value="${val('due_date') || ''}">
          </div>
        </div>
        <div class="fn-drawer-grid">
          <div class="form-group">
            <label class="form-label">Fornecedor</label>
            <select class="form-input" id="fnFormVendor">
              <option value="">Selecione...</option>
              ${this._vendors.map(v => `<option value="${v.id}" ${val('vendor_id') === v.id ? 'selected' : ''}>${this._esc(v.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Centro de Custo</label>
            <select class="form-input" id="fnFormCC">
              <option value="">Selecione...</option>
              ${this._costCenters.map(cc => `<option value="${cc.id}" ${val('cost_center_id') === cc.id ? 'selected' : ''}>${this._esc(cc.name)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="fn-drawer-grid">
          <div class="form-group">
            <label class="form-label">Projeto</label>
            <select class="form-input" id="fnFormProject">
              <option value="">Selecione...</option>
              ${this._projects.map(p => `<option value="${p.id}" ${val('project_id') === p.id ? 'selected' : ''}>${this._esc(p.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Categoria</label>
            <select class="form-input" id="fnFormCategory">
              <option value="">Selecione...</option>
              ${this._categories.filter(c => c.type === 'despesa' || !c.type).map(c => `<option value="${c.id}" ${val('category_id') === c.id ? 'selected' : ''}>${this._esc(c.name)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Observações</label>
          <textarea class="form-input" id="fnFormNotes" rows="3" placeholder="Notas adicionais...">${this._esc(val('notes'))}</textarea>
        </div>
      </div>`;
    } else {
      return `<div class="fn-drawer-form">
        <div class="form-group">
          <label class="form-label">Descrição <span class="required">*</span></label>
          <input type="text" class="form-input" id="fnFormDesc" value="${this._esc(val('description'))}" placeholder="Ex: NF #1234 - Projeto XYZ">
        </div>
        <div class="fn-drawer-grid">
          <div class="form-group">
            <label class="form-label">Valor (R$) <span class="required">*</span></label>
            <input type="number" class="form-input" id="fnFormAmount" value="${val('amount') || ''}" step="0.01" min="0.01" placeholder="0.00">
          </div>
          <div class="form-group">
            <label class="form-label">Vencimento <span class="required">*</span></label>
            <input type="date" class="form-input" id="fnFormDueDate" value="${val('due_date') || ''}">
          </div>
        </div>
        <div class="fn-drawer-grid">
          <div class="form-group">
            <label class="form-label">Cliente</label>
            <select class="form-input" id="fnFormClient">
              <option value="">Selecione...</option>
              ${this._clients.map(c => `<option value="${c.id}" ${val('client_id') === c.id ? 'selected' : ''}>${this._esc(c.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Projeto</label>
            <select class="form-input" id="fnFormProject">
              <option value="">Selecione...</option>
              ${this._projects.map(p => `<option value="${p.id}" ${val('project_id') === p.id ? 'selected' : ''}>${this._esc(p.name)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Observações</label>
          <textarea class="form-input" id="fnFormNotes" rows="3" placeholder="Notas adicionais...">${this._esc(val('notes'))}</textarea>
        </div>
      </div>`;
    }
  },

  _switchToEditMode(type, item) {
    this._drawerMode = 'edit';
    const header = document.getElementById('fnDrawerHeader');
    const body = document.getElementById('fnDrawerBody');
    const footer = document.getElementById('fnDrawerFooter');

    header.innerHTML = `
      <div class="fn-drawer-title">
        <i data-lucide="edit-3" style="width:18px;height:18px;"></i>
        Editar ${type === 'pagar' ? 'Conta a Pagar' : 'Recebível'}
      </div>
      <button class="btn btn-ghost btn-sm fn-drawer-close" id="fnDrawerClose">
        <i data-lucide="x" style="width:16px;height:16px;"></i>
      </button>`;
    body.innerHTML = this._renderDrawerForm(type, item);
    footer.innerHTML = `
      <button class="btn btn-secondary" id="fnDrawerCancel">Cancelar</button>
      <button class="btn btn-primary" id="fnDrawerSave">
        <i data-lucide="save" style="width:14px;height:14px;"></i> Salvar
      </button>`;

    if (window.lucide) lucide.createIcons();
    document.getElementById('fnDrawerClose')?.addEventListener('click', () => this._closeDrawer());
    this._bindDrawerFormEvents(type, 'edit', item);
  },

  _bindDrawerFormEvents(type, mode, existingItem = null) {
    const cancelBtn = document.getElementById('fnDrawerCancel');
    const saveBtn = document.getElementById('fnDrawerSave');

    if (cancelBtn) cancelBtn.addEventListener('click', () => this._closeDrawer());
    if (saveBtn) saveBtn.addEventListener('click', async () => {
      await this._saveDrawerForm(type, mode, existingItem);
    });
  },

  async _saveDrawerForm(type, mode, existingItem) {
    // Validação
    const desc = document.getElementById('fnFormDesc')?.value?.trim();
    const amount = parseFloat(document.getElementById('fnFormAmount')?.value);
    const dueDate = document.getElementById('fnFormDueDate')?.value;

    if (!desc) { this._toast('warning', 'Preencha a descrição.'); return; }
    if (isNaN(amount) || amount <= 0) { this._toast('warning', 'Informe um valor válido.'); return; }
    if (!dueDate) { this._toast('warning', 'Informe a data de vencimento.'); return; }

    const data = {
      description: desc,
      amount,
      due_date: dueDate,
      notes: document.getElementById('fnFormNotes')?.value || ''
    };

    if (type === 'pagar') {
      data.vendor_id = document.getElementById('fnFormVendor')?.value || null;
      data.cost_center_id = document.getElementById('fnFormCC')?.value || null;
      data.project_id = document.getElementById('fnFormProject')?.value || null;
      data.category_id = document.getElementById('fnFormCategory')?.value || null;
    } else {
      data.client_id = document.getElementById('fnFormClient')?.value || null;
      data.project_id = document.getElementById('fnFormProject')?.value || null;
    }

    try {
      if (mode === 'create') {
        if (type === 'pagar') {
          data.status = 'rascunho';
          data.amount_paid = 0;
          await FinanceRepo.createPayable(data);
        } else {
          data.status = 'previsto';
          data.amount_paid = 0;
          await FinanceRepo.createReceivable(data);
        }
        this._toast('success', `${type === 'pagar' ? 'Conta a pagar' : 'Recebível'} criado!`);
      } else {
        if (type === 'pagar') {
          await FinanceRepo.updatePayable(existingItem.id, data);
        } else {
          await FinanceRepo.updateReceivable(existingItem.id, data);
        }
        this._toast('success', 'Atualizado com sucesso!');
      }

      this._closeDrawer();
      if (type === 'pagar') this._loadPagar();
      else this._loadReceber();
    } catch (err) {
      console.error('[Financeiro] Erro ao salvar:', err);
      this._toast('error', err.message);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // GERAR FOLHA PJ
  // ═══════════════════════════════════════════════════════════════════════

  async _gerarFolhaPJ() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
      const result = await FinanceRepo.generatePayroll(month, year);
      if (result.existing) {
        this._toast('info', result.message);
      } else if (result.created > 0) {
        this._toast('success', result.message);
        this._loadPagar();
      } else {
        this._toast('warning', result.message);
      }
    } catch (err) {
      console.error('[Financeiro] Erro ao gerar folha PJ:', err);
      this._toast('error', `Erro ao gerar folha PJ: ${err.message}`);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CAIXA — Fluxo de Caixa Projetado (30 dias)
  // ═══════════════════════════════════════════════════════════════════════

  async _loadCaixa() {
    const container = document.getElementById('fnCaixaContent');
    if (!container) return;

    container.innerHTML = '<div class="fn-loading"><div class="loading-spinner"></div><p class="loading-text">Carregando fluxo de caixa...</p></div>';

    try {
      if (typeof FinanceRepo === 'undefined') throw new Error('FinanceRepo não está disponível');
      const data = await FinanceRepo.getCashFlow(30);
      this._renderCaixa(container, data);
    } catch (err) {
      console.error('[Financeiro] Erro ao carregar caixa:', err);
      container.innerHTML = this._renderError(err.message);
    }
  },

  _renderCaixa(container, data) {
    const fmt = this._fmt();
    let html = '';

    // ── Saldo inicial card ─────────────────────────────────────────
    const saldoDateStr = data.saldoDate
      ? new Date(data.saldoDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : 'Sem registro';

    html += `<div class="fn-caixa-header">
      <div class="kpi-card" style="max-width:280px;">
        <div class="kpi-label">Saldo Inicial</div>
        <div class="kpi-value" style="color:${data.saldoInicial >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${fmt.currency(data.saldoInicial)}</div>
        <div class="kpi-change neutral">Atualizado: ${saldoDateStr}</div>
      </div>
    </div>`;

    // ── Montar projeção dia a dia ──────────────────────────────────
    const dayMap = {};
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    // Inicializar 30 dias
    for (let i = 0; i < 30; i++) {
      const d = new Date(startDate.getTime() + i * 86400000);
      const key = d.toISOString().split('T')[0];
      dayMap[key] = { date: key, entradas: 0, saidas: 0, detalhesEntrada: [], detalhesSaida: [] };
    }

    // Agregar entradas
    (data.entradas || []).forEach(item => {
      const key = item.due_date;
      if (dayMap[key]) {
        const remaining = (item.amount || 0) - (item.amount_paid || 0);
        dayMap[key].entradas += remaining;
        dayMap[key].detalhesEntrada.push({ desc: item.description, valor: remaining, nome: item.client?.name });
      }
    });

    // Agregar saídas
    (data.saidas || []).forEach(item => {
      const key = item.due_date;
      if (dayMap[key]) {
        const remaining = (item.amount || 0) - (item.amount_paid || 0);
        dayMap[key].saidas += remaining;
        dayMap[key].detalhesSaida.push({ desc: item.description, valor: remaining, nome: item.vendor?.name });
      }
    });

    const days = Object.values(dayMap);
    let saldoAcumulado = data.saldoInicial;
    let saldoMinimo = saldoAcumulado;
    let haMovimentos = false;

    // Calcular saldo acumulado
    days.forEach(day => {
      saldoAcumulado += day.entradas - day.saidas;
      day.saldo = saldoAcumulado;
      if (saldoAcumulado < saldoMinimo) saldoMinimo = saldoAcumulado;
      if (day.entradas > 0 || day.saidas > 0) haMovimentos = true;
    });

    // ── KPIs rápidos ───────────────────────────────────────────────
    const totalEntradas = days.reduce((s, d) => s + d.entradas, 0);
    const totalSaidas = days.reduce((s, d) => s + d.saidas, 0);
    const saldoFinal = data.saldoInicial + totalEntradas - totalSaidas;

    html += `<div class="grid-4 fn-kpi-grid" style="margin-bottom:16px;">
      <div class="kpi-card">
        <div class="kpi-label">Entradas (30d)</div>
        <div class="kpi-value" style="color:var(--color-success);">${fmt.currency(totalEntradas)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Saídas (30d)</div>
        <div class="kpi-value" style="color:var(--color-danger);">${fmt.currency(totalSaidas)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Saldo Final Projetado</div>
        <div class="kpi-value" style="color:${saldoFinal >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${fmt.currency(saldoFinal)}</div>
      </div>
      <div class="kpi-card ${saldoMinimo < 0 ? 'fn-kpi-alert' : ''}">
        <div class="kpi-label">Saldo Mínimo</div>
        <div class="kpi-value" style="color:${saldoMinimo >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${fmt.currency(saldoMinimo)}</div>
        <div class="kpi-change ${saldoMinimo < 0 ? 'negative' : 'positive'}">${saldoMinimo < 0 ? 'Atenção: saldo negativo' : 'Saldo positivo no período'}</div>
      </div>
    </div>`;

    // ── Tabela dia a dia ───────────────────────────────────────────
    if (!haMovimentos) {
      html += '<div class="fn-empty-chart" style="min-height:200px;"><span>Nenhum movimento previsto nos próximos 30 dias</span></div>';
    } else {
      html += `<div class="card" style="overflow:hidden;">
        <div class="card-header"><h3 class="card-title">Projeção Diária (30 dias)</h3></div>
        <div style="overflow-x:auto;">
          <table class="data-table fn-table fn-caixa-table">
            <thead><tr>
              <th>Data</th>
              <th>Dia</th>
              <th style="text-align:right;">Entradas</th>
              <th style="text-align:right;">Saídas</th>
              <th style="text-align:right;">Saldo</th>
            </tr></thead>
            <tbody>`;

      // Filtrar: mostrar somente dias com movimento OU semanas para contexto
      const daysToShow = days.filter((day, idx) => {
        if (day.entradas > 0 || day.saidas > 0) return true;
        // Mostrar segundas-feiras e dia 1 de cada mês como referência
        const d = new Date(day.date + 'T00:00:00');
        return d.getDay() === 1 || d.getDate() === 1 || idx === 0 || idx === days.length - 1;
      });

      daysToShow.forEach(day => {
        const d = new Date(day.date + 'T00:00:00');
        const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
        const hasMove = day.entradas > 0 || day.saidas > 0;
        const isNeg = day.saldo < 0;
        const rowClass = isNeg ? 'fn-caixa-row--negative' : (hasMove ? '' : 'fn-caixa-row--empty');

        // Tooltip com detalhes
        let titleParts = [];
        day.detalhesEntrada.forEach(d => titleParts.push(`+ ${d.desc}${d.nome ? ' (' + d.nome + ')' : ''}`));
        day.detalhesSaida.forEach(d => titleParts.push(`- ${d.desc}${d.nome ? ' (' + d.nome + ')' : ''}`));
        const rowTitle = titleParts.length > 0 ? ` title="${this._esc(titleParts.join('\n'))}"` : '';

        html += `<tr class="fn-caixa-row ${rowClass}"${rowTitle}>
          <td><strong>${dateStr}</strong></td>
          <td class="fn-caixa-dayname">${dayName}</td>
          <td style="text-align:right;">${day.entradas > 0 ? `<span style="color:var(--color-success);">+${fmt.currency(day.entradas)}</span>` : '<span class="fn-caixa-zero">—</span>'}</td>
          <td style="text-align:right;">${day.saidas > 0 ? `<span style="color:var(--color-danger);">-${fmt.currency(day.saidas)}</span>` : '<span class="fn-caixa-zero">—</span>'}</td>
          <td style="text-align:right;"><strong style="color:${isNeg ? 'var(--color-danger)' : 'var(--text-primary)'};">${fmt.currency(day.saldo)}</strong></td>
        </tr>`;
      });

      html += '</tbody></table></div></div>';
    }

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  },

  // ═══════════════════════════════════════════════════════════════════════
  // INBOX — Pendências Financeiras Automáticas
  // ═══════════════════════════════════════════════════════════════════════

  async _loadInbox() {
    const container = document.getElementById('fnInboxContent');
    if (!container) return;

    container.innerHTML = '<div class="fn-loading"><div class="loading-spinner"></div><p class="loading-text">Carregando pendências...</p></div>';

    try {
      if (typeof FinanceRepo === 'undefined') throw new Error('FinanceRepo não está disponível');
      const items = await FinanceRepo.getInboxItems();
      this._renderInbox(container, items);
    } catch (err) {
      console.error('[Financeiro] Erro ao carregar inbox:', err);
      container.innerHTML = this._renderError(err.message);
    }
  },

  _renderInbox(container, items) {
    const fmt = this._fmt();
    const totalPendencias = items.vencidas_pagar.length + items.vencidas_receber.length +
      items.aguardando_aprovacao.length + items.sem_cc.length + items.sem_projeto.length;

    let html = '';

    // ── Summary cards ──────────────────────────────────────────────
    html += `<div class="fn-inbox-summary">
      <div class="fn-inbox-stat fn-inbox-stat--danger">
        <div class="fn-inbox-stat-number">${items.vencidas_pagar.length}</div>
        <div class="fn-inbox-stat-label">Vencidas (Pagar)</div>
      </div>
      <div class="fn-inbox-stat fn-inbox-stat--warning">
        <div class="fn-inbox-stat-number">${items.vencidas_receber.length}</div>
        <div class="fn-inbox-stat-label">Vencidas (Receber)</div>
      </div>
      <div class="fn-inbox-stat fn-inbox-stat--blue">
        <div class="fn-inbox-stat-number">${items.aguardando_aprovacao.length}</div>
        <div class="fn-inbox-stat-label">Aguardando Aprovação</div>
      </div>
      <div class="fn-inbox-stat fn-inbox-stat--muted">
        <div class="fn-inbox-stat-number">${items.sem_cc.length}</div>
        <div class="fn-inbox-stat-label">Sem Centro Custo</div>
      </div>
      <div class="fn-inbox-stat fn-inbox-stat--muted">
        <div class="fn-inbox-stat-number">${items.sem_projeto.length}</div>
        <div class="fn-inbox-stat-label">Sem Projeto</div>
      </div>
    </div>`;

    if (totalPendencias === 0) {
      html += `<div class="fn-inbox-empty">
        <i data-lucide="check-circle" style="width:48px;height:48px;color:var(--color-success);margin-bottom:12px;"></i>
        <h3>Tudo em dia!</h3>
        <p>Não há pendências financeiras no momento.</p>
      </div>`;
      container.innerHTML = html;
      if (window.lucide) lucide.createIcons();
      return;
    }

    // ── Seções de pendências ───────────────────────────────────────

    // 1. Contas Vencidas (Pagar)
    if (items.vencidas_pagar.length > 0) {
      html += this._renderInboxSection(
        'Contas Vencidas (Pagar)', 'alert-circle', 'danger',
        items.vencidas_pagar.map(item => {
          const dias = Math.floor((Date.now() - new Date(item.due_date + 'T00:00:00').getTime()) / 86400000);
          const remaining = (item.amount || 0) - (item.amount_paid || 0);
          return {
            id: item.id,
            type: 'pagar',
            title: item.description || 'Sem descrição',
            subtitle: item.vendor?.name || '',
            valor: fmt.currency(remaining),
            badge: `${dias}d atraso`,
            badgeClass: 'badge--danger',
            action: 'pagar',
            actionLabel: 'Pagar'
          };
        })
      );
    }

    // 2. Contas Vencidas (Receber)
    if (items.vencidas_receber.length > 0) {
      html += this._renderInboxSection(
        'Contas Vencidas (Receber)', 'alert-triangle', 'warning',
        items.vencidas_receber.map(item => {
          const dias = Math.floor((Date.now() - new Date(item.due_date + 'T00:00:00').getTime()) / 86400000);
          const remaining = (item.amount || 0) - (item.amount_paid || 0);
          return {
            id: item.id,
            type: 'receber',
            title: item.description || 'Sem descrição',
            subtitle: item.client?.name || '',
            valor: fmt.currency(remaining),
            badge: `${dias}d atraso`,
            badgeClass: 'badge--warning',
            action: 'receber',
            actionLabel: 'Receber'
          };
        })
      );
    }

    // 3. Aguardando Aprovação
    if (items.aguardando_aprovacao.length > 0) {
      html += this._renderInboxSection(
        'Aguardando Aprovação', 'clock', 'blue',
        items.aguardando_aprovacao.map(item => ({
          id: item.id,
          type: 'pagar',
          title: item.description || 'Sem descrição',
          subtitle: item.vendor?.name || '',
          valor: fmt.currency(item.amount || 0),
          badge: 'Aprovar',
          badgeClass: 'badge--blue',
          action: 'aprovar',
          actionLabel: 'Aprovar'
        }))
      );
    }

    // 4. Sem Centro de Custo
    if (items.sem_cc.length > 0) {
      html += this._renderInboxSection(
        'Sem Centro de Custo', 'folder-x', 'muted',
        items.sem_cc.map(item => ({
          id: item.id,
          type: 'pagar',
          title: item.description || 'Sem descrição',
          subtitle: item.vendor?.name || '',
          valor: fmt.currency(item.amount || 0),
          badge: 'Sem CC',
          badgeClass: 'badge--default',
          action: 'edit',
          actionLabel: 'Completar'
        }))
      );
    }

    // 5. Sem Projeto (em CC que exige)
    if (items.sem_projeto.length > 0) {
      html += this._renderInboxSection(
        'Sem Projeto (CC exige)', 'folder-x', 'muted',
        items.sem_projeto.map(item => ({
          id: item.id,
          type: 'pagar',
          title: item.description || 'Sem descrição',
          subtitle: item.cost_center?.name || '',
          valor: fmt.currency(item.amount || 0),
          badge: 'Sem Projeto',
          badgeClass: 'badge--default',
          action: 'edit',
          actionLabel: 'Completar'
        }))
      );
    }

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    this._bindInboxEvents(container);
  },

  _renderInboxSection(title, icon, color, items) {
    const borderColors = { danger: 'var(--color-danger)', warning: 'var(--color-warning)', blue: 'var(--color-info)', muted: 'var(--text-muted)' };
    const borderColor = borderColors[color] || 'var(--text-muted)';

    return `<div class="fn-inbox-section">
      <div class="fn-inbox-section-header">
        <i data-lucide="${icon}" style="width:16px;height:16px;color:${borderColor};"></i>
        <span>${title}</span>
        <span class="badge badge--default">${items.length}</span>
      </div>
      <div class="fn-inbox-list">
        ${items.map(item => `
          <div class="fn-inbox-item" style="border-left-color:${borderColor};" data-inbox-id="${item.id}" data-inbox-type="${item.type}">
            <div class="fn-inbox-item-body">
              <div class="fn-inbox-item-title">${this._esc(item.title)}</div>
              ${item.subtitle ? `<div class="fn-inbox-item-subtitle">${this._esc(item.subtitle)}</div>` : ''}
            </div>
            <div class="fn-inbox-item-meta">
              <span class="fn-inbox-item-valor">${item.valor}</span>
              <span class="badge ${item.badgeClass}">${item.badge}</span>
            </div>
            <button class="btn btn-primary btn-sm fn-inbox-action" data-inbox-action="${item.action}" data-inbox-id="${item.id}" data-inbox-type="${item.type}">
              ${item.actionLabel}
            </button>
          </div>
        `).join('')}
      </div>
    </div>`;
  },

  _bindInboxEvents(container) {
    // Ação rápida nos itens
    container.querySelectorAll('.fn-inbox-action').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.inboxId;
        const type = btn.dataset.inboxType;
        const action = btn.dataset.inboxAction;

        if (action === 'aprovar') {
          try {
            await FinanceRepo.updatePayable(id, { status: 'aprovado', approved_at: new Date().toISOString() });
            this._toast('success', 'Conta aprovada!');
            this._loadInbox();
          } catch (err) {
            this._toast('error', err.message);
          }
        } else if (action === 'pagar' || action === 'receber') {
          this._openDrawer(type, 'view', id);
        } else if (action === 'edit') {
          this._openDrawer(type, 'view', id);
        }
      });
    });

    // Click no item abre drawer
    container.querySelectorAll('.fn-inbox-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.inboxId;
        const type = item.dataset.inboxType;
        this._openDrawer(type, 'view', id);
      });
    });
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CADASTROS — Clientes, Fornecedores, Centros de Custo
  // ═══════════════════════════════════════════════════════════════════════

  async _loadCadastros() {
    const container = document.getElementById('fnCadastrosContent');
    if (!container) return;

    await this._ensureLookups();
    this._renderCadastrosShell(container);
    this._loadCadastroSubTab();
  },

  _renderCadastrosShell(container) {
    container.innerHTML = `
      <div class="tab-bar tab-bar--sub fn-cadastro-subtabs" id="fnCadastroSubtabs">
        <button class="tab tab--sub ${this._cadastroSubTab === 'fornecedores' ? 'active' : ''}" data-subtab="fornecedores">Fornecedores</button>
        <button class="tab tab--sub ${this._cadastroSubTab === 'clientes' ? 'active' : ''}" data-subtab="clientes">Clientes</button>
        <button class="tab tab--sub ${this._cadastroSubTab === 'centros-custo' ? 'active' : ''}" data-subtab="centros-custo">Centros de Custo</button>
        <button class="tab tab--sub ${this._cadastroSubTab === 'omie' ? 'active' : ''}" data-subtab="omie" style="display:flex;align-items:center;gap:4px;">
          <i data-lucide="cloud" style="width:13px;height:13px;"></i> Omie
        </button>
      </div>
      <div id="fnCadastroSubContent">
        <div class="fn-loading"><div class="loading-spinner"></div></div>
      </div>`;

    // Bind subtab clicks
    container.querySelectorAll('#fnCadastroSubtabs .tab--sub').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('#fnCadastroSubtabs .tab--sub').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this._cadastroSubTab = tab.dataset.subtab;
        this._cadastroSearch = '';
        this._loadCadastroSubTab();
      });
    });
  },

  async _loadCadastroSubTab() {
    const subContainer = document.getElementById('fnCadastroSubContent');
    if (!subContainer) return;

    subContainer.innerHTML = '<div class="fn-loading" style="min-height:150px;"><div class="loading-spinner"></div></div>';

    try {
      if (typeof FinanceRepo === 'undefined') throw new Error('FinanceRepo não está disponível');

      if (this._cadastroSubTab === 'fornecedores') {
        const items = await FinanceRepo.listVendors({ search: this._cadastroSearch || undefined, limit: 200 });
        this._renderCadastroFornecedores(subContainer, items);
      } else if (this._cadastroSubTab === 'clientes') {
        const items = await FinanceRepo.listClients({ search: this._cadastroSearch || undefined, limit: 200 });
        this._renderCadastroClientes(subContainer, items);
      } else if (this._cadastroSubTab === 'centros-custo') {
        const items = await FinanceRepo.listCostCenters();
        this._renderCadastroCCs(subContainer, items);
      } else if (this._cadastroSubTab === 'omie') {
        this._renderCadastroOmie(subContainer);
      }
    } catch (err) {
      subContainer.innerHTML = this._renderError(err.message);
    }
  },

  // ── Fornecedores ─────────────────────────────────────────────────

  _renderCadastroFornecedores(container, items) {
    let html = `<div class="fn-filter-bar" style="margin-top:12px;">
      <div class="fn-filter-group">
        <input type="text" class="form-input fn-filter-search" id="fnCadSearchVendor" placeholder="Buscar fornecedor..." value="${this._esc(this._cadastroSearch)}" style="max-width:280px;">
      </div>
      <div class="fn-filter-actions">
        <button class="btn btn-primary btn-sm" id="fnCadNewVendor">
          <i data-lucide="plus" style="width:14px;height:14px;"></i> Novo Fornecedor
        </button>
      </div>
    </div>`;

    if (!items || items.length === 0) {
      html += '<div class="fn-empty-chart" style="min-height:150px;"><span>Nenhum fornecedor encontrado</span></div>';
    } else {
      html += `<div class="card" style="overflow:hidden;">
        <div style="overflow-x:auto;">
          <table class="data-table fn-cad-table">
            <thead><tr>
              <th>Nome</th>
              <th>CNPJ</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Categoria</th>
              <th style="width:80px;">Ações</th>
            </tr></thead>
            <tbody>
              ${items.map(v => `<tr class="fn-cad-row" data-cad-id="${v.id}" data-cad-type="vendor">
                <td><strong class="fn-cell-desc">${this._esc(v.name)}</strong></td>
                <td class="fn-cell-cc">${this._esc(v.cnpj || '—')}</td>
                <td class="fn-cell-cc">${this._esc(v.email || '—')}</td>
                <td class="fn-cell-cc">${this._esc(v.phone || '—')}</td>
                <td>${v.category ? `<span class="tag">${this._esc(v.category)}</span>` : '—'}</td>
                <td>
                  <div style="display:flex;gap:4px;">
                    <button class="btn btn-ghost btn-sm fn-cad-edit" data-cad-id="${v.id}" title="Editar"><i data-lucide="edit-3" style="width:13px;height:13px;"></i></button>
                    <button class="btn btn-ghost btn-sm fn-cad-deactivate" data-cad-id="${v.id}" title="Desativar"><i data-lucide="trash-2" style="width:13px;height:13px;color:var(--color-danger);"></i></button>
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
      html += `<div class="fn-table-count" style="padding:8px 0;">${items.length} fornecedor${items.length !== 1 ? 'es' : ''}</div>`;
    }

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    this._bindCadastroVendorEvents(container);
  },

  _bindCadastroVendorEvents(container) {
    // Busca
    const searchInput = container.querySelector('#fnCadSearchVendor');
    if (searchInput) {
      let _debounce = null;
      searchInput.addEventListener('input', () => {
        clearTimeout(_debounce);
        _debounce = setTimeout(() => { this._cadastroSearch = searchInput.value; this._loadCadastroSubTab(); }, 400);
      });
    }

    // Novo
    container.querySelector('#fnCadNewVendor')?.addEventListener('click', () => {
      this._openCadastroDrawer('vendor', null);
    });

    // Editar
    container.querySelectorAll('.fn-cad-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = this._vendors.find(v => v.id === btn.dataset.cadId);
        if (item) this._openCadastroDrawer('vendor', item);
      });
    });

    // Desativar
    container.querySelectorAll('.fn-cad-deactivate').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Desativar este fornecedor?')) return;
        try {
          await FinanceRepo.deactivateVendor(btn.dataset.cadId);
          this._toast('warning', 'Fornecedor desativado');
          this._lookupsLoaded = false;
          await this._ensureLookups();
          this._loadCadastroSubTab();
        } catch (err) { this._toast('error', err.message); }
      });
    });
  },

  // ── Clientes ─────────────────────────────────────────────────────

  _renderCadastroClientes(container, items) {
    let html = `<div class="fn-filter-bar" style="margin-top:12px;">
      <div class="fn-filter-group">
        <input type="text" class="form-input fn-filter-search" id="fnCadSearchClient" placeholder="Buscar cliente..." value="${this._esc(this._cadastroSearch)}" style="max-width:280px;">
      </div>
      <div class="fn-filter-actions">
        <button class="btn btn-primary btn-sm" id="fnCadNewClient">
          <i data-lucide="plus" style="width:14px;height:14px;"></i> Novo Cliente
        </button>
      </div>
    </div>`;

    if (!items || items.length === 0) {
      html += '<div class="fn-empty-chart" style="min-height:150px;"><span>Nenhum cliente encontrado</span></div>';
    } else {
      html += `<div class="card" style="overflow:hidden;">
        <div style="overflow-x:auto;">
          <table class="data-table fn-cad-table">
            <thead><tr>
              <th>Nome</th>
              <th>CNPJ</th>
              <th>Contato</th>
              <th>Email</th>
              <th>Telefone</th>
              <th style="width:80px;">Ações</th>
            </tr></thead>
            <tbody>
              ${items.map(c => `<tr class="fn-cad-row" data-cad-id="${c.id}" data-cad-type="client">
                <td><strong class="fn-cell-desc">${this._esc(c.name)}</strong></td>
                <td class="fn-cell-cc">${this._esc(c.cnpj || '—')}</td>
                <td class="fn-cell-cc">${this._esc(c.contact_name || '—')}</td>
                <td class="fn-cell-cc">${this._esc(c.email || '—')}</td>
                <td class="fn-cell-cc">${this._esc(c.phone || '—')}</td>
                <td>
                  <div style="display:flex;gap:4px;">
                    <button class="btn btn-ghost btn-sm fn-cad-edit" data-cad-id="${c.id}" title="Editar"><i data-lucide="edit-3" style="width:13px;height:13px;"></i></button>
                    <button class="btn btn-ghost btn-sm fn-cad-deactivate" data-cad-id="${c.id}" title="Desativar"><i data-lucide="trash-2" style="width:13px;height:13px;color:var(--color-danger);"></i></button>
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
      html += `<div class="fn-table-count" style="padding:8px 0;">${items.length} cliente${items.length !== 1 ? 's' : ''}</div>`;
    }

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    this._bindCadastroClientEvents(container);
  },

  _bindCadastroClientEvents(container) {
    const searchInput = container.querySelector('#fnCadSearchClient');
    if (searchInput) {
      let _debounce = null;
      searchInput.addEventListener('input', () => {
        clearTimeout(_debounce);
        _debounce = setTimeout(() => { this._cadastroSearch = searchInput.value; this._loadCadastroSubTab(); }, 400);
      });
    }

    container.querySelector('#fnCadNewClient')?.addEventListener('click', () => {
      this._openCadastroDrawer('client', null);
    });

    container.querySelectorAll('.fn-cad-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = this._clients.find(c => c.id === btn.dataset.cadId);
        if (item) this._openCadastroDrawer('client', item);
      });
    });

    container.querySelectorAll('.fn-cad-deactivate').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Desativar este cliente?')) return;
        try {
          await FinanceRepo.deactivateClient(btn.dataset.cadId);
          this._toast('warning', 'Cliente desativado');
          this._lookupsLoaded = false;
          await this._ensureLookups();
          this._loadCadastroSubTab();
        } catch (err) { this._toast('error', err.message); }
      });
    });
  },

  // ── Centros de Custo ─────────────────────────────────────────────

  _renderCadastroCCs(container, items) {
    let html = `<div class="fn-filter-bar" style="margin-top:12px;">
      <div class="fn-filter-group"></div>
      <div class="fn-filter-actions">
        <button class="btn btn-primary btn-sm" id="fnCadNewCC">
          <i data-lucide="plus" style="width:14px;height:14px;"></i> Novo Centro de Custo
        </button>
      </div>
    </div>`;

    if (!items || items.length === 0) {
      html += '<div class="fn-empty-chart" style="min-height:150px;"><span>Nenhum centro de custo encontrado</span></div>';
    } else {
      // Agrupar por categoria
      const groups = {};
      items.forEach(cc => {
        const cat = cc.category || 'Outros';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(cc);
      });

      Object.entries(groups).forEach(([catName, ccItems]) => {
        html += `<div class="fn-cc-group">
          <div class="fn-cc-group-header">${this._esc(catName)}</div>
          <div class="fn-cc-group-items">
            ${ccItems.map(cc => `
              <div class="fn-cc-item" data-cc-id="${cc.id}">
                <div class="fn-cc-item-info">
                  <strong>${this._esc(cc.name)}</strong>
                  <span class="fn-cc-item-slug">${this._esc(cc.slug)}</span>
                  ${cc.requires_project ? '<span class="badge badge--blue" style="font-size:0.6rem;">Requer Projeto</span>' : ''}
                </div>
                <div class="fn-cc-item-actions">
                  <button class="btn btn-ghost btn-sm fn-cc-edit" data-cc-id="${cc.id}" title="Editar"><i data-lucide="edit-3" style="width:13px;height:13px;"></i></button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;
      });

      html += `<div class="fn-table-count" style="padding:8px 0;">${items.length} centro${items.length !== 1 ? 's' : ''} de custo</div>`;
    }

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    this._bindCadastroCCEvents(container);
  },

  _bindCadastroCCEvents(container) {
    container.querySelector('#fnCadNewCC')?.addEventListener('click', () => {
      this._openCadastroDrawer('cost_center', null);
    });

    container.querySelectorAll('.fn-cc-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = this._costCenters.find(cc => cc.id === btn.dataset.ccId);
        if (item) this._openCadastroDrawer('cost_center', item);
      });
    });
  },

  // ── Omie — Configuracao e Sync ───────────────────────────────────

  _renderCadastroOmie(container) {
    const omieEnabled = typeof TBO_OMIE !== 'undefined' && TBO_OMIE.isEnabled();
    const appKey = typeof TBO_OMIE !== 'undefined' ? TBO_OMIE.getAppKey() : '';
    const appSecret = typeof TBO_OMIE !== 'undefined' ? TBO_OMIE.getAppSecret() : '';
    const lastSync = localStorage.getItem('tbo_omie_last_sync');
    const autoSync = typeof TBO_OMIE_SYNC !== 'undefined' && TBO_OMIE_SYNC.isAutoSyncEnabled();
    const status = typeof TBO_OMIE_SYNC !== 'undefined' ? TBO_OMIE_SYNC.getStatus() : {};

    let lastSyncStr = '—';
    if (lastSync) {
      try {
        const d = new Date(lastSync);
        lastSyncStr = d.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
      } catch(e) { lastSyncStr = lastSync; }
    }

    const html = `
      <div style="max-width:680px;margin:16px auto 0;">
        <!-- Titulo -->
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
          <div style="width:36px;height:36px;border-radius:8px;background:rgba(59,130,246,0.1);display:flex;align-items:center;justify-content:center;">
            <i data-lucide="cloud" style="width:20px;height:20px;color:#3b82f6;"></i>
          </div>
          <div>
            <h3 style="margin:0;font-size:16px;font-weight:600;">Integracao Omie ERP</h3>
            <p style="margin:0;font-size:12px;color:var(--text-secondary);">Sincronize fornecedores, clientes e lancamentos financeiros.</p>
          </div>
        </div>

        <!-- Card Credenciais -->
        <div class="card" style="padding:20px;margin-bottom:16px;">
          <h4 style="margin:0 0 12px;font-size:14px;font-weight:600;display:flex;align-items:center;gap:6px;">
            <i data-lucide="key" style="width:14px;height:14px;color:var(--text-secondary);"></i> Credenciais
          </h4>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div>
              <label style="display:block;font-size:12px;color:var(--text-secondary);margin-bottom:4px;">App Key</label>
              <div style="display:flex;gap:6px;">
                <input type="password" class="form-input" id="fnOmieAppKey" value="${this._esc(appKey)}" placeholder="Insira o App Key" style="flex:1;font-family:monospace;font-size:13px;">
                <button class="btn btn-ghost btn-sm" id="fnOmieToggleKey" title="Mostrar/ocultar" style="min-width:34px;">
                  <i data-lucide="eye" style="width:14px;height:14px;"></i>
                </button>
              </div>
            </div>
            <div>
              <label style="display:block;font-size:12px;color:var(--text-secondary);margin-bottom:4px;">App Secret</label>
              <div style="display:flex;gap:6px;">
                <input type="password" class="form-input" id="fnOmieAppSecret" value="${this._esc(appSecret)}" placeholder="Insira o App Secret" style="flex:1;font-family:monospace;font-size:13px;">
                <button class="btn btn-ghost btn-sm" id="fnOmieToggleSecret" title="Mostrar/ocultar" style="min-width:34px;">
                  <i data-lucide="eye" style="width:14px;height:14px;"></i>
                </button>
              </div>
            </div>
            <div style="display:flex;gap:8px;margin-top:4px;">
              <button class="btn btn-sm" id="fnOmieTestConn" style="display:flex;align-items:center;gap:5px;">
                <i data-lucide="wifi" style="width:13px;height:13px;"></i> Testar Conexao
              </button>
              <button class="btn btn-primary btn-sm" id="fnOmieSaveCreds" style="display:flex;align-items:center;gap:5px;">
                <i data-lucide="save" style="width:13px;height:13px;"></i> Salvar
              </button>
            </div>
            <div id="fnOmieConnStatus" style="font-size:12px;"></div>
          </div>
        </div>

        <!-- Card Sincronizacao -->
        <div class="card" style="padding:20px;margin-bottom:16px;">
          <h4 style="margin:0 0 12px;font-size:14px;font-weight:600;display:flex;align-items:center;gap:6px;">
            <i data-lucide="refresh-cw" style="width:14px;height:14px;color:var(--text-secondary);"></i> Sincronizacao
          </h4>
          <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:12px;">
            <div style="font-size:12px;color:var(--text-secondary);">
              Ultima sync: <strong style="color:var(--text-primary);">${lastSyncStr}</strong>
            </div>
            ${status.lastResult ? `
            <div style="font-size:12px;color:var(--text-secondary);display:flex;gap:12px;">
              <span>Fornec: <strong>${status.lastResult.vendors_synced || 0}</strong></span>
              <span>Clientes: <strong>${status.lastResult.clients_synced || 0}</strong></span>
              <span>A Pagar: <strong>${status.lastResult.payables_synced || 0}</strong></span>
              <span>A Receber: <strong>${status.lastResult.receivables_synced || 0}</strong></span>
            </div>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <button class="btn btn-primary btn-sm" id="fnOmieSyncNow" ${!omieEnabled ? 'disabled' : ''} style="display:flex;align-items:center;gap:5px;">
              <i data-lucide="play" style="width:13px;height:13px;"></i> Sincronizar Agora
            </button>
            <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
              <input type="checkbox" id="fnOmieAutoSync" ${autoSync ? 'checked' : ''} ${!omieEnabled ? 'disabled' : ''}>
              Auto-sync a cada 30 min
            </label>
          </div>
          <!-- Progress bar (hidden by default) -->
          <div id="fnOmieSyncProgress" style="display:none;">
            <div style="background:var(--bg-secondary);border-radius:6px;height:6px;overflow:hidden;margin-bottom:6px;">
              <div id="fnOmieSyncBar" style="height:100%;background:var(--brand-primary);border-radius:6px;width:0%;transition:width 0.3s;"></div>
            </div>
            <div id="fnOmieSyncMsg" style="font-size:11px;color:var(--text-secondary);"></div>
          </div>
        </div>

        <!-- Card Historico -->
        <div class="card" style="padding:20px;">
          <h4 style="margin:0 0 12px;font-size:14px;font-weight:600;display:flex;align-items:center;gap:6px;">
            <i data-lucide="history" style="width:14px;height:14px;color:var(--text-secondary);"></i> Historico de Sincronizacao
          </h4>
          <div id="fnOmieSyncHistory">
            <div class="fn-loading" style="min-height:60px;"><div class="loading-spinner"></div></div>
          </div>
        </div>
      </div>`;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    // Carregar historico
    this._loadOmieSyncHistory();

    // Bind eventos
    this._bindCadastroOmieEvents(container);
  },

  async _loadOmieSyncHistory() {
    const histEl = document.getElementById('fnOmieSyncHistory');
    if (!histEl) return;

    try {
      if (typeof FinanceRepo === 'undefined') throw new Error('FinanceRepo indisponivel');
      const logs = await FinanceRepo.listSyncLogs(10);

      if (!logs || logs.length === 0) {
        histEl.innerHTML = '<div style="font-size:12px;color:var(--text-secondary);padding:8px 0;">Nenhuma sincronizacao realizada ainda.</div>';
        return;
      }

      const statusIcons = {
        success: '<span style="color:#22c55e;">✓</span>',
        partial: '<span style="color:#f59e0b;">⚠</span>',
        error: '<span style="color:#ef4444;">✗</span>',
        running: '<span class="fn-omie-spin" style="color:#3b82f6;">⟳</span>'
      };

      let rows = logs.map(log => {
        const d = new Date(log.started_at);
        const dateStr = d.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
        const total = (log.vendors_synced || 0) + (log.clients_synced || 0) +
                      (log.payables_synced || 0) + (log.receivables_synced || 0);
        const dur = log.finished_at ? ((new Date(log.finished_at) - new Date(log.started_at)) / 1000).toFixed(0) + 's' : '...';
        const errCount = Array.isArray(log.errors) ? log.errors.length : 0;
        const icon = statusIcons[log.status] || '?';

        return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border-primary);font-size:12px;">
          <span style="min-width:16px;text-align:center;">${icon}</span>
          <span style="min-width:90px;color:var(--text-secondary);">${dateStr}</span>
          <span style="flex:1;"><strong>${total}</strong> registros (${dur})</span>
          ${errCount > 0 ? `<span style="color:#ef4444;font-size:11px;">${errCount} erro${errCount > 1 ? 's' : ''}</span>` : ''}
        </div>`;
      }).join('');

      histEl.innerHTML = rows;
    } catch (e) {
      histEl.innerHTML = `<div style="font-size:12px;color:var(--text-secondary);">Erro ao carregar historico: ${this._esc(e.message)}</div>`;
    }
  },

  _bindCadastroOmieEvents(container) {
    // Toggle mostrar/ocultar credenciais
    const toggleVisibility = (inputId, btnId) => {
      const btn = container.querySelector(`#${btnId}`);
      if (btn) {
        btn.addEventListener('click', () => {
          const input = container.querySelector(`#${inputId}`);
          if (input) {
            input.type = input.type === 'password' ? 'text' : 'password';
          }
        });
      }
    };
    toggleVisibility('fnOmieAppKey', 'fnOmieToggleKey');
    toggleVisibility('fnOmieAppSecret', 'fnOmieToggleSecret');

    // Salvar credenciais
    container.querySelector('#fnOmieSaveCreds')?.addEventListener('click', () => {
      const key = container.querySelector('#fnOmieAppKey')?.value?.trim();
      const secret = container.querySelector('#fnOmieAppSecret')?.value?.trim();
      if (!key || !secret) {
        this._toast('warning', 'Preencha App Key e App Secret.');
        return;
      }
      TBO_OMIE.setCredentials(key, secret);
      TBO_OMIE.setEnabled(true);
      this._toast('success', 'Credenciais salvas com sucesso!');
    });

    // Testar conexao
    container.querySelector('#fnOmieTestConn')?.addEventListener('click', async () => {
      const statusEl = container.querySelector('#fnOmieConnStatus');
      if (statusEl) statusEl.innerHTML = '<span style="color:var(--text-secondary);">Testando conexao...</span>';

      // Salvar credenciais temporariamente para o teste
      const key = container.querySelector('#fnOmieAppKey')?.value?.trim();
      const secret = container.querySelector('#fnOmieAppSecret')?.value?.trim();
      if (key && secret) {
        TBO_OMIE.setCredentials(key, secret);
      }

      try {
        const result = await TBO_OMIE.testConnection();
        if (statusEl) statusEl.innerHTML = `<span style="color:#22c55e;">✓ Conectado — ${result.total} categorias encontradas.</span>`;
        this._toast('success', 'Conexao com Omie OK!');
      } catch (e) {
        if (statusEl) statusEl.innerHTML = `<span style="color:#ef4444;">✗ Falha: ${this._esc(e.message)}</span>`;
        this._toast('error', `Falha na conexao: ${e.message}`);
      }
    });

    // Sincronizar agora
    container.querySelector('#fnOmieSyncNow')?.addEventListener('click', async () => {
      if (typeof TBO_OMIE_SYNC === 'undefined') {
        this._toast('error', 'TBO_OMIE_SYNC nao esta carregado.');
        return;
      }

      const btn = container.querySelector('#fnOmieSyncNow');
      const progressEl = container.querySelector('#fnOmieSyncProgress');
      const barEl = container.querySelector('#fnOmieSyncBar');
      const msgEl = container.querySelector('#fnOmieSyncMsg');

      if (btn) btn.disabled = true;
      if (progressEl) progressEl.style.display = 'block';

      // Registrar callback de progresso
      TBO_OMIE_SYNC.onProgress((step, percent, message) => {
        if (barEl) barEl.style.width = percent + '%';
        if (msgEl) msgEl.textContent = message;
      });

      try {
        const result = await TBO_OMIE_SYNC.sync();
        if (result) {
          this._toast('success', `Sync completo: ${result.total} registros em ${(result.duration_ms / 1000).toFixed(1)}s`);
          // Recarregar lookups para refletir novos dados
          this._lookupsLoaded = false;
          await this._ensureLookups();
        } else {
          this._toast('warning', 'Sync retornou sem resultado.');
        }
      } catch (e) {
        this._toast('error', `Sync falhou: ${e.message}`);
      } finally {
        if (btn) btn.disabled = false;
        // Atualizar historico e progress
        setTimeout(() => {
          if (progressEl) progressEl.style.display = 'none';
          this._loadOmieSyncHistory();
        }, 1500);
      }
    });

    // Auto-sync toggle
    container.querySelector('#fnOmieAutoSync')?.addEventListener('change', (e) => {
      if (typeof TBO_OMIE_SYNC !== 'undefined') {
        TBO_OMIE_SYNC.setAutoSync(e.target.checked);
        this._toast('info', e.target.checked ? 'Auto-sync ativado (30 min)' : 'Auto-sync desativado');
      }
    });
  },

  // ── Cadastros: Drawer genérico para criar/editar ─────────────────

  _openCadastroDrawer(entityType, item) {
    const isEdit = !!item;
    const drawer = document.getElementById('fnDrawer');
    const backdrop = document.getElementById('fnDrawerBackdrop');
    if (!drawer || !backdrop) return;

    drawer.classList.add('fn-drawer--open');
    backdrop.classList.add('fn-drawer-backdrop--open');
    this._drawerOpen = true;

    const header = document.getElementById('fnDrawerHeader');
    const body = document.getElementById('fnDrawerBody');
    const footer = document.getElementById('fnDrawerFooter');

    const titles = {
      vendor: isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor',
      client: isEdit ? 'Editar Cliente' : 'Novo Cliente',
      cost_center: isEdit ? 'Editar Centro de Custo' : 'Novo Centro de Custo'
    };
    const icons = { vendor: 'truck', client: 'building-2', cost_center: 'folder' };

    header.innerHTML = `
      <div class="fn-drawer-title">
        <i data-lucide="${icons[entityType]}" style="width:18px;height:18px;"></i>
        ${titles[entityType]}
      </div>
      <button class="btn btn-ghost btn-sm fn-drawer-close" id="fnDrawerClose">
        <i data-lucide="x" style="width:16px;height:16px;"></i>
      </button>`;

    body.innerHTML = this._renderCadastroForm(entityType, item);

    footer.innerHTML = `
      <button class="btn btn-secondary" id="fnDrawerCancel">Cancelar</button>
      <button class="btn btn-primary" id="fnCadSave">
        <i data-lucide="save" style="width:14px;height:14px;"></i> Salvar
      </button>`;

    if (window.lucide) lucide.createIcons();

    document.getElementById('fnDrawerClose')?.addEventListener('click', () => this._closeDrawer());
    document.getElementById('fnDrawerCancel')?.addEventListener('click', () => this._closeDrawer());
    document.getElementById('fnCadSave')?.addEventListener('click', async () => {
      await this._saveCadastroForm(entityType, item);
    });

    this._drawerEscHandler = (e) => { if (e.key === 'Escape') this._closeDrawer(); };
    document.addEventListener('keydown', this._drawerEscHandler);
  },

  _renderCadastroForm(entityType, item) {
    const val = (field) => item ? (item[field] || '') : '';

    if (entityType === 'vendor') {
      return `<div class="fn-drawer-form">
        <div class="form-group">
          <label class="form-label">Nome <span class="required">*</span></label>
          <input type="text" class="form-input" id="fnCadFormName" value="${this._esc(val('name'))}" placeholder="Razão social ou nome fantasia">
        </div>
        <div class="fn-drawer-grid">
          <div class="form-group">
            <label class="form-label">CNPJ</label>
            <input type="text" class="form-input" id="fnCadFormCnpj" value="${this._esc(val('cnpj'))}" placeholder="00.000.000/0000-00">
          </div>
          <div class="form-group">
            <label class="form-label">Categoria</label>
            <input type="text" class="form-input" id="fnCadFormCategory" value="${this._esc(val('category'))}" placeholder="Ex: Serviços, Software">
          </div>
        </div>
        <div class="fn-drawer-grid">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="fnCadFormEmail" value="${this._esc(val('email'))}" placeholder="contato@empresa.com">
          </div>
          <div class="form-group">
            <label class="form-label">Telefone</label>
            <input type="text" class="form-input" id="fnCadFormPhone" value="${this._esc(val('phone'))}" placeholder="(00) 00000-0000">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Observações</label>
          <textarea class="form-input" id="fnCadFormNotes" rows="3" placeholder="Notas sobre este fornecedor...">${this._esc(val('notes'))}</textarea>
        </div>
      </div>`;
    }

    if (entityType === 'client') {
      return `<div class="fn-drawer-form">
        <div class="form-group">
          <label class="form-label">Nome <span class="required">*</span></label>
          <input type="text" class="form-input" id="fnCadFormName" value="${this._esc(val('name'))}" placeholder="Razão social ou nome fantasia">
        </div>
        <div class="fn-drawer-grid">
          <div class="form-group">
            <label class="form-label">CNPJ</label>
            <input type="text" class="form-input" id="fnCadFormCnpj" value="${this._esc(val('cnpj'))}" placeholder="00.000.000/0000-00">
          </div>
          <div class="form-group">
            <label class="form-label">Contato</label>
            <input type="text" class="form-input" id="fnCadFormContact" value="${this._esc(val('contact_name'))}" placeholder="Nome do contato">
          </div>
        </div>
        <div class="fn-drawer-grid">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="fnCadFormEmail" value="${this._esc(val('email'))}" placeholder="contato@empresa.com">
          </div>
          <div class="form-group">
            <label class="form-label">Telefone</label>
            <input type="text" class="form-input" id="fnCadFormPhone" value="${this._esc(val('phone'))}" placeholder="(00) 00000-0000">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Observações</label>
          <textarea class="form-input" id="fnCadFormNotes" rows="3" placeholder="Notas sobre este cliente...">${this._esc(val('notes'))}</textarea>
        </div>
      </div>`;
    }

    if (entityType === 'cost_center') {
      return `<div class="fn-drawer-form">
        <div class="form-group">
          <label class="form-label">Nome <span class="required">*</span></label>
          <input type="text" class="form-input" id="fnCadFormName" value="${this._esc(val('name'))}" placeholder="Ex: Digital 3D">
        </div>
        <div class="fn-drawer-grid">
          <div class="form-group">
            <label class="form-label">Slug <span class="required">*</span></label>
            <input type="text" class="form-input" id="fnCadFormSlug" value="${this._esc(val('slug'))}" placeholder="ex: digital-3d">
          </div>
          <div class="form-group">
            <label class="form-label">Categoria</label>
            <select class="form-input" id="fnCadFormCategory">
              <option value="">Selecione...</option>
              <option value="Projetos & Produção" ${val('category') === 'Projetos & Produção' ? 'selected' : ''}>Projetos & Produção</option>
              <option value="Infraestrutura & Operação" ${val('category') === 'Infraestrutura & Operação' ? 'selected' : ''}>Infraestrutura & Operação</option>
              <option value="Financeiro & Encargos" ${val('category') === 'Financeiro & Encargos' ? 'selected' : ''}>Financeiro & Encargos</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="fnCadFormReqProject" ${val('requires_project') ? 'checked' : ''}>
            Requer projeto vinculado
          </label>
        </div>
        <div class="form-group">
          <label class="form-label">Descrição</label>
          <textarea class="form-input" id="fnCadFormNotes" rows="2" placeholder="Descrição do centro de custo...">${this._esc(val('description'))}</textarea>
        </div>
      </div>`;
    }

    return '<p>Tipo de cadastro não suportado.</p>';
  },

  async _saveCadastroForm(entityType, existingItem) {
    const name = document.getElementById('fnCadFormName')?.value?.trim();
    if (!name) { this._toast('warning', 'Preencha o nome.'); return; }

    try {
      if (entityType === 'vendor') {
        const data = {
          name,
          cnpj: document.getElementById('fnCadFormCnpj')?.value?.trim() || null,
          category: document.getElementById('fnCadFormCategory')?.value?.trim() || null,
          email: document.getElementById('fnCadFormEmail')?.value?.trim() || null,
          phone: document.getElementById('fnCadFormPhone')?.value?.trim() || null,
          notes: document.getElementById('fnCadFormNotes')?.value?.trim() || null
        };
        if (existingItem) {
          await FinanceRepo.updateVendor(existingItem.id, data);
        } else {
          await FinanceRepo.createVendor(data);
        }
      } else if (entityType === 'client') {
        const data = {
          name,
          cnpj: document.getElementById('fnCadFormCnpj')?.value?.trim() || null,
          contact_name: document.getElementById('fnCadFormContact')?.value?.trim() || null,
          email: document.getElementById('fnCadFormEmail')?.value?.trim() || null,
          phone: document.getElementById('fnCadFormPhone')?.value?.trim() || null,
          notes: document.getElementById('fnCadFormNotes')?.value?.trim() || null
        };
        if (existingItem) {
          await FinanceRepo.updateClient(existingItem.id, data);
        } else {
          await FinanceRepo.createClient(data);
        }
      } else if (entityType === 'cost_center') {
        const slug = document.getElementById('fnCadFormSlug')?.value?.trim();
        if (!slug) { this._toast('warning', 'Preencha o slug.'); return; }
        const data = {
          name,
          slug,
          category: document.getElementById('fnCadFormCategory')?.value || null,
          requires_project: document.getElementById('fnCadFormReqProject')?.checked || false,
          description: document.getElementById('fnCadFormNotes')?.value?.trim() || null
        };
        if (existingItem) {
          await FinanceRepo.updateCostCenter(existingItem.id, data);
        } else {
          await FinanceRepo.createCostCenter(data);
        }
      }

      this._toast('success', existingItem ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      this._closeDrawer();
      this._lookupsLoaded = false;
      await this._ensureLookups();
      this._loadCadastroSubTab();
    } catch (err) {
      console.error('[Financeiro] Erro ao salvar cadastro:', err);
      this._toast('error', err.message);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LOAD DASHBOARD (mantido da Entrega 1)
  // ═══════════════════════════════════════════════════════════════════════

  async _loadDashboard() {
    const container = document.getElementById('fnDashboardContent');
    if (!container) return;

    container.innerHTML = '<div class="fn-loading"><div class="loading-spinner"></div><p class="loading-text">Carregando dados financeiros...</p></div>';

    try {
      if (typeof FinanceRepo === 'undefined') throw new Error('FinanceRepo não está disponível');

      // Carregar todos os dados em paralelo
      const [kpis, costComp, delinquency, healthData, monthlyData, clientBreakdown] = await Promise.all([
        FinanceRepo.getDashboardKPIs(),
        FinanceRepo.getCostComposition(),
        FinanceRepo.getDelinquencyByClient(),
        FinanceRepo.getFinancialHealthData(),
        FinanceRepo.getMonthlyRevenueCost(),
        FinanceRepo.getClientBreakdown()
      ]);

      this._data = kpis;
      this._dashData = { kpis, costComp, delinquency, healthData, monthlyData, clientBreakdown };
      this._renderDashboard(container);
    } catch (err) {
      console.error('[Financeiro] Erro ao carregar dashboard:', err);
      container.innerHTML = this._renderError(err.message);
    }
  },

  _renderDashboard(container) {
    const { kpis, costComp, delinquency, healthData, monthlyData, clientBreakdown } = this._dashData;
    const fmt = this._fmt();
    const saldoColor = kpis.saldoAtual >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
    const projetadoColor = kpis.saldoProjetado >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
    const margemProj = kpis.aReceber30d > 0 ? (((kpis.aReceber30d - kpis.aPagar30d) / kpis.aReceber30d) * 100).toFixed(1) : '0.0';

    const saldoDateStr = kpis.saldoDate
      ? new Date(kpis.saldoDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : 'Sem registro';

    let html = '';

    // ── Omie Status Bar ──────────────────────────────────────────────────
    if (typeof TBO_OMIE !== 'undefined' && TBO_OMIE.isEnabled()) {
      const omieStatus = typeof TBO_OMIE_SYNC !== 'undefined' ? TBO_OMIE_SYNC.getStatus() : {};
      const lastSync = omieStatus.lastSync || localStorage.getItem('tbo_omie_last_sync');
      let syncLabel = 'Nao sincronizado';
      let syncColor = 'var(--text-secondary)';
      let syncIcon = 'cloud-off';

      if (omieStatus.syncing) {
        syncLabel = 'Sincronizando...';
        syncColor = '#3b82f6';
        syncIcon = 'loader';
      } else if (omieStatus.error) {
        syncLabel = 'Erro na sync';
        syncColor = '#ef4444';
        syncIcon = 'alert-triangle';
      } else if (lastSync) {
        const ago = Math.round((Date.now() - new Date(lastSync).getTime()) / 60000);
        syncLabel = ago < 60 ? `Sincronizado ha ${ago} min` : `Sincronizado ha ${Math.round(ago / 60)}h`;
        syncColor = '#22c55e';
        syncIcon = 'cloud';
      }

      const totalRegs = omieStatus.lastResult
        ? omieStatus.lastResult.total
        : '';

      html += `<div style="display:flex;align-items:center;gap:10px;padding:8px 14px;margin-bottom:12px;background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.12);border-radius:8px;font-size:12px;">
        <i data-lucide="${syncIcon}" style="width:14px;height:14px;color:${syncColor};${omieStatus.syncing ? 'animation:spin 1s linear infinite;' : ''}"></i>
        <span style="font-weight:500;color:${syncColor};">Omie</span>
        <span style="color:var(--text-secondary);">${syncLabel}</span>
        ${totalRegs ? `<span style="color:var(--text-secondary);margin-left:auto;">${totalRegs} registros</span>` : ''}
      </div>`;
    }

    // ══════════════════════════════════════════════════════════════════════
    // SEÇÃO 1 — SAÚDE FINANCEIRA (Score Gauge)
    // ══════════════════════════════════════════════════════════════════════
    html += this._renderFinHealthSection(healthData, fmt);

    // ── KPI Cards Row 1 (grid-4) ────────────────────────────────────────
    html += `<div class="grid-4 fn-kpi-grid" style="margin-bottom:16px;">
      <div class="kpi-card">
        <div class="kpi-label">Receita Total</div>
        <div class="kpi-value" style="color:var(--color-success);">${fmt.currency(healthData.receitaTotal)}</div>
        <div class="kpi-change neutral">${healthData.totalReceivables} parcelas</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Despesa Total</div>
        <div class="kpi-value" style="color:var(--color-danger);">${fmt.currency(healthData.despesaTotal)}</div>
        <div class="kpi-change neutral">${healthData.totalPayables} contas</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Resultado</div>
        <div class="kpi-value" style="color:${healthData.resultado >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${fmt.currency(healthData.resultado)}</div>
        <div class="kpi-change ${healthData.margem >= 0 ? 'positive' : 'negative'}">Margem ${healthData.margem.toFixed(1)}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">A Receber (30d)</div>
        <div class="kpi-value" style="color:var(--color-success);">${fmt.currency(kpis.aReceber30d)}</div>
        <div class="kpi-change neutral">${kpis.vencidasReceber > 0 ? kpis.vencidasReceber + ' atrasadas' : 'Tudo em dia'}</div>
      </div>
    </div>`;

    // ── KPI Cards Row 2 (grid-4) ────────────────────────────────────────
    html += `<div class="grid-4 fn-kpi-grid" style="margin-bottom:24px;">
      <div class="kpi-card">
        <div class="kpi-label">Atrasados (Receber)</div>
        <div class="kpi-value" style="color:${healthData.overdueRecTotal > 0 ? '#f59e0b' : 'var(--color-success)'};">${fmt.currency(healthData.overdueRecTotal)}</div>
        <div class="kpi-change ${delinquency.totalCount > 0 ? 'negative' : 'positive'}">${delinquency.totalCount} parcelas</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Clientes</div>
        <div class="kpi-value">${clientBreakdown.totalClientes}</div>
        <div class="kpi-change neutral">Ticket medio ${fmt.currency(clientBreakdown.ticketMedio)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Concentracao Top 5</div>
        <div class="kpi-value" style="color:${parseFloat(clientBreakdown.concentracaoTop5) > 60 ? '#f59e0b' : '#22c55e'};">${clientBreakdown.concentracaoTop5}%</div>
        <div class="kpi-change ${parseFloat(clientBreakdown.concentracaoTop5) > 60 ? 'negative' : 'positive'}">${parseFloat(clientBreakdown.concentracaoTop5) > 60 ? 'Risco de dependencia' : 'Diversificado'}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Saldo Atual</div>
        <div class="kpi-value" style="color:${saldoColor};">${fmt.currency(kpis.saldoAtual)}</div>
        <div class="kpi-change neutral">${saldoDateStr}</div>
      </div>
    </div>`;

    // ══════════════════════════════════════════════════════════════════════
    // SEÇÃO 2 — INSIGHTS & ALERTAS
    // ══════════════════════════════════════════════════════════════════════
    html += this._renderInsightsSection(healthData, delinquency, clientBreakdown, kpis, fmt);

    // ══════════════════════════════════════════════════════════════════════
    // SEÇÃO 3 — RECEITA × DESPESA MENSAL (gráfico Chart.js)
    // ══════════════════════════════════════════════════════════════════════
    html += `<div class="card" style="margin-bottom:16px;padding:16px;">
      <div class="card-header" style="margin-bottom:12px;"><h3 class="card-title">
        <i data-lucide="bar-chart-3" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;color:var(--accent);"></i>
        Receita × Despesa Mensal
      </h3></div>
      <div style="position:relative;height:300px;">
        <canvas id="fnChartRecDes"></canvas>
      </div>
    </div>`;

    // ══════════════════════════════════════════════════════════════════════
    // SEÇÃO 4 — RESULTADO MENSAL (gráfico Chart.js)
    // ══════════════════════════════════════════════════════════════════════
    html += `<div class="card" style="margin-bottom:16px;padding:16px;">
      <div class="card-header" style="margin-bottom:12px;"><h3 class="card-title">
        <i data-lucide="trending-up" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;color:var(--accent);"></i>
        Resultado Mensal
      </h3></div>
      <div style="position:relative;height:280px;">
        <canvas id="fnChartResultado"></canvas>
      </div>
    </div>`;

    // ══════════════════════════════════════════════════════════════════════
    // SEÇÃO 5 — COMPOSIÇÃO DE CUSTOS (donut + tabela)
    // ══════════════════════════════════════════════════════════════════════
    html += this._renderCostCompositionSection(costComp, fmt);

    // ══════════════════════════════════════════════════════════════════════
    // SEÇÃO 6 — INADIMPLÊNCIA POR CLIENTE
    // ══════════════════════════════════════════════════════════════════════
    html += this._renderDelinquencySection(delinquency, fmt);

    // ══════════════════════════════════════════════════════════════════════
    // SEÇÃO 7 — RANKING DE CLIENTES + DETALHAMENTO
    // ══════════════════════════════════════════════════════════════════════
    html += this._renderClientRankingSection(clientBreakdown, fmt);

    // ══════════════════════════════════════════════════════════════════════
    // SEÇÃO 8 — AÇÕES RECOMENDADAS
    // ══════════════════════════════════════════════════════════════════════
    html += this._renderRecommendedActions(healthData, delinquency, clientBreakdown, kpis, fmt);

    // ── Seções: Top Centro de Custo + Top Projetos ──────────────────────
    html += '<div class="grid-2" style="gap:16px;margin-bottom:16px;">';
    html += `<div class="card">
      <div class="card-header"><h3 class="card-title">Top Centros de Custo (mês)</h3></div>
      ${this._renderBarChart(kpis.topCostCenters, fmt)}
    </div>`;
    html += `<div class="card">
      <div class="card-header"><h3 class="card-title">Top Projetos (mês)</h3></div>
      ${this._renderBarChart(kpis.topProjects, fmt)}
    </div>`;
    html += '</div>';

    // ── Ação rápida: Registrar saldo ────────────────────────────────────
    html += `
    <div class="card" style="margin-top:16px;">
      <div class="card-header"><h3 class="card-title">Registrar Saldo Atual</h3></div>
      <div style="display:flex;gap:12px;align-items:flex-end;padding:0 0 4px;">
        <div class="form-group" style="flex:1;margin-bottom:0;">
          <label class="form-label">Saldo (R$)</label>
          <input type="number" class="form-input" id="fnBalanceInput" placeholder="Ex: 50000.00" step="0.01">
        </div>
        <div class="form-group" style="flex:1;margin-bottom:0;">
          <label class="form-label">Observação</label>
          <input type="text" class="form-input" id="fnBalanceNote" placeholder="Ex: Saldo bancário fev/2026">
        </div>
        <button class="btn btn-primary" id="fnSaveBalanceBtn" style="white-space:nowrap;">Salvar Saldo</button>
      </div>
    </div>`;

    container.innerHTML = html;

    // ── Event listeners ─────────────────────────────────────────────────
    const saveBalanceBtn = document.getElementById('fnSaveBalanceBtn');
    if (saveBalanceBtn) saveBalanceBtn.addEventListener('click', () => this._saveBalance());

    if (window.lucide) lucide.createIcons();

    // ── Inicializar graficos Chart.js ────────────────────────────────────
    this._initDashboardCharts(monthlyData);
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SAÚDE FINANCEIRA — Score Gauge
  // ═══════════════════════════════════════════════════════════════════════

  _calcHealthScore(h) {
    // Pontuacao de 0 a 100 baseada em 5 indicadores
    let score = 0;

    // 1. Margem operacional (peso 25) — margem > 10% = bom
    const margemScore = Math.min(h.margem / 20 * 25, 25);
    score += Math.max(margemScore, 0);

    // 2. Inadimplencia (peso 25) — quanto menor melhor
    const inadRate = h.receitaTotal > 0 ? (h.overdueRecTotal / h.receitaTotal) : 0;
    score += Math.max(25 - (inadRate * 100), 0);

    // 3. Pontualidade de pagamento (peso 20)
    score += h.paymentOnTimeRatio * 20;

    // 4. Pontualidade de recebimento (peso 15)
    score += h.collectionOnTimeRatio * 15;

    // 5. Cobertura de caixa 30d (peso 15) — saldo cobre compromissos
    const cobScore = Math.min(h.cobertura30d, 2) / 2 * 15;
    score += cobScore;

    return Math.round(Math.max(0, Math.min(100, score)));
  },

  _renderFinHealthSection(healthData, fmt) {
    const score = this._calcHealthScore(healthData);
    let label, color, bgColor, icon;

    if (score >= 80) {
      label = 'Excelente'; color = '#22c55e'; bgColor = 'rgba(34,197,94,0.08)'; icon = 'shield-check';
    } else if (score >= 60) {
      label = 'Bom'; color = '#3b82f6'; bgColor = 'rgba(59,130,246,0.08)'; icon = 'shield';
    } else if (score >= 40) {
      label = 'Atencao'; color = '#f59e0b'; bgColor = 'rgba(245,158,11,0.08)'; icon = 'alert-triangle';
    } else {
      label = 'Critico'; color = '#ef4444'; bgColor = 'rgba(239,68,68,0.08)'; icon = 'shield-alert';
    }

    // SVG gauge arc
    const radius = 54;
    const circumference = Math.PI * radius; // semicirculo
    const offset = circumference - (score / 100) * circumference;

    return `
    <div class="card" style="margin-bottom:16px;padding:20px;background:${bgColor};border:1px solid ${color}22;">
      <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;">
        <!-- Gauge SVG -->
        <div style="position:relative;width:130px;height:80px;flex-shrink:0;">
          <svg viewBox="0 0 120 70" style="width:130px;height:80px;">
            <!-- Track -->
            <path d="M 6 64 A 54 54 0 0 1 114 64" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8" stroke-linecap="round"/>
            <!-- Fill -->
            <path d="M 6 64 A 54 54 0 0 1 114 64" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" style="transition:stroke-dashoffset 1s ease;"/>
          </svg>
          <div style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);text-align:center;">
            <div style="font-size:1.5rem;font-weight:800;color:${color};">${score}</div>
          </div>
        </div>
        <!-- Info -->
        <div style="flex:1;min-width:200px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <i data-lucide="${icon}" style="width:20px;height:20px;color:${color};"></i>
            <span style="font-size:1.1rem;font-weight:700;color:${color};">Saude Financeira: ${label}</span>
          </div>
          <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:0.78rem;color:var(--text-secondary);">
            <span>Margem: <strong style="color:${healthData.margem >= 0 ? '#22c55e' : '#ef4444'};">${healthData.margem.toFixed(1)}%</strong></span>
            <span>Inadimplencia: <strong style="color:${healthData.overdueRecTotal > 0 ? '#ef4444' : '#22c55e'};">${fmt.currency(healthData.overdueRecTotal)}</strong></span>
            <span>Pag. em dia: <strong>${Math.round(healthData.paymentOnTimeRatio * 100)}%</strong></span>
            <span>Receb. em dia: <strong>${Math.round(healthData.collectionOnTimeRatio * 100)}%</strong></span>
            <span>Cobertura 30d: <strong style="color:${healthData.cobertura30d >= 1 ? '#22c55e' : '#ef4444'};">${healthData.cobertura30d >= 100 ? '∞' : (healthData.cobertura30d * 100).toFixed(0) + '%'}</strong></span>
          </div>
        </div>
      </div>
    </div>`;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // INSIGHTS & ALERTAS
  // ═══════════════════════════════════════════════════════════════════════

  _renderInsightsSection(healthData, delinquency, clientBreakdown, kpis, fmt) {
    const insights = [];

    // ── Gerar insights automaticos ──────────────────────────────────────

    // 1. Inadimplencia alta
    if (delinquency.totalOverdue > 0) {
      const pctInad = healthData.receitaTotal > 0
        ? ((delinquency.totalOverdue / healthData.receitaTotal) * 100).toFixed(1)
        : '0';
      const topClient = delinquency.clients[0];
      insights.push({
        type: 'danger',
        icon: 'alert-circle',
        title: `Inadimplencia: ${fmt.currency(delinquency.totalOverdue)}`,
        desc: `${delinquency.totalCount} parcelas atrasadas de ${delinquency.clients.length} clientes (${pctInad}% da receita). Maior devedor: ${topClient ? this._esc(topClient.clientName) + ' (' + fmt.currency(topClient.totalOverdue) + ')' : 'N/A'}.`
      });
    }

    // 2. Margem apertada
    if (healthData.margem < 5 && healthData.margem >= 0) {
      insights.push({
        type: 'warning',
        icon: 'alert-triangle',
        title: `Margem muito apertada: ${healthData.margem.toFixed(1)}%`,
        desc: `O resultado esta positivo mas a margem e inferior a 5%. Qualquer imprevisto pode gerar prejuizo. Revise custos operacionais.`
      });
    } else if (healthData.margem < 0) {
      insights.push({
        type: 'danger',
        icon: 'trending-down',
        title: `Resultado negativo: margem ${healthData.margem.toFixed(1)}%`,
        desc: `As despesas (${fmt.currency(healthData.despesaTotal)}) superam as receitas (${fmt.currency(healthData.receitaTotal)}). Deficit de ${fmt.currency(Math.abs(healthData.resultado))}.`
      });
    }

    // 3. Concentracao de clientes
    const concPct = parseFloat(clientBreakdown.concentracaoTop5);
    if (concPct > 60) {
      insights.push({
        type: 'warning',
        icon: 'users',
        title: `Alta concentracao: Top 5 = ${clientBreakdown.concentracaoTop5}%`,
        desc: `Mais de 60% da receita depende de apenas 5 clientes. Risco elevado caso algum deles rescinda contratos.`
      });
    }

    // 4. Cobertura de caixa baixa
    if (healthData.cobertura30d < 1 && healthData.upcoming30d > 0) {
      insights.push({
        type: 'danger',
        icon: 'wallet',
        title: 'Saldo insuficiente para 30 dias',
        desc: `Saldo atual (${fmt.currency(healthData.saldoAtual)}) nao cobre compromissos dos proximos 30 dias (${fmt.currency(healthData.upcoming30d)}). Gap de ${fmt.currency(healthData.upcoming30d - healthData.saldoAtual)}.`
      });
    }

    // 5. Contas vencidas a pagar
    if (healthData.overduePayTotal > 0) {
      insights.push({
        type: 'warning',
        icon: 'clock',
        title: `Contas a pagar vencidas: ${fmt.currency(healthData.overduePayTotal)}`,
        desc: `Existem ${kpis.vencidasPagar} contas a pagar com vencimento ultrapassado. Risco de juros e multa.`
      });
    }

    // 6. Boa performance
    if (healthData.margem >= 10 && delinquency.totalCount === 0 && healthData.paymentOnTimeRatio >= 0.9) {
      insights.push({
        type: 'success',
        icon: 'check-circle',
        title: 'Performance financeira excelente',
        desc: `Margem de ${healthData.margem.toFixed(1)}%, zero inadimplencia e ${Math.round(healthData.paymentOnTimeRatio * 100)}% dos pagamentos em dia. Continue assim!`
      });
    }

    // 7. Pontualidade de recebimento baixa
    if (healthData.collectionOnTimeRatio < 0.7 && healthData.totalReceivables > 5) {
      insights.push({
        type: 'warning',
        icon: 'calendar-x',
        title: `Recebimentos atrasados frequentes`,
        desc: `Apenas ${Math.round(healthData.collectionOnTimeRatio * 100)}% dos recebimentos dos ultimos 90 dias foram pontuais. Considere rever politica de cobranca.`
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'info',
        icon: 'info',
        title: 'Sem alertas no momento',
        desc: 'Todos os indicadores financeiros estao dentro dos parametros normais.'
      });
    }

    const typeColors = {
      danger:  { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)', color: '#ef4444' },
      warning: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
      success: { bg: 'rgba(34,197,94,0.06)',  border: 'rgba(34,197,94,0.2)',  color: '#22c55e' },
      info:    { bg: 'rgba(59,130,246,0.06)',  border: 'rgba(59,130,246,0.2)', color: '#3b82f6' }
    };

    let html = `<div class="card" style="margin-bottom:16px;padding:16px;">
      <div class="card-header" style="margin-bottom:12px;"><h3 class="card-title">
        <i data-lucide="sparkles" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;color:var(--accent);"></i>
        Insights & Alertas
      </h3></div>
      <div style="display:flex;flex-direction:column;gap:8px;">`;

    insights.forEach(ins => {
      const tc = typeColors[ins.type] || typeColors.info;
      html += `<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 14px;background:${tc.bg};border:1px solid ${tc.border};border-radius:8px;">
        <i data-lucide="${ins.icon}" style="width:18px;height:18px;color:${tc.color};flex-shrink:0;margin-top:1px;"></i>
        <div>
          <div style="font-weight:600;font-size:0.85rem;color:${tc.color};margin-bottom:2px;">${ins.title}</div>
          <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.4;">${ins.desc}</div>
        </div>
      </div>`;
    });

    html += '</div></div>';
    return html;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // COMPOSIÇÃO DE CUSTOS (Donut + Tabela)
  // ═══════════════════════════════════════════════════════════════════════

  _renderCostCompositionSection(costComp, fmt) {
    const { byCategory, byCostCenter, totalDespesas } = costComp;

    // Cores para donut
    const donutColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#e11d48'];

    let html = `<div class="card" style="margin-bottom:16px;padding:16px;">
      <div class="card-header" style="margin-bottom:12px;"><h3 class="card-title">
        <i data-lucide="pie-chart" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;color:var(--accent);"></i>
        Composicao de Custos
      </h3>
      <span style="font-size:0.78rem;color:var(--text-secondary);margin-left:auto;">Total: ${fmt.currency(totalDespesas)}</span>
      </div>`;

    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">';

    // ── Donut chart (canvas) ──
    html += `<div style="position:relative;display:flex;align-items:center;justify-content:center;">
      <canvas id="fnChartDonut" style="max-height:260px;"></canvas>
    </div>`;

    // ── Tabela de categorias ──
    html += '<div style="overflow-x:auto;"><table style="width:100%;font-size:0.8rem;border-collapse:collapse;">';
    html += '<thead><tr style="border-bottom:1px solid var(--border-color);">';
    html += '<th style="text-align:left;padding:6px 8px;font-weight:600;">Categoria</th>';
    html += '<th style="text-align:right;padding:6px 8px;font-weight:600;">Valor</th>';
    html += '<th style="text-align:right;padding:6px 8px;font-weight:600;">%</th>';
    html += '<th style="text-align:right;padding:6px 8px;font-weight:600;">Qtd</th>';
    html += '</tr></thead><tbody>';

    byCategory.slice(0, 12).forEach((cat, i) => {
      const pct = totalDespesas > 0 ? ((cat.total / totalDespesas) * 100).toFixed(1) : '0.0';
      const color = donutColors[i % donutColors.length];
      html += `<tr style="border-bottom:1px solid var(--border-color-light);">
        <td style="padding:5px 8px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px;vertical-align:middle;"></span>${this._esc(cat.name)}</td>
        <td style="text-align:right;padding:5px 8px;font-weight:500;">${fmt.currency(cat.total)}</td>
        <td style="text-align:right;padding:5px 8px;color:var(--text-secondary);">${pct}%</td>
        <td style="text-align:right;padding:5px 8px;color:var(--text-secondary);">${cat.count}</td>
      </tr>`;
    });

    html += '</tbody></table></div>';
    html += '</div>'; // grid

    // ── Centro de Custo breakdown ──
    if (byCostCenter.length > 0) {
      html += `<div style="margin-top:16px;">
        <div style="font-weight:600;font-size:0.82rem;margin-bottom:8px;color:var(--text-primary);">Por Centro de Custo</div>`;
      const maxCC = Math.max(...byCostCenter.map(c => c.total), 1);
      byCostCenter.slice(0, 8).forEach(cc => {
        const pct = Math.max(Math.round((cc.total / maxCC) * 100), 3);
        const pctTotal = totalDespesas > 0 ? ((cc.total / totalDespesas) * 100).toFixed(1) : '0';
        html += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:5px;font-size:0.78rem;">
          <span style="width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this._esc(cc.name)}">${this._esc(cc.name)}</span>
          <div style="flex:1;height:14px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg, #3b82f6, #8b5cf6);border-radius:4px;transition:width 0.3s;"></div>
          </div>
          <span style="width:90px;text-align:right;font-weight:500;">${fmt.currency(cc.total)}</span>
          <span style="width:40px;text-align:right;color:var(--text-secondary);">${pctTotal}%</span>
        </div>`;
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // INADIMPLÊNCIA POR CLIENTE
  // ═══════════════════════════════════════════════════════════════════════

  _renderDelinquencySection(delinquency, fmt) {
    if (delinquency.clients.length === 0) {
      return `<div class="card" style="margin-bottom:16px;padding:16px;">
        <div class="card-header"><h3 class="card-title">
          <i data-lucide="user-x" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;color:var(--accent);"></i>
          Inadimplencia por Cliente
        </h3></div>
        <div style="text-align:center;padding:24px;color:var(--text-secondary);font-size:0.85rem;">
          <i data-lucide="check-circle" style="width:32px;height:32px;color:#22c55e;margin-bottom:8px;"></i>
          <p>Nenhuma inadimplencia! Todos os clientes estao em dia.</p>
        </div>
      </div>`;
    }

    let html = `<div class="card" style="margin-bottom:16px;padding:16px;">
      <div class="card-header" style="margin-bottom:12px;">
        <h3 class="card-title">
          <i data-lucide="user-x" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;color:#ef4444;"></i>
          Inadimplencia por Cliente
        </h3>
        <span style="font-size:0.78rem;color:#ef4444;font-weight:600;margin-left:auto;">${fmt.currency(delinquency.totalOverdue)} em atraso</span>
      </div>
      <div style="overflow-x:auto;">
        <table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
          <thead><tr style="border-bottom:2px solid var(--border-color);">
            <th style="text-align:left;padding:8px;">Cliente</th>
            <th style="text-align:right;padding:8px;">Valor em Atraso</th>
            <th style="text-align:center;padding:8px;">Parcelas</th>
            <th style="text-align:center;padding:8px;">Dias Atraso</th>
            <th style="text-align:center;padding:8px;">Gravidade</th>
          </tr></thead>
          <tbody>`;

    delinquency.clients.forEach(c => {
      let severity, sevColor;
      if (c.daysOverdue > 60) { severity = 'Critico'; sevColor = '#ef4444'; }
      else if (c.daysOverdue > 30) { severity = 'Alto'; sevColor = '#f97316'; }
      else if (c.daysOverdue > 15) { severity = 'Medio'; sevColor = '#f59e0b'; }
      else { severity = 'Baixo'; sevColor = '#eab308'; }

      html += `<tr style="border-bottom:1px solid var(--border-color-light);">
        <td style="padding:8px;">
          <div style="font-weight:600;">${this._esc(c.clientName)}</div>
          ${c.email ? `<div style="font-size:0.72rem;color:var(--text-secondary);">${this._esc(c.email)}</div>` : ''}
        </td>
        <td style="text-align:right;padding:8px;font-weight:600;color:#ef4444;">${fmt.currency(c.totalOverdue)}</td>
        <td style="text-align:center;padding:8px;">${c.count}</td>
        <td style="text-align:center;padding:8px;font-weight:500;">${c.daysOverdue}d</td>
        <td style="text-align:center;padding:8px;">
          <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:0.72rem;font-weight:600;background:${sevColor}18;color:${sevColor};">${severity}</span>
        </td>
      </tr>`;
    });

    html += '</tbody></table></div></div>';
    return html;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // RANKING DE CLIENTES + DETALHAMENTO
  // ═══════════════════════════════════════════════════════════════════════

  _renderClientRankingSection(clientBreakdown, fmt) {
    const { clients, receitaTotal } = clientBreakdown;

    if (clients.length === 0) {
      return `<div class="card" style="margin-bottom:16px;padding:16px;">
        <div class="card-header"><h3 class="card-title">Ranking de Clientes por Receita</h3></div>
        <div style="text-align:center;padding:24px;color:var(--text-secondary);">Sem dados de clientes.</div>
      </div>`;
    }

    // ── Ranking visual (top 10 barras) ──
    let html = `<div class="card" style="margin-bottom:16px;padding:16px;">
      <div class="card-header" style="margin-bottom:12px;"><h3 class="card-title">
        <i data-lucide="trophy" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;color:var(--accent);"></i>
        Ranking de Clientes por Receita
      </h3></div>`;

    const maxRev = clients.length > 0 ? clients[0].receita : 1;
    clients.slice(0, 10).forEach((c, i) => {
      const pct = Math.max(Math.round((c.receita / maxRev) * 100), 3);
      const pctTotal = receitaTotal > 0 ? ((c.receita / receitaTotal) * 100).toFixed(1) : '0';
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
      html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:0.8rem;">
        <span style="width:28px;text-align:center;font-size:${i < 3 ? '1rem' : '0.75rem'};font-weight:600;color:var(--text-secondary);">${medal}</span>
        <span style="width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;" title="${this._esc(c.name)}">${this._esc(c.name)}</span>
        <div style="flex:1;height:16px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg, #22c55e, #3b82f6);border-radius:4px;transition:width 0.3s;"></div>
        </div>
        <span style="width:90px;text-align:right;font-weight:600;">${fmt.currency(c.receita)}</span>
        <span style="width:40px;text-align:right;color:var(--text-secondary);font-size:0.75rem;">${pctTotal}%</span>
      </div>`;
    });

    html += '</div>';

    // ── Tabela detalhada ──
    html += `<div class="card" style="margin-bottom:16px;padding:16px;">
      <div class="card-header" style="margin-bottom:12px;"><h3 class="card-title">
        <i data-lucide="table" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;color:var(--accent);"></i>
        Detalhamento por Cliente
      </h3></div>
      <div style="overflow-x:auto;">
        <table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
          <thead><tr style="border-bottom:2px solid var(--border-color);">
            <th style="text-align:center;padding:8px;width:30px;">#</th>
            <th style="text-align:left;padding:8px;">Cliente</th>
            <th style="text-align:right;padding:8px;">Receita</th>
            <th style="text-align:center;padding:8px;">Parcelas</th>
            <th style="text-align:center;padding:8px;">% Pago</th>
            <th style="text-align:right;padding:8px;">Em Atraso</th>
            <th style="text-align:center;padding:8px;">Status</th>
          </tr></thead>
          <tbody>`;

    clients.forEach((c, i) => {
      html += `<tr style="border-bottom:1px solid var(--border-color-light);">
        <td style="text-align:center;padding:6px 8px;color:var(--text-secondary);font-weight:500;">${i + 1}</td>
        <td style="padding:6px 8px;font-weight:500;">${this._esc(c.name)}</td>
        <td style="text-align:right;padding:6px 8px;font-weight:600;">${fmt.currency(c.receita)}</td>
        <td style="text-align:center;padding:6px 8px;">${c.parcelas}</td>
        <td style="text-align:center;padding:6px 8px;">
          <div style="display:flex;align-items:center;gap:6px;justify-content:center;">
            <div style="width:50px;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${c.pctPago}%;background:${c.pctPago >= 90 ? '#22c55e' : c.pctPago >= 50 ? '#3b82f6' : '#f59e0b'};border-radius:3px;"></div>
            </div>
            <span style="font-size:0.75rem;font-weight:500;">${c.pctPago}%</span>
          </div>
        </td>
        <td style="text-align:right;padding:6px 8px;color:${c.atrasado > 0 ? '#ef4444' : 'var(--text-secondary)'};">${c.atrasado > 0 ? fmt.currency(c.atrasado) : '—'}</td>
        <td style="text-align:center;padding:6px 8px;">
          <span style="display:inline-block;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;background:${c.statusColor}18;color:${c.statusColor};">${c.statusLabel}</span>
        </td>
      </tr>`;
    });

    html += '</tbody></table></div></div>';
    return html;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // AÇÕES RECOMENDADAS
  // ═══════════════════════════════════════════════════════════════════════

  _renderRecommendedActions(healthData, delinquency, clientBreakdown, kpis, fmt) {
    const actions = [];

    // 1. Cobrar inadimplentes
    if (delinquency.clients.length > 0) {
      const topDelinquent = delinquency.clients[0];
      actions.push({
        icon: 'phone-call',
        color: '#ef4444',
        priority: 'Urgente',
        title: 'Cobrar clientes inadimplentes',
        desc: `${delinquency.clients.length} cliente(s) com parcelas atrasadas. Priorizar ${this._esc(topDelinquent.clientName)} (${fmt.currency(topDelinquent.totalOverdue)}, ${topDelinquent.daysOverdue} dias).`,
        action: 'Enviar cobranca'
      });
    }

    // 2. Regularizar contas vencidas a pagar
    if (healthData.overduePayTotal > 0) {
      actions.push({
        icon: 'credit-card',
        color: '#f59e0b',
        priority: 'Alta',
        title: 'Regularizar contas a pagar vencidas',
        desc: `${fmt.currency(healthData.overduePayTotal)} em contas a pagar com vencimento ultrapassado. Evitar juros e multas.`,
        action: 'Ver contas vencidas'
      });
    }

    // 3. Registrar saldo
    if (!kpis.saldoDate || (Date.now() - new Date(kpis.saldoDate).getTime()) > 7 * 86400000) {
      actions.push({
        icon: 'landmark',
        color: '#3b82f6',
        priority: 'Media',
        title: 'Atualizar saldo bancario',
        desc: kpis.saldoDate
          ? `Ultimo registro de saldo foi ${new Date(kpis.saldoDate).toLocaleDateString('pt-BR')}. Mantenha atualizado para projecoes precisas.`
          : 'Nenhum saldo registrado. Registre o saldo bancario atual para habilitar projecoes de caixa.',
        action: 'Registrar saldo'
      });
    }

    // 4. Diversificar base de clientes
    const conc = parseFloat(clientBreakdown.concentracaoTop5);
    if (conc > 60) {
      actions.push({
        icon: 'users',
        color: '#8b5cf6',
        priority: 'Estrategica',
        title: 'Diversificar base de clientes',
        desc: `Top 5 clientes representam ${clientBreakdown.concentracaoTop5}% da receita. Busque novos clientes para reduzir risco de concentracao.`,
        action: 'Ver pipeline CRM'
      });
    }

    // 5. Revisar custos
    if (healthData.margem < 10 && healthData.margem >= 0) {
      actions.push({
        icon: 'scissors',
        color: '#f97316',
        priority: 'Media',
        title: 'Revisar estrutura de custos',
        desc: `Margem de ${healthData.margem.toFixed(1)}% esta abaixo do ideal (>10%). Analise a composicao de custos e identifique oportunidades de reducao.`,
        action: 'Ver custos'
      });
    }

    // 6. Melhorar pontualidade de recebimento
    if (healthData.collectionOnTimeRatio < 0.8 && healthData.totalReceivables > 5) {
      actions.push({
        icon: 'calendar-check',
        color: '#06b6d4',
        priority: 'Media',
        title: 'Melhorar pontualidade de recebimentos',
        desc: `Apenas ${Math.round(healthData.collectionOnTimeRatio * 100)}% dos recebimentos foram pontuais. Considere enviar lembretes automaticos antes do vencimento.`,
        action: 'Configurar lembretes'
      });
    }

    if (actions.length === 0) {
      return `<div class="card" style="margin-bottom:16px;padding:16px;">
        <div class="card-header"><h3 class="card-title">
          <i data-lucide="lightbulb" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;color:var(--accent);"></i>
          Acoes Recomendadas
        </h3></div>
        <div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:0.85rem;">
          <i data-lucide="thumbs-up" style="width:28px;height:28px;color:#22c55e;margin-bottom:8px;"></i>
          <p>Tudo em ordem! Nenhuma acao urgente no momento.</p>
        </div>
      </div>`;
    }

    let html = `<div class="card" style="margin-bottom:16px;padding:16px;">
      <div class="card-header" style="margin-bottom:12px;"><h3 class="card-title">
        <i data-lucide="lightbulb" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;color:var(--accent);"></i>
        Acoes Recomendadas
      </h3></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:12px;">`;

    actions.forEach(a => {
      const prioColors = {
        'Urgente': '#ef4444', 'Alta': '#f59e0b', 'Media': '#3b82f6', 'Estrategica': '#8b5cf6'
      };
      const prioColor = prioColors[a.priority] || '#6b7280';

      html += `<div style="border:1px solid ${a.color}22;border-radius:10px;padding:14px;background:${a.color}06;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <i data-lucide="${a.icon}" style="width:16px;height:16px;color:${a.color};"></i>
          <span style="font-weight:600;font-size:0.85rem;color:var(--text-primary);flex:1;">${a.title}</span>
          <span style="font-size:0.68rem;font-weight:600;padding:2px 6px;border-radius:6px;background:${prioColor}18;color:${prioColor};">${a.priority}</span>
        </div>
        <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.4;margin-bottom:10px;">${a.desc}</div>
      </div>`;
    });

    html += '</div></div>';
    return html;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CHARTS — Inicialização Chart.js
  // ═══════════════════════════════════════════════════════════════════════

  _initDashboardCharts(monthlyData) {
    if (typeof Chart === 'undefined') {
      console.warn('[Financeiro] Chart.js nao disponivel, graficos desabilitados.');
      return;
    }

    // Destruir charts anteriores
    if (this._chartRecDes) { this._chartRecDes.destroy(); this._chartRecDes = null; }
    if (this._chartResultado) { this._chartResultado.destroy(); this._chartResultado = null; }
    if (this._chartDonut) { this._chartDonut.destroy(); this._chartDonut = null; }

    const labels = monthlyData.map(m => m.label);
    const receitas = monthlyData.map(m => m.receita);
    const despesas = monthlyData.map(m => m.despesa);
    const resultados = monthlyData.map(m => m.resultado);

    // Acumulado
    let acum = 0;
    const acumulado = monthlyData.map(m => { acum += m.resultado; return acum; });

    const chartDefaults = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: R$ ${(ctx.raw || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
          }
        }
      },
      scales: {
        x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: {
          ticks: {
            color: '#64748b', font: { size: 10 },
            callback: (v) => 'R$ ' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)
          },
          grid: { color: 'rgba(255,255,255,0.04)' }
        }
      }
    };

    // ── Grafico Receita × Despesa ──
    const ctxRD = document.getElementById('fnChartRecDes');
    if (ctxRD) {
      this._chartRecDes = new Chart(ctxRD, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Receita',
              data: receitas,
              backgroundColor: 'rgba(34,197,94,0.7)',
              borderColor: '#22c55e',
              borderWidth: 1,
              borderRadius: 4,
              barPercentage: 0.4,
              categoryPercentage: 0.8
            },
            {
              label: 'Despesa',
              data: despesas,
              backgroundColor: 'rgba(239,68,68,0.7)',
              borderColor: '#ef4444',
              borderWidth: 1,
              borderRadius: 4,
              barPercentage: 0.4,
              categoryPercentage: 0.8
            },
            {
              label: 'Acumulado',
              data: acumulado,
              type: 'line',
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59,130,246,0.1)',
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: '#3b82f6',
              fill: true,
              tension: 0.3,
              yAxisID: 'y'
            }
          ]
        },
        options: chartDefaults
      });
    }

    // ── Grafico Resultado Mensal ──
    const ctxRes = document.getElementById('fnChartResultado');
    if (ctxRes) {
      this._chartResultado = new Chart(ctxRes, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Resultado',
            data: resultados,
            backgroundColor: resultados.map(v => v >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)'),
            borderColor: resultados.map(v => v >= 0 ? '#22c55e' : '#ef4444'),
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          ...chartDefaults,
          plugins: {
            ...chartDefaults.plugins,
            legend: { display: false }
          }
        }
      });
    }

    // ── Donut Composicao de Custos ──
    const ctxDonut = document.getElementById('fnChartDonut');
    if (ctxDonut && this._dashData) {
      const cats = this._dashData.costComp.byCategory.slice(0, 10);
      const donutColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'];

      this._chartDonut = new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
          labels: cats.map(c => c.name),
          datasets: [{
            data: cats.map(c => c.total),
            backgroundColor: donutColors.slice(0, cats.length),
            borderColor: 'rgba(0,0,0,0.2)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '55%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#94a3b8', font: { size: 10 }, padding: 8, boxWidth: 12 }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const total = ctx.dataset.data.reduce((s, v) => s + v, 0);
                  const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : '0';
                  return `${ctx.label}: R$ ${ctx.raw.toLocaleString('pt-BR')} (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  _renderBarChart(items, fmt) {
    if (!items || items.length === 0) {
      return '<div class="fn-empty-chart"><span>Sem dados para o mês atual</span></div>';
    }
    const maxVal = Math.max(...items.map(i => i.total), 1);
    return `<div class="fn-bar-chart">
      ${items.map(item => {
        const pct = Math.max(Math.round((item.total / maxVal) * 100), 3);
        return `<div class="fn-bar-item">
          <div class="fn-bar-label">${this._esc(item.name)}</div>
          <div class="fn-bar-track">
            <div class="fn-bar-fill" style="width:${pct}%;"></div>
          </div>
          <div class="fn-bar-value">${fmt.currency(item.total)}</div>
        </div>`;
      }).join('')}
    </div>`;
  },

  _renderError(msg) {
    return `
      <div class="fn-error">
        <i data-lucide="alert-triangle" style="width:40px;height:40px;color:var(--color-danger);margin-bottom:12px;"></i>
        <h3>Erro ao carregar dados financeiros</h3>
        <p>${this._esc(msg)}</p>
        <button class="btn btn-primary" id="fnRetryBtn" style="margin-top:12px;" onclick="TBO_FINANCEIRO._onRefresh()">Tentar novamente</button>
      </div>`;
  },

  _esc(str) {
    if (typeof TBO_SANITIZE !== 'undefined' && TBO_SANITIZE.html) return TBO_SANITIZE.html(str);
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.escapeHtml) return TBO_FORMATTER.escapeHtml(str);
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  },

  _toast(type, msg) {
    if (typeof TBO_TOAST !== 'undefined') {
      const titles = { success: 'Sucesso', error: 'Erro', warning: 'Atenção', info: 'Info' };
      TBO_TOAST[type]?.(titles[type] || '', msg);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // AÇÕES
  // ═══════════════════════════════════════════════════════════════════════

  async _saveBalance() {
    const input = document.getElementById('fnBalanceInput');
    const noteInput = document.getElementById('fnBalanceNote');
    const balance = parseFloat(input?.value);
    const note = noteInput?.value || '';

    if (isNaN(balance)) {
      this._toast('warning', 'Informe o saldo atual.');
      return;
    }

    try {
      await FinanceRepo.recordBalance(balance, note);
      const fmt = this._fmt();
      this._toast('success', `Saldo de ${fmt.currency(balance)} salvo com sucesso.`);
      if (input) input.value = '';
      if (noteInput) noteInput.value = '';
      this._loadDashboard();
    } catch (err) {
      console.error('[Financeiro] Erro ao salvar saldo:', err);
      this._toast('error', err.message);
    }
  }
};
