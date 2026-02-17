// TBO OS — Module: Command Center (Dashboard Principal)
// Renders different dashboard variants based on user role.
const TBO_COMMAND_CENTER = {

  // ── Dispatch to role-specific dashboard ──────────────────────────────────
  render() {
    const variant = (typeof TBO_AUTH !== 'undefined') ? TBO_AUTH.getDashboardVariant() : 'full';
    switch (variant) {
      case 'projects':  return this._renderProjectsDashboard();
      case 'tasks':     return this._renderTasksDashboard();
      case 'financial': return this._renderFinancialDashboard();
      case 'full':
      default:          return this._renderFullDashboard();
    }
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
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
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
    const dc26 = context.dados_comerciais?.['2026'] || {};

    return { context, ativos, finalizados, totalFinalizados, ic, meetingsArr, meta, recentMeetings, totalActions, actionsByPerson, actionItems, noticias, dc24, dc25, dc26 };
  },

  // ── Personalized greeting ───────────────────────────────────────────────
  _renderGreeting() {
    const user = (typeof TBO_AUTH !== 'undefined') ? TBO_AUTH.getCurrentUser() : null;
    if (!user) return '';

    const h = new Date().getHours();
    let greeting = 'Boa noite';
    if (h >= 5 && h < 12) greeting = 'Bom dia';
    else if (h >= 12 && h < 18) greeting = 'Boa tarde';

    const firstName = (user.name || '').split(' ')[0];
    const d = this._getData();

    // Count pending items for user
    const myActions = d.actionItems.filter(ai => {
      if (!user.name) return false;
      const personLower = ai.person.toLowerCase();
      const nameParts = user.name.toLowerCase().split(/\s+/);
      return nameParts.some(part => part.length > 2 && personLower.includes(part));
    });

    // Count completed action items from storage
    const completed = JSON.parse(localStorage.getItem('tbo_completed_actions') || '[]');
    const pendingCount = myActions.filter(ai => !completed.includes(ai.task + '|' + ai.meeting)).length;

    let subline = '';
    if (pendingCount > 0) {
      subline = `Voce tem <strong>${pendingCount}</strong> action item${pendingCount > 1 ? 's' : ''} pendente${pendingCount > 1 ? 's' : ''}`;
    }
    if (d.recentMeetings.length > 0) {
      subline += subline ? ' e ' : '';
      subline += `<strong>${d.recentMeetings.length}</strong> reuniao${d.recentMeetings.length > 1 ? 'es' : ''} esta semana`;
    }

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
    let hoursToday = '';
    if (typeof TBO_WORKLOAD !== 'undefined' && user) {
      const todayStr = TBO_WORKLOAD._today();
      const todayEntries = TBO_WORKLOAD.getTimeEntries({ userId: user.id, dateFrom: todayStr, dateTo: todayStr });
      const todayMins = todayEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
      if (todayMins > 0) {
        subline += subline ? ' | ' : '';
        subline += `<strong>${TBO_WORKLOAD.formatHoursMinutes(todayMins)}</strong> trackadas hoje`;
      }
    }

    return `
      <div class="cc-greeting">
        <h1 class="cc-greeting-title">${greeting}, ${firstName}${timerBadge}</h1>
        ${subline ? `<p class="cc-greeting-sub">${subline}</p>` : ''}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL DASHBOARD (founder) — The original complete dashboard
  // ═══════════════════════════════════════════════════════════════════════════
  _renderFullDashboard() {
    const d = this._getData();
    const fc = d.dc26.fluxo_caixa || {};
    const receitaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.receita_mensal || {})[m] || 0), 0);
    const despesaYTD = (fc.meses_realizados || []).reduce((s, m) => s + ((fc.despesa_mensal || {})[m] || 0), 0);
    const resultadoYTD = receitaYTD - despesaYTD;

    // ERP data
    const erpSummary = TBO_STORAGE.getErpSummary ? TBO_STORAGE.getErpSummary() : null;
    const erpAlerts = (typeof TBO_ERP !== 'undefined') ? TBO_ERP.generateAlerts().slice(0, 8) : [];
    const actionsToday = (typeof TBO_ERP !== 'undefined') ? TBO_ERP.getActionsToday().slice(0, 6) : [];

    return `
      <div class="command-center">
        <!-- Greeting -->
        ${this._renderGreeting()}

        <!-- ERP Alerts Banner -->
        ${erpAlerts.length > 0 ? `
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
        </section>` : ''}

        <!-- Actions Today -->
        ${actionsToday.length > 0 ? `
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
        </section>` : ''}

        <!-- KPIs -->
        <section class="section">
          <div class="grid-4" style="margin-bottom:12px;">
            <div class="kpi-card">
              <div class="kpi-label">Projetos Ativos</div>
              <div class="kpi-value">${erpSummary ? erpSummary.projects.active : d.ativos.length}</div>
              <div class="kpi-change neutral">${erpSummary ? erpSummary.tasks.overdue + ' tarefas atrasadas' : new Set(d.ativos.map(p => p.construtora)).size + ' construtoras'}</div>
            </div>
            <div class="kpi-card kpi-card--gold">
              <div class="kpi-label">Receita YTD 2026</div>
              <div class="kpi-value gold">${receitaYTD > 0 ? TBO_FORMATTER.currency(receitaYTD) : '\u2014'}</div>
              <div class="kpi-change ${resultadoYTD >= 0 ? 'positive' : 'negative'}">${resultadoYTD >= 0 ? '+' : ''}${TBO_FORMATTER.currency(resultadoYTD)} resultado</div>
            </div>
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
        </section>

        <!-- Two-column layout: Main + Sidebar -->
        <div class="cc-layout">
          <div class="cc-main">

            <!-- Alerts Section -->
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
            </section>

            <!-- Pipeline Mini-Funnel -->
            ${this._renderPipelineFunnel(d)}

            <!-- People/Team Widget -->
            ${this._renderPeopleWidget()}

            <!-- News Feed -->
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">Noticias do Mercado</h2>
                <div style="display:flex; gap:8px; align-items:center;">
                  ${d.noticias.length > 0 ? `<span style="font-size:0.72rem; color:var(--text-muted);">${d.noticias.length} noticias</span>` : ''}
                  <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('mercado')">Ver todas &rarr;</button>
                </div>
              </div>
              ${this._renderNewsFeed(d.noticias)}
            </section>

            <!-- Projects Overview -->
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
            </section>

            <!-- Cities Map (Leaflet interactive) -->
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
            </section>
          </div>

          <!-- Sidebar -->
          <div class="cc-sidebar">
            ${this._renderSidebarMeetings(d.meetingsArr)}
            ${this._renderSidebarActions(d.actionsByPerson, d.totalActions)}
            ${this._renderSidebarMarket(d.ic)}
            ${this._renderSidebarCommercial(d)}
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
    const metaAnual = fc.meta_vendas_anual || 2100000;
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
            <div style="font-weight:600; font-size:0.85rem; margin-bottom:4px;">${cicloAtual.nome || cicloAtual.titulo || 'Ciclo atual'}</div>
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
                <span style="font-size:0.82rem; font-weight:500;">${o.colaborador}</span>
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
                <div style="font-size:0.82rem; font-weight:500;">${f.de || f.remetente} &rarr; ${f.para || f.destinatario}</div>
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
      const firstName = (user.name || '').split(' ')[0];
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
          <div style="font-size:0.85rem; font-weight:600;">${rhData.upcoming11.lider || 'Lider'}</div>
          <div style="font-size:0.78rem; color:var(--text-muted);">${TBO_FORMATTER.date(rhData.upcoming11.data)}</div>
          ${rhData.upcoming11.pauta ? `<div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">${TBO_FORMATTER.truncate(rhData.upcoming11.pauta, 80)}</div>` : ''}
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
              <div class="cc-sidebar-item-title">${f.de || f.remetente}</div>
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
        <div style="font-weight:600; font-size:0.85rem; margin-bottom:4px;">${p.nome}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:0.75rem; color:var(--text-tertiary);">${p.construtora}</span>
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
                <div class="cc-news-title">${n.title || n.titulo}</div>
                <div class="cc-news-meta">${n.source || n.fonte}${relDate ? ' \u2022 ' + relDate : ''}</div>
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
    return `
      <tr class="${isDone ? 'cc-action-done' : ''}">
        <td style="text-align:center; cursor:pointer;" onclick="TBO_COMMAND_CENTER._toggleAction(this, '${key.replace(/'/g, "\\'")}')">
          <span style="display:inline-flex;width:18px;height:18px;border-radius:50%;border:2px solid ${isDone ? 'var(--color-success)' : 'var(--border-default)'};align-items:center;justify-content:center;background:${isDone ? 'var(--color-success)' : 'transparent'};transition:all 0.2s;">
            ${isDone ? '<span style="color:#fff;font-size:0.65rem;">&#10003;</span>' : ''}
          </span>
        </td>
        <td style="font-weight:500; ${isDone ? 'text-decoration:line-through; opacity:0.5;' : ''}">${ai.task}</td>
        <td style="font-size:0.78rem; color:var(--text-secondary);">${ai.meeting}</td>
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
              <div class="cc-sidebar-item-title">${m.title || m.titulo}</div>
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
    return `
      <div class="card cc-sidebar-card">
        <div class="card-header" style="padding-bottom:8px;">
          <h3 class="card-title" style="font-size:0.82rem;">Action Items por Pessoa</h3>
        </div>
        ${Object.entries(actionsByPerson).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([person, count]) => `
          <div class="cc-sidebar-item">
            <div class="cc-sidebar-item-title">${person}</div>
            <span class="tag">${count}</span>
          </div>
        `).join('')}
      </div>
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
        message: `${projectsNoMeeting.slice(0, 3).map(p => p.nome).join(', ')}${projectsNoMeeting.length > 3 ? '...' : ''} sem reuniao nas ultimas 2 semanas.`
      });
    }

    // 3. Overdue action items (from meetings older than 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const completed = JSON.parse(localStorage.getItem('tbo_completed_actions') || '[]');
    const overdueActions = actionItems.filter(ai => {
      const key = ai.task + '|' + ai.meeting;
      return !completed.includes(key) && new Date(ai.date) < weekAgo;
    });
    if (overdueActions.length > 0) {
      alerts.push({
        type: 'critical', icon: '\u{1F6A8}',
        title: `${overdueActions.length} Action Items com +7 dias`,
        message: `Itens pendentes de reunioes anteriores. Verifique: ${overdueActions.slice(0, 2).map(a => a.task).join(', ')}${overdueActions.length > 2 ? '...' : ''}`
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
    const variant = (typeof TBO_AUTH !== 'undefined') ? TBO_AUTH.getDashboardVariant() : 'full';
    if (variant === 'full') {
      this._bind('ccGenerateAlerts', () => this._generateAlerts());
      this._bind('ccBriefing', () => this._generateBriefing());
      this._initLeafletMap();
    }
  },

  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
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
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
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
