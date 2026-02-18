// TBO OS — Module: Contas a Receber
// Revenue tracking, aging analysis, receivables by month, and client concentration
const TBO_RECEBER = {

  render() {
    const context = TBO_STORAGE.get('context');
    const fc = context.dados_comerciais?.['2026']?.fluxo_caixa || {};
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const mesesLabel = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const realizados = fc.meses_realizados || [];

    // Monthly revenue
    const recMensal = fc.receita_mensal || {};
    const receitaTotal = meses.reduce((s, m) => s + (recMensal[m] || 0), 0);
    const receitaRealizada = realizados.reduce((s, m) => s + (recMensal[m] || 0), 0);

    // Contas a receber
    const car = fc.contas_a_receber || {};
    const carMeses = Object.keys(car);
    let totalEmAberto = 0, totalPago = 0, totalCar = 0;
    carMeses.forEach(m => {
      totalEmAberto += car[m].em_aberto || 0;
      totalPago += car[m].pago || 0;
      totalCar += car[m].total || 0;
    });

    // Revenue from active projects
    const projects = TBO_STORAGE.getAllErpEntities('project');
    const activeProjects = projects.filter(p => !['finalizado','cancelado'].includes(p.status));
    const revenueFromProjects = activeProjects.reduce((s, p) => s + (p.value || 0), 0);

    // CRM closed deals
    const deals = typeof TBO_STORAGE.getCrmDeals === 'function' ? TBO_STORAGE.getCrmDeals() : [];
    const wonDeals = deals.filter(d => d.stage === 'fechado_ganho');
    const wonTotal = wonDeals.reduce((s, d) => s + (d.value || 0), 0);

    // Meta
    const metaAnual = fc.meta_vendas_anual || fc.receita_total_orcada || 0;
    const atingimento = metaAnual > 0 ? Math.round((receitaRealizada / metaAnual) * 100) : 0;

    const fmt = (v) => 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });

    return `
      <div class="receber-module">
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Receita YTD</div>
            <div class="kpi-value" style="font-size:1.2rem;color:#22c55e;">${fmt(receitaRealizada)}</div>
            <div class="kpi-sublabel">${atingimento}% da meta</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Em Aberto</div>
            <div class="kpi-value" style="font-size:1.2rem;color:#f59e0b;">${fmt(totalEmAberto)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Recebido</div>
            <div class="kpi-value" style="font-size:1.2rem;">${fmt(totalPago)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Receita Projetada Anual</div>
            <div class="kpi-value" style="font-size:1.2rem;">${fmt(receitaTotal)}</div>
          </div>
        </div>

        <!-- Meta Progress -->
        ${metaAnual > 0 ? `
        <div class="card" style="padding:16px;margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:8px;">
            <span style="font-weight:600;">Progresso da Meta Anual</span>
            <span>${fmt(receitaRealizada)} / ${fmt(metaAnual)}</span>
          </div>
          <div style="background:var(--bg-tertiary);border-radius:6px;height:24px;overflow:hidden;">
            <div style="background:linear-gradient(90deg, #22c55e, #3b82f6);height:100%;width:${Math.min(100, atingimento)}%;border-radius:6px;transition:width 0.3s;display:flex;align-items:center;justify-content:center;">
              <span style="font-size:0.7rem;font-weight:700;color:white;">${atingimento}%</span>
            </div>
          </div>
        </div>` : ''}

        <!-- Tabs -->
        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="rc-mensal">Receita Mensal</button>
          <button class="tab" data-tab="rc-receber">Contas a Receber</button>
          <button class="tab" data-tab="rc-projetos">Por Projeto</button>
          <button class="tab" data-tab="rc-deals">Deals Fechados</button>
        </div>

        <!-- Tab: Receita Mensal -->
        <div class="tab-content active" id="tab-rc-mensal">
          <div class="card" style="padding:16px;overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
              <thead>
                <tr style="border-bottom:2px solid var(--border-default);text-align:right;">
                  <th style="padding:8px;text-align:left;">Mes</th>
                  <th style="padding:8px;">Receita</th>
                  <th style="padding:8px;">Acumulado</th>
                  <th style="padding:8px;">vs Meta Mensal</th>
                  <th style="padding:8px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
                  let acum = 0;
                  const metaMensal = fc.meta_vendas_mensal || 0;
                  return meses.map((m, i) => {
                    const val = recMensal[m] || 0;
                    acum += val;
                    const isReal = realizados.includes(m);
                    const vsMeta = metaMensal > 0 ? Math.round(((val - metaMensal) / metaMensal) * 100) : 0;
                    return `<tr style="border-bottom:1px solid var(--border-subtle);text-align:right;${isReal ? '' : 'opacity:0.6;'}">
                      <td style="padding:8px;text-align:left;font-weight:600;">${mesesLabel[i]}</td>
                      <td style="padding:8px;">${fmt(val)}</td>
                      <td style="padding:8px;color:var(--text-secondary);">${fmt(acum)}</td>
                      <td style="padding:8px;color:${vsMeta >= 0 ? '#22c55e' : '#ef4444'};">${vsMeta >= 0 ? '+' : ''}${vsMeta}%</td>
                      <td style="padding:8px;">
                        <span class="tag" style="font-size:0.65rem;background:${isReal ? '#22c55e20' : 'var(--bg-tertiary)'};color:${isReal ? '#22c55e' : 'var(--text-muted)'};">${isReal ? 'Realizado' : 'Projetado'}</span>
                      </td>
                    </tr>`;
                  }).join('');
                })()}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab: Contas a Receber -->
        <div class="tab-content" id="tab-rc-receber" style="display:none;">
          ${this._renderContasReceber(car)}
        </div>

        <!-- Tab: Por Projeto -->
        <div class="tab-content" id="tab-rc-projetos" style="display:none;">
          ${this._renderProjectRevenue(activeProjects)}
        </div>

        <!-- Tab: Deals Fechados -->
        <div class="tab-content" id="tab-rc-deals" style="display:none;">
          ${this._renderWonDeals(wonDeals)}
        </div>
      </div>
    `;
  },

  _renderContasReceber(car) {
    const meses = Object.keys(car);
    if (meses.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);">Nenhum dado de contas a receber.</div>';
    }
    const fmt = (v) => 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });

    return `<div class="card" style="padding:16px;">
      <div style="font-weight:600;font-size:0.88rem;margin-bottom:16px;">Aging de Recebiveis</div>
      ${meses.map(m => {
        const d = car[m];
        const total = d.total || 0;
        const pago = d.pago || 0;
        const aberto = d.em_aberto || 0;
        const pctPago = total > 0 ? Math.round((pago / total) * 100) : 0;
        return `<div style="margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px;">
            <span style="font-weight:600;text-transform:capitalize;">${m}</span>
            <span>
              <span style="color:#22c55e;">${fmt(pago)} pago</span> /
              <span style="color:#f59e0b;">${fmt(aberto)} em aberto</span> /
              ${fmt(total)} total
            </span>
          </div>
          <div style="background:var(--bg-tertiary);border-radius:4px;height:20px;overflow:hidden;display:flex;">
            <div style="background:#22c55e;height:100%;width:${pctPago}%;transition:width 0.3s;"></div>
            <div style="background:#f59e0b;height:100%;width:${100 - pctPago}%;transition:width 0.3s;"></div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },

  _renderProjectRevenue(projects) {
    const withValue = projects.filter(p => p.value > 0).sort((a, b) => (b.value || 0) - (a.value || 0));
    if (withValue.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);">Nenhum projeto com valor definido.</div>';
    }
    const fmt = (v) => 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
    const totalRev = withValue.reduce((s, p) => s + p.value, 0);

    return `<div class="card" style="padding:16px;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-default);text-align:right;">
            <th style="padding:8px;text-align:left;">Projeto</th>
            <th style="padding:8px;">Cliente</th>
            <th style="padding:8px;">Valor</th>
            <th style="padding:8px;">% do Total</th>
          </tr>
        </thead>
        <tbody>
          ${withValue.map(p => {
            const pct = totalRev > 0 ? ((p.value / totalRev) * 100).toFixed(1) : '0';
            return `<tr style="border-bottom:1px solid var(--border-subtle);text-align:right;">
              <td style="padding:8px;text-align:left;font-weight:600;">${p.name}</td>
              <td style="padding:8px;color:var(--text-secondary);">${p.client || '-'}</td>
              <td style="padding:8px;">${fmt(p.value)}</td>
              <td style="padding:8px;">
                <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;">
                  <div style="width:60px;background:var(--bg-tertiary);border-radius:3px;height:8px;overflow:hidden;">
                    <div style="background:var(--accent);height:100%;width:${Math.min(100, parseFloat(pct))}%;border-radius:3px;"></div>
                  </div>
                  <span>${pct}%</span>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  },

  _renderWonDeals(deals) {
    if (deals.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);">Nenhum deal fechado no CRM.</div>';
    }
    const fmt = (v) => 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });

    return `<div class="card" style="padding:16px;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-default);text-align:left;">
            <th style="padding:8px;">Deal</th>
            <th style="padding:8px;">Empresa</th>
            <th style="padding:8px;">Servicos</th>
            <th style="padding:8px;text-align:right;">Valor</th>
            <th style="padding:8px;">Owner</th>
          </tr>
        </thead>
        <tbody>
          ${deals.map(d => `<tr style="border-bottom:1px solid var(--border-subtle);">
            <td style="padding:8px;font-weight:600;">${d.name || '-'}</td>
            <td style="padding:8px;">${d.company || '-'}</td>
            <td style="padding:8px;"><span class="tag" style="font-size:0.65rem;">${(d.services || []).join(', ') || '-'}</span></td>
            <td style="padding:8px;text-align:right;font-weight:600;">${fmt(d.value)}</td>
            <td style="padding:8px;color:var(--text-secondary);">${d.owner || '-'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  },

  init() {
    document.querySelectorAll('.receber-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.receber-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.receber-module .tab-content').forEach(tc => { tc.style.display = 'none'; tc.classList.remove('active'); });
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) { target.style.display = ''; target.classList.add('active'); }
      });
    });
  },

  destroy() {}
};
