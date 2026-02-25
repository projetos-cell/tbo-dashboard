// TBO OS — Module: Command Center (Dashboard Principal)
// Renders different dashboard variants based on user role.
const TBO_COMMAND_CENTER = {

  // ── Widget Definitions (size: 'kpi' = KPI strip above grid, 'span-2' = 2 cols, '1' = 1 col) ──
  _widgets: {
    'kpi-receita':      { label: 'Receita YTD',          icon: 'trending-up',     zone: 'main', size: 'kpi' },
    'kpi-projetos':     { label: 'Projetos Ativos',      icon: 'folder-kanban',   zone: 'main', size: 'kpi' },
    'kpi-reunioes':     { label: 'Reunioes 7d',          icon: 'calendar',        zone: 'main', size: 'kpi' },
    'kpi-margem':       { label: 'Margem YTD',           icon: 'percent',         zone: 'main', size: 'kpi' },
    'kpi-meta':         { label: 'Meta 2026',            icon: 'target',          zone: 'main', size: 'kpi' },
    'revenue-chart':    { label: 'Receita vs Despesa',   icon: 'bar-chart-3',     zone: 'main', size: 'span-2' },
    'my-tasks':         { label: 'Minhas Tarefas',       icon: 'clipboard-check', zone: 'main', size: '1' },
    'actions-today':    { label: 'Acoes para Hoje',      icon: 'target',          zone: 'main', size: '1' },
    'business-pulse':   { label: 'Business Pulse',       icon: 'heart-pulse',     zone: 'main', size: '1' },
    'pipeline-funnel':  { label: 'Pipeline',             icon: 'filter',          zone: 'main', size: '1' },
    'people-widget':    { label: 'Equipe',               icon: 'users',           zone: 'main', size: '1' },
    'projects-overview':{ label: 'Projetos Ativos',      icon: 'building-2',      zone: 'main', size: '1' },
  },

  _getDefaultLayout() {
    return {
      main: ['kpi-receita', 'kpi-projetos', 'kpi-reunioes', 'kpi-margem', 'kpi-meta', 'revenue-chart', 'my-tasks', 'pipeline-funnel', 'business-pulse', 'actions-today', 'projects-overview', 'people-widget'],
      sidebar: [],
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

    const dc24 = context.dados_comerciais?.['2024'] || {};
    const dc25 = context.dados_comerciais?.['2025'] || {};
    const dc26 = context.dados_comerciais?.[TBO_CONFIG.app.fiscalYear] || {};

    const data = { context, ativos, finalizados, totalFinalizados, ic, meetingsArr, meta, recentMeetings, totalActions, actionsByPerson, actionItems, dc24, dc25, dc26 };
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
  _financialWidgets: ['business-pulse', 'pipeline-funnel', 'revenue-chart', 'kpi-receita', 'kpi-margem', 'kpi-meta'],

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
    const actionsToday = (typeof TBO_ERP !== 'undefined') ? TBO_ERP.getActionsToday().slice(0, 6) : [];
    const fc = d.dc26.fluxo_caixa || {};
    const receitaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.receita_mensal || {})[m] || 0), 0);
    const despesaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.despesa_mensal || {})[m] || 0), 0);
    const resultadoYTD = receitaYTD - despesaYTD;
    const overdueTasks = erpSummary ? erpSummary.tasks.overdue : 0;
    const activeProjCount = erpSummary ? erpSummary.projects.active : d.ativos.length;
    const metaAnual = fc.meta_vendas_anual || 1;
    const progressMeta = metaAnual > 0 ? ((receitaYTD / metaAnual) * 100) : 0;
    const margemYTD = receitaYTD > 0 ? ((resultadoYTD / receitaYTD) * 100).toFixed(1) : '0';

    switch (widgetId) {
      case 'my-tasks':
        return this._renderMyTasksToday();

      case 'kpi-receita':
        return this._renderKpiReceita(receitaYTD, resultadoYTD, progressMeta);
      case 'kpi-projetos':
        return this._renderKpiProjetos(activeProjCount, overdueTasks, d);
      case 'kpi-reunioes':
        return this._renderKpiReunioes(d);
      case 'kpi-margem':
        return this._renderKpiMargem(margemYTD);
      case 'kpi-meta':
        return this._renderKpiMeta(progressMeta, fc);

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

      case 'business-pulse':
        return this._renderBusinessPulse(d);

      case 'pipeline-funnel':
        return this._renderPipelineFunnel(d);

      case 'people-widget':
        return this._renderPeopleWidget();

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

      default:
        return '';
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // V3 WIDGET DISPATCHER — Maps widget IDs to V3 renderers (layout-driven)
  // ═══════════════════════════════════════════════════════════════════════════
  _renderWidgetContentV3(widgetId, d) {
    // Block financial widgets for unauthorized roles
    if (this._financialWidgets.includes(widgetId) && !this._isFinancialAccessAllowed()) {
      return '';
    }

    const fc = d.dc26.fluxo_caixa || {};
    const receitaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.receita_mensal || {})[m] || 0), 0);
    const despesaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.despesa_mensal || {})[m] || 0), 0);
    const resultadoYTD = receitaYTD - despesaYTD;
    const metaAnual = fc.meta_vendas_anual || 1;
    const progressMeta = metaAnual > 0 ? ((receitaYTD / metaAnual) * 100) : 0;
    const margemYTD = receitaYTD > 0 ? ((resultadoYTD / receitaYTD) * 100).toFixed(1) : '0';
    const erpSummary = TBO_STORAGE.getErpSummary ? TBO_STORAGE.getErpSummary() : null;
    const actionsToday = (typeof TBO_ERP !== 'undefined') ? TBO_ERP.getActionsToday().slice(0, 6) : [];
    const overdueTasks = erpSummary ? erpSummary.tasks.overdue : 0;
    const activeProjCount = erpSummary ? erpSummary.projects.active : d.ativos.length;

    switch (widgetId) {
      case 'kpi-receita':
        return this._renderKpiReceita(receitaYTD, resultadoYTD, progressMeta);
      case 'kpi-projetos':
        return this._renderKpiProjetos(activeProjCount, overdueTasks, d);
      case 'kpi-reunioes':
        return this._renderKpiReunioes(d);
      case 'kpi-margem':
        return this._renderKpiMargem(margemYTD);
      case 'kpi-meta':
        return this._renderKpiMeta(progressMeta, fc);
      case 'revenue-chart':
        return this._renderRevenueChart(d, fc);
      case 'my-tasks':
        return this._renderMyTasksToday();
      case 'pipeline-funnel':
        return this._renderPipelineCardV3(d);
      case 'business-pulse':
        return this._renderBusinessPulseV3(d);
      case 'actions-today':
        return (actionsToday.length > 0) ? this._renderActionsTodayV3(actionsToday) : '';
      case 'projects-overview':
        return this._renderProjectsGridV3(d);
      case 'people-widget':
        return this._renderPeopleWidget();
      default:
        return '';
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL DASHBOARD v3 (founder) — Layout-driven 3-column grid with drag-drop
  // ═══════════════════════════════════════════════════════════════════════════
  _renderFullDashboard() {
    const d = this._getData();
    const layout = this._getLayout();

    // ── Render individual KPI cards above grid (full-width strip) ──
    const kpiIds = layout.main.filter(id => this._widgets[id]?.size === 'kpi');
    let kpiHtml = '';
    if (kpiIds.length > 0) {
      const kpiCards = kpiIds.map(id => {
        const content = this._renderWidgetContentV3(id, d);
        return content ? this._wrapWidget(id, content) : '';
      }).filter(h => h).join('');
      if (kpiCards) {
        kpiHtml = `<div class="cc-kpi-strip">${kpiCards}</div>`;
      }
    }

    // ── Render main-zone widgets (iterate layout order) ──
    let mainWidgetsHtml = '';
    for (const wId of layout.main) {
      const wDef = this._widgets[wId];
      if (!wDef || wDef.zone !== 'main') continue;
      if (wDef.size === 'kpi') continue; // Already rendered above grid

      const content = this._renderWidgetContentV3(wId, d);
      if (!content || !content.trim()) continue;

      const sizeClass = wDef.size === 'span-2' ? ' cc-col-span-2' : '';
      const wrapped = this._wrapWidget(wId, content);
      // Inject size class into the wrapper div
      mainWidgetsHtml += sizeClass
        ? wrapped.replace('class="cc-widget"', `class="cc-widget${sizeClass}"`)
        : wrapped;
    }

    return `
      <div class="command-center">
        ${this._renderGreeting()}
        ${this._renderQuickActions()}

        <!-- KPI Strip (full-width, above grid) -->
        ${kpiHtml}

        <!-- Main grid: layout-driven -->
        <div class="cc-grid">
          ${mainWidgetsHtml}
        </div>

        ${this._renderCustomizePanel()}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // V3 WIDGETS — New redesigned widget renderers
  // ═══════════════════════════════════════════════════════════════════════════

  _renderKpiReceita(receitaYTD, resultadoYTD, progressMeta) {
    return `
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
    `;
  },

  _renderKpiProjetos(activeProjCount, overdueTasks, d) {
    return `
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
    `;
  },

  _renderKpiReunioes(d) {
    return `
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
    `;
  },

  _renderKpiMargem(margemYTD) {
    return `
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
    `;
  },

  _renderKpiMeta(progressMeta, fc) {
    return `
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
      this._initCharts(); // v3: Chart.js charts

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

      // Drag & Drop — enable widget reordering
      this._initDragDrop();
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
    } catch (e) {
      console.warn('[CommandCenter] _loadFreshMeetings falhou:', e.message);
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
                  if (typeof TBO_FINANCE_MASK !== 'undefined' && TBO_FINANCE_MASK.isMasked()) return ctx.dataset.label + ': R$ ••••••';
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

    // Select ALL draggable widgets from the rendered DOM
    const widgets = document.querySelectorAll('.cc-widget[draggable="true"]');
    if (!widgets.length) return;

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
        const draggedId = e.dataTransfer.types.includes('text/plain') ? null : null; // can't read during dragover
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

        // Zone enforcement via _widgets definition — only same-zone reorder
        const draggedDef = self._widgets[draggedId];
        const targetDef = self._widgets[targetId];
        if (!draggedDef || !targetDef) return;
        if (draggedDef.zone !== targetDef.zone) {
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.warning('Arraste negado', 'Widgets so podem ser reordenados dentro da mesma zona.');
          }
          return;
        }

        const zoneName = draggedDef.zone === 'sidebar' ? 'sidebar' : 'main';
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

        // Re-render the full dashboard
        const container = document.getElementById('moduleContainer');
        if (container) {
          container.innerHTML = self.render();
          self.init();
        }
      });
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AI GENERATION
  // ═══════════════════════════════════════════════════════════════════════════

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

  // (Cities map removed)

};
