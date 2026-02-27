// ============================================================================
// TBO OS — OKRs: Tab Dashboard (v2.0 — Qulture-Inspired)
// KPI cards, ring progress, grafico, OKRs em risco, distribuicao
// ============================================================================

const TBO_OKRS_DASHBOARD = {

  _portal: null,
  _kpis: null,
  _chartInstance: null,

  setup(portal) {
    this._portal = portal;
  },

  render() {
    const p = this._portal;
    const kpis = this._kpis || {};
    const objs = p ? p.getFilteredObjectives() : [];

    const totalObjs = kpis.totalObjectives || 0;
    const avgProgress = kpis.avgProgress || 0;
    const atRisk = (kpis.atRiskCount || 0) + (kpis.behindCount || 0);
    const onTrack = kpis.onTrackCount || 0;
    const totalKRs = kpis.totalKRs || 0;

    // Distribution by level
    const allObjs = p ? p._objectives.filter(o => o.status === 'active') : [];
    const companyCount = allObjs.filter(o => o.level === 'company').length;
    const buCount = allObjs.filter(o => o.level === 'bu').length;
    const personalCount = allObjs.filter(o => o.level === 'personal').length;

    // OKRs em risco (top 5)
    const riskyObjs = allObjs
      .filter(o => {
        const krs = o.okr_key_results || [];
        return krs.some(k => k.confidence === 'at_risk' || k.confidence === 'behind');
      })
      .sort((a, b) => Number(a.progress || 0) - Number(b.progress || 0))
      .slice(0, 5);

    // Empty state
    if (totalObjs === 0 && !p?._loading) {
      return `
        <div class="okr-empty-state">
          <div class="okr-empty-icon" style="background:var(--accent-gold-dim);">
            <i data-lucide="target" style="width:28px;height:28px;color:var(--brand-orange);"></i>
          </div>
          <h3>Nenhum OKR neste ciclo</h3>
          <p>Crie objetivos e key results para comecar a acompanhar o progresso da sua equipe.</p>
          <button class="okr-btn-new okr-dash-new-btn" style="margin-top:16px;">
            <i data-lucide="plus" style="width:14px;height:14px;"></i>
            <span>Criar primeiro OKR</span>
          </button>
        </div>
      `;
    }

    return `
      <!-- KPI Summary Cards -->
      <div class="okr-dash-kpis">
        <!-- Progress Ring Card -->
        <div class="okr-card okr-dash-ring-card">
          <div class="okr-dash-ring-wrapper">
            <svg class="okr-dash-ring" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-tertiary)" stroke-width="8"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="${this._progressColor(avgProgress)}"
                      stroke-width="8" stroke-linecap="round"
                      stroke-dasharray="${Math.PI * 100}"
                      stroke-dashoffset="${Math.PI * 100 * (1 - Math.min(avgProgress, 100) / 100)}"
                      transform="rotate(-90 60 60)"
                      class="okr-ring-animated"/>
            </svg>
            <div class="okr-dash-ring-label">
              <span class="okr-dash-ring-pct okr-kpi-num" data-target="${avgProgress}">${avgProgress.toFixed(0)}<small>%</small></span>
              <span class="okr-dash-ring-sub">progresso medio</span>
            </div>
          </div>
          <div class="okr-dash-ring-meta">
            <div class="okr-dash-ring-row">
              <span class="okr-dash-dot" style="background:#16a34a;"></span>
              <span>On Track</span>
              <strong>${onTrack}</strong>
            </div>
            <div class="okr-dash-ring-row">
              <span class="okr-dash-dot" style="background:#d97706;"></span>
              <span>Em Risco</span>
              <strong>${kpis.atRiskCount || 0}</strong>
            </div>
            <div class="okr-dash-ring-row">
              <span class="okr-dash-dot" style="background:#dc2626;"></span>
              <span>Atrasado</span>
              <strong>${kpis.behindCount || 0}</strong>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="okr-dash-stats">
          <div class="okr-card okr-dash-stat">
            <div class="okr-dash-stat-icon" style="background:var(--accent-gold-dim);color:var(--brand-orange);">
              <i data-lucide="target" style="width:18px;height:18px;"></i>
            </div>
            <div>
              <div class="okr-dash-stat-value okr-kpi-num" data-target="${totalObjs}">${totalObjs}</div>
              <div class="okr-dash-stat-label">Objetivos</div>
            </div>
          </div>

          <div class="okr-card okr-dash-stat">
            <div class="okr-dash-stat-icon" style="background:rgba(59,130,246,0.1);color:#2563eb;">
              <i data-lucide="key-round" style="width:18px;height:18px;"></i>
            </div>
            <div>
              <div class="okr-dash-stat-value okr-kpi-num" data-target="${totalKRs}">${totalKRs}</div>
              <div class="okr-dash-stat-label">Key Results</div>
            </div>
          </div>

          <div class="okr-card okr-dash-stat">
            <div class="okr-dash-stat-icon" style="background:${atRisk > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)'};color:${atRisk > 0 ? '#dc2626' : '#16a34a'};">
              <i data-lucide="${atRisk > 0 ? 'alert-triangle' : 'check-circle'}" style="width:18px;height:18px;"></i>
            </div>
            <div>
              <div class="okr-dash-stat-value okr-kpi-num" data-target="${atRisk}">${atRisk}</div>
              <div class="okr-dash-stat-label">${atRisk > 0 ? 'Precisam atencao' : 'Tudo no caminho'}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribution + Chart Row -->
      <div class="okr-dash-grid">
        <!-- Distribution -->
        <div class="okr-card">
          <div class="okr-card-header">
            <h4>Distribuicao por Nivel</h4>
          </div>
          <div class="okr-dash-dist">
            ${this._renderDistBar('Company', companyCount, totalObjs, '#7c3aed')}
            ${this._renderDistBar('Diretoria', buCount, totalObjs, '#2563eb')}
            ${this._renderDistBar('Individual', personalCount, totalObjs, '#16a34a')}
          </div>
        </div>

        <!-- Progress Chart -->
        <div class="okr-card">
          <div class="okr-card-header">
            <h4>Evolucao do Progresso</h4>
          </div>
          <div style="position:relative;height:200px;">
            <canvas id="okrProgressChart"></canvas>
          </div>
        </div>
      </div>

      <!-- At-risk OKRs -->
      ${riskyObjs.length > 0 ? `
        <div class="okr-card" style="margin-top:16px;">
          <div class="okr-card-header">
            <h4>
              <i data-lucide="alert-triangle" style="width:15px;height:15px;color:#d97706;vertical-align:-2px;"></i>
              OKRs que precisam de atencao
            </h4>
            <span class="okr-status-badge okr-status--at_risk">${riskyObjs.length} item${riskyObjs.length > 1 ? 's' : ''}</span>
          </div>
          <div class="okr-dash-risk-list">
            ${riskyObjs.map(o => this._renderRiskyCard(o)).join('')}
          </div>
        </div>
      ` : ''}
    `;
  },

  _renderDistBar(label, count, total, color) {
    const pct = total > 0 ? (count / total * 100) : 0;
    return `
      <div class="okr-dash-dist-item">
        <div class="okr-dash-dist-label">
          <span>${label}</span>
          <span class="okr-dash-dist-count">${count}</span>
        </div>
        <div class="okr-progress-track okr-progress-sm">
          <div class="okr-progress-fill" style="width:${pct}%;background:${color};"></div>
        </div>
      </div>
    `;
  },

  _renderRiskyCard(obj) {
    const progress = Number(obj.progress || 0);
    const krs = obj.okr_key_results || [];
    const riskyKrs = krs.filter(k => k.confidence === 'at_risk' || k.confidence === 'behind');
    const worstConf = riskyKrs.some(k => k.confidence === 'behind') ? 'behind' : 'at_risk';
    const levelLabels = { company: 'Company', bu: 'Diretoria', personal: 'Individual' };

    return `
      <div class="okr-dash-risk-item">
        <div class="okr-dash-risk-top">
          <div class="okr-dash-risk-info">
            <span class="okr-dash-risk-title">${this._esc(obj.title)}</span>
            <div class="okr-dash-risk-meta">
              <span class="okr-level-badge okr-level--${obj.level}">${levelLabels[obj.level] || obj.level}</span>
              ${obj.bu ? `<span class="okr-dash-risk-bu">${this._esc(obj.bu)}</span>` : ''}
              <span>${riskyKrs.length} KR${riskyKrs.length > 1 ? 's' : ''} em risco</span>
            </div>
          </div>
          <div class="okr-dash-risk-pct">
            <span class="okr-status-badge okr-status--${worstConf}">${progress.toFixed(0)}%</span>
          </div>
        </div>
        <div class="okr-progress-track okr-progress-sm">
          <div class="okr-progress-fill" style="width:${Math.min(progress, 100)}%;background:${worstConf === 'behind' ? '#dc2626' : '#d97706'};"></div>
        </div>
      </div>
    `;
  },

  bind() {
    this._initChart();

    // countUp
    if (typeof TBO_UI !== 'undefined' && TBO_UI.countUp) {
      document.querySelectorAll('.okr-kpi-num').forEach(el => {
        const target = parseFloat(el.dataset.target || '0');
        if (target > 0) TBO_UI.countUp(el, target, { suffix: el.textContent.includes('%') ? '%' : '' });
      });
    }

    // New OKR button in empty state
    const newBtn = document.querySelector('.okr-dash-new-btn');
    if (newBtn && this._portal) {
      newBtn.addEventListener('click', () => {
        this._portal._showModal = 'createOKR';
        this._portal._modalData = { period: this._portal._period };
        this._portal._rerender();
      });
    }
  },

  _initChart() {
    if (this._chartInstance) {
      this._chartInstance.destroy();
      this._chartInstance = null;
    }

    const canvas = document.getElementById('okrProgressChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const objs = this._portal ? this._portal._objectives.filter(o => o.status === 'active') : [];

    if (objs.length === 0) {
      this._chartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
          datasets: [{
            label: 'Progresso (%)',
            data: [0, 0, 0, 0, 0, 0],
            borderColor: '#E85102',
            backgroundColor: 'rgba(232,81,2,0.06)',
            fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2
          }]
        },
        options: this._getChartOptions()
      });
      return;
    }

    const avgNow = objs.reduce((s, o) => s + Number(o.progress || 0), 0) / objs.length;
    const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'];
    const projected = weeks.map((_, i) => Math.round(avgNow * ((i + 1) / weeks.length)));

    this._chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: weeks,
        datasets: [{
          label: 'Progresso (%)',
          data: projected,
          borderColor: '#E85102',
          backgroundColor: 'rgba(232,81,2,0.06)',
          fill: true, tension: 0.4, pointRadius: 4,
          pointBackgroundColor: '#E85102', borderWidth: 2
        }]
      },
      options: this._getChartOptions()
    });
  },

  _getChartOptions() {
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y}%` } }
      },
      scales: {
        y: {
          beginAtZero: true, max: 100,
          ticks: { font: { size: 10 }, callback: v => v + '%', color: 'var(--text-muted)' },
          grid: { color: 'rgba(0,0,0,0.04)' },
          border: { display: false }
        },
        x: {
          ticks: { font: { size: 10 }, color: 'var(--text-muted)' },
          grid: { display: false },
          border: { display: false }
        }
      }
    };
  },

  _progressColor(pct) {
    if (pct >= 70) return '#16a34a';
    if (pct >= 40) return '#d97706';
    return '#dc2626';
  },

  _esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  },

  destroy() {
    if (this._chartInstance) { this._chartInstance.destroy(); this._chartInstance = null; }
    this._kpis = null;
  }
};

// ── Dashboard-specific styles (injected by main module via _getStyles) ──
// We append them to the main module's style block instead.
// The styles below are added to the page via the main orchestrator.

if (typeof window !== 'undefined') {
  window.TBO_OKRS_DASHBOARD = TBO_OKRS_DASHBOARD;

  // Inject dashboard-specific CSS
  const dashStyle = document.createElement('style');
  dashStyle.textContent = `
    /* ===== Dashboard KPIs Layout ===== */
    .okr-dash-kpis {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      margin-bottom: 16px;
    }

    /* Ring Card */
    .okr-dash-ring-card {
      display: flex; align-items: center; gap: 24px; padding: 24px !important;
    }
    .okr-dash-ring-wrapper { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
    .okr-dash-ring { width: 100%; height: 100%; }
    .okr-ring-animated { transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .okr-dash-ring-label {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .okr-dash-ring-pct { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
    .okr-dash-ring-pct small { font-size: 0.7rem; font-weight: 600; }
    .okr-dash-ring-sub { font-size: 0.62rem; color: var(--text-muted); margin-top: 2px; }

    .okr-dash-ring-meta { display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .okr-dash-ring-row {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.78rem; color: var(--text-secondary);
    }
    .okr-dash-ring-row strong { margin-left: auto; font-weight: 700; color: var(--text-primary); }
    .okr-dash-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

    /* Stats */
    .okr-dash-stats { display: flex; flex-direction: column; gap: 12px; }
    .okr-dash-stat {
      display: flex; align-items: center; gap: 14px; padding: 14px 18px !important;
    }
    .okr-dash-stat-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .okr-dash-stat-value { font-size: 1.35rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
    .okr-dash-stat-label { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }

    /* Distribution + Chart Grid */
    .okr-dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .okr-card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 14px;
    }
    .okr-card-header h4 {
      margin: 0; font-size: 0.85rem; font-weight: 600; color: var(--text-primary);
      display: flex; align-items: center; gap: 6px;
    }

    .okr-dash-dist { display: flex; flex-direction: column; gap: 14px; }
    .okr-dash-dist-item {}
    .okr-dash-dist-label {
      display: flex; justify-content: space-between; margin-bottom: 6px;
      font-size: 0.78rem; color: var(--text-secondary);
    }
    .okr-dash-dist-count { font-weight: 700; color: var(--text-primary); }

    /* Risk List */
    .okr-dash-risk-list { display: flex; flex-direction: column; gap: 10px; }
    .okr-dash-risk-item {
      padding: 12px 16px; border: 1px solid var(--border-default);
      border-radius: 8px; background: var(--bg-card-hover);
    }
    .okr-dash-risk-top {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 8px; gap: 12px;
    }
    .okr-dash-risk-info { flex: 1; min-width: 0; }
    .okr-dash-risk-title {
      font-size: 0.82rem; font-weight: 600; color: var(--text-primary);
      display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .okr-dash-risk-meta {
      display: flex; align-items: center; gap: 6px; margin-top: 4px;
      font-size: 0.7rem; color: var(--text-muted); flex-wrap: wrap;
    }
    .okr-dash-risk-bu {
      padding: 0 6px; background: var(--bg-tertiary); border-radius: 4px;
    }
    .okr-dash-risk-pct { flex-shrink: 0; }

    @media (max-width: 768px) {
      .okr-dash-kpis { grid-template-columns: 1fr; }
      .okr-dash-grid { grid-template-columns: 1fr; }
      .okr-dash-ring-card { flex-direction: column; text-align: center; }
    }
  `;
  document.head.appendChild(dashStyle);
}
