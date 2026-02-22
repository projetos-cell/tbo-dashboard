// ============================================================================
// TBO OS — Module: Projetos (Notion → Supabase)
// Lista projetos e demandas importados do Notion.
// Supabase e a fonte unica da verdade (dados via migration 028).
// ============================================================================

const TBO_PROJETOS_NOTION = {
  _state: {
    projects: [],
    demands: [],
    allDemands: [],
    selectedProjectId: null,
    filters: { status: '', search: '' },
    demandFilters: { status: '', search: '' },
    loading: false,
    syncing: false,
    view: 'list', // 'list' | 'detail'
    kpi: { activeProjects: 0, pendingDemands: 0, completedDemands: 0, hoursMonth: 0 },
  },

  // ── Lifecycle ──────────────────────────────────────────────────────────

  render() {
    this._state.view = 'list';
    this._state.selectedProjectId = null;
    this._loadProjects();
    this._loadKpiData();

    return `
      <div class="projetos-notion-module">
        <div id="projetos-notion-header" class="pn-header">
          <div class="pn-header-left">
            <h2 class="pn-title" id="pn-page-title">Projetos</h2>
            <span class="pn-count" id="pn-count"></span>
          </div>
          <div class="pn-header-right">
            <div class="pn-search">
              <i data-lucide="search" style="width:16px;height:16px;color:var(--text-tertiary)"></i>
              <input type="text" id="pn-search" placeholder="Buscar projeto..." class="pn-search-input" />
            </div>
            <select id="pn-status-filter" class="pn-select">
              <option value="">Todos os status</option>
              <option value="parado">Parado</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="producao">Producao</option>
              <option value="pausado">Pausado</option>
              <option value="finalizado">Concluido</option>
            </select>
            <button id="pn-sync-btn" class="btn btn-sm btn-outline" title="Sincronizar com Notion">
              <i data-lucide="refresh-cw" style="width:14px;height:14px"></i>
              Sync Notion
            </button>
          </div>
        </div>
        <div id="pn-kpi-area" class="pn-kpi-area">
          <div class="grid-4">
            <div class="kpi-card kpi-card--blue">
              <div class="kpi-label">Projetos Ativos</div>
              <div class="kpi-value" id="pn-kpi-active">—</div>
              <div class="kpi-change neutral" id="pn-kpi-active-sub">carregando...</div>
            </div>
            <div class="kpi-card kpi-card--warning">
              <div class="kpi-label">Demandas Pendentes</div>
              <div class="kpi-value" id="pn-kpi-pending">—</div>
              <div class="kpi-change neutral" id="pn-kpi-pending-sub">carregando...</div>
            </div>
            <div class="kpi-card kpi-card--success">
              <div class="kpi-label">Demandas Concluidas</div>
              <div class="kpi-value" id="pn-kpi-completed">—</div>
              <div class="kpi-change neutral" id="pn-kpi-completed-sub">carregando...</div>
            </div>
            <div class="kpi-card kpi-card--gold">
              <div class="kpi-label">Horas Registradas</div>
              <div class="kpi-value" id="pn-kpi-hours">—</div>
              <div class="kpi-change neutral" id="pn-kpi-hours-sub">carregando...</div>
            </div>
          </div>
        </div>
        <div id="pn-content" class="pn-content">
          <div class="pn-loading">
            <div class="skeleton-block" style="height:40px;margin-bottom:8px"></div>
            <div class="skeleton-block" style="height:40px;margin-bottom:8px"></div>
            <div class="skeleton-block" style="height:40px;margin-bottom:8px"></div>
            <div class="skeleton-block" style="height:40px;margin-bottom:8px"></div>
            <div class="skeleton-block" style="height:40px;margin-bottom:8px"></div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    // Filtros
    const searchInput = document.getElementById('pn-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        if (this._state.view === 'list') {
          this._state.filters.search = e.target.value;
          this._renderProjectsList();
        } else {
          this._state.demandFilters.search = e.target.value;
          this._renderDemandsList();
        }
      });
    }

    const statusFilter = document.getElementById('pn-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        if (this._state.view === 'list') {
          this._state.filters.status = e.target.value;
          this._renderProjectsList();
        } else {
          this._state.demandFilters.status = e.target.value;
          this._renderDemandsList();
        }
      });
    }

    // Sync button
    const syncBtn = document.getElementById('pn-sync-btn');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => this._syncNotion());
    }

    // Delegated click handlers
    const content = document.getElementById('pn-content');
    if (content) {
      content.addEventListener('click', (e) => {
        const row = e.target.closest('[data-project-id]');
        if (row) {
          this._openProject(row.dataset.projectId);
          return;
        }
        const back = e.target.closest('#pn-back-btn');
        if (back) {
          this._backToList();
          return;
        }
      });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // ── Data Loading ───────────────────────────────────────────────────────

  async _loadProjects() {
    this._state.loading = true;
    try {
      const result = await ProjectsRepo.listNotion({ limit: 200 });
      this._state.projects = result.data || [];
      this._renderProjectsList();
    } catch (err) {
      console.error('[ProjetosNotion] Erro ao carregar projetos:', err);
      this._showError('Erro ao carregar projetos. Verifique sua conexao.');
    } finally {
      this._state.loading = false;
    }
  },

  async _loadKpiData() {
    try {
      // 1) Projects: count active (em_andamento + producao) vs total
      const projResult = await ProjectsRepo.listNotion({ limit: 500 });
      const allProjects = projResult.data || [];
      const activeStatuses = ['em_andamento', 'producao'];
      const activeProjects = allProjects.filter(p => activeStatuses.includes(p.status));
      const totalProjects = allProjects.length;

      // 2) Demands: count pending vs completed
      const demResult = await DemandsRepo.list({ limit: 1000 });
      const allDemands = (demResult.data || demResult) || [];
      this._state.allDemands = allDemands;
      const completedStatuses = ['Concluido', 'Aprovado'];
      const pendingStatuses = ['Briefing', 'Desenvolvimento', 'Revisao Interna', 'Cronograma', 'Apresentacao'];
      const completedDemands = allDemands.filter(d => completedStatuses.includes(d.status));
      const pendingDemands = allDemands.filter(d => pendingStatuses.includes(d.status));
      const totalDemands = allDemands.length;

      // 3) Hours: from TBO_WORKLOAD (current month)
      let hoursMonth = 0;
      let hoursLabel = 'este mes';
      if (typeof TBO_WORKLOAD !== 'undefined') {
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;
        const entries = TBO_WORKLOAD.getTimeEntries({ dateFrom: monthStart, dateTo: monthEnd });
        hoursMonth = entries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
      }

      // Update state
      this._state.kpi = { activeProjects: activeProjects.length, pendingDemands: pendingDemands.length, completedDemands: completedDemands.length, hoursMonth };

      // Update DOM
      const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

      setEl('pn-kpi-active', activeProjects.length);
      setEl('pn-kpi-active-sub', `${totalProjects} projetos no total`);

      setEl('pn-kpi-pending', pendingDemands.length);
      setEl('pn-kpi-pending-sub', `${totalDemands} demandas no total`);

      setEl('pn-kpi-completed', completedDemands.length);
      const pctCompleted = totalDemands > 0 ? Math.round(completedDemands.length / totalDemands * 100) : 0;
      setEl('pn-kpi-completed-sub', `${pctCompleted}% do total`);
      const completedSubEl = document.getElementById('pn-kpi-completed-sub');
      if (completedSubEl) {
        completedSubEl.className = `kpi-change ${pctCompleted >= 50 ? 'positive' : 'neutral'}`;
      }

      if (typeof TBO_WORKLOAD !== 'undefined' && hoursMonth > 0) {
        setEl('pn-kpi-hours', TBO_WORKLOAD.formatHoursMinutes(hoursMonth));
      } else {
        setEl('pn-kpi-hours', `${Math.round(hoursMonth / 60)}h`);
      }
      setEl('pn-kpi-hours-sub', hoursLabel);

    } catch (err) {
      console.error('[ProjetosNotion] Erro ao carregar KPIs:', err);
      // Silently fail — KPIs show "—" if data unavailable
    }
  },

  async _loadDemands(projectId) {
    try {
      const data = await DemandsRepo.listByProject(projectId, { limit: 500 });
      this._state.demands = data || [];
      this._renderDemandsList();
    } catch (err) {
      console.error('[ProjetosNotion] Erro ao carregar demandas:', err);
      this._showError('Erro ao carregar demandas.');
    }
  },

  // ── Sync ───────────────────────────────────────────────────────────────

  async _syncNotion() {
    if (this._state.syncing) return;
    this._state.syncing = true;

    const btn = document.getElementById('pn-sync-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" style="width:14px;height:14px" class="spin"></i> Sincronizando...';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    try {
      const db = typeof TBO_DB !== 'undefined' && TBO_DB.isReady() ? TBO_DB : null;
      const client = db ? db : (typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null);
      if (!client) throw new Error('Supabase nao disponivel');

      const supabaseClient = client.getClient ? client.getClient() : client;
      const { data, error } = await supabaseClient.functions.invoke('notion-sync-projects-demands');

      if (error) throw error;

      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success(`Sync concluido: ${data.projects_synced} projetos, ${data.demands_synced} demandas`);
      }

      // Recarregar dados
      await this._loadProjects();
      if (this._state.selectedProjectId) {
        await this._loadDemands(this._state.selectedProjectId);
      }
    } catch (err) {
      console.error('[ProjetosNotion] Erro no sync:', err);
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('Erro ao sincronizar: ' + err.message);
      }
    } finally {
      this._state.syncing = false;
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="refresh-cw" style="width:14px;height:14px"></i> Sync Notion';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  },

  // ── Navigation ─────────────────────────────────────────────────────────

  _openProject(projectId) {
    this._state.selectedProjectId = projectId;
    this._state.view = 'detail';
    this._state.demandFilters = { status: '', search: '' };

    const project = this._state.projects.find(p => p.id === projectId);
    const title = document.getElementById('pn-page-title');
    if (title && project) {
      title.innerHTML = `
        <button id="pn-back-btn" class="pn-back-btn" title="Voltar">
          <i data-lucide="arrow-left" style="width:18px;height:18px"></i>
        </button>
        ${this._escHtml(project.name)}
      `;
    }

    // Update filters for demand statuses
    const statusFilter = document.getElementById('pn-status-filter');
    if (statusFilter) {
      statusFilter.innerHTML = `
        <option value="">Todos os status</option>
        <option value="Cronograma">Cronograma</option>
        <option value="Briefing">Briefing</option>
        <option value="Pausado">Pausado</option>
        <option value="Desenvolvimento">Desenvolvimento</option>
        <option value="Revisao Interna">Revisao Interna</option>
        <option value="Aprovado">Aprovado</option>
        <option value="Apresentacao">Apresentacao</option>
        <option value="Concluido">Concluido</option>
      `;
      statusFilter.value = '';
    }

    const searchInput = document.getElementById('pn-search');
    if (searchInput) {
      searchInput.placeholder = 'Buscar demanda...';
      searchInput.value = '';
    }

    this._loadDemands(projectId);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  _backToList() {
    this._state.view = 'list';
    this._state.selectedProjectId = null;
    this._state.demandFilters = { status: '', search: '' };

    const title = document.getElementById('pn-page-title');
    if (title) title.textContent = 'Projetos';

    const statusFilter = document.getElementById('pn-status-filter');
    if (statusFilter) {
      statusFilter.innerHTML = `
        <option value="">Todos os status</option>
        <option value="parado">Parado</option>
        <option value="em_andamento">Em Andamento</option>
        <option value="finalizado">Concluido</option>
      `;
      statusFilter.value = this._state.filters.status || '';
    }

    const searchInput = document.getElementById('pn-search');
    if (searchInput) {
      searchInput.placeholder = 'Buscar projeto...';
      searchInput.value = this._state.filters.search || '';
    }

    this._renderProjectsList();
  },

  // ── Render: Projects List ──────────────────────────────────────────────

  _renderProjectsList() {
    const container = document.getElementById('pn-content');
    if (!container) return;

    let projects = [...this._state.projects];

    // Apply filters
    if (this._state.filters.status) {
      projects = projects.filter(p => p.status === this._state.filters.status);
    }
    if (this._state.filters.search) {
      const q = this._state.filters.search.toLowerCase();
      projects = projects.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.construtora?.toLowerCase().includes(q)
      );
    }

    const countEl = document.getElementById('pn-count');
    if (countEl) countEl.textContent = `${projects.length} projeto${projects.length !== 1 ? 's' : ''}`;

    if (projects.length === 0) {
      container.innerHTML = `
        <div class="pn-empty">
          <i data-lucide="folder-open" style="width:48px;height:48px;color:var(--text-quaternary)"></i>
          <p>Nenhum projeto encontrado</p>
          <p class="pn-empty-hint">Clique em "Sync Notion" para importar projetos do Notion.</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    const rows = projects.map(p => {
      const statusBadge = this._statusBadge(p.status);
      const prazo = this._formatDateRange(p.due_date_start, p.due_date_end);
      const busHTML = (p.bus || []).map(b => `<span class="pn-bu-tag pn-bu-${this._buColor(b)}">${this._escHtml(b)}</span>`).join('');

      return `
        <tr class="pn-row" data-project-id="${p.id}">
          <td class="pn-cell-name">
            <span class="pn-project-name">${this._escHtml(p.name)}</span>
            ${p.construtora ? `<span class="pn-construtora">${this._escHtml(p.construtora)}</span>` : ''}
          </td>
          <td class="pn-cell-status">${statusBadge}</td>
          <td class="pn-cell-prazo">${prazo}</td>
          <td class="pn-cell-bus">${busHTML || '<span class="pn-empty-cell">—</span>'}</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <table class="pn-table">
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Status</th>
            <th>Prazo</th>
            <th>BUs</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // ── Render: Demands List ───────────────────────────────────────────────

  _renderDemandsList() {
    const container = document.getElementById('pn-content');
    if (!container) return;

    const project = this._state.projects.find(p => p.id === this._state.selectedProjectId);
    let demands = [...this._state.demands];

    // Separate parent demands and subitems
    const parentDemands = demands.filter(d => !d.parent_demand_id);
    const subitems = demands.filter(d => d.parent_demand_id);
    const subitemsByParent = {};
    subitems.forEach(s => {
      if (!subitemsByParent[s.parent_demand_id]) subitemsByParent[s.parent_demand_id] = [];
      subitemsByParent[s.parent_demand_id].push(s);
    });

    // Apply filters to parent demands
    let filtered = parentDemands;
    if (this._state.demandFilters.status) {
      filtered = filtered.filter(d => d.status === this._state.demandFilters.status);
    }
    if (this._state.demandFilters.search) {
      const q = this._state.demandFilters.search.toLowerCase();
      filtered = filtered.filter(d =>
        d.title?.toLowerCase().includes(q) ||
        d.responsible?.toLowerCase().includes(q)
      );
    }

    const countEl = document.getElementById('pn-count');
    if (countEl) countEl.textContent = `${demands.length} demanda${demands.length !== 1 ? 's' : ''}`;

    // Project summary header
    const summaryHTML = project ? `
      <div class="pn-project-summary">
        <div class="pn-summary-item">
          <span class="pn-summary-label">Construtora</span>
          <span class="pn-summary-value">${this._escHtml(project.construtora || '—')}</span>
        </div>
        <div class="pn-summary-item">
          <span class="pn-summary-label">Status</span>
          <span class="pn-summary-value">${this._statusBadge(project.status)}</span>
        </div>
        <div class="pn-summary-item">
          <span class="pn-summary-label">Prazo</span>
          <span class="pn-summary-value">${this._formatDateRange(project.due_date_start, project.due_date_end)}</span>
        </div>
        <div class="pn-summary-item">
          <span class="pn-summary-label">BUs</span>
          <span class="pn-summary-value">${(project.bus || []).map(b => `<span class="pn-bu-tag pn-bu-${this._buColor(b)}">${this._escHtml(b)}</span>`).join(' ') || '—'}</span>
        </div>
        ${project.notion_url ? `<a href="${this._escHtml(project.notion_url)}" target="_blank" rel="noopener" class="pn-notion-link"><i data-lucide="external-link" style="width:12px;height:12px"></i> Ver no Notion</a>` : ''}
      </div>
    ` : '';

    if (filtered.length === 0 && subitems.length === 0) {
      container.innerHTML = summaryHTML + `
        <div class="pn-empty" style="margin-top:32px">
          <i data-lucide="list-checks" style="width:48px;height:48px;color:var(--text-quaternary)"></i>
          <p>Nenhuma demanda encontrada</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    const rows = filtered.map(d => {
      const subs = subitemsByParent[d.id] || [];
      const statusBadge = this._demandStatusBadge(d.status);
      const prazo = d.due_date ? this._formatDate(d.due_date) : '<span class="pn-empty-cell">—</span>';
      const prazoClass = this._getPrazoClass(d.due_date, d.status);
      const busHTML = (d.bus || []).map(b => `<span class="pn-bu-tag pn-bu-${this._buColor(b)}">${this._escHtml(b)}</span>`).join('');

      let subHTML = '';
      if (subs.length > 0) {
        subHTML = subs.map(s => `
          <tr class="pn-row pn-subitem-row">
            <td class="pn-cell-name pn-subitem-indent">
              <i data-lucide="corner-down-right" style="width:12px;height:12px;color:var(--text-quaternary);flex-shrink:0"></i>
              <span>${this._escHtml(s.title)}</span>
            </td>
            <td class="pn-cell-status">${this._demandStatusBadge(s.status)}</td>
            <td class="pn-cell-prazo ${this._getPrazoClass(s.due_date, s.status)}">${s.due_date ? this._formatDate(s.due_date) : '<span class="pn-empty-cell">—</span>'}</td>
            <td class="pn-cell-resp">${this._escHtml(s.responsible || '—')}</td>
            <td class="pn-cell-bus">${(s.bus || []).map(b => `<span class="pn-bu-tag pn-bu-${this._buColor(b)}">${this._escHtml(b)}</span>`).join('') || '<span class="pn-empty-cell">—</span>'}</td>
          </tr>
        `).join('');
      }

      return `
        <tr class="pn-row">
          <td class="pn-cell-name">
            <span>${this._escHtml(d.title)}</span>
            ${subs.length > 0 ? `<span class="pn-subcount">${subs.length} sub</span>` : ''}
          </td>
          <td class="pn-cell-status">${statusBadge}</td>
          <td class="pn-cell-prazo ${prazoClass}">${prazo}</td>
          <td class="pn-cell-resp">${this._escHtml(d.responsible || '—')}</td>
          <td class="pn-cell-bus">${busHTML || '<span class="pn-empty-cell">—</span>'}</td>
        </tr>
        ${subHTML}
      `;
    }).join('');

    container.innerHTML = summaryHTML + `
      <table class="pn-table pn-demands-table">
        <thead>
          <tr>
            <th>Demanda</th>
            <th>Status</th>
            <th>Prazo</th>
            <th>Responsavel</th>
            <th>BUs</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // ── Helpers ────────────────────────────────────────────────────────────

  _statusBadge(status) {
    const map = {
      'parado': { label: 'Parado', color: 'var(--text-tertiary)', bg: 'var(--bg-tertiary)' },
      'em_andamento': { label: 'Em Andamento', color: '#3b82f6', bg: '#eff6ff' },
      'producao': { label: 'Producao', color: '#8b5cf6', bg: '#f5f3ff' },
      'pausado': { label: 'Pausado', color: '#f59e0b', bg: '#fefce8' },
      'finalizado': { label: 'Concluido', color: '#22c55e', bg: '#f0fdf4' },
    };
    const s = map[status] || { label: status || '—', color: 'var(--text-tertiary)', bg: 'var(--bg-tertiary)' };
    return `<span class="pn-badge" style="color:${s.color};background:${s.bg}">${s.label}</span>`;
  },

  _demandStatusBadge(status) {
    const colors = {
      'Cronograma': { c: '#6b7280', bg: '#f3f4f6' },
      'Pausado': { c: '#f59e0b', bg: '#fefce8' },
      'Briefing': { c: '#8b5cf6', bg: '#f5f3ff' },
      'Desenvolvimento': { c: '#3b82f6', bg: '#eff6ff' },
      'Revisao Interna': { c: '#a855f7', bg: '#faf5ff' },
      'Aprovado': { c: '#22c55e', bg: '#f0fdf4' },
      'Apresentacao': { c: '#f97316', bg: '#fff7ed' },
      'Concluido': { c: '#16a34a', bg: '#dcfce7' },
    };
    const s = colors[status] || { c: '#6b7280', bg: '#f3f4f6' };
    return `<span class="pn-badge" style="color:${s.c};background:${s.bg}">${status || '—'}</span>`;
  },

  _buColor(bu) {
    const map = {
      'Interiores': 'pink', 'Audiovisual': 'purple', 'Digital 3D': 'blue',
      'Marketing': 'green', 'Branding': 'orange',
    };
    return map[bu] || 'gray';
  },

  _formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return dateStr; }
  },

  _formatDateRange(start, end) {
    if (!start) return '<span class="pn-empty-cell">—</span>';
    const s = this._formatDate(start);
    if (!end) return s;
    const e = this._formatDate(end);
    return `${s} → ${e}`;
  },

  _getPrazoClass(dateStr, status) {
    if (!dateStr || status === 'Concluido' || status === 'Aprovado') return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr + 'T00:00:00');
    if (d < today) return 'pn-prazo-overdue';
    const diff = (d - today) / (1000 * 60 * 60 * 24);
    if (diff <= 3) return 'pn-prazo-soon';
    return '';
  },

  _escHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  _showError(msg) {
    const container = document.getElementById('pn-content');
    if (container) {
      container.innerHTML = `
        <div class="pn-empty">
          <i data-lucide="alert-circle" style="width:48px;height:48px;color:#ef4444"></i>
          <p>${msg}</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },
};
