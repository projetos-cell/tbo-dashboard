/**
 * TBO OS — Module: Relatorios (Relatórios Automatizados)
 *
 * Tasks #17-20:
 *   #17: Daily report for partners (8h00 BRT)
 *   #18: Weekly report for partners (Friday 8h00)
 *   #19: Monthly report for partners (last business day)
 *   #20: Weekly client report (Monday 8h00)
 *
 * Enhanced: Additional KPIs per report type + email simulation
 *
 * render() returns HTML string, init() binds events and loads data.
 */

const TBO_RELATORIOS = (() => {
  'use strict';

  // ── State ─────────────────────────────────────────────────────────
  let _schedules = [];
  let _latestRuns = {};   // { daily: run, weekly: run, monthly: run, client: run }
  let _selectedType = null;
  let _previewHtml = '';
  let _historyRuns = [];
  let _loading = false;

  // ── Helpers ────────────────────────────────────────────────────────
  function _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function _formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function _formatCurrency(val) {
    if (val == null || isNaN(val)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  }

  function _pctChange(current, previous) {
    if (!previous || previous === 0) return current > 0 ? '+100%' : '0%';
    const pct = ((current - previous) / Math.abs(previous) * 100).toFixed(1);
    return (pct > 0 ? '+' : '') + pct + '%';
  }

  function _pctChangeHtml(current, previous) {
    const txt = _pctChange(current, previous);
    const isPositive = txt.startsWith('+');
    const isNeutral = txt === '0%';
    const color = isNeutral ? '#94A3B8' : (isPositive ? '#22C55E' : '#EF4444');
    const icon = isNeutral ? 'minus' : (isPositive ? 'trending-up' : 'trending-down');
    return `<span class="report-kpi-change" style="color:${color};"><i data-lucide="${icon}" style="width:12px;height:12px;"></i> ${txt}</span>`;
  }

  const TYPE_META = {
    daily:   { label: 'Diário',  icon: 'calendar-clock', color: '#3B82F6', cronLabel: 'Seg-Sex, 8h00 BRT' },
    weekly:  { label: 'Semanal', icon: 'calendar-range', color: '#8B5CF6', cronLabel: 'Sexta-feira, 8h00 BRT' },
    monthly: { label: 'Mensal',  icon: 'calendar-check', color: '#F59E0B', cronLabel: 'Último dia útil, 8h00 BRT' },
    client:  { label: 'Cliente', icon: 'building-2',     color: '#22C55E', cronLabel: 'Segunda-feira, 8h00 BRT' }
  };

  // ── Data Fetchers ─────────────────────────────────────────────────

  async function _fetchFinanceData(periodDays = 1) {
    try {
      if (typeof FinanceRepo === 'undefined') return { revenue: 0, expenses: 0, balance: 0, transactions: [] };
      const to = new Date().toISOString().slice(0, 10);
      const from = new Date(Date.now() - periodDays * 86400000).toISOString().slice(0, 10);

      const transactions = await FinanceRepo.listTransactions({ from_date: from, to_date: to, limit: 500 });
      let revenue = 0, expenses = 0;
      (transactions || []).forEach(t => {
        if (t.type === 'receita' || t.type === 'income') revenue += Math.abs(t.amount || 0);
        if (t.type === 'despesa' || t.type === 'expense') expenses += Math.abs(t.amount || 0);
      });
      return { revenue, expenses, balance: revenue - expenses, transactions: transactions || [] };
    } catch (e) {
      console.warn('[Relatorios] Finance data error:', e.message);
      return { revenue: 0, expenses: 0, balance: 0, transactions: [] };
    }
  }

  async function _fetchTasksData(periodDays = 1) {
    try {
      if (typeof _db === 'undefined' && typeof RepoBase === 'undefined') return { completed: 0, created: 0, overdue: 0, total: 0 };
      const db = RepoBase.getDb();
      const tid = RepoBase.requireTenantId();
      const from = new Date(Date.now() - periodDays * 86400000).toISOString();

      const [completedRes, createdRes, overdueRes] = await Promise.allSettled([
        db.from('tasks').select('id', { count: 'exact', head: true }).eq('tenant_id', tid).eq('status', 'concluida').gte('updated_at', from),
        db.from('tasks').select('id', { count: 'exact', head: true }).eq('tenant_id', tid).gte('created_at', from),
        db.from('tasks').select('id', { count: 'exact', head: true }).eq('tenant_id', tid).eq('status', 'pendente').lt('due_date', new Date().toISOString())
      ]);

      return {
        completed: completedRes.status === 'fulfilled' ? (completedRes.value.count || 0) : 0,
        created: createdRes.status === 'fulfilled' ? (createdRes.value.count || 0) : 0,
        overdue: overdueRes.status === 'fulfilled' ? (overdueRes.value.count || 0) : 0
      };
    } catch (e) {
      console.warn('[Relatorios] Tasks data error:', e.message);
      return { completed: 0, created: 0, overdue: 0 };
    }
  }

  async function _fetchMeetingsData(periodDays = 1) {
    try {
      const db = RepoBase.getDb();
      const tid = RepoBase.requireTenantId();
      const from = new Date(Date.now() - periodDays * 86400000).toISOString();

      const { count, error } = await db.from('meetings')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tid)
        .gte('start_time', from);

      return { count: error ? 0 : (count || 0) };
    } catch (e) {
      console.warn('[Relatorios] Meetings data error:', e.message);
      return { count: 0 };
    }
  }

  async function _fetchProjectsData() {
    try {
      const db = RepoBase.getDb();
      const tid = RepoBase.requireTenantId();

      const { data, error } = await db.from('projects')
        .select('id, name, status, client_name, construtora, bus, health_score, updated_at, due_date_end')
        .eq('tenant_id', tid)
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      const projects = data || [];
      const active = projects.filter(p => p.status !== 'concluido' && p.status !== 'cancelado');
      const completed = projects.filter(p => p.status === 'concluido');
      const atRisk = active.filter(p => (p.health_score != null && p.health_score < 60));

      return { projects, active, completed, atRisk, total: projects.length };
    } catch (e) {
      console.warn('[Relatorios] Projects data error:', e.message);
      return { projects: [], active: [], completed: [], atRisk: [], total: 0 };
    }
  }

  async function _fetchDeliveriesData(periodDays = 1) {
    try {
      const db = RepoBase.getDb();
      const tid = RepoBase.requireTenantId();
      const from = new Date(Date.now() - periodDays * 86400000).toISOString();
      const today = new Date().toISOString().slice(0, 10);

      const [dueToday, recentRes] = await Promise.allSettled([
        db.from('client_deliveries').select('id', { count: 'exact', head: true })
          .eq('tenant_id', tid).eq('due_date', today),
        db.from('client_deliveries').select('id, status', { count: 'exact' })
          .eq('tenant_id', tid).gte('created_at', from)
      ]);

      const dueTodayCount = dueToday.status === 'fulfilled' ? (dueToday.value.count || 0) : 0;
      const recentData = recentRes.status === 'fulfilled' ? (recentRes.value.data || []) : [];
      const approved = recentData.filter(d => d.status === 'approved').length;
      const pending = recentData.filter(d => d.status === 'pending').length;
      const revision = recentData.filter(d => d.status === 'revision').length;

      return { dueToday: dueTodayCount, approved, pending, revision, total: recentData.length };
    } catch (e) {
      console.warn('[Relatorios] Deliveries data error:', e.message);
      return { dueToday: 0, approved: 0, pending: 0, revision: 0, total: 0 };
    }
  }

  async function _fetchPipelineData(periodDays = 7) {
    try {
      const ctx = typeof TBO_STORAGE !== 'undefined' ? TBO_STORAGE.get('context') : null;
      const deals = typeof TBO_STORAGE !== 'undefined' ? TBO_STORAGE.getCrmDeals?.() : null;
      const pipeline = deals || ctx?.pipeline || [];
      const now = Date.now();
      const from = now - periodDays * 86400000;

      // Count recent movement (deals updated in period)
      const recentMoves = pipeline.filter(d => {
        const updated = d.updated_at ? new Date(d.updated_at).getTime() : 0;
        return updated >= from;
      }).length;

      // Pipeline total value
      const totalValue = pipeline.reduce((sum, d) => sum + (d.value || d.amount || 0), 0);

      // Won vs lost
      const won = pipeline.filter(d => d.stage === 'ganho' || d.stage === 'won' || d.status === 'won');
      const lost = pipeline.filter(d => d.stage === 'perdido' || d.stage === 'lost' || d.status === 'lost');
      const open = pipeline.filter(d => d.stage !== 'ganho' && d.stage !== 'won' && d.stage !== 'perdido' && d.stage !== 'lost');

      return {
        total: pipeline.length,
        recentMoves,
        totalValue,
        wonCount: won.length,
        lostCount: lost.length,
        openCount: open.length,
        wonValue: won.reduce((s, d) => s + (d.value || d.amount || 0), 0)
      };
    } catch (e) {
      console.warn('[Relatorios] Pipeline data error:', e.message);
      return { total: 0, recentMoves: 0, totalValue: 0, wonCount: 0, lostCount: 0, openCount: 0, wonValue: 0 };
    }
  }

  // ── Report Generators ─────────────────────────────────────────────

  async function _generateDailyReport() {
    const now = new Date();
    const dateLabel = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    const [finance, tasks, meetings, projects, deliveries, pipeline] = await Promise.all([
      _fetchFinanceData(1),
      _fetchTasksData(1),
      _fetchMeetingsData(1),
      _fetchProjectsData(),
      _fetchDeliveriesData(1),
      _fetchPipelineData(1)
    ]);

    const content = {
      period: 'daily',
      date: now.toISOString(),
      dateLabel,
      finance, tasks, meetings, projects, deliveries, pipeline
    };

    const html = `
      <div class="report-preview">
        <div class="report-header" style="border-left:4px solid #3B82F6;">
          <div class="report-header-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#E85102"/><path d="M7 8h10M7 12h6M7 16h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
            <span style="font-size:11px;color:#6b7280;margin-left:8px;">TBO Operating System</span>
          </div>
          <h2>Relatório Diário</h2>
          <p class="report-date">${_esc(dateLabel)}</p>
        </div>

        <div class="report-section">
          <h3><i data-lucide="coins" style="width:16px;height:16px;"></i> Financeiro</h3>
          <div class="report-kpis">
            <div class="report-kpi">
              <span class="report-kpi-label">Receitas do dia</span>
              <span class="report-kpi-value" style="color:#22C55E">${_formatCurrency(finance.revenue)}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Despesas do dia</span>
              <span class="report-kpi-value" style="color:#EF4444">${_formatCurrency(finance.expenses)}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Saldo do dia</span>
              <span class="report-kpi-value" style="color:${finance.balance >= 0 ? '#22C55E' : '#EF4444'}">${_formatCurrency(finance.balance)}</span>
            </div>
          </div>
        </div>

        <div class="report-section">
          <h3><i data-lucide="list-checks" style="width:16px;height:16px;"></i> Produtividade</h3>
          <div class="report-kpis">
            <div class="report-kpi">
              <span class="report-kpi-label">Tarefas concluídas</span>
              <span class="report-kpi-value">${tasks.completed}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Tarefas criadas</span>
              <span class="report-kpi-value">${tasks.created}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Tarefas atrasadas</span>
              <span class="report-kpi-value" style="color:${tasks.overdue > 0 ? '#EF4444' : '#22C55E'}">${tasks.overdue}</span>
            </div>
          </div>
        </div>

        <div class="report-section">
          <h3><i data-lucide="calendar" style="width:16px;height:16px;"></i> Reuniões & Entregas</h3>
          <div class="report-kpis">
            <div class="report-kpi">
              <span class="report-kpi-label">Reuniões do dia</span>
              <span class="report-kpi-value">${meetings.count}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Entregas previstas hoje</span>
              <span class="report-kpi-value" style="color:#3B82F6">${deliveries.dueToday}</span>
            </div>
          </div>
        </div>

        ${projects.atRisk.length > 0 ? `
        <div class="report-section report-section--alert">
          <h3><i data-lucide="alert-triangle" style="width:16px;height:16px;"></i> Projetos em Risco</h3>
          <p>${projects.atRisk.length} projeto(s) com health score abaixo de 60:</p>
          <ul class="report-list">
            ${projects.atRisk.slice(0, 5).map(p => `<li><strong>${_esc(p.name)}</strong> — Score: ${p.health_score || 0}%</li>`).join('')}
          </ul>
        </div>` : ''}

        ${pipeline.recentMoves > 0 ? `
        <div class="report-section">
          <h3><i data-lucide="filter" style="width:16px;height:16px;"></i> Pipeline (24h)</h3>
          <div class="report-kpis">
            <div class="report-kpi">
              <span class="report-kpi-label">Deals movimentados</span>
              <span class="report-kpi-value">${pipeline.recentMoves}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Pipeline total</span>
              <span class="report-kpi-value">${_formatCurrency(pipeline.totalValue)}</span>
            </div>
          </div>
        </div>` : ''}

        ${tasks.overdue > 0 ? `
        <div class="report-section report-section--alert">
          <h3><i data-lucide="alert-circle" style="width:16px;height:16px;"></i> Atenção</h3>
          <p>${tasks.overdue} tarefa(s) atrasada(s) precisam de ação imediata.</p>
        </div>` : ''}

        <div class="report-footer">
          <p>Gerado automaticamente pelo TBO OS em ${_formatDate(now.toISOString())}</p>
          <p style="font-size:10px;color:#9ca3af;">Destinatários: ruy@agenciatbo.com.br, marco@agenciatbo.com.br</p>
        </div>
      </div>
    `;

    return { content, html };
  }

  async function _generateWeeklyReport() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const dateLabel = `${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

    const [finance, tasks, prevTasks, meetings, projects, deliveries, pipeline] = await Promise.all([
      _fetchFinanceData(7),
      _fetchTasksData(7),
      _fetchTasksData(14),
      _fetchMeetingsData(7),
      _fetchProjectsData(),
      _fetchDeliveriesData(7),
      _fetchPipelineData(7)
    ]);

    // Calculate previous week tasks (total 14 days - current 7 days)
    const prevWeekCompleted = Math.max(0, (prevTasks.completed || 0) - (tasks.completed || 0));
    const prevWeekCreated = Math.max(0, (prevTasks.created || 0) - (tasks.created || 0));

    // Burndown: tarefas criadas vs concluídas
    const burndownRatio = tasks.created > 0 ? ((tasks.completed / tasks.created) * 100).toFixed(0) : 100;

    // First-pass rate (approved / (approved + revision))
    const firstPassRate = deliveries.total > 0
      ? ((deliveries.approved / Math.max(1, deliveries.approved + deliveries.revision)) * 100).toFixed(0)
      : 0;

    const content = {
      period: 'weekly',
      date: now.toISOString(),
      dateLabel,
      finance, tasks, meetings, projects, deliveries, pipeline
    };

    const html = `
      <div class="report-preview">
        <div class="report-header" style="border-left:4px solid #8B5CF6;">
          <div class="report-header-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#E85102"/><path d="M7 8h10M7 12h6M7 16h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
            <span style="font-size:11px;color:#6b7280;margin-left:8px;">TBO Operating System</span>
          </div>
          <h2>Relatório Semanal</h2>
          <p class="report-date">Semana: ${_esc(dateLabel)}</p>
        </div>

        <div class="report-section">
          <h3><i data-lucide="coins" style="width:16px;height:16px;"></i> Financeiro da Semana</h3>
          <div class="report-kpis">
            <div class="report-kpi">
              <span class="report-kpi-label">Receitas</span>
              <span class="report-kpi-value" style="color:#22C55E">${_formatCurrency(finance.revenue)}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Despesas</span>
              <span class="report-kpi-value" style="color:#EF4444">${_formatCurrency(finance.expenses)}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Resultado</span>
              <span class="report-kpi-value" style="color:${finance.balance >= 0 ? '#22C55E' : '#EF4444'}">${_formatCurrency(finance.balance)}</span>
            </div>
          </div>
        </div>

        <div class="report-section">
          <h3><i data-lucide="list-checks" style="width:16px;height:16px;"></i> Produtividade</h3>
          <div class="report-kpis">
            <div class="report-kpi">
              <span class="report-kpi-label">Tarefas concluídas</span>
              <span class="report-kpi-value">${tasks.completed}</span>
              ${_pctChangeHtml(tasks.completed, prevWeekCompleted)}
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Tarefas criadas</span>
              <span class="report-kpi-value">${tasks.created}</span>
              ${_pctChangeHtml(tasks.created, prevWeekCreated)}
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Burndown rate</span>
              <span class="report-kpi-value" style="color:${burndownRatio >= 80 ? '#22C55E' : burndownRatio >= 50 ? '#F59E0B' : '#EF4444'}">${burndownRatio}%</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Tarefas atrasadas</span>
              <span class="report-kpi-value" style="color:${tasks.overdue > 0 ? '#EF4444' : '#22C55E'}">${tasks.overdue}</span>
            </div>
          </div>
        </div>

        <div class="report-section">
          <h3><i data-lucide="check-circle-2" style="width:16px;height:16px;"></i> Entregas & Aprovações</h3>
          <div class="report-kpis">
            <div class="report-kpi">
              <span class="report-kpi-label">Entregas da semana</span>
              <span class="report-kpi-value">${deliveries.total}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Aprovadas</span>
              <span class="report-kpi-value" style="color:#22C55E">${deliveries.approved}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Em revisão</span>
              <span class="report-kpi-value" style="color:#F59E0B">${deliveries.revision}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">First-pass rate</span>
              <span class="report-kpi-value" style="color:${firstPassRate >= 70 ? '#22C55E' : '#F59E0B'}">${firstPassRate}%</span>
            </div>
          </div>
        </div>

        <div class="report-section">
          <h3><i data-lucide="filter" style="width:16px;height:16px;"></i> Pipeline Comercial</h3>
          <div class="report-kpis">
            <div class="report-kpi">
              <span class="report-kpi-label">Deals em aberto</span>
              <span class="report-kpi-value">${pipeline.openCount}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Novos leads (7d)</span>
              <span class="report-kpi-value" style="color:#3B82F6">${pipeline.recentMoves}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Ganhos</span>
              <span class="report-kpi-value" style="color:#22C55E">${pipeline.wonCount}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Perdidos</span>
              <span class="report-kpi-value" style="color:#EF4444">${pipeline.lostCount}</span>
            </div>
          </div>
        </div>

        <div class="report-section">
          <h3><i data-lucide="folder-kanban" style="width:16px;height:16px;"></i> Projetos</h3>
          <div class="report-kpis">
            <div class="report-kpi">
              <span class="report-kpi-label">Projetos ativos</span>
              <span class="report-kpi-value">${projects.active.length}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Em risco</span>
              <span class="report-kpi-value" style="color:${projects.atRisk.length > 0 ? '#EF4444' : '#22C55E'}">${projects.atRisk.length}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Reuniões</span>
              <span class="report-kpi-value">${meetings.count}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Concluídos (total)</span>
              <span class="report-kpi-value" style="color:#22C55E">${projects.completed.length}</span>
            </div>
          </div>
        </div>

        <div class="report-section">
          <h3><i data-lucide="trophy" style="width:16px;height:16px;"></i> Conquistas da Semana</h3>
          <ul class="report-list">
            ${tasks.completed > 0 ? `<li>${tasks.completed} tarefa(s) concluída(s)</li>` : ''}
            ${deliveries.approved > 0 ? `<li>${deliveries.approved} entrega(s) aprovada(s)</li>` : ''}
            ${meetings.count > 0 ? `<li>${meetings.count} reunião(ões) realizada(s)</li>` : ''}
            ${finance.revenue > 0 ? `<li>Receitas de ${_formatCurrency(finance.revenue)}</li>` : ''}
            ${pipeline.wonCount > 0 ? `<li>${pipeline.wonCount} deal(s) ganho(s) — ${_formatCurrency(pipeline.wonValue)}</li>` : ''}
            ${tasks.completed === 0 && meetings.count === 0 && finance.revenue === 0 ? '<li>Nenhuma conquista registrada esta semana</li>' : ''}
          </ul>
        </div>

        <div class="report-footer">
          <p>Gerado automaticamente pelo TBO OS em ${_formatDate(now.toISOString())}</p>
          <p style="font-size:10px;color:#9ca3af;">Destinatários: ruy@agenciatbo.com.br, marco@agenciatbo.com.br</p>
        </div>
      </div>
    `;

    return { content, html };
  }

  async function _generateMonthlyReport() {
    const now = new Date();
    const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const [finance, tasks, meetings, projects, deliveries, pipeline] = await Promise.all([
      _fetchFinanceData(daysInMonth),
      _fetchTasksData(daysInMonth),
      _fetchMeetingsData(daysInMonth),
      _fetchProjectsData(),
      _fetchDeliveriesData(daysInMonth),
      _fetchPipelineData(daysInMonth)
    ]);

    // Runway calc
    const avgMonthlyExpenses = finance.expenses || 1;
    const estimatedRunway = finance.balance > 0 ? Math.round(finance.balance / avgMonthlyExpenses) : 0;

    // Win rate
    const totalDeals = (pipeline.wonCount || 0) + (pipeline.lostCount || 0);
    const winRate = totalDeals > 0 ? ((pipeline.wonCount / totalDeals) * 100).toFixed(0) : 0;

    // ROI by BU (estimated from projects)
    const buMap = {};
    projects.active.forEach(p => {
      const bus = Array.isArray(p.bus) ? p.bus : (p.bus ? [p.bus] : ['Sem BU']);
      bus.forEach(bu => {
        if (!buMap[bu]) buMap[bu] = { active: 0, completed: 0 };
        buMap[bu].active++;
      });
    });
    projects.completed.forEach(p => {
      const bus = Array.isArray(p.bus) ? p.bus : (p.bus ? [p.bus] : ['Sem BU']);
      bus.forEach(bu => {
        if (!buMap[bu]) buMap[bu] = { active: 0, completed: 0 };
        buMap[bu].completed++;
      });
    });

    // Revenue per client (simulated from projects)
    const clientRevMap = {};
    projects.active.forEach(p => {
      const client = p.client_name || p.construtora || 'Sem cliente';
      if (!clientRevMap[client]) clientRevMap[client] = 0;
      clientRevMap[client]++;
    });
    const topClients = Object.entries(clientRevMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const content = {
      period: 'monthly',
      date: now.toISOString(),
      monthLabel,
      finance, tasks, meetings, projects, deliveries, pipeline, buMap
    };

    const html = `
      <div class="report-preview">
        <div class="report-header" style="border-left:4px solid #F59E0B;">
          <div class="report-header-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#E85102"/><path d="M7 8h10M7 12h6M7 16h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
            <span style="font-size:11px;color:#6b7280;margin-left:8px;">TBO Operating System</span>
          </div>
          <h2>Relatório Mensal</h2>
          <p class="report-date">${_esc(monthLabel)}</p>
        </div>

        <div class="report-section">
          <h3><i data-lucide="coins" style="width:16px;height:16px;"></i> Resultado Financeiro</h3>
          <div class="report-kpis">
            <div class="report-kpi">
              <span class="report-kpi-label">Receita do mês</span>
              <span class="report-kpi-value" style="color:#22C55E">${_formatCurrency(finance.revenue)}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Despesas do mês</span>
              <span class="report-kpi-value" style="color:#EF4444">${_formatCurrency(finance.expenses)}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Resultado líquido</span>
              <span class="report-kpi-value" style="color:${finance.balance >= 0 ? '#22C55E' : '#EF4444'}">${_formatCurrency(finance.balance)}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Margem</span>
              <span class="report-kpi-value">${finance.revenue > 0 ? ((finance.balance / finance.revenue) * 100).toFixed(1) + '%' : '—'}</span>
            </div>
          </div>
        </div>

        <div class="report-section">
          <h3><i data-lucide="trending-up" style="width:16px;height:16px;"></i> Projeções & Pipeline</h3>
          <div class="report-kpis">
            <div class="report-kpi">
              <span class="report-kpi-label">Runway estimado</span>
              <span class="report-kpi-value" style="color:${estimatedRunway > 3 ? '#22C55E' : '#F59E0B'}">${estimatedRunway} ${estimatedRunway === 1 ? 'mês' : 'meses'}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Pipeline valor</span>
              <span class="report-kpi-value" style="color:#3B82F6">${_formatCurrency(pipeline.totalValue)}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Win Rate</span>
              <span class="report-kpi-value" style="color:${winRate >= 50 ? '#22C55E' : '#F59E0B'}">${winRate}%</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Deals ganhos</span>
              <span class="report-kpi-value" style="color:#22C55E">${_formatCurrency(pipeline.wonValue)}</span>
            </div>
          </div>
        </div>

        <div class="report-section">
          <h3><i data-lucide="activity" style="width:16px;height:16px;"></i> Operacional</h3>
          <div class="report-kpis">
            <div class="report-kpi">
              <span class="report-kpi-label">Tarefas concluídas</span>
              <span class="report-kpi-value">${tasks.completed}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Reuniões</span>
              <span class="report-kpi-value">${meetings.count}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Entregas aprovadas</span>
              <span class="report-kpi-value" style="color:#22C55E">${deliveries.approved}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Tarefas atrasadas</span>
              <span class="report-kpi-value" style="color:${tasks.overdue > 0 ? '#EF4444' : '#22C55E'}">${tasks.overdue}</span>
            </div>
          </div>
        </div>

        <div class="report-section">
          <h3><i data-lucide="bar-chart-3" style="width:16px;height:16px;"></i> Distribuição por BU</h3>
          ${Object.keys(buMap).length > 0 ? `
          <table class="report-table">
            <thead>
              <tr><th>Business Unit</th><th>Ativos</th><th>Concluídos</th></tr>
            </thead>
            <tbody>
              ${Object.entries(buMap).sort((a, b) => b[1].active - a[1].active).map(([bu, data]) => `
                <tr>
                  <td>${_esc(bu)}</td>
                  <td><strong>${data.active}</strong></td>
                  <td style="color:#22C55E">${data.completed}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>` : '<p style="color:var(--text-muted);">Nenhuma BU registrada.</p>'}
        </div>

        <div class="report-section">
          <h3><i data-lucide="building-2" style="width:16px;height:16px;"></i> Ranking de Clientes (por projetos)</h3>
          ${topClients.length > 0 ? `
          <table class="report-table">
            <thead>
              <tr><th>#</th><th>Cliente</th><th>Projetos Ativos</th></tr>
            </thead>
            <tbody>
              ${topClients.map(([client, count], i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${_esc(client)}</td>
                  <td><strong>${count}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>` : '<p style="color:var(--text-muted);">Nenhum cliente registrado.</p>'}
        </div>

        <div class="report-footer">
          <p>Gerado automaticamente pelo TBO OS em ${_formatDate(now.toISOString())}</p>
          <button class="btn btn-sm btn-ghost report-export-pdf-btn" data-action="export-pdf">
            <i data-lucide="download" style="width:14px;height:14px;"></i> Exportar PDF
          </button>
          <p style="font-size:10px;color:#9ca3af;">Destinatários: ruy@agenciatbo.com.br, marco@agenciatbo.com.br</p>
        </div>
      </div>
    `;

    return { content, html };
  }

  async function _generateClientReport() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const dateLabel = `${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

    const [projects, deliveries] = await Promise.all([
      _fetchProjectsData(),
      _fetchDeliveriesData(7)
    ]);

    // Group active projects by client
    const clientMap = {};
    projects.active.forEach(p => {
      const client = p.client_name || p.construtora || 'Sem cliente';
      if (!clientMap[client]) clientMap[client] = { projects: [], delivered: 0, pending: 0 };
      clientMap[client].projects.push(p);
    });

    // First-pass rate
    const firstPassRate = deliveries.total > 0
      ? ((deliveries.approved / Math.max(1, deliveries.approved + deliveries.revision)) * 100).toFixed(0)
      : 0;

    // Simulated NPS (based on project health scores)
    const healthScores = projects.active.filter(p => p.health_score != null).map(p => p.health_score);
    const avgHealth = healthScores.length > 0 ? (healthScores.reduce((a, b) => a + b, 0) / healthScores.length) : 75;
    const simulatedNPS = Math.min(100, Math.max(-100, Math.round((avgHealth - 50) * 2)));

    // Overdue projects (past due_date_end)
    const overdueProjects = projects.active.filter(p => {
      if (!p.due_date_end) return false;
      return new Date(p.due_date_end) < now;
    });

    const content = {
      period: 'client',
      date: now.toISOString(),
      dateLabel,
      clients: clientMap
    };

    const clientSections = Object.entries(clientMap)
      .sort((a, b) => b[1].projects.length - a[1].projects.length)
      .map(([client, data]) => `
      <div class="report-section">
        <h3>${_esc(client)} <span style="font-size:12px;color:#6b7280;font-weight:400;">(${data.projects.length} projeto${data.projects.length !== 1 ? 's' : ''})</span></h3>
        <table class="report-table">
          <thead>
            <tr><th>Projeto</th><th>Status</th><th>Health</th><th>Última atualização</th></tr>
          </thead>
          <tbody>
            ${data.projects.map(p => {
              const hs = p.health_score != null ? p.health_score : '—';
              const hsColor = hs === '—' ? '#94A3B8' : (hs >= 70 ? '#22C55E' : hs >= 40 ? '#F59E0B' : '#EF4444');
              return `
              <tr>
                <td>${_esc(p.name)}</td>
                <td><span class="report-status report-status--${_esc(p.status)}">${_esc(p.status)}</span></td>
                <td style="color:${hsColor};font-weight:600;">${hs === '—' ? hs : hs + '%'}</td>
                <td>${_formatDate(p.updated_at)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `).join('');

    const html = `
      <div class="report-preview">
        <div class="report-header" style="border-left:4px solid #22C55E;">
          <div class="report-header-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#E85102"/><path d="M7 8h10M7 12h6M7 16h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
            <span style="font-size:11px;color:#6b7280;margin-left:8px;">TBO Operating System</span>
          </div>
          <h2>Relatório Semanal — Clientes</h2>
          <p class="report-date">Semana: ${_esc(dateLabel)}</p>
        </div>

        <div class="report-section">
          <h3><i data-lucide="bar-chart-2" style="width:16px;height:16px;"></i> Resumo Geral</h3>
          <div class="report-kpis">
            <div class="report-kpi">
              <span class="report-kpi-label">Clientes ativos</span>
              <span class="report-kpi-value">${Object.keys(clientMap).length}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Projetos ativos</span>
              <span class="report-kpi-value">${projects.active.length}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">NPS estimado</span>
              <span class="report-kpi-value" style="color:${simulatedNPS >= 50 ? '#22C55E' : simulatedNPS >= 0 ? '#F59E0B' : '#EF4444'}">${simulatedNPS}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">First-pass rate</span>
              <span class="report-kpi-value" style="color:${firstPassRate >= 70 ? '#22C55E' : '#F59E0B'}">${firstPassRate}%</span>
            </div>
          </div>
        </div>

        ${overdueProjects.length > 0 ? `
        <div class="report-section report-section--alert">
          <h3><i data-lucide="clock" style="width:16px;height:16px;"></i> Projetos com Prazo Vencido (${overdueProjects.length})</h3>
          <ul class="report-list">
            ${overdueProjects.slice(0, 8).map(p => `
              <li><strong>${_esc(p.name)}</strong> — ${_esc(p.client_name || p.construtora || '')} — Prazo: ${_formatDate(p.due_date_end)}</li>
            `).join('')}
          </ul>
        </div>` : ''}

        <div class="report-section">
          <h3><i data-lucide="check-circle-2" style="width:16px;height:16px;"></i> Entregas da Semana</h3>
          <div class="report-kpis">
            <div class="report-kpi">
              <span class="report-kpi-label">Total entregas</span>
              <span class="report-kpi-value">${deliveries.total}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Aprovadas</span>
              <span class="report-kpi-value" style="color:#22C55E">${deliveries.approved}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Pendentes</span>
              <span class="report-kpi-value" style="color:#F59E0B">${deliveries.pending}</span>
            </div>
            <div class="report-kpi">
              <span class="report-kpi-label">Em revisão</span>
              <span class="report-kpi-value" style="color:#EF4444">${deliveries.revision}</span>
            </div>
          </div>
        </div>

        ${clientSections || '<div class="report-section"><p style="color:var(--text-muted);">Nenhum projeto ativo com clientes associados.</p></div>'}

        <div class="report-footer">
          <p>Gerado automaticamente pelo TBO OS em ${_formatDate(now.toISOString())}</p>
          <p style="font-size:10px;color:#9ca3af;">Destinatários: ruy@agenciatbo.com.br, marco@agenciatbo.com.br</p>
        </div>
      </div>
    `;

    return { content, html };
  }

  const GENERATORS = {
    daily: _generateDailyReport,
    weekly: _generateWeeklyReport,
    monthly: _generateMonthlyReport,
    client: _generateClientReport
  };

  // ── Public API ────────────────────────────────────────────────────

  return {

    render() {
      return `
        <div class="relatorios-module">
          <!-- Header -->
          <div class="relatorios-header">
            <div class="relatorios-header-left">
              <h1 class="relatorios-title">
                <i data-lucide="file-bar-chart" style="width:28px;height:28px;color:#8B5CF6;"></i>
                Relatórios Automatizados
              </h1>
              <p class="relatorios-subtitle">Acompanhe KPIs, gere relatórios e monitore o desempenho da operação.</p>
            </div>
          </div>

          <!-- Schedule Cards Grid -->
          <div class="relatorios-grid" id="relatoriosGrid">
            <div class="relatorios-loading" id="relatoriosLoading">
              <div class="loading-spinner"></div>
              <p>Carregando relatórios...</p>
            </div>
          </div>

          <!-- Preview + History Section -->
          <div class="relatorios-detail" id="relatoriosDetail" style="display:none;">
            <!-- Preview Panel -->
            <div class="relatorios-preview-panel">
              <div class="relatorios-preview-header">
                <h2 id="relatoriosPreviewTitle">Preview do Relatório</h2>
                <div class="relatorios-preview-actions">
                  <button class="btn btn-sm btn-ghost" id="relatoriosSendEmail" title="Simular envio por email" style="color:#E85102;">
                    <i data-lucide="mail" style="width:16px;height:16px;"></i> Enviar Email
                  </button>
                  <button class="btn btn-sm btn-ghost" id="relatoriosClosePreview" title="Fechar preview">
                    <i data-lucide="x" style="width:16px;height:16px;"></i>
                  </button>
                </div>
              </div>
              <div class="relatorios-preview-content" id="relatoriosPreviewContent">
                <!-- Generated report HTML goes here -->
              </div>
            </div>

            <!-- History Panel -->
            <div class="relatorios-history-panel">
              <h3 class="relatorios-history-title">Histórico de Execuções</h3>
              <div class="relatorios-history-list" id="relatoriosHistoryList">
                <!-- History items rendered here -->
              </div>
            </div>
          </div>

          <!-- Email Modal -->
          <div class="relatorios-email-modal" id="relatoriosEmailModal" style="display:none;">
            <div class="relatorios-email-modal-backdrop" data-close-modal></div>
            <div class="relatorios-email-modal-content">
              <div class="relatorios-email-modal-header">
                <h3><i data-lucide="mail" style="width:18px;height:18px;"></i> Enviar Relatório por Email</h3>
                <button class="btn btn-sm btn-ghost" data-close-modal><i data-lucide="x" style="width:16px;height:16px;"></i></button>
              </div>
              <div class="relatorios-email-modal-body">
                <div class="relatorios-email-field">
                  <label>De:</label>
                  <input type="text" id="emailFrom" value="contato@agenciatbo.com.br" readonly class="relatorios-email-input">
                </div>
                <div class="relatorios-email-field">
                  <label>Para:</label>
                  <input type="text" id="emailTo" value="ruy@agenciatbo.com.br, marco@agenciatbo.com.br" class="relatorios-email-input">
                </div>
                <div class="relatorios-email-field">
                  <label>Assunto:</label>
                  <input type="text" id="emailSubject" class="relatorios-email-input">
                </div>
                <div class="relatorios-email-preview-box" id="emailPreviewBox">
                  <!-- Mini preview of report HTML -->
                </div>
              </div>
              <div class="relatorios-email-modal-footer">
                <button class="btn btn-sm btn-ghost" data-close-modal>Cancelar</button>
                <button class="btn btn-sm btn-primary" id="emailConfirmSend" style="background:#E85102;border-color:#E85102;">
                  <i data-lucide="send" style="width:14px;height:14px;"></i> Criar Draft no Gmail
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    async init() {
      _loading = true;
      await this._loadData();
      this._renderGrid();
      this._bindEvents();
      _loading = false;

      if (window.lucide) lucide.createIcons();
    },

    // ── Data Loading ────────────────────────────────────────────

    async _loadData() {
      try {
        if (typeof ReportsRepo === 'undefined') {
          console.warn('[Relatorios] ReportsRepo not available');
          return;
        }

        // Seed defaults if first load
        _schedules = await ReportsRepo.seedDefaults().catch(() => []);
        if (!_schedules || _schedules.length === 0) {
          _schedules = await ReportsRepo.listSchedules();
        }

        // Fetch latest run for each type
        const types = ['daily', 'weekly', 'monthly', 'client'];
        const runPromises = types.map(t =>
          ReportsRepo.getLatestRunByType(t).catch(() => null)
        );
        const runs = await Promise.all(runPromises);
        types.forEach((t, i) => { _latestRuns[t] = runs[i]; });

      } catch (e) {
        console.warn('[Relatorios] Data load error:', e.message);
        _schedules = [];
        _latestRuns = {};
      }
    },

    // ── Grid Rendering ──────────────────────────────────────────

    _renderGrid() {
      const grid = document.getElementById('relatoriosGrid');
      if (!grid) return;

      const loading = document.getElementById('relatoriosLoading');
      if (loading) loading.style.display = 'none';

      const types = ['daily', 'weekly', 'monthly', 'client'];

      grid.innerHTML = types.map(type => {
        const meta = TYPE_META[type];
        const schedule = _schedules.find(s => s.type === type);
        const latestRun = _latestRuns[type];
        const enabled = schedule?.enabled !== false;

        let statusHtml = '';
        if (latestRun) {
          const statusColors = { success: '#22C55E', error: '#EF4444', running: '#F59E0B', pending: '#94A3B8' };
          const statusLabels = { success: 'Sucesso', error: 'Erro', running: 'Executando', pending: 'Pendente' };
          statusHtml = `
            <div class="relatorios-card-status">
              <span class="relatorios-status-dot" style="background:${statusColors[latestRun.status] || '#94A3B8'}"></span>
              <span>${statusLabels[latestRun.status] || latestRun.status}</span>
              <span class="relatorios-status-date">${_formatDate(latestRun.generated_at)}</span>
            </div>
          `;
        } else {
          statusHtml = '<div class="relatorios-card-status"><span style="color:var(--text-muted);font-size:0.8rem;">Nunca executado</span></div>';
        }

        return `
          <div class="relatorios-card ${!enabled ? 'relatorios-card--disabled' : ''}" data-type="${type}">
            <div class="relatorios-card-header">
              <div class="relatorios-card-icon" style="background:${meta.color}15;color:${meta.color};">
                <i data-lucide="${meta.icon}" style="width:24px;height:24px;"></i>
              </div>
              <div class="relatorios-card-toggle">
                <label class="relatorios-toggle" title="${enabled ? 'Desativar' : 'Ativar'} relatório">
                  <input type="checkbox" ${enabled ? 'checked' : ''} data-toggle-type="${type}">
                  <span class="relatorios-toggle-slider"></span>
                </label>
              </div>
            </div>
            <h3 class="relatorios-card-title">${meta.label}</h3>
            <p class="relatorios-card-desc">${_esc(schedule?.description || '')}</p>
            <div class="relatorios-card-cron">
              <i data-lucide="clock" style="width:12px;height:12px;"></i>
              <span>${meta.cronLabel}</span>
            </div>
            ${statusHtml}
            <div class="relatorios-card-actions">
              <button class="btn btn-sm btn-primary relatorios-generate-btn" data-generate="${type}">
                <i data-lucide="play" style="width:14px;height:14px;"></i>
                Gerar Agora
              </button>
              <button class="btn btn-sm btn-ghost relatorios-history-btn" data-history="${type}">
                <i data-lucide="history" style="width:14px;height:14px;"></i>
                Histórico
              </button>
            </div>
          </div>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons({ root: grid });
    },

    // ── Events ──────────────────────────────────────────────────

    _bindEvents() {
      const grid = document.getElementById('relatoriosGrid');
      const detail = document.getElementById('relatoriosDetail');
      const closeBtn = document.getElementById('relatoriosClosePreview');
      const sendEmailBtn = document.getElementById('relatoriosSendEmail');
      const emailModal = document.getElementById('relatoriosEmailModal');
      const emailConfirm = document.getElementById('emailConfirmSend');

      if (grid) {
        // Generate button
        grid.addEventListener('click', async (e) => {
          const genBtn = e.target.closest('.relatorios-generate-btn');
          if (genBtn) {
            e.stopPropagation();
            const type = genBtn.dataset.generate;
            await this._triggerGenerate(type, genBtn);
            return;
          }

          const histBtn = e.target.closest('.relatorios-history-btn');
          if (histBtn) {
            e.stopPropagation();
            const type = histBtn.dataset.history;
            await this._showHistory(type);
            return;
          }
        });

        // Toggle enable/disable
        grid.addEventListener('change', async (e) => {
          const toggle = e.target.closest('[data-toggle-type]');
          if (toggle) {
            const type = toggle.dataset.toggleType;
            const enabled = toggle.checked;
            await this._toggleSchedule(type, enabled);
          }
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          if (detail) detail.style.display = 'none';
          _selectedType = null;
          _previewHtml = '';
        });
      }

      // Export PDF from inside preview
      if (detail) {
        detail.addEventListener('click', (e) => {
          const pdfBtn = e.target.closest('.report-export-pdf-btn');
          if (pdfBtn) {
            this._exportPDF();
          }
        });
      }

      // Send email button
      if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', () => {
          this._showEmailModal();
        });
      }

      // Email modal close
      if (emailModal) {
        emailModal.querySelectorAll('[data-close-modal]').forEach(btn => {
          btn.addEventListener('click', () => {
            emailModal.style.display = 'none';
          });
        });
      }

      // Email confirm send
      if (emailConfirm) {
        emailConfirm.addEventListener('click', async () => {
          await this._sendEmailDraft();
        });
      }
    },

    async _triggerGenerate(type, btn) {
      const meta = TYPE_META[type];
      if (!meta) return;

      // Loading state
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<div class="loading-spinner" style="width:14px;height:14px;"></div> Gerando...';
      btn.disabled = true;

      try {
        const generator = GENERATORS[type];
        if (!generator) throw new Error('Generator not found for type: ' + type);

        // Generate report
        const { content, html } = await generator();

        // Save to DB
        const schedule = _schedules.find(s => s.type === type);
        let run = null;
        if (typeof ReportsRepo !== 'undefined') {
          run = await ReportsRepo.createRun({
            schedule_id: schedule?.id || null,
            type,
            status: 'success',
            generated_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            content,
            html_content: html,
            metadata: { manual: true, period: content.dateLabel || content.monthLabel || '' }
          });

          _latestRuns[type] = run;
        }

        // Show preview
        _selectedType = type;
        _previewHtml = html;
        this._showPreview(type, html);

        // Re-render grid to update status
        this._renderGrid();

        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.success('Relatório gerado', `${meta.label} gerado com sucesso.`);
        }
      } catch (e) {
        console.error('[Relatorios] Generate error:', e);

        // Save failed run
        try {
          if (typeof ReportsRepo !== 'undefined') {
            const schedule = _schedules.find(s => s.type === type);
            await ReportsRepo.createRun({
              schedule_id: schedule?.id || null,
              type,
              status: 'error',
              generated_at: new Date().toISOString(),
              error: e.message
            });
          }
        } catch (_) { /* ignore */ }

        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.error('Erro', `Falha ao gerar relatório: ${e.message}`);
        }
      } finally {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
        if (window.lucide) lucide.createIcons({ root: btn });
      }
    },

    _showPreview(type, html) {
      const detail = document.getElementById('relatoriosDetail');
      const title = document.getElementById('relatoriosPreviewTitle');
      const contentEl = document.getElementById('relatoriosPreviewContent');

      if (!detail || !contentEl) return;

      const meta = TYPE_META[type];
      if (title) title.textContent = `Preview: Relatório ${meta?.label || type}`;
      contentEl.innerHTML = html;

      detail.style.display = 'grid';

      if (window.lucide) lucide.createIcons({ root: contentEl });

      // Scroll to detail
      detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    async _showHistory(type) {
      const detail = document.getElementById('relatoriosDetail');
      const historyList = document.getElementById('relatoriosHistoryList');
      const title = document.getElementById('relatoriosPreviewTitle');
      const contentEl = document.getElementById('relatoriosPreviewContent');

      if (!detail || !historyList) return;

      const meta = TYPE_META[type];
      if (title) title.textContent = `Preview: Relatório ${meta?.label || type}`;

      _selectedType = type;

      // Load history
      try {
        if (typeof ReportsRepo !== 'undefined') {
          _historyRuns = await ReportsRepo.listRuns({ type, limit: 20 });
        } else {
          _historyRuns = [];
        }
      } catch (e) {
        _historyRuns = [];
      }

      // Render history list
      if (_historyRuns.length === 0) {
        historyList.innerHTML = '<p class="relatorios-history-empty">Nenhuma execução registrada.</p>';
      } else {
        historyList.innerHTML = _historyRuns.map(run => {
          const statusColors = { success: '#22C55E', error: '#EF4444', running: '#F59E0B', pending: '#94A3B8' };
          const statusLabels = { success: 'Sucesso', error: 'Erro', running: 'Executando', pending: 'Pendente' };
          return `
            <div class="relatorios-history-item ${run.html_content ? 'relatorios-history-item--clickable' : ''}" data-run-id="${run.id}">
              <div class="relatorios-history-item-header">
                <span class="relatorios-status-dot" style="background:${statusColors[run.status] || '#94A3B8'}"></span>
                <span class="relatorios-history-status">${statusLabels[run.status] || run.status}</span>
                <span class="relatorios-history-date">${_formatDate(run.generated_at)}</span>
              </div>
              ${run.error ? `<p class="relatorios-history-error">${_esc(run.error)}</p>` : ''}
              ${run.metadata?.period ? `<p class="relatorios-history-period">${_esc(run.metadata.period)}</p>` : ''}
            </div>
          `;
        }).join('');

        // Bind click to show content
        historyList.querySelectorAll('.relatorios-history-item--clickable').forEach(item => {
          item.addEventListener('click', () => {
            const runId = item.dataset.runId;
            const run = _historyRuns.find(r => r.id === runId);
            if (run?.html_content && contentEl) {
              contentEl.innerHTML = run.html_content;
              if (window.lucide) lucide.createIcons({ root: contentEl });
            }
          });
        });
      }

      // Show latest run content in preview (if exists)
      const latestWithContent = _historyRuns.find(r => r.html_content);
      if (latestWithContent && contentEl) {
        contentEl.innerHTML = latestWithContent.html_content;
      } else if (contentEl) {
        contentEl.innerHTML = '<div class="relatorios-preview-empty"><i data-lucide="file-x" style="width:48px;height:48px;color:var(--text-muted);"></i><p>Nenhum relatório gerado ainda. Clique em "Gerar Agora" para criar o primeiro.</p></div>';
      }

      detail.style.display = 'grid';
      if (window.lucide) lucide.createIcons({ root: detail });
      detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    async _toggleSchedule(type, enabled) {
      try {
        const schedule = _schedules.find(s => s.type === type);
        if (!schedule || typeof ReportsRepo === 'undefined') return;

        await ReportsRepo.updateSchedule(schedule.id, { enabled });
        schedule.enabled = enabled;

        const meta = TYPE_META[type];
        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.info(
            enabled ? 'Ativado' : 'Desativado',
            `Relatório ${meta?.label || type} ${enabled ? 'ativado' : 'desativado'}.`
          );
        }
      } catch (e) {
        console.error('[Relatorios] Toggle error:', e);
        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.error('Erro', 'Falha ao atualizar configuração: ' + e.message);
        }
      }
    },

    // ── Email Simulation ─────────────────────────────────────────

    _showEmailModal() {
      const modal = document.getElementById('relatoriosEmailModal');
      const previewBox = document.getElementById('emailPreviewBox');
      const subjectInput = document.getElementById('emailSubject');
      if (!modal) return;

      const meta = TYPE_META[_selectedType] || { label: 'Relatório' };
      const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

      if (subjectInput) {
        subjectInput.value = `[TBO OS] Relatório ${meta.label} — ${today}`;
      }

      if (previewBox && _previewHtml) {
        previewBox.innerHTML = `<div style="transform:scale(0.5);transform-origin:top left;width:200%;pointer-events:none;">${_previewHtml}</div>`;
      }

      modal.style.display = 'flex';
      if (window.lucide) lucide.createIcons({ root: modal });
    },

    async _sendEmailDraft() {
      const modal = document.getElementById('relatoriosEmailModal');
      const confirmBtn = document.getElementById('emailConfirmSend');
      const toInput = document.getElementById('emailTo');
      const subjectInput = document.getElementById('emailSubject');

      if (!confirmBtn || !_previewHtml) return;

      const originalHtml = confirmBtn.innerHTML;
      confirmBtn.innerHTML = '<div class="loading-spinner" style="width:14px;height:14px;"></div> Criando draft...';
      confirmBtn.disabled = true;

      try {
        const to = toInput?.value || 'ruy@agenciatbo.com.br, marco@agenciatbo.com.br';
        const subject = subjectInput?.value || `[TBO OS] Relatório — ${new Date().toLocaleDateString('pt-BR')}`;

        // Build HTML email body with inline styles
        const emailBody = `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:700px;margin:0 auto;padding:24px;color:#1a1a2e;">
            ${_previewHtml}
          </div>
        `;

        // Log the email simulation
        console.log('[Relatorios] Email draft simulation:', { to, subject, bodyLength: emailBody.length });

        // Save email log to report_runs metadata
        if (typeof ReportsRepo !== 'undefined' && _latestRuns[_selectedType]) {
          const run = _latestRuns[_selectedType];
          await ReportsRepo.updateRun(run.id, {
            metadata: {
              ...(run.metadata || {}),
              emailSent: true,
              emailTo: to,
              emailSubject: subject,
              emailSentAt: new Date().toISOString()
            }
          }).catch(() => {});
        }

        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.success(
            'Email simulado',
            `Draft criado para ${to.split(',').length} destinatário(s). Em produção, será enviado automaticamente via contato@agenciatbo.com.br.`
          );
        }

        if (modal) modal.style.display = 'none';

      } catch (e) {
        console.error('[Relatorios] Email send error:', e);
        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.error('Erro', 'Falha ao criar draft: ' + e.message);
        }
      } finally {
        confirmBtn.innerHTML = originalHtml;
        confirmBtn.disabled = false;
        if (window.lucide) lucide.createIcons({ root: confirmBtn });
      }
    },

    _exportPDF() {
      const previewContent = document.getElementById('relatoriosPreviewContent');
      if (!previewContent) return;

      if (typeof TBO_PDF_EXPORT !== 'undefined' && TBO_PDF_EXPORT.exportElement) {
        TBO_PDF_EXPORT.exportElement(previewContent, {
          filename: `relatorio-${_selectedType || 'mensal'}-${new Date().toISOString().slice(0, 10)}.pdf`,
          title: `Relatório ${TYPE_META[_selectedType]?.label || ''} — TBO`
        });
      } else {
        // Fallback: print
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <meta charset="UTF-8">
              <title>Relatório TBO</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a2e; max-width: 800px; margin: 0 auto; }
                h2, h3 { margin-top: 24px; }
                table { width: 100%; border-collapse: collapse; margin: 12px 0; }
                th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
                th { background: #f9fafb; font-weight: 600; }
                .report-kpis { display: flex; gap: 24px; flex-wrap: wrap; margin: 12px 0; }
                .report-kpi { flex: 1; min-width: 120px; }
                .report-kpi-label { display: block; font-size: 12px; color: #6b7280; }
                .report-kpi-value { display: block; font-size: 24px; font-weight: 700; }
                .report-kpi-change { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 600; }
                .report-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
                .report-export-pdf-btn { display: none; }
                .report-section--alert { background: #FEF2F2; border-left: 3px solid #EF4444; padding: 16px; border-radius: 8px; }
                .report-list { padding-left: 20px; }
                .report-list li { margin: 4px 0; }
                .report-header-logo { display: none; }
                @media print { body { padding: 20px; } }
              </style>
            </head>
            <body>${previewContent.innerHTML}</body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => printWindow.print(), 500);
        }
      }
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_RELATORIOS = TBO_RELATORIOS;
}
