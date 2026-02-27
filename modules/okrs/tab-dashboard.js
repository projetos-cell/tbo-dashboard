// ============================================================================
// TBO OS — OKRs: Tab Dashboard
// KPI cards, grafico evolucao, OKRs em risco, check-ins pendentes
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
    const objs = p ? p._objectives : [];

    const totalObjs = kpis.totalObjectives || 0;
    const avgProgress = kpis.avgProgress || 0;
    const atRisk = (kpis.atRiskCount || 0) + (kpis.behindCount || 0);
    const totalKRs = kpis.totalKRs || 0;

    // OKRs em risco (top 5)
    const riskyObjs = objs
      .filter(o => o.status === 'active')
      .filter(o => {
        const krs = o.okr_key_results || [];
        return krs.some(k => k.confidence === 'at_risk' || k.confidence === 'behind');
      })
      .slice(0, 5);

    return `
      <div class="card" style="padding:20px;margin-bottom:20px;">
        <h3 style="margin:0 0 4px;font-size:0.92rem;">Visao Geral OKRs</h3>
        <p style="color:var(--text-muted);font-size:0.75rem;margin:0;">
          Resumo do periodo ${p ? p._period : ''}
        </p>
      </div>

      <!-- KPIs -->
      <div class="grid-4" style="gap:12px;margin-bottom:20px;">
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Objetivos</div>
          <div class="okr-kpi-num" data-target="${totalObjs}" style="font-size:1.8rem;font-weight:800;color:var(--text-primary);margin:4px 0;">${totalObjs}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">${totalKRs} key results</div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Progresso Medio</div>
          <div class="okr-kpi-num" data-target="${avgProgress}" style="font-size:1.8rem;font-weight:800;color:var(--brand-primary);margin:4px 0;">${avgProgress}%</div>
          <div style="width:100%;height:4px;background:var(--bg-tertiary);border-radius:2px;margin-top:6px;">
            <div style="width:${Math.min(avgProgress, 100)}%;height:100%;background:var(--brand-primary);border-radius:2px;transition:width 0.8s ease;"></div>
          </div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Em Risco</div>
          <div class="okr-kpi-num" data-target="${atRisk}" style="font-size:1.8rem;font-weight:800;color:${atRisk > 0 ? 'var(--color-danger)' : 'var(--color-success)'};margin:4px 0;">${atRisk}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">at_risk + behind</div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">On Track</div>
          <div class="okr-kpi-num" data-target="${kpis.onTrackCount || 0}" style="font-size:1.8rem;font-weight:800;color:var(--color-success);margin:4px 0;">${kpis.onTrackCount || 0}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">KRs no caminho</div>
        </div>
      </div>

      <!-- Grafico + OKRs em risco -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <!-- Grafico evolucao -->
        <div class="card" style="padding:20px;">
          <h4 style="margin:0 0 12px;font-size:0.85rem;">Evolucao do Progresso</h4>
          <div style="position:relative;height:220px;">
            <canvas id="okrProgressChart"></canvas>
          </div>
          ${totalObjs === 0 ? '<p style="text-align:center;color:var(--text-muted);font-size:0.8rem;margin-top:8px;">Crie OKRs para ver a evolucao</p>' : ''}
        </div>

        <!-- OKRs em risco -->
        <div class="card" style="padding:20px;">
          <h4 style="margin:0 0 12px;font-size:0.85rem;">
            <i data-lucide="alert-triangle" style="width:14px;height:14px;color:var(--color-warning);vertical-align:-2px;"></i>
            OKRs em Risco
          </h4>
          ${riskyObjs.length === 0 ? `
            <div style="text-align:center;padding:30px 0;">
              <i data-lucide="check-circle-2" style="width:32px;height:32px;color:var(--color-success);margin-bottom:8px;"></i>
              <p style="color:var(--text-muted);font-size:0.82rem;margin:0;">Nenhum OKR em risco</p>
            </div>
          ` : riskyObjs.map(o => {
            const krs = o.okr_key_results || [];
            const riskyKrs = krs.filter(k => k.confidence === 'at_risk' || k.confidence === 'behind');
            return `
              <div style="padding:10px;border:1px solid var(--border-default);border-radius:8px;margin-bottom:8px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <span style="font-size:0.82rem;font-weight:600;">${this._esc(o.title)}</span>
                  <span class="okr-badge okr-badge--${o.level}" style="font-size:0.65rem;">${o.level}</span>
                </div>
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;">
                  ${riskyKrs.length} KR${riskyKrs.length > 1 ? 's' : ''} em risco
                  · Progresso: ${Number(o.progress || 0).toFixed(0)}%
                </div>
                <div style="width:100%;height:3px;background:var(--bg-tertiary);border-radius:2px;margin-top:6px;">
                  <div style="width:${Math.min(Number(o.progress || 0), 100)}%;height:100%;background:var(--color-danger);border-radius:2px;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  bind() {
    this._initChart();
    // countUp animation for KPI numbers
    if (typeof TBO_UI !== 'undefined' && TBO_UI.countUp) {
      document.querySelectorAll('.okr-kpi-num').forEach(el => {
        const target = parseFloat(el.dataset.target || '0');
        if (target > 0) TBO_UI.countUp(el, target, { suffix: el.textContent.includes('%') ? '%' : '' });
      });
    }
  },

  _initChart() {
    // Destroy previous instance
    if (this._chartInstance) {
      this._chartInstance.destroy();
      this._chartInstance = null;
    }

    const canvas = document.getElementById('okrProgressChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const objs = this._portal ? this._portal._objectives : [];
    if (objs.length === 0) {
      // Empty state chart
      this._chartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
          datasets: [{
            label: 'Progresso (%)',
            data: [0, 0, 0, 0, 0, 0],
            borderColor: '#E85102',
            backgroundColor: 'rgba(232,81,2,0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            borderWidth: 2
          }]
        },
        options: this._getChartOptions()
      });
      return;
    }

    // Simulate progress curve based on current progress
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
          backgroundColor: 'rgba(232,81,2,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#E85102',
          borderWidth: 2
        }]
      },
      options: this._getChartOptions()
    });
  },

  _getChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.parsed.y}%`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { font: { size: 10 }, callback: v => v + '%' },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: {
          ticks: { font: { size: 10 } },
          grid: { display: false }
        }
      }
    };
  },

  _esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  },

  destroy() {
    if (this._chartInstance) {
      this._chartInstance.destroy();
      this._chartInstance = null;
    }
    this._kpis = null;
  }
};

if (typeof window !== 'undefined') {
  window.TBO_OKRS_DASHBOARD = TBO_OKRS_DASHBOARD;
}
