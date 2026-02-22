/**
 * TBO OS — Module: RSM (Report Social Media)
 * Task #24 — Social media management and reporting
 *
 * Tabs: Dashboard | Calendario | Central de Ideias | Contas
 * Features: client cards with metrics, editorial calendar, ideas kanban, account management
 */
const TBO_RSM = {
  _tab: 'dashboard',
  _accounts: [],
  _posts: [],
  _ideas: [],
  _dashboardData: null,
  _selectedClient: null,
  _calendarMonth: new Date().getMonth(),
  _calendarYear: new Date().getFullYear(),

  // ── Lifecycle ──────────────────────────────────────────────
  render() {
    return `
    <div class="rsm-module">
      <div class="rsm-header">
        <div class="rsm-header-left">
          <h2 class="rsm-title">
            <i data-lucide="share-2" class="rsm-title-icon"></i>
            Social Media (RSM)
          </h2>
          <p class="rsm-subtitle">Report & Management</p>
        </div>
        <div class="rsm-header-actions">
          <select class="rsm-client-filter" id="rsmClientFilter" title="Filtrar por cliente">
            <option value="">Todos os clientes</option>
          </select>
          <button class="btn btn-sm btn-primary" id="rsmExportBtn" title="Exportar PDF">
            <i data-lucide="download"></i> Exportar
          </button>
        </div>
      </div>

      <div class="rsm-tabs" id="rsmTabs">
        <button class="rsm-tab active" data-tab="dashboard">
          <i data-lucide="layout-dashboard"></i> Dashboard
        </button>
        <button class="rsm-tab" data-tab="calendario">
          <i data-lucide="calendar"></i> Calendario
        </button>
        <button class="rsm-tab" data-tab="ideias">
          <i data-lucide="lightbulb"></i> Central de Ideias
        </button>
        <button class="rsm-tab" data-tab="contas">
          <i data-lucide="at-sign"></i> Contas
        </button>
      </div>

      <div class="rsm-content" id="rsmContent">
        <div class="rsm-loading">
          <div class="loading-spinner"></div>
          <p>Carregando dados de social media...</p>
        </div>
      </div>
    </div>`;
  },

  init() {
    this._bindTabs();
    this._bindClientFilter();
    this._bindExport();
    this._loadData();
    if (window.lucide) lucide.createIcons();
  },

  // ── Data Loading ───────────────────────────────────────────
  async _loadData() {
    try {
      if (typeof RSMRepo === 'undefined') {
        this._renderEmpty('RSMRepo nao disponivel. Verifique a configuracao.');
        return;
      }

      const [dashData, posts, ideas, accounts] = await Promise.all([
        RSMRepo.getDashboardMetrics(),
        RSMRepo.listPosts(),
        RSMRepo.listIdeas(),
        RSMRepo.listAccounts()
      ]);

      this._dashboardData = dashData;
      this._posts = posts;
      this._ideas = ideas;
      this._accounts = accounts;

      this._populateClientFilter();
      this._renderTab();
    } catch (e) {
      console.error('[RSM] Load error:', e);
      this._renderEmpty('Erro ao carregar dados: ' + e.message);
    }
  },

  // ── Tab Management ─────────────────────────────────────────
  _bindTabs() {
    const tabsEl = document.getElementById('rsmTabs');
    if (!tabsEl) return;
    tabsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.rsm-tab');
      if (!btn) return;
      tabsEl.querySelectorAll('.rsm-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      this._tab = btn.dataset.tab;
      this._renderTab();
    });
  },

  _bindClientFilter() {
    const filter = document.getElementById('rsmClientFilter');
    if (!filter) return;
    filter.addEventListener('change', () => {
      this._selectedClient = filter.value || null;
      this._renderTab();
    });
  },

  _bindExport() {
    const btn = document.getElementById('rsmExportBtn');
    if (!btn) return;
    btn.addEventListener('click', () => this._exportPDF());
  },

  _populateClientFilter() {
    const filter = document.getElementById('rsmClientFilter');
    if (!filter) return;

    const clientIds = new Set();
    this._accounts.forEach(a => {
      if (a.client_id) clientIds.add(a.client_id);
    });

    // Use account handles grouped by client_id as labels
    const clientMap = {};
    this._accounts.forEach(a => {
      if (a.client_id) {
        if (!clientMap[a.client_id]) clientMap[a.client_id] = [];
        clientMap[a.client_id].push(a.handle);
      }
    });

    let html = '<option value="">Todos os clientes</option>';
    Object.entries(clientMap).forEach(([cid, handles]) => {
      const label = handles.join(', ');
      html += `<option value="${cid}">${label}</option>`;
    });
    filter.innerHTML = html;
  },

  _renderTab() {
    const content = document.getElementById('rsmContent');
    if (!content) return;

    switch (this._tab) {
      case 'dashboard': content.innerHTML = this._renderDashboard(); break;
      case 'calendario': content.innerHTML = this._renderCalendar(); break;
      case 'ideias': content.innerHTML = this._renderIdeas(); break;
      case 'contas': content.innerHTML = this._renderAccounts(); break;
      default: content.innerHTML = this._renderDashboard();
    }

    if (window.lucide) lucide.createIcons({ root: content });
    this._bindTabEvents();
  },

  _renderEmpty(msg) {
    const content = document.getElementById('rsmContent');
    if (content) {
      content.innerHTML = `
        <div class="rsm-empty">
          <i data-lucide="share-2" style="width:48px;height:48px;opacity:0.3;"></i>
          <h3>Nenhum dado disponivel</h3>
          <p>${msg || 'Comece adicionando contas de redes sociais na aba "Contas".'}</p>
        </div>`;
      if (window.lucide) lucide.createIcons({ root: content });
    }
  },

  // ════════════════════════════════════════════════════════════
  // DASHBOARD TAB
  // ════════════════════════════════════════════════════════════
  _renderDashboard() {
    const data = this._dashboardData;
    if (!data || data.accounts.length === 0) {
      return `
        <div class="rsm-empty">
          <i data-lucide="bar-chart-3" style="width:48px;height:48px;opacity:0.3;"></i>
          <h3>Nenhuma conta cadastrada</h3>
          <p>Adicione contas de redes sociais na aba "Contas" para ver metricas.</p>
        </div>`;
    }

    const t = data.totals;
    const filtered = this._selectedClient
      ? data.accounts.filter(a => a.client_id === this._selectedClient)
      : data.accounts;

    return `
      <!-- KPI Summary -->
      <div class="rsm-kpi-grid">
        <div class="rsm-kpi-card">
          <div class="rsm-kpi-icon" style="background: #EC489918; color: #EC4899;">
            <i data-lucide="users"></i>
          </div>
          <div class="rsm-kpi-info">
            <span class="rsm-kpi-value">${this._fmtNum(t.totalFollowers)}</span>
            <span class="rsm-kpi-label">Seguidores</span>
          </div>
        </div>
        <div class="rsm-kpi-card">
          <div class="rsm-kpi-icon" style="background: #3B82F618; color: #3B82F6;">
            <i data-lucide="eye"></i>
          </div>
          <div class="rsm-kpi-info">
            <span class="rsm-kpi-value">${this._fmtNum(t.totalReach)}</span>
            <span class="rsm-kpi-label">Alcance Total</span>
          </div>
        </div>
        <div class="rsm-kpi-card">
          <div class="rsm-kpi-icon" style="background: #22C55E18; color: #22C55E;">
            <i data-lucide="trending-up"></i>
          </div>
          <div class="rsm-kpi-info">
            <span class="rsm-kpi-value">${t.avgEngagement}%</span>
            <span class="rsm-kpi-label">Engajamento Medio</span>
          </div>
        </div>
        <div class="rsm-kpi-card">
          <div class="rsm-kpi-icon" style="background: #F59E0B18; color: #F59E0B;">
            <i data-lucide="zap"></i>
          </div>
          <div class="rsm-kpi-info">
            <span class="rsm-kpi-value">${this._fmtNum(t.totalImpressions)}</span>
            <span class="rsm-kpi-label">Impressoes</span>
          </div>
        </div>
      </div>

      <!-- Account Cards Grid -->
      <div class="rsm-accounts-grid">
        ${filtered.map(a => this._renderAccountCard(a)).join('')}
      </div>
    `;
  },

  _renderAccountCard(account) {
    const m = account.latestMetric;
    const platformIcons = { instagram: 'instagram', facebook: 'facebook', linkedin: 'linkedin', tiktok: 'music' };
    const platformColors = { instagram: '#E4405F', facebook: '#1877F2', linkedin: '#0A66C2', tiktok: '#000000' };
    const icon = platformIcons[account.platform] || 'share-2';
    const color = platformColors[account.platform] || '#EC4899';

    return `
      <div class="rsm-account-card" data-account-id="${account.id}">
        <div class="rsm-account-card-header">
          <div class="rsm-account-platform" style="background: ${color}18; color: ${color};">
            <i data-lucide="${icon}"></i>
          </div>
          <div class="rsm-account-info">
            <span class="rsm-account-handle">@${this._esc(account.handle)}</span>
            <span class="rsm-account-platform-label">${account.platform}</span>
          </div>
          <span class="rsm-badge rsm-badge--${account.is_active ? 'active' : 'inactive'}">
            ${account.is_active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <div class="rsm-account-metrics">
          <div class="rsm-metric">
            <span class="rsm-metric-value">${this._fmtNum(m?.followers || account.followers_count || 0)}</span>
            <span class="rsm-metric-label">Seguidores</span>
          </div>
          <div class="rsm-metric">
            <span class="rsm-metric-value">${this._fmtNum(m?.reach || 0)}</span>
            <span class="rsm-metric-label">Alcance</span>
          </div>
          <div class="rsm-metric">
            <span class="rsm-metric-value">${m?.engagement_rate ? parseFloat(m.engagement_rate).toFixed(2) + '%' : '--'}</span>
            <span class="rsm-metric-label">Engajamento</span>
          </div>
          <div class="rsm-metric">
            <span class="rsm-metric-value">${this._fmtNum(m?.impressions || 0)}</span>
            <span class="rsm-metric-label">Impressoes</span>
          </div>
        </div>
        <div class="rsm-account-card-sparkline" id="sparkline-${account.id}">
          <div class="rsm-sparkline-placeholder"></div>
        </div>
      </div>
    `;
  },

  // ════════════════════════════════════════════════════════════
  // CALENDAR TAB
  // ════════════════════════════════════════════════════════════
  _renderCalendar() {
    const month = this._calendarMonth;
    const year = this._calendarYear;
    const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Filter posts for this month
    const monthPosts = this._posts.filter(p => {
      const d = p.scheduled_date || p.published_date;
      if (!d) return false;
      const pd = new Date(d);
      return pd.getMonth() === month && pd.getFullYear() === year;
    });

    // Filter by client if selected
    const filteredPosts = this._selectedClient
      ? monthPosts.filter(p => p.account?.client_id === this._selectedClient)
      : monthPosts;

    // Group posts by day
    const postsByDay = {};
    filteredPosts.forEach(p => {
      const d = new Date(p.scheduled_date || p.published_date);
      const day = d.getDate();
      if (!postsByDay[day]) postsByDay[day] = [];
      postsByDay[day].push(p);
    });

    let calendarCells = '';
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      calendarCells += '<div class="rsm-cal-cell rsm-cal-cell--empty"></div>';
    }
    // Day cells
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const dayPosts = postsByDay[day] || [];
      const dots = dayPosts.map(p => {
        const statusColor = { idea: '#9CA3AF', approved: '#3B82F6', production: '#F59E0B', scheduled: '#8B5CF6', published: '#22C55E' };
        return `<span class="rsm-cal-dot" style="background: ${statusColor[p.status] || '#9CA3AF'};" title="${this._esc(p.title || p.content || p.status)}"></span>`;
      }).join('');

      calendarCells += `
        <div class="rsm-cal-cell${isToday ? ' rsm-cal-cell--today' : ''}${dayPosts.length ? ' rsm-cal-cell--has-posts' : ''}" data-day="${day}">
          <span class="rsm-cal-day">${day}</span>
          <div class="rsm-cal-dots">${dots}</div>
          ${dayPosts.length > 0 ? `<span class="rsm-cal-count">${dayPosts.length}</span>` : ''}
        </div>`;
    }

    return `
      <div class="rsm-calendar">
        <div class="rsm-cal-header">
          <button class="rsm-cal-nav" id="rsmCalPrev" title="Mes anterior"><i data-lucide="chevron-left"></i></button>
          <h3 class="rsm-cal-title">${monthNames[month]} ${year}</h3>
          <button class="rsm-cal-nav" id="rsmCalNext" title="Proximo mes"><i data-lucide="chevron-right"></i></button>
          <button class="btn btn-sm" id="rsmCalAddPost" style="margin-left: auto;">
            <i data-lucide="plus"></i> Novo Post
          </button>
        </div>
        <div class="rsm-cal-legend">
          <span class="rsm-cal-legend-item"><span class="rsm-cal-dot" style="background: #9CA3AF;"></span> Ideia</span>
          <span class="rsm-cal-legend-item"><span class="rsm-cal-dot" style="background: #3B82F6;"></span> Aprovado</span>
          <span class="rsm-cal-legend-item"><span class="rsm-cal-dot" style="background: #F59E0B;"></span> Producao</span>
          <span class="rsm-cal-legend-item"><span class="rsm-cal-dot" style="background: #8B5CF6;"></span> Agendado</span>
          <span class="rsm-cal-legend-item"><span class="rsm-cal-dot" style="background: #22C55E;"></span> Publicado</span>
        </div>
        <div class="rsm-cal-weekdays">
          ${dayNames.map(d => `<div class="rsm-cal-weekday">${d}</div>`).join('')}
        </div>
        <div class="rsm-cal-grid">
          ${calendarCells}
        </div>
      </div>

      <!-- Day Detail Panel -->
      <div class="rsm-cal-detail" id="rsmCalDetail" style="display: none;">
        <div class="rsm-cal-detail-header">
          <h4 id="rsmCalDetailTitle">Posts do dia</h4>
          <button class="rsm-cal-detail-close" id="rsmCalDetailClose"><i data-lucide="x"></i></button>
        </div>
        <div class="rsm-cal-detail-list" id="rsmCalDetailList"></div>
      </div>
    `;
  },

  // ════════════════════════════════════════════════════════════
  // IDEAS TAB (Kanban)
  // ════════════════════════════════════════════════════════════
  _renderIdeas() {
    const filtered = this._selectedClient
      ? this._ideas.filter(i => i.client_id === this._selectedClient)
      : this._ideas;

    const columns = [
      { key: 'idea', label: 'Ideias', icon: 'lightbulb', color: '#9CA3AF' },
      { key: 'approved', label: 'Aprovadas', icon: 'check', color: '#3B82F6' },
      { key: 'production', label: 'Producao', icon: 'cog', color: '#F59E0B' },
      { key: 'published', label: 'Publicadas', icon: 'globe', color: '#22C55E' }
    ];

    const categoryLabels = { educational: 'Educacional', institutional: 'Institucional', product: 'Produto', backstage: 'Backstage' };
    const categoryColors = { educational: '#3B82F6', institutional: '#8B5CF6', product: '#EC4899', backstage: '#F59E0B' };

    return `
      <div class="rsm-kanban">
        <div class="rsm-kanban-header">
          <h3>Central de Ideias</h3>
          <button class="btn btn-sm btn-primary" id="rsmAddIdea">
            <i data-lucide="plus"></i> Nova Ideia
          </button>
        </div>
        <div class="rsm-kanban-board">
          ${columns.map(col => {
            const items = filtered.filter(i => i.status === col.key);
            return `
              <div class="rsm-kanban-col" data-status="${col.key}">
                <div class="rsm-kanban-col-header">
                  <span class="rsm-kanban-col-dot" style="background: ${col.color};"></span>
                  <span class="rsm-kanban-col-label">${col.label}</span>
                  <span class="rsm-kanban-col-count">${items.length}</span>
                </div>
                <div class="rsm-kanban-col-body" data-status="${col.key}">
                  ${items.map(idea => `
                    <div class="rsm-kanban-card" data-idea-id="${idea.id}" draggable="true">
                      <div class="rsm-kanban-card-title">${this._esc(idea.title)}</div>
                      ${idea.description ? `<div class="rsm-kanban-card-desc">${this._esc(idea.description).substring(0, 80)}${idea.description.length > 80 ? '...' : ''}</div>` : ''}
                      <div class="rsm-kanban-card-footer">
                        <span class="rsm-pill" style="background: ${categoryColors[idea.category] || '#9CA3AF'}18; color: ${categoryColors[idea.category] || '#9CA3AF'};">
                          ${categoryLabels[idea.category] || idea.category}
                        </span>
                      </div>
                    </div>
                  `).join('')}
                  ${items.length === 0 ? '<div class="rsm-kanban-empty">Nenhuma ideia</div>' : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // ════════════════════════════════════════════════════════════
  // ACCOUNTS TAB
  // ════════════════════════════════════════════════════════════
  _renderAccounts() {
    const filtered = this._selectedClient
      ? this._accounts.filter(a => a.client_id === this._selectedClient)
      : this._accounts;

    const platformIcons = { instagram: 'instagram', facebook: 'facebook', linkedin: 'linkedin', tiktok: 'music' };
    const platformColors = { instagram: '#E4405F', facebook: '#1877F2', linkedin: '#0A66C2', tiktok: '#000000' };

    return `
      <div class="rsm-accounts-tab">
        <div class="rsm-accounts-header">
          <h3>Contas de Redes Sociais</h3>
          <button class="btn btn-sm btn-primary" id="rsmAddAccount">
            <i data-lucide="plus"></i> Nova Conta
          </button>
        </div>

        ${filtered.length === 0 ? `
          <div class="rsm-empty" style="margin-top: 32px;">
            <i data-lucide="at-sign" style="width:48px;height:48px;opacity:0.3;"></i>
            <h3>Nenhuma conta cadastrada</h3>
            <p>Clique em "Nova Conta" para adicionar uma conta de rede social.</p>
          </div>
        ` : `
          <div class="rsm-accounts-list">
            ${filtered.map(a => {
              const icon = platformIcons[a.platform] || 'share-2';
              const color = platformColors[a.platform] || '#EC4899';
              return `
                <div class="rsm-account-row" data-account-id="${a.id}">
                  <div class="rsm-account-row-left">
                    <div class="rsm-account-row-icon" style="background: ${color}18; color: ${color};">
                      <i data-lucide="${icon}"></i>
                    </div>
                    <div class="rsm-account-row-info">
                      <span class="rsm-account-row-handle">@${this._esc(a.handle)}</span>
                      <span class="rsm-account-row-platform">${a.platform}${a.profile_url ? ` &mdash; <a href="${this._esc(a.profile_url)}" target="_blank" rel="noopener">Perfil</a>` : ''}</span>
                    </div>
                  </div>
                  <div class="rsm-account-row-right">
                    <span class="rsm-account-row-followers">${this._fmtNum(a.followers_count || 0)} seguidores</span>
                    <span class="rsm-badge rsm-badge--${a.is_active ? 'active' : 'inactive'}">${a.is_active ? 'Ativo' : 'Inativo'}</span>
                    <button class="btn btn-sm rsm-btn-metrics" data-account-id="${a.id}" title="Registrar metricas">
                      <i data-lucide="bar-chart-3"></i>
                    </button>
                    <button class="btn btn-sm rsm-btn-edit" data-account-id="${a.id}" title="Editar">
                      <i data-lucide="pencil"></i>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Metric Entry Modal -->
      <div class="rsm-modal-overlay" id="rsmMetricModal" style="display: none;">
        <div class="rsm-modal">
          <div class="rsm-modal-header">
            <h3>Registrar Metricas</h3>
            <button class="rsm-modal-close" id="rsmMetricModalClose"><i data-lucide="x"></i></button>
          </div>
          <form class="rsm-modal-form" id="rsmMetricForm">
            <input type="hidden" id="rsmMetricAccountId">
            <div class="rsm-form-grid">
              <div class="rsm-form-group">
                <label>Data</label>
                <input type="date" id="rsmMetricDate" required value="${new Date().toISOString().split('T')[0]}">
              </div>
              <div class="rsm-form-group">
                <label>Seguidores</label>
                <input type="number" id="rsmMetricFollowers" min="0" placeholder="0">
              </div>
              <div class="rsm-form-group">
                <label>Seguindo</label>
                <input type="number" id="rsmMetricFollowing" min="0" placeholder="0">
              </div>
              <div class="rsm-form-group">
                <label>Posts</label>
                <input type="number" id="rsmMetricPosts" min="0" placeholder="0">
              </div>
              <div class="rsm-form-group">
                <label>Engajamento (%)</label>
                <input type="number" id="rsmMetricEngagement" min="0" step="0.01" placeholder="0.00">
              </div>
              <div class="rsm-form-group">
                <label>Alcance</label>
                <input type="number" id="rsmMetricReach" min="0" placeholder="0">
              </div>
              <div class="rsm-form-group">
                <label>Impressoes</label>
                <input type="number" id="rsmMetricImpressions" min="0" placeholder="0">
              </div>
            </div>
            <div class="rsm-modal-actions">
              <button type="button" class="btn btn-sm" id="rsmMetricCancel">Cancelar</button>
              <button type="submit" class="btn btn-sm btn-primary">Salvar Metricas</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Account Modal -->
      <div class="rsm-modal-overlay" id="rsmAccountModal" style="display: none;">
        <div class="rsm-modal">
          <div class="rsm-modal-header">
            <h3 id="rsmAccountModalTitle">Nova Conta</h3>
            <button class="rsm-modal-close" id="rsmAccountModalClose"><i data-lucide="x"></i></button>
          </div>
          <form class="rsm-modal-form" id="rsmAccountForm">
            <input type="hidden" id="rsmAccountId">
            <div class="rsm-form-grid">
              <div class="rsm-form-group">
                <label>Plataforma</label>
                <select id="rsmAccountPlatform" required>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>
              <div class="rsm-form-group">
                <label>Handle (@)</label>
                <input type="text" id="rsmAccountHandle" required placeholder="username">
              </div>
              <div class="rsm-form-group">
                <label>URL do Perfil</label>
                <input type="url" id="rsmAccountUrl" placeholder="https://...">
              </div>
              <div class="rsm-form-group">
                <label>Seguidores Iniciais</label>
                <input type="number" id="rsmAccountFollowers" min="0" placeholder="0">
              </div>
            </div>
            <div class="rsm-modal-actions">
              <button type="button" class="btn btn-sm" id="rsmAccountCancel">Cancelar</button>
              <button type="submit" class="btn btn-sm btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  // ── Tab Events Binding ─────────────────────────────────────
  _bindTabEvents() {
    switch (this._tab) {
      case 'dashboard': this._bindDashboardEvents(); break;
      case 'calendario': this._bindCalendarEvents(); break;
      case 'ideias': this._bindIdeasEvents(); break;
      case 'contas': this._bindAccountsEvents(); break;
    }
  },

  _bindDashboardEvents() {
    // Click on account card for detail
    document.querySelectorAll('.rsm-account-card').forEach(card => {
      card.addEventListener('click', () => {
        const accountId = card.dataset.accountId;
        // Navigate to accounts tab focused on this account
        this._tab = 'contas';
        document.querySelectorAll('.rsm-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.rsm-tab[data-tab="contas"]')?.classList.add('active');
        this._renderTab();
      });
    });
  },

  _bindCalendarEvents() {
    // Calendar navigation
    document.getElementById('rsmCalPrev')?.addEventListener('click', () => {
      this._calendarMonth--;
      if (this._calendarMonth < 0) { this._calendarMonth = 11; this._calendarYear--; }
      this._renderTab();
    });
    document.getElementById('rsmCalNext')?.addEventListener('click', () => {
      this._calendarMonth++;
      if (this._calendarMonth > 11) { this._calendarMonth = 0; this._calendarYear++; }
      this._renderTab();
    });

    // Day click
    document.querySelectorAll('.rsm-cal-cell[data-day]').forEach(cell => {
      cell.addEventListener('click', () => {
        const day = parseInt(cell.dataset.day);
        this._showDayDetail(day);
      });
    });

    // Close detail
    document.getElementById('rsmCalDetailClose')?.addEventListener('click', () => {
      document.getElementById('rsmCalDetail').style.display = 'none';
    });

    // Add post
    document.getElementById('rsmCalAddPost')?.addEventListener('click', () => {
      this._showPostModal();
    });
  },

  _showDayDetail(day) {
    const detail = document.getElementById('rsmCalDetail');
    const title = document.getElementById('rsmCalDetailTitle');
    const list = document.getElementById('rsmCalDetailList');
    if (!detail || !list) return;

    const monthPosts = this._posts.filter(p => {
      const d = new Date(p.scheduled_date || p.published_date);
      return d.getDate() === day && d.getMonth() === this._calendarMonth && d.getFullYear() === this._calendarYear;
    });

    const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    title.textContent = `Posts - ${day} de ${monthNames[this._calendarMonth]}`;

    const statusLabels = { idea: 'Ideia', approved: 'Aprovado', production: 'Producao', scheduled: 'Agendado', published: 'Publicado' };
    const statusColors = { idea: '#9CA3AF', approved: '#3B82F6', production: '#F59E0B', scheduled: '#8B5CF6', published: '#22C55E' };

    if (monthPosts.length === 0) {
      list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 16px;">Nenhum post neste dia.</p>';
    } else {
      list.innerHTML = monthPosts.map(p => `
        <div class="rsm-cal-detail-item">
          <div class="rsm-cal-detail-item-header">
            <span class="rsm-pill" style="background: ${statusColors[p.status]}18; color: ${statusColors[p.status]};">${statusLabels[p.status]}</span>
            <span class="rsm-pill rsm-pill--type">${p.type}</span>
          </div>
          <div class="rsm-cal-detail-item-title">${this._esc(p.title || 'Sem titulo')}</div>
          ${p.content ? `<div class="rsm-cal-detail-item-content">${this._esc(p.content).substring(0, 120)}</div>` : ''}
        </div>
      `).join('');
    }

    detail.style.display = 'block';
  },

  _bindIdeasEvents() {
    // Add idea button
    document.getElementById('rsmAddIdea')?.addEventListener('click', () => {
      this._showIdeaModal();
    });

    // Drag and drop for kanban cards
    const board = document.querySelector('.rsm-kanban-board');
    if (!board) return;

    let draggedCard = null;

    board.addEventListener('dragstart', (e) => {
      const card = e.target.closest('.rsm-kanban-card');
      if (!card) return;
      draggedCard = card;
      card.classList.add('rsm-kanban-card--dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    board.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const col = e.target.closest('.rsm-kanban-col-body');
      if (col) col.classList.add('rsm-kanban-col-body--dragover');
    });

    board.addEventListener('dragleave', (e) => {
      const col = e.target.closest('.rsm-kanban-col-body');
      if (col) col.classList.remove('rsm-kanban-col-body--dragover');
    });

    board.addEventListener('drop', async (e) => {
      e.preventDefault();
      const col = e.target.closest('.rsm-kanban-col-body');
      if (!col || !draggedCard) return;

      col.classList.remove('rsm-kanban-col-body--dragover');
      const newStatus = col.dataset.status;
      const ideaId = draggedCard.dataset.ideaId;

      try {
        await RSMRepo.updateIdea(ideaId, { status: newStatus });
        // Update local data
        const idea = this._ideas.find(i => i.id === ideaId);
        if (idea) idea.status = newStatus;
        this._renderTab();
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Ideia atualizada', `Status alterado para "${newStatus}"`);
      } catch (err) {
        console.error('[RSM] Update idea error:', err);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao atualizar ideia');
      }
    });

    board.addEventListener('dragend', () => {
      if (draggedCard) {
        draggedCard.classList.remove('rsm-kanban-card--dragging');
        draggedCard = null;
      }
      document.querySelectorAll('.rsm-kanban-col-body--dragover').forEach(c => c.classList.remove('rsm-kanban-col-body--dragover'));
    });
  },

  _bindAccountsEvents() {
    // Add account
    document.getElementById('rsmAddAccount')?.addEventListener('click', () => {
      this._openAccountModal();
    });

    // Edit account
    document.querySelectorAll('.rsm-btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.accountId;
        const account = this._accounts.find(a => a.id === id);
        if (account) this._openAccountModal(account);
      });
    });

    // Metric entry
    document.querySelectorAll('.rsm-btn-metrics').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openMetricModal(btn.dataset.accountId);
      });
    });

    // Account modal
    this._bindAccountModal();
    // Metric modal
    this._bindMetricModal();
  },

  // ── Account Modal ──────────────────────────────────────────
  _openAccountModal(account = null) {
    const modal = document.getElementById('rsmAccountModal');
    const titleEl = document.getElementById('rsmAccountModalTitle');
    if (!modal) return;

    if (account) {
      titleEl.textContent = 'Editar Conta';
      document.getElementById('rsmAccountId').value = account.id;
      document.getElementById('rsmAccountPlatform').value = account.platform;
      document.getElementById('rsmAccountHandle').value = account.handle;
      document.getElementById('rsmAccountUrl').value = account.profile_url || '';
      document.getElementById('rsmAccountFollowers').value = account.followers_count || 0;
    } else {
      titleEl.textContent = 'Nova Conta';
      document.getElementById('rsmAccountId').value = '';
      document.getElementById('rsmAccountForm').reset();
    }

    modal.style.display = 'flex';
    if (window.lucide) lucide.createIcons({ root: modal });
  },

  _bindAccountModal() {
    const modal = document.getElementById('rsmAccountModal');
    const form = document.getElementById('rsmAccountForm');
    if (!modal || !form) return;

    document.getElementById('rsmAccountModalClose')?.addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('rsmAccountCancel')?.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('rsmAccountId').value;
      const payload = {
        platform: document.getElementById('rsmAccountPlatform').value,
        handle: document.getElementById('rsmAccountHandle').value.replace('@', ''),
        profile_url: document.getElementById('rsmAccountUrl').value || null,
        followers_count: parseInt(document.getElementById('rsmAccountFollowers').value) || 0
      };

      try {
        if (id) {
          await RSMRepo.updateAccount(id, payload);
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Conta atualizada');
        } else {
          await RSMRepo.createAccount(payload);
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Conta criada');
        }
        modal.style.display = 'none';
        this._loadData();
      } catch (err) {
        console.error('[RSM] Save account error:', err);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao salvar conta');
      }
    });
  },

  // ── Metric Modal ───────────────────────────────────────────
  _openMetricModal(accountId) {
    const modal = document.getElementById('rsmMetricModal');
    if (!modal) return;
    document.getElementById('rsmMetricAccountId').value = accountId;
    document.getElementById('rsmMetricForm').reset();
    document.getElementById('rsmMetricDate').value = new Date().toISOString().split('T')[0];
    modal.style.display = 'flex';
    if (window.lucide) lucide.createIcons({ root: modal });
  },

  _bindMetricModal() {
    const modal = document.getElementById('rsmMetricModal');
    const form = document.getElementById('rsmMetricForm');
    if (!modal || !form) return;

    document.getElementById('rsmMetricModalClose')?.addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('rsmMetricCancel')?.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        account_id: document.getElementById('rsmMetricAccountId').value,
        date: document.getElementById('rsmMetricDate').value,
        followers: parseInt(document.getElementById('rsmMetricFollowers').value) || 0,
        following: parseInt(document.getElementById('rsmMetricFollowing').value) || 0,
        posts_count: parseInt(document.getElementById('rsmMetricPosts').value) || 0,
        engagement_rate: parseFloat(document.getElementById('rsmMetricEngagement').value) || 0,
        reach: parseInt(document.getElementById('rsmMetricReach').value) || 0,
        impressions: parseInt(document.getElementById('rsmMetricImpressions').value) || 0
      };

      try {
        await RSMRepo.createMetric(payload);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Metricas registradas');
        modal.style.display = 'none';
        this._loadData();
      } catch (err) {
        console.error('[RSM] Save metric error:', err);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao salvar metricas');
      }
    });
  },

  // ── Idea Modal ─────────────────────────────────────────────
  _showIdeaModal() {
    const content = document.getElementById('rsmContent');
    if (!content) return;

    // Append modal if not present
    let modal = document.getElementById('rsmIdeaModal');
    if (!modal) {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="rsm-modal-overlay" id="rsmIdeaModal" style="display: flex;">
          <div class="rsm-modal">
            <div class="rsm-modal-header">
              <h3>Nova Ideia</h3>
              <button class="rsm-modal-close" id="rsmIdeaModalClose"><i data-lucide="x"></i></button>
            </div>
            <form class="rsm-modal-form" id="rsmIdeaForm">
              <div class="rsm-form-grid">
                <div class="rsm-form-group" style="grid-column: 1 / -1;">
                  <label>Titulo</label>
                  <input type="text" id="rsmIdeaTitle" required placeholder="Titulo da ideia">
                </div>
                <div class="rsm-form-group" style="grid-column: 1 / -1;">
                  <label>Descricao</label>
                  <textarea id="rsmIdeaDesc" rows="3" placeholder="Descreva a ideia..."></textarea>
                </div>
                <div class="rsm-form-group">
                  <label>Categoria</label>
                  <select id="rsmIdeaCategory" required>
                    <option value="educational">Educacional</option>
                    <option value="institutional">Institucional</option>
                    <option value="product">Produto</option>
                    <option value="backstage">Backstage</option>
                  </select>
                </div>
              </div>
              <div class="rsm-modal-actions">
                <button type="button" class="btn btn-sm" id="rsmIdeaCancel">Cancelar</button>
                <button type="submit" class="btn btn-sm btn-primary">Criar Ideia</button>
              </div>
            </form>
          </div>
        </div>
      `;
      content.appendChild(div.firstElementChild);
      modal = document.getElementById('rsmIdeaModal');
      if (window.lucide) lucide.createIcons({ root: modal });

      // Bind
      document.getElementById('rsmIdeaModalClose')?.addEventListener('click', () => modal.style.display = 'none');
      document.getElementById('rsmIdeaCancel')?.addEventListener('click', () => modal.style.display = 'none');
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

      document.getElementById('rsmIdeaForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
          title: document.getElementById('rsmIdeaTitle').value,
          description: document.getElementById('rsmIdeaDesc').value || null,
          category: document.getElementById('rsmIdeaCategory').value,
          status: 'idea',
          client_id: this._selectedClient || null
        };

        try {
          await RSMRepo.createIdea(payload);
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Ideia criada');
          modal.style.display = 'none';
          this._loadData();
        } catch (err) {
          console.error('[RSM] Create idea error:', err);
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao criar ideia');
        }
      });
    } else {
      modal.style.display = 'flex';
      document.getElementById('rsmIdeaForm')?.reset();
    }
  },

  // ── Post Modal ─────────────────────────────────────────────
  _showPostModal() {
    const content = document.getElementById('rsmContent');
    if (!content) return;

    let modal = document.getElementById('rsmPostModal');
    if (!modal) {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="rsm-modal-overlay" id="rsmPostModal" style="display: flex;">
          <div class="rsm-modal">
            <div class="rsm-modal-header">
              <h3>Novo Post</h3>
              <button class="rsm-modal-close" id="rsmPostModalClose"><i data-lucide="x"></i></button>
            </div>
            <form class="rsm-modal-form" id="rsmPostForm">
              <div class="rsm-form-grid">
                <div class="rsm-form-group">
                  <label>Conta</label>
                  <select id="rsmPostAccount" required>
                    ${this._accounts.map(a => `<option value="${a.id}">@${this._esc(a.handle)} (${a.platform})</option>`).join('')}
                  </select>
                </div>
                <div class="rsm-form-group">
                  <label>Tipo</label>
                  <select id="rsmPostType" required>
                    <option value="feed">Feed</option>
                    <option value="story">Story</option>
                    <option value="reel">Reel</option>
                    <option value="carousel">Carousel</option>
                  </select>
                </div>
                <div class="rsm-form-group" style="grid-column: 1 / -1;">
                  <label>Titulo</label>
                  <input type="text" id="rsmPostTitle" placeholder="Titulo do post">
                </div>
                <div class="rsm-form-group" style="grid-column: 1 / -1;">
                  <label>Conteudo</label>
                  <textarea id="rsmPostContent" rows="3" placeholder="Texto/legenda do post..."></textarea>
                </div>
                <div class="rsm-form-group">
                  <label>Status</label>
                  <select id="rsmPostStatus">
                    <option value="idea">Ideia</option>
                    <option value="approved">Aprovado</option>
                    <option value="production">Producao</option>
                    <option value="scheduled">Agendado</option>
                    <option value="published">Publicado</option>
                  </select>
                </div>
                <div class="rsm-form-group">
                  <label>Data Agendada</label>
                  <input type="datetime-local" id="rsmPostScheduled">
                </div>
              </div>
              <div class="rsm-modal-actions">
                <button type="button" class="btn btn-sm" id="rsmPostCancel">Cancelar</button>
                <button type="submit" class="btn btn-sm btn-primary">Criar Post</button>
              </div>
            </form>
          </div>
        </div>
      `;
      content.appendChild(div.firstElementChild);
      modal = document.getElementById('rsmPostModal');
      if (window.lucide) lucide.createIcons({ root: modal });

      document.getElementById('rsmPostModalClose')?.addEventListener('click', () => modal.style.display = 'none');
      document.getElementById('rsmPostCancel')?.addEventListener('click', () => modal.style.display = 'none');
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

      document.getElementById('rsmPostForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
          account_id: document.getElementById('rsmPostAccount').value,
          type: document.getElementById('rsmPostType').value,
          title: document.getElementById('rsmPostTitle').value || null,
          content: document.getElementById('rsmPostContent').value || null,
          status: document.getElementById('rsmPostStatus').value,
          scheduled_date: document.getElementById('rsmPostScheduled').value || null
        };

        try {
          await RSMRepo.createPost(payload);
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Post criado');
          modal.style.display = 'none';
          this._loadData();
        } catch (err) {
          console.error('[RSM] Create post error:', err);
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao criar post');
        }
      });
    } else {
      modal.style.display = 'flex';
      document.getElementById('rsmPostForm')?.reset();
    }
  },

  // ── PDF Export ──────────────────────────────────────────────
  _exportPDF() {
    if (typeof TBO_TOAST !== 'undefined') {
      TBO_TOAST.info('Exportando', 'Gerando relatorio PDF...');
    }

    // Simple export using existing TBO_PDF or browser print
    setTimeout(() => {
      const content = document.getElementById('rsmContent');
      if (!content) return;

      const printWin = window.open('', '_blank');
      if (!printWin) {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Pop-up bloqueado. Habilite pop-ups para exportar.');
        return;
      }

      printWin.document.write(`
        <!DOCTYPE html>
        <html><head>
          <title>RSM Report - Social Media</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 32px; color: #1a1a1a; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            .subtitle { color: #6b7280; margin-bottom: 24px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
            .kpi { background: #f9fafb; border-radius: 8px; padding: 16px; text-align: center; }
            .kpi-value { font-size: 24px; font-weight: 700; }
            .kpi-label { font-size: 12px; color: #6b7280; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
            th { background: #f9fafb; font-weight: 600; }
            @media print { body { padding: 0; } }
          </style>
        </head><body>
          <h1>Social Media Report</h1>
          <p class="subtitle">Gerado em ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          ${this._dashboardData ? `
            <div class="kpi-grid">
              <div class="kpi"><div class="kpi-value">${this._fmtNum(this._dashboardData.totals.totalFollowers)}</div><div class="kpi-label">Seguidores</div></div>
              <div class="kpi"><div class="kpi-value">${this._fmtNum(this._dashboardData.totals.totalReach)}</div><div class="kpi-label">Alcance</div></div>
              <div class="kpi"><div class="kpi-value">${this._dashboardData.totals.avgEngagement}%</div><div class="kpi-label">Engajamento</div></div>
              <div class="kpi"><div class="kpi-value">${this._fmtNum(this._dashboardData.totals.totalImpressions)}</div><div class="kpi-label">Impressoes</div></div>
            </div>
            <table>
              <thead><tr><th>Conta</th><th>Plataforma</th><th>Seguidores</th><th>Alcance</th><th>Engajamento</th></tr></thead>
              <tbody>
                ${this._dashboardData.accounts.map(a => {
                  const m = a.latestMetric;
                  return `<tr>
                    <td>@${this._esc(a.handle)}</td>
                    <td>${a.platform}</td>
                    <td>${this._fmtNum(m?.followers || 0)}</td>
                    <td>${this._fmtNum(m?.reach || 0)}</td>
                    <td>${m?.engagement_rate ? parseFloat(m.engagement_rate).toFixed(2) + '%' : '--'}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          ` : '<p>Nenhum dado disponivel para exportar.</p>'}
        </body></html>
      `);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => printWin.print(), 500);

      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('PDF gerado', 'Janela de impressao aberta.');
    }, 300);
  },

  // ── Helpers ────────────────────────────────────────────────
  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  _fmtNum(n) {
    if (n === null || n === undefined) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString('pt-BR');
  }
};

if (typeof window !== 'undefined') {
  window.TBO_RSM = TBO_RSM;
}
