// TBO OS — Module: Inteligencia BI (Business Intelligence)
// Churn, LTV, CAC, Pipeline Velocity, Revenue per BU, Scorecard Executivo
const TBO_INTELIGENCIA = {

  render() {
    const ctx = TBO_STORAGE.get('context');
    const dc24 = ctx.dados_comerciais?.['2024'] || {};
    const dc25 = ctx.dados_comerciais?.['2025'] || {};
    const dc26 = ctx.dados_comerciais?.['2026'] || {};
    const fc = dc26.fluxo_caixa || {};
    const projAtivos = ctx.projetos_ativos || [];
    const finalizados = ctx.projetos_finalizados || {};
    const clientes = ctx.clientes_construtoras || [];
    const custosBU = dc26.custos_por_bu || {};
    const deals = TBO_STORAGE.getCrmDeals();

    // Pre-compute all metrics
    const m = this._computeAll(ctx, dc24, dc25, dc26, fc, projAtivos, finalizados, clientes, custosBU, deals);

    return `
      <div class="bi-module">
        <!-- Scorecard Executivo -->
        ${this._renderScorecard(m)}

        <!-- Saude do Cliente -->
        ${this._renderClientHealth(m)}

        <!-- Unit Economics -->
        ${this._renderUnitEconomics(m)}

        <!-- Pipeline Intelligence -->
        ${this._renderPipeline(m)}

        <!-- Revenue por BU -->
        ${this._renderRevenueBU(m)}

        <!-- Saude Financeira -->
        ${this._renderFinancialHealth(m)}
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════
  // COMPUTE ALL METRICS
  // ═══════════════════════════════════════════════════════════════════
  _computeAll(ctx, dc24, dc25, dc26, fc, projAtivos, finalizados, clientes, custosBU, deals) {
    const m = {};

    // --- Client Health ---
    const activeConstrutoras = new Set(projAtivos.map(p => p.construtora));
    const clients2025 = new Set();
    const clients2024 = new Set();
    (finalizados['2025'] || []).forEach(p => {
      clientes.forEach(c => { if (p.toLowerCase().includes(c.toLowerCase())) clients2025.add(c); });
    });
    (finalizados['2024'] || []).forEach(p => {
      clientes.forEach(c => { if (p.toLowerCase().includes(c.toLowerCase())) clients2024.add(c); });
    });
    // Also count active projects clients as 2025/2026 clients
    projAtivos.forEach(p => { if (p.construtora) clients2025.add(p.construtora); });

    const previousClients = new Set([...clients2024, ...clients2025]);
    const churnedClients = [...previousClients].filter(c => !activeConstrutoras.has(c));
    m.churnRate = previousClients.size > 0 ? Math.round((churnedClients.length / previousClients.size) * 100) : 0;
    m.retentionRate = 100 - m.churnRate;
    m.churnedClients = churnedClients;
    m.activeClients = activeConstrutoras.size;
    m.totalHistoricalClients = previousClients.size;

    // Repeat customers: clients with projects in 2+ years
    const clientYears = {};
    Object.entries(finalizados).forEach(([year, list]) => {
      list.forEach(p => {
        clientes.forEach(c => {
          if (p.toLowerCase().includes(c.toLowerCase())) {
            if (!clientYears[c]) clientYears[c] = new Set();
            clientYears[c].add(year);
          }
        });
      });
    });
    projAtivos.forEach(p => {
      if (p.construtora && clientYears[p.construtora]) clientYears[p.construtora].add('2026');
      else if (p.construtora) clientYears[p.construtora] = new Set(['2026']);
    });
    const repeatClients = Object.entries(clientYears).filter(([, years]) => years.size >= 2);
    m.repeatRate = clientes.length > 0 ? Math.round((repeatClients.length / clientes.length) * 100) : 0;
    m.repeatClients = repeatClients.map(([name, years]) => ({ name, years: years.size })).sort((a,b) => b.years - a.years);

    // Projects per client
    const projectsPerClient = {};
    projAtivos.forEach(p => {
      projectsPerClient[p.construtora] = (projectsPerClient[p.construtora] || 0) + 1;
    });
    m.projectsPerClient = projectsPerClient;
    const counts = Object.values(projectsPerClient);
    m.avgProjectsPerClient = counts.length > 0 ? (counts.reduce((s,v) => s+v, 0) / counts.length).toFixed(1) : '0';

    // --- Unit Economics ---
    const ticket24 = dc24.ticket_medio || 0;
    const ticket25 = dc25.ticket_medio || 0;
    m.ticket24 = ticket24;
    m.ticket25 = ticket25;
    m.ticketChange = ticket24 > 0 ? Math.round(((ticket25 - ticket24) / ticket24) * 100) : 0;

    // Total projects per client average (from history)
    const allProjectCounts = Object.values(clientYears).map(y => y.size);
    const avgRepeatFactor = allProjectCounts.length > 0 ? allProjectCounts.reduce((s,v) => s+v,0) / allProjectCounts.length : 1;

    // LTV = ticket_medio * avgRepeatFactor * (1 - churnRate/100)
    const currentTicket = ticket25 || ticket24;
    const marginEstimate = 0.15; // ~15% margin based on fluxo data
    m.ltv = Math.round(currentTicket * avgRepeatFactor * (1 / (m.churnRate > 0 ? m.churnRate / 100 : 0.15)));
    m.ltvSimple = Math.round(currentTicket * avgRepeatFactor);

    // CAC
    const vendas = fc.despesas_detalhadas?.vendas || {};
    const mktCost = fc.despesas_detalhadas?.marketing || {};
    const cacAnnual = (vendas.total_anual || 0) + (mktCost.total_anual || 0);
    const newClientsPerYear = dc25.contratos || dc24.contratos || 1;
    m.cac = Math.round(cacAnnual / newClientsPerYear);
    m.ltvCacRatio = m.cac > 0 ? (m.ltvSimple / m.cac).toFixed(1) : '—';

    // Revenue per client
    const totalVendido = dc25.total_vendido || dc24.total_vendido || 0;
    const nClients = dc25.contratos || dc24.contratos || 1;
    m.revenuePerClient = Math.round(totalVendido / nClients);

    // Concentration — top 5 clients by active projects
    const sortedClients = Object.entries(projectsPerClient).sort((a,b) => b[1] - a[1]);
    const top5 = sortedClients.slice(0, 5);
    const totalActiveProjects = projAtivos.length;
    m.top5Concentration = totalActiveProjects > 0 ? Math.round((top5.reduce((s, [,c]) => s + c, 0) / totalActiveProjects) * 100) : 0;
    m.top5Clients = top5;

    // Revenue concentration from contas_a_receber
    const cr = fc.contas_a_receber || {};
    const crFev = cr.fevereiro || {};
    const crClients = crFev.clientes || [];
    const totalCR = crFev.total || 0;
    const sortedCR = [...crClients].sort((a,b) => (b.valor||0) - (a.valor||0));
    m.crTop5 = sortedCR.slice(0, 5);
    m.crTotal = totalCR;
    m.crConcentration = totalCR > 0 ? Math.round((sortedCR.slice(0,3).reduce((s,c) => s + (c.valor||0), 0) / totalCR) * 100) : 0;

    // --- Pipeline Intelligence ---
    m.winRate24 = parseFloat(dc24.conversao_proposta) || 0;
    m.winRate25 = parseFloat(dc25.conversao_proposta) || 0;
    m.winRateTrend = m.winRate25 - m.winRate24;
    m.proposals24 = dc24.propostas || 0;
    m.proposals25 = dc25.propostas || 0;
    m.proposalGrowth = m.proposals24 > 0 ? Math.round(((m.proposals25 - m.proposals24) / m.proposals24) * 100) : 0;
    m.finConversion24 = parseFloat(dc24.conversao_financeira) || 0;
    m.finConversion25 = parseFloat(dc25.conversao_financeira) || 0;

    // CRM pipeline stats
    const activeDeals = deals.filter(d => !['fechado_ganho','fechado_perdido'].includes(d.stage));
    const wonDeals = deals.filter(d => d.stage === 'fechado_ganho');
    const lostDeals = deals.filter(d => d.stage === 'fechado_perdido');
    m.pipelineValue = activeDeals.reduce((s,d) => s + (d.value||0), 0);
    m.pipelineCount = activeDeals.length;
    m.wonCount = wonDeals.length;
    m.lostCount = lostDeals.length;
    m.crmWinRate = (wonDeals.length + lostDeals.length) > 0 ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100) : 0;

    // Pipeline velocity
    const metaMensal = fc.meta_vendas_mensal || 180000;
    m.pipelineCoverage = metaMensal > 0 ? (m.pipelineValue / metaMensal).toFixed(1) : '0';
    m.metaMensal = metaMensal;

    // Forecast accuracy
    const receitaReal = (fc.meses_realizados || []).reduce((s, mes) => s + ((fc.receita_mensal || {})[mes] || 0), 0);
    const receitaOrcada = (fc.meses_realizados || []).reduce((s, mes) => {
      // Use orcada as meta_vendas_mensal per month
      return s + metaMensal;
    }, 0);
    m.forecastAccuracy = receitaOrcada > 0 ? Math.round((receitaReal / receitaOrcada) * 100) : 0;
    m.receitaReal = receitaReal;
    m.receitaOrcada = receitaOrcada;

    // --- Revenue by BU ---
    const buCount = {};
    projAtivos.forEach(p => {
      (p.bus || []).forEach(bu => {
        buCount[bu] = (buCount[bu] || 0) + 1;
      });
    });
    m.buDistribution = Object.entries(buCount).sort((a,b) => b[1] - a[1]);
    m.buCosts = custosBU;
    m.totalBUs = Object.keys(buCount).length;

    // --- Financial Health ---
    const mesesRealizados = fc.meses_realizados || [];
    const despesaTotal = mesesRealizados.reduce((s, mes) => s + ((fc.despesa_mensal || {})[mes] || 0), 0);
    const resultadoTotal = receitaReal - despesaTotal;
    m.margemYTD = receitaReal > 0 ? ((resultadoTotal / receitaReal) * 100).toFixed(1) : '0';
    m.resultadoYTD = resultadoTotal;
    m.receitaYTD = receitaReal;
    m.despesaYTD = despesaTotal;

    // Burn rate (average monthly expense)
    const avgBurnRate = mesesRealizados.length > 0 ? despesaTotal / mesesRealizados.length : (fc.despesa_total_orcada || 0) / 12;
    m.burnRate = Math.round(avgBurnRate);
    m.saldoProjetado = fc.saldo_caixa_projetado || 0;
    m.runway = avgBurnRate > 0 ? Math.max(0, Math.round(Math.abs(m.saldoProjetado) / avgBurnRate)) : 12;
    // If positive saldo, runway is months until zero at current burn
    if (m.saldoProjetado > 0) m.runway = Math.round(m.saldoProjetado / avgBurnRate);

    // Break-even
    m.breakEven = Math.round(avgBurnRate);

    // Inadimplencia
    const emAberto = crFev.em_aberto || 0;
    const totalFev = crFev.total || 1;
    m.inadimplencia = Math.round((emAberto / totalFev) * 100);
    m.emAberto = emAberto;

    // Monthly P&L
    m.monthlyPL = {};
    const allMonths = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    allMonths.forEach(mes => {
      m.monthlyPL[mes] = {
        receita: (fc.receita_mensal || {})[mes] || 0,
        despesa: (fc.despesa_mensal || {})[mes] || 0,
        resultado: (fc.resultado_mensal || {})[mes] || 0,
        margem: (fc.margem_mensal || {})[mes] || '—',
        realizado: (fc.meses_realizados || []).includes(mes)
      };
    });

    return m;
  },

  // ═══════════════════════════════════════════════════════════════════
  // SCORECARD EXECUTIVO
  // ═══════════════════════════════════════════════════════════════════
  _renderScorecard(m) {
    const kpis = [
      { label: 'Margem YTD', value: `${m.margemYTD}%`, status: parseFloat(m.margemYTD) > 10 ? 'green' : parseFloat(m.margemYTD) > 5 ? 'yellow' : 'red' },
      { label: 'Churn Rate', value: `${m.churnRate}%`, status: m.churnRate < 15 ? 'green' : m.churnRate < 25 ? 'yellow' : 'red' },
      { label: 'LTV:CAC', value: `${m.ltvCacRatio}x`, status: parseFloat(m.ltvCacRatio) > 3 ? 'green' : parseFloat(m.ltvCacRatio) > 2 ? 'yellow' : 'red' },
      { label: 'Win Rate', value: `${m.winRate25}%`, status: m.winRate25 > 40 ? 'green' : m.winRate25 > 30 ? 'yellow' : 'red' },
      { label: 'Cobertura Pipeline', value: `${m.pipelineCoverage}x`, status: parseFloat(m.pipelineCoverage) > 3 ? 'green' : parseFloat(m.pipelineCoverage) > 1.5 ? 'yellow' : 'red' },
      { label: 'Concentracao Top5', value: `${m.top5Concentration}%`, status: m.top5Concentration < 50 ? 'green' : m.top5Concentration < 70 ? 'yellow' : 'red' },
      { label: 'Inadimplencia', value: `${m.inadimplencia}%`, status: m.inadimplencia < 20 ? 'green' : m.inadimplencia < 40 ? 'yellow' : 'red' },
      { label: 'Forecast Accuracy', value: `${m.forecastAccuracy}%`, status: m.forecastAccuracy > 80 ? 'green' : m.forecastAccuracy > 60 ? 'yellow' : 'red' }
    ];

    return `
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Scorecard Executivo</h2>
          <span style="font-size:0.72rem;color:var(--text-muted);">Dados 2025/2026</span>
        </div>
        <div class="bi-scorecard-grid">
          ${kpis.map(k => `
            <div class="bi-score-card">
              <div class="bi-score-light bi-score-light--${k.status}"></div>
              <div class="bi-score-body">
                <div class="bi-score-value">${k.value}</div>
                <div class="bi-score-label">${k.label}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════
  // SAUDE DO CLIENTE
  // ═══════════════════════════════════════════════════════════════════
  _renderClientHealth(m) {
    return `
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Saude do Cliente</h2>
        </div>
        <div class="bi-kpi-row">
          <div class="bi-kpi">
            <div class="bi-kpi-value ${m.churnRate > 20 ? 'bi-kpi--red' : m.churnRate > 10 ? 'bi-kpi--yellow' : 'bi-kpi--green'}">${m.churnRate}%</div>
            <div class="bi-kpi-label">Churn Rate</div>
            <div class="bi-kpi-sub">${m.churnedClients.length} de ${m.totalHistoricalClients} clientes</div>
          </div>
          <div class="bi-kpi">
            <div class="bi-kpi-value bi-kpi--green">${m.retentionRate}%</div>
            <div class="bi-kpi-label">Retencao</div>
            <div class="bi-kpi-sub">${m.activeClients} clientes ativos</div>
          </div>
          <div class="bi-kpi">
            <div class="bi-kpi-value">${m.repeatRate}%</div>
            <div class="bi-kpi-label">Taxa Recompra</div>
            <div class="bi-kpi-sub">${m.repeatClients.length} clientes recorrentes</div>
          </div>
          <div class="bi-kpi">
            <div class="bi-kpi-value">${m.avgProjectsPerClient}</div>
            <div class="bi-kpi-label">Projetos/Cliente</div>
            <div class="bi-kpi-sub">media de projetos ativos</div>
          </div>
        </div>

        <!-- Churned clients list -->
        ${m.churnedClients.length > 0 ? `
          <div class="bi-detail-box bi-detail-box--warning">
            <h4 class="bi-detail-title">Clientes Churned (sem projeto ativo)</h4>
            <div class="bi-client-tags">
              ${m.churnedClients.map(c => `<span class="bi-tag bi-tag--red">${c}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Top repeat clients -->
        <div class="bi-detail-box">
          <h4 class="bi-detail-title">Top Clientes Recorrentes</h4>
          <div class="bi-mini-table">
            ${m.repeatClients.slice(0, 8).map(c => `
              <div class="bi-mini-row">
                <span class="bi-mini-name">${c.name}</span>
                <span class="bi-mini-val">${c.years} anos</span>
                <span class="bi-mini-bar"><span style="width:${Math.min(100, c.years * 20)}%;background:var(--accent-primary);"></span></span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════
  // UNIT ECONOMICS
  // ═══════════════════════════════════════════════════════════════════
  _renderUnitEconomics(m) {
    return `
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Unit Economics</h2>
        </div>
        <div class="bi-kpi-row">
          <div class="bi-kpi">
            <div class="bi-kpi-value">${this._fmtCurrency(m.ltvSimple)}</div>
            <div class="bi-kpi-label">LTV Estimado</div>
            <div class="bi-kpi-sub">ticket × freq. recompra</div>
          </div>
          <div class="bi-kpi">
            <div class="bi-kpi-value">${this._fmtCurrency(m.cac)}</div>
            <div class="bi-kpi-label">CAC</div>
            <div class="bi-kpi-sub">vendas+mkt / novos clientes</div>
          </div>
          <div class="bi-kpi">
            <div class="bi-kpi-value ${parseFloat(m.ltvCacRatio) > 3 ? 'bi-kpi--green' : parseFloat(m.ltvCacRatio) > 2 ? 'bi-kpi--yellow' : 'bi-kpi--red'}">${m.ltvCacRatio}x</div>
            <div class="bi-kpi-label">LTV:CAC</div>
            <div class="bi-kpi-sub">${parseFloat(m.ltvCacRatio) > 3 ? 'Saudavel' : parseFloat(m.ltvCacRatio) > 2 ? 'Atencao' : 'Critico'}</div>
          </div>
          <div class="bi-kpi">
            <div class="bi-kpi-value">${this._fmtCurrency(m.revenuePerClient)}</div>
            <div class="bi-kpi-label">Revenue/Cliente</div>
            <div class="bi-kpi-sub">media por contrato</div>
          </div>
        </div>

        <!-- Ticket Trend -->
        <div class="bi-detail-box">
          <h4 class="bi-detail-title">Evolucao Ticket Medio</h4>
          <div class="bi-trend-bars">
            <div class="bi-trend-item">
              <span class="bi-trend-year">2024</span>
              <div class="bi-trend-bar-wrap">
                <div class="bi-trend-bar" style="width:${m.ticket24 > 0 ? 100 : 0}%;background:var(--accent-primary);"></div>
              </div>
              <span class="bi-trend-val">${this._fmtCurrency(m.ticket24)}</span>
            </div>
            <div class="bi-trend-item">
              <span class="bi-trend-year">2025</span>
              <div class="bi-trend-bar-wrap">
                <div class="bi-trend-bar" style="width:${m.ticket24 > 0 ? Math.round((m.ticket25 / m.ticket24) * 100) : 0}%;background:${m.ticketChange >= 0 ? '#22c55e' : '#ef4444'};"></div>
              </div>
              <span class="bi-trend-val">${this._fmtCurrency(m.ticket25)} <small style="color:${m.ticketChange >= 0 ? '#22c55e' : '#ef4444'};">(${m.ticketChange > 0 ? '+' : ''}${m.ticketChange}%)</small></span>
            </div>
          </div>
        </div>

        <!-- Revenue Concentration -->
        <div class="bi-detail-box">
          <h4 class="bi-detail-title">Concentracao de Receita (Fev/2026)</h4>
          <div class="bi-concentration">
            <div class="bi-concentration-header">
              <span>Top 3 = <strong>${m.crConcentration}%</strong> da receita</span>
              <span class="bi-tag ${m.crConcentration > 60 ? 'bi-tag--red' : m.crConcentration > 40 ? 'bi-tag--yellow' : 'bi-tag--green'}">${m.crConcentration > 60 ? 'Alto risco' : m.crConcentration > 40 ? 'Moderado' : 'Diversificado'}</span>
            </div>
            ${m.crTop5.map(c => {
              const pct = m.crTotal > 0 ? Math.round((c.valor / m.crTotal) * 100) : 0;
              return `<div class="bi-mini-row">
                <span class="bi-mini-name">${c.nome}</span>
                <span class="bi-mini-val">${this._fmtCurrency(c.valor)} (${pct}%)</span>
                <span class="bi-mini-bar"><span style="width:${pct}%;background:var(--accent-primary);"></span></span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </section>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════
  // PIPELINE INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════
  _renderPipeline(m) {
    return `
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Pipeline Intelligence</h2>
          <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('pipeline')">Ver Pipeline &rarr;</button>
        </div>
        <div class="bi-kpi-row">
          <div class="bi-kpi">
            <div class="bi-kpi-value">${m.winRate25}%</div>
            <div class="bi-kpi-label">Win Rate 2025</div>
            <div class="bi-kpi-sub" style="color:${m.winRateTrend >= 0 ? '#22c55e' : '#ef4444'};">${m.winRateTrend >= 0 ? '+' : ''}${m.winRateTrend.toFixed(1)}pp vs 2024</div>
          </div>
          <div class="bi-kpi">
            <div class="bi-kpi-value">${this._fmtCurrency(m.pipelineValue)}</div>
            <div class="bi-kpi-label">Pipeline Ativo</div>
            <div class="bi-kpi-sub">${m.pipelineCount} deals</div>
          </div>
          <div class="bi-kpi">
            <div class="bi-kpi-value ${parseFloat(m.pipelineCoverage) > 3 ? 'bi-kpi--green' : 'bi-kpi--yellow'}">${m.pipelineCoverage}x</div>
            <div class="bi-kpi-label">Cobertura</div>
            <div class="bi-kpi-sub">vs meta R$ ${this._fmtCurrency(m.metaMensal)}/mes</div>
          </div>
          <div class="bi-kpi">
            <div class="bi-kpi-value">${m.forecastAccuracy}%</div>
            <div class="bi-kpi-label">Forecast Accuracy</div>
            <div class="bi-kpi-sub">real vs orcado YTD</div>
          </div>
        </div>

        <!-- Year comparison -->
        <div class="bi-detail-box">
          <h4 class="bi-detail-title">Comparativo Anual</h4>
          <table class="bi-table">
            <thead><tr><th>Metrica</th><th>2024</th><th>2025</th><th>Var.</th></tr></thead>
            <tbody>
              <tr><td>Propostas</td><td>${m.proposals24}</td><td>${m.proposals25}</td><td style="color:${m.proposalGrowth >= 0 ? '#22c55e' : '#ef4444'};">${m.proposalGrowth > 0 ? '+' : ''}${m.proposalGrowth}%</td></tr>
              <tr><td>Win Rate</td><td>${m.winRate24}%</td><td>${m.winRate25}%</td><td style="color:${m.winRateTrend >= 0 ? '#22c55e' : '#ef4444'};">${m.winRateTrend >= 0 ? '+' : ''}${m.winRateTrend.toFixed(1)}pp</td></tr>
              <tr><td>Conversao Fin.</td><td>${m.finConversion24}%</td><td>${m.finConversion25}%</td><td style="color:${m.finConversion25 >= m.finConversion24 ? '#22c55e' : '#ef4444'};">${(m.finConversion25 - m.finConversion24) >= 0 ? '+' : ''}${(m.finConversion25 - m.finConversion24).toFixed(1)}pp</td></tr>
              <tr><td>Ticket Medio</td><td>${this._fmtCurrency(m.ticket24)}</td><td>${this._fmtCurrency(m.ticket25)}</td><td style="color:${m.ticketChange >= 0 ? '#22c55e' : '#ef4444'};">${m.ticketChange > 0 ? '+' : ''}${m.ticketChange}%</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════
  // REVENUE POR BU
  // ═══════════════════════════════════════════════════════════════════
  _renderRevenueBU(m) {
    const buKeys = { 'Digital 3D': 'digital_3d', 'Audiovisual': 'audiovisual', 'Branding': 'branding', 'Marketing': 'marketing', 'Interiores': 'interiores' };
    const totalProjects = m.buDistribution.reduce((s, [,c]) => s + c, 0);

    return `
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Revenue por Business Unit</h2>
        </div>
        <div class="bi-bu-grid">
          ${m.buDistribution.map(([bu, count]) => {
            const pct = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0;
            const costKey = buKeys[bu] || bu.toLowerCase().replace(/\s+/g, '_');
            const cost = m.buCosts[costKey];
            const fixo = cost ? cost.despesa_fixa : 0;
            return `
              <div class="bi-bu-card">
                <div class="bi-bu-header">
                  <span class="bi-bu-name">${bu}</span>
                  <span class="bi-bu-count">${count} projetos</span>
                </div>
                <div class="bi-bu-bar-wrap">
                  <div class="bi-bu-bar" style="width:${pct}%;"></div>
                </div>
                <div class="bi-bu-footer">
                  <span>${pct}% do mix</span>
                  ${fixo > 0 ? `<span>Custo fixo: R$ ${this._fmtCurrency(fixo)}/mes</span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════
  // SAUDE FINANCEIRA
  // ═══════════════════════════════════════════════════════════════════
  _renderFinancialHealth(m) {
    const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const monthLabels = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

    return `
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Saude Financeira 2026</h2>
          <button class="btn btn-sm btn-ghost" onclick="TBO_ROUTER.navigate('financeiro')">Detalhar &rarr;</button>
        </div>
        <div class="bi-kpi-row">
          <div class="bi-kpi">
            <div class="bi-kpi-value ${parseFloat(m.margemYTD) > 10 ? 'bi-kpi--green' : parseFloat(m.margemYTD) > 0 ? 'bi-kpi--yellow' : 'bi-kpi--red'}">${m.margemYTD}%</div>
            <div class="bi-kpi-label">Margem YTD</div>
            <div class="bi-kpi-sub">${this._fmtCurrency(m.resultadoYTD)} resultado</div>
          </div>
          <div class="bi-kpi">
            <div class="bi-kpi-value">${this._fmtCurrency(m.burnRate)}</div>
            <div class="bi-kpi-label">Burn Rate/Mes</div>
            <div class="bi-kpi-sub">despesa media mensal</div>
          </div>
          <div class="bi-kpi">
            <div class="bi-kpi-value">${this._fmtCurrency(m.breakEven)}</div>
            <div class="bi-kpi-label">Break-even</div>
            <div class="bi-kpi-sub">receita minima/mes</div>
          </div>
          <div class="bi-kpi">
            <div class="bi-kpi-value ${m.inadimplencia < 20 ? 'bi-kpi--green' : m.inadimplencia < 40 ? 'bi-kpi--yellow' : 'bi-kpi--red'}">${m.inadimplencia}%</div>
            <div class="bi-kpi-label">Inadimplencia</div>
            <div class="bi-kpi-sub">${this._fmtCurrency(m.emAberto)} em aberto</div>
          </div>
        </div>

        <!-- Monthly P&L Bar Chart (CSS) -->
        <div class="bi-detail-box">
          <h4 class="bi-detail-title">P&L Mensal 2026</h4>
          <div class="bi-monthly-chart">
            ${months.map((mes, i) => {
              const d = m.monthlyPL[mes];
              const maxVal = Math.max(...months.map(mm => Math.max(m.monthlyPL[mm].receita, m.monthlyPL[mm].despesa)));
              const rPct = maxVal > 0 ? Math.round((d.receita / maxVal) * 100) : 0;
              const dPct = maxVal > 0 ? Math.round((d.despesa / maxVal) * 100) : 0;
              const isPositive = d.resultado >= 0;
              return `
                <div class="bi-month-col ${d.realizado ? '' : 'bi-month-col--projected'}">
                  <div class="bi-month-bars">
                    <div class="bi-month-bar bi-month-bar--receita" style="height:${rPct}%;" title="Receita: R$ ${this._fmtCurrency(d.receita)}"></div>
                    <div class="bi-month-bar bi-month-bar--despesa" style="height:${dPct}%;" title="Despesa: R$ ${this._fmtCurrency(d.despesa)}"></div>
                  </div>
                  <div class="bi-month-label">${monthLabels[i]}</div>
                  <div class="bi-month-result" style="color:${isPositive ? '#22c55e' : '#ef4444'};">${isPositive ? '+' : ''}${this._fmtCurrency(d.resultado)}</div>
                </div>
              `;
            }).join('')}
          </div>
          <div class="bi-chart-legend">
            <span class="bi-legend-item"><span class="bi-legend-dot" style="background:#22c55e;"></span> Receita</span>
            <span class="bi-legend-item"><span class="bi-legend-dot" style="background:#ef4444;"></span> Despesa</span>
            <span class="bi-legend-item" style="opacity:0.5;">&#9632; Projetado</span>
          </div>
        </div>
      </section>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════
  _fmtCurrency(val) {
    if (val === null || val === undefined) return '—';
    const abs = Math.abs(val);
    if (abs >= 1000000) return (val < 0 ? '-' : '') + (abs / 1000000).toFixed(1) + 'M';
    if (abs >= 1000) return (val < 0 ? '-' : '') + (abs / 1000).toFixed(0) + 'k';
    return val.toLocaleString('pt-BR');
  },

  init() {
    // Static module — no events to bind
    if (window.lucide) lucide.createIcons();
  }
};
