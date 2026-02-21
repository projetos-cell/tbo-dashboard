/**
 * TBO OS — Módulo Financeiro (v2 — MVP Supabase)
 *
 * Dashboard financeiro integrado ao Supabase via FinanceRepo.
 * Tabs: Dashboard | A Pagar | A Receber | Caixa | Inbox | Cadastros
 * Entrega 1: Dashboard com KPIs reais.
 * Entregas 2-3: CRUD completo (placeholder por enquanto).
 *
 * Rota: #financeiro
 * Global: TBO_FINANCEIRO
 */
const TBO_FINANCEIRO = {

  // ── Estado interno ───────────────────────────────────────────────────
  _data: null,
  _activeTab: 'fn-dashboard',
  _refreshTimer: null,

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
          <div class="fn-placeholder">
            <i data-lucide="credit-card" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:12px;"></i>
            <h3>Contas a Pagar</h3>
            <p>Módulo em desenvolvimento — Entrega 2</p>
            <span class="tag">Em breve: CRUD completo com workflow de aprovação</span>
          </div>
        </div>

        <!-- ══════════ Tab: A Receber ══════════ -->
        <div class="tab-panel" id="tab-fn-receber" style="display:none;">
          <div class="fn-placeholder">
            <i data-lucide="wallet" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:12px;"></i>
            <h3>Contas a Receber</h3>
            <p>Módulo em desenvolvimento — Entrega 2</p>
            <span class="tag">Em breve: CRUD com status previsto → emitido → pago</span>
          </div>
        </div>

        <!-- ══════════ Tab: Caixa ══════════ -->
        <div class="tab-panel" id="tab-fn-caixa" style="display:none;">
          <div class="fn-placeholder">
            <i data-lucide="trending-up" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:12px;"></i>
            <h3>Fluxo de Caixa (30 dias)</h3>
            <p>Módulo em desenvolvimento — Entrega 3</p>
            <span class="tag">Em breve: Projeção dia-a-dia com saldo acumulado</span>
          </div>
        </div>

        <!-- ══════════ Tab: Inbox ══════════ -->
        <div class="tab-panel" id="tab-fn-inbox" style="display:none;">
          <div class="fn-placeholder">
            <i data-lucide="bell" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:12px;"></i>
            <h3>Pendências Financeiras</h3>
            <p>Módulo em desenvolvimento — Entrega 3</p>
            <span class="tag">Em breve: Lista automática de contas sem CC, vencidas, aguardando aprovação</span>
          </div>
        </div>

        <!-- ══════════ Tab: Cadastros ══════════ -->
        <div class="tab-panel" id="tab-fn-cadastros" style="display:none;">
          <div class="fn-placeholder">
            <i data-lucide="database" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:12px;"></i>
            <h3>Cadastros</h3>
            <p>Módulo em desenvolvimento — Entrega 3</p>
            <span class="tag">Em breve: Clientes, Fornecedores, Centros de Custo</span>
          </div>
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════════

  init() {
    // Tabs
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
      });
    });

    // Botão refresh
    const refreshBtn = document.getElementById('fnRefreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this._loadDashboard());
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
    this._data = null;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LOAD DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════

  async _loadDashboard() {
    const container = document.getElementById('fnDashboardContent');
    if (!container) return;

    // Loading state
    container.innerHTML = `
      <div class="fn-loading">
        <div class="loading-spinner"></div>
        <p class="loading-text">Carregando dados financeiros...</p>
      </div>`;

    try {
      if (typeof FinanceRepo === 'undefined') {
        throw new Error('FinanceRepo não está disponível');
      }

      const kpis = await FinanceRepo.getDashboardKPIs();
      this._data = kpis;
      this._renderDashboard(container, kpis);
    } catch (err) {
      console.error('[Financeiro] Erro ao carregar dashboard:', err);
      container.innerHTML = this._renderError(err.message);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════

  _renderDashboard(container, kpis) {
    const fmt = typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER : { currency: v => `R$ ${(v||0).toLocaleString('pt-BR', {minimumFractionDigits:2})}` };
    const saldoColor = kpis.saldoAtual >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
    const projetadoColor = kpis.saldoProjetado >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
    const margemProj = kpis.aReceber30d > 0 ? (((kpis.aReceber30d - kpis.aPagar30d) / kpis.aReceber30d) * 100).toFixed(1) : '0.0';

    // Data do saldo
    const saldoDateStr = kpis.saldoDate
      ? new Date(kpis.saldoDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : 'Sem registro';

    let html = '';

    // ── KPI Cards Row 1 (grid-4) ────────────────────────────────────────
    html += `<div class="grid-4 fn-kpi-grid" style="margin-bottom:16px;">
      <div class="kpi-card">
        <div class="kpi-label">Saldo Atual</div>
        <div class="kpi-value" style="color:${saldoColor};">${fmt.currency(kpis.saldoAtual)}</div>
        <div class="kpi-change neutral">Atualizado: ${saldoDateStr}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">A Receber (30d)</div>
        <div class="kpi-value" style="color:var(--color-success);">${fmt.currency(kpis.aReceber30d)}</div>
        <div class="kpi-change positive">Entradas previstas</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">A Pagar (30d)</div>
        <div class="kpi-value" style="color:var(--color-danger);">${fmt.currency(kpis.aPagar30d)}</div>
        <div class="kpi-change negative">Saídas previstas</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Saldo Projetado (30d)</div>
        <div class="kpi-value" style="color:${projetadoColor};">${fmt.currency(kpis.saldoProjetado)}</div>
        <div class="kpi-change ${parseFloat(margemProj) >= 0 ? 'positive' : 'negative'}">Margem: ${margemProj}%</div>
      </div>
    </div>`;

    // ── KPI Cards Row 2 (grid-3) ────────────────────────────────────────
    html += `<div class="grid-3 fn-kpi-grid" style="margin-bottom:24px;">
      <div class="kpi-card ${kpis.vencidasPagar > 0 ? 'fn-kpi-alert' : ''}">
        <div class="kpi-label">Contas Vencidas (Pagar)</div>
        <div class="kpi-value" style="color:${kpis.vencidasPagar > 0 ? 'var(--color-danger)' : 'var(--color-success)'};">${kpis.vencidasPagar}</div>
        <div class="kpi-change ${kpis.vencidasPagar > 0 ? 'negative' : 'positive'}">${kpis.vencidasPagar > 0 ? 'Ação necessária' : 'Tudo em dia'}</div>
      </div>
      <div class="kpi-card ${kpis.vencidasReceber > 0 ? 'fn-kpi-alert' : ''}">
        <div class="kpi-label">Contas Vencidas (Receber)</div>
        <div class="kpi-value" style="color:${kpis.vencidasReceber > 0 ? '#f59e0b' : 'var(--color-success)'};">${kpis.vencidasReceber}</div>
        <div class="kpi-change ${kpis.vencidasReceber > 0 ? 'negative' : 'positive'}">${kpis.vencidasReceber > 0 ? 'Cobrança pendente' : 'Tudo em dia'}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Margem Projetada</div>
        <div class="kpi-value" style="color:${parseFloat(margemProj) >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${margemProj}%</div>
        <div class="kpi-change neutral">Receitas vs Despesas 30d</div>
      </div>
    </div>`;

    // ── Seções: Top Centro de Custo + Top Projetos ──────────────────────
    html += '<div class="grid-2" style="gap:16px;">';

    // Top Centros de Custo
    html += `<div class="card">
      <div class="card-header"><h3 class="card-title">Top Centros de Custo (mês)</h3></div>
      ${this._renderBarChart(kpis.topCostCenters, fmt)}
    </div>`;

    // Top Projetos
    html += `<div class="card">
      <div class="card-header"><h3 class="card-title">Top Projetos (mês)</h3></div>
      ${this._renderBarChart(kpis.topProjects, fmt)}
    </div>`;

    html += '</div>';

    // ── Ação rápida: Registrar saldo ────────────────────────────────────
    html += `
    <div class="card" style="margin-top:16px;">
      <div class="card-header">
        <h3 class="card-title">Registrar Saldo Atual</h3>
      </div>
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

    // Bind botão de saldo
    const saveBalanceBtn = document.getElementById('fnSaveBalanceBtn');
    if (saveBalanceBtn) {
      saveBalanceBtn.addEventListener('click', () => this._saveBalance());
    }

    if (window.lucide) lucide.createIcons();
  },

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Renderiza bar chart horizontal CSS puro
   */
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

  /**
   * Renderiza estado de erro
   */
  _renderError(msg) {
    return `
      <div class="fn-error">
        <i data-lucide="alert-triangle" style="width:40px;height:40px;color:var(--color-danger);margin-bottom:12px;"></i>
        <h3>Erro ao carregar dados financeiros</h3>
        <p>${this._esc(msg)}</p>
        <button class="btn btn-primary" id="fnRetryBtn" style="margin-top:12px;">Tentar novamente</button>
      </div>`;
  },

  /**
   * Escape HTML
   */
  _esc(str) {
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.escapeHtml) {
      return TBO_FORMATTER.escapeHtml(str);
    }
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
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
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Valor inválido', 'Informe o saldo atual.');
      return;
    }

    try {
      await FinanceRepo.recordBalance(balance, note);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Saldo registrado', `Saldo de ${TBO_FORMATTER.currency(balance)} salvo com sucesso.`);
      }
      // Limpar campos
      if (input) input.value = '';
      if (noteInput) noteInput.value = '';
      // Recarregar dashboard
      this._loadDashboard();
    } catch (err) {
      console.error('[Financeiro] Erro ao salvar saldo:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro ao salvar', err.message);
      }
    }
  }
};
