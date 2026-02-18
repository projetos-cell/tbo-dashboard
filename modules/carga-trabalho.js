// TBO OS — Module: Carga de Trabalho
// Team workload visualization, capacity vs utilization, forecast
const TBO_CARGA_TRABALHO = {

  render() {
    if (typeof TBO_WORKLOAD === 'undefined') {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);">Modulo de workload nao disponivel.</div>';
    }

    // Team utilization
    const teamUtil = TBO_WORKLOAD.getTeamUtilization();
    const avgUtil = teamUtil.length > 0 ? Math.round(teamUtil.reduce((s, u) => s + u.utilization_pct, 0) / teamUtil.length) : 0;
    const overCapacity = teamUtil.filter(u => u.over_capacity).length;
    const underUtilized = teamUtil.filter(u => u.utilization_pct < 50).length;

    // Forecast
    const forecast = TBO_WORKLOAD.getForecast(8);

    // Alerts
    const alerts = TBO_WORKLOAD.generateWorkloadAlerts ? TBO_WORKLOAD.generateWorkloadAlerts() : [];

    return `
      <div class="carga-trabalho-module">
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Utilizacao Media</div>
            <div class="kpi-value" style="color:${avgUtil > 100 ? '#ef4444' : avgUtil > 80 ? '#f59e0b' : '#22c55e'};">${avgUtil}%</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Sobre-alocados</div>
            <div class="kpi-value" style="color:${overCapacity > 0 ? '#ef4444' : '#22c55e'};">${overCapacity}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Sub-utilizados</div>
            <div class="kpi-value" style="color:${underUtilized > 0 ? '#f59e0b' : '#22c55e'};">${underUtilized}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Time Ativo</div>
            <div class="kpi-value">${teamUtil.length}</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="cw-team">Time</button>
          <button class="tab" data-tab="cw-forecast">Forecast (8 sem)</button>
          <button class="tab" data-tab="cw-alerts">Alertas (${alerts.length})</button>
        </div>

        <!-- Tab: Team Utilization -->
        <div class="tab-content active" id="tab-cw-team">
          ${this._renderTeamUtilization(teamUtil)}
        </div>

        <!-- Tab: Forecast -->
        <div class="tab-content" id="tab-cw-forecast" style="display:none;">
          ${this._renderForecast(forecast)}
        </div>

        <!-- Tab: Alerts -->
        <div class="tab-content" id="tab-cw-alerts" style="display:none;">
          ${this._renderAlerts(alerts)}
        </div>
      </div>
    `;
  },

  _renderTeamUtilization(teamUtil) {
    if (teamUtil.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Sem dados de utilizacao disponveis.</div>';
    }

    return `<div style="display:flex;flex-direction:column;gap:12px;">
      ${teamUtil.map(u => {
        const pct = Math.min(u.utilization_pct, 150);
        const color = u.over_capacity ? '#ef4444' : u.utilization_pct > 80 ? '#f59e0b' : '#22c55e';
        const barWidth = Math.min(100, pct);

        return `<div class="card" style="padding:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div>
              <span style="font-weight:600;font-size:0.88rem;">${u.userName || u.userId}</span>
              ${u.over_capacity ? '<span class="tag" style="background:#ef444420;color:#ef4444;font-size:0.65rem;margin-left:8px;">SOBRE-ALOCADO</span>' : ''}
            </div>
            <div style="text-align:right;">
              <span style="font-weight:700;font-size:0.9rem;color:${color};">${Math.round(u.utilization_pct)}%</span>
            </div>
          </div>
          <div style="background:var(--bg-tertiary);border-radius:4px;height:20px;overflow:hidden;position:relative;">
            <div style="background:${color};height:100%;width:${barWidth}%;border-radius:4px;transition:width 0.3s;"></div>
            ${u.utilization_pct > 100 ? `<div style="position:absolute;left:66.6%;top:0;bottom:0;width:1px;background:var(--text-muted);opacity:0.5;"></div>` : ''}
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:0.72rem;color:var(--text-muted);">
            <span>Registrado: ${TBO_WORKLOAD.formatHoursMinutes(u.tracked_minutes)}</span>
            <span>Planejado: ${TBO_WORKLOAD.formatHoursMinutes(u.planned_minutes)}</span>
            <span>Capacidade: ${TBO_WORKLOAD.formatHoursMinutes(u.capacity_minutes)}</span>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },

  _renderForecast(forecast) {
    if (!forecast || forecast.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Sem dados de forecast.</div>';
    }

    return `<div class="card" style="padding:16px;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-default);text-align:center;">
            <th style="padding:10px 8px;text-align:left;">Semana</th>
            <th style="padding:10px 8px;">Capacidade</th>
            <th style="padding:10px 8px;">Planejado</th>
            <th style="padding:10px 8px;">Gap</th>
            <th style="padding:10px 8px;">Utilizacao</th>
            <th style="padding:10px 8px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${forecast.map(w => {
            const statusColor = w.status === 'warning' ? '#ef4444' : '#22c55e';
            const gapColor = w.gap < 0 ? '#ef4444' : '#22c55e';
            return `<tr style="border-bottom:1px solid var(--border-subtle);text-align:center;">
              <td style="padding:10px 8px;text-align:left;font-weight:600;">${w.week_label}</td>
              <td style="padding:10px 8px;">${TBO_WORKLOAD.formatHoursMinutes(w.total_capacity)}</td>
              <td style="padding:10px 8px;">${TBO_WORKLOAD.formatHoursMinutes(w.total_planned)}</td>
              <td style="padding:10px 8px;color:${gapColor};font-weight:600;">${w.gap > 0 ? '+' : ''}${TBO_WORKLOAD.formatHoursMinutes(Math.abs(w.gap))}</td>
              <td style="padding:10px 8px;">
                <span style="font-weight:600;color:${w.utilization_pct > 100 ? '#ef4444' : w.utilization_pct > 80 ? '#f59e0b' : '#22c55e'};">${Math.round(w.utilization_pct)}%</span>
              </td>
              <td style="padding:10px 8px;">
                <span class="tag" style="background:${statusColor}20;color:${statusColor};font-size:0.7rem;">${w.status === 'warning' ? 'Risco' : 'OK'}</span>
                ${w.over_capacity_people && w.over_capacity_people.length > 0 ? `<div style="font-size:0.65rem;color:var(--text-muted);margin-top:2px;">${w.over_capacity_people.join(', ')}</div>` : ''}
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  },

  _renderAlerts(alerts) {
    if (alerts.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Nenhum alerta de carga de trabalho.</div>';
    }

    const levelColors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };

    return `<div style="display:flex;flex-direction:column;gap:8px;">
      ${alerts.map(a => {
        const color = levelColors[a.level] || '#888';
        return `<div class="card" style="padding:12px;border-left:4px solid ${color};">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="tag" style="background:${color}20;color:${color};font-size:0.65rem;text-transform:uppercase;">${a.level}</span>
            <span style="font-size:0.82rem;font-weight:600;">${a.title || ''}</span>
          </div>
          ${a.action ? `<div style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;">${a.action}</div>` : ''}
        </div>`;
      }).join('')}
    </div>`;
  },

  init() {
    // Tab switching
    document.querySelectorAll('.carga-trabalho-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.carga-trabalho-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.carga-trabalho-module .tab-content').forEach(tc => { tc.style.display = 'none'; tc.classList.remove('active'); });
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) { target.style.display = ''; target.classList.add('active'); }
      });
    });
  },

  destroy() {}
};
