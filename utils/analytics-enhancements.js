// ============================================================================
// TBO OS — Analytics & Reporting Enhancements
// Cohort Analysis, Time-to-Delivery, Report Builder, BU Scorecard,
// Executive Summary, SLA Tracker, Version History, QA Checklist
// Singleton: TBO_ANALYTICS
// ============================================================================

const TBO_ANALYTICS = {

  // ── Initialization ─────────────────────────────────────────────────────
  init() {
    console.log('[TBO Analytics] Initialized');
  },

  // ── Demo Data ──────────────────────────────────────────────────────────
  _demoProjects: [
    { id: 'p1', title: 'Residencial Aurora', client: 'Arthaus', type: 'branding', bu: 'Branding', status: 'concluido', created_at: '2025-03-15', deadline: '2025-05-15', completed_at: '2025-05-10', budget: 45000, margin_pct: 38, sla_response_h: 12, sla_revisions: 2, sla_max_revisions: 3 },
    { id: 'p2', title: 'Torre Lumina VR', client: 'Fontanive', type: '3d', bu: 'Digital 3D', status: 'em_andamento', created_at: '2025-06-01', deadline: '2025-09-30', budget: 120000, margin_pct: 42, sla_response_h: 8, sla_revisions: 1, sla_max_revisions: 3 },
    { id: 'p3', title: 'Campanha Verão', client: 'GRP', type: 'marketing', bu: 'Marketing', status: 'concluido', created_at: '2025-01-10', deadline: '2025-03-10', completed_at: '2025-03-08', budget: 32000, margin_pct: 35, sla_response_h: 6, sla_revisions: 3, sla_max_revisions: 3 },
    { id: 'p4', title: 'Identidade Visual Co.Pessoa', client: 'Co.Pessoa', type: 'branding', bu: 'Branding', status: 'concluido', created_at: '2025-04-01', deadline: '2025-06-30', completed_at: '2025-07-05', budget: 55000, margin_pct: 30, sla_response_h: 28, sla_revisions: 4, sla_max_revisions: 3 },
    { id: 'p5', title: 'Maquete Digital Tekton', client: 'Tekton', type: '3d', bu: 'Digital 3D', status: 'em_andamento', created_at: '2025-07-15', deadline: '2025-11-15', budget: 95000, margin_pct: 40, sla_response_h: 10, sla_revisions: 0, sla_max_revisions: 3 },
    { id: 'p6', title: 'Social Media MDI', client: 'MDI Brasil', type: 'marketing', bu: 'Marketing', status: 'atrasado', created_at: '2025-05-01', deadline: '2025-08-01', budget: 28000, margin_pct: 25, sla_response_h: 30, sla_revisions: 5, sla_max_revisions: 3 },
    { id: 'p7', title: 'Branding AGBEM', client: 'AGBEM', type: 'branding', bu: 'Branding', status: 'concluido', created_at: '2025-02-01', deadline: '2025-04-01', completed_at: '2025-03-28', budget: 38000, margin_pct: 36, sla_response_h: 14, sla_revisions: 2, sla_max_revisions: 3 },
    { id: 'p8', title: 'Walkthrough Ricardo Maio', client: 'Ricardo Maio', type: '3d', bu: 'Digital 3D', status: 'concluido', created_at: '2024-11-01', deadline: '2025-02-01', completed_at: '2025-01-25', budget: 85000, margin_pct: 44, sla_response_h: 5, sla_revisions: 1, sla_max_revisions: 3 },
    { id: 'p9', title: 'Catálogo Viplan', client: 'Viplan', type: 'marketing', bu: 'Marketing', status: 'concluido', created_at: '2025-06-15', deadline: '2025-08-15', completed_at: '2025-08-12', budget: 22000, margin_pct: 32, sla_response_h: 18, sla_revisions: 2, sla_max_revisions: 3 },
    { id: 'p10', title: 'Apresentação Damiani', client: 'Damiani', type: '3d', bu: 'Digital 3D', status: 'em_andamento', created_at: '2025-08-01', deadline: '2025-12-01', budget: 110000, margin_pct: 41, sla_response_h: 9, sla_revisions: 0, sla_max_revisions: 3 },
    { id: 'p11', title: 'Rebrand Giacomazzi', client: 'Giacomazzi', type: 'branding', bu: 'Branding', status: 'concluido', created_at: '2024-12-01', deadline: '2025-02-28', completed_at: '2025-02-20', budget: 42000, margin_pct: 37, sla_response_h: 11, sla_revisions: 2, sla_max_revisions: 3 },
    { id: 'p12', title: 'Lançamento Gessi', client: 'Gessi Empreendimentos', type: '3d', bu: 'Digital 3D', status: 'concluido', created_at: '2025-03-01', deadline: '2025-06-01', completed_at: '2025-05-28', budget: 98000, margin_pct: 43, sla_response_h: 7, sla_revisions: 1, sla_max_revisions: 3 }
  ],

  _demoClients: [
    { id: 'c1', name: 'Arthaus', first_project: '2024-06-01', total_projects: 4, total_revenue: 180000 },
    { id: 'c2', name: 'Fontanive', first_project: '2024-03-01', total_projects: 6, total_revenue: 350000 },
    { id: 'c3', name: 'GRP', first_project: '2024-09-01', total_projects: 3, total_revenue: 95000 },
    { id: 'c4', name: 'Co.Pessoa', first_project: '2025-01-01', total_projects: 2, total_revenue: 85000 },
    { id: 'c5', name: 'Tekton', first_project: '2024-01-01', total_projects: 8, total_revenue: 520000 },
    { id: 'c6', name: 'MDI Brasil', first_project: '2025-02-01', total_projects: 2, total_revenue: 56000 },
    { id: 'c7', name: 'AGBEM', first_project: '2024-11-01', total_projects: 3, total_revenue: 114000 },
    { id: 'c8', name: 'Ricardo Maio', first_project: '2024-08-01', total_projects: 5, total_revenue: 425000 },
    { id: 'c9', name: 'Viplan', first_project: '2025-04-01', total_projects: 2, total_revenue: 44000 },
    { id: 'c10', name: 'Damiani', first_project: '2025-05-01', total_projects: 1, total_revenue: 110000 },
    { id: 'c11', name: 'Giacomazzi', first_project: '2024-10-01', total_projects: 3, total_revenue: 126000 },
    { id: 'c12', name: 'Gessi Empreendimentos', first_project: '2024-04-01', total_projects: 7, total_revenue: 490000 }
  ],

  // ── Helpers ────────────────────────────────────────────────────────────
  _daysBetween(d1, d2) {
    const a = new Date(d1), b = new Date(d2);
    return Math.round((b - a) / (1000 * 60 * 60 * 24));
  },

  _monthKey(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },

  _quarterKey(dateStr) {
    const d = new Date(dateStr);
    const q = Math.ceil((d.getMonth() + 1) / 3);
    return `${d.getFullYear()}-Q${q}`;
  },

  _formatBRL(v) {
    if (typeof TBO_FINANCE_MASK !== 'undefined' && TBO_FINANCE_MASK.isMasked()) return 'R$ ••••••';
    return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  },

  _statusColor(status) {
    const map = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' };
    return map[status] || '#94a3b8';
  },

  // ── 1. Cohort Analysis ────────────────────────────────────────────────
  analyzeCohorts(clients, period) {
    const data = clients || this._demoClients;
    const groupBy = period === 'quarter' ? this._quarterKey : this._monthKey;
    const cohorts = {};

    data.forEach(c => {
      const key = groupBy(c.first_project);
      if (!cohorts[key]) cohorts[key] = { period: key, clients: [], totalRevenue: 0, count: 0 };
      cohorts[key].clients.push(c);
      cohorts[key].totalRevenue += c.total_revenue || 0;
      cohorts[key].count++;
    });

    const sorted = Object.values(cohorts).sort((a, b) => a.period.localeCompare(b.period));
    const totalClients = data.length;

    return sorted.map((cohort, idx) => ({
      period: cohort.period,
      newClients: cohort.count,
      retentionPct: Math.round(((totalClients - idx) / totalClients) * 100),
      avgRevenue: Math.round(cohort.totalRevenue / cohort.count),
      totalRevenue: cohort.totalRevenue,
      clients: cohort.clients.map(c => c.name)
    }));
  },

  renderCohortAnalysis(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const cohorts = this.analyzeCohorts(null, 'quarter');

    let html = `
      <div style="background:var(--bg-card);border-radius:12px;padding:20px;border:1px solid var(--border-color);">
        <h3 style="margin:0 0 16px;color:var(--text-primary);font-size:16px;">📊 Análise de Coorte — Clientes por Trimestre</h3>
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:var(--bg-main);color:var(--text-muted);">
                <th style="padding:10px;text-align:left;border-bottom:1px solid var(--border-color);">Período</th>
                <th style="padding:10px;text-align:center;border-bottom:1px solid var(--border-color);">Novos</th>
                <th style="padding:10px;text-align:center;border-bottom:1px solid var(--border-color);">Retenção</th>
                <th style="padding:10px;text-align:right;border-bottom:1px solid var(--border-color);">Receita Média</th>
                <th style="padding:10px;text-align:right;border-bottom:1px solid var(--border-color);">Receita Total</th>
                <th style="padding:10px;text-align:left;border-bottom:1px solid var(--border-color);">Clientes</th>
              </tr>
            </thead>
            <tbody>
              ${cohorts.map(c => `
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:10px;font-weight:600;color:var(--text-primary);">${c.period}</td>
                  <td style="padding:10px;text-align:center;color:var(--accent);">${c.newClients}</td>
                  <td style="padding:10px;text-align:center;">
                    <span style="background:${c.retentionPct > 70 ? '#22c55e22' : c.retentionPct > 40 ? '#eab30822' : '#ef444422'};color:${c.retentionPct > 70 ? '#22c55e' : c.retentionPct > 40 ? '#eab308' : '#ef4444'};padding:3px 8px;border-radius:12px;font-size:12px;">${c.retentionPct}%</span>
                  </td>
                  <td style="padding:10px;text-align:right;color:var(--text-primary);">${this._formatBRL(c.avgRevenue)}</td>
                  <td style="padding:10px;text-align:right;font-weight:600;color:var(--text-primary);">${this._formatBRL(c.totalRevenue)}</td>
                  <td style="padding:10px;color:var(--text-muted);font-size:12px;">${c.clients.join(', ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    container.innerHTML = html;
  },

  // ── 2. Time-to-Delivery Benchmark ─────────────────────────────────────
  benchmarkDelivery(projects) {
    const data = projects || this._demoProjects;
    const completed = data.filter(p => p.completed_at);
    const byType = {};
    const benchmarks = { branding: 75, '3d': 90, marketing: 60 };

    completed.forEach(p => {
      const days = this._daysBetween(p.created_at, p.completed_at);
      const planned = this._daysBetween(p.created_at, p.deadline);
      if (!byType[p.type]) byType[p.type] = { days: [], planned: [], projects: [] };
      byType[p.type].days.push(days);
      byType[p.type].planned.push(planned);
      byType[p.type].projects.push(p.title);
    });

    const typeLabels = { branding: 'Branding', '3d': 'Digital 3D', marketing: 'Marketing' };

    return Object.entries(byType).map(([type, data]) => {
      const avgDays = Math.round(data.days.reduce((a, b) => a + b, 0) / data.days.length);
      const avgPlanned = Math.round(data.planned.reduce((a, b) => a + b, 0) / data.planned.length);
      const benchmark = benchmarks[type] || 75;
      const onTimeRate = Math.round((data.days.filter((d, i) => d <= data.planned[i]).length / data.days.length) * 100);

      return {
        type,
        label: typeLabels[type] || type,
        avgDays,
        avgPlanned,
        benchmark,
        deviation: avgDays - avgPlanned,
        vsBenchmark: avgDays - benchmark,
        onTimeRate,
        count: data.projects.length,
        status: avgDays <= avgPlanned ? 'green' : avgDays <= avgPlanned * 1.1 ? 'yellow' : 'red'
      };
    });
  },

  renderDeliveryBenchmark(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const benchmarks = this.benchmarkDelivery();

    let html = `
      <div style="background:var(--bg-card);border-radius:12px;padding:20px;border:1px solid var(--border-color);">
        <h3 style="margin:0 0 16px;color:var(--text-primary);font-size:16px;">⏱️ Benchmark de Entrega por Tipo</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
          ${benchmarks.map(b => `
            <div style="background:var(--bg-main);border-radius:10px;padding:16px;border-left:4px solid ${this._statusColor(b.status)};">
              <div style="font-weight:600;color:var(--text-primary);margin-bottom:8px;">${b.label}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;">
                <span style="color:var(--text-muted);">Média real:</span>
                <span style="color:var(--text-primary);font-weight:600;">${b.avgDays} dias</span>
                <span style="color:var(--text-muted);">Planejado:</span>
                <span style="color:var(--text-primary);">${b.avgPlanned} dias</span>
                <span style="color:var(--text-muted);">Benchmark:</span>
                <span style="color:var(--text-muted);">${b.benchmark} dias</span>
                <span style="color:var(--text-muted);">No prazo:</span>
                <span style="color:${b.onTimeRate >= 80 ? '#22c55e' : '#eab308'};font-weight:600;">${b.onTimeRate}%</span>
              </div>
              <div style="margin-top:10px;height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:${Math.min(100, (b.avgPlanned / b.avgDays) * 100)}%;background:${this._statusColor(b.status)};border-radius:3px;transition:width .5s;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
    container.innerHTML = html;
  },

  // ── 3. Custom Report Builder ──────────────────────────────────────────
  buildReport(config) {
    const projects = this._demoProjects;
    const { title, groupBy, dateRange, metrics } = config || {};

    let filtered = [...projects];
    if (dateRange) {
      if (dateRange.from) filtered = filtered.filter(p => p.created_at >= dateRange.from);
      if (dateRange.to) filtered = filtered.filter(p => p.created_at <= dateRange.to);
    }

    const groupKey = groupBy || 'bu';
    const groups = {};
    filtered.forEach(p => {
      const key = p[groupKey] || 'Outros';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    const requestedMetrics = metrics || ['count', 'revenue', 'margin', 'avgDays'];

    const rows = Object.entries(groups).map(([key, items]) => {
      const row = { group: key };
      if (requestedMetrics.includes('count')) row.count = items.length;
      if (requestedMetrics.includes('revenue')) row.revenue = items.reduce((s, p) => s + (p.budget || 0), 0);
      if (requestedMetrics.includes('margin')) row.margin = Math.round(items.reduce((s, p) => s + (p.margin_pct || 0), 0) / items.length);
      if (requestedMetrics.includes('avgDays')) {
        const completed = items.filter(p => p.completed_at);
        row.avgDays = completed.length ? Math.round(completed.reduce((s, p) => s + this._daysBetween(p.created_at, p.completed_at), 0) / completed.length) : '-';
      }
      return row;
    });

    return {
      title: title || 'Relatório Personalizado',
      generatedAt: new Date().toISOString(),
      groupBy: groupKey,
      totalProjects: filtered.length,
      rows
    };
  },

  renderReportBuilder(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const report = this.buildReport({ title: 'Relatório por BU', groupBy: 'bu', metrics: ['count', 'revenue', 'margin', 'avgDays'] });

    let html = `
      <div style="background:var(--bg-card);border-radius:12px;padding:20px;border:1px solid var(--border-color);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;color:var(--text-primary);font-size:16px;">📋 ${report.title}</h3>
          <span style="font-size:11px;color:var(--text-muted);">Gerado em ${new Date(report.generatedAt).toLocaleString('pt-BR')}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:var(--bg-main);color:var(--text-muted);">
              <th style="padding:10px;text-align:left;border-bottom:1px solid var(--border-color);">BU</th>
              <th style="padding:10px;text-align:center;border-bottom:1px solid var(--border-color);">Projetos</th>
              <th style="padding:10px;text-align:right;border-bottom:1px solid var(--border-color);">Receita</th>
              <th style="padding:10px;text-align:center;border-bottom:1px solid var(--border-color);">Margem Média</th>
              <th style="padding:10px;text-align:center;border-bottom:1px solid var(--border-color);">Dias Médios</th>
            </tr>
          </thead>
          <tbody>
            ${report.rows.map(r => `
              <tr style="border-bottom:1px solid var(--border-color);">
                <td style="padding:10px;font-weight:600;color:var(--text-primary);">${r.group}</td>
                <td style="padding:10px;text-align:center;color:var(--accent);">${r.count}</td>
                <td style="padding:10px;text-align:right;color:var(--text-primary);">${this._formatBRL(r.revenue)}</td>
                <td style="padding:10px;text-align:center;">
                  <span style="color:${r.margin >= 35 ? '#22c55e' : r.margin >= 25 ? '#eab308' : '#ef4444'};">${r.margin}%</span>
                </td>
                <td style="padding:10px;text-align:center;color:var(--text-muted);">${r.avgDays}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
    container.innerHTML = html;
  },

  // ── 4. BU Performance Scorecard ───────────────────────────────────────
  getBUScorecard(buName, period) {
    const projects = this._demoProjects.filter(p => p.bu === buName);
    if (projects.length === 0) return null;

    const completed = projects.filter(p => p.completed_at);
    const revenue = projects.reduce((s, p) => s + (p.budget || 0), 0);
    const avgMargin = Math.round(projects.reduce((s, p) => s + (p.margin_pct || 0), 0) / projects.length);
    const completionRate = projects.length ? Math.round((completed.length / projects.length) * 100) : 0;
    const avgDelivery = completed.length ? Math.round(completed.reduce((s, p) => s + this._daysBetween(p.created_at, p.completed_at), 0) / completed.length) : 0;
    const onTime = completed.length ? Math.round((completed.filter(p => new Date(p.completed_at) <= new Date(p.deadline)).length / completed.length) * 100) : 0;
    const avgResponse = Math.round(projects.reduce((s, p) => s + (p.sla_response_h || 0), 0) / projects.length);

    const t = TBO_CONFIG.business.scoring.analytics;
    const kpis = [
      { label: 'Receita Total', value: this._formatBRL(revenue), status: revenue > t.revenue.green ? 'green' : revenue > t.revenue.yellow ? 'yellow' : 'red' },
      { label: 'Margem Média', value: `${avgMargin}%`, status: avgMargin >= t.margin.green ? 'green' : avgMargin >= t.margin.yellow ? 'yellow' : 'red' },
      { label: 'Taxa de Conclusão', value: `${completionRate}%`, status: completionRate >= t.completion.green ? 'green' : completionRate >= t.completion.yellow ? 'yellow' : 'red' },
      { label: 'Entrega Média', value: `${avgDelivery} dias`, status: avgDelivery <= t.deliveryDays.green ? 'green' : avgDelivery <= t.deliveryDays.yellow ? 'yellow' : 'red' },
      { label: 'No Prazo', value: `${onTime}%`, status: onTime >= t.onTimePercent.green ? 'green' : onTime >= t.onTimePercent.yellow ? 'yellow' : 'red' },
      { label: 'Resposta Média', value: `${avgResponse}h`, status: avgResponse <= t.responseHours.green ? 'green' : avgResponse <= t.responseHours.yellow ? 'yellow' : 'red' }
    ];

    return { bu: buName, projects: projects.length, kpis };
  },

  renderBUScorecard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const bus = ['Branding', 'Digital 3D', 'Marketing'];
    const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3b82f6', 'Marketing': '#f97316' };

    let html = `
      <div style="background:var(--bg-card);border-radius:12px;padding:20px;border:1px solid var(--border-color);">
        <h3 style="margin:0 0 16px;color:var(--text-primary);font-size:16px;">🏆 Scorecard por Business Unit</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
          ${bus.map(bu => {
            const sc = this.getBUScorecard(bu);
            if (!sc) return '';
            return `
              <div style="background:var(--bg-main);border-radius:10px;padding:16px;border-top:3px solid ${buColors[bu] || 'var(--accent)'};">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                  <span style="font-weight:700;color:var(--text-primary);font-size:15px;">${bu}</span>
                  <span style="font-size:12px;color:var(--text-muted);">${sc.projects} projetos</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                  ${sc.kpis.map(k => `
                    <div style="background:var(--bg-card);border-radius:8px;padding:10px;">
                      <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">${k.label}</div>
                      <div style="display:flex;align-items:center;gap:6px;">
                        <span style="width:8px;height:8px;border-radius:50%;background:${this._statusColor(k.status)};"></span>
                        <span style="font-size:14px;font-weight:600;color:var(--text-primary);">${k.value}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
    container.innerHTML = html;
  },

  // ── 5. Executive Summary Generator ────────────────────────────────────
  generateExecutiveSummary(data) {
    const projects = data || this._demoProjects;
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'concluido');
    const inProgress = projects.filter(p => p.status === 'em_andamento');
    const delayed = projects.filter(p => p.status === 'atrasado');
    const totalRevenue = projects.reduce((s, p) => s + (p.budget || 0), 0);
    const avgMargin = Math.round(projects.reduce((s, p) => s + (p.margin_pct || 0), 0) / total);

    const highlights = [
      `${total} projetos no portfólio, ${completed.length} concluídos, ${inProgress.length} em andamento`,
      `Receita total: ${this._formatBRL(totalRevenue)} com margem média de ${avgMargin}%`,
      completed.length > 0 ? `Taxa de conclusão: ${Math.round((completed.length / total) * 100)}%` : null,
      delayed.length > 0 ? `⚠️ ${delayed.length} projeto(s) atrasado(s) requerem atenção` : '✅ Nenhum projeto atrasado'
    ].filter(Boolean);

    const concerns = [];
    if (delayed.length > 0) concerns.push(`Projetos atrasados: ${delayed.map(p => p.title).join(', ')}`);
    const lowMargin = projects.filter(p => p.margin_pct < 30);
    if (lowMargin.length > 0) concerns.push(`Projetos com margem abaixo de 30%: ${lowMargin.map(p => `${p.title} (${p.margin_pct}%)`).join(', ')}`);
    const slaBreaches = projects.filter(p => p.sla_response_h > 24 || (p.sla_revisions > p.sla_max_revisions));
    if (slaBreaches.length > 0) concerns.push(`${slaBreaches.length} projeto(s) com violação de SLA`);

    const actions = [
      delayed.length > 0 ? 'Revisar cronograma dos projetos atrasados e realocar recursos' : null,
      lowMargin.length > 0 ? 'Analisar custos dos projetos com margem baixa e renegociar se possível' : null,
      'Acompanhar pipeline de novos projetos para o próximo trimestre',
      'Revisar SLAs e alinhar expectativas com clientes'
    ].filter(Boolean);

    return { highlights, concerns, actions, generated: new Date().toISOString() };
  },

  renderExecutiveSummary(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const summary = this.generateExecutiveSummary();

    let html = `
      <div style="background:var(--bg-card);border-radius:12px;padding:20px;border:1px solid var(--border-color);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;color:var(--text-primary);font-size:16px;">📝 Resumo Executivo</h3>
          <span style="font-size:11px;color:var(--text-muted);">Gerado em ${new Date(summary.generated).toLocaleString('pt-BR')}</span>
        </div>
        <div style="margin-bottom:16px;">
          <h4 style="color:#22c55e;font-size:13px;margin:0 0 8px;">✅ Destaques</h4>
          <ul style="margin:0;padding-left:20px;color:var(--text-primary);font-size:13px;line-height:1.7;">
            ${summary.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>
        ${summary.concerns.length > 0 ? `
          <div style="margin-bottom:16px;">
            <h4 style="color:#ef4444;font-size:13px;margin:0 0 8px;">⚠️ Pontos de Atenção</h4>
            <ul style="margin:0;padding-left:20px;color:var(--text-primary);font-size:13px;line-height:1.7;">
              ${summary.concerns.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <div>
          <h4 style="color:var(--accent);font-size:13px;margin:0 0 8px;">🎯 Ações Recomendadas</h4>
          <ol style="margin:0;padding-left:20px;color:var(--text-primary);font-size:13px;line-height:1.7;">
            ${summary.actions.map(a => `<li>${a}</li>`).join('')}
          </ol>
        </div>
      </div>`;
    container.innerHTML = html;
  },

  // ── 6. SLA Tracker ────────────────────────────────────────────────────
  trackSLA(projects, config) {
    const data = projects || this._demoProjects;
    const sla = config || { maxResponseHours: 24, maxRevisions: 3 };

    return data.map(p => {
      const responseBreach = (p.sla_response_h || 0) > sla.maxResponseHours;
      const revisionBreach = (p.sla_revisions || 0) > sla.maxRevisions;
      const deadlineBreach = p.completed_at ? new Date(p.completed_at) > new Date(p.deadline) : (p.status === 'atrasado');
      const nearBreach = !responseBreach && (p.sla_response_h || 0) > sla.maxResponseHours * 0.8;
      const breaches = [responseBreach && 'Tempo de resposta', revisionBreach && 'Revisões excedidas', deadlineBreach && 'Prazo de entrega'].filter(Boolean);

      return {
        project: p.title,
        client: p.client,
        status: breaches.length > 0 ? 'breach' : nearBreach ? 'warning' : 'ok',
        breaches,
        responseTime: `${p.sla_response_h || 0}h`,
        revisions: `${p.sla_revisions || 0}/${sla.maxRevisions}`,
        deadline: p.deadline,
        isOnTime: !deadlineBreach
      };
    });
  },

  renderSLATracker(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const slaData = this.trackSLA();
    const statusIcons = { ok: '✅', warning: '⚠️', breach: '🔴' };
    const statusLabels = { ok: 'OK', warning: 'Atenção', breach: 'Violação' };

    let html = `
      <div style="background:var(--bg-card);border-radius:12px;padding:20px;border:1px solid var(--border-color);">
        <h3 style="margin:0 0 16px;color:var(--text-primary);font-size:16px;">🛡️ Monitoramento de SLA</h3>
        <div style="display:flex;gap:12px;margin-bottom:16px;">
          <div style="background:#22c55e15;color:#22c55e;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;">
            ✅ OK: ${slaData.filter(s => s.status === 'ok').length}
          </div>
          <div style="background:#eab30815;color:#eab308;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;">
            ⚠️ Atenção: ${slaData.filter(s => s.status === 'warning').length}
          </div>
          <div style="background:#ef444415;color:#ef4444;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;">
            🔴 Violação: ${slaData.filter(s => s.status === 'breach').length}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${slaData.map(s => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--bg-main);border-radius:8px;border-left:3px solid ${s.status === 'ok' ? '#22c55e' : s.status === 'warning' ? '#eab308' : '#ef4444'};">
              <span style="font-size:16px;">${statusIcons[s.status]}</span>
              <div style="flex:1;min-width:0;">
                <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${s.project}</div>
                <div style="font-size:11px;color:var(--text-muted);">${s.client} · Resposta: ${s.responseTime} · Revisões: ${s.revisions}</div>
              </div>
              ${s.breaches.length > 0 ? `<div style="font-size:11px;color:#ef4444;text-align:right;">${s.breaches.join(', ')}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>`;
    container.innerHTML = html;
  },

  // ── 7. Version Control Visual ─────────────────────────────────────────
  getVersionHistory(deliverableId) {
    // Demo version history
    const versions = [
      { version: 'v1.0', date: '2025-06-01', author: 'Celso', status: 'revisao', changes: 'Versão inicial do branding' },
      { version: 'v1.1', date: '2025-06-08', author: 'Nelson', status: 'revisao', changes: 'Ajustes na paleta de cores' },
      { version: 'v2.0', date: '2025-06-15', author: 'Celso', status: 'aprovado_interno', changes: 'Nova proposta tipográfica' },
      { version: 'v2.1', date: '2025-06-22', author: 'Erick', status: 'revisao_cliente', changes: 'Refinamento pós-feedback interno' },
      { version: 'v3.0', date: '2025-07-01', author: 'Celso', status: 'aprovado', changes: 'Versão final aprovada pelo cliente' }
    ];
    return versions;
  },

  renderVersionHistory(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const versions = this.getVersionHistory('demo');
    const statusColors = { revisao: '#eab308', aprovado_interno: '#3b82f6', revisao_cliente: '#f97316', aprovado: '#22c55e' };
    const statusLabels = { revisao: 'Em Revisão', aprovado_interno: 'Aprovado Interno', revisao_cliente: 'Revisão Cliente', aprovado: 'Aprovado' };

    let html = `
      <div style="background:var(--bg-card);border-radius:12px;padding:20px;border:1px solid var(--border-color);">
        <h3 style="margin:0 0 16px;color:var(--text-primary);font-size:16px;">🔀 Histórico de Versões — Entregável Demo</h3>
        <div style="position:relative;padding-left:24px;">
          <div style="position:absolute;left:9px;top:0;bottom:0;width:2px;background:var(--border-color);"></div>
          ${versions.map((v, i) => `
            <div style="position:relative;padding-bottom:${i < versions.length - 1 ? '20' : '0'}px;">
              <div style="position:absolute;left:-18px;top:3px;width:14px;height:14px;border-radius:50%;background:${statusColors[v.status] || 'var(--text-muted)'};border:2px solid var(--bg-card);"></div>
              <div style="background:var(--bg-main);border-radius:8px;padding:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                  <span style="font-weight:700;color:var(--text-primary);font-size:14px;">${v.version}</span>
                  <span style="font-size:11px;padding:3px 8px;border-radius:12px;background:${statusColors[v.status]}20;color:${statusColors[v.status]};">${statusLabels[v.status]}</span>
                </div>
                <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">${new Date(v.date).toLocaleDateString('pt-BR')} · por ${v.author}</div>
                <div style="font-size:13px;color:var(--text-primary);">${v.changes}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
    container.innerHTML = html;
  },

  // ── 8. QA Checklist Generator ─────────────────────────────────────────
  generateQAChecklist(projectType) {
    const checklists = {
      branding: [
        { category: 'Identidade Visual', items: [
          { item: 'Consistência com brand guidelines', status: 'pass' },
          { item: 'Precisão das cores (CMYK/RGB/HEX)', status: 'pass' },
          { item: 'Tipografia correta e hierárquica', status: 'pass' },
          { item: 'Logo em todas as variações', status: 'pending' },
          { item: 'Mockups aplicados corretamente', status: 'pass' },
          { item: 'Arquivo fonte editável (.ai/.fig)', status: 'pass' }
        ]},
        { category: 'Entrega', items: [
          { item: 'Manual de marca PDF', status: 'pending' },
          { item: 'Assets em alta resolução', status: 'pass' },
          { item: 'Versões para web e impressão', status: 'fail' }
        ]}
      ],
      '3d': [
        { category: 'Qualidade Técnica', items: [
          { item: 'Contagem de polígonos otimizada', status: 'pass' },
          { item: 'Resolução de texturas (mín. 2K)', status: 'pass' },
          { item: 'Iluminação natural realista', status: 'pending' },
          { item: 'Materiais PBR calibrados', status: 'pass' },
          { item: 'Sem artefatos de renderização', status: 'pass' }
        ]},
        { category: 'Animação & Interação', items: [
          { item: 'Animação fluida (30+ fps)', status: 'pass' },
          { item: 'Transições de câmera suaves', status: 'pass' },
          { item: 'Walkthrough sem glitches', status: 'pending' }
        ]},
        { category: 'Entrega', items: [
          { item: 'Render final em 4K', status: 'pass' },
          { item: 'Arquivos fonte (.blend/.max)', status: 'pass' },
          { item: 'Versão web otimizada', status: 'fail' }
        ]}
      ],
      marketing: [
        { category: 'Conteúdo', items: [
          { item: 'Tom de voz alinhado à marca', status: 'pass' },
          { item: 'CTA claro e posicionado', status: 'pass' },
          { item: 'Ortografia e gramática', status: 'pass' },
          { item: 'Dados e fatos verificados', status: 'pending' }
        ]},
        { category: 'Design & UX', items: [
          { item: 'Responsividade mobile', status: 'pass' },
          { item: 'Acessibilidade (contraste, alt text)', status: 'fail' },
          { item: 'Performance de carregamento', status: 'pass' },
          { item: 'Links funcionais', status: 'pass' }
        ]}
      ]
    };

    return checklists[projectType] || checklists.branding;
  },

  renderQAChecklist(containerId, projectType) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const checklist = this.generateQAChecklist(projectType || 'branding');
    const statusIcons = { pass: '✅', fail: '❌', pending: '⏳' };
    const statusLabels = { pass: 'OK', fail: 'Falhou', pending: 'Pendente' };
    const typeLabel = { branding: 'Branding', '3d': 'Digital 3D', marketing: 'Marketing' };

    let totalItems = 0, passItems = 0;
    checklist.forEach(cat => { cat.items.forEach(i => { totalItems++; if (i.status === 'pass') passItems++; }); });
    const progressPct = Math.round((passItems / totalItems) * 100);

    let html = `
      <div style="background:var(--bg-card);border-radius:12px;padding:20px;border:1px solid var(--border-color);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;color:var(--text-primary);font-size:16px;">✅ QA Checklist — ${typeLabel[projectType] || 'Branding'}</h3>
          <span style="font-size:13px;font-weight:600;color:${progressPct === 100 ? '#22c55e' : 'var(--accent)'};">${progressPct}% concluído</span>
        </div>
        <div style="height:6px;background:var(--border-color);border-radius:3px;margin-bottom:16px;overflow:hidden;">
          <div style="height:100%;width:${progressPct}%;background:${progressPct === 100 ? '#22c55e' : 'var(--accent)'};border-radius:3px;transition:width .5s;"></div>
        </div>
        ${checklist.map(cat => `
          <div style="margin-bottom:16px;">
            <h4 style="color:var(--text-primary);font-size:13px;margin:0 0 8px;padding-bottom:6px;border-bottom:1px solid var(--border-color);">${cat.category}</h4>
            ${cat.items.map(i => `
              <div style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px;">
                <span>${statusIcons[i.status]}</span>
                <span style="flex:1;color:var(--text-primary);">${i.item}</span>
                <span style="font-size:11px;color:${i.status === 'pass' ? '#22c55e' : i.status === 'fail' ? '#ef4444' : '#eab308'};">${statusLabels[i.status]}</span>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>`;
    container.innerHTML = html;
  },

  // ── Universal Widget Renderer ──────────────────────────────────────────
  renderWidget(containerId, widgetType, options) {
    const renderers = {
      'cohort': () => this.renderCohortAnalysis(containerId),
      'delivery': () => this.renderDeliveryBenchmark(containerId),
      'report': () => this.renderReportBuilder(containerId),
      'scorecard': () => this.renderBUScorecard(containerId),
      'summary': () => this.renderExecutiveSummary(containerId),
      'sla': () => this.renderSLATracker(containerId),
      'versions': () => this.renderVersionHistory(containerId),
      'qa': () => this.renderQAChecklist(containerId, options?.projectType)
    };

    if (renderers[widgetType]) {
      renderers[widgetType]();
    } else {
      console.warn(`[TBO Analytics] Widget type "${widgetType}" not found`);
    }
  }
};
