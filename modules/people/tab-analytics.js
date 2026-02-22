// TBO OS — People Tab: Analytics
// Sub-modulo lazy-loaded

(function() {
  const S = TBO_PEOPLE_SHARED;

  const TabAnalytics = {
    // ══════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════
    render() {
      return this._renderAnalytics();
    },

    _renderAnalytics() {
      const team = S._getInternalTeam();
      const fmt = typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER : { currency: v => `R$ ${Number(v || 0).toLocaleString('pt-BR', {minimumFractionDigits:0})}` };

      // Dados locais para render imediato
      const activeMembers = team.filter(t => t.status === 'ativo' || t.status === 'active' || (!t.status && t.id));
      const totalSalary = activeMembers.reduce((sum, t) => sum + (parseFloat(t.custoMensal) || 0), 0);

      // Agrupar por BU
      const buGroups = {};
      activeMembers.forEach(t => {
        const bu = t.bu || 'Sem BU';
        if (!buGroups[bu]) buGroups[bu] = { count: 0, custo: 0, color: this._buColor(bu) };
        buGroups[bu].count++;
        buGroups[bu].custo += parseFloat(t.custoMensal) || 0;
      });

      // Agrupar por status
      const statusGroups = {};
      const statusColors = { 'active': '#10B981', 'ativo': '#10B981', 'inactive': '#6B7280', 'inativo': '#6B7280', 'vacation': '#F59E0B', 'ferias': '#F59E0B', 'away': '#8B5CF6', 'ausente': '#8B5CF6', 'onboarding': '#3B82F6', 'offboarding': '#F97316', 'desligado': '#9CA3AF', 'suspended': '#DC2626', 'suspenso': '#DC2626' };
      team.forEach(t => {
        const s = t.status || 'ativo';
        if (!statusGroups[s]) statusGroups[s] = 0;
        statusGroups[s]++;
      });

      // Custo medio por pessoa
      const custoMedio = activeMembers.length ? totalSalary / activeMembers.length : 0;

      return `
        ${S._pageHeader('Analytics', 'Indicadores avançados, distribuição de custos e métricas de pessoas')}
        <!-- KPIs Analytics -->
        <div class="grid-4" style="gap:12px;margin-bottom:20px;">
          <div class="card" style="padding:16px;text-align:center;">
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Headcount Total</div>
            <div style="font-size:1.8rem;font-weight:800;color:var(--text-primary);margin:4px 0;">${team.length}</div>
            <div style="font-size:0.72rem;color:var(--color-success);">${activeMembers.length} ativos</div>
          </div>
          <div class="card" style="padding:16px;text-align:center;">
            <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Custo Mensal Total</div>
            <div style="font-size:1.8rem;font-weight:800;color:var(--brand-primary);margin:4px 0;" id="rhAnalyticsCusto">${fmt.currency(totalSalary)}</div>
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

        <!-- Graficos Row 1: Custo por BU + Distribuicao por Status -->
        <div class="grid-2" style="gap:16px;margin-bottom:16px;">
          <div class="card" style="padding:20px;">
            <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
              <i data-lucide="bar-chart-3" style="width:16px;height:16px;color:var(--brand-primary);"></i>
              Custo Mensal por Equipe
            </h4>
            <div style="height:280px;position:relative;">
              <canvas id="rhChartCustoBU"></canvas>
            </div>
          </div>
          <div class="card" style="padding:20px;">
            <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
              <i data-lucide="pie-chart" style="width:16px;height:16px;color:var(--brand-primary);"></i>
              Distribuicao por Status
            </h4>
            <div style="height:280px;position:relative;">
              <canvas id="rhChartStatus"></canvas>
            </div>
          </div>
        </div>

        <!-- Graficos Row 2: Headcount por BU + Tabela Custo Detalhado -->
        <div class="grid-2" style="gap:16px;margin-bottom:16px;">
          <div class="card" style="padding:20px;">
            <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
              <i data-lucide="users" style="width:16px;height:16px;color:var(--brand-primary);"></i>
              Headcount por BU
            </h4>
            <div style="height:280px;position:relative;">
              <canvas id="rhChartHeadcount"></canvas>
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
                    <td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${data.color};margin-right:6px;"></span><strong>${S._esc(bu)}</strong></td>
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

        <!-- Row 3: Top salarios + Performance por BU -->
        <div class="grid-2" style="gap:16px;">
          <div class="card" style="padding:20px;">
            <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
              <i data-lucide="trending-up" style="width:16px;height:16px;color:var(--brand-primary);"></i>
              Top Investimentos (Maiores Valores)
            </h4>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${[...activeMembers].filter(t => parseFloat(t.custoMensal) > 0).sort((a, b) => (parseFloat(b.custoMensal) || 0) - (parseFloat(a.custoMensal) || 0)).slice(0, 8).map((t, i) => {
                const salary = parseFloat(t.custoMensal) || 0;
                const maxSalary = parseFloat([...activeMembers].sort((a, b) => (parseFloat(b.custoMensal) || 0) - (parseFloat(a.custoMensal) || 0))[0]?.custoMensal) || 1;
                const pct = (salary / maxSalary) * 100;
                const buColor = this._buColor(t.bu);
                return `<div style="display:flex;align-items:center;gap:10px;">
                  <span style="width:18px;font-size:0.7rem;color:var(--text-muted);text-align:right;">${i + 1}.</span>
                  <span style="width:120px;font-size:0.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" data-person-id="${t.supabaseId || ''}">${S._esc(t.nome)}</span>
                  <div style="flex:1;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                    <div style="height:100%;width:${pct}%;background:${buColor};border-radius:3px;transition:width 0.6s ease;"></div>
                  </div>
                  <span style="font-size:0.78rem;font-weight:700;min-width:70px;text-align:right;">${fmt.currency(salary)}</span>
                </div>`;
              }).join('')}
            </div>
          </div>
          <div class="card" style="padding:20px;">
            <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
              <i data-lucide="award" style="width:16px;height:16px;color:var(--brand-primary);"></i>
              Performance por BU
            </h4>
            ${(() => {
              const reviews = S._getStore('avaliacoes_people');
              const buPerf = {};
              reviews.forEach(r => {
                const p = S._getPerson(r.pessoaId);
                if (p && p.bu) {
                  if (!buPerf[p.bu]) buPerf[p.bu] = [];
                  buPerf[p.bu].push(r.mediaGeral);
                }
              });
              if (!Object.keys(buPerf).length) {
                return '<div style="text-align:center;color:var(--text-muted);padding:40px 0;font-size:0.82rem;">Sem dados de avaliacao ainda</div>';
              }
              return Object.entries(buPerf).sort((a, b) => {
                const avgA = a[1].reduce((s, v) => s + v, 0) / a[1].length;
                const avgB = b[1].reduce((s, v) => s + v, 0) / b[1].length;
                return avgB - avgA;
              }).map(([bu, scores]) => {
                const avg = (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1);
                const color = avg >= 4 ? '#10B981' : avg >= 3 ? '#F59E0B' : '#EF4444';
                return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                  <span style="font-size:0.82rem;width:80px;font-weight:600;">${S._esc(bu)}</span>
                  <div style="flex:1;height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
                    <div style="height:100%;width:${(avg / 5) * 100}%;background:${color};border-radius:4px;transition:width 0.6s ease;"></div>
                  </div>
                  <span style="font-size:0.85rem;font-weight:700;color:${color};">${avg}</span>
                  <span style="font-size:0.68rem;color:var(--text-muted);">(${scores.length}p)</span>
                </div>`;
              }).join('');
            })()}
          </div>
        </div>

        <!-- Row 4: Metricas avancadas (Fase E) -->
        <div class="grid-3" style="gap:16px;margin-top:16px;margin-bottom:16px;">
          <!-- Turnover -->
          <div class="card" style="padding:16px;">
            <h4 style="font-size:0.82rem;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="user-minus" style="width:14px;height:14px;color:var(--color-danger);"></i> Turnover
            </h4>
            ${(() => {
              const inativos = team.filter(t => t.status === 'inactive' || t.status === 'inativo' || t.status === 'desligado').length;
              const taxa = team.length ? ((inativos / team.length) * 100).toFixed(1) : '0.0';
              return '<div style="text-align:center;"><div style="font-size:2rem;font-weight:800;color:' + (parseFloat(taxa) > 15 ? 'var(--color-danger)' : parseFloat(taxa) > 8 ? 'var(--accent-gold)' : 'var(--color-success)') + ';">' + taxa + '%</div><div style="font-size:0.72rem;color:var(--text-muted);">' + inativos + ' inativos / ' + team.length + ' total</div></div>';
            })()}
          </div>

          <!-- Diversidade por Cidade -->
          <div class="card" style="padding:16px;">
            <h4 style="font-size:0.82rem;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="map-pin" style="width:14px;height:14px;color:var(--color-info);"></i> Diversidade Regional
            </h4>
            ${(() => {
              const byCidade = {};
              activeMembers.forEach(t => {
                const c = t.cidade || t.city || 'Não informado';
                byCidade[c] = (byCidade[c] || 0) + 1;
              });
              return Object.entries(byCidade).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c, n]) =>
                '<div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:4px;"><span>' + c + '</span><strong>' + n + '</strong></div>'
              ).join('') || '<div style="font-size:0.72rem;color:var(--text-muted);">Sem dados</div>';
            })()}
          </div>

          <!-- Tipo de Contrato -->
          <div class="card" style="padding:16px;">
            <h4 style="font-size:0.82rem;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="file-text" style="width:14px;height:14px;color:var(--accent-gold);"></i> Tipo de Contrato
            </h4>
            ${(() => {
              const byTipo = {};
              activeMembers.forEach(t => {
                const tipo = t.tipoContrato || t.tipo_contrato || 'PJ';
                byTipo[tipo] = (byTipo[tipo] || 0) + 1;
              });
              return Object.entries(byTipo).sort((a, b) => b[1] - a[1]).map(([tipo, n]) =>
                '<div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:4px;"><span>' + tipo.toUpperCase() + '</span><strong>' + n + '</strong></div>'
              ).join('') || '<div style="font-size:0.72rem;color:var(--text-muted);">Sem dados</div>';
            })()}
          </div>
        </div>

        <!-- Row 5: 1:1 Compliance + Recognition Index + Headcount Evolution -->
        <div class="grid-2" style="gap:16px;margin-bottom:16px;">
          <div class="card" style="padding:20px;">
            <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
              <i data-lucide="calendar-check" style="width:16px;height:16px;color:var(--color-success);"></i>
              1:1 Compliance
            </h4>
            <div id="rhAnalytics1on1Compliance">
              <div style="font-size:0.72rem;color:var(--text-muted);"><i data-lucide="loader" style="width:12px;height:12px;animation:spin 1s linear infinite;"></i> Carregando...</div>
            </div>
          </div>
          <div class="card" style="padding:20px;">
            <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
              <i data-lucide="trophy" style="width:16px;height:16px;color:var(--accent-gold);"></i>
              Índice de Reconhecimento
            </h4>
            <div id="rhAnalyticsRecognition">
              <div style="font-size:0.72rem;color:var(--text-muted);"><i data-lucide="loader" style="width:12px;height:12px;animation:spin 1s linear infinite;"></i> Carregando...</div>
            </div>
          </div>
        </div>

        <!-- Row 6: Headcount Evolution (Chart) -->
        <div class="card" style="padding:20px;margin-bottom:16px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="line-chart" style="width:16px;height:16px;color:var(--brand-primary);"></i>
            Evolução do Headcount
          </h4>
          <div style="height:250px;position:relative;">
            <canvas id="rhChartHeadcountEvolution"></canvas>
          </div>
        </div>
      `;
    },

    // ══════════════════════════════════════════════════════════════════
    // INIT
    // ══════════════════════════════════════════════════════════════════
    init() {
      this._initAnalytics();
    },

    // Helper: cor por BU
    _buColor(bu) {
      const colors = { 'Branding': '#8B5CF6', 'Digital 3D': '#3A7BD5', 'Marketing': '#F59E0B', 'Vendas': '#2ECC71', 'Operacao': '#E85102', 'Operação': '#E85102', 'Pós Vendas': '#EC4899' };
      return colors[bu] || '#64748B';
    },

    // Inicializar graficos Chart.js na tab Analytics
    async _initAnalytics() {
      if (typeof Chart === 'undefined') {
        console.warn('[RH] Chart.js nao carregado');
        return;
      }

      const team = S._getInternalTeam();
      const activeMembers = team.filter(t => t.status === 'ativo' || t.status === 'active' || (!t.status && t.id));

      // Configuracao global do Chart.js para dark mode
      const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#E2E8F0';
      const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#64748B';
      const gridColor = 'rgba(148, 163, 184, 0.1)';

      // ── Grafico 1: Custo Mensal por BU (bar chart horizontal) ──
      const buGroups = {};
      activeMembers.forEach(t => {
        const bu = t.bu || 'Sem BU';
        if (!buGroups[bu]) buGroups[bu] = { count: 0, custo: 0, color: this._buColor(bu) };
        buGroups[bu].count++;
        buGroups[bu].custo += parseFloat(t.custoMensal) || 0;
      });

      const buEntries = Object.entries(buGroups).sort((a, b) => b[1].custo - a[1].custo);
      const custoBUCanvas = document.getElementById('rhChartCustoBU');
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
              borderWidth: 1,
              borderRadius: 6,
              barPercentage: 0.7
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: ctx => `R$ ${ctx.parsed.x.toLocaleString('pt-BR', {minimumFractionDigits:0})}`
                }
              }
            },
            scales: {
              x: { grid: { color: gridColor }, ticks: { color: mutedColor, font: { size: 11 }, callback: v => `R$ ${(v/1000).toFixed(0)}k` } },
              y: { grid: { display: false }, ticks: { color: textColor, font: { size: 12, weight: '600' } } }
            }
          }
        });
      }

      // ── Grafico 2: Distribuicao por Status (doughnut) ──
      const statusGroups = {};
      const statusLabels = { 'active': 'Ativo', 'ativo': 'Ativo', 'inactive': 'Inativo', 'inativo': 'Inativo', 'vacation': 'Ferias', 'ferias': 'Ferias', 'away': 'Ausente', 'ausente': 'Ausente', 'onboarding': 'Onboarding', 'offboarding': 'Offboarding', 'desligado': 'Desligado', 'suspended': 'Suspenso', 'suspenso': 'Suspenso' };
      const statusColors = { 'active': '#10B981', 'ativo': '#10B981', 'inactive': '#6B7280', 'inativo': '#6B7280', 'vacation': '#F59E0B', 'ferias': '#F59E0B', 'away': '#8B5CF6', 'ausente': '#8B5CF6', 'onboarding': '#3B82F6', 'offboarding': '#F97316', 'desligado': '#9CA3AF', 'suspended': '#DC2626', 'suspenso': '#DC2626' };
      team.forEach(t => {
        const s = t.status || 'ativo';
        if (!statusGroups[s]) statusGroups[s] = 0;
        statusGroups[s]++;
      });

      const statusCanvas = document.getElementById('rhChartStatus');
      if (statusCanvas) {
        const sEntries = Object.entries(statusGroups).sort((a, b) => b[1] - a[1]);
        new Chart(statusCanvas, {
          type: 'doughnut',
          data: {
            labels: sEntries.map(([s]) => statusLabels[s] || s),
            datasets: [{
              data: sEntries.map(([, c]) => c),
              backgroundColor: sEntries.map(([s]) => (statusColors[s] || '#64748B') + 'CC'),
              borderColor: sEntries.map(([s]) => statusColors[s] || '#64748B'),
              borderWidth: 2,
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
              legend: { position: 'bottom', labels: { color: textColor, font: { size: 11 }, padding: 16, usePointStyle: true, pointStyle: 'circle' } },
              tooltip: {
                callbacks: {
                  label: ctx => `${ctx.label}: ${ctx.parsed} (${((ctx.parsed / team.length) * 100).toFixed(0)}%)`
                }
              }
            }
          }
        });
      }

      // ── Grafico 3: Headcount por BU (bar chart vertical) ──
      const headcountCanvas = document.getElementById('rhChartHeadcount');
      if (headcountCanvas) {
        new Chart(headcountCanvas, {
          type: 'bar',
          data: {
            labels: buEntries.map(([bu]) => bu),
            datasets: [{
              label: 'Pessoas',
              data: buEntries.map(([, d]) => d.count),
              backgroundColor: buEntries.map(([, d]) => d.color + '99'),
              borderColor: buEntries.map(([, d]) => d.color),
              borderWidth: 1,
              borderRadius: 6,
              barPercentage: 0.6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: ctx => `${ctx.parsed.y} pessoa${ctx.parsed.y !== 1 ? 's' : ''}`
                }
              }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11, weight: '600' } } },
              y: { grid: { color: gridColor }, ticks: { color: mutedColor, font: { size: 11 }, stepSize: 1 }, beginAtZero: true }
            }
          }
        });
      }

      // ── Grafico 4: Headcount Evolution (line chart) — Fase E ──
      const hcEvoCanvas = document.getElementById('rhChartHeadcountEvolution');
      if (hcEvoCanvas) {
        // Calcular headcount mensal baseado em start_date
        const months = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push(d);
        }
        const hcData = months.map(m => {
          const endOfMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0);
          return team.filter(t => {
            const start = t.inicio || t.start_date;
            if (!start) return true;
            return new Date(start) <= endOfMonth;
          }).length;
        });

        new Chart(hcEvoCanvas, {
          type: 'line',
          data: {
            labels: months.map(m => m.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })),
            datasets: [{
              label: 'Headcount',
              data: hcData,
              borderColor: '#3A7BD5',
              backgroundColor: 'rgba(58, 123, 213, 0.1)',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { color: mutedColor, font: { size: 10 } } },
              y: { grid: { color: gridColor }, ticks: { color: mutedColor, stepSize: 1 }, beginAtZero: true }
            }
          }
        });
      }

      // ── Analytics async: 1:1 Compliance + Recognition Index ──
      this._loadAnalytics1on1Compliance();
      this._loadAnalyticsRecognition();

      // Bind hover cards nos nomes
      if (typeof TBO_HOVER_CARD !== 'undefined') {
        const container = document.getElementById('rhTabContent');
        if (container) TBO_HOVER_CARD.bind(container);
      }
    },

    // ── Analytics: 1:1 Compliance (async) ──
    async _loadAnalytics1on1Compliance() {
      const container = document.getElementById('rhAnalytics1on1Compliance');
      if (!container) return;
      try {
        if (typeof OneOnOnesRepo === 'undefined') { container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Sem dados</div>'; return; }
        const kpis = await OneOnOnesRepo.getKPIs();
        const total = kpis.total || 0;
        const completed = kpis.byStatus?.completed || 0;
        const scheduled = kpis.byStatus?.scheduled || 0;
        const noShow = kpis.byStatus?.no_show || 0;
        const compliance = total > 0 ? Math.round(((completed) / total) * 100) : 0;

        container.innerHTML = `
          <div style="text-align:center;margin-bottom:12px;">
            <div style="font-size:2.2rem;font-weight:800;color:${compliance >= 75 ? 'var(--color-success)' : compliance >= 50 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${compliance}%</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">taxa de conclusão</div>
          </div>
          <div style="display:flex;gap:12px;justify-content:center;">
            <div style="text-align:center;"><div style="font-size:1rem;font-weight:700;color:var(--color-success);">${completed}</div><div style="font-size:0.62rem;color:var(--text-muted);">Concluídas</div></div>
            <div style="text-align:center;"><div style="font-size:1rem;font-weight:700;color:var(--color-info);">${scheduled}</div><div style="font-size:0.62rem;color:var(--text-muted);">Agendadas</div></div>
            <div style="text-align:center;"><div style="font-size:1rem;font-weight:700;color:var(--color-danger);">${noShow}</div><div style="font-size:0.62rem;color:var(--text-muted);">No-show</div></div>
            <div style="text-align:center;"><div style="font-size:1rem;font-weight:700;color:var(--accent-gold);">${kpis.pendingActions || 0}</div><div style="font-size:0.62rem;color:var(--text-muted);">Ações pend.</div></div>
          </div>
        `;
      } catch (e) { container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Erro ao carregar</div>'; }
    },

    // ── Analytics: Recognition Index (async) ──
    async _loadAnalyticsRecognition() {
      const container = document.getElementById('rhAnalyticsRecognition');
      if (!container) return;
      try {
        if (typeof RecognitionsRepo === 'undefined') { container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Sem dados</div>'; return; }
        const kpis = await RecognitionsRepo.getKPIs();
        const getName = (uid) => { const p = S._team.find(t => t.supabaseId === uid); return p ? p.nome.split(' ')[0] : uid?.slice(0, 8) || '?'; };

        container.innerHTML = `
          <div style="display:flex;gap:16px;margin-bottom:12px;">
            <div style="text-align:center;flex:1;"><div style="font-size:1.5rem;font-weight:800;color:var(--accent-gold);">${kpis.total}</div><div style="font-size:0.62rem;color:var(--text-muted);">Total</div></div>
            <div style="text-align:center;flex:1;"><div style="font-size:1.5rem;font-weight:800;color:var(--color-success);">${kpis.thisMonth}</div><div style="font-size:0.62rem;color:var(--text-muted);">Este mês</div></div>
          </div>
          ${kpis.topPeople && kpis.topPeople.length ? `
            <div style="font-size:0.72rem;font-weight:600;margin-bottom:6px;color:var(--text-muted);">Top Reconhecidos:</div>
            ${kpis.topPeople.slice(0, 5).map(([uid, count], i) => `
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="font-size:0.68rem;color:var(--text-muted);width:14px;">${i + 1}.</span>
                <span style="font-size:0.78rem;font-weight:500;flex:1;">${S._esc(getName(uid))}</span>
                <span style="font-size:0.72rem;font-weight:700;color:var(--accent-gold);">${count}</span>
              </div>
            `).join('')}
          ` : '<div style="font-size:0.72rem;color:var(--text-muted);">Sem reconhecimentos</div>'}
          ${kpis.byValue && Object.keys(kpis.byValue).length ? `
            <div style="font-size:0.72rem;font-weight:600;margin-top:10px;margin-bottom:6px;color:var(--text-muted);">Por Valor:</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              ${Object.entries(kpis.byValue).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([v, n]) => `<span class="tag" style="font-size:0.6rem;">${S._esc(v)} (${n})</span>`).join('')}
            </div>
          ` : ''}
        `;
      } catch (e) { container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Erro ao carregar</div>'; }
    },

    // ══════════════════════════════════════════════════════════════════
    // DESTROY
    // ══════════════════════════════════════════════════════════════════
    destroy() {}
  };

  TBO_PEOPLE.registerTab('analytics', TabAnalytics);
})();
