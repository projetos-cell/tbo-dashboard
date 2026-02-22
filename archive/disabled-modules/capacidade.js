// TBO OS — Module: Capacidade (Capacity Config)
// UI for TBO_WORKLOAD capacity configuration: default hours, workdays, per-user overrides
const TBO_CAPACIDADE = {

  render() {
    const config = typeof TBO_WORKLOAD !== 'undefined' ? TBO_WORKLOAD.getCapacityConfig() : { defaults: { weekly_hours: 40, workdays: ['seg','ter','qua','qui','sex'] }, overrides: {} };
    const team = this._getTeam();
    const defaults = config.defaults || { weekly_hours: 40, workdays: ['seg','ter','qua','qui','sex'] };
    const overrides = config.overrides || {};
    const costOverrides = config.cost_overrides || {};
    const allDays = ['seg','ter','qua','qui','sex','sab','dom'];

    return `
      <div class="capacidade-module">
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Horas/Semana (Padrao)</div>
            <div class="kpi-value">${defaults.weekly_hours}h</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Dias Uteis</div>
            <div class="kpi-value">${(defaults.workdays || []).length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Membros do Time</div>
            <div class="kpi-value">${team.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Overrides Ativos</div>
            <div class="kpi-value">${Object.keys(overrides).length}</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="cap-defaults">Padrao</button>
          <button class="tab" data-tab="cap-overrides">Por Membro</button>
        </div>

        <!-- Tab: Defaults -->
        <div class="tab-content active" id="tab-cap-defaults">
          <div class="card">
            <h3 style="margin:0 0 16px;font-size:0.95rem;">Configuracao Padrao</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:500px;">
              <div class="form-group">
                <label class="form-label">Horas Semanais</label>
                <input type="number" class="form-input" id="capDefaultHours" value="${defaults.weekly_hours}" min="1" max="80" step="1">
              </div>
              <div class="form-group">
                <label class="form-label">Dias Uteis</label>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                  ${allDays.map(d => `
                    <label style="display:flex;align-items:center;gap:4px;font-size:0.78rem;cursor:pointer;">
                      <input type="checkbox" class="cap-day-check" value="${d}" ${(defaults.workdays || []).includes(d) ? 'checked' : ''}>
                      ${d.charAt(0).toUpperCase() + d.slice(1)}
                    </label>
                  `).join('')}
                </div>
              </div>
            </div>
            <button class="btn btn-primary" id="capSaveDefaults" style="margin-top:16px;">Salvar Padrao</button>
          </div>
        </div>

        <!-- Tab: Per-member overrides -->
        <div class="tab-content" id="tab-cap-overrides">
          <div class="card">
            <h3 style="margin:0 0 16px;font-size:0.95rem;">Horas por Membro</h3>
            <p style="font-size:0.78rem;color:var(--text-muted);margin:0 0 16px;">Defina horas semanais e custo/hora por membro. Deixe vazio para usar o padrao (${defaults.weekly_hours}h).</p>
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
                <thead>
                  <tr style="border-bottom:2px solid var(--border-default);">
                    <th style="text-align:left;padding:8px;">Membro</th>
                    <th style="text-align:left;padding:8px;">BU</th>
                    <th style="text-align:center;padding:8px;width:120px;">Horas/Sem</th>
                    <th style="text-align:center;padding:8px;width:120px;">Custo/Hora (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  ${team.map(m => {
                    const ovr = overrides[m.id] || {};
                    const cost = costOverrides[m.id] || '';
                    return `
                      <tr style="border-bottom:1px solid var(--border-subtle);" data-member="${m.id}">
                        <td style="padding:8px;font-weight:500;">${this._esc(m.name)}</td>
                        <td style="padding:8px;color:var(--text-secondary);">${m.bu || '—'}</td>
                        <td style="padding:8px;text-align:center;">
                          <input type="number" class="form-input cap-member-hours" data-member="${m.id}" value="${ovr.weekly_hours || ''}" placeholder="${defaults.weekly_hours}" min="1" max="80" style="width:80px;text-align:center;">
                        </td>
                        <td style="padding:8px;text-align:center;">
                          <input type="number" class="form-input cap-member-cost" data-member="${m.id}" value="${cost}" placeholder="auto" min="0" step="0.01" style="width:80px;text-align:center;">
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
            <button class="btn btn-primary" id="capSaveOverrides" style="margin-top:16px;">Salvar Overrides</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    // Tab switching
    document.querySelectorAll('.capacidade-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.capacidade-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.capacidade-module .tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) target.classList.add('active');
      });
    });

    // Save defaults
    document.getElementById('capSaveDefaults')?.addEventListener('click', () => this._saveDefaults());

    // Save overrides
    document.getElementById('capSaveOverrides')?.addEventListener('click', () => this._saveOverrides());
  },

  _saveDefaults() {
    const hours = parseInt(document.getElementById('capDefaultHours')?.value) || 40;
    const checkedDays = Array.from(document.querySelectorAll('.cap-day-check:checked')).map(cb => cb.value);

    if (typeof TBO_WORKLOAD === 'undefined') return;
    const config = TBO_WORKLOAD.getCapacityConfig();
    config.defaults = { weekly_hours: hours, workdays: checkedDays };
    TBO_WORKLOAD.saveCapacityConfig(config);

    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Salvo', `Padrao: ${hours}h/sem, ${checkedDays.length} dias.`);
  },

  _saveOverrides() {
    if (typeof TBO_WORKLOAD === 'undefined') return;
    const config = TBO_WORKLOAD.getCapacityConfig();
    config.overrides = config.overrides || {};
    config.cost_overrides = config.cost_overrides || {};

    document.querySelectorAll('.cap-member-hours').forEach(input => {
      const memberId = input.dataset.member;
      const val = parseInt(input.value);
      if (val && val > 0) {
        if (!config.overrides[memberId]) config.overrides[memberId] = {};
        config.overrides[memberId].weekly_hours = val;
      } else {
        delete config.overrides[memberId];
      }
    });

    document.querySelectorAll('.cap-member-cost').forEach(input => {
      const memberId = input.dataset.member;
      const val = parseFloat(input.value);
      if (val && val > 0) {
        config.cost_overrides[memberId] = val;
      } else {
        delete config.cost_overrides[memberId];
      }
    });

    TBO_WORKLOAD.saveCapacityConfig(config);
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Salvo', 'Overrides por membro atualizados.');
  },

  _getTeam() {
    if (typeof TBO_RH !== 'undefined' && TBO_RH._team) {
      return TBO_RH._team.filter(m => !m.terceirizado).map(m => ({
        id: m.id,
        name: m.nome || m.id,
        bu: m.bu || ''
      }));
    }
    if (typeof TBO_PERMISSIONS !== 'undefined') {
      return Object.entries(TBO_PERMISSIONS._userRoles).map(([id, info]) => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        bu: info.bu || ''
      }));
    }
    return [];
  },

  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
};
