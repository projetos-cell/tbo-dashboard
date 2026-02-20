// TBO OS — Module: Financeiro & Controle
const TBO_FINANCEIRO = {
  render() {
    const context = TBO_STORAGE.get('context');
    const dc26 = context.dados_comerciais?.[TBO_CONFIG.app.fiscalYear] || {};
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
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="tag" style="font-size:0.72rem;">${realizados.length} meses realizados | ${mesesRestantes} projetados</span>
              <button class="btn btn-secondary" id="fnEditData" style="font-size:0.68rem;padding:3px 10px;">&#9998; Editar Dados</button>
            </div>
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

          <!-- Monthly Table — Editable Excel-style -->
          <div class="card" style="margin-bottom:16px;">
            <div class="card-header">
              <h3 class="card-title">Fluxo de Caixa — Mensal</h3>
              <div style="display:flex;gap:6px;align-items:center;">
                <span id="fnEditStatus" style="font-size:0.68rem;color:var(--text-tertiary);"></span>
                <button class="btn btn-primary" id="fnSaveFluxo" style="font-size:0.72rem;padding:4px 12px;">Salvar</button>
              </div>
            </div>
            <div style="overflow-x:auto;">
              <table class="data-table" id="fnFluxoTable" style="font-size:0.8rem;">
                <thead>
                  <tr style="background:var(--bg-tertiary);">
                    <th style="min-width:70px;position:sticky;left:0;background:var(--bg-tertiary);z-index:1;">Mes</th>
                    <th style="min-width:110px;text-align:right;">Receita</th>
                    <th style="min-width:110px;text-align:right;">Despesa</th>
                    <th style="min-width:100px;text-align:right;">Resultado</th>
                    <th style="min-width:60px;text-align:right;">Margem</th>
                    <th style="min-width:55px;text-align:center;">Real</th>
                    <th style="width:90px;">vs Meta</th>
                  </tr>
                </thead>
                <tbody>
                  ${['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'].map(m => {
                    const rec = recMensal[m] || 0;
                    const desp = despMensal[m] || 0;
                    const res = rec - desp;
                    const margem = rec > 0 ? ((res / rec) * 100).toFixed(1) : '0.0';
                    const isReal = realizados.includes(m);
                    const mesLabel = {jan:'Jan',fev:'Fev',mar:'Mar',abr:'Abr',mai:'Mai',jun:'Jun',jul:'Jul',ago:'Ago',set:'Set',out:'Out',nov:'Nov',dez:'Dez'}[m];
                    const barMeta = fc.meta_vendas_mensal || (typeof TBO_CONFIG !== 'undefined' && TBO_CONFIG.business?.financial?.monthlyTarget) || 1;
                    const barW = Math.max(Math.round((rec / barMeta) * 100), 3);
                    const inputStyle = 'width:100%;text-align:right;padding:3px 6px;border:1px solid transparent;border-radius:4px;font-size:0.8rem;background:transparent;color:var(--text-primary);transition:border-color 0.15s;';
                    return `<tr data-mes="${m}" style="${!isReal ? 'opacity:0.7;' : ''}">
                      <td style="position:sticky;left:0;background:var(--bg-primary);z-index:1;"><strong>${mesLabel}</strong></td>
                      <td style="padding:2px 4px;">
                        <input type="number" class="fn-cell fn-rec" data-mes="${m}" value="${rec}" style="${inputStyle}" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='transparent'">
                      </td>
                      <td style="padding:2px 4px;">
                        <input type="number" class="fn-cell fn-desp" data-mes="${m}" value="${desp}" style="${inputStyle}" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='transparent'">
                      </td>
                      <td class="fn-resultado" data-mes="${m}" style="text-align:right;font-weight:600;color:${res >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${TBO_FORMATTER.currency(res)}</td>
                      <td class="fn-margem" data-mes="${m}" style="text-align:right;font-size:0.75rem;color:${parseFloat(margem) >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${margem}%</td>
                      <td style="text-align:center;">
                        <input type="checkbox" class="fn-real" data-mes="${m}" ${isReal ? 'checked' : ''} aria-label="Marcar ${mesLabel} como real" style="cursor:pointer;width:16px;height:16px;accent-color:var(--accent);">
                      </td>
                      <td>
                        <div class="mini-progress">
                          <div class="mini-progress-bar"><div class="mini-progress-fill" style="width:${Math.min(barW, 100)}%; background:${res >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};"></div></div>
                        </div>
                      </td>
                    </tr>`;
                  }).join('')}
                  <tr id="fnTotalsRow" style="border-top:2px solid var(--border-hover); font-weight:700; background:var(--bg-tertiary);">
                    <td style="position:sticky;left:0;background:var(--bg-tertiary);z-index:1;">TOTAL</td>
                    <td id="fnTotalRec" style="text-align:right;padding:6px 10px;">${TBO_FORMATTER.currency(receitaTotal)}</td>
                    <td id="fnTotalDesp" style="text-align:right;padding:6px 10px;">${TBO_FORMATTER.currency(despesaTotal)}</td>
                    <td id="fnTotalRes" style="text-align:right;color:${resultadoAnual >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${TBO_FORMATTER.currency(resultadoAnual)}</td>
                    <td id="fnTotalMarg" style="text-align:right;font-size:0.75rem;">${receitaTotal > 0 ? ((resultadoAnual / receitaTotal) * 100).toFixed(1) + '%' : '\u2014'}</td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:10px;padding-top:8px;border-top:1px solid var(--border-subtle);">
              <div style="flex:1;display:flex;gap:12px;font-size:0.72rem;color:var(--text-tertiary);">
                <span>Meta mensal: <strong style="color:var(--text-primary);">${TBO_FORMATTER.currency(fc.meta_vendas_mensal || TBO_CONFIG.business.financial.monthlyTarget)}</strong></span>
                <span>|</span>
                <span>Meta anual: <strong style="color:var(--text-primary);">${TBO_FORMATTER.currency(fc.meta_vendas_anual || TBO_CONFIG.business.financial.monthlyTarget * 12)}</strong></span>
              </div>
              <span style="font-size:0.68rem;color:var(--text-tertiary);">Clique nas celulas para editar</span>
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
                <div style="font-size:1.4rem; font-weight:700; color:${receitaMensalEquilibrio <= (fc.meta_vendas_mensal || TBO_CONFIG.business.financial.monthlyTarget) ? 'var(--color-success)' : 'var(--color-danger)'};">${TBO_FORMATTER.currency(receitaMensalEquilibrio)}</div>
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

          <!-- Equipe — Editable -->
          ${fc.despesas_detalhadas?.pessoas?.equipe ? `
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Custo de Equipe (${fc.despesas_detalhadas.pessoas.equipe.length} pessoas)</h3>
              <button class="btn btn-secondary" id="fnSaveEquipe" style="font-size:0.68rem;padding:3px 10px;">Salvar Equipe</button>
            </div>
            <table class="data-table" id="fnEquipeTable">
              <thead><tr><th>Nome</th><th>Cargo</th><th style="text-align:right;">Salario</th><th>% do Total</th></tr></thead>
              <tbody>
                ${fc.despesas_detalhadas.pessoas.equipe.map((p, i) => {
                  const pct = ((p.salario / (fc.despesas_detalhadas.pessoas.total_anual / 12)) * 100).toFixed(0);
                  const inputStyle = 'width:100px;text-align:right;padding:3px 6px;border:1px solid transparent;border-radius:4px;font-size:0.8rem;background:transparent;color:var(--text-primary);';
                  return `<tr>
                    <td>${p.nome}</td>
                    <td style="font-size:0.78rem; color:var(--text-secondary);">${p.cargo}</td>
                    <td style="padding:2px 4px;text-align:right;">
                      <input type="number" class="fn-salario" data-idx="${i}" value="${p.salario}" style="${inputStyle}" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='transparent'">
                    </td>
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
                  <td id="fnEquipeTotal" style="text-align:right;padding:6px 10px;">${TBO_FORMATTER.currency(fc.despesas_detalhadas.pessoas.equipe.reduce((s, p) => s + p.salario, 0))}</td>
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

    // ── Excel-style inline editing for Fluxo de Caixa ──────────────────
    this._initFluxoEditor();

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
    this._bind('fnEditData', () => {
      // Scroll to and focus first editable cell
      const firstInput = document.querySelector('.fn-rec');
      if (firstInput) { firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => { firstInput.focus(); firstInput.select(); }, 300); }
    });
  },

  // ── Excel-style Fluxo Editor ──────────────────────────────────────────

  _initFluxoEditor() {
    const table = document.getElementById('fnFluxoTable');
    if (!table) return;

    this._fluxoDirty = false;

    // Recalculate on input change
    table.addEventListener('input', (e) => {
      if (e.target.classList.contains('fn-cell')) {
        this._recalcFluxo();
        this._markDirty();
      }
    });

    // Checkbox change (realizado toggle)
    table.addEventListener('change', (e) => {
      if (e.target.classList.contains('fn-real')) {
        const mes = e.target.dataset.mes;
        const row = e.target.closest('tr');
        if (row) {
          row.style.opacity = e.target.checked ? '1' : '0.7';
        }
        this._markDirty();
      }
    });

    // Tab navigation between cells (Excel-like)
    table.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('fn-cell') && e.key === 'Tab') {
        // Default tab works, but also recalc
        setTimeout(() => this._recalcFluxo(), 10);
      }
      if (e.target.classList.contains('fn-cell') && e.key === 'Enter') {
        e.preventDefault();
        // Move to next row same column
        const currentRow = e.target.closest('tr');
        const nextRow = currentRow?.nextElementSibling;
        if (nextRow) {
          const isRec = e.target.classList.contains('fn-rec');
          const nextInput = nextRow.querySelector(isRec ? '.fn-rec' : '.fn-desp');
          if (nextInput) { nextInput.focus(); nextInput.select(); }
        }
      }
    });

    // Select all on focus
    table.addEventListener('focusin', (e) => {
      if (e.target.classList.contains('fn-cell')) {
        setTimeout(() => e.target.select(), 0);
      }
    });

    // Save button
    this._bind('fnSaveFluxo', () => this._saveFluxoData());

    // Equipe salary editing
    const equipeTable = document.getElementById('fnEquipeTable');
    if (equipeTable) {
      equipeTable.addEventListener('input', (e) => {
        if (e.target.classList.contains('fn-salario')) {
          let total = 0;
          document.querySelectorAll('.fn-salario').forEach(el => { total += parseFloat(el.value) || 0; });
          const totalEl = document.getElementById('fnEquipeTotal');
          if (totalEl) totalEl.textContent = TBO_FORMATTER.currency(total);
          this._markDirty();
        }
      });
    }
    this._bind('fnSaveEquipe', () => this._saveEquipeData());
  },

  _recalcFluxo() {
    const meta = TBO_CONFIG.business.financial.monthlyTarget || 1;
    let totalRec = 0, totalDesp = 0;

    document.querySelectorAll('#fnFluxoTable tbody tr[data-mes]').forEach(row => {
      const m = row.dataset.mes;
      const recInput = row.querySelector('.fn-rec');
      const despInput = row.querySelector('.fn-desp');
      const resCell = row.querySelector('.fn-resultado');
      const margCell = row.querySelector('.fn-margem');
      const bar = row.querySelector('.mini-progress-fill');

      const rec = parseFloat(recInput?.value) || 0;
      const desp = parseFloat(despInput?.value) || 0;
      const res = rec - desp;
      const margem = rec > 0 ? ((res / rec) * 100).toFixed(1) : '0.0';

      totalRec += rec;
      totalDesp += desp;

      if (resCell) {
        resCell.textContent = TBO_FORMATTER.currency(res);
        resCell.style.color = res >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
      }
      if (margCell) {
        margCell.textContent = margem + '%';
        margCell.style.color = parseFloat(margem) >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
      }
      if (bar) {
        const barW = Math.min(Math.max(Math.round((rec / meta) * 100), 3), 100);
        bar.style.width = barW + '%';
        bar.style.background = res >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
      }
    });

    const totalRes = totalRec - totalDesp;
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('fnTotalRec', TBO_FORMATTER.currency(totalRec));
    el('fnTotalDesp', TBO_FORMATTER.currency(totalDesp));
    const totalResEl = document.getElementById('fnTotalRes');
    if (totalResEl) {
      totalResEl.textContent = TBO_FORMATTER.currency(totalRes);
      totalResEl.style.color = totalRes >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
    }
    const totalMargEl = document.getElementById('fnTotalMarg');
    if (totalMargEl) {
      totalMargEl.textContent = totalRec > 0 ? ((totalRes / totalRec) * 100).toFixed(1) + '%' : '\u2014';
    }
  },

  _markDirty() {
    this._fluxoDirty = true;
    const status = document.getElementById('fnEditStatus');
    if (status) {
      status.textContent = 'Alteracoes nao salvas';
      status.style.color = '#f59e0b';
    }
    const btn = document.getElementById('fnSaveFluxo');
    if (btn) btn.style.background = '#f59e0b';
  },

  async _saveFluxoData() {
    const status = document.getElementById('fnEditStatus');
    const btn = document.getElementById('fnSaveFluxo');
    if (status) { status.textContent = 'Salvando...'; status.style.color = 'var(--accent)'; }

    const newRec = {}, newDesp = {}, newReal = [], newRes = {};

    document.querySelectorAll('.fn-rec').forEach(el => {
      newRec[el.dataset.mes] = parseFloat(el.value) || 0;
    });
    document.querySelectorAll('.fn-desp').forEach(el => {
      newDesp[el.dataset.mes] = parseFloat(el.value) || 0;
    });
    document.querySelectorAll('.fn-real').forEach(el => {
      if (el.checked) newReal.push(el.dataset.mes);
    });
    Object.keys(newRec).forEach(m => { newRes[m] = newRec[m] - (newDesp[m] || 0); });

    // Update localStorage context
    const ctx = TBO_STORAGE.get('context');
    if (!ctx.dados_comerciais) ctx.dados_comerciais = {};
    if (!ctx.dados_comerciais[TBO_CONFIG.app.fiscalYear]) ctx.dados_comerciais[TBO_CONFIG.app.fiscalYear] = {};
    if (!ctx.dados_comerciais[TBO_CONFIG.app.fiscalYear].fluxo_caixa) ctx.dados_comerciais[TBO_CONFIG.app.fiscalYear].fluxo_caixa = {};
    const fc = ctx.dados_comerciais[TBO_CONFIG.app.fiscalYear].fluxo_caixa;

    fc.receita_mensal = newRec;
    fc.despesa_mensal = newDesp;
    fc.resultado_mensal = newRes;
    fc.meses_realizados = newReal;

    TBO_STORAGE._data.context = ctx;
    localStorage.setItem('tbo_context_override', JSON.stringify(ctx));

    // Save to Supabase financial_data
    let supaOk = false;
    if (typeof TBO_SUPABASE !== 'undefined') {
      try {
        const client = TBO_SUPABASE.getClient();
        if (client) {
          const year = parseInt(TBO_CONFIG.app.fiscalYear);
          const rows = [];
          Object.entries(newRec).forEach(([m, v]) => {
            rows.push({ year, month: m, category: 'receita', subcategory: 'total', value: v, is_realized: newReal.includes(m), updated_at: new Date().toISOString() });
          });
          Object.entries(newDesp).forEach(([m, v]) => {
            rows.push({ year, month: m, category: 'despesa', subcategory: 'total', value: v, is_realized: newReal.includes(m), updated_at: new Date().toISOString() });
          });
          const { error } = await client.from('financial_data').upsert(rows, { onConflict: 'year,month,category,subcategory' });
          supaOk = !error;
          if (error) console.warn('[Financeiro] Supabase save error:', error.message);
        }
      } catch (e) { console.warn('[Financeiro] Supabase save failed:', e.message); }
    }

    this._fluxoDirty = false;
    if (status) {
      status.textContent = supaOk ? 'Supabase + local' : 'Salvo localmente';
      status.style.color = supaOk ? '#22c55e' : '#f59e0b';
    }
    if (btn) btn.style.background = '';
    TBO_TOAST.success('Dados financeiros salvos', supaOk ? 'Supabase + localStorage atualizados.' : 'Salvo localmente.');
  },

  async _saveEquipeData() {
    const ctx = TBO_STORAGE.get('context');
    const equipe = ctx.dados_comerciais?.[TBO_CONFIG.app.fiscalYear]?.fluxo_caixa?.despesas_detalhadas?.pessoas?.equipe;
    if (!equipe) return;

    document.querySelectorAll('.fn-salario').forEach(el => {
      const idx = parseInt(el.dataset.idx);
      if (equipe[idx]) equipe[idx].salario = parseFloat(el.value) || 0;
    });

    // Recalculate total_anual
    const totalMensal = equipe.reduce((s, p) => s + p.salario, 0);
    ctx.dados_comerciais[TBO_CONFIG.app.fiscalYear].fluxo_caixa.despesas_detalhadas.pessoas.total_anual = totalMensal * 12;

    TBO_STORAGE._data.context = ctx;
    localStorage.setItem('tbo_context_override', JSON.stringify(ctx));
    TBO_TOAST.success('Equipe atualizada', `Total mensal: ${TBO_FORMATTER.currency(totalMensal)}`);
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

  _showEditModal() {
    const context = TBO_STORAGE.get('context');
    const dc26 = context.dados_comerciais?.[TBO_CONFIG.app.fiscalYear] || {};
    const fc = dc26.fluxo_caixa || {};
    const recMensal = fc.receita_mensal || {};
    const despMensal = fc.despesa_mensal || {};
    const realizados = fc.meses_realizados || [];
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const mesesLabel = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    const rows = meses.map((m, i) => {
      const isReal = realizados.includes(m);
      return `<div style="display:grid;grid-template-columns:120px 1fr 1fr 60px;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--border-subtle);">
        <span style="font-size:0.78rem;font-weight:${isReal ? '600' : '400'};color:${isReal ? 'var(--text-primary)' : 'var(--text-muted)'};">${mesesLabel[i]}</span>
        <input type="number" class="form-input fn-edit-rec" data-mes="${m}" value="${recMensal[m] || 0}" style="font-size:0.78rem;padding:4px 8px;">
        <input type="number" class="form-input fn-edit-desp" data-mes="${m}" value="${despMensal[m] || 0}" style="font-size:0.78rem;padding:4px 8px;">
        <label style="display:flex;align-items:center;gap:4px;font-size:0.72rem;cursor:pointer;">
          <input type="checkbox" class="fn-edit-real" data-mes="${m}" ${isReal ? 'checked' : ''}> Real
        </label>
      </div>`;
    }).join('');

    const html = `
      <div style="margin-bottom:12px;">
        <div style="display:grid;grid-template-columns:120px 1fr 1fr 60px;gap:8px;padding:6px 0;font-size:0.7rem;font-weight:600;text-transform:uppercase;color:var(--text-muted);border-bottom:2px solid var(--border-subtle);">
          <span>Mes</span><span>Receita (R$)</span><span>Despesa (R$)</span><span></span>
        </div>
        ${rows}
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;">
        <label class="form-label" style="margin:0;white-space:nowrap;">Meta mensal R$</label>
        <input type="number" class="form-input" id="fnEditMeta" value="${fc.meta_vendas_mensal || 0}" style="max-width:150px;font-size:0.78rem;padding:4px 8px;">
      </div>
      <button class="btn btn-primary" id="fnSaveEdit" style="width:100%;">Salvar Dados Financeiros</button>
    `;

    if (typeof TBO_MODAL !== 'undefined') {
      TBO_MODAL.show(`Editar Dados Financeiros ${TBO_CONFIG.app.fiscalYear}`, html, { width: '600px' });
    } else {
      // Fallback modal
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `<div class="pj-modal" style="max-width:600px;"><div class="pj-modal-header"><h3 style="font-size:1rem;">Editar Dados Financeiros ${TBO_CONFIG.app.fiscalYear}</h3><button class="pj-modal-close" onclick="this.closest('.modal-overlay').remove();">&#10005;</button></div><div class="pj-modal-body" style="padding:16px;">${html}</div></div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    }

    // Bind save
    setTimeout(() => {
      const saveBtn = document.getElementById('fnSaveEdit');
      if (saveBtn) saveBtn.addEventListener('click', () => {
        const ctx = TBO_STORAGE.get('context');
        if (!ctx.dados_comerciais) ctx.dados_comerciais = {};
        if (!ctx.dados_comerciais[TBO_CONFIG.app.fiscalYear]) ctx.dados_comerciais[TBO_CONFIG.app.fiscalYear] = {};
        if (!ctx.dados_comerciais[TBO_CONFIG.app.fiscalYear].fluxo_caixa) ctx.dados_comerciais[TBO_CONFIG.app.fiscalYear].fluxo_caixa = {};
        const newFc = ctx.dados_comerciais[TBO_CONFIG.app.fiscalYear].fluxo_caixa;

        const newRec = {};
        const newDesp = {};
        const newReal = [];

        document.querySelectorAll('.fn-edit-rec').forEach(el => {
          const m = el.dataset.mes;
          newRec[m] = parseFloat(el.value) || 0;
        });
        document.querySelectorAll('.fn-edit-desp').forEach(el => {
          const m = el.dataset.mes;
          newDesp[m] = parseFloat(el.value) || 0;
        });
        document.querySelectorAll('.fn-edit-real').forEach(el => {
          if (el.checked) newReal.push(el.dataset.mes);
        });

        // Also build resultado
        const newRes = {};
        Object.keys(newRec).forEach(m => { newRes[m] = newRec[m] - (newDesp[m] || 0); });

        newFc.receita_mensal = newRec;
        newFc.despesa_mensal = newDesp;
        newFc.resultado_mensal = newRes;
        newFc.meses_realizados = newReal;

        const meta = parseFloat(document.getElementById('fnEditMeta')?.value) || 0;
        newFc.meta_vendas_mensal = meta;

        TBO_STORAGE._data.context = ctx;
        localStorage.setItem('tbo_context_override', JSON.stringify(ctx));

        TBO_TOAST.success('Dados financeiros atualizados');
        document.querySelector('.modal-overlay')?.remove();

        // Refresh module
        if (typeof TBO_ROUTER !== 'undefined') TBO_ROUTER.navigate('financeiro');
      });
    }, 100);
  },

  async _generateDirect(msg, outputId) {
    if (!TBO_API.isConfigured()) {
      TBO_TOAST.warning('API nao configurada', 'Va em Configuracoes para inserir sua chave de IA (' + TBO_API.getProviderLabel() + ').');
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
