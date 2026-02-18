// TBO OS — Module: Timesheets
// Weekly time entry management with timer integration and manual entries
const TBO_TIMESHEETS = {
  _weekOffset: 0,

  _getTeamMembers() {
    if (typeof TBO_RH !== 'undefined' && TBO_RH._team) return TBO_RH._team;
    const ctx = TBO_STORAGE.get('context');
    return ctx.dados_comerciais?.['2026']?.fluxo_caixa?.despesas_detalhadas?.pessoas?.equipe?.map(e => e.nome) || [];
  },

  render() {
    if (typeof TBO_ERP !== 'undefined') TBO_ERP.init();
    if (typeof TBO_WORKLOAD === 'undefined') {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);">Modulo de workload nao disponivel.</div>';
    }

    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const userId = user?.id || '';

    // Calculate week dates based on offset
    const today = new Date();
    const offsetDate = new Date(today);
    offsetDate.setDate(offsetDate.getDate() + (this._weekOffset * 7));
    const weekStart = TBO_WORKLOAD.getWeekStart(offsetDate);
    const weekEnd = TBO_WORKLOAD.getWeekEnd(weekStart);
    const weekDays = TBO_WORKLOAD.getWeekDays(weekStart);

    // Get timesheet data
    const timesheet = TBO_WORKLOAD.getWeeklyTimesheet(userId, weekStart);
    const utilization = TBO_WORKLOAD.getWeeklyUtilization(userId, weekStart);
    const missingDays = TBO_WORKLOAD.getMissingDayAlerts(userId, weekStart);

    // All projects for dropdown
    const projects = TBO_STORAGE.getAllErpEntities('project').filter(p => !['finalizado','cancelado'].includes(p.status));

    // Running timer
    const runningTimer = TBO_WORKLOAD.getRunningTimer(userId);
    const timerDuration = runningTimer ? TBO_WORKLOAD.getRunningTimerDuration(userId) : 0;

    // Format dates
    const weekLabel = `${new Date(weekStart).toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit'})} - ${new Date(weekEnd).toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric'})}`;
    const isCurrentWeek = this._weekOffset === 0;

    return `
      <div class="timesheets-module">
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Horas da Semana</div>
            <div class="kpi-value">${TBO_WORKLOAD.formatHoursMinutes(timesheet.weekTotal)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Capacidade</div>
            <div class="kpi-value">${TBO_WORKLOAD.formatHoursMinutes(utilization.capacity_minutes)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Utilizacao</div>
            <div class="kpi-value" style="color:${utilization.utilization_pct > 100 ? '#ef4444' : utilization.utilization_pct > 80 ? '#f59e0b' : '#22c55e'};">${Math.round(utilization.utilization_pct)}%</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Dias Sem Registro</div>
            <div class="kpi-value" style="color:${missingDays.length > 0 ? '#f59e0b' : '#22c55e'};">${missingDays.length}</div>
          </div>
        </div>

        <!-- Timer Section -->
        ${runningTimer ? `
        <div class="card" style="padding:16px;margin-bottom:16px;border-left:4px solid #22c55e;background:var(--bg-secondary);">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:600;font-size:0.85rem;color:#22c55e;">Timer em andamento</div>
              <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">
                ${runningTimer.description || 'Sem descricao'} — ${TBO_WORKLOAD.formatHoursMinutes(timerDuration)}
              </div>
            </div>
            <button class="btn btn-sm" id="tsStopTimer" style="color:#ef4444;border-color:#ef4444;">Parar Timer</button>
          </div>
        </div>` : ''}

        <!-- Week Navigation -->
        <div class="card" style="padding:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
          <button class="btn btn-secondary btn-sm" id="tsPrevWeek" style="font-size:0.78rem;">&larr; Semana Anterior</button>
          <div style="text-align:center;">
            <div style="font-weight:600;font-size:0.88rem;">${weekLabel}</div>
            ${isCurrentWeek ? '<div style="font-size:0.7rem;color:var(--accent);">Semana atual</div>' : ''}
          </div>
          <div style="display:flex;gap:8px;">
            ${!isCurrentWeek ? '<button class="btn btn-secondary btn-sm" id="tsCurrentWeek" style="font-size:0.72rem;">Hoje</button>' : ''}
            <button class="btn btn-secondary btn-sm" id="tsNextWeek" style="font-size:0.78rem;">Proxima Semana &rarr;</button>
          </div>
        </div>

        <!-- Weekly Grid -->
        <div class="card" style="padding:16px;margin-bottom:16px;overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
            <thead>
              <tr style="border-bottom:2px solid var(--border-default);text-align:center;">
                <th style="padding:8px;text-align:left;min-width:160px;">Projeto</th>
                ${weekDays.map(day => {
                  const d = new Date(day);
                  const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.','');
                  const dayNum = d.getDate();
                  const isToday = day === TBO_WORKLOAD.getWeekStart(new Date()).replace(/(\d{4}-\d{2}-)(\d{2})/, (_, p, d2) => day);
                  return `<th style="padding:8px;min-width:60px;${day === new Date().toISOString().split('T')[0] ? 'background:var(--accent-subtle);border-radius:4px;' : ''}">${dayName}<br><span style="font-weight:400;font-size:0.7rem;">${dayNum}</span></th>`;
                }).join('')}
                <th style="padding:8px;min-width:70px;font-weight:700;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${timesheet.projects.length === 0 ? `
                <tr><td colspan="${weekDays.length + 2}" style="padding:24px;text-align:center;color:var(--text-muted);font-size:0.82rem;">Nenhum registro nesta semana.</td></tr>
              ` : timesheet.projects.map(p => `
                <tr style="border-bottom:1px solid var(--border-subtle);">
                  <td style="padding:8px;font-weight:600;">${p.project_name || p.project_id}</td>
                  ${weekDays.map(day => {
                    const mins = p.days[day] || 0;
                    return `<td style="padding:8px;text-align:center;${mins > 0 ? 'color:var(--text-primary);font-weight:500;' : 'color:var(--text-muted);'}">${mins > 0 ? TBO_WORKLOAD.formatHoursMinutes(mins) : '-'}</td>`;
                  }).join('')}
                  <td style="padding:8px;text-align:center;font-weight:700;">${TBO_WORKLOAD.formatHoursMinutes(p.total)}</td>
                </tr>
              `).join('')}
              <!-- Day totals row -->
              <tr style="border-top:2px solid var(--border-default);font-weight:700;">
                <td style="padding:8px;">Total</td>
                ${weekDays.map(day => {
                  const total = timesheet.dayTotals[day] || 0;
                  return `<td style="padding:8px;text-align:center;">${total > 0 ? TBO_WORKLOAD.formatHoursMinutes(total) : '-'}</td>`;
                }).join('')}
                <td style="padding:8px;text-align:center;color:var(--accent);">${TBO_WORKLOAD.formatHoursMinutes(timesheet.weekTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Actions -->
        <div style="display:flex;gap:12px;margin-bottom:16px;">
          <button class="btn btn-primary" id="tsAddManual" style="font-size:0.82rem;">+ Lancamento Manual</button>
          ${!runningTimer ? `<button class="btn btn-secondary" id="tsStartTimer" style="font-size:0.82rem;">Iniciar Timer</button>` : ''}
        </div>

        <!-- Recent Entries -->
        <div class="card" style="padding:16px;">
          <div style="font-weight:600;font-size:0.85rem;margin-bottom:12px;">Lancamentos da Semana</div>
          ${this._renderEntries(timesheet.entries)}
        </div>
      </div>
    `;
  },

  _renderEntries(entries) {
    if (!entries || entries.length === 0) {
      return '<div style="font-size:0.78rem;color:var(--text-muted);text-align:center;padding:16px;">Nenhum lancamento.</div>';
    }

    return `<div style="max-height:300px;overflow-y:auto;">
      ${entries.map(e => {
        const dateStr = e.date ? new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day:'2-digit', month:'2-digit' }) : '-';
        const proj = TBO_STORAGE.getErpEntity('project', e.project_id);
        const projName = proj ? proj.name : e.project_id || '-';
        const sourceIcon = e.source === 'timer' ? '&#9201;' : '&#9998;';

        return `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border-subtle);font-size:0.78rem;">
          <span style="min-width:90px;color:var(--text-secondary);">${dateStr}</span>
          <span style="min-width:120px;font-weight:600;">${projName}</span>
          <span style="flex:1;color:var(--text-secondary);">${e.description || '-'}</span>
          <span style="font-size:0.7rem;color:var(--text-muted);">${sourceIcon}</span>
          <span style="min-width:60px;text-align:right;font-weight:600;">${TBO_WORKLOAD.formatHoursMinutes(e.duration_minutes)}</span>
          <button class="btn btn-sm tsDeleteEntry" data-id="${e.id}" style="font-size:0.65rem;padding:1px 6px;color:var(--status-error);">x</button>
        </div>`;
      }).join('')}
    </div>`;
  },

  init() {
    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const userId = user?.id || '';

    // Week navigation
    const prevBtn = document.getElementById('tsPrevWeek');
    const nextBtn = document.getElementById('tsNextWeek');
    const currBtn = document.getElementById('tsCurrentWeek');
    if (prevBtn) prevBtn.addEventListener('click', () => { this._weekOffset--; this._refresh(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { this._weekOffset++; this._refresh(); });
    if (currBtn) currBtn.addEventListener('click', () => { this._weekOffset = 0; this._refresh(); });

    // Stop timer
    const stopBtn = document.getElementById('tsStopTimer');
    if (stopBtn) stopBtn.addEventListener('click', () => {
      const result = TBO_WORKLOAD.stopTimer(userId);
      if (result.ok) {
        TBO_TOAST.success('Timer parado', TBO_WORKLOAD.formatHoursMinutes(result.duration_minutes));
        this._refresh();
      }
    });

    // Start timer
    const startBtn = document.getElementById('tsStartTimer');
    if (startBtn) startBtn.addEventListener('click', () => this._showStartTimerModal(userId));

    // Add manual entry
    const addBtn = document.getElementById('tsAddManual');
    if (addBtn) addBtn.addEventListener('click', () => this._showManualEntryModal(userId));

    // Delete entries
    document.querySelectorAll('.tsDeleteEntry').forEach(btn => {
      btn.addEventListener('click', () => {
        const entryId = btn.dataset.id;
        TBO_UX.confirm('Remover lancamento', 'Deseja remover este lancamento de horas?', () => {
          const result = TBO_WORKLOAD.deleteEntry(entryId);
          if (result.ok) { TBO_TOAST.info('Removido', ''); this._refresh(); }
          else TBO_TOAST.error('Erro', result.error);
        }, { danger: true });
      });
    });
  },

  _showStartTimerModal(userId) {
    const projects = TBO_STORAGE.getAllErpEntities('project').filter(p => !['finalizado','cancelado'].includes(p.status));
    const html = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group">
          <label class="form-label">Projeto *</label>
          <select class="form-input" id="tsTimerProject">
            <option value="">Selecione...</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Descricao</label>
          <input type="text" class="form-input" id="tsTimerDesc" placeholder="O que voce esta fazendo?">
        </div>
        <button class="btn btn-primary" id="tsTimerStart" style="width:100%;">Iniciar Timer</button>
      </div>
    `;

    if (typeof TBO_MODAL !== 'undefined') {
      TBO_MODAL.show('Iniciar Timer', html);
      setTimeout(() => {
        const saveBtn = document.getElementById('tsTimerStart');
        if (saveBtn) saveBtn.addEventListener('click', () => {
          const projectId = document.getElementById('tsTimerProject')?.value;
          if (!projectId) { TBO_TOAST.error('Erro', 'Selecione um projeto.'); return; }
          const result = TBO_WORKLOAD.startTimer(userId, projectId, null, document.getElementById('tsTimerDesc')?.value || '');
          if (result.ok) {
            TBO_TOAST.success('Timer iniciado', '');
            TBO_MODAL.close();
            this._refresh();
          } else {
            TBO_TOAST.error('Erro', result.error);
          }
        });
      }, 100);
    }
  },

  _showManualEntryModal(userId) {
    const projects = TBO_STORAGE.getAllErpEntities('project').filter(p => !['finalizado','cancelado'].includes(p.status));
    const today = new Date().toISOString().split('T')[0];
    const html = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group">
          <label class="form-label">Projeto *</label>
          <select class="form-input" id="tsManualProject">
            <option value="">Selecione...</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label class="form-label">Data *</label>
            <input type="date" class="form-input" id="tsManualDate" value="${today}">
          </div>
          <div class="form-group">
            <label class="form-label">Duracao (horas) *</label>
            <input type="number" class="form-input" id="tsManualHours" min="0.25" step="0.25" placeholder="1.5">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Descricao</label>
          <input type="text" class="form-input" id="tsManualDesc" placeholder="O que foi feito?">
        </div>
        <button class="btn btn-primary" id="tsManualSave" style="width:100%;">Salvar Lancamento</button>
      </div>
    `;

    if (typeof TBO_MODAL !== 'undefined') {
      TBO_MODAL.show('Lancamento Manual', html);
      setTimeout(() => {
        const saveBtn = document.getElementById('tsManualSave');
        if (saveBtn) saveBtn.addEventListener('click', () => {
          const projectId = document.getElementById('tsManualProject')?.value;
          const date = document.getElementById('tsManualDate')?.value;
          const hours = parseFloat(document.getElementById('tsManualHours')?.value || 0);
          if (!projectId || !date || hours <= 0) {
            TBO_TOAST.error('Erro', 'Preencha projeto, data e duracao.');
            return;
          }
          const result = TBO_WORKLOAD.addManualEntry({
            project_id: projectId,
            date: date,
            duration_minutes: Math.round(hours * 60),
            description: document.getElementById('tsManualDesc')?.value || '',
            user_id: userId
          });
          if (result.ok) {
            TBO_TOAST.success('Lancamento salvo', TBO_WORKLOAD.formatHoursMinutes(result.entry.duration_minutes));
            TBO_MODAL.close();
            this._refresh();
          } else {
            TBO_TOAST.error('Erro', result.error);
          }
        });
      }, 100);
    }
  },

  _refresh() {
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
  },

  destroy() {
    this._weekOffset = 0;
  }
};
