// TBO OS — Module: Conciliacao
// Realizado vs Projetado — monthly reconciliation of actuals vs budget
const TBO_CONCILIACAO = {

  render() {
    const context = TBO_STORAGE.get('context');
    const fc = context.dados_comerciais?.[TBO_CONFIG.app.fiscalYear]?.fluxo_caixa || {};
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const mesesLabel = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const realizados = fc.meses_realizados || [];

    const recMensal = fc.receita_mensal || {};
    const despMensal = fc.despesa_mensal || {};
    const resMensal = fc.resultado_mensal || {};
    const margemMensal = fc.margem_mensal || {};

    // Totals
    const receitaOrcada = fc.receita_total_orcada || 0;
    const despesaOrcada = fc.despesa_total_orcada || 0;
    const resultadoOrcado = fc.resultado_liquido_orcado || 0;

    const receitaProjetada = fc.receita_total_projetada || meses.reduce((s, m) => s + (recMensal[m] || 0), 0);
    const despesaProjetada = fc.despesa_total_projetada || meses.reduce((s, m) => s + (despMensal[m] || 0), 0);
    const resultadoProjetado = fc.resultado_liquido_projetado || (receitaProjetada - despesaProjetada);

    // Realized totals
    const receitaReal = realizados.reduce((s, m) => s + (recMensal[m] || 0), 0);
    const despesaReal = realizados.reduce((s, m) => s + (despMensal[m] || 0), 0);
    const resultadoReal = receitaReal - despesaReal;

    // Variances
    const mesesCount = realizados.length;
    const receitaOrcadaProporcional = mesesCount > 0 ? (receitaOrcada / 12) * mesesCount : 0;
    const despesaOrcadaProporcional = mesesCount > 0 ? (despesaOrcada / 12) * mesesCount : 0;
    const varReceita = receitaOrcadaProporcional > 0 ? Math.round(((receitaReal - receitaOrcadaProporcional) / receitaOrcadaProporcional) * 100) : 0;
    const varDespesa = despesaOrcadaProporcional > 0 ? Math.round(((despesaReal - despesaOrcadaProporcional) / despesaOrcadaProporcional) * 100) : 0;

    const fmt = (v) => 'R$ ' + Math.round(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });

    return `
      <div class="conciliacao-module">
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Meses Realizados</div>
            <div class="kpi-value">${mesesCount}/12</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Resultado YTD</div>
            <div class="kpi-value" style="font-size:1.1rem;color:${resultadoReal >= 0 ? '#22c55e' : '#ef4444'};">${fmt(resultadoReal)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Var. Receita vs Orcado</div>
            <div class="kpi-value" style="color:${varReceita >= 0 ? '#22c55e' : '#ef4444'};">${varReceita >= 0 ? '+' : ''}${varReceita}%</div>
            <div class="kpi-sublabel">proporcional ao periodo</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Var. Despesa vs Orcado</div>
            <div class="kpi-value" style="color:${varDespesa <= 0 ? '#22c55e' : '#ef4444'};">${varDespesa >= 0 ? '+' : ''}${varDespesa}%</div>
            <div class="kpi-sublabel">proporcional ao periodo</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="cc-mensal">Fluxo Mensal</button>
          <button class="tab" data-tab="cc-acumulado">Acumulado</button>
          <button class="tab" data-tab="cc-orcamento">Orcado vs Projetado</button>
        </div>

        <!-- Tab: Fluxo Mensal -->
        <div class="tab-content active" id="tab-cc-mensal">
          ${this._renderMonthlyFlow(meses, mesesLabel, realizados, recMensal, despMensal, resMensal, margemMensal)}
        </div>

        <!-- Tab: Acumulado -->
        <div class="tab-content" id="tab-cc-acumulado" style="display:none;">
          ${this._renderAccumulated(meses, mesesLabel, realizados, recMensal, despMensal)}
        </div>

        <!-- Tab: Orcado vs Projetado -->
        <div class="tab-content" id="tab-cc-orcamento" style="display:none;">
          ${this._renderBudgetComparison(receitaOrcada, despesaOrcada, resultadoOrcado, receitaProjetada, despesaProjetada, resultadoProjetado, receitaReal, despesaReal, resultadoReal, mesesCount)}
        </div>
      </div>
    `;
  },

  _renderMonthlyFlow(meses, mesesLabel, realizados, recMensal, despMensal, resMensal, margemMensal) {
    const fmt = (v) => 'R$ ' + Math.round(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });

    return `<div class="card" style="padding:16px;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-default);text-align:right;">
            <th style="padding:10px 8px;text-align:left;">Mes</th>
            <th style="padding:10px 8px;">Receita</th>
            <th style="padding:10px 8px;">Despesa</th>
            <th style="padding:10px 8px;">Resultado</th>
            <th style="padding:10px 8px;">Margem</th>
            <th style="padding:10px 8px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${meses.map((m, i) => {
            const rec = recMensal[m] || 0;
            const desp = despMensal[m] || 0;
            const res = resMensal[m] || (rec - desp);
            const margem = margemMensal[m] || (rec > 0 ? ((res / rec) * 100).toFixed(1) : '0');
            const isReal = realizados.includes(m);
            const resColor = res >= 0 ? '#22c55e' : '#ef4444';

            return `<tr style="border-bottom:1px solid var(--border-subtle);text-align:right;${isReal ? '' : 'opacity:0.55;'}">
              <td style="padding:10px 8px;text-align:left;font-weight:600;">${mesesLabel[i]}</td>
              <td style="padding:10px 8px;">${fmt(rec)}</td>
              <td style="padding:10px 8px;">${fmt(desp)}</td>
              <td style="padding:10px 8px;font-weight:600;color:${resColor};">${fmt(res)}</td>
              <td style="padding:10px 8px;color:${parseFloat(margem) >= 0 ? '#22c55e' : '#ef4444'};">${margem}%</td>
              <td style="padding:10px 8px;">
                <span class="tag" style="font-size:0.65rem;background:${isReal ? '#22c55e20' : 'var(--bg-tertiary)'};color:${isReal ? '#22c55e' : 'var(--text-muted)'};">${isReal ? 'REAL' : 'PROJETADO'}</span>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
        <tfoot>
          <tr style="border-top:2px solid var(--border-default);text-align:right;font-weight:700;">
            <td style="padding:10px 8px;text-align:left;">TOTAL</td>
            <td style="padding:10px 8px;">${fmt(meses.reduce((s, m) => s + (recMensal[m] || 0), 0))}</td>
            <td style="padding:10px 8px;">${fmt(meses.reduce((s, m) => s + (despMensal[m] || 0), 0))}</td>
            ${(() => {
              const tRec = meses.reduce((s, m) => s + (recMensal[m] || 0), 0);
              const tDesp = meses.reduce((s, m) => s + (despMensal[m] || 0), 0);
              const tRes = tRec - tDesp;
              const tMarg = tRec > 0 ? ((tRes / tRec) * 100).toFixed(1) : '0';
              return `<td style="padding:10px 8px;color:${tRes >= 0 ? '#22c55e' : '#ef4444'};">${fmt(tRes)}</td>
                      <td style="padding:10px 8px;">${tMarg}%</td>`;
            })()}
            <td style="padding:10px 8px;">
              <span style="font-size:0.72rem;color:var(--text-muted);">${realizados.length} real / ${12 - realizados.length} proj.</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>`;
  },

  _renderAccumulated(meses, mesesLabel, realizados, recMensal, despMensal) {
    const fmt = (v) => 'R$ ' + Math.round(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });

    let acumRec = 0, acumDesp = 0;
    const rows = meses.map((m, i) => {
      acumRec += recMensal[m] || 0;
      acumDesp += despMensal[m] || 0;
      const acumRes = acumRec - acumDesp;
      const isReal = realizados.includes(m);
      return { label: mesesLabel[i], acumRec, acumDesp, acumRes, isReal };
    });

    return `<div class="card" style="padding:16px;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-default);text-align:right;">
            <th style="padding:10px 8px;text-align:left;">Mes</th>
            <th style="padding:10px 8px;">Receita Acum.</th>
            <th style="padding:10px 8px;">Despesa Acum.</th>
            <th style="padding:10px 8px;">Resultado Acum.</th>
            <th style="padding:10px 8px;">Margem Acum.</th>
            <th style="padding:10px 8px;">Barra</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => {
            const margem = r.acumRec > 0 ? ((r.acumRes / r.acumRec) * 100).toFixed(1) : '0';
            const maxVal = rows[rows.length - 1].acumRec || 1;
            const barRec = Math.min(100, (r.acumRec / maxVal) * 100);
            const barDesp = Math.min(100, (r.acumDesp / maxVal) * 100);

            return `<tr style="border-bottom:1px solid var(--border-subtle);text-align:right;${r.isReal ? '' : 'opacity:0.55;'}">
              <td style="padding:10px 8px;text-align:left;font-weight:600;">${r.label}</td>
              <td style="padding:10px 8px;">${fmt(r.acumRec)}</td>
              <td style="padding:10px 8px;">${fmt(r.acumDesp)}</td>
              <td style="padding:10px 8px;font-weight:600;color:${r.acumRes >= 0 ? '#22c55e' : '#ef4444'};">${fmt(r.acumRes)}</td>
              <td style="padding:10px 8px;color:${parseFloat(margem) >= 0 ? '#22c55e' : '#ef4444'};">${margem}%</td>
              <td style="padding:10px 8px;width:140px;">
                <div style="position:relative;height:16px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                  <div style="position:absolute;left:0;top:0;height:50%;width:${barRec}%;background:#3b82f6;border-radius:3px 3px 0 0;"></div>
                  <div style="position:absolute;left:0;bottom:0;height:50%;width:${barDesp}%;background:#ef4444;border-radius:0 0 3px 3px;"></div>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      <div style="display:flex;gap:16px;margin-top:8px;font-size:0.7rem;color:var(--text-muted);justify-content:flex-end;">
        <span><span style="display:inline-block;width:10px;height:10px;background:#3b82f6;border-radius:2px;margin-right:4px;"></span>Receita</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:#ef4444;border-radius:2px;margin-right:4px;"></span>Despesa</span>
      </div>
    </div>`;
  },

  _renderBudgetComparison(recOrc, despOrc, resOrc, recProj, despProj, resProj, recReal, despReal, resReal, mesesCount) {
    const fmt = (v) => 'R$ ' + Math.round(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });

    const rows = [
      { label: 'Receita', orcado: recOrc, projetado: recProj, realizado: recReal, positive: true },
      { label: 'Despesa', orcado: despOrc, projetado: despProj, realizado: despReal, positive: false },
      { label: 'Resultado', orcado: resOrc, projetado: resProj, realizado: resReal, positive: true }
    ];

    return `<div style="display:flex;flex-direction:column;gap:16px;">
      <!-- Summary cards -->
      <div class="grid-3" style="gap:12px;">
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;">Orcado Anual</div>
          <div style="font-size:0.85rem;font-weight:600;margin-bottom:4px;">${fmt(recOrc)}</div>
          <div style="font-size:0.78rem;color:var(--text-secondary);">- ${fmt(despOrc)}</div>
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border-subtle);font-weight:700;color:${resOrc >= 0 ? '#22c55e' : '#ef4444'};">${fmt(resOrc)}</div>
          ${fc_margem(recOrc, resOrc)}
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;">Projetado Anual</div>
          <div style="font-size:0.85rem;font-weight:600;margin-bottom:4px;">${fmt(recProj)}</div>
          <div style="font-size:0.78rem;color:var(--text-secondary);">- ${fmt(despProj)}</div>
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border-subtle);font-weight:700;color:${resProj >= 0 ? '#22c55e' : '#ef4444'};">${fmt(resProj)}</div>
          ${fc_margem(recProj, resProj)}
        </div>
        <div class="card" style="padding:16px;text-align:center;border:2px solid var(--accent);">
          <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;">Realizado YTD (${mesesCount}m)</div>
          <div style="font-size:0.85rem;font-weight:600;margin-bottom:4px;">${fmt(recReal)}</div>
          <div style="font-size:0.78rem;color:var(--text-secondary);">- ${fmt(despReal)}</div>
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border-subtle);font-weight:700;color:${resReal >= 0 ? '#22c55e' : '#ef4444'};">${fmt(resReal)}</div>
          ${fc_margem(recReal, resReal)}
        </div>
      </div>

      <!-- Variance table -->
      <div class="card" style="padding:16px;overflow-x:auto;">
        <div style="font-weight:600;font-size:0.88rem;margin-bottom:12px;">Variancias</div>
        <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
          <thead>
            <tr style="border-bottom:2px solid var(--border-default);text-align:right;">
              <th style="padding:10px 8px;text-align:left;">Item</th>
              <th style="padding:10px 8px;">Orcado Anual</th>
              <th style="padding:10px 8px;">Orcado Proporcional (${mesesCount}m)</th>
              <th style="padding:10px 8px;">Realizado</th>
              <th style="padding:10px 8px;">Variancia</th>
              <th style="padding:10px 8px;">Projetado Anual</th>
              <th style="padding:10px 8px;">Proj. vs Orc.</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => {
              const orcProp = mesesCount > 0 ? (r.orcado / 12) * mesesCount : 0;
              const varAbs = r.realizado - orcProp;
              const varPct = orcProp !== 0 ? Math.round((varAbs / Math.abs(orcProp)) * 100) : 0;
              const isGood = r.positive ? varPct >= 0 : varPct <= 0;
              const projVarAbs = r.projetado - r.orcado;
              const projVarPct = r.orcado !== 0 ? Math.round((projVarAbs / Math.abs(r.orcado)) * 100) : 0;
              const projIsGood = r.positive ? projVarPct >= 0 : projVarPct <= 0;

              return `<tr style="border-bottom:1px solid var(--border-subtle);text-align:right;">
                <td style="padding:10px 8px;text-align:left;font-weight:600;">${r.label}</td>
                <td style="padding:10px 8px;">${fmt(r.orcado)}</td>
                <td style="padding:10px 8px;color:var(--text-secondary);">${fmt(orcProp)}</td>
                <td style="padding:10px 8px;font-weight:600;">${fmt(r.realizado)}</td>
                <td style="padding:10px 8px;font-weight:600;color:${isGood ? '#22c55e' : '#ef4444'};">
                  ${varPct >= 0 ? '+' : ''}${varPct}%
                </td>
                <td style="padding:10px 8px;">${fmt(r.projetado)}</td>
                <td style="padding:10px 8px;color:${projIsGood ? '#22c55e' : '#ef4444'};">
                  ${projVarPct >= 0 ? '+' : ''}${projVarPct}%
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  init() {
    document.querySelectorAll('.conciliacao-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.conciliacao-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.conciliacao-module .tab-content').forEach(tc => { tc.style.display = 'none'; tc.classList.remove('active'); });
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) { target.style.display = ''; target.classList.add('active'); }
      });
    });
  },

  destroy() {}
};

// Helper used in template literals
function fc_margem(rec, res) {
  const m = rec > 0 ? ((res / rec) * 100).toFixed(1) : '0';
  return `<div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">Margem: ${m}%</div>`;
}
