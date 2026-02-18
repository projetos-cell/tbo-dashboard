// TBO OS — Workload Engine: Timer, Time Entries, Capacity, Cost, Forecast
// All data in localStorage. No backend required.
const TBO_WORKLOAD = {

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  _getTeamList() {
    if (typeof TBO_RH !== 'undefined' && TBO_RH._team) {
      return TBO_RH._team.filter(m => !m.terceirizado);
    }
    return [];
  },

  _getSalaryData() {
    const ctx = TBO_STORAGE.get('context');
    return ctx.dados_comerciais?.['2026']?.fluxo_caixa?.despesas_detalhadas?.pessoas?.equipe || [];
  },

  _getCurrentUserId() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u ? u.id : null;
    }
    return null;
  },

  _today() {
    return new Date().toISOString().split('T')[0];
  },

  getWeekStart(date) {
    const d = new Date(date || new Date());
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d);
    monday.setDate(diff);
    return monday.toISOString().split('T')[0];
  },

  getWeekEnd(weekStart) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 4); // Friday
    return d.toISOString().split('T')[0];
  },

  getWeekDays(weekStart) {
    const days = [];
    const d = new Date(weekStart);
    for (let i = 0; i < 5; i++) {
      days.push(new Date(d).toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }
    return days;
  },

  formatHoursMinutes(totalMinutes) {
    if (!totalMinutes || totalMinutes <= 0) return '0min';
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  },

  _isWorkday(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDay();
    return day >= 1 && day <= 5;
  },

  _dayLabel(dateStr) {
    const labels = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];
    return labels[new Date(dateStr).getDay()];
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMER — One running timer per user
  // ═══════════════════════════════════════════════════════════════════════════

  startTimer(userId, projectId, taskId, description, billable) {
    if (!userId || !projectId) return { ok: false, error: 'userId e projectId sao obrigatorios' };

    // Check for existing running timer
    const existing = this.getRunningTimer(userId);
    if (existing) return { ok: false, error: 'Ja existe um timer rodando. Pare-o antes de iniciar outro.' };

    // Validate project not finalized/cancelled
    const project = TBO_STORAGE.getErpEntity('project', projectId);
    if (project && ['finalizado','cancelado'].includes(project.status)) {
      const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      if (!user || user.role !== 'founder') {
        return { ok: false, error: 'Projeto finalizado/cancelado. Somente founders podem iniciar timer.' };
      }
    }

    // Validate task not completed (if task provided)
    if (taskId) {
      const task = TBO_STORAGE.getErpEntity('task', taskId);
      if (task && task.status === 'concluida') {
        const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
        if (!user || user.role !== 'founder') {
          return { ok: false, error: 'Tarefa ja concluida. Somente founders podem iniciar timer.' };
        }
      }
    }

    const timerData = {
      user_id: userId,
      task_id: taskId || null,
      project_id: projectId,
      started_at: new Date().toISOString(),
      description: description || '',
      billable: billable !== false
    };

    TBO_STORAGE.setRunningTimer(userId, timerData);

    // Audit log
    if (typeof TBO_ERP !== 'undefined') {
      TBO_ERP.addAuditLog({
        entityType: 'time_entry', entityId: 'timer',
        action: 'timer_started', userId: userId,
        entityName: project ? project.name : projectId,
        reason: taskId ? `Tarefa: ${taskId}` : 'Sem tarefa vinculada'
      });
    }

    // Update widget
    this._updateTimerWidget();
    return { ok: true, timer: timerData };
  },

  stopTimer(userId) {
    if (!userId) return { ok: false, error: 'userId obrigatorio' };

    const timer = this.getRunningTimer(userId);
    if (!timer) return { ok: false, error: 'Nenhum timer ativo' };

    const startedAt = new Date(timer.started_at);
    const now = new Date();
    const durationMs = now - startedAt;
    const durationMinutes = Math.max(1, Math.round(durationMs / 60000));

    // Create time entry
    const entry = TBO_STORAGE.addErpEntity('time_entry', {
      user_id: timer.user_id,
      task_id: timer.task_id,
      project_id: timer.project_id,
      date: timer.started_at.split('T')[0],
      start_time: startedAt.toTimeString().slice(0, 5),
      end_time: now.toTimeString().slice(0, 5),
      duration_minutes: durationMinutes,
      description: timer.description || '',
      billable: timer.billable !== false,
      source: 'timer'
    });

    // Remove timer
    TBO_STORAGE.setRunningTimer(userId, null);

    // Audit log
    if (typeof TBO_ERP !== 'undefined') {
      const project = TBO_STORAGE.getErpEntity('project', timer.project_id);
      TBO_ERP.addAuditLog({
        entityType: 'time_entry', entityId: entry ? entry.id : 'unknown',
        action: 'timer_stopped', userId: userId,
        entityName: project ? project.name : timer.project_id,
        reason: `Duracao: ${this.formatHoursMinutes(durationMinutes)}`
      });
    }

    // Update widget
    this._updateTimerWidget();
    return { ok: true, entry, duration_minutes: durationMinutes };
  },

  getRunningTimer(userId) {
    return TBO_STORAGE.getRunningTimer(userId);
  },

  getRunningTimerDuration(userId) {
    const timer = this.getRunningTimer(userId);
    if (!timer) return 0;
    return Math.round((Date.now() - new Date(timer.started_at).getTime()) / 60000);
  },

  isTimerRunning(userId) {
    return !!this.getRunningTimer(userId);
  },

  checkForgottenTimers() {
    const team = this._getTeamList();
    const alerts = [];
    team.forEach(m => {
      const timer = this.getRunningTimer(m.id);
      if (timer) {
        const minutes = Math.round((Date.now() - new Date(timer.started_at).getTime()) / 60000);
        if (minutes > 240) { // > 4 hours
          alerts.push({
            level: 'warning',
            icon: '\u23F1\uFE0F',
            userId: m.id,
            userName: m.nome,
            minutes,
            title: `Timer esquecido: ${m.nome} (${this.formatHoursMinutes(minutes)})`,
            action: 'Verificar se o timer deve ser parado'
          });
        }
      }
    });
    return alerts;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMER WIDGET — Global floating UI
  // ═══════════════════════════════════════════════════════════════════════════

  _timerInterval: null,

  initTimerWidget() {
    const userId = this._getCurrentUserId();
    if (!userId) return;

    // Bind stop button
    const stopBtn = document.getElementById('twStopBtn');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        const uid = this._getCurrentUserId();
        if (!uid) return;
        const result = this.stopTimer(uid);
        if (result.ok) {
          TBO_TOAST.success(`Timer parado: ${this.formatHoursMinutes(result.duration_minutes)}`);
        } else {
          TBO_TOAST.error(result.error);
        }
      });
    }

    // Start tick interval
    this._timerInterval = setInterval(() => this._updateTimerWidget(), 1000);
    this._updateTimerWidget();
  },

  _updateTimerWidget() {
    const widget = document.getElementById('timerWidget');
    if (!widget) return;

    const userId = this._getCurrentUserId();
    if (!userId) { widget.style.display = 'none'; return; }

    const timer = this.getRunningTimer(userId);
    if (!timer) {
      widget.style.display = 'none';
      widget.classList.remove('timer-pulse');
      return;
    }

    widget.style.display = 'flex';
    widget.classList.add('timer-pulse');

    // Update clock
    const elapsed = Math.round((Date.now() - new Date(timer.started_at).getTime()) / 1000);
    const hh = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    const clock = document.getElementById('twClock');
    if (clock) clock.textContent = `${hh}:${mm}:${ss}`;

    // Update project/task labels
    const projEl = document.getElementById('twProject');
    const taskEl = document.getElementById('twTask');
    if (projEl) {
      const project = TBO_STORAGE.getErpEntity('project', timer.project_id);
      projEl.textContent = project ? project.name : timer.project_id;
    }
    if (taskEl) {
      if (timer.task_id) {
        const task = TBO_STORAGE.getErpEntity('task', timer.task_id);
        taskEl.textContent = task ? task.title : '';
      } else {
        taskEl.textContent = timer.description || '';
      }
    }
  },

  destroyTimerWidget() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIME ENTRIES — CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  getTimeEntries(filters) {
    let entries = TBO_STORAGE.getAllErpEntities('time_entry');
    if (!filters) return entries;
    if (filters.userId) entries = entries.filter(e => e.user_id === filters.userId);
    if (filters.projectId) entries = entries.filter(e => e.project_id === filters.projectId);
    if (filters.taskId) entries = entries.filter(e => e.task_id === filters.taskId);
    if (filters.dateFrom) entries = entries.filter(e => e.date >= filters.dateFrom);
    if (filters.dateTo) entries = entries.filter(e => e.date <= filters.dateTo);
    if (filters.source) entries = entries.filter(e => e.source === filters.source);
    return entries.sort((a, b) => (a.date + (a.start_time || '')).localeCompare(b.date + (b.start_time || '')));
  },

  addManualEntry(data) {
    if (!data.project_id) return { ok: false, error: 'Projeto obrigatorio' };
    if (!data.duration_minutes || data.duration_minutes <= 0) return { ok: false, error: 'Duracao deve ser maior que 0' };
    if (!data.date) return { ok: false, error: 'Data obrigatoria' };
    if (data.date > this._today()) return { ok: false, error: 'Data nao pode ser futura' };

    const userId = data.user_id || this._getCurrentUserId();
    if (!userId) return { ok: false, error: 'Usuario nao identificado' };

    const entry = TBO_STORAGE.addErpEntity('time_entry', {
      user_id: userId,
      task_id: data.task_id || null,
      project_id: data.project_id,
      date: data.date,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      duration_minutes: Math.round(data.duration_minutes),
      description: data.description || '',
      billable: data.billable !== false,
      source: 'manual'
    });

    if (typeof TBO_ERP !== 'undefined') {
      const project = TBO_STORAGE.getErpEntity('project', data.project_id);
      TBO_ERP.addAuditLog({
        entityType: 'time_entry', entityId: entry ? entry.id : 'unknown',
        action: 'manual_entry', userId: userId,
        entityName: project ? project.name : data.project_id,
        reason: `${this.formatHoursMinutes(data.duration_minutes)} em ${data.date}`
      });
    }

    return { ok: true, entry };
  },

  updateEntry(entryId, updates) {
    const old = TBO_STORAGE.getErpEntity('time_entry', entryId);
    if (!old) return { ok: false, error: 'Entrada nao encontrada' };

    const updated = TBO_STORAGE.updateErpEntity('time_entry', entryId, updates);

    if (typeof TBO_ERP !== 'undefined') {
      TBO_ERP.addAuditLog({
        entityType: 'time_entry', entityId: entryId,
        action: 'entry_updated', userId: this._getCurrentUserId(),
        entityName: old.description || entryId,
        reason: updates.duration_minutes ? `Duracao: ${old.duration_minutes}min -> ${updates.duration_minutes}min` : 'Dados atualizados'
      });
    }

    return { ok: true, entry: updated };
  },

  deleteEntry(entryId) {
    const old = TBO_STORAGE.getErpEntity('time_entry', entryId);
    if (!old) return { ok: false, error: 'Entrada nao encontrada' };

    TBO_STORAGE.deleteErpEntity('time_entry', entryId);

    if (typeof TBO_ERP !== 'undefined') {
      TBO_ERP.addAuditLog({
        entityType: 'time_entry', entityId: entryId,
        action: 'entry_deleted', userId: this._getCurrentUserId(),
        entityName: old.description || entryId,
        reason: `${this.formatHoursMinutes(old.duration_minutes)} em ${old.date}`
      });
    }

    return { ok: true };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CAPACITY CONFIG
  // ═══════════════════════════════════════════════════════════════════════════

  _defaultCapacity: { weekly_hours: 40, workdays: ['seg','ter','qua','qui','sex'] },

  getCapacityConfig() {
    try {
      const raw = localStorage.getItem('tbo_erp_user_capacity');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return { defaults: { ...this._defaultCapacity }, overrides: {} };
  },

  saveCapacityConfig(config) {
    localStorage.setItem('tbo_erp_user_capacity', JSON.stringify(config));
    if (typeof TBO_ERP !== 'undefined') {
      TBO_ERP.addAuditLog({
        entityType: 'system', entityId: 'capacity',
        action: 'capacity_updated', userId: this._getCurrentUserId(),
        reason: 'Configuracao de capacidade atualizada'
      });
    }
  },

  getUserWeeklyHours(userId) {
    const config = this.getCapacityConfig();
    if (config.overrides && config.overrides[userId] && config.overrides[userId].weekly_hours) {
      return config.overrides[userId].weekly_hours;
    }
    return config.defaults?.weekly_hours || 40;
  },

  getUserWeeklyMinutes(userId) {
    return this.getUserWeeklyHours(userId) * 60;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  getWeeklyUtilization(userId, weekStart) {
    const ws = weekStart || this.getWeekStart();
    const we = this.getWeekEnd(ws);
    const capacityMinutes = this.getUserWeeklyMinutes(userId);

    // Tracked minutes (actual time entries)
    const entries = this.getTimeEntries({ userId, dateFrom: ws, dateTo: we });
    const trackedMinutes = entries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

    // Planned minutes (task estimates assigned to this user, due this week or active)
    const tasks = TBO_STORAGE.getAllErpEntities('task').filter(t =>
      t.owner === userId && t.status !== 'concluida' && t.status !== 'cancelada'
    );
    // Match by owner name too
    const team = this._getTeamList();
    const member = team.find(m => m.id === userId);
    const ownerName = member ? member.nome : userId;
    const tasksByName = TBO_STORAGE.getAllErpEntities('task').filter(t =>
      t.owner === ownerName && t.status !== 'concluida' && t.status !== 'cancelada'
    );
    const allTasks = [...new Map([...tasks, ...tasksByName].map(t => [t.id, t])).values()];
    const plannedMinutes = allTasks.reduce((sum, t) => sum + (t.estimate_minutes || 0), 0);

    const utilizationPct = capacityMinutes > 0 ? Math.round((trackedMinutes / capacityMinutes) * 100) : 0;
    const plannedPct = capacityMinutes > 0 ? Math.round((plannedMinutes / capacityMinutes) * 100) : 0;

    return {
      userId,
      userName: ownerName,
      planned_minutes: plannedMinutes,
      tracked_minutes: trackedMinutes,
      capacity_minutes: capacityMinutes,
      utilization_pct: utilizationPct,
      planned_pct: plannedPct,
      over_capacity: trackedMinutes > capacityMinutes * 1.1,
      over_planned: plannedMinutes > capacityMinutes * 1.1
    };
  },

  getTeamUtilization(weekStart) {
    const team = this._getTeamList();
    return team.map(m => this.getWeeklyUtilization(m.id, weekStart))
      .sort((a, b) => b.utilization_pct - a.utilization_pct);
  },

  isOverCapacity(userId, weekStart) {
    const u = this.getWeeklyUtilization(userId, weekStart);
    return u.over_capacity;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COST / MARGIN
  // ═══════════════════════════════════════════════════════════════════════════

  getUserHourlyRate(userId) {
    // Check override
    const config = this.getCapacityConfig();
    if (config.cost_overrides && config.cost_overrides[userId]) {
      return config.cost_overrides[userId];
    }

    // Derive from salary data
    const salaryData = this._getSalaryData();
    const team = this._getTeamList();
    const member = team.find(m => m.id === userId);
    if (!member) return 50; // fallback R$50/h

    const salaryEntry = salaryData.find(s =>
      s.nome.toLowerCase() === member.nome.toLowerCase() ||
      member.nome.toLowerCase().includes(s.nome.toLowerCase())
    );

    if (!salaryEntry || !salaryEntry.salario) return 50;

    const weeklyHours = this.getUserWeeklyHours(userId);
    // Custo total = salario * 1.7 (encargos) / (horas semanais * 4.33 semanas/mes)
    const hourlyRate = (salaryEntry.salario * 1.7) / (weeklyHours * 4.33);
    return Math.round(hourlyRate * 100) / 100;
  },

  getProjectTrackedCost(projectId) {
    const entries = this.getTimeEntries({ projectId });
    let totalCost = 0;
    entries.forEach(e => {
      const rate = this.getUserHourlyRate(e.user_id);
      totalCost += (e.duration_minutes / 60) * rate;
    });
    return Math.round(totalCost * 100) / 100;
  },

  getProjectTrackedHours(projectId) {
    const entries = this.getTimeEntries({ projectId });
    return entries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
  },

  getProjectCostMetrics(projectId) {
    const project = TBO_STORAGE.getErpEntity('project', projectId);
    if (!project) return null;

    const revenue = project.value || 0;
    const plannedCost = project.planned_cost || 0;
    const trackedCost = this.getProjectTrackedCost(projectId);
    const trackedMinutes = this.getProjectTrackedHours(projectId);

    // Task estimates for planned hours
    const tasks = TBO_STORAGE.getErpEntitiesByParent('task', projectId);
    const plannedMinutes = tasks.reduce((s, t) => s + (t.estimate_minutes || 0), 0);

    const varianceCost = trackedCost - plannedCost;
    const variancePct = plannedCost > 0 ? Math.round((varianceCost / plannedCost) * 100) : 0;
    const marginReal = revenue > 0 ? Math.round(((revenue - trackedCost) / revenue) * 100) : 0;
    const varianceMinutes = trackedMinutes - plannedMinutes;

    return {
      revenue,
      planned_cost: plannedCost,
      tracked_cost: trackedCost,
      variance_cost: varianceCost,
      variance_pct: variancePct,
      margin_real: marginReal,
      planned_minutes: plannedMinutes,
      tracked_minutes: trackedMinutes,
      variance_minutes: varianceMinutes,
      is_over_budget: plannedCost > 0 && trackedCost > plannedCost * 1.2
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORECAST
  // ═══════════════════════════════════════════════════════════════════════════

  getForecast(weeksAhead) {
    weeksAhead = weeksAhead || 8;
    const team = this._getTeamList();
    const today = new Date();
    const forecast = [];

    for (let w = 0; w < weeksAhead; w++) {
      const weekDate = new Date(today);
      weekDate.setDate(weekDate.getDate() + (w * 7));
      const ws = this.getWeekStart(weekDate);

      let totalCapacity = 0;
      let totalPlanned = 0;
      const overCapacity = [];

      team.forEach(m => {
        const cap = this.getUserWeeklyMinutes(m.id);
        totalCapacity += cap;

        // For current/past weeks, use tracked; for future, use planned
        if (ws <= this.getWeekStart()) {
          const util = this.getWeeklyUtilization(m.id, ws);
          totalPlanned += util.tracked_minutes;
          if (util.over_capacity) overCapacity.push(m.nome);
        } else {
          // Future: use task estimates for tasks due in that week range
          const we = this.getWeekEnd(ws);
          const tasks = TBO_STORAGE.getAllErpEntities('task').filter(t => {
            if (t.status === 'concluida' || t.status === 'cancelada') return false;
            const ownerMatch = t.owner === m.id || t.owner === m.nome;
            const dueDateMatch = t.due_date && t.due_date >= ws && t.due_date <= we;
            return ownerMatch && (dueDateMatch || !t.due_date);
          });
          const est = tasks.reduce((s, t) => s + (t.estimate_minutes || 0), 0);
          totalPlanned += est;
          if (est > cap * 1.1) overCapacity.push(m.nome);
        }
      });

      const gap = totalCapacity - totalPlanned;
      forecast.push({
        week_start: ws,
        week_label: `Sem ${ws.slice(5)}`,
        total_capacity: totalCapacity,
        total_planned: totalPlanned,
        gap,
        utilization_pct: totalCapacity > 0 ? Math.round((totalPlanned / totalCapacity) * 100) : 0,
        over_capacity_people: overCapacity,
        status: gap >= 0 ? 'ok' : 'warning'
      });
    }

    return forecast;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMESHEET
  // ═══════════════════════════════════════════════════════════════════════════

  getWeeklyTimesheet(userId, weekStart) {
    const ws = weekStart || this.getWeekStart();
    const we = this.getWeekEnd(ws);
    const days = this.getWeekDays(ws);
    const entries = this.getTimeEntries({ userId, dateFrom: ws, dateTo: we });

    // Group by project
    const projectMap = {};
    entries.forEach(e => {
      const pid = e.project_id || 'sem_projeto';
      if (!projectMap[pid]) {
        const project = TBO_STORAGE.getErpEntity('project', pid);
        projectMap[pid] = {
          project_id: pid,
          project_name: project ? project.name : 'Sem Projeto',
          days: {},
          total: 0
        };
      }
      if (!projectMap[pid].days[e.date]) projectMap[pid].days[e.date] = 0;
      projectMap[pid].days[e.date] += e.duration_minutes || 0;
      projectMap[pid].total += e.duration_minutes || 0;
    });

    // Day totals
    const dayTotals = {};
    let weekTotal = 0;
    days.forEach(d => {
      dayTotals[d] = entries.filter(e => e.date === d).reduce((s, e) => s + (e.duration_minutes || 0), 0);
      weekTotal += dayTotals[d];
    });

    // Missing days (workdays with 0 entries)
    const missingDays = days.filter(d => {
      return d <= this._today() && this._isWorkday(d) && dayTotals[d] === 0;
    });

    return {
      userId,
      weekStart: ws,
      weekEnd: we,
      days,
      projects: Object.values(projectMap),
      dayTotals,
      weekTotal,
      missingDays,
      entries
    };
  },

  getMissingDayAlerts(userId, weekStart) {
    const ts = this.getWeeklyTimesheet(userId, weekStart);
    return ts.missingDays.map(d => ({
      date: d,
      dayLabel: this._dayLabel(d),
      message: `Sem apontamento em ${this._dayLabel(d)} ${d.slice(8)}`
    }));
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GANTT DATA BUILDER
  // ═══════════════════════════════════════════════════════════════════════════

  getGanttData(viewStart, viewEnd) {
    const projects = TBO_STORAGE.getAllErpEntities('project')
      .filter(p => !['cancelado'].includes(p.status));
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.project : null;
    const taskSm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;

    const rows = [];

    projects.forEach(p => {
      // Project bar dates
      const pStart = p.start_date || p.createdAt?.split('T')[0] || this._today();
      let pEnd = p.end_date;
      if (!pEnd) {
        // Derive from tasks or use createdAt + 30 days
        const tasks = TBO_STORAGE.getErpEntitiesByParent('task', p.id);
        const taskDates = tasks.map(t => t.due_date).filter(Boolean);
        if (taskDates.length > 0) {
          pEnd = taskDates.sort().pop();
        } else {
          const endDate = new Date(pStart);
          endDate.setDate(endDate.getDate() + 30);
          pEnd = endDate.toISOString().split('T')[0];
        }
      }

      const pColor = sm ? sm.colors[p.status] || '#3b82f6' : '#3b82f6';
      rows.push({
        type: 'project',
        id: p.id,
        name: p.name,
        status: p.status,
        startDate: pStart,
        endDate: pEnd,
        color: pColor,
        health: typeof TBO_ERP !== 'undefined' ? TBO_ERP.calculateHealthScore(p).score : 100,
        owner: p.owner || '',
        expanded: true
      });

      // Task bars
      const tasks = TBO_STORAGE.getErpEntitiesByParent('task', p.id);
      tasks.forEach(t => {
        if (t.status === 'cancelada') return;
        const tStart = t.start_date || t.createdAt?.split('T')[0] || pStart;
        let tEnd = t.due_date;
        if (!tEnd) {
          const endDate = new Date(tStart);
          endDate.setDate(endDate.getDate() + 7);
          tEnd = endDate.toISOString().split('T')[0];
        }
        const tColor = taskSm ? taskSm.colors[t.status] || '#94a3b8' : '#94a3b8';
        rows.push({
          type: 'task',
          id: t.id,
          parentId: p.id,
          name: t.title || t.name,
          status: t.status,
          startDate: tStart,
          endDate: tEnd,
          color: tColor,
          owner: t.owner || '',
          estimateMinutes: t.estimate_minutes || 0
        });
      });
    });

    return rows;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKLOAD ALERTS (called by erp-core.js)
  // ═══════════════════════════════════════════════════════════════════════════

  generateWorkloadAlerts() {
    const alerts = [];

    // 1. Forgotten timers
    alerts.push(...this.checkForgottenTimers());

    // 2. Missing timesheet yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    if (this._isWorkday(yStr)) {
      const team = this._getTeamList();
      team.forEach(m => {
        const entries = this.getTimeEntries({ userId: m.id, dateFrom: yStr, dateTo: yStr });
        if (entries.length === 0) {
          alerts.push({
            level: 'info',
            icon: '\uD83D\uDCC5',
            title: `Sem apontamento ontem: ${m.nome}`,
            action: 'Solicitar lancamento retroativo',
            userId: m.id
          });
        }
      });
    }

    // 3. Projects over budget
    const projects = TBO_STORAGE.getAllErpEntities('project')
      .filter(p => !['finalizado','cancelado'].includes(p.status));
    projects.forEach(p => {
      if (!p.planned_cost || p.planned_cost <= 0) return;
      const metrics = this.getProjectCostMetrics(p.id);
      if (metrics && metrics.is_over_budget) {
        alerts.push({
          level: 'critical',
          icon: '\uD83D\uDCB8',
          title: `Projeto estourando orcamento: ${p.name}`,
          action: `Custo real ${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.currency(metrics.tracked_cost) : metrics.tracked_cost} vs planejado ${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.currency(metrics.planned_cost) : metrics.planned_cost}`,
          entityId: p.id
        });
      }
    });

    // 4. Team over capacity
    const weekStart = this.getWeekStart();
    this._getTeamList().forEach(m => {
      const util = this.getWeeklyUtilization(m.id, weekStart);
      if (util.over_capacity) {
        alerts.push({
          level: 'warning',
          icon: '\u26A1',
          title: `${m.nome} acima da capacidade (${util.utilization_pct}%)`,
          action: `${this.formatHoursMinutes(util.tracked_minutes)} de ${this.formatHoursMinutes(util.capacity_minutes)}`,
          userId: m.id
        });
      }
    });

    return alerts;
  }
};
