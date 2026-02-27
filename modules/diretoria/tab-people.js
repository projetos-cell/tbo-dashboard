// ============================================================================
// TBO OS — Diretoria: Tab People Analytics
// Reutiliza TBO_PEOPLE_SHARED para dados, Chart.js para graficos
// Adaptado de modules/people/tab-analytics.js
// ============================================================================

const TBO_DIRETORIA_PEOPLE = {

  _portal: null,

  setup(portal) {
    this._portal = portal;
  },

  render() {
    // Verificar se TBO_PEOPLE_SHARED esta disponivel
    if (typeof TBO_PEOPLE_SHARED === 'undefined') {
      return `<div class="card" style="padding:40px;text-align:center;">
        <i data-lucide="alert-triangle" style="width:32px;height:32px;color:var(--accent-gold);margin-bottom:8px;"></i>
        <p style="color:var(--text-muted);font-size:0.85rem;">Modulo de Pessoas nao carregado. Acesse <a href="#/rh" style="color:var(--brand-primary);">Equipe</a> primeiro.</p>
      </div>`;
    }

    const S = TBO_PEOPLE_SHARED;
    const team = S._getInternalTeam ? S._getInternalTeam() : [];
    const fmt = typeof TBO_FORMATTER !== 'undefined'
      ? TBO_FORMATTER
      : { currency: v => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` };
    const esc = S._esc ? S._esc.bind(S) : (str) => { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; };

    const activeMembers = team.filter(t => t.status === 'ativo' || t.status === 'active' || (!t.status && t.id));
    const totalSalary = activeMembers.reduce((sum, t) => sum + (parseFloat(t.custoMensal) || 0), 0);
    const custoMedio = activeMembers.length ? totalSalary / activeMembers.length : 0;

    // Agrupar por BU
    const buGroups = {};
    activeMembers.forEach(t => {
      const bu = t.bu || 'Sem BU';
      if (!buGroups[bu]) buGroups[bu] = { count: 0, custo: 0, color: this._buColor(bu) };
      buGroups[bu].count++;
      buGroups[bu].custo += parseFloat(t.custoMensal) || 0;
    });

    // Status groups
    const statusGroups = {};
    team.forEach(t => {
      const s = t.status || 'ativo';
      if (!statusGroups[s]) statusGroups[s] = 0;
      statusGroups[s]++;
    });

    return `
      <div class="card" style="padding:16px;margin-bottom:20px;">
        <h3 style="margin:0 0 4px;font-size:0.92rem;">People Analytics</h3>
        <p style="color:var(--text-muted);font-size:0.75rem;margin:0;">Indicadores avancados de pessoas, custos e distribuicao</p>
      </div>

      <!-- KPIs -->
      <div class="grid-4" style="gap:12px;margin-bottom:20px;">
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Headcount Total</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--text-primary);margin:4px 0;">${team.length}</div>
          <div style="font-size:0.72rem;color:var(--color-success);">${activeMembers.length} ativos</div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Custo Mensal Total</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--brand-primary);margin:4px 0;">${fmt.currency(totalSalary)}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">PJ ativos</div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Custo Medio / Pessoa</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--text-primary);margin:4px 0;">${fmt.currency(custoMedio)}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">media mensal</div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">BUs Ativas</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--text-primary);margin:4px 0;">${Object.keys(buGroups).length}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">equipes</div>
        </div>
      </div>

      <!-- Charts Row 1: Custo por BU + Status -->
      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="bar-chart-3" style="width:16px;height:16px;color:var(--brand-primary);"></i>
            Custo Mensal por Equipe
          </h4>
          <div style="height:280px;position:relative;">
            <canvas id="dirChartCustoBU"></canvas>
          </div>
        </div>
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="pie-chart" style="width:16px;height:16px;color:var(--brand-primary);"></i>
            Distribuicao por Status
          </h4>
          <div style="height:280px;position:relative;">
            <canvas id="dirChartStatus"></canvas>
          </div>
        </div>
      </div>

      <!-- Charts Row 2: Headcount por BU + Breakdown Table -->
      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="users" style="width:16px;height:16px;color:var(--brand-primary);"></i>
            Headcount por BU
          </h4>
          <div style="height:280px;position:relative;">
            <canvas id="dirChartHeadcount"></canvas>
          </div>
        </div>
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="table" style="width:16px;height:16px;color:var(--brand-primary);"></i>
            Breakdown por Equipe
          </h4>
          <table class="data-table" style="font-size:0.8rem;">
            <thead><tr>
              <th>Equipe</th>
              <th style="text-align:center;">Pessoas</th>
              <th style="text-align:right;">Custo Mensal</th>
              <th style="text-align:right;">% do Total</th>
            </tr></thead>
            <tbody>
              ${Object.entries(buGroups).sort((a, b) => b[1].custo - a[1].custo).map(([bu, data]) => {
                const pct = totalSalary ? ((data.custo / totalSalary) * 100).toFixed(1) : '0.0';
                return `<tr>
                  <td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${data.color};margin-right:6px;"></span><strong>${esc(bu)}</strong></td>
                  <td style="text-align:center;">${data.count}</td>
                  <td style="text-align:right;font-weight:600;">${fmt.currency(data.custo)}</td>
                  <td style="text-align:right;color:var(--text-muted);">${pct}%</td>
                </tr>`;
              }).join('')}
              <tr style="border-top:2px solid var(--border-subtle);font-weight:700;">
                <td>Total</td>
                <td style="text-align:center;">${activeMembers.length}</td>
                <td style="text-align:right;color:var(--brand-primary);">${fmt.currency(totalSalary)}</td>
                <td style="text-align:right;">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Row 3: Turnover + Diversidade + Contrato -->
      <div class="grid-3" style="gap:16px;margin-bottom:16px;">
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.82rem;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
            <i data-lucide="user-minus" style="width:14px;height:14px;color:var(--color-danger);"></i> Turnover
          </h4>
          ${(() => {
            const inativos = team.filter(t => t.status === 'inactive' || t.status === 'inativo' || t.status === 'desligado').length;
            const taxa = team.length ? ((inativos / team.length) * 100).toFixed(1) : '0.0';
            const color = parseFloat(taxa) > 15 ? 'var(--color-danger)' : parseFloat(taxa) > 8 ? 'var(--accent-gold)' : 'var(--color-success)';
            return `<div style="text-align:center;">
              <div style="font-size:2rem;font-weight:800;color:${color};">${taxa}%</div>
              <div style="font-size:0.72rem;color:var(--text-muted);">${inativos} inativos / ${team.length} total</div>
            </div>`;
          })()}
        </div>
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.82rem;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
            <i data-lucide="map-pin" style="width:14px;height:14px;color:var(--color-info);"></i> Diversidade Regional
          </h4>
          ${(() => {
            const byCidade = {};
            activeMembers.forEach(t => { const c = t.cidade || t.city || 'Nao informado'; byCidade[c] = (byCidade[c] || 0) + 1; });
            return Object.entries(byCidade).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c, n]) =>
              `<div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:4px;"><span>${esc(c)}</span><strong>${n}</strong></div>`
            ).join('') || '<div style="font-size:0.72rem;color:var(--text-muted);">Sem dados</div>';
          })()}
        </div>
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.82rem;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
            <i data-lucide="file-text" style="width:14px;height:14px;color:var(--accent-gold);"></i> Tipo de Contrato
          </h4>
          ${(() => {
            const byTipo = {};
            activeMembers.forEach(t => { const tipo = t.tipoContrato || t.tipo_contrato || 'PJ'; byTipo[tipo] = (byTipo[tipo] || 0) + 1; });
            return Object.entries(byTipo).sort((a, b) => b[1] - a[1]).map(([tipo, n]) =>
              `<div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:4px;"><span>${tipo.toUpperCase()}</span><strong>${n}</strong></div>`
            ).join('') || '<div style="font-size:0.72rem;color:var(--text-muted);">Sem dados</div>';
          })()}
        </div>
      </div>

      <!-- Row 4: Headcount Evolution -->
      <div class="card" style="padding:20px;">
        <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i data-lucide="line-chart" style="width:16px;height:16px;color:var(--brand-primary);"></i>
          Evolucao do Headcount
        </h4>
        <div style="height:250px;position:relative;">
          <canvas id="dirChartHeadcountEvo"></canvas>
        </div>
      </div>
    `;
  },

  bind() {
    this._initCharts();
  },

  // ── Chart.js initialization ───────────────────────────────────────────

  _initCharts() {
    if (typeof Chart === 'undefined' || typeof TBO_PEOPLE_SHARED === 'undefined') return;

    const S = TBO_PEOPLE_SHARED;
    const team = S._getInternalTeam ? S._getInternalTeam() : [];
    const activeMembers = team.filter(t => t.status === 'ativo' || t.status === 'active' || (!t.status && t.id));

    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#E2E8F0';
    const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#64748B';
    const gridColor = 'rgba(148, 163, 184, 0.1)';

    // BU data
    const buGroups = {};
    activeMembers.forEach(t => {
      const bu = t.bu || 'Sem BU';
      if (!buGroups[bu]) buGroups[bu] = { count: 0, custo: 0, color: this._buColor(bu) };
      buGroups[bu].count++;
      buGroups[bu].custo += parseFloat(t.custoMensal) || 0;
    });
    const buEntries = Object.entries(buGroups).sort((a, b) => b[1].custo - a[1].custo);

    // Chart 1: Custo por BU (bar horizontal)
    const custoBUCanvas = document.getElementById('dirChartCustoBU');
    if (custoBUCanvas) {
      new Chart(custoBUCanvas, {
        type: 'bar',
        data: {
          labels: buEntries.map(([bu]) => bu),
          datasets: [{
            label: 'Custo Mensal (R$)',
            data: buEntries.map(([, d]) => d.custo),
            backgroundColor: buEntries.map(([, d]) => d.color + 'CC'),
            borderColor: buEntries.map(([, d]) => d.color),
            borderWidth: 1, borderRadius: 6, barPercentage: 0.7
          }]
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `R$ ${ctx.parsed.x.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` } } },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: mutedColor, font: { size: 11 }, callback: v => `R$ ${(v / 1000).toFixed(0)}k` } },
            y: { grid: { display: false }, ticks: { color: textColor, font: { size: 12, weight: '600' } } }
          }
        }
      });
    }

    // Chart 2: Status (doughnut)
    const statusLabels = { 'active': 'Ativo', 'ativo': 'Ativo', 'inactive': 'Inativo', 'inativo': 'Inativo', 'vacation': 'Ferias', 'ferias': 'Ferias', 'away': 'Ausente', 'ausente': 'Ausente', 'onboarding': 'Onboarding', 'offboarding': 'Offboarding', 'desligado': 'Desligado', 'suspended': 'Suspenso', 'suspenso': 'Suspenso' };
    const statusColors = { 'active': '#10B981', 'ativo': '#10B981', 'inactive': '#6B7280', 'inativo': '#6B7280', 'vacation': '#F59E0B', 'ferias': '#F59E0B', 'away': '#8B5CF6', 'ausente': '#8B5CF6', 'onboarding': '#3B82F6', 'offboarding': '#F97316', 'desligado': '#9CA3AF', 'suspended': '#DC2626', 'suspenso': '#DC2626' };
    const statusGroups = {};
    team.forEach(t => { const s = t.status || 'ativo'; if (!statusGroups[s]) statusGroups[s] = 0; statusGroups[s]++; });

    const statusCanvas = document.getElementById('dirChartStatus');
    if (statusCanvas) {
      const sEntries = Object.entries(statusGroups).sort((a, b) => b[1] - a[1]);
      new Chart(statusCanvas, {
        type: 'doughnut',
        data: {
          labels: sEntries.map(([s]) => statusLabels[s] || s),
          datasets: [{ data: sEntries.map(([, c]) => c), backgroundColor: sEntries.map(([s]) => (statusColors[s] || '#64748B') + 'CC'), borderColor: sEntries.map(([s]) => statusColors[s] || '#64748B'), borderWidth: 2, hoverOffset: 8 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '60%',
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor, font: { size: 11 }, padding: 16, usePointStyle: true, pointStyle: 'circle' } },
            tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed} (${((ctx.parsed / team.length) * 100).toFixed(0)}%)` } }
          }
        }
      });
    }

    // Chart 3: Headcount por BU (bar vertical)
    const headcountCanvas = document.getElementById('dirChartHeadcount');
    if (headcountCanvas) {
      new Chart(headcountCanvas, {
        type: 'bar',
        data: {
          labels: buEntries.map(([bu]) => bu),
          datasets: [{ label: 'Pessoas', data: buEntries.map(([, d]) => d.count), backgroundColor: buEntries.map(([, d]) => d.color + '99'), borderColor: buEntries.map(([, d]) => d.color), borderWidth: 1, borderRadius: 6, barPercentage: 0.6 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} pessoa${ctx.parsed.y !== 1 ? 's' : ''}` } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11, weight: '600' } } },
            y: { grid: { color: gridColor }, ticks: { color: mutedColor, font: { size: 11 }, stepSize: 1 }, beginAtZero: true }
          }
        }
      });
    }

    // Chart 4: Headcount Evolution (line)
    const hcEvoCanvas = document.getElementById('dirChartHeadcountEvo');
    if (hcEvoCanvas) {
      const months = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
      const hcData = months.map(m => {
        const endOfMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0);
        return team.filter(t => { const start = t.inicio || t.start_date; if (!start) return true; return new Date(start) <= endOfMonth; }).length;
      });

      new Chart(hcEvoCanvas, {
        type: 'line',
        data: {
          labels: months.map(m => m.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })),
          datasets: [{ label: 'Headcount', data: hcData, borderColor: '#3A7BD5', backgroundColor: 'rgba(58, 123, 213, 0.1)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: mutedColor, font: { size: 10 } } },
            y: { grid: { color: gridColor }, ticks: { color: mutedColor, stepSize: 1 }, beginAtZero: true }
          }
        }
      });
    }
  },

  // ── Helper: cor por BU ────────────────────────────────────────────────

  _buColor(bu) {
    const colors = { 'Branding': '#8B5CF6', 'Digital 3D': '#3A7BD5', 'Marketing': '#F59E0B', 'Vendas': '#2ECC71', 'Operacao': '#E85102', 'Operação': '#E85102', 'Pós Vendas': '#EC4899' };
    return colors[bu] || '#64748B';
  }
};
