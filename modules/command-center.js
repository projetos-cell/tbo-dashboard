// TBO OS — Module: Command Center (Dashboard Principal)
// Renders different dashboard variants based on user role.
const TBO_COMMAND_CENTER = {

  // ── Widget Definitions ────────────────────────────────────────────────────
  _widgets: {
    'my-tasks':         { label: 'Minhas Tarefas',       icon: 'clipboard-check', zone: 'main' },
    'weekly-summary':   { label: 'Resumo Semanal',       icon: 'bar-chart-3',     zone: 'main' },
    'erp-alerts':       { label: 'Alertas ERP',          icon: 'alert-triangle',  zone: 'main' },
    'actions-today':    { label: 'Acoes para Hoje',      icon: 'target',          zone: 'main' },
    'kpis':             { label: 'KPIs',                 icon: 'activity',        zone: 'main' },
    'business-pulse':   { label: 'Business Pulse',       icon: 'heart-pulse',     zone: 'main' },
    'strategic-alerts': { label: 'Alertas Estrategicos', icon: 'shield-alert',    zone: 'main' },
    'pipeline-funnel':  { label: 'Pipeline',             icon: 'filter',          zone: 'main' },
    'people-widget':    { label: 'Equipe',               icon: 'users',           zone: 'main' },
    'news-feed':        { label: 'Noticias',             icon: 'newspaper',       zone: 'main' },
    'projects-overview':{ label: 'Projetos Ativos',      icon: 'building-2',      zone: 'main' },
    'cities-map':       { label: 'Mapa de Cidades',      icon: 'map',             zone: 'main' },
    'culture-nudge':    { label: 'Cultura TBO',            icon: 'sparkles',        zone: 'sidebar' },
    'sidebar-meetings': { label: 'Reunioes',             icon: 'calendar',        zone: 'sidebar' },
    'sidebar-actions':  { label: 'Action Items',         icon: 'check-square',    zone: 'sidebar' },
    'sidebar-market':   { label: 'Mercado',              icon: 'trending-up',     zone: 'sidebar' },
    'sidebar-commercial':{ label: 'Comercial',           icon: 'briefcase',       zone: 'sidebar' }
  },

  _getDefaultLayout() {
    return {
      main: ['my-tasks', 'weekly-summary', 'erp-alerts', 'actions-today', 'kpis', 'business-pulse', 'strategic-alerts', 'pipeline-funnel', 'people-widget', 'news-feed', 'projects-overview', 'cities-map'],
      sidebar: ['culture-nudge', 'sidebar-meetings', 'sidebar-actions', 'sidebar-market', 'sidebar-commercial'],
      hidden: []
    };
  },

  _getLayout() {
    const userId = (typeof TBO_AUTH !== 'undefined' && TBO_AUTH.getCurrentUser()) ? TBO_AUTH.getCurrentUser().id : 'default';
    const saved = localStorage.getItem(`tbo_cc_layout_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.hidden) parsed.hidden = [];
        // Validate that all widget IDs still exist
        const defaultLayout = this._getDefaultLayout();
        const allMain = defaultLayout.main;
        const allSidebar = defaultLayout.sidebar;
        // Add any missing widgets (that are not hidden)
        allMain.forEach(id => { if (!parsed.main.includes(id) && !parsed.hidden.includes(id)) parsed.main.push(id); });
        allSidebar.forEach(id => { if (!parsed.sidebar.includes(id) && !parsed.hidden.includes(id)) parsed.sidebar.push(id); });
        // Remove any that no longer exist in definitions
        const allIds = [...allMain, ...allSidebar];
        parsed.main = parsed.main.filter(id => allIds.includes(id));
        parsed.sidebar = parsed.sidebar.filter(id => allIds.includes(id));
        parsed.hidden = parsed.hidden.filter(id => allIds.includes(id));
        return parsed;
      } catch(e) { /* ignore parse errors */ }
    }
    return this._getDefaultLayout();
  },

  _saveLayout(layout) {
    const userId = (typeof TBO_AUTH !== 'undefined' && TBO_AUTH.getCurrentUser()) ? TBO_AUTH.getCurrentUser().id : 'default';
    localStorage.setItem(`tbo_cc_layout_${userId}`, JSON.stringify(layout));
  },

  _resetLayout() {
    const userId = (typeof TBO_AUTH !== 'undefined' && TBO_AUTH.getCurrentUser()) ? TBO_AUTH.getCurrentUser().id : 'default';
    localStorage.removeItem(`tbo_cc_layout_${userId}`);
    // Re-render
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Layout restaurado ao padrao.');
  },

  _removeWidget(widgetId) {
    const layout = this._getLayout();
    const def = this._widgets[widgetId];
    if (!def) return;
    const zoneName = def.zone === 'sidebar' ? 'sidebar' : 'main';
    layout[zoneName] = layout[zoneName].filter(id => id !== widgetId);
    if (!layout.hidden.includes(widgetId)) layout.hidden.push(widgetId);
    this._saveLayout(layout);
    // Re-render
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Widget removido', `"${def.label}" foi ocultado. Use Personalizar para restaurar.`);
  },

  _addWidget(widgetId) {
    const layout = this._getLayout();
    const def = this._widgets[widgetId];
    if (!def) return;
    layout.hidden = layout.hidden.filter(id => id !== widgetId);
    const zoneName = def.zone === 'sidebar' ? 'sidebar' : 'main';
    if (!layout[zoneName].includes(widgetId)) layout[zoneName].push(widgetId);
    this._saveLayout(layout);
    // Re-render
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Widget adicionado', `"${def.label}" foi restaurado ao dashboard.`);
  },

  _customizePanelOpen: false,

  _toggleCustomizePanel() {
    this._customizePanelOpen = !this._customizePanelOpen;
    const panel = document.getElementById('ccCustomizePanel');
    const overlay = document.getElementById('ccCustomizeOverlay');
    if (panel) panel.classList.toggle('cc-customize-panel--open', this._customizePanelOpen);
    if (overlay) overlay.classList.toggle('cc-customize-panel-overlay--open', this._customizePanelOpen);
  },

  _renderCustomizePanel() {
    const layout = this._getLayout();
    const visibleIds = [...layout.main, ...layout.sidebar];
    const allWidgets = Object.entries(this._widgets);

    const renderItem = ([id, def]) => {
      const isVisible = visibleIds.includes(id);
      return `
        <div class="cc-customize-widget-item">
          <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
            <i data-lucide="${def.icon}" style="width:16px;height:16px;flex-shrink:0;color:var(--text-muted);"></i>
            <span style="font-size:0.82rem;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${this._esc(def.label)}</span>
            <span style="font-size:0.62rem;color:var(--text-muted);text-transform:uppercase;flex-shrink:0;">${def.zone === 'sidebar' ? 'sidebar' : 'principal'}</span>
          </div>
          ${isVisible
            ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:0.72rem;color:var(--color-success);"><i data-lucide="check" style="width:14px;height:14px;"></i> Visivel</span>`
            : `<button class="btn btn-sm btn-ghost cc-add-widget-btn" data-widget-id="${id}" style="font-size:0.72rem;color:var(--accent-gold);">+ Adicionar</button>`
          }
        </div>
      `;
    };

    return `
      <div class="cc-customize-panel-overlay" id="ccCustomizeOverlay"></div>
      <div class="cc-customize-panel" id="ccCustomizePanel">
        <div class="cc-customize-panel-header">
          <h3 style="font-size:0.95rem;font-weight:700;margin:0;">Personalizar</h3>
          <button class="btn btn-sm btn-ghost cc-customize-close" id="ccCustomizeClose" style="padding:4px;">&times;</button>
        </div>
        <div style="padding:0 20px 20px;">
          <p style="font-size:0.75rem;color:var(--text-muted);margin:0 0 16px;">Gerencie os widgets visiveis no seu dashboard. Arraste para reordenar, ou use os botoes abaixo.</p>
          <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);margin-bottom:8px;">Widgets</div>
          ${allWidgets.map(renderItem).join('')}
          <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-subtle);">
            <button class="btn btn-sm btn-secondary" id="ccResetLayoutPanel" style="width:100%;">
              <i data-lucide="rotate-ccw" style="width:14px;height:14px;"></i> Restaurar Padrao
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // ── Dispatch to role-specific dashboard ──────────────────────────────────
  render() {
    const user = (typeof TBO_AUTH !== 'undefined') ? TBO_AUTH.getCurrentUser() : null;
    // Guard: user without role or not activated
    if (user && !user.role) {
      return this._renderPendingActivation(user);
    }
    const variant = (typeof TBO_AUTH !== 'undefined') ? TBO_AUTH.getDashboardVariant() : 'full';
    switch (variant) {
      case 'projects':  return this._renderProjectsDashboard();
      case 'tasks':     return this._renderTasksDashboard();
      case 'financial': return this._renderFinancialDashboard();
      case 'full':
      default:          return this._renderFullDashboard();
    }
  },

  // ── Awaiting Activation screen (user has no role) ─────────────────────
  _renderPendingActivation(user) {
    const name = user ? this._esc((user.name || '').split(' ')[0]) : '';
    return `
      <div class="command-center" style="display:flex;align-items:center;justify-content:center;min-height:60vh;">
        <div style="text-align:center;max-width:480px;">
          <div style="width:72px;height:72px;border-radius:50%;background:var(--color-warning);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
            <i data-lucide="clock" style="width:36px;height:36px;color:#fff;"></i>
          </div>
          <h2 style="margin:0 0 8px;font-size:1.3rem;">Aguardando Ativacao</h2>
          <p style="color:var(--text-secondary);font-size:0.92rem;margin:0 0 20px;">
            ${name ? `Ola, ${name}! ` : ''}Sua conta foi criada com sucesso, mas ainda nao possui um papel (role) atribuido.
          </p>
          <div style="background:var(--bg-elevated);border-radius:var(--radius-lg);padding:20px;text-align:left;margin-bottom:20px;">
            <p style="font-size:0.82rem;font-weight:600;margin:0 0 8px;">Proximos passos:</p>
            <ol style="font-size:0.78rem;color:var(--text-secondary);line-height:1.8;margin:0;padding-left:20px;">
              <li>Avise um administrador (Fundador ou Admin) que voce precisa de acesso</li>
              <li>O admin configurara seu papel e BU no painel Admin Portal</li>
              <li>Apos a configuracao, faca logout e login novamente</li>
            </ol>
          </div>
          <button class="btn btn-secondary" onclick="TBO_AUTH.logout().then(() => TBO_AUTH._setOverlayState('login'))">
            <i data-lucide="log-out" style="width:14px;height:14px;"></i> Sair e tentar novamente
          </button>
        </div>
      </div>
    `;
  },

  // ── Quick Actions bar (role-aware) ────────────────────────────────────
  _renderQuickActions() {
    const user = (typeof TBO_AUTH !== 'undefined') ? TBO_AUTH.getCurrentUser() : null;
    if (!user) return '';
    const role = user.role || 'artist';
    const isAdmin = ['founder', 'admin', 'owner'].includes(role);
    const isManager = ['project_owner', 'coordinator'].includes(role) || user.isCoordinator;
    const isFinance = role === 'finance';

    let actions = [];
    if (isAdmin) {
      actions = [
        { icon: 'folder-kanban', label: 'Projetos', route: 'projetos' },
        { icon: 'coins', label: 'Financeiro', route: 'financeiro' },
        { icon: 'users', label: 'Equipe', route: 'rh' },
        { icon: 'filter', label: 'Pipeline', route: 'pipeline' },
        { icon: 'inbox', label: 'Caixa de Entrada', route: 'inbox' },
        { icon: 'shield', label: 'Admin', route: 'admin-portal' }
      ];
    } else if (isFinance) {
      actions = [
        { icon: 'coins', label: 'Financeiro', route: 'financeiro' },
        { icon: 'credit-card', label: 'A Pagar', route: 'pagar' },
        { icon: 'receipt', label: 'A Receber', route: 'receber' },
        { icon: 'trending-up', label: 'DRE', route: 'margens' },
        { icon: 'filter', label: 'Pipeline', route: 'pipeline' }
      ];
    } else if (isManager) {
      actions = [
        { icon: 'folder-kanban', label: 'Projetos', route: 'projetos' },
        { icon: 'list-checks', label: 'Tarefas', route: 'tarefas' },
        { icon: 'calendar', label: 'Agenda', route: 'agenda' },
        { icon: 'check-circle-2', label: 'Entregas', route: 'entregas' },
        { icon: 'users', label: 'Equipe', route: 'rh' }
      ];
    } else {
      // Colaborador / Artist
      actions = [
        { icon: 'list-checks', label: 'Minhas Tarefas', route: 'tarefas' },
        { icon: 'folder-kanban', label: 'Projetos', route: 'projetos' },
        { icon: 'calendar', label: 'Agenda', route: 'agenda' },
        { icon: 'check-circle-2', label: 'Entregas', route: 'entregas' }
      ];
    }

    return `
      <div class="cc-quick-bar">
        ${actions.map(a => `
          <button class="cc-quick-btn" onclick="TBO_ROUTER.navigate('${a.route}')">
            <i data-lucide="${a.icon}"></i> ${this._esc(a.label)}
          </button>
        `).join('')}
      </div>
    `;
  },

  // ── Shared data helpers ──────────────────────────────────────────────────
  _getData() {
    const context = TBO_STORAGE.get('context');
    const meetings = TBO_STORAGE.get('meetings');
    const market = TBO_STORAGE.get('market');
    const news = TBO_STORAGE.get('news');

    const ativos = context.projetos_ativos || [];
    const finalizados = context.projetos_finalizados || {};
    const totalFinalizados = Object.values(finalizados).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
    const ic = market.indicadores_curitiba || {};
    const meetingsArr = meetings.meetings || meetings.reunioes_recentes || [];
    const meta = meetings.metadata || meetings._metadata || {};

    const now = new Date();
    const weekAgo = new Date(now.getTime() - TBO_CONFIG.business.thresholds.projectMonitoring.noMeetingDays * 86400000);
    const recentMeetings = meetingsArr.filter(m => new Date(m.date || m.data) >= weekAgo);

    let totalActions = 0;
    let actionsByPerson = {};
    let actionItems = [];
    meetingsArr.forEach(m => {
      const items = m.action_items || [];
      items.forEach(item => {
        totalActions++;
        const person = item.person || item.pessoa || 'Nao atribuido';
        const task = item.task || item.tarefa || (typeof item === 'string' ? item : '');
        if (!actionsByPerson[person]) actionsByPerson[person] = 0;
        actionsByPerson[person]++;
        actionItems.push({ person, task, meeting: m.title || m.titulo, date: m.date || m.data });
      });
    });

    const noticias = news.noticias || [];
    const dc24 = context.dados_comerciais?.['2024'] || {};
    const dc25 = context.dados_comerciais?.['2025'] || {};
    const dc26 = context.dados_comerciais?.[TBO_CONFIG.app.fiscalYear] || {};

    const data = { context, ativos, finalizados, totalFinalizados, ic, meetingsArr, meta, recentMeetings, totalActions, actionsByPerson, actionItems, noticias, dc24, dc25, dc26 };
    this._lastData = data;
    return data;
  },

  // ── Personalized greeting v3 ─────────────────────────────────────────────
  _renderGreeting() {
    const user = (typeof TBO_AUTH !== 'undefined') ? TBO_AUTH.getCurrentUser() : null;
    if (!user) return '';

    const h = new Date().getHours();
    let greeting = 'Boa noite';
    if (h >= 5 && h < 12) greeting = 'Bom dia';
    else if (h >= 12 && h < 18) greeting = 'Boa tarde';

    const firstName = this._esc((user.name || '').split(' ')[0]);
    const d = this._getData();

    // Count pending items for user
    const myActions = d.actionItems.filter(ai => {
      if (!user.name) return false;
      const personLower = ai.person.toLowerCase();
      const nameParts = user.name.toLowerCase().split(/\s+/);
      return nameParts.some(part => part.length > 2 && personLower.includes(part));
    });
    const completed = JSON.parse(localStorage.getItem('tbo_completed_actions') || '[]');
    const pendingCount = myActions.filter(ai => !completed.includes(ai.task + '|' + ai.meeting)).length;

    // Timer badge
    let timerBadge = '';
    if (typeof TBO_WORKLOAD !== 'undefined' && user) {
      const timer = TBO_WORKLOAD.getRunningTimer(user.id);
      if (timer) {
        const proj = TBO_STORAGE.getErpEntity('project', timer.project_id);
        timerBadge = `<span class="tag" style="background:#22c55e30;color:#22c55e;font-size:0.72rem;margin-left:8px;">&#9201; Timer ativo: ${proj ? proj.name : ''}</span>`;
      }
    }

    // Hours today
    let hoursStr = '';
    if (typeof TBO_WORKLOAD !== 'undefined' && user) {
      const todayStr = TBO_WORKLOAD._today();
      const todayEntries = TBO_WORKLOAD.getTimeEntries({ userId: user.id, dateFrom: todayStr, dateTo: todayStr });
      const todayMins = todayEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
      if (todayMins > 0) hoursStr = TBO_WORKLOAD.formatHoursMinutes(todayMins);
    }

    const dataHoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Status badges
    const badges = [];
    if (pendingCount > 0) badges.push(`<span class="cc-status-dot" style="background:#f59e0b;"></span>${pendingCount} pendente${pendingCount > 1 ? 's' : ''}`);
    if (d.recentMeetings.length > 0) badges.push(`<span class="cc-status-dot" style="background:#3b82f6;"></span>${d.recentMeetings.length} reuniao${d.recentMeetings.length > 1 ? 'es' : ''}`);
    if (hoursStr) badges.push(`<span class="cc-status-dot" style="background:#22c55e;"></span>${hoursStr} hoje`);

    return `
      <div class="cc-hero">
        <div class="cc-hero-left">
          <h1 class="cc-hero-title">${greeting}, ${firstName}${timerBadge}</h1>
          <div class="cc-hero-meta">
            <span style="text-transform:capitalize;">${dataHoje}</span>
            ${badges.length > 0 ? '<span style="color:var(--border-default);">|</span>' + badges.join('<span style="color:var(--border-default);margin:0 4px;">·</span>') : ''}
          </div>
        </div>
        <div class="cc-hero-actions">
          <button class="btn btn-sm btn-secondary" id="ccBriefing" style="display:inline-flex;align-items:center;gap:5px;font-size:0.75rem;">
            <i data-lucide="sparkles" style="width:14px;height:14px;"></i> Briefing
          </button>
          <button class="btn btn-sm btn-ghost" id="ccCustomizeToggle" style="display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;">
            <i data-lucide="sliders-horizontal" style="width:14px;height:14px;"></i> Personalizar
          </button>
        </div>
      </div>
    `;
  },

  // ── My Tasks Today: tasks with due_date = today or overdue ──────────────
  _renderMyTasksToday() {
    const user = (typeof TBO_AUTH !== 'undefined') ? TBO_AUTH.getCurrentUser() : null;
    if (!user) return '';

    const today = new Date().toISOString().split('T')[0];
    const tasks = TBO_STORAGE.getAllErpEntities('task');
    const myTasks = tasks.filter(t => {
      const isOwner = t.ownerId === user.id;
      const notDone = !['done', 'concluido', 'finalizado', 'cancelado'].includes(t.status);
      const isDueToday = t.dueDate && t.dueDate <= today;
      return isOwner && notDone && isDueToday;
    }).sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

    if (myTasks.length === 0) return '';

    return `
      <div class="card" style="padding:16px;">
        <h3 style="font-size:0.9rem;font-weight:700;margin:0 0 10px;display:flex;align-items:center;gap:6px;">
          <i data-lucide="clipboard-check" style="width:16px;height:16px;color:var(--accent-gold);"></i>
          Minhas Tarefas Hoje (${myTasks.length})
        </h3>
        ${myTasks.slice(0, 6).map(t => {
          const overdue = t.dueDate < today;
          const proj = t.projectId ? TBO_STORAGE.getErpEntity(t.projectId) : null;
          return `
            <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border-subtle);font-size:0.78rem;">
              <span style="width:8px;height:8px;border-radius:50%;background:${overdue ? '#ef4444' : '#f59e0b'};flex-shrink:0;" title="${overdue ? 'Atrasada' : 'Vence hoje'}"></span>
              <span style="flex:1;font-weight:500;">${this._esc(t.name || t.title)}</span>
              ${proj ? `<span style="font-size:0.68rem;color:var(--text-muted);">${this._esc(proj.name)}</span>` : ''}
              <button class="btn btn-sm btn-ghost cc-quick-done" data-task-id="${t.id}" style="padding:2px 6px;font-size:0.68rem;color:var(--color-success);">Concluir</button>
            </div>
          `;
        }).join('')}
        ${myTasks.length > 6 ? `<div style="font-size:0.72rem;color:var(--text-muted);text-align:center;padding:8px 0;">+ ${myTasks.length - 6} mais</div>` : ''}
      </div>
    `;
  },

  // ── Weekly Summary: hours, tasks completed, deliverables ──────────────
  _renderWeeklySummary() {
    const user = (typeof TBO_AUTH !== 'undefined') ? TBO_AUTH.getCurrentUser() : null;
    if (!user) return '';
    if (typeof TBO_WORKLOAD === 'undefined') return '';

    const weekStart = TBO_WORKLOAD.getWeekStart();
    const weekEnd = TBO_WORKLOAD.getWeekEnd(weekStart);

    // Hours logged this week
    const entries = TBO_WORKLOAD.getTimeEntries({ userId: user.id, dateFrom: weekStart, dateTo: weekEnd });
    const totalMins = entries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
    const weeklyTarget = TBO_WORKLOAD.getUserWeeklyMinutes(user.id);
    const pct = weeklyTarget > 0 ? Math.round(totalMins / weeklyTarget * 100) : 0;

    // Tasks completed this week
    const allTasks = TBO_STORAGE.getAllErpEntities('task');
    const completedThisWeek = allTasks.filter(t =>
      t.ownerId === user.id &&
      ['done', 'concluido', 'finalizado'].includes(t.status) &&
      t.updatedAt && t.updatedAt >= weekStart
    ).length;

    // Deliverables approved this week
    const allDeliverables = TBO_STORAGE.getAllErpEntities('deliverable');
    const approvedThisWeek = allDeliverables.filter(d =>
      d.status === 'aprovado' &&
      d.updatedAt && d.updatedAt >= weekStart
    ).length;

    return `
      <div class="card" style="padding:16px;">
        <h3 style="font-size:0.9rem;font-weight:700;margin:0 0 12px;display:flex;align-items:center;gap:6px;">
          <i data-lucide="bar-chart-3" style="width:16px;height:16px;color:var(--accent-blue);"></i>
          Resumo Semanal
        </h3>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:4px;">
              <span>Horas Registradas</span>
              <strong>${TBO_WORKLOAD.formatHoursMinutes(totalMins)} / ${TBO_WORKLOAD.formatHoursMinutes(weeklyTarget)}</strong>
            </div>
            <div style="height:6px;background:var(--bg-elevated);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${Math.min(pct, 100)}%;background:${pct >= 80 ? 'var(--color-success)' : pct >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'};border-radius:3px;transition:width 0.3s;"></div>
            </div>
            <div style="font-size:0.68rem;color:var(--text-muted);margin-top:2px;">${pct}% da meta semanal</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div style="text-align:center;padding:8px;background:var(--bg-tertiary);border-radius:var(--radius-sm);">
              <div style="font-size:1.1rem;font-weight:700;color:var(--color-success);">${completedThisWeek}</div>
              <div style="font-size:0.68rem;color:var(--text-muted);">Tarefas Concluidas</div>
            </div>
            <div style="text-align:center;padding:8px;background:var(--bg-tertiary);border-radius:var(--radius-sm);">
              <div style="font-size:1.1rem;font-weight:700;color:var(--accent-gold);">${approvedThisWeek}</div>
              <div style="font-size:0.68rem;color:var(--text-muted);">Entregas Aprovadas</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WIDGET WRAPPER — Wraps content in a draggable widget container
  // ═══════════════════════════════════════════════════════════════════════════
  _wrapWidget(widgetId, content) {
    if (!content || !content.trim()) return '';
    const widgetDef = this._widgets[widgetId];
    const label = widgetDef ? widgetDef.label : widgetId;
    return `
      <div class="cc-widget" data-widget-id="${widgetId}" draggable="true">
        <span class="cc-widget-label">${this._esc(label)}</span>
        <button class="cc-widget-close-btn" data-remove-widget="${widgetId}" title="Remover widget">&times;</button>
        ${content}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WIDGET RENDERER — Dispatches to the correct render function per widget ID
  // ═══════════════════════════════════════════════════════════════════════════
  // v2.2.2: Widgets que contem dados financeiros sensiveis (receita, margem, pipeline values)
  // Apenas founders e finance podem visualizar
  _financialWidgets: ['business-pulse', 'pipeline-funnel', 'sidebar-commercial'],

  _isFinancialAccessAllowed() {
    const variant = (typeof TBO_AUTH !== 'undefined') ? TBO_AUTH.getDashboardVariant() : 'full';
    return variant === 'full' || variant === 'financial';
  },

  _renderWidgetContent(widgetId, d) {
    // v2.2.2: Bloquear widgets financeiros para roles sem acesso (artists, POs)
    if (this._financialWidgets.includes(widgetId) && !this._isFinancialAccessAllowed()) {
      return ''; // Widget oculto — sem dados financeiros para este role
    }

    const erpSummary = TBO_STORAGE.getErpSummary ? TBO_STORAGE.getErpSummary() : null;
    const erpAlerts = (typeof TBO_ERP !== 'undefined') ? TBO_ERP.generateAlerts().slice(0, 8) : [];
    const actionsToday = (typeof TBO_ERP !== 'undefined') ? TBO_ERP.getActionsToday().slice(0, 6) : [];
    const fc = d.dc26.fluxo_caixa || {};
    const receitaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.receita_mensal || {})[m] || 0), 0);
    const despesaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.despesa_mensal || {})[m] || 0), 0);
    const resultadoYTD = receitaYTD - despesaYTD;

    switch (widgetId) {
      case 'my-tasks':
        return this._renderMyTasksToday();

      case 'weekly-summary':
        return this._renderWeeklySummary();

      case 'erp-alerts':
        if (erpAlerts.length === 0) return '';
        return `
        <section class="section" style="margin-bottom:16px;">
          <div class="card" style="border-left:3px solid ${erpAlerts[0].level === 'critical' ? '#ef4444' : '#f59e0b'};padding:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <h3 style="font-size:0.9rem;font-weight:700;color:var(--text-primary);">Alertas ERP (${erpAlerts.length})</h3>
              ${erpSummary ? `<div style="display:flex;gap:12px;font-size:0.72rem;color:var(--text-muted);">
                <span>${erpSummary.projects.active} projetos</span>
                <span style="color:${erpSummary.tasks.overdue > 0 ? '#ef4444' : '#22c55e'};">${erpSummary.tasks.overdue} atrasadas</span>
                <span>${erpSummary.deliverables.pendingReview} revisoes</span>
              </div>` : ''}
            </div>
            ${erpAlerts.map(a => `
              <div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--border-subtle);font-size:0.78rem;">
                <span style="flex-shrink:0;">${a.icon}</span>
                <div style="flex:1;">
                  <div style="font-weight:500;color:${a.level === 'critical' ? '#ef4444' : '#f59e0b'};">${a.title}</div>
                  <div style="font-size:0.72rem;color:var(--text-muted);">${a.action}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>`;

      case 'actions-today':
        if (actionsToday.length === 0) return '';
        return `
        <section class="section" style="margin-bottom:16px;">
          <div class="card" style="padding:16px;">
            <h3 style="font-size:0.9rem;font-weight:700;margin-bottom:10px;">Acoes para Hoje (${actionsToday.length})</h3>
            ${actionsToday.map(a => `
              <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border-subtle);font-size:0.78rem;">
                <span style="width:8px;height:8px;border-radius:50%;background:${a.priority === 'critical' ? '#ef4444' : a.priority === 'high' ? '#f59e0b' : '#3b82f6'};flex-shrink:0;"></span>
                <div style="flex:1;">
                  <span style="font-weight:500;">${a.title}</span>
                  ${a.project ? `<span style="color:var(--text-muted);"> | ${a.project}</span>` : ''}
                </div>
                <span class="tag" style="font-size:0.62rem;">${a.label}</span>
              </div>
            `).join('')}
          </div>
        </section>`;

      case 'kpis':
        // v2.2.2: Card de receita so para founders/finance — outros veem entregas do mes
        const showFinancialKpi = this._isFinancialAccessAllowed();
        const kpiFinancialCard = showFinancialKpi
          ? `<div class="kpi-card kpi-card--gold">
              <div class="kpi-label">Receita YTD 2026</div>
              <div class="kpi-value gold">${receitaYTD > 0 ? TBO_FORMATTER.currency(receitaYTD) : '\u2014'}</div>
              <div class="kpi-change ${resultadoYTD >= 0 ? 'positive' : 'negative'}">${resultadoYTD >= 0 ? '+' : ''}${TBO_FORMATTER.currency(resultadoYTD)} resultado</div>
            </div>`
          : `<div class="kpi-card">
              <div class="kpi-label">Entregas no Mes</div>
              <div class="kpi-value">${erpSummary ? erpSummary.deliverables?.completed || 0 : d.totalFinalizados || 0}</div>
              <div class="kpi-change neutral">${d.ativos.length} projetos em andamento</div>
            </div>`;
        return `
        <section class="section">
          <div class="grid-4" style="margin-bottom:12px;">
            <div class="kpi-card">
              <div class="kpi-label">Projetos Ativos</div>
              <div class="kpi-value">${erpSummary ? erpSummary.projects.active : d.ativos.length}</div>
              <div class="kpi-change neutral">${erpSummary ? erpSummary.tasks.overdue + ' tarefas atrasadas' : new Set(d.ativos.map(p => p.construtora)).size + ' construtoras'}</div>
            </div>
            ${kpiFinancialCard}
            <div class="kpi-card">
              <div class="kpi-label">Reunioes (7 dias)</div>
              <div class="kpi-value">${d.recentMeetings.length}</div>
              <div class="kpi-change neutral">${d.meetingsArr.length} total registradas</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Action Items</div>
              <div class="kpi-value">${d.totalActions}</div>
              <div class="kpi-change neutral">${Object.keys(d.actionsByPerson).length} pessoas</div>
            </div>
          </div>
        </section>`;

      case 'business-pulse':
        return this._renderBusinessPulse(d);

      case 'strategic-alerts':
        return `
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">Alertas Estrategicos</h2>
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-sm btn-primary" id="ccGenerateAlerts">Gerar com IA</button>
                  <button class="btn btn-sm btn-secondary" id="ccBriefing">Briefing da Semana</button>
                </div>
              </div>
              <div id="ccAlerts">
                ${this._renderStaticAlerts(d)}
              </div>
              <div id="ccAiAlerts" class="ai-response" style="display:none; margin-top:12px;"></div>
            </section>`;

      case 'pipeline-funnel':
        return this._renderPipelineFunnel(d);

      case 'culture-nudge':
        return this._renderCultureNudge();

      case 'people-widget':
        return this._renderPeopleWidget();

      case 'news-feed':
        return `
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">Noticias do Mercado</h2>
                <div style="display:flex; gap:8px; align-items:center;">
                  ${d.noticias.length > 0 ? `<span style="font-size:0.72rem; color:var(--text-muted);">${d.noticias.length} noticias</span>` : ''}
                  <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('mercado')">Ver todas &rarr;</button>
                </div>
              </div>
              ${this._renderNewsFeed(d.noticias)}
            </section>`;

      case 'projects-overview':
        return `
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">Projetos Ativos</h2>
                <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('projetos')">Ver todos &rarr;</button>
              </div>
              <div class="grid-3">
                ${d.ativos.slice(0, 6).map(p => this._renderProjectCard(p, d.meetingsArr)).join('')}
                ${d.ativos.length > 6 ? `
                  <div class="card" style="padding:14px; display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="TBO_ROUTER.navigate('projetos')">
                    <span style="color:var(--accent-gold); font-size:0.85rem;">+${d.ativos.length - 6} projetos &rarr;</span>
                  </div>
                ` : ''}
              </div>
            </section>`;

      case 'cities-map':
        return `
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">Cidades Atendidas</h2>
                <span style="font-size:0.72rem;color:var(--text-muted);">${this._getCities(d.ativos, d.finalizados).length} cidades</span>
              </div>
              <div class="card" style="padding:0;overflow:hidden;">
                <div id="citiesLeafletMap" style="height:440px;width:100%;background:#1a1a2e;"></div>
                <div style="padding:16px;border-top:1px solid var(--border-subtle);">
                  ${this._renderCitiesList(d.ativos, d.finalizados)}
                </div>
              </div>
            </section>`;

      case 'sidebar-meetings':
        return this._renderSidebarMeetings(d.meetingsArr);

      case 'sidebar-actions':
        return this._renderSidebarActions(d.actionsByPerson, d.totalActions);

      case 'sidebar-market':
        return this._renderSidebarMarket(d.ic);

      case 'sidebar-commercial':
        return this._renderSidebarCommercial(d);

      default:
        return '';
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL DASHBOARD v3 (founder) — Redesigned 3-column layout with charts
  // ═══════════════════════════════════════════════════════════════════════════
  _renderFullDashboard() {
    const d = this._getData();
    const erpSummary = TBO_STORAGE.getErpSummary ? TBO_STORAGE.getErpSummary() : null;
    const fc = d.dc26.fluxo_caixa || {};
    const receitaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.receita_mensal || {})[m] || 0), 0);
    const despesaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.despesa_mensal || {})[m] || 0), 0);
    const resultadoYTD = receitaYTD - despesaYTD;
    const metaAnual = fc.meta_vendas_anual || 1;
    const progressMeta = metaAnual > 0 ? ((receitaYTD / metaAnual) * 100) : 0;
    const margemYTD = receitaYTD > 0 ? ((resultadoYTD / receitaYTD) * 100).toFixed(1) : '0';
    const erpAlerts = (typeof TBO_ERP !== 'undefined') ? TBO_ERP.generateAlerts().slice(0, 5) : [];
    const actionsToday = (typeof TBO_ERP !== 'undefined') ? TBO_ERP.getActionsToday().slice(0, 5) : [];

    // Get ERP task data
    const allTasks = typeof TBO_STORAGE !== 'undefined' ? TBO_STORAGE.getAllErpEntities('task') : [];
    const overdueTasks = erpSummary ? erpSummary.tasks.overdue : 0;
    const activeProjCount = erpSummary ? erpSummary.projects.active : d.ativos.length;

    return `
      <div class="command-center">
        ${this._renderGreeting()}
        ${this._renderQuickActions()}

        <!-- KPI Strip -->
        ${this._renderKpiStrip(d, receitaYTD, resultadoYTD, progressMeta, margemYTD, activeProjCount, overdueTasks)}

        <!-- Main 3-column grid -->
        <div class="cc-grid">
          <!-- Column 1+2: Revenue chart (spans 2 cols) -->
          <div class="cc-col-span-2">
            ${this._renderRevenueChart(d, fc)}
          </div>

          <!-- Column 3: Sidebar -->
          <div class="cc-sidebar-v3">
            ${this._renderSidebarMeetingsV3(d.meetingsArr)}
            ${this._renderSidebarActionsV3(d.actionsByPerson, d.totalActions)}
            ${this._renderSidebarCommercialV3(d)}
          </div>

          <!-- Row 2, Col 1: Pipeline + Business Pulse -->
          <div>
            ${this._renderPipelineCardV3(d)}
            <div style="margin-top:16px;">
              ${this._renderBusinessPulseV3(d)}
            </div>
          </div>

          <!-- Row 2, Col 2: Active Projects -->
          <div>
            ${this._renderProjectsGridV3(d)}
          </div>

          <!-- Row 3, Col 1+2: Alerts + Actions Today -->
          ${erpAlerts.length > 0 || actionsToday.length > 0 ? `
          <div class="cc-col-span-2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            ${erpAlerts.length > 0 ? this._renderAlertsCardV3(erpAlerts, erpSummary) : ''}
            ${actionsToday.length > 0 ? this._renderActionsTodayV3(actionsToday) : ''}
            ${erpAlerts.length === 0 && actionsToday.length > 0 ? '' : ''}
          </div>` : ''}

          <!-- Row 4: Strategic Alerts + People + News -->
          <div class="cc-col-span-2">
            ${this._renderStrategicAlertsV3(d)}
          </div>

          <!-- Map -->
          <div class="cc-col-span-2">
            ${this._renderMapCardV3(d)}
          </div>

          <!-- Sidebar: Culture + Market -->
          <div class="cc-sidebar-v3">
            ${this._renderSidebarMarketV3(d.ic)}
            ${this._renderCultureNudgeV3()}
          </div>
        </div>

        ${this._renderCustomizePanel()}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // V3 WIDGETS — New redesigned widget renderers
  // ═══════════════════════════════════════════════════════════════════════════

  _renderKpiStrip(d, receitaYTD, resultadoYTD, progressMeta, margemYTD, activeProjCount, overdueTasks) {
    const fc = d.dc26.fluxo_caixa || {};
    const dc25 = d.dc25;
    const prev25 = dc25.total_vendido || 0;
    const growthPct = prev25 > 0 ? (((receitaYTD - prev25) / prev25) * 100).toFixed(0) : 0;

    return `
      <div class="cc-kpi-strip">
        <div class="cc-kpi-card" style="--kpi-accent:#E85102; --kpi-bg:rgba(232,81,2,0.08);">
          <div class="cc-kpi-header">
            <span class="cc-kpi-label">Receita YTD</span>
            <div class="cc-kpi-icon"><i data-lucide="trending-up"></i></div>
          </div>
          <div class="cc-kpi-value">${receitaYTD > 0 ? TBO_FORMATTER.currency(receitaYTD) : '\u2014'}</div>
          <div class="cc-kpi-sub">
            <span class="cc-kpi-badge ${resultadoYTD >= 0 ? 'up' : 'down'}">${resultadoYTD >= 0 ? '+' : ''}${TBO_FORMATTER.currency(resultadoYTD)}</span>
            <span>${progressMeta.toFixed(0)}% da meta</span>
          </div>
        </div>

        <div class="cc-kpi-card" style="--kpi-accent:#3b82f6; --kpi-bg:rgba(59,130,246,0.08);">
          <div class="cc-kpi-header">
            <span class="cc-kpi-label">Projetos Ativos</span>
            <div class="cc-kpi-icon"><i data-lucide="folder-kanban"></i></div>
          </div>
          <div class="cc-kpi-value">${activeProjCount}</div>
          <div class="cc-kpi-sub">
            <span class="cc-kpi-badge ${overdueTasks > 0 ? 'down' : 'up'}">${overdueTasks > 0 ? overdueTasks + ' atrasadas' : 'Em dia'}</span>
            <span>${new Set(d.ativos.map(p => p.construtora)).size} clientes</span>
          </div>
        </div>

        <div class="cc-kpi-card" style="--kpi-accent:#8b5cf6; --kpi-bg:rgba(139,92,246,0.08);">
          <div class="cc-kpi-header">
            <span class="cc-kpi-label">Reunioes (7d)</span>
            <div class="cc-kpi-icon"><i data-lucide="calendar"></i></div>
          </div>
          <div class="cc-kpi-value">${d.recentMeetings.length}</div>
          <div class="cc-kpi-sub">
            <span class="cc-kpi-badge neutral">${d.totalActions} action items</span>
            <span>${d.meetingsArr.length} total</span>
          </div>
        </div>

        <div class="cc-kpi-card" style="--kpi-accent:#22c55e; --kpi-bg:rgba(34,197,94,0.08);">
          <div class="cc-kpi-header">
            <span class="cc-kpi-label">Margem YTD</span>
            <div class="cc-kpi-icon"><i data-lucide="percent"></i></div>
          </div>
          <div class="cc-kpi-value">${margemYTD}%</div>
          <div class="cc-kpi-sub">
            <span class="cc-kpi-badge ${parseFloat(margemYTD) > 0 ? 'up' : 'down'}">${parseFloat(margemYTD) > 0 ? 'Positiva' : 'Negativa'}</span>
          </div>
        </div>

        <div class="cc-kpi-card" style="--kpi-accent:#f59e0b; --kpi-bg:rgba(245,158,11,0.08);">
          <div class="cc-kpi-header">
            <span class="cc-kpi-label">Meta 2026</span>
            <div class="cc-kpi-icon"><i data-lucide="target"></i></div>
          </div>
          <div class="cc-kpi-value">${progressMeta.toFixed(0)}%</div>
          <div class="cc-kpi-sub">
            <span>${fc.meta_vendas_anual ? TBO_FORMATTER.currency(fc.meta_vendas_anual) : '\u2014'}</span>
          </div>
        </div>
      </div>
    `;
  },

  _renderRevenueChart(d, fc) {
    if (!fc || !fc.receita_mensal) {
      return `<div class="cc-card"><div class="cc-card-body" style="padding:32px;text-align:center;color:var(--text-muted);">Dados financeiros nao disponiveis</div></div>`;
    }
    const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const realizados = fc.meses_realizados || [];

    return `
      <div class="cc-card">
        <div class="cc-card-header">
          <span class="cc-card-title"><i data-lucide="bar-chart-3"></i> Receita vs Despesa 2026</span>
          <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('financeiro')">Detalhar</button>
        </div>
        <div class="cc-card-body">
          <div class="cc-chart-wrap">
            <canvas id="ccRevenueChart"></canvas>
          </div>
          <div style="display:flex;justify-content:center;gap:20px;margin-top:12px;font-size:0.72rem;">
            <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:#E85102;"></span> Receita</span>
            <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:#64748b;"></span> Despesa</span>
            <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:3px;border-radius:2px;background:#22c55e;"></span> Resultado</span>
          </div>
        </div>
      </div>
    `;
  },

  _renderPipelineCardV3(d) {
    const dc25 = d.dc25;
    const dc26 = d.dc26;
    const fc = dc26.fluxo_caixa || {};
    const propostas = dc25.propostas || 0;
    const contratos = dc25.contratos || 0;
    const negociacao = dc25.em_negociacao || 0;
    const metaAnual = fc.meta_vendas_anual || 1;
    const receitaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.receita_mensal || {})[m] || 0), 0);
    const pct = metaAnual > 0 ? ((receitaYTD / metaAnual) * 100) : 0;

    return `
      <div class="cc-card">
        <div class="cc-card-header">
          <span class="cc-card-title"><i data-lucide="filter"></i> Pipeline</span>
          <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('comercial')">Ver</button>
        </div>
        <div class="cc-card-body">
          <div class="cc-chart-wrap" style="height:180px;">
            <canvas id="ccPipelineChart"></canvas>
          </div>
          <div style="margin-top:12px;">
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:4px;">
              <span style="font-weight:600;">Meta 2026</span>
              <span style="color:var(--text-muted);">${pct.toFixed(0)}%</span>
            </div>
            <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${Math.min(100, pct)}%;background:${pct >= 50 ? '#22c55e' : pct >= 25 ? '#f59e0b' : '#ef4444'};border-radius:3px;transition:width 0.5s;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _renderBusinessPulseV3(d) {
    const ctx = TBO_STORAGE.get('context') || {};
    const dc24 = ctx.dados_comerciais?.['2024'] || {};
    const dc25 = ctx.dados_comerciais?.['2025'] || {};
    const fy = TBO_CONFIG?.app?.fiscalYear || '2026';
    const dc26 = ctx.dados_comerciais?.[fy] || {};
    const fc = dc26.fluxo_caixa || {};

    const erpProjects = TBO_STORAGE.getAllErpEntities ? TBO_STORAGE.getAllErpEntities('project') : [];
    const erpAtivos = erpProjects.filter(p => !['finalizado', 'cancelado'].includes(p.status));
    const projAtivos = erpAtivos.length > 0 ? erpAtivos : (ctx.projetos_ativos || []);
    const finalizados = ctx.projetos_finalizados || {};
    const clientes = ctx.clientes_construtoras || [];

    const activeConstrutoras = new Set(projAtivos.map(p => (p.construtora || '')).filter(Boolean));
    const prevClients = new Set();
    ['2024','2025'].forEach(y => { (finalizados[y] || []).forEach(p => { if (!p) return; const pLow = (typeof p === 'string' ? p : (p.nome || '')).toLowerCase(); clientes.forEach(c => { if (c && pLow.includes(c.toLowerCase())) prevClients.add(c); }); }); });
    projAtivos.forEach(p => { if (p.construtora) prevClients.add(p.construtora); });
    const churned = [...prevClients].filter(c => !activeConstrutoras.has(c));
    const churnRate = prevClients.size > 0 ? Math.round((churned.length / prevClients.size) * 100) : 0;

    const winRate = parseFloat(dc26.conversao_proposta) || parseFloat(dc25.conversao_proposta) || 0;
    const ticket = dc26.ticket_medio || dc25.ticket_medio || dc24.ticket_medio || 0;

    const mRealized = fc.meses_realizados || [];
    const recYTD = mRealized.reduce((s, mes) => s + ((fc.receita_mensal||{})[mes]||0), 0);
    const despYTD = mRealized.reduce((s, mes) => s + ((fc.despesa_mensal||{})[mes]||0), 0);
    const margemYTD = recYTD > 0 ? ((recYTD - despYTD) / recYTD * 100).toFixed(1) : '0';

    const fmt = (v) => { const abs = Math.abs(v); if (abs >= 1000000) return (v<0?'-':'') + (abs/1000000).toFixed(1) + 'M'; if (abs >= 1000) return (v<0?'-':'') + (abs/1000).toFixed(0) + 'k'; return v.toLocaleString('pt-BR'); };
    const dotColor = (val, good, warn) => val <= good ? '#22c55e' : val <= warn ? '#f59e0b' : '#ef4444';

    return `
      <div class="cc-card">
        <div class="cc-card-header">
          <span class="cc-card-title"><i data-lucide="heart-pulse"></i> Business Pulse</span>
          <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('inteligencia')">BI</button>
        </div>
        <div class="cc-card-body">
          <div class="cc-pulse-grid">
            <div class="cc-pulse-item">
              <div class="cc-pulse-val"><span class="cc-pulse-dot" style="background:${dotColor(churnRate, 15, 25)};"></span>${churnRate}%</div>
              <div class="cc-pulse-label">Churn</div>
            </div>
            <div class="cc-pulse-item">
              <div class="cc-pulse-val"><span class="cc-pulse-dot" style="background:${winRate > 40 ? '#22c55e' : winRate > 30 ? '#f59e0b' : '#ef4444'};"></span>${winRate}%</div>
              <div class="cc-pulse-label">Win Rate</div>
            </div>
            <div class="cc-pulse-item">
              <div class="cc-pulse-val"><span class="cc-pulse-dot" style="background:${parseFloat(margemYTD) > 10 ? '#22c55e' : parseFloat(margemYTD) > 0 ? '#f59e0b' : '#ef4444'};"></span>${margemYTD}%</div>
              <div class="cc-pulse-label">Margem</div>
            </div>
            <div class="cc-pulse-item">
              <div class="cc-pulse-val">R$ ${fmt(ticket)}</div>
              <div class="cc-pulse-label">Ticket Medio</div>
            </div>
            <div class="cc-pulse-item">
              <div class="cc-pulse-val">${projAtivos.length}</div>
              <div class="cc-pulse-label">Proj. Ativos</div>
            </div>
            <div class="cc-pulse-item">
              <div class="cc-pulse-val">${new Set(projAtivos.map(p => p.construtora)).size}</div>
              <div class="cc-pulse-label">Clientes</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _renderProjectsGridV3(d) {
    return `
      <div class="cc-card">
        <div class="cc-card-header">
          <span class="cc-card-title"><i data-lucide="building-2"></i> Projetos Ativos (${d.ativos.length})</span>
          <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('projetos')">Todos</button>
        </div>
        <div class="cc-card-body">
          <div class="cc-project-grid">
            ${d.ativos.slice(0, 6).map(p => {
              const bus = p.bus || [];
              let barColor = 'var(--text-muted)';
              if (bus.includes('Digital 3D')) barColor = '#3b82f6';
              else if (bus.includes('Branding')) barColor = '#8b5cf6';
              else if (bus.includes('Marketing') || bus.includes('Audiovisual')) barColor = '#22c55e';
              if (bus.length >= 4) barColor = '#E85102';
              return `
                <div class="cc-project-mini" onclick="TBO_ROUTER.navigate('projetos')">
                  <div class="cc-project-mini-bar" style="background:${barColor};"></div>
                  <div class="cc-project-mini-name">${_escapeHtml(p.nome)}</div>
                  <div class="cc-project-mini-client">${_escapeHtml(p.construtora)}</div>
                  <div class="cc-project-mini-bus">
                    ${bus.slice(0, 3).map(b => `<span class="tag">${b}</span>`).join('')}
                    ${bus.length > 3 ? `<span class="tag">+${bus.length - 3}</span>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          ${d.ativos.length > 6 ? `<div style="text-align:center;margin-top:10px;"><button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('projetos')" style="color:var(--brand-orange);">+${d.ativos.length - 6} projetos</button></div>` : ''}
        </div>
      </div>
    `;
  },

  _renderAlertsCardV3(erpAlerts, erpSummary) {
    return `
      <div class="cc-card">
        <div class="cc-card-header">
          <span class="cc-card-title"><i data-lucide="alert-triangle"></i> Alertas (${erpAlerts.length})</span>
        </div>
        <div class="cc-card-body">
          ${erpAlerts.slice(0, 4).map(a => `
            <div class="cc-timeline-item">
              <span class="cc-timeline-dot" style="background:${a.level === 'critical' ? '#ef4444' : '#f59e0b'};"></span>
              <div class="cc-timeline-content">
                <div class="cc-timeline-title" style="color:${a.level === 'critical' ? '#ef4444' : '#f59e0b'};">${a.title}</div>
                <div class="cc-timeline-meta">${a.action}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  _renderActionsTodayV3(actionsToday) {
    return `
      <div class="cc-card">
        <div class="cc-card-header">
          <span class="cc-card-title"><i data-lucide="target"></i> Acoes Hoje (${actionsToday.length})</span>
        </div>
        <div class="cc-card-body">
          ${actionsToday.slice(0, 4).map(a => `
            <div class="cc-timeline-item">
              <span class="cc-timeline-dot" style="background:${a.priority === 'critical' ? '#ef4444' : a.priority === 'high' ? '#f59e0b' : '#3b82f6'};"></span>
              <div class="cc-timeline-content">
                <div class="cc-timeline-title">${a.title}</div>
                <div class="cc-timeline-meta">${a.project ? a.project + ' · ' : ''}${a.label}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  _renderStrategicAlertsV3(d) {
    return `
      <div class="cc-card">
        <div class="cc-card-header">
          <span class="cc-card-title"><i data-lucide="shield-alert"></i> Alertas Estrategicos</span>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-sm btn-primary" id="ccGenerateAlerts">Gerar com IA</button>
          </div>
        </div>
        <div class="cc-card-body">
          <div id="ccAlerts">${this._renderStaticAlerts(d)}</div>
          <div id="ccAiAlerts" class="ai-response" style="display:none;margin-top:12px;"></div>
        </div>
      </div>
    `;
  },

  _renderMapCardV3(d) {
    const cities = this._getCities(d.ativos, d.finalizados);
    return `
      <div class="cc-card">
        <div class="cc-card-header">
          <span class="cc-card-title"><i data-lucide="map"></i> Cidades Atendidas</span>
          <span style="font-size:0.72rem;color:var(--text-muted);">${cities.length} cidades</span>
        </div>
        <div style="padding:0;">
          <div id="citiesLeafletMap" style="height:360px;width:100%;background:#1a1a2e;"></div>
        </div>
        <div style="padding:14px 20px;">
          ${this._renderCitiesList(d.ativos, d.finalizados)}
        </div>
      </div>
    `;
  },

  // ── Sidebar V3 widgets ──
  _renderSidebarMeetingsV3(meetingsArr) {
    return `
      <div class="cc-sidebar-section">
        <div class="cc-sidebar-section-header">
          <span class="cc-sidebar-section-title"><i data-lucide="calendar"></i> Reunioes</span>
          <span style="font-size:0.68rem;color:var(--text-muted);">${meetingsArr.length}</span>
        </div>
        <div class="cc-sidebar-section-body">
          ${meetingsArr.length > 0 ? meetingsArr.slice(0, 5).map(m => `
            <div class="cc-sidebar-list-item" onclick="TBO_ROUTER.navigate('reunioes')">
              <div style="min-width:0;">
                <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;">${_escapeHtml(m.title || m.titulo)}</div>
                <div style="font-size:0.68rem;color:var(--text-muted);">${TBO_FORMATTER.relativeTime(m.date || m.data)}</div>
              </div>
            </div>
          `).join('') : '<div style="font-size:0.78rem;color:var(--text-muted);padding:4px 0;">Nenhuma reuniao</div>'}
          <div style="margin-top:8px;text-align:center;">
            <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('reunioes')" style="width:100%;font-size:0.72rem;">Ver todas</button>
          </div>
        </div>
      </div>
    `;
  },

  _renderSidebarActionsV3(actionsByPerson, totalActions) {
    if (totalActions === 0) return '';
    const entries = Object.entries(actionsByPerson).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return `
      <div class="cc-sidebar-section">
        <div class="cc-sidebar-section-header">
          <span class="cc-sidebar-section-title"><i data-lucide="check-square"></i> Action Items</span>
          <span style="font-size:0.68rem;color:var(--text-muted);">${totalActions}</span>
        </div>
        <div class="cc-sidebar-section-body">
          ${entries.map(([person, count]) => {
            const escaped = person.replace(/'/g, "\\'");
            return `
              <div class="cc-sidebar-list-item" onclick="TBO_COMMAND_CENTER._filterActionsByPerson('${escaped}')">
                <span style="font-weight:500;">${_escapeHtml(person)}</span>
                <span class="tag">${count}</span>
              </div>
            `;
          }).join('')}
          <div id="ccSidebarActionDetail" style="display:none;margin-top:8px;border-top:1px solid var(--border-subtle);padding-top:8px;"></div>
        </div>
      </div>
    `;
  },

  _renderSidebarCommercialV3(d) {
    const fc = d.dc26.fluxo_caixa || {};
    const receitaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.receita_mensal || {})[m] || 0), 0);
    return `
      <div class="cc-sidebar-section">
        <div class="cc-sidebar-section-header">
          <span class="cc-sidebar-section-title"><i data-lucide="briefcase"></i> Comercial 2026</span>
        </div>
        <div class="cc-sidebar-section-body">
          <div class="cc-sidebar-list-item">
            <span>Receita YTD</span>
            <span style="font-weight:600;color:var(--brand-orange);">${receitaYTD > 0 ? TBO_FORMATTER.currency(receitaYTD) : '\u2014'}</span>
          </div>
          <div class="cc-sidebar-list-item">
            <span>Meta Anual</span>
            <span>${fc.meta_vendas_anual ? TBO_FORMATTER.currency(fc.meta_vendas_anual) : '\u2014'}</span>
          </div>
          <div class="cc-sidebar-list-item">
            <span>Margem Projetada</span>
            <span>${fc.margem_liquida_orcada || '\u2014'}</span>
          </div>
          ${d.dc25.total_vendido ? `
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border-subtle);">
            <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px;">2025</div>
            <div class="cc-sidebar-list-item">
              <span style="font-size:0.75rem;">Faturado</span>
              <span style="font-size:0.72rem;color:var(--text-muted);">${TBO_FORMATTER.currency(d.dc25.total_vendido)}</span>
            </div>
          </div>` : ''}
          <div style="margin-top:8px;text-align:center;">
            <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('financeiro')" style="width:100%;font-size:0.72rem;">Detalhar</button>
          </div>
        </div>
      </div>
    `;
  },

  _renderSidebarMarketV3(ic) {
    return `
      <div class="cc-sidebar-section">
        <div class="cc-sidebar-section-header">
          <span class="cc-sidebar-section-title"><i data-lucide="trending-up"></i> Mercado CWB</span>
          <span style="font-size:0.68rem;color:var(--text-muted);">${ic.periodo || ''}</span>
        </div>
        <div class="cc-sidebar-section-body">
          <div class="cc-sidebar-list-item">
            <span>Lancamentos</span>
            <span class="tag" style="color:var(--color-danger);">${ic.empreendimentos_lancados || '\u2014'} (${ic.variacao_empreendimentos || ''})</span>
          </div>
          <div class="cc-sidebar-list-item">
            <span>Unidades</span>
            <span class="tag" style="color:var(--color-danger);">${TBO_FORMATTER.number(ic.unidades_lancadas)} (${ic.variacao_unidades || ''})</span>
          </div>
          <div style="margin-top:8px;text-align:center;">
            <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('mercado')" style="width:100%;font-size:0.72rem;">Detalhar</button>
          </div>
        </div>
      </div>
    `;
  },

  _renderCultureNudgeV3() {
    if (typeof TBO_CULTURA_DATA === 'undefined' || !TBO_CULTURA_DATA.nudges) return '';
    const valor = TBO_CULTURA_DATA.nudges.valorDoDia();
    const tip = TBO_CULTURA_DATA.nudges.tipCultural();
    const reflexao = TBO_CULTURA_DATA.nudges.reflexaoDoDia();

    return `
      <div class="cc-sidebar-section">
        <div class="cc-sidebar-section-header">
          <span class="cc-sidebar-section-title"><i data-lucide="sparkles"></i> Cultura TBO</span>
        </div>
        <div class="cc-sidebar-section-body">
          <div style="background:linear-gradient(135deg, #E8510215, #E8510208);border:1px solid #E8510230;border-radius:8px;padding:12px;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:1rem;">${this._esc(valor.emoji || '')}</span>
              <span style="font-size:0.68rem;font-weight:700;color:#E85102;text-transform:uppercase;">Valor do Dia</span>
            </div>
            <div style="font-weight:700;font-size:0.82rem;margin-bottom:3px;">${this._esc(valor.nome)}</div>
            <div style="font-size:0.72rem;color:var(--text-secondary);line-height:1.4;">${this._esc(valor.desc)}</div>
          </div>
          <div style="background:var(--bg-tertiary);border-radius:6px;padding:10px;margin-bottom:8px;">
            <div style="font-size:0.62rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px;">Dica</div>
            <div style="font-size:0.72rem;line-height:1.4;">${this._esc(tip)}</div>
          </div>
          <div style="background:var(--bg-tertiary);border-radius:6px;padding:10px;">
            <div style="font-size:0.62rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px;">Reflexao</div>
            <div style="font-size:0.72rem;line-height:1.4;font-style:italic;">${this._esc(reflexao)}</div>
          </div>
          <div style="margin-top:8px;text-align:center;">
            <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('cultura')" style="font-size:0.68rem;color:var(--brand-orange);">Manual de Cultura</button>
          </div>
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECTS DASHBOARD (project_owner) — Focused on projects and action items
  // ═══════════════════════════════════════════════════════════════════════════
  _renderProjectsDashboard() {
    const d = this._getData();
    const user = TBO_AUTH.getCurrentUser();
    const bu = user?.bu;
    const seeAll = TBO_AUTH.canSeeAllProjects();

    // Filter projects by BU if applicable
    const myProjects = seeAll ? d.ativos : d.ativos.filter(p => {
      const projectBUs = (p.bus || []).map(b => b.toLowerCase());
      return bu && projectBUs.some(b => b.toLowerCase().includes(bu.toLowerCase()));
    });

    // Filter action items for this user
    const myActions = d.actionItems.filter(ai => {
      if (!user?.name) return false;
      const personLower = ai.person.toLowerCase();
      const nameParts = user.name.toLowerCase().split(/\s+/);
      return nameParts.some(part => part.length > 2 && personLower.includes(part));
    });

    // Filter meetings by BU (item 13)
    const buMeetings = bu ? d.meetingsArr.filter(m => {
      const title = (m.title || m.titulo || '').toLowerCase();
      return title.includes(bu.toLowerCase()) || !bu;
    }) : d.meetingsArr;

    const scopeLabel = seeAll ? 'Todos os projetos' : (bu ? `BU: ${bu}` : 'Seus projetos');

    return `
      <div class="command-center">
        ${this._renderGreeting()}
        ${this._renderQuickActions()}

        <!-- KPIs -->
        <section class="section">
          <div class="grid-4" style="margin-bottom:12px;">
            <div class="kpi-card">
              <div class="kpi-label">${seeAll ? 'Projetos Ativos' : 'Meus Projetos'}</div>
              <div class="kpi-value">${myProjects.length}</div>
              <div class="kpi-change neutral">${scopeLabel}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Reunioes (7 dias)</div>
              <div class="kpi-value">${d.recentMeetings.length}</div>
              <div class="kpi-change neutral">${d.meetingsArr.length} total</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Minhas Action Items</div>
              <div class="kpi-value">${myActions.length}</div>
              <div class="kpi-change neutral">de ${d.totalActions} total</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Total Estudio</div>
              <div class="kpi-value">${d.ativos.length}</div>
              <div class="kpi-change neutral">${new Set(d.ativos.map(p => p.construtora)).size} construtoras</div>
            </div>
          </div>
        </section>

        <div class="cc-layout">
          <div class="cc-main">
            <!-- My Action Items with toggle -->
            ${myActions.length > 0 ? `
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">Minhas Action Items</h2>
                <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('reunioes')">Ver reunioes &rarr;</button>
              </div>
              <div class="card" style="padding:0; overflow:hidden;">
                <table class="data-table">
                  <thead><tr><th style="width:32px;"></th><th>Tarefa</th><th>Reuniao</th><th>Data</th></tr></thead>
                  <tbody>
                    ${myActions.slice(0, 10).map(ai => this._renderActionItemRow(ai)).join('')}
                  </tbody>
                </table>
                ${myActions.length > 10 ? `<div style="padding:8px 16px; font-size:0.75rem; color:var(--text-muted);">+${myActions.length - 10} mais itens</div>` : ''}
              </div>
            </section>
            ` : `
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">Minhas Action Items</h2>
              </div>
              <div class="empty-state" style="padding:32px;">
                <div class="empty-state-text">Nenhum action item atribuido a voce</div>
              </div>
            </section>
            `}

            <!-- Projects -->
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">${seeAll ? 'Projetos Ativos' : 'Projetos da BU'}</h2>
                <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('projetos')">Ver todos &rarr;</button>
              </div>
              <div class="grid-3">
                ${myProjects.slice(0, 9).map(p => this._renderProjectCard(p, d.meetingsArr)).join('')}
                ${myProjects.length === 0 ? '<div class="empty-state" style="padding:32px; grid-column:1/-1;"><div class="empty-state-text">Nenhum projeto encontrado para sua BU</div></div>' : ''}
              </div>
            </section>
          </div>

          <!-- Sidebar -->
          <div class="cc-sidebar">
            ${this._renderSidebarMeetings(bu ? buMeetings : d.meetingsArr)}
            ${this._renderSidebarActions(d.actionsByPerson, d.totalActions)}
          </div>
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TASKS DASHBOARD (artist) — Enriched with 1:1s, feedbacks, PDI
  // ═══════════════════════════════════════════════════════════════════════════
  _renderTasksDashboard() {
    const d = this._getData();
    const user = TBO_AUTH.getCurrentUser();

    // Filter action items for this user
    const myActions = d.actionItems.filter(ai => {
      if (!user?.name) return false;
      const personLower = ai.person.toLowerCase();
      const nameParts = user.name.toLowerCase().split(/\s+/);
      return nameParts.some(part => part.length > 2 && personLower.includes(part));
    });

    // Get RH data for this user (item 12)
    const rhData = this._getRHDataForUser(user);

    return `
      <div class="command-center">
        ${this._renderGreeting()}
        ${this._renderQuickActions()}

        <!-- KPIs -->
        <section class="section">
          <div class="grid-4" style="margin-bottom:12px;">
            <div class="kpi-card">
              <div class="kpi-label">Minhas Tarefas</div>
              <div class="kpi-value">${myActions.length}</div>
              <div class="kpi-change neutral">action items pendentes</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Projetos Ativos</div>
              <div class="kpi-value">${d.ativos.length}</div>
              <div class="kpi-change neutral">total no estudio</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Reunioes (7 dias)</div>
              <div class="kpi-value">${d.recentMeetings.length}</div>
              <div class="kpi-change neutral">${d.meetingsArr.length} total</div>
            </div>
            ${rhData.mediaGeral ? `
            <div class="kpi-card">
              <div class="kpi-label">Minha Media PDI</div>
              <div class="kpi-value">${rhData.mediaGeral.toFixed(1)}</div>
              <div class="kpi-change neutral">${rhData.cicloAtual || 'Ciclo atual'}</div>
            </div>
            ` : `
            <div class="kpi-card">
              <div class="kpi-label">Finalizados</div>
              <div class="kpi-value">${d.totalFinalizados}</div>
              <div class="kpi-change neutral">desde 2020</div>
            </div>
            `}
          </div>
        </section>

        <div class="cc-layout">
          <div class="cc-main">
            <!-- My Tasks with toggle -->
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">Minhas Tarefas Pendentes</h2>
                <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('reunioes')">Reunioes &rarr;</button>
              </div>
              ${myActions.length > 0 ? `
                <div class="card" style="padding:0; overflow:hidden;">
                  <table class="data-table">
                    <thead><tr><th style="width:32px;"></th><th>Tarefa</th><th>Reuniao</th><th>Data</th></tr></thead>
                    <tbody>
                      ${myActions.map(ai => this._renderActionItemRow(ai)).join('')}
                    </tbody>
                  </table>
                </div>
              ` : `
                <div class="empty-state" style="padding:32px;">
                  <div class="empty-state-text">Nenhuma tarefa pendente. Otimo trabalho!</div>
                </div>
              `}
            </section>

            <!-- Projects (read-only overview) -->
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">Projetos do Estudio</h2>
                <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('projetos')">Ver detalhes &rarr;</button>
              </div>
              <div class="grid-3">
                ${d.ativos.slice(0, 6).map(p => this._renderProjectCard(p, d.meetingsArr)).join('')}
              </div>
            </section>
          </div>

          <!-- Sidebar -->
          <div class="cc-sidebar">
            ${this._renderSidebarMeetings(d.meetingsArr)}
            ${rhData.upcoming11 ? this._renderSidebarUpcoming11(rhData) : ''}
            ${rhData.recentFeedbacks.length > 0 ? this._renderSidebarRecentFeedbacks(rhData) : ''}
          </div>
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCIAL DASHBOARD (finance) — Focused on revenue, pipeline, market
  // ═══════════════════════════════════════════════════════════════════════════
  _renderFinancialDashboard() {
    const d = this._getData();
    const fc = d.dc26.fluxo_caixa || {};
    const receitaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.receita_mensal || {})[m] || 0), 0);

    return `
      <div class="command-center">
        ${this._renderGreeting()}
        ${this._renderQuickActions()}

        <!-- KPIs — prioritize 2026 -->
        <section class="section">
          <div class="grid-4" style="margin-bottom:12px;">
            <div class="kpi-card kpi-card--gold">
              <div class="kpi-label">Receita YTD 2026</div>
              <div class="kpi-value gold">${receitaYTD > 0 ? TBO_FORMATTER.currency(receitaYTD) : '\u2014'}</div>
              <div class="kpi-change neutral">Meta: ${fc.meta_vendas_anual ? TBO_FORMATTER.currency(fc.meta_vendas_anual) : '\u2014'}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Faturamento 2025</div>
              <div class="kpi-value">${d.dc25.total_vendido ? TBO_FORMATTER.currency(d.dc25.total_vendido) : '\u2014'}</div>
              <div class="kpi-change neutral">${d.dc25.conversao_proposta || '\u2014'} conversao</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Projetos Ativos</div>
              <div class="kpi-value">${d.ativos.length}</div>
              <div class="kpi-change neutral">${new Set(d.ativos.map(p => p.construtora)).size} construtoras</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Mercado CWB</div>
              <div class="kpi-value">${d.ic.empreendimentos_lancados || '\u2014'}</div>
              <div class="kpi-change neutral">${d.ic.variacao_empreendimentos || ''} ${d.ic.periodo || ''}</div>
            </div>
          </div>
        </section>

        <div class="cc-layout">
          <div class="cc-main">
            <!-- Financial Overview 2026 (primary) -->
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">Fluxo de Caixa 2026</h2>
                <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('financeiro')">Detalhar &rarr;</button>
              </div>
              ${this._renderFinancialFlowTable(fc)}
            </section>

            <!-- Financial Overview 2025 (comparison) -->
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">Resultado 2025 (comparativo)</h2>
              </div>
              <div class="card" style="padding:0; overflow:hidden;">
                <table class="data-table">
                  <thead><tr><th>Metrica</th><th>Valor</th></tr></thead>
                  <tbody>
                    <tr><td>Total Vendido</td><td style="font-weight:600;">${d.dc25.total_vendido ? TBO_FORMATTER.currency(d.dc25.total_vendido) : '\u2014'}</td></tr>
                    <tr><td>Propostas Enviadas</td><td>${d.dc25.propostas || '\u2014'}</td></tr>
                    <tr><td>Conversao</td><td>${d.dc25.conversao_proposta || '\u2014'}</td></tr>
                    <tr><td>Ticket Medio</td><td>${d.dc25.ticket_medio ? TBO_FORMATTER.currency(d.dc25.ticket_medio) : '\u2014'}</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- News Feed -->
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">Noticias do Mercado</h2>
                <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('mercado')">Ver todas &rarr;</button>
              </div>
              ${this._renderNewsFeed(d.noticias)}
            </section>
          </div>

          <!-- Sidebar -->
          <div class="cc-sidebar">
            ${this._renderSidebarMarket(d.ic)}
            ${this._renderSidebarCommercial(d)}
            ${this._renderSidebarMeetings(d.meetingsArr)}
          </div>
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCIAL FLOW TABLE (2026)
  // ═══════════════════════════════════════════════════════════════════════════
  _renderFinancialFlowTable(fc) {
    if (!fc || !fc.receita_mensal) {
      return '<div class="empty-state" style="padding:24px;"><div class="empty-state-text">Dados de fluxo de caixa 2026 nao disponiveis</div></div>';
    }
    const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const realizados = fc.meses_realizados || [];

    return `
      <div class="card" style="padding:0; overflow-x:auto;">
        <table class="data-table" style="font-size:0.75rem;">
          <thead>
            <tr>
              <th></th>
              ${months.map(m => `<th style="text-align:right; ${realizados.includes(m) ? 'color:var(--accent-gold);' : ''}">${m.charAt(0).toUpperCase() + m.slice(1)}</th>`).join('')}
              <th style="text-align:right; font-weight:700;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight:600;">Receita</td>
              ${months.map(m => `<td style="text-align:right; ${realizados.includes(m) ? 'font-weight:600;' : 'color:var(--text-muted);'}">${TBO_FORMATTER.number(fc.receita_mensal[m] || 0)}</td>`).join('')}
              <td style="text-align:right; font-weight:700;">${TBO_FORMATTER.number(fc.receita_total_projetada || 0)}</td>
            </tr>
            <tr>
              <td style="font-weight:600;">Despesa</td>
              ${months.map(m => `<td style="text-align:right; ${realizados.includes(m) ? 'font-weight:600;' : 'color:var(--text-muted);'}">${TBO_FORMATTER.number(fc.despesa_mensal[m] || 0)}</td>`).join('')}
              <td style="text-align:right; font-weight:700;">${TBO_FORMATTER.number(fc.despesa_total_projetada || 0)}</td>
            </tr>
            <tr style="border-top:2px solid var(--border-default);">
              <td style="font-weight:700;">Resultado</td>
              ${months.map(m => {
                const val = (fc.resultado_mensal || {})[m] || 0;
                return `<td style="text-align:right; font-weight:600; color:${val >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; ${realizados.includes(m) ? '' : 'opacity:0.6;'}">${val >= 0 ? '+' : ''}${TBO_FORMATTER.number(val)}</td>`;
              }).join('')}
              <td style="text-align:right; font-weight:700; color:${(fc.resultado_liquido_projetado || 0) >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${(fc.resultado_liquido_projetado || 0) >= 0 ? '+' : ''}${TBO_FORMATTER.number(fc.resultado_liquido_projetado || 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PIPELINE MINI-FUNNEL (item 16 — founders only)
  // ═══════════════════════════════════════════════════════════════════════════
  _renderPipelineFunnel(d) {
    const dc25 = d.dc25;
    const dc26 = d.dc26;
    const fc = dc26.fluxo_caixa || {};

    const propostas25 = dc25.propostas || 0;
    const contratos25 = dc25.contratos || 0;
    const negociacao25 = dc25.em_negociacao || 0;
    const metaAnual = fc.meta_vendas_anual || (TBO_CONFIG.business.financial.monthlyTarget * 12);
    const receitaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.receita_mensal || {})[m] || 0), 0);
    const progressMeta = metaAnual > 0 ? ((receitaYTD / metaAnual) * 100) : 0;

    return `
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Pipeline Comercial</h2>
          <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('comercial')">Detalhar &rarr;</button>
        </div>
        <div class="card" style="padding:20px;">
          <!-- Funnel visual -->
          <div class="cc-funnel">
            <div class="cc-funnel-step" style="--funnel-width:100%;">
              <div class="cc-funnel-bar" style="background:var(--accent-blue);"></div>
              <div class="cc-funnel-info">
                <span class="cc-funnel-value">${propostas25}</span>
                <span class="cc-funnel-label">Propostas 2025</span>
              </div>
            </div>
            <div class="cc-funnel-step" style="--funnel-width:${propostas25 > 0 ? Math.max(30, (negociacao25 / propostas25) * 100) : 50}%;">
              <div class="cc-funnel-bar" style="background:var(--color-warning);"></div>
              <div class="cc-funnel-info">
                <span class="cc-funnel-value">${negociacao25}</span>
                <span class="cc-funnel-label">Em negociacao</span>
              </div>
            </div>
            <div class="cc-funnel-step" style="--funnel-width:${propostas25 > 0 ? Math.max(20, (contratos25 / propostas25) * 100) : 30}%;">
              <div class="cc-funnel-bar" style="background:var(--color-success);"></div>
              <div class="cc-funnel-info">
                <span class="cc-funnel-value">${contratos25}</span>
                <span class="cc-funnel-label">Fechados</span>
              </div>
            </div>
          </div>

          <!-- Meta 2026 progress -->
          <div style="margin-top:16px; padding-top:16px; border-top:1px solid var(--border-subtle);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:0.78rem; font-weight:600;">Meta 2026</span>
              <span style="font-size:0.78rem; color:var(--text-muted);">${TBO_FORMATTER.currency(receitaYTD)} de ${TBO_FORMATTER.currency(metaAnual)}</span>
            </div>
            <div class="cc-progress-bar">
              <div class="cc-progress-fill" style="width:${Math.min(100, progressMeta).toFixed(1)}%; background:${progressMeta >= 50 ? 'var(--color-success)' : progressMeta >= 25 ? 'var(--color-warning)' : 'var(--color-danger)'};"></div>
            </div>
            <div style="text-align:right; font-size:0.72rem; color:var(--text-muted); margin-top:4px;">${progressMeta.toFixed(1)}%</div>
          </div>
        </div>
      </section>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CULTURE NUDGE WIDGET — Micro-lembrete diario da cultura TBO
  // ═══════════════════════════════════════════════════════════════════════════
  _renderCultureNudge() {
    if (typeof TBO_CULTURA_DATA === 'undefined' || !TBO_CULTURA_DATA.nudges) {
      return '<div style="padding:12px;color:var(--text-muted);font-size:0.78rem;">Dados de cultura nao disponiveis.</div>';
    }

    const valor = TBO_CULTURA_DATA.nudges.valorDoDia();
    const tip = TBO_CULTURA_DATA.nudges.tipCultural();
    const reflexao = TBO_CULTURA_DATA.nudges.reflexaoDoDia();

    return `
      <section class="section" style="padding:0;">
        <!-- Valor do dia -->
        <div style="background:linear-gradient(135deg, #E8510215, #E8510208);border:1px solid #E8510230;border-radius:10px;padding:14px 16px;margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="font-size:1.1rem;">${this._esc(valor.emoji || '')}</span>
            <span style="font-size:0.72rem;font-weight:700;color:#E85102;text-transform:uppercase;letter-spacing:0.5px;">Valor do Dia</span>
          </div>
          <div style="font-weight:700;font-size:0.88rem;margin-bottom:4px;">${this._esc(valor.nome)}</div>
          <div style="font-size:0.75rem;color:var(--text-secondary);line-height:1.4;">${this._esc(valor.desc)}</div>
        </div>

        <!-- Tip cultural -->
        <div style="background:var(--bg-secondary);border-radius:8px;padding:12px 14px;margin-bottom:10px;">
          <div style="font-size:0.65rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;">
            <i data-lucide="lightbulb" style="width:11px;height:11px;display:inline;vertical-align:-1px;"></i> Dica
          </div>
          <div style="font-size:0.75rem;color:var(--text-primary);line-height:1.45;">${this._esc(tip)}</div>
        </div>

        <!-- Reflexao -->
        <div style="background:var(--bg-secondary);border-radius:8px;padding:12px 14px;">
          <div style="font-size:0.65rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;">
            <i data-lucide="brain" style="width:11px;height:11px;display:inline;vertical-align:-1px;"></i> Reflexao
          </div>
          <div style="font-size:0.75rem;color:var(--text-primary);line-height:1.45;font-style:italic;">${this._esc(reflexao)}</div>
        </div>

        <div style="margin-top:10px;text-align:center;">
          <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('cultura')" style="font-size:0.7rem;color:var(--accent-gold);">
            <i data-lucide="book-open" style="width:12px;height:12px;"></i> Ver Manual de Cultura
          </button>
        </div>
      </section>`;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PEOPLE/TEAM WIDGET (item 15 — founders only)
  // ═══════════════════════════════════════════════════════════════════════════
  _renderPeopleWidget() {
    // Access RH data from localStorage seed
    const oneOnOnes = JSON.parse(localStorage.getItem('people_oneOnOnes') || '[]');
    const feedbacks = JSON.parse(localStorage.getItem('people_feedbacks') || '[]');
    const ciclos = JSON.parse(localStorage.getItem('people_ciclos') || '[]');

    const now = new Date();
    const upcoming = oneOnOnes.filter(o => o.status === 'agendado' && new Date(o.data) >= now).sort((a, b) => new Date(a.data) - new Date(b.data));
    const recentFb = feedbacks.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 3);
    const cicloAtual = ciclos.find(c => c.status === 'em_andamento');
    const totalAvaliados = cicloAtual ? cicloAtual.avaliacoes_completas || 0 : 0;
    const totalEsperados = cicloAtual ? cicloAtual.avaliacoes_esperadas || 0 : 0;

    if (upcoming.length === 0 && recentFb.length === 0 && !cicloAtual) return '';

    return `
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Equipe & Desenvolvimento</h2>
          <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('rh')">Pessoas &rarr;</button>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:12px;">
          ${cicloAtual ? `
          <div class="card" style="padding:14px;">
            <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px;">Ciclo de Avaliacao</div>
            <div style="font-weight:600; font-size:0.85rem; margin-bottom:4px;">${_escapeHtml(cicloAtual.nome || cicloAtual.titulo) || 'Ciclo atual'}</div>
            <div class="cc-progress-bar" style="margin:8px 0 4px;">
              <div class="cc-progress-fill" style="width:${totalEsperados > 0 ? (totalAvaliados / totalEsperados * 100).toFixed(0) : 0}%; background:var(--accent-gold);"></div>
            </div>
            <div style="font-size:0.72rem; color:var(--text-muted);">${totalAvaliados}/${totalEsperados} avaliacoes completas</div>
          </div>
          ` : ''}

          ${upcoming.length > 0 ? `
          <div class="card" style="padding:14px;">
            <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px;">Proximas 1:1s</div>
            ${upcoming.slice(0, 3).map(o => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0;">
                <span style="font-size:0.82rem; font-weight:500;">${_escapeHtml(o.colaborador)}</span>
                <span style="font-size:0.72rem; color:var(--text-muted);">${TBO_FORMATTER.date(o.data)}</span>
              </div>
            `).join('')}
            ${upcoming.length > 3 ? `<div style="font-size:0.72rem; color:var(--text-muted); margin-top:4px;">+${upcoming.length - 3} mais agendadas</div>` : ''}
          </div>
          ` : ''}

          ${recentFb.length > 0 ? `
          <div class="card" style="padding:14px;">
            <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px;">Feedbacks Recentes</div>
            ${recentFb.map(f => `
              <div style="padding:4px 0;">
                <div style="font-size:0.82rem; font-weight:500;">${_escapeHtml(f.de || f.remetente)} &rarr; ${_escapeHtml(f.para || f.destinatario)}</div>
                <div style="font-size:0.72rem; color:var(--text-muted);">${TBO_FORMATTER.relativeTime(f.data)}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}
        </div>
      </section>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RH DATA HELPER FOR ARTIST DASHBOARD (item 12)
  // ═══════════════════════════════════════════════════════════════════════════
  _getRHDataForUser(user) {
    const result = { mediaGeral: null, cicloAtual: '', upcoming11: null, recentFeedbacks: [] };
    if (!user) return result;

    try {
      const avaliacoes = JSON.parse(localStorage.getItem('people_avaliacoes') || '[]');
      const ciclos = JSON.parse(localStorage.getItem('people_ciclos') || '[]');
      const oneOnOnes = JSON.parse(localStorage.getItem('people_oneOnOnes') || '[]');
      const feedbacks = JSON.parse(localStorage.getItem('people_feedbacks') || '[]');

      const cicloAtual = ciclos.find(c => c.status === 'em_andamento');
      if (cicloAtual) {
        result.cicloAtual = cicloAtual.nome || cicloAtual.titulo || '';
        const minhasAvals = avaliacoes.filter(a => a.ciclo_id === cicloAtual.id && a.avaliado === user.id);
        if (minhasAvals.length > 0) {
          const notas = minhasAvals.flatMap(a => Object.values(a.notas || {})).filter(n => !isNaN(n));
          if (notas.length > 0) result.mediaGeral = notas.reduce((s, n) => s + n, 0) / notas.length;
        }
      }

      const now = new Date();
      const firstName = this._esc((user.name || '').split(' ')[0]);
      const upcoming = oneOnOnes.filter(o => {
        return o.status === 'agendado' && new Date(o.data) >= now &&
               (o.colaborador || '').toLowerCase().includes(firstName.toLowerCase());
      }).sort((a, b) => new Date(a.data) - new Date(b.data));
      if (upcoming.length > 0) result.upcoming11 = upcoming[0];

      result.recentFeedbacks = feedbacks.filter(f => {
        const para = (f.para || f.destinatario || '').toLowerCase();
        return para.includes(firstName.toLowerCase());
      }).sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 3);

    } catch (e) { /* ignore parse errors */ }

    return result;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SIDEBAR: UPCOMING 1:1 for artist
  // ═══════════════════════════════════════════════════════════════════════════
  _renderSidebarUpcoming11(rhData) {
    if (!rhData.upcoming11) return '';
    return `
      <div class="card cc-sidebar-card">
        <div class="card-header" style="padding-bottom:8px;">
          <h3 class="card-title" style="font-size:0.82rem;">Proxima 1:1</h3>
        </div>
        <div style="padding:4px 0;">
          <div style="font-size:0.85rem; font-weight:600;">${_escapeHtml(rhData.upcoming11.lider) || 'Lider'}</div>
          <div style="font-size:0.78rem; color:var(--text-muted);">${TBO_FORMATTER.date(rhData.upcoming11.data)}</div>
          ${rhData.upcoming11.pauta ? `<div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">${TBO_FORMATTER.truncate(_escapeHtml(rhData.upcoming11.pauta), 80)}</div>` : ''}
        </div>
        <button class="btn btn-sm btn-ghost" style="width:100%; margin-top:8px;" onclick="TBO_ROUTER.navigate('rh')">Ver RH &rarr;</button>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SIDEBAR: RECENT FEEDBACKS for artist
  // ═══════════════════════════════════════════════════════════════════════════
  _renderSidebarRecentFeedbacks(rhData) {
    if (!rhData.recentFeedbacks || rhData.recentFeedbacks.length === 0) return '';
    return `
      <div class="card cc-sidebar-card">
        <div class="card-header" style="padding-bottom:8px;">
          <h3 class="card-title" style="font-size:0.82rem;">Feedbacks Recentes</h3>
        </div>
        ${rhData.recentFeedbacks.map(f => `
          <div class="cc-sidebar-item">
            <div>
              <div class="cc-sidebar-item-title">${_escapeHtml(f.de || f.remetente)}</div>
              <div style="font-size:0.72rem; color:var(--text-muted);">${TBO_FORMATTER.relativeTime(f.data)}</div>
            </div>
            <span class="tag" style="background:${f.tipo === 'positivo' ? 'var(--color-success-dim)' : 'var(--color-warning-dim)'}; color:${f.tipo === 'positivo' ? 'var(--color-success)' : 'var(--color-warning)'};">${f.tipo === 'positivo' ? '+' : '\u0394'}</span>
          </div>
        `).join('')}
        <button class="btn btn-sm btn-ghost" style="width:100%; margin-top:8px;" onclick="TBO_ROUTER.navigate('rh')">Pessoas &rarr;</button>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHARED RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  // Project card with phase/status indicator (item 9)
  _renderProjectCard(p, meetingsArr) {
    // Determine project phase based on BUs
    const bus = p.bus || [];
    let phase = 'concepcao';
    let phaseLabel = 'Concepcao';
    let phaseColor = 'var(--text-muted)';

    if (bus.includes('Marketing') || bus.includes('Audiovisual')) {
      phase = 'marketing';
      phaseLabel = 'Marketing';
      phaseColor = 'var(--color-success)';
    } else if (bus.includes('Branding')) {
      phase = 'branding';
      phaseLabel = 'Branding';
      phaseColor = 'var(--color-purple)';
    }
    if (bus.includes('Digital 3D')) {
      phase = 'producao';
      phaseLabel = 'Producao 3D';
      phaseColor = 'var(--accent-blue)';
    }
    if (bus.length >= 4) {
      phase = 'completo';
      phaseLabel = 'Full Service';
      phaseColor = 'var(--accent-gold)';
    }

    // Check last meeting for this project
    let lastMeetingAgo = '';
    if (meetingsArr && meetingsArr.length > 0) {
      const projName = p.nome.toLowerCase();
      const constName = (p.construtora || '').toLowerCase();
      const relatedMeetings = meetingsArr.filter(m => {
        const title = (m.title || m.titulo || '').toLowerCase();
        return title.includes(constName) || title.includes(projName.split('_')[0]);
      });
      if (relatedMeetings.length > 0) {
        const latest = relatedMeetings.sort((a, b) => new Date(b.date || b.data) - new Date(a.date || a.data))[0];
        lastMeetingAgo = TBO_FORMATTER.relativeTime(latest.date || latest.data);
      }
    }

    return `
      <div class="card" style="padding:14px; position:relative;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${phaseColor};border-radius:var(--radius-md) var(--radius-md) 0 0;"></div>
        <div style="font-weight:600; font-size:0.85rem; margin-bottom:4px;">${_escapeHtml(p.nome)}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:0.75rem; color:var(--text-tertiary);">${_escapeHtml(p.construtora)}</span>
          <span style="font-size:0.68rem; padding:2px 6px; border-radius:var(--radius-full); background:${phaseColor}22; color:${phaseColor};">${phaseLabel}</span>
        </div>
        <div style="display:flex; gap:4px; flex-wrap:wrap;">
          ${bus.map(bu => `<span class="tag">${bu}</span>`).join('')}
        </div>
        ${lastMeetingAgo ? `<div style="font-size:0.68rem; color:var(--text-muted); margin-top:6px;">Ult. reuniao: ${lastMeetingAgo}</div>` : ''}
      </div>
    `;
  },

  // News feed with relative dates + hide >30 days (item 8)
  _renderNewsFeed(noticias) {
    if (noticias.length === 0) {
      return `
        <div class="empty-state" style="padding:24px;">
          <div class="empty-state-text">Nenhuma noticia carregada</div>
          <p style="color:var(--text-muted); font-size:0.78rem; margin-top:6px;">
            Va em Inteligencia de Mercado e clique "Buscar Noticias" para carregar.
          </p>
        </div>
      `;
    }
    const catColors = { lancamentos: 'var(--accent-blue)', indicadores: 'var(--color-success)', incorporadoras: 'var(--brand-orange)', tendencias: 'var(--color-purple)', mercado: 'var(--text-muted)' };
    const catLabels = { lancamentos: 'Lancamento', indicadores: 'Indicador', incorporadoras: 'Incorporadora', tendencias: 'Tendencia', mercado: 'Mercado' };

    // Filter out >30 day old news
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const filtered = noticias.filter(n => {
      const d = n.date || n.data;
      if (!d) return true; // keep if no date
      return new Date(d) >= thirtyDaysAgo;
    });
    const hiddenCount = noticias.length - filtered.length;

    return `
      <div class="cc-news-feed">
        ${filtered.map(n => {
          const cat = (n.category || n.categoria || 'mercado').toLowerCase();
          const color = catColors[cat] || 'var(--text-muted)';
          const dateStr = n.date || n.data;
          const relDate = dateStr ? TBO_FORMATTER.relativeTime(dateStr) : '';
          return `
            <div class="cc-news-item">
              <span class="cc-news-dot" style="background:${color};"></span>
              <div class="cc-news-content">
                <span class="cc-news-tag" style="background:${color}22;color:${color};">${catLabels[cat] || cat}</span>
                <div class="cc-news-title">${_escapeHtml(n.title || n.titulo)}</div>
                <div class="cc-news-meta">${_escapeHtml(n.source || n.fonte)}${relDate ? ' \u2022 ' + relDate : ''}</div>
              </div>
            </div>`;
        }).join('')}
        ${hiddenCount > 0 ? `<div style="padding:8px 0; font-size:0.72rem; color:var(--text-muted); text-align:center;">${hiddenCount} noticia${hiddenCount > 1 ? 's' : ''} mais antiga${hiddenCount > 1 ? 's' : ''} ocultada${hiddenCount > 1 ? 's' : ''} (>30 dias)</div>` : ''}
      </div>
    `;
  },

  // Action item row with completed/pending toggle (item 11)
  _renderActionItemRow(ai) {
    const completed = JSON.parse(localStorage.getItem('tbo_completed_actions') || '[]');
    const key = ai.task + '|' + ai.meeting;
    const isDone = completed.includes(key);
    const escapedMeeting = (ai.meeting || '').replace(/'/g, "\\'");
    return `
      <tr class="${isDone ? 'cc-action-done' : ''}">
        <td style="text-align:center; cursor:pointer;" onclick="TBO_COMMAND_CENTER._toggleAction(this, '${key.replace(/'/g, "\\'")}')">
          <span style="display:inline-flex;width:18px;height:18px;border-radius:50%;border:2px solid ${isDone ? 'var(--color-success)' : 'var(--border-default)'};align-items:center;justify-content:center;background:${isDone ? 'var(--color-success)' : 'transparent'};transition:all 0.2s;">
            ${isDone ? '<span style="color:#fff;font-size:0.65rem;">&#10003;</span>' : ''}
          </span>
        </td>
        <td style="font-weight:500; ${isDone ? 'text-decoration:line-through; opacity:0.5;' : ''}">
          <span class="cc-action-link" style="cursor:pointer; text-decoration-style:dotted; text-decoration-line:underline; text-underline-offset:3px; text-decoration-color:var(--border-default);" onclick="TBO_COMMAND_CENTER._navigateToActionItem('${escapedMeeting}')" title="Ver reuniao de origem">${_escapeHtml(ai.task)}</span>
        </td>
        <td style="font-size:0.78rem; color:var(--text-secondary); cursor:pointer;" onclick="TBO_COMMAND_CENTER._navigateToActionItem('${escapedMeeting}')">${_escapeHtml(ai.meeting)}</td>
        <td style="font-size:0.78rem; color:var(--text-muted);">${TBO_FORMATTER.date(ai.date)}</td>
      </tr>
    `;
  },

  // Toggle action item completion
  _toggleAction(el, key) {
    let completed = JSON.parse(localStorage.getItem('tbo_completed_actions') || '[]');
    if (completed.includes(key)) {
      completed = completed.filter(k => k !== key);
    } else {
      completed.push(key);
    }
    localStorage.setItem('tbo_completed_actions', JSON.stringify(completed));
    // Re-render the row
    const row = el.closest('tr');
    const isDone = completed.includes(key);
    row.className = isDone ? 'cc-action-done' : '';
    const circle = el.querySelector('span');
    if (circle) {
      circle.style.borderColor = isDone ? 'var(--color-success)' : 'var(--border-default)';
      circle.style.background = isDone ? 'var(--color-success)' : 'transparent';
      circle.innerHTML = isDone ? '<span style="color:#fff;font-size:0.65rem;">&#10003;</span>' : '';
    }
    const taskTd = row.querySelectorAll('td')[1];
    if (taskTd) {
      taskTd.style.textDecoration = isDone ? 'line-through' : 'none';
      taskTd.style.opacity = isDone ? '0.5' : '1';
    }
  },

  // Navigate to the source meeting for an action item
  _navigateToActionItem(meetingTitle) {
    // Navigate to reunioes module; use hash to pass search hint
    if (typeof TBO_ROUTER !== 'undefined') {
      // Store the meeting title so reunioes module can highlight/filter it
      sessionStorage.setItem('tbo_action_meeting', meetingTitle);
      TBO_ROUTER.navigate('reunioes');
      // After navigation, try to scroll to / highlight the matching meeting
      setTimeout(() => {
        const cards = document.querySelectorAll('.meeting-card, .card');
        for (const card of cards) {
          const titleEl = card.querySelector('.meeting-title, .card-title, h3, h4');
          if (titleEl && titleEl.textContent.trim().toLowerCase().includes(meetingTitle.toLowerCase().substring(0, 20))) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.outline = '2px solid var(--accent-primary)';
            card.style.outlineOffset = '2px';
            card.style.transition = 'outline-color 2s ease';
            setTimeout(() => { card.style.outlineColor = 'transparent'; }, 3000);
            break;
          }
        }
        sessionStorage.removeItem('tbo_action_meeting');
      }, 400);
    }
  },

  // ── Sidebar card helpers ────────────────────────────────────────────────
  _renderSidebarMeetings(meetingsArr) {
    return `
      <div class="card cc-sidebar-card">
        <div class="card-header" style="padding-bottom:8px;">
          <h3 class="card-title" style="font-size:0.82rem;">Reunioes Recentes</h3>
        </div>
        ${meetingsArr.length > 0 ? meetingsArr.slice(0, 5).map(m => `
          <div class="cc-sidebar-item" onclick="TBO_ROUTER.navigate('reunioes')">
            <div>
              <div class="cc-sidebar-item-title">${_escapeHtml(m.title || m.titulo)}</div>
              <div class="cc-sidebar-item-meta">${TBO_FORMATTER.relativeTime(m.date || m.data)}</div>
            </div>
          </div>
        `).join('') : '<div style="padding:8px 0; color:var(--text-muted); font-size:0.78rem;">Nenhuma reuniao</div>'}
        <button class="btn btn-sm btn-ghost" style="width:100%; margin-top:8px;" onclick="TBO_ROUTER.navigate('reunioes')">Ver todas &rarr;</button>
      </div>
    `;
  },

  _renderSidebarActions(actionsByPerson, totalActions) {
    if (totalActions === 0) return '';
    const escapedEntries = Object.entries(actionsByPerson).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return `
      <div class="card cc-sidebar-card">
        <div class="card-header" style="padding-bottom:8px;">
          <h3 class="card-title" style="font-size:0.82rem;">Action Items por Pessoa</h3>
        </div>
        ${escapedEntries.map(([person, count]) => {
          const escaped = person.replace(/'/g, "\\'");
          return `
          <div class="cc-sidebar-item" style="cursor:pointer;" onclick="TBO_COMMAND_CENTER._filterActionsByPerson('${escaped}')" title="Ver action items de ${_escapeHtml(person)}">
            <div class="cc-sidebar-item-title">${_escapeHtml(person)}</div>
            <span class="tag">${count}</span>
          </div>`;
        }).join('')}
        <div id="ccSidebarActionDetail" style="display:none; margin-top:8px; border-top:1px solid var(--border-subtle); padding-top:8px;"></div>
      </div>
    `;
  },

  // Filter and display action items for a specific person in sidebar
  _filterActionsByPerson(person) {
    const detail = document.getElementById('ccSidebarActionDetail');
    if (!detail) return;

    // Toggle: if already showing this person, hide
    if (detail.style.display !== 'none' && detail.dataset.person === person) {
      detail.style.display = 'none';
      detail.dataset.person = '';
      // Remove active highlight
      document.querySelectorAll('.cc-sidebar-item[style*="cursor"]').forEach(el => {
        el.style.background = '';
      });
      return;
    }

    // Get action items data
    const d = this._lastData;
    if (!d || !d.actionItems) return;

    const items = d.actionItems.filter(ai => ai.person === person);
    if (items.length === 0) {
      detail.style.display = 'none';
      return;
    }

    // Highlight active person
    document.querySelectorAll('.cc-sidebar-item[style*="cursor"]').forEach(el => {
      el.style.background = '';
    });
    // Find and highlight the clicked item
    document.querySelectorAll('.cc-sidebar-item[style*="cursor"]').forEach(el => {
      const title = el.querySelector('.cc-sidebar-item-title');
      if (title && title.textContent.trim() === person) {
        el.style.background = 'var(--bg-subtle, #f5f5f5)';
      }
    });

    const completed = JSON.parse(localStorage.getItem('tbo_completed_actions') || '[]');

    detail.dataset.person = person;
    detail.style.display = 'block';
    detail.innerHTML = `
      <div style="font-size:0.72rem; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">${_escapeHtml(person)} (${items.length})</div>
      ${items.slice(0, 8).map(ai => {
        const key = ai.task + '|' + ai.meeting;
        const isDone = completed.includes(key);
        return `
        <div style="display:flex; align-items:flex-start; gap:6px; padding:4px 0; font-size:0.75rem; ${isDone ? 'opacity:0.5; text-decoration:line-through;' : ''}">
          <span style="flex-shrink:0; margin-top:2px; width:6px; height:6px; border-radius:50%; background:${isDone ? 'var(--color-success)' : 'var(--accent, #E85102)'}; display:inline-block;"></span>
          <div>
            <div style="line-height:1.3;">${_escapeHtml(ai.task)}</div>
            <div style="font-size:0.68rem; color:var(--text-muted);">${_escapeHtml(ai.meeting)}</div>
          </div>
        </div>`;
      }).join('')}
      ${items.length > 8 ? `<div style="font-size:0.68rem; color:var(--text-muted); text-align:center; margin-top:4px;">+${items.length - 8} mais</div>` : ''}
    `;
  },

  _renderSidebarMarket(ic) {
    return `
      <div class="card cc-sidebar-card">
        <div class="card-header" style="padding-bottom:8px;">
          <h3 class="card-title" style="font-size:0.82rem;">Mercado CWB ${ic.periodo || ''}</h3>
        </div>
        <div class="cc-sidebar-item">
          <div class="cc-sidebar-item-title">Lancamentos</div>
          <span class="tag" style="color:var(--color-danger);">${ic.empreendimentos_lancados || '\u2014'} (${ic.variacao_empreendimentos || ''})</span>
        </div>
        <div class="cc-sidebar-item">
          <div class="cc-sidebar-item-title">Unidades</div>
          <span class="tag" style="color:var(--color-danger);">${TBO_FORMATTER.number(ic.unidades_lancadas)} (${ic.variacao_unidades || ''})</span>
        </div>
        <button class="btn btn-sm btn-ghost" style="width:100%; margin-top:8px;" onclick="TBO_ROUTER.navigate('mercado')">Detalhar &rarr;</button>
      </div>
    `;
  },

  // Sidebar Commercial — 2026 primary + 2025 comparison (items 2, 5, 6)
  _renderSidebarCommercial(d) {
    const dc25 = d.dc25;
    const dc26 = d.dc26;
    const fc = dc26.fluxo_caixa || {};
    const receitaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.receita_mensal || {})[m] || 0), 0);

    return `
      <div class="card cc-sidebar-card">
        <div class="card-header" style="padding-bottom:8px;">
          <h3 class="card-title" style="font-size:0.82rem;">Comercial 2026</h3>
        </div>
        <div class="cc-sidebar-item">
          <div class="cc-sidebar-item-title">Receita YTD</div>
          <span class="tag" style="color:var(--accent-gold); font-weight:600;">${receitaYTD > 0 ? TBO_FORMATTER.currency(receitaYTD) : '\u2014'}</span>
        </div>
        <div class="cc-sidebar-item">
          <div class="cc-sidebar-item-title">Meta Anual</div>
          <span class="tag">${fc.meta_vendas_anual ? TBO_FORMATTER.currency(fc.meta_vendas_anual) : '\u2014'}</span>
        </div>
        <div class="cc-sidebar-item">
          <div class="cc-sidebar-item-title">Margem Projetada</div>
          <span class="tag">${fc.margem_liquida_orcada || '\u2014'}</span>
        </div>
        <div style="margin-top:8px; padding-top:8px; border-top:1px solid var(--border-subtle);">
          <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:4px;">Comparativo 2025:</div>
          <div class="cc-sidebar-item">
            <div class="cc-sidebar-item-title" style="font-size:0.75rem;">Faturado</div>
            <span style="font-size:0.72rem; color:var(--text-muted);">${dc25.total_vendido ? TBO_FORMATTER.currency(dc25.total_vendido) : '\u2014'}</span>
          </div>
          <div class="cc-sidebar-item">
            <div class="cc-sidebar-item-title" style="font-size:0.75rem;">Conversao</div>
            <span style="font-size:0.72rem; color:var(--text-muted);">${dc25.conversao_proposta || '\u2014'}</span>
          </div>
        </div>
        <button class="btn btn-sm btn-ghost" style="width:100%; margin-top:8px;" onclick="TBO_ROUTER.navigate('financeiro')">Detalhar &rarr;</button>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS PULSE — Quick BI preview for founder dashboard
  // ═══════════════════════════════════════════════════════════════════════════
  _renderBusinessPulse(d) {
    const ctx = TBO_STORAGE.get('context') || {};
    const dc24 = ctx.dados_comerciais?.['2024'] || {};
    const dc25 = ctx.dados_comerciais?.['2025'] || {};
    const fy = TBO_CONFIG?.app?.fiscalYear || '2026';
    const dc26 = ctx.dados_comerciais?.[fy] || {};
    const fc = dc26.fluxo_caixa || {};

    // Use ERP projects (aligned with KPI card above) — fallback to context
    const erpProjects = TBO_STORAGE.getAllErpEntities ? TBO_STORAGE.getAllErpEntities('project') : [];
    const erpAtivos = erpProjects.filter(p => !['finalizado', 'cancelado'].includes(p.status));
    const projAtivos = erpAtivos.length > 0 ? erpAtivos : (ctx.projetos_ativos || []);

    const finalizados = ctx.projetos_finalizados || {};
    const clientes = ctx.clientes_construtoras || [];
    const deals = TBO_STORAGE.getCrmDeals ? TBO_STORAGE.getCrmDeals() : [];

    // Churn: clients from 2024/2025 not active now
    const activeConstrutoras = new Set(projAtivos.map(p => (p.construtora || '')).filter(Boolean));
    const prevClients = new Set();
    ['2024','2025'].forEach(y => {
      (finalizados[y] || []).forEach(p => {
        if (!p) return;
        const pLow = (typeof p === 'string' ? p : (p.nome || '')).toLowerCase();
        clientes.forEach(c => { if (c && pLow.includes(c.toLowerCase())) prevClients.add(c); });
      });
    });
    projAtivos.forEach(p => { if (p.construtora) prevClients.add(p.construtora); });
    const churned = [...prevClients].filter(c => !activeConstrutoras.has(c));
    const churnRate = prevClients.size > 0 ? Math.round((churned.length / prevClients.size) * 100) : 0;

    // LTV (ticket medio x avg repeat rate)
    const ticket = dc26.ticket_medio || dc25.ticket_medio || dc24.ticket_medio || 0;
    const clientYears = {};
    Object.entries(finalizados).forEach(([y, list]) => {
      if (!Array.isArray(list)) return;
      list.forEach(p => {
        if (!p) return;
        const pLow = (typeof p === 'string' ? p : (p.nome || '')).toLowerCase();
        clientes.forEach(c => {
          if (c && pLow.includes(c.toLowerCase())) {
            if (!clientYears[c]) clientYears[c] = new Set();
            clientYears[c].add(y);
          }
        });
      });
    });
    const clientYearsArr = Object.values(clientYears);
    const avgRepeat = clientYearsArr.length > 0 ? clientYearsArr.reduce((s,v) => s + v.size, 0) / clientYearsArr.length : 1;
    const ltv = Math.round(ticket * avgRepeat);

    // Win rate — prefer current fiscal year, fallback to 2025
    const winRate = parseFloat(dc26.conversao_proposta) || parseFloat(dc25.conversao_proposta) || 0;

    // Top5 concentration (use ERP-aligned data)
    const projPerClient = {};
    projAtivos.forEach(p => {
      const c = p.construtora || 'Sem cliente';
      projPerClient[c] = (projPerClient[c] || 0) + 1;
    });
    const top5 = Object.entries(projPerClient).sort((a,b) => b[1] - a[1]).slice(0, 5);
    const top5Conc = projAtivos.length > 0 ? Math.round((top5.reduce((s,[,c]) => s+c, 0) / projAtivos.length) * 100) : 0;

    // Pipeline coverage
    const safeDeals = Array.isArray(deals) ? deals : [];
    const activeDeals = safeDeals.filter(d2 => !['fechado_ganho','fechado_perdido'].includes(d2.stage));
    const pipelineVal = activeDeals.reduce((s,d2) => s + (d2.value||0), 0);
    const meta = fc.meta_vendas_mensal || TBO_CONFIG?.business?.financial?.monthlyTarget || 1;
    const coverage = meta > 0 ? (pipelineVal / meta).toFixed(1) : '0';

    // Margin YTD
    const mRealized = fc.meses_realizados || [];
    const recYTD = mRealized.reduce((s, mes) => s + ((fc.receita_mensal||{})[mes]||0), 0);
    const despYTD = mRealized.reduce((s, mes) => s + ((fc.despesa_mensal||{})[mes]||0), 0);
    const margemYTD = recYTD > 0 ? ((recYTD - despYTD) / recYTD * 100).toFixed(1) : '0';

    const fmt = (v) => {
      const abs = Math.abs(v);
      if (abs >= 1000000) return (v<0?'-':'') + (abs/1000000).toFixed(1) + 'M';
      if (abs >= 1000) return (v<0?'-':'') + (abs/1000).toFixed(0) + 'k';
      return v.toLocaleString('pt-BR');
    };

    const light = (val, good, warn) => val <= good ? 'green' : val <= warn ? 'yellow' : 'red';

    return `
      <section class="section" style="margin-bottom:16px;">
        <div class="section-header">
          <h2 class="section-title">Business Pulse</h2>
          <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('inteligencia')">Inteligencia BI &rarr;</button>
        </div>
        <div class="bi-pulse-grid">
          <div class="bi-pulse-card">
            <span class="kpi-info-icon" data-tooltip="Taxa de clientes que pararam de contratar. Clientes ativos em 2024/2025 que nao tem projetos em andamento."><i data-lucide="info" style="width:12px;height:12px;"></i></span>
            <div class="bi-score-light bi-score-light--${light(churnRate, 15, 25)}"></div>
            <div class="bi-pulse-val">${churnRate}%</div>
            <div class="bi-pulse-label">Churn</div>
          </div>
          <div class="bi-pulse-card">
            <span class="kpi-info-icon" data-tooltip="Lifetime Value: valor medio que um cliente gera ao longo do relacionamento. Calculado: ticket medio x taxa media de recompra."><i data-lucide="info" style="width:12px;height:12px;"></i></span>
            <div class="bi-score-light bi-score-light--green"></div>
            <div class="bi-pulse-val">R$ ${fmt(ltv)}</div>
            <div class="bi-pulse-label">LTV</div>
          </div>
          <div class="bi-pulse-card">
            <span class="kpi-info-icon" data-tooltip="Percentual dos projetos concentrado nos 5 maiores clientes. Acima de 70% indica risco de dependencia."><i data-lucide="info" style="width:12px;height:12px;"></i></span>
            <div class="bi-score-light bi-score-light--${light(top5Conc, 50, 70)}"></div>
            <div class="bi-pulse-val">${top5Conc}%</div>
            <div class="bi-pulse-label">Concentracao</div>
          </div>
          <div class="bi-pulse-card">
            <span class="kpi-info-icon" data-tooltip="Taxa de conversao de propostas em contratos fechados. Percentual de propostas que viraram projetos."><i data-lucide="info" style="width:12px;height:12px;"></i></span>
            <div class="bi-score-light bi-score-light--${winRate > 40 ? 'green' : winRate > 30 ? 'yellow' : 'red'}"></div>
            <div class="bi-pulse-val">${winRate}%</div>
            <div class="bi-pulse-label">Win Rate</div>
          </div>
          <div class="bi-pulse-card">
            <span class="kpi-info-icon" data-tooltip="Cobertura do pipeline: valor total de deals abertos dividido pela meta mensal. Acima de 3x e saudavel."><i data-lucide="info" style="width:12px;height:12px;"></i></span>
            <div class="bi-score-light bi-score-light--${parseFloat(coverage) > 3 ? 'green' : parseFloat(coverage) > 1.5 ? 'yellow' : 'red'}"></div>
            <div class="bi-pulse-val">${coverage}x</div>
            <div class="bi-pulse-label">Pipeline</div>
          </div>
          <div class="bi-pulse-card">
            <span class="kpi-info-icon" data-tooltip="Margem acumulada no ano: (receita - despesa) / receita. Indica a saude financeira geral do estudio."><i data-lucide="info" style="width:12px;height:12px;"></i></span>
            <div class="bi-score-light bi-score-light--${parseFloat(margemYTD) > 10 ? 'green' : parseFloat(margemYTD) > 0 ? 'yellow' : 'red'}"></div>
            <div class="bi-pulse-val">${margemYTD}%</div>
            <div class="bi-pulse-label">Margem YTD</div>
          </div>
        </div>
      </section>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SMARTER STATIC ALERTS (item 7)
  // ═══════════════════════════════════════════════════════════════════════════

  _renderStaticAlerts(d) {
    const alerts = [];
    const { ativos, ic, dc25, dc26, totalActions, meetingsArr, actionItems } = d;

    // 1. Market retraction
    if (ic.variacao_empreendimentos && ic.variacao_empreendimentos.includes('-')) {
      alerts.push({
        type: 'warning', icon: '\u26A0\uFE0F',
        title: 'Mercado em Retracao',
        message: `Lancamentos em Curitiba cairam ${ic.variacao_empreendimentos} no ${ic.periodo || 'periodo'}. Mercado mais conservador.`
      });
    }

    // 2. Projects without recent meetings (>14 days)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const projectsNoMeeting = ativos.filter(p => {
      const projName = p.nome.toLowerCase();
      const constName = (p.construtora || '').toLowerCase();
      const relatedMeetings = meetingsArr.filter(m => {
        const title = (m.title || m.titulo || '').toLowerCase();
        return title.includes(constName) || title.includes(projName.split('_')[0]);
      });
      if (relatedMeetings.length === 0) return true;
      const latest = relatedMeetings.sort((a, b) => new Date(b.date || b.data) - new Date(a.date || a.data))[0];
      return new Date(latest.date || latest.data) < twoWeeksAgo;
    });
    if (projectsNoMeeting.length > 0) {
      alerts.push({
        type: 'warning', icon: '\u{1F4C5}',
        title: `${projectsNoMeeting.length} Projeto${projectsNoMeeting.length > 1 ? 's' : ''} sem Reuniao Recente`,
        message: `${projectsNoMeeting.slice(0, 3).map(p => _escapeHtml(p.nome)).join(', ')}${projectsNoMeeting.length > 3 ? '...' : ''} sem reuniao nas ultimas 2 semanas.`
      });
    }

    // 3. Overdue action items (from meetings older than 7 days)
    const weekAgo = new Date(Date.now() - TBO_CONFIG.business.thresholds.projectMonitoring.noMeetingDays * 86400000);
    const completed = JSON.parse(localStorage.getItem('tbo_completed_actions') || '[]');
    const overdueActions = actionItems.filter(ai => {
      const key = ai.task + '|' + ai.meeting;
      return !completed.includes(key) && new Date(ai.date) < weekAgo;
    });
    if (overdueActions.length > 0) {
      alerts.push({
        type: 'critical', icon: '\u{1F6A8}',
        title: `${overdueActions.length} Action Items com +7 dias`,
        message: `Itens pendentes de reunioes anteriores. Verifique: ${overdueActions.slice(0, 2).map(a => _escapeHtml(a.task)).join(', ')}${overdueActions.length > 2 ? '...' : ''}`
      });
    }

    // 4. Active projects summary
    if (ativos.length > 0) {
      alerts.push({
        type: 'info', icon: '\u{1F4CB}',
        title: `${ativos.length} Projetos em Andamento`,
        message: `${new Set(ativos.map(p => p.construtora)).size} construtoras. BUs: ${['Digital 3D', 'Branding', 'Marketing', 'Audiovisual', 'Interiores'].filter(bu => ativos.some(p => (p.bus || []).includes(bu))).join(', ')}`
      });
    }

    // 5. Financial health check
    const fc = dc26.fluxo_caixa || {};
    if (fc.resultado_liquido_projetado && fc.resultado_liquido_projetado < 0) {
      alerts.push({
        type: 'critical', icon: '\u{1F4C9}',
        title: 'Resultado 2026 Projetado Negativo',
        message: `Projecao de resultado liquido: ${TBO_FORMATTER.currency(fc.resultado_liquido_projetado)}. Necessario ajustar receitas ou custos.`
      });
    }

    // 6. Monthly proposal comparison
    if (dc25.media_mensal_propostas && dc25.media_mensal_propostas > 0) {
      const monthsNow = new Date().getMonth() + 1; // 1-indexed
      const expectedProposals = Math.round(dc25.media_mensal_propostas * monthsNow);
      alerts.push({
        type: 'info', icon: '\u{1F4CA}',
        title: 'Benchmark Propostas',
        message: `Media 2025: ${dc25.media_mensal_propostas}/mes (${dc25.propostas} total). Em ${monthsNow} meses de 2026, projecao = ${expectedProposals} propostas.`
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        type: 'success', icon: '\u2705',
        title: 'Tudo em Ordem',
        message: 'Nenhum alerta critico no momento.'
      });
    }

    return alerts.map(a => `
      <div class="alert-item ${a.type}">
        <span class="alert-icon">${a.icon}</span>
        <div class="alert-content">
          <div class="alert-title">${a.title}</div>
          <div class="alert-message">${a.message}</div>
        </div>
      </div>
    `).join('');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTION INTEGRATION HOOK (item 14)
  // ═══════════════════════════════════════════════════════════════════════════
  _notionHooks: {
    // Register callback functions for Notion data
    _callbacks: [],
    register(callback) { this._callbacks.push(callback); },
    notify(data) { this._callbacks.forEach(cb => { try { cb(data); } catch(e) { console.warn('Notion hook error:', e); } }); }
  },

  // Called externally when Notion data is refreshed
  onNotionDataRefresh(notionData) {
    this._notionHooks.notify(notionData);
    // Store for dashboard use
    if (notionData) {
      localStorage.setItem('tbo_notion_cache', JSON.stringify({ data: notionData, timestamp: Date.now() }));
    }
  },

  // Get cached Notion data
  _getNotionData() {
    try {
      const cached = JSON.parse(localStorage.getItem('tbo_notion_cache') || 'null');
      if (cached && (Date.now() - cached.timestamp < 3600000)) return cached.data;
    } catch(e) { /* ignore */ }
    return null;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INIT — Binds events (variant-aware)
  // ═══════════════════════════════════════════════════════════════════════════

  init() {
    const self = this;
    const variant = (typeof TBO_AUTH !== 'undefined') ? TBO_AUTH.getDashboardVariant() : 'full';
    if (variant === 'full') {
      this._bind('ccGenerateAlerts', () => this._generateAlerts());
      this._bind('ccBriefing', () => this._generateBriefing());
      this._initLeafletMap();
      this._initCharts(); // v3: Chart.js charts

      // Customize panel toggle
      this._bind('ccCustomizeToggle', () => this._toggleCustomizePanel());
      this._bind('ccCustomizeClose', () => this._toggleCustomizePanel());
      this._bind('ccResetLayoutPanel', () => { this._resetLayout(); });

      // Customize panel overlay click to close
      const overlay = document.getElementById('ccCustomizeOverlay');
      if (overlay) overlay.addEventListener('click', () => this._toggleCustomizePanel());

      // Widget add buttons in customize panel
      document.querySelectorAll('.cc-add-widget-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const widgetId = btn.dataset.widgetId;
          if (widgetId) self._addWidget(widgetId);
        });
      });

      // Widget close/remove buttons
      document.querySelectorAll('.cc-widget-close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          const widgetId = btn.dataset.removeWidget;
          if (widgetId) self._removeWidget(widgetId);
        });
      });
    }

    // Quick-done buttons for "My Tasks Today"
    document.querySelectorAll('.cc-quick-done').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.taskId;
        if (taskId && typeof TBO_STORAGE !== 'undefined') {
          TBO_STORAGE.updateErpEntity(taskId, { status: 'done' });
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Concluida!', 'Tarefa marcada como feita.');
          btn.closest('div[style*="border-bottom"]')?.remove();
        }
      });
    });

    // Refresh Lucide icons for new elements
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Refresh meetings sidebar when external APIs finish loading (Fireflies sync)
    window.addEventListener('tbo:external-data-loaded', () => this._refreshMeetingsWidget(), { once: true });

    // Also try loading fresh meetings from Supabase (MeetingsRepo) in background
    this._loadFreshMeetings();
  },

  /**
   * Loads meetings from MeetingsRepo (Supabase) and refreshes the sidebar widget.
   * Ensures dashboard always shows the latest data, not stale JSON.
   */
  async _loadFreshMeetings() {
    try {
      if (typeof MeetingsRepo === 'undefined') return;
      const dbMeetings = await MeetingsRepo.list({ limit: 200 });
      if (!dbMeetings || dbMeetings.length === 0) return;

      // Update TBO_STORAGE in-memory with fresh Supabase data
      const transformed = {
        metadata: { collected_at: new Date().toISOString(), total_meetings: dbMeetings.length },
        meetings: dbMeetings.map(m => ({ ...m, _source: m.sync_source || 'supabase' }))
      };
      if (typeof TBO_STORAGE !== 'undefined') {
        TBO_STORAGE._data.meetings = transformed;
      }
      this._refreshMeetingsWidget();
    } catch (e) {
      console.warn('[CommandCenter] _loadFreshMeetings falhou:', e.message);
    }
  },

  /**
   * Re-renders the sidebar-meetings widget in-place without full dashboard re-render.
   */
  _refreshMeetingsWidget() {
    const container = document.querySelector('.cc-sidebar-card');
    if (!container) return;
    // Find the meetings sidebar card by looking for "Reunioes Recentes" header
    const allCards = document.querySelectorAll('.cc-sidebar-card');
    let meetingsCard = null;
    allCards.forEach(card => {
      const title = card.querySelector('.card-title');
      if (title && title.textContent.includes('Reunioes')) meetingsCard = card;
    });
    if (!meetingsCard) return;

    try {
      const d = this._getData();
      const tmp = document.createElement('div');
      tmp.innerHTML = this._renderSidebarMeetings(d.meetingsArr);
      const newCard = tmp.querySelector('.cc-sidebar-card');
      if (newCard) {
        meetingsCard.replaceWith(newCard);
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    } catch (e) {
      console.warn('[CommandCenter] _refreshMeetingsWidget error:', e.message);
    }
  },

  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHART.JS INITIALIZATION (v3)
  // ═══════════════════════════════════════════════════════════════════════════
  _initCharts() {
    if (typeof Chart === 'undefined') return;
    const d = this._lastData || this._getData();
    const fc = d.dc26.fluxo_caixa || {};

    // ── Revenue Chart ──
    const revenueEl = document.getElementById('ccRevenueChart');
    if (revenueEl && fc.receita_mensal) {
      const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
      const monthLabels = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      const realizados = fc.meses_realizados || [];
      const receitas = months.map(m => (fc.receita_mensal || {})[m] || 0);
      const despesas = months.map(m => (fc.despesa_mensal || {})[m] || 0);
      const resultados = months.map((m, i) => receitas[i] - despesas[i]);

      const isDark = document.body.classList.contains('dark-mode');
      const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      const textColor = isDark ? '#999' : '#888';

      if (this._revenueChart) this._revenueChart.destroy();
      this._revenueChart = new Chart(revenueEl.getContext('2d'), {
        type: 'bar',
        data: {
          labels: monthLabels,
          datasets: [
            {
              label: 'Receita',
              data: receitas,
              backgroundColor: realizados.map((_, i) => realizados.includes(months[i]) ? '#E85102' : '#E8510240'),
              borderRadius: 4,
              barPercentage: 0.7,
              categoryPercentage: 0.8,
              order: 2
            },
            {
              label: 'Despesa',
              data: despesas,
              backgroundColor: realizados.map((_, i) => realizados.includes(months[i]) ? '#64748b' : '#64748b40'),
              borderRadius: 4,
              barPercentage: 0.7,
              categoryPercentage: 0.8,
              order: 3
            },
            {
              label: 'Resultado',
              data: resultados,
              type: 'line',
              borderColor: '#22c55e',
              backgroundColor: 'rgba(34,197,94,0.05)',
              borderWidth: 2,
              pointRadius: realizados.map((_, i) => realizados.includes(months[i]) ? 4 : 2),
              pointBackgroundColor: '#22c55e',
              fill: true,
              tension: 0.3,
              order: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? '#1e1e2e' : '#fff',
              titleColor: isDark ? '#eee' : '#333',
              bodyColor: isDark ? '#ccc' : '#666',
              borderColor: isDark ? '#333' : '#e5e7eb',
              borderWidth: 1,
              padding: 10,
              displayColors: true,
              callbacks: {
                label: function(ctx) {
                  return ctx.dataset.label + ': R$ ' + (ctx.raw || 0).toLocaleString('pt-BR');
                }
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                font: { size: 11 },
                callback: function(v) {
                  if (Math.abs(v) >= 1000000) return (v/1000000).toFixed(1) + 'M';
                  if (Math.abs(v) >= 1000) return (v/1000).toFixed(0) + 'k';
                  return v;
                }
              }
            }
          }
        }
      });
    }

    // ── Pipeline Doughnut Chart ──
    const pipelineEl = document.getElementById('ccPipelineChart');
    if (pipelineEl) {
      const dc25 = d.dc25;
      const propostas = dc25.propostas || 0;
      const contratos = dc25.contratos || 0;
      const negociacao = dc25.em_negociacao || 0;
      const perdidos = Math.max(0, propostas - contratos - negociacao);

      if (this._pipelineChart) this._pipelineChart.destroy();
      this._pipelineChart = new Chart(pipelineEl.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Fechados', 'Em Negociacao', 'Perdidos/Outros'],
          datasets: [{
            data: [contratos, negociacao, perdidos],
            backgroundColor: ['#22c55e', '#f59e0b', '#64748b40'],
            borderWidth: 0,
            spacing: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 12,
                usePointStyle: true,
                pointStyle: 'circle',
                font: { size: 11 },
                color: document.body.classList.contains('dark-mode') ? '#999' : '#888'
              }
            },
            tooltip: {
              backgroundColor: document.body.classList.contains('dark-mode') ? '#1e1e2e' : '#fff',
              titleColor: document.body.classList.contains('dark-mode') ? '#eee' : '#333',
              bodyColor: document.body.classList.contains('dark-mode') ? '#ccc' : '#666',
              borderColor: document.body.classList.contains('dark-mode') ? '#333' : '#e5e7eb',
              borderWidth: 1,
              padding: 10
            }
          }
        }
      });
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAG & DROP — Reorder widgets within main or sidebar zones
  // ═══════════════════════════════════════════════════════════════════════════
  _initDragDrop() {
    const self = this;
    const mainContainer = document.querySelector('.cc-main');
    const sidebarContainer = document.querySelector('.cc-sidebar');
    // Also handle above-layout widgets (tasks/summary/erp/kpis/pulse)
    const commandCenter = document.querySelector('.command-center');

    const allZones = [mainContainer, sidebarContainer, commandCenter].filter(Boolean);

    allZones.forEach(zone => {
      const widgets = zone.querySelectorAll(':scope > .cc-widget, :scope > .cc-tasks-summary-grid > .cc-widget');

      widgets.forEach(widget => {
        widget.addEventListener('dragstart', (e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', widget.dataset.widgetId);
          // Small delay so the dragging class is applied after the drag image is captured
          requestAnimationFrame(() => widget.classList.add('cc-widget--dragging'));
        });

        widget.addEventListener('dragend', () => {
          widget.classList.remove('cc-widget--dragging');
          document.querySelectorAll('.cc-widget--drag-over-top, .cc-widget--drag-over-bottom').forEach(el => {
            el.classList.remove('cc-widget--drag-over-top', 'cc-widget--drag-over-bottom');
          });
        });

        widget.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          const rect = widget.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          widget.classList.toggle('cc-widget--drag-over-top', e.clientY < midY);
          widget.classList.toggle('cc-widget--drag-over-bottom', e.clientY >= midY);
        });

        widget.addEventListener('dragleave', (e) => {
          // Only remove if leaving the widget entirely
          if (!widget.contains(e.relatedTarget)) {
            widget.classList.remove('cc-widget--drag-over-top', 'cc-widget--drag-over-bottom');
          }
        });

        widget.addEventListener('drop', (e) => {
          e.preventDefault();
          widget.classList.remove('cc-widget--drag-over-top', 'cc-widget--drag-over-bottom');

          const draggedId = e.dataTransfer.getData('text/plain');
          const targetId = widget.dataset.widgetId;
          if (!draggedId || !targetId || draggedId === targetId) return;

          const layout = self._getLayout();

          // Determine which zone the dragged widget belongs to
          const draggedDef = self._widgets[draggedId];
          const targetDef = self._widgets[targetId];
          if (!draggedDef || !targetDef) return;

          // Only allow reorder within the same zone
          const dragZone = draggedDef.zone;
          const targetZone = targetDef.zone;
          if (dragZone !== targetZone) return;

          const zoneName = dragZone === 'sidebar' ? 'sidebar' : 'main';
          const arr = layout[zoneName];
          const fromIdx = arr.indexOf(draggedId);
          let toIdx = arr.indexOf(targetId);
          if (fromIdx === -1 || toIdx === -1) return;

          // Determine if above or below target
          const rect = widget.getBoundingClientRect();
          const insertAfter = e.clientY >= rect.top + rect.height / 2;

          // Remove from old position
          arr.splice(fromIdx, 1);

          // Recalculate toIdx after removal
          toIdx = arr.indexOf(targetId);
          if (insertAfter) toIdx++;

          arr.splice(toIdx, 0, draggedId);

          self._saveLayout(layout);

          // Re-render
          const container = document.getElementById('moduleContainer');
          if (container) {
            container.innerHTML = self.render();
            self.init();
          }
        });
      });
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AI GENERATION
  // ═══════════════════════════════════════════════════════════════════════════

  async _generateAlerts() {
    const btn = document.getElementById('ccGenerateAlerts');
    const output = document.getElementById('ccAiAlerts');
    if (!output) return;

    const cacheKey = 'tbo_cc_alerts';
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 3600000) {
          output.style.display = 'block';
          output.innerHTML = TBO_FORMATTER.markdownToHtml(parsed.text);
          TBO_TOAST.info('Cache', 'Alertas carregados do cache (valido por 1h).');
          return;
        }
      } catch (e) { /* ignore */ }
    }

    if (!TBO_API.isConfigured()) {
      TBO_TOAST.warning('API nao configurada', 'Acesse Configuracoes para inserir sua chave.');
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Gerando...'; }
    output.style.display = 'block';
    output.textContent = 'Analisando dados...';

    try {
      const fullContext = TBO_STORAGE.getFullContext();
      const result = await TBO_API.callWithContext(
        'commandCenter',
        `Analise todos os dados disponiveis e gere 5-8 alertas estrategicos priorizados para a TBO neste momento. Cruze dados comerciais, de projetos, mercado e reunioes. Classifique cada alerta como CRITICO, ATENCAO ou INFO. Sugira acoes concretas para cada um.`,
        fullContext,
        { temperature: 0.5 }
      );
      output.innerHTML = TBO_FORMATTER.markdownToHtml(result.text);
      localStorage.setItem(cacheKey, JSON.stringify({ text: result.text, timestamp: Date.now() }));
    } catch (e) {
      output.textContent = 'Erro: ' + e.message;
      TBO_TOAST.error('Erro', e.message);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Gerar com IA'; }
    }
  },

  async _generateBriefing() {
    if (!TBO_API.isConfigured()) {
      TBO_TOAST.warning('API nao configurada', 'Acesse Configuracoes para inserir sua chave.');
      return;
    }

    const btn = document.getElementById('ccBriefing');
    if (btn) { btn.disabled = true; btn.textContent = 'Gerando...'; }
    TBO_TOAST.info('Briefing', 'Gerando briefing semanal...');

    try {
      const fullContext = TBO_STORAGE.getFullContext();
      const meetings = TBO_STORAGE.get('meetings');
      const meetingsArr = meetings.meetings || meetings.reunioes_recentes || [];
      const news = TBO_STORAGE.get('news');

      let extraCtx = '\n[REUNIOES DA SEMANA]\n';
      const weekAgo = new Date(Date.now() - TBO_CONFIG.business.thresholds.projectMonitoring.noMeetingDays * 86400000);
      meetingsArr.filter(m => new Date(m.date || m.data) >= weekAgo).forEach(m => {
        extraCtx += `- ${m.title || m.titulo} (${TBO_FORMATTER.date(m.date || m.data)}): ${m.summary || m.resumo || 'sem resumo'}\n`;
        const items = m.action_items || [];
        if (items.length > 0) {
          extraCtx += `  Action items: ${items.slice(0, 3).map(i => i.task || i.tarefa || i).join('; ')}\n`;
        }
      });

      const noticias = news.noticias || [];
      if (noticias.length > 0) {
        extraCtx += '\n[NOTICIAS RECENTES]\n';
        noticias.slice(0, 5).forEach(n => {
          extraCtx += `- ${n.title || n.titulo} (${n.source || n.fonte})\n`;
        });
      }

      const result = await TBO_API.callWithContext(
        'commandCenter',
        `Gere um BRIEFING DA SEMANA executivo para os socios Marco e Ruy da TBO. Inclua:\n\n1. RESUMO EXECUTIVO (3-4 frases)\n2. STATUS DOS PROJETOS (o que avancou, o que precisa de atencao)\n3. ACTION ITEMS PRIORITARIOS (pendentes das reunioes)\n4. MOVIMENTACOES DE MERCADO (noticias e tendencias relevantes)\n5. PROXIMOS PASSOS SUGERIDOS\n\nSeja objetivo e acionavel. Use bullet points.`,
        fullContext + extraCtx,
        { temperature: 0.4, maxTokens: 4096 }
      );

      this._showBriefingModal(result.text);
    } catch (e) {
      TBO_TOAST.error('Erro', e.message);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Briefing da Semana'; }
    }
  },

  _showBriefingModal(text) {
    const existing = document.getElementById('ccBriefingModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'ccBriefingModal';
    modal.className = 'search-overlay';
    modal.style.cssText = 'display:flex; align-items:center; justify-content:center; z-index:var(--z-modal);';
    modal.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border-default); border-radius:var(--radius-lg); max-width:800px; width:90%; max-height:80vh; overflow-y:auto; padding:32px; position:relative;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h2 style="font-size:1.1rem; font-weight:600;">Briefing da Semana</h2>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-sm btn-secondary" id="ccCopyBriefing">Copiar</button>
            <button class="btn btn-sm btn-ghost" id="ccCloseBriefing">&times;</button>
          </div>
        </div>
        <div class="ai-response" style="min-height:200px;">${TBO_FORMATTER.markdownToHtml(text)}</div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.getElementById('ccCloseBriefing')?.addEventListener('click', () => modal.remove());
    document.getElementById('ccCopyBriefing')?.addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => {
        TBO_TOAST.success('Copiado', 'Briefing copiado para a area de transferencia.');
      });
    });
    const escHandler = (e) => {
      if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CITIES MAP (Leaflet) — with fallback (item 4) + unknown cities (item 10)
  // ═══════════════════════════════════════════════════════════════════════════

  _getCities(ativos, finalizados) {
    const cityDB = {
      'Curitiba':               { lat: -25.43, lng: -49.27, state: 'PR', country: 'Brasil' },
      'Sao Jose dos Pinhais':   { lat: -25.53, lng: -49.20, state: 'PR', country: 'Brasil' },
      'Campo Largo':            { lat: -25.46, lng: -49.53, state: 'PR', country: 'Brasil' },
      'Pinhais':                { lat: -25.44, lng: -49.19, state: 'PR', country: 'Brasil' },
      'Colombo':                { lat: -25.29, lng: -49.22, state: 'PR', country: 'Brasil' },
      'Araucaria':              { lat: -25.59, lng: -49.41, state: 'PR', country: 'Brasil' },
      'Quatro Barras':          { lat: -25.37, lng: -49.08, state: 'PR', country: 'Brasil' },
      'Balneario Camboriu':     { lat: -26.99, lng: -48.63, state: 'SC', country: 'Brasil' },
      'Itajai':                 { lat: -26.91, lng: -48.67, state: 'SC', country: 'Brasil' },
      'Penha':                  { lat: -26.77, lng: -48.65, state: 'SC', country: 'Brasil' },
      'Curitibanos':            { lat: -27.28, lng: -50.58, state: 'SC', country: 'Brasil' },
      'Cachoeira do Sul':       { lat: -30.04, lng: -52.89, state: 'RS', country: 'Brasil' },
      'Sorriso':                { lat: -12.55, lng: -55.71, state: 'MT', country: 'Brasil' },
      'Sao Paulo':              { lat: -23.55, lng: -46.63, state: 'SP', country: 'Brasil' },
      'Tel Aviv':               { lat: 32.07,  lng: 34.78,  state: '',   country: 'Israel' }
    };

    const projectCityMap = {
      'ELIO WINTER_CURITIBANOS': 'Curitibanos',
      'ARTHUR SILVEIRA_CACHOEIRA': 'Cachoeira do Sul',
      'FONTANIVE_ECOVILLAGE': 'Balneario Camboriu',
      'FONTANIVE_ILHAS GREGAS': 'Itajai',
      'FONTANIVE_NEW LIFE': 'Penha',
      'PRC_RESERVA TUIUTI': 'Sorriso',
      'MDI BRASIL': 'Tel Aviv'
    };

    const cityProjects = {};
    const unknownProjects = []; // item 10: track projects not mapped
    const addToCity = (city, type) => {
      if (!cityProjects[city]) cityProjects[city] = { active: 0, finished: 0 };
      cityProjects[city][type]++;
    };

    ativos.forEach(p => {
      let city = 'Curitiba';
      let matched = false;
      for (const [key, c] of Object.entries(projectCityMap)) {
        if (p.nome.toUpperCase().includes(key.split('_')[0])) {
          if (!key.includes('_') || p.nome.toUpperCase().includes(key.split('_')[1])) { city = c; matched = true; break; }
        }
      }
      addToCity(city, 'active');
    });

    Object.values(finalizados).forEach(arr => {
      if (!Array.isArray(arr)) return;
      arr.forEach(name => {
        let city = 'Curitiba';
        const upper = name.toUpperCase();
        if (upper.includes('CURITIBANOS')) city = 'Curitibanos';
        else if (upper.includes('CACHOEIRA')) city = 'Cachoeira do Sul';
        else if (upper.includes('ECOVILLAGE') || upper.includes('CAMBORIU')) city = 'Balneario Camboriu';
        else if (upper.includes('ITAJAI') || upper.includes('ILHAS GREGAS')) city = 'Itajai';
        else if (upper.includes('PENHA') || upper.includes('NEW LIFE')) city = 'Penha';
        else if (upper.includes('SORRISO') || upper.includes('TUIUTI')) city = 'Sorriso';
        else if (upper.includes('MDI') || upper.includes('TEL AVIV')) city = 'Tel Aviv';
        addToCity(city, 'finished');
      });
    });

    return Object.entries(cityProjects).map(([name, data]) => ({
      name, ...data, total: data.active + data.finished,
      ...(cityDB[name] || { lat: null, lng: null, state: '', country: '' })
    })).sort((a, b) => b.total - a.total);
  },

  _initLeafletMap() {
    const el = document.getElementById('citiesLeafletMap');
    if (!el) return;

    // Item 4: Leaflet fallback if CDN failed
    if (!window.L) {
      el.innerHTML = `
        <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--text-muted);gap:12px;">
          <div style="font-size:2rem;">&#x1F5FA;</div>
          <div style="font-size:0.85rem;font-weight:600;">Mapa indisponivel</div>
          <div style="font-size:0.75rem;max-width:300px;text-align:center;">Biblioteca Leaflet nao carregou. Verifique sua conexao e recarregue a pagina.</div>
          <button class="btn btn-sm btn-secondary" onclick="location.reload()">Recarregar</button>
        </div>
      `;
      return;
    }

    if (this._leafletMap) { this._leafletMap.remove(); this._leafletMap = null; }

    const context = TBO_STORAGE.get('context');
    const ativos = context.projetos_ativos || [];
    const finalizados = context.projetos_finalizados || {};
    const cities = this._getCities(ativos, finalizados);

    const map = L.map(el, {
      center: [-18, -48], zoom: 4, minZoom: 2, maxZoom: 12,
      zoomControl: false, attributionControl: false, scrollWheelZoom: true
    });
    this._leafletMap = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('&copy; <a href="https://carto.com/" target="_blank" style="color:#888;">CARTO</a>')
      .addTo(map);

    const cwb = cities.find(c => c.name === 'Curitiba');
    if (cwb && cwb.lat) {
      cities.forEach(city => {
        if (!city.lat || city.name === 'Curitiba') return;
        const midLat = (cwb.lat + city.lat) / 2 + Math.abs(cwb.lng - city.lng) * 0.06;
        const midLng = (cwb.lng + city.lng) / 2;
        const points = [];
        for (let t = 0; t <= 1; t += 0.05) {
          const lat = (1-t)*(1-t)*cwb.lat + 2*(1-t)*t*midLat + t*t*city.lat;
          const lng = (1-t)*(1-t)*cwb.lng + 2*(1-t)*t*midLng + t*t*city.lng;
          points.push([lat, lng]);
        }
        L.polyline(points, { color: '#E85102', weight: 1.2, opacity: 0.25, dashArray: '6,4', interactive: false }).addTo(map);
      });
    }

    cities.forEach(city => {
      if (!city.lat) return; // item 10: skip cities without coordinates gracefully
      const isCuritiba = city.name === 'Curitiba';
      const radius = isCuritiba ? 14 : Math.max(7, Math.min(12, Math.sqrt(city.total) * 4));

      L.circleMarker([city.lat, city.lng], {
        radius: radius + 8, fillColor: '#E85102', fillOpacity: 0.12, stroke: false, interactive: false
      }).addTo(map);

      const marker = L.circleMarker([city.lat, city.lng], {
        radius, fillColor: '#E85102', fillOpacity: 0.9,
        color: isCuritiba ? '#FF8A3D' : 'rgba(255,255,255,0.5)',
        weight: isCuritiba ? 3 : 1.5
      }).addTo(map);

      if (city.total >= 3 || isCuritiba) {
        marker.bindTooltip(city.name, {
          permanent: true, direction: 'top', offset: [0, -radius - 4],
          className: 'leaflet-city-label'
        });
      }

      const loc = city.state ? `${city.state}, ${city.country}` : city.country;
      const popupHTML = `
        <div class="leaflet-city-popup">
          <div class="leaflet-city-popup-name">${city.name}</div>
          <div class="leaflet-city-popup-loc">${loc}</div>
          <div class="leaflet-city-popup-stats">
            <div class="leaflet-city-popup-stat">
              <span class="leaflet-city-popup-val">${city.total}</span>
              <span class="leaflet-city-popup-label">projetos</span>
            </div>
            ${city.active > 0 ? `<div class="leaflet-city-popup-stat">
              <span class="leaflet-city-popup-val" style="color:#4ade80;">${city.active}</span>
              <span class="leaflet-city-popup-label">ativos</span>
            </div>` : ''}
            ${city.finished > 0 ? `<div class="leaflet-city-popup-stat">
              <span class="leaflet-city-popup-val" style="color:var(--text-muted);">${city.finished}</span>
              <span class="leaflet-city-popup-label">finalizados</span>
            </div>` : ''}
          </div>
        </div>
      `;
      marker.bindPopup(popupHTML, { className: 'leaflet-city-popup-container', closeButton: false });

      if (city.total < 3 && !isCuritiba) {
        marker.bindTooltip(`${city.name} (${city.total})`, {
          direction: 'top', offset: [0, -radius - 2], className: 'leaflet-city-label'
        });
      }
    });

    map.setView([-22, -48], 5);
    setTimeout(() => map.invalidateSize(), 200);
  },

  _renderCitiesList(ativos, finalizados) {
    const cities = this._getCities(ativos, finalizados);
    const total = cities.reduce((s, c) => s + c.total, 0);
    const countries = new Set(cities.map(c => c.country).filter(Boolean));
    const states = new Set(cities.map(c => c.state).filter(Boolean));

    // Item 10: separate cities with and without coordinates
    const mapped = cities.filter(c => c.lat);
    const unmapped = cities.filter(c => !c.lat);

    return `
      <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;">
        <div style="flex:1;min-width:250px;display:flex;flex-wrap:wrap;gap:6px;">
          ${mapped.map(c => `
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:var(--bg-tertiary);border-radius:var(--radius-full);font-size:0.75rem;">
              <span style="width:6px;height:6px;border-radius:50%;background:${c.active > 0 ? 'var(--accent-gold)' : 'var(--text-muted)'};"></span>
              <span style="font-weight:600;">${c.name}</span>
              <span style="color:var(--text-muted);">${c.state || c.country}</span>
              <span style="color:var(--text-secondary);">${c.total}</span>
            </div>
          `).join('')}
          ${unmapped.map(c => `
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:var(--bg-tertiary);border-radius:var(--radius-full);font-size:0.75rem;opacity:0.6;" title="Cidade sem coordenadas no mapa">
              <span style="width:6px;height:6px;border-radius:50%;background:var(--text-muted);"></span>
              <span style="font-weight:600;">${c.name}</span>
              <span style="color:var(--text-muted);">?</span>
              <span style="color:var(--text-secondary);">${c.total}</span>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:12px;">
          <div style="text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:var(--accent-gold);">${total}</div>
            <div style="font-size:0.68rem;color:var(--text-muted);">projetos</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:var(--text-primary);">${cities.length}</div>
            <div style="font-size:0.68rem;color:var(--text-muted);">cidades</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:var(--text-primary);">${countries.size}</div>
            <div style="font-size:0.68rem;color:var(--text-muted);">paises</div>
          </div>
        </div>
      </div>
    `;
  },

};
