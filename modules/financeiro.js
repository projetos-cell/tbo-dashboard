// TBO OS — Module: Financeiro & Controle
const TBO_FINANCEIRO = {
  render() {
    const context = TBO_STORAGE.get('context');
    const dc26 = context.dados_comerciais?.['2026'] || {};
    const fc = dc26.fluxo_caixa || {};
    const precos = context.dados_comerciais?.precos || {};
    const market = TBO_STORAGE.get('market');
    const conc = market.concorrentes_precos_mercado || {};

    // Calculate realized totals
    const recMensal = fc.receita_mensal || {};
    const despMensal = fc.despesa_mensal || {};
    const resMensal = fc.resultado_mensal || {};
    const realizados = fc.meses_realizados || [];
    const receitaRealizada = realizados.reduce((s, m) => s + (recMensal[m] || 0), 0);
    const despesaRealizada = realizados.reduce((s, m) => s + (despMensal[m] || 0), 0);
    const resultadoRealizado = receitaRealizada - despesaRealizada;
    const margemRealizada = receitaRealizada > 0 ? ((resultadoRealizado / receitaRealizada) * 100).toFixed(1) : 0;

    // Semester calculations
    const s1Meses = ['jan','fev','mar','abr','mai','jun'];
    const s2Meses = ['jul','ago','set','out','nov','dez'];
    const receitaS1 = s1Meses.reduce((s, m) => s + (recMensal[m] || 0), 0);
    const receitaS2 = s2Meses.reduce((s, m) => s + (recMensal[m] || 0), 0);
    const despesaS1 = s1Meses.reduce((s, m) => s + (despMensal[m] || 0), 0);
    const despesaS2 = s2Meses.reduce((s, m) => s + (despMensal[m] || 0), 0);
    const resultadoS1 = receitaS1 - despesaS1;
    const resultadoS2 = receitaS2 - despesaS2;

    // Quarterly calculations
    const trimestres = [
      { label: 'Q1', meses: ['jan','fev','mar'] },
      { label: 'Q2', meses: ['abr','mai','jun'] },
      { label: 'Q3', meses: ['jul','ago','set'] },
      { label: 'Q4', meses: ['out','nov','dez'] }
    ];
    const trimestreData = trimestres.map(t => {
      const rec = t.meses.reduce((s, m) => s + (recMensal[m] || 0), 0);
      const desp = t.meses.reduce((s, m) => s + (despMensal[m] || 0), 0);
      const isReal = t.meses.every(m => realizados.includes(m));
      const isPartial = t.meses.some(m => realizados.includes(m));
      return { ...t, rec, desp, res: rec - desp, isReal, isPartial };
    });

    // Annual totals
    const receitaTotal = Object.values(recMensal).reduce((s, v) => s + v, 0);
    const despesaTotal = Object.values(despMensal).reduce((s, v) => s + v, 0);
    const resultadoAnual = receitaTotal - despesaTotal;
    const mesesRestantes = 12 - realizados.length;

    // Break-even: how much monthly revenue needed in remaining months to break even
    const receitaMensalEquilibrio = mesesRestantes > 0 ? (despesaTotal - receitaRealizada) / mesesRestantes : 0;

    return `
      <div class="financeiro-module">
        <!-- KPIs — Row 1 -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Painel Financeiro 2026</h2>
            <span class="tag" style="font-size:0.72rem;">${realizados.length} meses realizados | ${mesesRestantes} projetados</span>
          </div>
          <div class="grid-4" style="margin-bottom:12px;">
            <div class="kpi-card">
              <div class="kpi-label">Receita Realizada</div>
              <div class="kpi-value">${TBO_FORMATTER.currency(receitaRealizada)}</div>
              <div class="kpi-change ${receitaRealizada >= (fc.meta_vendas_mensal || 0) * realizados.length ? 'positive' : 'negative'}">Meta: ${TBO_FORMATTER.currency((fc.meta_vendas_mensal || 0) * realizados.length)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Despesa Realizada</div>
              <div class="kpi-value">${TBO_FORMATTER.currency(despesaRealizada)}</div>
              <div class="kpi-change neutral">Margem: ${margemRealizada}%</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Resultado Acumulado</div>
              <div class="kpi-value" style="color:${resultadoRealizado >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${TBO_FORMATTER.currency(resultadoRealizado)}</div>
              <div class="kpi-change ${resultadoRealizado >= 0 ? 'positive' : 'negative'}">${realizados.length} meses</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Projecao Anual</div>
              <div class="kpi-value" style="color:${resultadoAnual >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${TBO_FORMATTER.currency(resultadoAnual)}</div>
              <div class="kpi-change ${resultadoAnual >= 0 ? 'positive' : 'negative'}">Receita proj: ${TBO_FORMATTER.currency(receitaTotal)}</div>
            </div>
          </div>
          <!-- Row 2: Semestral + Meta Equilibrio -->
          <div class="grid-3">
            <div class="kpi-card">
              <div class="kpi-label">S1 2026 (Jan-Jun)</div>
              <div class="kpi-value" style="color:${resultadoS1 >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${TBO_FORMATTER.currency(resultadoS1)}</div>
              <div class="kpi-change ${resultadoS1 >= 0 ? 'positive' : 'negative'}">Receita: ${TBO_FORMATTER.currency(receitaS1)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">S2 2026 (Jul-Dez)</div>
              <div class="kpi-value" style="color:${resultadoS2 >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${TBO_FORMATTER.currency(resultadoS2)}</div>
              <div class="kpi-change ${resultadoS2 >= 0 ? 'positive' : 'negative'}">Receita: ${TBO_FORMATTER.currency(receitaS2)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Receita Mensal p/ Equilibrio</div>
              <div class="kpi-value" style="color:var(--accent);">${TBO_FORMATTER.currency(receitaMensalEquilibrio)}</div>
              <div class="kpi-change neutral">Meta orcada: ${TBO_FORMATTER.currency(fc.meta_vendas_mensal || 0)}/mes</div>
            </div>
          </div>
        </section>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab active" data-tab="fn-fluxo">Fluxo de Caixa</button>
          <button class="tab" data-tab="fn-projecoes">Projecoes</button>
          <button class="tab" data-tab="fn-simulador">Simulador</button>
          <button class="tab" data-tab="fn-pricing">Precos</button>
          <button class="tab" data-tab="fn-analise">Analise IA</button>
        </div>

        <!-- ============ Fluxo de Caixa 2026 ============ -->
        <div class="tab-panel" id="tab-fn-fluxo">

          <!-- Alert Banner -->
          ${resultadoAnual < 0 ? `
          <div class="context-banner" style="margin-bottom:16px; border-color:var(--color-danger);">
            <div class="context-banner-title" style="color:var(--color-danger);">Alerta: Projecao de Resultado Negativo</div>
            <div class="context-banner-text">Projecao anual: ${TBO_FORMATTER.currency(resultadoAnual)}. Receita de ${TBO_FORMATTER.currency(receitaTotal)} contra despesas de ${TBO_FORMATTER.currency(despesaTotal)}. Para equilibrar, e necessario faturar ${TBO_FORMATTER.currency(receitaMensalEquilibrio)}/mes nos ${mesesRestantes} meses restantes.</div>
          </div>` : ''}

          <!-- Monthly Table -->
          <div class="card" style="margin-bottom:16px;">
            <div class="card-header"><h3 class="card-title">Receita vs Despesa — Mensal</h3></div>
            <div style="overflow-x:auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>Receita</th>
                    <th>Despesa</th>
                    <th>Resultado</th>
                    <th>Margem</th>
                    <th style="width:120px;">vs Meta</th>
                  </tr>
                </thead>
                <tbody>
                  ${['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'].map(m => {
                    const rec = recMensal[m] || 0;
                    const desp = despMensal[m] || 0;
                    const res = resMensal[m] || (rec - desp);
                    const margem = fc.margem_mensal?.[m] || (rec > 0 ? ((res / rec) * 100).toFixed(1) + '%' : '\u2014');
                    const isReal = realizados.includes(m);
                    const mesLabel = {jan:'Jan',fev:'Fev',mar:'Mar',abr:'Abr',mai:'Mai',jun:'Jun',jul:'Jul',ago:'Ago',set:'Set',out:'Out',nov:'Nov',dez:'Dez'}[m];
                    const barW = Math.max(Math.round((rec / (fc.meta_vendas_mensal || 180000)) * 100), 3);
                    return `<tr style="${!isReal ? 'opacity:0.65;' : ''}">
                      <td><strong>${mesLabel}</strong> ${isReal ? '<span class="tag" style="font-size:0.6rem; padding:0 4px;">REAL</span>' : '<span style="font-size:0.6rem; color:var(--text-tertiary);">proj</span>'}</td>
                      <td>${TBO_FORMATTER.currency(rec)}</td>
                      <td>${TBO_FORMATTER.currency(desp)}</td>
                      <td style="color:${res >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight:600;">${TBO_FORMATTER.currency(res)}</td>
                      <td style="color:${parseFloat(margem) >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${margem}</td>
                      <td>
                        <div class="mini-progress">
                          <div class="mini-progress-bar"><div class="mini-progress-fill" style="width:${Math.min(barW, 100)}%; background:${res >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};"></div></div>
                        </div>
                      </td>
                    </tr>`;
                  }).join('')}
                  <tr style="border-top:2px solid var(--border-hover); font-weight:700;">
                    <td>TOTAL</td>
                    <td>${TBO_FORMATTER.currency(receitaTotal)}</td>
                    <td>${TBO_FORMATTER.currency(despesaTotal)}</td>
                    <td style="color:${resultadoAnual >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${TBO_FORMATTER.currency(resultadoAnual)}</td>
                    <td>${receitaTotal > 0 ? ((resultadoAnual / receitaTotal) * 100).toFixed(1) + '%' : '\u2014'}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Expense Breakdown + Contas a Receber -->
          <div class="grid-2" style="gap:16px;">
            <div class="card">
              <div class="card-header"><h3 class="card-title">Estrutura de Despesas (Anual)</h3></div>
              ${fc.despesas_detalhadas ? `
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${this._renderExpenseBar('Pessoas', fc.despesas_detalhadas.pessoas?.total_anual || 0, despesaTotal || 1, '#E85102')}
                ${this._renderExpenseBar('Operacionais', fc.despesas_detalhadas.operacionais?.total_anual || 0, despesaTotal || 1, '#3b82f6')}
                ${this._renderExpenseBar('Terceirizacao', fc.despesas_detalhadas.terceirizacao?.total_anual || 0, despesaTotal || 1, '#8b5cf6')}
                ${this._renderExpenseBar('Vendas', fc.despesas_detalhadas.vendas?.total_anual || 0, despesaTotal || 1, '#10b981')}
                ${this._renderExpenseBar('Marketing', fc.despesas_detalhadas.marketing?.total_anual || 0, despesaTotal || 1, '#f59e0b')}
              </div>
              <div style="margin-top:12px; padding-top:10px; border-top:1px solid var(--border-subtle); font-size:0.75rem; color:var(--text-tertiary);">
                Total anual: ${TBO_FORMATTER.currency(despesaTotal)} | Media mensal: ${TBO_FORMATTER.currency(despesaTotal / 12)}
              </div>` : '<div class="empty-state"><div class="empty-state-text">Dados detalhados nao disponiveis</div></div>'}
            </div>

            <div class="card">
              <div class="card-header"><h3 class="card-title">Contas a Receber</h3></div>
              ${fc.contas_a_receber ? `
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${['fevereiro','marco','abril','maio','junho'].map(mes => {
                  const cr = fc.contas_a_receber[mes];
                  if (!cr) return '';
                  const mesLabel = {fevereiro:'Fev',marco:'Mar',abril:'Abr',maio:'Mai',junho:'Jun'}[mes];
                  const pago = cr.pago || 0;
                  const emAberto = cr.em_aberto || (cr.total - pago);
                  return `<div class="alert-item ${pago > 0 ? 'success' : 'warning'}" style="margin-bottom:2px;">
                    <div class="alert-content" style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                      <div>
                        <span class="alert-title" style="font-size:0.82rem;">${mesLabel}/2026</span>
                        ${pago > 0 ? `<div style="font-size:0.7rem; color:var(--text-tertiary);">Pago: ${TBO_FORMATTER.currency(pago)} | Aberto: ${TBO_FORMATTER.currency(emAberto)}</div>` : ''}
                      </div>
                      <span style="font-weight:600; font-size:0.85rem;">${TBO_FORMATTER.currency(cr.total)}</span>
                    </div>
                  </div>`;
                }).join('')}
              </div>
              <div style="margin-top:10px; padding-top:8px; border-top:1px solid var(--border-subtle); font-size:0.75rem; color:var(--text-tertiary);">
                Total a receber: ${TBO_FORMATTER.currency(['fevereiro','marco','abril','maio','junho'].reduce((s, m) => s + (fc.contas_a_receber[m]?.total || 0), 0))}
              </div>` : '<div class="empty-state"><div class="empty-state-text">Sem dados de contas a receber</div></div>'}
            </div>
          </div>

          <!-- Orcado vs Projetado -->
          <div class="card" style="margin-top:16px;">
            <div class="card-header"><h3 class="card-title">Orcado vs Projetado (Anual)</h3></div>
            <table class="data-table">
              <thead><tr><th>Indicador</th><th>Orcamento Base</th><th>Projecao Atual</th><th>Gap</th></tr></thead>
              <tbody>
                <tr>
                  <td>Receita Total</td>
                  <td>${TBO_FORMATTER.currency(fc.receita_total_orcada || 0)}</td>
                  <td>${TBO_FORMATTER.currency(receitaTotal)}</td>
                  <td style="color:${receitaTotal >= (fc.receita_total_orcada || 0) ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight:600;">${TBO_FORMATTER.currency(receitaTotal - (fc.receita_total_orcada || 0))}</td>
                </tr>
                <tr>
                  <td>Despesa Total</td>
                  <td>${TBO_FORMATTER.currency(fc.despesa_total_orcada || 0)}</td>
                  <td>${TBO_FORMATTER.currency(despesaTotal)}</td>
                  <td style="color:${despesaTotal <= (fc.despesa_total_orcada || 0) ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight:600;">${TBO_FORMATTER.currency(despesaTotal - (fc.despesa_total_orcada || 0))}</td>
                </tr>
                <tr>
                  <td>Resultado Liquido</td>
                  <td style="color:var(--color-success);">${TBO_FORMATTER.currency(fc.resultado_liquido_orcado || 0)}</td>
                  <td style="color:${resultadoAnual >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${TBO_FORMATTER.currency(resultadoAnual)}</td>
                  <td style="color:var(--color-danger); font-weight:600;">${TBO_FORMATTER.currency(resultadoAnual - (fc.resultado_liquido_orcado || 0))}</td>
                </tr>
                <tr>
                  <td>Margem Liquida</td>
                  <td>${fc.margem_liquida_orcada || '\u2014'}</td>
                  <td style="color:${resultadoAnual >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${receitaTotal > 0 ? ((resultadoAnual / receitaTotal) * 100).toFixed(1) + '%' : '\u2014'}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ============ Projecoes ============ -->
        <div class="tab-panel" id="tab-fn-projecoes" style="display:none;">

          <!-- Quarterly View -->
          <div class="card" style="margin-bottom:16px;">
            <div class="card-header"><h3 class="card-title">Visao Trimestral 2026</h3></div>
            <div class="grid-4" style="margin-bottom:16px;">
              ${trimestreData.map(t => {
                const margemT = t.rec > 0 ? ((t.res / t.rec) * 100).toFixed(1) : 0;
                const statusTag = t.isReal ? '<span class="tag" style="font-size:0.6rem; padding:0 4px;">REAL</span>' : (t.isPartial ? '<span class="tag" style="font-size:0.6rem; padding:0 4px; background:var(--bg-tertiary);">PARCIAL</span>' : '<span style="font-size:0.6rem; color:var(--text-tertiary);">proj</span>');
                return `<div class="kpi-card" style="text-align:center;">
                  <div class="kpi-label">${t.label} ${statusTag}</div>
                  <div class="kpi-value" style="font-size:1.1rem; color:${t.res >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${TBO_FORMATTER.currency(t.res)}</div>
                  <div style="font-size:0.72rem; color:var(--text-tertiary); margin-top:4px;">
                    Receita: ${TBO_FORMATTER.currency(t.rec)}<br>
                    Despesa: ${TBO_FORMATTER.currency(t.desp)}<br>
                    Margem: ${margemT}%
                  </div>
                </div>`;
              }).join('')}
            </div>

            <!-- Quarterly bar chart -->
            <div style="display:flex; gap:12px; align-items:flex-end; height:160px; padding:0 16px;">
              ${trimestreData.map(t => {
                const maxRec = Math.max(...trimestreData.map(x => x.rec), 1);
                const recH = Math.max(Math.round((t.rec / maxRec) * 140), 4);
                const despH = Math.max(Math.round((t.desp / maxRec) * 140), 4);
                return `<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
                  <div style="display:flex; gap:3px; align-items:flex-end; height:140px;">
                    <div style="width:24px; height:${recH}px; background:var(--accent); border-radius:3px 3px 0 0; opacity:${t.isReal || t.isPartial ? '1' : '0.5'};" title="Receita: ${TBO_FORMATTER.currency(t.rec)}"></div>
                    <div style="width:24px; height:${despH}px; background:#3b82f6; border-radius:3px 3px 0 0; opacity:${t.isReal || t.isPartial ? '1' : '0.5'};" title="Despesa: ${TBO_FORMATTER.currency(t.desp)}"></div>
                  </div>
                  <div style="font-size:0.75rem; font-weight:600;">${t.label}</div>
                </div>`;
              }).join('')}
            </div>
            <div style="display:flex; gap:16px; justify-content:center; margin-top:8px; font-size:0.72rem; color:var(--text-tertiary);">
              <span><span style="display:inline-block; width:10px; height:10px; background:var(--accent); border-radius:2px; margin-right:4px;"></span>Receita</span>
              <span><span style="display:inline-block; width:10px; height:10px; background:#3b82f6; border-radius:2px; margin-right:4px;"></span>Despesa</span>
            </div>
          </div>

          <!-- S1 vs S2 Comparison -->
          <div class="card" style="margin-bottom:16px;">
            <div class="card-header"><h3 class="card-title">S1 vs S2 — Comparativo Semestral</h3></div>
            <div class="grid-2" style="gap:16px;">
              <div style="padding:16px; background:var(--bg-tertiary); border-radius:8px;">
                <div style="font-weight:600; font-size:0.85rem; margin-bottom:12px; color:var(--text-secondary);">S1 (Jan-Jun)</div>
                ${this._renderExpenseBar('Receita', receitaS1, Math.max(receitaS1, receitaS2, 1), 'var(--accent)')}
                <div style="height:6px;"></div>
                ${this._renderExpenseBar('Despesa', despesaS1, Math.max(receitaS1, receitaS2, 1), '#3b82f6')}
                <div style="margin-top:10px; padding-top:8px; border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; font-size:0.82rem;">
                  <span>Resultado:</span>
                  <span style="font-weight:700; color:${resultadoS1 >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${TBO_FORMATTER.currency(resultadoS1)}</span>
                </div>
                <div style="font-size:0.72rem; color:var(--text-tertiary); margin-top:2px;">
                  Margem: ${receitaS1 > 0 ? ((resultadoS1 / receitaS1) * 100).toFixed(1) + '%' : '\u2014'}
                </div>
              </div>
              <div style="padding:16px; background:var(--bg-tertiary); border-radius:8px;">
                <div style="font-weight:600; font-size:0.85rem; margin-bottom:12px; color:var(--text-secondary);">S2 (Jul-Dez) <span style="font-size:0.7rem; color:var(--text-tertiary);">projetado</span></div>
                ${this._renderExpenseBar('Receita', receitaS2, Math.max(receitaS1, receitaS2, 1), 'var(--accent)')}
                <div style="height:6px;"></div>
                ${this._renderExpenseBar('Despesa', despesaS2, Math.max(receitaS1, receitaS2, 1), '#3b82f6')}
                <div style="margin-top:10px; padding-top:8px; border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; font-size:0.82rem;">
                  <span>Resultado:</span>
                  <span style="font-weight:700; color:${resultadoS2 >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${TBO_FORMATTER.currency(resultadoS2)}</span>
                </div>
                <div style="font-size:0.72rem; color:var(--text-tertiary); margin-top:2px;">
                  Margem: ${receitaS2 > 0 ? ((resultadoS2 / receitaS2) * 100).toFixed(1) + '%' : '\u2014'}
                </div>
              </div>
            </div>
          </div>

          <!-- Break-Even Analysis -->
          <div class="card" style="margin-bottom:16px;">
            <div class="card-header"><h3 class="card-title">Analise de Equilibrio</h3></div>
            <div class="grid-3">
              <div style="text-align:center; padding:16px;">
                <div style="font-size:0.78rem; color:var(--text-secondary); margin-bottom:4px;">Receita p/ Equilibrio Anual</div>
                <div style="font-size:1.4rem; font-weight:700; color:var(--accent);">${TBO_FORMATTER.currency(despesaTotal)}</div>
                <div style="font-size:0.72rem; color:var(--text-tertiary); margin-top:2px;">${TBO_FORMATTER.currency(despesaTotal / 12)}/mes</div>
              </div>
              <div style="text-align:center; padding:16px;">
                <div style="font-size:0.78rem; color:var(--text-secondary); margin-bottom:4px;">Receita p/ Equilibrio Restante</div>
                <div style="font-size:1.4rem; font-weight:700; color:${receitaMensalEquilibrio <= (fc.meta_vendas_mensal || 180000) ? 'var(--color-success)' : 'var(--color-danger)'};">${TBO_FORMATTER.currency(receitaMensalEquilibrio)}</div>
                <div style="font-size:0.72rem; color:var(--text-tertiary); margin-top:2px;">por mes (${mesesRestantes} meses)</div>
              </div>
              <div style="text-align:center; padding:16px;">
                <div style="font-size:0.78rem; color:var(--text-secondary); margin-bottom:4px;">Atingimento da Meta</div>
                <div style="font-size:1.4rem; font-weight:700; color:${receitaTotal >= (fc.meta_vendas_anual || 0) ? 'var(--color-success)' : 'var(--color-danger)'};">${fc.meta_vendas_anual ? ((receitaTotal / fc.meta_vendas_anual) * 100).toFixed(0) + '%' : '\u2014'}</div>
                <div style="font-size:0.72rem; color:var(--text-tertiary); margin-top:2px;">Meta: ${TBO_FORMATTER.currency(fc.meta_vendas_anual || 0)}</div>
              </div>
            </div>
            <!-- Progress bar -->
            <div style="padding:0 16px 16px;">
              <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--text-tertiary); margin-bottom:4px;">
                <span>Receita projetada</span>
                <span>${TBO_FORMATTER.currency(receitaTotal)} / ${TBO_FORMATTER.currency(fc.meta_vendas_anual || 0)}</span>
              </div>
              <div style="height:10px; background:var(--bg-tertiary); border-radius:5px; overflow:hidden;">
                <div style="height:100%; width:${Math.min(Math.round((receitaTotal / Math.max(fc.meta_vendas_anual || 1, 1)) * 100), 100)}%; background:${receitaTotal >= (fc.meta_vendas_anual || 0) ? 'var(--color-success)' : 'var(--accent)'}; border-radius:5px; transition:width 0.3s;"></div>
              </div>
            </div>
          </div>

          <!-- Equipe -->
          ${fc.despesas_detalhadas?.pessoas?.equipe ? `
          <div class="card">
            <div class="card-header"><h3 class="card-title">Custo de Equipe (${fc.despesas_detalhadas.pessoas.equipe.length} pessoas)</h3></div>
            <table class="data-table">
              <thead><tr><th>Nome</th><th>Cargo</th><th>Salario</th><th>% do Total</th></tr></thead>
              <tbody>
                ${fc.despesas_detalhadas.pessoas.equipe.map(p => {
                  const pct = ((p.salario / (fc.despesas_detalhadas.pessoas.total_anual / 12)) * 100).toFixed(0);
                  return `<tr>
                    <td>${p.nome}</td>
                    <td style="font-size:0.78rem; color:var(--text-secondary);">${p.cargo}</td>
                    <td>${TBO_FORMATTER.currency(p.salario)}</td>
                    <td>
                      <div class="mini-progress">
                        <div class="mini-progress-bar"><div class="mini-progress-fill" style="width:${pct}%;"></div></div>
                        <span class="mini-progress-text">${pct}%</span>
                      </div>
                    </td>
                  </tr>`;
                }).join('')}
                <tr style="border-top:2px solid var(--border-hover); font-weight:700;">
                  <td colspan="2">TOTAL MENSAL</td>
                  <td>${TBO_FORMATTER.currency(fc.despesas_detalhadas.pessoas.equipe.reduce((s, p) => s + p.salario, 0))}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>` : ''}
        </div>

        <!-- ============ Simulador ============ -->
        <div class="tab-panel" id="tab-fn-simulador" style="display:none;">
          <div class="card">
            <div class="card-header"><h3 class="card-title">Simulador de Cenarios</h3></div>
            <p style="color:var(--text-secondary); font-size:0.82rem; margin-bottom:12px;">
              Projete cenarios financeiros com base nos dados reais de 2026.
            </p>
            <div class="quick-chips" id="fnQuickChips">
              <button class="quick-chip" data-query="Com base no fluxo de caixa 2026 atual, projete 3 cenarios para o resultado anual: otimista (receita de Mar-Jun 50% acima do projetado), realista (mantendo projecao atual) e pessimista (receita de Mar-Jun 30% abaixo). Mostre o impacto no resultado anual e na margem.">3 Cenarios Anuais</button>
              <button class="quick-chip" data-query="Se conseguirmos fechar R$180K/mes de receita de marco a dezembro (meta orcada), qual seria o resultado anual? E se fecharmos apenas R$130K/mes? Compare os dois cenarios.">Meta vs Realidade</button>
              <button class="quick-chip" data-query="Analise o impacto de reduzir os custos com terceirizacao em 30% e o custo de marketing em 50%. Qual seria o novo ponto de equilibrio mensal?">Corte de Custos</button>
              <button class="quick-chip" data-query="Se contratarmos mais 1 artista 3D (salario R$4.000) e com isso aumentarmos a capacidade de producao em 30%, gerando R$20K adicionais de receita mensal, vale a pena? Analise o payback.">+1 Contratacao</button>
            </div>
            <div class="form-group">
              <label class="form-label">Cenario ou pergunta</label>
              <textarea class="form-input" id="fnCenario" rows="4" placeholder="Ex: Se fecharmos 3 projetos grandes de R$50K cada no Q2, como fica a projecao anual?"></textarea>
            </div>
            <button class="btn btn-primary" id="fnGerarCenario" style="width:100%;">Simular</button>
          </div>
          <div id="fnCenarioOutput" class="ai-response" style="min-height:200px; margin-top:16px;">
            <div class="empty-state"><div class="empty-state-text">Resultado aparecera aqui</div></div>
          </div>
        </div>

        <!-- ============ Evolucao de Precos ============ -->
        <div class="tab-panel" id="tab-fn-pricing" style="display:none;">
          <div class="card" style="margin-bottom:16px;">
            <div class="card-header"><h3 class="card-title">Precos TBO 2026</h3></div>

            <div class="context-banner" style="margin-bottom:20px;">
              <div class="context-banner-title">Faixas de Preco Atuais (2026)</div>
              <div class="context-banner-text">Imagens 3D: R$ 1.500-1.800/un | Filmes: R$ 18.000-22.000 | Posicionamento premium.</div>
            </div>

            <!-- TBO vs Market -->
            ${conc.imagens_3d || conc.filmes ? `
            <h4 style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:12px;">TBO vs Mercado</h4>
            ${conc.imagens_3d ? this._renderPriceRange('Imagens 3D', conc.imagens_3d.minimo, conc.imagens_3d.maximo, 1650, 'R$ 1.500-1.800') : ''}
            ${conc.filmes ? this._renderPriceRange('Filmes', conc.filmes.minimo, conc.filmes.maximo, conc.filmes.tbo, TBO_FORMATTER.currency(conc.filmes.tbo)) : ''}
            ${conc.books ? this._renderPriceRange('Books', conc.books.minimo, conc.books.maximo, 8500, 'R$ ' + conc.books.tbo) : ''}
            ` : ''}

            <!-- Pricing Table -->
            <table class="data-table" style="margin-top:16px;">
              <thead><tr><th>Servico</th><th>Preco TBO 2026</th><th>Mercado (faixa)</th><th>Posicao</th></tr></thead>
              <tbody>
                <tr>
                  <td>Imagem 3D</td>
                  <td style="font-weight:600;">R$ ${precos.imagem_2026 || '1.500-1.800'}</td>
                  <td style="color:var(--text-secondary);">R$ ${conc.imagens_3d ? TBO_FORMATTER.number(conc.imagens_3d.minimo) + '-' + TBO_FORMATTER.number(conc.imagens_3d.maximo) : '450-900'}</td>
                  <td><span class="tag gold" style="font-size:0.7rem;">Premium</span></td>
                </tr>
                <tr>
                  <td>Filme</td>
                  <td style="font-weight:600;">R$ ${precos.filme_2026 || '18.000-22.000'}</td>
                  <td style="color:var(--text-secondary);">R$ ${conc.filmes ? TBO_FORMATTER.number(conc.filmes.minimo) + '-' + TBO_FORMATTER.number(conc.filmes.maximo) : '3.000-5.000'}</td>
                  <td><span class="tag gold" style="font-size:0.7rem;">Premium</span></td>
                </tr>
                <tr>
                  <td>Books</td>
                  <td style="font-weight:600;">R$ ${conc.books?.tbo || '8.500'}</td>
                  <td style="color:var(--text-secondary);">R$ ${conc.books ? TBO_FORMATTER.number(conc.books.minimo) + '-' + TBO_FORMATTER.number(conc.books.maximo) : '\u2014'}</td>
                  <td><span class="tag gold" style="font-size:0.7rem;">Premium</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pricing AI Query -->
          <div class="card">
            <div class="card-header"><h3 class="card-title">Consultar Precos</h3></div>
            <div class="form-group">
              <textarea class="form-input" id="fnPricingQuery" rows="2" placeholder="Ex: Qual o preco ideal para um pacote de 15 imagens externas + 1 filme?"></textarea>
            </div>
            <button class="btn btn-primary" id="fnGerarPricing" style="width:100%;">Consultar</button>
          </div>
          <div id="fnPricingOutput" class="ai-response" style="min-height:120px; margin-top:16px;">
            <div class="empty-state"><div class="empty-state-text">Resultado aparecera aqui</div></div>
          </div>
        </div>

        <!-- ============ Analise Financeira ============ -->
        <div class="tab-panel" id="tab-fn-analise" style="display:none;">
          <div class="card" style="margin-bottom:16px;">
            <div class="card-header"><h3 class="card-title">Analise Financeira com IA</h3></div>
            <p style="color:var(--text-secondary); font-size:0.82rem; margin-bottom:16px;">
              Analises detalhadas com base nos dados financeiros reais de 2026.
            </p>
            <div class="analysis-grid" id="fnAnalysisCards">
              <div class="analysis-card" data-type="saude">
                <span class="analysis-card-icon">&#9829;</span>
                <div class="analysis-card-title">Saude Financeira</div>
                <div class="analysis-card-desc">Fluxo de caixa, sustentabilidade e riscos para 2026.</div>
              </div>
              <div class="analysis-card" data-type="margens">
                <span class="analysis-card-icon">&#9776;</span>
                <div class="analysis-card-title">Margens por BU</div>
                <div class="analysis-card-desc">Rentabilidade por unidade de negocio com base nos custos detalhados.</div>
              </div>
              <div class="analysis-card" data-type="projecao">
                <span class="analysis-card-icon">&#9670;</span>
                <div class="analysis-card-title">Projecao S2 2026</div>
                <div class="analysis-card-desc">Cenarios otimista, realista e pessimista para Jul-Dez 2026.</div>
              </div>
              <div class="analysis-card" data-type="custos">
                <span class="analysis-card-icon">&#9881;</span>
                <div class="analysis-card-title">Otimizacao de Custos</div>
                <div class="analysis-card-desc">Oportunidades de reducao e reestruturacao da base de custos.</div>
              </div>
            </div>
          </div>
          <div id="fnAnaliseOutput" class="ai-response" style="min-height:200px;">
            <div class="empty-state"><div class="empty-state-text">Selecione um tipo de analise acima</div></div>
          </div>
        </div>
      </div>
    `;
  },

  // ── Render Helpers ──

  _renderPriceRange(title, min, max, tboVal, tboLabel) {
    const scaleMax = Math.max(max * 1.2, tboVal * 1.1);
    const marketLeft = Math.round((min / scaleMax) * 100);
    const marketWidth = Math.round(((max - min) / scaleMax) * 100);
    const tboPos = Math.round((tboVal / scaleMax) * 100);

    return `
      <div class="price-range">
        <div class="price-range-header">
          <span class="price-range-title">${title}</span>
          <span class="price-range-tbo-value">TBO: ${tboLabel}</span>
        </div>
        <div class="price-range-track">
          <div class="price-range-market" style="left:${marketLeft}%; width:${marketWidth}%;"></div>
          <div class="price-range-marker" style="left:${tboPos}%;"></div>
        </div>
        <div class="price-range-labels">
          <span>R$ ${TBO_FORMATTER.number(min)}</span>
          <span>Faixa de mercado</span>
          <span class="tbo-label">TBO</span>
        </div>
      </div>`;
  },

  _renderExpenseBar(label, value, total, color) {
    const pct = Math.max(Math.round((value / Math.max(total, 1)) * 100), 2);
    return `
      <div style="display:flex; align-items:center; gap:8px;">
        <div style="width:100px; font-size:0.78rem; color:var(--text-secondary);">${label}</div>
        <div style="flex:1; height:18px; background:var(--bg-tertiary); border-radius:3px; overflow:hidden;">
          <div style="height:100%; width:${pct}%; background:${color}; border-radius:3px; transition:width 0.3s;"></div>
        </div>
        <div style="width:90px; text-align:right; font-size:0.78rem; font-weight:600;">${TBO_FORMATTER.currency(value)}</div>
        <div style="width:35px; text-align:right; font-size:0.7rem; color:var(--text-tertiary);">${pct}%</div>
      </div>`;
  },

  // ── Event Binding ──

  init() {
    // Tab switching with breadcrumb + deep link
    document.querySelectorAll('.tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
        const panel = document.getElementById(`tab-${tab.dataset.tab}`);
        if (panel) panel.style.display = 'block';
        if (typeof TBO_UX !== 'undefined') {
          TBO_UX.updateBreadcrumb('financeiro', tab.textContent.trim());
          TBO_UX.setTabHash('financeiro', tab.dataset.tab);
        }
      });
    });

    // Quick chips for simulator
    document.querySelectorAll('#fnQuickChips .quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.query;
        const textarea = document.getElementById('fnCenario');
        if (textarea) { textarea.value = q; }
        this._generate('fnCenario', 'fnCenarioOutput', 'Com base nos dados financeiros reais de 2026 da TBO, simule: ');
      });
    });

    // Analysis cards
    document.querySelectorAll('#fnAnalysisCards .analysis-card').forEach(card => {
      card.addEventListener('click', () => {
        const tipo = card.dataset.type;
        const prompts = {
          saude: 'Analise a saude financeira da TBO em 2026 com base no fluxo de caixa real. Avalie: liquidez, sustentabilidade, riscos de caixa, e recomende acoes concretas. Use os dados reais dos meses realizados e as projecoes.',
          margens: 'Analise as margens por BU (Digital 3D, Audiovisual, Branding, Marketing, Interiores) com base nos custos detalhados e receitas. Identifique quais BUs sao mais rentaveis e onde ha oportunidade de melhoria.',
          projecao: 'Projete 3 cenarios para o S2 2026 (Jul-Dez): otimista, realista e pessimista. Considere os dados reais dos meses realizados, a sazonalidade do mercado imobiliario e o pipeline de projetos ativos. Apresente receita, despesa e resultado para cada cenario.',
          custos: 'Analise a estrutura de custos da TBO em 2026. Identifique: maiores centros de custo, custos fixos vs variaveis, oportunidades de reducao sem impacto na capacidade produtiva, e o impacto de cada reducao no ponto de equilibrio.'
        };
        this._generateDirect(prompts[tipo] || `Analise financeira (${tipo}) da TBO 2026.`, 'fnAnaliseOutput');
      });
    });

    this._bind('fnGerarCenario', () => this._generate('fnCenario', 'fnCenarioOutput', 'Com base nos dados financeiros reais de 2026 da TBO, simule: '));
    this._bind('fnGerarPricing', () => this._generate('fnPricingQuery', 'fnPricingOutput', 'Com base nos precos e custos da TBO em 2026, responda: '));
  },

  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  },

  async _generate(inputId, outputId, prefix) {
    const val = document.getElementById(inputId)?.value || '';
    if (!val) { TBO_TOAST.warning('Preencha o campo'); return; }
    await this._generateDirect(prefix + val, outputId);
  },

  async _generateDirect(msg, outputId) {
    if (!TBO_API.isConfigured()) {
      TBO_TOAST.warning('API nao configurada', 'Va em Configuracoes (Alt+8) para inserir sua chave da API Claude.');
      return;
    }
    const out = document.getElementById(outputId);
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.showLoading(out, 'Processando analise...');
    } else if (out) {
      out.textContent = 'Processando...';
    }
    try {
      const ctx = TBO_STORAGE.getFullContext();
      const result = await TBO_API.callWithContext('financeiro', msg, ctx, { temperature: 0.3 });
      if (out) out.innerHTML = TBO_FORMATTER.markdownToHtml(result.text);
    } catch (e) {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.showError(out, e.message, () => this._generateDirect(msg, outputId));
      } else if (out) {
        out.textContent = 'Erro: ' + e.message;
      }
    }
  }
};
