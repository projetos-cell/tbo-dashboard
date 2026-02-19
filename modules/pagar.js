// TBO OS — Module: Contas a Pagar
// Expense tracking, supplier payments, due dates, and category breakdown
const TBO_PAGAR = {

  render() {
    const context = TBO_STORAGE.get('context');
    const fc = context.dados_comerciais?.[TBO_CONFIG.app.fiscalYear]?.fluxo_caixa || {};
    const desp = fc.despesas_detalhadas || {};
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const mesesLabel = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const realizados = fc.meses_realizados || [];

    // Category totals
    const catPessoas = desp.pessoas?.total_anual || 0;
    const catOper = desp.operacionais?.total_anual || 0;
    const catTerc = desp.terceirizacao?.total_anual || 0;
    const catVendas = desp.vendas?.total_anual || 0;
    const catMkt = desp.marketing?.total_anual || 0;
    const totalAnual = catPessoas + catOper + catTerc + catVendas + catMkt;

    // Monthly expenses
    const despMensal = fc.despesa_mensal || {};
    const totalRealizado = realizados.reduce((s, m) => s + (despMensal[m] || 0), 0);
    const totalProjetado = meses.reduce((s, m) => s + (despMensal[m] || 0), 0);
    const mediaMensal = totalProjetado > 0 ? Math.round(totalProjetado / 12) : 0;

    // Team payroll
    const equipe = desp.pessoas?.equipe || [];
    const folhaMensal = equipe.reduce((s, e) => s + (e.salario || 0), 0);

    // ERP: project costs
    const projects = TBO_STORAGE.getAllErpEntities('project');
    const activeProjects = projects.filter(p => !['finalizado','cancelado'].includes(p.status));
    const totalPlannedCost = activeProjects.reduce((s, p) => s + (p.planned_cost || 0), 0);

    const fmt = (v) => 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });

    return `
      <div class="pagar-module">
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Despesa Anual Orcada</div>
            <div class="kpi-value" style="font-size:1.2rem;">${fmt(totalAnual)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Realizado YTD</div>
            <div class="kpi-value" style="font-size:1.2rem;">${fmt(totalRealizado)}</div>
            <div class="kpi-sublabel">${realizados.length} meses</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Media Mensal</div>
            <div class="kpi-value" style="font-size:1.2rem;">${fmt(mediaMensal)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Folha Mensal</div>
            <div class="kpi-value" style="font-size:1.2rem;">${fmt(folhaMensal)}</div>
            <div class="kpi-sublabel">${equipe.length} pessoas</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="pg-mensal">Fluxo Mensal</button>
          <button class="tab" data-tab="pg-categorias">Categorias</button>
          <button class="tab" data-tab="pg-equipe">Folha de Pagamento</button>
          <button class="tab" data-tab="pg-projetos">Custos de Projetos</button>
          ${typeof TBO_OMIE_BRIDGE !== 'undefined' && TBO_OMIE_BRIDGE.isActive() ? '<button class="tab" data-tab="pg-omie"><i data-lucide="cloud-download" style="width:12px;height:12px;"></i> Contas Omie</button>' : ''}
        </div>

        <!-- Tab: Fluxo Mensal -->
        <div class="tab-content active" id="tab-pg-mensal">
          <div class="card" style="padding:16px;overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
              <thead>
                <tr style="border-bottom:2px solid var(--border-default);text-align:right;">
                  <th style="padding:8px;text-align:left;">Mes</th>
                  <th style="padding:8px;">Despesa</th>
                  <th style="padding:8px;">Acumulado</th>
                  <th style="padding:8px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
                  let acumulado = 0;
                  return meses.map((m, i) => {
                    const val = despMensal[m] || 0;
                    acumulado += val;
                    const isReal = realizados.includes(m);
                    return `<tr style="border-bottom:1px solid var(--border-subtle);text-align:right;${isReal ? '' : 'opacity:0.6;'}">
                      <td style="padding:8px;text-align:left;font-weight:600;">${mesesLabel[i]}</td>
                      <td style="padding:8px;">${fmt(val)}</td>
                      <td style="padding:8px;color:var(--text-secondary);">${fmt(acumulado)}</td>
                      <td style="padding:8px;">
                        <span class="tag" style="font-size:0.65rem;background:${isReal ? '#22c55e20' : 'var(--bg-tertiary)'};color:${isReal ? '#22c55e' : 'var(--text-muted)'};">${isReal ? 'Realizado' : 'Projetado'}</span>
                      </td>
                    </tr>`;
                  }).join('');
                })()}
                <tr style="border-top:2px solid var(--border-default);text-align:right;font-weight:700;">
                  <td style="padding:10px 8px;text-align:left;">Total</td>
                  <td style="padding:10px 8px;">${fmt(totalProjetado)}</td>
                  <td style="padding:10px 8px;">-</td>
                  <td style="padding:10px 8px;"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab: Categorias -->
        <div class="tab-content" id="tab-pg-categorias" style="display:none;">
          <div class="card" style="padding:16px;">
            <div style="font-weight:600;font-size:0.88rem;margin-bottom:16px;">Despesas por Categoria (Anual)</div>
            ${this._renderCatBar('Pessoas', catPessoas, totalAnual, '#3b82f6')}
            ${this._renderCatBar('Operacionais', catOper, totalAnual, '#f59e0b')}
            ${this._renderCatBar('Terceirizacao', catTerc, totalAnual, '#8b5cf6')}
            ${this._renderCatBar('Vendas/Comercial', catVendas, totalAnual, '#22c55e')}
            ${this._renderCatBar('Marketing', catMkt, totalAnual, '#ef4444')}
          </div>
        </div>

        <!-- Tab: Equipe -->
        <div class="tab-content" id="tab-pg-equipe" style="display:none;">
          ${this._renderTeamPayroll(equipe)}
        </div>

        <!-- Tab: Custos de Projetos -->
        <div class="tab-content" id="tab-pg-projetos" style="display:none;">
          ${this._renderProjectCosts(activeProjects)}
        </div>

        <!-- Tab: Contas Omie (individual line items) -->
        ${typeof TBO_OMIE_BRIDGE !== 'undefined' && TBO_OMIE_BRIDGE.isActive() ? `
        <div class="tab-content" id="tab-pg-omie" style="display:none;">
          ${this._renderOmiePayables()}
        </div>` : ''}
      </div>
    `;
  },

  _renderOmiePayables() {
    if (typeof TBO_OMIE_BRIDGE === 'undefined') return '';
    const items = TBO_OMIE_BRIDGE.getContasPagar();
    const fmt = (v) => 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const hoje = new Date();
    const resumo = TBO_OMIE_BRIDGE.getResumoFinanceiro();

    // Separar vencidos
    const vencidos = items.filter(i => !TBO_OMIE_BRIDGE._isRealized(i) && TBO_OMIE_BRIDGE._toDate(i.vencimento) < hoje);

    return `<div class="card" style="padding:16px;">
      ${vencidos.length > 0 ? `
      <div style="background:#ef444415;border:1px solid #ef444440;border-radius:8px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px;">
        <i data-lucide="alert-triangle" style="width:18px;height:18px;color:#ef4444;"></i>
        <div>
          <div style="font-weight:600;font-size:0.85rem;color:#ef4444;">${vencidos.length} conta${vencidos.length > 1 ? 's' : ''} vencida${vencidos.length > 1 ? 's' : ''}</div>
          <div style="font-size:0.75rem;color:var(--text-secondary);">Total vencido: ${fmt(vencidos.reduce((s, i) => s + (i.valor || 0), 0))}</div>
        </div>
      </div>` : ''}

      ${resumo ? `
      <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap;">
        <div style="background:var(--bg-secondary);padding:10px 16px;border-radius:8px;flex:1;min-width:120px;">
          <div style="font-size:0.7rem;color:var(--text-muted);">Total a Pagar</div>
          <div style="font-weight:700;font-size:1rem;">${fmt(resumo.totalPagar)}</div>
        </div>
        <div style="background:var(--bg-secondary);padding:10px 16px;border-radius:8px;flex:1;min-width:120px;">
          <div style="font-size:0.7rem;color:var(--text-muted);">Qtd Contas</div>
          <div style="font-weight:700;font-size:1rem;">${resumo.contasPagar}</div>
        </div>
      </div>` : ''}

      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
          <thead>
            <tr style="border-bottom:2px solid var(--border-default);text-align:left;">
              <th style="padding:8px;">Vencimento</th>
              <th style="padding:8px;">Fornecedor</th>
              <th style="padding:8px;">Descricao</th>
              <th style="padding:8px;">Categoria</th>
              <th style="padding:8px;text-align:right;">Valor</th>
              <th style="padding:8px;text-align:center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${items.length === 0 ? '<tr><td colspan="6" style="padding:24px;text-align:center;color:var(--text-muted);">Nenhuma conta a pagar no Omie.</td></tr>' :
            items.map(item => {
              const isVencido = !TBO_OMIE_BRIDGE._isRealized(item) && TBO_OMIE_BRIDGE._toDate(item.vencimento) < hoje;
              const isPago = TBO_OMIE_BRIDGE._isRealized(item);
              const statusColor = isPago ? '#22c55e' : (isVencido ? '#ef4444' : '#f59e0b');
              const statusLabel = isPago ? 'Pago' : (isVencido ? 'Vencido' : 'A Vencer');
              return `<tr style="border-bottom:1px solid var(--border-subtle);${isVencido ? 'background:#ef444408;' : ''}">
                <td style="padding:8px;font-weight:500;">${TBO_OMIE_BRIDGE._fmtDate(item.vencimento)}</td>
                <td style="padding:8px;">${item.fornecedorNome || item.fornecedor || '—'}</td>
                <td style="padding:8px;color:var(--text-secondary);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.descricao || '—'}</td>
                <td style="padding:8px;"><span class="tag" style="font-size:0.65rem;">${item.categoriaNome || '—'}</span></td>
                <td style="padding:8px;text-align:right;font-weight:600;">${fmt(item.valor)}</td>
                <td style="padding:8px;text-align:center;">
                  <span class="tag" style="font-size:0.65rem;background:${statusColor}20;color:${statusColor};">${statusLabel}</span>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
          ${items.length > 0 ? `
          <tfoot>
            <tr style="border-top:2px solid var(--border-default);font-weight:700;">
              <td style="padding:10px 8px;" colspan="4">Total (${items.length} contas)</td>
              <td style="padding:10px 8px;text-align:right;">${fmt(items.reduce((s, i) => s + (i.valor || 0), 0))}</td>
              <td></td>
            </tr>
          </tfoot>` : ''}
        </table>
      </div>
      <div style="margin-top:12px;font-size:0.7rem;color:var(--text-muted);display:flex;align-items:center;gap:6px;">
        <i data-lucide="cloud" style="width:12px;height:12px;"></i>
        Fonte: Omie ERP (sync unilateral) — Ultima atualizacao: ${TBO_OMIE._lastSync ? new Date(TBO_OMIE._lastSync).toLocaleString('pt-BR') : 'nunca'}
      </div>
    </div>`;
  },

  _renderCatBar(label, value, total, color) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    const fmt = (v) => 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
    return `<div style="margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px;">
        <span style="font-weight:600;">${label}</span>
        <span>${fmt(value)} <span style="color:var(--text-muted);">(${pct}%)</span></span>
      </div>
      <div style="background:var(--bg-tertiary);border-radius:4px;height:16px;overflow:hidden;">
        <div style="background:${color};height:100%;width:${pct}%;border-radius:4px;transition:width 0.3s;"></div>
      </div>
    </div>`;
  },

  _renderTeamPayroll(equipe) {
    if (equipe.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);">Nenhum dado de equipe disponivel.</div>';
    }
    const fmt = (v) => 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
    const totalMensal = equipe.reduce((s, e) => s + (e.salario || 0), 0);
    const sorted = [...equipe].sort((a, b) => (b.salario || 0) - (a.salario || 0));

    return `<div class="card" style="padding:16px;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-default);text-align:left;">
            <th style="padding:8px;">Nome</th>
            <th style="padding:8px;">Cargo</th>
            <th style="padding:8px;text-align:right;">Salario</th>
            <th style="padding:8px;text-align:right;">Custo c/ Encargos (1.7x)</th>
            <th style="padding:8px;text-align:right;">% da Folha</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(e => {
            const custoTotal = Math.round((e.salario || 0) * 1.7);
            const pct = totalMensal > 0 ? ((e.salario / totalMensal) * 100).toFixed(1) : '0';
            return `<tr style="border-bottom:1px solid var(--border-subtle);">
              <td style="padding:8px;font-weight:600;">${e.nome || '-'}</td>
              <td style="padding:8px;color:var(--text-secondary);">${e.cargo || '-'}</td>
              <td style="padding:8px;text-align:right;">${fmt(e.salario)}</td>
              <td style="padding:8px;text-align:right;color:var(--text-secondary);">${fmt(custoTotal)}</td>
              <td style="padding:8px;text-align:right;">${pct}%</td>
            </tr>`;
          }).join('')}
          <tr style="border-top:2px solid var(--border-default);font-weight:700;">
            <td style="padding:10px 8px;" colspan="2">Total</td>
            <td style="padding:10px 8px;text-align:right;">${fmt(totalMensal)}</td>
            <td style="padding:10px 8px;text-align:right;">${fmt(Math.round(totalMensal * 1.7))}</td>
            <td style="padding:10px 8px;text-align:right;">100%</td>
          </tr>
        </tbody>
      </table>
    </div>`;
  },

  _renderProjectCosts(projects) {
    if (projects.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);">Nenhum projeto ativo com custos.</div>';
    }
    const fmt = (v) => 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
    const hasWorkload = typeof TBO_WORKLOAD !== 'undefined';

    return `<div class="card" style="padding:16px;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-default);text-align:right;">
            <th style="padding:8px;text-align:left;">Projeto</th>
            <th style="padding:8px;">Custo Orcado</th>
            <th style="padding:8px;">Custo Real</th>
            <th style="padding:8px;">Variacao</th>
            <th style="padding:8px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${projects.filter(p => p.planned_cost || p.value).map(p => {
            const metrics = hasWorkload ? TBO_WORKLOAD.getProjectCostMetrics(p.id) : null;
            const planned = metrics?.planned_cost || p.planned_cost || 0;
            const tracked = metrics?.tracked_cost || 0;
            const variance = tracked - planned;
            const isOver = metrics?.is_over_budget || false;
            return `<tr style="border-bottom:1px solid var(--border-subtle);text-align:right;">
              <td style="padding:8px;text-align:left;font-weight:600;">${p.name}</td>
              <td style="padding:8px;">${fmt(planned)}</td>
              <td style="padding:8px;">${fmt(tracked)}</td>
              <td style="padding:8px;color:${variance > 0 ? '#ef4444' : '#22c55e'};">${variance > 0 ? '+' : ''}${fmt(variance)}</td>
              <td style="padding:8px;">
                <span class="tag" style="font-size:0.65rem;background:${isOver ? '#ef444420' : '#22c55e20'};color:${isOver ? '#ef4444' : '#22c55e'};">${isOver ? 'Estouro' : 'OK'}</span>
              </td>
            </tr>`;
          }).join('') || '<tr><td colspan="5" style="padding:16px;text-align:center;color:var(--text-muted);">Nenhum projeto com custo definido.</td></tr>'}
        </tbody>
      </table>
    </div>`;
  },

  init() {
    document.querySelectorAll('.pagar-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.pagar-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.pagar-module .tab-content').forEach(tc => { tc.style.display = 'none'; tc.classList.remove('active'); });
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) { target.style.display = ''; target.classList.add('active'); }
      });
    });
  },

  destroy() {}
};
