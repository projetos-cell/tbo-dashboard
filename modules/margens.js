// TBO OS — Module: Margens
// Margin analysis per project and Business Unit (BU)
const TBO_MARGENS = {

  render() {
    const projects = TBO_STORAGE.getAllErpEntities('project');
    const activeProjects = projects.filter(p => !['cancelado'].includes(p.status));
    const hasWorkload = typeof TBO_WORKLOAD !== 'undefined';

    // Per-project metrics
    const projectMetrics = activeProjects.map(p => {
      const metrics = hasWorkload ? TBO_WORKLOAD.getProjectCostMetrics(p.id) : null;
      return {
        ...p,
        revenue: p.value || 0,
        tracked_cost: metrics ? metrics.tracked_cost : 0,
        planned_cost: metrics ? metrics.planned_cost : (p.planned_cost || 0),
        margin_real: metrics ? metrics.margin_real : 0,
        tracked_minutes: metrics ? metrics.tracked_minutes : 0,
        planned_minutes: metrics ? metrics.planned_minutes : 0,
        is_over_budget: metrics ? metrics.is_over_budget : false
      };
    }).filter(p => p.revenue > 0 || p.tracked_cost > 0);

    // Sort by revenue desc
    projectMetrics.sort((a, b) => b.revenue - a.revenue);

    // Totals
    const totalRevenue = projectMetrics.reduce((s, p) => s + p.revenue, 0);
    const totalTrackedCost = projectMetrics.reduce((s, p) => s + p.tracked_cost, 0);
    const totalPlannedCost = projectMetrics.reduce((s, p) => s + p.planned_cost, 0);
    const margemGeral = totalRevenue > 0 ? Math.round(((totalRevenue - totalTrackedCost) / totalRevenue) * 100) : 0;
    const overBudgetCount = projectMetrics.filter(p => p.is_over_budget).length;

    // BU aggregation
    const BUS = ['Digital 3D', 'Audiovisual', 'Branding', 'Marketing', 'Interiores', 'Gamificacao'];
    const buData = {};
    BUS.forEach(bu => { buData[bu] = { revenue: 0, cost: 0, projects: 0 }; });

    projectMetrics.forEach(p => {
      const services = p.services || [];
      if (services.length === 0) return;
      // Distribute revenue/cost equally across BUs of the project
      const share = 1 / services.length;
      services.forEach(s => {
        if (!buData[s]) buData[s] = { revenue: 0, cost: 0, projects: 0 };
        buData[s].revenue += p.revenue * share;
        buData[s].cost += p.tracked_cost * share;
        buData[s].projects++;
      });
    });

    const buList = Object.entries(buData)
      .filter(([, d]) => d.projects > 0)
      .map(([name, d]) => ({
        name,
        revenue: d.revenue,
        cost: d.cost,
        margin: d.revenue > 0 ? Math.round(((d.revenue - d.cost) / d.revenue) * 100) : 0,
        projects: d.projects
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const fmt = (v) => (typeof TBO_FINANCE_MASK !== 'undefined' && TBO_FINANCE_MASK.isMasked())
      ? 'R$ ••••••'
      : 'R$ ' + Math.round(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });

    return `
      <div class="margens-module">
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Margem Geral</div>
            <div class="kpi-value" style="color:${margemGeral >= 30 ? '#22c55e' : margemGeral >= 15 ? '#f59e0b' : '#ef4444'};">${margemGeral}%</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Receita Total</div>
            <div class="kpi-value" style="font-size:1.1rem;">${fmt(totalRevenue)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Custo Rastreado</div>
            <div class="kpi-value" style="font-size:1.1rem;">${fmt(totalTrackedCost)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Acima do Orcamento</div>
            <div class="kpi-value" style="color:${overBudgetCount > 0 ? '#ef4444' : '#22c55e'};">${overBudgetCount}</div>
            <div class="kpi-sublabel">projetos >120% custo</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="mg-projetos">Por Projeto</button>
          <button class="tab" data-tab="mg-bu">Por BU</button>
          <button class="tab" data-tab="mg-risco">Risco Concentracao</button>
        </div>

        <!-- Tab: Per Project -->
        <div class="tab-content active" id="tab-mg-projetos">
          ${this._renderProjectMargins(projectMetrics, totalRevenue)}
        </div>

        <!-- Tab: Per BU -->
        <div class="tab-content" id="tab-mg-bu" style="display:none;">
          ${this._renderBUMargins(buList)}
        </div>

        <!-- Tab: Concentration Risk -->
        <div class="tab-content" id="tab-mg-risco" style="display:none;">
          ${this._renderConcentrationRisk(projectMetrics, totalRevenue)}
        </div>
      </div>
    `;
  },

  _renderProjectMargins(projects, totalRevenue) {
    if (projects.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);">Nenhum projeto com dados financeiros.</div>';
    }
    const fmt = (v) => (typeof TBO_FINANCE_MASK !== 'undefined' && TBO_FINANCE_MASK.isMasked())
      ? 'R$ ••••••'
      : 'R$ ' + Math.round(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });

    return `<div class="card" style="padding:16px;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-default);text-align:right;">
            <th style="padding:10px 8px;text-align:left;">Projeto</th>
            <th style="padding:10px 8px;">Cliente</th>
            <th style="padding:10px 8px;">BU</th>
            <th style="padding:10px 8px;">Receita</th>
            <th style="padding:10px 8px;">Custo Real</th>
            <th style="padding:10px 8px;">Custo Planej.</th>
            <th style="padding:10px 8px;">Margem</th>
            <th style="padding:10px 8px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${projects.map(p => {
            const margin = p.margin_real;
            const marginColor = margin >= 30 ? '#22c55e' : margin >= 15 ? '#f59e0b' : '#ef4444';
            const budgetPct = p.planned_cost > 0 ? Math.round((p.tracked_cost / p.planned_cost) * 100) : 0;
            const services = (p.services || []).join(', ') || '-';

            return `<tr style="border-bottom:1px solid var(--border-subtle);text-align:right;">
              <td style="padding:10px 8px;text-align:left;font-weight:600;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name}</td>
              <td style="padding:10px 8px;color:var(--text-secondary);font-size:0.78rem;">${p.client || '-'}</td>
              <td style="padding:10px 8px;"><span class="tag" style="font-size:0.65rem;">${services}</span></td>
              <td style="padding:10px 8px;">${fmt(p.revenue)}</td>
              <td style="padding:10px 8px;">${fmt(p.tracked_cost)}</td>
              <td style="padding:10px 8px;color:var(--text-muted);">${p.planned_cost > 0 ? fmt(p.planned_cost) : '-'}</td>
              <td style="padding:10px 8px;font-weight:700;color:${marginColor};">${margin}%</td>
              <td style="padding:10px 8px;">
                ${p.is_over_budget
                  ? '<span class="tag" style="background:#ef444420;color:#ef4444;font-size:0.65rem;">ESTOURO</span>'
                  : budgetPct > 80 && p.planned_cost > 0
                    ? '<span class="tag" style="background:#f59e0b20;color:#f59e0b;font-size:0.65rem;">ATENCAO</span>'
                    : '<span class="tag" style="background:#22c55e20;color:#22c55e;font-size:0.65rem;">OK</span>'
                }
              </td>
            </tr>`;
          }).join('')}
        </tbody>
        <tfoot>
          <tr style="border-top:2px solid var(--border-default);text-align:right;font-weight:700;">
            <td style="padding:10px 8px;text-align:left;" colspan="3">TOTAL</td>
            <td style="padding:10px 8px;">${fmt(totalRevenue)}</td>
            <td style="padding:10px 8px;">${fmt(projects.reduce((s, p) => s + p.tracked_cost, 0))}</td>
            <td style="padding:10px 8px;color:var(--text-muted);">${fmt(projects.reduce((s, p) => s + p.planned_cost, 0))}</td>
            <td style="padding:10px 8px;color:${totalRevenue > 0 ? (Math.round(((totalRevenue - projects.reduce((s, p) => s + p.tracked_cost, 0)) / totalRevenue) * 100) >= 30 ? '#22c55e' : '#f59e0b') : '#888'};">
              ${totalRevenue > 0 ? Math.round(((totalRevenue - projects.reduce((s, p) => s + p.tracked_cost, 0)) / totalRevenue) * 100) : 0}%
            </td>
            <td style="padding:10px 8px;"></td>
          </tr>
        </tfoot>
      </table>
    </div>`;
  },

  _renderBUMargins(buList) {
    if (buList.length === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);">Nenhuma BU com dados.</div>';
    }
    const fmt = (v) => (typeof TBO_FINANCE_MASK !== 'undefined' && TBO_FINANCE_MASK.isMasked())
      ? 'R$ ••••••'
      : 'R$ ' + Math.round(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
    const totalBuRevenue = buList.reduce((s, b) => s + b.revenue, 0);

    return `<div style="display:flex;flex-direction:column;gap:16px;">
      ${buList.map(bu => {
        const marginColor = bu.margin >= 30 ? '#22c55e' : bu.margin >= 15 ? '#f59e0b' : '#ef4444';
        const revShare = totalBuRevenue > 0 ? ((bu.revenue / totalBuRevenue) * 100).toFixed(1) : '0';
        const barWidth = totalBuRevenue > 0 ? Math.min(100, (bu.revenue / totalBuRevenue) * 100) : 0;

        return `<div class="card" style="padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div>
              <span style="font-weight:700;font-size:0.92rem;">${bu.name}</span>
              <span style="font-size:0.72rem;color:var(--text-muted);margin-left:8px;">${bu.projects} projeto(s)</span>
            </div>
            <div style="display:flex;gap:16px;align-items:center;">
              <div style="text-align:right;">
                <div style="font-size:0.72rem;color:var(--text-muted);">Receita</div>
                <div style="font-weight:600;font-size:0.85rem;">${fmt(bu.revenue)}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:0.72rem;color:var(--text-muted);">Custo</div>
                <div style="font-weight:600;font-size:0.85rem;">${fmt(bu.cost)}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:0.72rem;color:var(--text-muted);">Margem</div>
                <div style="font-weight:700;font-size:1rem;color:${marginColor};">${bu.margin}%</div>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <div style="flex:1;background:var(--bg-tertiary);border-radius:4px;height:20px;overflow:hidden;position:relative;">
              <div style="background:${marginColor};height:100%;width:${Math.min(100, Math.max(0, bu.margin))}%;border-radius:4px;transition:width 0.3s;"></div>
            </div>
            <span style="font-size:0.72rem;color:var(--text-muted);min-width:50px;text-align:right;">${revShare}% receita</span>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },

  _renderConcentrationRisk(projects, totalRevenue) {
    if (projects.length === 0 || totalRevenue === 0) {
      return '<div class="card" style="padding:32px;text-align:center;color:var(--text-muted);">Sem dados suficientes para analise.</div>';
    }
    const fmt = (v) => (typeof TBO_FINANCE_MASK !== 'undefined' && TBO_FINANCE_MASK.isMasked())
      ? 'R$ ••••••'
      : 'R$ ' + Math.round(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 });

    // Group by client
    const clientMap = {};
    projects.forEach(p => {
      const client = p.client || 'Sem cliente';
      if (!clientMap[client]) clientMap[client] = { revenue: 0, cost: 0, projects: 0 };
      clientMap[client].revenue += p.revenue;
      clientMap[client].cost += p.tracked_cost;
      clientMap[client].projects++;
    });

    const clientList = Object.entries(clientMap)
      .map(([name, d]) => ({
        name,
        revenue: d.revenue,
        cost: d.cost,
        margin: d.revenue > 0 ? Math.round(((d.revenue - d.cost) / d.revenue) * 100) : 0,
        projects: d.projects,
        share: totalRevenue > 0 ? ((d.revenue / totalRevenue) * 100) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Concentration metrics
    const top3Revenue = clientList.slice(0, 3).reduce((s, c) => s + c.revenue, 0);
    const top3Share = totalRevenue > 0 ? Math.round((top3Revenue / totalRevenue) * 100) : 0;
    const riskLevel = top3Share > 80 ? 'critical' : top3Share > 60 ? 'warning' : 'ok';
    const riskColor = { critical: '#ef4444', warning: '#f59e0b', ok: '#22c55e' }[riskLevel];
    const riskLabel = { critical: 'CRITICO', warning: 'MODERADO', ok: 'SAUDAVEL' }[riskLevel];

    return `<div style="display:flex;flex-direction:column;gap:16px;">
      <!-- Risk indicator -->
      <div class="card" style="padding:16px;border-left:4px solid ${riskColor};">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:600;font-size:0.88rem;">Concentracao Top 3 Clientes</div>
            <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:4px;">
              ${top3Share > 60 ? 'Alta dependencia dos principais clientes. Diversificar base.' : 'Base de clientes bem distribuida.'}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700;font-size:1.3rem;color:${riskColor};">${top3Share}%</div>
            <span class="tag" style="background:${riskColor}20;color:${riskColor};font-size:0.65rem;">${riskLabel}</span>
          </div>
        </div>
      </div>

      <!-- Client table -->
      <div class="card" style="padding:16px;overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
          <thead>
            <tr style="border-bottom:2px solid var(--border-default);text-align:right;">
              <th style="padding:10px 8px;text-align:left;">Cliente</th>
              <th style="padding:10px 8px;">Projetos</th>
              <th style="padding:10px 8px;">Receita</th>
              <th style="padding:10px 8px;">% Total</th>
              <th style="padding:10px 8px;">Margem</th>
            </tr>
          </thead>
          <tbody>
            ${clientList.map((c, i) => {
              const shareColor = c.share > 30 ? '#ef4444' : c.share > 20 ? '#f59e0b' : 'var(--text-primary)';
              const marginColor = c.margin >= 30 ? '#22c55e' : c.margin >= 15 ? '#f59e0b' : '#ef4444';
              return `<tr style="border-bottom:1px solid var(--border-subtle);text-align:right;${i < 3 ? 'background:var(--bg-secondary);' : ''}">
                <td style="padding:10px 8px;text-align:left;font-weight:600;">
                  ${i < 3 ? `<span style="color:${riskColor};margin-right:4px;">#${i + 1}</span>` : ''}${c.name}
                </td>
                <td style="padding:10px 8px;">${c.projects}</td>
                <td style="padding:10px 8px;">${fmt(c.revenue)}</td>
                <td style="padding:10px 8px;">
                  <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;">
                    <div style="width:60px;background:var(--bg-tertiary);border-radius:3px;height:8px;overflow:hidden;">
                      <div style="background:${shareColor};height:100%;width:${Math.min(100, c.share)}%;border-radius:3px;"></div>
                    </div>
                    <span style="color:${shareColor};font-weight:600;">${c.share.toFixed(1)}%</span>
                  </div>
                </td>
                <td style="padding:10px 8px;font-weight:600;color:${marginColor};">${c.margin}%</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  init() {
    document.querySelectorAll('.margens-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.margens-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.margens-module .tab-content').forEach(tc => { tc.style.display = 'none'; tc.classList.remove('active'); });
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) { target.style.display = ''; target.classList.add('active'); }
      });
    });
  },

  destroy() {}
};
